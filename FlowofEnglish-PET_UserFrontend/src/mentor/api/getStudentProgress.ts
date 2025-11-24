const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const getStudentProgress = async (userId: string, programId: string) => {
  const response = await fetch(`${API_BASE_URL}/reports/program/${userId}/${programId}`);
  return response.json();
};
