const StagesSkeleton = () => {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Skeleton card 1 */}
      {[...Array(3)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="rounded-lg bg-white p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-6"></div>
            </div>
            <div className="h-3 bg-gray-300 rounded mb-4"></div>
            <div className="h-10 bg-gray-300 rounded mb-2"></div>
            {/* <div className="mt-4 grid grid-cols-2 gap-4">
              {[...Array(2)].map((_, unitIndex) => (
                <div key={unitIndex} className="h-6 bg-gray-300 rounded"></div>
              ))}
            </div> */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StagesSkeleton;
