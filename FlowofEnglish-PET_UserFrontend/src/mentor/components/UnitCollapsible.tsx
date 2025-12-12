import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Concept {
  conceptSkill1?: string;
  conceptSkill2?: string;
  conceptLevel?: string;
  conceptName?: string;
}

interface Attempt {
  endTimestamp: number;
  score: number;
}

interface Subconcept {
  subconceptDesc?: string;
  subconceptName?: string;
  concept?: Concept;
  attempts?: Attempt[];
}

interface Unit {
  unitName: string;
  subconcepts?: Subconcept[];
}

interface UnitCollapsibleProps {
  unit: Unit;
}

export default function UnitCollapsible({ unit }: UnitCollapsibleProps) {
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  
  const allAttempts: Array<{
    date: string;
    subconceptDesc: string;
    conceptDesc: string;
    score: number;
    attempts: number;
    timestamp: number;
  }> = [];
  
  unit.subconcepts?.forEach(sub => {
    if (sub.attempts && sub.attempts.length > 0) {
      sub.attempts.forEach(attempt => {
        allAttempts.push({
          date: new Date(attempt.endTimestamp * 1000).toLocaleDateString(),
          subconceptDesc: sub.subconceptDesc || sub.subconceptName || "N/A",
          conceptDesc: formatConceptString(sub.concept),
          score: attempt.score || 0,
          attempts: sub.attempts?.length || 1,
          timestamp: attempt.endTimestamp
        });
      });
    }
  });
  
  function formatConceptString(concept?: Concept): string {
    if (!concept) return "N/A";
    const parts: string[] = [];
    if (concept.conceptSkill1) parts.push(concept.conceptSkill1);
    if (concept.conceptSkill2) parts.push(concept.conceptSkill2);
    if (concept.conceptLevel) parts.push(concept.conceptLevel);
    if (concept.conceptName) parts.push(concept.conceptName);
    return parts.join(" · ");
  }
  
  allAttempts.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="mb-4 bg-white rounded-lg border">
      <button
        onClick={() => setIsUnitOpen(!isUnitOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          {isUnitOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <div>
            <h4 className="font-medium text-gray-800">Unit: {unit.unitName}</h4>
            <p className="text-sm text-gray-500">
              {allAttempts.length} attempt{allAttempts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
          {isUnitOpen ? 'Hide' : 'Show'} History
        </span>
      </button>
      
      {isUnitOpen && allAttempts.length > 0 && (
        <div className="border-t">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DATE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SUBCONCEPT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CONCEPT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SCORE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ATTEMPTS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allAttempts.map((attempt, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{attempt.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{attempt.subconceptDesc}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{attempt.conceptDesc}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded ${attempt.score >= 3 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {attempt.score.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {attempt.attempts} attempt{attempt.attempts !== 1 ? 's' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {isUnitOpen && allAttempts.length === 0 && (
        <div className="border-t p-4 text-center text-gray-500">
          No attempt history for this unit
        </div>
      )}
    </div>
  );
}