// components/analytics/CompletionChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CompletionChart({ data }) {
  const chartData = [
    { name: 'Stages', value: data.stageCompletionPercentage },
    { name: 'Units', value: data.unitCompletionPercentage },
    { name: 'Subconcepts', value: data.subconceptCompletionPercentage },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280' }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Completion']}
            labelFormatter={(label) => `${label}`}
            contentStyle={{ 
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white'
            }}
          />
          <Bar 
            dataKey="value" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
            name="Completion %"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}