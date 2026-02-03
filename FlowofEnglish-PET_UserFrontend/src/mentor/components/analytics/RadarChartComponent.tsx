// RadarChart.tsx
import React from 'react';
import { RadarChart as RechartsRadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface RadarChartProps {
  data: Array<{
    name: string;
    score: number;
    conceptCount: number;
  }>;
  height?: number;
}

const skillColors: Record<string, string> = {
  'Grammar': '#FF6B6B',
  'Reading': '#4ECDC4',
  'Writing': '#45B7D1',
  'Speaking': '#4CAF50',
  'Critical Thinking': '#FF1493',
  'Active listening': '#D2B48C',
  'Other': '#FF69B4'
};

const getSkillColor = (skillName: string): string => {
  return skillColors[skillName] || skillColors.Other;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-blue-600">Score: {payload[0].value}%</p>
        <p className="text-gray-600">
          Concepts: {payload[0].payload.conceptCount || 0}
        </p>
      </div>
    );
  }
  return null;
};

const RadarChartComponent: React.FC<RadarChartProps> = ({ data, height = 450 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No skill data available</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart
            cx="50%"
            cy="50%"
            outerRadius="90%"
            data={data}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <PolarGrid 
            stroke="#E5E7EB"
            strokeWidth={1}
          />
          <PolarAngleAxis
            dataKey="name"
            tick={({ payload, x, y, textAnchor, ...rest }) => (
              <text
                {...rest}
                x={x}
                y={y}
                textAnchor={textAnchor}
                fill={getSkillColor(payload.value)}
                fontWeight="500"
                fontSize={16}
                dy={4}
              >
                {payload.value}
              </text>
            )}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            angle={30}
            tickCount={6}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            stroke="#9CA3AF"
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Skill Score"
            dataKey="score"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.4}
            strokeWidth={2}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartComponent;