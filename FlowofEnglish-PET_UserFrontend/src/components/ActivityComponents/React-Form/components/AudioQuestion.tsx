// features/react-form/components/AudioQuestion.tsx
import AudioPlayer from "./AudioPlayer";

interface Props {
  question: any;
  subconceptId: string;
  value: string;
  onChange: (val: string) => void;
}

export default function AudioQuestion({
  question,
  subconceptId,
  value,
  onChange,
}: Props) {
  return (
    <div className="px-5 py-4 bg-white border border-gray-200 rounded-xl space-y-3">
      
      {question.text && (
        <p className="text-gray-900 font-medium">
          {question.text}
        </p>
      )}

      <AudioPlayer
        subconceptId={subconceptId}
        audioId={question.id}
        audioUrl={question.audioUrl}
      />

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type exactly what you hear..."
        rows={3}
        className="
          w-full 
          border 
          border-gray-300 
          rounded-md 
          px-3 
          py-2 
          text-sm
          resize-none 
          focus:outline-none 
          focus:border-black
        "
      />
    </div>
  );
}