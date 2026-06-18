// ─── Muscle badge colour map ──────────────────────────────────────────────────
const BADGE_COLORS: Record<string, { bg: string; text: string; abbr: string }> = {
  Chest:     { bg: "bg-[#2a1010]", text: "text-[#c0392b]", abbr: "CH" },
  Back:      { bg: "bg-[#0f1f3a]", text: "text-[#2a7abf]", abbr: "BA" },
  Shoulders: { bg: "bg-[#1e1028]", text: "text-[#8e44ad]", abbr: "SH" },
  Biceps:    { bg: "bg-[#0a2020]", text: "text-[#1abc9c]", abbr: "BI" },
  Triceps:   { bg: "bg-[#0d1f0d]", text: "text-[#27ae60]", abbr: "TR" },
  Legs:      { bg: "bg-[#1f1800]", text: "text-[#b8860b]", abbr: "LE" },
  Calves:    { bg: "bg-[#1f0f00]", text: "text-[#c0614a]", abbr: "CA" },
  Abs:       { bg: "bg-[#141a20]", text: "text-[#6a8aaa]", abbr: "AB" },
};

export function MuscleBadge({ muscle }: { muscle: string }) {
  const badge = BADGE_COLORS[muscle] ?? {
    bg: "bg-card",
    text: "text-ghost",
    abbr: "??",
  };

  return (
    <div
      className={`w-[34px] h-[34px] rounded-lg ${badge.bg} flex items-center justify-center text-[10px] font-bold ${badge.text} shrink-0`}
      aria-label={muscle}
    >
      {badge.abbr}
    </div>
  );
}
