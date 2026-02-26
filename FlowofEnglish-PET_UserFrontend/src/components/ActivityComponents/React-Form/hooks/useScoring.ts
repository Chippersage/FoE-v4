// features/react-form/hooks/useScoring.ts

import { type Activity } from "../types";

export const useScoring = (
  activity: Activity | null,
  answers: Record<string, any>
) => {
  const calculateScore = () => {
    if (!activity) return { score: 0, maxScore: 0 };

    let score = 0;
    let maxScore = 0;

    activity.questions.forEach(q => {
      maxScore += q.marks;

      if (q.type === "mcq-single") {
        const correct = q.options?.find(o => o.correct)?.id;
        if (answers[q.id] === correct) {
          score += q.marks;
        }
      }

      if (q.type === "mcq-multiple") {
        const correctOptions =
          q.options?.filter(o => o.correct).map(o => o.id) || [];

        const userAnswers = answers[q.id] || [];

        if (
          correctOptions.length === userAnswers.length &&
          correctOptions.every(id => userAnswers.includes(id))
        ) {
          score += q.marks;
        }
      }
    });

    return { score, maxScore };
  };

  return { calculateScore };
};