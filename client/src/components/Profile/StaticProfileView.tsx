import React from "react";
import { ChevronLeft } from "lucide-react";

interface StaticProfileViewProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export function StaticProfileView({ title, onBack, children }: StaticProfileViewProps) {
  return (
    <div className="fixed inset-0 bg-bg z-[100] flex flex-col font-body">
      <header className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-border shrink-0">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded bg-raised border border-border flex items-center justify-center cursor-pointer hover:bg-[#222] transition-colors"
        >
          <ChevronLeft size={16} className="text-dim" />
        </button>
        <h1 className="font-display text-base font-bold tracking-widest text-white uppercase">
          {title}
        </h1>
        <div className="w-8" />
      </header>
      <div className="flex-1 overflow-y-auto p-5 text-ghost leading-relaxed text-[14px]">
        {children}
      </div>
    </div>
  );
}
