// @ts-nocheck
import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import ContentRenderer from "../components/ContentRenderer";
import NextSubconceptButton from "../components/NextSubconceptButton";
import { FileUploaderRecorder } from "../components/AssignmentComponents/FileUploaderRecorder";
import AssignmentModal from "../components//modals/AssignmentModal";
import { useUserContext } from "../context/AuthContext";
import { getInitialSubconcept } from "../utils/courseProgressUtils";
import CourseContext from "../context/CourseContext";
import GoogleFormControl from "../components/GoogleFormControl";
import { ChevronRight } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const CoursePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { programId } = useParams();
  const { user } = useUserContext();

  const [stages, setStages] = useState<any[]>([]);
  const [programName, setProgramName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showIframe, setShowIframe] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);

  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const [currentContent, setCurrentContent] = useState({
    url: "",
    type: "video",
    id: "",
    stageId: "",
    unitId: "",
    subconceptId: "",
    subconceptMaxscore: 0,
    completionStatus: "",
  });

  const courseContextValue = useMemo(
    () => ({
      currentContent,
      setCurrentContent,
      stages,
      setStages,
      programName,
      user,
      programId,
      canGoNext,
      setCanGoNext,
      remainingTime,
      setRemainingTime,
    }),
    [currentContent, stages, programName, user, programId, canGoNext, remainingTime]
  );

  const isGoogleFormType = (type: string) => {
    if (!type) return false;
    const normalized = String(type).toLowerCase();
    return normalized === "googleform" || normalized === "assessment";
  };

  const shouldShowIframe = (contentType: string) => {
    const nonIframeTypes = [
      "video",
      "audio",
      "pdf",
      "image",
      "assignment_video",
      "assignment_audio",
      "assignment_pdf",
      "assignment_image",
      "assessment",
      "youtube",
      "mtf",
      "mcq",
      "word",
      "pdfAsPpt",
    ];
    return !nonIframeTypes.includes(contentType);
  };

  useEffect(() => {
    const disableContext = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableContext);
    return () => document.removeEventListener("contextmenu", disableContext);
  }, []);

  useEffect(() => {
    const shouldShow = shouldShowIframe(currentContent.type);
    setShowIframe(shouldShow);
    setShowSubmit(false);
  }, [currentContent.type, currentContent.url, currentContent.subconceptId]);

  useEffect(() => {
    console.log("CurrentContent:", currentContent);
  }, [currentContent]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "enableSubmit") setShowSubmit(true);
      else if (event.data === "disableSubmit") setShowSubmit(false);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_BASE_URL}/programconceptsmappings/${user?.userId}/program/${programId}/complete`
        );

        const data = res.data;
        const stagesData = data.stages || [];

        setStages(stagesData);
        setProgramName(data.programName || "Program");

        const initialSubconcept = getInitialSubconcept(stagesData);
        if (initialSubconcept) {
          const { stage, unit, sub } = initialSubconcept;

          setCurrentContent({
            url: sub.subconceptLink,
            type: sub.subconceptType,
            id: sub.subconceptId,
            stageId: stage.stageId,
            unitId: unit.unitId,
            subconceptId: sub.subconceptId,
            subconceptMaxscore: Number(sub.subconceptMaxscore || 0),
            completionStatus: sub.completionStatus,
          });
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (programId && user?.userId) fetchData();
  }, [programId, user?.userId]);

  useEffect(() => {
    if (currentContent?.subconceptId) {
      localStorage.setItem("lastViewedSubconcept", currentContent.subconceptId);
    }
  }, [currentContent?.subconceptId]);

  useEffect(() => {
    const fetchAssignmentStatus = async () => {
      try {
        if (!user?.userId || !currentContent?.subconceptId) return;

        const res = await axios.get(`${API_BASE_URL}/assignments/user-assignment`, {
          params: { userId: user.userId, subconceptId: currentContent.subconceptId },
        });

        if (res.data?.status === "not_found") setAssignmentStatus(null);
        else setAssignmentStatus(res.data);
      } catch (err) {
        console.error("Error fetching assignment status:", err);
        setAssignmentStatus(null);
      }
    };

    if (currentContent?.type?.toLowerCase().startsWith("assignment")) {
      fetchAssignmentStatus();
    } else {
      setAssignmentStatus(null);
    }
  }, [currentContent?.type, currentContent?.subconceptId, user?.userId]);

  const handleSubmit = () => {
    const iframe = document.getElementById("embeddedContent");
    if (iframe && iframe.tagName === "IFRAME") {
      (iframe as HTMLIFrameElement).contentWindow?.postMessage("submitClicked", "*");
    }
  };

  const handleNextSubconcept = async (nextSub) => {
    setCurrentContent({
      url: nextSub.subconceptLink,
      type: nextSub.subconceptType,
      id: nextSub.subconceptId,
      stageId: nextSub.stageId,
      unitId: nextSub.unitId,
      subconceptId: nextSub.subconceptId,
      completionStatus: nextSub.completionStatus,
      subconceptMaxscore: Number(nextSub.subconceptMaxscore || 0),
    });
  };

  const renderNextButton = (disabled = false) => (
    <NextSubconceptButton
      stages={stages}
      currentContentId={currentContent.id}
      onNext={handleNextSubconcept}
      disabled={disabled}
    />
  );

  const ContentArea = () => {
    const isAssessment = String(currentContent.type).toLowerCase() === "assessment";
    const isCompleted = String(currentContent.completionStatus).toLowerCase() === "yes";

    const isLockedGoogleForm = isAssessment && isCompleted;

    if (showIframe) {
      if (isLockedGoogleForm) {
        return (
          <div className="w-full h-full flex items-center justify-center text-gray-700 font-medium">
            You have already submitted this form.
          </div>
        );
      }

      return (
        <iframe
          id="embeddedContent"
          src={currentContent.url}
          title="Embedded Content"
          className="w-full h-full"
          allow="autoplay"
        />
      );
    }

    return (
      <div className="relative w-full h-full">
        <ContentRenderer
          type={currentContent.type}
          url={currentContent.url}
          title="Course Content"
          className="w-full h-full"
        />

        {isLockedGoogleForm && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center text-gray-700 font-medium">
            You have already submitted this form.
          </div>
        )}
      </div>
    );
  };

  const ControlButtons = () => (
    <>
      {showIframe && showSubmit && (
        <div className="mt-4">
          <button
            ref={submitBtnRef}
            onClick={handleSubmit}
            className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white px-6 py-3 font-[700] text-base rounded-full flex items-center justify-center gap-2"
          >
            <img src="/icons/User-icons/send.png" alt="Submit Icon" className="w-5 h-5" />
            Submit
          </button>
        </div>
      )}

      {currentContent.type?.toLowerCase().startsWith("assignment") ? (
        assignmentStatus ? (
          <div className="mt-6 flex flex-row items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              View Assignment Status
            </button>
            {renderNextButton()}
          </div>
        ) : (
          <div className="mt-6 flex flex-row items-center justify-center gap-3 flex-wrap">
            <FileUploaderRecorder
              assignmentStatus={assignmentStatus}
              onSuccess={() =>
                setStages((prevStages) =>
                  prevStages.map((stage) => ({
                    ...stage,
                    units: stage.units.map((unit) => ({
                      ...unit,
                      subconcepts: unit.subconcepts.map((sub) =>
                        sub.subconceptId === currentContent.subconceptId
                          ? { ...sub, completionStatus: "yes" }
                          : sub
                      ),
                    })),
                  }))
                )
              }
            />
            {renderNextButton()}
          </div>
        )
      ) : isGoogleFormType(currentContent.type) ? (
        <GoogleFormControl
          onNext={handleNextSubconcept}
          completionStatus={currentContent.completionStatus}
          subconceptType={currentContent.type}
        />
      ) : (
        <div className="mt-6 flex flex-row items-center justify-center gap-3 flex-wrap">
          {renderNextButton()}
        </div>
      )}
    </>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-[#0EA5E9] opacity-25" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#0EA5E9] border-transparent animate-spin" />
        </div>
        <p className="mt-4 text-[#0EA5E9] font-medium text-base animate-pulse tracking-wide">
          Loading your course...
        </p>
      </div>
    );
  }

  // -----------------------------------------------
  // NEW: MOBILE CONTROL BAR ABOVE SIDEBAR
  // -----------------------------------------------
  const mobileActionsExist =
    currentContent.type?.startsWith("assignment") ||
    isGoogleFormType(currentContent.type);

  const MobileActionBar = () => {
    if (!mobileActionsExist) return null;

    return (
      <div className="md:hidden w-full bg-white  px-4 py-3 flex flex-col gap-3">
        {currentContent.type?.startsWith("assignment") ? (
          assignmentStatus ? (
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white px-4 py-2 rounded-md text-sm font-medium shadow"
            >
              View Assignment Status
            </button>
          ) : (
            <FileUploaderRecorder
              assignmentStatus={assignmentStatus}
              onSuccess={() =>
                setStages((prevStages) =>
                  prevStages.map((stage) => ({
                    ...stage,
                    units: stage.units.map((unit) => ({
                      ...unit,
                      subconcepts: unit.subconcepts.map((sub) =>
                        sub.subconceptId === currentContent.subconceptId
                          ? { ...sub, completionStatus: "yes" }
                          : sub
                      ),
                    })),
                  }))
                )
              }
            />
          )
        ) : null}

        {isGoogleFormType(currentContent.type) && (
          <GoogleFormControl
            onNext={handleNextSubconcept}
            completionStatus={currentContent.completionStatus}
            subconceptType={currentContent.type}
          />
        )}
      </div>
    );
  };

  // -----------------------------------------------
  // NEW FLOATING ROUND NEXT BUTTON (MOBILE)
  // -----------------------------------------------
  const FloatingNextButton = () => {
    const nextExists = stages?.length > 0;

    if (!nextExists) return null;

    return (
      <button
        onClick={() => {
          const nextBtn = document.getElementById("next-subconcept-btn");
          nextBtn?.click();
        }}
        className="md:hidden fixed bottom-10 right-10 w-14 h-14 rounded-full bg-[#0EA5E9] shadow-lg flex items-center justify-center active:scale-95 transition"
      >
        <ChevronRight size={28} className="text-white" />
      </button>
    );
  };

  // -----------------------------------------------

  return (
    <CourseContext.Provider value={courseContextValue}>
      <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
        {/* Sidebar Desktop */}
        <div className="hidden md:block fixed left-0 top-0 h-screen w-72 z-30">
          <Sidebar
            programName={programName}
            onSelectSubconcept={(
              url,
              type,
              id,
              stageId,
              unitId,
              subconceptId,
              subconceptMaxscore,
              completionStatus
            ) =>
              setCurrentContent({
                url,
                type,
                id,
                stageId: stageId || currentContent.stageId,
                unitId: unitId || currentContent.unitId,
                subconceptId: subconceptId || currentContent.subconceptId,
                completionStatus: completionStatus || currentContent.completionStatus,
                subconceptMaxscore: Number(subconceptMaxscore || 0),
              })
            }
            currentActiveId={currentContent.id}
            stages={stages}
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col md:ml-72">
          <div
            className="bg-white flex justify-center items-center p-4"
            style={{
              height: window.innerWidth >= 768 ? "80vh" : "40vh",
              transition: "height 0.2s ease-in-out",
            }}
          >
            <div className="w-full max-w-5xl rounded-xl shadow-md overflow-hidden bg-white h-full">
              <ContentArea />
            </div>
          </div>

          {/* MOBILE ACTION BAR */}
          <MobileActionBar />

          {/* MOBILE SIDEBAR */}
          <div
            className="md:hidden flex-shrink-0 bg-white overflow-y-auto border-t border-gray-300"
            style={{ height: mobileActionsExist ? "48vh" : "55vh" }}
          >
            <Sidebar
              programName={programName}
              onSelectSubconcept={(
                url,
                type,
                id,
                stageId,
                unitId,
                subconceptId,
                subconceptMaxscore,
                completionStatus
              ) =>
                setCurrentContent({
                  url,
                  type,
                  id,
                  stageId: stageId || currentContent.stageId,
                  unitId: unitId || currentContent.unitId,
                  subconceptId: subconceptId || currentContent.subconceptId,
                  completionStatus: completionStatus || currentContent.completionStatus,
                  subconceptMaxscore: Number(subconceptMaxscore || 0),
                })
              }
              currentActiveId={currentContent.id}
              stages={stages}
            />
          </div>

          {/* DESKTOP BUTTONS */}
          <div className="hidden md:flex justify-center mt-4">
            <ControlButtons />
          </div>
        </div>
      </div>

      {/* FLOATING NEXT on MOBILE */}
      <FloatingNextButton />

      {showAssignmentModal && (
        <AssignmentModal
          onClose={() => setShowAssignmentModal(false)}
          submissionDate={assignmentStatus?.submittedDate}
          status={assignmentStatus?.status}
          fileUrl={assignmentStatus?.submittedFile?.downloadUrl}
          correctedFile={assignmentStatus?.correctedFile}
          correctedDate={assignmentStatus?.correctedDate}
          remarks={assignmentStatus?.remarks}
          score={assignmentStatus?.score}
        />
      )}
    </CourseContext.Provider>
  );
};

export default CoursePage;
