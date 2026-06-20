import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Joyride, { STATUS, EVENTS } from "react-joyride";
import type { Step, CallBackProps } from "react-joyride";

export function ProductTour() {
    const location = useLocation();
    const [run, setRun] = useState(false);
    const [steps, setSteps] = useState<Step[]>([]);
    
    useEffect(() => {
        // We delay slightly to ensure DOM elements are painted
        const timer = setTimeout(() => {
            const isHome = location.pathname === "/";
            const isSplitsList = location.pathname === "/splits";
            const isSplitDetail = location.pathname.match(/^\/splits\/[a-zA-Z0-9-]+$/);

            const phase1Done = localStorage.getItem("tour_phase_1_done");
            const phase2Done = localStorage.getItem("tour_phase_2_done");

            if (isHome && !phase1Done) {
                setSteps([
                    {
                        target: "body",
                        content: "Welcome to IronLog! Let's get you set up with your first workout plan.",
                        placement: "center",
                        disableBeacon: true,
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
                setRun(true);
            } else if (isSplitsList && !phase2Done && phase1Done) {
                // If they have no splits yet, we point them to the NEW button
                setSteps([
                    {
                        target: ".tour-new-split",
                        content: "Tap 'NEW' to create and name your first split.",
                        placement: "bottom",
                        disableBeacon: true,
                    }
                ]);
                setRun(true);
            } else {
                setRun(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status) || type === EVENTS.TOUR_END) {
            setRun(false);
            if (location.pathname === "/") {
                localStorage.setItem("tour_phase_1_done", "true");
            } else if (location.pathname === "/splits") {
                localStorage.setItem("tour_phase_2_done", "true");
            }
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showProgress
            showSkipButton
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    arrowColor: '#1a1a1a',
                    backgroundColor: '#1a1a1a',
                    overlayColor: 'rgba(0, 0, 0, 0.85)',
                    primaryColor: '#FF5C00',
                    textColor: '#ffffff',
                    zIndex: 1000,
                },
                tooltipContainer: {
                    textAlign: "left",
                },
                buttonNext: {
                    backgroundColor: "#FF5C00",
                    color: "#ffffff",
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    borderRadius: "8px",
                    padding: "8px 16px"
                },
                buttonBack: {
                    color: "#888888",
                    marginRight: 10,
                },
                buttonSkip: {
                    color: "#888888",
                }
            }}
            locale={{
                last: location.pathname === "/" ? "Got it!" : "Let's Build",
                skip: "Skip Tour"
            }}
        />
    );
}
