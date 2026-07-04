'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Globe, Plus, Search, Edit2, Trash2, Eye, Download, Upload,
  CheckCircle2, XCircle, AlertCircle, MapPin, Users, DollarSign,
  Phone, Mail, Flag, Building2, TrendingUp, Activity
} from 'lucide-react';
import { commonMastersService } from '@/services/common-masters.service';
import { pickAndParseCsv } from '@/lib/import';

interface Country {
  id: string;
  countryCode: string;
  countryName: string;
  iso2Code: string;
  iso3Code: string;
  isoNumericCode: string;

  // Regional Information
  continent: 'Asia' | 'Europe' | 'Africa' | 'North America' | 'South America' | 'Australia' | 'Antarctica';
  region: string;
  subRegion: string;

  // Contact & Address
  phoneCode: string;
  postalCodeFormat?: string;
  addressFormat?: string;

  // Financial
  currency: string;
  currencyCode: string;
  currencySymbol: string;

  // Administrative
  capital: string;
  language: string;
  languages?: string[];
  nationality: string;

  // Business Settings
  businessSettings: {
    taxSystem?: string;
    fiscalYearStart?: string;
    workingDays?: string[];
    timeZone: string;
    dateFormat: string;
    numberFormat: string;
  };

  // Statistics
  statistics: {
    population?: number;
    area?: number;
    gdp?: number;
    totalCustomers?: number;
    totalSuppliers?: number;
    totalBranches?: number;
    totalRevenue?: number;
  };

  // Compliance
  compliance: {
    taxIdFormat?: string;
    vatEnabled: boolean;
    vatRate?: number;
    customsRequired: boolean;
    tradeLicenseRequired: boolean;
  };

  status: 'Active' | 'Inactive' | 'Restricted';
  isDefault: boolean;
  notes?: string;

  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  };
}

const mockCountries: Country[] = [
  {
    id: '1',
    countryCode: 'IN',
    countryName: 'India',
    iso2Code: 'IN',
    iso3Code: 'IND',
    isoNumericCode: '356',
    continent: 'Asia',
    region: 'Southern Asia',
    subRegion: 'South Asia',
    phoneCode: '+91',
    postalCodeFormat: '######',
    addressFormat: 'Street, City, State - PIN',
    currency: 'Indian Rupee',
    currencyCode: 'INR',
    currencySymbol: '₹',
    capital: 'New Delhi',
    language: 'Hindi',
    languages: ['Hindi', 'English', 'Tamil', 'Telugu', 'Bengali'],
    nationality: 'Indian',
    businessSettings: {
      taxSystem: 'GST',
      fiscalYearStart: 'April',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeZone: 'IST (UTC+5:30)',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '1,00,00,000'
    },
    statistics: {
      population: 1400000000,
      area: 3287263,
      gdp: 3700000000000,
      totalCustomers: 2450,
      totalSuppliers: 850,
      totalBranches: 45,
      totalRevenue: 125000000
    },
    compliance: {
      taxIdFormat: 'PAN: AAAAA9999A',
      vatEnabled: true,
      vatRate: 18,
      customsRequired: true,
      tradeLicenseRequired: true
    },
    status: 'Active',
    isDefault: true,
    metadata: {
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-03-20'),
      createdBy: 'System',
      updatedBy: 'Admin'
    }
  },
  {
    id: '2',
    countryCode: 'US',
    countryName: 'United States',
    iso2Code: 'US',
    iso3Code: 'USA',
    isoNumericCode: '840',
    continent: 'North America',
    region: 'Northern America',
    subRegion: 'North America',
    phoneCode: '+1',
    postalCodeFormat: '#####-####',
    addressFormat: 'Street, City, State ZIP',
    currency: 'US Dollar',
    currencyCode: 'USD',
    currencySymbol: '$',
    capital: 'Washington, D.C.',
    language: 'English',
    languages: ['English', 'Spanish'],
    nationality: 'American',
    businessSettings: {
      taxSystem: 'Sales Tax',
      fiscalYearStart: 'January',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeZone: 'EST (UTC-5)',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: '1,000,000'
    },
    statistics: {
      population: 331900000,
      area: 9833520,
      gdp: 25500000000000,
      totalCustomers: 580,
      totalSuppliers: 320,
      totalBranches: 12,
      totalRevenue: 45000000
    },
    compliance: {
      taxIdFormat: 'EIN: ##-#######',
      vatEnabled: false,
      customsRequired: true,
      tradeLicenseRequired: false
    },
    status: 'Active',
    isDefault: false,
    metadata: {
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-03-18'),
      createdBy: 'System',
      updatedBy: 'Admin'
    }
  },
  {
    id: '3',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    iso2Code: 'GB',
    iso3Code: 'GBR',
    isoNumericCode: '826',
    continent: 'Europe',
    region: 'Northern Europe',
    subRegion: 'Western Europe',
    phoneCode: '+44',
    postalCodeFormat: 'AA## #AA',
    currency: 'Pound Sterling',
    currencyCode: 'GBP',
    currencySymbol: '£',
    capital: 'London',
    language: 'English',
    languages: ['English', 'Welsh', 'Scottish Gaelic'],
    nationality: 'British',
    businessSettings: {
      taxSystem: 'VAT',
      fiscalYearStart: 'April',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeZone: 'GMT (UTC+0)',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '1,000,000'
    },
    statistics: {
      population: 67330000,
      area: 242495,
      gdp: 3100000000000,
      totalCustomers: 340,
      totalSuppliers: 180,
      totalBranches: 8,
      totalRevenue: 28000000
    },
    compliance: {
      taxIdFormat: 'VAT: GB### #### ##',
      vatEnabled: true,
      vatRate: 20,
      customsRequired: true,
      tradeLicenseRequired: false
    },
    status: 'Active',
    isDefault: false,
    metadata: {
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-03-15'),
      createdBy: 'System',
      updatedBy: 'Admin'
    }
  },
  {
    id: '4',
    countryCode: 'DE',
    countryName: 'Germany',
    iso2Code: 'DE',
    iso3Code: 'DEU',
    isoNumericCode: '276',
    continent: 'Europe',
    region: 'Western Europe',
    subRegion: 'Central Europe',
    phoneCode: '+49',
    postalCodeFormat: '#####',
    currency: 'Euro',
    currencyCode: 'EUR',
    currencySymbol: '€',
    capital: 'Berlin',
    language: 'German',
    languages: ['German'],
    nationality: 'German',
    businessSettings: {
      taxSystem: 'VAT',
      fiscalYearStart: 'January',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeZone: 'CET (UTC+1)',
      dateFormat: 'DD.MM.YYYY',
      numberFormat: '1.000.000'
    },
    statistics: {
      population: 83240000,
      area: 357022,
      gdp: 4300000000000,
      totalCustomers: 420,
      totalSuppliers: 240,
      totalBranches: 10,
      totalRevenue: 35000000
    },
    compliance: {
      taxIdFormat: 'DE#########',
      vatEnabled: true,
      vatRate: 19,
      customsRequired: true,
      tradeLicenseRequired: false
    },
    status: 'Active',
    isDefault: false,
    metadata: {
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-03-12'),
      createdBy: 'System',
      updatedBy: 'Admin'
    }
  }
];

export default function CountryMaster() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterContinent, setFilterContinent] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentTab, setCurrentTab] = useState('basic');

  const fetchCountries = async () => {
      try {
        setIsLoading(true);
        const data = await commonMastersService.getAllCountries();
        const mappedData: Country[] = data.map(c => ({
          id: c.id,
          countryCode: c.code,
          countryName: c.name,
          iso2Code: c.code,
          iso3Code: c.code + 'X',
          isoNumericCode: '000',
          continent: 'Asia',
          region: 'N/A',
          subRegion: 'N/A',
          phoneCode: c.phoneCode || '',
          currency: 'N/A',
          currencyCode: 'N/A',
          currencySymbol: 'N/A',
          capital: 'N/A',
          language: 'N/A',
          nationality: 'N/A',
          businessSettings: {
            timeZone: 'UTC',
            dateFormat: 'DD/MM/YYYY',
            numberFormat: '1,000'
          },
          statistics: {},
          compliance: {
            vatEnabled: false,
            customsRequired: false,
            tradeLicenseRequired: false
          },
          status: c.isActive ? 'Active' : 'Inactive',
          isDefault: false,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'System',
            updatedBy: 'System'
          }
        }));
        setCountries(mappedData);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleImport = async () => {
    try {
      const rows = await pickAndParseCsv();
      if (!rows) return;
      if (rows.length === 0) {
        alert('The selected CSV file has no data rows.');
        return;
      }
      const result = await commonMastersService.bulkCreate('countries', rows);
      await fetchCountries();
      alert(
        `Import complete: ${result.created} created, ${result.skipped} skipped (of ${result.total} rows).`,
      );
    } catch (error) {
      console.error('Error importing countries:', error);
      alert('Import failed. Please check the CSV format and try again.');
    }
  };

  const handleEdit = (country: Country) => {
    setSelectedCountry(country);
    setIsModalOpen(true);
    setCurrentTab('basic');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this country?')) {
      setCountries(countries.filter(c => c.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Restricted': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle }
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

  const getContinentBadge = (continent: string) => {
    const continentConfig = {
      'Asia': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Europe': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'Africa': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'North America': { bg: 'bg-green-100', text: 'text-green-800' },
      'South America': { bg: 'bg-orange-100', text: 'text-orange-800' },
      'Australia': { bg: 'bg-teal-100', text: 'text-teal-800' },
      'Antarctica': { bg: 'bg-cyan-100', text: 'text-cyan-800' }
    };
    const config = continentConfig[continent as keyof typeof continentConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {continent}
      </span>
    );
  };

  const filteredCountries = useMemo(() => {
    return countries.filter(country => {
      const matchesSearch = country.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.countryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.iso3Code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesContinent = filterContinent === 'All' || country.continent === filterContinent;
      const matchesStatus = filterStatus === 'All' || country.status === filterStatus;
      return matchesSearch && matchesContinent && matchesStatus;
    });
  }, [countries, searchTerm, filterContinent, filterStatus]);

  const totalPopulation = countries.reduce((sum, c) => sum + (c.statistics.population || 0), 0);
  const totalRevenue = countries.reduce((sum, c) => sum + (c.statistics.totalRevenue || 0), 0);

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Globe className="h-8 w-8 text-blue-600" />
          Country Master
        </h2>
        <p className="text-gray-600">Manage global country database and settings</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Countries</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{countries.length}</p>
            </div>
            <Globe className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Countries</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {countries.filter(c => c.status === 'Active').length}
              </p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${(totalRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Continents</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Set(countries.map(c => c.continent)).size}
              </p>
            </div>
            <MapPin className="h-12 w-12 text-orange-600 opacity-20" />
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
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterContinent}
                onChange={(e) => setFilterContinent(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Continents</option>
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="Africa">Africa</option>
                <option value="North America">North America</option>
                <option value="South America">South America</option>
                <option value="Australia">Australia</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Restricted">Restricted</option>
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
                  setSelectedCountry(null);
                  setIsModalOpen(true);
                  setCurrentTab('basic');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Country
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISO Codes
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Continent/Region
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
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
              {filteredCountries.map((country) => (
                <tr key={country.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Flag className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {country.countryName}
                          {country.isDefault && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Default</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{country.phoneCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{country.iso2Code} / {country.iso3Code}</div>
                      <div className="text-gray-500">Numeric: {country.isoNumericCode}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      {getContinentBadge(country.continent)}
                      <div className="text-xs text-gray-500">{country.region}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{country.currencySymbol} {country.currencyCode}</div>
                      <div className="text-gray-500">{country.currency}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span>{country.statistics.totalCustomers || 0} customers</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Building2 className="h-3 w-3 text-gray-400" />
                        <span>{country.statistics.totalBranches || 0} branches</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {getStatusBadge(country.status)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(country)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(country.id)}
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
                {selectedCountry ? 'Edit Country' : 'Add New Country'}
              </h3>
            </div>

            <div className="flex border-b border-gray-200">
              {['basic', 'regional', 'business', 'compliance', 'statistics'].map((tab) => (
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
                        Country Name *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCountry?.countryName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter country name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country Code *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCountry?.countryCode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="IN, US, GB"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ISO 2 Code *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCountry?.iso2Code}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ISO 3 Code *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCountry?.iso3Code}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        maxLength={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ISO Numeric Code
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCountry?.isoNumericCode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Code *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCountry?.phoneCode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+91, +1, +44"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capital
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCountry?.capital}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency Name *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCountry?.currency}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency Code *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCountry?.currencyCode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        maxLength={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency Symbol
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCountry?.currencySymbol}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCountry?.language}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedCountry?.nationality}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select defaultValue={selectedCountry?.status || 'Active'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Restricted">Restricted</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={selectedCountry?.isDefault}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Set as Default Country
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Add other tabs content similarly */}
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
                  alert('Country saved successfully!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {selectedCountry ? 'Update' : 'Create'} Country
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
