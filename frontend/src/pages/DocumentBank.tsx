import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  Loader2,
  File,
  FileImage,
  FileVideo,
  X,
} from 'lucide-react';
import {
  DocumentBankItemDto,
  fetchAllDocuments,
  getDocumentPresignedUrl,
  deleteDocument,
} from '../lib/api';
import { useCourses } from '../lib/CoursesContext';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function getFileIcon(contentType: string, filename: string) {
  const lower = (contentType || '').toLowerCase();
  const name = filename.toLowerCase();
  if (lower.includes('pdf') || name.endsWith('.pdf'))
    return <FileText className="w-5 h-5 text-red-500" />;
  if (lower.startsWith('image/'))
    return <FileImage className="w-5 h-5 text-blue-500" />;
  if (lower.startsWith('video/'))
    return <FileVideo className="w-5 h-5 text-purple-500" />;
  if (lower.includes('word') || name.endsWith('.doc') || name.endsWith('.docx'))
    return <FileText className="w-5 h-5 text-blue-600" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
}

export function DocumentBank() {
  const { courses } = useCourses();
  const [documents, setDocuments] = useState<DocumentBankItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await fetchAllDocuments(
        searchQuery || undefined,
        selectedCourseId || undefined
      );
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [selectedCourseId]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDocuments();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleView = async (doc: DocumentBankItemDto) => {
    try {
      const url = await getDocumentPresignedUrl(doc.documentId);
      window.open(url.presignedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open document.');
    }
  };

  const handleDelete = async (doc: DocumentBankItemDto) => {
    setDeletingId(doc.documentId);
    try {
      await deleteDocument(doc.documentId);
      setDocuments((prev) => prev.filter((d) => d.documentId !== doc.documentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const stats = useMemo(() => {
    const totalSize = documents.reduce((sum, d) => sum + d.fileSizeBytes, 0);
    const courseCount = new Set(documents.map((d) => d.courseId)).size;
    return { totalDocs: documents.length, totalSize, courseCount };
  }, [documents]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Document Bank</h1>
        <p className="text-muted-foreground">
          All your uploaded documents across every course
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold">{stats.totalDocs}</p>
          <p className="text-sm text-muted-foreground">Documents</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold">{stats.courseCount}</p>
          <p className="text-sm text-muted-foreground">Courses</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
          <p className="text-sm text-muted-foreground">Total Size</p>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-card border border-border rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[180px]"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading documents...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && documents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">No documents found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {searchQuery || selectedCourseId
              ? 'Try adjusting your search or filter.'
              : 'Upload documents to your courses and they will appear here.'}
          </p>
        </div>
      )}

      {/* Document list */}
      {!loading && documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.documentId}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-sm transition-all group"
            >
              {/* File icon */}
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {getFileIcon(doc.contentType, doc.originalFilename)}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{doc.originalFilename}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                  <Link
                    to={`/course/${doc.courseId}`}
                    className="hover:text-primary transition-colors"
                  >
                    {doc.courseName}
                  </Link>
                  <span>{formatFileSize(doc.fileSizeBytes)}</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleView(doc)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="View / Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc)}
                  disabled={deletingId === doc.documentId}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                  title="Delete"
                >
                  {deletingId === doc.documentId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
