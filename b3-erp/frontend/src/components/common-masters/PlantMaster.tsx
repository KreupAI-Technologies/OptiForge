'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Factory, Plus, Search, Filter, Edit2, Trash2, MoreVertical,
  MapPin, Phone, Mail, Calendar, Users, Package, Truck,
  Gauge, Zap, Thermometer, Shield, AlertTriangle, Activity,
  CheckCircle2, XCircle, AlertCircle, TrendingUp, Clock,
  BarChart2, Settings, Wrench, DollarSign, Building2
} from 'lucide-react';
import { commonMastersService, Plant as ApiPlant } from '@/services/common-masters.service';

interface Plant {
  id: string;
  code: string;
  name: string;
  type: 'Manufacturing' | 'Assembly' | 'Processing' | 'Packaging' | 'Distribution';
  companyId: string;
  companyName: string;
  branchId: string;
  branchName: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone: string;
    altPhone?: string;
    fax?: string;
    email: string;
    plantManager: string;
    productionHead: string;
  };
  capacity: {
    installed: number;
    utilized: number;
    available: number;
    unitOfMeasure: string;
    shiftCapacity: number;
    annualCapacity: number;
    efficiency: number;
  };
  infrastructure: {
    totalArea: number;
    coveredArea: number;
    openArea: number;
    warehouseArea: number;
    productionFloors: number;
    loadingBays: number;
    powerCapacity: string;
    waterCapacity: string;
    wasteManagement: string;
  };
  production: {
    productLines: string[];
    processes: string[];
    technologies: string[];
    certifications: string[];
    qualityStandards: string[];
  };
  workforce: {
    totalEmployees: number;
    shifts: number;
    skilled: number;
    semiSkilled: number;
    unskilled: number;
    contractual: number;
    administrative: number;
  };
  equipment: {
    totalMachines: number;
    cnc: number;
    conventional: number;
    automated: number;
    robots: number;
    avgAge: number;
    maintenanceType: 'Preventive' | 'Predictive' | 'Reactive' | 'Mixed';
  };
  performance: {
    oee: number;
    productivity: number;
    quality: number;
    uptime: number;
    cycleTime: number;
    leadTime: number;
    defectRate: number;
  };
  costs: {
    operatingCost: number;
    maintenanceCost: number;
    energyCost: number;
    laborCost: number;
    overheadRate: number;
    currency: string;
  };
  compliance: {
    licenses: string[];
    permits: string[];
    environmentClearance: boolean;
    safetyRating: string;
    lastAuditDate: Date;
    nextAuditDate: Date;
  };
  integration: {
    erpEnabled: boolean;
    mesEnabled: boolean;
    scadaEnabled: boolean;
    iotEnabled: boolean;
    warehouses: string[];
    costCenters: string[];
  };
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Expansion';
  metadata: {
    establishedDate: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  };
}

// Maps a sparse backend Plant record onto the rich local Plant interface.
// Backend only provides code/name/companyId/branchId/isActive/timestamps; the
// remaining UI-only fields are filled with sensible empty defaults so the
// existing JSX renders without changes.
const mapApiPlant = (p: ApiPlant): Plant => ({
  id: p.id,
  code: p.code,
  name: p.name,
  type: 'Manufacturing',
  companyId: p.companyId,
  companyName: '',
  branchId: p.branchId || '',
  branchName: p.branch?.name || '',
  address: {
    line1: '',
    city: '',
    state: '',
    country: '',
    pincode: ''
  },
  contact: {
    phone: '',
    email: '',
    plantManager: '',
    productionHead: ''
  },
  capacity: {
    installed: 0,
    utilized: 0,
    available: 0,
    unitOfMeasure: 'units/day',
    shiftCapacity: 0,
    annualCapacity: 0,
    efficiency: 0
  },
  infrastructure: {
    totalArea: 0,
    coveredArea: 0,
    openArea: 0,
    warehouseArea: 0,
    productionFloors: 0,
    loadingBays: 0,
    powerCapacity: '',
    waterCapacity: '',
    wasteManagement: ''
  },
  production: {
    productLines: [],
    processes: [],
    technologies: [],
    certifications: [],
    qualityStandards: []
  },
  workforce: {
    totalEmployees: 0,
    shifts: 0,
    skilled: 0,
    semiSkilled: 0,
    unskilled: 0,
    contractual: 0,
    administrative: 0
  },
  equipment: {
    totalMachines: 0,
    cnc: 0,
    conventional: 0,
    automated: 0,
    robots: 0,
    avgAge: 0,
    maintenanceType: 'Preventive'
  },
  performance: {
    oee: 0,
    productivity: 0,
    quality: 0,
    uptime: 0,
    cycleTime: 0,
    leadTime: 0,
    defectRate: 0
  },
  costs: {
    operatingCost: 0,
    maintenanceCost: 0,
    energyCost: 0,
    laborCost: 0,
    overheadRate: 0,
    currency: 'INR'
  },
  compliance: {
    licenses: [],
    permits: [],
    environmentClearance: false,
    safetyRating: '',
    lastAuditDate: new Date(),
    nextAuditDate: new Date()
  },
  integration: {
    erpEnabled: false,
    mesEnabled: false,
    scadaEnabled: false,
    iotEnabled: false,
    warehouses: [],
    costCenters: []
  },
  status: p.isActive ? 'Active' : 'Inactive',
  metadata: {
    establishedDate: new Date(),
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    createdBy: '',
    updatedBy: ''
  }
});

export default function PlantMaster() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentTab, setCurrentTab] = useState('basic');

  const loadPlants = async () => {
    try {
      const data = await commonMastersService.getAllPlants();
      setPlants(data.map(mapApiPlant));
    } catch (error) {
      console.error('Failed to load plants:', error);
    }
  };

  useEffect(() => {
    loadPlants();
  }, []);

  const handleEdit = (plant: Plant) => {
    setSelectedPlant(plant);
    setIsModalOpen(true);
    setCurrentTab('basic');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this plant?')) {
      try {
        await commonMastersService.deletePlant(id);
        await loadPlants();
      } catch (error) {
        console.error('Failed to delete plant:', error);
      }
    }
  };

  const handleSave = async () => {
    // The modal uses uncontrolled inputs; read the basic-info code/name fields.
    const codeInput = document.querySelector<HTMLInputElement>('input[data-field="plant-code"]');
    const nameInput = document.querySelector<HTMLInputElement>('input[data-field="plant-name"]');
    const code = codeInput?.value?.trim() || '';
    const name = nameInput?.value?.trim() || '';

    if (!code || !name) {
      alert('Plant Code and Plant Name are required.');
      return;
    }

    try {
      if (selectedPlant) {
        await commonMastersService.updatePlant(selectedPlant.id, {
          code,
          name,
          companyId: selectedPlant.companyId || 'default-company-id',
          branchId: selectedPlant.branchId || undefined,
        });
      } else {
        await commonMastersService.createPlant({
          code,
          name,
          companyId: 'default-company-id',
        });
      }
      setIsModalOpen(false);
      await loadPlants();
    } catch (error) {
      console.error('Failed to save plant:', error);
      alert('Failed to save plant.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Maintenance': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Wrench },
      'Expansion': { bg: 'bg-blue-100', text: 'text-blue-800', icon: TrendingUp }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'Manufacturing': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Assembly': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'Processing': { bg: 'bg-green-100', text: 'text-green-800' },
      'Packaging': { bg: 'bg-orange-100', text: 'text-orange-800' },
      'Distribution': { bg: 'bg-indigo-100', text: 'text-indigo-800' }
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {type}
      </span>
    );
  };

  const getCapacityUtilization = (capacity: any) => {
    const utilization = (capacity.utilized / capacity.installed) * 100;
    const color = utilization > 90 ? 'bg-red-500' : utilization > 70 ? 'bg-yellow-500' : 'bg-green-500';
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs mb-1">
          <span>{capacity.utilized}/{capacity.installed}</span>
          <span>{utilization.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`${color} h-2 rounded-full`} style={{ width: `${utilization}%` }} />
        </div>
      </div>
    );
  };

  const getOEEColor = (oee: number) => {
    if (oee >= 85) return 'text-green-600';
    if (oee >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           plant.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           plant.address.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || plant.type === filterType;
      const matchesStatus = filterStatus === 'All' || plant.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [plants, searchTerm, filterType, filterStatus]);

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2">Plant/Factory Master</h2>
        <p className="text-gray-600">Manage manufacturing facilities and plants</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search plants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Types</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Assembly">Assembly</option>
                <option value="Processing">Processing</option>
                <option value="Packaging">Packaging</option>
                <option value="Distribution">Distribution</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Expansion">Expansion</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSelectedPlant(null);
                setIsModalOpen(true);
                setCurrentTab('basic');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Plant
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plant
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Location
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workforce
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Infrastructure
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlants.map((plant) => (
                <tr key={plant.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{plant.name}</div>
                      <div className="text-sm text-gray-500">{plant.code}</div>
                      <div className="text-xs text-gray-400">{plant.companyName}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      {getTypeBadge(plant.type)}
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {plant.address.city}, {plant.address.state}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="w-32">
                      <div className="text-sm font-medium mb-1">
                        {plant.capacity.installed} {plant.capacity.unitOfMeasure}
                      </div>
                      {getCapacityUtilization(plant.capacity)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className={`font-medium ${getOEEColor(plant.performance.oee)}`}>
                        OEE: {plant.performance.oee}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Quality: {plant.performance.quality}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Uptime: {plant.performance.uptime}%
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span>{plant.workforce.totalEmployees} employees</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {plant.workforce.shifts} shifts/day
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-gray-400" />
                        <span>{plant.infrastructure.totalArea} sq.m</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Power: {plant.infrastructure.powerCapacity}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {getStatusBadge(plant.status)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(plant)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plant.id)}
                        className="text-red-600 hover:text-red-800"
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full  max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {selectedPlant ? 'Edit Plant' : 'Add New Plant'}
              </h3>
            </div>

            <div className="flex border-b border-gray-200 overflow-x-auto">
              {['basic', 'address', 'capacity', 'infrastructure', 'production', 'workforce', 'equipment', 'performance', 'compliance'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-4 py-2 font-medium capitalize whitespace-nowrap ${
                    currentTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'basic' ? 'Basic Info' : tab}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {currentTab === 'basic' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plant Code *
                      </label>
                      <input
                        type="text"
                        data-field="plant-code"
                        defaultValue={selectedPlant?.code}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="PLT-XXX-000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plant Name *
                      </label>
                      <input
                        type="text"
                        data-field="plant-name"
                        defaultValue={selectedPlant?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter plant name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plant Type *
                      </label>
                      <select defaultValue={selectedPlant?.type || 'Manufacturing'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Assembly">Assembly</option>
                        <option value="Processing">Processing</option>
                        <option value="Packaging">Packaging</option>
                        <option value="Distribution">Distribution</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select defaultValue={selectedPlant?.status || 'Active'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Expansion">Expansion</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company *
                      </label>
                      <select defaultValue={selectedPlant?.companyId}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="1">TechCorp Industries Ltd</option>
                        <option value="2">Global Manufacturing Inc</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch *
                      </label>
                      <select defaultValue={selectedPlant?.branchId}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="1">Head Office</option>
                        <option value="2">Eastern Branch</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plant Manager *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedPlant?.contact.plantManager}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Production Head
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedPlant?.contact.productionHead}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedPlant?.contact.phone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        defaultValue={selectedPlant?.contact.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Established Date
                    </label>
                    <input
                      type="date"
                      defaultValue={selectedPlant?.metadata.establishedDate ? new Date(selectedPlant.metadata.establishedDate).toISOString().split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {currentTab === 'address' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedPlant?.address.line1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedPlant?.address.line2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedPlant?.address.city}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedPlant?.address.state}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedPlant?.address.country}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PIN/ZIP Code *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedPlant?.address.pincode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        defaultValue={selectedPlant?.address.coordinates?.latitude}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        defaultValue={selectedPlant?.address.coordinates?.longitude}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'capacity' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Installed Capacity *
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.capacity.installed}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit of Measure *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedPlant?.capacity.unitOfMeasure}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="units/day"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Utilized Capacity
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.capacity.utilized}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available Capacity
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.capacity.available}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shift Capacity
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.capacity.shiftCapacity}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Annual Capacity
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.capacity.annualCapacity}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Efficiency (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={selectedPlant?.capacity.efficiency}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {currentTab === 'infrastructure' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Area (sq.m) *
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.infrastructure.totalArea}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Covered Area (sq.m)
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.infrastructure.coveredArea}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Open Area (sq.m)
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.infrastructure.openArea}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warehouse Area (sq.m)
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.infrastructure.warehouseArea}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Production Floors
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.infrastructure.productionFloors}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loading Bays
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.infrastructure.loadingBays}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Power Capacity
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedPlant?.infrastructure.powerCapacity}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 5000 KVA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Water Capacity
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedPlant?.infrastructure.waterCapacity}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 100000 liters/day"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waste Management
                    </label>
                    <textarea
                      defaultValue={selectedPlant?.infrastructure.wasteManagement}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {currentTab === 'production' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Lines
                    </label>
                    <textarea
                      defaultValue={selectedPlant?.production.productLines?.join(', ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Enter product lines (comma-separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Processes
                    </label>
                    <textarea
                      defaultValue={selectedPlant?.production.processes?.join(', ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Enter processes (comma-separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Technologies
                    </label>
                    <textarea
                      defaultValue={selectedPlant?.production.technologies?.join(', ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Enter technologies (comma-separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certifications
                    </label>
                    <textarea
                      defaultValue={selectedPlant?.production.certifications?.join(', ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Enter certifications (comma-separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quality Standards
                    </label>
                    <textarea
                      defaultValue={selectedPlant?.production.qualityStandards?.join(', ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Enter quality standards (comma-separated)"
                    />
                  </div>
                </div>
              )}

              {currentTab === 'workforce' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Employees *
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.workforce.totalEmployees}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Shifts
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.workforce.shifts}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Skilled Workers
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.workforce.skilled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Semi-skilled Workers
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.workforce.semiSkilled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unskilled Workers
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.workforce.unskilled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contractual Workers
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.workforce.contractual}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Administrative Staff
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.workforce.administrative}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'equipment' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Machines
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.equipment.totalMachines}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Average Age (years)
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.equipment.avgAge}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CNC Machines
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.equipment.cnc}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conventional Machines
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.equipment.conventional}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Automated Systems
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.equipment.automated}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Robots
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.equipment.robots}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maintenance Type
                    </label>
                    <select defaultValue={selectedPlant?.equipment.maintenanceType || 'Preventive'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="Preventive">Preventive</option>
                      <option value="Predictive">Predictive</option>
                      <option value="Reactive">Reactive</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                </div>
              )}

              {currentTab === 'performance' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OEE (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={selectedPlant?.performance.oee}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Productivity (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={selectedPlant?.performance.productivity}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quality (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        defaultValue={selectedPlant?.performance.quality}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Uptime (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={selectedPlant?.performance.uptime}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cycle Time (min)
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.performance.cycleTime}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead Time (days)
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedPlant?.performance.leadTime}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Defect Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      defaultValue={selectedPlant?.performance.defectRate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Operating Costs</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Operating Cost
                        </label>
                        <input
                          type="number"
                          defaultValue={selectedPlant?.costs?.operatingCost}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maintenance Cost
                        </label>
                        <input
                          type="number"
                          defaultValue={selectedPlant?.costs?.maintenanceCost}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Energy Cost
                        </label>
                        <input
                          type="number"
                          defaultValue={selectedPlant?.costs?.energyCost}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Labor Cost
                        </label>
                        <input
                          type="number"
                          defaultValue={selectedPlant?.costs?.laborCost}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'compliance' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Licenses
                    </label>
                    <textarea
                      defaultValue={selectedPlant?.compliance.licenses?.join(', ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Enter licenses (comma-separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Permits
                    </label>
                    <textarea
                      defaultValue={selectedPlant?.compliance.permits?.join(', ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Enter permits (comma-separated)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Safety Rating
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedPlant?.compliance.safetyRating}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        defaultChecked={selectedPlant?.compliance.environmentClearance}
                        className="rounded"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Environment Clearance Obtained
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Audit Date
                      </label>
                      <input
                        type="date"
                        defaultValue={selectedPlant?.compliance.lastAuditDate ? new Date(selectedPlant.compliance.lastAuditDate).toISOString().split('T')[0] : ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Next Audit Date
                      </label>
                      <input
                        type="date"
                        defaultValue={selectedPlant?.compliance.nextAuditDate ? new Date(selectedPlant.compliance.nextAuditDate).toISOString().split('T')[0] : ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">System Integration</h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={selectedPlant?.integration?.erpEnabled}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">ERP Enabled</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={selectedPlant?.integration?.mesEnabled}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">MES Enabled</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={selectedPlant?.integration?.scadaEnabled}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">SCADA Enabled</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={selectedPlant?.integration?.iotEnabled}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">IoT Enabled</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {selectedPlant ? 'Update' : 'Create'} Plant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}