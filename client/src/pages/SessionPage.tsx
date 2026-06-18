import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptySessionState } from "../components/Session/EmptySessionState";
import { SessionHeader } from "../components/Session/SessionHeader";
import { ExerciseView } from "../components/Session/ExerciseView";
import type { SessionExercise } from "../components/Session/ExerciseView";
import { BottomNav } from "../components/Session/BottomNav";
import { ExercisePicker } from "../components/Session/ExercisePicker";
import { CompletionScreen } from "../components/Session/CompletionScreen";
import { AllExercisesSheet } from "../components/Session/AllExercisesSheet";
import { EndSessionDialog } from "../components/Session/EndSessionDialog";

export function SessionPage() {
  const navigate = useNavigate();

  // ─── OVERLAY STATE ──────────────────────────────────────────────────────────
  const [pickerMode, setPickerMode] = useState<"add" | "swap" | null>(null);
  const [showAllExercises, setShowAllExercises] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // ─── SESSION DATA ───────────────────────────────────────────────────────────
  // TODO: This component needs the list of exercises for today's active session.
  const exercises: SessionExercise[] = [];

  // TODO: This component needs the current exercise index for navigation.
  const currentExerciseIndex = 0;

  // TODO: This component needs the session's split day name for the header.
  const splitDayName: string | null = null;

  // TODO: This component needs the previous best for the current exercise.
  const previousBest: string | null = null;

  // ─── COMPUTED VALUES ────────────────────────────────────────────────────────
  const currentExercise = exercises[currentExerciseIndex] ?? null;
  const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0);
  const completedSets = exercises.reduce(
    (n, e) => n + e.sets.filter((s) => s.logged).length,
    0
  );
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  // ─── EVENT HANDLERS ─────────────────────────────────────────────────────────
  // TODO: Handle logging a set
  const handleLogSet = () => {};

  // TODO: Handle navigating to the next exercise.
  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      // Navigate to next
    } else {
      setShowCompletion(true);
    }
  };

  // TODO: Handle navigating to the previous exercise.
  const handlePrevExercise = () => {};

  // TODO: Handle adding an extra set to the current exercise.
  const handleAddSet = () => {};

  // TODO: Handle removing a set from the current exercise.
  const handleRemoveSet = () => {};

  // TODO: Handle swapping the current exercise for a different one.
  const handleSwapExercise = () => setPickerMode("swap");

  // TODO: Handle adding a new exercise to the session.
  const handleAddExercise = () => setPickerMode("add");

  // TODO: Handle ending the session and navigating back.
  const handleEndSession = () => setShowEndConfirm(true);

  // ─── EMPTY STATE ────────────────────────────────────────────────────────────
  if (exercises.length === 0) {
    return (
      <EmptySessionState
        onBack={() => navigate("/")}
        onCreateSplit={() => navigate("/splits")}
      />
    );
  }

  // ─── COMPLETION SCREEN ──────────────────────────────────────────────────────
  if (showCompletion) {
    return (
      <CompletionScreen
        exercises={exercises}
        onComplete={() => navigate("/")}
        onBackToWorkout={() => setShowCompletion(false)}
      />
    );
  }

  return (
    <section
      className="min-h-screen bg-bg text-white font-body flex flex-col"
      aria-label="Active session"
    >
      {/* ── Header ── */}
      <SessionHeader
        splitDayName={splitDayName}
        completedSets={completedSets}
        totalSets={totalSets}
        progressPercent={progressPercent}
        onEndSession={handleEndSession}
      />

      {/* ── Exercise content ── */}
      {currentExercise && (
        <ExerciseView
          currentExerciseIndex={currentExerciseIndex}
          totalExercises={exercises.length}
          exercise={currentExercise}
          previousBest={previousBest}
          onRemoveSet={handleRemoveSet}
          onLogSet={handleLogSet}
          onAddSet={handleAddSet}
          onViewAllExercises={() => setShowAllExercises(true)}
        />
      )}

      {/* ── Bottom navigation bar ── */}
      <BottomNav
        currentExerciseIndex={currentExerciseIndex}
        activeSetsLogged={currentExercise?.sets.filter((s) => s.logged).length ?? 0}
        activeSetsTotal={currentExercise?.sets.length ?? 0}
        onSwapExercise={handleSwapExercise}
        onAddExercise={handleAddExercise}
        onPrevExercise={handlePrevExercise}
        onNextExercise={handleNextExercise}
      />

      {/* ── Overlays ── */}
      <ExercisePicker
        isOpen={pickerMode !== null}
        mode={pickerMode}
        currentName={currentExercise?.name ?? null}
        onClose={() => setPickerMode(null)}
        onAdd={() => setPickerMode(null)}
        onSwap={() => setPickerMode(null)}
      />

      <AllExercisesSheet
        isOpen={showAllExercises}
        onClose={() => setShowAllExercises(false)}
        exercises={exercises}
        currentExerciseIndex={currentExerciseIndex}
        onSelectExercise={() => setShowAllExercises(false)}
      />

      <EndSessionDialog
        isOpen={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        onConfirmEnd={() => navigate("/")}
      />
    </section>
  );
}

/*
─────────────────────────────────────────
ANSWERS (read only after you've thought through the TODOs above)
─────────────────────────────────────────
exercises              → derived from the active split day's exercises: GET /api/splits (active split → today's split_day → split_day_exercises → exercises)
                         Each exercise gets template sets pre-filled from previous best weight/reps
currentExerciseIndex   → local state: useState(0)
splitDayName           → from active split's matching split_day.name (e.g. "Push Day")
previousBest           → GET /api/sets/best?exercise_id=X — returns max weight_kg and its reps for this exercise
handleLogSet           → POST /api/sets { session_id, exercise_id, weight_kg, reps, set_order }, then mark set.logged = true locally
handleNextExercise     → increment currentExerciseIndex; if last exercise, show CompletionScreen
handlePrevExercise     → decrement currentExerciseIndex
handleAddSet           → local state: push new SetRecord to current exercise's sets array
handleRemoveSet        → local state: splice set from current exercise's sets array (min 1 set)
handleSwapExercise     → open ExercisePicker in 'swap' mode; replace current exercise with selected one
handleAddExercise      → open ExercisePicker in 'add' mode; append new exercise to exercises array
handleEndSession       → show confirmation dialog; if confirmed, navigate back to home (optionally PATCH /api/sessions/:id to mark complete)
─────────────────────────────────────────
*/
