import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExercises } from "../hooks/useExercises";

export function ExerciseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { 
        exercise, 
        progress, 
        loading, 
        error, 
        fetchExerciseById, 
        fetchExerciseProgress 
    } = useExercises();

    const [activeTab, setActiveTab] = useState<"info" | "records">("info");
    const [chartAxis, setChartAxis] = useState<"weight" | "volume">("weight");
    const [timeRange, setTimeRange] = useState<"1W" | "1M" | "3M" | "6M" | "1Y">("1M");
    const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set());

    useEffect(() => {
        window.scrollTo(0, 0);
        if (id) {
            fetchExerciseById(id);
            fetchExerciseProgress(id);
        }
    }, [id]);

    if (loading && !exercise) {
        return (
            <div className="bg-bg min-h-screen flex items-center justify-center">
                <span className="text-white text-opacity-50 text-xs tracking-widest uppercase animate-pulse">Loading exercise...</span>
            </div>
        );
    }

    if (error || (!loading && !exercise)) {
        return (
            <div className="bg-bg min-h-screen text-white p-5 pt-20">
                <p className="text-[#e05252]">{error || "Exercise not found"}</p>
                <button 
                    onClick={() => navigate(-1)}
                    className="mt-4 text-heat text-sm font-semibold tracking-wide"
                >
                    &larr; GO BACK
                </button>
            </div>
        );
    }

    const toggleSession = (idx: number) => {
        setExpandedSessions(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    const maxPr = progress.length > 0 
        ? progress.reduce((max, p) => (p.max_weight > max.max_weight ? p : max), progress[0])
        : null;

    const filteredProgress = progress.filter(p => {
        const d = new Date(p.session_date);
        const diffMs = new Date().getTime() - d.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        switch (timeRange) {
            case "1W": return diffDays <= 7;
            case "1M": return diffDays <= 31;
            case "3M": return diffDays <= 93;
            case "6M": return diffDays <= 183;
            case "1Y": return diffDays <= 365;
            default: return true;
        }
    });

    // Helper for formatting date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="min-h-screen bg-bg text-white font-body flex flex-col pb-24">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-5 py-[14px] bg-bg sticky top-0 z-20 shrink-0">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-[#161616] rounded-[10px] flex items-center justify-center text-[18px] text-[#888] cursor-pointer hover:bg-[#1f1f1f] transition-colors"
                >
                    &#8592;
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Detail Hero */}
                <div className="px-5 pb-6">
                    <div className="bg-[#141414] rounded-[16px] h-[220px] flex items-center justify-center mb-5 border border-[#1f1f1f] relative overflow-hidden">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-[50px] h-[50px] bg-[#1a1a1a] rounded-full flex items-center justify-center text-[20px] text-[#444] pl-1">
                                &#9658;
                            </div>
                            <div className="text-[13px] text-[#333] font-medium tracking-wide">Exercise demo loading...</div>
                        </div>
                        <div className="absolute top-[12px] right-[12px] bg-[#1a1a1a] border border-[#222] rounded-lg px-[8px] py-[4px] text-[10px] font-medium text-[#555] tracking-[1px] uppercase">
                            GIF
                        </div>
                    </div>
                    
                    <h1 className="font-display text-[44px] tracking-[1.5px] text-white leading-none mb-3 uppercase">
                        {exercise?.name}
                    </h1>
                    
                    <div className="flex gap-[8px] flex-wrap mb-2">
                        {exercise?.muscles?.map((muscle, idx) => (
                            <span key={`muscle-${idx}`} className="px-[14px] py-[6px] rounded-lg bg-[#141414] text-[#777] text-[12px] font-medium tracking-wide capitalize border border-[#222]">
                                {muscle}
                            </span>
                        ))}
                        {exercise?.equipments?.map((equipment, idx) => (
                            <span key={`equipment-${idx}`} className="px-[14px] py-[6px] rounded-lg bg-[#141414] text-[#777] text-[12px] font-medium tracking-wide capitalize border border-[#222]">
                                {equipment}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#1f1f1f] shrink-0 mx-5">
                    <div 
                        onClick={() => setActiveTab("info")}
                        className={`flex-1 p-[14px] text-center text-[14px] font-medium cursor-pointer border-b-2 tracking-wide transition-colors ${activeTab === "info" ? "text-heat border-heat" : "text-[#444] border-transparent"}`}
                    >
                        Info
                    </div>
                    <div 
                        onClick={() => setActiveTab("records")}
                        className={`flex-1 p-[14px] text-center text-[14px] font-medium cursor-pointer border-b-2 tracking-wide transition-colors ${activeTab === "records" ? "text-heat border-heat" : "text-[#444] border-transparent"}`}
                    >
                        My Records
                    </div>
                </div>

                <div className="px-5 pt-6">
                    {activeTab === "info" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {exercise?.formGuide && exercise.formGuide.length > 0 ? (
                            <>
                                <div className="text-[11px] tracking-[2.5px] text-[#444] uppercase mb-5 font-medium">Form Guide</div>
                                {exercise.formGuide.map((step, idx) => (
                                    <div key={`step-${idx}`} className="flex gap-[14px] mb-[18px]">
                                        <div className="w-[24px] h-[24px] rounded-full bg-heat flex items-center justify-center text-[12px] font-bold text-white shrink-0 mt-[2px]">{step.step || idx + 1}</div>
                                        <div className="text-[15px] text-[#999] leading-relaxed">{step.instruction}</div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="text-[13px] text-[#666] italic mb-6">No form guide available for this exercise.</div>
                        )}
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* PR Hero */}
                        {maxPr ? (
                            <div className="bg-[#1a1a1a] rounded-[14px] p-4 mb-4 flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] tracking-[2px] text-[#444] uppercase mb-1">All-time PR</div>
                                    <div className="font-display text-[42px] text-white tracking-[1px] leading-none">{maxPr.max_weight} kg</div>
                                    <div className="text-[11px] text-[#555] mt-[3px]">Set on {formatDate(maxPr.session_date)}</div>
                                </div>
                                <div className="bg-[#2a0f00] border border-heat rounded-lg px-3 py-1.5 font-display text-[14px] text-heat tracking-[1px]">ALL-TIME PR</div>
                            </div>
                        ) : (
                            <div className="bg-[#1a1a1a] rounded-[14px] p-4 mb-4 flex items-center justify-between opacity-50">
                                <div>
                                    <div className="text-[10px] tracking-[2px] text-[#444] uppercase mb-1">All-time PR</div>
                                    <div className="font-display text-[42px] text-white tracking-[1px] leading-none">-- kg</div>
                                </div>
                            </div>
                        )}

                        {/* Chart Controls */}
                        <div className="mb-[14px]">
                            <div className="flex bg-[#1a1a1a] rounded-lg border border-[#222] overflow-hidden mb-[10px]">
                                <button 
                                    onClick={() => setChartAxis("weight")}
                                    className={`flex-1 p-[9px] text-[12px] font-body text-center ${chartAxis === "weight" ? "bg-heat text-white" : "text-[#444] bg-transparent"}`}
                                >
                                    Max Weight
                                </button>
                                <button 
                                    onClick={() => setChartAxis("volume")}
                                    className={`flex-1 p-[9px] text-[12px] font-body text-center ${chartAxis === "volume" ? "bg-heat text-white" : "text-[#444] bg-transparent"}`}
                                >
                                    Volume
                                </button>
                            </div>
                            <div className="flex gap-[6px] mt-2">
                                {["1W", "1M", "3M", "6M", "1Y"].map((t) => (
                                    <button 
                                        key={t}
                                        onClick={() => setTimeRange(t as any)}
                                        className={`flex-1 p-[7px_4px] rounded-[7px] text-[11px] text-center font-body border ${timeRange === t ? "bg-[#1a0800] border-heat text-heat" : "bg-[#1a1a1a] border-[#1f1f1f] text-[#444]"}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chart Wrap */}
                        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-4 h-[160px] relative overflow-hidden flex flex-col">
                            {filteredProgress.length > 0 ? (() => {
                                const data = filteredProgress.map(p => chartAxis === "weight" ? p.max_weight : p.total_volume);
                                const maxVal = Math.max(...data, 1);
                                const minVal = Math.min(...data, 0);
                                const range = maxVal - minVal || 1;
                                
                                const width = 300;
                                const height = 90;
                                const padY = 20;
                                const padX = 4;
                                
                                const points = data.map((val, i) => {
                                    const x = data.length === 1 
                                        ? width / 2 
                                        : padX + (i / (data.length - 1)) * (width - 2 * padX);
                                    const y = height + padY - ((val - minVal) / range) * height;
                                    return `${x},${y}`;
                                });
                                
                                const pathD = `M${points.join(' L')}`;
                                const fillD = `M${points[0].split(',')[0]},130 L${points.join(' L')} L${points[points.length-1].split(',')[0]},130 Z`;
                                
                                return (
                                    <div className="flex-1 relative w-full h-full">
                                        {/* Y-axis Labels */}
                                        <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-[9px] text-[#555] font-display z-10 pointer-events-none">
                                            <span>{Math.round(maxVal)}</span>
                                            <span>{Math.round(minVal + range / 2)}</span>
                                            <span>{Math.round(minVal)}</span>
                                        </div>
                                        <div className="absolute right-0 top-0 text-[9px] text-heat font-medium pointer-events-none bg-[#1a1a1a] px-1 rounded-bl-md">
                                            {chartAxis === "weight" ? "MAX KG" : "VOL KG"}
                                        </div>
                                        <svg width="100%" height="100%" viewBox="0 0 300 130" preserveAspectRatio="none" className="pl-[20px]">
                                            <defs>
                                                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#e8460a" stopOpacity=".25"/>
                                                    <stop offset="100%" stopColor="#e8460a" stopOpacity="0"/>
                                                </linearGradient>
                                            </defs>
                                            <line x1="0" y1={padY} x2="300" y2={padY} stroke="#1f1f1f" strokeWidth="1"/>
                                            <line x1="0" y1={padY + height/2} x2="300" y2={padY + height/2} stroke="#1f1f1f" strokeWidth="1"/>
                                            <line x1="0" y1={padY + height} x2="300" y2={padY + height} stroke="#1f1f1f" strokeWidth="1"/>
                                            
                                            <path d={fillD} fill="url(#cg)"/>
                                            <path d={pathD} fill="none" stroke="#e8460a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            
                                            {points.map((p, i) => (
                                                <circle key={i} cx={p.split(',')[0]} cy={p.split(',')[1]} r="3" fill="#e8460a"/>
                                            ))}
                                            
                                            {/* X-axis labels */}
                                            {filteredProgress.length > 1 && (
                                                <>
                                                    <text x={points[0].split(',')[0]} y="125" fill="#555" fontSize="9" fontFamily="system-ui" textAnchor="start">
                                                        {formatDate(filteredProgress[0].session_date)}
                                                    </text>
                                                    <text x={points[points.length-1].split(',')[0]} y="125" fill="#555" fontSize="9" fontFamily="system-ui" textAnchor="end">
                                                        {formatDate(filteredProgress[filteredProgress.length-1].session_date)}
                                                    </text>
                                                </>
                                            )}
                                        </svg>
                                    </div>
                                );
                            })() : (
                                <div className="absolute inset-0 flex items-center justify-center text-[11px] text-[#444] uppercase tracking-[2px]">
                                    Not enough data
                                </div>
                            )}
                        </div>

                        {/* Past Sessions List */}
                        <div className="text-[10px] tracking-[2px] text-[#333] uppercase mb-[10px]">Past Sessions</div>
                        
                        {progress.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 p-[40px_20px] text-center">
                                <div className="w-[60px] h-[60px] bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-[26px] text-[#2a2a2a]">&#128170;</div>
                                <div className="font-display text-[22px] tracking-[1px] text-[#333]">NO RECORDS YET</div>
                                <div className="text-[12px] text-[#2a2a2a] leading-[1.6] max-w-[200px]">Log this exercise in a workout session to start building your history.</div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {progress.map((p, idx) => {
                                    const isOpen = expandedSessions.has(idx);
                                    return (
                                        <div key={idx} className="bg-[#1a1a1a] rounded-[10px] p-[12px_14px] border border-[#1f1f1f]">
                                            <div 
                                                className="flex items-center justify-between cursor-pointer"
                                                onClick={() => toggleSession(idx)}
                                            >
                                                <div className="text-[12px] text-[#666]">
                                                    {formatDate(p.session_date)}
                                                </div>
                                                <div className="flex items-center gap-[8px]">
                                                    <div className="font-display text-[18px] text-white tracking-[1px]">{p.max_weight} kg</div>
                                                    <div className={`text-[14px] text-[#333] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▾</div>
                                                </div>
                                            </div>

                                            {isOpen && (
                                                <div className="mt-[10px] pt-[10px] border-t border-[#1f1f1f] animate-in slide-in-from-top-2 duration-200">
                                                    <div className="flex justify-between py-[5px]">
                                                        <div className="text-[11px] text-[#444] tracking-[1px] uppercase">Session Vol</div>
                                                        <div className="font-display text-[15px] text-[#888] tracking-[1px]">{p.total_volume} kg</div>
                                                    </div>
                                                    <div className="flex justify-between py-[5px]">
                                                        <div className="text-[11px] text-[#444] tracking-[1px] uppercase">Status</div>
                                                        <div className={`font-display text-[15px] tracking-[1px] ${p.pr_hit ? "text-heat" : "text-[#888]"}`}>
                                                            {p.pr_hit ? "PR HIT" : "COMPLETED"}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}
