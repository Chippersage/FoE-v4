interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  color: string;
}

export default function StatCard({ label, value, subLabel, color }: StatCardProps) {
  return (
    <div className={`rounded-xl shadow p-3 sm:p-4 ${color} hover:shadow-md transition-shadow`}>
      <p className="text-xs sm:text-sm font-medium mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-bold">{value}</p>
      {subLabel && <p className="text-xs text-gray-600 mt-1">{subLabel}</p>}
    </div>
  );
}