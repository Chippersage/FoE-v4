// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { useUserContext } from "../../context/AuthContext";

import useCourseStore from "../../store/courseStore";
import useCourseEntryRedirect from "./hooks/useCourseEntryRedirect";

import ContentRenderer from "../../components/ContentRenderer";
import NextSubconceptButton from "../../components/NextSubconceptButton";
import AssignmentActions from "./components/AssignmentActions";
import GoogleFormActions from "./components/GoogleFormActions";
import MarkCompleteButton from "./components/MarkCompleteButton";
import ScoreBadge from "./components/ScoreBadge";
import ScoreSummaryModal from "./components/ScoreSummaryModal";
import AssignmentSampleAnswerModal from "./components/AssignmentSampleAnswerModal";

import { useIframeAttemptHandler } from "./hooks/useIframeAttemptHandler";
import CourseSkeleton from "./skeletons/CourseSkeleton";

import { 
  MANUAL_COMPLETION_TYPES, 
  AUTO_COMPLETION_TYPES, 
  NEEDS_SUBMISSION_TYPES 
} from "./constants/completionTypes";

interface OutletContext {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
  isEntryRoute?: boolean;
}

const CoursePage: React.FC = () => {
  const { programId, stageId, unitId, conceptId } = useParams();
  const { user } = useUserContext();
  const { isSidebarOpen, isEntryRoute = false } = useOutletContext<OutletContext>();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const reactFormRef = useRef<any>(null);
  const [showScoreSummary, setShowScoreSummary] = useState(false);
  const [videoProgressPercent, setVideoProgressPercent] = useState(0);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [hasLoadedCourse, setHasLoadedCourse] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  
  // Track redirect state to prevent multiple redirects
  const hasRedirectedRef = useRef(false);

  const {
    loadCourse,
    isLoading: isCourseLoading,
    error,
    stages,
    getSubconceptById,
    markSubconceptCompleted,
  } = useCourseStore();

  // Load course when we have minimum requirements (programId + userId)
  useEffect(() => {
    const hasMinRequirements = !!(programId && user?.userId);
    const shouldLoad = hasMinRequirements && !loadAttempted && !isCourseLoading;
    
    if (shouldLoad) {
      setLoadAttempted(true);
      loadCourse(programId!, user!.userId);
    }
  }, [programId, user?.userId, loadAttempted, isCourseLoading, loadCourse]);

  // Track when course data is fully loaded
  useEffect(() => {
    if (!isCourseLoading && stages && stages.length > 0 && !hasLoadedCourse) {
      setHasLoadedCourse(true);
      
      // Only set redirect flag if we're on entry route and don't have conceptId
      if (isEntryRoute && !conceptId && !hasRedirectedRef.current) {
        setShouldRedirect(true);
      } else if (conceptId) {
        // If we already have conceptId, cancel any pending redirect
        setShouldRedirect(false);
        hasRedirectedRef.current = true;
      }
    }
  }, [isCourseLoading, stages, hasLoadedCourse, isEntryRoute, conceptId]);

  // Cancel redirect immediately when we get conceptId
  useEffect(() => {
    if (conceptId && shouldRedirect) {
      setShouldRedirect(false);
      hasRedirectedRef.current = true;
    }
  }, [conceptId, shouldRedirect]);

  // Use redirect hook only when needed
  useCourseEntryRedirect({
    enabled: shouldRedirect && hasLoadedCourse && !hasRedirectedRef.current
  });

  // Video progress event listeners
  useEffect(() => {
    const handleVideoProgress = (e: CustomEvent) => {
      if (e.detail.conceptId === conceptId) {
        setVideoProgressPercent(e.detail.progress);
        if (e.detail.progress >= 90) {
          setIsVideoCompleted(true);
        }
      }
    };

    const handleVideoCompleted = (e: CustomEvent) => {
      if (e.detail.conceptId === conceptId) {
        setIsVideoCompleted(true);
      }
    };

    window.addEventListener('videoProgress', handleVideoProgress as EventListener);
    window.addEventListener('videoCompleted', handleVideoCompleted as EventListener);
    
    return () => {
      window.removeEventListener('videoProgress', handleVideoProgress as EventListener);
      window.removeEventListener('videoCompleted', handleVideoCompleted as EventListener);
      setVideoProgressPercent(0);
      setIsVideoCompleted(false);
    };
  }, [conceptId]);

  // Reset video state when concept changes
  useEffect(() => {
    setVideoProgressPercent(0);
    setIsVideoCompleted(false);
  }, [conceptId]);

  // Get current subconcept data
  const subconcept = useMemo(() => {
    if (!conceptId || !stages || stages.length === 0) return null;
    return getSubconceptById(conceptId);
  }, [conceptId, stages, getSubconceptById]);

  // Determine content type and related properties
  const type = useMemo(() => {
    return subconcept?.subconceptType?.toLowerCase();
  }, [subconcept?.subconceptType]);

  const isHtmlForm = type === "html-form";

  const isAssignment = type?.startsWith("assignment");
  const isGoogleForm = type === "googleform" || type === "assessment";
  
  const needsManualCompletion = MANUAL_COMPLETION_TYPES.includes(type || "");
  const isAutoCompletion = AUTO_COMPLETION_TYPES.includes(type || "");
  const needsSubmission = NEEDS_SUBMISSION_TYPES.includes(type || "");

  const isIframeContent =
    !!type &&
    !["video", "audio", "pdf", "image", "youtube", "mcq", "mtf", "word", "html-form", ].includes(
      type
    );

  const isCompleted = subconcept?.completionStatus?.toLowerCase() === "yes";
  const isAssignmentImage = type === "assignment_image";
  const hasAnswerImage = !!subconcept?.subconceptGroup;


  // Determine content height based on type and screen size
  const contentHeightClass = useMemo(() => {
    if (window.innerWidth >= 768) {
      return "h-[80vh]";
    }

    if (type === "video" || type === "audio") {
      return "h-[50vh]";
    }

    return "h-[75vh]";
  }, [type]);

  // Handle iframe-based content submission
  const {
    showSubmit,
    attemptRecorded,
    isSubmitting,
    onSubmitClicked,
    scoreData,
    showScore,
  } = useIframeAttemptHandler({
    enabled:
      isIframeContent &&
      !!programId &&
      !!stageId &&
      !!unitId &&
      !!subconcept &&
      !!user,
    user,
    programId,
    stageId,
    unitId,
    subconcept,
    markSubconceptCompleted,
  });

  // Show score summary when score data is available
  useEffect(() => {
    if (scoreData && !showScoreSummary) {
      setShowScoreSummary(true);
    }
  }, [scoreData]);

  const handleSubmit = () => {
    if (reactFormRef.current) {
      reactFormRef.current.submitForm();
      onSubmitClicked();
      return;
    }

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage("submitClicked", "*");
      onSubmitClicked();
    }
  };

  // Determine if Next button should be disabled
  const isVideoType = type === "video";
  const isIframeType = isIframeContent;

  const shouldDisableNext = () => {
    if (isVideoType) {
      return !isVideoCompleted;
    }
    
    if (isIframeType && needsSubmission) {
      return !attemptRecorded && !isCompleted;
    }
    
    if (isAutoCompletion) {
      return false;
    }
    
    if (needsManualCompletion) {
      return false;
    }
    
    return false;
  };

  const isNextButtonDisabled = shouldDisableNext();

  // ====== RENDER LOGIC ======
  
  // Check for minimum requirements
  if (!programId || !user?.userId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-2">Loading program...</div>
        </div>
      </div>
    );
  }

  // Show skeleton while loading course or during redirect
  if (isCourseLoading || !hasLoadedCourse || shouldRedirect) {
    return <CourseSkeleton />;
  }

  // Show skeleton until we have concept data
  if (!conceptId || !subconcept) {
    return <CourseSkeleton />;
  }

  // Show error if course loading failed
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  // Main render - all data is available
  return (
    <div className="h-full flex flex-col">
          {/* Subconcept Description */}
      {subconcept?.subconceptDesc && (
        <div className="px-4 md:px-8 pt-4 pb-2 bg-white">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 text-center">
            {subconcept.subconceptDesc}
          </h2>
        </div>
      )}
      {/* Content Area */}
      <div
        className={`${contentHeightClass} bg-white flex justify-center items-center p-2 md:p-4 lg:p-6 overflow-auto`}
      >
        <div className="w-full max-w-5xl rounded-xl overflow-hidden bg-white h-full relative">
          <ContentRenderer
            iframeRef={iframeRef}
            reactFormRef={reactFormRef}
            style={{
              opacity: showScore && !isHtmlForm ? 0.1 : 1,
              pointerEvents: showScore ? "none" : "auto",
            }}
          />
        </div>
      </div>

      {/* Desktop Action Bar */}
      <div className="hidden md:flex justify-center py-4 bg-white">
        <div className="flex items-center gap-4">
          {isAssignment && (
            <div className="flex-shrink-0" key={`assignment-${subconcept.subconceptId}`}>
              <AssignmentActions
                subconceptId={subconcept.subconceptId}
                completionStatus={subconcept.completionStatus}
              />
            </div>
          )}

          {isGoogleForm && (
            <GoogleFormActions
              subconceptId={subconcept.subconceptId}
              completionStatus={subconcept.completionStatus}
            />
          )}

          {needsManualCompletion && !isCompleted && (
            <MarkCompleteButton
              userId={user?.userId || ""}
              programId={programId!}
              stageId={stageId!}
              unitId={unitId!}
              subconceptId={subconcept.subconceptId}
              subconceptType={subconcept.subconceptType}
              subconceptMaxscore={subconcept.subconceptMaxscore || 0}
              onMarkComplete={() => {
                markSubconceptCompleted(subconcept.subconceptId);
              }}
            />
          )}

          {((isIframeContent && showSubmit) || isHtmlForm) &&
            !attemptRecorded &&
            !showScore && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0EA5E9] hover:bg-[#0284c7]"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          )}

          {!isHtmlForm && (attemptRecorded || showScore) && scoreData && (
            <ScoreBadge
              score={scoreData.score}
              total={scoreData.total}
              onClick={() => setShowScoreSummary(true)}
            />
          )}

          {isAssignmentImage && hasAnswerImage && (
            <button
              onClick={() => setShowAnswerModal(true)}
              className="px-4 py-2 rounded-md text-sm font-small bg-purple-600 text-white hover:bg-purple-700"
            >
              Sample Answer
            </button>
          )}


          <NextSubconceptButton disabled={isNextButtonDisabled} />
        </div>
      </div>

      {/* Mobile Action Bar */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 py-3 px-4 ${
          isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex items-center justify-center gap-3">
          {isAssignment && (
            <div className="flex-shrink-0" key={`assignment-${subconcept.subconceptId}`}>
              <AssignmentActions
                subconceptId={subconcept.subconceptId}
                completionStatus={subconcept.completionStatus}
                isMobile={true}
              />
            </div>
          )}

          {isGoogleForm && (
            <div className="flex-shrink-0">
              <GoogleFormActions
                subconceptId={subconcept.subconceptId}
                completionStatus={subconcept.completionStatus}
                isMobile={true}
              />
            </div>
          )}

          {needsManualCompletion && !isCompleted && (
            <div className="flex-shrink-0">
              <MarkCompleteButton
                userId={user?.userId || ""}
                programId={programId!}
                stageId={stageId!}
                unitId={unitId!}
                subconceptId={subconcept.subconceptId}
                subconceptType={subconcept.subconceptType}
                subconceptMaxscore={subconcept.subconceptMaxscore || 10}
                isMobile={true}
                onMarkComplete={() => {
                  markSubconceptCompleted(subconcept.subconceptId);
                }}
              />
            </div>
          )}

          {isIframeContent && showSubmit && !attemptRecorded && !showScore && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white flex-shrink-0 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0EA5E9]"
              }`}
            >
              {isSubmitting ? "..." : "Submit"}
            </button>
          )}

          {(attemptRecorded || showScore) && scoreData && (
            <ScoreBadge
              score={scoreData.score}
              total={scoreData.total}
              onClick={() => setShowScoreSummary(true)}
              isMobile={true}
            />
          )}

          {isAssignmentImage && hasAnswerImage && (
            <button
              onClick={() => setShowAnswerModal(true)}
              className="px-3 py-2 rounded-md text-sm font-medium bg-purple-600 text-white flex-shrink-0"
            >
              Sample Answer
            </button>
          )}


          <NextSubconceptButton disabled={isNextButtonDisabled} />
        </div>
      </div>

      {/* Score Summary Modal */}
      {!isHtmlForm && scoreData && (
        <ScoreSummaryModal
          isOpen={showScoreSummary}
          onClose={() => setShowScoreSummary(false)}
          score={scoreData.score}
          total={scoreData.total}
        />
      )}

      {isAssignmentImage && hasAnswerImage && (
        <AssignmentSampleAnswerModal
          isOpen={showAnswerModal}
          onClose={() => setShowAnswerModal(false)}
          documentUrl={subconcept.subconceptGroup}
        />
      )}

      {/* Spacer for mobile action bar */}
      {!isSidebarOpen && <div className="md:hidden h-32" />}
    </div>
  );
};

export default CoursePage;