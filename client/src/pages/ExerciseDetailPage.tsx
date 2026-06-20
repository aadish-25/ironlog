import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
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
        if (id) {
            fetchExerciseById(id);
            fetchExerciseProgress(id);
        }
    }, [id, fetchExerciseById, fetchExerciseProgress]);

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

            <div className="flex-1">
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
                        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-4 h-[180px] relative block overflow-hidden [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_svg]:outline-none" style={{ WebkitTapHighlightColor: 'transparent' }}>
                            {filteredProgress.length > 0 ? (() => {
                                let chartData = filteredProgress.map(p => ({
                                    date: formatDate(p.session_date),
                                    val: chartAxis === "weight" ? p.max_weight : p.total_volume,
                                    isPr: p.pr_hit,
                                    rawDate: p.session_date
                                }));

                                // Dynamic grouping logic (Optimized for ~20-30 points max per view)
                                let groupDays = 1;
                                if (timeRange === "3M") groupDays = 3;
                                else if (timeRange === "6M") groupDays = 7;
                                else if (timeRange === "1Y") groupDays = 14;

                                if (groupDays > 1) {
                                    const groupedData = new Map();
                                    chartData.forEach(d => {
                                        const date = new Date(d.rawDate);
                                        // Calculate the epoch day index for bucketing
                                        const dayIndex = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
                                        const bucketStart = dayIndex - (dayIndex % groupDays);
                                        
                                        if (!groupedData.has(bucketStart)) {
                                            groupedData.set(bucketStart, { ...d });
                                        } else {
                                            const existing = groupedData.get(bucketStart);
                                            // Keep the highest peak in this time bucket
                                            if (d.val > existing.val) {
                                                existing.val = d.val;
                                                existing.isPr = existing.isPr || d.isPr;
                                                existing.date = d.date; // Use date of the peak
                                            }
                                        }
                                    });
                                    // Map back to array and ensure chronological order
                                    chartData = Array.from(groupedData.entries())
                                        .sort((a, b) => a[0] - b[0])
                                        .map(entry => entry[1]);
                                }

                                return (
                                <ResponsiveContainer width="100%" height={148}>
                                    <AreaChart
                                        data={chartData}
                                        margin={{ top: 5, right: 0, left: -25, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#e8460a" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#e8460a" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis 
                                            dataKey="date" 
                                            stroke="#444" 
                                            fontSize={10} 
                                            tickLine={false} 
                                            axisLine={false}
                                            minTickGap={20}
                                        />
                                        <YAxis 
                                            stroke="#444" 
                                            fontSize={10} 
                                            tickLine={false} 
                                            axisLine={false}
                                            domain={['dataMin', 'dataMax']}
                                        />
                                        <RechartsTooltip 
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-[#111] border border-[#333] rounded-md p-2 text-white shadow-xl">
                                                            <div className="text-[10px] text-[#888] mb-1">{label}</div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-display text-[16px] text-white">
                                                                    {data.val} kg
                                                                </span>
                                                                {data.isPr && chartAxis === "weight" && (
                                                                    <span className="text-[9px] bg-[#2a0f00] text-heat px-1.5 py-0.5 rounded font-bold border border-heat">PR</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="val" 
                                            stroke="#e8460a" 
                                            strokeWidth={2}
                                            fillOpacity={1} 
                                            fill="url(#colorVal)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                                );
                            })() : (
                                <div className="absolute inset-0 flex items-center justify-center text-[11px] text-[#444] uppercase tracking-[2px]">
                                    Not enough data
                                </div>
                            )}
                        </div>

                        {/* Past Sessions List */}
                        <div className="text-[10px] tracking-[2px] text-[#333] uppercase mb-[10px]">Past Sessions (Last 7 Days)</div>
                        
                        {(() => {
                            const pastWeekSessions = progress.filter(p => {
                                const d = new Date(p.session_date);
                                const diffDays = (new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
                                return diffDays <= 7;
                            });

                            if (pastWeekSessions.length === 0) {
                                return (
                                    <div className="flex flex-col items-center gap-3 p-[40px_20px] text-center">
                                        <div className="w-[60px] h-[60px] bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-[26px] text-[#2a2a2a]">&#128170;</div>
                                        <div className="font-display text-[22px] tracking-[1px] text-[#333]">NO RECENT SESSIONS</div>
                                        <div className="text-[12px] text-[#2a2a2a] leading-[1.6] max-w-[200px]">Log this exercise in a workout session to build your history.</div>
                                    </div>
                                );
                            }

                            return (
                                <div className="flex flex-col gap-2">
                                    {pastWeekSessions.map((p, idx) => {
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
                        );
                    })()}
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}
