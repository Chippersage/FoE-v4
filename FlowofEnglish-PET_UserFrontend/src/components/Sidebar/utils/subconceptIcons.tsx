import { Video, FileText, Image, FileQuestion, FileSpreadsheet, Headphones, Globe } from "lucide-react";

export const getSubconceptIcon = (type: string, isLocked: boolean) => {

  const iconClass = `flex-shrink-0 ${
    isLocked ? "text-gray-400" : "text-gray-600"
  }`;

  switch ((type || "").toLowerCase()) {

    case "video":
      return <Video size={16} className={iconClass} />;

    case "pdf":
    case "assignment_pdf":
      return <FileText size={16} className={iconClass} />;

    case "image":
    case "assignment_image":
      return <Image size={16} className={iconClass} />;

    case "mcq":
      return <FileQuestion size={16} className={iconClass} />;

    case "mtf":
      return <FileSpreadsheet size={16} className={iconClass} />;

    case "audio":
      return <Headphones size={16} className={iconClass} />;

    case "assessment":
    case "googleform":
      return <FileSpreadsheet size={16} className={iconClass} />;

    case "practice_drill":
      return <FileText size={16} className={iconClass} />;

    case "medium":
    case "toastmasters":
      return <Globe size={16} className={iconClass} />;

    case "react-form":
      return <FileSpreadsheet size={16} className={iconClass} />;

    default:
      return <FileText size={16} className={iconClass} />;
  }
};