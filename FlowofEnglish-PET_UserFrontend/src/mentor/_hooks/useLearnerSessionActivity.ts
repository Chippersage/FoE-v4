// import { useFetch } from "../../hooks/useFetch";
// import {type  LearnerSessionActivity } from "../../mentor/mentor.types";

// export function useLearnerSessionActivity(
//   cohortId: string,
//   mentorUserId: string,
//   skip = false
// ) {
//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
//   // Create a fetch function
//   const fetchData = () => {
//     if (skip || !cohortId || !mentorUserId) return Promise.resolve([]);
//     return fetch(`${API_BASE_URL}/user-session-mappings/cohort/${cohortId}/mentor/${mentorUserId}`)
//       .then(res => res.json());
//   };

//   const { data, isLoading, error } = useFetch<LearnerSessionActivity[]>(fetchData, {
//     skip,
//     dependencies: [cohortId, mentorUserId],
//   });

//   return { activities: data || [], isLoading, error };
// }