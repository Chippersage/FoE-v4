import type {
  UserProgressData,
  ProcessedUserData,
  SkillScore,
  ConceptProgress,
  SkillDistribution,
} from "@/types/types";

export function processUserData(data: UserProgressData[]): ProcessedUserData {
  console.log("Processing user data...", data);
  // Calculate overall completion percentage
  const totalSubconcepts = data.reduce(
    (sum, item) => sum + item.totalSubconcepts,
    0
  );
  const completedSubconcepts = data.reduce(
    (sum, item) => sum + item.completedSubconcepts,
    0
  );
  const overallCompletion =
    totalSubconcepts > 0 ? (completedSubconcepts / totalSubconcepts) * 100 : 0;

  // Calculate total score and max score
  const totalScore = data.reduce((sum, item) => sum + item.userTotalScore, 0);
  const totalMaxScore = data.reduce((sum, item) => sum + item.totalMaxScore, 0);

  // Process concept progress data for charts
  const conceptProgress: ConceptProgress[] = data
    .filter((item) => item.conceptName) // Filter out items with no name
    .map((item) => ({
      id: item.conceptId,
      name: item.conceptName,
      userScore: item.userTotalScore,
      maxScore: item.totalMaxScore,
      completedSubconcepts: item.completedSubconcepts,
      totalSubconcepts: item.totalSubconcepts,
      skill1: item["conceptSkill-1"],
      skill2: item["conceptSkill-2"],
    }))
    .sort((a, b) => b.maxScore - a.maxScore); // Sort by max score descending

    console.log("Concept progress data:", conceptProgress);

  // Extract unique skills and calculate skill scores
  const skillMap = new Map<string, { score: number; maxScore: number }>();

  data.forEach((item) => {
    if (item["conceptSkill-1"]) {
      const skill = skillMap.get(item["conceptSkill-1"]) || {
        score: 0,
        maxScore: 0,
      };
      skill.score += item.userTotalScore;
      skill.maxScore += item.totalMaxScore;
      skillMap.set(item["conceptSkill-1"], skill);
    }

    if (item["conceptSkill-2"] && item["conceptSkill-2"] !== item["conceptSkill-1"]) {
      const skill = skillMap.get(item["conceptSkill-2"]) || {
        score: 0,
        maxScore: 0,
      };
      skill.score += item.userTotalScore;
      skill.maxScore += item.totalMaxScore;
      skillMap.set(item["conceptSkill-2"], skill);
    }
  });

  // Calculate skill scores as percentages
  const skillScores: SkillScore[] = Array.from(skillMap.entries())
    .map(([skill, { score, maxScore }]) => ({
      skill,
      score: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    }))
    .sort((a, b) => b.score - a.score); // Sort by score descending

  // Calculate skill distribution
  const skillDistribution: SkillDistribution[] = skillScores.map(
    ({ skill, score }) => ({
      name: skill,
      value: score,
    })
  );

  console.log("skillDistribution:", skillDistribution);

  // Identify strengths (concepts with high completion)
  const strengths = conceptProgress
    .filter(
      (concept) =>
        concept.maxScore > 0 && concept.userScore / concept.maxScore >= 0.7
    )
    .sort((a, b) => b.userScore / b.maxScore - a.userScore / a.maxScore);

  // Identify areas to improve (concepts with low completion)
  const areasToImprove = conceptProgress
    .filter(
      (concept) =>
        concept.maxScore > 0 &&
        concept.userScore / concept.maxScore < 0.4 &&
        concept.name // Ensure it has a name
    )
    .sort((a, b) => a.userScore / a.maxScore - b.userScore / b.maxScore);

  return {
    overallCompletion,
    totalScore,
    totalMaxScore,
    conceptProgress,
    skillScores,
    skillDistribution,
    strengths,
    areasToImprove,
  };
}
