// @ts-nocheck
import { useState, useMemo } from "react";
import CourseContext, { CurrentContent } from "./CourseContext";

const EMPTY_CONTENT: CurrentContent = {
  url: "",
  type: "video",
  id: "",
  stageId: "",
  unitId: "",
  subconceptId: "",
  subconceptMaxscore: 0,
};

interface CourseProviderProps {
  children: React.ReactNode;
  user: any;
  programId?: string;
}

const CourseProvider: React.FC<CourseProviderProps> = ({
  children,
  user,
  programId,
}) => {
  // ✅ ALL COURSE STATE LIVES HERE

  const [currentContent, setCurrentContent] =
    useState<CurrentContent>(EMPTY_CONTENT);

  const [stages, setStages] = useState<any[]>([]);
  const [programName, setProgramName] = useState<string>("");

  /**
   * 🔒 CRITICAL PART
   * useMemo ensures:
   * - Sidebar does NOT re-render
   * - Context reference stays stable
   */
  const value = useMemo(
    () => ({
      currentContent,
      setCurrentContent,

      stages,
      setStages,

      programName,
      setProgramName,

      user,
      programId,
    }),
    [
      currentContent.id, // 🔑 ONLY id matters
      stages.length,      // 🔑 structure change only
      programName,
      user?.userId,
      programId,
    ]
  );

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export default CourseProvider;
