import { useState } from "react";
import { Bookmark, Check, Copy, Printer } from "lucide-react";
import type { CompositionType, ConceptPlan } from "../types/studio";
import { CompositionDiagram } from "./CompositionDiagram";

interface ConceptBoardProps {
  concept: ConceptPlan;
  onUpdateConcept: (patch: Partial<ConceptPlan>) => void;
  onSavePlan: () => void;
  isSavedRecently: boolean;
}

export function ConceptBoard({
  concept,
  onUpdateConcept,
  onSavePlan,
  isSavedRecently,
}: ConceptBoardProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedSheet, setCopiedSheet] = useState(false);

  function handleCopyHex(hex: string) {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  }

  function handleToggleStep(stepId: string) {
    const nextSteps = concept.steps.map((s) =>
      s.id === stepId ? { ...s, done: !s.done } : s
    );
    onUpdateConcept({ steps: nextSteps });
  }

  function handleCopyFullSheet() {
    const text = [
      `[작품 구상 계획서] ${concept.title}`,
      `분류: ${concept.gradeLevel} · ${concept.medium} · 주제: ${concept.theme}`,
      "",
      `1. 표현 의도: ${concept.artistStatement}`,
      `2. 중심 소재: ${concept.subject}`,
      `3. 구도 계획: ${concept.compositionNote}`,
      `4. 준비물: ${concept.materials.join(", ")}`,
      `5. 색채 팔레트: ${concept.colorPalette.map((c) => `${c.name}(${c.hex})`).join(", ")}`,
      "",
      "6. 제작 순서:",
      ...concept.steps.map((s, idx) => `${idx + 1}. ${s.label}`),
    ].join("\n");
    navigator.clipboard?.writeText(text);
    setCopiedSheet(true);
    setTimeout(() => setCopiedSheet(false), 1800);
  }

  const completedCount = concept.steps.filter((s) => s.done).length;

  return (
    <aside className="print-full rounded-xl border border-stone-200 bg-white">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>{concept.gradeLevel}</span>
            <span aria-hidden="true">·</span>
            <span>{concept.medium}</span>
          </div>
          <h2 className="mt-0.5 text-lg text-stone-900">작품 구상 보드</h2>
        </div>

        <div className="no-print flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyFullSheet}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 whitespace-nowrap shrink-0"
          >
            {copiedSheet ? (
              <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {copiedSheet ? "복사됨" : "계획서 복사"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 whitespace-nowrap shrink-0"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            인쇄
          </button>
          <button
            type="button"
            onClick={onSavePlan}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-800 whitespace-nowrap shrink-0"
          >
            {isSavedRecently ? (
              <Check className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {isSavedRecently ? "저장 완료" : "보관함 저장"}
          </button>
        </div>
      </div>

      {/* Body Sections separated cleanly with hairline dividers */}
      <div className="divide-y divide-stone-200/80">
        {/* 1. Title & Artist Statement */}
        <section className="space-y-3 px-5 py-5">
          <div>
            <label htmlFor="concept-title" className="block text-xs font-medium text-stone-500">
              작품 가제
            </label>
            <input
              id="concept-title"
              type="text"
              value={concept.title}
              onChange={(e) => onUpdateConcept({ title: e.target.value })}
              className="font-editorial mt-1 w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-xl text-stone-900 transition-colors hover:border-stone-200 focus:border-amber-500 focus:bg-stone-50/50 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="concept-statement" className="block text-xs font-medium text-stone-500">
              표현 의도 한 줄
            </label>
            <textarea
              id="concept-statement"
              rows={2}
              value={concept.artistStatement}
              onChange={(e) => onUpdateConcept({ artistStatement: e.target.value })}
              className="mt-1 w-full resize-none rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm leading-relaxed text-stone-700 transition-colors hover:border-stone-200 focus:border-amber-500 focus:bg-stone-50/50 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-500">
            <span className="font-medium text-stone-700">분위기 키워드:</span>
            <span>{concept.moodKeywords.join(" · ") || "탐색 중"}</span>
          </div>
        </section>

        {/* 2. Subject & Composition */}
        <section className="space-y-4 px-5 py-5">
          <div>
            <h3 className="text-xs font-medium text-stone-500">화면 속 중심 소재</h3>
            <p className="mt-1 text-sm leading-relaxed text-stone-800">{concept.subject}</p>
          </div>

          <CompositionDiagram
            type={concept.compositionType}
            onChangeType={(next: CompositionType) => onUpdateConcept({ compositionType: next })}
          />

          <p className="text-xs leading-relaxed text-stone-600">{concept.compositionNote}</p>
        </section>

        {/* 3. Color Palette */}
        <section className="space-y-3 px-5 py-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-stone-500">추천 색채 팔레트</h3>
            <span className="text-xs text-stone-400">색상을 클릭하면 코드가 복사됩니다</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {concept.colorPalette.map((swatch, idx) => (
              <button
                key={`${swatch.hex}-${idx}`}
                type="button"
                onClick={() => handleCopyHex(swatch.hex)}
                className="group cursor-pointer rounded-lg border border-stone-200 bg-white p-2 text-left transition-colors hover:border-amber-300"
              >
                <div
                  className="h-10 w-full rounded-md border border-black/5"
                  style={{ backgroundColor: swatch.hex }}
                />
                <div className="mt-2 truncate text-xs font-medium text-stone-900">
                  {swatch.name}
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[11px] text-stone-500">
                  <span>{swatch.role}</span>
                  <span className="font-mono-tabular">
                    {copiedHex === swatch.hex ? "복사됨" : swatch.hex}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 4. Materials & Studio Checklist */}
        <section className="space-y-4 px-5 py-5">
          <div>
            <h3 className="text-xs font-medium text-stone-500">준비물</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-800">
              {concept.materials.join(" · ")}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-medium text-stone-500">수업 제작 순서</h3>
              <span className="font-mono-tabular text-xs text-stone-500">
                {completedCount}/{concept.steps.length} 완료
              </span>
            </div>
            <ul className="space-y-2">
              {concept.steps.map((step, index) => (
                <li key={step.id}>
                  <label className="flex cursor-pointer items-start gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={step.done}
                      onChange={() => handleToggleStep(step.id)}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-amber-600 accent-amber-500 focus:ring-amber-500"
                    />
                    <span
                      className={`text-sm leading-snug ${
                        step.done ? "text-stone-400 line-through" : "text-stone-700"
                      }`}
                    >
                      <span className="font-mono-tabular mr-1.5 text-xs text-stone-400">
                        0{index + 1}.
                      </span>
                      {step.label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </aside>
  );
}
