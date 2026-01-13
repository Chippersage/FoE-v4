import React from "react";

const SidebarSkeleton: React.FC = () => {
  return (
    <aside className="bg-white text-black flex flex-col h-full border-r border-gray-300">
      
      {/* Desktop Sidebar Skeleton */}
      <div className="hidden md:flex flex-col h-full">
        
        {/* Top spacer (same as real sidebar) */}
        <div className="h-16 w-full" />

        {/* Header */}
        <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          
          {[1, 2, 3].map((stage) => (
            <div key={stage} className="border-b border-gray-200 pb-3 space-y-2">
              
              {/* Stage header */}
              <div className="space-y-1">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="flex justify-between items-center">
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>

              {/* Units */}
              <div className="mt-2 space-y-2">
                {[1, 2].map((unit) => (
                  <div key={unit} className="space-y-2">
                    
                    {/* Unit row */}
                    <div className="flex items-center gap-3 p-2 rounded">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>

                    {/* Subconcepts */}
                    <div className="pl-2 space-y-2">
                      {[1, 2, 3].map((sub) => (
                        <div
                          key={sub}
                          className="flex items-center gap-3 p-2"
                        >
                          {/* Checkbox */}
                          <div className="h-4 w-4 rounded-full bg-gray-200 animate-pulse" />

                          {/* Icon */}
                          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />

                          {/* Text */}
                          <div className="h-3 w-full max-w-[200px] bg-gray-200 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ))}

        </div>
      </div>

      {/* Mobile Sidebar Skeleton */}
      <div className="flex md:hidden flex-col h-full">
        <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {[1, 2, 3].map((stage) => (
            <div key={stage} className="space-y-2">
              <div className="h-4 w-44 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-2 pl-2">
                {[1, 2].map((row) => (
                  <div
                    key={row}
                    className="h-3 w-36 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
};

export default SidebarSkeleton;
