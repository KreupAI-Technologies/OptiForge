'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin, Plus, Search, Edit2, Trash2, Download, Upload,
  CheckCircle2, XCircle, Building2, Users, Flag, Globe
} from 'lucide-react';
import { commonMastersService, Country } from '@/services/common-masters.service';
import { pickAndParseCsv } from '@/lib/import';

interface State {
  id: string;
  stateCode: string;
  stateName: string;
  countryId: string;
  countryName: string;
  iso2Code?: string;
  isActive?: boolean;

  // Administrative
  capital?: string;
  stateType: 'State' | 'Province' | 'Territory' | 'Region' | 'Union Territory';

  // Geographic
  area?: number;
  population?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  // Taxation
  taxation: {
    stateCode?: string;
    gstStateCode?: string;
    vatApplicable: boolean;
    localTaxes?: string[];
  };

  // Business
  statistics: {
    totalCities: number;
    totalCustomers?: number;
    totalSuppliers?: number;
    totalBranches?: number;
  };

  status: 'Active' | 'Inactive';
  notes?: string;

  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  };
}

const mockStates: State[] = [
  {
    id: '1',
    stateCode: 'MH',
    stateName: 'Maharashtra',
    countryId: '1',
    countryName: 'India',
    iso2Code: 'MH',
    capital: 'Mumbai',
    stateType: 'State',
    area: 307713,
    population: 112374333,
    coordinates: {
      latitude: 19.7515,
      longitude: 75.7139
    },
    taxation: {
      stateCode: 'MH',
      gstStateCode: '27',
      vatApplicable: false,
      localTaxes: ['Professional Tax', 'Stamp Duty']
    },
    statistics: {
      totalCities: 358,
      totalCustomers: 1250,
      totalSuppliers: 450,
      totalBranches: 25
    },
    status: 'Active',
    metadata: {
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-03-20'),
      createdBy: 'System',
      updatedBy: 'Admin'
    }
  },
  {
    id: '2',
    stateCode: 'KA',
    stateName: 'Karnataka',
    countryId: '1',
    countryName: 'India',
    iso2Code: 'KA',
    capital: 'Bengaluru',
    stateType: 'State',
    area: 191791,
    population: 61130704,
    coordinates: {
      latitude: 15.3173,
      longitude: 75.7139
    },
    taxation: {
      stateCode: 'KA',
      gstStateCode: '29',
      vatApplicable: false,
      localTaxes: ['Professional Tax']
    },
    statistics: {
      totalCities: 224,
      totalCustomers: 850,
      totalSuppliers: 320,
      totalBranches: 18
    },
    status: 'Active',
    metadata: {
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-03-18'),
      createdBy: 'System',
      updatedBy: 'Admin'
    }
  },
  {
    id: '3',
    stateCode: 'DL',
    stateName: 'Delhi',
    countryId: '1',
    countryName: 'India',
    iso2Code: 'DL',
    capital: 'New Delhi',
    stateType: 'Union Territory',
    area: 1484,
    population: 16787941,
    coordinates: {
      latitude: 28.7041,
      longitude: 77.1025
    },
    taxation: {
      stateCode: 'DL',
      gstStateCode: '07',
      vatApplicable: false,
      localTaxes: ['Trade License Fee']
    },
    statistics: {
      totalCities: 11,
      totalCustomers: 680,
      totalSuppliers: 280,
      totalBranches: 15
    },
    status: 'Active',
    metadata: {
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-03-15'),
      createdBy: 'System',
      updatedBy: 'Admin'
    }
  },
  {
    id: '4',
    stateCode: 'CA',
    stateName: 'California',
    countryId: '2',
    countryName: 'United States',
    iso2Code: 'CA',
    capital: 'Sacramento',
    stateType: 'State',
    area: 423970,
    population: 39538223,
    coordinates: {
      latitude: 36.7783,
      longitude: -119.4179
    },
    taxation: {
      stateCode: 'CA',
      vatApplicable: true,
      localTaxes: ['Sales Tax', 'Income Tax']
    },
    statistics: {
      totalCities: 482,
      totalCustomers: 340,
      totalSuppliers: 180,
      totalBranches: 8
    },
    status: 'Active',
    metadata: {
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-03-12'),
      createdBy: 'System',
      updatedBy: 'Admin'
    }
  }
];

export default function StateMaster() {
  const [states, setStates] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [currentTab, setCurrentTab] = useState('basic');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [countriesData] = await Promise.all([
        commonMastersService.getAllCountries()
      ]);
      setCountries(countriesData);

      // Fetch all states (initially or based on filter)
      // For simplicity in this mock-to-live transition, we'll fetch all states for the first country or some default
      // In a real app, we might fetch all if no country is selected, or only on country selection.
      // Let's fetch states for all countries for now as a demo.
      const allStates: State[] = [];
      for (const country of countriesData) {
        const countryStates = await commonMastersService.getStatesByCountry(country.id);
        allStates.push(...countryStates.map(s => ({
          id: s.id,
          stateCode: s.name.substring(0, 2).toUpperCase(), // Placeholder
          stateName: s.name,
          countryId: s.countryId,
          countryName: country.name,
          stateType: 'State',
          taxation: { vatApplicable: false },
          statistics: { totalCities: 0 },
          status: s.isActive ? 'Active' : 'Inactive',
          isActive: s.isActive,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'System',
            updatedBy: 'System'
          }
        } as State)));
      }
      setStates(allStates);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImport = async () => {
    try {
      const rows = await pickAndParseCsv();
      if (!rows) return;
      if (rows.length === 0) { alert('The selected CSV file has no data rows.'); return; }
      const result = await commonMastersService.bulkCreate('states', rows);
      await fetchData();
      alert(`Import complete: ${result.created} created, ${result.skipped} skipped (of ${result.total} rows).`);
    } catch (error) {
      console.error('Error importing states:', error);
      alert('Import failed. Please check the CSV format and try again.');
    }
  };

  const handleEdit = (state: State) => {
    setSelectedState(state);
    setIsModalOpen(true);
    setCurrentTab('basic');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this state?')) {
      setStates(states.filter(s => s.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle }
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
      'State': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Province': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'Territory': { bg: 'bg-green-100', text: 'text-green-800' },
      'Region': { bg: 'bg-orange-100', text: 'text-orange-800' },
      'Union Territory': { bg: 'bg-indigo-100', text: 'text-indigo-800' }
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {type}
      </span>
    );
  };

  const filteredStates = useMemo(() => {
    return states.filter(state => {
      const matchesSearch = state.stateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        state.stateCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = filterCountry === 'All' || state.countryName === filterCountry;
      const matchesType = filterType === 'All' || state.stateType === filterType;
      return matchesSearch && matchesCountry && matchesType;
    });
  }, [states, searchTerm, filterCountry, filterType]);

  const uniqueCountries = Array.from(new Set(states.map(s => s.countryName)));

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <MapPin className="h-8 w-8 text-blue-600" />
          State/Province Master
        </h2>
        <p className="text-gray-600">Manage regional divisions and provinces</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total States</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{states.length}</p>
            </div>
            <MapPin className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active States</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {states.filter(s => s.status === 'Active').length}
              </p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cities</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {states.reduce((sum, s) => sum + s.statistics.totalCities, 0)}
              </p>
            </div>
            <Building2 className="h-12 w-12 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Countries</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{uniqueCountries.length}</p>
            </div>
            <Globe className="h-12 w-12 text-orange-600 opacity-20" />
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
                  placeholder="Search states..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Countries</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Types</option>
                <option value="State">State</option>
                <option value="Province">Province</option>
                <option value="Territory">Territory</option>
                <option value="Union Territory">Union Territory</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleImport} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={() => {
                  setSelectedState(null);
                  setIsModalOpen(true);
                  setCurrentTab('basic');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add State
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capital
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GST Code
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cities
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
              {filteredStates.map((state) => (
                <tr key={state.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{state.stateName}</div>
                      <div className="text-sm text-gray-500">{state.stateCode}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{state.countryName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {getTypeBadge(state.stateType)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {state.capital || '-'}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {state.taxation.gstStateCode || '-'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">
                      {state.statistics.totalCities}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {getStatusBadge(state.status)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(state)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(state.id)}
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
                {selectedState ? 'Edit State' : 'Add New State'}
              </h3>
            </div>

            <div className="flex border-b border-gray-200">
              {['basic', 'taxation', 'statistics'].map((tab) => (
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
                        State Name *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedState?.stateName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter state name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State Code *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedState?.stateCode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="MH, CA, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <select
                        defaultValue={selectedState?.countryId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Country</option>
                        <option value="1">India</option>
                        <option value="2">United States</option>
                        <option value="3">United Kingdom</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State Type *
                      </label>
                      <select defaultValue={selectedState?.stateType || 'State'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="State">State</option>
                        <option value="Province">Province</option>
                        <option value="Territory">Territory</option>
                        <option value="Region">Region</option>
                        <option value="Union Territory">Union Territory</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capital
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedState?.capital}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ISO 2 Code
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedState?.iso2Code}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select defaultValue={selectedState?.status || 'Active'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
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
                  alert('State saved successfully!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {selectedState ? 'Update' : 'Create'} State
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
