// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleAlert, CircleCheck, Trophy, Lock, Calendar } from "lucide-react";
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
  const isMentor = user?.userType === "Mentor";

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
    // Check if stage is locked (only for non-mentors)
    // @ts-ignore
    const isStageLocked = stagesArray[index]?.isLocked && !isMentor;
    
    if ((stagesArray[index]?.stageEnabled || isMentor) && !isStageLocked) {
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
              // @ts-ignore
              const isStageLocked = stage.isLocked && !isMentor;
              const isStageAccessible = (stage.stageEnabled || isMentor) && !isStageLocked;
              // @ts-ignore
              const daysUntilAvailable = stage.daysUntilAvailable || 0;
              
              return (
                <Card
                  ref={cardRef}
                  key={index}
                  className={`rounded-[2px] bg-gradient-to-b from-[#CAF2BC] to-white relative ${
                    isStageLocked ? "opacity-60" : ""
                  }`}
                >
                  {/* Lock overlay for locked stages */}
                  {isStageLocked && (
                    <div className="absolute inset-0 bg-gray-100 bg-opacity-70 rounded-[2px] flex items-center justify-center z-10">
                      <div className="text-center">
                        <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-600 font-medium text-sm">
                          Available from {stage.stageAvailableDate}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle
                        className={`text-lg ${
                          isStageAccessible ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {/* @ts-ignore */}
                        {stage.stageName}
                        {isStageLocked && (
                          <Lock className="w-4 h-4 inline-block ml-2 text-gray-500" />
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
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
                          isStageAccessible && (
                            <ChevronDown
                              className={`h-5 w-5 transition-transform duration-300 ${
                                expandedModule === index ? "rotate-180" : ""
                              } text-gray-900 cursor-pointer`}
                              onClick={() => {
                                toggleExpand(index);
                                handleScrollToCard(cardRef);
                              }}
                            />
                          )
                        )}
                        
                        {/* Days until available badge */}
                        {isStageLocked && daysUntilAvailable > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-600 border-blue-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs font-medium">
                              Opens in {daysUntilAvailable} day{daysUntilAvailable !== 1 ? 's' : ''}
                            </span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent
                    className={`relative ${
                      expandedModule !== index && "pb-16"
                    }`}
                  >
                    <p
                      className={`text-sm mb-4 font-openSans font-semibold ${
                        isStageAccessible ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {/* @ts-ignore */}
                      {stage.stageDesc}
                      {isStageLocked && (
                        <span className="block text-xs text-gray-500 mt-1">
                          🔒 Unlocks on {stage.stageAvailableDate}
                          {daysUntilAvailable > 0 && (
                            <span className="block text-blue-600 font-medium">
                              Available in {daysUntilAvailable} day{daysUntilAvailable !== 1 ? 's' : ''}
                            </span>
                          )}
                        </span>
                      )}
                    </p>
                    {expandedModule !== index && (
                      <div className="absolute bottom-4 right-4 w-1/2">
                        <Button
                          onClick={() => {
                            toggleExpand(index);
                            handleScrollToCard(cardRef);
                          }}
                          className={`w-full transition-all duration-300 ease-in-out h-9 ${
                            isStageAccessible
                              ? // @ts-ignore
                                stage.stageCompletionStatus === "yes"
                                ? "bg-green-500 text-white hover:bg-[#DB5788]"
                                : "bg-[#5bc3cd] text-white hover:bg-[#DB5788]"
                              : "bg-gray-400 text-white hover:bg-gray-400 cursor-not-allowed"
                          } ${
                            index === 0 &&
                            stage?.stageCompletionStatus === "no" &&
                            isStageAccessible
                              ? "lets-go-button"
                              : ""
                          }`}
                          disabled={isStageLocked && !isMentor}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span>
                              {isStageLocked 
                                ? "Locked" 
                                : isStageAccessible
                                  ? stage.stageCompletionStatus === "yes"
                                    ? "Well Done!"
                                    : "Let's Go"
                                  : "Not Yet..."}
                            </span>
                            {isStageLocked ? (
                              <Lock className="h-4 w-4" />
                            ) : isStageAccessible ? (
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
                              // Check if stage is locked (only for non-mentors)
                              (!isStageLocked || isMentor) &&
                              // @ts-ignore
                              (unit.completionStatus !== "disabled" ||
                                unitIndex === 0 ||
                                isMentor)
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
                              (unit.completionStatus === "disabled" || isStageLocked) &&
                              !isMentor && // MENTOR ACCESS: Don't disable for mentors
                              "hover:cursor-not-allowed opacity-60"
                            } ${
                              // @ts-ignore
                              hoveredUnit === unit.unitId &&
                              // @ts-ignore
                              (unit.completionStatus !== "disabled" || isMentor) && // MENTOR ACCESS: Allow hover for all units
                              !isStageLocked // Don't apply hover effect to locked stages
                                ? "bg-[#DB5788]"
                                : ""
                            } hover:transform hover:scale-105 hover:perspective-[1000px]`}
                            // @ts-ignore
                            onMouseEnter={() => !isStageLocked && setHoveredUnit(unit.unitId)}
                            onMouseLeave={() => setHoveredUnit(null)}
                            onClick={(e) => {
                              if (isStageLocked && !isMentor) {
                                e.preventDefault();
                                return;
                              }
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
                                    (unit.completionStatus !== "disabled" || isMentor) && // MENTOR ACCESS: Allow hover for all units
                                    !isStageLocked
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
                                    (unit.completionStatus !== "disabled" || isMentor) && // MENTOR ACCESS: Allow hover for all units
                                    !isStageLocked
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
                                  (unit.completionStatus !== "disabled" || isMentor) && // MENTOR ACCESS: Allow hover for all units
                                  !isStageLocked
                                    ? "/icons/User-icons/unit.svg"
                                    : "icons/User-icons/unit.png"
                                }
                                alt="unit"
                                className="w-5 h-5"
                              />
                            </div>
                            <span
                              className={`text-sm truncate ${
                                isStageAccessible ? "text-gray-900" : "text-gray-400"
                              } ${
                                // @ts-ignore
                                hoveredUnit === unit.unitId &&
                                // @ts-ignore
                                (unit.completionStatus !== "disabled" || isMentor) && // MENTOR ACCESS: Allow hover for all units
                                !isStageLocked
                                  ? "opacity-100 transition-all duration-100 ease-in-out font-semibold text-white"
                                  : ""
                              }`}
                            >
                              {/* @ts-ignore */}
                              {unit.unitName}
                              {isStageLocked && !isMentor && (
                                <Lock className="w-3 h-3 inline-block ml-1" />
                              )}
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