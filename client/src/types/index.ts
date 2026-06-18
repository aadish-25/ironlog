// ─── User ─────────────────────────────────────────────────────────────────────
export type User = {
  id: string;
  clerk_id: string;
  name: string;
  email: string;
  unit: "kg" | "lbs";
  accent_color: string;
  created_at: string;
};

// ─── Splits ───────────────────────────────────────────────────────────────────
export type Split = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  days: SplitDay[];
};

export type SplitDay = {
  id: string;
  split_id: string;
  day_of_week: number; // 0 = Mon … 6 = Sun
  label: string;       // "Push Day"
  muscles: string;     // "Chest · Shoulders · Triceps"
  type: "train" | "rest";
  exercises: SplitDayExercise[];
};

export type SplitDayExercise = {
  id: string;
  exercise_id: string;
  name: string;
  sets: number;
  reps: number;
  order_index: number;
};

// ─── Exercises ────────────────────────────────────────────────────────────────
export type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  demo_url: string | null;
  demo_type: "youtube" | "gif" | null;
};

export type ExerciseProgress = {
  session_date: string;
  max_weight: number;
  total_volume: number;
  pr_hit: boolean;
};

// ─── Sessions ─────────────────────────────────────────────────────────────────
export type Session = {
  id: string;
  split_day_id: string;
  split_day_label: string;
  started_at: string;
  ended_at: string | null;
  is_skipped: boolean;
  total_volume: number;
  sets_logged: number;
};

export type SessionExercise = {
  id: string;
  exercise_id: string;
  name: string;
  sets: SetRecord[];
};

export type SetRecord = {
  id: string;
  set_number: number;
  weight: number;
  reps: number;
  is_logged: boolean;
  is_overload: boolean;
  pr_hit: boolean;
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export type AIMessage = {
  role: "user" | "ai";
  text: string;
  citation?: string;
};

export type AIInsight = {
  accent: string;
  icon: string;
  title: string;
  body: string;
};