import { Progress } from "../../ui/progress";

interface ProgressSectionProps {
  currentCardIndex: number;
  totalCards: number;
  progress: number;
}

export function ProgressSection({
  currentCardIndex,
  totalCards,
  progress,
}: ProgressSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold text-white">
          Card {currentCardIndex + 1} of {totalCards}
        </span>
        <span className="text-lg font-semibold text-purple-300">
          {Math.round(progress)}% Complete
        </span>
      </div>
      <div className="relative">
        <Progress value={progress} className="h-3 bg-white/10" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-75"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
