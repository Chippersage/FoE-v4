import React from "react";
import { Question as QuestionType } from "../types/types";

interface QuestionProps {
  question: QuestionType;
  currentIndex: number;
  totalQuestions: number;
  activitiesHeaderText: string | null;
  onImageClick: (imageSrc: string) => void;
}

// Function to decode HTML entities
const decodeHTML = (html: string): string => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

// Function to safely extract content between curly braces
const extractBracedContent = (text: string) => {
  const matches = text.match(/\{([^}]+)\}/g);
  if (!matches) return [text];

  let result = text;
  const parts: string[] = [];
  let lastIndex = 0;

  for (const match of matches) {
    const startIndex = result.indexOf(match, lastIndex);
    if (startIndex > lastIndex) {
      parts.push(result.substring(lastIndex, startIndex));
    }
    parts.push(match);
    lastIndex = startIndex + match.length;
  }

  if (lastIndex < result.length) {
    parts.push(result.substring(lastIndex));
  }

  return parts;
};

const renderTextWithBraces = (text: string) => {
  // First check if there are any BR tags in the text
  const hasBrTags = /<br\s*\/?>/i.test(text);

  // First decode HTML entities
  const decodedText = decodeHTML(text);

  // If there are no BR tags, just handle the curly braces without adding extra line breaks
  if (!hasBrTags) {
    const parts = extractBracedContent(decodedText);
    return (
      <>
        {parts.map((part, index) => {
          const bracesMatch = part.match(/^\{(.*)\}$/);
          if (bracesMatch) {
            const content = bracesMatch[1];
            return (
              <span key={index} className="font-bold text-pink-600">
                {content}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  }

  // If we have BR tags, split by them and handle each line
  const lines = decodedText.split(/<br\s*\/?>/i);

  return (
    <>
      {lines.map((line, lineIndex) => {
        const parts = extractBracedContent(line);
        return (
          <React.Fragment key={lineIndex}>
            {parts.map((part, partIndex) => {
              const bracesMatch = part.match(/^\{(.*)\}$/);
              if (bracesMatch) {
                // We found content within curly braces
                const content = bracesMatch[1];
                return (
                  <React.Fragment key={`${lineIndex}-${partIndex}`}>
                    <br />
                    <span className="font-bold text-pink-600">{content}</span>
                    <br />
                  </React.Fragment>
                );
              }
              return <span key={`${lineIndex}-${partIndex}`}>{part}</span>;
            })}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
};

const Question: React.FC<QuestionProps> = ({
  question,
  currentIndex,
  totalQuestions,
  activitiesHeaderText,
  onImageClick,
}: QuestionProps) => {
  return (
    <div className="mb-6 animate-fadeIn">
      {/* If there's a question-specific headerText and no activities headerText, show it here */}
      {question.headerText && !activitiesHeaderText && (
        <h2 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
          {question.headerText}
        </h2>
      )}

      {/* Reference section - displays when question has reference property */}
      {question.reference && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
          <div className="flex items-center mb-2">
            <svg
              className="w-5 h-5 text-green-600 mr-2"
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
            <h4 className="text-sm font-medium text-green-800">Reference</h4>
          </div>
          <p className="text-sm text-green-700 leading-relaxed">
            {question.reference}
          </p>
        </div>
      )}

      {/* Render image if present */}
      {question.img && (
        <div className="mb-4 flex justify-center">
          <div className="relative group">
            <img
              src={question.img}
              alt="Question related visual"
              className="max-h-80 max-w-2xl w-full rounded shadow cursor-pointer transition-transform duration-200 group-hover:scale-105"
              style={{ objectFit: "contain" }}
              onClick={() => question.img && onImageClick(question.img)}
            />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-2 z-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
              <span className="bg-green-900 text-white text-xs rounded px-3 py-1 shadow-lg whitespace-nowrap">
                Click to zoom
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-2 text-sm text-green-600">
        Question {currentIndex + 1} of {totalQuestions}
      </div>

      <h3 className="text-lg font-medium text-green-800">
        {renderTextWithBraces(question.text)}
      </h3>
    </div>
  );
};

export default Question;
