// Add allowed usernames here
const FULL_ACCESS_USER_IDS = new Set<string>([
  "Ritanya05",
  "Anitha02",
  "Suresh03",
  "Priya04",
  "Raghu05",
  "Maria06",
]);

export const hasFullAccess = (user: any): boolean => {
  if (!user) return false;

  const isMentor =
    user.userType?.toLowerCase() === "mentor";

  const isWhitelistedUser =
    user.userId && FULL_ACCESS_USER_IDS.has(user.userId);

  return isMentor || isWhitelistedUser;
};
