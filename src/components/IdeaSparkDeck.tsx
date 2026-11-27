import { useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { ART_MEDIUMS, GRADE_LEVELS } from "../data/classPrompts";
import type { ArtMedium, GradeLevel, IdeaSpark } from "../types/studio";

interface IdeaSparkDeckProps {
  initialGrade: GradeLevel;
  initialMedium: ArtMedium;
  initialTheme: string;
  onAdoptSpark: (spark: IdeaSpark, grade: GradeLevel, medium: ArtMedium, theme: string) => void;
}

const MOOD_PRESETS = [
  "서정적이고 고요한",
  "생동감 넘치고 경쾌한",
  "강렬한 명암 대비의",
  "상상력이 돋보이는 몽환적인",
];

export function IdeaSparkDeck({
  initialGrade,
  initialMedium,
  initialTheme,
  onAdoptSpark,
}: IdeaSparkDeckProps) {
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(initialGrade);
  const [medium, setMedium] = useState<ArtMedium>(initialMedium);
  const [theme, setTheme] = useState<string>(initialTheme || "나를 표현하는 공간");
  const [mood, setMood] = useState<string>(MOOD_PRESETS[0]);
  const [sparks, setSparks] = useState<IdeaSpark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerateSparks(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/mentor/sparks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gradeLevel, medium, theme, mood }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "아이디어를 생성하지 못했습니다.");
      }
      const list = Array.isArray(data.sparks) ? data.sparks : [];
      setSparks(
        list.map((item: Omit<IdeaSpark, "id">, idx: number) => ({
          ...item,
          id: `spark-${Date.now()}-${idx}`,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      {/* Intro & Controls */}
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="max-w-2xl">
          <h1 className="font-editorial text-2xl text-stone-900 sm:text-3xl">
            아이디어 카드 제안받기
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            무엇을 그릴지 떠오르지 않을 때 조건을 선택해 보세요. 서로 다른 시점과 구도를 가진 3가지 작품 방향을 제안합니다.
          </p>
        </div>

        <form onSubmit={handleGenerateSparks} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="spark-grade" className="block text-xs font-medium text-stone-500">
              학년 수준
            </label>
            <select
              id="spark-grade"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-900 focus:border-amber-500 focus:bg-white focus:outline-none"
            >
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="spark-medium" className="block text-xs font-medium text-stone-500">
              표현 매체
            </label>
            <select
              id="spark-medium"
              value={medium}
              onChange={(e) => setMedium(e.target.value as ArtMedium)}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-900 focus:border-amber-500 focus:bg-white focus:outline-none"
            >
              {ART_MEDIUMS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="spark-mood" className="block text-xs font-medium text-stone-500">
              원하는 분위기
            </label>
            <select
              id="spark-mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-900 focus:border-amber-500 focus:bg-white focus:outline-none"
            >
              {MOOD_PRESETS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="spark-theme" className="block text-xs font-medium text-stone-500">
              주제 또는 관심사
            </label>
            <input
              id="spark-theme"
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="예: 비 오는 날 창밖, 미래의 정원"
              className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
              {isLoading ? "아이디어 3가지 구상 중..." : "아이디어 3가지 제안받기"}
            </button>
          </div>
        </form>

        {error && (
          <div role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}
      </div>

      {/* Results Grid */}
      {sparks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {sparks.map((spark, index) => (
            <article
              key={spark.id}
              className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-6"
            >
              <div className="space-y-4">
                <div className="text-xs text-stone-500">
                  <span>제안 0{index + 1}</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span>{spark.moodKeywords.join(" / ")}</span>
                </div>

                <div>
                  <h2 className="font-editorial text-xl text-stone-900">
                    {spark.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{spark.hook}</p>
                </div>

                <div className="border-t border-stone-100 pt-4 space-y-2.5 text-sm">
                  <div>
                    <span className="text-xs font-medium text-stone-500">중심 소재</span>
                    <p className="mt-0.5 text-stone-800">{spark.subject}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-stone-500">시선 집중 포인트</span>
                    <p className="mt-0.5 text-stone-800">{spark.visualFocus}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-stone-500">첫 시작 행동</span>
                    <p className="mt-0.5 text-stone-700">{spark.firstStep}</p>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-4">
                  <span className="block text-xs font-medium text-stone-500">색채 팔레트</span>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {spark.colorPalette.map((sw, i) => (
                      <div key={`${sw.hex}-${i}`} title={`${sw.name} (${sw.hex})`}>
                        <div
                          className="h-6 w-full rounded border border-black/5"
                          style={{ backgroundColor: sw.hex }}
                        />
                        <div className="mt-1 truncate text-[11px] text-stone-500">{sw.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => onAdoptSpark(spark, gradeLevel, medium, theme)}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 whitespace-nowrap"
                >
                  <span>이 아이디어로 대화 시작</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white/70 px-6 py-12 text-center">
            <p className="text-sm font-medium text-stone-700">
              위 조건을 선택하고 &ldquo;아이디어 3가지 제안받기&rdquo;를 누르면 맞춤형 구상 카드가 열립니다.
            </p>
            <p className="mt-1 text-xs text-stone-500">
              마음에 드는 카드를 고르면 바로 작품 대화와 구상 보드로 이어집니다.
            </p>
          </div>
        )
      )}
    </div>
  );
}
