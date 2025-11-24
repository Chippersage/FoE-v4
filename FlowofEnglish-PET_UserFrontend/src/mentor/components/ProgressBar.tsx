export function ProgressBar({ value, total, label }: { value: number; total: number; label: string }) {
  const percent = ((value / total) * 100).toFixed(0);

  return (
    <div className="w-full my-2">
      <p className="text-sm mb-1">{label} — {value}/{total}</p>
      <div className="w-full h-3 bg-gray-300 rounded-full">
        <div
          className="h-3 bg-green-500 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
