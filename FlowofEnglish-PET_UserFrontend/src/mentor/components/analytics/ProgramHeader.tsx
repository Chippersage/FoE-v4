// src/mentor/components/analytics/ProgramHeader.tsx
import { BookOpen, User } from 'lucide-react';

interface ProgramHeaderProps {
  programName: string;
  programDesc: string;
  learnerName?: string;
}

export default function ProgramHeader({ programName, programDesc, learnerName }: ProgramHeaderProps) {
  return (
    <div className="flex-1">
      {learnerName && (
        <div className="flex items-center gap-2 mb-2">
          <User className="h-5 w-5 text-gray-400" />
          <span className="text-lg font-semibold text-gray-800">{learnerName}</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="p-3 bg-blue-50 rounded-lg">
          <BookOpen className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{programName}</h1>
          <p className="text-gray-600 mt-1 max-w-2xl">{programDesc}</p>
        </div>
      </div>
    </div>
  );
}