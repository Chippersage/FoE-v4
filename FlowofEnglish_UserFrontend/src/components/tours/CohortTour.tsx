// CohortTour.tsx
import React, { useEffect, useState } from "react";
import Joyride, { STATUS, Step, CallBackProps } from "react-joyride";
import CohortCustomTooltip from "./CohortCustomTooltip";

interface CohortTourProps {
  onResumeClick: () => void;
}

const CohortTour: React.FC<CohortTourProps> = ({ onResumeClick }) => {
  const [runTour, setRunTour] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setRunTour(true);
    }, 2000);
  }, []);

  const steps: Step[] = [
    {
      target: ".cohort-page-header",
      content: "Welcome! This is your cohort selection page.",
      disableBeacon: true,
    },
    {
      target: ".continue-learning-section",
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Continue Learning</h3>
          <p>
            This is your dashboard where you can access all your learning
            resources.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: ".program-card-first",
      content: "This card shows your program details and progress.",
      disableBeacon: true,
    },
    {
      target: ".daily-challenge-section",
      content:
        "Below are your Daily Challenges: Word of the Day and Daily Riddle.",
      disableBeacon: true,
    },
    {
      target: ".resume-button",
      content:
        "Click the Resume button of the program you want to proceed with. (You must click here to continue.)",
      spotlightClicks: true,
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;

    if (type === "step:after" || type === "error:target_not_found") {
      localStorage.setItem("tourStep", String(index + 1));
    }
    if (status === "finished" || status === "skipped") {
      setRunTour(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous={true}
      scrollToFirstStep={true}
      showSkipButton={false}
      disableCloseOnEsc={true}
      callback={handleJoyrideCallback}
      tooltipComponent={CohortCustomTooltip}
      styles={{
        options: {
          zIndex: 10000000,
          primaryColor: "#5BC3CD",
          backgroundColor: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
          textColor: "#1E293B",
          arrowColor: "#F8FAFC",
          overlayColor: "rgba(0, 0, 0, 0.5)",
        },
        beacon: {
          backgroundColor: "#5BC3CD",
          border: "2px solid #5BC3CD",
        },
      }}
    />
  );
};

export default CohortTour;
