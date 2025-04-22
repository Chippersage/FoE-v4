// CohortTour.tsx
import * as React from "react";
import { useEffect, useState } from "react";
import Joyride, { STATUS, Step, CallBackProps } from "react-joyride";
import CohortCustomTooltip from "./CohortCustomTooltip";

interface CohortTourProps {
  onResumeClick: () => void;
  firstCohortProgress?: number;
}

const CohortTour: React.FC<CohortTourProps> = ({
  onResumeClick,
  firstCohortProgress,
}: CohortTourProps) => {
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Check if tour has been shown in this session
    const hasSeenTour = sessionStorage.getItem("hasSeenCohortTour");

    if (!hasSeenTour) {
      setTimeout(() => {
        setRunTour(true);
      }, 2000);
    }
  }, []);

  const steps: Step[] = [
    {
      target: ".continue-learning-section",
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Continue Learning</h3>
          <p>View all assigned program(s)</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: ".resume-button",
      content:
        firstCohortProgress === 0
          ? "Click here to start the program"
          : "Click here to resume the program",
      spotlightClicks: true,
      disableBeacon: true,
    },

    ...(localStorage.getItem("userType")?.toLowerCase() === "mentor"
      ? [
          {
            target: ".manage-cohort-assignments-section",
            content: "Access assignments from your cohort",
            disableBeacon: true,
          },
          {
            target: ".view-assignments-button",
            content: "Click 'View Assignments' to review and provide feedback",
            spotlightClicks: true,
            disableBeacon: true,
          },
        ]
      : []),
  ] as Step[];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;

    if (type === "step:after" || type === "error:target_not_found") {
      sessionStorage.setItem("tourStep", String(index + 1));
    }

    if (status === "finished") {
      setRunTour(false);
      sessionStorage.setItem("hasSeenCohortTour", "true");
      // Do NOT set skip flag here
    }

    if (status === "skipped") {
      setRunTour(false);
      sessionStorage.setItem("hasSeenCohortTour", "true");
      localStorage.setItem("cohortTourSkipped", "true"); // ✅ only if skipped
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
