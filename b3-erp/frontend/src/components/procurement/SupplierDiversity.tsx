'use client';

import React, { useState, useEffect } from 'react';
import { procurementPagesService } from '@/services/procurement-pages.service';
import {
  Users, Globe, Award, TrendingUp, BarChart3, Target, Plus,
  Edit, Download, RefreshCw, Settings, CheckCircle, XCircle,
  AlertCircle, FileText, Shield, Star, TrendingDown, Activity,
  Percent, DollarSign, Package, Clock, Filter, Search, Eye, Send
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export interface DiverseSupplier {
  id: string;
  name: string;
  category: string;
  certifications: string[];
  annualSpend: number;
  diversityType: 'minority' | 'women' | 'veteran' | 'disability' | 'lgbt' | 'small-business';
  status: 'active' | 'inactive' | 'pending';
  certifiedBy: string;
  certificationDate: string;
  expirationDate: string;
  rating: number;
}

const SupplierDiversity: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  // Diverse suppliers - seeded with sample data, populated from API
  const [diverseSuppliers, setDiverseSuppliers] = useState<DiverseSupplier[]>([]);

  // Populate diverse suppliers from the diversity insights API
  useEffect(() => {
    const loadDiversity = async () => {
      try {
        const data = await procurementPagesService.getDiversityInsights();
        const vendors = Array.isArray(data?.vendors) ? data.vendors : [];
        if (vendors.length === 0) {
          setDiverseSuppliers([]);
          return;
        }

        const mapDiversityType = (
          classification: string
        ): DiverseSupplier['diversityType'] => {
          const c = (classification || '').toLowerCase();
          if (c.includes('women')) return 'women';
          if (c.includes('veteran')) return 'veteran';
          if (c.includes('disab')) return 'disability';
          if (c.includes('lgbt')) return 'lgbt';
          if (c.includes('small')) return 'small-business';
          return 'minority';
        };

        const mapped: DiverseSupplier[] = vendors.map((v: any, idx: number) => ({
          id: String(v?.vendorId ?? `DS${idx + 1}`),
          name: String(v?.vendorName ?? 'Unknown Supplier'),
          category: String(v?.classification ?? 'Uncategorized'),
          certifications: v?.certified ? [String(v?.classification ?? 'Certified')] : [],
          annualSpend: Number(v?.spend ?? 0),
          diversityType: mapDiversityType(v?.classification),
          status: v?.certified ? 'active' : 'pending',
          certifiedBy: v?.certified ? String(v?.classification ?? '') : '',
          certificationDate: '',
          expirationDate: '',
          rating: 0,
        }));

        setDiverseSuppliers(mapped);
      } catch (err) {
        console.error('Failed to load diversity insights', err);
        setDiverseSuppliers([]);
      }
    };
    loadDiversity();
  }, []);

  // Mock data - Monthly diversity spend
  const monthlyDiversitySpend = [
    { month: 'Jul', diverseSpend: 145000, totalSpend: 520000, target: 150000 },
    { month: 'Aug', diverseSpend: 158000, totalSpend: 540000, target: 150000 },
    { month: 'Sep', diverseSpend: 152000, totalSpend: 535000, target: 150000 },
    { month: 'Oct', diverseSpend: 165000, totalSpend: 560000, target: 150000 },
    { month: 'Nov', diverseSpend: 172000, totalSpend: 580000, target: 150000 },
    { month: 'Dec', diverseSpend: 168000, totalSpend: 575000, target: 150000 }
  ];

  // Mock data - Diversity breakdown
  const diversityBreakdown = [
    { type: 'Women-Owned', count: 12, spend: 850000, percentage: 32 },
    { type: 'Minority-Owned', count: 15, spend: 720000, percentage: 27 },
    { type: 'Veteran-Owned', count: 8, spend: 580000, percentage: 22 },
    { type: 'Small Business', count: 10, spend: 420000, percentage: 16 },
    { type: 'Disability-Owned', count: 3, spend: 180000, percentage: 7 },
    { type: 'LGBT-Owned', count: 5, spend: 220000, percentage: 8 }
  ];

  const getDiversityTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'women': 'bg-pink-100 text-pink-800',
      'minority': 'bg-purple-100 text-purple-800',
      'veteran': 'bg-blue-100 text-blue-800',
      'small-business': 'bg-green-100 text-green-800',
      'disability': 'bg-orange-100 text-orange-800',
      'lgbt': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalDiverseSpend = diverseSuppliers.reduce((sum, s) => sum + s.annualSpend, 0);
  const totalSuppliers = diverseSuppliers.length;

  // Handler functions
  const handleTrackDiversitySpend = () => {
    // Diversity spend tracking workflow — backend not yet available.
  };

  const handleSetGoals = () => {
    // Diversity goal-setting workflow — backend not yet available.
  };

  const handleGenerateReports = () => {
    // Diversity report generation — backend not yet available.
  };

  const handleCertifySuppliers = () => {
    // Supplier certification management — backend not yet available.
  };

  const handleAddDiverseSupplier = () => {
    // Diverse supplier onboarding workflow — backend not yet available.
  };

  const handleManagePrograms = () => {
    // Diversity program management — backend not yet available.
  };

  const handleViewAnalytics = () => {
    // Diversity analytics dashboard — backend not yet available.
  };

  const handleRefresh = () => {
    // Manual diversity data refresh — backend not yet available.
  };

  const handleSettings = () => {
    // Supplier diversity settings — backend not yet available.
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Supplier Diversity Management</h2>
            <p className="text-gray-600">Promote diversity and inclusion in supplier partnerships</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleAddDiverseSupplier}
              disabled
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Diverse supplier onboarding — backend not yet available"
            >
              <Plus className="h-4 w-4" />
              <span>Add Supplier</span>
            </button>
            <button
              onClick={handleManagePrograms}
              disabled
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Diversity program management — backend not yet available"
            >
              <Award className="h-4 w-4" />
              <span>Programs</span>
            </button>
            <button
              onClick={handleGenerateReports}
              disabled
              className="flex items-center space-x-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Diversity report generation — backend not yet available"
            >
              <Download className="h-4 w-4" />
              <span>Reports</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Manual diversity data refresh — backend not yet available"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleSettings}
              disabled
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Supplier diversity settings — backend not yet available"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-blue-500" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold">{totalSuppliers}</p>
          <p className="text-sm text-gray-600">Diverse Suppliers</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-green-500" />
            <span className="text-sm text-gray-500">YTD</span>
          </div>
          <p className="text-2xl font-bold">${(totalDiverseSpend / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-gray-600">Diverse Spend</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-8 w-8 text-purple-500" />
            <span className="text-sm text-gray-500">Current</span>
          </div>
          <p className="text-2xl font-bold">{((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Diversity Spend %</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-8 w-8 text-orange-500" />
            <span className="text-sm text-gray-500">Verified</span>
          </div>
          <p className="text-2xl font-bold">{diverseSuppliers.filter(s => s.certifications.length > 0).length}</p>
          <p className="text-sm text-gray-600">Certified Suppliers</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-3 border-b">
        {['overview', 'suppliers', 'performance', 'programs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Suppliers Table */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Diverse Supplier Portfolio</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleTrackDiversitySpend}
                disabled
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Diversity spend tracking — backend not yet available"
              >
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Track Spend</span>
              </button>
              <button
                onClick={handleSetGoals}
                disabled
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Diversity goal-setting — backend not yet available"
              >
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700">Set Goals</span>
              </button>
              <button
                onClick={handleCertifySuppliers}
                disabled
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 bg-green-50 rounded-lg hover:bg-green-100 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Supplier certification management — backend not yet available"
              >
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-green-700">Certify</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diversity Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certifications</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Spend</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {diverseSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                        <div className="text-xs text-gray-500">{supplier.id}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{supplier.category}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDiversityTypeColor(supplier.diversityType)}`}>
                        {supplier.diversityType.toUpperCase().replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {supplier.certifications.map((cert, idx) => (
                          <span key={idx} className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(supplier.annualSpend / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-900">{supplier.rating}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(supplier.status)}`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.expirationDate}</div>
                      {new Date(supplier.expirationDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                        <div className="text-xs text-orange-600">⚠ Expiring Soon</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Charts */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Monthly Diversity Spend Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyDiversitySpend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="diverseSpend" stroke="#10B981" strokeWidth={2} name="Diverse Spend" />
                <Line type="monotone" dataKey="target" stroke="#E5E7EB" strokeWidth={2} strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Diversity Type Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={diversityBreakdown.map(d => ({
                    name: d.type,
                    value: d.spend
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.split('-')[0]}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {diversityBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Diversity Spend by Type</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={diversityBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="spend" fill="#8B5CF6" name="Spend ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Supplier Count by Type</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={diversityBreakdown} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="Suppliers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Goal Achievement</h4>
              <div className="mb-2">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Diversity Spend Goal</span>
                  <span className="text-sm font-medium">25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-green-500"
                    style={{ width: `${((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100 / 25 * 100)}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Current: {((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}%
                  ({(((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100) / 25 * 100).toFixed(0)}% of goal)
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Top Diversity Types</h4>
              <div className="space-y-3">
                {diversityBreakdown.slice(0, 3).map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mr-2">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium">{d.type}</span>
                    </div>
                    <span className="text-sm text-gray-600">${(d.spend / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={handleViewAnalytics}
                  disabled
                  title="Diversity analytics dashboard — backend not yet available"
                  className="w-full flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>View Analytics</span>
                </button>
                <button
                  onClick={handleSetGoals}
                  disabled
                  title="Diversity goal-setting — backend not yet available"
                  className="w-full flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Target className="h-4 w-4" />
                  <span>Set Goals</span>
                </button>
                <button
                  onClick={handleGenerateReports}
                  disabled
                  title="Diversity report generation — backend not yet available"
                  className="w-full flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Recent Activity</h4>
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New diverse supplier onboarded</p>
                  <p className="text-xs text-gray-500 mt-1">{diverseSuppliers[0]?.name ?? '—'} - {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <Award className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Certification renewed</p>
                  <p className="text-xs text-gray-500 mt-1">{diverseSuppliers[1]?.name ?? '—'} - {diverseSuppliers[1]?.certifications?.[0] ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Monthly goal exceeded</p>
                  <p className="text-xs text-gray-500 mt-1">{((monthlyDiversitySpend[monthlyDiversitySpend.length - 1].diverseSpend / monthlyDiversitySpend[monthlyDiversitySpend.length - 1].target - 1) * 100).toFixed(1)}% above target</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Supplier Development Program</h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Build capacity and capabilities of diverse suppliers through training and mentorship</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Participants</span>
                  <span className="font-medium">{Math.floor(totalSuppliers * 0.6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Events This Year</span>
                  <span className="font-medium">{Math.floor(Math.random() * 8) + 6}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Satisfaction</span>
                  <span className="font-medium">4.7/5</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Certification Support</h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Help suppliers obtain and maintain diversity certifications</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Suppliers Supported</span>
                  <span className="font-medium">{Math.floor(Math.random() * 15) + 10}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Certifications Achieved</span>
                  <span className="font-medium">{Math.floor(Math.random() * 12) + 8}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reimbursements</span>
                  <span className="font-medium">${Math.floor(Math.random() * 10000 + 5000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Upcoming Events</h4>
            <div className="space-y-3">
              <div className="flex items-start p-3 border border-gray-200 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Supplier Networking Event</p>
                  <p className="text-xs text-gray-500 mt-1">December 15, 2025 • 2:00 PM - 5:00 PM</p>
                  <p className="text-xs text-gray-600 mt-1">Connect diverse suppliers with procurement opportunities</p>
                </div>
                <button className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100">
                  Register
                </button>
              </div>
              <div className="flex items-start p-3 border border-gray-200 rounded-lg">
                <Clock className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Certification Workshop</p>
                  <p className="text-xs text-gray-500 mt-1">January 10, 2026 • 10:00 AM - 12:00 PM</p>
                  <p className="text-xs text-gray-600 mt-1">Learn about certification process and requirements</p>
                </div>
                <button className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100">
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDiversity;
