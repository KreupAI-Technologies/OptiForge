'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2, Plus, Search, Edit2, Trash2, Download, Upload,
  CheckCircle2, XCircle, MapPin, Users, Flag, Globe, Plane,
  Anchor, Train, Navigation
} from 'lucide-react';
import { commonMastersService, State } from '@/services/common-masters.service';
import { pickAndParseCsv } from '@/lib/import';

interface City {
  id: string;
  cityCode: string;
  cityName: string;
  stateId: string;
  stateName: string;
  countryId: string;
  countryName: string;
  isActive?: boolean;

  // Classification
  cityType: 'Metro' | 'Tier-1' | 'Tier-2' | 'Tier-3' | 'Rural';
  isCapital: boolean;

  // Geographic
  area?: number;
  population?: number;
  altitude?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  // Administrative
  mayorName?: string;
  pinCodePrefix?: string;
  stdCode?: string;

  // Business
  statistics: {
    totalPinCodes: number;
    totalCustomers?: number;
    totalSuppliers?: number;
    totalBranches?: number;
  };

  // Infrastructure
  infrastructure: {
    airport: boolean;
    seaport: boolean;
    railwayStation: boolean;
    metroRail: boolean;
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

const mockCities: City[] = [
  {
    id: '1',
    cityCode: 'MUM',
    cityName: 'Mumbai',
    stateId: '1',
    stateName: 'Maharashtra',
    countryId: '1',
    countryName: 'India',
    cityType: 'Metro',
    isCapital: true,
    area: 603.4,
    population: 12442373,
    altitude: 14,
    coordinates: {
      latitude: 19.0760,
      longitude: 72.8777
    },
    mayorName: 'Kishori Pednekar',
    stdCode: '022',
    pinCodePrefix: '400',
    statistics: {
      totalPinCodes: 125,
      totalCustomers: 850,
      totalSuppliers: 320,
      totalBranches: 15
    },
    infrastructure: {
      airport: true,
      seaport: true,
      railwayStation: true,
      metroRail: true
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
    cityCode: 'BLR',
    cityName: 'Bengaluru',
    stateId: '2',
    stateName: 'Karnataka',
    countryId: '1',
    countryName: 'India',
    cityType: 'Metro',
    isCapital: true,
    area: 741,
    population: 8443675,
    altitude: 920,
    coordinates: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    stdCode: '080',
    pinCodePrefix: '560',
    statistics: {
      totalPinCodes: 98,
      totalCustomers: 680,
      totalSuppliers: 280,
      totalBranches: 12
    },
    infrastructure: {
      airport: true,
      seaport: false,
      railwayStation: true,
      metroRail: true
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
    cityCode: 'DEL',
    cityName: 'New Delhi',
    stateId: '3',
    stateName: 'Delhi',
    countryId: '1',
    countryName: 'India',
    cityType: 'Metro',
    isCapital: true,
    area: 1484,
    population: 16787941,
    altitude: 216,
    coordinates: {
      latitude: 28.7041,
      longitude: 77.1025
    },
    stdCode: '011',
    pinCodePrefix: '110',
    statistics: {
      totalPinCodes: 95,
      totalCustomers: 750,
      totalSuppliers: 310,
      totalBranches: 14
    },
    infrastructure: {
      airport: true,
      seaport: false,
      railwayStation: true,
      metroRail: true
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
    cityCode: 'PUN',
    cityName: 'Pune',
    stateId: '1',
    stateName: 'Maharashtra',
    countryId: '1',
    countryName: 'India',
    cityType: 'Tier-1',
    isCapital: false,
    area: 729,
    population: 3124458,
    altitude: 560,
    coordinates: {
      latitude: 18.5204,
      longitude: 73.8567
    },
    stdCode: '020',
    pinCodePrefix: '411',
    statistics: {
      totalPinCodes: 68,
      totalCustomers: 420,
      totalSuppliers: 180,
      totalBranches: 8
    },
    infrastructure: {
      airport: true,
      seaport: false,
      railwayStation: true,
      metroRail: true
    },
    status: 'Active',
    metadata: {
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-03-12'),
      createdBy: 'System',
      updatedBy: 'Admin'
    }
  },
  {
    id: '5',
    cityCode: 'HYD',
    cityName: 'Hyderabad',
    stateId: '5',
    stateName: 'Telangana',
    countryId: '1',
    countryName: 'India',
    cityType: 'Metro',
    isCapital: true,
    area: 650,
    population: 6809970,
    altitude: 542,
    coordinates: {
      latitude: 17.3850,
      longitude: 78.4867
    },
    stdCode: '040',
    pinCodePrefix: '500',
    statistics: {
      totalPinCodes: 85,
      totalCustomers: 580,
      totalSuppliers: 240,
      totalBranches: 10
    },
    infrastructure: {
      airport: true,
      seaport: false,
      railwayStation: true,
      metroRail: true
    },
    status: 'Active',
    metadata: {
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-03-10'),
      createdBy: 'System',
      updatedBy: 'Admin'
    }
  }
];

export default function CityMaster() {
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [currentTab, setCurrentTab] = useState('basic');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // This is a simplification. Ideally, we'd fetch countries, then states, then cities.
      // For the wireup, we'll fetch states for the main countries and then cities for those states.
      const countries = await commonMastersService.getAllCountries();
      const allStates: State[] = [];
      const allCities: City[] = [];

      for (const country of countries) {
        const countryStates = await commonMastersService.getStatesByCountry(country.id);
        allStates.push(...countryStates);

        for (const state of countryStates) {
          const stateCities = await commonMastersService.getCitiesByState(state.id);
          allCities.push(...stateCities.map(c => ({
            id: c.id,
            cityCode: c.name.substring(0, 3).toUpperCase(),
            cityName: c.name,
            stateId: c.stateId,
            stateName: state.name,
            countryId: state.countryId,
            countryName: country.name,
            cityType: 'Tier-1',
            isCapital: false,
            statistics: { totalPinCodes: 0 },
            infrastructure: { airport: false, seaport: false, railwayStation: false, metroRail: false },
            status: c.isActive ? 'Active' : 'Inactive',
            isActive: c.isActive,
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'System',
              updatedBy: 'System'
            }
          } as City)));
        }
      }
      setStates(allStates);
      setCities(allCities);
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
      const result = await commonMastersService.bulkCreate('cities', rows);
      await fetchData();
      alert(`Import complete: ${result.created} created, ${result.skipped} skipped (of ${result.total} rows).`);
    } catch (error) {
      console.error('Error importing cities:', error);
      alert('Import failed. Please check the CSV format and try again.');
    }
  };

  const handleEdit = (city: City) => {
    setSelectedCity(city);
    setIsModalOpen(true);
    setCurrentTab('basic');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this city?')) {
      setCities(cities.filter(c => c.id !== id));
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
      'Metro': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'Tier-1': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Tier-2': { bg: 'bg-green-100', text: 'text-green-800' },
      'Tier-3': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Rural': { bg: 'bg-orange-100', text: 'text-orange-800' }
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {type}
      </span>
    );
  };

  const filteredCities = useMemo(() => {
    return cities.filter(city => {
      const matchesSearch = city.cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.cityCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.stateName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = filterState === 'All' || city.stateName === filterState;
      const matchesType = filterType === 'All' || city.cityType === filterType;
      return matchesSearch && matchesState && matchesType;
    });
  }, [cities, searchTerm, filterState, filterType]);

  const uniqueStates = Array.from(new Set(cities.map(c => c.stateName)));

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          City Master
        </h2>
        <p className="text-gray-600">Manage city database and infrastructure</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cities</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{cities.length}</p>
            </div>
            <Building2 className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Metro Cities</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {cities.filter(c => c.cityType === 'Metro').length}
              </p>
            </div>
            <MapPin className="h-12 w-12 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Population</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(cities.reduce((sum, c) => sum + (c.population || 0), 0) / 1000000).toFixed(1)}M
              </p>
            </div>
            <Users className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Metro Rail</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {cities.filter(c => c.infrastructure.metroRail).length}
              </p>
            </div>
            <Train className="h-12 w-12 text-orange-600 opacity-20" />
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
                  placeholder="Search cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All States</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Types</option>
                <option value="Metro">Metro</option>
                <option value="Tier-1">Tier-1</option>
                <option value="Tier-2">Tier-2</option>
                <option value="Tier-3">Tier-3</option>
                <option value="Rural">Rural</option>
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
                  setSelectedCity(null);
                  setIsModalOpen(true);
                  setCurrentTab('basic');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add City
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State/Country
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Infrastructure
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Population
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Stats
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
              {filteredCities.map((city) => (
                <tr key={city.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {city.cityName}
                          {city.isCapital && (
                            <Flag className="h-3 w-3 text-orange-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {city.cityCode} • STD: {city.stdCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{city.stateName}</div>
                      <div className="text-gray-500">{city.countryName}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {getTypeBadge(city.cityType)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {city.infrastructure.airport && (
                        <Plane className="h-4 w-4 text-blue-600" />
                      )}
                      {city.infrastructure.seaport && (
                        <Anchor className="h-4 w-4 text-cyan-600" />
                      )}
                      {city.infrastructure.railwayStation && (
                        <Train className="h-4 w-4 text-green-600" />
                      )}
                      {city.infrastructure.metroRail && (
                        <Navigation className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {city.population ? (city.population / 1000000).toFixed(2) + 'M' : '-'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span>{city.statistics.totalCustomers || 0} customers</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {city.statistics.totalPinCodes} PIN codes
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {getStatusBadge(city.status)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(city)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(city.id)}
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
                {selectedCity ? 'Edit City' : 'Add New City'}
              </h3>
            </div>

            <div className="flex border-b border-gray-200">
              {['basic', 'geographic', 'infrastructure', 'statistics'].map((tab) => (
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
                        City Name *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCity?.cityName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter city name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City Code *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCity?.cityCode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="MUM, DEL, BLR"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <select
                        defaultValue={selectedCity?.stateId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select State</option>
                        <option value="1">Maharashtra</option>
                        <option value="2">Karnataka</option>
                        <option value="3">Delhi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City Type *
                      </label>
                      <select defaultValue={selectedCity?.cityType || 'Tier-1'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Metro">Metro</option>
                        <option value="Tier-1">Tier-1</option>
                        <option value="Tier-2">Tier-2</option>
                        <option value="Tier-3">Tier-3</option>
                        <option value="Rural">Rural</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        STD Code
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCity?.stdCode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="022, 080"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PIN Code Prefix
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCity?.pinCodePrefix}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="400, 560"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mayor Name
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCity?.mayorName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select defaultValue={selectedCity?.status || 'Active'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={selectedCity?.isCapital}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          State/UT Capital
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'geographic' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Area (sq km)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={selectedCity?.area}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Population
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCity?.population}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Altitude (m)
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedCity?.altitude}
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
                        defaultValue={selectedCity?.coordinates?.latitude}
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
                        defaultValue={selectedCity?.coordinates?.longitude}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'infrastructure' && (
                <div className="space-y-2">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedCity?.infrastructure.airport}
                        className="rounded"
                      />
                      <Plane className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Airport
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedCity?.infrastructure.seaport}
                        className="rounded"
                      />
                      <Anchor className="h-4 w-4 text-cyan-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Seaport
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedCity?.infrastructure.railwayStation}
                        className="rounded"
                      />
                      <Train className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Railway Station
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedCity?.infrastructure.metroRail}
                        className="rounded"
                      />
                      <Navigation className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Metro Rail
                      </span>
                    </label>
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
                  alert('City saved successfully!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {selectedCity ? 'Update' : 'Create'} City
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
