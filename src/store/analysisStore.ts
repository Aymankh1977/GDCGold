import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AnalysisResult,
  QuestionnaireAnalysis,
  GeneratedReport,
  AccreditationFramework,
} from '@/types';

interface AnalysisState {
  analyses: AnalysisResult[];
  reports: GeneratedReport[];

  questionnaireAnalyses: QuestionnaireAnalysis[];

  currentFramework: AccreditationFramework;
  isAnalyzing: boolean;
  analysisProgress: number;
  lastAnalysisTimestamp: number | null;

  // Core actions
  addAnalysis: (analysis: AnalysisResult) => void;
  removeAnalysis: (documentId: string) => void;

  addReport: (report: GeneratedReport) => void;
  removeReport: (reportId: string) => void;

  // Questionnaire actions
  addQuestionnaireAnalysis: (qa: QuestionnaireAnalysis) => void;
  removeQuestionnaireAnalysis: (documentId: string) => void;

  setCurrentFramework: (framework: AccreditationFramework) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisProgress: (progress: number) => void;
  resetAnalysisState: () => void;
  clearAllAnalysisData: () => void;

  // Selectors
  getAnalysisByDocumentId: (documentId: string) => AnalysisResult | undefined;
  getLatestAnalysis: () => AnalysisResult | undefined;
  getReportsByDocumentId: (documentId: string) => GeneratedReport[];

  getQuestionnaireAnalysisByDocumentId: (documentId: string) => QuestionnaireAnalysis | undefined;
}

/**
 * useAnalysisStore
 * - Adds first-class QuestionnaireAnalysis support
 * - Keeps persistence stable
 * - Avoids breaking existing pages
 */
export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      analyses: [],
      reports: [],
      questionnaireAnalyses: [],

      currentFramework: 'GDC',
      isAnalyzing: false,
      analysisProgress: 0,
      lastAnalysisTimestamp: null,

      addAnalysis: (analysis) =>
        set((state) => ({
          analyses: [analysis, ...state.analyses.filter((a) => a.documentId !== analysis.documentId)],
          lastAnalysisTimestamp: Date.now(),
          isAnalyzing: false,
          analysisProgress: 100,
        })),

      removeAnalysis: (documentId) =>
        set((state) => ({
          analyses: state.analyses.filter((a) => a.documentId !== documentId),
          reports: state.reports.filter((r) => r.documentId !== documentId),
        })),

      addReport: (report) =>
        set((state) => ({
          reports: [report, ...state.reports],
        })),

      removeReport: (reportId) =>
        set((state) => ({
          reports: state.reports.filter((r) => r.id !== reportId),
        })),

      addQuestionnaireAnalysis: (qa) =>
        set((state) => ({
          questionnaireAnalyses: [
            qa,
            ...state.questionnaireAnalyses.filter((x) => x.documentId !== qa.documentId),
          ],
        })),

      removeQuestionnaireAnalysis: (documentId) =>
        set((state) => ({
          questionnaireAnalyses: state.questionnaireAnalyses.filter((x) => x.documentId !== documentId),
        })),

      setCurrentFramework: (framework) => set(() => ({ currentFramework: framework })),

      setAnalyzing: (isAnalyzing) =>
        set(() => ({
          isAnalyzing,
          analysisProgress: isAnalyzing ? 0 : get().analysisProgress,
        })),

      setAnalysisProgress: (progress) => set(() => ({ analysisProgress: progress })),

      resetAnalysisState: () => set(() => ({ isAnalyzing: false, analysisProgress: 0 })),

      clearAllAnalysisData: () =>
        set(() => ({
          analyses: [],
          reports: [],
          questionnaireAnalyses: [],
          lastAnalysisTimestamp: null,
          isAnalyzing: false,
          analysisProgress: 0,
        })),

      getAnalysisByDocumentId: (documentId) => get().analyses.find((a) => a.documentId === documentId),

      getLatestAnalysis: () => {
        const { analyses } = get();
        return analyses.length > 0 ? analyses[0] : undefined;
      },

      getReportsByDocumentId: (documentId) => get().reports.filter((r) => r.documentId === documentId),

      getQuestionnaireAnalysisByDocumentId: (documentId) =>
        get().questionnaireAnalyses.find((q) => q.documentId === documentId),
    }),
    {
      name: 'detedtech-analysis-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        analyses: state.analyses,
        reports: state.reports,
        questionnaireAnalyses: state.questionnaireAnalyses,
        currentFramework: state.currentFramework,
        lastAnalysisTimestamp: state.lastAnalysisTimestamp,
      }),
    }
  )
);
