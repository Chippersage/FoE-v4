// features/react-form/hooks/useSubmission.ts

import { type Activity } from "../types";

export const useSubmission = (
  activity: Activity | null,
  userId: string,
  cohortId: string,
  subconceptId: string
) => {
  const submit = async (
    answers: Record<string, any>,
    score: number,
    maxScore: number
  ) => {
    if (!activity?.scriptUrl) return;

    const formData = new FormData();
    formData.append("learnerId", userId);
    formData.append("cohortId", cohortId);
    formData.append("subconceptId", subconceptId);
    formData.append("answers", JSON.stringify(answers));
    formData.append("score", score.toString());
    formData.append("maxScore", maxScore.toString());

    await fetch(activity.scriptUrl, {
      method: "POST",
      body: formData,
    });
  };

  return { submit };
};