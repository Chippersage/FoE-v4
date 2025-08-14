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
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Award, Target, TrendingUp } from "lucide-react";

interface RecommendationSectionProps {
  strengths: any[];
  areasToImprove: any[];
}

export function RecommendationSection({
  strengths,
  areasToImprove,
}: RecommendationSectionProps) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Personalized Learning Path</CardTitle>
          </div>
          <CardDescription>
            Based on your performance, we've created a customized learning path
            to help you improve
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-muted-foreground/20"></div>
            <div className="space-y-8">
              {[1, 2, 3, 4].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative flex gap-4"
                >
                  <div className="absolute left-8 top-8 w-4 h-4 -ml-2 -mt-2 rounded-full bg-primary"></div>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg font-medium mb-1">
                      {index === 0
                        ? "Master the Basics"
                        : index === 1
                        ? "Build Core Skills"
                        : index === 2
                        ? "Advanced Concepts"
                        : "Expert Level Practice"}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {index === 0
                        ? "Focus on fundamental concepts to build a strong foundation"
                        : index === 1
                        ? "Develop essential skills through targeted practice"
                        : index === 2
                        ? "Challenge yourself with complex exercises"
                        : "Refine your expertise with specialized content"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3].map((_, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="bg-primary/5"
                        >
                          {index === 0
                            ? i === 0
                              ? "Basic Reading"
                              : i === 1
                              ? "Listening Fundamentals"
                              : "Simple Writing"
                            : index === 1
                            ? i === 0
                              ? "Intermediate Vocabulary"
                              : i === 1
                              ? "Speaking Practice"
                              : "Critical Reading"
                            : index === 2
                            ? i === 0
                              ? "Advanced Grammar"
                              : i === 1
                              ? "Complex Listening"
                              : "Critical Thinking"
                            : i === 0
                            ? "Expert Writing"
                            : i === 1
                            ? "Debate Skills"
                            : "Content Analysis"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle>Your Strengths</CardTitle>
            </div>
            <CardDescription>
              Areas where you're performing well
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {strengths.slice(0, 5).map((strength, index) => (
                <motion.li
                  key={strength.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="flex-1">{strength.name || strength.id}</span>
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-600 border-green-200"
                  >
                    {Math.round((strength.userScore / strength.maxScore) * 100)}
                    %
                  </Badge>
                </motion.li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View All Strengths
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Recommended Practice</CardTitle>
            </div>
            <CardDescription>Activities tailored to your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {areasToImprove.slice(0, 5).map((area, index) => (
                <motion.li
                  key={area.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <span className="flex-1">{area.name || area.id}</span>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2">
                    <span>Practice</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </motion.li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View All Recommendations
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
