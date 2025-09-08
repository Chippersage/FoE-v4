// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, CircleAlert, CircleCheck, Trophy } from "lucide-react";
import { ChevronDown, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
// import { Book } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {} from "lucide-react";
import DashboardTour from "./tours/DashboardTour";
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
    // Allow expansion only if the stage is enabled
    // @ts-ignore
    if (stagesArray[index]?.stageEnabled) {
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
      <div className="w-full space-y-6 learning-path-section">
        {/* Enhanced Progress Overview */}
        {programCompletionStatus === "yes" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-500 rounded-lg shadow-sm">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-emerald-800 font-bold text-lg">Congratulations!</h4>
              <p className="text-emerald-700">You have completed all stages in this learning path.</p>
            </div>
          </div>
        )}

        {/* Module Cards Container */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#fed7aa transparent'}}>
          {stagesArray.length > 0 ? (
            stagesArray.map((stage, index) => {
              const cardRef = useRef(null);
              const isCompleted = stage?.stageCompletionStatus === "yes";
              const isPending = stage?.stageCompletionStatus === "Stage Completed without Assignments";
              const isEnabled = stage?.stageEnabled;
              const isExpanded = expandedModule === index;
              
              return (
                <Card
                  ref={cardRef}
                  key={index}
                  className={`group transition-all duration-200 hover:shadow-md border ${
                    isCompleted 
                      ? 'border-green-200 bg-green-50' 
                      : isPending
                      ? 'border-amber-200 bg-amber-50'
                      : isEnabled
                      ? 'border-slate-200 bg-white hover:border-slate-300'
                      : 'border-slate-200 bg-slate-50'
                  } rounded-lg overflow-hidden`}
                >
                  {/* Stage Header */}
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                          isCompleted 
                            ? 'bg-green-100' 
                            : isPending
                            ? 'bg-amber-100'
                            : isEnabled
                            ? 'bg-orange-100'
                            : 'bg-slate-200'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : isPending ? (
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                          ) : isEnabled ? (
                            <Clock className="w-5 h-5 text-orange-600" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-slate-400 rounded-full animate-spin border-t-transparent" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <CardTitle className={`text-xl font-bold mb-2 transition-colors ${
                            isEnabled ? "text-slate-800" : "text-slate-500"
                          }`}>
                            {/* @ts-ignore */}
                            {stage.stageName}
                          </CardTitle>
                          <p className={`text-sm leading-relaxed ${
                            isEnabled ? "text-slate-600" : "text-slate-400"
                          }`}>
                            {/* @ts-ignore */}
                            {stage.stageDesc}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge & Expand Button */}
                      <div className="flex items-center space-x-2">
                        {isPending ? (
                          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg font-medium">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Pending
                          </Badge>
                        ) : isCompleted ? (
                          <Badge className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-lg font-medium">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Completed
                          </Badge>
                        ) : isEnabled ? (
                          <button
                            onClick={() => {
                              toggleExpand(index);
                              handleScrollToCard(cardRef);
                            }}
                            className="flex items-center justify-center px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors duration-200 text-sm font-medium text-slate-700"
                          >
                            {isExpanded ? (
                              <>
                                <span>Hide Units</span>
                                <ChevronUp className="ml-2 h-4 w-4" />
                              </>
                            ) : (
                              <>
                                <span>View Units</span>
                                <ChevronDown className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Action Button for Collapsed State */}
                    {!isExpanded && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            toggleExpand(index);
                            handleScrollToCard(cardRef);
                          }}
                          disabled={!isEnabled}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                            isEnabled
                              ? isCompleted
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md"
                                : "bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-md"
                              : "bg-slate-300 text-slate-500 cursor-not-allowed"
                          } ${
                            index === 0 &&
                            stage?.stageCompletionStatus === "no" &&
                            stage?.stageEnabled
                              ? "lets-go-button"
                              : ""
                          }`}
                        >
                          <span>
                            {isEnabled
                              ? isCompleted
                                ? "Well Done!"
                                : "Let's Go"
                              : "Not Yet..."}
                          </span>
                          {isEnabled ? (
                            isCompleted ? (
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
                        </button>
                      </div>
                    )}

                    {/* Expanded Units Grid */}
                    <div
                      className={`transition-all duration-500 ease-in-out ${
                        isExpanded
                          ? "max-h-96 opacity-100 mt-6"
                          : "max-h-0 opacity-0 overflow-hidden"
                      }`}
                    >
                      {/* @ts-ignore */}
                      {stage.units && (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-slate-800">Learning Units</h4>
                            <span className="text-sm text-slate-500">
                              {/* @ts-ignore */}
                              {Object.values(stage.units).length} units available
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* @ts-ignore */}
                            {Object.values(stage.units).map((unit, unitIndex) => (
                              <Link
                                // @ts-ignore
                                to={
                                  // @ts-ignore
                                  unit.completionStatus !== "disabled" || unitIndex === 0
                                    ? // @ts-ignore
                                      `/subconcepts/${unit.unitId}`
                                    : null
                                }
                                key={unitIndex}
                                className={`group flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 border ${
                                  // @ts-ignore
                                  unit.completionStatus === "incomplete"
                                    ? "bg-orange-50 border-orange-200 hover:bg-orange-100 active-unit"
                                    : // @ts-ignore
                                    unit.completionStatus === "yes"
                                    ? "bg-green-50 border-green-200 hover:bg-green-100"
                                    : // @ts-ignore
                                    unit.completionStatus?.toLowerCase() === "unit completed without assignments"
                                    ? "bg-amber-50 border-amber-200 hover:bg-amber-100"
                                    : "bg-slate-50 border-slate-200 opacity-60 hover:cursor-not-allowed"
                                }`}
                                // @ts-ignore
                                onMouseEnter={() => setHoveredUnit(unit.unitId)}
                                onMouseLeave={() => setHoveredUnit(null)}
                                onClick={() => {
                                  localStorage.setItem(
                                    "allUnitsOfCurrentStage",
                                    // @ts-ignore
                                    JSON.stringify(Object.values(stage.units))
                                  );
                                  localStorage.setItem(
                                    "currentUnit",
                                    // @ts-ignore
                                    unit.unitName
                                  );
                                }}
                              >
                                {/* Unit Status Icon */}
                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                                  // @ts-ignore
                                  unit.completionStatus === "yes"
                                    ? "bg-green-100"
                                    : // @ts-ignore
                                    unit.completionStatus === "incomplete"
                                    ? "bg-orange-100"
                                    : // @ts-ignore
                                    unit.completionStatus?.toLowerCase() === "unit completed without assignments"
                                    ? "bg-amber-100"
                                    : "bg-slate-200"
                                }`}>
                                  {/* @ts-ignore */}
                                  {unit.completionStatus === "yes" ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  ) : // @ts-ignore
                                  unit.completionStatus?.toLowerCase() === "unit completed without assignments" ? (
                                    <AlertCircle className="w-4 h-4 text-amber-600" />
                                  ) : (
                                    <img
                                      src="/icons/User-icons/unit.png"
                                      alt="unit"
                                      className="w-5 h-5"
                                    />
                                  )}
                                </div>

                                {/* Unit Title */}
                                <div className="flex-1">
                                  <h5 className={`font-semibold ${
                                    isEnabled ? "text-slate-800" : "text-slate-500"
                                  } ${
                                    // @ts-ignore
                                    hoveredUnit === unit.unitId &&
                                    // @ts-ignore
                                    unit.completionStatus !== "disabled"
                                      ? "text-slate-900"
                                      : ""
                                  }`}>
                                    {/* @ts-ignore */}
                                    {unit.unitName}
                                  </h5>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {/* @ts-ignore */}
                                    {unit.completionStatus === "yes" 
                                      ? "Completed" 
                                      : // @ts-ignore
                                      unit.completionStatus === "incomplete"
                                      ? "In Progress"
                                      : // @ts-ignore
                                      unit.completionStatus?.toLowerCase() === "unit completed without assignments"
                                      ? "Pending Assignments"
                                      : "Locked"}
                                  </p>
                                </div>

                                {/* Arrow Indicator */}
                                {/* @ts-ignore */}
                                {unit.completionStatus !== "disabled" && (
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                )}
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-slate-500 text-lg">No learning stages available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
