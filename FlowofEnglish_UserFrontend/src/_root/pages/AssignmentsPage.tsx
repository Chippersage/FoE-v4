import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Joyride, { STATUS, Step } from "react-joyride";
import AssignmentsTable from "@/components/AssignmentsTable";
import CohortCustomTooltip from "@/components/tours/CohortCustomTooltip";
import BackButton from "@/components/BackButton";
import { IconButton, Tooltip, Box, useMediaQuery, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

interface AssignmentsPageProps {}

const AssignmentsPageWithTour: React.FC<AssignmentsPageProps> = () => {
  const { cohortId } = useParams<{ cohortId: string }>();
  const [runTour, setRunTour] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [firstRun, setFirstRun] = useState(true);
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false);
  const [showTourButton, setShowTourButton] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

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
      }, 500);
      return () => clearTimeout(tourTimer);
    }
  }, [firstRun, assignmentsLoaded]);

  // Define tour steps
  useEffect(() => {
    setSteps([
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
      setShowTourButton(false);
    }
  };

  const handleAssignmentsLoaded = () => {
    setAssignmentsLoaded(true);
  };

  const handleStartTour = () => {
    setShowTourButton(true);
    setRunTour(true);
  };

  const handleCloseTourButton = () => {
    setShowTourButton(false);
  };

  return (
    <div className="min-h-full w-full relative">
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
            backgroundColor: "rgba(0, 0, 0, 0.3)",
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

      <div className="w-full">
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
      </div>
      
     {/* Responsive Take Tour Button */}
      {showTourButton && (
        <Box
          sx={{
            position: 'fixed',
            right: { xs: 16, sm: 24, md: 32 },
            bottom: { xs: 80, sm: 100, md: 120 }, // Moved higher to avoid pagination overlap
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 1
          }}
        >
          {/* Close button */}
          <Tooltip title="Close tour button">
            <IconButton
              onClick={handleCloseTourButton}
              sx={{
                backgroundColor: 'white',
                boxShadow: 3,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
                width: 36,
                height: 36,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {/* Main tour button */}
          <Tooltip title="Take a guided tour of this page">
      <button
              onClick={handleStartTour}
              className={`
                px-3 py-2 bg-[#5BC3CD] text-black rounded-lg 
                hover:bg-[#4AB3BD] font-semibold shadow-xl 
                transition-all duration-300 hover:shadow-2xl 
                hover:scale-105 border border-[#49B0BA]
                flex items-center gap-2
                ${isMobile ? 'text-sm' : 'text-base'}
              `}
            >
              <HelpOutlineIcon fontSize={isMobile ? "small" : "medium"} />
              <span className="whitespace-nowrap">
                {isMobile ? 'Tour' : 'Take Tour'}
              </span>
      </button>
          </Tooltip>
        </Box>
      )}

      {/* Floating Tour Button (only shows when main button is hidden) */}
      {!showTourButton && (
        <Tooltip title="Show tour button">
          <IconButton
            onClick={() => setShowTourButton(true)}
            sx={{
              position: 'fixed',
              right: { xs: 16, sm: 24, md: 32 },
              bottom: { xs: 80, sm: 100, md: 120 },
              zIndex: 1000,
              backgroundColor: '#5BC3CD',
              color: 'black',
              boxShadow: 3,
              '&:hover': {
                backgroundColor: '#4AB3BD',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
            }}
          >
            <HelpOutlineIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default AssignmentsPageWithTour;