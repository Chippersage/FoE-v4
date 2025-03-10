import React, { useRef } from 'react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import ExportButtons from './ExportButtons';

const LineProgressChart = ({ data }) => {
  
  const learners = data?.users?.filter(user => user.userId !== 'All Learners') || [];
  const chartContainerRef = useRef(null);
  const processedData = learners.map(user => ({
    name: user.userName || user.userId,
    completedStages: user.completedStages,
    completedUnits: user.completedUnits,
    completedSubconcepts: user.completedSubconcepts,
    leaderboardScore: user.leaderboardScore
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" ref={chartContainerRef}>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Progress Overview Timeline
      </h2>
      <ExportButtons
        componentRef={chartContainerRef}
        filename="progress_timeline"
        exportType="chart"
      />
    </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fill: '#4B5563', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: '#4B5563' }}
              label={{
                value: 'Progress Metrics',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#4B5563' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="completedStages"
              stroke="#3e95cd"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="completedUnits"
              stroke="#8e5ea2"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="completedSubconcepts"
              stroke="#3cba9f"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
            {/* <Line
              type="monotone"
              dataKey="leaderboardScore"
              stroke="#e8c3b9"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            /> */}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineProgressChart;