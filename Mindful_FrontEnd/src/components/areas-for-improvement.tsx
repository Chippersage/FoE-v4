"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Target } from "lucide-react";

interface AreasForImprovementProps {
  areasToImprove: any[];
  conceptProgress: any[];
}

export function AreasForImprovement({
  areasToImprove,
  conceptProgress,
}: AreasForImprovementProps) {
  if (!areasToImprove.length) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle>Focus Areas</CardTitle>
        </div>
        <CardDescription>
          These areas need your attention to improve your overall performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {areasToImprove.map((area, index) => {
            const concept =
              conceptProgress.find((c) => c.id === area.id) || area;
            const progressPercentage =
              concept.maxScore > 0
                ? (concept.userScore / concept.maxScore) * 100
                : 0;

            return (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {area.name || area.id}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {area.skill1 && area.skill2
                        ? `${area.skill1} • ${area.skill2}`
                        : area.skill1 || "Skill development"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="font-medium">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="mt-3 text-sm">
                      <div className="flex justify-between">
                        <span>Completed</span>
                        <span className="font-medium">
                          {area.completedSubconcepts || 0}/
                          {area.totalSubconcepts || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Score</span>
                        <span className="font-medium">
                          {area.userScore || 0}/{area.maxScore || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full gap-1">
                      <span>Practice Now</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
