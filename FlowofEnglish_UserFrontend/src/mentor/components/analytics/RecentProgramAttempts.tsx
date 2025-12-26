import { Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AttemptItem {
  attemptId: number;
  subconceptDesc: string;
  conceptName: string;
  stageName: string;
  score: number;
  maxScore: number;
  attemptedAt: number;
}

interface Props {
    analyticsData: any;
    learnerName?: string;
    onViewDetailed: () => void;
}

export default function RecentProgramAttempts({ analyticsData, learnerName, onViewDetailed }: Props) {
    if (!analyticsData?.stages) return null;
    //  FLATTEN ALL ATTEMPTS
    const allAttempts: AttemptItem[] = [];

    analyticsData.stages.forEach((stage: any) => {
        stage.units?.forEach((unit: any) => {
        unit.subconcepts?.forEach((sc: any) => {
            sc.attempts?.forEach((a: any) => {
            allAttempts.push({
                attemptId: a.attemptId,
                subconceptDesc: sc.subconceptDesc,
                conceptName: sc.concept?.conceptName || 'Concept',
                stageName: stage.stageName,
                score: a.score,
                maxScore: sc.subconceptMaxscore,
                attemptedAt: a.endTimestamp
            });
            });
        });
        });
    });

    if (allAttempts.length === 0) {
        return (
        <div className="bg-white border rounded-lg p-4 text-sm text-gray-500">
            No activity recorded yet
        </div>
        );
    }
    // 🧠 Sort latest first
    const sorted = allAttempts.sort((a, b) => b.attemptedAt - a.attemptedAt);
    const visible = sorted.slice(0, 5);
    const hasMore = sorted.length > 5;
    const formatDate = (ts: number) =>
        new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return (
        <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border rounded-xl h-[340px] flex flex-col"
        >

            {/* HEADER */}
            <div className="sticky top-0 z-10 bg-white border-b px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <h3 className="text-base font-semibold text-gray-800 ">
            Recent Activity{learnerName ? ` • ${learnerName}` : ''}
            </h3>
            </div>
            <span className="text-[11px] text-gray-500 whitespace-nowrap">
            Last 5
            </span>
            </div>

            {/* ACTIVITY LIST */}
            <div className="max-h-72 overflow-y-auto px-3 py-2 space-y-1.5">
            {visible.map((a, i) => (
            <motion.div
            key={`${a.stageName}-${a.subconceptDesc}-${a.attemptId}-${a.attemptedAt}`}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-gray-50"
            >
            {/* LEFT */}
            <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-gray-900 truncate">
            {a.subconceptDesc}
            </div>
            <div className="text-sm text-gray-600 truncate">
            {a.conceptName}
            </div>
            <div className="inline-block mt-1 px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-600">
            {a.stageName}
            </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-900">
            {a.score}/{a.maxScore}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap mt-0.5">
            {formatDate(a.attemptedAt)}
            </span>
            </div>
            </motion.div>
            ))}
            </div>

            {/* FOOTER */}
            {hasMore && (
            <div className="border-t px-4 py-2 flex justify-between items-center text-xs">
            <span className="text-gray-500">
            Showing 5 of {sorted.length}
            </span>
            <button
            onClick={onViewDetailed}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
            >
            View more
            <ChevronRight className="h-3.5 w-3.5" />
            </button>
            </div>
            )}
            </motion.div>
            );
            }