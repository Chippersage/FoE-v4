import type {
  UserProgressData,
  ProcessedUserData,
  SkillScore,
  ConceptProgress,
  SkillDistribution,
} from "@/types/types";

export function processUserData(data: UserProgressData[]): ProcessedUserData {
  // console.log("Processing user data...", data);
  
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
    .sort((a, b) => b.maxScore - a.maxScore);

  // console.log("Concept progress data:", conceptProgress);

  // NEW: Create a map to aggregate skills properly
  const skillAggregationMap = new Map<string, { score: number; maxScore: number; count: number }>();

  data.forEach((item) => {
    const skill1 = item["conceptSkill-1"];
    const skill2 = item["conceptSkill-2"];
    
    // Process skill1
    if (skill1) {
      const existingSkill = skillAggregationMap.get(skill1) || { 
        score: 0, 
        maxScore: 0, 
        count: 0 
      };
      existingSkill.score += item.userTotalScore;
      existingSkill.maxScore += item.totalMaxScore;
      existingSkill.count += 1;
      skillAggregationMap.set(skill1, existingSkill);
    }

    // Process skill2 (only if different from skill1)
    if (skill2 && skill2 !== skill1) {
      const existingSkill = skillAggregationMap.get(skill2) || { 
        score: 0, 
        maxScore: 0, 
        count: 0 
      };
      existingSkill.score += item.userTotalScore;
      existingSkill.maxScore += item.totalMaxScore;
      existingSkill.count += 1;
      skillAggregationMap.set(skill2, existingSkill);
    }
  });

  // console.log("Skill aggregation map:", skillAggregationMap);

  // Calculate skill scores as percentages using aggregated data
  const skillScores: SkillScore[] = Array.from(skillAggregationMap.entries())
    .map(([skill, { score, maxScore, count }]) => ({
      skill,
      score: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
      rawScore: score,
      rawMaxScore: maxScore,
      conceptCount: count
    }))
    .filter(skill => skill.score > 0) // Filter out skills with 0 score for better visualization
    .sort((a, b) => b.score - a.score);

  // console.log("Aggregated skill scores:", skillScores);

  // Calculate skill distribution for charts
  const skillDistribution: SkillDistribution[] = skillScores.map(
    ({ skill, score }) => ({
      name: skill,
      value: score,
    })
  );

  // console.log("skillDistribution:", skillDistribution);

  // NEW: Also create skill-based concept groups for better visualization
  const skillBasedConceptGroups = Array.from(skillAggregationMap.entries())
    .map(([skill, { score, maxScore, count }]) => ({
      id: `skill-${skill.replace(/\s+/g, '-').toLowerCase()}`,
      name: `${skill} (${count} concepts)`,
      userScore: score,
      maxScore: maxScore,
      completedSubconcepts: 0, // Not applicable for aggregated skills
      totalSubconcepts: 0, // Not applicable for aggregated skills
      skill1: skill,
      skill2: skill,
      isAggregated: true
    }));

  // console.log("Skill-based concept groups:", skillBasedConceptGroups);

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
        concept.name
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
    skillBasedConceptGroups, // NEW: Add aggregated skill groups
  };
}