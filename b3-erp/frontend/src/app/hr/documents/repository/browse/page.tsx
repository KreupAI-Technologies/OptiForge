'use client';

import { useState, useEffect } from 'react';
import { Folder, File, Download, Eye, FolderOpen, AlertCircle } from 'lucide-react';
import { DocumentManagementService } from '@/services/document-management.service';

interface RepoFile {
  id: string;
  name: string;
  size: string;
  type: string;
  lastModified: string;
  fileUrl?: string;
}

export default function BrowseRepositoryPage() {
  const [currentPath, setCurrentPath] = useState(['Documents']);
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { data } = await DocumentManagementService.getRepositoryDocuments();
        const mapped: RepoFile[] = data.map((row) => ({
          id: String(row.id),
          name: row.documentName ?? row.fileName ?? '',
          size: row.fileSize != null ? String(row.fileSize) : '',
          type: row.documentCategory ?? '',
          lastModified: row.uploadedAt ?? '',
          fileUrl: row.fileUrl,
        }));
        if (!cancelled) setFiles(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load files');
          setFiles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const navigateToPath = (index: number) => {
    // Navigate to a specific path level
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const navigateToFolder = (folderName: string) => {
    // Navigate into a folder
    setCurrentPath([...currentPath, folderName]);
  };

  const handleDownload = async (id: string, fileUrl?: string) => {
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

  const handleView = (id: string, fileUrl?: string) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      handleDownload(id, fileUrl);
    }
  };

  // Static navigation chrome — these folders are presentational categories used
  // to navigate the breadcrumb path and do not drive the document data below.
  const folders = [
    { id: 1, name: 'HR Policies', fileCount: 12, lastModified: '2025-01-15' },
    { id: 2, name: 'Employee Handbooks', fileCount: 5, lastModified: '2025-01-10' },
    { id: 3, name: 'Templates', fileCount: 28, lastModified: '2024-12-20' },
    { id: 4, name: 'Circulars & Notices', fileCount: 45, lastModified: '2025-01-20' },
    { id: 5, name: 'Compliance Documents', fileCount: 18, lastModified: '2025-01-05' },
    { id: 6, name: 'Training Materials', fileCount: 32, lastModified: '2024-11-30' }
  ];

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Browse Repository</h1>
        <p className="text-sm text-gray-600 mt-1">Browse and access document repository</p>
      </div>

      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading files…
        </div>
      )}
      {loadError && !loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {currentPath.map((path, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              <button
                onClick={() => navigateToPath(index)}
                className="hover:text-blue-600 font-medium transition-colors"
              >
                {path}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Folders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {folders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => navigateToFolder(folder.name)}
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
            >
              <FolderOpen className="h-8 w-8 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
                <p className="text-sm text-gray-600">{folder.fileCount} files</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Files</h2>
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <File className="h-6 w-6 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{file.name}</h3>
                  <p className="text-sm text-gray-600">{file.size} • {file.type} • Modified: {new Date(file.lastModified).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleView(file.id, file.fileUrl)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownload(file.id, file.fileUrl)}
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
