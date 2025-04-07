// DashboardTour.tsx
import React, { useEffect, useState } from "react";
import Joyride, { STATUS } from "react-joyride";

const DashboardTour = ({
  stepIndex,
  setStepIndex,
  runTour,
  setRunTour,
  onLetsGoClick,
  onActiveUnitClick,
}) => {
  //   const savedStepIndex = Number(localStorage.getItem("tourStep")) || 0;
  // const [runTour, setRunTour] = useState(false);
  //   const [stepIndex, setStepIndex] = useState(savedStepIndex);

  useEffect(() => {
    setTimeout(() => {
      setRunTour(true);
    }, 2000);
  }, []);

  const steps = [
    {
      target: ".learning-path-section",
      content: "These are your modules. Click on a module to see its details.",
      disableBeacon: true,
    },
    {
      target: ".progress-section",
      content: "This section shows your progress so far.",
      disableBeacon: true,
    },
    {
      target: ".leaderboard-section",
      content: "Here is the leaderboard to see how you rank against others.",
      disableBeacon: true,
    },
    {
      target: ".lets-go-button",
      content: 'Click the "Let’s Go" button to expand this module.',
      disableBeacon: true, // Enforces interaction by preventing auto progression.
      spotlightClicks: true,
    },
    {
      target: ".active-unit",
      content:
        "This is your current active unit. Click here to begin your activity.",
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status, index, type } = data;

    if (type === "step:after" || type === "target:notFound") {
      //   localStorage.setItem("tourStep", index + 1);
        setStepIndex(index + 1);
    }
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // localStorage.removeItem("tourStep");
      setRunTour(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      stepIndex={stepIndex}
      continuous={true}
      scrollToFirstStep={true}
      showSkipButton={false}
      disableCloseOnEsc={true}
      callback={handleJoyrideCallback}
      styles={{ options: { zIndex: 10000000 } }}
    />
  );
};

export default DashboardTour;
