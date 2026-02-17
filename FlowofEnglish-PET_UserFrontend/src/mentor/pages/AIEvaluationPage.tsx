// @ts-nocheck
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

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

export default function AIEvaluationPage() {
  const navigate = useNavigate();
  const { assignmentId } = useParams();

  const [referenceQuestion, setReferenceQuestion] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiSupported, setAiSupported] = useState(true);

  const [level, setLevel] = useState(3);
  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [uiError, setUiError] = useState<string | null>(null);

  // Fetch Assignment
  useEffect(() => {
    if (!assignmentId) return;

    const fetchAssignmentDetails = async () => {
      try {
        setLoading(true);
        setUiError(null);

        const response = await fetch(
          `${API_BASE_URL}/assignments/${assignmentId}`
        );

        if (!response.ok) throw new Error();

        const data = await response.json();

        const question = data?.subconceptDesc2;
        const fileUrl = data?.downloadUrl;
        const fileName = data?.fileName || "";

        const isAudioFile = fileName.match(/\.(mp3|wav|m4a|aac|ogg)$/i);

        if (!question || !fileUrl || !isAudioFile) {
          setAiSupported(false);
          return;
        }

        setReferenceQuestion(question);
        setMediaUrl(fileUrl);
        setStudentName(data?.userName || "");
      } catch {
        setAiSupported(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentDetails();
  }, [assignmentId]);

  // Auto Transcription
  useEffect(() => {
    if (!mediaUrl || !aiSupported) return;

    const autoTranscribe = async () => {
      try {
        setUiError(null);
        setTranscript(null);
        setTranscribing(true);

        const response = await fetch(`${AI_API_BASE_URL}/transcribe-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mediaUrl,
            mediaType: "audio",
          }),
        });

        if (!response.ok) throw new Error();

        const data = await response.json();
        setTranscript(data.text || "No transcript returned.");
      } catch {
        setUiError("Transcription failed. Please try again.");
      } finally {
        setTranscribing(false);
      }
    };

    autoTranscribe();
  }, [mediaUrl, aiSupported]);

  const toggleRubric = (key: string) => {
    setSelectedRubrics((prev) =>
      prev.includes(key)
        ? prev.filter((r) => r !== key)
        : [...prev, key]
    );
  };

  const handleEvaluation = async () => {
    try {
      setUiError(null);
      setEvaluationResult(null);

      if (!transcript || selectedRubrics.length === 0) return;

      setEvaluating(true);

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

      if (!response.ok) throw new Error();

      const data = await response.json();
      setEvaluationResult(data);
    } catch {
      setUiError("Evaluation failed. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading evaluation...
      </div>
    );

  if (!aiSupported)
    return (
      <div className="min-h-screen flex items-center justify-center">
        AI Evaluation Not Available
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br  px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-blue-100 transition"
          >
            <ArrowLeftIcon className="h-5 w-5 text-blue-600" />
          </button>

          <div className="text-center flex-1">
            <h1 className="text-2xl font-semibold text-black">
              AI Evaluation
            </h1>
            <p className="text-sm text-blue-500 mt-1">
              {studentName}
            </p>
          </div>

          <div className="w-8" />
        </div>

        {uiError && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
            {uiError}
          </div>
        )}

        {/* QUESTION + AUDIO */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 space-y-6">

          <div>
            <div className="text-xs uppercase tracking-wide text-blue-400 mb-2">
              Assignment Question
            </div>
            <p className="text-gray-800 leading-relaxed text-[15px]">
              {referenceQuestion}
            </p>
          </div>

          <div className="border-t border-blue-100 pt-5 space-y-4">
            <audio controls className="w-full rounded-md" src={mediaUrl} />

            {transcribing && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-600 animate-pulse">
                AI is transcribing the audio...
              </div>
            )}

            {transcript && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
                {transcript}
              </div>
            )}
          </div>
        </div>

        {/* LEVEL */}
        <div>
          <div className="text-xs uppercase tracking-wide text-blue-400 mb-3">
            Evaluation Level
          </div>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((lvl, idx) => (
              <button
                key={lvl}
                onClick={() => {
                  setLevel(idx);
                  setSelectedRubrics([]);
                }}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  level === idx
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-blue-200 text-blue-600"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* RUBRICS */}
        <div>
          <div className="text-xs uppercase tracking-wide text-blue-400 mb-3">
            Select Criteria
          </div>
          <div className="flex flex-wrap gap-2">
            {RUBRICS.filter((r) => r.min <= level).map((r) => (
              <button
                key={r.key}
                onClick={() => toggleRubric(r.key)}
                className={`px-4 py-2 rounded-xl text-sm border transition ${
                  selectedRubrics.includes(r.key)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-blue-600 border-blue-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* RUN BUTTON */}
        <button
          onClick={handleEvaluation}
          disabled={
            evaluating || !transcript || selectedRubrics.length === 0
          }
          className={`w-full py-3 rounded-2xl text-white font-medium transition ${
            evaluating || !transcript || selectedRubrics.length === 0
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {evaluating ? "Evaluating..." : "Run AI Evaluation"}
        </button>

        {/* RESULTS */}
        {evaluationResult && (
          <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm space-y-6">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-blue-800">
                AI Analysis
              </h2>
              <div className="text-3xl font-bold text-blue-600">
                {evaluationResult.overall_score}/100
              </div>
            </div>

            {evaluationResult.summary && (
              <div className="bg-blue-50 p-4 rounded-xl text-sm text-gray-700">
                {evaluationResult.summary}
              </div>
            )}

            <div className="space-y-4">
              {evaluationResult.rubrics?.map((r: any, i: number) => (
                <div
                  key={i}
                  className="border border-blue-100 rounded-xl p-4 bg-blue-50"
                >
                  <div className="flex justify-between font-medium text-blue-800">
                    <span>{r.criterion}</span>
                    <span>{r.score}/100</span>
                  </div>
                  <div className="text-sm text-gray-700 mt-2">
                    {r.feedback}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
