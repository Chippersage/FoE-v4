import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as ReTooltip,
} from "recharts";
import { SKILL_COLORS } from "../utils/skillMapper";

interface RadarData {
  skill: string;
  value: number;
}

interface RadarSkillChartProps {
  data?: RadarData[];
}

interface CustomTickProps {
  payload?: {
    value: string;
    coordinate: number;
    index: number;
    offset: number;
  };
  x?: number;
  y?: number;
  textAnchor?: "start" | "middle" | "end";
  stroke?: string;
  radius?: number;
}

const CustomTick = ({ payload, x, y, textAnchor }: CustomTickProps) => {
  if (!payload || x === undefined || y === undefined) return null;
  
  const color = SKILL_COLORS[payload.value] || "#374151";
  return (
    <text 
      x={x} 
      y={y} 
      textAnchor={textAnchor || "middle"} 
      fill={color} 
      fontWeight="600" 
      fontSize={12}
    >
      {payload.value}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  return (
    <div className="bg-white p-2 rounded shadow text-sm border">
      <div className="font-semibold">{p.payload.skill}</div>
      <div>Score: {p.value}%</div>
    </div>
  );
};

export default function RadarSkillChart({ data = [] }: RadarSkillChartProps) {
  const order = [
    "Speaking",
    "Grammar",
    "Skill Development",
    "Vocabulary",
    "Reading",
    "Writing",
    "Listening",
    "Critical Thinking",
  ];
  
  const displayData = order.map((s) => {
    const found = data.find((d) => d.skill === s);
    return { skill: s, value: found ? Number(found.value || 0) : 0 };
  });

  return (
    <div style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={displayData}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={(props: any) => <CustomTick {...props} />} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <ReTooltip content={<CustomTooltip />} />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#374151"
            fill="#374151"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}