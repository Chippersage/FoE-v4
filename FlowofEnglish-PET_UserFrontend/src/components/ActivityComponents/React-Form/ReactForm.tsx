// features/react-form/ReactForm.tsx

import { forwardRef, useImperativeHandle, useState } from "react";
import { useActivityLoader } from "./hooks/useActivityLoader";
import { useScoring } from "./hooks/useScoring";
import { useSubmission } from "./hooks/useSubmission";

import AudioQuestion from "./components/AudioQuestion";
import MCQSingle from "./components/MCQSingle";
import MCQMultiple from "./components/MCQMultiple";
import TextInputQuestion from "./components/TextInputQuestion";
import MediaRenderer from "./components/MediaRenderer";

interface Props {
  xmlUrl: string;
  userId: string;
  cohortId: string;
  subconceptId: string;
}

interface ReactFormRef {
  submitForm: () => Promise<{ score: number; maxScore: number; showScore: boolean; } | null>;
}

const ReactForm = forwardRef<ReactFormRef, Props>(({
  xmlUrl,
  userId,
  cohortId,
  subconceptId,
}, ref) => {

  const { activity } = useActivityLoader(xmlUrl);

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showReview, setShowReview] = useState(false);
  const [result, setResult] = useState<{ score:number, maxScore:number } | null>(null);
  const { calculateScore } = useScoring(activity, answers);

  const { submit } = useSubmission(
    activity,
    userId,
    cohortId,
    subconceptId
  );

  useImperativeHandle(ref, () => ({
    async submitForm() {

      console.log("==== SUBMIT CLICKED ====");
      console.log("Answers at submit:", answers);

      if (!activity) return null;

      const allAnswered = activity.questions.every(q => {
        const val = answers[q.id];
        return val && val.toString().trim() !== "";
      });

      if (!allAnswered) {
        alert("Please answer all questions.");
        return null;
      }

      const { score, maxScore } = calculateScore();

      console.log("Calculated score:", score);
      console.log("Max score:", maxScore);

      submit(answers, score, maxScore);

      setResult({ score, maxScore });
      
      if (activity?.showScore !== false) {
        setShowReview(true);
      }

      return { score, maxScore, showScore: activity?.showScore !== false };
    },
  }));

  if (!activity) return null;

  if (showReview && result && activity?.showScore !== false) {

    const percentage = Math.round((result.score / result.maxScore) * 100);

    return (
      <div className="w-full flex justify-center min-h-screen">

        <div className="w-full max-w-4xl px-4 py-10 space-y-10">

          {/* Score Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">

            {(() => {
              const percentage = Math.round((result.score / result.maxScore) * 100);

              let message = "";
              let color = "bg-gray-400";

              if (percentage >= 90) {
                message = "Outstanding work. You have a strong grasp of this topic.";
                color = "bg-green-500";
              } else if (percentage >= 75) {
                message = "Great job. You are doing really well.";
                color = "bg-green-400";
              } else if (percentage >= 50) {
                message = "Good effort. A little more practice will make this even better.";
                color = "bg-yellow-400";
              } else {
                message = "Keep practicing. You are on the right track and improvement will come quickly.";
                color = "bg-red-400";
              }

              return (
                <div>

                  {/* Score */}
                  <div className="flex justify-between items-center mb-3">

                    <h2 className="text-lg font-semibold text-gray-900">
                      Score: {result.score} / {result.maxScore}
                    </h2>

                    <span className="text-sm font-semibold text-gray-600">
                      {percentage}%
                    </span>

                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

                    <div
                      className={`h-full ${color}`}
                      style={{
                        width: `${percentage}%`,
                        transition: "width 1s ease"
                      }}
                    />

                  </div>

                  {/* Message */}
                  <p className="mt-3 text-gray-700 text-sm">
                    {message}
                  </p>

                </div>
              );
            })()}

          </div>

          {/* Questions */}
          {activity.questions.map((q, index) => {

            const userAnswer = answers[q.id];
            const correctAnswer = q.correctAnswer;

            const isQuestionCorrect =
              JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);

            return (
              <div
                key={q.id}
                className="bg-white rounded-xl shadow-sm p-6"
              >

                {/* Question Header */}
                <div className="flex justify-between mb-4">

                  <p className="font-semibold text-gray-900">
                    Question {index + 1}
                  </p>

                  <span className={`text-sm font-semibold ${
                    isQuestionCorrect
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {isQuestionCorrect ? "Correct" : "Incorrect"}
                  </span>

                </div>

                <p className="text-gray-800 mb-4">
                  {q.text}
                </p>


                {/* Options */}
                {q.options && q.options.map((opt) => {

                  const isSelected =
                    Array.isArray(userAnswer)
                      ? userAnswer.includes(opt.id)
                      : userAnswer === opt.id;

                  const isCorrectOption =
                    Array.isArray(correctAnswer)
                      ? correctAnswer.includes(opt.id)
                      : correctAnswer === opt.id;

                  let style = "bg-gray-50";

                  if (isCorrectOption)
                    style = "bg-green-100";

                  if (isSelected && !isCorrectOption)
                    style = "bg-red-100";

                  if (isSelected && isCorrectOption)
                    style = "bg-blue-100";

                  return (
                    <div
                      key={opt.id}
                      className={`p-3 mb-2 rounded-md ${style}`}
                    >

                      <span className="font-semibold mr-2">
                        {opt.id}.
                      </span>

                      {opt.text}

                    </div>
                  );
                })}

              </div>
            );
          })}

        </div>

      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">

      <div className="w-full max-w-4xl space-y-6 px-4">

        {/* Instructions */}
        <p className="font-semibold text-gray-900 text-lg">
          {activity.instructions}
        </p>

        {/* Media */}
        {activity.media && (
          <MediaRenderer media={activity.media} />
        )}

        {/* Questions */}
        {activity.questions.map((q, index) => {

          const questionNumber = index + 1;

          if (q.type === "audio-typing")
            return (
              <AudioQuestion
                key={q.id}
                question={q}
                questionNumber={questionNumber}
                subconceptId={subconceptId}
                value={answers[q.id] || ""}
                onChange={val =>
                  setAnswers(prev => ({
                    ...prev,
                    [q.id]: val
                  }))
                }
              />
            );

          if (q.type === "text-input")
            return (
              <TextInputQuestion
                key={q.id}
                question={q}
                questionNumber={questionNumber}
                value={answers[q.id] || ""}
                onChange={val =>
                  setAnswers(prev => ({
                    ...prev,
                    [q.id]: val
                  }))
                }
              />
            );

          if (q.type === "mcq-single")
            return (
              <MCQSingle
                key={q.id}
                question={q}
                questionNumber={questionNumber}
                value={answers[q.id] || ""}
                onChange={val =>
                  setAnswers(prev => ({
                    ...prev,
                    [q.id]: val
                  }))
                }
              />
            );

          if (q.type === "mcq-multiple")
            return (
              <MCQMultiple
                key={q.id}
                question={q}
                questionNumber={questionNumber}
                value={answers[q.id] || []}
                onChange={val =>
                  setAnswers(prev => ({
                    ...prev,
                    [q.id]: val
                  }))
                }
              />
            );

          return null;
        })}

      </div>
    </div>
  );

});

export default ReactForm;