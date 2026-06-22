export interface Exercise {
  id: string;
  name: string;
  muscles: string[];
  equipments: string[];
  prKg: number | null;
  formGuide?: { step: number; instruction: string }[];
}

export interface MuscleGroup {
  muscle: string;
  exercises: Exercise[];
}

export const MUSCLE_ORDER = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Calves",
  "Abs",
] as const;

export const EQUIPMENT_OPTIONS = [
  "All",
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Bodyweight",
] as const;
