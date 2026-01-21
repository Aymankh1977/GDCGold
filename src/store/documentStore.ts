import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Document, DocumentCategory } from "@/types";

type DocumentState = {
  documents: Document[];
  selectedDocumentId: string | null;
  referenceDocumentIds: string[];
  isLoading: boolean;
  error: string | null;

  // Actions (stable names)
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;

  setSelectedDocument: (id: string | null) => void;
  toggleReferenceDocument: (id: string) => void;
  setReferenceDocuments: (ids: string[]) => void;
  clearReferenceDocuments: () => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAllDocuments: () => void;

  // Selectors
  getDocumentById: (id: string) => Document | undefined;
  getDocumentsByCategory: (category: DocumentCategory) => Document[];
  getSelectedDocument: () => Document | undefined;
  getReferenceDocuments: () => Document[];
};

function safeDate(v: unknown): Date {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

function isValidDoc(d: unknown): d is Document {
  if (!d || typeof d !== "object") return false;
  const doc = d as Partial<Document>;

  const okType = doc.type === "pdf" || doc.type === "docx" || doc.type === "doc";
  const okStatus =
    doc.status === "pending" ||
    doc.status === "processing" ||
    doc.status === "completed" ||
    doc.status === "error";

  return (
    typeof doc.id === "string" &&
    typeof doc.name === "string" &&
    okType &&
    typeof doc.size === "number" &&
    !!doc.uploadedAt &&
    typeof doc.content === "string" &&
    typeof doc.extractedText === "string" &&
    !!doc.metadata &&
    okStatus &&
    typeof doc.category === "string"
  );
}

function normalizeDoc(raw: unknown): Document | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Partial<Document>;

  // Try to salvage old schemas (e.g., uploadDate -> uploadedAt, missing content/status, etc.)
  const uploadedAt = safeDate((d as any).uploadedAt ?? (d as any).uploadDate ?? (d as any).uploaded ?? Date.now());

  const type =
    d.type === "pdf" || d.type === "docx" || d.type === "doc"
      ? d.type
      : // if old code stored MIME type, infer basic
        (String((d as any).type || "")
          .includes("pdf")
          ? "pdf"
          : String((d as any).name || "").toLowerCase().endsWith(".docx")
            ? "docx"
            : "doc");

  const status =
    d.status === "pending" || d.status === "processing" || d.status === "completed" || d.status === "error"
      ? d.status
      : "completed";

  const normalized: Document = {
    id: typeof d.id === "string" ? d.id : "doc_" + Date.now().toString(16) + "_" + Math.random().toString(16).slice(2),
    name: typeof d.name === "string" ? d.name : "Untitled document",
    type,
    size: typeof d.size === "number" && Number.isFinite(d.size) ? d.size : 0,
    uploadedAt,
    content: typeof (d as any).content === "string" ? (d as any).content : "",
    extractedText: typeof d.extractedText === "string" ? d.extractedText : (typeof (d as any).text === "string" ? (d as any).text : ""),
    metadata: (d.metadata && typeof d.metadata === "object" ? d.metadata : {}) as Document["metadata"],
    status,
    category: (typeof d.category === "string" ? d.category : "other") as DocumentCategory,
  };

  return isValidDoc(normalized) ? normalized : null;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      selectedDocumentId: null,
      referenceDocumentIds: [],
      isLoading: false,
      error: null,

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      addDocument: (doc) =>
        set((state) => ({
          documents: [doc, ...state.documents].filter(Boolean),
          error: null,
        })),

      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),

      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
          selectedDocumentId: state.selectedDocumentId === id ? null : state.selectedDocumentId,
          referenceDocumentIds: state.referenceDocumentIds.filter((rid) => rid !== id),
        })),

      setSelectedDocument: (id) =>
        set(() => ({
          selectedDocumentId: id,
        })),

      toggleReferenceDocument: (id) =>
        set((state) => {
          if (!id) return state;
          if (id === state.selectedDocumentId) return state;

          const exists = state.referenceDocumentIds.includes(id);
          return {
            referenceDocumentIds: exists
              ? state.referenceDocumentIds.filter((rid) => rid !== id)
              : [...state.referenceDocumentIds, id],
          };
        }),

      setReferenceDocuments: (ids) =>
        set((state) => ({
          referenceDocumentIds: (ids || []).filter((id) => id && id !== state.selectedDocumentId),
        })),

      clearReferenceDocuments: () => set({ referenceDocumentIds: [] }),

      clearAllDocuments: () =>
        set({
          documents: [],
          selectedDocumentId: null,
          referenceDocumentIds: [],
          error: null,
          isLoading: false,
        }),

      getDocumentById: (id) => get().documents.find((d) => d.id === id),
      getDocumentsByCategory: (category) => get().documents.filter((d) => d.category === category),
      getSelectedDocument: () => {
        const { documents, selectedDocumentId } = get();
        return documents.find((d) => d.id === selectedDocumentId);
      },
      getReferenceDocuments: () => {
        const { documents, referenceDocumentIds } = get();
        return documents.filter((d) => referenceDocumentIds.includes(d.id));
      },
    }),
    {
      name: "detedtech-document-storage",
      version: 2,
      storage: createJSONStorage(() => localStorage),

      // Persist only data (not UI flags)
      partialize: (state) => ({
        documents: state.documents,
        selectedDocumentId: state.selectedDocumentId,
        referenceDocumentIds: state.referenceDocumentIds,
      }),

      // 🔥 Self-heal old/bad persisted data on load
      migrate: (persisted: unknown) => {
        if (!persisted || typeof persisted !== "object") {
          return { documents: [], selectedDocumentId: null, referenceDocumentIds: [] };
        }

        const p = persisted as any;
        const rawDocs = Array.isArray(p.documents) ? p.documents : [];

        const docs = rawDocs
          .map(normalizeDoc)
          .filter((d: Document | null): d is Document => !!d);

        const selected = typeof p.selectedDocumentId === "string" ? p.selectedDocumentId : null;
        const selectedExists = selected ? docs.some((d) => d.id === selected) : false;

        const refs = Array.isArray(p.referenceDocumentIds) ? p.referenceDocumentIds : [];
        const refSet = new Set(docs.map((d) => d.id));
        const referenceDocumentIds = refs
          .filter((id: unknown): id is string => typeof id === "string" && refSet.has(id))
          .filter((id: string) => (selectedExists ? id !== selected : true));

        return {
          documents: docs,
          selectedDocumentId: selectedExists ? selected : null,
          referenceDocumentIds,
        };
      },
    }
  )
);
