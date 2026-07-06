'use client'

import { useState, useEffect } from 'react'
import { FileText, Upload, Download, Eye, Trash2, Folder, Search } from 'lucide-react'
import { FinanceService } from '@/services/finance.service'

interface DocumentRow {
  id: string
  name: string
  category: string
  uploadedBy: string
  uploadDate: string
  size: string
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '-'
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

export default function DocumentManagementPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await FinanceService.getDocuments()
      const mapped: DocumentRow[] = (data || []).map((d: any) => ({
        id: String(d.id),
        name: d.name ?? d.referenceNumber ?? 'Document',
        category: d.category ?? d.documentType ?? '-',
        uploadedBy: d.uploadedBy ?? '-',
        uploadDate: d.createdAt ?? '',
        size: typeof d.fileSize === 'number' ? formatFileSize(d.fileSize) : (d.fileSize ?? '-'),
      }))
      setDocuments(mapped)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load documents')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleUpload = async (data: any) => {
    try {
      await FinanceService.createDocument(data)
      await loadDocuments()
    } catch (e) {
      console.error('Failed to upload document', e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await FinanceService.deleteDocument(id)
      await loadDocuments()
    } catch (e) {
      console.error('Failed to delete document', e)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-600 mt-1">Centralized financial document repository</p>
          </div>
          <button
            onClick={() => handleUpload({ companyId: 'default-company-id', name: 'New Document', category: 'Financial Statements' })}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700"
          >
            <Upload className="h-5 w-5" />
            Upload Document
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading documents…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {['Financial Statements', 'Tax Documents', 'Audit', 'Legal'].map((cat, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
              <Folder className="h-8 w-8 text-orange-600 mb-2" />
              <h3 className="font-semibold text-gray-900">{cat}</h3>
              <p className="text-sm text-gray-600 mt-1">{documents.filter(d => d.category === cat).length} files</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Document Name</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Uploaded By</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Upload Date</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Size</th>
                <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!loading && documents.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-4 text-sm text-gray-500 text-center">No documents found.</td></tr>
              )}
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-gray-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{doc.category}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{doc.uploadedBy}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('en-IN') : '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{doc.size}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Eye className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">View</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Download className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">Download</span>
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
