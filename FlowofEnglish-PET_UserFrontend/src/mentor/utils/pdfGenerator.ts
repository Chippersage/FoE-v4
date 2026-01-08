import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PDFGeneratorProps {
  element: HTMLElement;
  user: {
    userName?: string;
    userId?: string;
    userEmail?: string;
  } | null;
  progress: {
    cohortName?: string;
  } | null;
  programId?: string;
}

export async function generatePDF({ element, user, progress, programId }: PDFGeneratorProps): Promise<void> {
  // Store original styles
  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  tempDiv.style.width = `${element.offsetWidth}px`;
  tempDiv.style.backgroundColor = '#ffffff';
  tempDiv.style.zIndex = '9999';
  
  const clone = element.cloneNode(true) as HTMLElement;
  
  const buttons = clone.querySelectorAll('button');
  buttons.forEach(button => button.remove());
  
  const tabs = clone.querySelector('.flex.border-b.mb-6');
  if (tabs) tabs.remove();
  
  const reportHeader = document.createElement('div');
  reportHeader.className = 'mb-6 pb-4 border-b-2 border-blue-600';
  reportHeader.innerHTML = `
    <h1 class="text-2xl font-bold text-blue-800 mb-2">Student Progress Report</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div>
        <p><strong>Student:</strong> ${user?.userName || 'N/A'}</p>
        <p><strong>Student ID:</strong> ${user?.userId || 'N/A'}</p>
        <p><strong>Email:</strong> ${user?.userEmail || 'Not provided'}</p>
      </div>
      
      <div class="student-info-grid">
        <div class="info-card">
          <h3>Student Information</h3>
          <p><span class="info-label">Full Name:</span> ${data.userName}</p>
          <p><span class="info-label">Student ID:</span> ${data.userId}</p>
          <p><span class="info-label">Email Address:</span> ${data.userEmail || 'Not provided'}</p>
          <p><span class="info-label">Phone Number:</span> ${data.userPhoneNumber || 'Not provided'}</p>
        </div>
        
        <div class="info-card">
          <h3>Program Details</h3>
          <p><span class="info-label">Cohort:</span> ${data.cohortName}</p>
          <p><span class="info-label">Program ID:</span> ${data.programId}</p>
          <p><span class="info-label">Enrollment Date:</span> ${data.joinedOn}</p>
          <p><span class="info-label">Last Active:</span> ${data.lastActive}</p>
        </div>
      </div>
      
      <div class="stats-summary">
        <h3>Progress Overview</h3>
        <div class="stats-grid">
          <div class="stat-box subconcept">
            <div class="stat-value">${data.completedSubconcepts}/${data.totalSubconcepts}</div>
            <div class="stat-label">CONCEPTS MASTERED</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 5px;">
              ${data.totalSubconcepts > 0 ? Math.round((data.completedSubconcepts / data.totalSubconcepts) * 100) : 0}% completion
            </div>
          </div>
          <div class="stat-box assignment">
            <div class="stat-value">${data.assignmentsCount.corrected}/${data.assignmentsCount.total}</div>
            <div class="stat-label">ASSIGNMENTS GRADED</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 5px;">
              ${data.assignmentsCount.total > 0 ? Math.round((data.assignmentsCount.corrected / data.assignmentsCount.total) * 100) : 0}% graded
            </div>
          </div>
          <div class="stat-box score">
            <div class="stat-value">${data.averageScore.toFixed(1)}/5</div>
            <div class="stat-label">AVERAGE SCORE</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 5px;">
              ${(data.averageScore * 20).toFixed(0)}% overall
            </div>
          </div>
        </div>
      </div>
      
      <h2 class="section-title">Skills Analysis</h2>
      
      ${radarChartSVG}
      
      <div class="skills-section">
        <h3>Skill Mastery Details</h3>
        <div style="margin-top: 25px;">
          ${data.scores.length > 0 ? data.scores.map((s, index) => {
            const percentage = s.total > 0 ? Math.round((s.count / s.total) * 100) : 0;
            const color = SKILL_COLORS[s.skill] || ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"][index % 5];
            return `
              <div class="skill-item">
                <div class="skill-header">
                  <span class="skill-name">${s.skill}</span>
                  <span class="skill-count">${s.count}/${s.total} activities</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${percentage}%; background: linear-gradient(90deg, ${color}, ${color}dd);"></div>
                </div>
                <div class="skill-details">
                  <span>Progress: ${percentage}%</span>
                  <span>${s.total - s.count} activities remaining</span>
                </div>
              </div>
            `;
          }).join('') : `
            <div style="text-align: center; padding: 50px; background: #f9fafb; border-radius: 12px;">
              <p style="color: #6b7280; font-size: 16px;">No skill mastery data available</p>
            </div>
          `}
        </div>
      </div>
      
      <h2 class="section-title">Assignments</h2>
      <div class="assignments-section">
        ${data.assignmentsData.length > 0 ? `
          <table class="assignments-table">
            <thead>
              <tr>
                <th>Assignment Name</th>
                <th>Stage</th>
                <th>Score</th>
                <th>Session</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.assignmentsData.map((assignment, index) => `
                <tr>
                  <td><strong>${assignment.assignmentName}</strong></td>
                  <td>${assignment.stage}</td>
                  <td><strong>${assignment.score}</strong></td>
                  <td>${assignment.session}</td>
                  <td>
                    <span class="status-badge ${assignment.status === 'Graded' ? 'status-corrected' : (assignment.status === 'Submitted' ? 'status-submitted' : 'status-pending')}">
                      ${assignment.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="padding: 15px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 13px;">
            Showing ${data.assignmentsData.length} assignments • 
            ${data.assignmentsCount.corrected} graded • 
            ${data.assignmentsCount.pending} pending review
          </div>
        ` : `
          <div style="text-align: center; padding: 60px; background: #f9fafb; border-radius: 12px; margin: 20px;">
            <p style="color: #6b7280; font-size: 16px;">No assignments data available</p>
          </div>
        `}
      </div>
      
      <h2 class="section-title">Recent Activity</h2>
      <div class="activity-section">
        ${data.recentActivity.length > 0 ? `
          <div class="activity-list">
            ${data.recentActivity.map((activity, index) => `
              <div class="activity-item">
                <div class="activity-content">
                  <div class="activity-title">${activity.title}</div>
                  <div class="activity-meta">
                    <span>Stage: ${activity.stage}</span>
                    <span>Unit: ${activity.unit}</span>
                    <span>Session: ${activity.session}</span>
                    <span>Date: ${activity.date}</span>
                  </div>
                </div>
                <div class="activity-score">
                  <div class="activity-score-value">${activity.score}</div>
                  <div class="activity-score-label">Score</div>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="margin-top: 20px; text-align: center; color: #64748b; font-size: 13px;">
            Showing ${data.recentActivity.length} most recent activities
          </div>
        ` : `
          <div style="text-align: center; padding: 60px; background: #f9fafb; border-radius: 12px; margin: 20px;">
            <p style="color: #6b7280; font-size: 16px;">No recent activity data available</p>
          </div>
        `}
      </div>
      
      <h2 class="section-title">Mentor Remarks & Feedback</h2>
      <div class="mentor-remarks-section">
        <div class="mentor-remarks-title">
          Mentor's Observations & Recommendations
        </div>
        <div class="mentor-remarks-display">
          ${data.mentorRemarks || 'No remarks provided. This section is for mentor feedback, observations, and recommendations for the student.'}
        </div>
      </div>
      
      <div class="report-footer">
        <p class="timestamp">
          Report generated on ${new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
        <p class="confidential">
          CONFIDENTIAL - This report contains sensitive student information
        </p>
        <p class="report-id">
          Report ID: ${data.userId}_${data.programId}_${new Date().getTime().toString(36).toUpperCase()}
        </p>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 1500);
        }
      </script>
    </body>
    </html>
  `;
};

export const downloadPDFReport = (
  elementRef: React.RefObject<HTMLDivElement>,
  data: PDFReportData,
  setLoading?: (loading: boolean) => void
) => {
  return new Promise<void>(async (resolve) => {
    if (!elementRef.current) {
      console.error("No element reference found");
      setLoading?.(false);
      return;
    }
    
    let loadedCount = 0;
    const totalImages = images.length;
    
    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) resolve();
    };
    
    Array.from(images).forEach(img => {
      if (img.complete) {
        loadedCount++;
      } else {
        img.addEventListener('load', onImageLoad);
        img.addEventListener('error', onImageLoad);
      }
    });
    
    if (loadedCount === totalImages) resolve();
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const canvas = await html2canvas(clone, { 
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    width: clone.offsetWidth,
    height: clone.scrollHeight,
    windowWidth: clone.offsetWidth,
    windowHeight: clone.scrollHeight
  });
  
  document.body.removeChild(tempDiv);
  document.body.style.overflow = originalOverflow;
  
  const imgData = canvas.toDataURL("image/png", 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  const contentWidth = pdfWidth - (margin * 2);
  const contentHeight = (canvas.height * contentWidth) / canvas.width;
  
  let heightLeft = contentHeight;
  
  pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
  heightLeft -= pdf.internal.pageSize.getHeight() - (margin * 2);
  
  while (heightLeft > 0) {
    const position = heightLeft - contentHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
    heightLeft -= pdf.internal.pageSize.getHeight() - (margin * 2);
  }
  
  pdf.save(`${(user?.userName || 'student')}_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}