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

export default function StageAccordion({ 
  stage, isExpanded, onToggle, defaultExpandedUnits = new Set() 
}) {
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(defaultExpandedUnits);

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