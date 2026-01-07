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
          date: new Date(attempt.endTimestamp * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          }),
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
    <div className="mb-1.5 bg-white rounded border border-gray-200">
      <button
        onClick={() => setIsUnitOpen(!isUnitOpen)}
        className="w-full flex items-center justify-between p-2 md:p-2.5 hover:bg-gray-50 transition-colors duration-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
      >
        <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
          {isUnitOpen ? (
            <ChevronDown size={14} className="flex-shrink-0" />
          ) : (
            <ChevronRight size={14} className="flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-800 text-xs md:text-sm truncate">
              Unit: {unit.unitName}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {allAttempts.length} attempt{allAttempts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </button>
      
      {isUnitOpen && allAttempts.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1.5 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    DATE
                  </th>
                  <th className="px-2 py-1.5 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    SUBCONCEPT
                  </th>
                  <th className="px-2 py-1.5 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">
                    CONCEPT
                  </th>
                  <th className="px-2 py-1.5 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    SCORE
                  </th>
                  <th className="px-2 py-1.5 text-left text-[10px] xs:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden xs:table-cell">
                    ATTEMPTS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allAttempts.map((attempt, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-2 py-1.5 text-xs text-gray-900 whitespace-nowrap">
                      <span className="block max-w-[70px] md:max-w-[80px]">
                        {attempt.date}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      {/* Full subconcept name - no truncation */}
                      <div className="text-xs text-gray-900">
                        {attempt.subconceptDesc}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 hidden sm:table-cell">
                      {/* Full concept description - no truncation */}
                      <div className="text-xs text-gray-900">
                        {attempt.conceptDesc}
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${attempt.score >= 3 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {attempt.score.toFixed(0)}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-900 hidden xs:table-cell whitespace-nowrap">
                      {attempt.attempts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {isUnitOpen && allAttempts.length === 0 && (
        <div className="border-t border-gray-200 p-2 text-center text-xs text-gray-500">
          No attempt history
        </div>
      )}
    </div>
  );
}