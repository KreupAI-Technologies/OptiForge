'use client';

import { useState, useEffect } from 'react';
import { Archive, File, Download, RotateCcw, AlertCircle } from 'lucide-react';
import { DocumentManagementService } from '@/services/document-management.service';

interface ArchivedDoc {
  id: string;
  name: string;
  archivedOn: string;
  archivedBy: string;
  size: string;
  fileUrl?: string;
}

export default function ArchiveRepositoryPage() {
  const [archivedDocs, setArchivedDocs] = useState<ArchivedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async (signal?: { cancelled: boolean }) => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await DocumentManagementService.getArchivedDocuments();
      const mapped: ArchivedDoc[] = data.map((row) => ({
        id: String(row.id),
        name: row.documentName ?? row.fileName ?? '',
        archivedOn: row.uploadedAt ?? '',
        archivedBy: row.uploadedByName ?? row.uploadedBy ?? '',
        size: row.fileSize != null ? String(row.fileSize) : '',
        fileUrl: row.fileUrl,
      }));
      if (!signal?.cancelled) setArchivedDocs(mapped);
    } catch (err) {
      if (!signal?.cancelled) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load archived documents');
        setArchivedDocs([]);
      }
    } finally {
      if (!signal?.cancelled) setLoading(false);
    }
  };

  useEffect(() => {
    const signal = { cancelled: false };
    load(signal);
    return () => {
      signal.cancelled = true;
    };
  }, []);

  const handleRestore = async (id: string) => {
    if (!window.confirm('Restore this document?')) return;
    try {
      await DocumentManagementService.unarchiveDocument(id);
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to restore document');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const res = await DocumentManagementService.downloadDocument(id);
      if (res.available && res.fileUrl) {
        window.open(res.fileUrl, '_blank');
      } else {
        window.alert('File not available for download');
      }
    } catch {
      window.alert('File not available for download');
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Archived Documents</h1>
        <p className="text-sm text-gray-600 mt-1">View and restore archived documents</p>
      </div>

      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading archived documents…
        </div>
      )}
      {loadError && !loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Archived</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{archivedDocs.length}</p>
            </div>
            <Archive className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Archived Documents</h2>
        <div className="space-y-3">
          {archivedDocs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 flex-1">
                <File className="h-6 w-6 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{doc.name}</h3>
                  <p className="text-sm text-gray-600">
                    Archived on {new Date(doc.archivedOn).toLocaleDateString('en-IN')} by {doc.archivedBy} • {doc.size}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleRestore(doc.id)}
                  className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </button>
                <button
                  onClick={() => handleDownload(doc.id)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
