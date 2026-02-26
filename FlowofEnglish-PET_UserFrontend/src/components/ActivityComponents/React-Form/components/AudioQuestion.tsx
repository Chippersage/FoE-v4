// features/react-form/components/AudioQuestion.tsx

import { type Question } from "../types";

interface Props {
  question: Question;
  value: string;
  onChange: (val: string) => void;
}

const AudioQuestion = ({ question, value, onChange }: Props) => {
  return (
    <div className="space-y-3">
      <audio controls src={question.mediaUrl} />
      <textarea
        className="w-full border p-3 rounded"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
};

export default AudioQuestion;