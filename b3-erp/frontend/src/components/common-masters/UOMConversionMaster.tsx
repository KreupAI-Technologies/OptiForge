'use client';

import React, { useState, useEffect } from 'react';
import { Repeat, Plus, Search, Eye, Edit3, Calculator, ArrowRightLeft, CheckCircle, AlertTriangle, Trash2, X } from 'lucide-react';
import { commonMastersService } from '@/services/common-masters.service';

interface UOMConversion {
  id: string;
  fromUOM: string;
  toUOM: string;
  fromUomId: string;
  toUomId: string;
  conversionFactor: number;
  conversionFormula?: string;
  category: string;
  isReversible: boolean;

  validationRules?: {
    minQuantity?: number;
    maxQuantity?: number;
    decimalPlaces?: number;
  };

  usageContext?: {
    applicableFor: 'all' | 'specific-items' | 'specific-categories';
    items?: string[];
    categories?: string[];
  };

  status: 'active' | 'inactive';
  effectiveFrom: string;
  effectiveTo?: string;

  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

interface UomOption {
  id: string;
  code: string;
  name: string;
}

const COMPANY_ID = 'MAIN_COMPANY_ID';

const UOMConversionMaster: React.FC = () => {
  const [conversions, setConversions] = useState<UOMConversion[]>([]);
  const [uomOptions, setUomOptions] = useState<UomOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingConversion, setEditingConversion] = useState<UOMConversion | null>(null);

  const loadConversions = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [rows, uoms] = await Promise.all([
        commonMastersService.getAllUomConversions(COMPANY_ID),
        commonMastersService.getAllUoms(COMPANY_ID),
      ]);
      setUomOptions(
        (uoms ?? []).map((u: any) => ({
          id: String(u.id),
          code: u.code ?? u.uomCode ?? '',
          name: u.name ?? u.uomName ?? '',
        })),
      );
      const mapped: UOMConversion[] = (rows ?? []).map((c: any) => {
        const fromName = c.fromUom?.name ?? c.fromUom?.code ?? '';
        const toName = c.toUom?.name ?? c.toUom?.code ?? '';
        const factor = Number(c.conversionFactor ?? c.factor ?? 0);
        return {
          id: String(c.id),
          fromUOM: fromName,
          toUOM: toName,
          fromUomId: String(c.fromUomId ?? c.fromUom?.id ?? ''),
          toUomId: String(c.toUomId ?? c.toUom?.id ?? ''),
          conversionFactor: factor,
          conversionFormula: `1 ${fromName} = ${factor} ${toName}`,
          category: 'General',
          isReversible: Boolean(c.isReversible ?? false),
          status: c.isActive === false ? 'inactive' : 'active',
          effectiveFrom: c.createdAt ? String(c.createdAt).slice(0, 10) : '',
          createdBy: 'system',
          createdAt: c.createdAt ? String(c.createdAt) : '',
        };
      });
      setConversions(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load conversions');
      setConversions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversions();
  }, []);

  const handleAddConversion = () => {
    setEditingConversion(null);
    setShowModal(true);
  };

  const handleEditConversion = (conversion: UOMConversion) => {
    setEditingConversion(conversion);
    setShowModal(true);
  };

  const handleDeleteConversion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversion?')) return;
    try {
      await commonMastersService.deleteUomConversion(id);
      await loadConversions();
    } catch (err) {
      console.error('Failed to delete conversion:', err);
      alert('Failed to delete conversion.');
    }
  };

  const handleSaveConversion = async (data: { fromUomId: string; toUomId: string; conversionFactor: number; status: 'active' | 'inactive' }) => {
    try {
      if (editingConversion) {
        await commonMastersService.updateUomConversion(editingConversion.id, {
          fromUomId: data.fromUomId,
          toUomId: data.toUomId,
          conversionFactor: data.conversionFactor,
          isActive: data.status === 'active',
        });
      } else {
        await commonMastersService.createUomConversion({
          fromUomId: data.fromUomId,
          toUomId: data.toUomId,
          conversionFactor: data.conversionFactor,
          companyId: COMPANY_ID,
        });
      }
      setShowModal(false);
      await loadConversions();
    } catch (err) {
      console.error('Failed to save conversion:', err);
      alert('Failed to save conversion.');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [calculatorMode, setCalculatorMode] = useState(false);
  const [calcFromUOM, setCalcFromUOM] = useState('');
  const [calcToUOM, setCalcToUOM] = useState('');
  const [calcValue, setCalcValue] = useState<number>(1);
  const [calcResult, setCalcResult] = useState<number | null>(null);

  const categories = Array.from(new Set(conversions.map(c => c.category)));

  const filteredConversions = conversions.filter(c => {
    const matchesSearch = c.fromUOM.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.toUOM.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const performCalculation = () => {
    const conversion = conversions.find(c => 
      c.fromUOM === calcFromUOM && c.toUOM === calcToUOM && c.status === 'active'
    );
    if (conversion) {
      setCalcResult(calcValue * conversion.conversionFactor);
    } else {
      // Check for reverse conversion
      const reverseConversion = conversions.find(c => 
        c.toUOM === calcFromUOM && c.fromUOM === calcToUOM && c.isReversible && c.status === 'active'
      );
      if (reverseConversion) {
        setCalcResult(calcValue / reverseConversion.conversionFactor);
      } else {
        setCalcResult(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="">
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Repeat className="w-8 h-8 text-indigo-600" />
                UOM Conversion Master
              </h1>
              <p className="text-gray-600 mt-2">Manage unit of measure conversion rules</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setCalculatorMode(!calculatorMode)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                {calculatorMode ? 'Close' : 'Calculator'}
              </button>
              <button
                onClick={handleAddConversion}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Conversion
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conversions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="mb-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            Loading conversions…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {/* Calculator Mode */}
        {calculatorMode && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg shadow-sm p-3 mb-3 border border-indigo-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              UOM Conversion Calculator
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={calcValue}
                  onChange={(e) => setCalcValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter value"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From UOM</label>
                <select
                  value={calcFromUOM}
                  onChange={(e) => setCalcFromUOM(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select...</option>
                  {Array.from(new Set(conversions.flatMap(c => [c.fromUOM, c.toUOM]))).sort().map(uom => (
                    <option key={uom} value={uom}>{uom}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRightLeft className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To UOM</label>
                <select
                  value={calcToUOM}
                  onChange={(e) => setCalcToUOM(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select...</option>
                  {Array.from(new Set(conversions.flatMap(c => [c.fromUOM, c.toUOM]))).sort().map(uom => (
                    <option key={uom} value={uom}>{uom}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={performCalculation}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Calculate
              </button>
            </div>
            {calcResult !== null && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-200">
                <p className="text-lg font-semibold text-gray-900">
                  {calcValue} {calcFromUOM} = <span className="text-indigo-600">{calcResult.toFixed(4)} {calcToUOM}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Conversions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{conversions.length}</p>
              </div>
              <Repeat className="w-12 h-12 text-indigo-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {conversions.filter(c => c.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reversible</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {conversions.filter(c => c.isReversible).length}
                </p>
              </div>
              <ArrowRightLeft className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{categories.length}</p>
              </div>
              <Repeat className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Conversions List */}
        <div className="space-y-2">
          {filteredConversions.map(conversion => (
            <div key={conversion.id} className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {conversion.fromUOM} → {conversion.toUOM}
                    </h3>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                      {conversion.category}
                    </span>
                    {conversion.isReversible && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                        <ArrowRightLeft className="w-3 h-3" />
                        Reversible
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      conversion.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {conversion.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-mono bg-gray-50 inline-block px-3 py-1 rounded">
                    {conversion.conversionFormula}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">View</span>
                  </button>
                  <button
                    onClick={() => handleEditConversion(conversion)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Edit3 className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteConversion(conversion.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-red-600">Delete</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Conversion Details */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Conversion Factor</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Factor:</span>
                      <span className="font-medium text-indigo-600 text-lg">{conversion.conversionFactor}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      1 {conversion.fromUOM} = {conversion.conversionFactor} {conversion.toUOM}
                    </div>
                  </div>
                </div>

                {/* Validation Rules */}
                {conversion.validationRules && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Validation Rules</h4>
                    <div className="space-y-1 text-sm">
                      {conversion.validationRules.minQuantity !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min Qty:</span>
                          <span className="font-medium">{conversion.validationRules.minQuantity}</span>
                        </div>
                      )}
                      {conversion.validationRules.maxQuantity !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Qty:</span>
                          <span className="font-medium">{conversion.validationRules.maxQuantity}</span>
                        </div>
                      )}
                      {conversion.validationRules.decimalPlaces !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Decimals:</span>
                          <span className="font-medium">{conversion.validationRules.decimalPlaces}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Usage Context */}
                {conversion.usageContext && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Usage Context</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Applicable For:</span>
                        <span className="font-medium capitalize">{conversion.usageContext.applicableFor.replace('-', ' ')}</span>
                      </div>
                      {conversion.usageContext.categories && conversion.usageContext.categories.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Categories:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {conversion.usageContext.categories.map((cat, index) => (
                              <span key={index} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {conversion.usageContext.items && conversion.usageContext.items.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Items: {conversion.usageContext.items.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Effective Date */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      Effective From: <span className="font-medium">{new Date(conversion.effectiveFrom).toLocaleDateString()}</span>
                    </span>
                    {conversion.effectiveTo && (
                      <span className="text-gray-600">
                        To: <span className="font-medium">{new Date(conversion.effectiveTo).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-gray-500">
                    Created by {conversion.createdBy} on {new Date(conversion.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && filteredConversions.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-300 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversions found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {showModal && (
        <ConversionModal
          conversion={editingConversion}
          uomOptions={uomOptions}
          onSave={handleSaveConversion}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

interface ConversionModalProps {
  conversion: UOMConversion | null;
  uomOptions: UomOption[];
  onSave: (data: { fromUomId: string; toUomId: string; conversionFactor: number; status: 'active' | 'inactive' }) => void;
  onClose: () => void;
}

function ConversionModal({ conversion, uomOptions, onSave, onClose }: ConversionModalProps) {
  const [formData, setFormData] = useState({
    fromUomId: conversion?.fromUomId || '',
    toUomId: conversion?.toUomId || '',
    conversionFactor: conversion?.conversionFactor ?? 1,
    status: (conversion?.status || 'active') as 'active' | 'inactive',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fromUomId || !formData.toUomId) {
      alert('Please select both From and To units.');
      return;
    }
    onSave({
      fromUomId: formData.fromUomId,
      toUomId: formData.toUomId,
      conversionFactor: Number(formData.conversionFactor),
      status: formData.status,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {conversion ? 'Edit Conversion' : 'Add New Conversion'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-3 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From UOM</label>
            <select
              value={formData.fromUomId}
              onChange={(e) => setFormData({ ...formData, fromUomId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select UOM</option>
              {uomOptions.map((u) => (
                <option key={u.id} value={u.id}>{u.name}{u.code ? ` (${u.code})` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To UOM</label>
            <select
              value={formData.toUomId}
              onChange={(e) => setFormData({ ...formData, toUomId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select UOM</option>
              {uomOptions.map((u) => (
                <option key={u.id} value={u.id}>{u.name}{u.code ? ` (${u.code})` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conversion Factor</label>
            <input
              type="number"
              step="0.0001"
              value={formData.conversionFactor}
              onChange={(e) => setFormData({ ...formData, conversionFactor: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="pt-2 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {conversion ? 'Update Conversion' : 'Create Conversion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UOMConversionMaster;
