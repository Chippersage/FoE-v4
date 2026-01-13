import { SKILL_COLORS } from "./skillMapper";

export type PDFReportData = {
  userName: string;
  userId: string;
  userEmail?: string;
  userPhoneNumber?: string;
  cohortName: string;
  programId: string;
  joinedOn: string;
  lastActive: string;
  completedSubconcepts: number;
  totalSubconcepts: number;
  assignmentsCount: {
    total: number;
    corrected: number;
    pending: number;
  };
  averageScore: number;
  concepts: Array<{ name: string; score: number; conceptCount: number }>;
  scores: Array<{ skill: string; count: number; total: number }>;
  assignmentsData: Array<{
    assignmentName: string;
    stage: string;
    score: string;
    session: string;
    status: string;
    submittedDate: string;
  }>;
  recentActivity: Array<{
    title: string;
    stage: string;
    unit: string;
    score: number;
    session: string;
    date: string;
  }>;
  mentorRemarks: string;
};

export const generateRadarChartSVG = (
  radarData: Array<{ name: string; score: number }>,
  width = 500,
  height = 400
): string => {
  if (!radarData || radarData.length === 0) {
    return `<div style="text-align: center; padding: 40px; background: #f9fafb; border-radius: 8px; margin: 20px 0;">
              <p style="color: #6b7280;">No radar chart data available</p>
            </div>`;
  }

  const skills = radarData.map(d => d.name);
  const scores = radarData.map(d => d.score);
  const maxScore = Math.max(...scores, 100);
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) * 0.7;
  const angleStep = (2 * Math.PI) / skills.length;
  
  const levels = [100, 75, 50, 25];
  const levelPolygons = levels.map(level => {
    const points = skills.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const levelRadius = radius * (level / 100);
      const x = centerX + levelRadius * Math.cos(angle);
      const y = centerY + levelRadius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
    return `<polygon points="${points}" fill="none" stroke="#e5e7eb" stroke-width="1" />`;
  }).join('\n');
  
  const axes = skills.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`;
  }).join('\n');
  
  const dataPoints = skills.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const scoreRadius = radius * (scores[i] / maxScore);
    const x = centerX + scoreRadius * Math.cos(angle);
    const y = centerY + scoreRadius * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');
  
  const skillLabels = skills.map((skill, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const labelRadius = radius * 1.15;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    
    let textAnchor = 'middle';
    if (Math.cos(angle) < -0.5) textAnchor = 'end';
    if (Math.cos(angle) > 0.5) textAnchor = 'start';
    
    const labelY = y + (Math.sin(angle) > 0 ? 15 : -5);
    
    return `<text x="${x}" y="${labelY}" text-anchor="${textAnchor}" font-size="12" font-weight="600" fill="#374151">${skill}</text>`;
  }).join('\n');
  
  const scoreLabels = skills.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const scoreRadius = radius * (scores[i] / maxScore);
    const x = centerX + scoreRadius * Math.cos(angle);
    const y = centerY + scoreRadius * Math.sin(angle);
    
    return `<circle cx="${x}" cy="${y}" r="4" fill="#3b82f6" />
            <text x="${x + 10}" y="${y + 4}" font-size="11" font-weight="600" fill="#3b82f6">${scores[i]}%</text>`;
  }).join('\n');

  return `
    <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
      <h3 style="color: #1e40af; font-size: 18px; font-weight: 700; margin-bottom: 15px; text-align: center;">
        Skills Proficiency Radar Chart
      </h3>
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="display: block; margin: 0 auto;">
        ${levelPolygons}
        ${axes}
        <polygon points="${dataPoints}" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" stroke-width="2" />
        ${scoreLabels}
        ${skillLabels}
        
        <g transform="translate(${width - 150}, 20)">
          <rect x="0" y="0" width="130" height="80" fill="white" stroke="#e5e7eb" stroke-width="1" rx="6" />
          <text x="65" y="20" text-anchor="middle" font-size="12" font-weight="600" fill="#374151">Score Levels</text>
          <g transform="translate(10, 35)">
            <rect width="12" height="12" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" stroke-width="1" />
            <text x="20" y="10" font-size="11" fill="#374151">Student Score</text>
          </g>
          <g transform="translate(10, 55)">
            <circle cx="6" cy="6" r="4" fill="#3b82f6" />
            <text x="20" y="8" font-size="11" fill="#374151">Score Points</text>
          </g>
        </g>
      </svg>
    </div>
  `;
};

export const generateReportHTML = (data: PDFReportData): string => {
  const radarChartSVG = generateRadarChartSVG(data.concepts);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${data.userName} - Progress Report</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        body {
          padding: 20px 40px;
          background: #ffffff;
          color: #1f2937;
          line-height: 1.6;
          font-size: 12pt;
        }
        
        @media print {
          @page {
            margin: 15mm;
            size: A4;
          }
          
          body {
            padding: 0;
            font-size: 11pt;
          }
          
          .page-break {
            page-break-before: always;
            margin-top: 30px;
          }
          
          .no-print {
            display: none !important;
          }
        }
        
        .report-header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 25px;
          border-bottom: 3px solid #2563eb;
        }
        
        .report-title {
          color: #1e40af;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }
        
        .report-subtitle {
          color: #475569;
          font-size: 18px;
          margin-bottom: 30px;
          font-weight: 500;
        }
        
        .student-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .info-card h3 {
          color: #1e40af;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
        }
        
        .info-card p {
          margin: 10px 0;
          font-size: 14px;
          color: #475569;
          display: flex;
        }
        
        .info-label {
          font-weight: 600;
          min-width: 140px;
          display: inline-block;
          color: #374151;
        }
        
        .stats-summary {
          background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
          border-radius: 16px;
          padding: 30px;
          margin: 40px 0;
          border: 2px solid #e0f2fe;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .stats-summary h3 {
          color: #1e40af;
          font-size: 24px;
          margin-bottom: 25px;
          text-align: center;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        
        .stat-box {
          background: white;
          padding: 25px 20px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: transform 0.2s ease;
        }
        
        .stat-box:hover {
          transform: translateY(-2px);
        }
        
        .stat-box.subconcept { border-top: 5px solid #8b5cf6; }
        .stat-box.assignment { border-top: 5px solid #f59e0b; }
        .stat-box.score { border-top: 5px solid #ef4444; }
        
        .stat-value {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 8px;
        }
        
        .subconcept .stat-value { color: #8b5cf6; }
        .assignment .stat-value { color: #f59e0b; }
        .score .stat-value { color: #ef4444; }
        
        .stat-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }
        
        .section-title {
          color: #1e40af;
          font-size: 24px;
          font-weight: 700;
          margin: 50px 0 25px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .skills-section {
          margin: 40px 0;
        }
        
        .skill-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }
        
        .skill-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .skill-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
        }
        
        .skill-count {
          font-weight: 700;
          color: #2563eb;
          font-size: 16px;
        }
        
        .progress-bar {
          height: 12px;
          background: #f1f5f9;
          border-radius: 6px;
          overflow: hidden;
          margin: 10px 0;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.3s ease;
        }
        
        .skill-details {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #6b7280;
          margin-top: 5px;
        }
        
        .assignments-section {
          margin: 50px 0;
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }
        
        .assignments-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        
        .assignments-table thead {
          background: #f3f4f6;
        }
        
        .assignments-table th {
          padding: 16px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          font-size: 14px;
        }
        
        .assignments-table td {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: middle;
        }
        
        .assignments-table tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .assignments-table tr:hover {
          background: #f0f9ff;
        }
        
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }
        
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-corrected { background: #d1fae5; color: #065f46; }
        .status-submitted { background: #dbeafe; color: #1e40af; }
        
        .activity-section {
          margin: 50px 0;
        }
        
        .activity-list {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
        }
        
        .activity-item {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .activity-item:last-child {
          border-bottom: none;
        }
        
        .activity-item:hover {
          background: #f9fafb;
        }
        
        .activity-content {
          flex: 1;
        }
        
        .activity-title {
          font-weight: 600;
          color: #1f2937;
          font-size: 15px;
          margin-bottom: 5px;
        }
        
        .activity-meta {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: #6b7280;
        }
        
        .activity-score {
          text-align: right;
          min-width: 100px;
        }
        
        .activity-score-value {
          font-size: 20px;
          font-weight: 700;
          color: #2563eb;
        }
        
        .activity-score-label {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }
        
        .mentor-remarks-section {
          margin: 50px 0;
          padding: 30px;
          background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
          border: 2px solid #bae6fd;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .mentor-remarks-title {
          color: #0369a1;
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .mentor-remarks-display {
          padding: 25px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
          white-space: pre-wrap;
          line-height: 1.8;
          min-height: 200px;
          font-size: 15px;
          color: #374151;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) inset;
        }
        
        .report-footer {
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 13px;
        }
        
        .timestamp {
          font-weight: 600;
          color: #475569;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .confidential {
          font-style: italic;
          color: #94a3b8;
          margin-top: 5px;
          font-size: 12px;
        }
        
        .report-id {
          margin-top: 15px;
          font-size: 11px;
          color: #cbd5e1;
        }
        
        .skill-chart-container {
          margin: 40px 0;
        }
      </style>
    </head>
    <body>
      <div class="report-header">
        <h1 class="report-title">Student Progress Report</h1>
        <p class="report-subtitle">Comprehensive Performance Analysis & Insights</p>
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
    
    setLoading?.(true);
    
    try {
      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const reportHTML = generateReportHTML(data);
      
      const printWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes');
      if (printWindow) {
        printWindow.document.write(reportHTML);
        printWindow.document.close();
        resolve();
      } else {
        throw new Error('Could not open print window. Please allow popups for this site.');
      }
      
    } catch (e) {
      console.error("Download report error:", e);
      alert("Unable to generate report. Please use the browser's print function (Ctrl+P or Cmd+P) on this page instead.");
    } finally {
      setLoading?.(false);
    }
  });
};