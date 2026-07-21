'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles, Plus, Search, Edit2, Trash2, CheckCircle2,
  XCircle, Palette, Droplet, Shield, DollarSign, X, Eye,
  BarChart3, Package, Clock, AlertCircle, TrendingUp, Info
} from 'lucide-react';
import { manufacturingMastersService, KitchenFinish as BackendFinish } from '@/services/manufacturing-masters.service';
import { commonMastersService } from '@/services/common-masters.service';

interface Finish {
  id: string;
  code: string;
  name: string;
  category: 'Paint' | 'Laminate' | 'Veneer' | 'Lacquer' | 'PU Finish' | 'Acrylic' | 'Membrane';
  subcategory: string;
  properties: {
    texture: 'Matt' | 'Glossy' | 'Semi-Glossy' | 'Satin' | 'Textured';
    sheen: string;
    durability: 'High' | 'Medium' | 'Low';
    waterResistance: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    scratchResistance: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  };
  colors: string[];
  applicationMethod: string[];
  suitableFor: string[];
  coverage: {
    value: number;
    unit: string;
  };
  dryingTime: {
    touch: string;
    recoat: string;
    fullCure: string;
  };
  pricePerUnit: number;
  maintenance: string;
  warranty: string;
  certifications: string[];
  status: string;
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
}

export default function FinishMaster() {
  const companyId = '123e4567-e89b-12d3-a456-426614174000';
  const codeRef = React.useRef<HTMLInputElement>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const categoryRef = React.useRef<HTMLSelectElement>(null);
  const textureRef = React.useRef<HTMLSelectElement>(null);
  const durabilityRef = React.useRef<HTMLSelectElement>(null);
  const waterResistanceRef = React.useRef<HTMLSelectElement>(null);
  const scratchResistanceRef = React.useRef<HTMLSelectElement>(null);
  const pricePerUnitRef = React.useRef<HTMLInputElement>(null);
  const warrantyRef = React.useRef<HTMLInputElement>(null);
  const statusRef = React.useRef<HTMLSelectElement>(null);
  const [finishes, setFinishes] = useState<Finish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFinish, setSelectedFinish] = useState<Finish | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedFinishForDetails, setSelectedFinishForDetails] = useState<Finish | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    fetchFinishes();
  }, []);

  const fetchFinishes = async () => {
    try {
      setIsLoading(true);
      const data = await manufacturingMastersService.getAllKitchenFinishes(companyId);

      const mapped: Finish[] = data.map(f => ({
        id: f.id,
        code: f.code,
        name: f.name,
        category: f.category as any,
        subcategory: f.subcategory || '',
        properties: {
          texture: f.properties?.texture || 'Matt',
          sheen: f.properties?.sheen || '',
          durability: f.properties?.durability || 'High',
          waterResistance: f.properties?.waterResistance || 'Good',
          scratchResistance: f.properties?.scratchResistance || 'Good'
        },
        colors: f.colors,
        applicationMethod: f.applicationMethod,
        suitableFor: f.suitableFor,
        coverage: {
          value: f.coverageValue || 0,
          unit: f.coverageUnit || 'sqm'
        },
        dryingTime: {
          touch: '2 hours',
          recoat: '6 hours',
          fullCure: '7 days'
        },
        pricePerUnit: f.pricePerUnit,
        maintenance: f.maintenance || '',
        warranty: f.warranty || '',
        certifications: f.certifications,
        status: f.status
      }));

      setFinishes(mapped);
    } catch (error) {
      console.error('Error fetching finishes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleViewDetails = (finish: Finish) => {
    setSelectedFinishForDetails(finish);
    setShowDetailsModal(true);
  };

  const handleEdit = (finish: Finish) => {
    setSelectedFinish(finish);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this finish?')) {
      try {
        await commonMastersService.deleteKitchenFinish(id);
        await fetchFinishes();
        showToast('Finish deleted', 'success');
      } catch (error) {
        console.error('Error deleting finish:', error);
        showToast('Failed to delete finish', 'error');
      }
    }
  };

  const handleSave = async () => {
    const code = codeRef.current?.value.trim() || '';
    const name = nameRef.current?.value.trim() || '';
    const category = categoryRef.current?.value || '';
    const texture = textureRef.current?.value || '';
    const durability = durabilityRef.current?.value || '';
    const waterResistance = waterResistanceRef.current?.value || '';
    const scratchResistance = scratchResistanceRef.current?.value || '';
    const pricePerUnit = Number(pricePerUnitRef.current?.value);
    const warranty = warrantyRef.current?.value || '';
    const status = statusRef.current?.value || '';

    if (!code || !name) {
      showToast('Code and Name are required', 'error');
      return;
    }

    const payload = {
      code,
      name,
      companyId,
      category,
      texture,
      price: pricePerUnit,
      pricePerUnit,
      warranty,
      status,
      properties: { texture, durability, waterResistance, scratchResistance }
    };

    try {
      if (selectedFinish) {
        await commonMastersService.updateKitchenFinish(selectedFinish.id, payload as any);
      } else {
        await commonMastersService.createKitchenFinish(payload as any);
      }
      setIsModalOpen(false);
      await fetchFinishes();
      showToast('Finish saved successfully', 'success');
    } catch (error) {
      console.error('Error saving finish:', error);
      showToast('Failed to save finish', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Discontinued': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
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

  const getDurabilityBadge = (durability: string) => {
    const colors = {
      'High': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-orange-100 text-orange-800'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[durability as keyof typeof colors]}`}>
        {durability}
      </span>
    );
  };

  const filteredFinishes = useMemo(() => {
    return finishes.filter(finish => {
      const matchesSearch = finish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        finish.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || finish.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [finishes, searchTerm, filterCategory]);

  // Calculate stats
  const stats = {
    total: finishes.length,
    active: finishes.filter(f => f.status === 'Active').length,
    categories: new Set(finishes.map(f => f.category)).size,
    avgPrice: Math.round(finishes.reduce((sum, f) => sum + f.pricePerUnit, 0) / finishes.length)
  };

  return (
    <div className="p-6 ">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {toast.type === 'error' && <X className="w-5 h-5" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Finish Master</h2>
          <p className="text-gray-600">Manage surface treatments, coatings, and finishing options</p>
        </div>
        <button
          onClick={() => setShowAnalyticsModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          <span>View Analytics</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <button
          onClick={() => setFilterCategory('All')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-blue-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-medium">Total Finishes</span>
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-blue-600 mt-1">Click to view all</div>
        </button>

        <button
          onClick={() => {
            setFilterCategory('All');
            showToast(`${stats.active} active finishes available`, 'info');
          }}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-green-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-medium">Active Finishes</span>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          <div className="text-xs text-green-600 mt-1">Currently available</div>
        </button>

        <button
          onClick={() => showToast(`${stats.categories} finish categories available`, 'info')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-purple-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-medium">Categories</span>
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600">{stats.categories}</div>
          <div className="text-xs text-purple-600 mt-1">Different types</div>
        </button>

        <button
          onClick={() => showToast(`Average price: ₹${stats.avgPrice} per unit`, 'info')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-orange-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-medium">Avg Price</span>
            <DollarSign className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-orange-600">₹{stats.avgPrice}</div>
          <div className="text-xs text-orange-600 mt-1">Per unit</div>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search finishes..."
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
                <option value="Paint">Paint</option>
                <option value="Laminate">Laminate</option>
                <option value="Veneer">Veneer</option>
                <option value="Lacquer">Lacquer</option>
                <option value="PU Finish">PU Finish</option>
                <option value="Acrylic">Acrylic</option>
                <option value="Membrane">Membrane</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSelectedFinish(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Finish
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Finish Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Properties
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resistance
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price/Unit
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
              {filteredFinishes.map((finish) => (
                <tr
                  key={finish.id}
                  onClick={() => handleViewDetails(finish)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {finish.name}
                        <Eye className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-xs text-gray-500">{finish.code}</div>
                      <div className="text-xs text-gray-400">{finish.subcategory}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-sm">
                      <Sparkles className="h-4 w-4 text-gray-400" />
                      <span>{finish.category}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <Palette className="h-3 w-3 text-gray-400" />
                        <span>{finish.properties.texture}</span>
                      </div>
                      <div>Sheen: {finish.properties.sheen}</div>
                      <div>Durability: {getDurabilityBadge(finish.properties.durability)}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <Droplet className="h-3 w-3 text-blue-500" />
                        <span>Water: {finish.properties.waterResistance}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-green-500" />
                        <span>Scratch: {finish.properties.scratchResistance}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <DollarSign className="h-3 w-3" />
                      ₹{finish.pricePerUnit}
                    </div>
                    <div className="text-xs text-gray-500">{finish.coverage.value} {finish.coverage.unit}</div>
                  </td>
                  <td className="px-3 py-2">
                    {getStatusBadge(finish.status)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(finish);
                        }}
                        className="text-emerald-600 hover:text-emerald-800"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(finish);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(finish.id);
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
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
                {selectedFinish ? 'Edit Finish' : 'Add New Finish'}
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
                      ref={codeRef}
                      defaultValue={selectedFinish?.code}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="FIN-XXX-XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      ref={nameRef}
                      defaultValue={selectedFinish?.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Finish name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      ref={categoryRef}
                      defaultValue={selectedFinish?.category || 'Laminate'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Paint">Paint</option>
                      <option value="Laminate">Laminate</option>
                      <option value="Veneer">Veneer</option>
                      <option value="Lacquer">Lacquer</option>
                      <option value="PU Finish">PU Finish</option>
                      <option value="Acrylic">Acrylic</option>
                      <option value="Membrane">Membrane</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Texture *
                    </label>
                    <select
                      ref={textureRef}
                      defaultValue={selectedFinish?.properties.texture || 'Matt'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Matt">Matt</option>
                      <option value="Glossy">Glossy</option>
                      <option value="Semi-Glossy">Semi-Glossy</option>
                      <option value="Satin">Satin</option>
                      <option value="Textured">Textured</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durability
                    </label>
                    <select
                      ref={durabilityRef}
                      defaultValue={selectedFinish?.properties.durability || 'High'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Water Resistance
                    </label>
                    <select
                      ref={waterResistanceRef}
                      defaultValue={selectedFinish?.properties.waterResistance || 'Good'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scratch Resistance
                    </label>
                    <select
                      ref={scratchResistanceRef}
                      defaultValue={selectedFinish?.properties.scratchResistance || 'Good'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Unit (₹) *
                    </label>
                    <input
                      type="number"
                      ref={pricePerUnitRef}
                      defaultValue={selectedFinish?.pricePerUnit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warranty
                    </label>
                    <input
                      type="text"
                      ref={warrantyRef}
                      defaultValue={selectedFinish?.warranty}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 10 Years"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    ref={statusRef}
                    defaultValue={selectedFinish?.status || 'Active'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Discontinued">Discontinued</option>
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
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Finish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedFinishForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-3 py-2 border-b border-blue-200 sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">{selectedFinishForDetails.name}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-blue-600">{selectedFinishForDetails.code}</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-600">{selectedFinishForDetails.category}</span>
                    <span className="text-gray-500">|</span>
                    {getStatusBadge(selectedFinishForDetails.status)}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Basic Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-blue-600 font-medium mb-1">Category</div>
                    <div className="text-sm text-gray-900">{selectedFinishForDetails.category}</div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 font-medium mb-1">Subcategory</div>
                    <div className="text-sm text-gray-900">{selectedFinishForDetails.subcategory}</div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 font-medium mb-1">Texture</div>
                    <div className="text-sm text-gray-900">{selectedFinishForDetails.properties.texture}</div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 font-medium mb-1">Sheen</div>
                    <div className="text-sm text-gray-900">{selectedFinishForDetails.properties.sheen}</div>
                  </div>
                </div>
              </div>

              {/* Properties */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Properties & Resistance
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-xs text-green-600 font-medium mb-1">Durability</div>
                    {getDurabilityBadge(selectedFinishForDetails.properties.durability)}
                  </div>
                  <div>
                    <div className="text-xs text-green-600 font-medium mb-1 flex items-center gap-1">
                      <Droplet className="w-3 h-3" />
                      Water Resistance
                    </div>
                    <div className="text-sm text-gray-900">{selectedFinishForDetails.properties.waterResistance}</div>
                  </div>
                  <div>
                    <div className="text-xs text-green-600 font-medium mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Scratch Resistance
                    </div>
                    <div className="text-sm text-gray-900">{selectedFinishForDetails.properties.scratchResistance}</div>
                  </div>
                </div>
              </div>

              {/* Available Colors */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Available Colors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFinishForDetails.colors.map((color, index) => (
                    <span key={index} className="px-3 py-1 bg-white border border-purple-200 rounded-full text-sm text-gray-700">
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              {/* Application Details */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-5 border border-orange-200">
                <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Application Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-orange-600 font-medium mb-2">Application Methods</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedFinishForDetails.applicationMethod.map((method, index) => (
                        <span key={index} className="px-3 py-1 bg-white border border-orange-200 rounded-full text-sm text-gray-700">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-orange-600 font-medium mb-2">Suitable For</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedFinishForDetails.suitableFor.map((use, index) => (
                        <span key={index} className="px-3 py-1 bg-white border border-orange-200 rounded-full text-sm text-gray-700">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drying Time */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-5 border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Drying Time
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg p-3 border border-yellow-200">
                    <div className="text-xs text-yellow-600 font-medium mb-1">Touch Dry</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedFinishForDetails.dryingTime.touch}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-yellow-200">
                    <div className="text-xs text-yellow-600 font-medium mb-1">Recoat Time</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedFinishForDetails.dryingTime.recoat}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-yellow-200">
                    <div className="text-xs text-yellow-600 font-medium mb-1">Full Cure</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedFinishForDetails.dryingTime.fullCure}</div>
                  </div>
                </div>
              </div>

              {/* Pricing & Coverage */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-5 border border-emerald-200">
                <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing & Coverage
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-3 border border-emerald-200">
                    <div className="text-xs text-emerald-600 font-medium mb-1">Price per Unit</div>
                    <div className="text-2xl font-bold text-emerald-900">₹{selectedFinishForDetails.pricePerUnit}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-emerald-200">
                    <div className="text-xs text-emerald-600 font-medium mb-1">Coverage</div>
                    <div className="text-lg font-bold text-emerald-900">
                      {selectedFinishForDetails.coverage.value} {selectedFinishForDetails.coverage.unit}
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance & Warranty */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Maintenance & Warranty
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-600 font-medium mb-1">Maintenance</div>
                    <div className="text-sm text-gray-900">{selectedFinishForDetails.maintenance}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 font-medium mb-1">Warranty</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedFinishForDetails.warranty}</div>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              {selectedFinishForDetails.certifications.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Certifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFinishForDetails.certifications.map((cert, index) => (
                      <span key={index} className="px-3 py-1 bg-white border border-blue-200 rounded-full text-sm font-medium text-blue-700">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEdit(selectedFinishForDetails);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Finish
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-3 py-2 border-b border-blue-200 sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Finish Analytics</h2>
                  </div>
                  <p className="text-sm text-gray-600">Overview of finishes, categories, and pricing trends</p>
                </div>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-blue-700">Total Finishes</div>
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
                  <div className="text-xs text-blue-600 mt-1">In catalog</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-green-700">Active Finishes</div>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-900">{stats.active}</div>
                  <div className="text-xs text-green-600 mt-1">{Math.round((stats.active / stats.total) * 100)}% of total</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-purple-700">Categories</div>
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-900">{stats.categories}</div>
                  <div className="text-xs text-purple-600 mt-1">Different types</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border-2 border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-orange-700">Avg Price</div>
                    <DollarSign className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-orange-900">₹{stats.avgPrice}</div>
                  <div className="text-xs text-orange-600 mt-1">Per unit</div>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Category Distribution
                </h3>
                <div className="space-y-3">
                  {Array.from(new Set(finishes.map(f => f.category))).map((category) => {
                    const count = finishes.filter(f => f.category === category).length;
                    const percentage = (count / stats.total) * 100;
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-blue-700 font-medium">{category}</span>
                          <span className="font-semibold text-blue-900">{count} items ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Analysis */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Price Range Analysis
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-2">Lowest Price</div>
                    <div className="text-2xl font-bold text-green-900">
                      ₹{Math.min(...finishes.map(f => f.pricePerUnit))}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-2">Average Price</div>
                    <div className="text-2xl font-bold text-green-900">₹{stats.avgPrice}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-2">Highest Price</div>
                    <div className="text-2xl font-bold text-green-900">
                      ₹{Math.max(...finishes.map(f => f.pricePerUnit))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Durability Breakdown */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Durability Breakdown
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {['High', 'Medium', 'Low'].map((level) => {
                    const count = finishes.filter(f => f.properties.durability === level).length;
                    return (
                      <div key={level} className="text-center bg-white rounded-lg p-3 border border-purple-200">
                        <div className="text-2xl font-bold text-purple-900">{count}</div>
                        <div className="text-xs text-purple-600 mt-1">{level} Durability</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Overview */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Status Overview
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    <div className="text-xs text-gray-600 mt-1">Active</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-2xl font-bold text-gray-600">
                      {finishes.filter(f => f.status === 'Inactive').length}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Inactive</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-2xl font-bold text-red-600">
                      {finishes.filter(f => f.status === 'Discontinued').length}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Discontinued</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t flex items-center justify-end gap-3">
              <button
                onClick={() => showToast('Exporting analytics report...', 'success')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export Report
              </button>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
