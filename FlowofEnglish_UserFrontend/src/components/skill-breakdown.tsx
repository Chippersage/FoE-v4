"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Headphones,
  MessageSquare,
  PenTool,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface SkillBreakdownProps {
  skillData: any[];
  skillDistribution: any[];
}

export function SkillBreakdown({
  skillData,
  skillDistribution,
}: SkillBreakdownProps) {
  const [selectedSkill, setSelectedSkill] = useState(
    skillData[0]?.skill || "Reading"
  );

  const getSkillIcon = (skill: string) => {
    switch (skill.toLowerCase()) {
      case "reading":
        return <BookOpen className="h-5 w-5" />;
      case "listening":
        return <Headphones className="h-5 w-5" />;
      case "speaking":
        return <MessageSquare className="h-5 w-5" />;
      case "writing":
        return <PenTool className="h-5 w-5" />;
      case "critical thinking":
        return <BrainCircuit className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getSkillTrend = (score: number) => {
    if (score >= 70)
      return {
        icon: <TrendingUp className="h-4 w-4 text-green-500" />,
        text: "Strong",
      };
    if (score >= 40)
      return {
        icon: <TrendingUp className="h-4 w-4 text-amber-500" />,
        text: "Improving",
      };
    return {
      icon: <TrendingDown className="h-4 w-4 text-red-500" />,
      text: "Needs Work",
    };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {skillData.map((skill, index) => (
          <motion.div
            key={skill.skill}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedSkill === skill.skill ? "border-primary" : ""
              }`}
              onClick={() => setSelectedSkill(skill.skill)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSkillIcon(skill.skill)}
                    <CardTitle className="text-sm">{skill.skill}</CardTitle>
                  </div>
                  <Badge
                    variant={
                      skill.score >= 70
                        ? "default"
                        : skill.score >= 40
                        ? "outline"
                        : "destructive"
                    }
                  >
                    {skill.score}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={skill.score} className="h-2" />
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-muted-foreground">Proficiency</span>
                  <div className="flex items-center gap-1">
                    {getSkillTrend(skill.score).icon}
                    <span>{getSkillTrend(skill.score).text}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSkill}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {getSkillIcon(selectedSkill)}
                <CardTitle>{selectedSkill} Skill Analysis</CardTitle>
              </div>
              <CardDescription>
                Detailed breakdown of your {selectedSkill.toLowerCase()}{" "}
                performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SkillDetailContent skill={selectedSkill} />
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SkillDetailContent({ skill }: { skill: string }) {
  // This would be populated with real data in a production app
  const strengthsMap: Record<string, string[]> = {
    Reading: [
      "Comprehension of complex texts",
      "Identifying main ideas",
      "Understanding context clues",
    ],
    Listening: [
      "Following spoken instructions",
      "Identifying key information in audio",
      "Understanding different accents",
    ],
    Speaking: [
      "Clear pronunciation",
      "Expressing opinions",
      "Using appropriate vocabulary",
    ],
    Writing: [
      "Organizing ideas logically",
      "Using proper grammar",
      "Developing arguments",
    ],
    "Critical Thinking": [
      "Analyzing information",
      "Evaluating arguments",
      "Problem-solving approaches",
    ],
  };

  const improvementAreasMap: Record<string, string[]> = {
    Reading: [
      "Speed reading techniques",
      "Inferring implied meanings",
      "Critical analysis of texts",
    ],
    Listening: [
      "Note-taking during lectures",
      "Understanding rapid speech",
      "Recognizing tone and mood",
    ],
    Speaking: [
      "Fluency in extended discourse",
      "Using idiomatic expressions",
      "Adapting to formal contexts",
    ],
    Writing: [
      "Advanced vocabulary usage",
      "Stylistic techniques",
      "Cohesion between paragraphs",
    ],
    "Critical Thinking": [
      "Synthesizing multiple sources",
      "Developing counterarguments",
      "Applying concepts to new contexts",
    ],
  };

  const strengths = strengthsMap[skill] || [];
  const improvementAreas = improvementAreasMap[skill] || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Strengths</h3>
          <ul className="space-y-2">
            {strengths.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-2"
              >
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-3">Areas to Improve</h3>
          <ul className="space-y-2">
            {improvementAreas.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-2"
              >
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Recommended Activities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer"
            >
              <h4 className="font-medium mb-1">Activity {index + 1}</h4>
              <p className="text-sm text-muted-foreground">
                {skill === "Reading"
                  ? "Read and analyze a short article"
                  : skill === "Listening"
                  ? "Listen to a podcast and summarize"
                  : skill === "Speaking"
                  ? "Practice a 2-minute presentation"
                  : skill === "Writing"
                  ? "Write a response to a prompt"
                  : "Analyze a complex problem and propose solutions"}
              </p>
              <div className="mt-2 text-xs text-primary font-medium">
                Start Activity →
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
