// @ts-nocheck
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeftIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

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
  const { state } = useLocation();

  const {
    referenceUrl,
    mediaUrl,
    topic,
    studentName,
  } = state || {};

  const [level, setLevel] = useState(3);
  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);

  if (!referenceUrl || !mediaUrl) {
    return <div className="p-6 text-red-600">Unable to load assignment</div>;
  }

  const isPdf = referenceUrl.endsWith(".pdf");
  const isImage = referenceUrl.match(/\.(png|jpg|jpeg|webp)$/i);
  const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i);
  const isAudio = !isVideo;

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
              {studentName} • {topic}
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="h-9 w-9 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100 focus:outline-none focus:ring"
          >
            <ArrowLeftIcon className="h-4 w-4 text-slate-600" />
          </button>
        </header>

        {/* Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left */}
          <section className="lg:col-span-2 space-y-6">

            {/* Reference */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-600">
                <DocumentTextIcon className="h-4 w-4" />
                Reference Question
              </div>

              {isPdf && (
                <iframe
                  src={`${referenceUrl}#view=fitH`}
                  className="w-full h-[420px] rounded-lg border"
                />
              )}

              {isImage && (
                <img
                  src={referenceUrl}
                  className="max-h-[420px] mx-auto rounded-lg"
                />
              )}
            </div>

            {/* Submitted Answer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  {isVideo ? (
                    <VideoCameraIcon className="h-4 w-4" />
                  ) : (
                    <MicrophoneIcon className="h-4 w-4" />
                  )}
                  Submitted Answer
                </div>

                {(isAudio || isVideo) && (
                  <button
                    onClick={handleTranscribe}
                    disabled={transcribing}
                    className="text-xs px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-100 disabled:opacity-50"
                  >
                    {transcribing ? "Transcribing…" : "Transcribe"}
                  </button>
                )}
              </div>

              {isVideo ? (
                <video controls className="w-full rounded-lg">
                  <source src={mediaUrl} />
                </video>
              ) : (
                <audio controls className="w-full">
                  <source src={mediaUrl} />
                </audio>
              )}

              {transcript && (
                <div className="mt-3 p-3 rounded-md bg-slate-100 text-sm text-slate-700">
                  {transcript}
                </div>
              )}
            </div>
          </section>

          {/* Right */}
          <aside className="space-y-6">

            {/* Level */}
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

            {/* Rubrics */}
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

            {/* CTA */}
            <button
              disabled
              className="w-full py-2 rounded-lg bg-blue-600/40 text-white cursor-not-allowed"
            >
              Run AI Evaluation
            </button>
          </aside>
        </main>
      </div>
    </div>
  );
}