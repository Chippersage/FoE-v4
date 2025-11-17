// -----------------------------------------------------------------------------
// useAttemptScore.ts
// -----------------------------------------------------------------------------
// A small reusable hook that determines userAttemptScore based on
// subconcept type and its maximum score.
// -----------------------------------------------------------------------------

export const useAttemptScore = () => {
  const getScore = (type: string, maxScore?: number): number => {
    if (!type) return 0;

    const normalized = type.toLowerCase();

    // Types that always return 0 score
    const zeroTypes = ["assignment_image", "assessment"];

    // Types that return maxScore
    const maxScoreTypes = ["video", "youtube", "image", "pdf"];

    if (zeroTypes.includes(normalized)) return 0;

    if (maxScoreTypes.includes(normalized)) {
      if (typeof maxScore === "number") return maxScore;
      console.warn("Missing maxScore for type:", type);
      return 0;
    }

    return 0;
  };

  return { getScore };
};
