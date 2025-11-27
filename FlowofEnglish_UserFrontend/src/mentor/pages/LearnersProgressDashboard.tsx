import React, { useState, useMemo } from "react";
import { useMentorCohortProgress } from "../_hooks/useMentorCohortProgress";
import LearnerCard from "../components/LearnerCard";
import LearnerCardSkeleton from "../components/skeletons/LearnerCardSkeleton";
import { Search } from "lucide-react";

interface LearnersProgressDashboardProps {
  cohortId: string;
  programId: string;
  mentorId: string;
}

export default function LearnersProgressDashboard({
  cohortId,
  programId,
  mentorId,
}: LearnersProgressDashboardProps) {
  const { learners, isLoading, error } = useMentorCohortProgress({
    mentorId,
    cohortId,
    programId,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"progress" | "name" | "score">(
    "progress"
  );

  const filteredAndSortedLearners = useMemo(() => {
    let filtered = learners.filter((learner) =>
      learner.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "progress":
          return b.overallProgress - a.overallProgress;
        case "score":
          return b.leaderboardScore - a.leaderboardScore;
        case "name":
          return a.userName.localeCompare(b.userName);
        default:
          return 0;
      }
    });
  }, [learners, searchQuery, sortBy]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error loading learner progress</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Learner Progress
        </h1>
        <p className="text-gray-600">
          Monitor individual and cohort learning progress
        </p>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search learners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "progress" | "name" | "score")
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="progress">Sort by Progress</option>
          <option value="score">Sort by Score</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <LearnerCardSkeleton key={i} />
            ))
          : filteredAndSortedLearners.map((learner) => (
              <LearnerCard key={learner.userId} learner={learner} />
            ))}
      </div>

      {!isLoading && filteredAndSortedLearners.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No learners found</p>
        </div>
      )}
    </div>
  );
}