{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ create \} from 'zustand';\
import \{ persist \} from 'zustand/middleware';\
import \{ Document, DocumentCategory \} from '@/types';\
import \{ generateId \} from '@/utils/helpers';\
\
interface DocumentState \{\
  documents: Document[];\
  selectedDocumentId: string | null;\
  referenceDocumentIds: string[];\
  isLoading: boolean;\
  error: string | null;\
  \
  // Actions\
  addDocument: (doc: Omit<Document, 'id' | 'uploadedAt'>) => string;\
  updateDocument: (id: string, updates: Partial<Document>) => void;\
  removeDocument: (id: string) => void;\
  selectDocument: (id: string | null) => void;\
  addReferenceDocument: (id: string) => void;\
  removeReferenceDocument: (id: string) => void;\
  clearReferenceDocuments: () => void;\
  setLoading: (loading: boolean) => void;\
  setError: (error: string | null) => void;\
  getDocumentById: (id: string) => Document | undefined;\
  getDocumentsByCategory: (category: DocumentCategory) => Document[];\
\}\
\
export const useDocumentStore = create<DocumentState>()(\
  persist(\
    (set, get) => (\{\
      documents: [],\
      selectedDocumentId: null,\
      referenceDocumentIds: [],\
      isLoading: false,\
      error: null,\
\
      addDocument: (doc) => \{\
        const id = generateId();\
        const newDocument: Document = \{\
          ...doc,\
          id,\
          uploadedAt: new Date(),\
        \};\
        set((state) => (\{\
          documents: [...state.documents, newDocument],\
        \}));\
        return id;\
      \},\
\
      updateDocument: (id, updates) => \{\
        set((state) => (\{\
          documents: state.documents.map((doc) =>\
            doc.id === id ? \{ ...doc, ...updates \} : doc\
          ),\
        \}));\
      \},\
\
      removeDocument: (id) => \{\
        set((state) => (\{\
          documents: state.documents.filter((doc) => doc.id !== id),\
          selectedDocumentId:\
            state.selectedDocumentId === id ? null : state.selectedDocumentId,\
          referenceDocumentIds: state.referenceDocumentIds.filter(\
            (refId) => refId !== id\
          ),\
        \}));\
      \},\
\
      selectDocument: (id) => \{\
        set(\{ selectedDocumentId: id \});\
      \},\
\
      addReferenceDocument: (id) => \{\
        set((state) => (\{\
          referenceDocumentIds: state.referenceDocumentIds.includes(id)\
            ? state.referenceDocumentIds\
            : [...state.referenceDocumentIds, id],\
        \}));\
      \},\
\
      removeReferenceDocument: (id) => \{\
        set((state) => (\{\
          referenceDocumentIds: state.referenceDocumentIds.filter(\
            (refId) => refId !== id\
          ),\
        \}));\
      \},\
\
      clearReferenceDocuments: () => \{\
        set(\{ referenceDocumentIds: [] \});\
      \},\
\
      setLoading: (loading) => \{\
        set(\{ isLoading: loading \});\
      \},\
\
      setError: (error) => \{\
        set(\{ error \});\
      \},\
\
      getDocumentById: (id) => \{\
        return get().documents.find((doc) => doc.id === id);\
      \},\
\
      getDocumentsByCategory: (category) => \{\
        return get().documents.filter((doc) => doc.category === category);\
      \},\
    \}),\
    \{\
      name: 'detedtech-documents',\
      partialize: (state) => (\{\
        documents: state.documents,\
        referenceDocumentIds: state.referenceDocumentIds,\
      \}),\
    \}\
  )\
);}