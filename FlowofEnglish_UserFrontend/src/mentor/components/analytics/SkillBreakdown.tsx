// // src/mentor/components/analytics/SkillBreakdown.tsx
// import { BarChart3, BookOpen, MessageSquare, Edit3, Headphones } from 'lucide-react';

// interface SkillBreakdownProps {
//   stages: any[];
// }

// export default function SkillBreakdown({ stages }: SkillBreakdownProps) {
//   // Extract skills from concepts across all subconcepts
//   const skills = {
//     'Reading': { icon: BookOpen, count: 0, color: 'text-blue-600 bg-blue-50' },
//     'Speaking': { icon: MessageSquare, count: 0, color: 'text-green-600 bg-green-50' },
//     'Writing': { icon: Edit3, count: 0, color: 'text-purple-600 bg-purple-50' },
//     'Listening': { icon: Headphones, count: 0, color: 'text-orange-600 bg-orange-50' },
//     'Critical Thinking': { icon: BarChart3, count: 0, color: 'text-red-600 bg-red-50' },
//   };

//   // Count occurrences of each skill
//   stages.forEach(stage => {
//     stage.units.forEach((unit: any) => {
//       unit.subconcepts.forEach((subconcept: any) => {
//         const concept = subconcept.concept;
//         if (concept.conceptSkill1) {
//           const skill = concept.conceptSkill1;
//           if (skills[skill as keyof typeof skills]) {
//             skills[skill as keyof typeof skills].count++;
//           }
//         }
//         if (concept.conceptSkill2) {
//           const skill = concept.conceptSkill2;
//           if (skills[skill as keyof typeof skills]) {
//             skills[skill as keyof typeof skills].count++;
//           }
//         }
//       });
//     });
//   });

//   const totalSkills = Object.values(skills).reduce((sum, skill) => sum + skill.count, 0);

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//       <h3 className="text-lg font-semibold text-gray-800 mb-6">Skill Development</h3>
//       <div className="space-y-4">
//         {Object.entries(skills)
//           .filter(([_, data]) => data.count > 0)
//           .map(([skillName, data]) => {
//             const percentage = totalSkills > 0 ? (data.count / totalSkills) * 100 : 0;
//             const Icon = data.icon;
            
//             return (
//               <div key={skillName} className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className={`p-2 rounded-lg ${data.color}`}>
//                       <Icon className="h-4 w-4" />
//                     </div>
//                     <span className="text-sm font-medium text-gray-700">{skillName}</span>
//                   </div>
//                   <div className="text-right">
//                     <span className="text-sm font-medium text-gray-900">{data.count}</span>
//                     <span className="text-xs text-gray-500 ml-1">activities</span>
//                   </div>
//                 </div>
//                 <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                   <div 
//                     className={`h-full ${data.color.split(' ')[0].replace('text-', 'bg-')} rounded-full transition-all duration-500`}
//                     style={{ width: `${percentage}%` }}
//                   />
//                 </div>
//               </div>
//             );
//           })}
//       </div>
//     </div>
//   );
// }


// src/mentor/components/analytics/SkillBreakdown.tsx
import { BookOpen, MessageSquare, Edit3, Headphones, BarChart3, Brain, Globe, Users, Lightbulb, Target, Sparkles, TrendingUp,
  BookText, Eye, Award, GraduationCap, ClipboardList, Mic, Library, Puzzle, Layers, FileText, Heart, Zap, Star,
  Clock, CheckCircle, Calendar, BookMarked, type LucideIcon } from 'lucide-react';

interface SkillBreakdownProps {
  stages: any[];
}

// Define all possible skills with their icons and colors
const ALL_SKILLS: Record<string, { icon: LucideIcon; color: string; bgColor: string; barColor: string }> = {
  'Reading': { icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-50', barColor: 'bg-blue-600' },
  'Writing': { icon: Edit3, color: 'text-purple-600', bgColor: 'bg-purple-50', barColor: 'bg-purple-600' },
  'Speaking': { icon: MessageSquare, color: 'text-green-600', bgColor: 'bg-green-50', barColor: 'bg-green-600' },
  'Listening': { icon: Headphones, color: 'text-orange-600', bgColor: 'bg-orange-50', barColor: 'bg-orange-600' },
  'Grammar': { icon: BookText, color: 'text-red-600', bgColor: 'bg-red-50', barColor: 'bg-red-600' },
  'Vocabulary': { icon: BookMarked, color: 'text-indigo-600', bgColor: 'bg-indigo-50', barColor: 'bg-indigo-600' },
  'Critical Thinking': { icon: Brain, color: 'text-rose-600', bgColor: 'bg-rose-50', barColor: 'bg-rose-600' },
  'Literary Analysis': { icon: Library, color: 'text-amber-600', bgColor: 'bg-amber-50', barColor: 'bg-amber-600' },
  'Visual Literacy': { icon: Eye, color: 'text-cyan-600', bgColor: 'bg-cyan-50', barColor: 'bg-cyan-600' },
  'Cultural Literacy': { icon: Globe, color: 'text-emerald-600', bgColor: 'bg-emerald-50', barColor: 'bg-emerald-600' },
  'Classroom Management': { icon: Users, color: 'text-violet-600', bgColor: 'bg-violet-50', barColor: 'bg-violet-600' },
  'Communication': { icon: Mic, color: 'text-pink-600', bgColor: 'bg-pink-50', barColor: 'bg-pink-600' },
  'Creativity': { icon: Sparkles, color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-50', barColor: 'bg-fuchsia-600' },
  'Reasoning': { icon: Puzzle, color: 'text-lime-600', bgColor: 'bg-lime-50', barColor: 'bg-lime-600' },
  'Professional Skills': { icon: GraduationCap, color: 'text-teal-600', bgColor: 'bg-teal-50', barColor: 'bg-teal-600' },
  'Letter Recognition': { icon: Layers, color: 'text-sky-600', bgColor: 'bg-sky-50', barColor: 'bg-sky-600' },
  'Vowel Recognition': { icon: Layers, color: 'text-sky-500', bgColor: 'bg-sky-50', barColor: 'bg-sky-500' },
  'Blending letters': { icon: TrendingUp, color: 'text-blue-500', bgColor: 'bg-blue-50', barColor: 'bg-blue-500' },
  'CVC words': { icon: FileText, color: 'text-purple-500', bgColor: 'bg-purple-50', barColor: 'bg-purple-500' },
  'Phonic rules': { icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50', barColor: 'bg-yellow-600' },
  'Sight words': { icon: Eye, color: 'text-cyan-500', bgColor: 'bg-cyan-50', barColor: 'bg-cyan-500' },
  'Contractions': { icon: Heart, color: 'text-rose-500', bgColor: 'bg-rose-50', barColor: 'bg-rose-500' },
  'Evaluation': { icon: Award, color: 'text-amber-500', bgColor: 'bg-amber-50', barColor: 'bg-amber-500' },
  'Etiquette': { icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-50', barColor: 'bg-yellow-500' },
  'Leadership': { icon: Target, color: 'text-red-500', bgColor: 'bg-red-50', barColor: 'bg-red-500' },
  'Questioning': { icon: Lightbulb, color: 'text-yellow-700', bgColor: 'bg-yellow-50', barColor: 'bg-yellow-700' },
  'Professional Development': { icon: TrendingUp, color: 'text-teal-500', bgColor: 'bg-teal-50', barColor: 'bg-teal-500' },
  'Planning': { icon: ClipboardList, color: 'text-indigo-500', bgColor: 'bg-indigo-50', barColor: 'bg-indigo-500' },
  'Sequencing': { icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-50', barColor: 'bg-gray-600' },
  'Interpersonal Skills': { icon: Users, color: 'text-violet-500', bgColor: 'bg-violet-50', barColor: 'bg-violet-500' },
  'Collaboration': { icon: Users, color: 'text-violet-700', bgColor: 'bg-violet-50', barColor: 'bg-violet-700' },
  'Public Speaking': { icon: Mic, color: 'text-pink-500', bgColor: 'bg-pink-50', barColor: 'bg-pink-500' },
  'Comprehension': { icon: Brain, color: 'text-rose-700', bgColor: 'bg-rose-50', barColor: 'bg-rose-700' },
  'Active listening': { icon: Headphones, color: 'text-orange-500', bgColor: 'bg-orange-50', barColor: 'bg-orange-500' },
  'Project Management': { icon: ClipboardList, color: 'text-indigo-700', bgColor: 'bg-indigo-50', barColor: 'bg-indigo-700' },
  'Conflict Resolution': { icon: Heart, color: 'text-rose-400', bgColor: 'bg-rose-50', barColor: 'bg-rose-400' },
  'Professional Etiquette': { icon: Star, color: 'text-yellow-600', bgColor: 'bg-yellow-50', barColor: 'bg-yellow-600' },
  'Basic Skills': { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50', barColor: 'bg-green-500' },
  'Skill Development': { icon: TrendingUp, color: 'text-teal-700', bgColor: 'bg-teal-50', barColor: 'bg-teal-700' },
};


export default function SkillBreakdown({ stages }: SkillBreakdownProps) {

  // Calculate total subconcepts
  const totalSubconcepts = stages.reduce((total, stage) => {
  return total + stage.units.reduce((unitTotal, unit) => {
    return unitTotal + unit.subconcepts.length;
  }, 0);
}, 0);

  // Initialize skills count object
  const skillCounts: Record<string, number> = {};

  // Count occurrences of each skill from conceptSkill1 and conceptSkill2
  stages.forEach(stage => {
    stage.units.forEach((unit: any) => {
      unit.subconcepts.forEach((subconcept: any) => {
        const concept = subconcept.concept;
        
        // Count skill from conceptSkill1
        if (concept.conceptSkill1) {
          const skill = concept.conceptSkill1.trim();
          if (ALL_SKILLS[skill]) {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          }
        }
        
        // Count skill from conceptSkill2
        if (concept.conceptSkill2) {
          const skill = concept.conceptSkill2.trim();
          if (ALL_SKILLS[skill]) {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          }
        }
      });
    });
  });

  // Filter skills that actually appear in the data and have count > 0
  const skillsInData = Object.entries(skillCounts)
    .filter(([_, count]) => count > 0)
    .map(([skillName, count]) => ({
      name: skillName,
      count,
      ...ALL_SKILLS[skillName]
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  const totalSkills = skillsInData.reduce((sum, skill) => sum + skill.count, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-[520px] flex flex-col">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Skill Development</h3>
        <div className="text-sm text-gray-500">
          Total activities: <span className="font-medium text-gray-900">{totalSubconcepts}</span>
        </div>
      </div>

      {/* Scrollable Skills List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[380px]">
        {skillsInData.length > 0 ? (
          skillsInData.map((skill) => {
            const percentage = totalSkills > 0 ? (skill.count / totalSkills) * 100 : 0;
            const Icon = skill.icon;
            const barColor = skill.color.replace('text-', 'bg-');

            return (
              <div key={skill.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${skill.bgColor} ${skill.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-gray-700 truncate block">
                        {skill.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-medium text-gray-900">{skill.count}</span>
                    <span className="text-xs text-gray-500 ml-1">activities</span>
                  </div>
                </div>

                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm">No skill data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
