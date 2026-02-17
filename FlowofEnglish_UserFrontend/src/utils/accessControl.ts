// Add allowed usernames here
const FULL_ACCESS_USER_IDS = new Set<string>([
  "Ritanya05",
  "Anitha01",
  "Suresh02",
  "Priya03",
  "Raghu04",
  "Maria05",
]);

export const hasFullAccess = (user: any): boolean => {
  if (!user) return false;

  const isMentor =
    user.userType?.toLowerCase() === "mentor";

  const isWhitelistedUser =
    user.userId && FULL_ACCESS_USER_IDS.has(user.userId);

  return isMentor || isWhitelistedUser;
};
