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
  Legend,
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

  // Process data for stacked bar chart showing multiple completion metrics
  const processedData = users.map((u) => ({
    userId: u.userId,
    name: u.userName.length > 10 ? u.userName.substring(0, 10) + "..." : u.userName,
    completedStages: u.completedStages || 0,
    completedUnits: u.completedUnits || 0,
    completedSubconcepts: u.completedSubconcepts || 0,
    status: u.status || "ACTIVE",
  }));

  const maxValue = Math.max(
    ...processedData.map(u => 
      Math.max(u.completedStages, u.completedUnits, u.completedSubconcepts)
    )
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-md shadow border text-xs">
          <p className="font-semibold text-sm mb-1">{p.userId}</p>
          <p className="mb-1"><span className="text-blue-500">●</span> Stages: {p.completedStages}</p>
          <p className="mb-1"><span className="text-green-500">●</span> Units: {p.completedUnits}</p>
          <p className="mb-1"><span className="text-purple-500">●</span> Subconcepts: {p.completedSubconcepts}</p>
          <p className="text-gray-500 mt-1 pt-1 border-t">Status: {p.status}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="bg-white p-4 space-y-4"
      ref={chartContainerRef}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#0EA5E9]">Activities Completed Overview</h2>
        <ExportButtons
          componentRef={chartContainerRef}
          filename="activities_completed_overview"
          exportType="chart"
        />
      </div>

      <div className="w-full min-h-[320px]" style={{ height: "320px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
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
              domain={[0, maxValue + 10]}
              tick={{ fontSize: 11 }}
              stroke="#666"
              label={{
                value: "Count",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11, fill: '#666' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar 
              dataKey="completedStages" 
              name="Completed Stages" 
              radius={[6, 6, 0, 0]}
              fill="#0EA5E9"
            />
            <Bar 
              dataKey="completedUnits" 
              name="Completed Units" 
              radius={[6, 6, 0, 0]}
              fill="#10b981"
            />
            <Bar 
              dataKey="completedSubconcepts" 
              name="Completed Subconcepts" 
              radius={[6, 6, 0, 0]}
              fill="#8b5cf6"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LearnersProgressChart;