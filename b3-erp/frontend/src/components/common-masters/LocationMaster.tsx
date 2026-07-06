'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MapPin, Plus, Search, Filter, Edit2, Trash2, MoreVertical,
  Building2, Globe, Phone, Mail, Navigation, Clock, Shield,
  Map, Thermometer, Users, Truck, Package, AlertTriangle,
  FileText, CheckCircle2, XCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import { commonMastersService } from '@/services/common-masters.service';

const DEFAULT_COMPANY_ID = 'default-company-id';

interface Location {
  id: string;
  code: string;
  name: string;
  type: 'Country' | 'State' | 'City' | 'Area' | 'Zone' | 'Site';
  parentId?: string;
  parentName?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    landmark?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  contact: {
    phone?: string;
    altPhone?: string;
    email?: string;
    website?: string;
  };
  operational: {
    timeZone: string;
    workingDays: string[];
    workingHours: string;
    holidays: string[];
    climate: string;
    accessibility: string;
  };
  logistics: {
    nearestAirport?: string;
    nearestSeaport?: string;
    nearestRailway?: string;
    transportModes: string[];
    deliveryTime: string;
    shippingZones: string[];
  };
  compliance: {
    taxJurisdiction: string;
    regulatoryZone: string;
    customsCode?: string;
    freeTradeZone: boolean;
    environmentalZone?: string;
  };
  facilities: string[];
  restrictions: string[];
  status: 'Active' | 'Inactive' | 'Restricted';
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  };
}

export default function LocationMaster() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentTab, setCurrentTab] = useState('basic');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await commonMastersService.getAllLocations(DEFAULT_COMPANY_ID);
      const mapped: Location[] = (data || []).map((r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        type: (r.type ?? 'Site') as Location['type'],
        parentId: r.parentId,
        parentName: r.parent?.name,
        address: r.address ?? {
          line1: '', city: '', state: '', country: '', pincode: ''
        },
        coordinates: r.coordinates ?? undefined,
        contact: r.contact ?? {},
        operational: r.operational ?? {
          timeZone: '', workingDays: [], workingHours: '',
          holidays: [], climate: '', accessibility: ''
        },
        logistics: r.logistics ?? {
          transportModes: [], deliveryTime: '', shippingZones: []
        },
        compliance: r.compliance ?? {
          taxJurisdiction: '', regulatoryZone: '', freeTradeZone: false
        },
        facilities: r.facilities ?? [],
        restrictions: r.restrictions ?? [],
        status: (r.status ?? (r.isActive === false ? 'Inactive' : 'Active')) as Location['status'],
        metadata: {
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
          createdBy: '',
          updatedBy: ''
        }
      }));
      setLocations(mapped);
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
    setCurrentTab('basic');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      try {
        await commonMastersService.deleteLocation(id);
        await loadLocations();
      } catch (error) {
        console.error('Failed to delete location:', error);
      }
    }
  };

  const collectFormValue = (name: string): string => {
    const el = formRef.current?.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      `[data-field="${name}"]`
    );
    return el ? el.value : '';
  };

  const collectCheckedValues = (name: string): string[] => {
    const els = formRef.current?.querySelectorAll<HTMLInputElement>(`[data-group="${name}"]`);
    if (!els) return [];
    return Array.from(els).filter(el => el.checked).map(el => el.value);
  };

  const collectChecked = (name: string): boolean => {
    const el = formRef.current?.querySelector<HTMLInputElement>(`[data-field="${name}"]`);
    return el ? el.checked : false;
  };

  const handleSave = async () => {
    try {
      const lat = collectFormValue('latitude');
      const lng = collectFormValue('longitude');
      const payload: any = {
        code: collectFormValue('code'),
        name: collectFormValue('name'),
        type: collectFormValue('type'),
        parentId: collectFormValue('parentId') || undefined,
        companyId: DEFAULT_COMPANY_ID,
        status: collectFormValue('status'),
        address: {
          line1: collectFormValue('line1'),
          line2: collectFormValue('line2'),
          city: collectFormValue('city'),
          state: collectFormValue('state'),
          country: collectFormValue('country'),
          pincode: collectFormValue('pincode')
        },
        coordinates: (lat || lng) ? {
          latitude: parseFloat(lat) || 0,
          longitude: parseFloat(lng) || 0
        } : undefined,
        contact: {
          phone: collectFormValue('phone'),
          email: collectFormValue('email')
        },
        operational: {
          timeZone: collectFormValue('timeZone'),
          workingDays: collectCheckedValues('workingDays'),
          workingHours: collectFormValue('workingHours'),
          holidays: [],
          climate: collectFormValue('climate'),
          accessibility: collectFormValue('accessibility')
        },
        logistics: {
          nearestAirport: collectFormValue('nearestAirport'),
          nearestSeaport: collectFormValue('nearestSeaport'),
          transportModes: collectCheckedValues('transportModes'),
          deliveryTime: collectFormValue('deliveryTime'),
          shippingZones: collectCheckedValues('shippingZones')
        },
        compliance: {
          taxJurisdiction: collectFormValue('taxJurisdiction'),
          regulatoryZone: collectFormValue('regulatoryZone'),
          customsCode: collectFormValue('customsCode'),
          environmentalZone: collectFormValue('environmentalZone'),
          freeTradeZone: collectChecked('freeTradeZone')
        },
        facilities: collectCheckedValues('facilities'),
        restrictions: collectFormValue('restrictions')
          ? collectFormValue('restrictions').split(',').map(s => s.trim()).filter(Boolean)
          : []
      };

      if (selectedLocation) {
        await commonMastersService.updateLocation(selectedLocation.id, payload);
      } else {
        await commonMastersService.createLocation(payload);
      }
      setIsModalOpen(false);
      await loadLocations();
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Restricted': { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertTriangle }
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
      'Country': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'State': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'City': { bg: 'bg-cyan-100', text: 'text-cyan-800' },
      'Area': { bg: 'bg-teal-100', text: 'text-teal-800' },
      'Zone': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      'Site': { bg: 'bg-pink-100', text: 'text-pink-800' }
    };
    const config = typeConfig[type as keyof typeof typeConfig] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {type}
      </span>
    );
  };

  const buildLocationTree = (locations: Location[]) => {
    const tree: any[] = [];
    const map: { [key: string]: any } = {};

    locations.forEach(location => {
      map[location.id] = { ...location, children: [] };
    });

    locations.forEach(location => {
      if (location.parentId && map[location.parentId]) {
        map[location.parentId].children.push(map[location.id]);
      } else {
        tree.push(map[location.id]);
      }
    });

    return tree;
  };

  const renderTreeNode = (node: any, level: number = 0) => (
    <div key={node.id} className="border rounded-lg mb-2">
      <div className={`flex items-center justify-between p-3 hover:bg-gray-50`}
           style={{ paddingLeft: `${level * 2 + 1}rem` }}>
        <div className="flex items-center gap-3 flex-1">
          <MapPin className="h-4 w-4 text-gray-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{node.name}</span>
              <span className="text-sm text-gray-500">({node.code})</span>
              {getTypeBadge(node.type)}
              {getStatusBadge(node.status)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {node.address.city}, {node.address.state}, {node.address.country}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleEdit(node)}
                  className="p-1 hover:bg-gray-100 rounded">
            <Edit2 className="h-4 w-4 text-gray-600" />
          </button>
          <button onClick={() => handleDelete(node.id)}
                  className="p-1 hover:bg-red-100 rounded">
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="border-l-2 border-gray-200 ml-6">
          {node.children.map((child: any) => renderTreeNode(child, level + 1))}
        </div>
      )}
    </div>
  );

  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           location.address.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || location.type === filterType;
      const matchesStatus = filterStatus === 'All' || location.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [locations, searchTerm, filterType, filterStatus]);

  const locationTree = buildLocationTree(filteredLocations);

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2">Location Master</h2>
        <p className="text-gray-600">Manage geographical locations and facilities</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search locations..."
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
                <option value="Country">Country</option>
                <option value="State">State</option>
                <option value="City">City</option>
                <option value="Area">Area</option>
                <option value="Zone">Zone</option>
                <option value="Site">Site</option>
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
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-3 py-1 rounded ${viewMode === 'tree' ? 'bg-white shadow' : ''}`}
                >
                  Tree
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                >
                  List
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedLocation(null);
                  setIsModalOpen(true);
                  setCurrentTab('basic');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Location
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {viewMode === 'tree' ? (
            <div>
              {locationTree.map(node => renderTreeNode(node))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Zone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLocations.map((location) => (
                    <tr key={location.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono">{location.code}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{location.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getTypeBadge(location.type)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {location.address.city}, {location.address.state}
                      </td>
                      <td className="px-4 py-3 text-sm">{location.operational.timeZone}</td>
                      <td className="px-4 py-3">
                        {getStatusBadge(location.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(location)}
                                  className="text-blue-600 hover:text-blue-800">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(location.id)}
                                  className="text-red-600 hover:text-red-800">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full  max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {selectedLocation ? 'Edit Location' : 'Add New Location'}
              </h3>
            </div>

            <div className="flex border-b border-gray-200">
              {['basic', 'address', 'operational', 'logistics', 'compliance'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-4 py-2 font-medium capitalize ${
                    currentTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'basic' ? 'Basic Info' : tab}
                </button>
              ))}
            </div>

            <div ref={formRef} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {currentTab === 'basic' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location Code *
                      </label>
                      <input
                        type="text"
                        data-field="code"
                        defaultValue={selectedLocation?.code}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="LOC-XXX-XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location Name *
                      </label>
                      <input
                        type="text"
                        data-field="name"
                        defaultValue={selectedLocation?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter location name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select data-field="type" defaultValue={selectedLocation?.type || 'Site'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Country">Country</option>
                        <option value="State">State</option>
                        <option value="City">City</option>
                        <option value="Area">Area</option>
                        <option value="Zone">Zone</option>
                        <option value="Site">Site</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Location
                      </label>
                      <select data-field="parentId" defaultValue={selectedLocation?.parentId}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">None</option>
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        data-field="phone"
                        defaultValue={selectedLocation?.contact.phone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+1-xxx-xxx-xxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        data-field="email"
                        defaultValue={selectedLocation?.contact.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="location@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select data-field="status" defaultValue={selectedLocation?.status || 'Active'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Restricted">Restricted</option>
                    </select>
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
                      data-field="line1"
                      defaultValue={selectedLocation?.address.line1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      data-field="line2"
                      defaultValue={selectedLocation?.address.line2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Suite, floor, etc."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        data-field="city"
                        defaultValue={selectedLocation?.address.city}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        data-field="state"
                        defaultValue={selectedLocation?.address.state}
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
                        data-field="country"
                        defaultValue={selectedLocation?.address.country}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP/Postal Code *
                      </label>
                      <input
                        type="text"
                        data-field="pincode"
                        defaultValue={selectedLocation?.address.pincode}
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
                        data-field="latitude"
                        defaultValue={selectedLocation?.coordinates?.latitude}
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
                        data-field="longitude"
                        defaultValue={selectedLocation?.coordinates?.longitude}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'operational' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Zone *
                    </label>
                    <select data-field="timeZone" defaultValue={selectedLocation?.operational.timeZone || 'America/New_York'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="America/New_York">America/New_York</option>
                      <option value="America/Los_Angeles">America/Los_Angeles</option>
                      <option value="America/Chicago">America/Chicago</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                      <option value="Asia/Shanghai">Asia/Shanghai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Working Days
                    </label>
                    <div className="flex gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <label key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            data-group="workingDays"
                            value={day}
                            defaultChecked={
                              selectedLocation
                                ? selectedLocation.operational.workingDays?.includes(day)
                                : day !== 'Sun'
                            }
                            className="mr-1"
                          />
                          <span className="text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Working Hours
                    </label>
                    <input
                      type="text"
                      data-field="workingHours"
                      defaultValue={selectedLocation?.operational.workingHours || '09:00 - 17:00'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="09:00 - 17:00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Climate
                    </label>
                    <input
                      type="text"
                      data-field="climate"
                      defaultValue={selectedLocation?.operational.climate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Temperate, Tropical, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accessibility
                    </label>
                    <textarea
                      data-field="accessibility"
                      defaultValue={selectedLocation?.operational.accessibility}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Access restrictions and requirements"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facilities
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Warehouse', 'Office', 'Manufacturing', 'R&D Lab', 'Showroom', 'Cold Storage', 'Parking'].map(facility => (
                        <label key={facility} className="flex items-center">
                          <input
                            type="checkbox"
                            data-group="facilities"
                            value={facility}
                            defaultChecked={selectedLocation?.facilities?.includes(facility)}
                            className="mr-2"
                          />
                          <span className="text-sm">{facility}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'logistics' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nearest Airport
                      </label>
                      <input
                        type="text"
                        data-field="nearestAirport"
                        defaultValue={selectedLocation?.logistics.nearestAirport}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Airport code - distance"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nearest Seaport
                      </label>
                      <input
                        type="text"
                        data-field="nearestSeaport"
                        defaultValue={selectedLocation?.logistics.nearestSeaport}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Port name - distance"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transport Modes
                    </label>
                    <div className="flex gap-3">
                      {['Road', 'Rail', 'Air', 'Sea', 'Pipeline'].map(mode => (
                        <label key={mode} className="flex items-center">
                          <input
                            type="checkbox"
                            data-group="transportModes"
                            value={mode}
                            defaultChecked={selectedLocation?.logistics.transportModes?.includes(mode)}
                            className="mr-2"
                          />
                          <span className="text-sm">{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Typical Delivery Time
                    </label>
                    <input
                      type="text"
                      data-field="deliveryTime"
                      defaultValue={selectedLocation?.logistics.deliveryTime}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Same day for local, 2-3 days national"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Zones
                    </label>
                    <div className="flex gap-3">
                      {['Zone A', 'Zone B', 'Zone C', 'Express', 'International'].map(zone => (
                        <label key={zone} className="flex items-center">
                          <input
                            type="checkbox"
                            data-group="shippingZones"
                            value={zone}
                            defaultChecked={selectedLocation?.logistics.shippingZones?.includes(zone)}
                            className="mr-2"
                          />
                          <span className="text-sm">{zone}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restrictions
                    </label>
                    <textarea
                      data-field="restrictions"
                      defaultValue={selectedLocation?.restrictions?.join(', ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="e.g., Weight limits, hazardous materials restrictions"
                    />
                  </div>
                </div>
              )}

              {currentTab === 'compliance' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Jurisdiction
                      </label>
                      <input
                        type="text"
                        data-field="taxJurisdiction"
                        defaultValue={selectedLocation?.compliance.taxJurisdiction}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., California State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Regulatory Zone
                      </label>
                      <input
                        type="text"
                        data-field="regulatoryZone"
                        defaultValue={selectedLocation?.compliance.regulatoryZone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., US West Coast"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customs Code
                      </label>
                      <input
                        type="text"
                        data-field="customsCode"
                        defaultValue={selectedLocation?.compliance.customsCode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Customs territory code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Environmental Zone
                      </label>
                      <input
                        type="text"
                        data-field="environmentalZone"
                        defaultValue={selectedLocation?.compliance.environmentalZone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Green Zone"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        data-field="freeTradeZone"
                        defaultChecked={selectedLocation?.compliance.freeTradeZone}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Free Trade Zone</span>
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
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {selectedLocation ? 'Update' : 'Create'} Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}