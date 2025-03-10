import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import  ExportButtons  from './ExportButtons';

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

// Color palette for different skills
const skillColors = {
  'Grammar' : '#FF6B6B', // Coral Red
  'Reading' : '#4ECDC4', // Medium Turquoise
  'Writing' : '#45B7D1', // Picton Blue
  'Speaking' : '#4CAF50', // Vibrant Green
  'Critical Thinking': '#FF1493', // Deep Pink
  'Active listening': '#D2B48C', // Tan
  'Other' : '#FF69B4' // Hot Pink (Teal-Pink)
};

// Function to get a color based on skill name
const getSkillColor = (skillName) => {
  return skillColors[skillName] || skillColors.Other;
};

// Function to get a lighter shade of a color for sub-elements
const getLighterShade = (color, percent) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const lightenAmount = Math.round(2.55 * percent);
  const newR = Math.min(255, r + lightenAmount);
  const newG = Math.min(255, g + lightenAmount);
  const newB = Math.min(255, b + lightenAmount);
  
  const toHex = (n) => {
    const hex = n.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

const processSkillData = (concepts) => {
  if (!concepts) return [];
  
  // Group by conceptSkill-1 and conceptSkill-2
  const skillGroups = concepts.reduce((acc, concept) => {
    const skill1 = concept['conceptSkill-1'] || 'Other';
    const skill2 = concept['conceptSkill-2'] || 'Other';
    
    if (!acc[skill1]) {
      acc[skill1] = {
        name: skill1,
        totalScore: 0,
        userScore: 0,
        conceptCount: 0,
        subskills: {}
      };
    }
    if (!acc[skill1].subskills[skill2]) {
      acc[skill1].subskills[skill2] = {
        name: skill2,
        concepts: [],
        totalScore: 0,
        userScore: 0
      };
    }
    acc[skill1].totalScore += concept.totalMaxScore;
    acc[skill1].userScore += concept.userTotalScore;
    acc[skill1].conceptCount += 1;
    
    acc[skill1].subskills[skill2].totalScore += concept.totalMaxScore;
    acc[skill1].subskills[skill2].userScore += concept.userTotalScore;
    acc[skill1].subskills[skill2].concepts.push({
      name: concept.conceptName,
      score: (concept.userTotalScore / concept.totalMaxScore) * 100
    });
    
    return acc;
  }, {});
  // Convert to array and calculate percentages
  return Object.values(skillGroups)
  .filter(skill => skill.name !== '')
  .map(skill => ({
    name: skill.name,
    score: Math.round((skill.userScore / skill.totalScore) * 100) || 0,
    conceptCount: skill.conceptCount,
    subskills: Object.values(skill.subskills).map(subskill => ({
      name: subskill.name,
      score: Math.round((subskill.userScore / subskill.totalScore) * 100) || 0,
      concepts: subskill.concepts
    }))
  }));
};


const LearnersProgressChart = ({ data, programId }) => {
  const [hoveredLearner, setHoveredLearner] = useState(null);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [userProgressData, setUserProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for export functionality
  const chartContainerRef = useRef(null);  // Ref for main chart
  const detailContainerRef = useRef(null); // Ref for detail view

  // Ref to the user detail modal container
  const detailRef = useRef(null);

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
      const response = await axios.get(`${apiUrl}/programs/${programId}/concepts/progress/${userId}`);
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
// When the selected learner changes (i.e. modal opens), scroll into view
  useEffect(() => {
    if (selectedLearner && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedLearner]);

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

  const CustomSkillTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600">Score: {payload[0].value}%</p>
          <p className="text-gray-600">
            Concepts: {payload[0].payload.conceptCount}
          </p>
        </div>
      );
    }
    return null;
  };

  const UserDetailModal = ({ isOpen, onClose, userData, userProgressData, isLoading }) => {
    if (!isOpen) return null;

    const skillData = userProgressData ? processSkillData(userProgressData.concepts) : [];

    const unitData = userProgressData ? processUnitData(userProgressData.stages) : [];
// Process concepts data for the bar chart
const conceptData = userProgressData?.concepts?.map(concept => ({
  name: concept.conceptName,
  score: Math.round((concept.userTotalScore / concept.totalMaxScore) * 100) || 0,
  completed: concept.completedSubconcepts,
  total: concept.totalSubconcepts
})) || [];

return (
<div ref={detailRef} className="mt-8 border-t pt-8">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-gray-800">
      Progress Details for {userData?.name}
    </h2>
    <div className="flex items-center">
      {/* Export buttons placed here next to the close button */}
      <ExportButtons
        componentRef={detailContainerRef}
        filename={`${userData?.name}_progress_details`}
        exportType="user"
        userData={userData}
        programId={programId}
      />
      {/* Small margin between export buttons and close button */}
      <div className="ml-4">
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
    {isLoading ? (
      <div className="flex justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    ) : userProgressData ? (
      <div ref={detailContainerRef} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Skills Overview - Radar Chart */}

              <div className="bg-white rounded-lg p-4 shadow md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Skills Overview</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={skillData}>
                    <PolarGrid />
                    <PolarAngleAxis 
                      dataKey="name" 
                      tick={({ payload, x, y, textAnchor, stroke, radius, ...rest }) => (
                        <g>
                          <text
                            {...rest}
                            x={x}
                            y={y}
                            textAnchor={textAnchor}
                            fill={getSkillColor(payload.value)}
                            fontWeight="500"
                          >
                            {payload.value}
                          </text>
                        </g>
                      )}
                    />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Tooltip content={<CustomSkillTooltip />} />
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

            {/* Skills Mastered */}
            <div className="bg-white rounded-lg p-4 shadow md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">Skills Mastered</h3>
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {skillData.map((skill, index) => (
                  <div key={skill.name} className="space-y-2">
                    <div
                      className="flex items-center justify-between p-2 rounded"
                      style={{ backgroundColor: getLighterShade(getSkillColor(skill.name), 80) }}
                    >
                      <h4 className="font-medium text-gray-900">{skill.name}</h4>
                      <span className="text-sm font-semibold">{skill.score}%</span>
                    </div>
                    <div className="pl-4 space-y-2">
                      {skill.subskills.map((subskill) => (
                        <div
                          key={subskill.name}
                          className="border-l-2 pl-4"
                          style={{ borderColor: getSkillColor(skill.name) }}
                        >
                          <div
                            className="flex items-center justify-between p-1 rounded"
                            style={{ backgroundColor: getLighterShade(getSkillColor(skill.name), 90) }}
                          >
                            <span className="text-sm text-gray-700">{subskill.name}</span>
                            <span className="text-sm font-semibold">{subskill.score}%</span>
                          </div>
                          <div className="pl-4 text-xs text-gray-500 space-y-1 mt-1">
                            {subskill.concepts.map((concept) => (
                              <div
                                key={concept.name} 
                                className="flex justify-between p-1 rounded hover:bg-gray-50"
                              >
                                <span>{concept.name}</span>
                                <span>{Math.round(concept.score)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Concept Performance - Bar Chart */}
            <div className="bg-white rounded-lg p-4 shadow md:col-span-3">
              <h3 className="text-lg font-semibold mb-4">Concept Performance</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={skillData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    barSize={40} // This sets the maximum width of each bar
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" width={90} />
                    <Tooltip content={<CustomSkillTooltip />} />
                    <Legend />
                    <Bar dataKey="score" name="Score %" maxBarSize={40}>
                      {skillData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getSkillColor(entry.name)} />
                      ))}
                    </Bar>
                  </BarChart>
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
      <div ref={chartContainerRef} className="space-y-4">
           {/* Create a flex container for the heading and buttons */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Learners' Progress Overview
          </h2>
          {/* ExportButtons aligned to the right */}
          <ExportButtons
            componentRef={chartContainerRef}
            filename="learners_progress_overview"
            exportType="chart"
          />
        </div>
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
  data: PropTypes.object.isRequired,
  programId: PropTypes.string.isRequired
};

export default LearnersProgressChart;



// unit wise view

  //   return (
  //     <div className="mt-8 border-t pt-8">
  //       <div className="flex justify-between items-center mb-6">
  //         <h2 className="text-2xl font-bold text-gray-800">
  //           Progress Details for {userData?.name}
  //         </h2>
  //         <button
  //           onClick={() => setSelectedLearner(null)}
  //           className="text-gray-500 hover:text-gray-700"
  //         >
  //           ✕
  //         </button>
  //       </div>

  //       {isLoading ? (
  //         <div className="flex justify-center p-12">
  //           <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
  //         </div>
  //       ) : userProgressData ? (
  //         <div className="space-y-8">
  //           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  //             <div className="bg-blue-50 p-4 rounded-lg">
  //               <h3 className="font-semibold text-blue-900">Stages</h3>
  //               <p className="text-2xl text-blue-700">{userData.totalStages}</p>
  //             </div>
  //             <div className="bg-green-50 p-4 rounded-lg">
  //               <h3 className="font-semibold text-green-900">Units</h3>
  //               <p className="text-2xl text-green-700">{userData.totalUnits}</p>
  //             </div>
  //             <div className="bg-purple-50 p-4 rounded-lg">
  //               <h3 className="font-semibold text-purple-900">Completion</h3>
  //               <p className="text-2xl text-purple-700">
  //                 {Math.round((userData.completed / userData.total) * 100)}%
  //               </p>
  //             </div>
  //             <div className="bg-orange-50 p-4 rounded-lg">
  //               <h3 className="font-semibold text-orange-900">Average Score</h3>
  //               <p className="text-2xl text-orange-700">
  //                 {Math.round(unitData.reduce((acc, unit) => acc + unit.score, 0) / unitData.length || 0)}%
  //               </p>
  //             </div>
  //           </div>

  //           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  //             <div className="bg-white rounded-lg p-4 shadow">
  //               <h3 className="text-lg font-semibold mb-4">Unit Performance</h3>
  //               <div className="h-64">
                  
  //                 <ResponsiveContainer width="100%" height="100%">
  //                   <BarChart data={unitData}>
  //                     <CartesianGrid strokeDasharray="3 3" />
  //                     <XAxis
  //                       dataKey="name"
  //                       angle={-45}
  //                       textAnchor="end"
  //                       height={100}
  //                       interval={0}
  //                     />
  //                     <YAxis
  //                       yAxisId="left"
  //                       label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
  //                     />
  //                     <YAxis
  //                       yAxisId="right"
  //                       orientation="right"
  //                       domain={[0, 100]}
  //                       label={{ value: 'Completion %', angle: 90, position: 'insideRight' }}
  //                     />
  //                     <Tooltip />
  //                     <Legend />
  //                     <Bar yAxisId="left" dataKey="score" fill="#8884d8" name="Average Score" />
  //                     <Bar yAxisId="right" dataKey="completionRate" fill="#82ca9d" name="Completion Rate" />
  //                   </BarChart>
  //                 </ResponsiveContainer>
  //               </div>
  //             </div>

  //             <div className="bg-white rounded-lg p-4 shadow">
  //               <h3 className="text-lg font-semibold mb-4">Skills Overview</h3>
  //               <div className="h-64">
  //                 <ResponsiveContainer width="100%" height="100%">
  //                   <RadarChart data={unitData}>
  //                     <PolarGrid />
  //                     <PolarAngleAxis dataKey="name" />
  //                     <PolarRadiusAxis domain={[0, 100]} />
  //                     <Radar 
  //                       name="Score" 
  //                       dataKey="score" 
  //                       stroke="#8884d8" 
  //                       fill="#8884d8" 
  //                       fillOpacity={0.6} 
  //                     />
  //                   </RadarChart>
  //                 </ResponsiveContainer>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       ) : (
  //         <p className="text-center text-gray-500">No data available</p>
  //       )}
  //     </div>
  //   );
  // };

  // Only 2 anyiltics are there

//   return (
//     <div className="mt-8 border-t pt-8">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">
//           Progress Details for {userData?.name}
//         </h2>
//         <button 
//           onClick={() => setSelectedLearner(null)}
//           className="text-gray-500 hover:text-gray-700"
//         >
//           ✕
//         </button>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center p-12">
//           <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
//         </div>
//       ) : userProgressData ? (
//         <div className="space-y-8">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             <div className="bg-white rounded-lg p-4 shadow">
//               <h3 className="text-lg font-semibold mb-4">Concept Performance</h3>
//               <div className="h-96">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart 
//                     data={skillData}
//                     layout="vertical"
//                     margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis type="number" domain={[0, 100]} />
//                     <YAxis 
//                       type="category" 
//                       dataKey="name" 
//                       width={90}
//                     />
//                     <Tooltip />
//                     <Legend />
//                     <Bar dataKey="score" fill="#8884d8" name="Score %" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg p-4 shadow">
//               <h3 className="text-lg font-semibold mb-4">Skills Overview</h3>
//               <div className="h-96">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <RadarChart data={skillData}>
//                     <PolarGrid />
//                     <PolarAngleAxis 
//                       dataKey="name"
//                       tick={{ fill: '#4B5563', fontSize: 12 }}
//                     />
//                     <PolarRadiusAxis 
//                       domain={[0, 100]}
//                       tick={{ fill: '#4B5563' }}
//                     />
//                     <Tooltip content={<CustomSkillTooltip />} />
//                     <Radar 
//                       name="Skill Score" 
//                       dataKey="score" 
//                       stroke="#8884d8" 
//                       fill="#8884d8" 
//                       fillOpacity={0.6} 
//                     />
//                   </RadarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <p className="text-center text-gray-500">No data available</p>
//       )}
//     </div>
//   );
// };