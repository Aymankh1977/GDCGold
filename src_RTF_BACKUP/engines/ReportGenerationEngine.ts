{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ \
  ReportData, \
  AnalysisResult, \
  ComparisonResult, \
  QuestionnaireResponse \
\} from '../types';\
import \{ GDC_REQUIREMENTS, GDC_STANDARDS \} from '../data/gdcStandards';\
import \{ v4 as uuidv4 \} from 'uuid';\
\
export class ReportGenerationEngine \{\
  generateReport(\
    analysis: AnalysisResult,\
    comparison?: ComparisonResult,\
    questionnaire?: QuestionnaireResponse[]\
  ): ReportData \{\
    return \{\
      id: uuidv4(),\
      title: `GDC Inspection Analysis Report - $\{analysis.documentName\}`,\
      generatedDate: new Date(),\
      documentName: analysis.documentName,\
      framework: 'GDC Standards for Education',\
      analysis,\
      comparison,\
      questionnaire\
    \};\
  \}\
\
  formatReportAsText(report: ReportData): string \{\
    let text = '';\
\
    // Header\
    text += '\uc0\u9552 '.repeat(80) + '\\n';\
    text += '                    DetEdTech - GDC Accreditation Analysis Report\\n';\
    text += '\uc0\u9552 '.repeat(80) + '\\n\\n';\
\
    // Report Info\
    text += `Report ID: $\{report.id\}\\n`;\
    text += `Generated: $\{report.generatedDate.toISOString()\}\\n`;\
    text += `Document: $\{report.documentName\}\\n`;\
    text += `Framework: $\{report.framework\}\\n\\n`;\
\
    // Executive Summary\
    text += '\uc0\u9472 '.repeat(80) + '\\n';\
    text += 'EXECUTIVE SUMMARY\\n';\
    text += '\uc0\u9472 '.repeat(80) + '\\n\\n';\
\
    const summary = report.analysis.summary;\
    text += `Overall Score: $\{report.analysis.overallScore.toFixed(1)\}%\\n\\n`;\
    text += `Requirements Met: $\{summary.met\}/$\{summary.totalRequirements\}\\n`;\
    text += `Requirements Partially Met: $\{summary.partiallyMet\}/$\{summary.totalRequirements\}\\n`;\
    text += `Requirements Not Met: $\{summary.notMet\}/$\{summary.totalRequirements\}\\n\\n`;\
\
    // Strengths\
    if (summary.strengths.length > 0) \{\
      text += 'STRENGTHS:\\n';\
      summary.strengths.forEach(s => text += `  \uc0\u10003  $\{s\}\\n`);\
      text += '\\n';\
    \}\
\
    // Areas for Improvement\
    if (summary.areasForImprovement.length > 0) \{\
      text += 'AREAS FOR IMPROVEMENT:\\n';\
      summary.areasForImprovement.forEach(a => text += `  \uc0\u9888  $\{a\}\\n`);\
      text += '\\n';\
    \}\
\
    // Critical Gaps\
    if (summary.criticalGaps.length > 0) \{\
      text += 'CRITICAL GAPS:\\n';\
      summary.criticalGaps.forEach(g => text += `  \uc0\u10007  $\{g\}\\n`);\
      text += '\\n';\
    \}\
\
    // Detailed Analysis by Standard\
    text += '\\n' + '\uc0\u9552 '.repeat(80) + '\\n';\
    text += 'DETAILED ANALYSIS BY STANDARD\\n';\
    text += '\uc0\u9552 '.repeat(80) + '\\n\\n';\
\
    for (const [standardId, standardInfo] of Object.entries(GDC_STANDARDS)) \{\
      const stdId = parseInt(standardId) as 1 | 2 | 3;\
      text += `\\n$\{'\uc0\u9472 '.repeat(80)\}\\n`;\
      text += `STANDARD $\{standardId\}: $\{standardInfo.name.toUpperCase()\}\\n`;\
      text += `$\{'\uc0\u9472 '.repeat(80)\}\\n`;\
      text += `$\{standardInfo.description\}\\n\\n`;\
\
      const standardReqs = report.analysis.requirements.filter(r => \{\
        const req = GDC_REQUIREMENTS.find(gr => gr.id === r.requirementId);\
        return req?.standard === stdId;\
      \});\
\
      for (const reqAnalysis of standardReqs) \{\
        const requirement = GDC_REQUIREMENTS.find(r => r.id === reqAnalysis.requirementId);\
        if (!requirement) continue;\
\
        const statusIcon = reqAnalysis.status === 'met' ? '\uc0\u10003 ' : \
                          reqAnalysis.status === 'partially_met' ? '\uc0\u9888 ' : '\u10007 ';\
        const statusText = reqAnalysis.status.replace('_', ' ').toUpperCase();\
\
        text += `\\nRequirement $\{requirement.id\}: $\{requirement.title\}\\n`;\
        text += `Status: $\{statusIcon\} $\{statusText\} (Confidence: $\{(reqAnalysis.confidence * 100).toFixed(0)\}%)\\n`;\
        text += `\\nDescription: $\{requirement.description\}\\n`;\
\
        if (reqAnalysis.evidence.length > 0) \{\
          text += '\\nEvidence Found:\\n';\
          reqAnalysis.evidence.slice(0, 3).forEach((e, i) => \{\
            text += `  $\{i + 1\}. "$\{e.text.substring(0, 200)\}..."\\n`;\
            text += `     Location: $\{e.location\}, Relevance: $\{(e.relevanceScore * 100).toFixed(0)\}%\\n`;\
          \});\
        \}\
\
        if (reqAnalysis.gaps.length > 0) \{\
          text += '\\nIdentified Gaps:\\n';\
          reqAnalysis.gaps.slice(0, 3).forEach(g => text += `  \'95 $\{g\}\\n`);\
        \}\
\
        if (reqAnalysis.recommendations.length > 0) \{\
          text += '\\nRecommendations:\\n';\
          reqAnalysis.recommendations.forEach(r => text += `  \uc0\u8594  $\{r\}\\n`);\
        \}\
      \}\
    \}\
\
    // Comparison Section (if available)\
    if (report.comparison) \{\
      text += '\\n\\n' + '\uc0\u9552 '.repeat(80) + '\\n';\
      text += 'COMPARISON WITH REFERENCE DOCUMENTS\\n';\
      text += '\uc0\u9552 '.repeat(80) + '\\n\\n';\
\
      text += `Reference Documents: $\{report.comparison.referenceDocuments.join(', ')\}\\n`;\
      text += `Alignment Score: $\{report.comparison.alignmentScore.toFixed(1)\}%\\n\\n`;\
\
      const belowReference = report.comparison.requirementComparisons.filter(\
        c => c.targetStatus !== 'met' && c.referenceStatus === 'met'\
      );\
\
      if (belowReference.length > 0) \{\
        text += 'Requirements Below Reference Standard:\\n';\
        belowReference.forEach(c => \{\
          const req = GDC_REQUIREMENTS.find(r => r.id === c.requirementId);\
          text += `  \'95 Requirement $\{c.requirementId\}: $\{req?.title\}\\n`;\
          text += `    Target: $\{c.targetStatus\}, Reference: $\{c.referenceStatus\}\\n`;\
          if (c.gaps.length > 0) \{\
            text += `    Gaps: $\{c.gaps.join('; ')\}\\n`;\
          \}\
        \});\
      \}\
    \}\
\
    // Footer\
    text += '\\n\\n' + '\uc0\u9552 '.repeat(80) + '\\n';\
    text += '                         Generated by DetEdTech Platform\\n';\
    text += '                    \'a9 DetEdTech - GDC Accreditation AI Assistant\\n';\
    text += '\uc0\u9552 '.repeat(80) + '\\n';\
\
    return text;\
  \}\
\
  formatReportAsHTML(report: ReportData): string \{\
    const statusColor = (status: string) => \{\
      switch (status) \{\
        case 'met': return '#22c55e';\
        case 'partially_met': return '#f59e0b';\
        case 'not_met': return '#ef4444';\
        default: return '#6b7280';\
      \}\
    \};\
\
    let html = `\
<!DOCTYPE html>\
<html>\
<head>\
  <meta charset="UTF-8">\
  <title>$\{report.title\}</title>\
  <style>\
    body \{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; \}\
    .header \{ background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; \}\
    .header h1 \{ margin: 0; font-size: 28px; \}\
    .header p \{ margin: 10px 0 0; opacity: 0.9; \}\
    .summary-cards \{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; \}\
    .card \{ background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); \}\
    .card h3 \{ margin: 0 0 10px; color: #374151; font-size: 14px; text-transform: uppercase; \}\
    .card .value \{ font-size: 36px; font-weight: bold; \}\
    .met \{ color: #22c55e; \}\
    .partial \{ color: #f59e0b; \}\
    .not-met \{ color: #ef4444; \}\
    .section \{ background: white; border-radius: 10px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); \}\
    .section h2 \{ color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; \}\
    .requirement \{ border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 15px 0; \}\
    .requirement-header \{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; \}\
    .status-badge \{ padding: 5px 15px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; \}\
    .evidence-item \{ background: #f9fafb; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 3px solid #3b82f6; \}\
    .gap-item \{ color: #ef4444; margin: 5px 0; \}\
    .recommendation \{ background: #ecfdf5; padding: 10px 15px; border-radius: 5px; margin: 5px 0; border-left: 3px solid #22c55e; \}\
    .footer \{ text-align: center; padding: 30px; color: #6b7280; border-top: 1px solid #e5e7eb; margin-top: 30px; \}\
  </style>\
</head>\
<body>\
  <div class="header">\
    <h1>DetEdTech - GDC Accreditation Analysis Report</h1>\
    <p>Document: $\{report.documentName\} | Generated: $\{report.generatedDate.toLocaleDateString()\}</p>\
  </div>\
\
  <div class="summary-cards">\
    <div class="card">\
      <h3>Overall Score</h3>\
      <div class="value" style="color: $\{report.analysis.overallScore >= 70 ? '#22c55e' : report.analysis.overallScore >= 50 ? '#f59e0b' : '#ef4444'\}">$\{report.analysis.overallScore.toFixed(1)\}%</div>\
    </div>\
    <div class="card">\
      <h3>Requirements Met</h3>\
      <div class="value met">$\{report.analysis.summary.met\}</div>\
    </div>\
    <div class="card">\
      <h3>Partially Met</h3>\
      <div class="value partial">$\{report.analysis.summary.partiallyMet\}</div>\
    </div>\
    <div class="card">\
      <h3>Not Met</h3>\
      <div class="value not-met">$\{report.analysis.summary.notMet\}</div>\
    </div>\
  </div>\
\
  <div class="section">\
    <h2>Executive Summary</h2>\
    $\{report.analysis.summary.strengths.length > 0 ? `\
      <h3 style="color: #22c55e;">Strengths</h3>\
      <ul>$\{report.analysis.summary.strengths.map(s => `<li>$\{s\}</li>`).join('')\}</ul>\
    ` : ''\}\
    $\{report.analysis.summary.areasForImprovement.length > 0 ? `\
      <h3 style="color: #f59e0b;">Areas for Improvement</h3>\
      <ul>$\{report.analysis.summary.areasForImprovement.map(a => `<li>$\{a\}</li>`).join('')\}</ul>\
    ` : ''\}\
    $\{report.analysis.summary.criticalGaps.length > 0 ? `\
      <h3 style="color: #ef4444;">Critical Gaps</h3>\
      <ul>$\{report.analysis.summary.criticalGaps.map(g => `<li>$\{g\}</li>`).join('')\}</ul>\
    ` : ''\}\
  </div>\
\
  $\{Object.entries(GDC_STANDARDS).map(([stdId, stdInfo]) => \{\
    const standardReqs = report.analysis.requirements.filter(r => \{\
      const req = GDC_REQUIREMENTS.find(gr => gr.id === r.requirementId);\
      return req?.standard === parseInt(stdId);\
    \});\
    \
    return `\
      <div class="section">\
        <h2>Standard $\{stdId\}: $\{stdInfo.name\}</h2>\
        <p style="color: #6b7280;">$\{stdInfo.description\}</p>\
        \
        $\{standardReqs.map(reqAnalysis => \{\
          const requirement = GDC_REQUIREMENTS.find(r => r.id === reqAnalysis.requirementId);\
          if (!requirement) return '';\
          \
          return `\
            <div class="requirement">\
              <div class="requirement-header">\
                <h3>Requirement $\{requirement.id\}: $\{requirement.title\}</h3>\
                <span class="status-badge" style="background: $\{statusColor(reqAnalysis.status)\}">\
                  $\{reqAnalysis.status.replace('_', ' ').toUpperCase()\}\
                </span>\
              </div>\
              <p><strong>Confidence:</strong> $\{(reqAnalysis.confidence * 100).toFixed(0)\}%</p>\
              <p>$\{requirement.description\}</p>\
              \
              $\{reqAnalysis.evidence.length > 0 ? `\
                <h4>Evidence Found</h4>\
                $\{reqAnalysis.evidence.slice(0, 3).map(e => `\
                  <div class="evidence-item">\
                    <p>"$\{e.text.substring(0, 300)\}..."</p>\
                    <small>Location: $\{e.location\} | Relevance: $\{(e.relevanceScore * 100).toFixed(0)\}%</small>\
                  </div>\
                `).join('')\}\
              ` : ''\}\
              \
              $\{reqAnalysis.gaps.length > 0 ? `\
                <h4>Identified Gaps</h4>\
                $\{reqAnalysis.gaps.map(g => `<p class="gap-item">\'95 $\{g\}</p>`).join('')\}\
              ` : ''\}\
              \
              $\{reqAnalysis.recommendations.length > 0 ? `\
                <h4>Recommendations</h4>\
                $\{reqAnalysis.recommendations.map(r => `<div class="recommendation">\uc0\u8594  $\{r\}</div>`).join('')\}\
              ` : ''\}\
            </div>\
          `;\
        \}).join('')\}\
      </div>\
    `;}