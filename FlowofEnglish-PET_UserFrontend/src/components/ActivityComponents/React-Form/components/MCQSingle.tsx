// features/react-form/components/MCQSingle.tsx

import { type Question } from "../types";

interface Props {
  question: Question;
  value: string;
  onChange: (val: string) => void;
}

const MCQSingle = ({ question, value, onChange }: Props) => {
  return (
    <div className="space-y-2">
      <p>{question.text}</p>
      {question.options?.map(opt => (
        <label key={opt.id} className="flex gap-2">
          <input
            type="radio"
            checked={value === opt.id}
            onChange={() => onChange(opt.id)}
          />
          {opt.text}
        </label>
      ))}
    </div>
  );
};

export default MCQSingle;