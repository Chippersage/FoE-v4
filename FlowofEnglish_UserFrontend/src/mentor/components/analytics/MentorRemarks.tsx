import { BookOpen } from "lucide-react";
import { RefObject } from "react";

interface MentorRemarksProps {
  remarksRef: RefObject<HTMLTextAreaElement>;
  mentorRemarks: string;
  setMentorRemarks: (value: string) => void;
  onSave: () => void;
}

export default function MentorRemarks({
  remarksRef,
  mentorRemarks,
  setMentorRemarks,
  onSave,
}: MentorRemarksProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Mentor Remarks
        </h3>
      </div>

      {/* Textarea */}
      <div className="flex-1 mb-4">
        <textarea
          ref={remarksRef}
          value={mentorRemarks}
          onChange={(e) => setMentorRemarks(e.target.value)}
          className="w-full h-full border border-gray-300 rounded-lg p-4
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     outline-none resize-none text-sm text-gray-700"
          placeholder="Write your remarks about the learner’s progress, strengths, and areas for improvement..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setMentorRemarks("")}
          className="px-4 py-2 border border-gray-300 rounded-lg
                     hover:bg-gray-50 text-sm font-medium text-gray-700"
        >
          Clear
        </button>

        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 text-sm font-medium"
        >
          Save Remarks
        </button>
      </div>
    </div>
  );
}
