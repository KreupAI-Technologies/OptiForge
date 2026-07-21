'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield, Plus, Search, Edit2, Trash2, CheckCircle2,
  AlertCircle, Target, TrendingUp, Activity, Ruler,
  FileText, Beaker, Settings, AlertTriangle, XCircle
} from 'lucide-react';
import { manufacturingMastersService, QualityParameter as BackendQualityParameter } from '../../services/manufacturing-masters.service';

interface QualityParameter {
  id: string;
  code: string;
  name: string;
  category: string;
  measurementType: string;
  unit?: string;
  specification: {
    nominal?: number;
    upperLimit?: number;
    lowerLimit?: number;
    tolerance?: number;
    acceptanceCriteria: string;
  };
  inspectionMethod: string;
  frequency: string;
  sampleSize?: number;
  testEquipment?: string;
  applicableItems: string[];
  criticality: string;
  documentation: boolean;
  status: string;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  };
}

export default function QualityParameterMaster() {
  const [parameters, setParameters] = useState<QualityParameter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await manufacturingMastersService.getAllQualityParameters('1');
      const mapped: QualityParameter[] = data.map((p: BackendQualityParameter) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        category: 'Dimensional',
        measurementType: 'Variable',
        unit: p.unit || '',
        specification: {
          nominal: p.targetValue || 0,
          upperLimit: p.maxValue || 0,
          lowerLimit: p.minValue || 0,
          tolerance: (p.maxValue && p.minValue) ? (p.maxValue - p.minValue) / 2 : 0,
          acceptanceCriteria: `${p.minValue || 0} - ${p.maxValue || 0} ${p.unit || ''}`
        },
        inspectionMethod: 'Standard Inspection',
        frequency: 'Every Unit',
        applicableItems: [],
        criticality: 'Major',
        documentation: true,
        status: 'Active',
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'admin',
          updatedBy: 'admin'
        }
      }));
      setParameters(mapped);
    } catch (err) {
      console.error('Error fetching quality parameters:', err);
      setError('Failed to load quality parameters. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedParameter, setSelectedParameter] = useState<QualityParameter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterCriticality, setFilterCriticality] = useState<string>('All');
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<{
    code: string; name: string; category: string; measurementType: string; unit: string;
    criticality: string; frequency: string; status: string; acceptanceCriteria: string; inspectionMethod: string;
  }>({ code: '', name: '', category: 'Dimensional', measurementType: 'Variable', unit: '', criticality: 'Major', frequency: 'Sample', status: 'Active', acceptanceCriteria: '', inspectionMethod: '' });

  const openCreateModal = () => {
    setSelectedParameter(null);
    setForm({ code: '', name: '', category: 'Dimensional', measurementType: 'Variable', unit: '', criticality: 'Major', frequency: 'Sample', status: 'Active', acceptanceCriteria: '', inspectionMethod: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (parameter: QualityParameter) => {
    setSelectedParameter(parameter);
    setForm({
      code: parameter.code,
      name: parameter.name,
      category: parameter.category,
      measurementType: parameter.measurementType,
      unit: parameter.unit || '',
      criticality: parameter.criticality,
      frequency: parameter.frequency,
      status: parameter.status,
      acceptanceCriteria: parameter.specification.acceptanceCriteria,
      inspectionMethod: parameter.inspectionMethod,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      setError('Parameter Code and Name are required.');
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      const payload = {
        code: form.code,
        name: form.name,
        unit: form.unit,
        description: form.acceptanceCriteria,
        companyId: '1',
      };
      if (selectedParameter) {
        await manufacturingMastersService.updateQualityParameter(selectedParameter.id, payload);
      } else {
        await manufacturingMastersService.createQualityParameter(payload);
      }
      setIsModalOpen(false);
      await fetchParameters();
    } catch (err) {
      console.error('Error saving quality parameter:', err);
      setError('Failed to save quality parameter. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this quality parameter?')) {
      try {
        await manufacturingMastersService.deleteQualityParameter(id);
        setParameters(parameters.filter(p => p.id !== id));
      } catch (err) {
        console.error('Error deleting quality parameter:', err);
        alert('Failed to delete quality parameter. Please try again.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Under Review': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle }
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

  const getCriticalityBadge = (criticality: string) => {
    const criticalityConfig = {
      'Critical': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle },
      'Major': { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle },
      'Minor': { bg: 'bg-blue-100', text: 'text-blue-800', icon: AlertCircle }
    };
    const config = criticalityConfig[criticality as keyof typeof criticalityConfig];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3" />
        {criticality}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Dimensional': Ruler,
      'Visual': Target,
      'Functional': Settings,
      'Material': Beaker,
      'Performance': TrendingUp,
      'Environmental': Activity
    };
    return icons[category as keyof typeof icons] || FileText;
  };

  const filteredParameters = useMemo(() => {
    return parameters.filter(param => {
      const matchesSearch = param.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        param.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || param.category === filterCategory;
      const matchesCriticality = filterCriticality === 'All' || param.criticality === filterCriticality;
      return matchesSearch && matchesCategory && matchesCriticality;
    });
  }, [parameters, searchTerm, filterCategory, filterCriticality]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-3 text-gray-500">
          <Activity className="h-5 w-5 animate-spin" />
          <span>Loading quality parameters...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2">Quality Parameter Master</h2>
        <p className="text-gray-600">Manage quality control standards and inspection parameters</p>
      </div>

      {parameters.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3 flex items-center gap-3 text-blue-700">
          <Shield className="h-5 w-5" />
          <span>No quality parameters found.</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search quality parameters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                <option value="Dimensional">Dimensional</option>
                <option value="Visual">Visual</option>
                <option value="Functional">Functional</option>
                <option value="Material">Material</option>
                <option value="Performance">Performance</option>
                <option value="Environmental">Environmental</option>
              </select>
              <select
                value={filterCriticality}
                onChange={(e) => setFilterCriticality(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Criticality</option>
                <option value="Critical">Critical</option>
                <option value="Major">Major</option>
                <option value="Minor">Minor</option>
              </select>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Parameter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parameter
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category & Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specification
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspection
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criticality
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
              {filteredParameters.map((param) => {
                const CategoryIcon = getCategoryIcon(param.category);
                return (
                  <tr key={param.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{param.name}</div>
                        <div className="text-sm text-gray-500">{param.code}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <CategoryIcon className="h-4 w-4 text-gray-400" />
                          <span>{param.category}</span>
                        </div>
                        <div className="text-xs text-gray-500">{param.measurementType}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm">
                        <div className="font-medium">{param.specification.acceptanceCriteria}</div>
                        {param.unit && (
                          <div className="text-xs text-gray-500">Unit: {param.unit}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm">
                        <div>{param.frequency}</div>
                        {param.sampleSize && (
                          <div className="text-xs text-gray-500">Sample: {param.sampleSize}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {getCriticalityBadge(param.criticality)}
                    </td>
                    <td className="px-3 py-2">
                      {getStatusBadge(param.status)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(param)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(param.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {selectedParameter ? 'Edit Quality Parameter' : 'Add New Quality Parameter'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parameter Code *
                    </label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="QP-XXX-000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parameter Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter parameter name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Dimensional">Dimensional</option>
                      <option value="Visual">Visual</option>
                      <option value="Functional">Functional</option>
                      <option value="Material">Material</option>
                      <option value="Performance">Performance</option>
                      <option value="Environmental">Environmental</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Measurement Type *
                    </label>
                    <select
                      value={form.measurementType}
                      onChange={(e) => setForm({ ...form, measurementType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Variable">Variable</option>
                      <option value="Attribute">Attribute</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="mm, HRC, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Criticality *
                    </label>
                    <select
                      value={form.criticality}
                      onChange={(e) => setForm({ ...form, criticality: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Critical">Critical</option>
                      <option value="Major">Major</option>
                      <option value="Minor">Minor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <select
                      value={form.frequency}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Every Unit">Every Unit</option>
                      <option value="Sample">Sample</option>
                      <option value="First/Last">First/Last</option>
                      <option value="Periodic">Periodic</option>
                      <option value="On Demand">On Demand</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acceptance Criteria *
                  </label>
                  <input
                    type="text"
                    value={form.acceptanceCriteria}
                    onChange={(e) => setForm({ ...form, acceptanceCriteria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 50.0 ± 0.05 mm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inspection Method
                  </label>
                  <input
                    type="text"
                    value={form.inspectionMethod}
                    onChange={(e) => setForm({ ...form, inspectionMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe inspection method"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Parameter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
