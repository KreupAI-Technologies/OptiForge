'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { leadService } from '@/services/lead.service';
import { crmService, asArray } from '@/services/crm.service';
import {
  Globe,
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  Award,
  Target,
  Filter,
  Download,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Plus,
  X,
  ChevronRight,
  ChevronDown,
  Trash2,
} from 'lucide-react';

interface LeadSource {
  id: string;
  name: string;
  category: string;
  parentId?: string | null;
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  avgScore: number;
  totalValue: number;
  avgDealSize: number;
  lastMonth: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  color: string;
}

export default function LeadSourcesPage() {
  const router = useRouter();
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSources = async () => {
      try {
        // Configured lead sources (CRUD-managed)
        const rawSources = asArray(await crmService.leadSources.getAll());

        // Per-source analytics (counts/values); tolerate failure
        let analytics: any[] = [];
        try {
          analytics = await leadService.getSourceAnalytics();
        } catch (e) {
          analytics = [];
        }
        const statsByName: Record<string, any> = {};
        analytics.forEach((a: any) => {
          if (a?.name) statsByName[String(a.name)] = a;
        });

        const mapped: LeadSource[] = rawSources.map((item: any) => {
          const stat = statsByName[item.name] || {};
          const totalLeads = parseInt(stat.totalLeads ?? '0', 10) || 0;
          const qualifiedLeads = parseInt(stat.qualifiedLeads ?? '0', 10) || 0;
          const totalValue = parseFloat(stat.totalValue ?? '0') || 0;
          return {
            id: String(item.id ?? item.name),
            name: item.name ?? '',
            category: item.category ?? 'General',
            parentId: item.parentId ?? null,
            totalLeads,
            qualifiedLeads,
            conversionRate: stat.conversionRate != null ? parseFloat(stat.conversionRate) : 0,
            avgScore: Number(item.avgScore ?? 0),
            totalValue,
            avgDealSize: qualifiedLeads > 0 ? totalValue / qualifiedLeads : 0,
            lastMonth: 0,
            trend: 'stable',
            trendPercentage: 0,
            color: item.color ?? 'bg-blue-500',
          };
        });
        setSources(mapped);
      } catch (error) {
        console.error('Failed to fetch lead sources:', error);
        setSources([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSources();
  }, []);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('totalLeads');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState<'main' | 'sub'>('main');
  const [newName, setNewName] = useState('');
  const [newParentId, setNewParentId] = useState<string>('');
  const [newCategory, setNewCategory] = useState('Events');
  const [newColor, setNewColor] = useState('bg-blue-500');

  const categories = Array.from(new Set(sources.map((s) => s.category)));

  // Helpers
  const parents = useMemo(() => sources.filter((s) => !s.parentId), [sources]);
  const childrenByParent = useMemo(() => {
    const map: Record<string, LeadSource[]> = {};
    sources.forEach((s) => {
      if (s.parentId) {
        if (!map[s.parentId]) map[s.parentId] = [];
        map[s.parentId].push(s);
      }
    });
    return map;
  }, [sources]);

  function aggregate(parent: LeadSource): LeadSource {
    const kids = childrenByParent[parent.id] || [];
    if (kids.length === 0) return parent;
    const totalLeads = kids.reduce((sum, k) => sum + k.totalLeads, parent.totalLeads);
    const qualifiedLeads = kids.reduce((sum, k) => sum + k.qualifiedLeads, parent.qualifiedLeads);
    const totalValue = kids.reduce((sum, k) => sum + k.totalValue, parent.totalValue);
    const lastMonth = kids.reduce((sum, k) => sum + k.lastMonth, parent.lastMonth);
    const weightedConv = totalLeads
      ? ((kids.reduce((sum, k) => sum + k.conversionRate * k.totalLeads, parent.conversionRate * parent.totalLeads)) /
        totalLeads)
      : 0;
    const weightedScore = totalLeads
      ? ((kids.reduce((sum, k) => sum + k.avgScore * k.totalLeads, parent.avgScore * parent.totalLeads)) / totalLeads)
      : 0;
    const avgDealSize = totalLeads ? Math.round(totalValue / Math.max(1, qualifiedLeads)) : parent.avgDealSize;
    const trendValue = kids.reduce((sum, k) => sum + k.trendPercentage, parent.trendPercentage);
    const trendPercentage = kids.length ? trendValue / kids.length : parent.trendPercentage;
    const trend: 'up' | 'down' | 'stable' = trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'stable';
    return {
      ...parent,
      totalLeads,
      qualifiedLeads,
      totalValue,
      lastMonth,
      conversionRate: Number(weightedConv.toFixed(1)),
      avgScore: Math.round(weightedScore),
      avgDealSize,
      trendPercentage,
      trend,
    };
  }

  // Prepare tree with filters and sorting applied on parents (aggregated)
  const treeParents = useMemo(() => {
    const list = parents
      .map((p) => aggregate(p))
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        // If parent doesn't match, include if any child matches search/category
        if (matchesSearch && matchesCategory) return true;
        const kids = childrenByParent[p.id] || [];
        const anyChildMatches = kids.some((c) => {
          const cs = c.name.toLowerCase().includes(searchQuery.toLowerCase());
          const cc = categoryFilter === 'all' || c.category === categoryFilter;
          return cs && cc;
        });
        return anyChildMatches;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'totalLeads':
            return b.totalLeads - a.totalLeads;
          case 'conversionRate':
            return b.conversionRate - a.conversionRate;
          case 'avgScore':
            return b.avgScore - a.avgScore;
          case 'totalValue':
            return b.totalValue - a.totalValue;
          default:
            return 0;
        }
      });
    return list;
  }, [parents, childrenByParent, searchQuery, categoryFilter, sortBy]);

  const stats = {
    totalLeads: sources.reduce((sum, s) => sum + s.totalLeads, 0),
    qualifiedLeads: sources.reduce((sum, s) => sum + s.qualifiedLeads, 0),
    avgConversion: (sources.length
      ? sources.reduce((sum, s) => sum + s.conversionRate, 0) / sources.length
      : 0
    ).toFixed(1),
    totalValue: sources.reduce((sum, s) => sum + s.totalValue, 0),
  };

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleAddNew() {
    setShowModal(true);
    setNewType('main');
    setNewName('');
    setNewParentId('');
    setNewCategory(categories[0] || 'Events');
    setNewColor('bg-blue-500');
  }

  async function submitNewSource(e: React.FormEvent) {
    e.preventDefault();
    const parentId = newType === 'sub' ? newParentId || null : null;
    const payload = {
      companyId: 'default-company-id',
      name: newName.trim() || 'Untitled Source',
      category: newCategory,
      parentId,
      color: newColor,
    };
    try {
      const created: any = await crmService.leadSources.create(payload);
      const newSource: LeadSource = {
        id: String(created?.id ?? `${Date.now()}`),
        name: created?.name ?? payload.name,
        category: created?.category ?? newCategory,
        parentId: created?.parentId ?? parentId,
        totalLeads: 0,
        qualifiedLeads: 0,
        conversionRate: 0,
        avgScore: 0,
        totalValue: 0,
        avgDealSize: 0,
        lastMonth: 0,
        trend: 'stable',
        trendPercentage: 0,
        color: created?.color ?? newColor,
      };
      setSources((prev) => [...prev, newSource]);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to create lead source:', error);
    }
  }

  async function deleteSource(id: string) {
    if (typeof window !== 'undefined' && !window.confirm('Delete this lead source?')) return;
    try {
      await crmService.leadSources.delete(id);
      setSources((prev) => prev.filter((s) => s.id !== id && s.parentId !== id));
    } catch (error) {
      console.error('Failed to delete lead source:', error);
    }
  }

  return (
    <div className="w-full h-full px-3 py-2 ">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Leads</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalLeads}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Qualified Leads</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.qualifiedLeads}</p>
            </div>
            <Award className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Conversion</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.avgConversion}%</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Total Value</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">
                ${(stats.totalValue / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search lead sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="totalLeads">Sort by: Total Leads</option>
            <option value="conversionRate">Sort by: Conversion Rate</option>
            <option value="avgScore">Sort by: Avg Score</option>
            <option value="totalValue">Sort by: Total Value</option>
          </select>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        </div>
      </div>

      {/* Lead Sources Tree Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Leads</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qualified</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Conversion</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Score</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {treeParents.map((parent) => {
              const kids = childrenByParent[parent.id] || [];
              const isExpanded = expanded[parent.id] ?? true;
              const agg = aggregate(parent);
              // Determine if we should show child rows based on filters
              const showChild = (c: LeadSource) => {
                const cs = c.name.toLowerCase().includes(searchQuery.toLowerCase());
                const cc = categoryFilter === 'all' || c.category === categoryFilter;
                return cs && cc;
              };
              const visibleKids = kids.filter(showChild);
              return (
                <>
                  <tr key={parent.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          onClick={() => toggleExpand(parent.id)}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-600" />
                          )}
                        </button>
                        <div className={`w-3 h-3 rounded-full ${parent.color}`}></div>
                        <span className="font-semibold text-gray-900">{parent.name}</span>
                        <span className="ml-2 text-xs text-gray-500">(Parent)</span>
                        <button
                          onClick={() => {
                            setShowModal(true);
                            setNewType('sub');
                            setNewParentId(parent.id);
                            setNewCategory(parent.category);
                            setNewName('');
                            setNewColor(parent.color);
                          }}
                          className="ml-2 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          + Add sub-source
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                        {parent.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-semibold text-gray-900">{agg.totalLeads}</td>
                    <td className="px-3 py-2">
                      <span className="text-green-600 font-semibold">{agg.qualifiedLeads}</span>
                      <span className="text-gray-400 text-sm ml-1">
                        ({(agg.totalLeads ? ((agg.qualifiedLeads / agg.totalLeads) * 100).toFixed(0) : '0')}%)
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                          <div
                            className={`h-2 rounded-full ${agg.conversionRate >= 70
                                ? 'bg-green-500'
                                : agg.conversionRate >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                            style={{ width: `${agg.conversionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">{agg.conversionRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded ${agg.avgScore >= 70
                            ? 'bg-green-100 text-green-700'
                            : agg.avgScore >= 50
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {agg.avgScore}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-semibold text-gray-900">
                      ${(agg.totalValue / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-1">
                        {agg.trend === 'up' ? (
                          <>
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-600">
                              {agg.trendPercentage.toFixed(1)}%
                            </span>
                          </>
                        ) : agg.trend === 'down' ? (
                          <>
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-semibold text-red-600">
                              {Math.abs(agg.trendPercentage).toFixed(1)}%
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">0.0%</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => router.push(`/crm/leads?source=${parent.name}`)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Leads</span>
                        </button>
                        <button
                          onClick={() => deleteSource(parent.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          aria-label="Delete source"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && visibleKids.map((child) => (
                    <tr key={`${parent.id}-${child.id}`} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2 ml-8">
                          <div className="w-4 h-px bg-gray-300"></div>
                          <div className={`w-3 h-3 rounded-full ${child.color}`}></div>
                          <span className="text-gray-900">{child.name}</span>
                          <span className="ml-2 text-xs text-gray-500">(Sub)</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                          {child.category}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-semibold text-gray-900">{child.totalLeads}</td>
                      <td className="px-3 py-2">
                        <span className="text-green-600 font-semibold">{child.qualifiedLeads}</span>
                        <span className="text-gray-400 text-sm ml-1">
                          ({(child.totalLeads ? ((child.qualifiedLeads / child.totalLeads) * 100).toFixed(0) : '0')}%)
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                            <div
                              className={`h-2 rounded-full ${child.conversionRate >= 70
                                  ? 'bg-green-500'
                                  : child.conversionRate >= 50
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                              style={{ width: `${child.conversionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{child.conversionRate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded ${child.avgScore >= 70
                              ? 'bg-green-100 text-green-700'
                              : child.avgScore >= 50
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {child.avgScore}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-semibold text-gray-900">
                        ${(child.totalValue / 1000).toFixed(0)}K
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-1">
                          {child.trend === 'up' ? (
                            <>
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-600">
                                {child.trendPercentage.toFixed(1)}%
                              </span>
                            </>
                          ) : child.trend === 'down' ? (
                            <>
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-semibold text-red-600">
                                {Math.abs(child.trendPercentage).toFixed(1)}%
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">0.0%</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => router.push(`/crm/leads?source=${child.name}`)}
                            className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Leads</span>
                          </button>
                          <button
                            onClick={() => deleteSource(child.id)}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            aria-label="Delete source"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {treeParents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-6">
          <Globe className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600">No lead sources found matching your criteria</p>
        </div>
      )}

      {/* Add New Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-3 z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Add Lead Source</h3>
              <button onClick={() => setShowModal(false)} aria-label="Close" className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={submitNewSource} className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Social Media, Gitex 2026"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">Type</span>
                <div className="flex gap-2">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="main"
                      checked={newType === 'main'}
                      onChange={() => setNewType('main')}
                    />
                    <span>Main Source</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="sub"
                      checked={newType === 'sub'}
                      onChange={() => setNewType('sub')}
                    />
                    <span>Sub-source</span>
                  </label>
                </div>
              </div>

              {newType === 'sub' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
                  <select
                    value={newParentId}
                    onChange={(e) => setNewParentId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select parent source</option>
                    {parents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'bg-blue-500',
                      'bg-green-500',
                      'bg-purple-500',
                      'bg-indigo-500',
                      'bg-emerald-500',
                      'bg-orange-500',
                      'bg-yellow-500',
                      'bg-pink-500',
                      'bg-cyan-500',
                      'bg-teal-500',
                      'bg-sky-500',
                    ].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNewColor(c)}
                        className={`w-6 h-6 rounded-full ${c} ${newColor === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                        aria-label={c}
                        title={c}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
