import React from "react";

const shimmerStyle = {
  background:
    "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 37%, #e5e7eb 63%)",
  backgroundSize: "400% 100%",
  animation: "shimmer 1.4s ease infinite",
};

const CourseSkeleton = () => {
  return (
    <div className="h-screen flex justify-center items-center bg-gray-50 p-4">
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
        `}
      </style>

      <div className="w-full max-w-5xl">
        <div
          className="h-[70vh] rounded-xl mb-6"
          style={shimmerStyle}
        ></div>

        <div className="flex justify-center gap-4">
          <div className="h-10 w-28 rounded-md" style={shimmerStyle}></div>
          <div className="h-10 w-28 rounded-md" style={shimmerStyle}></div>
          <div className="h-10 w-28 rounded-md" style={shimmerStyle}></div>
        </div>
      </div>
    </div>
  );
};

export default CourseSkeleton;
