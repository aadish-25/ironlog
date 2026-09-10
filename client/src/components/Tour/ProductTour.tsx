import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Joyride, STATUS, EVENTS } from "react-joyride";
import type { Step, EventData, TooltipRenderProps } from "react-joyride";
import { useSplit } from "../../hooks/useSplit";

const CustomTooltip = ({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) => {
  return (
    <div
      {...tooltipProps}
      className="bg-card border border-border rounded-2xl p-5 max-w-[320px] font-body shadow-2xl z-1000"
    >
      {step.title && (
        <h3 className="font-display text-lg text-white mb-2 uppercase tracking-[1px]">{step.title}</h3>
      )}
      <div className="text-dim text-[13px] leading-relaxed mb-5">
        {step.content}
      </div>
      
      <div className="flex items-center justify-between">
        <button
          {...closeProps}
          className="text-[11px] text-ghost hover:text-white uppercase tracking-[1px] transition-colors"
        >
          Skip
        </button>
        <div className="flex gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className="px-3 py-1.5 rounded-lg border border-border text-dim text-[11px] font-semibold uppercase tracking-[1px] hover:bg-raised transition-colors cursor-pointer"
            >
              Back
            </button>
          )}
          <button
            {...primaryProps}
            className="px-4 py-1.5 rounded-lg bg-heat text-white font-display text-[12px] uppercase tracking-[2px] hover:opacity-90 transition-opacity cursor-pointer border-none"
          >
            {isLastStep ? "GOT IT" : "NEXT"}
          </button>
        </div>
      </div>
    </div>
  );
};

export function ProductTour() {
    const location = useLocation();
    const { splits, loading: splitsLoading } = useSplit();
    const [run, setRun] = useState(false);
    const [steps, setSteps] = useState<Step[]>([]);
    
    useEffect(() => {
        if (splitsLoading) return;

        const isHome = location.pathname === "/";
        const isSplitsList = location.pathname === "/splits";
        const isSplitDetail = location.pathname.match(/^\/splits\/[a-zA-Z0-9-]+$/);

        const isManuallyTriggered = sessionStorage.getItem("tour_manually_triggered") === "true";
        const hasExistingSplits = splits && splits.length > 0;

        // If user is an existing lifter (already has splits) and didn't manually request the tour, do not run
        if (hasExistingSplits && !isManuallyTriggered) {
            setRun(false);
            return;
        }

        const phase1Done = localStorage.getItem("tour_phase_1_done");
        const phase2Done = localStorage.getItem("tour_phase_2_done");
        const phase3Done = localStorage.getItem("tour_phase_3_done");

        const startTourWhenReady = (selector: string, stepsToRun: Step[]) => {
            const checkAndRun = () => {
                if (document.querySelector(selector)) {
                    setSteps(stepsToRun);
                    setRun(true);
                    return true;
                }
                return false;
            };

            if (!checkAndRun()) {
                const observer = new MutationObserver(() => {
                    if (checkAndRun()) {
                        observer.disconnect();
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
                return () => observer.disconnect();
            }
        };

        if (isHome && (!phase1Done || isManuallyTriggered)) {
            return startTourWhenReady(".tour-profile", [
                {
                    target: "body",
                    content: "Welcome to IronLog! Let's get you set up with your first workout plan.",
                    placement: "center",
                    skipBeacon: true,
                },
                {
                    target: ".tour-profile",
                    content: "This is your profile. You can check your stats and adjust settings here.",
                    placement: "bottom",
                },
                {
                    target: ".tour-create-split",
                    content: "Start your journey right here. Tap this to build your first split!",
                    placement: "top",
                }
            ]);
        } else if (isSplitsList && (!phase2Done || isManuallyTriggered)) {
            return startTourWhenReady(".tour-new-split", [
                {
                    target: "body",
                    content: "You made it! This is where all your workout programs live.",
                    placement: "center",
                    skipBeacon: true,
                },
                {
                    target: ".tour-new-split",
                    content: "Tap 'NEW' to create and name your first split.",
                    placement: "bottom",
                    skipBeacon: true,
                }
            ]);
        } else if (isSplitDetail && (!phase3Done || isManuallyTriggered)) {
            return startTourWhenReady(".tour-day-card", [
                {
                    target: "body",
                    content: "Awesome! Your 7-day split has been generated.",
                    placement: "center",
                    skipBeacon: true,
                },
                {
                    target: ".tour-day-card",
                    content: "Tap on a day to assign muscles, add exercises, or mark it as a Rest Day.",
                    placement: "bottom",
                    skipBeacon: true,
                }
            ]);
        } else {
            setRun(false);
        }
    }, [location.pathname, splits, splitsLoading]);

    const handleJoyrideCallback = (data: EventData) => {
        const { status, type } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status) || type === EVENTS.TOUR_END) {
            setRun(false);
            if (location.pathname === "/") {
                localStorage.setItem("tour_phase_1_done", "true");
            } else if (location.pathname === "/splits") {
                localStorage.setItem("tour_phase_2_done", "true");
            } else if (location.pathname.match(/^\/splits\/[a-zA-Z0-9-]+$/)) {
                localStorage.setItem("tour_phase_3_done", "true");
                sessionStorage.removeItem("tour_manually_triggered");
            }
        }
    };

    return (
        <Joyride
            key={location.pathname}
            steps={steps}
            run={run}
            continuous
            tooltipComponent={CustomTooltip}
            onEvent={handleJoyrideCallback}
            options={{
                arrowColor: '#121212',
                overlayColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 1000,
                showProgress: true,
                buttons: ['back', 'close', 'primary', 'skip'],
            }}
        />
    );
}

