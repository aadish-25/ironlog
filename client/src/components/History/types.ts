export interface SessionSummary {
  id: string;
  date: string;
  name: string;
  volumeKg: number;
}

export interface MonthSummary {
  label: string;
  sessions: number;
  totalVolumeKg: number;
  comparisonText: string | null;
}
