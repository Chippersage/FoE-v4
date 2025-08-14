export default function ProgressbarSkeleton() {
    return (
      <div className="flex flex-col mb-10 mx-auto w-full max-w-md px-6 py-4 bg-white gap-3 animate-pulse">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-300 rounded-md w-1/3"></div>

        {/* Progress Bar Skeleton */}
        <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gray-400"></div>
        </div>

        {/* Total Points Skeleton */}
        <div className="h-6 bg-gray-300 rounded-md w-1/2"></div>
      </div>
    );
}

