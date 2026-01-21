/**
 * ReportGenerationEngine
 * ----------------------
 * Professional implementation with modern, high-end PDF styling and dynamic data integration.
 */

export interface GeneratedReport {
  documentName: string;
  generatedDate: Date;
  analysis: {
    overallCompliance: string;
    complianceScore: number;
    requirementResults: Array<{
      requirementId: number;
      status: 'met' | 'partially-met' | 'not-met';
      gaps: string[];
      recommendations: string[];
    }>;
  };
}

export default class ReportGenerationEngine {
  static generateHTML(report: GeneratedReport): string {
    const { analysis } = report;
    
    // Calculate summary stats
    const metCount = analysis.requirementResults.filter(r => r.status === 'met').length;
    const partialCount = analysis.requirementResults.filter(r => r.status === 'partially-met').length;
    const notMetCount = analysis.requirementResults.filter(r => r.status === 'not-met').length;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Accreditation Analysis Report - ${escapeHtml(report.documentName)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    :root {
      --primary: #0f172a;
      --accent: #3b82f6;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --bg-light: #f8fafc;
    }

    * { box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      line-height: 1.6;
      color: var(--text-main);
      background: white;
      margin: 0;
      padding: 0;
    }

    .page {
      max-width: 850px;
      margin: 0 auto;
      padding: 60px 50px;
    }

    /* Header Section */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid var(--primary);
      padding-bottom: 30px;
      margin-bottom: 40px;
    }

    .logo-area h1 {
      font-size: 28px;
      font-weight: 800;
      margin: 0;
      color: var(--primary);
      letter-spacing: -0.025em;
    }

    .logo-area p {
      font-size: 12px;
      font-weight: 600;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 4px 0 0 0;
    }

    .meta-area {
      text-align: right;
    }

    .meta-area p {
      font-size: 13px;
      margin: 2px 0;
      color: var(--text-muted);
    }

    /* Summary Dashboard */
    .summary-grid {
      display: grid;
      grid-template-cols: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 40px;
    }

    .stat-card {
      padding: 20px;
      background: var(--bg-light);
      border: 1px solid var(--border);
      border-radius: 16px;
      text-align: center;
    }

    .stat-card .value {
      font-size: 24px;
      font-weight: 800;
      display: block;
      color: var(--primary);
    }

    .stat-card .label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }

    /* Findings Table */
    .findings-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    .findings-table th {
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      padding: 12px 15px;
      border-bottom: 2px solid var(--border);
    }

    .findings-table td {
      padding: 15px;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
      vertical-align: top;
    }

    .status-pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .status-met { background: #dcfce7; color: #166534; }
    .status-partial { background: #fef3c7; color: #92400e; }
    .status-not { background: #fee2e2; color: #991b1b; }

    .gap-list, .rec-list {
      margin: 5px 0 0 0;
      padding-left: 15px;
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Footer */
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      text-align: center;
    }

    .footer p {
      font-size: 11px;
      color: var(--text-muted);
    }

    @media print {
      .page { padding: 0; width: 100%; }
      .stat-card { border: 1px solid #eee; }
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="header">
      <div class="logo-area">
        <h1>DetEdTech</h1>
        <p>GDC Accreditation AI Platform</p>
      </div>
      <div class="meta-area">
        <p><strong>Report ID:</strong> #DET-${Math.floor(Math.random() * 100000)}</p>
        <p><strong>Date:</strong> ${report.generatedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        <p><strong>Document:</strong> ${escapeHtml(report.documentName)}</p>
      </div>
    </header>

    <div class="summary-grid">
      <div class="stat-card" style="border-top: 4px solid var(--accent);">
        <span class="value">${analysis.complianceScore}%</span>
        <span class="label">Overall Score</span>
      </div>
      <div class="stat-card" style="border-top: 4px solid var(--success);">
        <span class="value">${metCount}</span>
        <span class="label">Met</span>
      </div>
      <div class="stat-card" style="border-top: 4px solid var(--warning);">
        <span class="value">${partialCount}</span>
        <span class="label">Partial</span>
      </div>
      <div class="stat-card" style="border-top: 4px solid var(--danger);">
        <span class="value">${notMetCount}</span>
        <span class="label">Not Met</span>
      </div>
    </div>

    <div class="section">
      <h2 style="font-size: 20px; margin-bottom: 20px;">Detailed Compliance Findings</h2>
      <table class="findings-table">
        <thead>
          <tr>
            <th style="width: 15%;">ID</th>
            <th style="width: 20%;">Status</th>
            <th style="width: 65%;">Gaps & Recommendations</th>
          </tr>
        </thead>
        <tbody>
          ${analysis.requirementResults.map(res => `
            <tr>
              <td style="font-weight: 700; color: var(--primary);">REQ-${res.requirementId}</td>
              <td>
                <span class="status-pill status-${res.status === 'met' ? 'met' : res.status === 'partially-met' ? 'partial' : 'not'}">
                  ${res.status.replace('-', ' ')}
                </span>
              </td>
              <td>
                ${res.gaps.length > 0 ? `
                  <div style="margin-bottom: 10px;">
                    <strong style="font-size: 11px; color: var(--danger); text-transform: uppercase;">Identified Gaps:</strong>
                    <ul class="gap-list">
                      ${res.gaps.map(gap => `<li>${escapeHtml(gap)}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                ${res.recommendations.length > 0 ? `
                  <div>
                    <strong style="font-size: 11px; color: var(--accent); text-transform: uppercase;">Recommendations:</strong>
                    <ul class="rec-list">
                      ${res.recommendations.map(rec => `<li>${escapeHtml(rec)}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                ${res.status === 'met' ? '<span style="color: var(--success); font-size: 12px;">✓ Full compliance verified.</span>' : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <footer class="footer">
      <p>
        Confidential Document • Generated by DetEdTech AI Platform • 
        © ${new Date().getFullYear()} DetEdTech. All rights reserved.
      </p>
    </footer>
  </div>
</body>
</html>
`;
  }

  static exportToPDF(report: GeneratedReport) {
    const html = this.generateHTML(report);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) return;

    win.onload = () => {
      win.focus();
      setTimeout(() => {
        win.print();
        URL.revokeObjectURL(url);
      }, 500);
    };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
