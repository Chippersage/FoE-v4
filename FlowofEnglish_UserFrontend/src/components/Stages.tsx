// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleAlert, CircleCheck, Trophy } from "lucide-react";
import { ChevronDown, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
// import { Book } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {} from "lucide-react";
import DashboardTour from "./tours/DashboardTour";
import { useUserContext } from "@/context/AuthContext";

// Define a type for the stage object
// interface Stage {
//   stageEnabled: boolean;
//   stageCompletionStatus: string; // or 'yes' | 'no' based on your application
//   stageName: string;
//   stageDesc: string;
// }

// Define a type for the props that Stages component receives
// interface StagesProps {
//   stages: Stage[] | null; // or you can define a more complex type based on your actual data structure
// }

// @ts-ignore
export default function Stages({
  stages,
  programCompletionStatus,
  isDataLoaded,
}) {
  const [expandedModule, setExpandedModule] = useState(null);
  const [hoveredUnit, setHoveredUnit] = useState(null);
  const containerRef = useRef(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [runTour, setRunTour] = useState(false);
  const [hasSeenDashboardTour, setHasSeenDashboardTour] = useState(false);
  
  // MENTOR ACCESS: Get user context and check if user is Mentor
  const { user } = useUserContext();
  const isMentor = user?.userType?.toLowerCase() === "mentor";

  useEffect(() => {
    // Check if user has seen the tour before or if cohort tour was skipped
    const seenTour = localStorage.getItem("hasSeenDashboardTour");
    const cohortTourSkipped =
      localStorage.getItem("cohortTourSkipped") === "true";

    setHasSeenDashboardTour(!!seenTour || cohortTourSkipped);

    // Only run tour if data is loaded and user hasn't seen it before and cohort tour wasn't skipped
    if (isDataLoaded && !seenTour && !cohortTourSkipped) {
      setRunTour(true);
    }
  }, [isDataLoaded]);

  // Ensure that stages is not null or undefined before converting it to an array
  const stagesArray = stages ? Object.values(stages) : [];
  // console.log(stagesArray)

  const handleScrollToCard = (cardRef: React.RefObject<HTMLDivElement>) => {
    cardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // @ts-ignore
  const toggleExpand = (index) => {
    // MENTOR ACCESS: Allow mentors to expand any stage
    // @ts-ignore
    if (stagesArray[index]?.stageEnabled || isMentor) {
      setExpandedModule(expandedModule === index ? null : index);
      setStepIndex((prevStepIndex) => prevStepIndex + 1);
    }
  };

  return (
    <>
      {!hasSeenDashboardTour && (
        <DashboardTour
          stepIndex={stepIndex}
          setStepIndex={setStepIndex}
          runTour={runTour}
          setRunTour={setRunTour}
        />
      )}
      <div className="w-full max-h-[520px] max-w-lg mx-auto py-5 px-6 bg-white bg-opacity-50 rounded-[3px]  no-scrollbar relative learning-path-section">
        {/* Fixed Title */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold font-openSans">
            Your Learning Path
          </h3>
          {programCompletionStatus === "yes" && (
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 text-sm font-medium flex items-center gap-2 mt-2">
              <Trophy className="w-4 h-4" />
              All Stages Complete!
            </div>
          )}
        </div>
        {/* Scrollable Cards */}
        <div
          ref={containerRef}
          className="space-y-4 overflow-y-auto max-h-[400px] no-scrollbar "
        >
          {stagesArray.length > 0 ? (
            stagesArray.map((stage, index) => {
              const cardRef = useRef(null);
              return (
                <Card
                  ref={cardRef}
                  key={index}
                  className={`rounded-[2px] bg-gradient-to-b from-[#CAF2BC] to-white`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle
                        className={`text-lg ${
                          // @ts-ignore
                          stage.stageEnabled || isMentor ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {/* @ts-ignore */}
                        {stage.stageName}
                      </CardTitle>
                      {stage?.stageCompletionStatus ===
                      "Stage Completed without Assignments" ? (
                        <Badge
                          variant="outline"
                          className="bg-orange-50 text-orange-600 border-orange-200 px-3 py-1 rounded-full"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Pending
                        </Badge>
                      ) : stage?.stageCompletionStatus === "yes" ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-600 border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </Badge>
                      ) : (
                        (stage.stageEnabled || isMentor) && (
                          <ChevronDown
                            className={`h-5 w-5 transition-transform duration-300 ${
                              expandedModule === index ? "rotate-180" : ""
                            } text-gray-900`}
                            onClick={() => {
                              toggleExpand(index);
                              handleScrollToCard(cardRef);
                            }}
                          />
                        )
                      )}

                      {/* @ts-ignore */}
                      {/* {stage.stageEnabled && (
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-300 ${
                          expandedModule === index ? "rotate-180" : ""
                        } text-gray-900`}
                        onClick={() => {
                          toggleExpand(index);
                          handleScrollToCard(cardRef);
                        }}
                      />
                    )} */}
                    </div>
                  </CardHeader>
                  <CardContent
                    className={`relative ${
                      expandedModule !== index && "pb-16"
                    }`}
                  >
                    <p
                      className={`text-sm mb-4 font-openSans font-semibold ${
                        // @ts-ignore
                        stage.stageEnabled || isMentor ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {/* @ts-ignore */}
                      {stage.stageDesc}
                    </p>
                    {expandedModule !== index && (
                      <div className="absolute bottom-4 right-4 w-1/2">
                        <Button
                          onClick={() => {
                            toggleExpand(index);
                            handleScrollToCard(cardRef);
                          }}
                          className={`w-full transition-all duration-300 ease-in-out h-9 ${
                            // @ts-ignore
                            stage.stageEnabled || isMentor
                              ? // @ts-ignore
                                stage.stageCompletionStatus === "yes"
                                ? "bg-green-500 text-white hover:bg-[#DB5788]"
                                : "bg-[#5bc3cd] text-white hover:bg-[#DB5788]"
                              : "bg-[#5bc3cd] text-white hover:bg-[#5bc3cd] cursor-not-allowed"
                          } ${
                            index === 0 &&
                            stage?.stageCompletionStatus === "no" &&
                            (stage?.stageEnabled || isMentor)
                              ? "lets-go-button"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span>
                              {stage.stageEnabled || isMentor
                                ? stage.stageCompletionStatus === "yes"
                                  ? "Well Done!"
                                  : "Let's Go"
                                : "Not Yet..."}
                            </span>
                            {stage.stageEnabled || isMentor ? (
                              stage.stageCompletionStatus === "yes" ? (
                                <img
                                  src="/icons/User-icons/medal.png"
                                  alt="Badge"
                                  className="h-5 w-5"
                                />
                              ) : (
                                <img
                                  src="/icons/User-icons/running.png"
                                  alt="Go Icon"
                                  className="h-5 w-5"
                                />
                              )
                            ) : (
                              <img
                                src="/icons/User-icons/loading.png"
                                alt="Loading Icon"
                                className="h-5 w-5 animate-spin"
                              />
                            )}
                          </div>
                        </Button>
                      </div>
                    )}

                    <div
                      className={`mt-4 grid grid-cols-2 gap-4 overflow-visible transition-all duration-300 ease-in-out ${
                        expandedModule === index
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0 hidden"
                      }`}
                    >
                      {/* @ts-ignore */}
                      {stage.units ? (
                        // @ts-ignore
                        Object.values(stage.units).map((unit, unitIndex) => (
                          <Link
                            // @ts-ignore
                            to={
                              // MENTOR ACCESS: Allow mentors to access all units
                              // @ts-ignore
                              unit.completionStatus !== "disabled" ||
                              unitIndex === 0 ||
                              isMentor
                                ? // @ts-ignore
                                  `/subconcepts/${unit.unitId}`
                                : null
                            }
                            key={unitIndex}
                            className={`relative flex cursor-pointer items-center space-x-2 p-2 rounded-[3px] transition-all duration-200 ease-in-out ${
                              // @ts-ignore
                              unit.completionStatus === "incomplete" &&
                              "bg-[#5BC3CD] active-unit"
                            } ${
                              // @ts-ignore
                              unit.completionStatus === "disabled" &&
                              !isMentor && // MENTOR ACCESS: Don't disable for mentors
                              "hover:cursor-not-allowed"
                            } ${
                              // @ts-ignore
                              hoveredUnit === unit.unitId &&
                              // @ts-ignore
                              (unit.completionStatus !== "disabled" || isMentor) // MENTOR ACCESS: Allow hover for all units
                                ? "bg-[#DB5788]"
                                : ""
                            } hover:transform hover:scale-105 hover:perspective-[1000px]`}
                            // @ts-ignore
                            onMouseEnter={() => setHoveredUnit(unit.unitId)}
                            onMouseLeave={() => setHoveredUnit(null)}
                            onClick={() => {
                              localStorage.setItem(
                                "allUnitsOfCurrentStage",
                                // @ts-ignore
                                JSON.stringify(Object.values(stage.units))
                              );
                              // @ts-ignore
                              localStorage.setItem(
                                "currentUnit",
                                unit.unitName
                              );
                            }}
                          >
                            {/* @ts-ignore */}
                            {(unit.completionStatus === "yes" ||
                              unit.completionStatus?.toLowerCase() ===
                                "unit completed without assignments") &&
                              (unit.completionStatus === "yes" ? (
                                <CircleCheck
                                  className={`absolute top-0 left-0 ${
                                    hoveredUnit === unit.unitId &&
                                    // @ts-ignore
                                    (unit.completionStatus !== "disabled" || isMentor) // MENTOR ACCESS: Allow hover for all units
                                      ? "text-white"
                                      : "text-green-500"
                                  }`}
                                  size={16}
                                />
                              ) : (
                                <CircleAlert
                                  className={`absolute top-0 left-0 ${
                                    hoveredUnit === unit.unitId &&
                                    // @ts-ignore
                                    (unit.completionStatus !== "disabled" || isMentor) // MENTOR ACCESS: Allow hover for all units
                                      ? "text-white"
                                      : "text-red-500"
                                  }`}
                                  size={16}
                                />
                              ))}
                            <div className="flex-shrink-0 transition-all duration-100">
                              <img
                                src={
                                  // @ts-ignore
                                  hoveredUnit === unit.unitId &&
                                  // @ts-ignore
                                  (unit.completionStatus !== "disabled" || isMentor) // MENTOR ACCESS: Allow hover for all units
                                    ? "/icons/User-icons/unit.svg"
                                    : "icons/User-icons/unit.png"
                                }
                                alt="unit"
                                className="w-5 h-5"
                              />
                            </div>
                            <span
                              className={`text-sm truncate ${
                                // @ts-ignore
                                stage.stageEnabled || isMentor
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              } ${
                                // @ts-ignore
                                hoveredUnit === unit.unitId &&
                                // @ts-ignore
                                (unit.completionStatus !== "disabled" || isMentor) // MENTOR ACCESS: Allow hover for all units
                                  ? "opacity-100 transition-all duration-100 ease-in-out font-semibold text-white"
                                  : ""
                              }`}
                            >
                              {/* @ts-ignore */}
                              {unit.unitName}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <p className="text-gray-500">No units available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="text-gray-500">No stages available</p>
          )}
        </div>
      </div>
    </>
  );
}