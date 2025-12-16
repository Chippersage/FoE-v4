import { useEffect } from "react";
import { useCourseContext } from "../../context/CourseContext";
import {
  setSidebarStages,
  setActiveSubconcept,
} from "./sidebarController";

const SidebarBridge = () => {
  const { stages, currentContent } = useCourseContext();

  // push stages ONLY when length changes
  useEffect(() => {
    if (stages?.length) {
      setSidebarStages(stages);
    }
  }, [stages?.length]);

  // sync active subconcept
  useEffect(() => {
    if (currentContent?.id) {
      setActiveSubconcept(currentContent.id);
    }
  }, [currentContent?.id]);

  return null;
};

export default SidebarBridge;
