"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface UserHeaderProps {
  username: string;
  programName: string;
  overallCompletion: number;
}

export function UserHeader({
  username,
  programName,
  overallCompletion,
}: UserHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row items-start md:items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-4 border-primary/20">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${username}`}
            alt={username}
          />
          <AvatarFallback>
            {username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {username}'s Progress
          </h1>
          <p className="text-muted-foreground">
            <span className="font-bold">Program:</span> {programName}
          </p>
        </div>
      </div>

      <div className="mt-4 md:mt-0 w-full md:w-64">
        <div className="flex justify-between mb-1 text-sm">
          <span>Overall Progress</span>
          <span className="font-medium">{Math.round(overallCompletion)}%</span>
        </div>
        <Progress value={overallCompletion} className="h-2" />
      </div>
    </motion.div>
  );
}
