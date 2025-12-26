// src/config/demoUsers.ts
export const DEMO_USERS: Set<string> = new Set([
  "Sachin10", 
  "JohnDoe", 
  "Johnson"
]);

// Store original IDs for display
export const DEMO_USER_ALLOWED_UNITS_ORIGINAL = ["L1-W1-U03", "L1-W2-U01"];
export const DEMO_USER_ALLOWED_STAGES_ORIGINAL = ["PET2STG1"];

// Create normalized sets for comparison
export const DEMO_USER_ALLOWED_UNITS = new Set(
  DEMO_USER_ALLOWED_UNITS_ORIGINAL.map(id => id.trim().toUpperCase())
);

export const DEMO_USER_ALLOWED_STAGES = new Set(
  DEMO_USER_ALLOWED_STAGES_ORIGINAL.map(id => id.trim().toUpperCase())
);

export const DEMO_USER_MESSAGE: string = "Demo user access: You can explore the program structure, but attempting or completing activities is not allowed.";

// Helper function to check if user is demo
export const isDemoUser = (userId: string | undefined): boolean => {
  if (!userId) return false;
  return DEMO_USERS.has(userId);
};

// Helper to check program type
export const getProgramType = (programId: string | undefined): string => {
  if (!programId) return 'OTHER';
  if (programId === 'PET-Level-1') return 'PET-1';
  if (programId === 'PET-Level-2') return 'PET-2';
  return 'OTHER';
};

// Helper to check if unit is allowed (normalized comparison)
export const isUnitAllowedForDemo = (unitId: string): boolean => {
  if (!unitId) return false;
  const normalizedUnitId = unitId.trim().toUpperCase();
  return DEMO_USER_ALLOWED_UNITS.has(normalizedUnitId);
};

// Helper to check if stage is allowed (normalized comparison)
export const isStageAllowedForDemo = (stageId: string): boolean => {
  if (!stageId) return false;
  const normalizedStageId = stageId.trim().toUpperCase();
  return DEMO_USER_ALLOWED_STAGES.has(normalizedStageId);
};

// Get display version of allowed content
export const getAllowedUnitsDisplay = (): string => {
  return DEMO_USER_ALLOWED_UNITS_ORIGINAL.join(', ');
};

export const getAllowedStagesDisplay = (): string => {
  return DEMO_USER_ALLOWED_STAGES_ORIGINAL.join(', ');
};

// Export type for program type
export type ProgramType = 'PET-1' | 'PET-2' | 'OTHER';