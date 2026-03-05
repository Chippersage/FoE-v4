import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFOptions {
  learnerName: string;
  programName: string;
}

export const generateReportPDF = async (options: PDFOptions): Promise<void> => {
  try {
    console.log('🔄 Starting PDF generation...');
    
    // Create a hidden container for PDF
    const pdfContainer = document.createElement('div');
    pdfContainer.id = 'pdf-report-container';
    pdfContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      background: white;
      z-index: 9999;
      visibility: hidden;
      font-family: Arial, sans-serif;
      color: black;
    `;
    document.body.appendChild(pdfContainer);
    
    // 1. HEADER SECTION
    const header = document.getElementById('pdf-header');
    if (header) {
      const headerClone = header.cloneNode(true) as HTMLElement;
      headerClone.style.cssText = `
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 15px;
        margin-bottom: 20px;
      `;
      pdfContainer.appendChild(headerClone);
    }
    
    // 2. OVERVIEW METRICS (Cards)
    const overview = document.getElementById('pdf-overview');
    if (overview) {
      const overviewClone = overview.cloneNode(true) as HTMLElement;
      overviewClone.style.cssText = `
        margin-bottom: 25px;
      `;
      // Remove hover effects
      overviewClone.querySelectorAll('.hover\\:shadow-md, .hover\\:border-blue-300').forEach(el => {
        el.classList.remove('hover:shadow-md', 'hover:border-blue-300');
      });
      pdfContainer.appendChild(overviewClone);
    }
    
    // 3. SKILLS SECTION (Radar + Breakdown)
    const skills = document.getElementById('pdf-skills');
    if (skills) {
      const skillsClone = skills.cloneNode(true) as HTMLElement;
      skillsClone.style.cssText = `
        margin-bottom: 25px;
      `;
      
      // Fix height constraints for PDF
      skillsClone.querySelectorAll('.h-\\[520px\\]').forEach(el => {
        (el as HTMLElement).style.height = 'auto';
        (el as HTMLElement).style.minHeight = '300px';
      });
      
      pdfContainer.appendChild(skillsClone);
    }
    
    // 4. ATTEMPTS & REMARKS
    const attempts = document.getElementById('pdf-attempts');
    if (attempts) {
      const attemptsClone = attempts.cloneNode(true) as HTMLElement;
      attemptsClone.style.cssText = `
        margin-bottom: 25px;
      `;
      
      // Remove grid layout for PDF (show as blocks)
      attemptsClone.querySelectorAll('.grid').forEach(el => {
        (el as HTMLElement).style.display = 'block';
      });
      
      // Fix heights
      attemptsClone.querySelectorAll('.h-\\[520px\\]').forEach(el => {
        (el as HTMLElement).style.height = 'auto';
        (el as HTMLElement).style.minHeight = '200px';
      });
      
      pdfContainer.appendChild(attemptsClone);
    }
    
    // 5. ASSIGNMENTS
    const assignments = document.getElementById('pdf-assignments');
    if (assignments) {
      const assignmentsClone = assignments.cloneNode(true) as HTMLElement;
      
      // Remove pagination for PDF
      assignmentsClone.querySelectorAll('.pagination, .react-paginate, [class*="pagination"]').forEach(el => {
        el.remove();
      });
      
      // Show all table rows
      assignmentsClone.querySelectorAll('tbody tr').forEach((row, index) => {
        (row as HTMLElement).style.display = 'table-row';
      });
      
      pdfContainer.appendChild(assignmentsClone);
    }
    
    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // CAPTURE AND CREATE PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    
    // Show the container temporarily
    pdfContainer.style.visibility = 'visible';
    
    // Capture the entire container
    const canvas = await html2canvas(pdfContainer, {
      scale: 2, // High quality
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });
    
    // Hide container
    pdfContainer.style.visibility = 'hidden';
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add to PDF
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    
    // Clean up
    document.body.removeChild(pdfContainer);
    
    // Save PDF
    const fileName = `${options.learnerName}_${options.programName}_report_${new Date().toISOString().split('T')[0]}.pdf`
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    
    pdf.save(fileName);
    
    console.log('✅ PDF generated successfully!');
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    
    // Clean up on error
    const container = document.getElementById('pdf-report-container');
    if (container) {
      document.body.removeChild(container);
    }
    
    // Show user-friendly error
    alert('Failed to generate PDF. Please try again or contact support.');
  }
};