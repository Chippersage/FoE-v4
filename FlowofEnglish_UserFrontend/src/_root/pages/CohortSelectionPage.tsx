"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, LogIn, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// import { ScrollBar } from "@/components/ui/scroll-area";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { user, setSelectedCohortWithProgram } = useUserContext();
  const [progressData, setProgressData] = useState({}); // Store progress per programId
  const [loading, setLoading] = useState({}); // Track loading state for each programId
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate()
  // const tempSessionId = localStorage.getItem("tempSessionId");

    useEffect(() => {
      if (!user?.cohorts) return;

      user.cohorts.forEach((cohort) => {
        const programId = cohort?.program?.programId;
        const userId = user?.userId;
        if (!programId || !userId) return;

        // Set loading state
        setLoading((prev) => ({ ...prev, [programId]: true }));

        // Fetch progress data
        fetch(`${API_BASE_URL}/reports/program/${programId}/user/${userId}/progress`)
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

const handleResume = async (cohortWithProgram: string) => {
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

  const challenges = [
    {
      id: 1,
      title: "Daily English Words",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 2,
      title: "My Quick One Sentence A Day Journal",
      image: "/placeholder.svg?height=100&width=100",
    },
  ];

  return (
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

      <main className="container mx-auto max-w-6xl p-4 mt-[120px]">
        {/* Welcome Banner */}
        {/* <div className="mb-6 rounded-lg bg-emerald-500 p-4 text-white">
          <h1 className="text-xl font-medium">Welcome Nalini!</h1>
        </div> */}

        {/* Continue Learning Section */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Continue Learning</h2>
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
            className="flex gap-4 pb-4 w-full overflow-x-auto custom-scrollbar-2"

            // style={{ width: "max-content" }}
          >
            {user?.cohorts?.map((cohortWithProgram) => {
              const programId = cohortWithProgram?.program?.programId;
              const progress = progressData[programId];
              const isLoading = loading[programId];
              return (
                <Card
                  key={cohortWithProgram?.program?.programId}
                  className="min-w-[280px] border border-gray-200 md:min-w-[400px] bg-gradient-to-b from-[#CAF2BC] to-white"
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
                      className="bg-[#64CE80] hover:bg-emerald-600 rounded-[5px]"
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

        {/* Bottom Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Daily Challenge */}
          <section>
            <h2 className="mb-4 text-xl font-bold">Daily Challenge</h2>
            <Card className="bg-gradient-to-b from-[#CAF2BC] to-white">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {challenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="flex flex-col items-center justify-center rounded-lg p-2 text-center transition-all hover:bg-gray-100"
                    >
                      <div className="mb-2 overflow-hidden rounded-full">
                        <img
                          src={challenge.image || "/placeholder.svg"}
                          alt={challenge.title}
                          width={100}
                          height={100}
                          className="h-24 w-24 object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {challenge.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Your Activity */}
          <section>
            <h2 className="mb-4 text-xl font-bold">Your Activity</h2>
            <Card className="bg-gradient-to-b from-[#CAF2BC] to-white">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <LogIn className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium">Last login:</p>
                      <p className="text-sm text-gray-600">
                        March 10, 2025, 2:30 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium">Total time spent:</p>
                      <p className="text-sm text-gray-600">12h 45m</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="mb-2 text-sm font-medium">
                      Weekly progress
                    </h3>
                    <div className="grid grid-cols-7 gap-1">
                      {[70, 45, 80, 30, 60, 20, 50].map((value, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="h-16 w-full">
                            <div
                              className="bg-emerald-500"
                              style={{
                                height: `${value}%`,
                                width: "100%",
                                marginTop: "auto",
                              }}
                            ></div>
                          </div>
                          <span className="mt-1 text-xs text-gray-500">
                            {["M", "T", "W", "T", "F", "S", "S"][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
