import { type LearnerDetailedProgress, type SubconceptAttempt } from "../mentor/mentor.types";

const MAX_RECENT_ATTEMPTS = 5;

/**
 * Filters subconcept attempts to show only the 5 most recent ones
 * or highest scoring attempts (whichever is more meaningful)
 */
export function processLearnerProgress(
  progress: LearnerDetailedProgress
): LearnerDetailedProgress {
  return {
    ...progress,
    subconcepts: progress.subconcepts.map((subconcept) =>
      filterSubconceptAttempts(subconcept)
    ),
  };
}

function filterSubconceptAttempts(subconcept: SubconceptAttempt): SubconceptAttempt {
  if (subconcept.attempts.length <= MAX_RECENT_ATTEMPTS) {
    return subconcept;
  }

  // Sort by date (most recent first)
  const byDate = [...subconcept.attempts]
    .sort((a, b) => new Date(b.attemptDate).getTime() - new Date(a.attemptDate).getTime())
    .slice(0, MAX_RECENT_ATTEMPTS);

  return {
    ...subconcept,
    attempts: byDate,
  };
}

export function calculateLearnerStats(progress: LearnerDetailedProgress) {
  return {
    totalAttempts: progress.subconcepts.reduce(
      (sum, sc) => sum + sc.attempts.length,
      0
    ),
    averageScore:
      progress.subconcepts.reduce((sum, sc) => sum + (sc.bestScore || 0), 0) /
      progress.subconcepts.length,
    completionPercentage:
      (progress.completedStages / progress.totalStages) * 100,
  };
}