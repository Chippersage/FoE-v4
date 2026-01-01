// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { useUserContext } from "../../context/AuthContext";

import useCourseStore from "../../store/courseStore";

import ContentRenderer from "../../components/ContentRenderer";
import NextSubconceptButton from "../../components/NextSubconceptButton";
import AssignmentActions from "./components/AssignmentActions";
import GoogleFormActions from "./components/GoogleFormActions";
import MarkCompleteButton from "./components/MarkCompleteButton";
import ScoreBadge from "./components/ScoreBadge";
import ScoreSummaryModal from "./components/ScoreSummaryModal";

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
}

const CoursePage: React.FC = () => {
  const { programId, stageId, unitId, conceptId } = useParams();
  const { user } = useUserContext();
  const { isSidebarOpen } = useOutletContext<OutletContext>();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showScoreSummary, setShowScoreSummary] = useState(false);
  const [videoProgressPercent, setVideoProgressPercent] = useState(0);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);

  const {
    loadCourse,
    isLoading,
    error,
    stages,
    getSubconceptById,
    markSubconceptCompleted,
  } = useCourseStore();

  useEffect(() => {
    if (programId && user?.userId) {
      loadCourse(programId, user.userId);
    }
  }, [programId, user?.userId]);

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

  useEffect(() => {
    setVideoProgressPercent(0);
    setIsVideoCompleted(false);
  }, [conceptId]);

  const subconcept = useMemo(() => {
    if (!conceptId || stages.length === 0) return null;
    return getSubconceptById(conceptId);
  }, [conceptId, stages]);

  const type = subconcept?.subconceptType?.toLowerCase();

  const isAssignment = type?.startsWith("assignment");
  const isGoogleForm = type === "googleform" || type === "assessment";
  
  const needsManualCompletion = MANUAL_COMPLETION_TYPES.includes(type || "");
  const isAutoCompletion = AUTO_COMPLETION_TYPES.includes(type || "");
  const needsSubmission = NEEDS_SUBMISSION_TYPES.includes(type || "");

  const isIframeContent =
    !!type &&
    !["video", "audio", "pdf", "image", "youtube", "mcq", "mtf", "word"].includes(
      type
    );

  const isCompleted = subconcept?.completionStatus?.toLowerCase() === "yes";

  const contentHeightClass = useMemo(() => {
    if (window.innerWidth >= 768) {
      return "h-[80vh]";
    }

    if (type === "video" || type === "audio") {
      return "h-[50vh]";
    }

    return "h-[75vh]";
  }, [type]);

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

  useEffect(() => {
    if (scoreData && !showScoreSummary) {
      setShowScoreSummary(true);
    }
  }, [scoreData]);

  const handleSubmit = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    iframeRef.current.contentWindow.postMessage("submitClicked", "*");
    onSubmitClicked();
  };

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

  if (!stageId || !unitId || !conceptId) return null;

  if (isLoading || !subconcept) {
    return <CourseSkeleton />;
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div
        className={`${contentHeightClass} bg-white flex justify-center items-center p-2 md:p-4 lg:p-6 overflow-auto`}
      >
        <div className="w-full max-w-5xl rounded-xl overflow-hidden bg-white h-full relative">
          <ContentRenderer
            iframeRef={iframeRef}
            style={{
              opacity: showScore ? 0.1 : 1,
              pointerEvents: showScore ? "none" : "auto",
            }}
          />
        </div>
      </div>

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

          {isIframeContent && showSubmit && !attemptRecorded && !showScore && (
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

          {(attemptRecorded || showScore) && scoreData && (
            <ScoreBadge
              score={scoreData.score}
              total={scoreData.total}
              onClick={() => setShowScoreSummary(true)}
            />
          )}

          <NextSubconceptButton disabled={isNextButtonDisabled} />
        </div>
      </div>

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

          <NextSubconceptButton disabled={isNextButtonDisabled} />
        </div>
      </div>

      {scoreData && (
        <ScoreSummaryModal
          isOpen={showScoreSummary}
          onClose={() => setShowScoreSummary(false)}
          score={scoreData.score}
          total={scoreData.total}
        />
      )}

      {!isSidebarOpen && <div className="md:hidden h-32" />}
    </div>
  );
};

export default CoursePage;