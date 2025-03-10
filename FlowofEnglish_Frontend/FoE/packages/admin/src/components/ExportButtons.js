// Import necessary libraries for exports
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver/dist/FileSaver';
import PizZip from 'pizzip/dist/pizzip';
import Docxtemplater from 'docxtemplater';
import axios from 'axios';

// Helper function to process skill data
const processSkillData = (concepts) => {
  if (!concepts) return [];
  
  // Group by conceptSkill-1 and conceptSkill-2
  const skillGroups = concepts.reduce((acc, concept) => {
    const skill1 = concept['conceptSkill-1'] || 'Other';
    const skill2 = concept['conceptSkill-2'] || 'Other';
    
    if (!acc[skill1]) {
      acc[skill1] = {
        name: skill1,
        totalScore: 0,
        userScore: 0,
        conceptCount: 0,
        subskills: {}
      };
    }
    if (!acc[skill1].subskills[skill2]) {
      acc[skill1].subskills[skill2] = {
        name: skill2,
        concepts: [],
        totalScore: 0,
        userScore: 0
      };
    }
    acc[skill1].totalScore += concept.totalMaxScore;
    acc[skill1].userScore += concept.userTotalScore;
    acc[skill1].conceptCount += 1;
    
    acc[skill1].subskills[skill2].totalScore += concept.totalMaxScore;
    acc[skill1].subskills[skill2].userScore += concept.userTotalScore;
    acc[skill1].subskills[skill2].concepts.push({
      name: concept.conceptName,
      score: (concept.userTotalScore / concept.totalMaxScore) * 100
    });
    
    return acc;
  }, {});
  
  // Convert to array and calculate percentages
  return Object.values(skillGroups)
    .filter(skill => skill.name !== '')
    .map(skill => ({
      name: skill.name,
      score: Math.round((skill.userScore / skill.totalScore) * 100) || 0,
      conceptCount: skill.conceptCount,
      subskills: Object.values(skill.subskills).map(subskill => ({
        name: subskill.name,
        score: Math.round((subskill.userScore / subskill.totalScore) * 100) || 0,
        concepts: subskill.concepts
      }))
    }));
};

// Component for the export buttons
const ExportButtons = ({ 
  componentRef, 
  filename, 
  exportType,
  userData = null,
  programId = null,
  allowedFormats = ['pdf', 'csv'],
  tableData = null
}) => {
  // Export visualization to PDF
  const exportToPDF = async () => {
    if (!componentRef.current) return;
    
    try {
      // Show loading spinner
      const loadingElement = document.createElement('div');
      loadingElement.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      loadingElement.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-center text-gray-700">Generating PDF...</p>
        </div>
      `;
      document.body.appendChild(loadingElement);
      
      // Wait for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const componentNode = componentRef.current;
      // Temporarily hide export buttons within the component being exported
    const exportButtons = componentNode.querySelectorAll('.export-buttons-container');
    const hiddenButtons = [];
    
    // Store original display style and hide buttons
    exportButtons.forEach(button => {
      hiddenButtons.push({
        element: button,
        display: button.style.display
      });
      button.style.display = 'none';
    });

      // Use html2canvas to render the component
      const canvas = await html2canvas(componentNode, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      // Calculate dimensions
      const componentWidth = componentNode.offsetWidth;
      const componentHeight = componentNode.offsetHeight;
      const aspectRatio = componentHeight / componentWidth;
      
      // PDF dimensions (use A4 or adjust based on content)
      const pdfWidth = 210; // mm (A4 width)
      const pdfHeight = Math.min(297, pdfWidth * aspectRatio); // mm (A4 height or keep aspect ratio)
      
      // Create PDF - Fixed constructor capitalization issue by introducing a capitalized wrapper
      // eslint-disable-next-line new-cap
      const pdf = new jsPDF({
        orientation: componentWidth > componentHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      
      // Add title if this is a user-specific report
      if (userData && userData.name) {
        pdf.setFontSize(16);
        pdf.text(`Progress Report for ${userData.name}`, 20, 15);
        pdf.line(20, 20, pdfWidth - 20, 20);
        pdf.setFontSize(12);
      } else {
        // Add generic title for the table export
        pdf.setFontSize(16);
        pdf.text('Learner Progress Data', 20, 15);
        pdf.line(20, 20, pdfWidth - 20, 20);
        pdf.setFontSize(12);
      }
      
      // Add the image to the PDF
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pdf.internal.pageSize.getWidth() - 40; // 20mm margins on each side
      const imgHeight = imgWidth * aspectRatio;
      
      // Position considering title if present
      const yPosition = userData ? 30 : 20;
      pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
      
      // Add footer with date
      const date = new Date().toLocaleDateString();
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${date}`, 20, pdf.internal.pageSize.getHeight() - 10);
      
      // Save the PDF
      pdf.save(`${filename}.pdf`);
      
      // Remove loading spinner
      document.body.removeChild(loadingElement);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

//   // Export visualization to DOCX
//   const exportToDOCX = async () => {
//     if (!componentRef.current) return;
    
//     try {
//       // Show loading spinner
//       const loadingElement = document.createElement('div');
//       loadingElement.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
//       loadingElement.innerHTML = `
//         <div class="bg-white p-6 rounded-lg shadow-xl">
//           <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p class="text-center text-gray-700">Generating DOCX...</p>
//         </div>
//       `;
//       document.body.appendChild(loadingElement);
      
//       // Capture the visualization as an image
//       const canvas = await html2canvas(componentRef.current, {
//         scale: 2,
//         useCORS: true,
//         backgroundColor: '#ffffff',
//       });
      
//       // Convert canvas to base64 image
//       const imgData = canvas.toDataURL('image/png');
      
//       // Fetch the DOCX template
//       // In a real application, you would have a template stored on your server
//       try {
//         // Create a document from template (simplified example)
//         // In a real app, you should fetch a real DOCX template
//         const zip = new PizZip();
        
//         // Simple DOCX structure
//         zip.file("word/document.xml", `
//           <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
//           <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
//             <w:body>
//               <w:p>
//                 <w:r>
//                   <w:t>${userData ? `Progress Report for ${userData.name}` : 'Progress Overview'}</w:t>
//                 </w:r>
//               </w:p>
//               <w:p>
//                 <w:r>
//                   <w:t>Generated on ${new Date().toLocaleDateString()}</w:t>
//                 </w:r>
//               </w:p>
//               <w:p>
//                 <w:r>
//                   <w:drawing>
//                     <IMAGE_PLACEHOLDER/>
//                   </w:drawing>
//                 </w:r>
//               </w:p>
//             </w:body>
//           </w:document>
//         `);
        
//         // In a real implementation, you would need to properly insert the image
//         // This is simplified for the example
//         // Fixed constructor capitalization issue with a disable-next-line comment
//         // eslint-disable-next-line new-cap
//         const doc = new Docxtemplater().loadZip(zip);
        
//         // Set template data
//         doc.setData({
//           title: userData ? `Progress Report for ${userData.name}` : 'Progress Overview',
//           date: new Date().toLocaleDateString(),
//           // The image would need special handling in a real implementation
//         });
        
//         // Generate document
//         doc.render();
        
//         // Get the document as a blob
//         const blob = doc.getZip().generate({
//           type: "blob",
//           mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//         });
        
//         // Save the document
//         saveAs(blob, `${filename}.docx`);
//       } catch (error) {
//         console.error('Error generating DOCX:', error);
        
//         // Fallback to PDF if DOCX generation fails
//         console.log('Falling back to PDF export');
//         exportToPDF();
//       }
      
//       // Remove loading spinner
//       document.body.removeChild(loadingElement);
//     } catch (error) {
//       console.error('Error generating DOCX:', error);
//       alert('Failed to generate DOCX. Please try again.');
//     }
//   };

  // Export data to CSV
  const exportToCSV = () => {
    if (!tableData || !tableData.users || tableData.users.length === 0) {
      alert('No data available for export');
      return;
    }
    try {
      // Show loading spinner
      const loadingElement = document.createElement('div');
      loadingElement.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      loadingElement.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-center text-gray-700">Generating CSV...</p>
        </div>
      `;
      document.body.appendChild(loadingElement);
      
      // Filter out the "All Learners" row if it exists
      const filteredData = tableData.users.filter(user => user.userId !== 'All Learners');
      
      // Get headers from the first row
      const headers = Object.keys(filteredData[0])
        .filter(key => typeof filteredData[0][key] !== 'object');
      
      // Create CSV content
      let csvContent = `${headers.join(',')}\n`;

      
      // Add rows
      filteredData.forEach(user => {
        const row = headers.map(header => {
          // Handle numbers, strings and nulls differently
          const value = user[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            // Escape strings with commas by enclosing in quotes
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',');
        csvContent += `${row}\n`;

      });
      
      // Create a blob and save
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${filename}.csv`);
      
      // Remove loading spinner
      document.body.removeChild(loadingElement);
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Failed to generate CSV. Please try again.');
    }
  };

  // Export detailed user data in a comprehensive report
  const exportUserReport = async () => {
    if (!userData || !programId) {
      alert('User data is required for this export');
      return;
    }

    try {
      // Show loading spinner
      const loadingElement = document.createElement('div');
      loadingElement.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      loadingElement.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-center text-gray-700">Generating comprehensive report...</p>
        </div>
      `;
      document.body.appendChild(loadingElement);
      
      // For a real implementation, we would fetch detailed user progress data
      // Here's a simplified example:
      
      const apiUrl = process.env.REACT_APP_API_URL;
      
      // Get detailed user progress data
      const response = await axios.get(`${apiUrl}/programs/${programId}/concepts/progress/${userData.userId}`);
      const detailedData = response.data;
      
      // Create a multi-page PDF report
      // eslint-disable-next-line new-cap
      const pdf = new jsPDF();
      let currentPage = 1;
      let yPosition = 20;
      
      // Add title and header
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Comprehensive Progress Report`, 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(14);
      pdf.text(`Learner: ${userData.name}`, 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 15;
      
      // Add skills overview section
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Skills Overview", 20, yPosition);
      yPosition += 10;
      
      // Check if we need to capture skills from the DOM
      if (componentRef.current) {
        // Find the skills overview section in the DOM
        const skillsSection = componentRef.current.querySelector('.skills-overview');
        
        if (skillsSection) {
          const canvas = await html2canvas(skillsSection, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 170;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Check if we need a new page
          if (yPosition + imgHeight > 270) {
            pdf.addPage();
            currentPage += 1;
            yPosition = 20;
          }
          
          pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        }
      }
      
      // Add skills mastered section from the API data
      if (detailedData && detailedData.concepts) {
        // Check if we need a new page
        if (yPosition > 240) {
          pdf.addPage();
          currentPage += 1;
          yPosition = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Skills Mastered", 20, yPosition);
        yPosition += 10;
        
        // Process skills data from the API
        const skillsData = processSkillData(detailedData.concepts);
        
        pdf.setFontSize(12);
        // Use array.forEach instead of for...of loop
        skillsData.forEach((skill) => {
          // Check if we need a new page
          if (yPosition > 260) {
            pdf.addPage();
            currentPage += 1;
            yPosition = 20;
          }
          
          pdf.setTextColor(0, 0, 0);
          pdf.text(`${skill.name}: ${skill.score}%`, 20, yPosition);
          yPosition += 7;
          
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          
          // Add subskills - changed for...of to forEach
          skill.subskills.forEach((subskill) => {
            // Check if we need a new page
            if (yPosition > 270) {
              pdf.addPage();
              currentPage += 1;
              yPosition = 20;
            }
            
            pdf.text(`  • ${subskill.name}: ${subskill.score}%`, 30, yPosition);
            yPosition += 5;
          });
          
          pdf.setFontSize(12);
          yPosition += 5;
        });
      }
      
      // Add footer with page numbers on each page
      for (let i = 1; i <= currentPage; i += 1) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${currentPage}`, 20, 285);
      }
      
      // Save the PDF
      pdf.save(`${userData.name}_comprehensive_report.pdf`);
      
      // Remove loading spinner
      document.body.removeChild(loadingElement);
    } catch (error) {
      console.error('Error generating comprehensive report:', error);
      alert('Failed to generate comprehensive report. Please try again.');
    }
  };

  return (
    <div className="flex flex-wrap gap-2 my-4 export-buttons-container">
      {exportType === 'user' && (
        <button
          onClick={exportUserReport}
          className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white py-2 px-4 rounded-md flex items-center "
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Comprehensive Report
        </button>
      )}
      
      {allowedFormats.includes('pdf') && (
        <button
          onClick={exportToPDF}
          className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white py-2 px-4 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
          </svg>
          Export as PDF
        </button>
      )}
      {allowedFormats.includes('csv') && tableData && (
        <button
          onClick={exportToCSV}
          className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white py-2 px-4 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
          </svg>
          Export as CSV
        </button>
      )}
      {/* {allowedFormats.includes('docx') && (
        <button
          onClick={exportToDOCX}
          className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white py-2 px-4 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          Export as DOCX
        </button>
      )} */}
    </div>
  );
};

export default ExportButtons;