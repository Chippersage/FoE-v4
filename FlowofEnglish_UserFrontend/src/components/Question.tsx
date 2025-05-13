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
  return (
    <div className="mb-6 animate-fadeIn">
      {/* If there's a question-specific headerText and no activities headerText, show it here */}
      {question.headerText && !activitiesHeaderText && (
        <h2 className="text-xl font-semibold text-green-800 mb-6">
          {question.headerText}
        </h2>
      )}

      <div className="mb-2 text-sm text-gray-600">
        Question {currentIndex + 1} of {totalQuestions}
      </div>

      <h3 className="text-lg font-medium text-gray-900">{question.text}</h3>
    </div>
  );
};

export default Question;
