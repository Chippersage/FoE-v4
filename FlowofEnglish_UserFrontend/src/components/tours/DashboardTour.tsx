// DashboardTour.tsx
import * as React from "react";
import Joyride, { STATUS, Step, CallBackProps } from "react-joyride";
import CustomTooltip from "./HomeCustomTooltip";

interface DashboardTourProps {
  stepIndex: number;
  setStepIndex: (index: number) => void;
  runTour: boolean;
  setRunTour: (run: boolean) => void;
  onLetsGoClick?: () => void;
  onActiveUnitClick?: () => void;
}

const DashboardTour: React.FC<DashboardTourProps> = ({
  stepIndex,
  setStepIndex,
  runTour,
  setRunTour,
  onLetsGoClick,
  onActiveUnitClick,
}) => {
  // Check if cohort tour was skipped
  const cohortTourSkipped =
    localStorage.getItem("cohortTourSkipped") === "true";

  const steps: Step[] = [
    {
      target: ".learning-path-section",
      content: "View the learning modules",
      disableBeacon: true,
    },
    // {
    //   target: ".progress-section",
    //   content: "This section shows your progress so far.",
    //   disableBeacon: true,
    // },
    // {
    //   target: ".leaderboard-section",
    //   content: "Here is the leaderboard to see how you rank against others.",
    //   disableBeacon: true,
    // },
    {
      target: ".lets-go-button",
      content: "Click lets go to access the lessons.",
      disableBeacon: true,
      spotlightClicks: true,
      disableScrolling: true,
    },
    {
      target: ".active-unit",
      content: "This is your current active lesson. Click here to begin.",
      disableBeacon: true,
      spotlightClicks: true,
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;

    if (type === "step:after" || type === "error:target_not_found") {
      setStepIndex(index + 1);
    }
    if (status === "finished" || status === "skipped") {
      setRunTour(false);
      // Mark tour as completed
      localStorage.setItem("hasSeenDashboardTour", "true");
    }
  };

  // If cohort tour was skipped, don't run the dashboard tour
  if (cohortTourSkipped) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={runTour}
      stepIndex={stepIndex}
      continuous={true}
      scrollToFirstStep={true}
      showSkipButton={true}
      disableCloseOnEsc={true}
      callback={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
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

export default DashboardTour;
