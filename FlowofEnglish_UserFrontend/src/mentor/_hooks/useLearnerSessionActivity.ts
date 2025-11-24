import { useFetch } from "@/hooks/useFetch";
import { LearnerSessionActivity } from "@/types/mentor.types";

export function useLearnerSessionActivity(
  cohortId: string,
  mentorUserId: string,
  skip = false
) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const url = skip
    ? null
    : `${API_BASE_URL}/user-session-mappings/cohort/${cohortId}/mentor/${mentorUserId}`;

  const { data, isLoading, error } = useFetch<LearnerSessionActivity[]>(url, {
    skip,
    dependencies: [cohortId, mentorUserId],
  });

  return { activities: data || [], isLoading, error };
}