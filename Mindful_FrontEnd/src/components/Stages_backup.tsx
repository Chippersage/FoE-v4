// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, AlertCircle, Clock, CheckCircle2, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import DashboardTour from "./tours/DashboardTour";

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
    const seenTour = localStorage.getItem("hasSeenDashboardTour");
    const cohortTourSkipped = localStorage.getItem("cohortTourSkipped") === "true";
    setHasSeenDashboardTour(!!seenTour || cohortTourSkipped);

    if (isDataLoaded && !seenTour && !cohortTourSkipped) {
      setRunTour(true);
    }
  }, [isDataLoaded]);

  const stagesArray = stages ? Object.values(stages) : [];

  const handleScrollToCard = (cardRef: React.RefObject<HTMLDivElement>) => {
    cardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // @ts-ignore
  const toggleExpand = (index) => {
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
      <div className="w-full space-y-4 learning-path-section">
        {/* Program Complete Message */}
        {programCompletionStatus === "yes" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-green-800 font-semibold">Congratulations!</h4>
              <p className="text-green-700 text-sm">You have completed all stages in this learning path.</p>
            </div>
          </div>
        )}

        {/* Stages List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
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
                  className={`transition-all duration-200 hover:shadow-md border ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : isPending
                      ? 'bg-yellow-50 border-yellow-200'
                      : isEnabled
                      ? 'bg-white border-gray-200 hover:border-blue-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                          isCompleted 
                            ? 'bg-green-100' 
                            : isPending
                            ? 'bg-yellow-100'
                            : isEnabled
                            ? 'bg-blue-100'
                            : 'bg-gray-100'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : isPending ? (
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          ) : isEnabled ? (
                            <Clock className="w-5 h-5 text-blue-600" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <CardTitle className={`text-lg font-semibold mb-1 ${
                            isEnabled ? "text-gray-900" : "text-gray-500"
                          }`}>
                            {stage?.stageName}
                          </CardTitle>
                          <p className={`text-sm ${
                            isEnabled ? "text-gray-600" : "text-gray-400"
                          }`}>
                            {stage?.stageDesc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isPending ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                        ) : isCompleted ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Complete
                          </Badge>
                        ) : isEnabled ? (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Available
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {!isExpanded && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => toggleExpand(index)}
                          disabled={!isEnabled}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                            isEnabled
                              ? isCompleted
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          } ${
                            index === 0 &&
                            stage?.stageCompletionStatus === "no" &&
                            stage?.stageEnabled
                              ? "lets-go-button"
                              : ""
                          }`}
                        >
                          <span>{isCompleted ? "Review" : "Continue"}</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Expanded Units */}
                    <div
                      className={`transition-all duration-300 ${
                        isExpanded
                          ? "max-h-80 opacity-100 mt-4"
                          : "max-h-0 opacity-0 overflow-hidden"
                      }`}
                    >
                      {/* @ts-ignore */}
                      {stage.units && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* @ts-ignore */}
                          {Object.values(stage.units).map((unit, unitIndex) => {
                            const unitIsCompleted = unit?.unitCompletionStatus === "yes";
                            const unitIsEnabled = unit?.unitEnabled;

                            return (
                              <Link
                                key={unitIndex}
                                to={`/unit/${unit?.unitId}`}
                                onClick={() => {
                                  if (cardRef.current && unitIsEnabled) {
                                    handleScrollToCard(cardRef);
                                  }
                                }}
                                className={`block p-3 rounded-lg border transition-colors ${
                                  unitIsEnabled
                                    ? "hover:border-blue-300 hover:bg-blue-50"
                                    : "cursor-not-allowed"
                                } ${
                                  unitIsCompleted
                                    ? "bg-green-50 border-green-200"
                                    : unitIsEnabled
                                    ? "bg-white border-gray-200"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                                onMouseEnter={() => setHoveredUnit(unitIndex)}
                                onMouseLeave={() => setHoveredUnit(null)}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={`w-6 h-6 rounded flex items-center justify-center ${
                                    unitIsCompleted
                                      ? "bg-green-100"
                                      : unitIsEnabled
                                      ? "bg-blue-100"
                                      : "bg-gray-100"
                                  }`}>
                                    {unitIsCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <span className={`text-xs font-medium ${
                                        unitIsEnabled ? "text-blue-600" : "text-gray-400"
                                      }`}>
                                        {unitIndex + 1}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${
                                      unitIsEnabled ? "text-gray-900" : "text-gray-500"
                                    }`}>
                                      {unit?.unitName}
                                    </p>
                                    <p className={`text-xs truncate ${
                                      unitIsEnabled ? "text-gray-600" : "text-gray-400"
                                    }`}>
                                      {unit?.unitDesc}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-gray-500">No learning stages available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
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
                  className={`group transition-all duration-300 ease-in-out hover:shadow-lg border-0 overflow-hidden ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 shadow-emerald-100/50' 
                      : isPending
                      ? 'bg-gradient-to-br from-amber-50 via-white to-amber-50/50 shadow-amber-100/50'
                      : isEnabled
                      ? 'bg-gradient-to-br from-white via-orange-50/30 to-white shadow-orange-100/30'
                      : 'bg-gradient-to-br from-slate-50 via-white to-slate-50/50 shadow-slate-100/50'
                  } ${isExpanded ? 'shadow-xl scale-[1.01]' : 'shadow-md'}`}
                >
                  {/* Stage Header */}
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl shadow-md transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                            : isPending
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                            : isEnabled
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                            : 'bg-gradient-to-br from-slate-400 to-slate-500'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          ) : isPending ? (
                            <AlertCircle className="w-6 h-6 text-white" />
                          ) : isEnabled ? (
                            <Clock className="w-6 h-6 text-white" />
                          ) : (
                            <div className="w-6 h-6 border-2 border-white rounded-full animate-spin border-t-transparent" />
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
                          <Badge className="bg-amber-100 text-amber-700 border-amber-300 px-3 py-1 rounded-full font-medium">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Pending
                          </Badge>
                        ) : isCompleted ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 px-3 py-1 rounded-full font-medium">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Completed
                          </Badge>
                        ) : isEnabled ? (
                          <button
                            onClick={() => {
                              toggleExpand(index);
                              handleScrollToCard(cardRef);
                            }}
                            className="flex items-center justify-center w-10 h-10 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors duration-200"
                          >
                            <ChevronDown
                              className={`h-5 w-5 text-orange-600 transition-transform duration-300 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
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
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                className={`group relative flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 border ${
                                  // @ts-ignore
                                  unit.completionStatus === "incomplete"
                                    ? "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-md hover:shadow-lg active-unit"
                                    : // @ts-ignore
                                    unit.completionStatus === "yes"
                                    ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-md hover:shadow-lg"
                                    : // @ts-ignore
                                    unit.completionStatus?.toLowerCase() === "unit completed without assignments"
                                    ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-md hover:shadow-lg"
                                    : "bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200 opacity-60 hover:cursor-not-allowed"
                                } ${
                                  // @ts-ignore
                                  hoveredUnit === unit.unitId &&
                                  // @ts-ignore
                                  unit.completionStatus !== "disabled"
                                    ? "scale-105 shadow-xl"
                                    : ""
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
                                <div className={`flex items-center justify-center w-10 h-10 rounded-lg shadow-sm ${
                                  // @ts-ignore
                                  unit.completionStatus === "yes"
                                    ? "bg-emerald-500"
                                    : // @ts-ignore
                                    unit.completionStatus === "incomplete"
                                    ? "bg-orange-500"
                                    : // @ts-ignore
                                    unit.completionStatus?.toLowerCase() === "unit completed without assignments"
                                    ? "bg-amber-500"
                                    : "bg-slate-400"
                                }`}>
                                  {/* @ts-ignore */}
                                  {unit.completionStatus === "yes" ? (
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                  ) : // @ts-ignore
                                  unit.completionStatus?.toLowerCase() === "unit completed without assignments" ? (
                                    <AlertCircle className="w-5 h-5 text-white" />
                                  ) : (
                                    <img
                                      src={
                                        // @ts-ignore
                                        hoveredUnit === unit.unitId &&
                                        // @ts-ignore
                                        unit.completionStatus !== "disabled"
                                          ? "/icons/User-icons/unit.svg"
                                          : "icons/User-icons/unit.png"
                                      }
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
