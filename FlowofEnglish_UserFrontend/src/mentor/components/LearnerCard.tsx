import React from "react";
import { useNavigate } from "react-router-dom";
import { MentorCohortProgress } from "@/types/mentor.types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LearnerCardProps {
  learner: MentorCohortProgress;
}

export default function LearnerCard({ learner }: LearnerCardProps) {
  const navigate = useNavigate();

  const chartData = learner.moduleProgress.map((module) => ({
    name: module.moduleName.substring(0, 10),
    progress: module.progress,
  }));

  return (
    <div
      onClick={() => navigate(`/mentor/learner/${learner.userId}`)}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">{learner.userName}</h3>
        <p className="text-sm text-gray-500">{learner.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-xs text-gray-600">Overall Progress</p>
          <p className="text-lg font-bold text-blue-600">
            {learner.overallProgress}%
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <p className="text-xs text-gray-600">Score</p>
          <p className="text-lg font-bold text-green-600">
            {learner.leaderboardScore}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="progress" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}