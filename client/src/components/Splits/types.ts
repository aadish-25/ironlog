export type DayType = "train" | "rest";

export interface SplitDay {
  id: string;
  split_id: string;
  day_of_week: number;
  label: string;
  muscles: string;
  type: DayType;
  is_rest?: boolean;
  exercises: { id: string; exercise_id: string; name: string; sets: number; reps: number; order_index: number }[];
}

export interface Split {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  days: SplitDay[];
}
