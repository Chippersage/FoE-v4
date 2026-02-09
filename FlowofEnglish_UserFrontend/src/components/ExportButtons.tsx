// Import necessary libraries for exports
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver/dist/FileSaver';
import PizZip from 'pizzip/dist/pizzip';
import Docxtemplater from 'docxtemplater';
import axios from 'axios';

// Helper function to process skill data
// Add these interfaces at the top of ExportButtons.tsx
interface SkillConcept {
  conceptName: string;
  totalMaxScore: number;
  userTotalScore: number;
  completedSubconcepts: number;
  totalSubconcepts: number;
  'conceptSkill-1'?: string;
  'conceptSkill-2'?: string;
}

interface ProcessedSubskill {
  name: string;
  score: number;
  concepts: Array<{ name: string; score: number }>;
}

interface ProcessedSkill {
  name: string;
  score: number;
  conceptCount: number;
  subskills: ProcessedSubskill[];
  userScore?: number;
  totalScore?: number;
 // subskills?: Record<string, any>;
}

// Update the processSkillData function with proper typing
const processSkillData = (concepts: SkillConcept[] | undefined): ProcessedSkill[] => {
  if (!concepts) return [];
  
  // Group by conceptSkill-1 and conceptSkill-2
  const skillGroups = concepts.reduce((acc: Record<string, any>, concept: SkillConcept) => {
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
    .filter((skill: any) => skill.name !== '')
    .map((skill: any) => ({
      name: skill.name,
      score: Math.round((skill.userScore / skill.totalScore) * 100) || 0,
      conceptCount: skill.conceptCount,
      subskills: Object.values(skill.subskills).map((subskill: any) => ({
        name: subskill.name,
        score: Math.round((subskill.userScore / subskill.totalScore) * 100) || 0,
        concepts: subskill.concepts
      }))
    }));
};

// Component for the export buttons
const ExportButtons = ({ componentRef, filename, exportType, userData = null,
  programId = null, allowedFormats = ['pdf', 'csv'], tableData = null, programName = null
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
  
  // Create a modal for mentor remarks
  const showRemarksModal = () => {
    return new Promise<{ skip: boolean; remarks: Record<string, string> | null }>((resolve, reject) => {
      // Create modal container
      const modalContainer = document.createElement('div');
      modalContainer.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modalContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Add Mentor Remarks (Optional)</h3>
            <p class="text-gray-600 mb-4">Add remarks for up to 3 lines about each learner. These will be included in the CSV export.</p>
            
            <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
              ${tableData.users.map((user: any, index: number) => `
                <div class="border border-gray-200 rounded p-3">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-medium text-gray-700">${user.userName} (${user.userId})</span>
                    <span class="text-sm text-gray-500">${user.completedSubconcepts}/${user.totalSubconcepts} activities completed</span>
                  </div>
                  <textarea 
                    id="remarks-${user.userId}"
                    class="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Enter remarks for ${user.userName} (optional)..."
                    maxlength="300"
                  ></textarea>
                  <div class="text-right text-xs text-gray-400 mt-1">
                    <span id="charCount-${user.userId}">0/300</span>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="flex justify-between mt-6">
              <button 
                id="skipRemarksBtn"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Skip Remarks
              </button>
              <div class="space-x-3">
                <button 
                  id="cancelBtn"
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  id="exportBtn"
                  class="px-4 py-2 bg-[#5bc3cd] text-white rounded hover:bg-[#4ba9b3]"
                >
                  Export with Remarks
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modalContainer);
      
      // Add character count functionality
      tableData.users.forEach((user: any) => {
        const textarea = document.getElementById(`remarks-${user.userId}`) as HTMLTextAreaElement;
        const charCount = document.getElementById(`charCount-${user.userId}`);
        
        if (textarea && charCount) {
          textarea.addEventListener('input', () => {
            charCount.textContent = `${textarea.value.length}/300`;
          });
        }
      });
      
      // Handle button clicks
      const skipRemarksBtn = document.getElementById('skipRemarksBtn');
      const cancelBtn = document.getElementById('cancelBtn');
      const exportBtn = document.getElementById('exportBtn');
      
      if (skipRemarksBtn) {
        skipRemarksBtn.onclick = () => {
          document.body.removeChild(modalContainer);
          resolve({ skip: true, remarks: null });
        };
      }
      
      if (cancelBtn) {
        cancelBtn.onclick = () => {
          document.body.removeChild(modalContainer);
          reject(new Error('Export cancelled'));
        };
      }
      
      if (exportBtn) {
        exportBtn.onclick = () => {
          const remarksData: Record<string, string> = {};
          tableData.users.forEach((user: any) => {
            const textarea = document.getElementById(`remarks-${user.userId}`) as HTMLTextAreaElement;
            if (textarea) {
              remarksData[user.userId] = textarea.value.trim();
            }
          });
          
          document.body.removeChild(modalContainer);
          resolve({ skip: false, remarks: remarksData });
        };
      }
    });
  };
  
  // Main export function
  const generateCSV = async (remarksData: Record<string, string> | null = null) => {
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
      
      // Define columns - add remarks column if remarks are provided
      const baseColumns = [
        { key: "userId", label: "Learner ID" },
        { key: "userName", label: "Learner Name" },
        { key: "programName", label: "Program Name" },
        { key: "modules", label: "Modules Completed" },
        { key: "sessions", label: "Sessions Completed" },
        { key: "activities", label: "Activities Completed" },
        { key: "assignments", label: "Assignments Submitted" },
        { key: "recentAttemptDate", label: "Recent Activity" },
        { key: "createdAt", label: "Enrolled On" },
        { key: "leaderboardScore", label: "Leaderboard Score" },
        { key: "status", label: "Status" },
      ];
      
      // Add remarks column if we have remarks data
      const columns = remarksData ? 
        [...baseColumns, { key: "mentorRemarks", label: "Mentor Remarks" }] : 
        baseColumns;
      
      // Get program name from tableData
      const programName = tableData.programName || tableData.programId || "Program";
      
      // Format data exactly like in the table
      const formatDateForCSV = (epoch: number) => {
        if (!epoch || epoch === 0) return "No Activity";
        try {
          const date = new Date(epoch * 1000);
          // Format as DD MMM YYYY to avoid Excel date parsing
          const day = date.getDate().toString().padStart(2, '0');
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const month = monthNames[date.getMonth()];
          const year = date.getFullYear();
          return `${day} ${month} ${year}`;
        } catch (e) {
          return "No Activity";
        }
      };
      
      // Create CSV header row
      let csvContent = `${columns.map(col => `"${col.label}"`).join(',')}\n`;
      
      // Sort users like in the table (by leaderboard score descending, ACTIVE first)
      const sortedUsers = [...tableData.users].sort((a: any, b: any) => {
        // ACTIVE users first
        if (a.status !== b.status) {
          return a.status === "ACTIVE" ? -1 : 1;
        }
        // Then by leaderboard score descending
        return (b.leaderboardScore || 0) - (a.leaderboardScore || 0);
      });
      
      // Add data rows
      sortedUsers.forEach((user: any) => {
        const row = columns.map(column => {
          let value: string | number;
          
          switch (column.key) {
            case "modules":
              // Use tab character at the beginning to prevent Excel date formatting
              value = `\t${user.completedStages ?? 0} / ${user.totalStages ?? 0}`;
              break;
              
            case "sessions":
              value = `\t${user.completedUnits ?? 0} / ${user.totalUnits ?? 0}`;
              break;
              
            case "activities":
              value = `\t${user.completedSubconcepts ?? 0} / ${user.totalSubconcepts ?? 0}`;
              break;
              
            case "assignments":
              value = `\t${user.completedAssignments ?? 0} / ${user.totalAssignments ?? 0}`;
              break;
              
            case "recentAttemptDate":
              // Check if user has any activity
              if (user.completedSubconcepts > 0 || user.recentAttemptDate) {
                value = formatDateForCSV(user.recentAttemptDate);
              } else {
                value = "No Activity";
              }
              break;
              
            case "createdAt":
              value = formatDateForCSV(user.createdAt);
              break;
              
            case "programName":
              value = programName;
              break;
              
            case "status":
              value = user.status || "ACTIVE";
              break;
              
            case "leaderboardScore":
              value = user.leaderboardScore || 0;
              break;
              
            case "mentorRemarks":
              // Get remarks from the remarksData object
              value = remarksData ? (remarksData[user.userId] || "") : "";
              break;
              
            default:
              value = user[column.key] || "";
          }
          
          // Always wrap in quotes and escape any existing quotes
          if (value === null || value === undefined) {
            return '""';
          }
          
          const stringValue = String(value);
          // Escape quotes and wrap in quotes
          return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(',');
        
        csvContent += `${row}\n`;
      });
      
      // Add timestamp to filename
      const timestamp = new Date().toISOString().split('T')[0];
      const exportFilename = remarksData ? 
        `${filename || 'learner_progress'}_with_remarks_${timestamp}.csv` :
        `${filename || 'learner_progress'}_${timestamp}.csv`;
      
      // Add UTF-8 BOM to handle special characters properly
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Use saveAs from file-saver for better compatibility
      saveAs(blob, exportFilename);
      
      // Remove loading spinner
      document.body.removeChild(loadingElement);
      
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Failed to generate CSV. Please try again.');
      
      // Ensure loading spinner is removed even on error
      const spinner = document.querySelector('.fixed.inset-0.bg-black');
      if (spinner) {
        spinner.remove();
      }
    }
  };
  
  // Show remarks modal first
  showRemarksModal()
    .then(({ skip, remarks }) => {
      if (skip) {
        // Export without remarks
        generateCSV();
      } else {
        // Export with remarks
        generateCSV(remarks);
      }
    })
    .catch(error => {
      if (error.message !== 'Export cancelled') {
        console.error('Error in remarks modal:', error);
      }
    });
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
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      
      // Get detailed user progress data
      const response = await axios.get(`${API_BASE_URL}/programs/${programId}/concepts/progress/${userData.userId}`);
      const detailedData = response.data;
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