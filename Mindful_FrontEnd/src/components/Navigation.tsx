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
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
          ${
            isFirstQuestion
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-sm"
          }`}
      >
        ←<span>Previous</span>
      </button>

      {!isChecked ? (
        <button
          onClick={onCheck}
          disabled={!canCheck}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200
            ${
              canCheck
                ? "bg-orange-600 text-white hover:bg-orange-700 shadow-sm"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
        >
          Check Answer
        </button>
      ) : isLastQuestion ? (
        <button
          onClick={onSubmit}
          className="px-6 py-3 rounded-lg font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-200 shadow-sm"
        >
          Submit Assessment
        </button>
      ) : (
        <button
          onClick={onNext}
          className="px-6 py-3 rounded-lg font-medium bg-orange-600 text-white hover:bg-orange-700 transition-all duration-200 shadow-sm flex items-center gap-2"
        >
          <span>Continue</span>→
        </button>
      )}
    </div>
  );
};

export default Navigation;
