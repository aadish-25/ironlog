export interface StatCard {
  icon: string;
  label: string;
  value: string;
}

export interface SettingsItem {
  icon: string;
  label: string;
  onClick?: () => void;
}
