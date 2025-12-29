// @ts-nocheck
import React, { useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../context/AuthContext";

import useCourseStore from "../../store/courseStore";
import useCourseEntryRedirect from "./hooks/useCourseEntryRedirect";

import ContentRenderer from "../../components/ContentRenderer";
import NextSubconceptButton from "../../components/NextSubconceptButton";
import AssignmentActions from "./components/AssignmentActions";
import GoogleFormActions from "./components/GoogleFormActions";

import { useIframeAttemptHandler } from "./hooks/useIframeAttemptHandler";
import CourseSkeleton from "./skeletons/CourseSkeleton";

const CoursePage: React.FC = () => {
  const { programId, stageId, unitId, conceptId } = useParams();
  const { user } = useUserContext();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

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

  useCourseEntryRedirect({
    enabled: Boolean(programId && !stageId && !unitId && !conceptId),
  });

  const subconcept = useMemo(() => {
    if (!conceptId || stages.length === 0) return null;
    return getSubconceptById(conceptId);
  }, [conceptId, stages]);

  const type = subconcept?.subconceptType?.toLowerCase();

  const isAssignment = type?.startsWith("assignment");
  const isGoogleForm = type === "googleform" || type === "assessment";

  const isIframeContent =
    !!type &&
    !["video", "audio", "pdf", "image", "youtube", "mcq", "mtf", "word"].includes(
      type
    );

  const {
    showSubmit,
    attemptRecorded,
    isSubmitting,
    onSubmitClicked,
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

  if (!stageId || !unitId || !conceptId) return null;

  if (isLoading || stages.length === 0 || !subconcept) {
    return <CourseSkeleton />;
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  const handleSubmit = () => {
    iframeRef.current?.contentWindow?.postMessage("submitClicked", "*");
    onSubmitClicked();
  };

  return (
    <>
      <div className="bg-white flex justify-center items-center p-4 h-[80vh]">
        <div className="w-full max-w-5xl rounded-xl shadow-md overflow-hidden bg-white h-full">
          <ContentRenderer
            type={subconcept.subconceptType}
            url={subconcept.subconceptLink}
            iframeRef={iframeRef}
          />
        </div>
      </div>

      <div className="hidden md:flex justify-center mt-6">
        <div className="flex items-center gap-6">
          {isAssignment && (
            <AssignmentActions
              subconceptId={subconcept.subconceptId}
              completionStatus={subconcept.completionStatus}
            />
          )}

          {isGoogleForm && (
            <GoogleFormActions
              subconceptId={subconcept.subconceptId}
              completionStatus={subconcept.completionStatus}
            />
          )}

          {isIframeContent && showSubmit && !attemptRecorded && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md text-sm font-medium text-white ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0EA5E9] hover:bg-[#0284c7]"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          )}

          <NextSubconceptButton
            disabled={isIframeContent && !attemptRecorded}
          />
        </div>
      </div>
    </>
  );
};

export default CoursePage;
