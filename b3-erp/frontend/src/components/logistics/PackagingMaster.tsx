'use client';

import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Search, Edit2, Trash2, Box, Ruler, Eye, X,
  Download, Filter, CheckCircle2, AlertTriangle, DollarSign
} from 'lucide-react';
import { logisticsService, PackagingTypeDto } from '@/services/logistics.service';

interface PackagingType {
  id: string;
  code: string;
  name: string;
  type: 'Box' | 'Pallet' | 'Crate' | 'Bag' | 'Container' | 'Roll';
  material: string;
  dimensions: string;
  maxWeight: number;
  cost: number;
  reusable: boolean;
  recyclable: boolean;
  status: 'Active' | 'Inactive' | 'Discontinued';
}

const mockPackaging: PackagingType[] = [
  {
    id: '1',
    code: 'PKG-001',
    name: 'Standard Cardboard Box - Small',
    type: 'Box',
    material: 'Corrugated Cardboard',
    dimensions: '30x20x20 cm',
    maxWeight: 10,
    cost: 25,
    reusable: false,
    recyclable: true,
    status: 'Active'
  },
  {
    id: '2',
    code: 'PKG-002',
    name: 'Standard Cardboard Box - Medium',
    type: 'Box',
    material: 'Corrugated Cardboard',
    dimensions: '40x30x30 cm',
    maxWeight: 25,
    cost: 50,
    reusable: false,
    recyclable: true,
    status: 'Active'
  },
  {
    id: '3',
    code: 'PKG-003',
    name: 'Standard Cardboard Box - Large',
    type: 'Box',
    material: 'Corrugated Cardboard',
    dimensions: '60x40x40 cm',
    maxWeight: 50,
    cost: 85,
    reusable: false,
    recyclable: true,
    status: 'Active'
  },
  {
    id: '4',
    code: 'PKG-004',
    name: 'Wooden Pallet - Standard',
    type: 'Pallet',
    material: 'Heat-Treated Wood',
    dimensions: '120x100x15 cm',
    maxWeight: 1500,
    cost: 450,
    reusable: true,
    recyclable: true,
    status: 'Active'
  },
  {
    id: '5',
    code: 'PKG-005',
    name: 'Plastic Crate - Heavy Duty',
    type: 'Crate',
    material: 'High-Density Polyethylene',
    dimensions: '60x40x35 cm',
    maxWeight: 80,
    cost: 350,
    reusable: true,
    recyclable: true,
    status: 'Active'
  },
  {
    id: '6',
    code: 'PKG-006',
    name: 'Polypropylene Bag - 50kg',
    type: 'Bag',
    material: 'Polypropylene Woven',
    dimensions: '90x60x15 cm',
    maxWeight: 50,
    cost: 15,
    reusable: false,
    recyclable: true,
    status: 'Active'
  },
  {
    id: '7',
    code: 'PKG-007',
    name: 'Shipping Container - 20ft',
    type: 'Container',
    material: 'Corrugated Steel',
    dimensions: '589x235x239 cm',
    maxWeight: 28000,
    cost: 250000,
    reusable: true,
    recyclable: true,
    status: 'Active'
  },
  {
    id: '8',
    code: 'PKG-008',
    name: 'Bubble Wrap Roll',
    type: 'Roll',
    material: 'Polyethylene Air Bubble',
    dimensions: '5000x100x10 cm',
    maxWeight: 5,
    cost: 800,
    reusable: false,
    recyclable: false,
    status: 'Active'
  }
];

const statusColors = {
  'Active': 'bg-green-100 text-green-800 border-green-300',
  'Inactive': 'bg-gray-100 text-gray-800 border-gray-300',
  'Discontinued': 'bg-red-100 text-red-800 border-red-300'
};

export default function PackagingMaster() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPackaging, setSelectedPackaging] = useState<PackagingType | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [packaging, setPackaging] = useState<PackagingType[]>([]);

  const loadPackaging = React.useCallback(async () => {
    try {
      const data = await logisticsService.getPackagingTypes();
      const rows = Array.isArray(data) ? data : [];
      setPackaging(
        rows.map((p: PackagingTypeDto) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          type: (p.type as PackagingType['type']) || 'Box',
          material: p.material || '',
          dimensions: p.dimensions || '',
          maxWeight: Number(p.maxWeight) || 0,
          cost: Number(p.cost) || 0,
          reusable: !!p.reusable,
          recyclable: !!p.recyclable,
          status: (p.status as PackagingType['status']) || 'Active',
        })),
      );
    } catch {
      setPackaging([]);
    }
  }, []);

  useEffect(() => {
    loadPackaging();
  }, [loadPackaging]);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDeletePackaging = async (pkg: PackagingType) => {
    try {
      await logisticsService.deletePackagingType(pkg.id);
      setToast({ message: `${pkg.name} deleted`, type: 'success' });
      loadPackaging();
    } catch {
      setToast({ message: 'Failed to delete packaging type', type: 'error' });
    }
  };

  const filteredPackaging = packaging.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.material.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || pkg.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: packaging.length,
    active: packaging.filter(p => p.status === 'Active').length,
    reusable: packaging.filter(p => p.reusable).length,
    recyclable: packaging.filter(p => p.recyclable).length,
    avgCost: packaging.length ? Math.round(packaging.reduce((sum, p) => sum + p.cost, 0) / packaging.length) : 0,
    totalTypes: new Set(packaging.map(p => p.type)).size
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-[1600px]">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="mb-3">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Packaging Master</h2>
        <p className="text-gray-600">Manage packaging types, materials, and specifications</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reusable</p>
              <p className="text-2xl font-bold text-blue-600">{stats.reusable}</p>
            </div>
            <Box className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recyclable</p>
              <p className="text-2xl font-bold text-green-600">{stats.recyclable}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Cost</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(stats.avgCost)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Types</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalTypes}</p>
            </div>
            <Ruler className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search packaging..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showAdvancedFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            <button
              onClick={() => setToast({ message: 'Exporting packaging data...', type: 'info' })}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Packaging
            </button>
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 border-t border-gray-200">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Box">Box</option>
                <option value="Pallet">Pallet</option>
                <option value="Crate">Crate</option>
                <option value="Bag">Bag</option>
                <option value="Container">Container</option>
                <option value="Roll">Roll</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packaging</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Material</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Weight</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Properties</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPackaging.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                        <div className="text-xs text-gray-500">{pkg.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{pkg.type}</div>
                    <div className="text-xs text-gray-500">{pkg.material}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{pkg.dimensions}</td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">{pkg.maxWeight} kg</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {pkg.reusable && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Reusable</span>
                      )}
                      {pkg.recyclable && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Recyclable</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">{formatCurrency(pkg.cost)}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[pkg.status]}`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPackaging(pkg);
                          setShowViewModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePackaging(pkg)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPackaging.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No packaging found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedPackaging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedPackaging.name}</h2>
                <p className="text-sm text-blue-100">{selectedPackaging.code}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-white hover:text-gray-200">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-2">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="text-base font-medium text-gray-900">{selectedPackaging.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Material</p>
                    <p className="text-base font-medium text-gray-900">{selectedPackaging.material}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dimensions</p>
                    <p className="text-base font-medium text-gray-900">{selectedPackaging.dimensions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Max Weight</p>
                    <p className="text-base font-medium text-gray-900">{selectedPackaging.maxWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cost</p>
                    <p className="text-base font-medium text-gray-900">{formatCurrency(selectedPackaging.cost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-base font-medium text-gray-900">{selectedPackaging.status}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Add New Packaging</h2>
              <button onClick={() => setShowAddModal(false)} className="text-white hover:text-gray-200 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600">Form implementation coming soon...</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
