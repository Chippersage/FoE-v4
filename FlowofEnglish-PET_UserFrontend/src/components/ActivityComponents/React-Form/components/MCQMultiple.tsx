// features/react-form/components/MCQMultiple.tsx

import { type Question } from "../types";

interface Props {
  question: Question;
  value: string[];
  onChange: (val: string[]) => void;
}

const MCQMultiple = ({ question, value = [], onChange }: Props) => {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-2">
      <p>{question.text}</p>
      {question.options?.map(opt => (
        <label key={opt.id} className="flex gap-2">
          <input
            type="checkbox"
            checked={value.includes(opt.id)}
            onChange={() => toggle(opt.id)}
          />
          {opt.text}
        </label>
      ))}
    </div>
  );
};

export default MCQMultiple;