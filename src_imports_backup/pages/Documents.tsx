import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Eye, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Filter
} from 'lucide-react';
import { Card, CardHeader } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useDocumentStore } from '@/store/documentStore';
import { processFile } from '@/engines/documentEngine';
import { validateFile } from '@/utils/validators';
import { formatFileSize, formatDate } from '@/utils/helpers';
import { Document, DocumentCategory } from '@/types';

const Documents: React.FC = () => {
  const { 
    documents, 
    addDocument, 
    removeDocument, 
    selectDocument,
    selectedDocumentId,
    addReferenceDocument,
    removeReferenceDocument,
    referenceDocumentIds,
    isLoading,
    setLoading 
  } = useDocumentStore();

  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | 'all'>('all');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    await handleFiles(files);
    e.target.value = '';
  };

  const handleFiles = async (files: File[]) => {
    setUploadError(null);
    setLoading(true);

    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || 'Invalid file');
        continue;
      }

      try {
        const processed = await processFile(file);
        addDocument(processed.document);
      } catch (error) {
        setUploadError(`Error processing ${file.name}: ${error}`);
      }
    }

    setLoading(false);
  };

  const filteredDocuments = documents.filter(
    doc => filterCategory === 'all' || doc.category === filterCategory
  );

  const getCategoryColor = (category: DocumentCategory) => {
    const colors: Record<DocumentCategory, string> = {
      'inspection-report': 'bg-blue-100 text-blue-700',
      'pre-inspection-questionnaire': 'bg-purple-100 text-purple-700',
      'evidence': 'bg-green-100 text-green-700',
      'policy': 'bg-orange-100 text-orange-700',
      'other': 'bg-gray-100 text-gray-700',
    };
    return colors[category];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">
            Upload and manage inspection reports and questionnaires
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center
            transition-colors duration-200
            ${dragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.docx,.doc"
            multiple
            onChange={handleFileInput}
          />
          
          <Upload className={`w-12 h-12 mx-auto mb-4 
            ${dragActive ? 'text-primary-500' : 'text-gray-400'}`} 
          />
          
          <label
            htmlFor="file-upload"
            className="cursor-pointer"
          >
            <span className="text-lg font-medium text-gray-700">
              Drop files here or{' '}
              <span className="text-primary-600 hover:text-primary-700">browse</span>
            </span>
          </label>
          
          <p className="text-sm text-gray-500 mt-2">
            Supports PDF and Word documents up to 50MB
          </p>

          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-primary-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </div>
          )}

          {uploadError && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader
          title="Uploaded Documents"
          subtitle={`${documents.length} documents`}
          action={
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as DocumentCategory | 'all')}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5
                          focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Categories</option>
                <option value="inspection-report">Inspection Reports</option>
                <option value="pre-inspection-questionnaire">Questionnaires</option>
                <option value="evidence">Evidence</option>
                <option value="policy">Policies</option>
                <option value="other">Other</option>
              </select>
            </div>
          }
        />

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No documents found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`flex items-center justify-between p-4 rounded-lg border
                  transition-colors duration-200
                  ${selectedDocumentId === doc.id 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full
                        ${getCategoryColor(doc.category)}`}>
                        {doc.category.replace(/-/g, ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatFileSize(doc.size)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(doc.uploadedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {referenceDocumentIds.includes(doc.id) ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => removeReferenceDocument(doc.id)}
                      icon={<CheckCircle className="w-4 h-4" />}
                    >
                      Reference
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addReferenceDocument(doc.id)}
                    >
                      Add as Reference
                    </Button>
                  )}
                  
                  <Button
                    variant={selectedDocumentId === doc.id ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => selectDocument(doc.id)}
                  >
                    {selectedDocumentId === doc.id ? 'Selected' : 'Select'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewDocument(doc)}
                    icon={<Eye className="w-4 h-4" />}
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(doc.id)}
                    icon={<Trash2 className="w-4 h-4 text-red-500" />}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Document Viewer Modal */}
      <Modal
        isOpen={viewDocument !== null}
        onClose={() => setViewDocument(null)}
        title={viewDocument?.name}
        size="xl"
      >
        {viewDocument && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 font-medium">
                  {viewDocument.category.replace(/-/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Size:</span>
                <span className="ml-2 font-medium">
                  {formatFileSize(viewDocument.size)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Pages:</span>
                <span className="ml-2 font-medium">
                  {viewDocument.metadata.pages || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Uploaded:</span>
                <span className="ml-2 font-medium">
                  {formatDate(viewDocument.uploadedAt)}
                </span>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Extracted Content</h4>
              <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {viewDocument.extractedText.slice(0, 5000)}
                  {viewDocument.extractedText.length > 5000 && '...'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Documents;