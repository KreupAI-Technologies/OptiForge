'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService, PmCommissioningRecord } from '@/services/ProjectManagementService';
import { ChevronLeft, FileText, Loader2, AlertCircle, Download, ExternalLink } from 'lucide-react';

interface DocRow {
  id: string;
  name: string;
  type?: string;
  status?: string;
  date?: string;
  url?: string;
}

// The commissioning record may carry documents under a few field names
// depending on the backend shape. Read whichever array is present; never
// fabricate rows.
function extractDocuments(record: PmCommissioningRecord): DocRow[] {
  const candidates = [
    record.documents,
    record.attachments,
    record.docs,
    record.documentList,
    record.certificates,
  ];
  const raw = candidates.find((c) => Array.isArray(c)) as any[] | undefined;
  if (!raw) return [];
  return raw.map((d, i) => {
    if (d && typeof d === 'object') {
      return {
        id: String(d.id ?? d.documentNumber ?? i),
        name: String(d.name ?? d.documentName ?? d.fileName ?? d.title ?? `Document ${i + 1}`),
        type: d.type ?? d.documentType ?? d.category,
        status: d.status,
        date: d.uploadDate ?? d.date ?? d.createdDate,
        url: d.url ?? d.fileUrl ?? d.downloadUrl,
      };
    }
    return { id: String(i), name: String(d) };
  });
}

function statusColor(status?: string): string {
  switch ((status ?? '').toLowerCase()) {
    case 'complete':
    case 'completed':
    case 'approved':
    case 'verified':
      return 'bg-green-100 text-green-700';
    case 'partial':
    case 'under review':
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'rejected':
    case 'failed':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default function CommissioningDocsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [record, setRecord] = useState<PmCommissioningRecord | null>(null);
  const [documents, setDocuments] = useState<DocRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const row = await projectManagementService.getCommissioning(params.id);
        if (cancelled) return;
        setRecord(row);
        setDocuments(row ? extractDocuments(row) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load commissioning documents');
          setRecord(null);
          setDocuments([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [params.id]);

  const projectName = record?.projectName ?? record?.equipmentSystem ?? '';
  const projectCode = record?.projectCode ?? record?.systemCode ?? record?.activityNumber ?? '';

  return (
    <div className="w-full min-h-screen px-4 py-4 max-w-5xl mx-auto">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/projects/commissioning')}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commissioning Documents</h1>
          <p className="text-sm text-gray-600">
            {projectName ? `${projectName}` : 'Commissioning record'}
            {projectCode ? ` · ${projectCode}` : ` · ${params.id}`}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading documents...
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {loadError}
        </div>
      )}
      {!isLoading && !loadError && !record && (
        <div className="mb-3 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
          Commissioning record not found.
        </div>
      )}

      {!isLoading && !loadError && record && documents.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-700">No documents available</p>
          <p className="mt-1 text-sm text-gray-500">
            This commissioning record has no attached documents yet.
          </p>
        </div>
      )}

      {!isLoading && !loadError && documents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{doc.type || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{doc.date ? String(doc.date).slice(0, 10) : '—'}</td>
                  <td className="px-4 py-3">
                    {doc.status ? (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Download className="h-4 w-4" />
                        Open
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                        <ExternalLink className="h-4 w-4" />
                        No file
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
