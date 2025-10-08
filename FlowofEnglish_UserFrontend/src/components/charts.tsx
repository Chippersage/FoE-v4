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
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FECA57",
  ];

  // Group small slices (less than 5%) into "Other" category
  const processData = (data: any[]) => {
    if (data.length <= 8) return data; // No need to group if few categories
    
    const threshold = 5; // 5% threshold
    const mainData = data.filter(item => item.value >= threshold);
    const otherData = data.filter(item => item.value < threshold);
    
    if (otherData.length > 0) {
      const otherValue = otherData.reduce((sum, item) => sum + item.value, 0);
      if (otherValue > 0) {
        return [
          ...mainData,
          { name: `Other (${otherData.length} skills)`, value: otherValue }
        ];
      }
    }
    
    return mainData;
  };

  const processedData = processData(data).slice(0, 10); // Limit to top 10

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={processedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={40}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => {
            // Only show label if slice is large enough
            if (percent < 0.05) return null;
            return `${(percent * 100).toFixed(0)}%`;
          }}
          animationDuration={1500}
        >
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-3 shadow-sm max-w-xs">
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="text-xs uppercase text-muted-foreground">
                        Skill
                      </span>
                      <p className="font-bold text-sm break-words">
                        {payload[0].name}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs uppercase text-muted-foreground">
                        Percentage
                      </span>
                      <p className="font-bold text-sm">
                        {(payload[0].value as number).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px' }}
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          formatter={(value) => {
            // Truncate long legend labels
            if (value.length > 20) return value.substring(0, 20) + '...';
            return value;
          }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

// Radar Chart Component
// Radar Chart Component with truncated labels
export function RadarChart({ data }: { data: any[] }) {
  // console.log("Radar Chart Data:", data);

  // Function to truncate long skill names
  const truncateSkillName = (skill: string, maxLength: number = 15) => {
    if (skill.length <= maxLength) return skill;
    return skill.substring(0, maxLength) + '...';
  };

  // Process data to have truncated labels for display but full names in tooltip
  const processedData = data.map(item => ({
    ...item,
    truncatedSkill: truncateSkillName(item.skill),
    fullSkill: item.skill
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={processedData}>
        <PolarGrid />
        <PolarAngleAxis 
          dataKey="truncatedSkill" 
          tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
          tickLine={false}
        />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar
          name="Proficiency"
          dataKey="score"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary)/0.5)"
          strokeWidth={2}
          fillOpacity={0.6}
          animationDuration={1500}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-3 shadow-sm max-w-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase text-muted-foreground">
                      Skill
                    </span>
                    <span className="font-bold text-sm">
                      {payload[0].payload.fullSkill}
                    </span>
                    <span className="text-xs uppercase text-muted-foreground mt-2">
                      Proficiency Score
                    </span>
                    <span className="font-bold text-sm">
                      {payload[0].value}%
                    </span>
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
