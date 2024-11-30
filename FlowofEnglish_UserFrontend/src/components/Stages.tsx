
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheck } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Book } from "lucide-react";
import { Link } from "react-router-dom";
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

  // Ensure that stages is not null or undefined before converting it to an array
  const stagesArray = stages ? Object.values(stages) : [];
  console.log(stagesArray)

  // @ts-ignore
  const toggleExpand = (index) => {
    // Allow expansion only if the stage is enabled
    // @ts-ignore
    if (stagesArray[index]?.stageEnabled) {
      setExpandedModule(expandedModule === index ? null : index);
    }
  };



  return (
    <div className="w-full max-h-[480px] max-w-md mx-auto py-5 px-6 space-y-4 overflow-y-auto bg-white bg-opacity-50 no-scrollbar">
      <h3 className="text-xl font-semibold">Your Learning Path</h3>
      {stagesArray.length > 0 ? (
        stagesArray.map((stage, index) => (
          <>
            <Card
              key={index}
              className={`rounded-lg bg-gradient-to-b from-[#CAF2BC] to-white`}
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
                  {stage.stageCompletionStatus === "yes" && (
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-300 ${
                        expandedModule === index ? "rotate-180" : ""
                      } text-gray-900`}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="relative pb-16">
                <p
                  className={`text-sm mb-4 ${
                    // @ts-ignore
                    stage.stageEnabled ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {/* @ts-ignore */}
                  {stage.stageDesc}
                </p>
                <div className="absolute bottom-4 right-4 w-1/2">
                  <Button
                    onClick={() => toggleExpand(index)}
                    className={`w-full transition-all duration-300 ease-in-out h-9 ${
                      // @ts-ignore
                      stage.stageEnabled
                        ? stage.stageCompletionStatus === "yes"
                          ? "bg-green-500 text-white hover:bg-[#DB5788]" // Green to Pink
                          : "bg-[#5bc3cd] text-white hover:bg-[#DB5788]" // Blue to Pink
                        : "bg-[#5bc3cd] text-white hover:bg-[#5bc3cd] cursor-not-allowed" // Disabled
                    }`}
                    // @ts-ignore
                    // disabled={!stage.stageEnabled}
                    // title={
                    //   // @ts-ignore
                    //   stage.stageEnabled
                    //     ? stage.stageCompletionStatus === "yes"
                    //       ? "Well Done!"
                    //       : "Let's Go"
                    //     : "Not Yet..."
                    // }
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {/* Text based on conditions */}
                      <span>
                        {stage.stageEnabled
                          ? stage.stageCompletionStatus === "yes"
                            ? "Well Done!"
                            : "Let's Go"
                          : "Not Yet..."}
                      </span>
                      {/* Icon based on conditions */}
                      {stage.stageEnabled ? (
                        stage.stageCompletionStatus === "yes" ? (
                          <img
                            src="/icons/User-icons/medal.png" // Replace with the path to your badge icon
                            alt="Badge"
                            className="h-5 w-5"
                          />
                        ) : (
                          <img
                            src="/icons/User-icons/running.png" // Replace with the path to your "Let's Go" icon
                            alt="Go Icon"
                            className="h-5 w-5"
                          />
                        )
                      ) : (
                        <img
                          src="/icons/User-icons/loading.png" // Replace with the path to your loading icon
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
                    Object.values(stage.units).map((unit, unitIndex) => {
                      // @ts-ignore
                      const nextUnit = Object.values(stage.units)[
                        unitIndex + 1
                      ];
                      // @ts-ignore
                      const nextUnitId = nextUnit ? nextUnit.unitId : null;

                      return (
                        <Link
                          // @ts-ignore
                          to={
                            // @ts-ignore
                            unit.completionStatus !== "disabled" ||
                            unitIndex === 0
                              ? // @ts-ignore
                                `/subconcepts/${unit.unitId}`
                              : null
                          }
                          state={{
                            // @ts-ignore
                            currentUnitId: unit.unitId,
                            // @ts-ignore
                            stageId: stage.stageId,
                            nextUnitId,
                          }}
                          key={unitIndex}
                          className={`relative flex cursor-pointer items-center space-x-2 p-2 rounded-md transition-all duration-200 ease-in-out ${
                            // @ts-ignore
                            hoveredUnit === unit.unitId
                              ? "bg-black bg-opacity-30"
                              : ""
                          }`}
                          // @ts-ignore
                          onMouseEnter={() => setHoveredUnit(unit.unitId)}
                          onMouseLeave={() => setHoveredUnit(null)}
                        >
                          {/* @ts-ignore */}
                          {unit.completionStatus === "yes" && (
                            <CircleCheck
                              className="absolute top-0 left-0 text-green-500 "
                              size={16}
                            />
                          )}

                          <Book
                            className={`h-6 w-6 ${
                              // @ts-ignore
                              stage.stageEnabled
                                ? "text-gray-900"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              // @ts-ignore
                              stage.stageEnabled
                                ? "text-gray-900"
                                : "text-gray-400"
                            } ${
                              // @ts-ignore
                              hoveredUnit === unit.unitId
                                ? "opacity-100 translate-x-1 font-semibold"
                                : ""
                            }`}
                          >
                            {/* @ts-ignore */}
                            {unit.unitName}
                          </span>
                        </Link>
                      );
                    })
                  ) : (
                    <p className="text-gray-500">No units available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ))
      ) : (
        <p className="text-gray-500">No stages available</p>
      )}
    </div>
  );
}
