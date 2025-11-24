import { useFetch } from "@/hooks/useFetch";
import { LearnerDetailedProgress } from "@/types/mentor.types";
import { processLearnerProgress } from "@/lib/data1-processing";

export function useDetailedLearnerProgress(
  userId: string,
  programId: string,
  skip = false
) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const url = skip
    ? null
    : `${API_BASE_URL}/reports/program/${userId}/${programId}`;

  const { data, isLoading, error } = useFetch<LearnerDetailedProgress>(url, {
    skip,
    dependencies: [userId, programId],
  });

  // Process data to filter attempts
  const processedData = data ? processLearnerProgress(data) : null;

  return { progress: processedData, isLoading, error };
}