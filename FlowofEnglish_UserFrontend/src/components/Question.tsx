import React from "react";
import { Question as QuestionType } from "../types/types";

interface QuestionProps {
  question: QuestionType;
  currentIndex: number;
  totalQuestions: number;
  activitiesHeaderText: string | null;
}

const Question: React.FC<QuestionProps> = ({
  question,
  currentIndex,
  totalQuestions,
  activitiesHeaderText,
}) => {
  console.log("question", question);
  return (
    <div className="mb-6 animate-fadeIn">
      {/* If there's a question-specific headerText and no activities headerText, show it here */}
      {question.headerText && !activitiesHeaderText && (
        <h2 className="text-xl font-semibold text-green-800 mb-6">
          {question.headerText}
        </h2>
      )}

      {/* Reference section - displays when question has reference property */}
      {question.reference && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <div className="flex items-center mb-2">
            <svg
              className="w-5 h-5 text-blue-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <h4 className="text-sm font-medium text-blue-800">Reference</h4>
          </div>
          <p className="text-sm text-blue-700 leading-relaxed">
            {question.reference}
          </p>
        </div>
      )}

      <div className="mb-2 text-sm text-gray-600">
        Question {currentIndex + 1} of {totalQuestions}
      </div>

      <h3 className="text-lg font-medium text-gray-900">{question.text}</h3>
    </div>
  );
};

export default Question;
