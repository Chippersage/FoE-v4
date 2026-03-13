interface Props {
  question: any;
  questionNumber: number;
  value: string;
  onChange: (val: string) => void;
}

export default function TextInputQuestion({
  question,
  questionNumber,
  value,
  onChange,
}: Props) {
  return (
    <div className="rounded-lg overflow-hidden bg-white shadow-sm">

      {/* Question Header */}
      <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
        Question {questionNumber}
      </div>

      <div className="p-4 space-y-4">

        {/* Question Text with HTML support */}
        {question.text && (
          <p
            className="text-base text-gray-900 whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: question.text }}
          />
        )}

        {/* Answer Input */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer..."
          rows={3}
          className="
            w-full
            bg-gray-50
            rounded-md
            px-3 py-2
            text-sm
            resize-none
            transition-all
            focus:outline-none
            focus:ring-2
            focus:ring-green-400
          "
        />

      </div>
    </div>
  );
}