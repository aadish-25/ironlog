import { ChevronRight } from "lucide-react";
import type { SettingsItem } from "./types";

interface SettingsListProps {
  title: string;
  items: SettingsItem[];
  notificationsEnabled?: boolean | null;
  onToggleNotifications?: () => void;
}

export function SettingsList({
  title,
  items,
  notificationsEnabled,
  onToggleNotifications,
}: SettingsListProps) {
  return (
    <div>
      <p className="text-[11px] font-display tracking-[2.5px] text-ghost uppercase mb-2">
        {title}
      </p>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Special case for Notifications toggle if present */}
        {onToggleNotifications && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="text-base text-ghost" aria-hidden="true">
                🔔
              </span>
              <span className="text-[15px] font-display tracking-[0.5px] text-heat">Notifications</span>
            </div>
            <button
              onClick={onToggleNotifications}
              className={`w-11 h-6 rounded-xl cursor-pointer transition-colors relative shrink-0 border-none ${
                notificationsEnabled ? "bg-heat" : "bg-raised"
              }`}
              role="switch"
              aria-checked={notificationsEnabled ?? false}
              aria-label="Toggle notifications"
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-[left] ${
                  notificationsEnabled ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        )}

        {items.map((item, idx) => (
          <button
            key={item.label}
            className={`w-full flex items-center justify-between p-4 bg-transparent border-none cursor-pointer font-body hover:bg-raised transition-colors ${
              idx < items.length - 1 ? "border-b border-border" : ""
            }`}
            aria-label={item.label}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base text-ghost" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-[15px] font-display tracking-[0.5px] text-dim">{item.label}</span>
            </div>
            <ChevronRight size={14} className="text-ghost" />
          </button>
        ))}
      </div>
    </div>
  );
}
