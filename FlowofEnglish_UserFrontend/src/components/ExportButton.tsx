import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExportButtonProps {
  targetId: string;
  fileName: string;
  padding?: number; // optional top/side padding
}

export default function ExportButton({
  targetId,
  fileName,
  padding = 40,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(targetId, fileName, padding);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async (
    targetId: string,
    fileName: string,
    padding: number
  ) => {
    const element = document.getElementById(targetId);
    if (!element) throw new Error(`Element with id ${targetId} not found`);

    const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 1000));

    const exportPromise = (async () => {
      // Wrapper for padding and layout
      const wrapper = document.createElement("div");
      wrapper.style.padding = `${padding}px ${padding}px 0 ${padding}px`; // top + sides only
      wrapper.style.background = "#ffffff";
      wrapper.style.display = "flex";
      wrapper.style.justifyContent = "center";
      wrapper.style.alignItems = "flex-start";
      wrapper.style.minHeight = "100vh";

      const cloned = element.cloneNode(true) as HTMLElement;
      wrapper.appendChild(cloned);
      document.body.appendChild(wrapper);

      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(wrapper);

      // Auto orientation
      const isLandscape = canvas.width > canvas.height;
      const orientation = isLandscape ? "landscape" : "portrait";

      const pdf = new jsPDF(orientation, "mm", "a4");
      const pageWidth = orientation === "landscape" ? 297 : 210;
      const pageHeight = orientation === "landscape" ? 210 : 297;
      const margin = 10;

      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = margin;
      let heightLeft = imgHeight;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        margin,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          margin,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      const pdfBlob = pdf.output("blob");
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(pdfBlob);
      downloadLink.download = `${fileName}.pdf`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setTimeout(() => URL.revokeObjectURL(downloadLink.href), 1000);
    })();

    await Promise.all([minLoadingTime, exportPromise]);
  };

  return (
    <>
      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2 bg-[#DB5788] hover:bg-[#5bc3cd] text-white transition-colors duration-200"
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Preparing..." : "Download Report"}
      </Button>

      {/* Loading Dialog */}
      <Dialog open={isExporting} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-blue-600">
              Preparing Your Download
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-gray-600">Generating PDF Report...</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
