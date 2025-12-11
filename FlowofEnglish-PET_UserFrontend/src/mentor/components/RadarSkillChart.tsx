// @ts-nocheck
import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip
} from "recharts";

// Color palette for different skills
const skillColors = {
  Grammar: "#FF6B6B",
  Reading: "#4ECDC4",
  Writing: "#45B7D1",
  Speaking: "#4CAF50",
  "Critical Thinking": "#FF1493",
  "Active listening": "#D2B48C",
  Other: "#FF69B4"
};

// Fallback for unknown skill names
const getSkillColor = (name) => skillColors[name] || skillColors.Other;

// Radar tooltip
const CustomSkillTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const d = payload[0].payload;

  return (
    <div className="bg-white p-3 rounded-lg shadow border text-sm">
      <p className="font-semibold text-gray-900">{d.name}</p>
      <p className="text-blue-600">Score: {d.score}%</p>
      <p className="text-gray-600">Concepts: {d.conceptCount}</p>
    </div>
  );
};

// Converts your API concepts data into radar-friendly format
const processSkillData = (concepts) => {
  if (!concepts) return [];

  const groups = {};

  concepts.forEach((c) => {
    const skill = c["conceptSkill-1"] || "Other";
    if (!groups[skill]) {
      groups[skill] = { name: skill, total: 0, score: 0, count: 0 };
    }

    groups[skill].total += c.totalMaxScore;
    groups[skill].score += c.userTotalScore;
    groups[skill].count += 1;
  });

  return Object.values(groups).map((g) => ({
    name: g.name,
    score: Math.round((g.score / g.total) * 100) || 0,
    conceptCount: g.count
  }));
};

export default function RadarSkillChart({ data }) {
  const processed = processSkillData(data);

  return (
    <div className="w-full h-[350px] md:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={processed}>
          <PolarGrid />

          <PolarAngleAxis
            dataKey="name"
            tick={({ payload, x, y, textAnchor, stroke, radius }) => (
              <g>
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  fill={getSkillColor(payload.value)}
                  fontWeight="600"
                  fontSize="12"
                >
                  {payload.value}
                </text>
              </g>
            )}
          />

          <PolarRadiusAxis domain={[0, 100]} />
          <Tooltip content={<CustomSkillTooltip />} />

          <Radar
            name="Skill Score"
            dataKey="score"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}