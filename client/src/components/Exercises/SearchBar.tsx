import { type ChangeEvent } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="mx-5 mb-2.5 relative shrink-0">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="text"
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search exercises..."
        className="w-full bg-card border border-border rounded-[10px] py-[11px] pl-[38px] pr-4 text-[13px] text-white outline-none font-body placeholder:text-ghost"
        aria-label="Search exercises"
      />
    </div>
  );
}
