import React from "react";

interface ScoreDisplayProps {
  score: number;
  total: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, total }) => {
  const percentage = (score / total) * 100;

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200 shadow-md min-w-[200px]">
      <h3 className="text-lg font-medium text-green-700 mb-2">Your Score</h3>
      <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
        {score}/{total}
      </div>
      <div className="text-sm text-green-600 mt-1">
        {percentage.toFixed(0)}%
      </div>
      <div className="w-full h-2 bg-green-100 rounded-full mt-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreDisplay;
