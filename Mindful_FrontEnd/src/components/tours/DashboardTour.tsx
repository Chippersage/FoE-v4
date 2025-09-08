// DashboardTour.tsx
import * as React from "react";
import { useState, useEffect } from "react";
import Joyride, { STATUS, Step, CallBackProps } from "react-joyride";
import CustomTooltip from "./HomeCustomTooltip";
import { useUserContext } from "@/context/AuthContext";

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
}) => {
  const { user } = useUserContext();
  const [shouldShowTour, setShouldShowTour] = useState(false);

  // Check if cohort tour was skipped
  const cohortTourSkipped =
    localStorage.getItem("cohortTourSkipped") === "true";

  // Check if user should see the tour (first login for this user)
  useEffect(() => {
    if (user?.userId) {
      const tourKey = `hasSeenDashboardTour_${user.userId}`;
      const hasSeenTour = localStorage.getItem(tourKey) === "true";
      
      // Only show tour if user hasn't seen it and didn't skip cohort tour
      setShouldShowTour(!hasSeenTour && !cohortTourSkipped && runTour);
    }
  }, [user?.userId, runTour, cohortTourSkipped]);

  const steps: Step[] = [
    {
      target: ".learning-path-section",
      content: "View the learning modules available to enhance your skills.",
      title: "Learning Modules",
      disableBeacon: true,
      placement: "bottom",
    },
    {
      target: ".lets-go-button",
      content: "Click 'Let's Go' to access your lessons and begin learning.",
      title: "Start Learning",
      disableBeacon: true,
      spotlightClicks: true,
      disableScrolling: true,
      placement: "top",
    },
    // {
    //   target: ".active-unit",
    //   content: "This is your current active lesson. Click here to begin your learning journey.",
    //   title: "Active Lesson",
    //   disableBeacon: true,
    //   spotlightClicks: true,
    //   placement: "bottom",
    // },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;

    // Handle step progression with smooth transitions
    if (type === "step:after") {
      // Add a small delay for smooth transition
      setTimeout(() => {
        setStepIndex(index + 1);
      }, 150);
    }

    // Handle target not found gracefully
    if (type === "error:target_not_found") {
      console.warn(`Tour target not found for step ${index}. Continuing to next step.`);
      setTimeout(() => {
        setStepIndex(index + 1);
      }, 200);
    }

    // Handle tour completion
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      
      // Mark tour as completed for this specific user
      if (user?.userId) {
        const tourKey = `hasSeenDashboardTour_${user.userId}`;
        localStorage.setItem(tourKey, "true");
      }
      
      // Also set the general flag for backward compatibility
      localStorage.setItem("hasSeenDashboardTour", "true");
    }
  };

  // Don't render if tour shouldn't be shown
  if (!shouldShowTour || cohortTourSkipped) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={runTour && shouldShowTour}
      stepIndex={stepIndex}
      continuous={true}
      scrollToFirstStep={true}
      showSkipButton={true}
      disableCloseOnEsc={false}
      hideBackButton={false}
      callback={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          zIndex: 10000000,
          primaryColor: "#3b82f6", // Light professional blue
          backgroundColor: "#ffffff",
          textColor: "#1e293b", // Dark slate for readability
          arrowColor: "#ffffff",
          overlayColor: "rgba(15, 23, 42, 0.3)", // Very light overlay
          beaconSize: 48,
          spotlightShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
        },
        beacon: {
          backgroundColor: "#3b82f6",
          border: "3px solid #60a5fa",
          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
        },
        tooltip: {
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0",
          fontSize: "14px",
          padding: "0",
        },
        tooltipContainer: {
          textAlign: "left",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        },
        tooltipTitle: {
          color: "#0f172a",
          fontSize: "16px",
          fontWeight: "600",
          margin: "0 0 8px 0",
          lineHeight: "1.4",
        },
        tooltipContent: {
          color: "#475569",
          fontSize: "14px",
          lineHeight: "1.6",
          margin: "0",
        },
        buttonNext: {
          backgroundColor: "#3b82f6",
          borderRadius: "8px",
          border: "none",
          fontSize: "14px",
          fontWeight: "500",
          padding: "10px 20px",
          color: "#ffffff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          transition: "all 0.2s ease-in-out",
        },
        buttonBack: {
          backgroundColor: "transparent",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          color: "#6b7280",
          fontSize: "14px",
          fontWeight: "500",
          padding: "10px 16px",
          marginRight: "12px",
          transition: "all 0.2s ease-in-out",
        },
        buttonSkip: {
          backgroundColor: "transparent",
          border: "none",
          color: "#64748b",
          fontSize: "14px",
          fontWeight: "500",
          padding: "10px 16px",
          transition: "color 0.2s ease-in-out",
        },
        spotlight: {
          borderRadius: "8px",
        },
      }}
    />
  );
};

export default DashboardTour;
