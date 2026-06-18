import React from "react";

export interface InsightCard {
  accent: string;
  borderColor: string;
  iconBg: string;
  icon: string;
  title: string;
  body: string;
}

interface InsightsTabProps {
  heroInsight: InsightCard | null;
  secondaryInsights: InsightCard[];
}

export function InsightsTab({ heroInsight, secondaryInsights }: InsightsTabProps) {
  return (
    <div
      className="flex-1 overflow-y-auto pb-[90px]"
      id="panel-insights"
      role="tabpanel"
    >
      <div className="px-5 pt-4">
        {heroInsight ? (
          <>
            {/* Hero insight card */}
            <article
              className="bg-card rounded-[14px] p-[18px] mb-2.5 border border-border flex gap-3 items-start"
              style={{ borderLeftWidth: 3, borderLeftColor: heroInsight.accent }}
            >
              <div
                className="w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0 text-[15px]"
                style={{ background: heroInsight.iconBg }}
                aria-hidden="true"
              >
                {heroInsight.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-white mb-1.5 leading-snug">
                  {heroInsight.title}
                </h2>
                <p className="text-xs text-ghost leading-relaxed">
                  {heroInsight.body}
                </p>
              </div>
            </article>

            {/* Secondary insight cards */}
            {secondaryInsights.map((card, idx) => (
              <article
                key={idx}
                className="bg-card rounded-xl p-[14px_16px] mb-2 border border-border flex gap-3 items-start"
                style={{ borderLeftWidth: 3, borderLeftColor: card.accent }}
              >
                <div
                  className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center shrink-0 mt-[1px] text-[13px]"
                  style={{ background: card.iconBg }}
                  aria-hidden="true"
                >
                  {card.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-[13px] font-semibold text-dim mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-ghost leading-relaxed">
                    {card.body}
                  </p>
                </div>
              </article>
            ))}
          </>
        ) : (
          /* Empty insights state */
          <div className="flex flex-col items-center gap-3 pt-12 text-center">
            <div className="text-[40px] opacity-30 grayscale">🧠</div>
            <p className="font-display text-[26px] tracking-[1px] text-[#555555]">
              NO INSIGHTS YET
            </p>
            <p className="text-[13px] text-[#666666] leading-relaxed max-w-[240px]">
              Log a few sessions and your AI coach will start surfacing
              patterns, suggestions, and progress reports.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
