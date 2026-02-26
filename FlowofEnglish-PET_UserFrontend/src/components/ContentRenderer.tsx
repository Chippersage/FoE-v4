// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Video as VideoIcon,
  RotateCcw,
  XCircle,
  ChevronRight,
} from "lucide-react";
import QuizActivity from "./ActivityComponents/QuizActivity";
import VocabularyActivity from "./ActivityComponents/VocabularyActivity";
import PDFRenderer from "./PDFRenderer";
import { useUserAttempt } from "../hooks/useUserAttempt";
import useCourseStore from "../store/courseStore";
import { useUserContext } from "../context/AuthContext";
import ReactForm from "./ActivityComponents/ReactForm";

interface ContentRendererProps {
  className?: string;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
  reactFormRef?: React.RefObject<any>;
  style?: React.CSSProperties;
}

// Helper: Format Google Form URL with user data - DYNAMIC VERSION
function formatGoogleFormUrl(originalUrl: string, userId: string, cohortId: string): string {
  try {
    // Check if URL is a Google Form
    if (!originalUrl.includes("docs.google.com/forms") || !originalUrl.includes("/viewform")) {
      return originalUrl;
    }

    // Use URL API for proper parsing
    const urlObj = new URL(originalUrl);
    const params = urlObj.searchParams;
    
    // Get all entry parameter keys from the original URL
    const entryKeys = Array.from(params.keys()).filter(key => key.startsWith('entry.'));
    
    if (entryKeys.length >= 2) {
      // Fill the first TWO empty entry fields with userId and cohortId
      let userIdAssigned = false;
      let cohortAssigned = false;
      
      for (let i = 0; i < entryKeys.length; i++) {
        const key = entryKeys[i];
        const currentValue = params.get(key);
        
        // Check if field is empty
        if ((currentValue === '' || !currentValue) && !userIdAssigned) {
          // First empty field gets userId
          params.set(key, userId);
          userIdAssigned = true;
        } else if ((currentValue === '' || !currentValue) && userIdAssigned && !cohortAssigned) {
          // Second empty field gets cohortId
          params.set(key, cohortId);
          cohortAssigned = true;
        }
        
        // Stop if both are assigned
        if (userIdAssigned && cohortAssigned) {
          break;
        }
      }
      
      // If not all assigned, check if we need to add new parameters
      if (!userIdAssigned || !cohortAssigned) {
        // Add missing values as new parameters
        if (!userIdAssigned) {
          // Try to find the first available entry field pattern
          let newFieldName = `entry.userId`;
          
          // Try common patterns
          const commonPatterns = [
            'entry.userId',
            'entry.user_id',
            'entry.user',
            'entry.learnerId',
            'entry.learner_id',
            'entry.learner'
          ];
          
          for (const pattern of commonPatterns) {
            if (!params.has(pattern)) {
              newFieldName = pattern;
              break;
            }
          }
          
          params.set(newFieldName, userId);
        }
        
        if (!cohortAssigned) {
          let newFieldName = `entry.cohort`;
          
          // Try common patterns for cohort ID
          const commonPatterns = [
            'entry.cohortId',
            'entry.cohort_id',
            'entry.cohort',
            'entry.cohortID',
            'entry.classId',
            'entry.groupId'
          ];
          
          for (const pattern of commonPatterns) {
            if (!params.has(pattern)) {
              newFieldName = pattern;
              break;
            }
          }
          
          params.set(newFieldName, cohortId);
        }
      }
    } else if (entryKeys.length === 1) {
      // If only one entry field, fill it with userId
      const key = entryKeys[0];
      const currentValue = params.get(key);
      
      if (currentValue === '' || !currentValue) {
        params.set(key, userId);
        params.set('cohortId', cohortId);
      } else {
        params.set('userId', userId);
        params.set('cohortId', cohortId);
      }
    } else {
      // No entry fields found, add our parameters
      params.set('userId', userId);
      params.set('cohortId', cohortId);
    }
    
    // Update the URL
    urlObj.search = params.toString();
    const formattedUrl = urlObj.toString();
    
    return formattedUrl;
  } catch (error) {
    return originalUrl;
  }
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  className = "",
  iframeRef,
  reactFormRef,
  style,
}) => {
  // 1. Get current content from URL
  const { programId, stageId, unitId, conceptId } = useParams<{
    programId: string;
    stageId: string;
    unitId: string;
    conceptId: string;
  }>();
  
  // 2. Get user info
  const { user } = useUserContext();
  
  // 3. Get course data from store
  const { getSubconceptById } = useCourseStore();
  
  // 4. Get attempt hook
  const { recordAttempt } = useUserAttempt();
  
  // State for current subconcept data
  const [currentSubconcept, setCurrentSubconcept] = useState<{
    subconceptId: string;
    subconceptLink: string;
    subconceptType: string;
    subconceptMaxscore: number;
    stageId: string;
    unitId: string;
    isLockedForDemo?: boolean;
    completionStatus: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [attemptRecorded, setAttemptRecorded] = useState(false);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [vocabularyScore, setVocabularyScore] = useState(0);
  const [formattedUrl, setFormattedUrl] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);

  // ----------------------------------------------------------
  //  Load subconcept data when URL changes
  // ----------------------------------------------------------
  useEffect(() => {
    const loadSubconcept = () => {
      if (!conceptId || !programId || !stageId || !unitId) {
        setIsLoading(false);
        return;
      }

      const subconcept = getSubconceptById(conceptId);
      
      if (!subconcept) {
        setIsLoading(false);
        return;
      }

      setCurrentSubconcept({
        subconceptId: subconcept.subconceptId,
        subconceptLink: subconcept.subconceptLink,
        subconceptType: subconcept.subconceptType,
        subconceptMaxscore: Number(subconcept.subconceptMaxscore || 0),
        stageId: subconcept.stageId,
        unitId: subconcept.unitId,
        isLockedForDemo: subconcept.isLockedForDemo,
        completionStatus: subconcept.completionStatus
      });
      
      setIsLoading(false);
    };

    loadSubconcept();
  }, [conceptId, programId, stageId, unitId, getSubconceptById]);

  // ----------------------------------------------------------
  //  Format Google Form URL for assessment types
  // ----------------------------------------------------------
  useEffect(() => {
    const formatAssessmentUrl = () => {
      if (!currentSubconcept) return;
      
      const normalizedType = currentSubconcept.subconceptType.toLowerCase();
      
      // Check if it's a Google Form/Assessment type
      if (normalizedType === "assessment" || normalizedType === "googleform") {
        try {
          // Get user data
          const userId = user?.userId || "";
          
          // Get cohort ID from localStorage
          const selectedCohortRaw = localStorage.getItem("selectedCohort");
          const selectedCohort = selectedCohortRaw ? JSON.parse(selectedCohortRaw) : null;
          const cohortId = selectedCohort?.cohortId || "";
          
          // Format the URL using the dynamic helper function
          const formatted = formatGoogleFormUrl(currentSubconcept.subconceptLink, userId, cohortId);
          setFormattedUrl(formatted);
        } catch (error) {
          setFormattedUrl(currentSubconcept.subconceptLink);
        }
      } else {
        // If not a Google Form, use original URL
        setFormattedUrl(currentSubconcept.subconceptLink);
      }
    };

    if (currentSubconcept) {
      formatAssessmentUrl();
    }
  }, [currentSubconcept, user?.userId]);

  // ----------------------------------------------------------
  //  Reset attempt state when content changes
  // ----------------------------------------------------------
  useEffect(() => {
    setAttemptRecorded(false);
    setShowNextOverlay(false);
    setCountdown(5);
    setQuizScore(0);
    setVocabularyScore(0);
  }, [conceptId]);

  // ----------------------------------------------------------
  //  Video progress (90% = attempt) - UPDATED WITH EVENT DISPATCH
  // ----------------------------------------------------------
  const handleVideoProgress = async (
    e: React.SyntheticEvent<HTMLVideoElement>
  ) => {
    if (!currentSubconcept || !user) return;
    
    // Skip if demo user or locked content
    if (currentSubconcept.isLockedForDemo) return;
    
    const video = e.currentTarget;
    const progress = (video.currentTime / video.duration) * 100;
    
    // Dispatch progress event to parent (CoursePage)
    window.dispatchEvent(new CustomEvent('videoProgress', {
      detail: { 
        progress,
        conceptId: currentSubconcept.subconceptId
      }
    }));

    if (progress >= 90 && !attemptRecorded) {
      // Dispatch video completed event
      window.dispatchEvent(new CustomEvent('videoCompleted', {
        detail: { conceptId: currentSubconcept.subconceptId }
      }));
      
      window.dispatchEvent(new Event("video90"));
      setAttemptRecorded(true);
      
      try {
        await recordAttempt({
          userId: user.userId,
          programId: programId!,
          stageId: currentSubconcept.stageId,
          unitId: currentSubconcept.unitId,
          subconceptId: currentSubconcept.subconceptId,
          subconceptType: currentSubconcept.subconceptType,
          subconceptMaxscore: currentSubconcept.subconceptMaxscore
        });
        
        // Update completion status
        window.dispatchEvent(
          new CustomEvent("updateSidebarCompletion", {
            detail: { subconceptId: currentSubconcept.subconceptId }
          })
        );
      } catch (err) {
        setAttemptRecorded(false);
      }
    }
  };

  // ----------------------------------------------------------
  //  Show overlay when video ends - UPDATED WITH EVENT DISPATCH
  // ----------------------------------------------------------
  const handleVideoEnded = () => {
    if (!currentSubconcept) return;
    
    // Dispatch video ended event to parent
    window.dispatchEvent(new CustomEvent('videoCompleted', {
      detail: { conceptId: currentSubconcept.subconceptId }
    }));
    
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
      const nextBtn = document.getElementById("next-subconcept-btn-unlocked");
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
              Next Topic starting in{" "}
              <span className="text-yellow-200 ml-2">{countdown}</span> sec
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
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer"
            >
              <RotateCcw size={16} /> Replay
            </button>

            <button
              onClick={() => {
                const btn = document.getElementById("next-subconcept-btn-unlocked");
                btn?.click();
              }}
              className="flex items-center gap-2 bg-white text-[#0EA5E9] hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-semibold transition-all cursor-pointer"
            >
              Go To Next <ChevronRight size={16} />
            </button>

            <button
              onClick={() => {
                setShowNextOverlay(false);
                setCountdown(5);
              }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer"
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

  // ----------------------------------------------------------
  //  Logic for specific content types
  // ----------------------------------------------------------
  const recordOnNextTypes = ["image", "youtube", "pdf", "mtf"];

  const shouldRecordOnNext = () => {
    if (!currentSubconcept) return false;
    const t = currentSubconcept.subconceptType.toLowerCase();
    if (t === "mcq") return false;
    return recordOnNextTypes.includes(t);
  };

  const handleNextAttempt = async () => {
    if (!currentSubconcept || !user) return;
    if (!shouldRecordOnNext() || attemptRecorded) return;
    if (currentSubconcept.isLockedForDemo) return;

    try {
      setAttemptRecorded(true);
      await recordAttempt({
        userId: user.userId,
        programId: programId!,
        stageId: currentSubconcept.stageId,
        unitId: currentSubconcept.unitId,
        subconceptId: currentSubconcept.subconceptId,
        subconceptType: currentSubconcept.subconceptType,
        subconceptMaxscore: currentSubconcept.subconceptMaxscore
      });
      
      window.dispatchEvent(
        new CustomEvent("updateSidebarCompletion", {
          detail: { subconceptId: currentSubconcept.subconceptId }
        })
      );
    } catch (err) {
      setAttemptRecorded(false);
    }
  };

  // Attach handler to next button
  useEffect(() => {
    const nextBtn = document.getElementById("next-subconcept-btn");
    if (!nextBtn) return;

    const handler = () => handleNextAttempt();
    nextBtn.addEventListener("click", handler);
    return () => nextBtn.removeEventListener("click", handler);
  }, [currentSubconcept, attemptRecorded]);

  // ----------------------------------------------------------
  //  Handle quiz submission
  // ----------------------------------------------------------
  const handleQuizSubmission = async (payload: {
    userAttemptFlag: boolean;
    userAttemptScore: number;
  }) => {
    if (!currentSubconcept || !user) return;
    if (!payload?.userAttemptFlag || attemptRecorded) return;
    if (currentSubconcept.isLockedForDemo) return;

    try {
      setAttemptRecorded(true);
      await recordAttempt({
        userId: user.userId,
        programId: programId!,
        stageId: currentSubconcept.stageId,
        unitId: currentSubconcept.unitId,
        subconceptId: currentSubconcept.subconceptId,
        subconceptType: currentSubconcept.subconceptType,
        subconceptMaxscore: currentSubconcept.subconceptMaxscore,
        score: payload.userAttemptScore
      });
      
      window.dispatchEvent(
        new CustomEvent("updateSidebarCompletion", {
          detail: { subconceptId: currentSubconcept.subconceptId }
        })
      );
    } catch (err) {
      setAttemptRecorded(false);
    }
  };

  // ----------------------------------------------------------
  //  Handle vocabulary activity submission
  // ----------------------------------------------------------
  const handleVocabularySubmission = async (payload: {
    userAttemptFlag: boolean;
    userAttemptScore: number;
  }) => {
    if (!currentSubconcept || !user) return;
    if (!payload?.userAttemptFlag || attemptRecorded) return;
    if (currentSubconcept.isLockedForDemo) return;

    try {
      setAttemptRecorded(true);
      await recordAttempt({
        userId: user.userId,
        programId: programId!,
        stageId: currentSubconcept.stageId,
        unitId: currentSubconcept.unitId,
        subconceptId: currentSubconcept.subconceptId,
        subconceptType: currentSubconcept.subconceptType,
        subconceptMaxscore: currentSubconcept.subconceptMaxscore,
        score: payload.userAttemptScore
      });
      
      window.dispatchEvent(
        new CustomEvent("updateSidebarCompletion", {
          detail: { subconceptId: currentSubconcept.subconceptId }
        })
      );
    } catch (err) {
      setAttemptRecorded(false);
    }
  };

  // ----------------------------------------------------------
  //  Show loading state
  // ----------------------------------------------------------
  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full" />
      </div>
    );
  }

  // ----------------------------------------------------------
  //  Show error if no subconcept
  // ----------------------------------------------------------
  if (!currentSubconcept) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}>
        <p>Content not found</p>
      </div>
    );
  }

  // ----------------------------------------------------------
  //  Show locked content for demo users
  // ----------------------------------------------------------
  if (currentSubconcept.isLockedForDemo) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-gray-50 p-8 ${className}`}>
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Content Locked for Demo</h3>
        <p className="text-gray-500 text-center max-w-md">
          This content is not available in demo mode. Please upgrade to access full features.
        </p>
      </div>
    );
  }

  const { subconceptLink, subconceptType, completionStatus } = currentSubconcept;

  // ----------------------------------------------------------
  //  Type-based content rendering
  // ----------------------------------------------------------
  switch (subconceptType.toLowerCase()) {
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
            src={subconceptLink}
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
            pdfUrl={subconceptLink}
            title="PDF Content"
            onLoadSuccess={() => setIsLoading(false)}
            onLoadError={() => setIsLoading(false)}
          />
        </div>
      );

    case "image":
    case "assignment_image":
      return (
        <div
          className={`relative w-full h-full flex items-center justify-center bg-white ${className}`}
        >
          {isLoading && renderLoading()}
          <img
            src={subconceptLink}
            alt="Image content"
            className="max-w-full max-h-full object-contain rounded-xl"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>
      );

    case "medium":
    case "toastmasters":
      return (
        <div className={`relative w-full h-full ${className}`}>
          {isLoading && renderLoading()}
          <iframe
            ref={iframeRef}
            src={subconceptLink}
            className="w-full h-full rounded-xl bg-white"
            title="External Content"
            frameBorder="0"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            loading="lazy"
          />
        </div>
      );

    case "assessment":
    case "googleform":
      const isCompleted = completionStatus?.toLowerCase() === "yes";
      if (isCompleted) {
        return (
          <div className="flex items-center justify-center w-full h-full p-6">
            <div className="max-w-md w-full bg-gray-50 border border-gray-200 rounded-xl p-6 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">
                Form already submitted
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                You have already submitted this form.
                <br />
                You can attempt it only once.
              </p>
            </div>
          </div>
        );
      }
      // Use formatted URL for Google Forms/Assessments
      return (
        <div className={`relative w-full h-full ${className}`}>
          {isLoading && renderLoading()}
          <iframe
            ref={iframeRef}
            src={formattedUrl}
            className="w-full h-full rounded-xl bg-white"
            title="Google Form Assessment"
            frameBorder="0"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            loading="lazy"
          />
        </div>
      );

    case "mcq":
      return (
        <div className={`relative w-full h-full overflow-auto ${className}`}>
          <QuizActivity
            triggerSubmit={() => {}}
            xmlUrl={subconceptLink}
            key={subconceptLink}
            subconceptMaxscore={currentSubconcept.subconceptMaxscore}
            setSubmissionPayload={handleQuizSubmission}
            setScorePercentage={setQuizScore}
          />
        </div>
      );

    case "mtf":
      return (
        <div className={`relative w-full h-full overflow-auto ${className}`}>
          <VocabularyActivity
            triggerSubmit={() => {}}
            xmlUrl={subconceptLink}
            key={subconceptLink}
            subconceptMaxscore={currentSubconcept.subconceptMaxscore}
            setSubmissionPayload={handleVocabularySubmission}
            setScorePercentage={setVocabularyScore}
          />
        </div>
      );
    // case "html-form": {
    //   const selectedCohortRaw = localStorage.getItem("selectedCohort");
    //   const selectedCohort = selectedCohortRaw
    //     ? JSON.parse(selectedCohortRaw)
    //     : null;
      
    //   const htmlLink =  "/PET - 3 (Practice Drill - PET3143).html";
    //   // const htmlLink = "/PET - 3 (Post Assessment - 2 - PET3149).html";

    //   const htmlUrl = `${htmlLink}?userId=${user?.userId || ""}&cohortId=${selectedCohort?.cohortId || ""}&subconceptId=${currentSubconcept.subconceptId}`;
    //   return (
    //     <div className={`relative w-full h-full ${className}`}>
    //       {isLoading && renderLoading()}
    //       <iframe
    //         ref={iframeRef}
    //         src={htmlUrl}
    //         className="w-full h-full rounded-xl bg-white"
    //         title="HTML Form Content"
    //         frameBorder="0"
    //         onLoad={() => setIsLoading(false)}
    //         onError={() => setIsLoading(false)}
    //         loading="lazy"
    //       />
    //     </div>
    //   );
    // }

    case "html-form": {
      const selectedCohortRaw = localStorage.getItem("selectedCohort");
      const selectedCohort = selectedCohortRaw
        ? JSON.parse(selectedCohortRaw)
        : null;

      
      // const xmlLink =  "/AudioXml.xml";
      const xmlLink =  "/PET3011.xml";

      return (
        <div className={`relative w-full h-full overflow-auto ${className}`}>
          <ReactForm
            xmlUrl={xmlLink} 
            ref={reactFormRef}
            userId={user?.userId || ""}
            cohortId={selectedCohort?.cohortId || ""}
            subconceptId={currentSubconcept.subconceptId}
          />
        </div>
      );
    }

    default:
      return (
        <div className={`relative w-full h-full ${className}`}>
          {isLoading && renderLoading()}
          <iframe
            ref={iframeRef}
            src={subconceptLink}
            className="w-full h-full rounded-xl bg-white"
            title="External Content"
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