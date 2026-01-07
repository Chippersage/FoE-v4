// components/SkillMastery.tsx
import React from 'react';
import { 
  BookOpen, MessageSquare, Edit3, Headphones, BarChart3, Brain, 
  Globe, Users, Lightbulb, Target, Sparkles, TrendingUp,
  BookText, Eye, Award, GraduationCap, ClipboardList, Mic, 
  Library, Puzzle, Layers, FileText, Heart, Zap, Star,
  Clock, CheckCircle, Calendar, BookMarked, type LucideIcon 
} from 'lucide-react';

interface SkillMasteryProps {
  scores: Array<{
    skill: string;
    count: number;
    total: number;
  }>;
}

// Define all possible skills with their icons and colors
const ALL_SKILLS: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
  'Reading': { icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  'Writing': { icon: Edit3, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  'Speaking': { icon: MessageSquare, color: 'text-green-600', bgColor: 'bg-green-50' },
  'Listening': { icon: Headphones, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  'Grammar': { icon: BookText, color: 'text-red-600', bgColor: 'bg-red-50' },
  'Vocabulary': { icon: BookMarked, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  'Critical Thinking': { icon: Brain, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  'Literary Analysis': { icon: Library, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  'Visual Literacy': { icon: Eye, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  'Cultural Literacy': { icon: Globe, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  'Classroom Management': { icon: Users, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  'Communication': { icon: Mic, color: 'text-pink-600', bgColor: 'bg-pink-50' },
  'Creativity': { icon: Sparkles, color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-50' },
  'Reasoning': { icon: Puzzle, color: 'text-lime-600', bgColor: 'bg-lime-50' },
  'Professional Skills': { icon: GraduationCap, color: 'text-teal-600', bgColor: 'bg-teal-50' },
  'Letter Recognition': { icon: Layers, color: 'text-sky-600', bgColor: 'bg-sky-50' },
  'Vowel Recognition': { icon: Layers, color: 'text-sky-600', bgColor: 'bg-sky-50' },
  'Blending letters': { icon: TrendingUp, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  'CVC words': { icon: FileText, color: 'text-purple-500', bgColor: 'bg-purple-50' },
  'Phonic rules': { icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  'Sight words': { icon: Eye, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  'Contractions': { icon: Heart, color: 'text-rose-500', bgColor: 'bg-rose-50' },
  'Evaluation': { icon: Award, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  'Etiquette': { icon: Star, color: 'text-gold-600', bgColor: 'bg-gold-50' },
  'Leadership': { icon: Target, color: 'text-red-600', bgColor: 'bg-red-50' },
  'Questioning': { icon: Lightbulb, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  'Professional Development': { icon: TrendingUp, color: 'text-teal-600', bgColor: 'bg-teal-50' },
  'Planning': { icon: ClipboardList, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  'Sequencing': { icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  'Interpersonal Skills': { icon: Users, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  'Collaboration': { icon: Users, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  'Public Speaking': { icon: Mic, color: 'text-pink-600', bgColor: 'bg-pink-50' },
  'Comprehension': { icon: Brain, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  'Active listening': { icon: Headphones, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  'Project Management': { icon: ClipboardList, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  'Conflict Resolution': { icon: Heart, color: 'text-rose-500', bgColor: 'bg-rose-50' },
  'Professional Etiquette': { icon: Star, color: 'text-gold-600', bgColor: 'bg-gold-50' },
  'Basic Skills': { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  'Skill Development': { icon: TrendingUp, color: 'text-teal-600', bgColor: 'bg-teal-50' },
};

const SkillMastery: React.FC<SkillMasteryProps> = ({ scores }) => {
  // Calculate total activities
  const totalActivities = scores.reduce((sum, skill) => sum + skill.total, 0);
  const completedActivities = scores.reduce((sum, skill) => sum + skill.count, 0);

  // Filter skills that actually appear in the data and have count > 0
  const skillsInData = scores
    .filter(({ count, total }) => count > 0 || total > 0)
    .map((skillData) => ({
      ...skillData,
      ...(ALL_SKILLS[skillData.skill] || {
        icon: TrendingUp,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50'
      })
    }))
    .sort((a, b) => {
      // Sort by completion percentage descending
      const percentageA = a.total > 0 ? (a.count / a.total) : 0;
      const percentageB = b.total > 0 ? (b.count / b.total) : 0;
      return percentageB - percentageA;
    });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Skill Mastery</h3>
        <div className="text-sm text-gray-500">
          <span className="font-medium text-gray-900">{completedActivities}/{totalActivities}</span>
          <span className="ml-1">activities completed</span>
        </div>
      </div>

      {/* Scrollable Skills List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[380px]">
        {skillsInData.length > 0 ? (
          skillsInData.map((skill) => {
            const percentage = skill.total > 0 ? (skill.count / skill.total) * 100 : 0;
            const Icon = skill.icon;
            const barColor = skill.color.replace('text-', 'bg-');

            return (
              <div key={skill.skill} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${skill.bgColor} ${skill.color} flex-shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-700 truncate block">
                        {skill.skill}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {percentage.toFixed(1)}%
                        </span>
                        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                        <span className="text-xs text-gray-500">
                          {skill.count}/{skill.total}
                        </span>
                      </div>
                    </div>
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

      {/* Summary Stats */}
      {skillsInData.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{skillsInData.length}</div>
              <div className="text-xs text-gray-600">Skills</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-600">Overall</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900 truncate" title={skillsInData[0]?.skill || 'N/A'}>
                {skillsInData[0]?.skill || 'N/A'}
              </div>
              <div className="text-xs text-gray-600">Top Skill</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillMastery;