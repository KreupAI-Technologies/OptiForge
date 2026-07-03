'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Hammer, Plus, Search, Edit2, Trash2, CheckCircle2,
  XCircle, Clock, Users, DollarSign, Wrench
} from 'lucide-react';
import { manufacturingMastersService, InstallationType as BackendInstallationType } from '@/services/manufacturing-masters.service';

interface InstallationType {
  id: string;
  code: string;
  name: string;
  category: 'Wall-mounted' | 'Floor-standing' | 'Built-in' | 'Modular' | 'Island' | 'Under-counter';
  complexity: 'Simple' | 'Moderate' | 'Complex' | 'Highly Complex';
  requirements: {
    laborHours: number;
    skillLevel: 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';
    teamSize: number;
    specialTools: string[];
  };
  prerequisites: string[];
  steps: string[];
  materials: string[];
  suitableFor: string[];
  estimatedCost: {
    min: number;
    max: number;
  };
  duration: {
    value: number;
    unit: string;
  };
  warranty: string;
  safetyRequirements: string[];
  certifications: string[];
  status: string;
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
}

export default function InstallationTypeMaster() {
  const [installationTypes, setInstallationTypes] = useState<InstallationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<InstallationType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterComplexity, setFilterComplexity] = useState<string>('All');

  useEffect(() => {
    fetchInstallationTypes();
  }, []);

  const fetchInstallationTypes = async () => {
    try {
      setIsLoading(true);
      const data = await manufacturingMastersService.getAllInstallationTypes('123e4567-e89b-12d3-a456-426614174000');

      const mapped: InstallationType[] = data.map(it => ({
        id: it.id,
        code: it.code,
        name: it.name,
        category: it.category as any,
        complexity: it.complexity as any,
        requirements: {
          laborHours: it.requirements?.laborHours || 0,
          skillLevel: it.requirements?.skillLevel as any || 'Intermediate',
          teamSize: it.requirements?.teamSize || 1,
          specialTools: it.requirements?.specialTools || []
        },
        prerequisites: it.prerequisites,
        steps: it.steps,
        materials: it.materials,
        suitableFor: it.suitableFor,
        estimatedCost: {
          min: it.costMin,
          max: it.costMax
        },
        duration: {
          value: it.durationValue || 0,
          unit: it.durationUnit || 'hours'
        },
        warranty: it.warranty || '',
        safetyRequirements: it.safetyRequirements,
        certifications: it.certifications,
        status: it.status
      }));

      setInstallationTypes(mapped);
    } catch (error) {
      console.error('Error fetching installation types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (type: InstallationType) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this installation type?')) {
      setInstallationTypes(installationTypes.filter(t => t.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Under Review': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock }
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

  const getComplexityBadge = (complexity: string) => {
    const complexityConfig = {
      'Simple': 'bg-green-100 text-green-800',
      'Moderate': 'bg-blue-100 text-blue-800',
      'Complex': 'bg-orange-100 text-orange-800',
      'Highly Complex': 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${complexityConfig[complexity as keyof typeof complexityConfig]}`}>
        {complexity}
      </span>
    );
  };

  const filteredTypes = useMemo(() => {
    return installationTypes.filter(type => {
      const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesComplexity = filterComplexity === 'All' || type.complexity === filterComplexity;
      return matchesSearch && matchesComplexity;
    });
  }, [installationTypes, searchTerm, filterComplexity]);

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2">Installation Type Master</h2>
        <p className="text-gray-600">Manage installation methods, requirements, and labor specifications</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search installation types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterComplexity}
                onChange={(e) => setFilterComplexity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Complexity</option>
                <option value="Simple">Simple</option>
                <option value="Moderate">Moderate</option>
                <option value="Complex">Complex</option>
                <option value="Highly Complex">Highly Complex</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSelectedType(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Installation Type
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Installation Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category & Complexity
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requirements
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration & Cost
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
              {filteredTypes.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{type.name}</div>
                      <div className="text-xs text-gray-500">{type.code}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="flex items-center gap-1 text-sm mb-1">
                        <Hammer className="h-4 w-4 text-gray-400" />
                        <span>{type.category}</span>
                      </div>
                      {getComplexityBadge(type.complexity)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>{type.requirements.laborHours} hrs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span>{type.requirements.teamSize} person(s)</span>
                      </div>
                      <div className="text-gray-500">{type.requirements.skillLevel}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-500" />
                        <span>{type.duration.value} {type.duration.unit}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 font-medium mt-1">
                        <DollarSign className="h-3 w-3" />
                        ₹{type.estimatedCost.min} - ₹{type.estimatedCost.max}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {getStatusBadge(type.status)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(type)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(type.id)}
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
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {selectedType ? 'Edit Installation Type' : 'Add New Installation Type'}
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
                      Code *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedType?.code}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="INST-XXX-XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedType?.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Installation type name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      defaultValue={selectedType?.category || 'Floor-standing'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Wall-mounted">Wall-mounted</option>
                      <option value="Floor-standing">Floor-standing</option>
                      <option value="Built-in">Built-in</option>
                      <option value="Modular">Modular</option>
                      <option value="Island">Island</option>
                      <option value="Under-counter">Under-counter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Complexity *
                    </label>
                    <select
                      defaultValue={selectedType?.complexity || 'Moderate'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Simple">Simple</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Complex">Complex</option>
                      <option value="Highly Complex">Highly Complex</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Labor Hours *
                    </label>
                    <input
                      type="number"
                      defaultValue={selectedType?.requirements.laborHours}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Size *
                    </label>
                    <input
                      type="number"
                      defaultValue={selectedType?.requirements.teamSize}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skill Level *
                    </label>
                    <select
                      defaultValue={selectedType?.requirements.skillLevel || 'Intermediate'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Cost (₹) *
                    </label>
                    <input
                      type="number"
                      defaultValue={selectedType?.estimatedCost.min}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Cost (₹) *
                    </label>
                    <input
                      type="number"
                      defaultValue={selectedType?.estimatedCost.max}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    defaultValue={selectedType?.status || 'Active'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Under Review">Under Review</option>
                  </select>
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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Installation Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
