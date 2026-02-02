// components/analytics/StageAccordion.tsx
import { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, CheckCircle, Clock, Lock, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SubconceptAttemptsProps {
  subconcept: any;
  isExpanded: boolean;
}

const SubconceptAttempts = ({ subconcept, isExpanded }: SubconceptAttemptsProps) => {
  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="mt-2 ml-4 pl-3 border-l border-gray-200">
            <div className="bg-gray-50 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <h6 className="text-sm font-medium text-gray-700">Attempt History</h6>
                <span className="ml-auto text-xs text-gray-500">
                  {subconcept.attempts?.length || 0} attempts
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b">
                      <th className="pb-2 text-left">Date & Time</th>
                      <th className="pb-2 text-left">Score</th>
                      <th className="pb-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subconcept.attempts?.map((attempt: any) => (
                      <tr key={attempt.attemptId} className="border-b border-gray-100 last:border-0">
                        <td className="py-2">
                          {formatDateTime(attempt.startTimestamp)}
                        </td>
                        <td className="py-2 font-medium">
                          {attempt.score.toFixed(1)} / {subconcept.subconceptMaxscore}
                        </td>
                        <td className="py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                            attempt.successful
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {attempt.successful ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface UnitAccordionProps {
  unit: any;
  isExpanded: boolean;
  onToggle: () => void;
}

const UnitAccordion = ({ unit, isExpanded, onToggle }: UnitAccordionProps) => {
  const [expandedSubconcepts, setExpandedSubconcepts] = useState<Set<string>>(new Set());

  const toggleSubconcept = (subconceptId: string) => {
    setExpandedSubconcepts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subconceptId)) {
        newSet.delete(subconceptId);
      } else {
        newSet.add(subconceptId);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center flex-1">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-100 text-blue-600 mr-3">
            <span className="text-xs font-semibold">U</span>
          </div>
          <div className="text-left flex-1">
            <h5 className="font-medium text-gray-900 text-sm">{unit.unitName}</h5>
            <p className="text-xs text-gray-500 truncate">{unit.unitDesc}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-medium text-gray-900">
              {unit.completedSubconcepts}/{unit.totalSubconcepts}
            </div>
            <div className="text-xs text-gray-500">
              {unit.averageScore.toFixed(1)} avg
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${unit.completionPercentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700 w-7">
              {unit.completionPercentage.toFixed(0)}%
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200"
          >
            <div className="p-3 space-y-2">
              <h6 className="text-sm font-medium text-gray-700">Activities</h6>
              {unit.subconcepts.map((subconcept: any) => (
                <div key={subconcept.subconceptId} className="bg-white rounded border">
                  <button
                    onClick={() => toggleSubconcept(subconcept.subconceptId)}
                    className="w-full p-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center flex-1">
                      <ChevronRight 
                        className={`h-3 w-3 text-gray-400 mr-2 transition-transform ${
                          expandedSubconcepts.has(subconcept.subconceptId) ? 'rotate-90' : ''
                        }`}
                      />
                      <div className="text-left flex-1">
                        <div className="text-sm text-gray-900">
                          {subconcept.subconceptDesc}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span>{subconcept.concept?.conceptName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-medium text-gray-900">
                          {subconcept.highestScore?.toFixed(1) || '0.0'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {subconcept.attemptCount || 0} tries
                        </div>
                      </div>
                      
                      <div className={`px-2 py-0.5 rounded text-xs ${
                        subconcept.completed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {subconcept.completed ? '✓' : '○'}
                      </div>
                    </div>
                  </button>
                  
                  <SubconceptAttempts 
                    subconcept={subconcept}
                    isExpanded={expandedSubconcepts.has(subconcept.subconceptId)}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function StageAccordion({ stage, isExpanded, onToggle, defaultExpandedUnits = new Set<string>() }) {
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(
    new Set<string>(Array.from(defaultExpandedUnits as Set<string>))
  );

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'yes': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'no': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Lock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center flex-1">
          {getStatusIcon(stage.completionStatus)}
          <div className="ml-3 text-left flex-1">
            <h4 className="font-semibold text-gray-900">{stage.stageName}</h4>
            <p className="text-sm text-gray-600 mt-0.5">{stage.stageDesc}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {stage.completedUnits}/{stage.totalUnits}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Target className="h-3 w-3" />
              {stage.averageScore.toFixed(1)} avg
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${stage.completionPercentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 w-8">
              {stage.completionPercentage.toFixed(0)}%
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200"
          >
            <div className="p-4 space-y-3">
              <h5 className="font-medium text-gray-800">Sessions</h5>
              {stage.units.map((unit: any) => (
                <UnitAccordion
                  key={unit.unitId}
                  unit={unit}
                  isExpanded={expandedUnits.has(unit.unitId)}
                  onToggle={() => toggleUnit(unit.unitId)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// import { useState } from 'react';
// import { ChevronDown, ChevronUp, ChevronRight, CheckCircle, Clock, Lock, Target, BarChart3, History } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// interface SubconceptAttemptsProps {
//   subconcept: any;
//   isExpanded: boolean;
// }
// const SubconceptAttempts = ({ subconcept, isExpanded }: SubconceptAttemptsProps) => {
//   const formatDate = (timestamp: number) => {
//     if (!timestamp) return 'N/A';
//     return new Date(timestamp * 1000).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getScoreColor = (score: number, maxScore: number) => {
//     const percentage = (score / maxScore) * 100;
//     if (percentage >= 80) return 'text-green-600';
//     if (percentage >= 60) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   return (
//     <AnimatePresence>
//       {isExpanded && (
//         <motion.div
//           initial={{ opacity: 0, height: 0 }}
//           animate={{ opacity: 1, height: 'auto' }}
//           exit={{ opacity: 0, height: 0 }}
//           transition={{ duration: 0.2 }}
//           className="overflow-hidden"
//         >
//           <div className="mt-3 pl-6 border-l-2 border-gray-200">
//             <div className="bg-gray-50 rounded-lg p-4">
//               <div className="flex items-center gap-2 mb-3">
//                 <History className="h-4 w-4 text-gray-500" />
//                 <h6 className="text-sm font-medium text-gray-700">Attempt History</h6>
//                 <span className="ml-auto text-xs text-gray-500">
//                   {subconcept.attempts?.length || 0} attempts
//                 </span>
//               </div>
              
//               <div className="overflow-x-auto">
//                 <table className="min-w-full text-sm">
//                   <thead>
//                     <tr className="text-xs text-gray-500 border-b">
//                       <th className="pb-2 text-left">Date & Time</th>
//                       <th className="pb-2 text-left">Score</th>
//                       <th className="pb-2 text-left">Duration</th>
//                       <th className="pb-2 text-left">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {subconcept.attempts?.map((attempt: any, index: number) => (
//                       <motion.tr
//                         key={attempt.attemptId}
//                         initial={{ opacity: 0, x: -20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: index * 0.05 }}
//                         className="border-b border-gray-100 last:border-0"
//                       >
//                         <td className="py-3">
//                           {formatDate(attempt.startTimestamp)}
//                         </td>
//                         <td className={`py-3 font-medium ${getScoreColor(attempt.score, subconcept.subconceptMaxscore)}`}>
//                           {attempt.score.toFixed(1)} / {subconcept.subconceptMaxscore}
//                         </td>
//                         <td className="py-3 text-gray-600">
//                           {attempt.endTimestamp && attempt.startTimestamp
//                             ? `${Math.round((attempt.endTimestamp - attempt.startTimestamp) / 60)}m`
//                             : 'N/A'}
//                         </td>
//                         <td className="py-3">
//                           <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
//                             attempt.successful
//                               ? 'bg-green-100 text-green-800'
//                               : 'bg-red-100 text-red-800'
//                           }`}>
//                             {attempt.successful ? 'Pass' : 'Fail'}
//                           </span>
//                         </td>
//                       </motion.tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
              
//               {/* Progress Visualization */}
//               <div className="mt-4 pt-4 border-t border-gray-200">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-xs font-medium text-gray-600">Best Score Progress</span>
//                   <span className="text-sm font-semibold">
//                     {subconcept.highestScore?.toFixed(1)} / {subconcept.subconceptMaxscore}
//                   </span>
//                 </div>
//                 <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                   <motion.div
//                     initial={{ width: 0 }}
//                     animate={{ width: `${(subconcept.highestScore / subconcept.subconceptMaxscore) * 100}%` }}
//                     transition={{ duration: 1, ease: 'easeOut' }}
//                     className={`h-full ${
//                       (subconcept.highestScore / subconcept.subconceptMaxscore) >= 0.8
//                         ? 'bg-green-500'
//                         : (subconcept.highestScore / subconcept.subconceptMaxscore) >= 0.6
//                         ? 'bg-yellow-500'
//                         : 'bg-red-500'
//                     }`}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// interface UnitAccordionProps {
//   unit: any;
//   isExpanded: boolean;
//   onToggle: () => void;
// }

// const UnitAccordion = ({ unit, isExpanded, onToggle }: UnitAccordionProps) => {
//   const [expandedSubconcepts, setExpandedSubconcepts] = useState<Set<string>>(new Set());

//   const toggleSubconcept = (subconceptId: string) => {
//     setExpandedSubconcepts(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(subconceptId)) {
//         newSet.delete(subconceptId);
//       } else {
//         newSet.add(subconceptId);
//       }
//       return newSet;
//     });
//   };

//   return (
//     <motion.div
//       layout
//       className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
//     >
//       <button
//         onClick={onToggle}
//         className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
//       >
//         <div className="flex items-center flex-1">
//           <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-3">
//             <span className="text-xs font-semibold">U</span>
//           </div>
//           <div className="text-left flex-1">
//             <h5 className="font-medium text-gray-900 text-sm">{unit.unitName}</h5>
//             <p className="text-xs text-gray-500 truncate">{unit.unitDesc}</p>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-4">
//           <div className="text-right hidden md:block">
//             <div className="text-xs font-medium text-gray-900">
//               {unit.completedSubconcepts}/{unit.totalSubconcepts} Activities
//             </div>
//             <div className="text-xs text-gray-500">
//               Avg: {unit.averageScore.toFixed(1)} pts
//             </div>
//           </div>
          
//           <div className="flex items-center gap-2">
//             <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
//               <div 
//                 className="h-full bg-blue-500"
//                 style={{ width: `${unit.completionPercentage}%` }}
//               />
//             </div>
//             <span className="text-xs font-medium text-gray-700 w-8">
//               {unit.completionPercentage.toFixed(0)}%
//             </span>
//             {isExpanded ? (
//               <ChevronUp className="h-4 w-4 text-gray-400" />
//             ) : (
//               <ChevronDown className="h-4 w-4 text-gray-400" />
//             )}
//           </div>
//         </div>
//       </button>
      
//       <AnimatePresence>
//         {isExpanded && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="border-t border-gray-200"
//           >
//             <div className="p-4">
//               {/* Unit Stats Summary */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
//                 <div className="bg-white p-3 rounded-lg border">
//                   <div className="text-xs text-gray-500 mb-1">Activities</div>
//                   <div className="text-lg font-semibold text-gray-800">
//                     {unit.completedSubconcepts}/{unit.totalSubconcepts}
//                   </div>
//                 </div>
//                 <div className="bg-white p-3 rounded-lg border">
//                   <div className="text-xs text-gray-500 mb-1">Avg Score</div>
//                   <div className="text-lg font-semibold text-gray-800">
//                     {unit.averageScore.toFixed(1)}
//                   </div>
//                 </div>
//                 <div className="bg-white p-3 rounded-lg border">
//                   <div className="text-xs text-gray-500 mb-1">Progress</div>
//                   <div className="text-lg font-semibold text-gray-800">
//                     {unit.completionPercentage.toFixed(0)}%
//                   </div>
//                 </div>
//                 <div className="bg-white p-3 rounded-lg border">
//                   <div className="text-xs text-gray-500 mb-1">Status</div>
//                   <div className={`text-sm font-medium ${
//                     unit.completionStatus === 'yes' 
//                       ? 'text-green-600' 
//                       : 'text-yellow-600'
//                   }`}>
//                     {unit.completionStatus === 'yes' ? 'Completed' : 'In Progress'}
//                   </div>
//                 </div>
//               </div>
              
//               {/* Subconcepts List */}
//               <div className="space-y-2">
//                 <h6 className="text-sm font-medium text-gray-700 mb-2">Activities</h6>
//                 {unit.subconcepts.map((subconcept: any) => (
//                   <div key={subconcept.subconceptId} className="bg-white rounded-lg border">
//                     <button
//                       onClick={() => toggleSubconcept(subconcept.subconceptId)}
//                       className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
//                     >
//                       <div className="flex items-center flex-1">
//                         <div className="w-5 h-5 flex items-center justify-center mr-3">
//                           <ChevronRight 
//                             className={`h-3 w-3 text-gray-400 transition-transform ${
//                               expandedSubconcepts.has(subconcept.subconceptId) ? 'rotate-90' : ''
//                             }`}
//                           />
//                         </div>
//                         <div className="text-left flex-1">
//                           <div className="text-sm font-medium text-gray-900">
//                             {subconcept.subconceptDesc}
//                           </div>
//                           <div className="text-xs text-gray-500 flex items-center gap-2">
//                             <span>{subconcept.concept?.conceptName}</span>
//                             <span>•</span>
//                             <span>{subconcept.attemptCount || 0} attempts</span>
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="flex items-center gap-3">
//                         <div className="hidden md:block text-right">
//                           <div className="text-xs font-medium text-gray-900">
//                             Best: {subconcept.highestScore?.toFixed(1) || '0.0'}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             Last: {formatDate(subconcept.lastAttemptDate)}
//                           </div>
//                         </div>
                        
//                         <div className={`px-2 py-1 rounded text-xs font-medium ${
//                           subconcept.completed
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {subconcept.completed ? 'Completed' : 'Pending'}
//                         </div>
//                       </div>
//                     </button>
                    
//                     <SubconceptAttempts 
//                       subconcept={subconcept}
//                       isExpanded={expandedSubconcepts.has(subconcept.subconceptId)}
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// };

// export default function StageAccordion({ 
//   stage, isExpanded, onToggle, defaultExpandedUnits = new Set() }) {
//   const [expandedUnits, setExpandedUnits] = useState<Set<string>>(defaultExpandedUnits);

//   const toggleUnit = (unitId: string) => {
//     setExpandedUnits(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(unitId)) {
//         newSet.delete(unitId);
//       } else {
//         newSet.add(unitId);
//       }
//       return newSet;
//     });
//   };

//   const getStatusColor = (percentage: number) => {
//     if (percentage >= 80) return 'bg-green-500';
//     if (percentage >= 50) return 'bg-yellow-500';
//     return 'bg-red-500';
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'yes': return <CheckCircle className="h-5 w-5 text-green-500" />;
//       case 'no': return <Clock className="h-5 w-5 text-yellow-500" />;
//       default: return <Lock className="h-5 w-5 text-gray-400" />;
//     }
//   };

//   return (
//     <motion.div
//       layout
//       className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
//     >
//       <button
//         onClick={onToggle}
//         className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-all"
//       >
//         <div className="flex items-center flex-1">
//           {getStatusIcon(stage.completionStatus)}
//           <div className="ml-4 text-left flex-1">
//             <h4 className="font-semibold text-gray-900">{stage.stageName}</h4>
//             <p className="text-sm text-gray-600 mt-1">{stage.stageDesc}</p>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-6">
//           <div className="hidden lg:block text-right">
//             <div className="text-sm font-medium text-gray-900">
//               {stage.completedUnits}/{stage.totalUnits} sessions
//             </div>
//             <div className="text-xs text-gray-500 flex items-center gap-1">
//               <Target className="h-3 w-3" />
//               Avg: {stage.averageScore.toFixed(1)} pts
//             </div>
//           </div>
          
//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
//                 <motion.div 
//                   initial={{ width: 0 }}
//                   animate={{ width: `${stage.completionPercentage}%` }}
//                   transition={{ duration: 1, ease: 'easeOut' }}
//                   className={`h-full ${getStatusColor(stage.completionPercentage)}`}
//                 />
//               </div>
//             </div>
//             <span className="text-sm font-semibold text-gray-700 w-10">
//               {stage.completionPercentage.toFixed(0)}%
//             </span>
//             {isExpanded ? (
//               <ChevronUp className="h-5 w-5 text-gray-400" />
//             ) : (
//               <ChevronDown className="h-5 w-5 text-gray-400" />
//             )}
//           </div>
//         </div>
//       </button>
      
//       <AnimatePresence>
//         {isExpanded && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             transition={{ duration: 0.3 }}
//             className="border-t border-gray-200"
//           >
//             <div className="p-5">
//               {/* Stage Stats Overview */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//                 <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
//                   <div className="flex items-center gap-3 mb-2">
//                     <div className="p-2 bg-white rounded-lg">
//                       <BarChart3 className="h-5 w-5 text-blue-600" />
//                     </div>
//                     <div>
//                       <div className="text-xs text-gray-600">Sessions Progress</div>
//                       <div className="text-xl font-bold text-gray-900">
//                         {stage.completedUnits}/{stage.totalUnits}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-xs text-gray-500">Sessions completed in this module</div>
//                 </div>
                
//                 <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
//                   <div className="flex items-center gap-3 mb-2">
//                     <div className="p-2 bg-white rounded-lg">
//                       <Target className="h-5 w-5 text-green-600" />
//                     </div>
//                     <div>
//                       <div className="text-xs text-gray-600">Average Score</div>
//                       <div className="text-xl font-bold text-gray-900">
//                         {stage.averageScore.toFixed(1)}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-xs text-gray-500">Across all Activities</div>
//                 </div>
                
//                 <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
//                   <div className="flex items-center gap-3 mb-2">
//                     <div className="p-2 bg-white rounded-lg">
//                       <History className="h-5 w-5 text-purple-600" />
//                     </div>
//                     <div>
//                       <div className="text-xs text-gray-600">Completion Rate</div>
//                       <div className="text-xl font-bold text-gray-900">
//                         {stage.completionPercentage.toFixed(0)}%
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-xs text-gray-500">Modules completion progress</div>
//                 </div>
//               </div>
              
//               {/* Units List */}
//               <div className="space-y-3">
//                 <h5 className="text-md font-semibold text-gray-800 mb-3">Sessions in this Modules</h5>
//                 {stage.units.map((unit: any) => (
//                   <UnitAccordion
//                     key={unit.unitId}
//                     unit={unit}
//                     isExpanded={expandedUnits.has(unit.unitId)}
//                     onToggle={() => toggleUnit(unit.unitId)}
//                   />
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// }

// // Helper function for date formatting
// const formatDate = (timestamp: number) => {
//   if (!timestamp) return 'N/A';
//   return new Date(timestamp * 1000).toLocaleDateString('en-US', {
//     month: 'short',
//     day: 'numeric'
//   });
// };