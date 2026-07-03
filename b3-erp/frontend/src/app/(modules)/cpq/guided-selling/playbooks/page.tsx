'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Search,
  BookOpen,
  Target,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Edit2,
  Eye,
  Copy,
  Play,
  Award,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { cpqGuidedSellingService } from '@/services/cpq';
import {
  PlaybookModal,
  ViewPlaybookModal,
  UsePlaybookModal,
  StageBuilderModal,
  Playbook as PlaybookType
} from '@/components/cpq/PlaybookModals';

interface Playbook {
  id: string;
  playbookCode: string;
  playbookName: string;
  category: string;
  targetSegment: string;
  productFocus: string;
  stages: number;
  avgDealSize: number;
  winRate: number;
  avgCycleTime: number;
  usageCount: number;
  successfulDeals: number;
  status: 'active' | 'draft' | 'archived';
  createdBy: string;
  createdDate: string;
  lastUpdated: string;
  description: string;
}

export default function GuidedSellingPlaybooksPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'archived'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isUseOpen, setIsUseOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);

  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns the SalesPlaybook ORM shape (name/description/industry/
        // customerSegment/stages[]/usageCount/successRate/isActive); map it to this
        // page's analytics-oriented Playbook model. Deal-size/cycle-time metrics are
        // not part of the playbook record and default to 0.
        const raw = (await cpqGuidedSellingService.findAllPlaybooks()) as any[];
        const toDate = (v: unknown): string =>
          v ? new Date(v as string).toISOString().split('T')[0] : '';
        const mapped: Playbook[] = (raw ?? []).map((p) => ({
          id: p.id ?? '',
          playbookCode: p.playbookCode ?? p.id ?? '',
          playbookName: p.name ?? '',
          category: p.industry ?? '',
          targetSegment: p.customerSegment ?? '',
          productFocus: p.productFocus ?? '',
          stages: Array.isArray(p.stages) ? p.stages.length : Number(p.stages ?? 0),
          avgDealSize: Number(p.avgDealSize ?? 0),
          winRate: Number(p.successRate ?? 0),
          avgCycleTime: Number(p.avgCycleTime ?? 0),
          usageCount: Number(p.usageCount ?? 0),
          successfulDeals: Number(p.successfulDeals ?? 0),
          status: p.isActive === false ? 'archived' : 'active',
          createdBy: p.createdBy ?? '',
          createdDate: toDate(p.createdAt),
          lastUpdated: toDate(p.updatedAt ?? p.createdAt),
          description: p.description ?? '',
        }));
        if (!cancelled) setPlaybooks(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load playbooks');
          setPlaybooks([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = ['all', ...Array.from(new Set(playbooks.map(p => p.category)))];

  // Handlers
  const handleAddNew = () => {
    setSelectedPlaybook(null);
    setIsModalOpen(true);
  };

  const handleEdit = (playbook: Playbook) => {
    setSelectedPlaybook(playbook);
    setIsModalOpen(true);
  };

  const handleView = (playbook: Playbook) => {
    setSelectedPlaybook(playbook);
    setIsViewOpen(true);
  };

  const handleUse = (playbook: Playbook) => {
    setSelectedPlaybook(playbook);
    setIsUseOpen(true);
  };

  const handleCopy = (playbook: Playbook) => {
    const copy: Playbook = {
      ...playbook,
      id: `PB${Date.now()}`,
      playbookCode: `${playbook.playbookCode}-COPY`,
      playbookName: `${playbook.playbookName} (Copy)`,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setPlaybooks([copy, ...playbooks]);
  };

  const handleSave = (playbook: Playbook) => {
    if (selectedPlaybook) {
      setPlaybooks(playbooks.map(p => p.id === playbook.id ? playbook : p));
    } else {
      setPlaybooks([playbook, ...playbooks]);
    }
    setIsModalOpen(false);
    setSelectedPlaybook(null);
  };

  const filteredPlaybooks = playbooks.filter(playbook => {
    const matchesSearch =
      playbook.playbookCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playbook.playbookName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playbook.targetSegment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || playbook.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || playbook.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      draft: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      archived: { color: 'bg-gray-100 text-gray-800', icon: BookOpen }
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  // Summary stats
  const totalPlaybooks = playbooks.length;
  const activePlaybooks = playbooks.filter(p => p.status === 'active').length;
  const avgWinRate = playbooks.reduce((sum, p) => sum + p.winRate, 0) / totalPlaybooks;
  const totalDeals = playbooks.reduce((sum, p) => sum + p.successfulDeals, 0);

  return (
    <div className="w-full px-3 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading playbooks…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && playbooks.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No playbooks found.
        </div>
      )}
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
            <h1 className="text-2xl font-bold text-gray-900">Sales Playbooks</h1>
            <p className="text-sm text-gray-600">Guided selling strategies for kitchen products</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Playbook
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Total Playbooks</span>
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalPlaybooks}</div>
          <div className="text-xs text-blue-700 mt-1">{activePlaybooks} active</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Avg Win Rate</span>
            <Target className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{avgWinRate.toFixed(1)}%</div>
          <div className="text-xs text-green-700 mt-1">Across all playbooks</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Successful Deals</span>
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">{totalDeals}</div>
          <div className="text-xs text-purple-700 mt-1">Total wins</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-900">Total Usage</span>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {playbooks.reduce((sum, p) => sum + p.usageCount, 0)}
          </div>
          <div className="text-xs text-orange-700 mt-1">Times used</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search playbooks..."
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
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Playbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPlaybooks.map((playbook) => {
          const statusInfo = getStatusBadge(playbook.status);
          const StatusIcon = statusInfo.icon;
          return (
            <div key={playbook.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{playbook.playbookName}</h3>
                    <p className="text-xs text-gray-500">{playbook.playbookCode}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {playbook.status}
                  </span>
                </div>
                <div className="mt-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {playbook.category}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="space-y-3 mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{playbook.targetSegment}</span>
                  </div>
                  <p className="text-sm text-gray-600">{playbook.description}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-green-700 mb-1">Win Rate</div>
                    <div className="text-lg font-bold text-green-900">{playbook.winRate.toFixed(1)}%</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-blue-700 mb-1">Avg Deal</div>
                    <div className="text-lg font-bold text-blue-900">₹{(playbook.avgDealSize / 100000).toFixed(1)}L</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-xs text-purple-700 mb-1">Stages</div>
                    <div className="text-lg font-bold text-purple-900">{playbook.stages}</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-xs text-orange-700 mb-1">Cycle Time</div>
                    <div className="text-lg font-bold text-orange-900">{playbook.avgCycleTime}d</div>
                  </div>
                </div>

                {/* Performance */}
                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Success Rate</span>
                    <span>{playbook.successfulDeals} of {playbook.usageCount} deals</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(playbook.successfulDeals / playbook.usageCount) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUse(playbook)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Play className="h-4 w-4" />
                    Use Playbook
                  </button>
                  <button
                    onClick={() => handleView(playbook)}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200"
                    aria-label="View"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(playbook)}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200"
                    aria-label="Edit"
                    title="Edit Playbook"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleCopy(playbook)}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200"
                    aria-label="Copy"
                    title="Copy Playbook"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Created by {playbook.createdBy}</span>
                  <span>Updated {playbook.lastUpdated}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-sm text-gray-600">
        Showing {filteredPlaybooks.length} of {totalPlaybooks} playbooks
      </div>

      {/* Modals */}
      <PlaybookModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlaybook(null);
        }}
        onSave={handleSave}
        playbook={selectedPlaybook}
      />

      {selectedPlaybook && (
        <>
          <ViewPlaybookModal
            isOpen={isViewOpen}
            onClose={() => {
              setIsViewOpen(false);
              setSelectedPlaybook(null);
            }}
            playbook={selectedPlaybook}
          />

          <UsePlaybookModal
            isOpen={isUseOpen}
            onClose={() => {
              setIsUseOpen(false);
              setSelectedPlaybook(null);
            }}
            playbook={selectedPlaybook}
          />

          <StageBuilderModal
            isOpen={isBuilderOpen}
            onClose={() => {
              setIsBuilderOpen(false);
              setSelectedPlaybook(null);
            }}
            playbook={selectedPlaybook}
          />
        </>
      )}
    </div>
  );
}
