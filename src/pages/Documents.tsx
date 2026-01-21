import React, { useRef, useState } from 'react';
import {
  FileText,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Filter,
  Search,
  FilePlus
} from 'lucide-react';

import { Card, CardHeader } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';

import { useDocumentStore } from '@/store/documentStore';
import { processUploadedFile } from '@/engines/document/processor';
import { validateFile } from '@/utils/validators';
import { formatFileSize, formatDate } from '@/utils/helpers';
import type { Document, DocumentCategory } from '@/types';

const Documents: React.FC = () => {
  const {
    documents,
    selectedDocumentId,
    referenceDocumentIds,
    setSelectedDocument,
    toggleReferenceDocument,
    removeDocument
  } = useDocumentStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;

    setUploadError(null);
    setIsUploading(true);

    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || `Invalid file: ${file.name}`);
        continue;
      }

      try {
        await processUploadedFile(file);
      } catch (err) {
        console.error(err);
        setUploadError(`Failed to process ${file.name}`);
      }
    }

    setIsUploading(false);
  };

  const filteredDocuments = documents.filter(
    (d): d is Document =>
      !!d &&
      (filterCategory === 'all' || d.category === filterCategory) &&
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Document Library</h1>
          <p className="text-gray-500">
            Upload and manage accreditation evidence and reports
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) {
                handleFiles(Array.from(e.target.files));
                e.target.value = '';
              }
            }}
          />

          <Button
            icon={<FilePlus className="w-4 h-4" />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            Upload
          </Button>
        </div>
      </div>

      {/* Upload status */}
      {isUploading && (
        <div className="flex items-center gap-2 text-primary-600 font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing documents…
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl">
          <AlertCircle className="w-4 h-4" />
          {uploadError}
        </div>
      )}

      {/* Documents list */}
      <Card>
        <CardHeader
          title="Documents"
          subtitle={`${filteredDocuments.length} item(s)`}
        />

        <div className="p-4 space-y-3">
          {filteredDocuments.length === 0 && (
            <p className="text-sm text-gray-500">
              No documents uploaded yet.
            </p>
          )}

          {filteredDocuments.map((doc) => {
            const isSelected = selectedDocumentId === doc.id;
            const isReference = referenceDocumentIds.includes(doc.id);

            return (
              <div
                key={doc.id}
                className={`p-4 border rounded-xl flex justify-between items-center ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-100'
                }`}
              >
                <div className="min-w-0">
                  <p className="font-bold truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {doc.category} • {formatFileSize(doc.size)} •{' '}
                    {formatDate(doc.uploadedAt)}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant={isSelected ? 'secondary' : 'ghost'}
                    onClick={() => setSelectedDocument(doc.id)}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>

                  <Button
                    size="sm"
                    variant={isReference ? 'secondary' : 'ghost'}
                    onClick={() => toggleReferenceDocument(doc.id)}
                  >
                    {isReference ? 'Reference' : 'Add Ref'}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => setViewDocument(doc)}
                  />

                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Trash2 className="w-4 h-4 text-red-500" />}
                    onClick={() => removeDocument(doc.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Preview modal */}
      <Modal
        isOpen={!!viewDocument}
        onClose={() => setViewDocument(null)}
        title={viewDocument?.name}
        size="xl"
      >
        {viewDocument && (
          <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl max-h-[60vh] overflow-y-auto">
            {viewDocument.extractedText.slice(0, 5000)}
          </pre>
        )}
      </Modal>
    </div>
  );
};

export default Documents;
