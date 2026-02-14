"use client";

interface TabNavProps {
  tabs: { label: string; key: string }[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="flex border-b-2 border-[#e5e5e5] overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={[
              "px-5 py-3 text-[13px] font-body whitespace-nowrap transition-colors",
              isActive
                ? "text-black font-semibold border-b-2 border-black -mb-[2px]"
                : "text-[#6b7280] font-medium border-b-2 border-transparent -mb-[2px] hover:text-black",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
