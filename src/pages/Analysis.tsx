import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Info,
  Lightbulb,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useDocumentStore } from '@/store/documentStore';
import { useAnalysisStore } from '@/store/analysisStore';
import { analyzeDocument, AnalysisContext } from '@/engines/analysis/analyzer';
import { evaluateResults } from '@/engines/analysis/evaluator';
import { GDC_STANDARDS } from '@/config/gdcStandards';
import { COMPLIANCE_COLORS } from '@/utils/constants';
import { ComplianceStatus, RequirementResult } from '@/types';

const Analysis: React.FC = () => {
  const { documents, selectedDocumentId, referenceDocumentIds, getDocumentById } = useDocumentStore();
  const { addAnalysis, analyses, isAnalyzing, setAnalyzing, analysisProgress, setAnalysisProgress } = useAnalysisStore();
  
  const [expandedStandards, setExpandedStandards] = useState<number[]>([1]);
  const [currentResults, setCurrentResults] = useState<RequirementResult[] | null>(null);

  const selectedDocument = selectedDocumentId ? getDocumentById(selectedDocumentId) : null;
  const existingAnalysis = selectedDocumentId 
    ? analyses.find(a => a.documentId === selectedDocumentId)
    : null;

  const runAnalysis = async () => {
    if (!selectedDocument) return;

    setAnalyzing(true);
    setAnalysisProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 5, 95));
      }, 150);

      const context: AnalysisContext = {
        document: selectedDocument,
        referenceDocuments: referenceDocumentIds
          .map(id => getDocumentById(id))
          .filter(Boolean) as typeof documents,
      };

      const results = analyzeDocument(context);
      setCurrentResults(results);

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      const analysisResult = evaluateResults(selectedDocument.id, results);
      addAnalysis(analysisResult);

    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleStandard = (standardId: number) => {
    setExpandedStandards(prev =>
      prev.includes(standardId)
        ? prev.filter(id => id !== standardId)
        : [...prev, standardId]
    );
  };

  const getStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
      case 'met':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'partially-met':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'not-met':
        return <XCircle className="w-5 h-5 text-rose-500" />;
    }
  };

  const getResultForRequirement = (reqId: number): RequirementResult | undefined => {
    const results = currentResults || existingAnalysis?.requirementResults;
    return results?.find(r => r.requirementId === reqId);
  };

  const calculateStandardProgress = (standardId: number): number => {
    const standard = GDC_STANDARDS.find(s => s.id === standardId);
    if (!standard) return 0;

    const results = currentResults || existingAnalysis?.requirementResults;
    if (!results) return 0;

    const standardResults = results.filter(r =>
      standard.requirements.some(req => req.id === r.requirementId)
    );

    if (standardResults.length === 0) return 0;

    const metCount = standardResults.filter(r => r.status === 'met').length;
    const partialCount = standardResults.filter(r => r.status === 'partially-met').length;
    
    return Math.round(((metCount + partialCount * 0.5) / standardResults.length) * 100);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">GDC Compliance Analysis</h1>
          <p className="text-gray-500 mt-1">
            Deep-dive evaluation against 21 GDC Standards for Education
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={runAnalysis}
            disabled={!selectedDocument || isAnalyzing}
            loading={isAnalyzing}
            className="rounded-xl shadow-lg shadow-primary-100 px-6"
            icon={<Sparkles className="w-4 h-4" />}
          >
            {isAnalyzing ? 'Analyzing...' : 'Start Full Analysis'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Context & Summary */}
        <div className="lg:col-span-1 space-y-8">
          {/* Selected Document Card */}
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader title="Analysis Context" />
            <div className="p-6 pt-0">
              {selectedDocument ? (
                <div className="space-y-4">
                  <div className="p-4 bg-primary-50/50 border border-primary-100 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-primary-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-gray-900 text-sm truncate">{selectedDocument.name}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <span>Category</span>
                        <span className="text-primary-600">{selectedDocument.category.replace(/-/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <span>References</span>
                        <span className="text-primary-600">{referenceDocumentIds.length} Files</span>
                      </div>
                    </div>
                  </div>
                  
                  {isAnalyzing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-primary-600">
                        <span>Processing...</span>
                        <span>{Math.round(analysisProgress)}%</span>
                      </div>
                      <ProgressBar 
                        progress={analysisProgress} 
                        className="h-1.5 rounded-full bg-gray-100"
                        color="primary"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Info className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-500 px-4">
                    No document selected for analysis.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Summary Stats */}
          {(currentResults || existingAnalysis) && (
            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader title="Compliance Score" />
              <div className="p-6 pt-0 space-y-4">
                {['met', 'partially-met', 'not-met'].map((status) => {
                  const results = currentResults || existingAnalysis?.requirementResults || [];
                  const count = results.filter(r => r.status === status).length;
                  const colors = COMPLIANCE_COLORS[status as ComplianceStatus];
                  
                  return (
                    <div key={status} className={`flex items-center justify-between p-4 rounded-2xl border ${colors.bg.replace('bg-', 'bg-').replace('/10', '/5')} ${colors.border}`}>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status as ComplianceStatus)}
                        <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                          {status.replace('-', ' ')}
                        </span>
                      </div>
                      <span className={`text-lg font-black ${colors.text}`}>{count}</span>
                    </div>
                  );
                })}
                
                <Button variant="outline" className="w-full rounded-xl mt-2 border-gray-200 text-gray-600" icon={<Download className="w-4 h-4" />}>
                  Export Full Report
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Main Content: Standards Breakdown */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-gray-900">Standards Breakdown</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <Filter className="w-3.5 h-3.5" />
                Filter
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {GDC_STANDARDS.map((standard) => {
              const isExpanded = expandedStandards.includes(standard.id);
              const progress = calculateStandardProgress(standard.id);
              
              return (
                <div key={standard.id} className="group">
                  <button
                    onClick={() => toggleStandard(standard.id)}
                    className={`w-full flex items-center justify-between p-5 bg-white border transition-all duration-300 rounded-3xl shadow-sm
                      ${isExpanded ? 'border-primary-200 ring-4 ring-primary-50/50' : 'border-gray-100 hover:border-primary-100'}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
                        ${isExpanded ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' : 'bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600'}`}>
                        <span className="text-xl font-black">
                          {standard.id}
                        </span>
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{standard.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {standard.requirements.length} Requirements
                          </span>
                          {(currentResults || existingAnalysis) && (
                            <>
                              <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${progress >= 80 ? 'text-emerald-600' : progress >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                                {progress}% Compliant
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {(currentResults || existingAnalysis) && (
                        <div className="hidden sm:block w-32">
                          <ProgressBar 
                            progress={progress}
                            className="h-1.5 rounded-full bg-gray-100"
                            color={progress >= 80 ? 'success' : progress >= 50 ? 'warning' : 'danger'}
                          />
                        </div>
                      )}
                      <div className={`p-2 rounded-xl transition-colors ${isExpanded ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-400'}`}>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 ml-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      {standard.requirements.map((req) => {
                        const result = getResultForRequirement(req.id);
                        const colors = result 
                          ? COMPLIANCE_COLORS[result.status]
                          : { bg: 'bg-gray-50/50', text: 'text-gray-500', border: 'border-gray-100' };

                        return (
                          <Card key={req.id} className={`border-none shadow-sm bg-white rounded-3xl overflow-hidden border-l-4 ${result ? colors.border.replace('border-', 'border-l-') : 'border-l-gray-200'}`}>
                            <div className="p-6">
                              <div className="flex items-start justify-between gap-4 mb-6">
                                <div className="flex items-start gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm border transition-colors
                                    ${result ? `${colors.bg} ${colors.text} ${colors.border}` : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                    {req.id}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900 leading-tight">
                                      {req.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                      {req.description}
                                    </p>
                                  </div>
                                </div>
                                {result && (
                                  <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border flex-shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}>
                                      {result.status.replace('-', ' ')}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                      {Math.round(result.confidenceScore * 100)}% Match
                                    </span>
                                  </div>
                                )}
                              </div>

                              {result && (
                                <div className="space-y-6 pt-6 border-t border-gray-50">
                                  {/* Evidence Section */}
                                  {result.evidence.length > 0 && (
                                    <div className="relative pl-4 border-l-2 border-emerald-100">
                                      <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Evidence Found
                                      </p>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {result.evidence.slice(0, 2).map((ev) => (
                                          <div key={ev.id} className="p-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-xs text-emerald-800 italic leading-relaxed">
                                            "{ev.text.slice(0, 150)}..."
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Gaps & Recommendations */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {result.gaps.length > 0 && (
                                      <div className="relative pl-4 border-l-2 border-rose-100">
                                        <p className="text-[11px] font-bold text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                          <AlertTriangle className="w-3.5 h-3.5" />
                                          Identified Gaps
                                        </p>
                                        <ul className="space-y-2">
                                          {result.gaps.map((gap, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                              <div className="mt-1.5 w-1 h-1 rounded-full bg-rose-400 flex-shrink-0"></div>
                                              {gap}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {result.recommendations.length > 0 && (
                                      <div className="relative pl-4 border-l-2 border-amber-100">
                                        <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                          <Lightbulb className="w-3.5 h-3.5" />
                                          Recommendations
                                        </p>
                                        <ul className="space-y-2">
                                          {result.recommendations.map((rec, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                              <div className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 flex-shrink-0"></div>
                                              {rec}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
