import { useState } from "react";
import { ArrowRight, Palette } from "lucide-react";
import { CLASS_PROMPT_TEMPLATES } from "../data/classPrompts";
import type { ClassPromptTemplate } from "../types/studio";

interface ClassExamplesViewProps {
  onSelectTemplate: (template: ClassPromptTemplate) => void;
}

function StudioImageFrame({ src, alt, title }: { src: string; alt: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center bg-stone-100 px-4 text-center">
        <Palette className="h-8 w-8 text-stone-400" aria-hidden="true" />
        <span className="mt-2 text-xs font-medium text-stone-600">{title}</span>
      </div>
    );
  }

  return (
    <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
    </div>
  );
}

export function ClassExamplesView({ onSelectTemplate }: ClassExamplesViewProps) {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div className="max-w-2xl">
        <h1 className="font-editorial text-2xl text-stone-900 sm:text-3xl">
          미술 수업 예시 주제
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          실제 미술실에서 바로 시작할 수 있는 4가지 창작 수업 주제를 살펴보세요. 원하는 수업을 선택하면 해당 맥락과 구상 노트가 바로 열립니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {CLASS_PROMPT_TEMPLATES.map((tpl) => (
          <article
            key={tpl.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white"
          >
            <StudioImageFrame src={tpl.imageUrl} alt={tpl.imageAlt} title={tpl.title} />

            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
                  <span>{tpl.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{tpl.gradeLevel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{tpl.medium}</span>
                </div>

                <h2 className="font-editorial mt-2 text-xl text-stone-900">
                  {tpl.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{tpl.summary}</p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
                <div className="flex items-center gap-1.5">
                  {tpl.concept.colorPalette.map((sw, idx) => (
                    <span
                      key={`${sw.hex}-${idx}`}
                      title={sw.name}
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ backgroundColor: sw.hex }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTemplate(tpl)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-stone-800 whitespace-nowrap shrink-0"
                >
                  <span>이 주제로 시작하기</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
