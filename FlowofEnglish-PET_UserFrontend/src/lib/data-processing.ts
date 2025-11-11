// @ts-nocheck
import type {
  UserProgressData,
  ProcessedUserData,
  SkillScore,
  ConceptProgress,
  SkillDistribution,
} from "@/types/types";

/**
 * Converts raw backend progress data into analytics
 * (scores, charts, skill maps, and improvement areas).
 */
export function processUserData(data: UserProgressData[]): ProcessedUserData {
  // Compute total subconcepts & completion %
  const totalSubconcepts = data.reduce((sum, item) => sum + item.totalSubconcepts, 0);
  const completedSubconcepts = data.reduce((sum, item) => sum + item.completedSubconcepts, 0);
  const overallCompletion =
    totalSubconcepts > 0 ? (completedSubconcepts / totalSubconcepts) * 100 : 0;

  // Total and max score
  const totalScore = data.reduce((sum, item) => sum + item.userTotalScore, 0);
  const totalMaxScore = data.reduce((sum, item) => sum + item.totalMaxScore, 0);

  // Concept-level progress data
  const conceptProgress: ConceptProgress[] = data
    .filter((item) => item.conceptName)
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

  // Skill aggregation map
  const skillMap = new Map<string, { score: number; maxScore: number; count: number }>();

  data.forEach((item) => {
    const skills = [item["conceptSkill-1"], item["conceptSkill-2"]];
    skills.forEach((skill) => {
      if (!skill) return;
      const existing = skillMap.get(skill) || { score: 0, maxScore: 0, count: 0 };
      existing.score += item.userTotalScore;
      existing.maxScore += item.totalMaxScore;
      existing.count += 1;
      skillMap.set(skill, existing);
    });
  });

  // Skill scores (%)
  const skillScores: SkillScore[] = Array.from(skillMap.entries())
    .map(([skill, { score, maxScore, count }]) => ({
      skill,
      score: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
      rawScore: score,
      rawMaxScore: maxScore,
      conceptCount: count,
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // Skill distribution for PieChart
  const skillDistribution: SkillDistribution[] = skillScores.map(({ skill, score }) => ({
    name: skill,
    value: score,
  }));

  // Identify strengths & areas to improve
  const strengths = conceptProgress.filter(
    (c) => c.maxScore > 0 && c.userScore / c.maxScore >= 0.7
  );
  const areasToImprove = conceptProgress.filter(
    (c) => c.maxScore > 0 && c.userScore / c.maxScore < 0.4
  );

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
