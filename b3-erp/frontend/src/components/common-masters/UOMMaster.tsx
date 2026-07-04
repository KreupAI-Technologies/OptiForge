'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Scale, ArrowLeftRight, Calculator, TrendingUp, Download, Upload, Grid, List, Package } from 'lucide-react';
import { commonMastersService } from '@/services/common-masters.service';
import { pickAndParseCsv } from '@/lib/import';

interface UOM {
  id: string;
  uomCode: string;
  uomName: string;
  uomType: 'length' | 'weight' | 'volume' | 'area' | 'count' | 'time' | 'other';
  baseUnit: boolean;
  status: 'active' | 'inactive';
  description: string;
  symbol?: string;
  precision: number;
  rounding: 'round' | 'round_up' | 'round_down';
  conversionRules: {
    allowFractional: boolean;
    minValue: number;
    maxValue: number;
  };
  displaySettings: {
    showSymbol: boolean;
    symbolPosition: 'before' | 'after';
    decimalPlaces: number;
  };
  usage: {
    purchasing: boolean;
    sales: boolean;
    inventory: boolean;
    manufacturing: boolean;
  };
  statistics: {
    itemCount: number;
    conversionCount: number;
    lastUsed: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface UOMConversion {
  id: string;
  fromUOM: string;
  toUOM: string;
  factor: number;
  formula?: string;
  isReversible: boolean;
  validFrom: string;
  validTo?: string;
  status: 'active' | 'inactive';
}

const mockUOMs: UOM[] = [
  {
    id: '1',
    uomCode: 'PCS',
    uomName: 'Pieces',
    uomType: 'count',
    baseUnit: true,
    status: 'active',
    description: 'Individual pieces or units',
    symbol: 'pcs',
    precision: 0,
    rounding: 'round',
    conversionRules: {
      allowFractional: false,
      minValue: 1,
      maxValue: 999999
    },
    displaySettings: {
      showSymbol: true,
      symbolPosition: 'after',
      decimalPlaces: 0
    },
    usage: {
      purchasing: true,
      sales: true,
      inventory: true,
      manufacturing: true
    },
    statistics: {
      itemCount: 245,
      conversionCount: 8,
      lastUsed: '2024-01-15'
    },
    createdAt: '2023-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    uomCode: 'SQFT',
    uomName: 'Square Feet',
    uomType: 'area',
    baseUnit: false,
    status: 'active',
    description: 'Square feet measurement for area calculations',
    symbol: 'sq ft',
    precision: 2,
    rounding: 'round',
    conversionRules: {
      allowFractional: true,
      minValue: 0.01,
      maxValue: 99999
    },
    displaySettings: {
      showSymbol: true,
      symbolPosition: 'after',
      decimalPlaces: 2
    },
    usage: {
      purchasing: true,
      sales: true,
      inventory: true,
      manufacturing: false
    },
    statistics: {
      itemCount: 89,
      conversionCount: 12,
      lastUsed: '2024-01-12'
    },
    createdAt: '2023-01-20',
    updatedAt: '2024-01-12'
  },
  {
    id: '3',
    uomCode: 'LF',
    uomName: 'Linear Feet',
    uomType: 'length',
    baseUnit: false,
    status: 'active',
    description: 'Linear feet for measuring length',
    symbol: 'lf',
    precision: 2,
    rounding: 'round',
    conversionRules: {
      allowFractional: true,
      minValue: 0.01,
      maxValue: 9999
    },
    displaySettings: {
      showSymbol: true,
      symbolPosition: 'after',
      decimalPlaces: 2
    },
    usage: {
      purchasing: true,
      sales: true,
      inventory: true,
      manufacturing: true
    },
    statistics: {
      itemCount: 67,
      conversionCount: 6,
      lastUsed: '2024-01-10'
    },
    createdAt: '2023-01-25',
    updatedAt: '2024-01-10'
  },
  {
    id: '4',
    uomCode: 'BOX',
    uomName: 'Box',
    uomType: 'count',
    baseUnit: false,
    status: 'active',
    description: 'Packaging unit - box containing multiple pieces',
    symbol: 'box',
    precision: 0,
    rounding: 'round',
    conversionRules: {
      allowFractional: false,
      minValue: 1,
      maxValue: 9999
    },
    displaySettings: {
      showSymbol: true,
      symbolPosition: 'after',
      decimalPlaces: 0
    },
    usage: {
      purchasing: true,
      sales: false,
      inventory: true,
      manufacturing: false
    },
    statistics: {
      itemCount: 156,
      conversionCount: 4,
      lastUsed: '2024-01-08'
    },
    createdAt: '2023-02-01',
    updatedAt: '2024-01-08'
  }
];

const mockConversions: UOMConversion[] = [
  {
    id: '1',
    fromUOM: '4', // BOX
    toUOM: '1',   // PCS
    factor: 25,
    isReversible: true,
    validFrom: '2023-01-01',
    status: 'active'
  },
  {
    id: '2',
    fromUOM: '2', // SQFT
    toUOM: '3',   // LF
    factor: 12,
    formula: 'sqft * 12 = lf (for 1ft width)',
    isReversible: false,
    validFrom: '2023-01-01',
    status: 'active'
  }
];

const uomTypes = ['length', 'weight', 'volume', 'area', 'count', 'time', 'other'];
const roundingOptions = ['round', 'round_up', 'round_down'];

export default function UOMMaster() {
  const [uoms, setUOMs] = useState<UOM[]>(mockUOMs);
  const [conversions, setConversions] = useState<UOMConversion[]>(mockConversions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterUsage, setFilterUsage] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [editingUOM, setEditingUOM] = useState<UOM | null>(null);
  const [editingConversion, setEditingConversion] = useState<UOMConversion | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'conversions'>('list');
  const [activeTab, setActiveTab] = useState('basic');
  const companyId = 'MAIN_COMPANY_ID';

  const handleImport = async () => {
    try {
      const rows = await pickAndParseCsv();
      if (!rows) return;
      if (rows.length === 0) { alert('The selected CSV file has no data rows.'); return; }
      const result = await commonMastersService.bulkCreate('uoms', rows, companyId);
      alert(`Import complete: ${result.created} created, ${result.skipped} skipped (of ${result.total} rows).`);
    } catch (error) {
      console.error('Error importing uoms:', error);
      alert('Import failed. Please check the CSV format and try again.');
    }
  };

  const filteredUOMs = uoms.filter(uom => {
    const matchesSearch = uom.uomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         uom.uomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         uom.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || uom.uomType === filterType;
    const matchesStatus = filterStatus === 'all' || uom.status === filterStatus;
    const matchesUsage = filterUsage === 'all' ||
                        (filterUsage === 'purchasing' && uom.usage.purchasing) ||
                        (filterUsage === 'sales' && uom.usage.sales) ||
                        (filterUsage === 'inventory' && uom.usage.inventory) ||
                        (filterUsage === 'manufacturing' && uom.usage.manufacturing);

    return matchesSearch && matchesType && matchesStatus && matchesUsage;
  });

  const handleAddUOM = () => {
    setEditingUOM(null);
    setShowModal(true);
    setActiveTab('basic');
  };

  const handleEditUOM = (uom: UOM) => {
    setEditingUOM(uom);
    setShowModal(true);
    setActiveTab('basic');
  };

  const handleDeleteUOM = (id: string) => {
    const hasConversions = conversions.some(conv => conv.fromUOM === id || conv.toUOM === id);
    if (hasConversions) {
      alert('Cannot delete UOM with existing conversions. Please delete conversions first.');
      return;
    }
    if (confirm('Are you sure you want to delete this UOM?')) {
      setUOMs(uoms.filter(uom => uom.id !== id));
    }
  };

  const handleSaveUOM = (uomData: any) => {
    if (editingUOM) {
      setUOMs(uoms.map(uom =>
        uom.id === editingUOM.id
          ? { ...uom, ...uomData, updatedAt: new Date().toISOString().split('T')[0] }
          : uom
      ));
    } else {
      const newUOM: UOM = {
        id: Date.now().toString(),
        ...uomData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setUOMs([...uoms, newUOM]);
    }
    setShowModal(false);
  };

  const handleAddConversion = () => {
    setEditingConversion(null);
    setShowConversionModal(true);
  };

  const handleEditConversion = (conversion: UOMConversion) => {
    setEditingConversion(conversion);
    setShowConversionModal(true);
  };

  const handleDeleteConversion = (id: string) => {
    if (confirm('Are you sure you want to delete this conversion?')) {
      setConversions(conversions.filter(conv => conv.id !== id));
    }
  };

  const handleSaveConversion = (conversionData: any) => {
    if (editingConversion) {
      setConversions(conversions.map(conv =>
        conv.id === editingConversion.id
          ? { ...conv, ...conversionData }
          : conv
      ));
    } else {
      const newConversion: UOMConversion = {
        id: Date.now().toString(),
        ...conversionData
      };
      setConversions([...conversions, newConversion]);
    }
    setShowConversionModal(false);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      length: 'bg-blue-100 text-blue-800',
      weight: 'bg-green-100 text-green-800',
      volume: 'bg-purple-100 text-purple-800',
      area: 'bg-yellow-100 text-yellow-800',
      count: 'bg-indigo-100 text-indigo-800',
      time: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`;
  };

  const getUOMName = (id: string) => {
    return uoms.find(uom => uom.id === id)?.uomName || 'Unknown';
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Scale className="w-8 h-8 text-blue-600" />
              Unit of Measure Master
            </h1>
            <p className="text-gray-600">Manage units of measurement and their conversions</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleImport} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleAddUOM}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add UOM
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4" />
                UOMs
              </div>
            </button>
            <button
              onClick={() => setViewMode('conversions')}
              className={`px-4 py-2 ${viewMode === 'conversions' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4" />
                Conversions
              </div>
            </button>
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search UOMs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {uomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterUsage}
              onChange={(e) => setFilterUsage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Usage</option>
              <option value="purchasing">Purchasing</option>
              <option value="sales">Sales</option>
              <option value="inventory">Inventory</option>
              <option value="manufacturing">Manufacturing</option>
            </select>
          </div>
        )}
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Settings</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statistics</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUOMs.map((uom) => (
                  <tr key={uom.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {uom.uomName}
                          {uom.baseUnit && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Base</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{uom.uomCode}</div>
                        {uom.symbol && (
                          <div className="text-sm text-gray-500">Symbol: {uom.symbol}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={getTypeBadge(uom.uomType)}>
                        {uom.uomType}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Precision: {uom.precision}</div>
                      <div className="text-sm text-gray-500">Rounding: {uom.rounding}</div>
                      <div className="text-sm text-gray-500">
                        {uom.conversionRules.allowFractional ? 'Fractional' : 'Whole numbers'}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {uom.usage.purchasing && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Purchase</span>
                        )}
                        {uom.usage.sales && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Sales</span>
                        )}
                        {uom.usage.inventory && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Inventory</span>
                        )}
                        {uom.usage.manufacturing && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Manufacturing</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{uom.statistics.itemCount} items</div>
                      <div className="text-sm text-gray-500">{uom.statistics.conversionCount} conversions</div>
                      <div className="text-sm text-gray-500">Last: {uom.statistics.lastUsed}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={getStatusBadge(uom.status)}>
                        {uom.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUOM(uom)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Edit</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Eye className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUOM(uom.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">UOM Conversions</h3>
            <button
              onClick={handleAddConversion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Conversion
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From UOM</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To UOM</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conversions.map((conversion) => (
                  <tr key={conversion.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getUOMName(conversion.fromUOM)}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getUOMName(conversion.toUOM)}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">1 : {conversion.factor}</div>
                      {conversion.formula && (
                        <div className="text-sm text-gray-500">{conversion.formula}</div>
                      )}
                      {conversion.isReversible && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Reversible</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">From: {conversion.validFrom}</div>
                      {conversion.validTo && (
                        <div className="text-sm text-gray-500">To: {conversion.validTo}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={getStatusBadge(conversion.status)}>
                        {conversion.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditConversion(conversion)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteConversion(conversion.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <UOMModal
          uom={editingUOM}
          onSave={handleSaveUOM}
          onClose={() => setShowModal(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {showConversionModal && (
        <ConversionModal
          conversion={editingConversion}
          uoms={uoms}
          onSave={handleSaveConversion}
          onClose={() => setShowConversionModal(false)}
        />
      )}
    </div>
  );
}

interface UOMModalProps {
  uom: UOM | null;
  onSave: (uom: any) => void;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function UOMModal({ uom, onSave, onClose, activeTab, setActiveTab }: UOMModalProps) {
  const [formData, setFormData] = useState({
    uomCode: uom?.uomCode || '',
    uomName: uom?.uomName || '',
    uomType: uom?.uomType || 'count',
    baseUnit: uom?.baseUnit || false,
    status: uom?.status || 'active',
    description: uom?.description || '',
    symbol: uom?.symbol || '',
    precision: uom?.precision || 0,
    rounding: uom?.rounding || 'round',
    conversionRules: uom?.conversionRules || {
      allowFractional: false,
      minValue: 1,
      maxValue: 999999
    },
    displaySettings: uom?.displaySettings || {
      showSymbol: true,
      symbolPosition: 'after',
      decimalPlaces: 0
    },
    usage: uom?.usage || {
      purchasing: true,
      sales: true,
      inventory: true,
      manufacturing: false
    },
    statistics: uom?.statistics || {
      itemCount: 0,
      conversionCount: 0,
      lastUsed: new Date().toISOString().split('T')[0]
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Scale },
    { id: 'conversion', label: 'Conversion Rules', icon: Calculator },
    { id: 'display', label: 'Display Settings', icon: Eye },
    { id: 'usage', label: 'Usage', icon: Package }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {uom ? 'Edit UOM' : 'Add New UOM'}
          </h2>
        </div>

        <div className="flex border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-96">
          <div className="px-3 py-2">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UOM Code</label>
                  <input
                    type="text"
                    value={formData.uomCode}
                    onChange={(e) => setFormData({...formData, uomCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UOM Name</label>
                  <input
                    type="text"
                    value={formData.uomName}
                    onChange={(e) => setFormData({...formData, uomName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UOM Type</label>
                  <select
                    value={formData.uomType}
                    onChange={(e) => setFormData({...formData, uomType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {uomTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.baseUnit}
                      onChange={(e) => setFormData({...formData, baseUnit: e.target.checked})}
                      className="mr-2"
                    />
                    Base Unit
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'conversion' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precision</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={formData.precision}
                    onChange={(e) => setFormData({...formData, precision: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rounding</label>
                  <select
                    value={formData.rounding}
                    onChange={(e) => setFormData({...formData, rounding: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {roundingOptions.map(option => (
                      <option key={option} value={option}>{option.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Value</label>
                  <input
                    type="number"
                    value={formData.conversionRules.minValue}
                    onChange={(e) => setFormData({...formData, conversionRules: {...formData.conversionRules, minValue: Number(e.target.value)}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Value</label>
                  <input
                    type="number"
                    value={formData.conversionRules.maxValue}
                    onChange={(e) => setFormData({...formData, conversionRules: {...formData.conversionRules, maxValue: Number(e.target.value)}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.conversionRules.allowFractional}
                      onChange={(e) => setFormData({...formData, conversionRules: {...formData.conversionRules, allowFractional: e.target.checked}})}
                      className="mr-2"
                    />
                    Allow Fractional Values
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symbol Position</label>
                  <select
                    value={formData.displaySettings.symbolPosition}
                    onChange={(e) => setFormData({...formData, displaySettings: {...formData.displaySettings, symbolPosition: e.target.value as any}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="before">Before</option>
                    <option value="after">After</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Decimal Places</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={formData.displaySettings.decimalPlaces}
                    onChange={(e) => setFormData({...formData, displaySettings: {...formData.displaySettings, decimalPlaces: Number(e.target.value)}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.displaySettings.showSymbol}
                      onChange={(e) => setFormData({...formData, displaySettings: {...formData.displaySettings, showSymbol: e.target.checked}})}
                      className="mr-2"
                    />
                    Show Symbol
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.usage.purchasing}
                      onChange={(e) => setFormData({...formData, usage: {...formData.usage, purchasing: e.target.checked}})}
                      className="mr-2"
                    />
                    Purchasing
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.usage.sales}
                      onChange={(e) => setFormData({...formData, usage: {...formData.usage, sales: e.target.checked}})}
                      className="mr-2"
                    />
                    Sales
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.usage.inventory}
                      onChange={(e) => setFormData({...formData, usage: {...formData.usage, inventory: e.target.checked}})}
                      className="mr-2"
                    />
                    Inventory
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.usage.manufacturing}
                      onChange={(e) => setFormData({...formData, usage: {...formData.usage, manufacturing: e.target.checked}})}
                      className="mr-2"
                    />
                    Manufacturing
                  </label>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="px-3 py-2 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {uom ? 'Update UOM' : 'Create UOM'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ConversionModalProps {
  conversion: UOMConversion | null;
  uoms: UOM[];
  onSave: (conversion: any) => void;
  onClose: () => void;
}

function ConversionModal({ conversion, uoms, onSave, onClose }: ConversionModalProps) {
  const [formData, setFormData] = useState({
    fromUOM: conversion?.fromUOM || '',
    toUOM: conversion?.toUOM || '',
    factor: conversion?.factor || 1,
    formula: conversion?.formula || '',
    isReversible: conversion?.isReversible || false,
    validFrom: conversion?.validFrom || new Date().toISOString().split('T')[0],
    validTo: conversion?.validTo || '',
    status: conversion?.status || 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {conversion ? 'Edit Conversion' : 'Add New Conversion'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-3 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From UOM</label>
              <select
                value={formData.fromUOM}
                onChange={(e) => setFormData({...formData, fromUOM: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select UOM</option>
                {uoms.map(uom => (
                  <option key={uom.id} value={uom.id}>{uom.uomName} ({uom.uomCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To UOM</label>
              <select
                value={formData.toUOM}
                onChange={(e) => setFormData({...formData, toUOM: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select UOM</option>
                {uoms.map(uom => (
                  <option key={uom.id} value={uom.id}>{uom.uomName} ({uom.uomCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conversion Factor</label>
              <input
                type="number"
                step="0.001"
                value={formData.factor}
                onChange={(e) => setFormData({...formData, factor: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid To</label>
              <input
                type="date"
                value={formData.validTo}
                onChange={(e) => setFormData({...formData, validTo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Formula (Optional)</label>
              <input
                type="text"
                value={formData.formula}
                onChange={(e) => setFormData({...formData, formula: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., sqft * 12 = lf (for 1ft width)"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isReversible}
                  onChange={(e) => setFormData({...formData, isReversible: e.target.checked})}
                  className="mr-2"
                />
                Reversible Conversion
              </label>
            </div>
          </div>
        </form>

        <div className="px-3 py-2 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {conversion ? 'Update Conversion' : 'Create Conversion'}
          </button>
        </div>
      </div>
    </div>
  );
}