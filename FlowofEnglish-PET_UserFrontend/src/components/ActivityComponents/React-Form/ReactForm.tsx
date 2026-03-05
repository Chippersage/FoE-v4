// features/react-form/ReactForm.tsx
import { forwardRef, useImperativeHandle, useState } from "react";
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

interface ReactFormRef {
  submitForm: () => Promise<{ score: number; maxScore: number } | null>;
}

const ReactForm = forwardRef<ReactFormRef, Props>(({
  xmlUrl,
  userId,
  cohortId,
  subconceptId,
}, ref) => {
  const { activity } = useActivityLoader(xmlUrl);
  const [answers, setAnswers] = useState<Record<string, any>>({});

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
      console.log("Activity questions:", activity.questions);
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

      await submit(answers, score, maxScore);

      return { score, maxScore };
    },
  }));

  if (!activity) return null;
  console.log("Current answers state:", answers);

  return (
    <div className="space-y-6 m-4">
      <p>{activity.instructions}</p>

      {activity.questions.map(q => {
        if (q.type === "audio-typing")
          return (
            <AudioQuestion
              key={q.id}
              question={q}
              subconceptId={subconceptId}
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
    </div>
  );
});

export default ReactForm;