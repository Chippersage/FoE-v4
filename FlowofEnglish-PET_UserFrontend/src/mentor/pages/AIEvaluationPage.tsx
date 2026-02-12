// @ts-nocheck
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  MicrophoneIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

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

  useEffect(() => {
    if (!assignmentId) return;

    const fetchAssignmentDetails = async () => {
      try {
        setLoading(true);

        const url = `${API_BASE_URL}/assignments/${encodeURIComponent(
          assignmentId
        )}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch assignment");
        }

        const data = await response.json();

        const question = data?.subconcept?.subconceptDesc2;
        const submittedFile = data?.submittedFile;
        const fileUrl = submittedFile?.downloadUrl;
        const fileType = submittedFile?.fileType || "";

        const isAudioFile =
          fileType.startsWith("audio") ||
          fileUrl?.match(/\.(mp3|wav|m4a|aac|ogg)$/i);

        // Rule 1: Must have subconceptDesc2
        if (!question) {
          setAiSupported(false);
        }

        // Rule 2: Must have audio submission
        if (!isAudioFile) {
          setAiSupported(false);
        }

        setReferenceQuestion(question || "");
        setMediaUrl(fileUrl || "");
        setStudentName(data?.user?.userName || "");

      } catch (error) {
        console.error(error);
        setAiSupported(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentDetails();
  }, [assignmentId]);

  const toggleRubric = (key: string) => {
    setSelectedRubrics((prev) =>
      prev.includes(key)
        ? prev.filter((r) => r !== key)
        : [...prev, key]
    );
  };

  const handleTranscribe = () => {
    setTranscribing(true);
    setTimeout(() => {
      setTranscript("Transcript will appear here once backend is connected.");
      setTranscribing(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading evaluation...
      </div>
    );
  }

  if (!aiSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white max-w-md w-full rounded-xl shadow-sm border p-6 text-center">
          <div className="mb-4">
            <MicrophoneIcon className="h-8 w-8 mx-auto text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            AI Evaluation Not Available
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            This assignment doesn’t support AI evaluation.
            <br />
            Currently, only audio-based assignments with AI-enabled questions are supported.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-5">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              AI Evaluation
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {studentName} • Assignment ID: {assignmentId}
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100"
          >
            <ArrowLeftIcon className="h-4 w-4 text-slate-600" />
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <section className="lg:col-span-2 space-y-6">

            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-600">
                <DocumentTextIcon className="h-4 w-4" />
                AI Evaluation Question
              </div>

              <div className="bg-white border rounded-lg p-4 text-slate-700 leading-relaxed shadow-sm">
                {referenceQuestion}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-600">
                <MicrophoneIcon className="h-4 w-4" />
                Submitted Audio
              </div>

              <audio controls className="w-full">
                <source src={mediaUrl} />
              </audio>

              <button
                onClick={handleTranscribe}
                disabled={transcribing}
                className="mt-3 text-xs px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-100 disabled:opacity-50"
              >
                {transcribing ? "Transcribing…" : "Transcribe"}
              </button>

              {transcript && (
                <div className="mt-3 p-3 rounded-md bg-slate-100 text-sm text-slate-700">
                  {transcript}
                </div>
              )}
            </div>
          </section>

          {/* RIGHT */}
          <aside className="space-y-6">

            <div>
              <div className="text-xs text-slate-500 mb-2">
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
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      level === idx
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-2">
                Rubrics
              </div>
              <div className="flex flex-wrap gap-2">
                {RUBRICS.filter((r) => r.min <= level).map((r) => (
                  <button
                    key={r.key}
                    onClick={() => toggleRubric(r.key)}
                    className={`px-3 py-1.5 rounded-md border text-sm ${
                      selectedRubrics.includes(r.key)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700">
              Run AI Evaluation
            </button>
          </aside>
        </main>
      </div>
    </div>
  );
}
