// import { useFetch } from "../../hooks/useFetch";
// import { processLearnerProgress } from "../../lib/data1-processing";
// import type { LearnerDetailedProgress } from "../mentor.types";

// export function useDetailedLearnerProgress(
//   userId: string,
//   programId: string,
//   skip = false
// ) {
//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   const fetcher = skip
//     ? null
//     : () =>
//         fetch(`${API_BASE_URL}/reports/program/${userId}/${programId}`, {
//           credentials: "include",
//         }).then((r) => r.json());

//   const { data, isLoading, error } = useFetch<LearnerDetailedProgress>(
//     fetcher,
//     [userId, programId, skip]
//   );

//   const processed = data ? processLearnerProgress(data) : null;

//   return { progress: processed, isLoading, error };
// }
