// features/react-form/ReactForm.tsx

import { useState } from "react";
import { useActivityLoader } from "./hooks/useActivityLoader";
import { useScoring } from "./hooks/useScoring";
import { useSubmission } from "./hooks/useSubmission";
import AudioQuestion from "./components/AudioQuestion";
import MCQSingle from "./components/MCQSingle";
import MCQMultiple from "./components/MCQMultiple";

interface Props {
  xmlUrl: string;
  userId: string;
  cohortId: string;
  subconceptId: string;
}

const ReactForm = ({
  xmlUrl,
  userId,
  cohortId,
  subconceptId,
}: Props) => {
  const { activity } = useActivityLoader(xmlUrl);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const { calculateScore } = useScoring(activity, answers);
  const { submit } = useSubmission(
    activity,
    userId,
    cohortId,
    subconceptId
  );

  if (!activity) return null;

  const handleSubmit = async () => {
    const { score, maxScore } = calculateScore();
    await submit(answers, score, maxScore);
  };

  return (
    <div className="space-y-6">
      <p>{activity.instructions}</p>

      {activity.questions.map(q => {
        if (q.type === "audio-typing")
          return (
            <AudioQuestion
              key={q.id}
              question={q}
              value={answers[q.id] || ""}
              onChange={val =>
                setAnswers(prev => ({ ...prev, [q.id]: val }))
              }
            />
          );

        if (q.type === "mcq-single")
          return (
            <MCQSingle
              key={q.id}
              question={q}
              value={answers[q.id] || ""}
              onChange={val =>
                setAnswers(prev => ({ ...prev, [q.id]: val }))
              }
            />
          );

        if (q.type === "mcq-multiple")
          return (
            <MCQMultiple
              key={q.id}
              question={q}
              value={answers[q.id] || []}
              onChange={val =>
                setAnswers(prev => ({ ...prev, [q.id]: val }))
              }
            />
          );

        return null;
      })}

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Submit
      </button>
    </div>
  );
};

export default ReactForm;