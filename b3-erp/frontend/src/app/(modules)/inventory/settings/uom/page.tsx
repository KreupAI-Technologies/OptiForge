'use client';

import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  RefreshCw
} from 'lucide-react';
import { commonMastersService } from '@/services/common-masters.service';

const COMPANY_ID = 'default-company-id';

interface UnitOfMeasure {
  id: number | string;
  code: string;
  name: string;
  uomType: 'quantity' | 'weight' | 'length' | 'volume' | 'area' | 'time';
  baseUnit?: string;
  conversionFactor?: number;
  decimalPlaces: number;
  status: 'active' | 'inactive';
  usageCount: number;
}

export default function UOMPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const [uoms, setUoms] = useState<UnitOfMeasure[]>([]);

  const mapUom = (row: any): UnitOfMeasure => ({
    id: row?.id ?? row?._id ?? '',
    code: row?.code ?? row?.symbol ?? row?.abbreviation ?? '',
    name: row?.name ?? '',
    uomType: (row?.uomType ?? row?.type ?? 'quantity') as UnitOfMeasure['uomType'],
    baseUnit: row?.baseUnit ?? row?.baseUom ?? undefined,
    conversionFactor: row?.conversionFactor ?? undefined,
    decimalPlaces: row?.decimalPlaces ?? 0,
    status: (row?.status ?? (row?.isActive === false ? 'inactive' : 'active')) as UnitOfMeasure['status'],
    usageCount: row?.usageCount ?? 0,
  });

  const fetchUoms = async () => {
    try {
      const rows = await commonMastersService.getAllUoms(COMPANY_ID);
      setUoms(Array.isArray(rows) ? rows.map(mapUom) : []);
    } catch (error) {
      console.error('Failed to load UOMs', error);
      setUoms([]);
    }
  };

  useEffect(() => {
    fetchUoms();
  }, []);

  const handleCreateUom = async (payload: any) => {
    try {
      await commonMastersService.createUom({ ...payload, companyId: COMPANY_ID });
      await fetchUoms();
    } catch (error) {
      console.error('Failed to create UOM', error);
    }
  };

  const handleUpdateUom = async (id: number | string, payload: any) => {
    try {
      await commonMastersService.updateUom(String(id), payload);
      await fetchUoms();
    } catch (error) {
      console.error('Failed to update UOM', error);
    }
  };

  const handleDeleteUom = async (id: number | string) => {
    try {
      await commonMastersService.deleteUom(String(id));
      await fetchUoms();
    } catch (error) {
      console.error('Failed to delete UOM', error);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'quantity': 'text-blue-600 bg-blue-50 border-blue-200',
      'weight': 'text-green-600 bg-green-50 border-green-200',
      'length': 'text-purple-600 bg-purple-50 border-purple-200',
      'volume': 'text-orange-600 bg-orange-50 border-orange-200',
      'area': 'text-pink-600 bg-pink-50 border-pink-200',
      'time': 'text-cyan-600 bg-cyan-50 border-cyan-200'
    };
    return colors[type] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'text-green-600 bg-green-50 border-green-200'
      : 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const activeUOMs = uoms.filter(u => u.status === 'active').length;
  const totalUsage = uoms.reduce((sum, u) => sum + u.usageCount, 0);
  const derivedUnits = uoms.filter(u => u.baseUnit).length;

  const filteredUOMs = uoms.filter(uom => {
    const matchesSearch = uom.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         uom.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || uom.uomType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Scale className="w-8 h-8 text-green-600" />
            <span>Units of Measure</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage measurement units and conversions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const code = window.prompt('UOM code');
              if (!code) return;
              const name = window.prompt('UOM name') || code;
              handleCreateUom({ code, name });
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add UOM</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Scale className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{activeUOMs}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Active UOMs</div>
          <div className="text-xs text-green-600 mt-1">Available for Use</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <RefreshCw className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{derivedUnits}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Derived Units</div>
          <div className="text-xs text-blue-600 mt-1">With Conversion</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Scale className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{totalUsage}</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Total Usage</div>
          <div className="text-xs text-purple-600 mt-1">Items Using UOMs</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search UOMs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="quantity">Quantity</option>
            <option value="weight">Weight</option>
            <option value="length">Length</option>
            <option value="volume">Volume</option>
            <option value="area">Area</option>
            <option value="time">Time</option>
          </select>
        </div>
      </div>

      {/* UOM Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Unit</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Factor</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decimal Places</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Count</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUOMs.map((uom) => (
                <tr key={uom.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {uom.code}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {uom.name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(uom.uomType)}`}>
                      {uom.uomType.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    {uom.baseUnit || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {uom.conversionFactor ? (
                      <span className="font-medium">{uom.conversionFactor}</span>
                    ) : '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                    {uom.decimalPlaces}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {uom.usageCount}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(uom.status)}`}>
                      {uom.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Eye className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">View</span>
                      </button>
                      <button
                        onClick={() => {
                          const name = window.prompt('UOM name', uom.name);
                          if (name === null) return;
                          handleUpdateUom(uom.id, { name });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                      {uom.usageCount === 0 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete UOM "${uom.name}"?`)) handleDeleteUom(uom.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">Delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Formula Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center space-x-2">
          <RefreshCw className="w-5 h-5" />
          <span>Unit Conversion Formula</span>
        </h3>
        <div className="text-sm text-blue-800">
          <p><strong>Derived Unit Value</strong> = Base Unit Value × Conversion Factor</p>
          <p className="mt-2">Example: 1 MT = 1 KG × 1000 = 1000 KG</p>
          <p className="mt-2">Example: 1 MM = 1 MTR × 0.001 = 0.001 MTR</p>
        </div>
      </div>
    </div>
  );
}
