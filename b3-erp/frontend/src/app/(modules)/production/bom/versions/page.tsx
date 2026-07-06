'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import {
  ArrowLeft,
  Search,
  GitBranch,
  Clock,
  CheckCircle2,
  XCircle,
  Edit2,
  Eye,
  Copy,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import {
  ViewVersionDetailsModal,
  EditVersionModal,
  CreateVersionModal,
  BOMVersion as ModalBOMVersion
} from '@/components/production/bom/BOMVersionModals';

interface BOMVersion {
  id: string;
  bomCode: string;
  productCode: string;
  productName: string;
  version: string;
  revision: number;
  status: 'current' | 'previous' | 'draft' | 'obsolete';
  totalComponents: number;
  totalCost: number;
  laborCost: number;
  totalMfgCost: number;
  costChange: number;
  costChangePercent: number;
  changeReason: string;
  changedBy: string;
  changeDate: string;
  approvedBy: string;
  approvedDate: string;
  effectiveFrom: string;
  effectiveTo: string;
  notes: string;
}

export default function BOMVersionsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'current' | 'previous' | 'draft' | 'obsolete'>('all');

  const [versions, setVersions] = useState<BOMVersion[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = (await ProductionOrphanService.getBoms()) as any[];
        const mapped: BOMVersion[] = (raw || []).map((r: any) => ({
          id: String(r.id ?? ''),
          bomCode: r.bomCode ?? '',
          productCode: r.productCode ?? '',
          productName: r.productName ?? '',
          version: r.version ?? '',
          revision: Number(r.revision ?? 0),
          status: (r.status ?? 'draft') as BOMVersion['status'],
          totalComponents: Number(r.totalComponents ?? 0),
          totalCost: Number(r.totalCost ?? 0),
          laborCost: Number(r.laborCost ?? 0),
          totalMfgCost: Number(r.totalMfgCost ?? 0),
          costChange: Number(r.costChange ?? 0),
          costChangePercent: Number(r.costChangePercent ?? 0),
          changeReason: r.changeReason ?? '',
          changedBy: r.changedBy ?? '',
          changeDate: r.changeDate ?? '',
          approvedBy: r.approvedBy ?? '',
          approvedDate: r.approvedDate ?? '',
          effectiveFrom: r.effectiveFrom ?? '',
          effectiveTo: r.effectiveTo ?? '',
          notes: r.notes ?? '',
        }));
        if (!cancelled) setVersions(mapped);
      } catch (err) {
        if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setVersions([]); }
      } finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const products = ['all', ...Array.from(new Set(versions.map(v => v.productCode)))];

  const filteredVersions = versions.filter(version => {
    const matchesSearch =
      version.bomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      version.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      version.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      version.version.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProduct = filterProduct === 'all' || version.productCode === filterProduct;
    const matchesStatus = filterStatus === 'all' || version.status === filterStatus;

    return matchesSearch && matchesProduct && matchesStatus;
  });

  // Modal state hooks
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<BOMVersion | null>(null);

  const getStatusBadge = (status: string) => {
    const badges = {
      current: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      previous: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      draft: { color: 'bg-yellow-100 text-yellow-800', icon: FileText },
      obsolete: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  const getCostChangeIndicator = (change: number, changePercent: number) => {
    if (change === 0) {
      return <span className="text-gray-500 text-sm">No change</span>;
    }
    const isIncrease = change > 0;
    return (
      <div className={`flex items-center gap-1 ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
        {isIncrease ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span className="text-sm font-medium">
          {isIncrease ? '+' : ''}₹{Math.abs(change).toLocaleString()} ({isIncrease ? '+' : ''}{changePercent.toFixed(1)}%)
        </span>
      </div>
    );
  };

  // Summary stats
  const currentVersions = versions.filter(v => v.status === 'current').length;
  const totalVersions = versions.length;
  const avgRevisionsPerProduct = versions.reduce((sum, v) => sum + v.revision, 0) / totalVersions;

  // Convert BOMVersion to ModalBOMVersion format
  const convertToModalVersion = (version: BOMVersion): ModalBOMVersion => ({
    id: version.id,
    versionNumber: version.version,
    revisionNumber: version.revision.toString(),
    status: version.status as 'current' | 'previous' | 'obsolete',
    effectiveFrom: version.effectiveFrom,
    effectiveUntil: version.effectiveTo,
    changeReason: version.changeReason,
    changedBy: version.changedBy,
    changedDate: version.changeDate,
    approvedBy: version.approvedBy,
    approvalDate: version.approvedDate,
    totalCost: version.totalMfgCost,
    previousCost: version.totalMfgCost + version.costChange,
    componentCount: version.totalComponents,
    notes: version.notes,
    productId: version.productCode,
    productName: version.productName
  });

  // Handler functions
  const handleView = (version: BOMVersion) => {
    setSelectedVersion(version);
    setIsViewOpen(true);
  };

  const handleEdit = (version: BOMVersion) => {
    setSelectedVersion(version);
    setIsEditOpen(true);
  };

  const handleCreateVersion = (version: BOMVersion) => {
    setSelectedVersion(version);
    setIsCreateOpen(true);
  };

  const handleViewClose = () => {
    setIsViewOpen(false);
  };

  const handleEditSubmit = async (data: Partial<ModalBOMVersion>) => {
    try {
      if (selectedVersion?.id) {
        await ProductionOrphanService.updateBom(selectedVersion.id, data as any);
      }
    } catch (err) {
      console.error('Error updating version:', err);
    } finally {
      setIsEditOpen(false);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleCreateVersionSubmit = async (data: Partial<ModalBOMVersion>) => {
    try {
      await ProductionOrphanService.createBom({ ...(data as any), parentBomId: selectedVersion?.id });
    } catch (err) {
      console.error('Error creating version:', err);
    } finally {
      setIsCreateOpen(false);
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <div className="w-full px-3 py-2">
      {isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"><div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />Loading…</div>)}
      {loadError && !isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>)}
      {/* Inline Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">BOM Version History</h1>
            <p className="text-sm text-gray-600">Track BOM changes and version evolution</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/production/bom/comparison')}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            <GitBranch className="h-4 w-4" />
            Compare Versions
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Total Versions</span>
            <GitBranch className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalVersions}</div>
          <div className="text-xs text-blue-700 mt-1">All products</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Current Versions</span>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{currentVersions}</div>
          <div className="text-xs text-green-700 mt-1">Active in production</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Avg Revisions</span>
            <FileText className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">{avgRevisionsPerProduct.toFixed(1)}</div>
          <div className="text-xs text-purple-700 mt-1">Per product</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-900">Draft Versions</span>
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {versions.filter(v => v.status === 'draft').length}
          </div>
          <div className="text-xs text-orange-700 mt-1">Pending approval</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search versions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {products.map(prod => (
              <option key={prod} value={prod}>{prod === 'all' ? 'All Products' : prod}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="current">Current</option>
            <option value="previous">Previous</option>
            <option value="draft">Draft</option>
            <option value="obsolete">Obsolete</option>
          </select>
        </div>
      </div>

      {/* Versions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Components
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mfg Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Change
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change Reason
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effective Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVersions.map((version) => {
                const statusInfo = getStatusBadge(version.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={version.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{version.productName}</div>
                        <div className="text-xs text-gray-500">{version.productCode}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{version.version}</div>
                        <div className="text-xs text-gray-500">Rev {version.revision}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{version.totalComponents}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">₹{version.totalMfgCost.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4">
                      {getCostChangeIndicator(version.costChange, version.costChangePercent)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-700 max-w-xs">{version.changeReason}</div>
                    </td>
                    <td className="px-4 py-4">
                      {version.effectiveFrom ? (
                        <div>
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {version.effectiveFrom}
                          </div>
                          <div className="text-xs text-gray-500">to {version.effectiveTo}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {version.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleView(version)}
                          title="View version details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {version.status === 'current' && (
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            onClick={() => handleEdit(version)}
                            title="Edit version"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          className="text-purple-600 hover:text-purple-900"
                          onClick={() => handleCreateVersion(version)}
                          title="Create new version"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredVersions.length} of {totalVersions} versions
      </div>

      {/* Modals */}
      <ViewVersionDetailsModal
        isOpen={isViewOpen}
        onClose={handleViewClose}
        version={selectedVersion ? convertToModalVersion(selectedVersion) : null}
        onEdit={(version) => {
          const originalVersion = versions.find(v => v.id === version.id);
          if (originalVersion) handleEdit(originalVersion);
        }}
      />

      <EditVersionModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleEditSubmit}
        version={selectedVersion ? convertToModalVersion(selectedVersion) : null}
      />

      <CreateVersionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateVersionSubmit}
        sourceVersion={selectedVersion ? convertToModalVersion(selectedVersion) : null}
      />
    </div>
  );
}
