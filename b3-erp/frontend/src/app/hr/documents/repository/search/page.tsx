'use client';

import { useState, useEffect } from 'react';
import { Search, File, Download, Eye, Filter, AlertCircle } from 'lucide-react';
import { DocumentManagementService, DocumentRepository } from '@/services/document-management.service';

interface SearchResult {
  id: string;
  name: string;
  path: string;
  size: string;
  type: string;
  lastModified: string;
  relevance: number;
  fileUrl?: string;
}

const mapRow = (row: DocumentRepository): SearchResult => ({
  id: String(row.id),
  name: row.documentName ?? row.fileName ?? '',
  path: row.documentCategory ?? '',
  size: row.fileSize != null ? String(row.fileSize) : '',
  type: row.documentCategory ?? '',
  lastModified: row.uploadedAt ?? '',
  relevance: 0,
  fileUrl: row.fileUrl,
});

export default function SearchRepositoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { data } = await DocumentManagementService.getRepositoryDocuments();
        if (!cancelled) setSearchResults(data.map(mapRow));
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load search results');
          setSearchResults([]);
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

  const handleSearch = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = searchQuery.trim()
        ? await DocumentManagementService.searchDocuments(searchQuery.trim())
        : await DocumentManagementService.getRepositoryDocuments();
      setSearchResults(data.map(mapRow));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Search Repository</h1>
        <p className="text-sm text-gray-600 mt-1">Search for documents across the repository</p>
      </div>

      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading search results…
        </div>
      )}
      {loadError && !loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="Search documents by name, content, or tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
          >
            Search
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Filter pills are visual only — the primary Search + result View/Download are wired to the backend. */}
        <div className="mt-4 flex gap-2">
          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">All Types</button>
          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">PDF</button>
          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">Word</button>
          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">Excel</button>
          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">Last 30 days</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
          <span className="text-sm text-gray-600">{searchResults.length} results found</span>
        </div>

        <div className="space-y-3">
          {searchResults.map((result) => (
            <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <File className="h-6 w-6 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{result.name}</h3>
                  <p className="text-sm text-gray-600">{result.path} • {result.size} • {result.type}</p>
                  <p className="text-xs text-gray-500 mt-1">Modified: {new Date(result.lastModified).toLocaleDateString('en-IN')} • Relevance: {result.relevance}%</p>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleView(result.id, result.fileUrl)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownload(result.id, result.fileUrl)}
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
