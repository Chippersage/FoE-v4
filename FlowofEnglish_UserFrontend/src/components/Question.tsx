import React from "react";
import { Question as QuestionType } from "../types/types";

interface QuestionProps {
  question: QuestionType;
  currentIndex: number;
  totalQuestions: number;
}

const Question: React.FC<QuestionProps> = ({
  question,
  currentIndex,
  totalQuestions,
}) => {
  return (
    <div className="mb-6 animate-fadeIn">
      <div className="mb-2 text-sm text-gray-600">
        Question {currentIndex + 1} of {totalQuestions}
      </div>
      <h2 className="text-lg font-medium text-gray-900">{question.text}</h2>
    </div>
  );
};

export default Question;
