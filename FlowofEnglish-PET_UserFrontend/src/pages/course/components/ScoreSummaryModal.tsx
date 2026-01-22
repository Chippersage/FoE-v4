import React from 'react';
import { X, Award } from 'lucide-react';

interface ScoreSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  total: number;
}

const ScoreSummaryModal: React.FC<ScoreSummaryModalProps> = ({
  isOpen,
  onClose,
  score,
  total,
}) => {
  if (!isOpen) return null;

  const percentage = Math.round((score / total) * 100);
  
  const getScoreMessage = () => {
    if (percentage >= 90) return "Outstanding performance!";
    if (percentage >= 75) return "Great job!";
    if (percentage >= 60) return "Well done.";
    return "Keep practicing!";
  };

  const getScoreColor = () => {
    if (percentage >= 90) return "text-emerald-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-amber-600";
    return "text-gray-600";
  };

  const getScoreBgColor = () => {
    if (percentage >= 90) return "bg-emerald-50";
    if (percentage >= 75) return "bg-blue-50";
    if (percentage >= 60) return "bg-amber-50";
    return "bg-gray-50";
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-xl shadow-lg relative animate-fadeIn"
        style={{ 
          width: 'clamp(300px, 35vw, 360px)',
          maxWidth: '95vw'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors z-10 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
        
        {/* Content */}
        <div className="p-5">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="flex justify-center mb-3">
              <Award className={`w-8 h-8 ${getScoreColor()}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Activity Completed
            </h3>
            <p className="text-sm text-gray-600">
              {getScoreMessage()}
            </p>
          </div>

          {/* Score Display */}
          <div className={`rounded-lg ${getScoreBgColor()} p-4 mb-5`}>
            <div className="flex items-end justify-center gap-1 mb-3">
              <span className="text-3xl font-bold text-gray-900">{score}</span>
              <span className="text-base text-gray-600 pb-0.5">/{total}</span>
            </div>
            
            {/* Circular Progress */}
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={percentage >= 90 ? "#10b981" : percentage >= 75 ? "#3b82f6" : percentage >= 60 ? "#f59e0b" : "#6b7280"}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${percentage * 2.51} 251`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold ${getScoreColor()}`}>
                  {percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Continue Button - Fixed height */}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-medium rounded-lg transition-colors duration-200 text-sm"
            style={{ minHeight: '40px' }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreSummaryModal;