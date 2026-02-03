// import { useFetch } from "../../hooks/useFetch";
// import { type MentorCohortProgressRow } from "../mentor.types";

// interface UseMentorProgressParams {
//   mentorId: string;
//   cohortId: string;
//   programId: string;
//   skip?: boolean;
// }

// export function useMentorCohortProgress({
//   mentorId,
//   cohortId,
//   programId,
//   skip = false,
// }: UseMentorProgressParams) {
//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//   const fetchData = () => {
//     if (skip || !mentorId || !cohortId || !programId) return Promise.resolve([]);
//     return fetch(`${API_BASE_URL}/reports/mentor/${mentorId}/program/${programId}/cohort/${cohortId}/progress`)
//       .then(res => res.json());
//   };

//   const { data, isLoading, error } = useFetch<MentorCohortProgressRow[]>(fetchData, {
//     skip,
//     dependencies: [mentorId, cohortId, programId],
//   });

//   return { learners: data || [], isLoading, error };
// }