export default function LearnerCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="mb-4 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-100 p-3 rounded h-16" />
        <div className="bg-gray-100 p-3 rounded h-16" />
      </div>

      <div className="h-40 bg-gray-100 rounded" />
    </div>
  );
}