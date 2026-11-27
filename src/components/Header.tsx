import type { StudioTab } from "../types/studio";

interface HeaderProps {
  activeTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  savedCount: number;
  onStartNewPlan: () => void;
}

export function Header({ activeTab, onSelectTab, savedCount, onStartNewPlan }: HeaderProps) {
  const navItems: Array<{ id: StudioTab; label: string }> = [
    { id: "mentor", label: "작품 대화" },
    { id: "sparks", label: "아이디어 카드" },
    { id: "examples", label: "수업 예시" },
    { id: "saved", label: savedCount > 0 ? `내 보관함 (${savedCount})` : "내 보관함" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab("mentor")}
          className="font-editorial cursor-pointer text-xl tracking-normal text-stone-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
        >
          아뜰리에 멘토
        </button>

        {/* Zone 2: Concise single-line nav links */}
        <nav
          aria-label="주요 메뉴"
          className="flex items-center gap-4 overflow-x-auto sm:gap-7"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`cursor-pointer border-b-2 py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500 ${
                  isActive
                    ? "border-amber-500 text-stone-950"
                    : "border-transparent text-stone-600 hover:border-amber-300 hover:text-stone-900"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onStartNewPlan}
            className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-stone-950 transition-colors hover:bg-amber-600 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:text-sm"
          >
            새 구상 시작
          </button>
        </div>
      </div>
    </header>
  );
}
