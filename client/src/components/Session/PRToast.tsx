import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface PRToastProps {
    exerciseName: string | null;
    weightKg: number | null;
    isBodyweight: boolean;
    onDismiss: () => void;
}

export function PRToast({ exerciseName, weightKg, isBodyweight, onDismiss }: PRToastProps) {
    const visible = exerciseName !== null && weightKg !== null;

    // Auto-dismiss after 3 seconds
    useEffect(() => {
        if (!visible) return;
        const t = setTimeout(onDismiss, 3000);
        return () => clearTimeout(t);
    }, [visible, exerciseName, weightKg, onDismiss]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key={`${exerciseName}-${weightKg}`}
                    initial={{ y: 120, opacity: 0, scale: 0.92 }}
                    animate={{ y: 0,   opacity: 1, scale: 1    }}
                    exit={{    y: 120, opacity: 0, scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none"
                    aria-live="polite"
                    role="status"
                >
                    <div className="flex items-center gap-3 bg-[#1a0800] border border-heat rounded-2xl px-5 py-3 shadow-2xl shadow-heat/20">
                        {/* Trophy icon */}
                        <span className="text-[22px] leading-none">🏆</span>

                        {/* Text */}
                        <div className="flex flex-col leading-tight">
                            <span className="text-[10px] tracking-[2px] uppercase font-semibold text-heat">
                                New PR
                            </span>
                            <span className="text-white font-display text-[16px] tracking-[0.5px] leading-snug">
                                {exerciseName}{" "}
                                <span className="text-heat">{isBodyweight && weightKg === 0 ? "BW" : `${weightKg} kg`}</span>
                            </span>
                        </div>

                        {/* Progress bar that drains over 3s */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-heat/20 rounded-b-2xl overflow-hidden">
                            <motion.div
                                className="h-full bg-heat rounded-b-2xl"
                                initial={{ scaleX: 1 }}
                                animate={{ scaleX: 0 }}
                                transition={{ duration: 3, ease: "linear" }}
                                style={{ originX: 0 }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
