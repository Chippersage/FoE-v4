import React from "react";

interface NavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  onCheck: () => void;
  onSubmit: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  isChecked: boolean;
  canCheck: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  onPrevious,
  onNext,
  onCheck,
  onSubmit,
  isFirstQuestion,
  isLastQuestion,
  isChecked,
  canCheck,
}) => {
  return (
    <div className="flex justify-between items-center mt-8 flex-wrap gap-4">
      <button
        onClick={onPrevious}
        disabled={isFirstQuestion}
        className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2
          ${
            isFirstQuestion
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-green-700 border border-green-300 hover:border-green-400 hover:bg-green-50 hover:scale-105"
          }`}
      >
        ←<span>Previous</span>
      </button>

      {!isChecked ? (
        <button
          onClick={onCheck}
          disabled={!canCheck}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-300
            ${
              canCheck
                ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 hover:scale-105 shadow-md"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          Check Answer
        </button>
      ) : isLastQuestion ? (
        <button
          onClick={onSubmit}
          className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 hover:scale-105 transition-all duration-300 shadow-md"
        >
          Submit Quiz
        </button>
      ) : (
        <button
          onClick={onNext}
          className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 hover:scale-105 transition-all duration-300 shadow-md flex items-center gap-2"
        >
          <span>Next</span>→
        </button>
      )}
    </div>
  );
};

export default Navigation;
