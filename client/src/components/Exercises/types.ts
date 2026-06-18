export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  prKg: number | null;
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
