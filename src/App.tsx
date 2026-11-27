import { useEffect, useState } from "react";
import { ClassExamplesView } from "./components/ClassExamplesView";
import { ConceptBoard } from "./components/ConceptBoard";
import { Header } from "./components/Header";
import { IdeaSparkDeck } from "./components/IdeaSparkDeck";
import { MentorChat } from "./components/MentorChat";
import { SavedPlansView } from "./components/SavedPlansView";
import { createInitialConcept, DEFAULT_QUICK_REPLIES } from "./data/classPrompts";
import type {
  ArtMedium,
  ChatMessage,
  ClassPromptTemplate,
  CompositionType,
  ConceptPlan,
  GradeLevel,
  IdeaSpark,
  StudioTab,
} from "./types/studio";

const STORAGE_KEY = "atelier_mentor_saved_plans_v1";

const VALID_COMPOSITIONS: CompositionType[] = [
  "rule_of_thirds",
  "diagonal",
  "centered",
  "horizon",
  "radial",
];

function nowTimeLabel() {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function createWelcomeMessage(theme: string): ChatMessage {
  return {
    id: `msg-welcome-${Date.now()}`,
    role: "mentor",
    timestamp: nowTimeLabel(),
    text: `반가워요! 오늘 미술 수업 주제는 '${theme}'입니다.\n아직 거창한 계획이 없어도 괜찮아요. 최근에 인상 깊었던 장면이나 지금 머릿속에 스치는 색감·사물이 있다면 편하게 들려주세요. 함께 대화를 나누며 오른쪽 구상 보드를 채워 나갈게요.`,
    mentorTip: "아이디어가 잘 떠오르지 않을 때는 '스케치' 버튼을 눌러 동그라미나 선 몇 개로 구도만 그려봐도 좋아요.",
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<StudioTab>("mentor");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>("중학생");
  const [medium, setMedium] = useState<ArtMedium>("수채화");
  const [theme, setTheme] = useState<string>("기억 속의 빛과 장소");
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [concept, setConcept] = useState<ConceptPlan>(() =>
    createInitialConcept("중학생", "수채화", "기억 속의 빛과 장소")
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createWelcomeMessage("기억 속의 빛과 장소"),
  ]);
  const [quickReplies, setQuickReplies] = useState<string[]>(DEFAULT_QUICK_REPLIES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<ConceptPlan[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ConceptPlan[]) : [];
    } catch {
      return [];
    }
  });
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlans));
    } catch {
      // Ignore storage quota errors silently
    }
  }, [savedPlans]);

  function handleUpdateConcept(patch: Partial<ConceptPlan>) {
    setConcept((prev) => ({
      ...prev,
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  }

  function handleChangeGrade(nextGrade: GradeLevel) {
    setGradeLevel(nextGrade);
    handleUpdateConcept({ gradeLevel: nextGrade });
  }

  function handleChangeMedium(nextMedium: ArtMedium) {
    setMedium(nextMedium);
    handleUpdateConcept({ medium: nextMedium });
  }

  function handleChangeTheme(nextTheme: string) {
    setTheme(nextTheme);
    handleUpdateConcept({ theme: nextTheme });
  }

  function handleStartNewPlan() {
    const fresh = createInitialConcept(gradeLevel, medium, theme || "자유 창작");
    setConcept(fresh);
    setCurrentStage(1);
    setMessages([createWelcomeMessage(theme || "자유 창작")]);
    setQuickReplies(DEFAULT_QUICK_REPLIES);
    setErrorMessage(null);
    setActiveTab("mentor");
  }

  function handleSavePlan() {
    const updated: ConceptPlan = {
      ...concept,
      gradeLevel,
      medium,
      theme,
      updatedAt: new Date().toISOString(),
    };
    setSavedPlans((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      if (exists) {
        return prev.map((p) => (p.id === updated.id ? updated : p));
      }
      return [updated, ...prev];
    });
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 1800);
  }

  function handleDeletePlan(planId: string) {
    setSavedPlans((prev) => prev.filter((p) => p.id !== planId));
  }

  function handleOpenSavedPlan(plan: ConceptPlan) {
    setGradeLevel(plan.gradeLevel);
    setMedium(plan.medium);
    setTheme(plan.theme);
    setConcept(plan);
    setCurrentStage(2);
    setMessages([
      {
        id: `msg-reopen-${Date.now()}`,
        role: "mentor",
        timestamp: nowTimeLabel(),
        text: `저장해 두었던 '${plan.title}' 구상을 다시 불러왔어요.\n지금 구상에서 색감이나 구도를 더 다듬어 볼까요, 아니면 바로 제작 단계로 넘어갈까요?`,
      },
    ]);
    setQuickReplies([
      "구도 배치를 조금 더 재미있게 바꿔보고 싶어요",
      "색채 팔레트 조합을 조언해 주세요",
      "제작 순서를 더 구체적으로 짜고 싶어요",
    ]);
    setErrorMessage(null);
    setActiveTab("mentor");
  }

  function handleSelectTemplate(tpl: ClassPromptTemplate) {
    setGradeLevel(tpl.gradeLevel);
    setMedium(tpl.medium);
    setTheme(tpl.theme);
    setConcept({
      ...tpl.concept,
      id: `plan-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    });
    setCurrentStage(1);
    setMessages([
      {
        id: `msg-tpl-${Date.now()}`,
        role: "mentor",
        timestamp: nowTimeLabel(),
        text: `'${tpl.title}' 수업 주제를 선택했군요!\n${tpl.openingQuestion}`,
      },
    ]);
    setQuickReplies(tpl.quickReplies);
    setErrorMessage(null);
    setActiveTab("mentor");
  }

  function handleAdoptSpark(
    spark: IdeaSpark,
    chosenGrade: GradeLevel,
    chosenMedium: ArtMedium,
    chosenTheme: string
  ) {
    setGradeLevel(chosenGrade);
    setMedium(chosenMedium);
    setTheme(chosenTheme);
    setConcept({
      id: `plan-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      gradeLevel: chosenGrade,
      medium: chosenMedium,
      theme: chosenTheme,
      title: spark.title,
      artistStatement: spark.hook,
      subject: spark.subject,
      moodKeywords: spark.moodKeywords,
      compositionType: VALID_COMPOSITIONS.includes(spark.compositionType)
        ? spark.compositionType
        : "rule_of_thirds",
      compositionNote: spark.compositionNote,
      materials: spark.materials,
      colorPalette: spark.colorPalette,
      steps: spark.steps.map((label, idx) => ({
        id: `step-${Date.now()}-${idx}`,
        label,
        done: false,
      })),
    });
    setCurrentStage(3);
    setMessages([
      {
        id: `msg-spark-${Date.now()}`,
        role: "mentor",
        timestamp: nowTimeLabel(),
        text: `선택한 아이디어 '${spark.title}'를 구상 보드에 정리해 두었어요.\n먼저 '${spark.firstStep}'부터 시작해 보는 건 어떨까요? 바꾸고 싶은 요소나 더 추가하고 싶은 이야기가 있다면 말씀해 주세요!`,
        mentorTip: `시선 포인트: ${spark.visualFocus}`,
      },
    ]);
    setQuickReplies([
      "주인공 대상을 다른 사물로 바꿔보고 싶어요",
      "스케치 패드로 구도를 먼저 잡아볼게요",
      "색채 분위기를 조금 더 따뜻하게 수정하고 싶어요",
    ]);
    setErrorMessage(null);
    setActiveTab("mentor");
  }

  async function handleSendMessage(text: string, sketchDataUrl?: string) {
    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      role: "user",
      text,
      timestamp: nowTimeLabel(),
      sketchPreviewUrl: sketchDataUrl,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            text: m.text,
            hasSketch: Boolean(m.sketchPreviewUrl),
          })),
          context: {
            gradeLevel,
            medium,
            theme,
            currentStage,
            currentConcept: concept,
          },
          sketchDataUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "멘토 응답을 불러오지 못했습니다.");
      }

      const mentorMsg: ChatMessage = {
        id: `msg-m-${Date.now()}`,
        role: "mentor",
        text: data.reply || "좋은 방향이에요! 다음으로 어떤 부분을 더 구체화해 볼까요?",
        timestamp: nowTimeLabel(),
        mentorTip: data.mentorTip,
      };

      setMessages((prev) => [...prev, mentorMsg]);

      if (
        typeof data.stageSuggestion === "number" &&
        data.stageSuggestion >= 1 &&
        data.stageSuggestion <= 4
      ) {
        setCurrentStage(data.stageSuggestion);
      }

      if (Array.isArray(data.quickReplies) && data.quickReplies.length > 0) {
        setQuickReplies(data.quickReplies.slice(0, 3));
      }

      const patch = data.conceptPatch;
      if (patch && typeof patch === "object") {
        setConcept((prev) => {
          const nextComposition = VALID_COMPOSITIONS.includes(patch.compositionType)
            ? (patch.compositionType as CompositionType)
            : prev.compositionType;

          const nextSteps =
            Array.isArray(patch.steps) && patch.steps.length > 0
              ? patch.steps.map((label: string, idx: number) => ({
                  id: prev.steps[idx]?.id || `step-${Date.now()}-${idx}`,
                  label,
                  done: prev.steps[idx]?.done ?? false,
                }))
              : prev.steps;

          return {
            ...prev,
            title: patch.title?.trim() ? patch.title : prev.title,
            artistStatement: patch.artistStatement?.trim()
              ? patch.artistStatement
              : prev.artistStatement,
            subject: patch.subject?.trim() ? patch.subject : prev.subject,
            moodKeywords:
              Array.isArray(patch.moodKeywords) && patch.moodKeywords.length > 0
                ? patch.moodKeywords.slice(0, 4)
                : prev.moodKeywords,
            compositionType: nextComposition,
            compositionNote: patch.compositionNote?.trim()
              ? patch.compositionNote
              : prev.compositionNote,
            materials:
              Array.isArray(patch.materials) && patch.materials.length > 0
                ? patch.materials
                : prev.materials,
            colorPalette:
              Array.isArray(patch.colorPalette) && patch.colorPalette.length > 0
                ? patch.colorPalette.slice(0, 4)
                : prev.colorPalette,
            steps: nextSteps,
            updatedAt: new Date().toISOString(),
          };
        });
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "네트워크 오류로 멘토 응답을 가져오지 못했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedCount={savedPlans.length}
        onStartNewPlan={handleStartNewPlan}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {activeTab === "mentor" && (
          <div className="space-y-6">
            <div className="no-print flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h1 className="font-editorial text-2xl text-stone-900 sm:text-3xl">
                  작품 창작 대화 스튜디오
                </h1>
                <p className="mt-1 text-sm text-stone-600">
                  멘토와 대화하거나 러프 스케치를 공유하면 오른쪽 구상 보드가 실시간으로 완성됩니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("sparks")}
                className="cursor-pointer self-start text-sm font-medium text-amber-700 underline-offset-4 hover:text-amber-800 hover:underline sm:self-auto"
              >
                막막하다면 아이디어 카드 3가지 먼저 받아보기
              </button>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
              <div className="no-print lg:col-span-7">
                <MentorChat
                  gradeLevel={gradeLevel}
                  medium={medium}
                  theme={theme}
                  currentStage={currentStage}
                  messages={messages}
                  quickReplies={quickReplies}
                  isLoading={isLoading}
                  errorMessage={errorMessage}
                  onChangeGrade={handleChangeGrade}
                  onChangeMedium={handleChangeMedium}
                  onChangeTheme={handleChangeTheme}
                  onSelectStage={(stageId) => setCurrentStage(stageId)}
                  onSendMessage={handleSendMessage}
                />
              </div>

              <div className="lg:col-span-5">
                <ConceptBoard
                  concept={concept}
                  onUpdateConcept={handleUpdateConcept}
                  onSavePlan={handleSavePlan}
                  isSavedRecently={isSavedRecently}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "sparks" && (
          <IdeaSparkDeck
            initialGrade={gradeLevel}
            initialMedium={medium}
            initialTheme={theme}
            onAdoptSpark={handleAdoptSpark}
          />
        )}

        {activeTab === "examples" && (
          <ClassExamplesView onSelectTemplate={handleSelectTemplate} />
        )}

        {activeTab === "saved" && (
          <SavedPlansView
            plans={savedPlans}
            onOpenPlan={handleOpenSavedPlan}
            onDeletePlan={handleDeletePlan}
            onGoToMentor={() => setActiveTab("mentor")}
          />
        )}
      </main>
    </div>
  );
}
