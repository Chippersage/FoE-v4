"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  BookOpen,
  Brain,
  Sparkles,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  Lock,
  Bell,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUserContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { Tooltip } from "@/components/ui/tooltip";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
// import WordOfTheDay from "@/components/WordADay";
import { AnimatePresence, motion } from "framer-motion";
import CohortTour from "@/components/tours/CohortTour";
import { Badge } from "@/components/ui/badge";
import formatUnixToDate from "@/utils/formatUnixToDate";
import { useToast } from "@/hooks/use-toast";

const courseColors = [
  "from-pink-500 to-rose-500",
  "from-violet-500 to-purple-500",
  "from-cyan-500 to-blue-500",
  "from-amber-400 to-orange-500",
  // "from-emerald-500 to-green-500",
  "from-red-500 to-pink-500",
];

// Function to calculate days remaining until end date
const calculateDaysRemaining = (endDateStr) => {
  if (!endDateStr) return null;

  const endDate = new Date(Number(endDateStr) * 1000);
  const today = new Date();

  // Reset to midnight to compare only the dates
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = endDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // return signed number
};


// Function to get status based on days remaining
const getCohortStatus = (daysRemaining) => {
  if (daysRemaining === null)
    return { status: "unknown", label: "No end date" };

  if (daysRemaining < 0)
    return {
      status: "ended",
      label: "Ended",
      icon: <Lock className="h-4 w-4" />,
      color: "text-gray-500 bg-gray-100",
    };

  if (daysRemaining === 0)
    return {
      status: "ending-today",
      label: "Ends today",
      icon: <AlertCircle className="h-4 w-4" />,
      color: "text-red-500 bg-red-50",
    };

  if (daysRemaining <= 7)
    return {
      status: "ending-soon",
      label: `${daysRemaining} day${daysRemaining > 1 ? "s" : ""} left`,
      icon: <AlertCircle className="h-4 w-4" />,
      color: "text-orange-500 bg-orange-50",
    };

  if (daysRemaining <= 15)
    return {
      status: "ending-near",
      label: `${daysRemaining} days left`,
      icon: <Clock className="h-4 w-4" />,
      color: "text-yellow-500 bg-yellow-50",
    };

  return {
    status: "active",
    label: `${daysRemaining} days left`,
    icon: <CheckCircle className="h-4 w-4" />,
    color: "text-emerald-500 bg-emerald-50",
  };
};

// Sound effect function - place at the beginning of your component
const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3'); // You'll need to add this sound file to your public folder
  audio.volume = 0.5;
  audio.play().catch(err => console.error("Error playing sound:", err));
};

export default function Dashboard() {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { user, setSelectedCohortWithProgram } = useUserContext();
  const [progressData, setProgressData] = useState({}); // Store progress per programId
  const [loading, setLoading] = useState({}); // Track loading state for each programId
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const hasSeenProductTour = localStorage.getItem("hasSeenProductTour");
  const userType = localStorage.getItem("userType");
  const [showAssignments, setShowAssignments] = useState(false);
  const [showEndDateNotification, setShowEndDateNotification] = useState(true);
  const progressFetchedRef = useRef({});
  const prevDependenciesRef = useRef({
    userCohortsLength: 0,
    userId: null,
    apiBaseUrl: null,
  });
  const renderCountRef = useRef(0);
  const [debugLogs, setDebugLogs] = useState([]);

  // For development debugging - add a log view
  const showDebugLogs = false; // Set to true to see logs in the UI
  // const [expandedCohortId, setExpandedCohortId] = useState(null);
  const [notificationsShown, setNotificationsShown] = useState(false);
  const [notificationExpanded, setNotificationExpanded] = useState(true);
  const { toast } = useToast(); // If you're using a toast system

  const MotionCard = motion(Card);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  const [expandedCohortId, setExpandedCohortId] = useState(null);
  // const [showAllNotifications, setShowAllNotifications] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAssignments(true);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer); // cleanup on unmount
  }, []);

  // Replace the progress fetch useEffect with this:
  useEffect(() => {
    // Increment render count
    renderCountRef.current += 1;

    const addLog = (message) => {
      const logMessage = `[Render #${renderCountRef.current}] ${message}`;
      // console.log(logMessage);
      setDebugLogs((prev) => [
        ...prev,
        `${new Date().toISOString().slice(11, 19)}: ${logMessage}`,
      ]);
    };

    // Check which dependencies changed
    const currentDeps = {
      userCohortsLength: user?.cohorts?.length || 0,
      userId: user?.userId,
      apiBaseUrl: API_BASE_URL,
    };

    const changedDeps = [];

    if (
      currentDeps.userCohortsLength !==
      prevDependenciesRef.current.userCohortsLength
    ) {
      changedDeps.push(
        `cohorts length: ${prevDependenciesRef.current.userCohortsLength} → ${currentDeps.userCohortsLength}`
      );
    }

    if (currentDeps.userId !== prevDependenciesRef.current.userId) {
      changedDeps.push(
        `userId: ${prevDependenciesRef.current.userId} → ${currentDeps.userId}`
      );
    }

    if (currentDeps.apiBaseUrl !== prevDependenciesRef.current.apiBaseUrl) {
      changedDeps.push(
        `API URL: ${prevDependenciesRef.current.apiBaseUrl} → ${currentDeps.apiBaseUrl}`
      );
    }

    // Update the previous dependencies ref for next comparison
    prevDependenciesRef.current = currentDeps;

    // Log which dependencies changed
    if (changedDeps.length > 0) {
      addLog(`Effect triggered due to changes in: ${changedDeps.join(", ")}`);
    } else {
      addLog(
        `Effect triggered (initial render or no visible dependency change)`
      );
    }

    // Guard clause
    if (!user?.cohorts || !user?.userId) {
      addLog(
        `Skipping effect: ${
          !user
            ? "user is null"
            : !user.cohorts
            ? "cohorts is null"
            : "userId is null"
        }`
      );
      return;
    }

    addLog(`Processing ${user.cohorts.length} cohorts`);

    // Create a batch of promises for cohorts that haven't been fetched yet
    const fetchPromises = [];

    user.cohorts.forEach((cohort, index) => {
      const programId = cohort?.program?.programId;
      if (!programId) {
        addLog(`Cohort at index ${index} has no programId, skipping`);
        return;
      }

      // Skip if we've already fetched this programId in this component instance
      if (progressFetchedRef.current[programId]) {
        addLog(`Skipping duplicate fetch for programId: ${programId}`);
        return;
      }

      // Mark as being fetched
      progressFetchedRef.current[programId] = true;

      // Set loading state
      setLoading((prev) => ({ ...prev, [programId]: true }));

      addLog(`Fetching progress for programId: ${programId}`);

      // Add the fetch promise to our array
      const fetchPromise = fetch(
        `${API_BASE_URL}/reports/program/${programId}/user/${user.userId}/progress`
      )
        .then((res) => {
          if (!res.ok)
            throw new Error(
              `Failed to fetch progress for program ${programId}`
            );
          return res.json();
        })
        .then((data) => {
          addLog(`Received data for programId: ${programId}`);
          const { completedSubconcepts, totalSubconcepts } = data;
          const progress =
            totalSubconcepts > 0
              ? (completedSubconcepts / totalSubconcepts) * 100
              : 0;

          // Update the progress data state
          setProgressData((prev) => ({
            ...prev,
            [programId]: progress,
          }));

          return programId;
        })
        .catch((error) => {
          addLog(
            `Error fetching progress for programId ${programId}: ${error.message}`
          );
          console.error(
            `Error fetching progress for program ${programId}:`,
            error
          );
          return programId;
        })
        .finally(() => {
          // Reset loading state for this programId
          setLoading((prev) => ({
            ...prev,
            [programId]: false,
          }));
        });

      fetchPromises.push(fetchPromise);
    });

    if (fetchPromises.length > 0) {
      addLog(`Started ${fetchPromises.length} fetch requests`);

      Promise.all(fetchPromises)
        .then(() => {
          addLog("All progress data fetched successfully");
        })
        .catch((error) => {
          addLog(`Error in batch fetch: ${error.message}`);
        });
    } else {
      addLog("No new progress data to fetch");
    }

    // Cleanup function to handle component unmount
    return () => {
      addLog("Effect cleanup - component unmounting or dependencies changed");
    };
  }, [user?.cohorts, API_BASE_URL, user?.userId]); // Dependencies

  const sortedCohorts = [...(user?.cohorts || [])].sort((a, b) => {
    // Get pending assignment counts
    const pendingCountA =
      user?.assignmentStatistics?.cohortDetails?.[a.cohortId]
        ?.pendingAssignments || 0;
    const pendingCountB =
      user?.assignmentStatistics?.cohortDetails?.[b.cohortId]
        ?.pendingAssignments || 0;

    // First sort by pending assignments (descending)
    if (pendingCountA > 0 && pendingCountB === 0) return -1;
    if (pendingCountA === 0 && pendingCountB > 0) return 1;

    // Then sort by cohort status (active before ending soon before ended)
    const daysRemainingA = calculateDaysRemaining(a.cohortEndDate);
    const daysRemainingB = calculateDaysRemaining(b.cohortEndDate);

    // Active cohorts (more than 15 days) first
    if (daysRemainingA > 15 && daysRemainingB <= 15) return -1;
    if (daysRemainingA <= 15 && daysRemainingB > 15) return 1;

    // Then sort by days remaining (descending)
    if (daysRemainingA !== daysRemainingB) {
      return daysRemainingB - daysRemainingA;
    }

    // Finally sort alphabetically by cohort name
    return a.cohortName.localeCompare(b.cohortName);
  });

  const handleResume = async (cohortWithProgram) => {
    // Check if cohort is disabled
    const daysRemaining = calculateDaysRemaining(
      cohortWithProgram.cohortEndDate
    );
    const status = getCohortStatus(daysRemaining).status;

    if (status === "ended" || daysRemaining < 0) {
      // Show a toast or alert that the cohort has ended
      console.log("This cohort has ended and is no longer accessible");
      return;
    }

    setSelectedCohortWithProgram(cohortWithProgram);
    // When setting the cohort
    localStorage.setItem(
      "selectedCohortWithProgram",
      JSON.stringify(cohortWithProgram)
    );

    try {
      const response = await axios.post(`${API_BASE_URL}/users/select-cohort`, {
        userId: user?.userId,
        cohortId: cohortWithProgram?.cohortId,
      });

      localStorage.setItem("sessionId", response.data.sessionId); // Store real session ID

      navigate("/home"); // Navigate after session ID is set
    } catch (error) {
      console.error("Error fetching session ID:", error);
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Daily challenge data
  const wordOfDay = {
    word: "Epiphany",
    partOfSpeech: "noun",
    definition: "A moment of sudden and profound understanding or realization.",
    example:
      "In the quiet of the library, she had an epiphany that changed the course of her career.",
    pronunciation: "/ɪˈpɪfəni/",
  };

  const riddle = {
    question:
      "I have keys but no locks, I have space but no room, you can enter but can’t go outside. What am I?",
    answer: "A keyboard",
    hint: "Think of something essential to computers.",
  };
  

  // Count cohorts that are ending soon (<=15 days) or have ended
  const endingSoonCohorts =
    user?.cohorts?.filter((cohort) => {
      const daysRemaining = calculateDaysRemaining(cohort.cohortEndDate);
      return daysRemaining !== null && daysRemaining <= 15;
    }) || [];

  const endedCohorts =
    user?.cohorts?.filter((cohort) => {
      const daysRemaining = calculateDaysRemaining(cohort.cohortEndDate);
      return daysRemaining !== null && daysRemaining <= 0;
    }) || [];

  // Play sound and show notification when component mounts
  useEffect(() => {
    if (endingSoonCohorts.length > 0 && !notificationsShown) {
      setTimeout(() => {
        playNotificationSound();
        setNotificationsShown(true);

        // Optional: Show toast notification
        toast({
          title: "Cohort Access Alert",
          description: `You have ${endingSoonCohorts.length} cohort${
            endingSoonCohorts.length !== 1 ? "s" : ""
          } ending soon.`,
          variant: "warning",
        });
      }, 1000); // Delay the notification by 1 second after page load
    }
  }, [endingSoonCohorts.length]);

  // Auto-rotate notifications every 2 seconds
  useEffect(() => {
    if (endingSoonCohorts.length > 0 && expandedCohortId === null) {
      const intervalId = setInterval(() => {
        setCurrentNotificationIndex(
          (prev) => (prev + 1) % endingSoonCohorts.length
        );
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [endingSoonCohorts.length, expandedCohortId]);


  // Function to toggle expanded state of a notification
  const toggleExpandCohort = (cohortId) => {
    setExpandedCohortId(expandedCohortId === cohortId ? null : cohortId);
  };

  // Function to toggle the entire notification panel
  const toggleNotificationPanel = () => {
    setNotificationExpanded(!notificationExpanded);
  };

  // Current cohort based on the index
  const currentCohort = endingSoonCohorts[currentNotificationIndex];

  // Navigation handlers
  const handleNextNotification = () => {
    setCurrentNotificationIndex((prev) =>
      Math.min(prev + 1, endingSoonCohorts.length - 1)
    );
  };

  const handlePreviousNotification = () => {
    setCurrentNotificationIndex((prev) => Math.max(prev - 1, 0));
  };

  const toggleCohortDetails = (cohortId) => {
    setExpandedCohortId((prev) => (prev === cohortId ? null : cohortId));
  };

  // const toggleAllNotifications = () => {
  //   setShowAllNotifications((prev) => !prev);
  // };

  return (
    <>
      {/* Render tour only if the user hasn't seen it before */}
      {!hasSeenProductTour && (
        <CohortTour
          onResumeClick={handleResume}
          firstCohortProgress={
            progressData[user?.cohorts?.[0]?.program?.programId]
          }
        />
      )}

      <div
        className="min-h-screen bg-slate-100 font-sans relative"
        style={{
          backgroundImage: "url('/images/cohort-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/10 z-0" />

        <main className="relative z-10 container mx-auto p-4">
          {/* Notification for ending soon cohorts */}
          {/* Sequential Notification for ending soon cohorts */}
          <AnimatePresence>
            {showEndDateNotification && endingSoonCohorts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mb-6 space-y-2 sticky top-2 z-50 p-2"
              >
                {/* Rotating notification carousel in header */}
                <motion.div
                  className="relative rounded-[5px] border border-orange-300 bg-orange-50/80 p-3 text-gray-800 flex items-center justify-between shadow-sm"
                  layoutId="notification-header"
                >
                  <div className="flex items-center gap-2 flex-1 overflow-hidden">
                    <Bell className="h-5 w-5 text-orange-500 animate-pulse" />

                    {/* Carousel of notifications */}
                    <div className="flex-1 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`alert-${currentNotificationIndex}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <h3 className="font-medium truncate text-gray-800">
                                {currentCohort?.program?.programName}
                              </h3>

                              {(() => {
                                const days = calculateDaysRemaining(
                                  currentCohort?.cohortEndDate
                                );
                                if (days < 0) {
                                  return (
                                    <Badge className="bg-red-50 text-red-600 border border-red-200 ml-2 animate-pulse">
                                      Expired
                                    </Badge>
                                  );
                                } else if (days <= 7) {
                                  return (
                                    <Badge className="bg-red-50 text-red-600 border border-red-200 ml-2 animate-pulse">
                                      Expiring soon
                                    </Badge>
                                  );
                                }
                                return null;
                              })()}
                            </div>

                            <p className="text-xs text-gray-600">
                              {(() => {
                                const days = calculateDaysRemaining(
                                  currentCohort?.cohortEndDate
                                );
                                if (days < 0) {
                                  return `Expired ${Math.abs(days)} day${
                                    Math.abs(days) !== 1 ? "s" : ""
                                  } ago`;
                                } else if (days === 0) {
                                  return "Expires today";
                                } else {
                                  return `Expires in ${days} day${
                                    days !== 1 ? "s" : ""
                                  }`;
                                }
                              })()}
                            </p>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-2">
                    {/* Counter badge */}
                    <Badge className="bg-orange-50 text-orange-600 border border-orange-200">
                      {currentNotificationIndex + 1}/{endingSoonCohorts.length}
                    </Badge>

                    {/* Action buttons */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePreviousNotification}
                        className="text-gray-600 hover:bg-orange-50 h-7 w-7 p-0"
                        disabled={currentNotificationIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextNotification}
                        className="text-gray-600 hover:bg-orange-50 h-7 w-7 p-0"
                        disabled={
                          currentNotificationIndex ===
                          endingSoonCohorts.length - 1
                        }
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleCohortDetails(currentCohort?.cohortId)
                        }
                        className="text-gray-600 hover:bg-orange-50 h-7 w-7 p-0"
                      >
                        {expandedCohortId === currentCohort?.cohortId ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Dismiss Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEndDateNotification(false)}
                      className="text-gray-600 hover:text-black hover:bg-orange-500 rounded-[5px] text-xs px-2"
                    >
                      Dismiss
                    </Button>
                  </div>
                </motion.div>

                {/* Expanded details for current notification only */}
                <AnimatePresence>
                  {expandedCohortId === currentCohort?.cohortId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-b-lg overflow-hidden border border-orange-200 shadow-md"
                    >
                      {/* Dynamic styling based on days remaining */}
                      {(() => {
                        const daysRemaining = calculateDaysRemaining(
                          currentCohort?.cohortEndDate
                        );

                        // Determine urgency level styling
                        let urgencyStyle = "bg-green-50";
                        let textColor = "text-green-700";
                        let borderColor = "border-green-100";

                        if (daysRemaining <= 3) {
                          urgencyStyle = "bg-red-50";
                          textColor = "text-red-700";
                          borderColor = "border-red-100";
                        } else if (daysRemaining <= 7) {
                          urgencyStyle = "bg-orange-50";
                          textColor = "text-orange-700";
                          borderColor = "border-orange-100";
                        } else if (daysRemaining <= 14) {
                          urgencyStyle = "bg-amber-50";
                          textColor = "text-amber-700";
                          borderColor = "border-amber-100";
                        }

                        return (
                          <div className={`p-3 ${urgencyStyle}`}>
                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-1">
                                Time Remaining:
                              </h4>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full ${
                                    daysRemaining <= 3
                                      ? "bg-red-500"
                                      : daysRemaining <= 7
                                      ? "bg-orange-500"
                                      : daysRemaining <= 14
                                      ? "bg-amber-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (daysRemaining / 30) * 100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-1">
                                Cohort Details:
                              </h4>
                              <p className="text-xs text-gray-600">
                                Program: {currentCohort?.program?.programName}
                                <br />
                                End Date:{" "}
                                {new Date(
                                  currentCohort?.cohortEndDate
                                ).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex justify-between items-center gap-2">
                              <Button
                                size="sm"
                                className={`text-xs ${
                                  daysRemaining <= 7
                                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                                    : "bg-gradient-to-r from-emerald-500 to-green-500"
                                } text-white hover:opacity-90`}
                                onClick={() => handleResume(currentCohort)}
                              >
                                Resume Now
                              </Button>

                              {/* <Button
                                variant="outline"
                                size="sm"
                                className={`text-xs ${textColor} ${borderColor}`}
                                onClick={() => {
                                  // Add action here - e.g., request extension
                                }}
                              >
                                Request Extension
                              </Button> */}
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Optional: Summary footer that can be toggled to show all alerts */}
                {/* {endingSoonCohorts.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <Button
                      variant="link"
                      size="sm"
                      onClick={toggleAllNotifications}
                      className="text-orange-600 text-xs"
                    >
                      {showAllNotifications ? "Hide" : "View"} all{" "}
                      {endingSoonCohorts.length} alerts
                    </Button>
                  </motion.div>
                )} */}

                {/* All notifications panel (optional) */}
                {/* <AnimatePresence>
                  {showAllNotifications && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white rounded-lg border border-orange-200 shadow-md overflow-hidden mt-2"
                    >
                      <div className="max-h-64 overflow-y-auto">
                        {endingSoonCohorts
                          .sort(
                            (a, b) =>
                              calculateDaysRemaining(a.cohortEndDate) -
                              calculateDaysRemaining(b.cohortEndDate)
                          )
                          .map((cohort) => {
                            const daysRemaining = calculateDaysRemaining(
                              cohort.cohortEndDate
                            );
                            const isPriority = daysRemaining <= 7;

                            return (
                              <div
                                key={cohort.cohortId}
                                className={`p-2 flex items-center justify-between border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                                  currentCohort?.cohortId === cohort.cohortId
                                    ? "bg-orange-50"
                                    : ""
                                }`}
                                onClick={() =>
                                  setCurrentNotificationIndex(
                                    endingSoonCohorts.indexOf(cohort)
                                  )
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                                      daysRemaining <= 3
                                        ? "bg-red-100"
                                        : daysRemaining <= 7
                                        ? "bg-orange-100"
                                        : daysRemaining <= 14
                                        ? "bg-amber-100"
                                        : "bg-green-100"
                                    }`}
                                  >
                                    <Calendar
                                      className={`h-3 w-3 ${
                                        daysRemaining <= 3
                                          ? "text-red-500"
                                          : daysRemaining <= 7
                                          ? "text-orange-500"
                                          : daysRemaining <= 14
                                          ? "text-amber-500"
                                          : "text-green-500"
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium truncate max-w-xs">
                                      {cohort.cohortName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {daysRemaining} day
                                      {daysRemaining !== 1 ? "s" : ""} left
                                    </p>
                                  </div>
                                </div>
                                {isPriority && (
                                  <Badge
                                    variant="outline"
                                    className="text-red-600 border-red-200 text-xs"
                                  >
                                    Urgent
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence> */}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Continue Learning Section */}
          <section className="mb-8 continue-learning-section mt-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-emerald-700">
                Continue Learning
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollLeft}
                  disabled={!canScrollLeft}
                  className="h-8 w-8 rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Scroll left</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollRight}
                  disabled={!canScrollRight}
                  className="h-8 w-8 rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Scroll right</span>
                </Button>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-4 pb-4 p-2 w-full overflow-x-auto custom-scrollbar-2 snap-x snap-mandatory"
            >
              {sortedCohorts.map((cohortWithProgram, index) => {
                const programId = cohortWithProgram?.program?.programId;
                const progress = progressData[programId];
                const isLoading = loading[programId];

                // Calculate days remaining and status
                const daysRemaining = calculateDaysRemaining(
                  cohortWithProgram.cohortEndDate
                );
                const cohortStatus = getCohortStatus(daysRemaining);
                const isDisabled =
                  cohortStatus.status === "ended" || daysRemaining < 0;

                return (
                  <MotionCard
                    key={cohortWithProgram?.program?.programId}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`min-w-[280px] max-w-[280px] border relative md:min-w-[400px] md:max-w-[400px] rounded-xl shadow-lg snap-center 
                      ${
                        isDisabled
                          ? "border-gray-200 bg-gradient-to-b from-gray-100 to-gray-50 opacity-75"
                          : "border-gray-200 bg-gradient-to-b from-[#CAF2BC] to-white hover:shadow-xl"
                      } 
                      ${index === 0 ? "program-card-first" : ""}`}
                  >
                    {/* Cohort status badge */}
                    <div className="absolute top-2 right-2 z-10">
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium ${cohortStatus.color}`}
                      >
                        {cohortStatus.icon}
                        {cohortStatus.label}
                      </Badge>
                    </div>

                    {/* Overlay for disabled cohorts */}
                    {isDisabled && (
                      <div className="absolute inset-0 bg-gray-200 bg-opacity-10 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-20">
                        <div className="bg-white bg-opacity-90 rounded-lg px-4 py-3 shadow-lg border border-gray-200 max-w-[80%] text-center">
                          <Lock className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                          <h4 className="font-medium text-gray-800 mb-1">
                            Cohort Ended
                          </h4>
                          <p className="text-sm text-gray-600">
                            This cohort is no longer accessible
                          </p>
                        </div>
                      </div>
                    )}

                    <CardContent className="p-4 pt-10">
                      <h3 className="mb-2 line-clamp-2 min-h-[48px] font-medium">
                        {cohortWithProgram?.program?.programName}
                      </h3>

                      {/* Cohort details */}
                      <div className="flex flex-col gap-1 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-1">Cohort:</span>
                          {cohortWithProgram?.cohortName}
                        </div>

                        {cohortWithProgram.cohortEndDate && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              Ends:{" "}
                              {formatUnixToDate(
                                cohortWithProgram?.cohortEndDate
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="link"
                              className="mb-2 h-auto p-0 text-emerald-600"
                              // disabled={isDisabled}
                              disabled={true}
                            >
                              See Details
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View program details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {isLoading
                            ? "Loading..."
                            : `${progress?.toFixed(1)}% complete`}
                        </span>
                      </div>
                      {isLoading ? (
                        <Skeleton className="h-2 w-full" />
                      ) : (
                        <Progress
                          value={progress}
                          className={`h-2 ${isDisabled ? "bg-gray-200" : ""}`}
                        />
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end border-t bg-gray-50 p-2">
                      <Button
                        size="sm"
                        disabled={isDisabled}
                        className={`w-[80px] bg-gradient-to-r 
                          ${
                            isDisabled
                              ? "from-gray-400 to-gray-500 opacity-70 cursor-not-allowed"
                              : "from-emerald-500 to-green-500 hover:bg-emerald-600"
                          } 
                          rounded-[5px] ${index === 0 ? "resume-button" : ""}`}
                        onClick={() => handleResume(cohortWithProgram)}
                      >
                        {progress === 0 ? "Start" : "Resume"}
                      </Button>
                    </CardFooter>
                  </MotionCard>
                );
              })}
            </div>
          </section>

          {/* Daily Challenge Section - Redesigned */}
          {userType === "mentor" || userType === "Mentor" ? (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 manage-cohort-assignments-section"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-emerald-700">
                  Manage Cohort Assignments
                </h2>
              </div>

              <AnimatePresence>
                {showAssignments && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 bg-gradient-to-b from-[#CAF2BC] to-white p-4 rounded-xl"
                  >
                    {sortedCohorts.map((course, index) => {
                      const themeColor =
                        courseColors[index % courseColors.length];
                      const color = "from-emerald-500 to-green-500";

                      const pendingCount =
                        user?.assignmentStatistics?.cohortDetails?.[
                          course.cohortId
                        ]?.pendingAssignments || 0;

                      return (
                        <Card
                          key={course.cohortId}
                          className="group overflow-hidden border-0 bg-white dark:bg-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 dark:shadow-gray-900/30 rounded-xl relative"
                        >
                          <div
                            className={`h-2 w-full bg-gradient-to-r ${themeColor}`}
                          />

                          {/* Show badge only if pendingCount > 0 */}
                          {/* {pendingCount > 0 && (
                            <div className="absolute top-3 right-3 z-10">
                              <div className="relative">
                                <span
                                  className={`flex h-6 min-w-6 items-center justify-center rounded-full bg-gradient-to-r ${themeColor} text-xs font-bold text-white px-2 animate-bounce-subtle`}
                                >
                                  {pendingCount}
                                </span>
                                <span
                                  className={`absolute -inset-1 rounded-full bg-gradient-to-r ${themeColor} opacity-30`}
                                ></span>
                              </div>
                            </div>
                          )} */}

                          <CardContent className="p-6">
                            <div className="mb-4 flex items-center gap-2">
                              {/* BookOpen Icon */}
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                                <BookOpen className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                              </div>

                              {/* Pending Count beside icon */}
                              {pendingCount > 0 && (
                                <div className="relative ml-2">
                                  <span
                                    className={`flex h-6 min-w-6 items-center justify-center rounded-full bg-gradient-to-r ${themeColor} text-xs font-bold text-white px-2 animate-bounce-subtle`}
                                  >
                                    {pendingCount}
                                  </span>
                                  <span
                                    className={`absolute -inset-1 rounded-full bg-gradient-to-r ${themeColor} opacity-30`}
                                  ></span>
                                </div>
                              )}
                            </div>

                            <h3 className="text-xl font-semibold tracking-tight">
                              {course.cohortName}
                            </h3>
                          </CardContent>

                          <CardFooter className="p-6 pt-0">
                            <Button
                              asChild
                              className={`w-full bg-gradient-to-r ${color} hover:opacity-90 transition-all duration-300 group-hover:translate-y-0 translate-y-0 border-0 view-assignments-button`}
                            >
                              <Link
                                to={`/cohorts/${course.cohortId}/assignments`}
                                className="flex items-center justify-center gap-2"
                              >
                                View Assignments
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {!showAssignments && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-6 text-center bg-gradient-to-b from-[#CAF2BC] to-white"
                >
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="bg-indigo-100 p-4 rounded-full mb-4">
                      <ClipboardList className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-indigo-800 mb-2">
                      Access Course Assignments
                    </h3>
                    <p className="text-gray-600 max-w-md mb-6">
                      As a mentor, you can view and manage all assignments for
                      your courses. Track student progress, review submissions,
                      and provide feedback.
                    </p>
                    <Button
                      onClick={() => setShowAssignments(true)}
                      className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-[5px]"
                    >
                      <ClipboardList className="mr-2 h-5 w-5" />
                      View All Assignments
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.section>
          ) : (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 daily-challenge-section"
            >
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
                Daily Challenge
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Word of the Day */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="rounded-2xl overflow-hidden bg-gradient-to-b from-[#CAF2BC] to-white shadow-lg border border-emerald-100 relative"
                >
                  <div className="absolute top-0 right-0 w-24 h-24">
                    <div className="absolute transform rotate-45 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium py-1 text-xs text-center w-36 top-6 -right-10">
                      Word of Day
                    </div>
                  </div>
                  <div className="p-6 pt-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold">Word of the Day</h3>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-2xl font-bold text-emerald-700">
                          {wordOfDay.word}
                        </h4>
                        <span className="text-sm text-gray-500 italic">
                          {wordOfDay.pronunciation}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 italic">
                        {wordOfDay.partOfSpeech}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700">{wordOfDay.definition}</p>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                      <p className="text-emerald-800 italic">
                        "{wordOfDay.example}"
                      </p>
                    </div>

                    {/* <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Practice
                  </Button>
                </div> */}
                  </div>
                </motion.div>

                {/* Riddle */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="rounded-2xl overflow-hidden bg-gradient-to-b from-[#CAF2BC] to-white shadow-lg border border-blue-100 relative"
                >
                  <div className="absolute top-0 right-0 w-24 h-24">
                    <div className="absolute transform rotate-45 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium py-1 text-xs text-center w-36 top-6 -right-10">
                      Brain Teaser
                    </div>
                  </div>
                  <div className="p-6 pt-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <Brain className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold">Daily Riddle</h3>
                    </div>

                    <div className="bg-blue-50 p-5 rounded-lg mb-6">
                      <p className="text-blue-800 text-lg font-medium">
                        {riddle.question}
                      </p>
                    </div>

                    <details className="group">
                      <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200">
                        <span className="font-medium">Reveal Hint</span>
                        <span className="shrink-0 transition duration-300 group-open:rotate-180">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </summary>
                      <div className="mt-2 rounded-lg bg-blue-50 p-4 text-blue-700">
                        <p>{riddle.hint}</p>
                      </div>
                    </details>

                    <details className="group mt-3">
                      <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-indigo-100 px-4 py-2 text-indigo-700 hover:bg-indigo-200">
                        <span className="font-medium">Reveal Answer</span>
                        <span className="shrink-0 transition duration-300 group-open:rotate-180">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </summary>
                      <div className="mt-2 rounded-lg bg-indigo-50 p-4 text-indigo-700 font-medium">
                        <p>{riddle.answer}</p>
                      </div>
                    </details>

                    {/* <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    New Riddle
                  </Button>
                </div> */}
                  </div>
                </motion.div>
              </div>
            </motion.section>
          )}

          {/* Debug section - only shown in development */}
          {showDebugLogs && (
            <section className="mt-8 border rounded-lg p-4 bg-gray-50">
              <h3 className="font-bold mb-2">
                Debug Logs ({debugLogs.length})
              </h3>
              <div className="max-h-60 overflow-y-auto bg-black text-green-400 p-2 rounded font-mono text-xs">
                {debugLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
