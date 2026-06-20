import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { useSplitDetail } from "../hooks/useSplitDetail";
import { ChevronRight } from "lucide-react";

export function SplitDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { split, loading, error, updateSplitName } = useSplitDetail(id!);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");

    const handleSaveName = async () => {
        if (editName.trim() && editName.trim() !== split?.name) {
            await updateSplitName(editName.trim());
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <span className="text-white text-opacity-50 text-xs tracking-widest uppercase animate-pulse">Loading split...</span>
            </div>
        );
    }

    if (error || !split) {
        return (
            <div className="bg-bg min-h-screen text-white p-5 pt-20">
                <p className="text-[#e05252]">{error || "Split not found"}</p>
                <button 
                    onClick={() => navigate("/splits")}
                    className="mt-4 text-heat text-sm font-semibold tracking-wide"
                >
                    &larr; GO BACK
                </button>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-bg text-white font-body flex flex-col pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 px-5 py-[14px] bg-bg sticky top-0 z-20 shrink-0 border-b border-[#1f1f1f]">
                <button 
                    onClick={() => navigate("/splits")}
                    className="w-10 h-10 bg-[#161616] rounded-[10px] flex items-center justify-center text-[#888] cursor-pointer hover:bg-[#1f1f1f] transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="text-[10px] tracking-[2px] text-heat uppercase font-semibold">Split Builder</div>
                    {isEditing ? (
                        <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={handleSaveName}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                            className="font-display text-2xl tracking-[1px] m-0 leading-none bg-transparent border-none text-white outline-none w-full"
                        />
                    ) : (
                        <div 
                            className="flex items-center gap-2 group cursor-pointer" 
                            onClick={() => { setEditName(split.name); setIsEditing(true); }}
                        >
                            <h1 className="font-display text-2xl tracking-[1px] m-0 leading-none truncate">{split.name}</h1>
                            <Pencil size={14} className="text-[#888] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pt-6">
                <p className="text-[12px] text-ghost mb-6 leading-relaxed">
                    Tap a day to view or edit exercises.
                </p>

                {split.days.map((day, index) => {
                    const isRestDay = day.is_rest;
                    return (
                        <div
                            key={day.id}
                            onClick={() => {
                                if (index === 0) localStorage.setItem("tour_phase_3_done", "true");
                                navigate(`/splits/${split.id}/day/${day.id}`);
                            }}
                            className={`${index === 0 ? "tour-day-card" : ""} bg-[#1a1a1a] rounded-[14px] border border-[#1f1f1f] p-4 mb-3 flex items-center justify-between cursor-pointer hover:bg-raised transition-colors group`}
                        >
                            <div className="flex flex-col gap-1">
                                <div className="text-[10px] tracking-[2px] text-ghost uppercase font-semibold">
                                    Day {day.day_of_week + 1}
                                </div>
                                <h3 className="font-display text-[22px] text-white tracking-[1px] m-0">{day.label}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[12px] ${isRestDay ? 'text-[#888] italic' : 'text-heat font-medium'}`}>
                                    {isRestDay ? "Rest day" : `${day.exercises?.length || 0} exercises`}
                                </span>
                                <ChevronRight size={18} className="text-dim group-hover:text-white transition-colors" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
