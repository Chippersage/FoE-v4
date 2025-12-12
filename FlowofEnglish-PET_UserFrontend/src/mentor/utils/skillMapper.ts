export const UMBRELLA_SKILLS: Record<string, string> = {
  Speaking: "Speaking",
  Grammar: "Grammar",
  Reading: "Reading",
  Writing: "Writing",
  Vocabulary: "Vocabulary",
  Listening: "Listening",

  Communication: "Skill Development",
  "Classroom Management": "Skill Development",
  "Professional Development": "Skill Development",
  Planning: "Skill Development",
  Leadership: "Skill Development",
  Evaluation: "Skill Development",
  "Project Management": "Skill Development",
  Questioning: "Skill Development",
  Project: "Skill Development",

  Etiquette: "Critical Thinking",
  "Critical Thinking": "Critical Thinking",
};

export function mapToUmbrellaSkill(rawSkill?: string, altSkill?: string): string {
  if (!rawSkill && !altSkill) return "Skill Development";
  if (rawSkill && UMBRELLA_SKILLS[rawSkill]) return UMBRELLA_SKILLS[rawSkill];
  if (altSkill && UMBRELLA_SKILLS[altSkill]) return UMBRELLA_SKILLS[altSkill];

  const r = (rawSkill || "").toString().trim();
  const a = (altSkill || "").toString().trim();
  
  for (const key of Object.keys(UMBRELLA_SKILLS)) {
    if (key.toLowerCase() === r.toLowerCase()) return UMBRELLA_SKILLS[key];
    if (key.toLowerCase() === a.toLowerCase()) return UMBRELLA_SKILLS[key];
  }

  const direct = ["Speaking","Grammar","Reading","Writing","Vocabulary","Listening","Critical Thinking"];
  if (direct.includes(rawSkill || "")) return rawSkill || "";
  if (direct.includes(altSkill || "")) return altSkill || "";

  return "Skill Development";
}

interface SkillMap {
  [key: string]: {
    totalScore: number;
    maxPossible: number;
    count: number;
    total: number;
  };
}

interface ProcessedSkills {
  radar: Array<{ skill: string; value: number }>;
  distribution: Array<{ skill: string; count: number; total: number }>;
  rawMap: SkillMap;
}

export function processSkillsFromProgramData(programData: any): ProcessedSkills {
  const map: SkillMap = {
    Speaking: { totalScore: 0, maxPossible: 0, count: 0, total: 0 },
    Grammar: { totalScore: 0, maxPossible: 0, count: 0, total: 0 },
    "Skill Development": { totalScore: 0, maxPossible: 0, count: 0, total: 0 },
    Vocabulary: { totalScore: 0, maxPossible: 0, count: 0, total: 0 },
    Reading: { totalScore: 0, maxPossible: 0, count: 0, total: 0 },
    Writing: { totalScore: 0, maxPossible: 0, count: 0, total: 0 },
    Listening: { totalScore: 0, maxPossible: 0, count: 0, total: 0 },
    "Critical Thinking": { totalScore: 0, maxPossible: 0, count: 0, total: 0 },
  };

  const allSubconcepts: any[] = [];
  
  if (programData?.stages) {
    programData.stages.forEach((stage: any) => {
      if (stage.units) {
        stage.units.forEach((unit: any) => {
          if (unit.subconcepts) {
            allSubconcepts.push(...unit.subconcepts);
          }
        });
      }
    });
  }

  allSubconcepts.forEach((subconcept) => {
    const concept = subconcept.concept;
    if (!concept) return;

    const rawSkill1 = concept.conceptSkill1;
    const rawSkill2 = concept.conceptSkill2;
    const skill = mapToUmbrellaSkill(rawSkill1, rawSkill2);

    const highestScore = Number(subconcept.highestScore || 0);
    const maxScore = 5;
    const completed = subconcept.completed || false;

    map[skill].totalScore += highestScore;
    map[skill].maxPossible += maxScore;
    map[skill].total += 1;
    if (completed) {
      map[skill].count += 1;
    }
  });

  const radar = [
    "Speaking",
    "Grammar",
    "Skill Development",
    "Vocabulary",
    "Reading",
    "Writing",
    "Listening",
    "Critical Thinking",
  ].map((skill) => {
    const entry = map[skill] || { totalScore: 0, maxPossible: 0 };
    const value = entry.maxPossible === 0 ? 0 : Math.round((entry.totalScore / entry.maxPossible) * 100);
    return { skill, value };
  });

  const distribution = [
    "Speaking",
    "Grammar",
    "Skill Development",
    "Vocabulary",
    "Reading",
    "Writing",
    "Listening",
    "Critical Thinking",
  ].map((skill) => {
    const entry = map[skill] || { count: 0, total: 0 };
    return { skill, count: entry.count, total: entry.total };
  });

  return { radar, distribution, rawMap: map };
}

export const SKILL_COLORS: Record<string, string> = {
  Speaking: "#4CAF50",
  Grammar: "#FF6B6B",
  "Skill Development": "#4ECDC4",
  Vocabulary: "#FFD166",
  Reading: "#5A67D8",
  Writing: "#EF9F9F",
  Listening: "#9AE6B4",
  "Critical Thinking": "#F472B6",
};