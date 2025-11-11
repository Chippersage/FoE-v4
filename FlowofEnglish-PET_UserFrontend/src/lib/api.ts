// @ts-nocheck
import type { UserProgressData } from "@/types/types";

/**
 * Fetch user progress for a given program and user.
 * Expected backend endpoint:
 * GET /programs/{programId}/concepts/progress/{userId}
 */
export async function fetchUserProgress(
  selectedProgramId: string,
  userId: string
): Promise<UserProgressData[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  try {
    const response = await fetch(
      `${API_BASE_URL}/programs/${selectedProgramId}/concepts/progress/${userId}`,
      { credentials: "include" }
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
