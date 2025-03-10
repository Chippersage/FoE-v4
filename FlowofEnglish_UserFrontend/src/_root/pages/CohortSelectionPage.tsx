"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Clock, LogIn, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollBar } from "@/components/ui/scroll-area";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Dashboard() {
  // Scroll state and handlers remain the same but won't be visible with only one item
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false); // Will be false with only one item

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

  // Only one course in the array
  const courses = [
    {
      id: 1,
      title: "Professional English for Teachers - Level 1",
      progress: 10,
    },
    {
      id: 2,
      title: "AIF Grade 6",
      progress: 50,
    },
  ];

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
    <div className="min-h-screen bg-gray-300 font-sans w-full mt-[120px]">
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
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Continue Learning</h2>
            {/* Navigation buttons are hidden when there's only one item */}
            <div className="flex gap-2 invisible">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollLeft}
                disabled={true}
                className="h-8 w-8 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Scroll left</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollRight}
                disabled={true}
                className="h-8 w-8 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Scroll right</span>
              </Button>
            </div>
          </div>

          {/* With only one item, the ScrollArea will still be present but won't be scrollable */}
          <ScrollArea className="w-full">
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-4 pb-4"
            >
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="min-w-[280px] border border-gray-200 md:min-w-[320px] w-full md:w-auto"
                >
                  <CardContent className="p-4">
                    <h3 className="mb-2 line-clamp-2 min-h-[48px] font-medium">
                      {course.title}
                    </h3>
                    <Button
                      variant="link"
                      className="mb-2 h-auto p-0 text-emerald-600"
                    >
                      See Details
                    </Button>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {course.progress}% complete
                      </span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </CardContent>
                  <CardFooter className="flex justify-end border-t bg-gray-50 p-2">
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      Resume
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {/* ScrollBar will be present but not visible/functional with only one item */}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        {/* Bottom Sections remain the same */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Daily Challenge */}
          <section>
            <h2 className="mb-4 text-xl font-bold">Daily Challenge</h2>
            <Card>
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
            <Card>
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
