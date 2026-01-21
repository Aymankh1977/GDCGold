import React, { useEffect, useMemo, useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Info, Sparkles, Download } from 'lucide-react';
import { Card, CardHeader } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useDocumentStore } from '@/store/documentStore';
import { useAnalysisStore } from '@/store/analysisStore';
import { parseDocument } from '@/engines/document/parser';
import { analyzeQuestionnaire } from '@/engines/questionnaire/questionHandler';
import { generateQuestionnairePdf } from '@/engines/reports/QuestionnairePdfReport';
import type { Document, QuestionnaireResponse } from '@/types';

function looksLikeQuestionnaire(doc: Document): boolean {
  const t = (doc.extractedText || '').toLowerCase();
  if (!t) return false;
  const hasHeader = t.includes('pre-inspection questionnaire') || t.includes('pre inspection questionnaire');
  const hasManyQs = (t.match(/\bq\s*\d+\b/g) || []).length >= 5;
  return hasHeader || hasManyQs;
}

type TabKey = 'questions' | 'requirements';

const Questionnaire: React.FC = () => {
  const { documents, selectedDocumentId, getDocumentById, setSelectedDocument } = useDocumentStore() as any;
  const { addQuestionnaireAnalysis, questionnaireAnalyses, getQuestionnaireAnalysisByDocumentId } = useAnalysisStore() as any;

  const [activeTab, setActiveTab] = useState<TabKey>('questions');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [completeness, setCompleteness] = useState(0);

  const [extractedFields, setExtractedFields] = useState<any[]>([]);
  const [requirementAssessments, setRequirementAssessments] = useState<any[]>([]);

  const selectedDoc = selectedDocumentId ? getDocumentById(selectedDocumentId) : null;

  const questionnaireCandidates = useMemo(() => {
    return (documents || []).filter((doc: Document) => {
      if (!doc) return false;
      if (doc.category === 'pre-inspection-questionnaire') return true;
      return looksLikeQuestionnaire(doc);
    });
  }, [documents]);

  const isQuestionnaireSelected = !!selectedDoc && (
    selectedDoc.category === 'pre-inspection-questionnaire' || looksLikeQuestionnaire(selectedDoc)
  );

  const analyzeSelectedQuestionnaire = async () => {
    if (!selectedDoc || !isQuestionnaireSelected) return;

    setIsAnalyzing(true);
    try {
      // Evidence-first context: all uploaded docs EXCEPT the questionnaire
      const contextDocuments: Document[] = (documents || []).filter((d: Document) => d && d.id !== selectedDoc.id);

      const parsed = parseDocument(selectedDoc.extractedText || '');
      const analysis = analyzeQuestionnaire(selectedDoc, parsed, contextDocuments) as any;

      setResponses(analysis.responses || []);
      setCompleteness(analysis.overallCompleteness || 0);
      setExtractedFields(analysis.extractedFields || []);
      setRequirementAssessments(analysis.requirementAssessments || []);

      addQuestionnaireAnalysis(analysis);
    } catch (error) {
      console.error('Questionnaire analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!selectedDocumentId) {
      setResponses([]);
      setCompleteness(0);
      setExtractedFields([]);
      setRequirementAssessments([]);
      return;
    }

    const existing =
      (getQuestionnaireAnalysisByDocumentId && getQuestionnaireAnalysisByDocumentId(selectedDocumentId)) ||
      (questionnaireAnalyses && questionnaireAnalyses.find((qa: any) => qa.documentId === selectedDocumentId));

    if (existing) {
      setResponses(existing.responses || []);
      setCompleteness(existing.overallCompleteness || 0);
      setExtractedFields(existing.extractedFields || []);
      setRequirementAssessments(existing.requirementAssessments || []);
    } else {
      setResponses([]);
      setCompleteness(0);
      setExtractedFields([]);
      setRequirementAssessments([]);
    }
  }, [selectedDocumentId, questionnaireAnalyses, getQuestionnaireAnalysisByDocumentId]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'incomplete':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'needs-review':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const exportPdf = () => {
    try {
      if (!selectedDoc) return;
      generateQuestionnairePdf({
        documentName: selectedDoc.name,
        completeness,
        extractedFields,
        responses,
        requirementAssessments,
      });
    } catch (e) {
      console.error('PDF export failed:', e);
    }
  };

  const completeCount = responses.filter(r => r.status === 'complete').length;
  const needsReviewCount = responses.filter(r => r.status === 'needs-review').length;
  const incompleteCount = responses.filter(r => r.status === 'incomplete').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pre-Inspection Questionnaire</h1>
          <p className="text-gray-500 mt-1">
            Evidence-first review: administrative fields are extracted verbatim; other items receive cautious, evidence-anchored actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-gray-200"
            icon={<Download className="w-4 h-4" />}
            disabled={(responses.length === 0 && requirementAssessments.length === 0)}
            onClick={exportPdf}
          >
            Export PDF
          </Button>

          <Button
            onClick={analyzeSelectedQuestionnaire}
            disabled={!isQuestionnaireSelected || isAnalyzing}
            loading={isAnalyzing}
            className="rounded-xl shadow-lg shadow-primary-100"
            icon={<Sparkles className="w-4 h-4" />}
          >
            Run AI Analysis
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader title="Select Document" subtitle="Questionnaire candidates detected from uploaded files" />
            <div className="p-6 pt-0">
              {questionnaireCandidates.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 px-4">
                    No questionnaire-like documents detected yet. Upload the questionnaire PDF/Word in Documents.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questionnaireCandidates.map((doc: Document) => (
                    <div
                      key={doc.id}
                      className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer
                        ${selectedDocumentId === doc.id
                          ? 'border-primary-500 bg-primary-50/50 shadow-sm'
                          : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50/50'}`}
                      onClick={() => setSelectedDocument(doc.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl transition-colors ${selectedDocumentId === doc.id ? 'bg-white text-primary-600' : 'bg-gray-50 text-gray-400 group-hover:text-primary-500'}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate text-sm">{doc.name}</p>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-0.5">
                            Category: {doc.category?.replace(/-/g, ' ') || 'unknown'}
                          </p>
                        </div>
                      </div>
                      {selectedDocumentId === doc.id && <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {(responses.length > 0 || requirementAssessments.length > 0) && (
            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader title="Analysis Summary" subtitle="Combined completeness estimation (questions + requirements)" />
              <div className="p-6 pt-0 space-y-6">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-700">Overall Score</span>
                    <span className={`text-sm font-bold ${completeness >= 80 ? 'text-emerald-600' : completeness >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {Math.round(completeness)}%
                    </span>
                  </div>
                  <ProgressBar
                    progress={completeness}
                    className="h-2.5 rounded-full bg-gray-200"
                    color={completeness >= 80 ? 'success' : completeness >= 50 ? 'warning' : 'danger'}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-bold text-emerald-900">Questions Complete</span>
                    </div>
                    <span className="text-lg font-black text-emerald-700">{completeCount}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-bold text-amber-900">Needs Review</span>
                    </div>
                    <span className="text-lg font-black text-amber-700">{needsReviewCount}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-rose-50/50 border border-rose-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                      <span className="text-sm font-bold text-rose-900">Incomplete</span>
                    </div>
                    <span className="text-lg font-black text-rose-700">{incompleteCount}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-2xl p-4 leading-relaxed">
                  Evidence-first mode: outputs are cautious and should be verified against source documents.
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
            <button
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'questions' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('questions')}
            >
              Questions
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'requirements' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('requirements')}
            >
              Requirements (R1–R21)
            </button>
          </div>

          {activeTab === 'questions' && (
            <div className="space-y-6">
              <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader title="Administrative fields (extracted)" subtitle="Q1, Q2, Q3, Q4, Q7, Q10 extracted verbatim (no AI judgement)" />
                <div className="p-6 pt-0 space-y-3">
                  {extractedFields?.length ? (
                    extractedFields.map((f: any) => (
                      <div key={f.questionId} className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="text-sm font-black text-gray-900">{f.questionId} — {f.label}</div>
                          <span className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${getStatusStyles(f.status)}`}>
                            {String(f.status || '').replace('-', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {f.value}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">Run analysis to extract administrative fields.</div>
                  )}
                </div>
              </Card>

              {responses.length > 0 ? (
                <div className="space-y-4">
                  {responses.map((response, index) => (
                    <Card
                      key={`${response.questionId}-${index}`}
                      className="border-none shadow-sm bg-white rounded-3xl overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
                              {response.questionId}
                            </div>
                            <h3 className="text-lg font-black text-gray-900 mt-1">
                              {response.question}
                            </h3>
                          </div>
                          <span className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${getStatusStyles(response.status)}`}>
                            {response.status.replace('-', ' ')}
                          </span>
                        </div>

                        {response.originalAnswer && (
                          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 mb-4">
                            <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                              Current response (as-is)
                            </div>
                            <div className="text-sm text-gray-700 leading-relaxed">
                              {response.originalAnswer}
                            </div>
                          </div>
                        )}

                        {response.suggestedAnswer && (
                          <div className="p-4 rounded-2xl border border-primary-100 bg-primary-50/50 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-primary-600" />
                              <div className="text-sm font-black text-primary-900">
                                Structured improvement template (safe)
                              </div>
                            </div>
                            <pre className="whitespace-pre-wrap text-sm text-primary-900 leading-relaxed">
                              {response.suggestedAnswer}
                            </pre>
                          </div>
                        )}

                        {!!response.recommendations?.length && (
                          <div className="space-y-2">
                            <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">
                              Evidence-first recommendations (actionable)
                            </div>
                            <ul className="space-y-2">
                              {response.recommendations.map((rec, i) => (
                                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {!!response.evidenceReferences?.length && (
                          <div className="mt-4 p-4 rounded-2xl border border-gray-100 bg-gray-50">
                            <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                              Evidence signals detected (high-level)
                            </div>
                            <ul className="space-y-2">
                              {response.evidenceReferences.map((ev, i) => (
                                <li key={`${response.questionId}-ev-${i}`} className="text-sm text-gray-700">
                                  <span className="font-bold">{ev.source}:</span> {ev.text}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-24 h-24 bg-primary-50 rounded-3xl flex items-center justify-center mb-6">
                    <Sparkles className="w-12 h-12 text-primary-300" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">Ready for Questionnaire Analysis</h3>
                  <p className="text-gray-500 text-center max-w-sm mt-2 px-6">
                    Select a questionnaire and click “Run AI Analysis”.
                  </p>
                  <Button
                    onClick={analyzeSelectedQuestionnaire}
                    disabled={!isQuestionnaireSelected || isAnalyzing}
                    loading={isAnalyzing}
                    className="mt-8 rounded-xl px-8"
                  >
                    Run Analysis Now
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-4">
              {requirementAssessments?.length ? (
                requirementAssessments.map((r: any, idx: number) => (
                  <Card
                    key={`${r.id}-requirement-${idx}`}
                    className="border-none shadow-sm bg-white rounded-3xl overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            {r.id}
                          </div>
                          <h3 className="text-lg font-black text-gray-900 mt-1">
                            {r.title || `Requirement ${r.id.replace('R', '')}`}
                          </h3>
                        </div>
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${getStatusStyles(r.status)}`}>
                          {String(r.status || '').replace('-', ' ')}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 mb-4">
                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          What the questionnaire currently states (summary)
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {r.currentTextSummary || '(Not stated)'}
                        </div>
                      </div>

                      {!!r.gaps?.length && (
                        <div className="mb-4">
                          <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            Specific gaps (what is missing)
                          </div>
                          <ul className="space-y-2">
                            {r.gaps.map((g: string, i: number) => (
                              <li key={`${r.id}-gap-${i}`} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {!!r.actions?.length && (
                        <div className="mb-4 p-4 rounded-2xl border border-primary-100 bg-primary-50/50">
                          <div className="text-[11px] font-black text-primary-800 uppercase tracking-widest mb-2">
                            Actions to add to the questionnaire (concrete)
                          </div>
                          <ul className="space-y-2">
                            {r.actions.map((a: string, i: number) => (
                              <li key={`${r.id}-act-${i}`} className="text-sm text-primary-900 flex items-start gap-2">
                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-300 flex-shrink-0" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {!!r.evidenceAnchors?.length && (
                        <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
                          <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            Evidence signals from uploaded documents (high-level)
                          </div>
                          <ul className="space-y-2">
                            {r.evidenceAnchors.map((ev: any, i: number) => (
                              <li key={`${r.id}-ev-${i}`} className="text-sm text-gray-700">
                                <span className="font-bold">{ev.sourceDocName}:</span> {ev.signal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-24 h-24 bg-primary-50 rounded-3xl flex items-center justify-center mb-6">
                    <Sparkles className="w-12 h-12 text-primary-300" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">No requirement analysis yet</h3>
                  <p className="text-gray-500 text-center max-w-sm mt-2 px-6">
                    Run analysis. Requirements are extracted and checked against evidence documents.
                  </p>
                  <Button
                    onClick={analyzeSelectedQuestionnaire}
                    disabled={!isQuestionnaireSelected || isAnalyzing}
                    loading={isAnalyzing}
                    className="mt-8 rounded-xl px-8"
                  >
                    Run Analysis Now
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
