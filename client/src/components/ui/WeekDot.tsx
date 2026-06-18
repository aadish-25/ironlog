type WeekDotProps = {
  type: "done" | "rest" | "today" | "future";
};

export function WeekDot({ type }: WeekDotProps) {
  const base = "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200";
  if (type === "done") {
    return (
      <div className={`${base} bg-heat`}>
        <div className="w-2 h-2 rounded-full bg-white/25" />
      </div>
    );
  }
  if (type === "today") {
    return (
      <div className={`${base} bg-transparent border-2 border-white`}>
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
    );
  }
  if (type === "rest") {
    return (
      <div className={`${base} bg-raised border border-border`} />
    );
  }
  // future
  return (
    <div className={`${base} bg-transparent border-2 border-border`} />
  );
}