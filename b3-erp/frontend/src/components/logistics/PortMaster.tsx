'use client';

import React, { useState, useEffect } from 'react';
import { Anchor, Plus, Search, Edit2, Trash2, MapPin, Globe, Eye, X, Download, Filter, CheckCircle2, Ship, Plane } from 'lucide-react';
import { logisticsService, PortDto } from '@/services/logistics.service';

interface Port {
  id: string;
  code: string;
  name: string;
  portCode: string;
  type: 'Seaport' | 'Airport' | 'Dry Port' | 'Inland Port';
  country: string;
  state: string;
  city: string;
  facilities: string[];
  customsAvailable: boolean;
  status: 'Active' | 'Inactive' | 'Under Maintenance';
}

const mockPorts: Port[] = [
  {
    id: '1',
    code: 'PORT-001',
    name: 'JNPT - Jawaharlal Nehru Port',
    portCode: 'INNSA',
    type: 'Seaport',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    facilities: ['Container', 'Bulk', 'RoRo', 'Liquid'],
    customsAvailable: true,
    status: 'Active'
  },
  {
    id: '2',
    code: 'PORT-002',
    name: 'Chennai Port',
    portCode: 'INMAA',
    type: 'Seaport',
    country: 'India',
    state: 'Tamil Nadu',
    city: 'Chennai',
    facilities: ['Container', 'Bulk', 'General Cargo'],
    customsAvailable: true,
    status: 'Active'
  },
  {
    id: '3',
    code: 'PORT-003',
    name: 'Indira Gandhi International Airport',
    portCode: 'DEL',
    type: 'Airport',
    country: 'India',
    state: 'Delhi',
    city: 'New Delhi',
    facilities: ['Air Cargo', 'Express', 'Perishables'],
    customsAvailable: true,
    status: 'Active'
  },
  {
    id: '4',
    code: 'PORT-004',
    name: 'Mundra Port',
    portCode: 'INMUN',
    type: 'Seaport',
    country: 'India',
    state: 'Gujarat',
    city: 'Mundra',
    facilities: ['Container', 'Bulk', 'Coal', 'Liquid'],
    customsAvailable: true,
    status: 'Active'
  },
  {
    id: '5',
    code: 'PORT-005',
    name: 'Kempegowda International Airport',
    portCode: 'BLR',
    type: 'Airport',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    facilities: ['Air Cargo', 'Express'],
    customsAvailable: true,
    status: 'Active'
  },
  {
    id: '6',
    code: 'PORT-006',
    name: 'Kolkata Port',
    portCode: 'INCCU',
    type: 'Seaport',
    country: 'India',
    state: 'West Bengal',
    city: 'Kolkata',
    facilities: ['Container', 'General Cargo'],
    customsAvailable: true,
    status: 'Active'
  },
  {
    id: '7',
    code: 'PORT-007',
    name: 'ICD Tughlakabad',
    portCode: 'INTUG',
    type: 'Dry Port',
    country: 'India',
    state: 'Delhi',
    city: 'New Delhi',
    facilities: ['Container', 'Rail'],
    customsAvailable: true,
    status: 'Active'
  },
  {
    id: '8',
    code: 'PORT-008',
    name: 'Visakhapatnam Port',
    portCode: 'INVTZ',
    type: 'Seaport',
    country: 'India',
    state: 'Andhra Pradesh',
    city: 'Visakhapatnam',
    facilities: ['Container', 'Bulk', 'Iron Ore'],
    customsAvailable: true,
    status: 'Active'
  }
];

const statusColors = {
  'Active': 'bg-green-100 text-green-800 border-green-300',
  'Inactive': 'bg-gray-100 text-gray-800 border-gray-300',
  'Under Maintenance': 'bg-yellow-100 text-yellow-800 border-yellow-300'
};

export default function PortMaster() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [ports, setPorts] = useState<Port[]>([]);

  const loadPorts = React.useCallback(async () => {
    try {
      const data = await logisticsService.getPorts();
      const rows = Array.isArray(data) ? data : [];
      setPorts(
        rows.map((p: PortDto) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          portCode: p.portCode || '',
          type: (p.type as Port['type']) || 'Seaport',
          country: p.country || '',
          state: p.state || '',
          city: p.city || '',
          facilities: Array.isArray(p.facilities) ? p.facilities : [],
          customsAvailable: !!p.customsAvailable,
          status: (p.status as Port['status']) || 'Active',
        })),
      );
    } catch {
      setPorts([]);
    }
  }, []);

  useEffect(() => {
    loadPorts();
  }, [loadPorts]);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDeletePort = async (port: Port) => {
    try {
      await logisticsService.deletePort(port.id);
      setToast({ message: `${port.name} deleted`, type: 'success' });
      loadPorts();
    } catch {
      setToast({ message: 'Failed to delete port', type: 'error' });
    }
  };

  const filteredPorts = ports.filter((port) => {
    const matchesSearch =
      port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.portCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || port.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || port.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: ports.length,
    active: ports.filter(p => p.status === 'Active').length,
    seaports: ports.filter(p => p.type === 'Seaport').length,
    airports: ports.filter(p => p.type === 'Airport').length,
    dryPorts: ports.filter(p => p.type === 'Dry Port').length,
    withCustoms: ports.filter(p => p.customsAvailable).length
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Port Master</h2>
        <p className="text-gray-600">Manage import/export port locations and facilities</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Anchor className="h-8 w-8 text-blue-600" />
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
              <p className="text-sm text-gray-600">Seaports</p>
              <p className="text-2xl font-bold text-blue-600">{stats.seaports}</p>
            </div>
            <Ship className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Airports</p>
              <p className="text-2xl font-bold text-purple-600">{stats.airports}</p>
            </div>
            <Plane className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dry Ports</p>
              <p className="text-2xl font-bold text-orange-600">{stats.dryPorts}</p>
            </div>
            <MapPin className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Customs</p>
              <p className="text-2xl font-bold text-green-600">{stats.withCustoms}</p>
            </div>
            <Globe className="h-8 w-8 text-green-600" />
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
                placeholder="Search ports..."
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
              onClick={() => setToast({ message: 'Exporting port data...', type: 'info' })}
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
              Add Port
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
                <option value="Seaport">Seaport</option>
                <option value="Airport">Airport</option>
                <option value="Dry Port">Dry Port</option>
                <option value="Inland Port">Inland Port</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Under Maintenance">Under Maintenance</option>
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Code</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facilities</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customs</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPorts.map((port) => (
                <tr key={port.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Anchor className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{port.name}</div>
                        <div className="text-xs text-gray-500">{port.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{port.type}</div>
                    <div className="text-xs text-gray-500">{port.portCode}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{port.city}, {port.state}</div>
                    <div className="text-xs text-gray-500">{port.country}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {port.facilities.slice(0, 2).map((facility, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {facility}
                        </span>
                      ))}
                      {port.facilities.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          +{port.facilities.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {port.customsAvailable ? (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Available
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Not Available</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[port.status]}`}>
                      {port.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPort(port);
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
                        onClick={() => handleDeletePort(port)}
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

        {filteredPorts.length === 0 && (
          <div className="text-center py-12">
            <Anchor className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No ports found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedPort && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedPort.name}</h2>
                <p className="text-sm text-blue-100">{selectedPort.code}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-white hover:text-gray-200">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-2">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Port Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Port Code</p>
                    <p className="text-base font-medium text-gray-900">{selectedPort.portCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="text-base font-medium text-gray-900">{selectedPort.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">City</p>
                    <p className="text-base font-medium text-gray-900">{selectedPort.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">State</p>
                    <p className="text-base font-medium text-gray-900">{selectedPort.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Country</p>
                    <p className="text-base font-medium text-gray-900">{selectedPort.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customs Available</p>
                    <p className="text-base font-medium text-gray-900">{selectedPort.customsAvailable ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPort.facilities.map((facility, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                      {facility}
                    </span>
                  ))}
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
              <h2 className="text-2xl font-bold text-white">Add New Port</h2>
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
