// @ts-nocheck
import React, { useState } from "react";
import { FileUploaderRecorder } from "../../../components/AssignmentComponents/FileUploaderRecorder";
import AssignmentModal from "../../../components/modals/AssignmentModal";
import useCourseStore from "../../../store/courseStore";
import { useUserContext } from "../../../context/AuthContext";
import { Loader2 } from "lucide-react";

interface Props {
  subconceptId: string;
  completionStatus?: string;
}

const AssignmentActions: React.FC<Props> = ({
  subconceptId,
  completionStatus,
}) => {
  const { cohort, user } = useUserContext();
  const { markSubconceptCompleted, getSubconceptById, programId } =
    useCourseStore();

  const [uploaded, setUploaded] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const isCompleted = completionStatus?.toLowerCase() === "yes";
  const sub = getSubconceptById(subconceptId);

  if (!sub || !programId || !cohort?.cohortId || !user?.userId) return null;

  /* ---------------- Fetch Assignment Status ---------------- */

  const fetchAssignmentStatus = async () => {
    try {
      setLoadingStatus(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/assignments/user-assignment?userId=${user.userId}&subconceptId=${subconceptId}`
      );

      const data = await res.json();

      if (data?.status === "not_found") {
        setAssignmentStatus(null);
      } else {
        setAssignmentStatus(data);
      }
    } catch (err) {
      console.error("Error fetching assignment status", err);
      setAssignmentStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  /* ---------------- Upload Success ---------------- */

  const handleUploadSuccess = async () => {
    markSubconceptCompleted(subconceptId);
    setUploaded(true);
    await fetchAssignmentStatus();

    window.dispatchEvent(
      new CustomEvent("updateSidebarCompletion", {
        detail: { subconceptId },
      })
    );
  };

  /* ---------------- Render ---------------- */

  return (
    <div className="w-full flex justify-center mt-6">
      <div className="flex flex-row items-center gap-4">
        {!isCompleted && !uploaded && (
          <FileUploaderRecorder
            assignmentStatus={null}
            onUploadSuccess={handleUploadSuccess}
            uploadMeta={{
              programId,
              cohortId: cohort.cohortId,
              stageId: sub.stageId,
              unitId: sub.unitId,
              subconceptId: sub.subconceptId,
            }}
          />
        )}

        {(isCompleted || uploaded) && (
          <button
            className="h-10 bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-4 rounded-md text-sm font-medium transition flex items-center gap-2"
            onClick={async () => {
              setShowAssignmentModal(true); // OPEN FIRST
              if (!assignmentStatus) {
                await fetchAssignmentStatus(); // LOAD DATA
              }
            }}
          >
            {loadingStatus && <Loader2 size={16} className="animate-spin" />}
            View Assignment Status
          </button>
        )}
      </div>

      {/* MODAL ALWAYS OPENS */}
      {showAssignmentModal && (
        <AssignmentModal
          onClose={() => setShowAssignmentModal(false)}
          loading={loadingStatus}
          submissionDate={assignmentStatus?.submittedDate}
          status={assignmentStatus?.status}
          fileUrl={assignmentStatus?.submittedFile?.downloadUrl}
          correctedFile={assignmentStatus?.correctedFile}
          correctedDate={assignmentStatus?.correctedDate}
          remarks={assignmentStatus?.remarks}
          score={assignmentStatus?.score}
        />
      )}
    </div>
  );
};

export default AssignmentActions;
