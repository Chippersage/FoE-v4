import jsPDF from "jspdf";
import img from "/images/certificate_template.jpg";
import "../assets/fonts/Parisienne-Regular-normal.js";

interface GenerateCertificateProps {
  userName?: string;
  programName?: string;
  cohortEndDate?: string;
  cohortStartDate?: string;
}

export const generateCertificate = async ({
  userName = "Atul Kumar",
  programName = "flow of english",
  cohortStartDate = "Jan, 2024",
  cohortEndDate = "Dec, 2025",
}: GenerateCertificateProps): Promise<void> => {
  const image = new Image();
  image.src = img;

  image.onload = () => {
    const imgWidth = image.width;
    const imgHeight = image.height;

    // Convert pixel dimensions to mm
    const mmPerInch = 25.4;
    const dpi = 96; // Assume 96 DPI
    const pdfWidth = (imgWidth / dpi) * mmPerInch + 10; // Add 10mm margin
    const pdfHeight = (imgHeight / dpi) * mmPerInch + 10; // Add 10mm margin

    const doc = new jsPDF({
      orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
      unit: "mm",
      format: [pdfWidth, pdfHeight],
    });

    // Calculate image position to center it within the PDF
    const imgX = (pdfWidth - (imgWidth / dpi) * mmPerInch) / 2;
    const imgY = (pdfHeight - (imgHeight / dpi) * mmPerInch) / 2;

    // Add background image
    doc.addImage(
      img,
      "PNG",
      imgX,
      imgY,
      (imgWidth / dpi) * mmPerInch,
      (imgHeight / dpi) * mmPerInch
    );

    // Add recipient name
    doc.setFontSize(50);
    doc.setFont("Parisienne-Regular");
    doc.text(
      userName,
      220,
      170,
      { align: "center" }
    );

    // Add course name
    doc.setFontSize(36);
    doc.text(programName, 220, 210, { align: "center" });

    // Add cohort dates
    doc.setFontSize(20);
    doc.setFont("helvetica");
    doc.text(
      `${cohortStartDate} - ${cohortEndDate}`,
      235,
      223,
      { align: "center" }
    );

    // Save the PDF
    doc.save(`${userName}-${programName}.pdf`);
  };

  image.onerror = () => {
    console.error("Failed to load the image.");
  };
};
