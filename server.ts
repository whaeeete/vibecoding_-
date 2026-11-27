import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MODEL_NAME = "gemini-4-hydrogen";

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return {
    mimeType: match[1],
    data: match[2],
  };
}

function formatGeminiError(err: unknown): { status: number; message: string; code: string } {
  const rawMessage = err instanceof Error ? err.message : String(err);
  if (rawMessage.includes("403") || rawMessage.includes("PERMISSION_DENIED")) {
    return {
      status: 403,
      code: "PERMISSION_DENIED",
      message: "Gemini API 권한이 없거나 API 키가 올바르지 않습니다. Settings > Secrets 패널에서 GEMINI_API_KEY를 확인해 주세요.",
    };
  }
  if (rawMessage.includes("400") || rawMessage.includes("API_KEY_INVALID")) {
    return {
      status: 400,
      code: "API_KEY_INVALID",
      message: "요청 형식 또는 API 키가 유효하지 않습니다. Settings > Secrets 패널을 확인해 주세요.",
    };
  }
  if (rawMessage.includes("429") || rawMessage.includes("RESOURCE_EXHAUSTED")) {
    return {
      status: 429,
      code: "RESOURCE_EXHAUSTED",
      message: "요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
  if (rawMessage.includes("404") || rawMessage.includes("NOT_FOUND")) {
    return {
      status: 404,
      code: "NOT_FOUND",
      message: "요청한 Gemini 모델을 찾을 수 없습니다.",
    };
  }
  return {
    status: 500,
    code: "INTERNAL_ERROR",
    message: `멘토 응답을 생성하는 중 오류가 발생했습니다: ${rawMessage}`,
  };
}

interface IncomingMessage {
  role: "user" | "mentor";
  text: string;
  hasSketch?: boolean;
}

interface IncomingContext {
  gradeLevel: string;
  medium: string;
  theme: string;
  currentStage: number;
  currentConcept: {
    title: string;
    artistStatement: string;
    subject: string;
    moodKeywords: string[];
    compositionType: string;
    compositionNote: string;
    materials: string[];
    colorPalette: Array<{ name: string; hex: string; role: string }>;
    steps: Array<{ id: string; label: string; done: boolean }>;
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "8mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true, hasApiKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  app.post("/api/mentor/chat", async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(500).json({
        code: "MISSING_API_KEY",
        error: "서버에 GEMINI_API_KEY가 설정되어 있지 않습니다. Settings > Secrets 패널에서 API 키를 설정해 주세요.",
      });
      return;
    }

    try {
      const { messages = [], context, sketchDataUrl } = req.body as {
        messages: IncomingMessage[];
        context: IncomingContext;
        sketchDataUrl?: string;
      };

      const stageNames: Record<number, string> = {
        1: "1단계: 주제·감정 탐색 (무엇을 왜 표현하고 싶은지 찾기)",
        2: "2단계: 소재·매체 선정 (핵심 오브제와 재료의 질감 정하기)",
        3: "3단계: 구도·색채 실험 (시선 흐름, 여백, 주조색·보조색·강조색 정하기)",
        4: "4단계: 제작 계획 정리 (수업 시간 내 실행할 단계별 작업 순서 확정하기)",
      };

      const systemInstruction = `당신은 한국 미술 수업(초등 고학년~고등학생)에서 학생 한 명 한 명의 창작을 따뜻하고 예리하게 이끌어주는 '아뜰리에 멘토(미술 선생님)'입니다.

핵심 교육 원칙:
1. 정답을 일방적으로 지시하지 말고, 학생의 생각과 경험에서 출발해 스스로 상상하고 선택할 수 있도록 소크라테스식 질문(1~2개)과 구체적인 시각적 제안을 함께 건네세요.
2. 학생의 학년 수준(${context?.gradeLevel || "중학생"})과 선택한 매체(${context?.medium || "수채화"})에 맞는 어휘와 교실 환경에서 실제 구할 수 있는 재료를 제안하세요.
3. 답변(reply)은 학생이 읽기 부담스럽지 않게 3~5문장 정도로 명확하고 다정하게 작성하세요. 줄바꿈을 적절히 사용해 가독성을 높이세요.
4. 만약 학생이 스케치(이미지)를 함께 보냈다면, 화면 속 선의 흐름, 형태 배치, 여백, 시선 집중 포인트를 구체적으로 짚어 칭찬한 뒤 다음 발전 방향을 제안하세요.
5. 대화 내용을 바탕으로 오른쪽 '작품 구상 노트(conceptPatch)'에 반영할 만한 구체적인 아이디어가 도출되었다면 해당 필드들을 자연스럽게 채우거나 다듬어 주세요. 아직 정해지지 않은 필드는 기존 값을 유지하거나 비워도 됩니다.
6. quickReplies에는 학생이 바로 눌러서 대화를 이어갈 수 있는 서로 다른 방향의 짧은 답변 선택지 3개를 제안하세요 (예: "따뜻한 노을빛 색감으로 가볼래요", "인물 대신 그림자에 집중하고 싶어요").
7. compositionType은 반드시 'rule_of_thirds', 'diagonal', 'centered', 'horizon', 'radial' 중 하나여야 합니다.`;

      const recentHistory = messages
        .slice(-10)
        .map((m) => `${m.role === "user" ? "학생" : "멘토"}: ${m.text}${m.hasSketch ? " [스케치 이미지 첨부함]" : ""}`)
        .join("\n");

      const promptText = `[현재 수업 맥락]
- 학년: ${context?.gradeLevel || "중학생"}
- 표현 매체: ${context?.medium || "수채화"}
- 수업 주제: ${context?.theme || "자유 주제"}
- 현재 구상 단계: ${stageNames[context?.currentStage || 1] || stageNames[1]}

[현재 작성 중인 작품 구상 노트]
- 작품 가제: ${context?.currentConcept?.title || "(아직 미정)"}
- 표현 의도: ${context?.currentConcept?.artistStatement || "(아직 미정)"}
- 핵심 소재: ${context?.currentConcept?.subject || "(아직 미정)"}
- 구도: ${context?.currentConcept?.compositionType || "rule_of_thirds"} (${context?.currentConcept?.compositionNote || ""})
- 사용 재료: ${(context?.currentConcept?.materials || []).join(", ") || "(아직 미정)"}

[최근 대화 기록]
${recentHistory}

위 대화를 이어서 멘토의 답변과 함께, 대화에서 발전된 구상 노트 업데이트(conceptPatch)와 3개의 후속 선택지(quickReplies)를 JSON으로 생성해 주세요.`;

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
      if (sketchDataUrl) {
        const parsed = parseDataUrl(sketchDataUrl);
        if (parsed) {
          parts.push({
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.data,
            },
          });
        }
      }
      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts },
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: "학생에게 건네는 다정하고 구체적인 미술 멘토의 답변 (3~5문장, 질문 1~2개 포함)",
              },
              stageSuggestion: {
                type: Type.INTEGER,
                description: "대화의 흐름상 현재 추천되는 단계 번호 (1, 2, 3, 4 중 하나)",
              },
              mentorTip: {
                type: Type.STRING,
                description: "선택한 매체나 구도와 관련된 1줄 실기 팁",
              },
              quickReplies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "학생이 클릭해서 이어갈 수 있는 서로 다른 방향의 짧은 답변 선택지 3개",
              },
              conceptPatch: {
                type: Type.OBJECT,
                description: "대화를 통해 구체화된 작품 구상 노트 업데이트",
                properties: {
                  title: { type: Type.STRING, description: "작품 가제 (한국어)" },
                  artistStatement: { type: Type.STRING, description: "작품의 주제 의도 한두 문장" },
                  subject: { type: Type.STRING, description: "화면에 들어갈 핵심 소재와 배경 요약" },
                  moodKeywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "작품의 분위기 키워드 최대 4개",
                  },
                  compositionType: {
                    type: Type.STRING,
                    description: "rule_of_thirds, diagonal, centered, horizon, radial 중 하나",
                  },
                  compositionNote: {
                    type: Type.STRING,
                    description: "시선 집중 포인트와 여백 배치 설명 (1~2문장)",
                  },
                  materials: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "실제 미술실에서 사용할 재료 목록 (3~6개)",
                  },
                  colorPalette: {
                    type: Type.ARRAY,
                    description: "추천 색채 팔레트 4가지",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: "한국어 색채명 (예: 코발트 블루, 황토빛 옐로우)" },
                        hex: { type: Type.STRING, description: "#RRGGBB 형식의 16진수 색상 코드" },
                        role: { type: Type.STRING, description: "주조색, 보조색, 강조색 중 하나" },
                      },
                      required: ["name", "hex", "role"],
                    },
                  },
                  steps: {
                    type: Type.ARRAY,
                    description: "수업 시간에 따라갈 제작 순서 4단계",
                    items: { type: Type.STRING },
                  },
                },
              },
            },
            required: ["reply", "stageSuggestion", "mentorTip", "quickReplies", "conceptPatch"],
          },
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
    }
  });

  app.post("/api/mentor/sparks", async (req: Request, res: Response) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(500).json({
        code: "MISSING_API_KEY",
        error: "서버에 GEMINI_API_KEY가 설정되어 있지 않습니다. Settings > Secrets 패널에서 API 키를 설정해 주세요.",
      });
      return;
    }

    try {
      const { gradeLevel, medium, theme, mood } = req.body as {
        gradeLevel: string;
        medium: string;
        theme: string;
        mood: string;
      };

      const systemInstruction = `당신은 미술 교실의 아이디어 큐레이터입니다. 학생이 막막함을 느낄 때, 서로 전혀 다른 시선과 조형 접근을 가진 3가지 작품 아이디어를 제안해 주세요.
- 모든 아이디어는 한국 초·중·고 미술실(45~90분 수업 또는 2~4차시 프로젝트)에서 실제로 제작 가능해야 합니다.
- 3가지 제안은 각각 구도, 시점(시선), 상징 방식에서 뚜렷한 차이를 가져야 합니다.
- compositionType은 반드시 'rule_of_thirds', 'diagonal', 'centered', 'horizon', 'radial' 중 하나를 사용하세요.`;

      const prompt = `조건에 맞는 작품 아이디어 3가지를 제안해 주세요:
- 학년: ${gradeLevel || "중학생"}
- 표현 매체: ${medium || "수채화"}
- 수업 주제/관심사: ${theme || "일상 속의 빛과 그림자"}
- 원하는 분위기: ${mood || "서정적이고 깊이 있는"}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "매력적인 작품 가제" },
                hook: { type: Type.STRING, description: "이 아이디어가 흥미로운 이유와 핵심 컨셉 (2문장)" },
                subject: { type: Type.STRING, description: "화면에 그릴/만들 구체적 대상과 배경" },
                visualFocus: { type: Type.STRING, description: "관람자의 시선을 가장 먼저 사로잡는 포인트" },
                compositionType: {
                  type: Type.STRING,
                  description: "rule_of_thirds, diagonal, centered, horizon, radial 중 하나",
                },
                compositionNote: { type: Type.STRING, description: "구도 배치 설명 (1~2문장)" },
                moodKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "분위기 키워드 3개",
                },
                materials: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "준비물 4개",
                },
                colorPalette: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      hex: { type: Type.STRING },
                      role: { type: Type.STRING },
                    },
                    required: ["name", "hex", "role"],
                  },
                },
                firstStep: { type: Type.STRING, description: "지금 바로 스케치북에 시작할 첫 번째 행동" },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "4단계 제작 순서",
                },
              },
              required: [
                "title",
                "hook",
                "subject",
                "visualFocus",
                "compositionType",
                "compositionNote",
                "moodKeywords",
                "materials",
                "colorPalette",
                "firstStep",
                "steps",
              ],
            },
          },
        },
      });

      const rawText = (response.text ?? "[]").trim();
      const parsed = JSON.parse(rawText);
      res.json({ sparks: parsed });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("/{*splat}", (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send("Build artifacts not found.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Atelier Mentor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
