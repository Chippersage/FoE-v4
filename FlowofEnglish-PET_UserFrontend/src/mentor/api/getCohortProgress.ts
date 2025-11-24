const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const getCohortProgress = async (mentorId: string, cohortId: string) => {
  const url = `${API_BASE_URL}/user-session-mappings/cohort/${cohortId}/mentor/${mentorId}`;
  console.log("🔗 Calling getCohortProgress:", url);

  const response = await fetch(url);
  if (!response.ok) {
    console.error("❌ getCohortProgress failed:", response.status, response.statusText);
    throw new Error("Failed to fetch cohort progress");
  }

  const data = await response.json();
  return data;
};
