import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useDocumentStore } from '@/store/documentStore';
import { useAnalysisStore } from '@/store/analysisStore';
import { parseDocument } from '@/engines/documentEngine/parser';
import { analyzeQuestionnaire } from '@/engines/questionnaireEngine/questionHandler';
import { generateGoldStandardRecommendations } from '@/engines/questionnaireEngine/recommendationGenerator';
import { QuestionnaireResponse } from '@/types';

const Questionnaire: React.FC = () => {
  const { documents, selectedDocumentId, getDocumentById } = useDocumentStore();
  const { addQuestionnaireAnalysis, questionnaireAnalyses } = useAnalysisStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [completeness, setCompleteness] = useState(0);

  const questionnaires = documents.filter(
    doc => doc.category === 'pre-inspection-questionnaire'
  );
  
  const selectedDoc = selectedDocumentId ? getDocumentById(selectedDocumentId) : null;
  const isQuestionnaire = selectedDoc?.category === 'pre-inspection-questionnaire';

  const analyzeSelectedQuestionnaire = async () => {
    if (!selectedDoc || !isQuestionnaire) return;

    setIsAnalyzing(true);

    try {
      const parsed = parseDocument(selectedDoc.extractedText);
      const analysis = analyzeQuestionnaire(selectedDoc, parsed.questions);
      
      setResponses(analysis.responses);
      setCompleteness(analysis.overallCompleteness);
      
      addQuestionnaireAnalysis(analysis);
    } catch (error) {
      console.error('Questionnaire analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (selectedDocumentId) {
      const existing = questionnaireAnalyses.find(
        qa => qa.documentId === selectedDocumentId
      );
      if (existing) {
        setResponses(existing.responses);
        setCompleteness(existing.overallCompleteness);
      } else {
        setResponses([]);
        setCompleteness(0);
      }
    }
  }, [selectedDocumentId, questionnaireAnalyses]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-700';
      case 'incomplete':
        return 'bg-red-100 text-red-700';
      case 'needs-review':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pre-Inspection Questionnaire</h1>
          <p className="text-gray-500 mt-1">
            Analyze and enhance questionnaire responses with AI recommendations
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            disabled={responses.length === 0}
          >
            Export Report
          </Button>
          <Button
            onClick={analyzeSelectedQuestionnaire}
            disabled={!isQuestionnaire || isAnalyzing}
            loading={isAnalyzing}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Analyze Questionnaire
          </Button>
        </div>
      </div>

      {/* Questionnaire Selection */}
      <Card>
        <CardHeader title="Select Questionnaire" />
        {questionnaires.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              No questionnaires uploaded. Upload a pre-inspection questionnaire to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {questionnaires.map((doc) => (
              <div
                key={doc.id}
                className={`flex items-center justify-between p-4 rounded-lg border
                  transition-colors cursor-pointer
                  ${selectedDocumentId === doc.id 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => useDocumentStore.getState().selectDocument(doc.id)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedDocumentId === doc.id && (
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Analysis Results */}
      {responses.length > 0 && (
        <>
          {/* Completeness Overview */}
          <Card>
            <CardHeader title="Completeness Overview" />
            <div className="space-y-4">
              <ProgressBar
                progress={completeness}
                showLabel
                label="Overall Completeness"
                color={completeness >= 80 ? 'success' : completeness >= 50 ? 'warning' : 'danger'}
                size="lg"
              />
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                  <p className="text-2xl font-bold text-green-700">
                    {responses.filter(r => r.status === 'complete').length}
                  </p>
                  <p className="text-sm text-green-600">Complete</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-500 mb-2" />
                  <p className="text-2xl font-bold text-yellow-700">
                    {responses.filter(r => r.status === 'needs-review').length}
                  </p>
                  <p className="text-sm text-yellow-600">Needs Review</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
                  <p className="text-2xl font-bold text-red-700">
                    {responses.filter(r => r.status === 'incomplete').length}
                  </p>
                  <p className="text-sm text-red-600">Incomplete</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Question Analysis */}
          <Card>
            <CardHeader title="Question-by-Question Analysis" />
            <div className="space-y-4">
              {responses.map((response, index) => (
                <div
                  key={response.questionId}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {response.questionId}: {response.question}
                      </h4>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full
                      ${getStatusColor(response.status)}`}>
                      {response.status.replace('-', ' ')}
                    </span>
                  </div>

                  {response.originalAnswer && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Current Answer:
                      </p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {response.originalAnswer.slice(0, 300)}
                        {response.originalAnswer.length > 300 && '...'}
                      </p>
                    </div>
                  )}

                  {response.suggestedAnswer && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-medium text-blue-700">
                          Suggested Answer:
                        </p>
                      </div>
                      <p className="text-sm text-blue-600">
                        {response.suggestedAnswer}
                      </p>
                    </div>
                  )}

                  {response.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Recommendations:
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {response.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {response.evidenceReferences.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Supporting Evidence:
                      </p>
                      {response.evidenceReferences.map((ev) => (
                        <div
                          key={ev.id}
                          className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1"
                        >
                          "{ev.text.slice(0, 150)}..."
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Questionnaire;