export type User = {
  id: string;
  clerk_id: string;
  name: string;
  email: string;
  unit: "kg" | "lbs";
  accent_color: string;
  profile_picture_url?: string;
  notifications_enabled?: boolean;
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
  is_rest?: boolean;
  exercises: SplitDayExercise[];
};

export type SplitDayExercise = {
  id: string;
  exercise_id: string;
  name: string;
  sets: number;
  reps: number;
  order_index: number;
  muscle_groups?: string[];
};

// ─── Exercises ────────────────────────────────────────────────────────────────
export type Exercise = {
  id: string;
  name: string;
  muscles: string[];
  equipments: string[];
  formGuide?: { step: number; instruction: string }[];
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
  is_completed: boolean;
};

export interface SessionExercise {
  id: string;
  exercise_id: string;
  name: string;
  sets: SetRecord[];
  muscles?: string[];
  previous_best?: string | null;
}

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