import { type Question } from "../types";

interface Props {
  question: Question;
  questionNumber: number;
  value: string[];
  onChange: (val: string[]) => void;
}

const MCQMultiple = ({ question, questionNumber, value = [], onChange }: Props) => {

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden bg-white shadow-sm">

      {/* Header */}
      <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
        Question {questionNumber}
      </div>

      <div className="p-4 space-y-4">

        {/* Question text */}
        <p className="text-base text-gray-900">
          {question.text}
        </p>

        {/* Options */}
        <div className="space-y-2">

          {question.options?.map(opt => {

            const selected = value.includes(opt.id);

            return (
              <div
                key={opt.id}
                onClick={() => toggle(opt.id)}
                className={`
                  flex items-center gap-3 p-3 rounded-md cursor-pointer
                  transition-all
                  ${selected
                    ? "bg-green-100 ring-2 ring-green-400"
                    : "bg-gray-50 hover:bg-gray-100"}
                `}
              >

                {/* Option letter */}
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
                  {opt.id}
                </div>

                {/* Option text */}
                <span className="text-sm text-gray-800">
                  {opt.text}
                </span>

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
};

export default MCQMultiple;