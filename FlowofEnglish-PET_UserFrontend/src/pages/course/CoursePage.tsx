// @ts-nocheck
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../context/AuthContext";
import useCourseStore from "../../store/courseStore";
import useCourseEntryRedirect from "./hooks/useCourseEntryRedirect";
import ContentRenderer from "../../components/ContentRenderer";
import NextSubconceptButton from "../../components/NextSubconceptButton";

const CoursePage: React.FC = () => {
  const { programId, stageId, unitId, conceptId } = useParams();
  const { user } = useUserContext();

  const { loadCourse, isLoading, error } = useCourseStore();

  // 1️⃣ Load course once
  useEffect(() => {
    if (programId && user?.userId) {
      loadCourse(programId, user.userId);
    }
  }, [programId, user?.userId]);

  // 2️⃣ ENTRY REDIRECT — only when URL is INCOMPLETE
  useCourseEntryRedirect({
    enabled: Boolean(programId && !stageId && !unitId && !conceptId),
  });

  // 3️⃣ Avoid UI flicker during entry mode
  if (!stageId || !unitId || !conceptId) return null;

  // 4️⃣ Loading
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading…</div>;
  }

  // 5️⃣ Error
  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  // 6️⃣ Content mode
  return (
    <>
      <div className="bg-white flex justify-center items-center p-4 h-[80vh]">
        <div className="w-full max-w-5xl rounded-xl shadow-md overflow-hidden bg-white h-full">
          <ContentRenderer />
        </div>
      </div>

      <div className="hidden md:flex justify-center mt-4">
        <NextSubconceptButton />
      </div>
    </>
  );
};

export default CoursePage;
