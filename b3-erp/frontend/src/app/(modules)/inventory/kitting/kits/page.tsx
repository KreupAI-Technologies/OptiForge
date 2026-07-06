'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import {
  Package,
  Boxes,
  Calendar,
  User,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Plus,
  CheckCircle,
  BarChart3
} from 'lucide-react';

interface Kit {
  id: string;
  kitNumber: string;
  kitName: string;
  category: string;
  componentCount: number;
  outputQuantity: number;
  outputUOM: string;
  status: 'active' | 'inactive' | 'draft';
  lastAssembled?: string;
  assemblyCount: number;
  createdBy: string;
  createdDate: string;
}

export default function KitsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');

  const [kits, setKits] = useState<Kit[]>([]);

  const loadKits = async () => {
    try {
      const rows = await inventoryService.getKits();
      if (!Array.isArray(rows)) {
        setKits([]);
        return;
      }
      const mapped: Kit[] = rows.map((row: any) => ({
        id: String(row?.id ?? ''),
        kitNumber: row?.kitNumber ?? '',
        kitName: row?.kitName ?? '',
        category: row?.category ?? '',
        componentCount: row?.componentCount ?? 0,
        outputQuantity: row?.outputQuantity ?? 0,
        outputUOM: row?.outputUOM ?? '',
        status: (row?.status ?? 'draft') as Kit['status'],
        lastAssembled: row?.lastAssembled ?? undefined,
        assemblyCount: row?.assemblyCount ?? 0,
        createdBy: row?.createdBy ?? '',
        createdDate: row?.createdAt ?? row?.createdDate ?? ''
      }));
      setKits(mapped);
    } catch (err) {
      console.error('Failed to load kits', err);
      setKits([]);
    }
  };

  useEffect(() => {
    loadKits();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'inactive':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'draft':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Sub-Assembly': 'text-blue-600 bg-blue-50 border-blue-200',
      'Electronics': 'text-purple-600 bg-purple-50 border-purple-200',
      'Maintenance': 'text-orange-600 bg-orange-50 border-orange-200',
      'Consumables': 'text-green-600 bg-green-50 border-green-200',
      'Spares': 'text-cyan-600 bg-cyan-50 border-cyan-200',
      'Safety': 'text-red-600 bg-red-50 border-red-200',
      'Prototype': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[category] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const totalKits = kits.filter(k => k.status === 'active').length;
  const totalAssemblies = kits.reduce((sum, k) => sum + k.assemblyCount, 0);
  const avgComponents = kits.length > 0 ? Math.round(kits.reduce((sum, k) => sum + k.componentCount, 0) / kits.length) : 0;
  const mostUsedKit = kits.length > 0 ? kits.reduce((max, k) => k.assemblyCount > max.assemblyCount ? k : max, kits[0]) : undefined;

  const filteredKits = kits.filter(kit => {
    const matchesSearch = kit.kitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         kit.kitName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || kit.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || kit.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Boxes className="w-8 h-8 text-blue-600" />
            <span>Kitting - Kit Definitions</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage kit definitions and component lists</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Kit</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Boxes className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{totalKits}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Active Kits</div>
          <div className="text-xs text-blue-600 mt-1">Total Definitions</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{totalAssemblies}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Total Assemblies</div>
          <div className="text-xs text-green-600 mt-1">All Time</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{avgComponents}</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Avg Components</div>
          <div className="text-xs text-purple-600 mt-1">Per Kit</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{mostUsedKit?.assemblyCount ?? 0}</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Most Used Kit</div>
          <div className="text-xs text-orange-600 mt-1 truncate">{mostUsedKit?.kitName ?? '—'}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search kits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Sub-Assembly">Sub-Assembly</option>
            <option value="Electronics">Electronics</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Consumables">Consumables</option>
            <option value="Spares">Spares</option>
            <option value="Safety">Safety</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Kits Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kit Number</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kit Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Components</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assembly Count</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Assembled</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKits.map((kit) => (
                <tr key={kit.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {kit.kitNumber}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    <div className="font-medium">{kit.kitName}</div>
                    <div className="text-xs text-gray-500">
                      Created by {kit.createdBy} on {kit.createdDate}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(kit.category)}`}>
                      {kit.category}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{kit.componentCount} items</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-medium">{kit.outputQuantity} {kit.outputUOM}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{kit.assemblyCount}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    {kit.lastAssembled ? (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{kit.lastAssembled}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Never</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(kit.status)}`}>
                      {kit.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Eye className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">View</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredKits.length === 0 && (
          <div className="text-center py-12">
            <Boxes className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">No kits found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
