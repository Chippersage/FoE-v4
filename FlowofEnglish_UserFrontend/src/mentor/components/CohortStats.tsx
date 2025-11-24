// In CohortStats.tsx
import React, { useMemo } from "react";
import type { MentorCohortProgressRow } from "@/types/mentor.types";

interface Props {
  rows: MentorCohortProgressRow[] | null | undefined;
}

export default function CohortStats({ rows }: Props) {
  const metrics = useMemo(() => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const count = safeRows.length;
    
    if (count === 0) {
      return { count: 0, avgProgress: 0, avgScore: 0, completedCount: 0 };
    }

    const avgProgress = Math.round(
      safeRows.reduce((sum, row) => sum + (row.overallProgress || 0), 0) / count
    );
    
    const avgScore = Math.round(
      safeRows.reduce((sum, row) => sum + (row.leaderboardScore || 0), 0) / count
    );
    
    const completedCount = safeRows.filter((row) => (row.overallProgress || 0) >= 100).length;

    return { count, avgProgress, avgScore, completedCount };
  }, [rows]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border">
        <div className="text-sm text-gray-500">Learners</div>
        <div className="text-2xl font-semibold">{metrics.count}</div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <div className="text-sm text-gray-500">Avg Progress</div>
        <div className="text-2xl font-semibold text-blue-600">{metrics.avgProgress}%</div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <div className="text-sm text-gray-500">Avg Score</div>
        <div className="text-2xl font-semibold text-green-600">{metrics.avgScore}</div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <div className="text-sm text-gray-500">Completed Programs</div>
        <div className="text-2xl font-semibold">{metrics.completedCount}</div>
      </div>
    </div>
  );
}