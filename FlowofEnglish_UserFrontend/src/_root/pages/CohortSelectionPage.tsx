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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// import { ScrollBar } from "@/components/ui/scroll-area";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import WordOfTheDay from "@/components/WordADay";
import { AnimatePresence, motion } from "framer-motion";
import CohortTour from "@/components/tours/CohortTour";
import { Badge } from "@/components/ui/badge";

const courseColors = [
  "from-pink-500 to-rose-500",
  "from-violet-500 to-purple-500",
  "from-cyan-500 to-blue-500",
  "from-amber-400 to-orange-500",
  "from-emerald-500 to-green-500",
  "from-red-500 to-pink-500",
];

export default function Dashboard() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
  const [notificationCounts, setNotificationCounts] = useState({});
  // const tempSessionId = localStorage.getItem("tempSessionId");

useEffect(() => {
  const timer = setTimeout(() => {
    setShowAssignments(true);
  }, 2000); // 3 seconds

  return () => clearTimeout(timer); // cleanup on unmount
}, []);

  useEffect(() => {
    if (!user?.cohorts) return;

    user.cohorts.forEach((cohort) => {
      const programId = cohort?.program?.programId;
      const userId = user?.userId;
      if (!programId || !userId) return;

      // Set loading state
      setLoading((prev) => ({ ...prev, [programId]: true }));

      // Fetch progress data
      fetch(
        `${API_BASE_URL}/reports/program/${programId}/user/${userId}/progress`
      )
        .then((res) => res.json())
        .then((data) => {
          const { completedSubconcepts, totalSubconcepts } = data;
          const progress =
            totalSubconcepts > 0
              ? (completedSubconcepts / totalSubconcepts) * 100
              : 0;

          // Update progress state
          setProgressData((prev) => ({ ...prev, [programId]: progress }));
        })
        .catch((error) => console.error("Error fetching progress:", error))
        .finally(() => {
          setLoading((prev) => ({ ...prev, [programId]: false }));
        });
    });
  }, [user?.cohorts]);

  useEffect(() => {
    if (!user?.cohorts) return;

    // Fetch assignments for each cohort
    user.cohorts.forEach((cohort) => {
      const cohortId = cohort?.cohortId;
      if (!cohortId) return;

      // Fetch assignments data
      fetch(`${API_BASE_URL}/assignments/cohort/${cohortId}`)
        .then((res) => res.json())
        .then((data) => {
          // Count assignments with correctedDate as null
          const uncorrectedCount = data.filter(
            (assignment) => assignment.correctedDate === null
          ).length;

          // Update notification counts state
          setNotificationCounts((prev) => ({
            ...prev,
            [cohortId]: uncorrectedCount,
          }));
        })
        .catch((error) =>
          console.error(
            `Error fetching assignments for cohort ${cohortId}:`,
            error
          )
        );
    });
  }, [user?.cohorts, API_BASE_URL]);

  const handleResume = async (cohortWithProgram: string) => {
    console.log("resume clicked");
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
        // tempSessionId,
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
    word: "Serendipity",
    partOfSpeech: "noun",
    definition:
      "The occurrence and development of events by chance in a happy or beneficial way.",
    example:
      "A fortunate stroke of serendipity came my way when I met my business partner at a conference.",
    pronunciation: "/ˌsɛr(ə)nˈdɪpɪti/",
  };

  const riddle = {
    question:
      "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answer: "An echo",
    hint: "Think about what happens when you shout in a canyon.",
  };

  return (
    <>
      {/* Render tour only if the user hasn't seen it before */}
      {!hasSeenProductTour && <CohortTour onResumeClick={handleResume} />}

      <div className="min-h-screen bg-slate-100 font-sans">
        {/* Header */}
        {/* <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-emerald-600">Flow</span>
          <span className="text-lg font-medium">of English</span>
        </div>
        <Button variant="outline" size="sm" className="text-emerald-600">
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </header> */}

        <main className="container mx-auto max-w-6xl p-4">
          {/* Welcome Banner */}
          {/* <div className="mb-6 rounded-lg bg-emerald-500 p-4 text-white">
          <h1 className="text-xl font-medium">Welcome Nalini!</h1>
        </div> */}

          {/* Continue Learning Section */}
          <section className="mb-8 continue-learning-section">
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

            {/* <ScrollArea className="w-full"> */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-4 pb-4 w-full overflow-x-auto custom-scrollbar-2 snap-x snap-mandatory"
            >
              {user?.cohorts?.map((cohortWithProgram, index) => {
                const programId = cohortWithProgram?.program?.programId;
                const progress = progressData[programId];
                const isLoading = loading[programId];
                return (
                  <Card
                    key={cohortWithProgram?.program?.programId}
                    className={`min-w-[280px] max-w-[280px] border border-gray-200 md:min-w-[400px] md:max-w-[400px] bg-gradient-to-b from-[#CAF2BC] to-white rounded-xl shadow-lg snap-center ${
                      index === 0 ? "program-card-first" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <h3 className="mb-2 line-clamp-2 min-h-[48px] font-medium">
                        {cohortWithProgram?.program?.programName}
                      </h3>
                      <Button
                        variant="link"
                        className="mb-2 h-auto p-0 text-emerald-600"
                      >
                        See Details
                      </Button>
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
                        <Progress value={progress} className="h-2" />
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end border-t bg-gray-50 p-2">
                      <Button
                        size="sm"
                        className={`bg-gradient-to-r from-emerald-500 to-green-500 hover:bg-emerald-600 rounded-[5px] ${
                          index === 0 ? "resume-button" : ""
                        }`}
                        onClick={() => handleResume(cohortWithProgram)}
                      >
                        Resume
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            {/* <ScrollBar orientation="horizontal" />
          </ScrollArea> */}
          </section>

          {/* Daily Challenge Section - Redesigned */}
          {userType === "mentor" || userType === "Mentor" ? (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-emerald-700">
                  Manage Cohort Assignments
                </h2>
                {/* <Button
                  onClick={() => setShowAssignments(!showAssignments)}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-teal-400 hover:to-pink-500 text-white"
                >
                  <ClipboardList className="mr-2 h-5 w-5" />
                  {showAssignments
                    ? "Hide Assignments"
                    : "View All Assignments"}
                  {showAssignments ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </Button> */}
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
                    {user?.cohorts?.map((course, index) => {
                      const color = "from-emerald-500 to-green-500";
                      const notificationCount =
                        notificationCounts[course.cohortId] || 0;

                      return (
                        <Card
                          key={course.cohortId}
                          className="group overflow-hidden border-0 bg-white dark:bg-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 dark:shadow-gray-900/30 rounded-xl relative"
                        >
                          <div
                            className={`h-2 w-full bg-gradient-to-r ${color}`}
                          />

                          {/* Animated notification badge */}
                          <AnimatePresence>
                            {notificationCount > 0 && (
                              <motion.div
                                className="absolute top-3 right-3 z-10"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 15,
                                }}
                              >
                                <div className="relative">
                                  <motion.div
                                    className="absolute -inset-1 rounded-full bg-red-300 opacity-70 blur-sm"
                                    animate={{
                                      scale: [1, 1.2, 1],
                                      opacity: [0.7, 0.9, 0.7],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      repeatType: "reverse",
                                    }}
                                  />
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs font-bold text-white shadow-lg">
                                    {notificationCount}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <CardContent className="p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                              <BookOpen className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                            </div>
                            <h3 className="text-xl font-semibold tracking-tight">
                              {course.cohortName}
                            </h3>
                          </CardContent>
                          <CardFooter className="p-6 pt-0">
                            <Button
                              asChild
                              className={`w-full bg-gradient-to-r ${color} hover:opacity-90 transition-all duration-300 group-hover:translate-y-0 translate-y-0 border-0`}
                            >
                              <Link
                                to={`/cohorts/${course.cohortId}/assignments`}
                                className="flex items-center justify-center gap-2"
                              >
                                View Assignments
                                {notificationCount > 0 && (
                                  <motion.span
                                    className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-emerald-600"
                                    initial={{ y: 0 }}
                                    animate={{ y: [0, -2, 0] }}
                                    transition={{
                                      duration: 1.5,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                    }}
                                  >
                                    {notificationCount}
                                  </motion.span>
                                )}
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
        </main>
      </div>
    </>
  );
}
