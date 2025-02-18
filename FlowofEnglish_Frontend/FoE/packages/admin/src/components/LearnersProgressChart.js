// import React from 'react';
// import ReactApexChart from 'react-apexcharts';
// import { Card, CardContent, Typography } from '@mui/material';
// import { styled } from '@mui/material/styles';

// const StyledCard = styled(Card)({
//   margin: '20px auto',
//   padding: '20px',
//   maxWidth: '800px',
// });

// const LearnersProgressChart = ({ data }) => {
//   console.log(data)
//   const learners = data?.users || [];
//   const learnerNames = learners.map((user) => user.userId);
//   const subconceptsCompleted = learners.map((user) => user.completedSubconcepts);

//   const chartOptions = {
//     chart: {
//       type: 'bar',
//       height: 350,
//     },
//     plotOptions: {
//       bar: {
//         horizontal: false,
//         columnWidth: '40%',
//       },
//     },
//     xaxis: {
//       categories: learnerNames,
//       tickPlacement: 'on',
//       labels: {
//         rotate: -45,
//         style: {
//           fontSize: '12px',
//         },
//       },
//     },
//     yaxis: {
//       title: {
//         text: 'Activities Completed',
//       },
//       max: Math.max(...subconceptsCompleted, learners[0].totalSubconcepts),
//     },
//     tooltip: {
//       y: {
//         formatter: (val) => `${val}`,
//       },
//     },
//     responsive: [
//       {
//         breakpoint: 600,
//         options: {
//           chart: {
//             height: 300,
//           },
//         },
//       },
//     ],
//   };

//   const chartSeries = [
//     {
//       name: 'Activities Completed',
//       data: subconceptsCompleted,
//     },
//   ];

//   return (
//     <StyledCard >
//       <CardContent>
//         <Typography variant="h6" gutterBottom>
//           Learners' Progress
//         </Typography>
//         {learnerNames.length ? (
//           <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={350} />
//         ) : (
//           <Typography variant="body1" align="center">
//             No data available to display.
//           </Typography>
//         )}
//       </CardContent>
//     </StyledCard>
//   );
// };

// export default LearnersProgressChart;



// import React from 'react';
// import { Card, CardContent, Typography, Box } from '@mui/material';
// import { styled } from '@mui/material/styles';

// const StyledCard = styled(Card)(({ theme }) => ({
//   margin: '20px auto',
//   padding: '20px',
//   maxWidth: '800px',
//   boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//   borderRadius: '12px'
// }));

// const ProgressBar = styled(Box)(({ theme }) => ({
//   width: '100%',
//   height: '8px',
//   backgroundColor: '#e0e0e0',
//   borderRadius: '4px',
//   overflow: 'hidden'
// }));

// const ProgressFill = styled(Box)(({ width, color }) => ({
//   height: '100%',
//   width: `${width}%`,
//   backgroundColor: color,
//   transition: 'width 0.5s ease-out'
// }));

// const LearnersProgressChart = ({ data }) => {
//   const learners = data?.users || [];
  
//   // Generate colors for different learners
//   const getColor = (index) => {
//     const colors = ['#2196f3', '#4caf50', '#f44336', '#ff9800', '#9c27b0', '#00bcd4'];
//     return colors[index % colors.length];
//   };

//   const processedData = learners.map(user => ({
//     name: user.userName || user.userId,
//     completed: user.completedSubconcepts,
//     total: user.totalSubconcepts
//   }));

//   return (
//     <StyledCard>
//       <CardContent>
//         <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
//           Learners' Progress Overview
//         </Typography>

//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//           {processedData.map((learner, index) => {
//             const percentage = (learner.completed / learner.total) * 100;
//             return (
//               <Box key={learner.name} sx={{ 
//                 padding: 2, 
//                 borderRadius: 2,
//                 border: '1px solid #e0e0e0',
//                 backgroundColor: '#fff'
//               }}>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
//                   <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
//                     {learner.name}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     {learner.completed} / {learner.total} completed
//                   </Typography>
//                 </Box>
                
//                 <ProgressBar>
//                   <ProgressFill 
//                     width={percentage} 
//                     color={getColor(index)}
//                   />
//                 </ProgressBar>
                
//                 <Typography 
//                   variant="body2" 
//                   sx={{ mt: 1, color: 'text.secondary', textAlign: 'right' }}
//                 >
//                   {Math.round(percentage)}% Complete
//                 </Typography>
//               </Box>
//             );
//           })}
//         </Box>

//         {!processedData.length && (
//           <Typography variant="body1" align="center">
//             No data available to display.
//           </Typography>
//         )}
//       </CardContent>
//     </StyledCard>
//   );
// };

// export default LearnersProgressChart;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Since shadcn/ui card is not available, let's create a simple card wrapper
const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { totalStages, totalUnits, totalSubconcepts } = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-blue-600">
          Completed: {payload[0].value}
        </p>
        <p className="text-gray-600">
          Total: {payload[0].payload.total}
        </p>
        <p className="text-green-600">
          Progress: {Math.round((payload[0].value / payload[0].payload.total) * 100)}%
        </p>
        <p className="text-purple-600">Stages: {totalStages}</p>
        <p className="text-indigo-600">Units: {totalUnits}</p>
        <p className="text-pink-600">Subconcepts: {totalSubconcepts}</p>
      </div>
    );
  }
  return null;
};

const LearnersProgressChart = ({ data }) => {
  const [hoveredLearner, setHoveredLearner] = useState(null);

  const learners = data?.users || [];
  const maxSubconcepts = Math.max(...learners.map(user => user.totalSubconcepts), 0);

  const processedData = learners.map(user => ({
    name: user.userName || user.userId,
    completed: user.completedSubconcepts,
    total: user.totalSubconcepts,
    totalStages: user.totalStages,
    totalUnits: user.totalUnits,
    totalSubconcepts: user.totalSubconcepts
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600">
            Completed: {payload[0].value}
          </p>
          <p className="text-gray-600">
            Total: {payload[0].payload.total}
          </p>
          <p className="text-green-600">
            Progress: {Math.round((payload[0].value / payload[0].payload.total) * 100)}%
          </p>
        </div>
      );
    }
    return null;
  };

//  const maxValue = Math.max(...processedData.map(d => d.total)) || 200;

  return (
    <Card className="w-full max-w-[1200px] mx-auto my-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Learners' Progress Overview
          </h2>
          
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fill: '#4B5563', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: '#4B5563' }}
                  domain={[0, maxSubconcepts]}
                  label={{
                    value: 'Activities Completed',
                    angle: -90,
                    position: 'Middle',
                    dx: -20, // Adjusts horizontal spacing (move left for more space)
                    style: { fill: '#4B5563' }
                  }}
                  // domain={[0, maxValue + 20]} // Dynamic range with a buffer
                  // allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                  {processedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${(index * 360) / processedData.length}, 70%, 50%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {processedData.map((learner, index) => (
              <div
                key={learner.name}
                className="relative p-4 rounded-lg bg-white shadow-sm border border-gray-200"
                onMouseEnter={() => setHoveredLearner(learner)}
                onMouseLeave={() => setHoveredLearner(null)}
              >
                <h3 className="font-semibold text-gray-800 truncate">
                  {learner.name}
                </h3>
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${(learner.completed / learner.total) * 100}%`,
                        backgroundColor: `hsl(${(index * 360) / processedData.length}, 70%, 50%)`
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{learner.completed} / {learner.total} completed</p>
                    </div>
                {/* Tooltip */}
    {hoveredLearner === learner && (
      <div className="absolute right-0 top-full mt-2 min-w-[150px] p-4 bg-white border rounded-lg shadow-lg z-50">
        <p className="text-sm text-gray-800">Stages: {learner.totalStages}</p>
        <p className="text-sm text-gray-800">Units: {learner.totalUnits}</p>
        <p className="text-sm text-gray-800">Concepts: {learner.totalSubconcepts}</p>
      </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
LearnersProgressChart.propTypes = {
  data: PropTypes.object.isRequired
};

export default LearnersProgressChart;