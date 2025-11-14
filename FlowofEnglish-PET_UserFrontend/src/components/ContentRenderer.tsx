// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import {
  Video as VideoIcon,
  RotateCcw,
  XCircle,
  ChevronRight,
} from "lucide-react";
import QuizActivity from "./ActivityComponents/QuizActitivy";
import PDFRenderer from "./PDFRenderer";
import { useCourseContext } from "../context/CourseContext";
import { useUserAttempt } from "../hooks/useUserAttempt";

interface ContentRendererProps {
  type: string;
  url: string;
  title?: string;
  className?: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  type,
  url,
  title,
  className = "",
}) => {
  const {
    currentContent,
    stages,
    setCurrentContent,
    canGoNext,
    setCanGoNext,
    remainingTime,
    setRemainingTime,
  } = useCourseContext();

  const { recordAttempt } = useUserAttempt();

  const [isLoading, setIsLoading] = useState(true);
  const [attemptRecorded, setAttemptRecorded] = useState(false);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // ----------------------------------------------------------
  //  Detect fullscreen mode
  // ----------------------------------------------------------
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fsElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(!!fsElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  // ----------------------------------------------------------
  //  Reset state when content changes
  // ----------------------------------------------------------
  const prevUrlRef = useRef(url);

  useEffect(() => {
    if (url !== prevUrlRef.current) {
      setIsLoading(true);
      setAttemptRecorded(false);
      setShowNextOverlay(false);
      setCountdown(5);
      prevUrlRef.current = url;
    }
  }, [url]);

  // ----------------------------------------------------------
  //  Video progress (95% = attempt)
  // ----------------------------------------------------------
  const handleVideoProgress = async (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const progress = (video.currentTime / video.duration) * 100;

    if (progress >= 95 && !attemptRecorded) {
      setAttemptRecorded(true);
      try {
        await recordAttempt();
        window.dispatchEvent(
          new CustomEvent("updateSidebarCompletion", {
            detail: { subconceptId: currentContent.subconceptId },
          })
        );
      } catch (err) {
        console.error("Error recording user attempt:", err);
      }
    }
  };

  // ----------------------------------------------------------
  //  Show overlay when video ends
  // ----------------------------------------------------------
  const handleVideoEnded = () => {
    if (!showNextOverlay) {
      setShowNextOverlay(true);
      setCountdown(5);
    }
  };

  // ----------------------------------------------------------
  //  Countdown → auto NEXT click
  // ----------------------------------------------------------
  useEffect(() => {
    if (!showNextOverlay) return;

    if (countdown === 0) {
      const nextBtn = document.querySelector("#next-subconcept-btn");
      nextBtn?.click();
      setShowNextOverlay(false);
      setCountdown(5);
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showNextOverlay, countdown]);

  // ----------------------------------------------------------
  //  Overlay shown after video completes
  // ----------------------------------------------------------
  const NextOverlay = () =>
    showNextOverlay && (
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center text-white z-20 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn ${
          isFullscreen ? "text-[1rem]" : ""
        }`}
      >
        <div className="bg-gradient-to-br from-[#0EA5E9]/95 to-[#5bc3cd]/95 p-6 rounded-2xl shadow-2xl text-center w-80 md:w-[28rem]">
          <div className="flex flex-col items-center gap-3">
            <VideoIcon size={isFullscreen ? 60 : 48} className="text-white" />
            <h2 className="text-lg md:text-2xl font-bold">
              Next Topic starting in <span className="text-yellow-200 ml-2">{countdown}</span> sec
            </h2>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                const video = videoRef.current;
                if (video) {
                  video.currentTime = 0;
                  video.play();
                }
                setShowNextOverlay(false);
                setCountdown(5);
              }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
            >
              <RotateCcw size={16} /> Replay
            </button>

            <button
              onClick={() => {
                const btn = document.querySelector("#next-subconcept-btn");
                btn?.click();
              }}
              className="flex items-center gap-2 bg-white text-[#0EA5E9] hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-semibold transition-all"
            >
              Go To Next <ChevronRight size={16} />
            </button>

            <button
              onClick={() => {
                setShowNextOverlay(false);
                setCountdown(5);
              }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
            >
              <XCircle size={16} /> Cancel
            </button>
          </div>
        </div>
      </div>
    );

  // ----------------------------------------------------------
  //  Loading spinner
  // ----------------------------------------------------------
  const renderLoading = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
      <div className="animate-spin h-6 w-6 border-b-2 border-blue-500 rounded-full" />
    </div>
  );

  // =====================================================================
  // --- Logic for user-attempt on NextsubconceptButton Click for specific types ---
  // =====================================================================

  // Types that should record attempt *only when Next is clicked*
  const recordOnNextTypes = ["image", "youtube", "pdf"];

  // Checks if currentContent.type requires attempt on Next click
  const shouldRecordOnNext = () => {
    const t = currentContent.type?.toLowerCase();
    return recordOnNextTypes.includes(t);
  };

  // Handles recording attempt for non-video types
  const handleNextAttempt = async () => {
    if (!shouldRecordOnNext()) return;

    try {
      await recordAttempt();
      window.dispatchEvent(
        new CustomEvent("updateSidebarCompletion", {
          detail: { subconceptId: currentContent.subconceptId },
        })
      );
    } catch (err) {
      console.error("Error recording user attempt:", err);
    }
  };

  // Listen for the Go To Next button click
  useEffect(() => {
    const nextBtn = document.getElementById("next-subconcept-btn");
    if (!nextBtn) return;

    const handler = () => handleNextAttempt();

    nextBtn.addEventListener("click", handler);
    return () => nextBtn.removeEventListener("click", handler);
  }, [currentContent]);
  // =====================================================================

  // ----------------------------------------------------------
  //  Type-based content rendering
  // ----------------------------------------------------------
  if (!url) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}>
        <p>No content available</p>
      </div>
    );
  }

  switch (type) {
    case "video":
      return (
        <div className={`relative w-full h-full ${className}`}>
          {isLoading && renderLoading()}
          <video
            ref={videoRef}
            controls
            controlsList="nodownload noremoteplayback"
            autoPlay
            className="w-full h-full bg-black rounded-xl"
            src={url}
            onContextMenu={(e) => e.preventDefault()}
            onLoadedData={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            onTimeUpdate={handleVideoProgress}
            onEnded={handleVideoEnded}
          />
          <NextOverlay />
        </div>
      );

    case "pdf":
    case "assignment_pdf":
      return (
        <div className={`relative w-full h-full bg-white ${className}`}>
          {isLoading && renderLoading()}
          <PDFRenderer 
           pdfUrl={url} 
          title={title}
          onLoadSuccess={() => setIsLoading(false)}
          onLoadError={() => setIsLoading(false)} 
          />
        </div>
      );

    case "image":
    case "assignment_image":
      return (
        <div className={`relative w-full h-full flex items-center justify-center bg-white ${className}`}>
          {isLoading && renderLoading()}
          <img
            src={url}
            alt={title || "Image content"}
            className="max-w-full max-h-full object-contain rounded-xl"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>
      );

    case "medium":
    case "toastmasters":
    case "assessment":
      return (
        <div className={`relative w-full h-full ${className}`}>
          {isLoading && renderLoading()}
          <iframe
            src={url}
            className="w-full h-full rounded-xl bg-white"
            title={title || "External Content"}
            frameBorder="0"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            loading="lazy"
          />
        </div>
      );

    case "mcq":
      return (
        <div className={`relative w-full h-full ${className}`}>
          <QuizActivity
            triggerSubmit={() => console.log("Quiz submitted")}
            xmlUrl={url}
            key={url}
            subconceptMaxscore={10}
            setSubmissionPayload={(payload) => console.log("Submission payload:", payload)}
          />
        </div>
      );

    default:
      return (
        <div className={`relative w-full h-full ${className}`}>
          {isLoading && renderLoading()}
          <iframe
            src={url}
            className="w-full h-full rounded-xl bg-white"
            title={title || "External Content"}
            frameBorder="0"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            loading="lazy"
          />
        </div>
      );
  }
};

export default ContentRenderer;
