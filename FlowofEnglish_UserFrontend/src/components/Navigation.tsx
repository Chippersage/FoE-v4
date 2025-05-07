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
    <div className="flex justify-between mt-6">
      <button
        onClick={onPrevious}
        disabled={isFirstQuestion}
        className={`px-6 py-2 rounded-md transition-all ${
          isFirstQuestion
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        Prev
      </button>

      <div>
        {isLastQuestion ? (
          <button
            onClick={onSubmit}
            className="px-6 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 transition-all"
          >
            Submit
          </button>
        ) : isChecked ? (
          <button
            onClick={onNext}
            className="px-6 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 transition-all"
          >
            Next
          </button>
        ) : (
          <button
            onClick={onCheck}
            disabled={!canCheck}
            className={`px-6 py-2 rounded-md transition-all ${
              canCheck
                ? "bg-green-800 text-white hover:bg-green-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Check
          </button>
        )}
      </div>
    </div>
  );
};

export default Navigation;
