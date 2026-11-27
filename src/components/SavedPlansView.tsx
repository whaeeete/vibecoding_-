import { ArrowRight, Trash2 } from "lucide-react";
import type { ConceptPlan } from "../types/studio";

interface SavedPlansViewProps {
  plans: ConceptPlan[];
  onOpenPlan: (plan: ConceptPlan) => void;
  onDeletePlan: (planId: string) => void;
  onGoToMentor: () => void;
}

export function SavedPlansView({
  plans,
  onOpenPlan,
  onDeletePlan,
  onGoToMentor,
}: SavedPlansViewProps) {
  function formatDate(iso: string) {
    try {
      return new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return "";
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div className="max-w-2xl">
        <h1 className="font-editorial text-2xl text-stone-900 sm:text-3xl">
          내 작품 구상 보관함
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          수업 시간에 저장한 작품 구상 계획서 목록입니다. 언제든 다시 불러와 멘토와 대화를 이어가거나 인쇄할 수 있습니다.
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-stone-700">
            아직 보관함에 저장된 작품 구상 계획서가 없습니다.
          </p>
          <p className="mt-1 text-xs text-stone-500">
            작품 대화 화면 오른쪽의 &ldquo;보관함 저장&rdquo; 버튼을 누르면 이곳에 기록됩니다.
          </p>
          <button
            type="button"
            onClick={onGoToMentor}
            className="mt-5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-600"
          >
            작품 대화로 돌아가기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const doneCount = plan.steps.filter((s) => s.done).length;
            return (
              <article
                key={plan.id}
                className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>
                      {plan.gradeLevel} · {plan.medium}
                    </span>
                    <span className="font-mono-tabular">{formatDate(plan.updatedAt)}</span>
                  </div>

                  <div>
                    <h2 className="font-editorial text-lg text-stone-900">
                      {plan.title}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-600">
                      {plan.artistStatement}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    {plan.colorPalette.map((sw, idx) => (
                      <div
                        key={`${sw.hex}-${idx}`}
                        title={sw.name}
                        className="h-5 flex-1 rounded border border-black/5"
                        style={{ backgroundColor: sw.hex }}
                      />
                    ))}
                  </div>

                  <div className="text-xs text-stone-500">
                    <span>주제: {plan.theme}</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span className="font-mono-tabular">
                      진행 {doneCount}/{plan.steps.length}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
                  <button
                    type="button"
                    onClick={() => onDeletePlan(plan.id)}
                    aria-label={`${plan.title} 삭제`}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    삭제
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenPlan(plan)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-stone-800 whitespace-nowrap"
                  >
                    <span>불러오기</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
