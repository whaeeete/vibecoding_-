import type { CompositionType } from "../types/studio";

interface CompositionDiagramProps {
  type: CompositionType;
  onChangeType?: (next: CompositionType) => void;
}

const COMPOSITION_OPTIONS: Array<{ id: CompositionType; label: string }> = [
  { id: "rule_of_thirds", label: "삼분할" },
  { id: "diagonal", label: "대각선" },
  { id: "centered", label: "중앙 집중" },
  { id: "horizon", label: "수평선" },
  { id: "radial", label: "방사형" },
];

export function CompositionDiagram({ type, onChangeType }: CompositionDiagramProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-stone-500">구도 프레임 선택</span>
        {onChangeType && (
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-100 p-1">
            {COMPOSITION_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeType(opt.id)}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  type === opt.id
                    ? "bg-white text-stone-950 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-stone-50 p-3">
        <svg
          viewBox="0 0 240 150"
          className="h-32 w-full"
          role="img"
          aria-label={`선택된 구도 도해: ${COMPOSITION_OPTIONS.find((o) => o.id === type)?.label || "삼분할"}`}
        >
          {/* Outer Canvas Frame */}
          <rect
            x="8"
            y="8"
            width="224"
            height="134"
            rx="4"
            fill="#FFFFFF"
            stroke="#D6D3D1"
            strokeWidth="1.5"
          />

          {type === "rule_of_thirds" && (
            <g>
              <line x1="82.6" y1="8" x2="82.6" y2="142" stroke="#D6D3D1" strokeDasharray="4 3" strokeWidth="1" />
              <line x1="157.3" y1="8" x2="157.3" y2="142" stroke="#D6D3D1" strokeDasharray="4 3" strokeWidth="1" />
              <line x1="8" y1="52.6" x2="232" y2="52.6" stroke="#D6D3D1" strokeDasharray="4 3" strokeWidth="1" />
              <line x1="8" y1="97.3" x2="232" y2="97.3" stroke="#D6D3D1" strokeDasharray="4 3" strokeWidth="1" />
              <circle cx="157.3" cy="52.6" r="18" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.6" />
              <circle cx="157.3" cy="52.6" r="4" fill="#D97706" />
              <circle cx="82.6" cy="97.3" r="6" fill="none" stroke="#A8A29E" strokeWidth="1.2" />
            </g>
          )}

          {type === "diagonal" && (
            <g>
              <line x1="16" y1="134" x2="224" y2="16" stroke="#F59E0B" strokeWidth="1.6" strokeDasharray="5 3" />
              <line x1="16" y1="100" x2="165" y2="16" stroke="#D6D3D1" strokeWidth="1" />
              <polygon points="150,58 186,38 194,76" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.6" />
              <circle cx="62" cy="108" r="10" fill="#E7E5E4" stroke="#78716C" strokeWidth="1.2" />
            </g>
          )}

          {type === "centered" && (
            <g>
              <line x1="120" y1="14" x2="120" y2="136" stroke="#D6D3D1" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="16" y1="75" x2="224" y2="75" stroke="#D6D3D1" strokeDasharray="3 3" strokeWidth="1" />
              <rect x="86" y="42" width="68" height="66" rx="34" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.6" />
              <circle cx="120" cy="75" r="5" fill="#D97706" />
            </g>
          )}

          {type === "horizon" && (
            <g>
              <line x1="8" y1="92" x2="232" y2="92" stroke="#F59E0B" strokeWidth="1.6" />
              <rect x="8" y="92" width="224" height="50" fill="#F5F5F4" opacity="0.85" />
              <path d="M 40 92 Q 95 45 145 92" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
              <circle cx="184" cy="46" r="11" fill="#FDE68A" stroke="#D97706" strokeWidth="1.4" />
            </g>
          )}

          {type === "radial" && (
            <g>
              <line x1="120" y1="75" x2="24" y2="20" stroke="#D6D3D1" strokeWidth="1" />
              <line x1="120" y1="75" x2="216" y2="20" stroke="#D6D3D1" strokeWidth="1" />
              <line x1="120" y1="75" x2="24" y2="130" stroke="#D6D3D1" strokeWidth="1" />
              <line x1="120" y1="75" x2="216" y2="130" stroke="#D6D3D1" strokeWidth="1" />
              <line x1="120" y1="75" x2="120" y2="14" stroke="#D6D3D1" strokeWidth="1" />
              <line x1="120" y1="75" x2="120" y2="136" stroke="#D6D3D1" strokeWidth="1" />
              <circle cx="120" cy="75" r="22" fill="none" stroke="#FCD34D" strokeWidth="1.2" strokeDasharray="3 3" />
              <circle cx="120" cy="75" r="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.6" />
              <circle cx="120" cy="75" r="3.5" fill="#D97706" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
