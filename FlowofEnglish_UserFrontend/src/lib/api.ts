import type { UserProgressData } from "@/types/types";

export async function fetchUserProgress(
  selectedProgramId: string,
  userId: string
): Promise<UserProgressData[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  try {
    const response = await fetch(
      `${API_BASE_URL}/programs/${selectedProgramId}/concepts/progress/${userId}`,
      { credentials: "include" } // optional if your API needs cookies/session
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user progress:", error);
    throw error;
  }
}
