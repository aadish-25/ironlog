export type DayType = "train" | "rest";

export interface SplitDay {
  abbr: string;
  name: string;
  type: DayType;
  muscles: string;
  exerciseCount: number;
}

export interface Split {
  id: string;
  name: string;
  isActive: boolean;
  days: SplitDay[];
}
