import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, ZAxis, Cell } from 'recharts';

interface SkillImpactMatrixProps {
    skills: {
    name: string;
    score: number;          // mastery %
    conceptCount: number;   // how many concepts
    coverage: number;       // % of program concepts
    }[];
}

// Risk-based color logic
const getRiskColor = (score: number, coverage: number) => {
  if (coverage > 20 && score < 50) return '#EF4444'; // red → weak & important
  if (score < 70) return '#F59E0B';                  // amber → improving
  return '#10B981';                                  // green → strong
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const d = payload[0].payload;

  return (
    <div className="bg-white border rounded-lg p-3 shadow text-sm">
      <p className="font-semibold text-gray-900">{d.name}</p>
      <p>Mastery: <span className="font-medium">{d.score}%</span></p>
      <p>Coverage: <span className="font-medium">{d.coverage}%</span></p>
      <p>Concepts: <span className="font-medium">{d.conceptCount}</span></p>
    </div>
  );
};

export default function SkillImpactMatrix({ stages }: SkillImpactMatrixProps) {
   /* Build skill impact data */
   const skills = useMemo(() => {
    if (!stages?.length) return [];

    const skillMap: Record<string, {
      name: string;
      totalScore: number;
      maxScore: number;
      conceptCount: number;
    }> = {};

    let totalConcepts = 0;

    stages.forEach(stage => {
      stage.units?.forEach((unit: any) => {
        unit.subconcepts?.forEach((sub: any) => {
          const concept = sub.concept;
          if (!concept) return;

          totalConcepts++;

          const skills = [
            concept.conceptSkill1,
            concept.conceptSkill2
          ].filter(Boolean);

          skills.forEach((skill: string) => {
            const key = skill.trim();

            if (!skillMap[key]) {
              skillMap[key] = {
                name: key,
                totalScore: 0,
                maxScore: 0,
                conceptCount: 0
              };
            }

            skillMap[key].totalScore += sub.highestScore || 0;
            skillMap[key].maxScore += sub.maxScore || 100;
            skillMap[key].conceptCount += 1;
          });
        });
      });
    });

    return Object.values(skillMap).map(skill => ({
      name: skill.name,
      score: Math.round((skill.totalScore / skill.maxScore) * 100) || 0,
      conceptCount: skill.conceptCount,
      coverage: Math.round((skill.conceptCount / totalConcepts) * 100)
    }));
  }, [stages]);

   /* Empty state */
  if (!skills.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
        No skill data available
      </div>
    );
  }

   return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Skill Impact Matrix
        </h3>
        <p className="text-sm text-gray-500">
          Mastery vs Program Coverage
        </p>
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />

            {/* X Axis → Mastery */}
            <XAxis
              type="number"
              dataKey="score"
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              label={{
                value: 'Skill Mastery (%)',
                position: 'bottom',
                offset: 20
              }}
            />

            {/* Y Axis → Coverage */}
            <YAxis
              type="number"
              dataKey="coverage"
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              label={{
                value: 'Program Coverage (%)',
                angle: -90,
                position: 'left'
              }}
            />

            {/* Bubble size */}
            <ZAxis
              type="number"
              dataKey="conceptCount"
              range={[300, 1400]}
            />

            <Tooltip content={<CustomTooltip />} />

            <Scatter data={skills}>
              {skills.map((s, i) => (
                <Cell
                  key={i}
                  fill={getRiskColor(s.score, s.coverage)}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span>Weak & High Impact</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Needs Improvement</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span>Strong Skill</span>
        </div>
      </div>
    </div>
  );
}