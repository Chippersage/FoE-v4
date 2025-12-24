import React, { useEffect, useState, useRef } from "react";
import { fetchAndParseQuestionsFromXML } from "../../utils/XmlParser";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

interface QuizActivityProps {
  triggerSubmit: () => void;
  xmlUrl: string;
  setScorePercentage: (score: number) => void;
  subconceptMaxscore: number;
  setSubmissionPayload: (payload: {
    userAttemptFlag: boolean;
    userAttemptScore: number;
  } | null) => void;
  containerHeight?: string;
}

const QuizActivity: React.FC<QuizActivityProps> = ({
  triggerSubmit,
  xmlUrl,
  setScorePercentage,
  subconceptMaxscore,
  setSubmissionPayload,
  containerHeight = "h-full",
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(600); // Default height
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ Measure available height
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        setAvailableHeight(height);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // ✅ Load quiz data from XML
  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      try {
        const parsedQuestions = await fetchAndParseQuestionsFromXML(xmlUrl);
        setQuestions(parsedQuestions);
        setAnswers({});
        setSubmitted(false);
        setScore(0);
        setCurrentPage(0);
        setProgress(0);
      } catch (error) {
        console.error("Failed to load quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [xmlUrl]);

  // ✅ Update progress when answers or current page changes
  useEffect(() => {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = questions.length;
    const progressPercentage =
      totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    setProgress(progressPercentage);
  }, [answers, questions.length]);

  // ✅ Handle answer selection
  const handleSelect = (qid: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: answer }));
  };

  // ✅ Navigate to next question
  const handleNext = () => {
    if (currentPage < questions.length - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // ✅ Navigate to previous question
  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // ✅ Handle submission
  const handleSubmit = () => {
    if (submitted) return; // 🔒 prevent double submit

    let correct = 0;
    questions.forEach((q) => {
      if (
        answers[q.id]?.trim().toLowerCase() ===
        q.correctAnswer.trim().toLowerCase()
      ) {
        correct++;
      }
    });

    const scorePercent = (correct / questions.length) * 100;
    const userAttemptScore = correct;

    setScore(scorePercent);
    setScorePercentage(scorePercent);
    setSubmissionPayload({
      userAttemptFlag: true,
      userAttemptScore: userAttemptScore,
    });
    setSubmitted(true);
  };

  // ❌ REMOVED:
  // useEffect(() => {
  //   triggerSubmit && triggerSubmit();
  // }, [triggerSubmit]);

  // Calculate dynamic heights based on available space
  const isTallScreen = availableHeight > 600;
  const isMediumScreen = availableHeight > 450 && availableHeight <= 600;
  const isShortScreen = availableHeight <= 450;

  // Dynamic styles based on available height
  const getQuestionContainerStyle = () => {
    if (isTallScreen) {
      return "flex-1 overflow-hidden"; // No scroll, use available space
    } else if (isMediumScreen) {
      return "flex-1 overflow-y-auto max-h-[300px]"; // Limited scroll
    } else {
      return "flex-1 overflow-y-auto max-h-[250px]"; // More scroll
    }
  };

  const getButtonContainerStyle = () => {
    if (isShortScreen) {
      return "flex-shrink-0 pt-3 border-t border-gray-200"; // Stick to bottom
    }
    return "flex-shrink-0 pt-4 md:pt-6 border-t border-gray-200";
  };

  if (loading)
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center ${containerHeight}`}
      >
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );

  if (questions.length === 0)
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center ${containerHeight}`}
      >
        <p className="text-gray-500">No quiz data found.</p>
      </div>
    );

  if (submitted) {
    return (
      <div
        ref={containerRef}
        className={`flex flex-col ${containerHeight} overflow-y-auto`}
      >
        <div className="p-4 md:p-6 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">
            Quiz Results
          </h2>

          {/* Score Disk/Visual */}
          <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-6 md:mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">
                  {score.toFixed(0)}%
                </div>
                <div className="text-xs md:text-sm text-gray-500 mt-1">
                  Score
                </div>
              </div>
            </div>
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${score * 2.83} 283`}
              />
            </svg>
          </div>

          <div className="bg-gray-50 p-4 md:p-6 rounded-lg mb-6 md:mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="text-center p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {Math.round((score / 100) * questions.length)}/
                  {questions.length}
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  Correct Answers
                </div>
              </div>
              <div className="text-center p-3 md:p-4">
                <div className="text-xl md:text-2xl font-bold text-blue-600">
                  {((score / 100) * subconceptMaxscore).toFixed(0)}/
                  {subconceptMaxscore}
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  Points Earned
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <p className="font-medium mb-3 text-sm md:text-base">
                  Q{idx + 1}. {q.text}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <div
                      key={opt}
                      className={`p-3 rounded ${
                        opt.trim().toLowerCase() ===
                        q.correctAnswer.trim().toLowerCase()
                          ? "bg-green-50 border border-green-200"
                          : answers[q.id] === opt
                          ? "bg-red-50 border border-red-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`min-w-4 min-h-4 w-4 h-4 rounded-full border ${
                            opt.trim().toLowerCase() ===
                            q.correctAnswer.trim().toLowerCase()
                              ? "border-green-500 bg-green-500"
                              : answers[q.id] === opt
                              ? "border-red-500 bg-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        <span
                          className={`text-sm md:text-base ${
                            opt.trim().toLowerCase() ===
                            q.correctAnswer.trim().toLowerCase()
                              ? "text-green-700 font-medium"
                              : answers[q.id] === opt
                              ? "text-red-600"
                              : "text-gray-700"
                          }`}
                        >
                          {opt}
                          <span className="text-xs md:text-sm ml-2">
                            {opt.trim().toLowerCase() ===
                              q.correctAnswer.trim().toLowerCase() &&
                              "✓ Correct"}
                            {answers[q.id] === opt &&
                              opt.trim().toLowerCase() !==
                                q.correctAnswer.trim().toLowerCase() &&
                              "✗ Your Answer"}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentPage];
  const isLastQuestion = currentPage === questions.length - 1;
  const isAnswered = !!answers[currentQuestion.id];

  return (
    <div
      ref={containerRef}
      className={`flex flex-col ${containerHeight} ${
        isShortScreen ? "min-h-[400px]" : ""
      }`}
    >
      {/* Progress Bar */}
      <div className="flex-shrink-0 mb-4 md:mb-6 px-4 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs md:text-sm font-medium text-gray-700">
            Question {currentPage + 1} of {questions.length}
          </span>
          <span className="text-xs md:text-sm font-medium text-gray-700">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Question */}
      <div className={getQuestionContainerStyle()}>
        <div className="px-4 pb-4">
          <p className="text-base md:text-lg font-medium mb-3 md:mb-4">
            {currentQuestion.text}
          </p>

          <div className="space-y-2 md:space-y-3">
            {currentQuestion.options.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-3 cursor-pointer p-3 md:p-4 rounded-lg border transition-all ${
                  answers[currentQuestion.id] === opt
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-25"
                }`}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={opt}
                  checked={answers[currentQuestion.id] === opt}
                  onChange={() =>
                    handleSelect(currentQuestion.id, opt)
                  }
                  className="cursor-pointer accent-blue-600"
                />
                <span className="flex-1 text-sm md:text-base">
                  {opt}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className={getButtonContainerStyle()}>
        <div className="px-4">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className={`px-4 md:px-6 py-1.5 md:py-2 font-medium transition-colors text-sm md:text-base ${
                currentPage === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:text-blue-800"
              }`}
            >
              ← Previous
            </button>

            <div className="text-xs md:text-sm text-gray-500 text-center">
              {Object.keys(answers).length} of {questions.length} answered
            </div>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!isAnswered}
                className={`px-4 md:px-6 py-1.5 md:py-2 font-medium transition-colors rounded text-sm md:text-base ${
                  isAnswered
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 md:px-6 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors text-sm md:text-base"
              >
                Next →
              </button>
            )}
          </div>

          {/* Question Navigation Dots */}
          {availableHeight > 400 && (
            <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-all ${
                    currentPage === idx
                      ? "bg-blue-600 text-white"
                      : answers[questions[idx].id]
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizActivity;
