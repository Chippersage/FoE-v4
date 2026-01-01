import React from "react";

interface ScoreDisplayProps {
  score: number;
  total: number;
  onClose?: () => void;
  showScore?: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  score, 
  total,
  onClose,
  showScore = true
}) => {
  if (!showScore) return null;
  
  return (
    <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-30">
      <div className="text-center max-w-md p-6">
        <div className="mb-4">
          <div className="w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-4 relative"
               style={{
                 background: `conic-gradient(#0EA5E9 ${(score/total) * 100}%, #f0f0f0 ${(score/total) * 100}% 100%)`
               }}>
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-800">
                {score}/{total}
              </span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Score
          </h2>
          
          <p className="text-gray-600">
            {score} out of {total} {total === 1 ? 'question' : 'questions'} correct
          </p>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 bg-[#0EA5E9] hover:bg-[#0284c7] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};