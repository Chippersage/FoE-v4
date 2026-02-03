const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-lg font-medium animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
