import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Joyride, { STATUS, Step } from "react-joyride";
import AssignmentsTable from "@/components/AssignmentsTable";
import CohortCustomTooltip from "@/components/tours/CohortCustomTooltip";
import BackButton from "@/components/BackButton";

interface AssignmentsPageProps {}

const AssignmentsPageWithTour: React.FC<AssignmentsPageProps> = () => {
  const { cohortId } = useParams<{ cohortId: string }>();
  const [runTour, setRunTour] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [firstRun, setFirstRun] = useState(true);
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false);

  // Check if this is user's first visit to show tour automatically
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("assignmentsTourCompleted");
    if (!hasSeenTour && firstRun && assignmentsLoaded) {
      // Add a small delay to ensure DOM elements are rendered
      const tourTimer = setTimeout(() => {
        // Check if at least one of the tour targets exists
        const firstTarget = document.querySelector('[data-tour-id="topic"]');
        if (firstTarget) {
          setRunTour(true);
          setFirstRun(false);
        } else {
          console.warn("Tour targets not found in DOM, delaying tour start");
          // Could implement a retry mechanism here if needed
        }
      }, 500); // 500ms delay

      return () => clearTimeout(tourTimer);
    }
  }, [firstRun, assignmentsLoaded]);

  // Define tour steps
  useEffect(() => {
    setSteps([
      // {
      //   target: "body",
      //   content:
      //     "Welcome to the Assignments Management interface! This tour will show you how to review and grade student assignments efficiently.",
      //   placement: "center",
      //   disableBeacon: true,
      // },
      {
        target: '[data-tour-id="topic"]',
        content: "Read assignment description here.",
        placement: "top",
        disableBeacon: true,
      },
      {
        target: '[data-tour-id="reference"]',
        content: "View related info about the assignment.",
        placement: "top",
      },
      {
        target: '[data-tour-id="view-submitted-assignment-button"]',
        content: "View the assignment submitted by the learner.",
        placement: "right",
      },
      {
        target: "input[type='number']",
        content: "Enter your score for the assignment.",
        placement: "top",
      },
      {
        target: "textarea",
        content: "Provide constructive feedback about the assignment.",
        placement: "top",
      },
      {
        target: "label[for^='correction-file']",
        content: "(Optional) Upload corrected file.",
        placement: "top",
      },
      {
        target: "input[type='date']",
        content: "(Optional) Set date of correction.",
        placement: "left",
      },
      {
        target: '[data-tour-id="save"]',
        content: "Click save to complete assignment review.",
        placement: "left",
      },
      {
        target: "body",
        content:
          "All set! You're now ready to review and grade assignments. 🎉",
        placement: "center",
      },
    ]);
  }, []);

  // Handle tour completion
  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      localStorage.setItem("assignmentsTourCompleted", "true");
    }
  };

  const handleAssignmentsLoaded = () => {
    setAssignmentsLoaded(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-4">
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showSkipButton
        tooltipComponent={CohortCustomTooltip}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 10000,
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.3)", // less dark
          },
          spotlight: {
            borderRadius: 4,
            boxShadow: "0 0 0 4px rgba(91, 195, 205, 0.5)",
          },
          beacon: {
            inner: "#5BC3CD",
            outer: "#5BC3CD",
          },
        }}
        disableScrolling
      />

      <main className="container mx-auto max-w-[100rem] py-10">
        <header className="mb-6">
          {/* Add the BackButton component here */}
          {/* <div className="flex items-center mb-4">
            <BackButton />
          </div> */}
          <h1 className="text-3xl font-bold text-emerald-700">
            Review Assignments
          </h1>
        </header>

        {/* Render the AssignmentsTable component */}
        <AssignmentsTable
          cohortId={cohortId || ""}
          onAssignmentsLoaded={handleAssignmentsLoaded}
        />
      </main>
      {/* Fixed Take Tour Button */}
      {/* Fixed Take Tour Button with Enhanced Shadow Effect */}
      <button
        className="fixed bottom-6 right-6 z-[11000] px-4 py-2 bg-[#5BC3CD] text-black rounded-lg hover:bg-[#4AB3BD] font-semibold shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-[#49B0BA] before:content-[''] before:absolute before:inset-0 before:bg-black before:opacity-10 before:rounded-lg before:z-[-1]"
        onClick={() => setRunTour(true)}
      >
        Take Tour
      </button>
    </div>
  );
};

export default AssignmentsPageWithTour;
