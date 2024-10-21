const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-300 animate-pulse ${className}`}></div>
);

export default Skeleton
