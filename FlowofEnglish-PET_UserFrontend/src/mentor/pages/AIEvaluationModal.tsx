// @ts-nocheck
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || "";

const LEVELS = ["Beginner", "Developing", "Competent", "Proficient", "Advanced"];

const RUBRICS = [
  { key: "comprehensibility", label: "Comprehensibility", min: 0 },
  { key: "pronunciation", label: "Pronunciation", min: 0 },
  { key: "grammar", label: "Grammar", min: 0 },
  { key: "vocabulary", label: "Vocabulary", min: 0 },
  { key: "fluency", label: "Fluency", min: 0 },
  { key: "organization", label: "Organization", min: 1 },
  { key: "audience", label: "Audience Awareness", min: 2 },
  { key: "interaction", label: "Interaction", min: 1 },
];

interface Props {
  assignmentId: string;
  onClose: () => void;
  onApply: (data: { score: number; remarks: string }) => void;
}

export default function AIEvaluationModal({
  assignmentId,
  onClose,
  onApply,
}: Props) {
  const [referenceQuestion, setReferenceQuestion] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [learnerName, setLearnerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiSupported, setAiSupported] = useState(true);

  const [level, setLevel] = useState(3);
  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [uiError, setUiError] = useState<string | null>(null);

  // Fetch assignment
  useEffect(() => {
    if (!assignmentId) return;

    const fetchAssignment = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/assignments/${assignmentId}`
        );

        if (!response.ok) throw new Error();

        const data = await response.json();

        const isAudio = data?.fileName?.match(/\.(mp3|wav|m4a|aac|ogg)$/i);

        if (!data?.subconceptDesc2 || !data?.downloadUrl || !isAudio) {
          setAiSupported(false);
          return;
        }

        setReferenceQuestion(data.subconceptDesc2);
        setMediaUrl(data.downloadUrl);
        setLearnerName(data.userName || "");
      } catch {
        setAiSupported(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  // Auto Transcription
  useEffect(() => {
    if (!mediaUrl || !aiSupported) return;

    const transcribe = async () => {
      try {
        setTranscribing(true);
        setTranscript(null);

        const res = await fetch(`${AI_API_BASE_URL}/transcribe-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mediaUrl,
            mediaType: "audio",
          }),
        });

        const data = await res.json();
        setTranscript(data.text || "No transcript returned.");
      } catch {
        setUiError("Transcription failed.");
      } finally {
        setTranscribing(false);
      }
    };

    transcribe();
  }, [mediaUrl, aiSupported]);

  const toggleRubric = (key: string) => {
    setSelectedRubrics((prev) =>
      prev.includes(key)
        ? prev.filter((r) => r !== key)
        : [...prev, key]
    );
  };

  const handleEvaluation = async () => {
    if (!transcript || selectedRubrics.length === 0) return;

    try {
      setEvaluating(true);
      setEvaluationResult(null);

      const rubricsText = selectedRubrics
        .map((r) => `${r} (${LEVELS[level]} Level)`)
        .join("\n");

      const formData = new FormData();
      formData.append("question", referenceQuestion);
      formData.append("rubrics", rubricsText);
      formData.append("response", transcript);

      const response = await fetch(`${AI_API_BASE_URL}/evaluate`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setEvaluationResult(data);
    } catch {
      setUiError("Evaluation failed.");
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) return null;
  if (!aiSupported) return null;

  const roundedScore =
    evaluationResult?.overall_score !== undefined
      ? Math.round(evaluationResult.overall_score)
      : null;
  
  function toTitleCase(text: string) {
    return text
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }


  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-md sm:max-w-3xl lg:max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl p-6 sm:p-8">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold mb-1">AI Evaluation</h1>
        <p className="text-sm text-blue-500 mb-6">{learnerName}</p>

        {/* Assignment Question */}
        <Section title="Assignment Question">
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            {referenceQuestion}
          </div>
        </Section>

        {/* Learner Audio */}
        <Section title="Learner Submission">
          <audio controls className="w-full" src={mediaUrl} />
        </Section>

        {/* Transcript Section */}
        <Section title="Transcription">
          {transcribing && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-700 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
              Transcription in progress... Please wait.
            </div>
          )}

          {!transcribing && transcript && (
            <div className="bg-blue-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
              {transcript}
            </div>
          )}
        </Section>


        {/* Proficiency Level */}
        <Section title="Proficiency Level">
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((lvl, idx) => (
              <button
                key={lvl}
                onClick={() => {
                  setLevel(idx);
                  setSelectedRubrics([]);
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  level === idx
                    ? "bg-blue-600 text-white"
                    : "border border-blue-300 text-blue-600"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </Section>

        {/* Rubrics */}
        <Section title="Select Rubrics">
          <div className="flex flex-wrap gap-2">
            {RUBRICS.filter((r) => r.min <= level).map((r) => (
              <button
                key={r.key}
                onClick={() => toggleRubric(r.key)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedRubrics.includes(r.key)
                    ? "bg-blue-600 text-white"
                    : "border border-blue-300 text-blue-600"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </Section>

        <button
          onClick={handleEvaluation}
          disabled={!transcript || selectedRubrics.length === 0 || evaluating}
          className="w-full py-3 bg-blue-600 text-white rounded-lg disabled:bg-blue-300 mt-4"
        >
          {evaluating ? "Evaluating..." : "Run AI Evaluation"}
        </button>

        {/* Detailed Results */}
        {evaluationResult && (
          <div className="mt-8 border-t pt-6 space-y-6">

            <Section title="Evaluated Score">
              <div className="text-3xl font-bold text-blue-600">
                {roundedScore}/100
              </div>
            </Section>

            {evaluationResult.summary && (
              <Section title="AI Summary (Short Remarks)">
                <div className="bg-blue-50 p-4 rounded-lg text-sm">
                  {evaluationResult.summary}
                </div>
              </Section>
            )}

            {/* Detailed rubric breakdown */}
            {evaluationResult.rubrics && (
              <Section title="Detailed Rubric Analysis">
                <div className="space-y-4">
                  {evaluationResult.rubrics.map((r: any, i: number) => (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between font-medium">
                        <span>{toTitleCase(r.criterion)}</span>
                        <span>{Math.round(r.score)}/100</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        {r.feedback}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <button
              onClick={() =>
                onApply({
                  score: roundedScore,
                  remarks: evaluationResult.summary || "",
                })
              }
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              Apply This Evaluation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="mb-6 space-y-2">
      <div className="text-xs font-semibold text-gray-500 uppercase">
        {title}
      </div>
      {children}
    </div>
  );
}
