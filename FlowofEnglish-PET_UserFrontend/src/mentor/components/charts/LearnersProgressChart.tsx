// src/mentor/components/charts/LearnersProgressChart.tsx
// @ts-nocheck
import React, { useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import ExportButtons from "./ExportButtons";

type LearnersProgressChartProps = {
  users: any[];
  programId?: string;
};

const LearnersProgressChart: React.FC<LearnersProgressChartProps> = ({
  users = [],
  programId,
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const processedData = users.map((u) => ({
    userId: u.userId,
    name: u.userName,
    score: u.leaderboardScore ?? 0,
    lastLogin: u.lastLogin ?? "--",
  }));

  const maxScore =
    processedData.length > 0
      ? Math.max(...processedData.map((u) => u.score || 0))
      : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-md shadow border text-sm">
          <p className="font-semibold">{label}</p>
          <p>Score: {p.score}</p>
          <p className="text-xs text-gray-500">Last login: {p.lastLogin}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="bg-white p-4 rounded-xl shadow space-y-4"
      ref={chartContainerRef}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Learners Score Overview</h2>
        <ExportButtons
          componentRef={chartContainerRef}
          filename="learners_score_overview"
          exportType="chart"
        />
      </div>

      {/* FIX: forced height container */}
      <div className="w-full min-h-[320px]" style={{ height: "320px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              domain={[0, maxScore || "auto"]}
              tick={{ fontSize: 11 }}
              label={{
                value: "Score",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {processedData.map((entry, index) => (
                <Cell
                  key={entry.userId}
                  fill={`hsl(${(index * 360) / processedData.length}, 70%, 50%)`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LearnersProgressChart;
