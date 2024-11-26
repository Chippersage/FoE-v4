"use client";

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

  // @ts-ignore
  const toggleExpand = (index) => {
    // Allow expansion only if the stage is enabled
    // @ts-ignore
    if (stagesArray[index]?.stageEnabled) {
      setExpandedModule(expandedModule === index ? null : index);
    }
  };



  return (
    <div className="w-full max-w-md mx-auto space-y-4 overflow-y-auto">
      {stagesArray.length > 0 ? (
        stagesArray.map((stage, index) => (
          <Card
            key={index}
            // @ts-ignore
            className={`rounded-lg ${stage.stageEnabled ? "bg-gray-100" : "bg-gray-200"}`}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                {/* @ts-ignore */}
                <CardTitle className={`text-lg ${stage.stageEnabled ? "text-gray-900" : "text-gray-500"}`}>
                  {/* @ts-ignore */}
                  {stage.stageName}
                </CardTitle>
                {/* @ts-ignore */}
                {stage.stageCompletionStatus === "yes" && (
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-300 ${expandedModule === index ? "rotate-180" : ""} text-gray-900`}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* @ts-ignore */}
              <p className={`text-sm mb-4 ${stage.stageEnabled ? "text-gray-600" : "text-gray-400"}`}>
                {/* @ts-ignore */}
                {stage.stageDesc}
              </p>
              <Button
                onClick={() => toggleExpand(index)}
                // @ts-ignore
                className={`w-full ${stage.stageEnabled ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                // @ts-ignore
                disabled={!stage.stageEnabled}
              >
                {/* @ts-ignore */}
                {stage.stageEnabled ? "Continue" : "Stage Locked"}
              </Button>
              <div
                className={`mt-4 grid grid-cols-2 gap-4 overflow-hidden transition-all duration-300 ease-in-out ${expandedModule === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
              >
                {/* @ts-ignore */}
                {stage.units ? (
                  // @ts-ignore
                  Object.values(stage.units).map((unit, unitIndex) => {
                    // Determine the next unit
                    // @ts-ignore
                    const nextUnit = Object.values(stage.units)[unitIndex + 1];
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
                          nextUnitId
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
                  }
                    
                  )
                ) : (
                  <p className="text-gray-500">No units available</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-gray-500">No stages available</p>
      )}
    </div>
  );
}
