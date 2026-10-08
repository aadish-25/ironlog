import type { ReactNode } from "react";

export interface StatCard {
  icon: ReactNode;
  label: string;
  value: string;
}

export interface SettingsItem {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}
