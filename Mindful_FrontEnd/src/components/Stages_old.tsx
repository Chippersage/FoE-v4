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
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-md">
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
                  className={`group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border ${
                    isCompleted 
                      ? 'border-green-200 bg-white' 
                      : isPending
                      ? 'border-amber-200 bg-white'
                      : isEnabled
                      ? 'border-slate-200 bg-white hover:border-slate-300'
                      : 'border-slate-200 bg-slate-50'
                  } rounded-lg overflow-hidden`}
                >
                  {/* Stage Header */}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${
                          isCompleted 
                            ? 'bg-green-100 text-green-600' 
                            : isPending
                            ? 'bg-amber-100 text-amber-600'
                            : isEnabled
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isPending ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : isEnabled ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-slate-400 rounded-full animate-spin border-t-transparent" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <CardTitle className={`text-lg group-hover:text-orange-600 transition-colors ${
                            isEnabled ? "text-slate-800" : "text-slate-500"
                          }`}>
                            {/* @ts-ignore */}
                            {stage.stageName}
                          </CardTitle>
                          <p className={`text-sm leading-relaxed mt-1 ${
                            isEnabled ? "text-slate-600" : "text-slate-400"
                          }`}>
                            {/* @ts-ignore */}
                            {stage.stageDesc}
                          </p>
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        isCompleted 
                          ? "bg-green-500 text-white"
                          : isPending
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {/* @ts-ignore */}
                        {Math.round(((stage.completedUnitsCount || 0) / stage.unitsCount) * 100)}%
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isCompleted ? "bg-green-500" : "bg-orange-500"
                          }`}
                          style={{
                            // @ts-ignore
                            width: `${stage.unitsCount > 0 ? ((stage.completedUnitsCount || 0) / stage.unitsCount) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {/* @ts-ignore */}
                            {stage.completedUnitsCount || 0}/{stage.unitsCount} units
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded text-xs font-medium">
                              <AlertCircle className="w-3 h-3" />
                              Pending
                            </span>
                          ) : isCompleted ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                          ) : isEnabled ? (
                            <button
                              onClick={() => {
                                toggleExpand(index);
                                handleScrollToCard(cardRef);
                              }}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                                isExpanded 
                                  ? "bg-orange-600 text-white hover:bg-orange-700" 
                                  : "bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200"
                              }`}
                            >
                              {isExpanded ? "Hide Units" : "View Units"}
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                          }}
                          disabled={!isEnabled}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                            isEnabled
                              ? isCompleted
                                ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
                                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl"
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
