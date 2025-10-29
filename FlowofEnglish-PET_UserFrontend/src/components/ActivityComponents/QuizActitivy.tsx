import React, { useEffect, useState } from "react";
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
}

const QuizActivity: React.FC<QuizActivityProps> = ({
  triggerSubmit,
  xmlUrl,
  setScorePercentage,
  subconceptMaxscore,
  setSubmissionPayload,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error("Failed to load quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [xmlUrl]);

  // ✅ Handle answer selection
  const handleSelect = (qid: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: answer }));
  };

  // ✅ Handle submission
  const handleSubmit = () => {
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
    const userAttemptScore = (correct / questions.length) * subconceptMaxscore;

    setScore(scorePercent);
    setScorePercentage(scorePercent);
    setSubmissionPayload({
      userAttemptFlag: true,
      userAttemptScore: userAttemptScore,
    });
    setSubmitted(true);
  };

  // ✅ Optional external trigger
  useEffect(() => {
    triggerSubmit && triggerSubmit();
  }, [triggerSubmit]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        Loading quiz...
      </div>
    );

  if (questions.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No quiz data found.
      </div>
    );

  return (
    <div className="p-4 text-gray-800">
      <h2 className="text-xl font-semibold mb-4">Quiz Assessment</h2>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="pb-4 border-b border-gray-200 last:border-none">
            <p className="font-medium mb-3">
              {idx + 1}. {q.text}
            </p>

            <div className="space-y-2">
              {q.options.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-2 cursor-pointer text-sm sm:text-base transition-colors ${
                    submitted
                      ? opt.trim().toLowerCase() ===
                        q.correctAnswer.trim().toLowerCase()
                        ? "text-green-700"
                        : answers[q.id] === opt
                        ? "text-red-600"
                        : "text-gray-700"
                      : answers[q.id] === opt
                      ? "text-blue-700 font-medium"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => handleSelect(q.id, opt)}
                    disabled={submitted}
                    className="cursor-pointer accent-blue-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="mt-6 w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold">
            You scored {score.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">
            ({((score / 100) * subconceptMaxscore).toFixed(1)} / {subconceptMaxscore})
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizActivity;
