import axios from 'axios';
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line,
  CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
// import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";

const apiUrl = process.env.REACT_APP_API_URL;

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


const LearnersProgressChart = ({ data, programId }) => {
  const [hoveredLearner, setHoveredLearner] = useState(null);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [userProgressData, setUserProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const learners = data?.users || [];
  const maxSubconcepts = Math.max(...learners.map(user => user.totalSubconcepts), 0);

  const processedData = learners.map(user => ({
    userId: user.userId || user.id, // ensure we have a valid identifier
    name: user.userName || user.userId,
    completed: user.completedSubconcepts,
    total: user.totalSubconcepts,
    totalStages: user.totalStages,
    totalUnits: user.totalUnits,
    totalSubconcepts: user.totalSubconcepts
  }));

  const fetchUserProgress = async (userId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/reports/program/${userId}/${programId}`);
    //  const data = await response.json();
      setUserProgressData(response.data);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setIsLoading(false);
    }
  };
const processUnitData = (stages) => {
  if (!stages) return [];
  return stages.flatMap(stage => 
    stage.units.map(unit => ({
      name: unit.unitName,
      score: unit.subconcepts.reduce((acc, sub) => acc + sub.highestScore, 0) / unit.subconcepts.length,
      completed: unit.completedSubconcepts,
      total: unit.totalSubconcepts,
      completionRate: (unit.completedSubconcepts / unit.totalSubconcepts) * 100
    }))
  );
};
  const handleLearnerClick = (learner) => {
    setSelectedLearner(learner);
    fetchUserProgress(learner.userId);
  };

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
          <p className="text-green-600"> Progress: {Math.round((payload[0].value / payload[0].payload.total) * 100)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const UserDetailModal = ({ isOpen, onClose, userData, userProgressData, isLoading }) => {
    if (!isOpen) return null;

    const unitData = userProgressData ? processUnitData(userProgressData.stages) : [];

    return (
      <div className="mt-8 border-t pt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Progress Details for {userData?.name}
          </h2>
          <button 
            onClick={() => setSelectedLearner(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : userProgressData ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">Stages</h3>
                <p className="text-2xl text-blue-700">{userData.totalStages}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900">Units</h3>
                <p className="text-2xl text-green-700">{userData.totalUnits}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900">Completion</h3>
                <p className="text-2xl text-purple-700">
                  {Math.round((userData.completed / userData.total) * 100)}%
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900">Average Score</h3>
                <p className="text-2xl text-orange-700">
                  {Math.round(unitData.reduce((acc, unit) => acc + unit.score, 0) / unitData.length || 0)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold mb-4">Unit Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={unitData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis 
                        yAxisId="left"
                        label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                        label={{ value: 'Completion %', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="score" fill="#8884d8" name="Average Score" />
                      <Bar yAxisId="right" dataKey="completionRate" fill="#82ca9d" name="Completion Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold mb-4">Skills Overview</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={unitData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar 
                        name="Score" 
                        dataKey="score" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No data available</p>
        )}
      </div>
    );
  };

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
                  domain={[0, maxSubconcepts]}
                  label={{
                    value: 'Activities Completed',
                    angle: -90,
                    position: 'Middle',
                    dx: -20, // Adjusts horizontal spacing (move left for more space)
                    style: { fill: '#4B5563' }
                  }}
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
                onClick={() => handleLearnerClick(learner)}
                role="button"              // Add an appropriate role
    tabIndex={0}               // Allow keyboard focus
    onKeyPress={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleLearnerClick(learner);
      }
    }}
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
      <UserDetailModal
        isOpen={!!selectedLearner}
        onClose={() => setSelectedLearner(null)}
        userData={selectedLearner}
        userProgressData={userProgressData}
        isLoading={isLoading}
      />
    </Card>
  );
};
LearnersProgressChart.propTypes = {
  data: PropTypes.object.isRequired
};

export default LearnersProgressChart;

// import React, { useState } from 'react';
// import { Loader2 } from 'lucide-react';
// import axios from 'axios';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

// const apiUrl = process.env.REACT_APP_API_URL;

// const LearnersProgressChart = ({ data, programId }) => {
//   const [hoveredLearner, setHoveredLearner] = useState(null);
//   const [selectedLearner, setSelectedLearner] = useState(null);
//   const [userProgressData, setUserProgressData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const learners = data?.users || [];
//   const maxSubconcepts = Math.max(...learners.map(user => user.totalSubconcepts), 0);

//   const processedData = learners.map(user => ({
//     userId: user.userId || user.id,
//     name: user.userName || user.userId,
//     completed: user.completedSubconcepts,
//     total: user.totalSubconcepts,
//     totalStages: user.totalStages,
//     totalUnits: user.totalUnits,
//     totalSubconcepts: user.totalSubconcepts
//   }));

//   const fetchUserProgress = async (userId) => {
//     setIsLoading(true);
//     try {
//       const response = await axios.get(`${apiUrl}/reports/program/${userId}/${programId}`);
//       setUserProgressData(response.data);
//     } catch (error) {
//       console.error('Error fetching user progress:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const processUnitData = (stages) => {
//     if (!stages) return [];
//     return stages.flatMap(stage => 
//       stage.units.map(unit => ({
//         name: unit.unitName,
//         score: unit.subconcepts.reduce((acc, sub) => acc + sub.highestScore, 0) / unit.subconcepts.length,
//         completed: unit.completedSubconcepts,
//         total: unit.totalSubconcepts,
//         completionRate: (unit.completedSubconcepts / unit.totalSubconcepts) * 100
//       }))
//     );
//   };

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
//           <p className="font-semibold text-gray-900">{label}</p>
//           <p className="text-blue-600">Score: {payload[0].value.toFixed(2)}</p>
//           <p className="text-green-600">Completion: {payload[0].payload.completionRate.toFixed(1)}%</p>
//           <p className="text-gray-600">({payload[0].payload.completed}/{payload[0].payload.total} subconcepts)</p>
//         </div>
//       );
//     }
//     return null;
//   };
//   const handleLearnerClick = (learner) => {
//         setSelectedLearner(learner);
//         fetchUserProgress(learner.userId);
//       };

//   const UserDetailModal = ({ isOpen, onClose, userData, userProgressData, isLoading }) => {
//     if (!isOpen) return null;

//     const unitData = userProgressData ? processUnitData(userProgressData.stages) : [];

//     return (
//       <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
//         <div className="flex items-center justify-center min-h-screen">
//           <div className="bg-white rounded-lg w-full max-w-6xl mx-4 p-6">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold text-gray-800">
//                 Progress Details for {userData?.name}
//               </h2>
//               <button 
//                 onClick={onClose}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 ✕
//               </button>
//             </div>

//             {isLoading ? (
//               <div className="flex justify-center p-12">
//                 <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
//               </div>
//             ) : userProgressData ? (
//               <div className="space-y-8">
//                 {/* Summary Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   <div className="bg-blue-50 p-4 rounded-lg">
//                     <h3 className="font-semibold text-blue-900">Stages</h3>
//                     <p className="text-2xl text-blue-700">{userData.totalStages}</p>
//                   </div>
//                   <div className="bg-green-50 p-4 rounded-lg">
//                     <h3 className="font-semibold text-green-900">Units</h3>
//                     <p className="text-2xl text-green-700">{userData.totalUnits}</p>
//                   </div>
//                   <div className="bg-purple-50 p-4 rounded-lg">
//                     <h3 className="font-semibold text-purple-900">Completion</h3>
//                     <p className="text-2xl text-purple-700">
//                       {Math.round((userData.completed / userData.total) * 100)}%
//                     </p>
//                   </div>
//                   <div className="bg-orange-50 p-4 rounded-lg">
//                     <h3 className="font-semibold text-orange-900">Average Score</h3>
//                     <p className="text-2xl text-orange-700">
//                       {unitData.reduce((acc, unit) => acc + unit.score, 0) / unitData.length || 0}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Unit Performance Chart */}
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <h3 className="text-lg font-semibold mb-4">Unit Performance</h3>
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart data={unitData}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis 
//                           dataKey="name" 
//                           angle={-45}
//                           textAnchor="end"
//                           height={100}
//                           interval={0}
//                         />
//                         <YAxis 
//                           yAxisId="left"
//                           label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
//                         />
//                         <YAxis 
//                           yAxisId="right"
//                           orientation="right"
//                           domain={[0, 100]}
//                           label={{ value: 'Completion %', angle: 90, position: 'insideRight' }}
//                         />
//                         <Tooltip content={<CustomTooltip />} />
//                         <Legend />
//                         <Bar yAxisId="left" dataKey="score" fill="#8884d8" name="Average Score" />
//                         <Bar yAxisId="right" dataKey="completionRate" fill="#82ca9d" name="Completion Rate" />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>

//                 {/* Radar Chart for Skills */}
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <h3 className="text-lg font-semibold mb-4">Skills Overview</h3>
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <RadarChart data={unitData}>
//                         <PolarGrid />
//                         <PolarAngleAxis dataKey="name" />
//                         <PolarRadiusAxis domain={[0, 4]} />
//                         <Radar 
//                           name="Score" 
//                           dataKey="score" 
//                           stroke="#8884d8" 
//                           fill="#8884d8" 
//                           fillOpacity={0.6} 
//                         />
//                       </RadarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <p className="text-center text-gray-500">No data available</p>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="w-full max-w-[1200px] mx-auto my-6 bg-white rounded-lg shadow-lg">
//       <div className="p-6">
//         <div className="space-y-4">
//           <h2 className="text-2xl font-bold text-center text-gray-800">
//             Learners' Progress Overview
//           </h2>
          
//           <div className="h-[400px] w-full mt-4">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={processedData}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis
//                   dataKey="name"
//                   angle={-45}
//                   textAnchor="end"
//                   height={60}
//                 />
//                 <YAxis
//                   domain={[0, maxSubconcepts]}
//                   label={{ value: 'Activities Completed', angle: -90, position: 'insideLeft' }}
//                 />
//                 <Tooltip />
//                 <Bar dataKey="completed" fill="#8884d8">
//                   {processedData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={`hsl(${(index * 360) / processedData.length}, 70%, 50%)`} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//              {processedData.map((learner, index) => (
//               <div
//                 key={learner.name}
//                 className="relative p-4 rounded-lg bg-white shadow-sm border border-gray-200"
//                 onMouseEnter={() => setHoveredLearner(learner)}
//                 onMouseLeave={() => setHoveredLearner(null)}
//                 onClick={() => handleLearnerClick(learner)}
//                 role="button"              // Add an appropriate role
//     tabIndex={0}               // Allow keyboard focus
//     onKeyPress={(e) => {
//       if (e.key === 'Enter' || e.key === ' ') {
//         handleLearnerClick(learner);
//       }
//     }}
//               >
//                 <h3 className="font-semibold text-gray-800 truncate">
//                   {learner.name}
//                 </h3>
//                 <div className="mt-2 space-y-1">
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className="h-2 rounded-full transition-all duration-500 ease-out"
//                       style={{
//                         width: `${(learner.completed / learner.total) * 100}%`,
//                         backgroundColor: `hsl(${(index * 360) / processedData.length}, 70%, 50%)`
//                       }}
//                     />
//                   </div>
//                   <p className="text-sm text-gray-600">
//                     {learner.completed} / {learner.total} completed
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <UserDetailModal
//         isOpen={!!selectedLearner}
//         onClose={() => setSelectedLearner(null)}
//         userData={selectedLearner}
//         userProgressData={userProgressData}
//         isLoading={isLoading}
//       />
//     </div>
//   );
// };

// export default LearnersProgressChart;

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



// import axios from 'axios';
// import React, { useState } from 'react';
// import { Loader2 } from 'lucide-react';
// import PropTypes from 'prop-types';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line,
//   CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
// // import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";

// const apiUrl = process.env.REACT_APP_API_URL;

// const Card = ({ children, className }) => (
//   <div className={`bg-white rounded-lg shadow-lg ${className}`}>
//     {children}
//   </div>
// );

// const CardContent = ({ children, className }) => (
//   <div className={`p-6 ${className}`}>
//     {children}
//   </div>
// );


// const LearnersProgressChart = ({ data, programId }) => {
//   const [hoveredLearner, setHoveredLearner] = useState(null);
//   const [selectedLearner, setSelectedLearner] = useState(null);
//   const [userProgressData, setUserProgressData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const learners = data?.users || [];
//   const maxSubconcepts = Math.max(...learners.map(user => user.totalSubconcepts), 0);

//   const processedData = learners.map(user => ({
//     userId: user.userId || user.id, // ensure we have a valid identifier
//     name: user.userName || user.userId,
//     completed: user.completedSubconcepts,
//     total: user.totalSubconcepts,
//     totalStages: user.totalStages,
//     totalUnits: user.totalUnits,
//     totalSubconcepts: user.totalSubconcepts
//   }));

//   const fetchUserProgress = async (userId) => {
//     setIsLoading(true);
//     try {
//       const response = await axios.get(`${apiUrl}/reports/program/${userId}/${programId}`);
//     //  const data = await response.json();
//       setUserProgressData(response.data);
//     } catch (error) {
//       console.error('Error fetching user progress:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
// const processUnitData = (stages) => {
//   if (!stages) return [];
//   return stages.flatMap(stage => 
//     stage.units.map(unit => ({
//       name: unit.unitName,
//       score: unit.subconcepts.reduce((acc, sub) => acc + sub.highestScore, 0) / unit.subconcepts.length,
//       completed: unit.completedSubconcepts,
//       total: unit.totalSubconcepts,
//       completionRate: (unit.completedSubconcepts / unit.totalSubconcepts) * 100
//     }))
//   );
// };
//   const handleLearnerClick = (learner) => {
//     setSelectedLearner(learner);
//     fetchUserProgress(learner.userId);
//   };

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
//           <p className="font-semibold text-gray-900">{label}</p>
//           <p className="text-blue-600">
//             Completed: {payload[0].value}
//           </p>
//           <p className="text-gray-600">
//             Total: {payload[0].payload.total}
//           </p>
//           <p className="text-green-600">Progress: {Math.round((payload[0].value / payload[0].payload.total) * 100)}%
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const UserDetailModal = ({ isOpen, onClose, userData, userProgressData, isLoading }) => {
//     if (!isOpen) return null;

//     const unitData = userProgressData ? processUnitData(userProgressData.stages) : [];

//     return (
//       <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
//         <div className="flex items-center justify-center min-h-screen">
//           <div className="bg-white rounded-lg w-full max-w-6xl mx-4 p-6">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold text-gray-800">
//                 Progress Details for {userData?.name}
//               </h2>
//               <button 
//                 onClick={onClose}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 ✕
//               </button>
//             </div>

//             {isLoading ? (
//               <div className="flex justify-center p-12">
//                 <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
//               </div>
//             ) : userProgressData ? (
//               <div className="space-y-8">
//                 {/* Summary Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   <div className="bg-blue-50 p-4 rounded-lg">
//                     <h3 className="font-semibold text-blue-900">Stages</h3>
//                     <p className="text-2xl text-blue-700">{userData.totalStages}</p>
//                   </div>
//                   <div className="bg-green-50 p-4 rounded-lg">
//                     <h3 className="font-semibold text-green-900">Units</h3>
//                     <p className="text-2xl text-green-700">{userData.totalUnits}</p>
//                   </div>
//                   <div className="bg-purple-50 p-4 rounded-lg">
//                     <h3 className="font-semibold text-purple-900">Completion</h3>
//                     <p className="text-2xl text-purple-700">
//                       {Math.round((userData.completed / userData.total) * 100)}%
//                     </p>
//                   </div>
//                   <div className="bg-orange-50 p-4 rounded-lg">
//                     <h3 className="font-semibold text-orange-900">Average Score</h3>
//                     <p className="text-2xl text-orange-700">
//                       {unitData.reduce((acc, unit) => acc + unit.score, 0) / unitData.length || 0}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Unit Performance Chart */}
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <h3 className="text-lg font-semibold mb-4">Unit Performance</h3>
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart data={unitData}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis 
//                           dataKey="name" 
//                           angle={-45}
//                           textAnchor="end"
//                           height={100}
//                           interval={0}
//                         />
//                         <YAxis 
//                           yAxisId="left"
//                           label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
//                         />
//                         <YAxis 
//                           yAxisId="right"
//                           orientation="right"
//                           domain={[0, 100]}
//                           label={{ value: 'Completion %', angle: 90, position: 'insideRight' }}
//                         />
//                         <Tooltip content={<CustomTooltip />} />
//                         <Legend />
//                         <Bar yAxisId="left" dataKey="score" fill="#8884d8" name="Average Score" />
//                         <Bar yAxisId="right" dataKey="completionRate" fill="#82ca9d" name="Completion Rate" />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>

//                 {/* Radar Chart for Skills */}
//                 <div className="bg-white rounded-lg p-4 shadow">
//                   <h3 className="text-lg font-semibold mb-4">Skills Overview</h3>
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <RadarChart data={unitData}>
//                         <PolarGrid />
//                         <PolarAngleAxis dataKey="name" />
//                         <PolarRadiusAxis domain={[0, 4]} />
//                         <Radar 
//                           name="Score" 
//                           dataKey="score" 
//                           stroke="#8884d8" 
//                           fill="#8884d8" 
//                           fillOpacity={0.6} 
//                         />
//                       </RadarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <p className="text-center text-gray-500">No data available</p>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <Card className="w-full max-w-[1200px] mx-auto my-6">
//       <CardContent className="pt-6">
//         <div className="space-y-4">
//           <h2 className="text-2xl font-bold text-center text-gray-800">
//             Learners' Progress Overview
//           </h2>
          
//           <div className="h-[400px] w-full mt-4">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={processedData}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis
//                   dataKey="name"
//                   angle={-45}
//                   textAnchor="end"
//                   height={60}
//                   tick={{ fill: '#4B5563', fontSize: 12 }}
//                 />
//                 <YAxis
//                   tick={{ fill: '#4B5563' }}
//                   domain={[0, maxSubconcepts]}
//                   label={{
//                     value: 'Activities Completed',
//                     angle: -90,
//                     position: 'Middle',
//                     dx: -20, // Adjusts horizontal spacing (move left for more space)
//                     style: { fill: '#4B5563' }
//                   }}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
//                   {processedData.map((entry, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={`hsl(${(index * 360) / processedData.length}, 70%, 50%)`}
//                     />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//             {processedData.map((learner, index) => (
//               <div
//                 key={learner.name}
//                 className="relative p-4 rounded-lg bg-white shadow-sm border border-gray-200"
//                 onMouseEnter={() => setHoveredLearner(learner)}
//                 onMouseLeave={() => setHoveredLearner(null)}
//                 onClick={() => handleLearnerClick(learner)}
//                 role="button"              // Add an appropriate role
//     tabIndex={0}               // Allow keyboard focus
//     onKeyPress={(e) => {
//       if (e.key === 'Enter' || e.key === ' ') {
//         handleLearnerClick(learner);
//       }
//     }}
//               >
//                 <h3 className="font-semibold text-gray-800 truncate">
//                   {learner.name}
//                 </h3>
//                 <div className="mt-2 space-y-1">
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className="h-2 rounded-full transition-all duration-500 ease-out"
//                       style={{
//                         width: `${(learner.completed / learner.total) * 100}%`,
//                         backgroundColor: `hsl(${(index * 360) / processedData.length}, 70%, 50%)`
//                       }}
//                     />
//                   </div>
//                   <p className="text-sm text-gray-600">{learner.completed} / {learner.total} completed</p>
//                     </div>
//                 {/* Tooltip */}
//     {hoveredLearner === learner && (
//       <div className="absolute right-0 top-full mt-2 min-w-[150px] p-4 bg-white border rounded-lg shadow-lg z-50">
//         <p className="text-sm text-gray-800">Stages: {learner.totalStages}</p>
//         <p className="text-sm text-gray-800">Units: {learner.totalUnits}</p>
//         <p className="text-sm text-gray-800">Concepts: {learner.totalSubconcepts}</p>
//       </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </CardContent>
//       <UserDetailModal
//         isOpen={!!selectedLearner}
//         onClose={() => setSelectedLearner(null)}
//         userData={selectedLearner}
//         userProgressData={userProgressData}
//         isLoading={isLoading}
//       />
//     </Card>
//   );
// };
// LearnersProgressChart.propTypes = {
//   data: PropTypes.object.isRequired
// };

// export default LearnersProgressChart;