import { useRef, useState } from "react";
import { downloadPDFReport, type PDFReportData } from "../utils/pdfGenerator";

export const usePDFReport = () => {
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  // Use explicit type that matches the expected type in downloadPDFReport
  const pageRef = useRef<HTMLDivElement>(null);

  const downloadReport = async (data: PDFReportData) => {
    if (!pageRef.current) {
      console.error("PDF element ref is not attached to any DOM element");
      return;
    }

    // Type assertion to ensure compatibility
    const elementRef = pageRef as React.RefObject<HTMLDivElement>;
    await downloadPDFReport(elementRef, data, setGeneratingPDF);
  };

  return {
    generatingPDF,
    pageRef,
    downloadReport,
    setGeneratingPDF,
  };
};

export type { PDFReportData };