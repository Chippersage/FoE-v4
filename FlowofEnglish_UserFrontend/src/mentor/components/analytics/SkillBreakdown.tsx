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


// // src/mentor/components/analytics/SkillBreakdown.tsx
// import { 
//   BookOpen, MessageSquare, Edit3, Headphones, BarChart3,
//   Brain, Globe, Users, Lightbulb, Target, Sparkles, TrendingUp,
//   BookText, Eye, Award, GraduationCap, ClipboardList, Mic,
//   Library, Puzzle, Layers, FileText, Heart, Zap, Star,
//   Clock, CheckCircle, Calendar, BookMarked, type LucideIcon
// } from 'lucide-react';

// interface SkillBreakdownProps {
//   stages: any[];
// }

// // Define all possible skills with their icons and colors
// const ALL_SKILLS: Record<string, { 
//   icon: LucideIcon; 
//   color: string; 
//   bgColor: string;
// }> = {
//   'Reading': { 
//     icon: BookOpen, 
//     color: 'text-blue-600', 
//     bgColor: 'bg-blue-50' 
//   },
//   'Writing': { 
//     icon: Edit3, 
//     color: 'text-purple-600', 
//     bgColor: 'bg-purple-50' 
//   },
//   'Speaking': { 
//     icon: MessageSquare, 
//     color: 'text-green-600', 
//     bgColor: 'bg-green-50' 
//   },
//   'Listening': { 
//     icon: Headphones, 
//     color: 'text-orange-600', 
//     bgColor: 'bg-orange-50' 
//   },
//   'Grammar': { 
//     icon: BookText, 
//     color: 'text-red-600', 
//     bgColor: 'bg-red-50' 
//   },
//   'Vocabulary': { 
//     icon: BookMarked, 
//     color: 'text-indigo-600', 
//     bgColor: 'bg-indigo-50' 
//   },
//   'Critical Thinking': { 
//     icon: Brain, 
//     color: 'text-rose-600', 
//     bgColor: 'bg-rose-50' 
//   },
//   'Literary Analysis': { 
//     icon: Library, 
//     color: 'text-amber-600', 
//     bgColor: 'bg-amber-50' 
//   },
//   'Visual Literacy': { 
//     icon: Eye, 
//     color: 'text-cyan-600', 
//     bgColor: 'bg-cyan-50' 
//   },
//   'Cultural Literacy': { 
//     icon: Globe, 
//     color: 'text-emerald-600', 
//     bgColor: 'bg-emerald-50' 
//   },
//   'Classroom Management': { 
//     icon: Users, 
//     color: 'text-violet-600', 
//     bgColor: 'bg-violet-50' 
//   },
//   'Communication': { 
//     icon: Mic, 
//     color: 'text-pink-600', 
//     bgColor: 'bg-pink-50' 
//   },
//   'Creativity': { 
//     icon: Sparkles, 
//     color: 'text-fuchsia-600', 
//     bgColor: 'bg-fuchsia-50' 
//   },
//   'Reasoning': { 
//     icon: Puzzle, 
//     color: 'text-lime-600', 
//     bgColor: 'bg-lime-50' 
//   },
//   'Professional Skills': { 
//     icon: GraduationCap, 
//     color: 'text-teal-600', 
//     bgColor: 'bg-teal-50' 
//   },
//   'Letter Recognition': { 
//     icon: Layers, 
//     color: 'text-sky-600', 
//     bgColor: 'bg-sky-50' 
//   },
//   'Vowel Recognition': { 
//     icon: Layers, 
//     color: 'text-sky-600', 
//     bgColor: 'bg-sky-50' 
//   },
//   'Blending letters': { 
//     icon: TrendingUp, 
//     color: 'text-blue-500', 
//     bgColor: 'bg-blue-50' 
//   },
//   'CVC words': { 
//     icon: FileText, 
//     color: 'text-purple-500', 
//     bgColor: 'bg-purple-50' 
//   },
//   'Phonic rules': { 
//     icon: Zap, 
//     color: 'text-yellow-600', 
//     bgColor: 'bg-yellow-50' 
//   },
//   'Sight words': { 
//     icon: Eye, 
//     color: 'text-cyan-600', 
//     bgColor: 'bg-cyan-50' 
//   },
//   'Contractions': { 
//     icon: Heart, 
//     color: 'text-rose-500', 
//     bgColor: 'bg-rose-50' 
//   },
//   'Evaluation': { 
//     icon: Award, 
//     color: 'text-amber-600', 
//     bgColor: 'bg-amber-50' 
//   },
//   'Etiquette': { 
//     icon: Star, 
//     color: 'text-gold-600', 
//     bgColor: 'bg-gold-50' 
//   },
//   'Leadership': { 
//     icon: Target, 
//     color: 'text-red-600', 
//     bgColor: 'bg-red-50' 
//   },
//   'Questioning': { 
//     icon: Lightbulb, 
//     color: 'text-yellow-600', 
//     bgColor: 'bg-yellow-50' 
//   },
//   'Professional Development': { 
//     icon: TrendingUp, 
//     color: 'text-teal-600', 
//     bgColor: 'bg-teal-50' 
//   },
//   'Planning': { 
//     icon: ClipboardList, 
//     color: 'text-indigo-600', 
//     bgColor: 'bg-indigo-50' 
//   },
//   'Sequencing': { 
//     icon: Clock, 
//     color: 'text-gray-600', 
//     bgColor: 'bg-gray-50' 
//   },
//   'Interpersonal Skills': { 
//     icon: Users, 
//     color: 'text-violet-600', 
//     bgColor: 'bg-violet-50' 
//   },
//   'Collaboration': { 
//     icon: Users, 
//     color: 'text-violet-600', 
//     bgColor: 'bg-violet-50' 
//   },
//   'Public Speaking': { 
//     icon: Mic, 
//     color: 'text-pink-600', 
//     bgColor: 'bg-pink-50' 
//   },
//   'Comprehension': { 
//     icon: Brain, 
//     color: 'text-rose-600', 
//     bgColor: 'bg-rose-50' 
//   },
//   'Active listening': { 
//     icon: Headphones, 
//     color: 'text-orange-600', 
//     bgColor: 'bg-orange-50' 
//   },
//   'Project Management': { 
//     icon: ClipboardList, 
//     color: 'text-indigo-600', 
//     bgColor: 'bg-indigo-50' 
//   },
//   'Conflict Resolution': { 
//     icon: Heart, 
//     color: 'text-rose-500', 
//     bgColor: 'bg-rose-50' 
//   },
//   'Professional Etiquette': { 
//     icon: Star, 
//     color: 'text-gold-600', 
//     bgColor: 'bg-gold-50' 
//   },
//   'Basic Skills': { 
//     icon: CheckCircle, 
//     color: 'text-green-600', 
//     bgColor: 'bg-green-50' 
//   },
//   'Skill Development': { 
//     icon: TrendingUp, 
//     color: 'text-teal-600', 
//     bgColor: 'bg-teal-50' 
//   },
// };

// export default function SkillBreakdown({ stages }: SkillBreakdownProps) {
//   // Initialize skills count object
//   const skillCounts: Record<string, number> = {};

//   // Count occurrences of each skill from conceptSkill1 and conceptSkill2
//   stages.forEach(stage => {
//     stage.units.forEach((unit: any) => {
//       unit.subconcepts.forEach((subconcept: any) => {
//         const concept = subconcept.concept;
        
//         // Count skill from conceptSkill1
//         if (concept.conceptSkill1) {
//           const skill = concept.conceptSkill1.trim();
//           if (ALL_SKILLS[skill]) {
//             skillCounts[skill] = (skillCounts[skill] || 0) + 1;
//           }
//         }
        
//         // Count skill from conceptSkill2
//         if (concept.conceptSkill2) {
//           const skill = concept.conceptSkill2.trim();
//           if (ALL_SKILLS[skill]) {
//             skillCounts[skill] = (skillCounts[skill] || 0) + 1;
//           }
//         }
//       });
//     });
//   });

//   // Filter skills that actually appear in the data and have count > 0
//   const skillsInData = Object.entries(skillCounts)
//     .filter(([_, count]) => count > 0)
//     .map(([skillName, count]) => ({
//       name: skillName,
//       count,
//       ...ALL_SKILLS[skillName]
//     }))
//     .sort((a, b) => b.count - a.count); // Sort by count descending

//   const totalSkills = skillsInData.reduce((sum, skill) => sum + skill.count, 0);

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-lg font-semibold text-gray-800">Skill Development</h3>
//         <div className="text-sm text-gray-500">
//           Total activities: <span className="font-medium text-gray-900">{totalSkills}</span>
//         </div>
//       </div>
      
//       <div className="space-y-4">
//         {skillsInData.length > 0 ? (
//           skillsInData.map((skill) => {
//             const percentage = totalSkills > 0 ? (skill.count / totalSkills) * 100 : 0;
//             const Icon = skill.icon;
//             const barColor = skill.color.replace('text-', 'bg-');
            
//             return (
//               <div key={skill.name} className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className={`p-2 rounded-lg ${skill.bgColor} ${skill.color}`}>
//                       <Icon className="h-4 w-4" />
//                     </div>
//                     <div className="min-w-0">
//                       <span className="text-sm font-medium text-gray-700 truncate block">
//                         {skill.name}
//                       </span>
//                       <span className="text-xs text-gray-500">
//                         {((percentage).toFixed(1))}%
//                       </span>
//                     </div>
//                   </div>
//                   <div className="text-right flex-shrink-0">
//                     <span className="text-sm font-medium text-gray-900">{skill.count}</span>
//                     <span className="text-xs text-gray-500 ml-1">activities</span>
//                   </div>
//                 </div>
//                 <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                   <div 
//                     className={`h-full ${barColor} rounded-full transition-all duration-500`}
//                     style={{ width: `${percentage}%` }}
//                   />
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div className="text-center py-8 text-gray-500">
//             <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
//             <p className="text-sm">No skill data available</p>
//           </div>
//         )}
//       </div>
      
//       {skillsInData.length > 0 && (
//         <div className="mt-6 pt-6 border-t border-gray-200">
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//             <div className="text-center p-3 bg-gray-50 rounded-lg">
//               <div className="text-lg font-semibold text-gray-900">{skillsInData.length}</div>
//               <div className="text-xs text-gray-600">Skills Covered</div>
//             </div>
//             <div className="text-center p-3 bg-gray-50 rounded-lg">
//               <div className="text-lg font-semibold text-gray-900">{totalSkills}</div>
//               <div className="text-xs text-gray-600">Total Activities</div>
//             </div>
//             <div className="text-center p-3 bg-gray-50 rounded-lg">
//               <div className="text-lg font-semibold text-gray-900">
//                 {skillsInData[0]?.name || 'N/A'}
//               </div>
//               <div className="text-xs text-gray-600">Top Skill</div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }