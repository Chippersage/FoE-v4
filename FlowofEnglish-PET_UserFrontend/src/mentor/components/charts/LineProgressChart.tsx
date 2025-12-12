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

  // Sort users by completion percentage for better visualization
  const processedData = [...users]
    .map((u) => ({
      name: u.userName.length > 8 ? u.userName.substring(0, 8) + "..." : u.userName,
      fullName: u.userName,
      userId: u.userId,
      stagesPercentage: u.totalStages ? (u.completedStages / u.totalStages) * 100 : 0,
      unitsPercentage: u.totalUnits ? (u.completedUnits / u.totalUnits) * 100 : 0,
      subconceptsPercentage: u.totalSubconcepts ? (u.completedSubconcepts / u.totalSubconcepts) * 100 : 0,
      status: u.status,
    }))
    .sort((a, b) => b.stagesPercentage - a.stagesPercentage);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-md shadow border text-xs">
          <p className="font-semibold text-sm mb-2">{p.fullName} ({p.userId})</p>
          <p className="mb-1"><span className="text-blue-500">●</span> Stages: {p.stagesPercentage.toFixed(1)}%</p>
          <p className="mb-1"><span className="text-green-500">●</span> Units: {p.unitsPercentage.toFixed(1)}%</p>
          <p className="mb-1"><span className="text-purple-500">●</span> Subconcepts: {p.subconceptsPercentage.toFixed(1)}%</p>
          <p className="text-gray-500 mt-1 pt-1 border-t">Status: {p.status}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="bg-white p-4 rounded-2xl shadow-sm space-y-4 border border-[#0EA5E9]"
      ref={chartContainerRef}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#0EA5E9]">Progress Comparison (% Completed)</h2>
        <ExportButtons
          componentRef={chartContainerRef}
          filename="progress_comparison"
          exportType="chart"
        />
      </div>

      <div className="w-full min-h-[320px]" style={{ height: "320px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={processedData}
            margin={{ top: 20, right: 20, left: 10, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
              stroke="#666"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#666"
              label={{
                value: "Completion %",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11, fill: '#666' },
              }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Line
              type="monotone"
              dataKey="stagesPercentage"
              name="Stages %"
              stroke="#0EA5E9"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="unitsPercentage"
              name="Units %"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="subconceptsPercentage"
              name="Subconcepts %"
              stroke="#8b5cf6"
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