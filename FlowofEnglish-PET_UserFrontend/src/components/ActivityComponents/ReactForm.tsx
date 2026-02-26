// @ts-nocheck
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Play } from "lucide-react";
import { useParams } from "react-router-dom";
import { useUserAttempt } from "../../hooks/useUserAttempt";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  type: string;
  marks: number;
  text?: string;
  mediaUrl?: string;
  options?: Option[];
}

interface Activity {
  instructions: string;
  maxPlaysPerAudio: number;
  mediaUrl?: string;
  mediaType?: string;
  questions: Question[];
  scriptUrl?: string;
}

const ReactForm = forwardRef(
  ({ xmlUrl, userId, cohortId, subconceptId }, ref) => {
    const { programId, stageId, unitId } = useParams();
    const { recordAttempt } = useUserAttempt();

    const [activity, setActivity] = useState<Activity | null>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [progress, setProgress] = useState<Record<string, number>>({});
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    // ================= LOAD XML =================
    useEffect(() => {
      const load = async () => {
        const res = await fetch(xmlUrl);
        const text = await res.text();
        const xml = new DOMParser().parseFromString(text, "text/xml");

        const questions: Question[] = Array.from(
          xml.querySelectorAll("questions > question")
        ).map(q => ({
          id: q.getAttribute("id") || "",
          type: q.getAttribute("type") || "",
          marks: parseInt(q.getAttribute("marks") || "1"),
          text: q.querySelector("text")?.textContent?.trim(),
          mediaUrl: q.querySelector("media")?.textContent?.trim(),
          options: Array.from(q.querySelectorAll("option")).map(opt => ({
            id: opt.getAttribute("id") || "",
            text: opt.textContent?.trim() || "",
          })),
        }));

        const activityMediaNode = xml.querySelector("activity > media");

        const activityMediaUrl =
          activityMediaNode?.textContent?.trim() || undefined;

        const activityMediaType =
          activityMediaNode?.getAttribute("type") || undefined;
        const scriptUrl =
        xml.querySelector("appScriptUrl")?.textContent?.trim() || "";

        setActivity({
          instructions:
            xml.querySelector("instructions")?.textContent?.trim() || "",
          maxPlaysPerAudio: parseInt(
            xml.querySelector("maxPlaysPerAudio")?.textContent || "3"
          ),
          mediaUrl: activityMediaUrl,
          mediaType: activityMediaType,
          questions,
          scriptUrl,
        });
        };
      load();
    }, [xmlUrl]);

    // ================= STOP ALL AUDIO =================
    const stopAll = (exceptId?: string) => {
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        if (id !== exceptId) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };

    // ================= AUDIO HANDLER =================
    const handleAudio = (q: Question) => {
      if (!activity || submitted) return;

      const key = `${userId}_${subconceptId}_${q.id}`;
      const max = activity.maxPlaysPerAudio;
      const used = parseInt(localStorage.getItem(key) || "0");

      if (used >= max) return;

      let audio = audioRefs.current[q.id];

      if (!audio) {
        audio = new Audio(q.mediaUrl);
        audioRefs.current[q.id] = audio;

        audio.onseeking = () => (audio.currentTime = 0);

        audio.ontimeupdate = () => {
          const percent =
            (audio.currentTime / audio.duration) * 100;
          setProgress(p => ({ ...p, [q.id]: percent }));
        };

        audio.onended = () => {
          const updated =
            parseInt(localStorage.getItem(key) || "0") + 1;

          localStorage.setItem(key, updated.toString());

          audio.pause();
          audio.currentTime = 0;
          audio.load();

          setPlayingId(null);
          setProgress(p => ({ ...p, [q.id]: 0 }));
        };
      }

      if (!audio.paused) {
        audio.pause();
        setPlayingId(null);
        return;
      }

      stopAll(q.id);
      audio.play();
      setPlayingId(q.id);
    };

    // ================= SUBMIT =================
    useImperativeHandle(ref, () => ({
      async submitForm() {
        if (!activity || submitted || submitting) return;

        const valid = activity.questions.every(q => {
          const val = answers[q.id];
          return val && val.toString().trim() !== "";
        });

        if (!valid) {
          alert("Please answer all questions.");
          return;
        }

        setSubmitting(true);

        const formData = new FormData();
        formData.append("learnerId", userId);
        formData.append("cohortId", cohortId);
        formData.append("subconceptId", subconceptId);
        // Dynamically convert to answer1, answer2, answer3...
        activity.questions.forEach((q, index) => {
          const value = answers[q.id] || "";
          formData.append(`answer${index + 1}`, value);
        });

        try {
          if (!activity.scriptUrl) {
            alert("App Script URL missing in XML.");
            return;
          }

          const res = await fetch(activity.scriptUrl, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error("Network response was not ok");
          }

          const result = await res.json();
          const score = result.score || 0;

          await recordAttempt({
            userId,
            programId,
            stageId,
            unitId,
            subconceptId,
            subconceptType: "html-form",
            subconceptMaxscore: activity.questions.length,
            score,
          });

          setSubmitted(true);

          window.dispatchEvent(
            new CustomEvent("updateSidebarCompletion", {
              detail: { subconceptId },
            })
          );
        } catch (err) {
          alert("Submission failed.");
        }

        setSubmitting(false);
      },
    }));

    if (!activity) return null;

    const renderQuestion = (q: Question, index: number) => {
      const key = `${userId}_${subconceptId}_${q.id}`;
      const used = parseInt(localStorage.getItem(key) || "0");
      const remaining = activity.maxPlaysPerAudio - used;

      switch (q.type) {
        case "audio-typing":
          return (
            <div key={q.id} className="space-y-4">

              <h2 className="font-medium">
                Question {index + 1}
              </h2>

              <div className="flex items-center gap-4">
                <button
                  disabled={remaining <= 0 || submitted}
                  onClick={() => handleAudio(q)}
                  className="w-10 h-10 border rounded-full flex items-center justify-center"
                >
                  {playingId === q.id ? "❚❚" : <Play size={16} />}
                </button>

                <div className="flex-1">
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div
                      className="h-1 bg-black"
                      style={{
                        width: `${progress[q.id] || 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1">
                    {remaining} plays remaining
                  </p>
                </div>
              </div>

              <textarea
                disabled={submitted}
                className="w-full border rounded-md p-3"
                rows={4}
                value={answers[q.id] || ""}
                onChange={e =>
                  setAnswers(prev => ({
                    ...prev,
                    [q.id]: e.target.value,
                  }))
                }
              />
            </div>
          );

        case "mcq-single":
          return (
            <div key={q.id} className="space-y-3">
              <h2 className="font-medium">
                Question {index + 1}
              </h2>
              <p>{q.text}</p>
              {q.options?.map(opt => (
                <label key={opt.id} className="flex gap-3">
                  <input
                    type="radio"
                    name={q.id}
                    disabled={submitted}
                    checked={answers[q.id] === opt.id}
                    onChange={() =>
                      setAnswers(prev => ({
                        ...prev,
                        [q.id]: opt.id,
                      }))
                    }
                  />
                  {opt.text}
                </label>
              ))}
            </div>
          );

        case "mcq-multiple":
          return (
            <div key={q.id} className="space-y-3">
              <h2 className="font-medium">
                Question {index + 1}
              </h2>
              <p>{q.text}</p>
              {q.options?.map(opt => (
                <label key={opt.id} className="flex gap-3">
                  <input
                    type="checkbox"
                    disabled={submitted}
                    checked={answers[q.id]?.includes(opt.id)}
                    onChange={() => {
                      const current = answers[q.id] || [];
                      if (current.includes(opt.id)) {
                        setAnswers(prev => ({
                          ...prev,
                          [q.id]: current.filter(
                            o => o !== opt.id
                          ),
                        }));
                      } else {
                        setAnswers(prev => ({
                          ...prev,
                          [q.id]: [...current, opt.id],
                        }));
                      }
                    }}
                  />
                  {opt.text}
                </label>
              ))}
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">

        <p className="text-sm text-gray-600">
          {activity.instructions}
        </p>

        {/* Activity Level Image */}
        {activity.mediaType === "image" && activity.mediaUrl && (
          <div className="flex justify-center">
            <img
              src={activity.mediaUrl}
              alt="Activity visual"
              className="max-w-full rounded-md"
            />
          </div>
        )}

        {activity.questions.map((q, i) =>
          renderQuestion(q, i)
        )}
      </div>
    );
  }
);

export default ReactForm;