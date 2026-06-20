import React from "react";
import { Plus } from "lucide-react";

interface SplitsHeaderProps {
  onOpenCreateModal: () => void;
}

export function SplitsHeader({ onOpenCreateModal }: SplitsHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-1">
      <h1 className="font-display text-[32px] tracking-[2px] text-white">
        Splits
      </h1>
      <button
        onClick={onOpenCreateModal}
        className="tour-new-split px-4 py-2 bg-heat border-none rounded-lg text-white font-display text-sm tracking-[1.5px] cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1"
        aria-label="Create new split"
      >
        <Plus size={14} />
        NEW
      </button>
    </header>
  );
}
