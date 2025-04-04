// CohortTour.tsx
import React, { useEffect, useState } from "react";
import Joyride, { STATUS } from "react-joyride";

const CohortTour = ({ onResumeClick }) => {
  const [runTour, setRunTour] = useState(false);
  useEffect(() => {
      setTimeout(() => {
        setRunTour(true);
      }, 2000);
  })
  const steps = [
    {
      target: ".cohort-page-header",
      content: "Welcome! This is your cohort selection page.",
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
    },
    {
      target: ".program-card-first", // This targets only the first card.
      content: "This card shows your program details and progress.",
    },
    {
      target: ".daily-challenge-section",
      content:
        "Below are your Daily Challenges: Word of the Day and Daily Riddle.",
    },
    {
      target: ".resume-button",
      content:
        "Click the Resume button of the program you want to proceed with. (You must click here to continue.)",
      // This step forces the user to click the Resume button.
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status, index, type } = data;

    // When finishing a step, save the next step index
    if (type === "step:after" || type === "target:notFound") {
      localStorage.setItem("tourStep", index + 1);
    }
    // When the tour is finished, stop running
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      localStorage.setItem("hasSeenProductTour", "true");
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
      styles={{ options: { zIndex: 10000 } }}
    />
  );
};

export default CohortTour;
