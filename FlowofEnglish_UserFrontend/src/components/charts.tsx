"use client";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart as RechartsBarChart,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Progress Circle Component
export function ProgressCircle({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-32 w-32 mx-auto">
      <svg className="h-full w-full" viewBox="0 0 100 100">
        <circle
          className="text-muted-foreground/20"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <motion.circle
          className="text-primary"
          strokeWidth="10"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold"
        >
          {Math.round(value)}%
        </motion.span>
      </div>
    </div>
  );
}

// Bar Chart Component
export function BarChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 12 }}
        />
        <YAxis />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Concept
                      </span>
                      <span className="font-bold text-sm">
                        {payload[0].payload.name}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Score
                      </span>
                      <span className="font-bold text-sm">
                        {payload[0].value}/{payload[1].value}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar
          dataKey="userScore"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
          name="Your Score"
          animationDuration={1500}
        />
        <Bar
          dataKey="maxScore"
          fill="hsl(var(--muted-foreground)/0.3)"
          radius={[4, 4, 0, 0]}
          name="Maximum Score"
          animationDuration={1500}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

// Pie Chart Component
export function PieChart({ data }: { data: any[] }) {
  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--primary)/0.8)",
    "hsl(var(--primary)/0.6)",
    "hsl(var(--primary)/0.4)",
    "hsl(var(--primary)/0.2)",
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={40}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ percent, x, y }) => (
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#333"
              // fontSize={10}
              fontWeight="bold" // 👈 makes the text bold
            >
              {(percent * 100).toFixed(0)}%
            </text>
          )}
          animationDuration={1500}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Skill
                      </span>
                      <span className="font-bold text-sm">
                        {payload[0].name}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Percentage
                      </span>
                      <span className="font-bold text-sm">
                        {(payload[0].value as number).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

// Radar Chart Component
export function RadarChart({ data }: { data: any[] }) {
  console.log("Radar Chart Data:", data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar
          name="Proficiency"
          dataKey="score"
          data={data} // ✅ Required!
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary)/0.5)" // ✅ Slightly darker for visibility
          strokeWidth={2} // ✅ Makes radar lines clearer
          fillOpacity={0.6} // ✅ Optional: ensure opacity override
          animationDuration={1500}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Skill
                      </span>
                      <span className="font-bold text-sm">
                        {payload[0].payload.skill}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Score
                      </span>
                      <span className="font-bold text-sm">
                        {payload[0].value}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}


// Heat Map Chart Component
export function HeatMapChart({ data }: { data: any[] }) {
  const getColor = (score: number, maxScore: number) => {
    if (maxScore === 0) return "hsl(var(--muted)/0.5)";
    const percentage = score / maxScore;
    if (percentage >= 0.8) return "hsl(var(--success)/0.8)";
    if (percentage >= 0.6) return "hsl(var(--success)/0.6)";
    if (percentage >= 0.4) return "hsl(var(--warning)/0.6)";
    if (percentage >= 0.2) return "hsl(var(--warning)/0.4)";
    return "hsl(var(--destructive)/0.4)";
  };

  return (
    <div className="w-full h-full overflow-auto">
      <div className="grid grid-cols-1 gap-2 min-w-[600px]">
        {data.map((concept, index) => (
          <div key={index} className="flex items-center">
            <div className="w-1/3 pr-4 text-sm truncate" title={concept.name}>
              {concept.name || concept.id}
            </div>
            <div className="w-2/3 flex items-center gap-1">
              <div
                className="h-8 rounded-md transition-all duration-500 flex items-center justify-center text-xs font-medium"
                style={{
                  width: `${
                    (concept.userScore / Math.max(concept.maxScore, 1)) * 100
                  }%`,
                  backgroundColor: getColor(
                    concept.userScore,
                    concept.maxScore
                  ),
                  minWidth: concept.userScore > 0 ? "40px" : "0",
                }}
              >
                {concept.userScore > 0 ? `${concept.userScore}`: "0"}
              </div>
              <div className="text-xs text-muted-foreground ml-2">
                / {concept.maxScore}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
