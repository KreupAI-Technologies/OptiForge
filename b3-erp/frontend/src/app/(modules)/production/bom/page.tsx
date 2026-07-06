'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Search,
  FileText,
  Package,
  Layers,
  TrendingUp,
  Calendar,
  Edit2,
  Copy,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileWarning,
  Loader2
} from 'lucide-react';
import {
  CreateBOMModal,
  EditBOMModal,
  CopyBOMModal,
  ViewBOMDetailsModal,
  type CreateBOMData,
  type EditBOMData,
  type CopyBOMData,
  type BOMDetails
} from '@/components/production/bom/BOMCoreModals';
import { bomService, BOM as ServiceBOM } from '@/services/bom.service';

interface BOM {
  id: string;
  bomCode: string;
  productCode: string;
  productName: string;
  category: string;
  version: string;
  revision: number;
  levels: number;
  totalComponents: number;
  totalCost: number;
  laborCost: number;
  overheadCost: number;
  totalMfgCost: number;
  status: 'active' | 'draft' | 'pending-approval' | 'obsolete';
  createdBy: string;
  createdDate: string;
  lastModified: string;
  approvedBy: string;
  approvedDate: string;
  effectiveFrom: string;
  effectiveTo: string;
}

// Map service BOM to local display format
function mapServiceBOMToLocal(bom: ServiceBOM): BOM {
  const statusMap: Record<string, BOM['status']> = {
    'Draft': 'draft',
    'Submitted': 'pending-approval',
    'Approved': 'active',
    'Active': 'active',
    'Obsolete': 'obsolete',
    'Rejected': 'draft',
  };

  return {
    id: bom.id,
    bomCode: bom.bomCode,
    productCode: bom.productCode,
    productName: bom.productName,
    category: bom.bomType,
    version: bom.version,
    revision: parseInt(bom.version.replace(/[^0-9]/g, '')) || 1,
    levels: bom.components.filter(c => c.isPhantom).length + 1,
    totalComponents: bom.components.length,
    totalCost: bom.totalMaterialCost,
    laborCost: bom.totalLaborCost,
    overheadCost: bom.totalOverheadCost,
    totalMfgCost: bom.totalCost,
    status: statusMap[bom.status] || 'draft',
    createdBy: bom.createdBy,
    createdDate: bom.createdAt.split('T')[0],
    lastModified: bom.updatedAt.split('T')[0],
    approvedBy: bom.approvedBy || '',
    approvedDate: bom.approvedAt ? bom.approvedAt.split('T')[0] : '',
    effectiveFrom: bom.effectiveDate,
    effectiveTo: bom.expiryDate || '',
  };
}

export default function BOMPage() {
  const router = useRouter();
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'pending-approval' | 'obsolete'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modal state hooks
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);

  // Fetch BOMs from service
  async function fetchBOMs() {
    setLoading(true);
    setError(null);
    try {
      const data = await bomService.getAllBOMs();
      setBoms(data.map(mapServiceBOMToLocal));
    } catch (err) {
      console.error('Error fetching BOMs:', err);
      setError('Failed to load BOMs. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBOMs();
  }, []);


  const categories = ['all', ...Array.from(new Set(boms.map(b => b.category)))];

  const filteredBOMs = boms.filter(bom => {
    const matchesSearch =
      bom.bomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bom.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bom.productName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || bom.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || bom.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      'pending-approval': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      obsolete: { color: 'bg-red-100 text-red-800', icon: FileWarning }
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  // Summary stats
  const totalBOMs = boms.length;
  const activeBOMs = boms.filter(b => b.status === 'active').length;
  const avgComponents = Math.round(boms.reduce((sum, b) => sum + b.totalComponents, 0) / totalBOMs);
  const totalMfgValue = boms.filter(b => b.status === 'active').reduce((sum, b) => sum + b.totalMfgCost, 0);

  // Modal handler functions
  const handleCreate = () => {
    setIsCreateOpen(true);
  };

  const handleEdit = (bom: BOM) => {
    setSelectedBOM(bom);
    setIsEditOpen(true);
  };

  const handleCopy = (bom: BOM) => {
    setSelectedBOM(bom);
    setIsCopyOpen(true);
  };

  const handleView = (bom: BOM) => {
    setSelectedBOM(bom);
    setIsViewOpen(true);
  };

  const handleCreateSubmit = async (data: CreateBOMData) => {
    try {
      await bomService.createBOM(data as any);
      await fetchBOMs();
    } catch (err) {
      console.error('Error creating BOM:', err);
      setError('Failed to create BOM.');
    } finally {
      setIsCreateOpen(false);
    }
  };

  const handleEditSubmit = async (data: EditBOMData) => {
    if (!selectedBOM) { setIsEditOpen(false); return; }
    try {
      await bomService.updateBOM(selectedBOM.id, data as any);
      await fetchBOMs();
    } catch (err) {
      console.error('Error updating BOM:', err);
      setError('Failed to update BOM.');
    } finally {
      setIsEditOpen(false);
      setSelectedBOM(null);
    }
  };

  const handleCopySubmit = async (data: CopyBOMData) => {
    try {
      // Copy = create a new BOM from the copy dialog payload.
      await bomService.createBOM(data as any);
      await fetchBOMs();
    } catch (err) {
      console.error('Error copying BOM:', err);
      setError('Failed to copy BOM.');
    } finally {
      setIsCopyOpen(false);
      setSelectedBOM(null);
    }
  };

  // Helper function to convert BOM to BOMDetails
  const convertToBOMDetails = (bom: BOM | null): BOMDetails | null => {
    if (!bom) return null;
    return {
      id: bom.id,
      bomCode: bom.bomCode,
      productId: bom.productCode,
      productName: bom.productName,
      productCode: bom.productCode,
      version: bom.version,
      revision: bom.revision,
      status: bom.status === 'active' ? 'active' : bom.status === 'draft' ? 'draft' : bom.status === 'obsolete' ? 'obsolete' : 'inactive',
      effectiveDateFrom: bom.effectiveFrom,
      effectiveDateTo: bom.effectiveTo,
      notes: '',
      components: [],
      componentCount: bom.totalComponents,
      bomLevels: bom.levels,
      costs: {
        material: bom.totalCost,
        labor: bom.laborCost,
        overhead: bom.overheadCost,
        total: bom.totalMfgCost
      },
      createdBy: bom.createdBy,
      createdAt: bom.createdDate,
      modifiedBy: bom.createdBy,
      modifiedAt: bom.lastModified,
      approvedBy: bom.approvedBy,
      approvedAt: bom.approvedDate
    };
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-full px-3 py-2 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-2" />
          <p className="text-gray-600">Loading BOMs...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full px-3 py-2 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mb-2" />
          <p className="text-gray-900 font-semibold mb-2">Error Loading BOMs</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 py-2">
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
            <h1 className="text-2xl font-bold text-gray-900">Bill of Materials (BOM)</h1>
            <p className="text-sm text-gray-600">Manage product BOMs and component structures</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/production/bom/multi-level')}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            <Layers className="h-4 w-4" />
            Multi-Level View
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New BOM
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Total BOMs</span>
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalBOMs}</div>
          <div className="text-xs text-blue-700 mt-1">{activeBOMs} active</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Avg Components</span>
            <Package className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{avgComponents}</div>
          <div className="text-xs text-green-700 mt-1">Per BOM</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Mfg Cost</span>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">₹{(totalMfgValue / 100000).toFixed(1)}L</div>
          <div className="text-xs text-purple-700 mt-1">Active BOMs</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-900">Pending</span>
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {boms.filter(b => b.status === 'pending-approval' || b.status === 'draft').length}
          </div>
          <div className="text-xs text-orange-700 mt-1">Approval needed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search BOMs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="pending-approval">Pending Approval</option>
            <option value="obsolete">Obsolete</option>
          </select>
        </div>
      </div>

      {/* BOMs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BOM Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Structure
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Labor Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Mfg Cost
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
              {filteredBOMs.map((bom) => {
                const statusInfo = getStatusBadge(bom.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={bom.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bom.bomCode}</div>
                        <div className="text-xs text-gray-500">{bom.category}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bom.productName}</div>
                        <div className="text-xs text-gray-500">{bom.productCode}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bom.version}</div>
                        <div className="text-xs text-gray-500">Rev {bom.revision}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bom.levels} levels</div>
                        <div className="text-xs text-gray-500">{bom.totalComponents} components</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">₹{bom.totalCost.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">₹{bom.laborCost.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-blue-900">₹{bom.totalMfgCost.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {bom.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(bom)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(bom)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit BOM"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCopy(bom)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Copy BOM"
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
        Showing {filteredBOMs.length} of {totalBOMs} BOMs
      </div>

      {/* Modal Components */}
      <CreateBOMModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateSubmit}
      />

      <EditBOMModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedBOM(null);
        }}
        onUpdate={handleEditSubmit}
        currentBOM={convertToBOMDetails(selectedBOM)}
      />

      <CopyBOMModal
        isOpen={isCopyOpen}
        onClose={() => {
          setIsCopyOpen(false);
          setSelectedBOM(null);
        }}
        onCopy={handleCopySubmit}
        sourceBOM={convertToBOMDetails(selectedBOM)}
      />

      <ViewBOMDetailsModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedBOM(null);
        }}
        bom={convertToBOMDetails(selectedBOM)}
      />
    </div>
  );
}
