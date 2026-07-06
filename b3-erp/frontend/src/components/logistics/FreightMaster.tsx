'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign, Plus, Search, Edit2, Trash2, TrendingUp, Package, Eye, X,
  Download, Filter, Truck, Ship, Plane, Train, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { logisticsService } from '@/services/logistics.service';

interface FreightRate {
  id: string;
  code: string;
  name: string;
  mode: 'Road' | 'Rail' | 'Air' | 'Sea';
  serviceLevel: 'Express' | 'Standard' | 'Economy';
  baseRate: number;
  perKmRate: number;
  perKgRate: number;
  minimumCharge: number;
  maximumWeight: number;
  fuelSurcharge: number;
  currency: string;
  validFrom: Date;
  validTo: Date;
  zones: string[];
  status: 'Active' | 'Inactive' | 'Expired';
}

const mockFreightRates: FreightRate[] = [
  {
    id: '1',
    code: 'FRT-001',
    name: 'Domestic Road - Express',
    mode: 'Road',
    serviceLevel: 'Express',
    baseRate: 1000,
    perKmRate: 15,
    perKgRate: 2.5,
    minimumCharge: 1000,
    maximumWeight: 5000,
    fuelSurcharge: 12,
    currency: 'INR',
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2025-12-31'),
    zones: ['North', 'West'],
    status: 'Active'
  },
  {
    id: '2',
    code: 'FRT-002',
    name: 'Domestic Road - Standard',
    mode: 'Road',
    serviceLevel: 'Standard',
    baseRate: 500,
    perKmRate: 12,
    perKgRate: 1.5,
    minimumCharge: 500,
    maximumWeight: 10000,
    fuelSurcharge: 10,
    currency: 'INR',
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2025-12-31'),
    zones: ['All India'],
    status: 'Active'
  },
  {
    id: '3',
    code: 'FRT-003',
    name: 'Air Freight - Express',
    mode: 'Air',
    serviceLevel: 'Express',
    baseRate: 5000,
    perKmRate: 50,
    perKgRate: 25,
    minimumCharge: 5000,
    maximumWeight: 1000,
    fuelSurcharge: 20,
    currency: 'INR',
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2025-12-31'),
    zones: ['Metro Cities'],
    status: 'Active'
  },
  {
    id: '4',
    code: 'FRT-004',
    name: 'Sea Freight - Economy',
    mode: 'Sea',
    serviceLevel: 'Economy',
    baseRate: 10000,
    perKmRate: 5,
    perKgRate: 0.5,
    minimumCharge: 10000,
    maximumWeight: 50000,
    fuelSurcharge: 8,
    currency: 'INR',
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2025-12-31'),
    zones: ['Coastal'],
    status: 'Active'
  },
  {
    id: '5',
    code: 'FRT-005',
    name: 'Rail Freight - Standard',
    mode: 'Rail',
    serviceLevel: 'Standard',
    baseRate: 800,
    perKmRate: 8,
    perKgRate: 1.0,
    minimumCharge: 800,
    maximumWeight: 20000,
    fuelSurcharge: 5,
    currency: 'INR',
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2025-12-31'),
    zones: ['Rail Connected Cities'],
    status: 'Active'
  },
  {
    id: '6',
    code: 'FRT-006',
    name: 'Road - Economy',
    mode: 'Road',
    serviceLevel: 'Economy',
    baseRate: 300,
    perKmRate: 8,
    perKgRate: 1.0,
    minimumCharge: 300,
    maximumWeight: 15000,
    fuelSurcharge: 7,
    currency: 'INR',
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2025-12-31'),
    zones: ['Regional'],
    status: 'Active'
  },
  {
    id: '7',
    code: 'FRT-007',
    name: 'Air Freight - Standard',
    mode: 'Air',
    serviceLevel: 'Standard',
    baseRate: 3000,
    perKmRate: 30,
    perKgRate: 15,
    minimumCharge: 3000,
    maximumWeight: 2000,
    fuelSurcharge: 15,
    currency: 'INR',
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2025-12-31'),
    zones: ['Major Cities'],
    status: 'Active'
  },
  {
    id: '8',
    code: 'FRT-008',
    name: 'Old Rate - Expired',
    mode: 'Road',
    serviceLevel: 'Standard',
    baseRate: 400,
    perKmRate: 10,
    perKgRate: 1.2,
    minimumCharge: 400,
    maximumWeight: 8000,
    fuelSurcharge: 8,
    currency: 'INR',
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    zones: ['All India'],
    status: 'Expired'
  }
];

const statusColors = {
  'Active': 'bg-green-100 text-green-800 border-green-300',
  'Inactive': 'bg-gray-100 text-gray-800 border-gray-300',
  'Expired': 'bg-red-100 text-red-800 border-red-300'
};

const modeIcons = {
  'Road': Truck,
  'Rail': Train,
  'Air': Plane,
  'Sea': Ship
};

export default function FreightMaster() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [serviceLevelFilter, setServiceLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRate, setSelectedRate] = useState<FreightRate | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [freightRates, setFreightRates] = useState<FreightRate[]>([]);

  const mapRow = (row: any): FreightRate => ({
    id: String(row?.id ?? row?._id ?? ''),
    code: row?.code || row?.chargeCode || '',
    name: row?.name || row?.chargeType || row?.description || '',
    mode: (row?.mode || 'Road') as FreightRate['mode'],
    serviceLevel: (row?.serviceLevel || 'Standard') as FreightRate['serviceLevel'],
    baseRate: Number(row?.baseRate ?? row?.amount ?? 0) || 0,
    perKmRate: Number(row?.perKmRate ?? 0) || 0,
    perKgRate: Number(row?.perKgRate ?? 0) || 0,
    minimumCharge: Number(row?.minimumCharge ?? 0) || 0,
    maximumWeight: Number(row?.maximumWeight ?? 0) || 0,
    fuelSurcharge: Number(row?.fuelSurcharge ?? 0) || 0,
    currency: row?.currency || 'INR',
    validFrom: row?.validFrom ? new Date(row.validFrom) : new Date(),
    validTo: row?.validTo ? new Date(row.validTo) : new Date(),
    zones: Array.isArray(row?.zones) ? row.zones : [],
    status: (row?.status || 'Active') as FreightRate['status'],
  });

  const loadFreightRates = async () => {
    try {
      const data = await logisticsService.getFreightCharges();
      setFreightRates(Array.isArray(data) ? data.map(mapRow) : []);
    } catch {
      setFreightRates([]);
    }
  };

  useEffect(() => {
    loadFreightRates();
  }, []);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filteredRates = freightRates.filter((rate) => {
    const matchesSearch =
      rate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = modeFilter === 'all' || rate.mode === modeFilter;
    const matchesServiceLevel = serviceLevelFilter === 'all' || rate.serviceLevel === serviceLevelFilter;
    const matchesStatus = statusFilter === 'all' || rate.status === statusFilter;

    return matchesSearch && matchesMode && matchesServiceLevel && matchesStatus;
  });

  const activeRates = freightRates.filter(r => r.status === 'Active');
  const stats = {
    total: freightRates.length,
    active: activeRates.length,
    inactive: freightRates.filter(r => r.status === 'Inactive').length,
    expired: freightRates.filter(r => r.status === 'Expired').length,
    avgBaseRate: activeRates.length ? Math.round(activeRates.reduce((sum, r) => sum + r.baseRate, 0) / activeRates.length) : 0,
    avgPerKm: activeRates.length ? (activeRates.reduce((sum, r) => sum + r.perKmRate, 0) / activeRates.length).toFixed(2) : '0.00'
  };

  const handleView = (rate: FreightRate) => {
    setSelectedRate(rate);
    setShowViewModal(true);
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
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="mb-3">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Freight Master</h2>
        <p className="text-gray-600">Manage shipping charges and freight rate structures</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Rates</p>
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
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-red-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <X className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Base Rate</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(stats.avgBaseRate)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Per Km</p>
              <p className="text-xl font-bold text-orange-600">₹{stats.avgPerKm}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
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
                placeholder="Search freight rates..."
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
              onClick={() => setToast({ message: 'Exporting freight data...', type: 'info' })}
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
              Add Rate
            </button>
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-4 border-t border-gray-200">
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Modes</option>
                <option value="Road">Road</option>
                <option value="Rail">Rail</option>
                <option value="Air">Air</option>
                <option value="Sea">Sea</option>
              </select>

              <select
                value={serviceLevelFilter}
                onChange={(e) => setServiceLevelFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Service Levels</option>
                <option value="Express">Express</option>
                <option value="Standard">Standard</option>
                <option value="Economy">Economy</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Expired">Expired</option>
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Freight Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode & Service</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Per Km</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Per Kg</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRates.map((rate) => {
                const ModeIcon = modeIcons[rate.mode];
                return (
                  <tr key={rate.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-3 py-2">
                      <div className="text-sm font-medium text-gray-900">{rate.name}</div>
                      <div className="text-xs text-gray-500">{rate.code}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <ModeIcon className="h-4 w-4 text-gray-600" />
                        <div>
                          <div className="text-sm text-gray-900">{rate.mode}</div>
                          <div className="text-xs text-gray-500">{rate.serviceLevel}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">{formatCurrency(rate.baseRate)}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">₹{rate.perKmRate}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">₹{rate.perKgRate}</td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-900">{rate.validFrom.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="text-xs text-gray-500">to {rate.validTo.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[rate.status]}`}>
                        {rate.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(rate)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRate(rate);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await logisticsService.deleteFreightCharge(rate.id);
                              await loadFreightRates();
                              setToast({ message: `Rate ${rate.name} deleted`, type: 'success' });
                            } catch {
                              setToast({ message: `Failed to delete ${rate.name}`, type: 'error' });
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRates.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No freight rates found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedRate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedRate.name}</h2>
                <p className="text-sm text-blue-100">{selectedRate.code}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-white hover:text-gray-200">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border ${statusColors[selectedRate.status]}`}>
                  {selectedRate.status}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Rate Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Mode</p>
                    <p className="text-base font-medium text-gray-900">{selectedRate.mode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Service Level</p>
                    <p className="text-base font-medium text-gray-900">{selectedRate.serviceLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Base Rate</p>
                    <p className="text-base font-medium text-gray-900">{formatCurrency(selectedRate.baseRate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Minimum Charge</p>
                    <p className="text-base font-medium text-gray-900">{formatCurrency(selectedRate.minimumCharge)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Per Km Rate</p>
                    <p className="text-base font-medium text-gray-900">₹{selectedRate.perKmRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Per Kg Rate</p>
                    <p className="text-base font-medium text-gray-900">₹{selectedRate.perKgRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Maximum Weight</p>
                    <p className="text-base font-medium text-gray-900">{selectedRate.maximumWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fuel Surcharge</p>
                    <p className="text-base font-medium text-gray-900">{selectedRate.fuelSurcharge}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Validity Period</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Valid From</p>
                    <p className="text-base font-medium text-gray-900">{selectedRate.validFrom.toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valid To</p>
                    <p className="text-base font-medium text-gray-900">{selectedRate.validTo.toLocaleDateString('en-IN')}</p>
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

      {/* Add/Edit Modal Placeholder */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {showAddModal ? 'Add New Freight Rate' : 'Edit Freight Rate'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600">Form implementation coming soon...</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
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
