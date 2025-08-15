// @ts-nocheck
"use client";
import { useUserContext } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import toast from "react-hot-toast";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle,
  Lock,
  Bell,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import React from "react";
import LoadingOverlay from "@/components/LoadingOverlay";
import CohortTour from "@/components/tours/CohortTour";
import { ErrorModal } from "@/components/ErrorModal";

const courseColors = [
  "from-pink-500 to-rose-500",
  "from-violet-500 to-purple-500",
  "from-cyan-500 to-orange-500",
  "from-amber-400 to-orange-500",
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
    color: "text-orange-500 bg-orange-50",
  };
};

interface Cohort {
  cohortId: string;
  cohortName: string;
  cohortEndDate: string;
  program: {
    programId: string;
  };
}

const Dashboard: React.FC = () => {
  const { user, setSelectedCohortWithProgram } = useUserContext();
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const hasSeenProductTour = localStorage.getItem("hasSeenProductTour");
  const [showEndDateNotification, setShowEndDateNotification] = useState(true);
  const progressFetchedRef = useRef({});
  const prevDependenciesRef = useRef({
    userCohortsLength: 0,
    userId: null,
    apiBaseUrl: null,
  });
  const renderCountRef = useRef(0);
  const [debugLogs, setDebugLogs] = useState([]);
  const showDebugLogs = false;
  const [notificationsShown, setNotificationsShown] = useState(false);
  const [notificationExpanded, setNotificationExpanded] = useState(true);
  const MotionCard = motion(Card);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  const [expandedCohortId, setExpandedCohortId] = useState(null);
  const [showErrorModalOpen, setShowErrorModalOpen] = useState(false);
  const [errorModalData, setErrorModalData] = useState(null);
  const [isResuming, setIsResuming] = useState(false);
  const [isLoadingCohorts, setIsLoadingCohorts] = useState(true);
  const [fetchedCohorts, setFetchedCohorts] = useState<any[]>([]);

  // Replace the progress fetch useEffect with this:
  useEffect(() => {
    // Increment render count
    renderCountRef.current += 1;

    const addLog = (message) => {
      const logMessage = `[Render #${renderCountRef.current}] ${message}`;
      setDebugLogs((prev) => [
        ...prev,
        `${new Date().toISOString().slice(11, 19)}: ${logMessage}`,
      ]);
    };

    // Check which dependencies changed
    const currentDeps = {
      userCohortsLength: fetchedCohorts?.userDetails?.allCohortsWithPrograms?.length || 0,
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
    if (!fetchedCohorts || !fetchedCohorts?.userDetails?.allCohortsWithPrograms || !user?.userId) {
      addLog(
        `Skipping effect: ${
          !user
            ? "user is null"
            : !fetchedCohorts
            ? "cohorts is null"
            : "userId is null"
        }`
      );
      return;
    }

    addLog(
      `Processing ${fetchedCohorts?.userDetails?.allCohortsWithPrograms.length} cohorts`
    );

    // Create a batch of promises for cohorts that haven't been fetched yet
    const fetchPromises = [];

    fetchedCohorts?.userDetails?.allCohortsWithPrograms.forEach((cohort, index) => {
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
        `${API_BASE_URL}/reports/program/${programId}/user/${user?.userId}/progress`
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
  }, [fetchedCohorts, API_BASE_URL, user?.userId]); // Dependencies

  // Fetch cohorts from API
  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        setIsLoadingCohorts(true);
        const response = await axios.get(`${API_BASE_URL}/users/${user?.userId}/cohorts`);
        setFetchedCohorts(response.data);
      } catch (error) {
        console.error('Failed to fetch cohorts:', error);
        toast.error('Failed to load cohorts');
      } finally {
        setIsLoadingCohorts(false);
      }
    };

    if (user?.userId) {
      fetchCohorts();
    }
  }, [user?.userId, API_BASE_URL]);

  // SkeletonCard component for loading state
  const SkeletonCard = () => (
    <Card className="border rounded-xl shadow-lg p-4 pt-10 space-y-4 relative">
      {/* Badge Skeleton */}
      <div className="absolute top-2 right-2 z-10">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Heading */}
      <Skeleton className="h-6 w-3/4 mb-2" />

      {/* Cohort details */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      {/* "See Details" button */}
      <Skeleton className="h-4 w-24 my-2" />

      {/* Progress text and bar */}
      <div className="space-y-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-2 w-full" />
      </div>

      {/* Footer Button */}
      <div className="flex justify-end border-t bg-gray-50 pt-3">
        <Skeleton className="h-8 w-20 rounded-[5px]" />
      </div>
    </Card>
  );

  const sortedCohorts = [...(isLoadingCohorts ? [] : fetchedCohorts?.userDetails?.allCohortsWithPrograms)].sort((a: any, b: any) => {
    // First, sort by assignment statistics if available
    if (fetchedCohorts?.assignmentStatistics?.cohortDetails) {
      const statsA = fetchedCohorts.assignmentStatistics.cohortDetails[a.cohortId];
      const statsB = fetchedCohorts.assignmentStatistics.cohortDetails[b.cohortId];

      if (statsA?.pendingAssignments !== statsB?.pendingAssignments) {
        return (statsB?.pendingAssignments || 0) - (statsA?.pendingAssignments || 0);
      }
    }

    // Then, sort by days remaining
    const daysRemainingA = calculateDaysRemaining(a.cohortEndDate);
    const daysRemainingB = calculateDaysRemaining(b.cohortEndDate);

    if (daysRemainingA === null || daysRemainingB === null) return 0;

    if (daysRemainingA > 15 && daysRemainingB <= 15) return -1;
    if (daysRemainingA <= 15 && daysRemainingB > 15) return 1;

    // If both are in the same category (both <= 15 or both > 15)
    if (daysRemainingA !== daysRemainingB) {
      return daysRemainingB - daysRemainingA;
    }

    // Finally, sort alphabetically by cohort name
    return a.cohortName.localeCompare(b.cohortName);
  });

  const handleResume = async (cohortWithProgram) => {
    const daysRemaining = calculateDaysRemaining(
      cohortWithProgram.cohortEndDate
    );
    const status = getCohortStatus(daysRemaining).status;

    if (status === "ended" || daysRemaining < 0) {
      toast.error("This cohort has ended and is no longer accessible");
      return;
    }

    setIsResuming(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/users/select-cohort`, {
        userId: user?.userId,
        cohortId: cohortWithProgram?.cohortId,
      });

      setSelectedCohortWithProgram(cohortWithProgram);
      localStorage.setItem(
        "selectedCohortWithProgram",
        JSON.stringify(cohortWithProgram)
      );
      localStorage.setItem("sessionId", response.data.sessionId);

      navigate("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Server is down or not responding (network error)
        if (!error.response) {
          toast.error(
            "Unable to connect to server. Please check your internet connection and try again."
          );
          return;
        }

        // Server errors (500+ range)
        if (error.response.status >= 500) {
          let errorMessage =
            "An internal server error occurred. Please try again later.";
          if (error.response.status === 503) {
            errorMessage =
              "Service is temporarily unavailable. Please try again later.";
          }
          toast.error(errorMessage);
          return;
        }

        // Business logic errors (400 range) - show in modal
        if (error.response.status >= 400 && error.response.status < 500) {
          const data = error.response.data;
          setErrorModalData({
            error: data?.error || "An unexpected error occurred.",
            deactivationDetails:
              data?.deactivationDetails ||
              "Please contact support for assistance.",
            contactInfo: data?.contactInfo,
          });
          setShowErrorModalOpen(true);
          return;
        }
      }

      // Fallback for any other unexpected errors
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsResuming(false);
    }
  };

  // Count cohorts that are ending soon (<=15 days) or have ended
  const endingSoonCohorts =
    fetchedCohorts?.userDetails?.allCohortsWithPrograms?.filter((cohort) => {
      const daysRemaining = calculateDaysRemaining(cohort.cohortEndDate);
      return daysRemaining !== null && daysRemaining <= 15;
    }) || [];

  const endedCohorts =
    fetchedCohorts?.userDetails?.allCohortsWithPrograms?.filter((cohort) => {
      const daysRemaining = calculateDaysRemaining(cohort.cohortEndDate);
      return daysRemaining !== null && daysRemaining <= 0;
    }) || [];

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

  return (
    <>
      {isResuming && <LoadingOverlay />}

      {/* Render tour only if the user hasn't seen it before */}
      {!hasSeenProductTour && (
        <CohortTour
          onResumeClick={handleResume}
          firstCohortProgress={
            progressData[fetchedCohorts?.userDetails?.allCohortsWithPrograms?.[0]?.program?.programId]
          }
        />
      )}

      {showErrorModalOpen && (
        <ErrorModal
          isOpen={showErrorModalOpen}
          onClose={() => setShowErrorModalOpen(false)}
          errorModalData={errorModalData || undefined}
        />
      )}

      <div className="min-h-screen bg-slate-50 font-inter relative">
        {/* Professional subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 z-0" />
        
        {/* Professional header background */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-slate-800 via-blue-900 to-transparent opacity-10 z-0" />

        <main className="relative z-10 container mx-auto p-6 max-w-7xl">
          {/* Professional Notification System for ending soon programs */}
          <AnimatePresence>
            {showEndDateNotification && endingSoonCohorts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mb-8 space-y-2 sticky top-4 z-50"
              >
                {/* Professional notification banner */}
                <motion.div
                  className="relative rounded-xl border border-amber-200 bg-white/90 backdrop-blur-sm p-4 text-slate-800 flex items-center justify-between shadow-lg"
                  layoutId="notification-header"
                >
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-lg">
                      <Bell className="h-5 w-5 text-amber-600" />
                    </div>

                    {/* Professional notification carousel */}
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
                            <span className="font-medium text-slate-800">
                              Cohort Access Alert
                            </span>
                            <span className="text-sm text-slate-600">
                              {currentCohort?.cohortName} - {calculateDaysRemaining(currentCohort?.cohortEndDate)} days remaining
                            </span>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    {/* Professional counter */}
                    <Badge className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1">
                      {currentNotificationIndex + 1} of {endingSoonCohorts.length}
                    </Badge>

                    {/* Professional navigation controls */}
                    {endingSoonCohorts.length > 1 && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handlePreviousNotification}
                          className="text-slate-600 hover:bg-slate-100 h-8 w-8 p-0 rounded-lg"
                          disabled={currentNotificationIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleNextNotification}
                          className="text-slate-600 hover:bg-slate-100 h-8 w-8 p-0 rounded-lg"
                          disabled={
                            currentNotificationIndex ===
                            endingSoonCohorts.length - 1
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Professional dismiss button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEndDateNotification(false)}
                      className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg px-3 py-1 text-sm font-medium"
                    >
                      Dismiss
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Professional Course Selection Section */}
          <section className="mb-8 continue-learning-section mt-4">
            <div className="mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  Professional Development Programs
                </h2>
                <p className="text-slate-600">
                  Continue building your expertise with our comprehensive learning paths
                </p>
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
              {isLoadingCohorts ? (
                <>
                  {[1, 2, 3].map((index) => (
                    <SkeletonCard key={index} />
                  ))}
                </>
              ) : sortedCohorts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md mx-auto">
                    <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No Programs Available</h3>
                    <p className="text-slate-600">Check back later for new professional development opportunities</p>
                  </div>
                </div>
              ) : (
                sortedCohorts.map((cohortWithProgram, index) => {
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
                      className={`border relative rounded-xl shadow-sm transition-all duration-200
                      ${
                        isDisabled
                          ? "border-slate-200 bg-gradient-to-b from-slate-50 to-white opacity-75"
                          : "border-slate-200 bg-white hover:shadow-lg hover:border-orange-300"
                      } 
                      ${index === 0 ? "program-card-first" : ""}`}
                    >
                      {/* Professional status badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <Badge
                          variant="outline"
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg 
                          ${
                            isDisabled 
                              ? "border-slate-300 bg-slate-50 text-slate-600"
                              : cohortStatus.status === "ending-soon" || cohortStatus.status === "ending-today"
                              ? "border-amber-300 bg-amber-50 text-amber-700"
                              : "border-orange-300 bg-orange-50 text-orange-700"
                          }`}
                        >
                          {cohortStatus.icon}
                          {cohortStatus.label}
                        </Badge>
                      </div>

                      {/* Professional overlay for disabled programs */}
                      {isDisabled && (
                        <div className="absolute inset-0 bg-slate-100 bg-opacity-20 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-20">
                          <div className="bg-white bg-opacity-95 rounded-xl px-6 py-4 shadow-lg border border-slate-200 max-w-[80%] text-center">
                            <Lock className="h-10 w-10 mx-auto mb-3 text-slate-500" />
                            <h4 className="font-semibold text-slate-800 mb-2">
                              Program Completed
                            </h4>
                            <p className="text-sm text-slate-600">
                              This learning program has ended
                            </p>
                          </div>
                        </div>
                      )}

                      <CardContent className="p-6 pt-12">
                        {/* Professional program title with modern truncation */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <h3 className="mb-4 font-semibold text-lg text-slate-800 leading-tight group cursor-help">
                                <span className="line-clamp-2 min-h-[3.5rem] block transition-colors duration-200 group-hover:text-slate-900">
                                  {cohortWithProgram?.program?.programName}
                                </span>
                                {/* Fade effect for long text */}
                                <div className="absolute bottom-0 right-0 w-8 h-6 bg-gradient-to-l from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                              </h3>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              className="max-w-xs p-3 text-sm bg-slate-900 text-white border-slate-700"
                            >
                              <p className="font-medium">{cohortWithProgram?.program?.programName}</p>
                              <p className="text-slate-300 text-xs mt-1">Click to view full program details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Professional cohort details with improved spacing */}
                        <div className="flex flex-col gap-3 mb-6">
                          <div className="flex items-center text-sm text-slate-600 bg-slate-50 rounded-lg p-3 transition-colors duration-200 hover:bg-slate-100">
                            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mr-3 flex-shrink-0">
                              <BookOpen className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-slate-700 truncate block">
                                {cohortWithProgram.cohortName}
                              </span>
                            </div>
                          </div>

                          {cohortWithProgram.cohortEndDate && (
                            <div className="flex items-center text-sm text-slate-600 bg-slate-50 rounded-lg p-3 transition-colors duration-200 hover:bg-slate-100">
                              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="truncate">
                                Ends: {new Date(Number(cohortWithProgram.cohortEndDate) * 1000).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button disabled variant="link" size="sm" className="p-0 h-auto text-orange-600 ">
                                See program details
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View detailed program curriculum and objectives</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Professional progress tracking */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">
                              Progress
                            </span>
                            <span className="text-sm text-slate-600">
                              {isLoading
                                ? "Loading..."
                                : `${progress?.toFixed(1)}% complete`}
                            </span>
                          </div>
                          {isLoading ? (
                            <Skeleton className="h-2 w-full rounded-full" />
                          ) : (
                            <Progress
                              value={progress}
                              className={`h-2 ${isDisabled ? "bg-slate-200" : "bg-slate-200"}`}
                            />
                          )}
                        </div>
                      </CardContent>
                      
                      {/* Professional action footer */}
                      <CardFooter className="flex justify-between items-center border-t border-slate-100 bg-slate-50/50 p-6 rounded-b-xl">
                        {/* <div className="flex items-center text-sm text-slate-600">
                          {progress === 0 ? (
                            <span>Ready to begin</span>
                          ) : (
                            <span>Continue learning</span>
                          )}
                        </div> */}
                        <Button
                          size="sm"
                          disabled={isDisabled}
                          className={`px-6 py-2 font-medium rounded-lg transition-all duration-200
                          ${
                            isDisabled
                              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                              : "bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-md"
                          } 
                          ${index === 0 ? "resume-button" : ""}`}
                          onClick={() => handleResume(cohortWithProgram)}
                        >
                          {progress === 0 ? "Begin Module" : "Continue Learning"}
                        </Button>
                      </CardFooter>
                    </MotionCard>
                  );
                })
              )}
            </div>
          </section>

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
};

export default Dashboard;
