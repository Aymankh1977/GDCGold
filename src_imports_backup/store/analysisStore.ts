import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AnalysisResult, 
  QuestionnaireAnalysis, 
  EvaluationReport,
  AccreditationFramework 
} from '@/types';
import { generateId } from '@/utils/helpers';

interface AnalysisState {
  analyses: AnalysisResult[];
  questionnaireAnalyses: QuestionnaireAnalysis[];
  reports: EvaluationReport[];
  currentFramework: AccreditationFramework;
  isAnalyzing: boolean;
  analysisProgress: number;
  error: string | null;

  // Actions
  addAnalysis: (analysis: Omit<AnalysisResult, 'id' | 'timestamp'>) => string;
  updateAnalysis: (id: string, updates: Partial<AnalysisResult>) => void;
  removeAnalysis: (id: string) => void;
  
  addQuestionnaireAnalysis: (analysis: Omit<QuestionnaireAnalysis, 'id' | 'timestamp'>) => string;
  updateQuestionnaireAnalysis: (id: string, updates: Partial<QuestionnaireAnalysis>) => void;
  
  addReport: (report: Omit<EvaluationReport, 'id' | 'generatedAt'>) => string;
  removeReport: (id: string) => void;
  
  setCurrentFramework: (framework: AccreditationFramework) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setAnalysisProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  
  getAnalysisByDocumentId: (documentId: string) => AnalysisResult | undefined;
  getQuestionnaireAnalysisByDocumentId: (documentId: string) => QuestionnaireAnalysis | undefined;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      analyses: [],
      questionnaireAnalyses: [],
      reports: [],
      currentFramework: 'GDC',
      isAnalyzing: false,
      analysisProgress: 0,
      error: null,

      addAnalysis: (analysis) => {
        const id = generateId();
        const newAnalysis: AnalysisResult = {
          ...analysis,
          id,
          timestamp: new Date(),
        };
        set((state) => ({
          analyses: [...state.analyses, newAnalysis],
        }));
        return id;
      },

      updateAnalysis: (id, updates) => {
        set((state) => ({
          analyses: state.analyses.map((analysis) =>
            analysis.id === id ? { ...analysis, ...updates } : analysis
          ),
        }));
      },

      removeAnalysis: (id) => {
        set((state) => ({
          analyses: state.analyses.filter((analysis) => analysis.id !== id),
        }));
      },

      addQuestionnaireAnalysis: (analysis) => {
        const id = generateId();
        const newAnalysis: QuestionnaireAnalysis = {
          ...analysis,
          id,
          timestamp: new Date(),
        };
        set((state) => ({
          questionnaireAnalyses: [...state.questionnaireAnalyses, newAnalysis],
        }));
        return id;
      },

      updateQuestionnaireAnalysis: (id, updates) => {
        set((state) => ({
          questionnaireAnalyses: state.questionnaireAnalyses.map((analysis) =>
            analysis.id === id ? { ...analysis, ...updates } : analysis
          ),
        }));
      },

      addReport: (report) => {
        const id = generateId();
        const newReport: EvaluationReport = {
          ...report,
          id,
          generatedAt: new Date(),
        };
        set((state) => ({
          reports: [...state.reports, newReport],
        }));
        return id;
      },

      removeReport: (id) => {
        set((state) => ({
          reports: state.reports.filter((report) => report.id !== id),
        }));
      },

      setCurrentFramework: (framework) => {
        set({ currentFramework: framework });
      },

      setAnalyzing: (analyzing) => {
        set({ isAnalyzing: analyzing });
      },

      setAnalysisProgress: (progress) => {
        set({ analysisProgress: progress });
      },

      setError: (error) => {
        set({ error });
      },

      getAnalysisByDocumentId: (documentId) => {
        return get().analyses.find((analysis) => analysis.documentId === documentId);
      },

      getQuestionnaireAnalysisByDocumentId: (documentId) => {
        return get().questionnaireAnalyses.find(
          (analysis) => analysis.documentId === documentId
        );
      },
    }),
    {
      name: 'detedtech-analyses',
      partialize: (state) => ({
        analyses: state.analyses,
        questionnaireAnalyses: state.questionnaireAnalyses,
        reports: state.reports,
        currentFramework: state.currentFramework,
      }),
    }
  )
);