// src/mentor/components/analytics/SkillBreakdown.tsx
import { BarChart3, BookOpen, MessageSquare, Edit3, Headphones } from 'lucide-react';

interface SkillBreakdownProps {
  stages: any[];
}

export default function SkillBreakdown({ stages }: SkillBreakdownProps) {
  // Extract skills from concepts across all subconcepts
  const skills = {
    'Reading': { icon: BookOpen, count: 0, color: 'text-blue-600 bg-blue-50' },
    'Speaking': { icon: MessageSquare, count: 0, color: 'text-green-600 bg-green-50' },
    'Writing': { icon: Edit3, count: 0, color: 'text-purple-600 bg-purple-50' },
    'Listening': { icon: Headphones, count: 0, color: 'text-orange-600 bg-orange-50' },
    'Critical Thinking': { icon: BarChart3, count: 0, color: 'text-red-600 bg-red-50' },
  };

  // Count occurrences of each skill
  stages.forEach(stage => {
    stage.units.forEach((unit: any) => {
      unit.subconcepts.forEach((subconcept: any) => {
        const concept = subconcept.concept;
        if (concept.conceptSkill1) {
          const skill = concept.conceptSkill1;
          if (skills[skill as keyof typeof skills]) {
            skills[skill as keyof typeof skills].count++;
          }
        }
        if (concept.conceptSkill2) {
          const skill = concept.conceptSkill2;
          if (skills[skill as keyof typeof skills]) {
            skills[skill as keyof typeof skills].count++;
          }
        }
      });
    });
  });

  const totalSkills = Object.values(skills).reduce((sum, skill) => sum + skill.count, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Skill Development</h3>
      <div className="space-y-4">
        {Object.entries(skills)
          .filter(([_, data]) => data.count > 0)
          .map(([skillName, data]) => {
            const percentage = totalSkills > 0 ? (data.count / totalSkills) * 100 : 0;
            const Icon = data.icon;
            
            return (
              <div key={skillName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${data.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{skillName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{data.count}</span>
                    <span className="text-xs text-gray-500 ml-1">activities</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${data.color.split(' ')[0].replace('text-', 'bg-')} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}