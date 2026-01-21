import { jsPDF } from 'jspdf';

export function generateQuestionnairePdf(input: any) {
  const pdf = new jsPDF();
  let y = 20;

  const write = (text: string, size = 10, style = "normal", color = [0, 0, 0]) => {
    pdf.setFontSize(size);
    pdf.setFont("helvetica", style);
    pdf.setTextColor(color[0], color[1], color[2]);
    const lines = pdf.splitTextToSize(text, 180);
    if (y + (lines.length * 6) > 275) { pdf.addPage(); y = 20; }
    pdf.text(lines, 14, y);
    y += (lines.length * (size / 2)) + 2;
  };

  write("Manchester BDS - PIQ Analysis Report", 16, "bold", [44, 62, 80]);
  write(`Analysis Date: ${new Date().toLocaleDateString()}`, 9);
  y += 5;

  // SECTION 1: EXTRACTION (Q1-Q5, Q7-Q10)
  write("Section 1: Administrative Extraction", 13, "bold", [41, 128, 185]);
  input.extractedFields.forEach((f: any) => {
    write(`${f.questionId}:`, 10, "bold");
    write(`Label: ${f.label.replace(f.questionId, '').replace(/^\s*[:.]\s*/, '').trim()}`, 9, "normal", [100, 100, 100]);
    write(`Value: ${f.value}`, 10, "normal", f.value === '(Not stated)' ? [200, 0, 0] : [0, 100, 0]);
    y += 2;
  });

  // SECTION 2: ANALYTICAL (Q6, Q11-Q15)
  pdf.addPage(); y = 20;
  write("Section 2: Analytical Question Review", 13, "bold", [41, 128, 185]);
  input.responses.forEach((r: any) => {
    write(`${r.questionId}: Provider Response`, 11, "bold");
    write(`Status: ${r.status.toUpperCase()}`, 9, "bold", [230, 126, 34]);
    write(r.originalAnswer || "(Not stated)", 9, "italic", [60, 60, 60]);
    write("Gold Standard Best Practice:", 9, "bold", [142, 68, 173]);
    write(r.goldStandard, 9, "normal", [142, 68, 173]);
    y += 5;
  });

  // SECTION 3: REQUIREMENTS (R1-R21)
  pdf.addPage(); y = 20;
  write("Section 3: GDC Requirements Analysis", 13, "bold", [41, 128, 185]);
  input.requirementAssessments.forEach((r: any) => {
    write(`${r.id}: Provider Narrative`, 11, "bold");
    write(r.currentTextSummary, 9, "normal");
    
    if (r.evidenceAnchors?.length) {
      write("Contextual Evidence Signals:", 9, "bold", [31, 71, 136]);
      r.evidenceAnchors.forEach((ev: any) => write(`> [${ev.sourceDocName}]: ${ev.signal}`, 8));
    }
    
    write("Gold Standard Best Practice:", 9, "bold", [142, 68, 173]);
    write(r.goldStandard, 9, "normal", [142, 68, 173]);
    y += 10;
  });

  pdf.save(`Manchester_Review_Report.pdf`);
}