import { Calendar, Clock, BookOpen } from "lucide-react";

interface Concept {
  conceptSkill1?: string;
  conceptSkill2?: string;
}

interface Attempt {
  endTimestamp: number;
  score: number;
}

interface ProgramData {
  stages?: Array<{
    stageName: string;
    units?: Array<{
      unitName: string;
      subconcepts?: Array<{
        subconceptDesc?: string;
        attempts?: Attempt[];
        concept?: Concept;
      }>;
    }>;
  }>;
}

interface TimelineActivityProps {
  programData?: ProgramData;
}

export default function TimelineActivity({ programData }: TimelineActivityProps) {
  const recentAttempts: Array<{
    subconceptDesc: string;
    score: number;
    date: string;
    time: string;
    stageName: string;
    unitName: string;
    timestamp: number;
    concept?: Concept;
  }> = [];
  
  if (programData?.stages) {
    programData.stages.forEach(stage => {
      stage.units?.forEach(unit => {
        unit.subconcepts?.forEach(sub => {
          if (sub.attempts && sub.attempts.length > 0) {
            sub.attempts.forEach(attempt => {
              recentAttempts.push({
                subconceptDesc: sub.subconceptDesc || "",
                score: attempt.score,
                date: new Date(attempt.endTimestamp * 1000).toLocaleDateString(),
                time: new Date(attempt.endTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                stageName: stage.stageName,
                unitName: unit.unitName,
                timestamp: attempt.endTimestamp,
                concept: sub.concept
              });
            });
          }
        });
      });
    });
  }
  
  recentAttempts.sort((a, b) => b.timestamp - a.timestamp);
  const latestAttempts = recentAttempts.slice(0, 5);

  const formatConcept = (concept?: Concept): string => {
    if (!concept) return "";
    const parts: string[] = [];
    if (concept.conceptSkill1) parts.push(concept.conceptSkill1);
    if (concept.conceptSkill2) parts.push(concept.conceptSkill2);
    return parts.join(" · ");
  };

  return (
    <div className="space-y-3">
      {latestAttempts.map((attempt, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-start gap-2 flex-1">
              <BookOpen size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-sm line-clamp-2">{attempt.subconceptDesc}</h4>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-semibold ml-2 flex-shrink-0 ${attempt.score >= 3 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {attempt.score}/5
            </span>
          </div>
          
          {attempt.concept && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-1">
              {formatConcept(attempt.concept)}
            </p>
          )}
          
          <p className="text-xs text-gray-700 mb-2">
            {attempt.unitName} • {attempt.stageName}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {attempt.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {attempt.time}
              </span>
            </div>
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
              Attempted
            </span>
          </div>
        </div>
      ))}
      {latestAttempts.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border">
          <BookOpen size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">No recent activity</p>
        </div>
      )}
    </div>
  );
}