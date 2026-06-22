import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { useSet } from "../hooks/useSet";
import { EmptySessionState } from "../components/Session/EmptySessionState";
import { SessionHeader } from "../components/Session/SessionHeader";
import { ExerciseView } from "../components/Session/ExerciseView";
import { BottomNav } from "../components/Session/BottomNav";
import { ExercisePicker } from "../components/Session/ExercisePicker";
import { CompletionScreen } from "../components/Session/CompletionScreen";
import { AllExercisesSheet } from "../components/Session/AllExercisesSheet";
import { EndSessionDialog } from "../components/Session/EndSessionDialog";
import { SessionSummary } from "../components/Session/SessionSummary";
import { PRToast } from "../components/Session/PRToast";
import type { SessionExercise } from "../types";

export function SessionPage() {
    const navigate = useNavigate();

    const { id: sessionId } = useParams();
    const {
        session,
        exercises,
        setExercises,
        currentExerciseIndex,
        setCurrentExerciseIndex,
        loading,
        completeUserSession
    } = useSession(sessionId || null);

    const { addUserSet, saveUserSet, removeUserSet } = useSet(setExercises);

    // ─── OVERLAY STATE ──────────────────────────────────────────────────────────
    const [pickerMode, setPickerMode] = useState<"add" | "swap" | null>(null);
    const [showAllExercises, setShowAllExercises] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [showCompletionOverride, setShowCompletionOverride] = useState<boolean | null>(null);
    const [showSummary, setShowSummary] = useState(false);

    // ─── PR TOAST STATE ─────────────────────────────────────────────────────────
    const [prToast, setPrToast] = useState<{ name: string; weight: number; isBodyweight: boolean } | null>(null);
    const dismissPrToast = useCallback(() => setPrToast(null), []);

    const splitDayName = session?.split_day_label ?? null;

    // ─── COMPUTED VALUES ────────────────────────────────────────────────────────
    const currentExercise = exercises[currentExerciseIndex] ?? null;
    const previousBest = currentExercise?.previous_best ?? null;
    const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0);
    const completedSets = exercises.reduce(
        (n, e) => n + e.sets.filter((s) => s.is_logged).length,
        0,
    );
    const progressPercent =
        totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

    // ─── EVENT HANDLERS ─────────────────────────────────────────────────────────
    const handleLogSet = async (index: number) => {
        if (!session || !currentExercise) return;
        const targetSet = currentExercise.sets[index];
        const result = await saveUserSet(
            session.id,
            currentExercise.exercise_id,
            targetSet.id,
            targetSet.set_number,
            targetSet.weight,
            targetSet.reps,
        );

        if (result) {
            // Fire PR toast if backend flagged this set as a new personal record
            const isPR = (result as any).is_pr ?? result.pr_hit;
            if (isPR) {
                setPrToast({ name: currentExercise.name, weight: targetSet.weight, isBodyweight: currentExercise.is_bodyweight ?? false });
            }

            // Auto-advance when all sets for this exercise are logged
            const loggedCount = currentExercise.sets.filter((s) => s.is_logged).length;
            if (loggedCount + 1 >= currentExercise.sets.length) {
                if (currentExerciseIndex < exercises.length - 1) {
                    setTimeout(() => handleNextExercise(), 500);
                }
            }
        }
    };

    const handleNextExercise = () => {
        if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex((prev) => prev + 1);
        }
    };

    const handleFinishWorkoutClick = async () => {
        if (session && !session.is_completed) {
            await completeUserSession(session.id);
        }
        setShowCompletionOverride(true);
    };

    const handleHeaderFinishRequest = () => {
        if (completedSets < totalSets) {
            setShowEndConfirm(true);
        } else {
            handleFinishWorkoutClick();
        }
    };

    const handlePrevExercise = () => {
        setCurrentExerciseIndex((prev) => Math.max(0, prev - 1));
    };

    const handleAddSet = () => {
        if (currentExercise) {
            addUserSet(currentExercise.exercise_id);
        }
    };

    const handleRemoveSet = (index: number) => {
        if (currentExercise) {
            const setId = currentExercise.sets[index].id;
            removeUserSet(currentExercise.exercise_id, setId);
        }
    };

    const handleWeightChange = (index: number, val: number) => {
        if (!currentExercise) return;
        setExercises((prev) =>
            prev.map((ex) => {
                if (ex.exercise_id === currentExercise.exercise_id) {
                    const newSets = [...ex.sets];
                    newSets[index] = { ...newSets[index], weight: val };
                    
                    // Propagate downwards to unlogged sets
                    for (let i = index + 1; i < newSets.length; i++) {
                        if (!newSets[i].is_logged) {
                            newSets[i] = { ...newSets[i], weight: val };
                        }
                    }
                    
                    return { ...ex, sets: newSets };
                }
                return ex;
            }),
        );
    };

    const handleRepChange = (index: number, val: number) => {
        if (!currentExercise) return;
        setExercises((prev) =>
            prev.map((ex) => {
                if (ex.exercise_id === currentExercise.exercise_id) {
                    const newSets = [...ex.sets];
                    newSets[index] = { ...newSets[index], reps: val };
                    
                    // Propagate downwards to unlogged sets
                    for (let i = index + 1; i < newSets.length; i++) {
                        if (!newSets[i].is_logged) {
                            newSets[i] = { ...newSets[i], reps: val };
                        }
                    }
                    
                    return { ...ex, sets: newSets };
                }
                return ex;
            }),
        );
    };

    const handleEditSet = (index: number) => {
        if (!currentExercise) return;
        setExercises((prev) =>
            prev.map((ex) => {
                if (ex.exercise_id === currentExercise.exercise_id) {
                    const newSets = [...ex.sets];
                    newSets[index] = { ...newSets[index], is_logged: false };
                    return { ...ex, sets: newSets };
                }
                return ex;
            }),
        );
    };

    const handleAddExerciseToSession = (id: string, name: string, is_bodyweight: boolean) => {
        const newEx: SessionExercise = {
            id: `temp-ex-${Date.now()}`,
            exercise_id: id,
            name,
            sets: [],
            muscles: [],
            is_bodyweight
        };
        setExercises((prev) => [...prev, newEx]);
        setPickerMode(null);
        // Switch to the newly added exercise
        setCurrentExerciseIndex(exercises.length);
    };

    const handleSwapExerciseInSession = (id: string, name: string, is_bodyweight: boolean) => {
        setExercises((prev) =>
            prev.map((ex, i) =>
                i === currentExerciseIndex ? { ...ex, exercise_id: id, name, sets: [], is_bodyweight } : ex
            )
        );
        setPickerMode(null);
    };

    const handleSwapExerciseClick = () => setPickerMode("swap");
    const handleAddExerciseClick = () => setPickerMode("add");

    const handleEndSession = () => navigate("/");

    const handleConfirmFinishEarly = async () => {
        if (session && !session.is_completed) {
            await completeUserSession(session.id);
        }
        setShowCompletionOverride(true);
        setShowEndConfirm(false);
    };

    const handleGoHome = () => navigate("/");

    // ─── LOADING STATE ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="bg-bg min-h-screen text-ink font-body flex items-center justify-center">
                <span className="text-white text-opacity-50 tracking-widest text-xs uppercase animate-pulse">
                    Loading session...
                </span>
            </div>
        );
    }

    // ─── EMPTY STATE ────────────────────────────────────────────────────────────
    if (exercises.length === 0) {
        return (
            <EmptySessionState
                onBack={() => navigate("/")}
                onCreateSplit={() => navigate("/splits")}
            />
        );
    }

    const showCompletion = showCompletionOverride ?? session?.is_completed ?? false;

    if (showCompletion) {
        return (
            <CompletionScreen
                splitDayName={splitDayName}
                exercises={exercises}
                onComplete={handleGoHome}
                onBackToWorkout={() => {
                    setShowCompletionOverride(false);
                    setShowSummary(true);
                }}
            />
        );
    }

    if (showSummary) {
        return (
            <SessionSummary
                splitDayName={splitDayName}
                exercises={exercises}
                onBack={() => setShowCompletionOverride(true)}
                onEdit={() => setShowSummary(false)}
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
                onFinishWorkout={handleHeaderFinishRequest}
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
                    onWeightChange={handleWeightChange}
                    onRepChange={handleRepChange}
                    onEditSet={handleEditSet}
                    onViewAllExercises={() => setShowAllExercises(true)}
                />
            )}


            {/* ── Bottom navigation bar ── */}
            <BottomNav
                currentExerciseIndex={currentExerciseIndex}
                totalExercises={exercises.length}
                activeSetsLogged={
                    currentExercise?.sets.filter((s) => s.is_logged).length ?? 0
                }
                activeSetsTotal={currentExercise?.sets.length ?? 0}
                sessionSetsLogged={completedSets}
                onSwapExercise={handleSwapExerciseClick}
                onAddExercise={handleAddExerciseClick}
                onPrevExercise={handlePrevExercise}
                onNextExercise={handleNextExercise}
                onFinishWorkout={handleFinishWorkoutClick}
            />

            {/* ── Overlays ── */}
            <ExercisePicker
                isOpen={pickerMode !== null}
                mode={pickerMode}
                currentName={currentExercise?.name ?? null}
                existingExercises={exercises.map(e => e.name)}
                onClose={() => setPickerMode(null)}
                onAdd={handleAddExerciseToSession}
                onSwap={handleSwapExerciseInSession}
            />

            <AllExercisesSheet
                isOpen={showAllExercises}
                onClose={() => setShowAllExercises(false)}
                exercises={exercises}
                currentExerciseIndex={currentExerciseIndex}
                onSelectExercise={(idx) => {
                    setCurrentExerciseIndex(idx);
                    setShowAllExercises(false);
                }}
            />

            <EndSessionDialog
                isOpen={showEndConfirm}
                onClose={() => setShowEndConfirm(false)}
                onConfirmEnd={handleConfirmFinishEarly}
            />

            {/* ── PR Toast ── */}
            <PRToast
                exerciseName={prToast?.name ?? null}
                weightKg={prToast?.weight ?? null}
                isBodyweight={prToast?.isBodyweight ?? false}
                onDismiss={dismissPrToast}
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
