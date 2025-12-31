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

// Import completion types constants
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
  const infoStr = localStorage.getItem("selectedCohort");
  const info = infoStr ? JSON.parse(infoStr) : null;

  const { user } = useUserContext();
  const { isSidebarOpen } = useOutletContext<OutletContext>();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Add state for score summary modal
  const [showScoreSummary, setShowScoreSummary] = useState(false);

  const {
    loadCourse,
    isLoading,
    error,
    stages,
    getSubconceptById,
    markSubconceptCompleted,
  } = useCourseStore();

  // ------------------------------------------------------
  // Load course
  // ------------------------------------------------------
  useEffect(() => {
    if (programId && user?.userId) {
      loadCourse(programId, user.userId);
    }
  }, [programId, user?.userId]);

  // ------------------------------------------------------
  // Resolve subconcept
  // ------------------------------------------------------
  const subconcept = useMemo(() => {
    if (!conceptId || stages.length === 0) return null;
    return getSubconceptById(conceptId);
  }, [conceptId, stages]);

  const type = subconcept?.subconceptType?.toLowerCase();

  const isAssignment = type?.startsWith("assignment");
  const isGoogleForm = type === "googleform" || type === "assessment";
  
  // NEW: Use constants for completion types
  const needsManualCompletion = MANUAL_COMPLETION_TYPES.includes(type || "");
  const isAutoCompletion = AUTO_COMPLETION_TYPES.includes(type || "");
  const needsSubmission = NEEDS_SUBMISSION_TYPES.includes(type || "");

  const isIframeContent =
    !!type &&
    !["video", "audio", "pdf", "image", "youtube", "mcq", "mtf", "word"].includes(
      type
    );

  // Check if already completed
  const isCompleted = subconcept?.completionStatus?.toLowerCase() === "yes";

  // ------------------------------------------------------
  // ADD: Dynamic height (NO logic removed)
  // ------------------------------------------------------
  const contentHeightClass = useMemo(() => {
    if (window.innerWidth >= 768) {
      return "h-[80vh]";
    }

    if (type === "video" || type === "audio") {
      return "h-[50vh]";
    }

    return "h-[75vh]";
  }, [type]);

  // ------------------------------------------------------
  // Iframe attempt handler (SINGLE SOURCE OF TRUTH)
  // ------------------------------------------------------
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

  // ------------------------------------------------------
  // CRITICAL: Auto-show modal when score is received
  // ------------------------------------------------------
  useEffect(() => {
    if (scoreData && !showScoreSummary) {
      setShowScoreSummary(true);
    }
  }, [scoreData]);

  // ------------------------------------------------------
  // Submit click → forward to iframe
  // ------------------------------------------------------
  const handleSubmit = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    iframeRef.current.contentWindow.postMessage("submitClicked", "*");
    onSubmitClicked();
  };

  // ------------------------------------------------------
  // Guards
  // ------------------------------------------------------
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

  // ------------------------------------------------------
  // Render
  // ------------------------------------------------------
  return (
    <div className="h-full flex flex-col">
      {/* MAIN CONTENT */}
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

      {/* DESKTOP ACTIONS */}
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

          {/* NEW: Mark Complete Button for manual completion types */}
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
                // Update local store state
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

          {/* REPLACED: Score display with clickable ScoreBadge */}
          {(attemptRecorded || showScore) && scoreData && (
            <ScoreBadge
              score={scoreData.score}
              total={scoreData.total}
              onClick={() => setShowScoreSummary(true)}
            />
          )}

          <NextSubconceptButton/>
        </div>
      </div>

      {/* MOBILE ACTION BAR */}
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

          {/* NEW: Mark Complete Button for mobile */}
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

          {/* REPLACED: Mobile score display with clickable ScoreBadge */}
          {(attemptRecorded || showScore) && scoreData && (
            <ScoreBadge
              score={scoreData.score}
              total={scoreData.total}
              onClick={() => setShowScoreSummary(true)}
              isMobile={true}
            />
          )}

          <NextSubconceptButton/>
        </div>
      </div>

      {/* Score Summary Modal */}
      {scoreData && (
        <ScoreSummaryModal
          isOpen={showScoreSummary}
          onClose={() => setShowScoreSummary(false)}
          score={scoreData.score}
          total={scoreData.total}
        />
      )}

      {/* Spacer so content is not hidden */}
      {!isSidebarOpen && <div className="md:hidden h-32" />}
    </div>
  );
};

export default CoursePage;