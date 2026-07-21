'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Download, Filter, X, FileText, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ModalWrapper } from '@/components/ui/ModalWrapper';
import { systemMastersService, DocumentType } from '@/services/system-masters.service';
import { exportToCsv } from '@/lib/export';

export default function DocumentTypeMasterPage() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const fetchDocTypes = async () => {
      setIsLoading(true);
      try {
        const data = await systemMastersService.getAllDocumentTypes('123e4567-e89b-12d3-a456-426614174000');
        setDocumentTypes(data);
      } catch (error) {
        console.error('Failed to fetch document types', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocTypes();
  }, []);

  const filteredData = useMemo(() => {
    return documentTypes.filter(doc => {
      const matchesSearch = doc.typeName.toLowerCase().includes(searchTerm.toLowerCase()) || doc.typeCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [documentTypes, searchTerm, filterCategory]);

  const getCategoryColor = (category: string) => {
    const colors = {
      'identity': 'bg-blue-100 text-blue-800',
      'address': 'bg-green-100 text-green-800',
      'educational': 'bg-purple-100 text-purple-800',
      'employment': 'bg-orange-100 text-orange-800',
      'financial': 'bg-yellow-100 text-yellow-800',
      'medical': 'bg-red-100 text-red-800',
      'legal': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const columns: Column<DocumentType>[] = [
    {
      id: 'type',
      header: 'Document Type',
      accessor: 'typeName',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {row.isMandatory && <FileText className="w-4 h-4 text-red-600" />}
            {String(value)}
          </div>
          <div className="text-xs"><span className="font-mono text-blue-600">{row.typeCode}</span></div>
          <div className="text-xs text-gray-500">{row.description}</div>
        </div>
      )
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'category',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getCategoryColor(String(value))}`}>
          {String(value)}
        </span>
      )
    },
    {
      id: 'requirements',
      header: 'Requirements',
      accessor: 'isMandatory',
      sortable: true,
      render: (_, row) => (
        <div className="text-xs">
          {row.isMandatory && <div className="text-red-600">✓ Mandatory</div>}
          {row.requiredForJoining && <div className="text-orange-600">✓ For Joining</div>}
          {row.requiredForPayroll && <div className="text-blue-600">✓ For Payroll</div>}
          {row.isVerificationRequired && <div className="text-purple-600">✓ Verification</div>}
        </div>
      )
    },
    {
      id: 'validity',
      header: 'Validity',
      accessor: 'validityPeriod',
      sortable: true,
      render: (value, row) => (
        <div className="text-xs">
          {value ? (
            <>
              <div className="text-gray-900">{String(value)} months</div>
              {row.renewalRequired && <div className="text-orange-600">Renewal req.</div>}
            </>
          ) : (
            <div className="text-green-600">No expiry</div>
          )}
        </div>
      )
    },
    {
      id: 'format',
      header: 'Format & Size',
      accessor: 'maxFileSizeMB',
      sortable: false,
      render: (value, row) => (
        <div className="text-xs">
          <div className="text-gray-900">{row.allowedFormats.join(', ')}</div>
          <div className="text-gray-500">Max: {String(value)}MB</div>
          {row.encryptionRequired && <div className="text-red-600">🔒 Encrypted</div>}
        </div>
      )
    },
    {
      id: 'usage',
      header: 'Usage',
      accessor: 'id',
      sortable: true,
      render: () => (
        <div className="text-xs">
          <div className="font-medium text-gray-900">0 docs</div>
          <div className="text-gray-500 italic">Integration pending</div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'isActive',
      sortable: true,
      render: (value) => <StatusBadge status={value ? 'active' : 'inactive'} text={value ? 'Active' : 'Inactive'} />
    }
  ];

  const clearFilters = () => { setSearchTerm(''); setFilterCategory('all'); };
  const activeFilterCount = [filterCategory !== 'all', searchTerm !== ''].filter(Boolean).length;

  // Basic stats for now
  const stats = useMemo(() => ({
    total: documentTypes.length,
    mandatory: documentTypes.filter(d => d.isMandatory).length,
    totalDocuments: 0,
    pendingVerification: 0,
    expiringIn30Days: 0,
    requiredForJoining: documentTypes.filter(d => d.requiredForJoining).length
  }), [documentTypes]);

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            Document Type Master
          </h1>
          <p className="text-gray-600 mt-1">Manage HR document types and requirements</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCsv('document-type-master', filteredData)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Type
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Total Types</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Mandatory</div>
          <div className="text-2xl font-bold text-red-600">{stats.mandatory}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Total Documents</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalDocuments}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Pending
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.pendingVerification}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Expiring Soon</div>
          <div className="text-2xl font-bold text-red-600">{stats.expiringIn30Days}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">For Joining</div>
          <div className="text-2xl font-bold text-purple-600">{stats.requiredForJoining}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search document types..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">{activeFilterCount}</span>}
          </button>
          {activeFilterCount > 0 && <button onClick={clearFilters} className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"><X className="w-4 h-4" />Clear</button>}
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="all">All Categories</option>
                <option value="identity">Identity</option>
                <option value="financial">Financial</option>
                <option value="educational">Educational</option>
                <option value="employment">Employment</option>
                <option value="medical">Medical</option>
                <option value="legal">Legal</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <DataTable data={filteredData} columns={columns} pagination={{ enabled: true, pageSize: 10 }} sorting={{ enabled: true }} emptyMessage="No document types found" />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2"><FileText className="w-5 h-5 inline mr-2" />Document Management</h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ Mandatory and optional document classifications for employee lifecycle</li>
          <li>✓ Validity period tracking with renewal reminders and expiry alerts</li>
          <li>✓ File format restrictions and encryption for sensitive documents</li>
          <li>✓ Verification workflows for compliance and authenticity checks</li>
        </ul>
      </div>

      {/* Add Type modal.
          NOTE: the common-masters document-types API is read-only (GET only) and
          systemMastersService exposes no create method, so this cannot persist yet.
          A backend POST /common-masters/document-types endpoint plus a
          createDocumentType() service method are required to make this functional. */}
      <ModalWrapper
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Document Type"
        size="md"
      >
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800">
              Creating document types is not yet available. The common-masters
              document-types API is read-only. A backend create endpoint
              (<span className="font-mono">POST /common-masters/document-types</span>) and a
              matching service method are required before this form can save.
            </p>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
}
