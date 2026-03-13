// features/react-form/hooks/useSubmission.ts

import { type Activity } from "../types";
import { API } from "../config/google_scripts_api";

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

    let endpoint = "";

    if (subconceptId.startsWith("PET1")) {
      endpoint = API.PET1_APP_SCRIPT_LINK;
    } 
    else if (subconceptId.startsWith("PET2")) {
      endpoint = API.PET2_APP_SCRIPT_LINK;
    } 
    else if (subconceptId.startsWith("PET3")) {
      endpoint = API.PET3_APP_SCRIPT_LINK;
    }

    if (!endpoint) return;

    const params = new URLSearchParams();

    params.append("learnerId", userId);
    params.append("cohortId", cohortId);
    params.append("subconceptId", subconceptId);
    params.append("answers", JSON.stringify(answers));
    params.append("score", score.toString());
    params.append("maxScore", maxScore.toString());

    await fetch(endpoint, {
      method: "POST",
      body: params,
    });
  };

  return { submit };
};