import { useFetch } from "@/hooks/useFetch";
import { MentorCohortProgress } from "@/mentor/mentor.types";

interface UseMentorProgressParams {
  mentorId: string;
  cohortId: string;
  programId: string;
  skip?: boolean;
}

export function useMentorCohortProgress({
  mentorId,
  cohortId,
  programId,
  skip = false,
}: UseMentorProgressParams) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const url = skip
    ? null
    : `${API_BASE_URL}/reports/mentor/${mentorId}/program/${programId}/cohort/${cohortId}/progress`;

  const { data, isLoading, error } = useFetch<MentorCohortProgress[]>(url, {
    skip,
    dependencies: [mentorId, cohortId, programId],
  });

  return { learners: data || [], isLoading, error };
}