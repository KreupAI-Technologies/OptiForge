'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Target, Plus, Search, Edit2, Trash2, Download, Upload,
  CheckCircle2, XCircle, Users, TrendingUp, DollarSign,
  AlertTriangle, MapPin, ChevronRight, ChevronDown, Award
} from 'lucide-react';
import { commonMastersService } from '@/services/common-masters.service';

interface Territory {
  id: string;
  territoryCode: string;
  territoryName: string;
  parentTerritoryId?: string;
  parentTerritoryName?: string;
  level: number;
  isActive?: boolean;

  // Coverage
  coverage: {
    countries?: string[];
    states?: string[];
    cities?: string[];
    pinCodes?: string[];
  };

  // Assignment
  assignment: {
    manager: string;
    managerId: string;
    salesTeam?: string[];
    serviceTeam?: string[];
  };

  // Targets
  targets: {
    monthlyRevenue?: number;
    quarterlyRevenue?: number;
    annualRevenue?: number;
    customerAcquisition?: number;
  };

  // Performance
  performance: {
    actualRevenue?: number;
    achievement?: number;
    totalCustomers?: number;
    activeCustomers?: number;
    avgDealSize?: number;
  };

  // Settings
  settings: {
    territoryType: 'Sales' | 'Service' | 'Distribution' | 'Collection';
    allowOverlap: boolean;
    priority: 'High' | 'Medium' | 'Low';
  };

  status: 'Active' | 'Inactive' | 'Under Review';

  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  };
}

const mockTerritories: Territory[] = [
  {
    id: '1',
    territoryCode: 'WEST-MH-01',
    territoryName: 'Western Maharashtra Sales',
    level: 2,
    coverage: {
      states: ['Maharashtra'],
      cities: ['Mumbai', 'Pune', 'Nashik'],
      pinCodes: ['400001-400098', '411001-411068']
    },
    assignment: {
      manager: 'Rajesh Kumar',
      managerId: 'EMP001',
      salesTeam: ['EMP101', 'EMP102', 'EMP103']
    },
    targets: {
      monthlyRevenue: 5000000,
      quarterlyRevenue: 15000000,
      annualRevenue: 60000000,
      customerAcquisition: 50
    },
    performance: {
      actualRevenue: 4750000,
      achievement: 95,
      totalCustomers: 245,
      activeCustomers: 198,
      avgDealSize: 125000
    },
    settings: {
      territoryType: 'Sales',
      allowOverlap: false,
      priority: 'High'
    },
    status: 'Active',
    metadata: {
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-03-20'),
      createdBy: 'Admin',
      updatedBy: 'Manager'
    }
  },
  {
    id: '2',
    territoryCode: 'SOUTH-KA-01',
    territoryName: 'South Karnataka Sales',
    parentTerritoryId: '10',
    parentTerritoryName: 'Southern Region',
    level: 3,
    coverage: {
      states: ['Karnataka'],
      cities: ['Bengaluru', 'Mysuru', 'Mangaluru'],
      pinCodes: ['560001-560100', '570001-570020']
    },
    assignment: {
      manager: 'Priya Sharma',
      managerId: 'EMP002',
      salesTeam: ['EMP104', 'EMP105']
    },
    targets: {
      monthlyRevenue: 4000000,
      quarterlyRevenue: 12000000,
      annualRevenue: 48000000,
      customerAcquisition: 40
    },
    performance: {
      actualRevenue: 4200000,
      achievement: 105,
      totalCustomers: 198,
      activeCustomers: 165,
      avgDealSize: 110000
    },
    settings: {
      territoryType: 'Sales',
      allowOverlap: false,
      priority: 'High'
    },
    status: 'Active',
    metadata: {
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-03-18'),
      createdBy: 'Admin',
      updatedBy: 'Manager'
    }
  },
  {
    id: '3',
    territoryCode: 'NORTH-DL-01',
    territoryName: 'Delhi NCR Sales',
    level: 2,
    coverage: {
      states: ['Delhi', 'Haryana', 'Uttar Pradesh'],
      cities: ['New Delhi', 'Gurugram', 'Noida', 'Ghaziabad'],
      pinCodes: ['110001-110096', '122001-122050']
    },
    assignment: {
      manager: 'Amit Singh',
      managerId: 'EMP003',
      salesTeam: ['EMP106', 'EMP107', 'EMP108', 'EMP109']
    },
    targets: {
      monthlyRevenue: 6000000,
      quarterlyRevenue: 18000000,
      annualRevenue: 72000000,
      customerAcquisition: 60
    },
    performance: {
      actualRevenue: 5400000,
      achievement: 90,
      totalCustomers: 312,
      activeCustomers: 245,
      avgDealSize: 98000
    },
    settings: {
      territoryType: 'Sales',
      allowOverlap: true,
      priority: 'High'
    },
    status: 'Active',
    metadata: {
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2024-03-15'),
      createdBy: 'Admin',
      updatedBy: 'Manager'
    }
  },
  {
    id: '4',
    territoryCode: 'EAST-WB-01',
    territoryName: 'West Bengal Service',
    level: 2,
    coverage: {
      states: ['West Bengal'],
      cities: ['Kolkata', 'Howrah'],
      pinCodes: ['700001-700156']
    },
    assignment: {
      manager: 'Sanjay Das',
      managerId: 'EMP004',
      serviceTeam: ['EMP110', 'EMP111']
    },
    targets: {
      monthlyRevenue: 2000000,
      quarterlyRevenue: 6000000,
      annualRevenue: 24000000,
      customerAcquisition: 25
    },
    performance: {
      actualRevenue: 1850000,
      achievement: 92.5,
      totalCustomers: 145,
      activeCustomers: 112,
      avgDealSize: 85000
    },
    settings: {
      territoryType: 'Service',
      allowOverlap: false,
      priority: 'Medium'
    },
    status: 'Active',
    metadata: {
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date('2024-03-10'),
      createdBy: 'Admin',
      updatedBy: 'Manager'
    }
  }
];

export default function TerritoryMaster() {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const companyId = 'MAIN_COMPANY_ID'; // Placeholder, should come from context
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentTab, setCurrentTab] = useState('basic');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchTerritories = async () => {
      try {
        setIsLoading(true);
        const data = await commonMastersService.getAllTerritories(companyId);
        setTerritories(data.map(t => ({
          id: t.id,
          territoryCode: t.code,
          territoryName: t.name,
          level: 1,
          coverage: {},
          assignment: { manager: 'N/A', managerId: 'N/A' },
          targets: {},
          performance: {},
          settings: { territoryType: 'Sales', allowOverlap: false, priority: 'Medium' },
          status: t.isActive ? 'Active' : 'Inactive',
          isActive: t.isActive,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'System',
            updatedBy: 'System'
          }
        } as Territory)));
      } catch (error) {
        console.error('Error fetching territories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTerritories();
  }, [companyId]);

  const handleEdit = (territory: Territory) => {
    setSelectedTerritory(territory);
    setIsModalOpen(true);
    setCurrentTab('basic');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this territory?')) {
      setTerritories(territories.filter(t => t.id !== id));
    }
  };

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Under Review': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle }
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
      'Sales': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Service': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'Distribution': { bg: 'bg-green-100', text: 'text-green-800' },
      'Collection': { bg: 'bg-orange-100', text: 'text-orange-800' }
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {type}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'High': { bg: 'bg-red-100', text: 'text-red-800' },
      'Medium': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Low': { bg: 'bg-gray-100', text: 'text-gray-800' }
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {priority}
      </span>
    );
  };

  const getAchievementColor = (achievement?: number) => {
    if (!achievement) return 'text-gray-600';
    if (achievement >= 100) return 'text-green-600';
    if (achievement >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredTerritories = useMemo(() => {
    return territories.filter(territory => {
      const matchesSearch = territory.territoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        territory.territoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        territory.assignment.manager.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || territory.settings.territoryType === filterType;
      const matchesStatus = filterStatus === 'All' || territory.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [territories, searchTerm, filterType, filterStatus]);

  const totalTarget = territories.reduce((sum, t) => sum + (t.targets.monthlyRevenue || 0), 0);
  const totalActual = territories.reduce((sum, t) => sum + (t.performance.actualRevenue || 0), 0);
  const overallAchievement = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Target className="h-8 w-8 text-blue-600" />
          Territory Master
        </h2>
        <p className="text-gray-600">Manage sales and service territories</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Territories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{territories.length}</p>
            </div>
            <Target className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Target</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${(totalTarget / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Achievement</p>
              <p className={`text-2xl font-bold mt-1 ${getAchievementColor(overallAchievement)}`}>
                {overallAchievement.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {territories.reduce((sum, t) => sum + (t.performance.totalCustomers || 0), 0)}
              </p>
            </div>
            <Users className="h-12 w-12 text-orange-600 opacity-20" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search territories..."
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
                <option value="Sales">Sales</option>
                <option value="Service">Service</option>
                <option value="Distribution">Distribution</option>
                <option value="Collection">Collection</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={() => {
                  setSelectedTerritory(null);
                  setIsModalOpen(true);
                  setCurrentTab('basic');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Territory
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Territory
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coverage
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target/Actual
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Achievement
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customers
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
              {filteredTerritories.map((territory) => (
                <tr key={territory.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{territory.territoryName}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {territory.territoryCode}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getTypeBadge(territory.settings.territoryType)}
                        {getPriorityBadge(territory.settings.priority)}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{territory.assignment.manager}</div>
                        <div className="text-xs text-gray-500">
                          Team: {(territory.assignment.salesTeam?.length || 0) + (territory.assignment.serviceTeam?.length || 0)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{territory.coverage.cities?.length || 0} cities</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {territory.coverage.states?.join(', ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="text-gray-900 font-medium">
                        ${((territory.targets.monthlyRevenue || 0) / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-gray-500">
                        ${((territory.performance.actualRevenue || 0) / 1000000).toFixed(1)}M actual
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className={`text-sm font-bold ${getAchievementColor(territory.performance.achievement)}`}>
                          {territory.performance.achievement?.toFixed(1)}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${(territory.performance.achievement || 0) >= 100 ? 'bg-green-500' :
                              (territory.performance.achievement || 0) >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${Math.min(100, territory.performance.achievement || 0)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{territory.performance.totalCustomers || 0}</div>
                      <div className="text-xs text-gray-500">
                        {territory.performance.activeCustomers || 0} active
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {getStatusBadge(territory.status)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(territory)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(territory.id)}
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
                {selectedTerritory ? 'Edit Territory' : 'Add New Territory'}
              </h3>
            </div>

            <div className="flex border-b border-gray-200">
              {['basic', 'coverage', 'targets', 'assignment'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-4 py-2 font-medium capitalize ${currentTab === tab
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
                        Territory Name *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedTerritory?.territoryName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter territory name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Territory Code *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedTerritory?.territoryCode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="WEST-MH-01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Territory Type *
                      </label>
                      <select defaultValue={selectedTerritory?.settings.territoryType || 'Sales'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Sales">Sales</option>
                        <option value="Service">Service</option>
                        <option value="Distribution">Distribution</option>
                        <option value="Collection">Collection</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select defaultValue={selectedTerritory?.settings.priority || 'Medium'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select defaultValue={selectedTerritory?.status || 'Active'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Under Review">Under Review</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedTerritory?.settings.allowOverlap}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Allow Territory Overlap
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {currentTab === 'targets' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Revenue Target
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedTerritory?.targets.monthlyRevenue}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quarterly Revenue Target
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedTerritory?.targets.quarterlyRevenue}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Annual Revenue Target
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedTerritory?.targets.annualRevenue}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Acquisition Target
                    </label>
                    <input
                      type="number"
                      defaultValue={selectedTerritory?.targets.customerAcquisition}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
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
                onClick={() => {
                  setIsModalOpen(false);
                  alert('Territory saved successfully!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {selectedTerritory ? 'Update' : 'Create'} Territory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
