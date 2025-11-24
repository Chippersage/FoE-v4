// src/mentor/components/charts/LineProgressChart.tsx
// @ts-nocheck
import React, { useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import ExportButtons from "./ExportButtons";

type LineProgressChartProps = {
  users: any[];
};

const LineProgressChart: React.FC<LineProgressChartProps> = ({ users = [] }) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const processedData = users.map((u) => ({
    name: u.userName,
    score: u.leaderboardScore ?? 0,
  }));

  return (
    <div
      className="bg-white p-4 rounded-xl shadow space-y-4"
      ref={chartContainerRef}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Score Comparison</h2>
        <ExportButtons
          componentRef={chartContainerRef}
          filename="score_comparison"
          exportType="chart"
        />
      </div>

      {/* FIXED HEIGHT & MOBILE FRIENDLY SCROLL */}
      <div className="w-full min-h-[300px] overflow-x-auto" style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
              tick={{ fontSize: 11 }}
              label={{
                value: "Score",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11 },
              }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              name="Score"
              stroke="#0EA5E9"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineProgressChart;
