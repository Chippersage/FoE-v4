"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// XML parser types
interface XMLQuestion {
  id: string;
  word: string;
  correctOption: string;
}

interface XMLActivity {
  activityid: string;
  questions: XMLQuestion[];
}

interface XMLData {
  headertext: string;
  activities: XMLActivity[];
}

interface Keyword {
  id: string;
  content: string;
}

interface Definition {
  id: string;
  text: string;
  correctKeywordId: string;
}

interface Question {
  id: string;
  keywords: Keyword[];
  definitions: Definition[];
}

interface VocabularyActivityProps {
  triggerSubmit: () => void;
  xmlUrl: string;
  setScorePercentage: React.Dispatch<React.SetStateAction<number>>;
  subconceptMaxscore: number;
  setSubmissionPayload?: React.Dispatch<
    React.SetStateAction<{
      userAttemptFlag: boolean;
      userAttemptScore: number;
    } | null>
  >;
}

// Keyword item component
const KeywordItem = ({
  keyword,
  onDragStart,
  isUsed = false,
}: {
  keyword: Keyword;
  onDragStart: (keyword: Keyword) => void;
  isUsed?: boolean;
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("keyword", JSON.stringify(keyword));
    onDragStart(keyword);
  };

  return (
    <div
      draggable={!isUsed}
      onDragStart={handleDragStart}
      className={`
        px-4 py-3 bg-white border border-gray-200 rounded-lg
        ${!isUsed 
          ? "cursor-pointer hover:shadow-md hover:border-blue-300 active:scale-95 transition-all" 
          : "opacity-50 cursor-not-allowed"
        }
        text-sm font-medium text-gray-800 whitespace-nowrap
      `}
      style={{
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {keyword.content}
    </div>
  );
};

// Definition item component
const DefinitionItem = ({
  definition,
  placedKeyword,
  onDrop,
  onDragOver,
  onRemoveKeyword,
  isSubmitted,
  isCorrect,
  showResult,
}: {
  definition: Definition;
  placedKeyword: Keyword | null;
  onDrop: (definitionId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onRemoveKeyword: () => void;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  showResult: boolean;
}) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(definition.id);
  };

  return (
    <div className="flex items-start gap-3 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-2">Definition</p>
        <p className="text-base font-medium text-gray-800">{definition.text}</p>
      </div>
      
      <div
        onDrop={handleDrop}
        onDragOver={onDragOver}
        className={`
          w-48 min-h-[56px] flex items-center justify-center
          border-2 ${placedKeyword ? "border-solid bg-white" : "border-dashed"}
          rounded-lg transition-all duration-200
          ${placedKeyword ? "border-gray-300" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}
        `}
      >
        {placedKeyword ? (
          <div className="w-full flex items-center justify-between px-3 py-2">
            <span className="font-medium text-gray-800">
              {placedKeyword.content}
            </span>
            <div className="flex items-center gap-2">
              {isSubmitted && showResult && (
                <span className="ml-2">
                  {isCorrect ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-red-500">✗</span>
                  )}
                </span>
              )}
              <button
                onClick={onRemoveKeyword}
                className="text-sm text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-3">
            <span className="text-sm text-gray-500">
              Drop keyword here
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function VocabularyActivity({
  triggerSubmit,
  xmlUrl,
  setScorePercentage,
  subconceptMaxscore,
  setSubmissionPayload,
}: VocabularyActivityProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [placedKeywords, setPlacedKeywords] = useState<
    Record<string, Keyword | null>
  >({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [pageResults, setPageResults] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});
  const [isPageCorrect, setIsPageCorrect] = useState<boolean | null>(null);
  const [draggedKeyword, setDraggedKeyword] = useState<Keyword | null>(null);
  
  // XML data state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [headerText, setHeaderText] = useState<string>("Match the Keywords");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentKeywords, setCurrentKeywords] = useState<Keyword[]>([]);
  const [currentDefinitions, setCurrentDefinitions] = useState<Definition[]>([]);

  // Parse XML data
  const parseXML = async (xmlUrl: string): Promise<XMLData> => {
    try {
      const response = await fetch(xmlUrl);
      if (!response.ok) throw new Error("Failed to fetch XML");
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");

      const activitiesElement = xmlDoc.getElementsByTagName("activities")[0];
      const headerText = activitiesElement.getAttribute("headertext") || "Vocabulary Activity";

      const activityElements = xmlDoc.getElementsByTagName("activity");
      const activities: XMLActivity[] = [];

      for (let i = 0; i < activityElements.length; i++) {
        const activityElement = activityElements[i];
        const activityId = activityElement.getAttribute("activityid") || `activity-${i + 1}`;
        const questionElements = activityElement.getElementsByTagName("question");
        const questions: XMLQuestion[] = [];

        for (let j = 0; j < questionElements.length; j++) {
          const questionElement = questionElements[j];
          questions.push({
            id: questionElement.getAttribute("id") || `question-${j + 1}`,
            word: questionElement.getAttribute("word") || "",
            correctOption: questionElement.getAttribute("correctOption") || "",
          });
        }

        activities.push({ activityid: activityId, questions });
      }

      return { headertext: headerText, activities };
    } catch (error) {
      console.error("Error parsing XML:", error);
      throw error;
    }
  };

  const transformXMLToQuestions = (xmlData: XMLData): Question[] => {
    return xmlData.activities.map((activity) => {
      const keywords: Keyword[] = [];
      const definitions: Definition[] = [];

      activity.questions.forEach((question) => {
        const keywordId = `keyword-${activity.activityid}-${question.id}`;

        keywords.push({
          id: keywordId,
          content: question.word,
        });

        definitions.push({
          id: `def-${activity.activityid}-${question.id}`,
          text: question.correctOption,
          correctKeywordId: keywordId,
        });
      });

      return {
        id: `question-${activity.activityid}`,
        keywords,
        definitions,
      };
    });
  };

  // Fetch and parse XML data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const xmlData = await parseXML(xmlUrl);
        setHeaderText(xmlData.headertext);
        const transformedQuestions = transformXMLToQuestions(xmlData);
        setQuestions(transformedQuestions);
        setTotalQuestions(transformedQuestions.length);
        setPageResults(new Array(transformedQuestions.length).fill(false));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching XML:", error);
        setError("Failed to load vocabulary activity. Please try again.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [xmlUrl]);

  // Initialize current question data
  useEffect(() => {
    if (questions.length === 0) return;

    const currentQ = questions[currentQuestionIndex];
    // Shuffle arrays
    const shuffledKeywords = [...currentQ.keywords].sort(() => Math.random() - 0.5);
    const shuffledDefinitions = [...currentQ.definitions].sort(() => Math.random() - 0.5);

    setCurrentKeywords(shuffledKeywords);
    setCurrentDefinitions(shuffledDefinitions);

    // Initialize placed keywords
    const initialPlacedKeywords: Record<string, Keyword | null> = {};
    const initialShowResults: Record<string, boolean> = {};

    shuffledDefinitions.forEach((def) => {
      initialPlacedKeywords[def.id] = null;
      initialShowResults[def.id] = false;
    });

    setPlacedKeywords(initialPlacedKeywords);
    setIsSubmitted(false);
    setResults({});
    setShowResults(initialShowResults);
    setIsPageCorrect(null);
  }, [currentQuestionIndex, questions]);

  const handleDragStart = (keyword: Keyword) => {
    setDraggedKeyword(keyword);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (definitionId: string) => {
    if (!draggedKeyword) return;

    // Remove from any previous placement
    const newPlacedKeywords = { ...placedKeywords };
    Object.keys(newPlacedKeywords).forEach(key => {
      if (newPlacedKeywords[key]?.id === draggedKeyword.id) {
        newPlacedKeywords[key] = null;
      }
    });

    // Place in new location
    newPlacedKeywords[definitionId] = draggedKeyword;
    setPlacedKeywords(newPlacedKeywords);
    setDraggedKeyword(null);
  };

  const handleRemoveKeyword = (definitionId: string) => {
    setPlacedKeywords(prev => ({
      ...prev,
      [definitionId]: null
    }));
  };

  const handleSubmit = () => {
    if (questions.length === 0) return;

    // Check if all definitions have a keyword
    const allPlaced = Object.values(placedKeywords).every(
      (value) => value !== null
    );

    if (!allPlaced) {
      toast.error("Please match all keywords before submitting.");
      return;
    }

    // Check correctness
    const newResults: Record<string, boolean> = {};
    let allCorrect = true;

    currentDefinitions.forEach((def) => {
      const placedKeyword = placedKeywords[def.id];
      const isCorrect = placedKeyword?.id === def.correctKeywordId;
      newResults[def.id] = isCorrect;

      if (!isCorrect) allCorrect = false;
    });

    setResults(newResults);
    setIsSubmitted(true);
    setIsPageCorrect(allCorrect);

    // Update page results
    const newPageResults = [...pageResults];
    newPageResults[currentQuestionIndex] = allCorrect;
    setPageResults(newPageResults);

    if (allCorrect) {
      setScore((prev) => prev + 1);
    }

    // Calculate final score
    const finalScore = newPageResults.filter((result) => result).length;

    // If last question, submit
    if (currentQuestionIndex === questions.length - 1) {
      setScorePercentage((finalScore / subconceptMaxscore) * 100);
      setSubmissionPayload?.({
        userAttemptFlag: true,
        userAttemptScore: finalScore,
      });
      
      // Show results before triggering submit
      setTimeout(() => {
        triggerSubmit();
      }, 1500);
    }

    // Animate results
    currentDefinitions.forEach((def, index) => {
      setTimeout(() => {
        setShowResults((prev) => ({
          ...prev,
          [def.id]: true,
        }));
      }, index * 300);
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    const initialPlacedKeywords: Record<string, Keyword | null> = {};
    currentDefinitions.forEach((def) => {
      initialPlacedKeywords[def.id] = null;
    });
    setPlacedKeywords(initialPlacedKeywords);
    setIsSubmitted(false);
    setResults({});
    setIsPageCorrect(null);
  };

  // Check which keywords are used
  const usedKeywordIds = Object.values(placedKeywords)
    .filter(keyword => keyword !== null)
    .map(keyword => keyword!.id);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full mb-4"></div>
          <p className="text-gray-600">Loading vocabulary activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <span className="text-red-500 text-4xl mb-4 block">×</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Activity</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <span className="text-gray-400 text-4xl mb-4 block">?</span>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Activity Found</h3>
          <p className="text-gray-600">The vocabulary activity contains no questions.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const allKeywordsPlaced = Object.values(placedKeywords).every(value => value !== null);
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div 
      className="w-full max-w-4xl mx-auto p-4 md:p-6"
      onDragOver={handleDragOver}
    >
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{headerText}</h2>
            <p className="text-sm text-gray-600">
              Drag and drop keywords to match their definitions
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` 
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">
            {score} of {questions.length} correct
          </span>
        </div>
        <div className="flex gap-1 mb-6">
          {pageResults.map((correct, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded ${
                index === currentQuestionIndex
                  ? "bg-blue-500"
                  : correct === true
                  ? "bg-green-500"
                  : correct === false
                  ? "bg-red-500"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Keywords Area */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
            Keywords
          </h3>
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100 min-h-[72px]">
            {currentKeywords.map((keyword) => {
              const isUsed = usedKeywordIds.includes(keyword.id);
              return (
                <KeywordItem
                  key={keyword.id}
                  keyword={keyword}
                  onDragStart={handleDragStart}
                  isUsed={isUsed}
                />
              );
            })}
            {currentKeywords.filter(k => !usedKeywordIds.includes(k.id)).length === 0 && (
              <div className="text-center w-full py-4">
                <p className="text-gray-500 text-sm">All keywords have been placed</p>
              </div>
            )}
          </div>
        </div>

        {/* Definitions Area */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
            Match the Definitions
          </h3>
          <div className="space-y-3">
            {currentDefinitions.map((definition) => (
              <DefinitionItem
                key={definition.id}
                definition={definition}
                placedKeyword={placedKeywords[definition.id]}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onRemoveKeyword={() => handleRemoveKeyword(definition.id)}
                isSubmitted={isSubmitted}
                isCorrect={isSubmitted ? results[definition.id] : null}
                showResult={showResults[definition.id]}
              />
            ))}
          </div>
        </div>

        {/* Results Section */}
        {isSubmitted && (
          <div className={`p-4 rounded-lg mb-6 animate-in fade-in duration-300 ${
            isPageCorrect 
              ? "bg-green-50 border border-green-200" 
              : "bg-yellow-50 border border-yellow-200"
          }`}>
            <div className="flex items-center gap-3">
              {isPageCorrect ? (
                <span className="text-green-600 text-lg">✓</span>
              ) : (
                <span className="text-yellow-600 text-lg">!</span>
              )}
              <div>
                <p className="font-medium text-gray-800">
                  {isPageCorrect 
                    ? "Perfect! All matches are correct." 
                    : "Some matches need correction."}
                </p>
                {!isPageCorrect && (
                  <p className="text-sm text-gray-600 mt-1">
                    Review the incorrect matches and try again.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`
                px-4 py-2 border border-gray-300 rounded-md flex items-center gap-2
                ${currentQuestionIndex === 0 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-gray-50"
                }
              `}
            >
              <span>←</span>
              Previous
            </button>
            
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-50"
            >
              <span>↻</span>
              Reset
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitted || !allKeywordsPlaced}
                className={`
                  px-6 py-2 rounded-md font-medium text-white
                  ${isSubmitted || !allKeywordsPlaced
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                  }
                `}
              >
                {isSubmitted ? "Submitted" : "Submit Activity"}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={!isSubmitted}
                className={`
                  px-6 py-2 bg-blue-600 text-white rounded-md font-medium flex items-center gap-2
                  ${!isSubmitted 
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:bg-blue-700"
                  }
                `}
              >
                Next Question
                <span>→</span>
              </button>
            )}
          </div>
        </div>

        {/* Question Navigation */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 justify-center">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${currentQuestionIndex === idx
                    ? "bg-blue-600 text-white"
                    : pageResults[idx] === true
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : pageResults[idx] === false
                    ? "bg-red-100 text-red-700 border border-red-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-lg mt-0.5 flex-shrink-0">?</span>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">How to Play</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Click and drag keywords from the top area and drop them onto definitions</li>
              <li>• Each definition matches exactly one keyword</li>
              <li>• Click the × button to remove a placed keyword</li>
              <li>• Submit only when all keywords are placed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}