
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheck } from "lucide-react";
import { ChevronDown } from "lucide-react";
// import { Book } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
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
export default function Stages({ stages }) {
  const [expandedModule, setExpandedModule] = useState(null);
  const [hoveredUnit, setHoveredUnit] = useState(null);
  const containerRef = useRef(null);

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
    }
  };



  return (
    <div className="w-full max-h-[480px] max-w-md mx-auto py-5 px-6 bg-white bg-opacity-50 rounded-[3px]">
      {/* Fixed Title */}
      <h3 className="text-xl font-semibold font-openSans mb-4">
        Your Learning Path
      </h3>

      {/* Scrollable Cards */}
      <div
        ref={containerRef}
        className="space-y-4 overflow-y-auto max-h-[400px] no-scrollbar"
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
                        stage.stageEnabled ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {/* @ts-ignore */}
                      {stage.stageName}
                    </CardTitle>
                    {/* @ts-ignore */}
                    {stage.stageEnabled && (
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-300 ${
                          expandedModule === index ? "rotate-180" : ""
                        } text-gray-900`}
                        onClick={() => {
                          toggleExpand(index);
                          handleScrollToCard(cardRef);
                        }}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative pb-16">
                  <p
                    className={`text-sm mb-4 font-openSans font-semibold ${
                      // @ts-ignore
                      stage.stageEnabled ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {/* @ts-ignore */}
                    {stage.stageDesc}
                  </p>
                  <div className="absolute bottom-4 right-4 w-1/2">
                    <Button
                      onClick={() => {
                        toggleExpand(index);
                        handleScrollToCard(cardRef);
                      }}
                      className={`w-full transition-all duration-300 ease-in-out h-9 ${
                        // @ts-ignore
                        stage.stageEnabled
                        // @ts-ignore
                          ? stage.stageCompletionStatus === "yes"
                            ? "bg-green-500 text-white hover:bg-[#DB5788]" // Green to Pink
                            : "bg-[#5bc3cd] text-white hover:bg-[#DB5788]" // Blue to Pink
                          : "bg-[#5bc3cd] text-white hover:bg-[#5bc3cd] cursor-not-allowed" // Disabled
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>
                          {/* @ts-ignore */}
                          {stage.stageEnabled
                          // @ts-ignore
                            ? stage.stageCompletionStatus === "yes"
                              ? "Well Done!"
                              : "Let's Go"
                            : "Not Yet..."}
                        </span>
                        {/* @ts-ignore */}
                        {stage.stageEnabled ? (
                          // @ts-ignore
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
                  <div
                    className={`mt-4 grid grid-cols-2 gap-4 overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedModule === index
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {/* @ts-ignore */}
                    {stage.units ? (
                      // @ts-ignore
                      Object.values(stage.units).map((unit, unitIndex) => (
                        <Link
                        // @ts-ignore
                          to={
                            // @ts-ignore
                            unit.completionStatus !== "disabled" ||
                            unitIndex === 0
                            // @ts-ignore
                              ? `/subconcepts/${unit.unitId}`
                              : null
                          }
                          key={unitIndex}
                          className={`relative flex cursor-pointer items-center space-x-2 p-2 rounded-[3px] transition-all duration-200 ease-in-out ${
                            // @ts-ignore
                            unit.completionStatus === "incomplete" &&
                            "bg-[#5BC3CD]"
                          } ${
                            // @ts-ignore
                            unit.completionStatus === "disabled" &&
                            "hover:cursor-not-allowed"
                          } ${
                            // @ts-ignore
                            hoveredUnit === unit.unitId &&
                            // @ts-ignore
                            unit.completionStatus !== "disabled"
                              ? "bg-[#DB5788]"
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
                            // @ts-ignore
                            localStorage.setItem("currentUnit", unit.unitName);
                          }}
                        >
                          {/* @ts-ignore */}
                          {unit.completionStatus === "yes" && (
                            <CircleCheck
                              className={`absolute top-0 left-0 ${
                                // @ts-ignore
                                hoveredUnit === unit.unitId &&
                                // @ts-ignore
                                unit.completionStatus !== "disabled"
                                  ? "text-white"
                                  : "text-green-500"
                              }`}
                              size={16}
                            />
                          )}
                          <div className="flex-shrink-0 transition-all duration-100">
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
                          </div>
                          <span
                            className={`text-sm truncate ${
                              // @ts-ignore
                              stage.stageEnabled
                                ? "text-gray-900"
                                : "text-gray-400"
                            } ${
                              // @ts-ignore
                              hoveredUnit === unit.unitId &&
                              // @ts-ignore
                              unit.completionStatus !== "disabled"
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
            );})
        ) : (
          <p className="text-gray-500">No stages available</p>
        )}
      </div>
    </div>
  );
}
