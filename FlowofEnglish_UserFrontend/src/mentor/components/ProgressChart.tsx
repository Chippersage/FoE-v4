import type { SubconceptAttempt } from "@/mentor/mentor.types";

interface ProgressChartProps {
  title?: string;
  subconcepts: SubconceptAttempt[];
  maxWidthClass?: string;
}

export default function ProgressChart({
  title = "Subconcept Performance",
  subconcepts,
  maxWidthClass = "max-w-3xl",
}: ProgressChartProps) {
  // normalize best score (0 - 100)
  const items = subconcepts.map((s) => ({
    id: s.subconceptId,
    name: s.subconceptName,
    score: s.bestScore ?? (s.attempts[0]?.percentage ?? 0),
  }));

  const max = Math.max(100, ...items.map((i) => i.score || 0));

  return (
    <section className={`bg-white p-4 rounded-lg border border-gray-200 ${maxWidthClass}`}>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>

      <div className="space-y-3">
        {items.map((it) => {
          const pct = Math.round(((it.score || 0) / max) * 100);
          return (
            <div key={it.id} className="flex items-center gap-4">
              <div className="w-40 text-sm text-gray-700 truncate">{it.name}</div>
              <div className="flex-1">
                <div className="w-full h-3 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-green-400 to-blue-500"
                    style={{ width: `${pct}%` }}
                    aria-hidden
                  />
                </div>
              </div>
              <div className="w-14 text-right text-sm font-medium text-gray-700">
                {Math.round(it.score ?? 0)}%
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}