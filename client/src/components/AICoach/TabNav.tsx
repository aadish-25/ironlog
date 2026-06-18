import React from "react";

export type Tab = "insights" | "chat";

interface TabNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav
      className="flex border-b border-card mt-3.5 shrink-0"
      role="tablist"
      aria-label="Coach sections"
    >
      {(["insights", "chat"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-1 py-[13px] text-center text-xs font-medium tracking-[0.5px] capitalize bg-transparent border-none cursor-pointer font-body transition-colors border-b-2 ${
            activeTab === tab
              ? "text-heat border-heat"
              : "text-ghost border-transparent hover:text-dim"
          }`}
          role="tab"
          aria-selected={activeTab === tab}
          aria-controls={`panel-${tab}`}
        >
          {tab === "insights" ? "Insights" : "Chat"}
        </button>
      ))}
    </nav>
  );
}
