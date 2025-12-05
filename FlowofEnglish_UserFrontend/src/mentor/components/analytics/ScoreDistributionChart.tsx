// components/analytics/ScoreDistributionChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function ScoreDistributionChart({ distribution }) {
  const data = [
    { name: '0-20', value: distribution['0-20'], color: '#ef4444' },
    { name: '21-40', value: distribution['21-40'], color: '#f97316' },
    { name: '41-60', value: distribution['41-60'], color: '#eab308' },
    { name: '61-80', value: distribution['61-80'], color: '#22c55e' },
    { name: '81-100', value: distribution['81-100'], color: '#3b82f6' },
  ].filter(item => item.value > 0);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} attempts`, 'Count']} />
          <Legend 
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span className="text-sm text-gray-600">
                {value}: {entry.payload.value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}