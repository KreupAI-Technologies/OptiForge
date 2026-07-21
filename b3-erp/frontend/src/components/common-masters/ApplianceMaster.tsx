'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Zap, Plus, Search, Edit2, Trash2, CheckCircle2,
  XCircle, Package, Ruler, DollarSign, Star, TrendingUp
} from 'lucide-react';
import { manufacturingMastersService, KitchenAppliance as BackendAppliance } from '@/services/manufacturing-masters.service';
import { commonMastersService } from '@/services/common-masters.service';

interface Appliance {
  id: string;
  code: string;
  name: string;
  category: 'Hob' | 'Chimney' | 'Oven' | 'Microwave' | 'Dishwasher' | 'Refrigerator' | 'Water Purifier';
  subcategory: string;
  brand: string;
  model: string;
  specifications: {
    dimensions: {
      width: number;
      depth: number;
      height: number;
      unit: string;
    };
    power: {
      voltage: string;
      wattage: number;
      frequency: string;
    };
    capacity?: string;
    features: string[];
  };
  energyRating: string;
  color: string[];
  warranty: string;
  price: number;
  installationRequired: boolean;
  installationCost: number;
  certification: string[];
  availability: 'In Stock' | 'Out of Stock' | 'On Order';
  leadTime: string;
  rating: number;
  reviews: number;
  status: string;
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
}

export default function ApplianceMaster() {
  const companyId = '123e4567-e89b-12d3-a456-426614174000';
  const codeRef = React.useRef<HTMLInputElement>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const categoryRef = React.useRef<HTMLSelectElement>(null);
  const brandRef = React.useRef<HTMLInputElement>(null);
  const modelRef = React.useRef<HTMLInputElement>(null);
  const widthRef = React.useRef<HTMLInputElement>(null);
  const depthRef = React.useRef<HTMLInputElement>(null);
  const heightRef = React.useRef<HTMLInputElement>(null);
  const priceRef = React.useRef<HTMLInputElement>(null);
  const installationCostRef = React.useRef<HTMLInputElement>(null);
  const availabilityRef = React.useRef<HTMLSelectElement>(null);
  const statusRef = React.useRef<HTMLSelectElement>(null);

  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  useEffect(() => {
    fetchAppliances();
  }, []);

  const fetchAppliances = async () => {
    try {
      setIsLoading(true);
      const data = await manufacturingMastersService.getAllKitchenAppliances(companyId);

      const mapped: Appliance[] = data.map(app => ({
        id: app.id,
        code: app.code,
        name: app.name,
        category: app.category as any,
        subcategory: app.subcategory || '',
        brand: app.brand || '',
        model: app.model || '',
        specifications: {
          dimensions: {
            width: app.specifications?.dimensions?.width || 0,
            depth: app.specifications?.dimensions?.depth || 0,
            height: app.specifications?.dimensions?.height || 0,
            unit: app.specifications?.dimensions?.unit || 'mm'
          },
          power: {
            voltage: app.specifications?.power?.voltage || '230V',
            wattage: app.specifications?.power?.wattage || 0,
            frequency: app.specifications?.power?.frequency || '50Hz'
          },
          capacity: app.specifications?.capacity,
          features: app.specifications?.features || []
        },
        energyRating: app.energyRating || 'N/A',
        color: app.color,
        warranty: app.warranty || '',
        price: app.price,
        installationRequired: app.installationRequired,
        installationCost: app.installationCost,
        certification: app.certification,
        availability: app.availability as any || 'In Stock',
        leadTime: app.leadTime || '',
        rating: app.rating,
        reviews: app.reviews,
        status: app.status
      }));

      setAppliances(mapped);
    } catch (error) {
      console.error('Error fetching appliances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (appliance: Appliance) => {
    setSelectedAppliance(appliance);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const code = codeRef.current?.value.trim() || '';
    const name = nameRef.current?.value.trim() || '';
    const category = categoryRef.current?.value || '';
    const brand = brandRef.current?.value.trim() || '';
    const model = modelRef.current?.value.trim() || '';
    const width = Number(widthRef.current?.value);
    const depth = Number(depthRef.current?.value);
    const height = Number(heightRef.current?.value);
    const price = Number(priceRef.current?.value);
    const installationCost = Number(installationCostRef.current?.value);
    const availability = availabilityRef.current?.value || '';
    const status = statusRef.current?.value || '';

    if (!code || !name) {
      alert('Code and Name are required');
      return;
    }

    const payload = {
      code,
      name,
      companyId,
      category,
      brand,
      model,
      price,
      installationCost,
      availability,
      status,
      specifications: { dimensions: { width, depth, height } }
    };

    try {
      if (selectedAppliance) {
        await commonMastersService.updateKitchenAppliance(selectedAppliance.id, payload as any);
      } else {
        await commonMastersService.createKitchenAppliance(payload as any);
      }
      setIsModalOpen(false);
      await fetchAppliances();
    } catch (error) {
      console.error('Error saving appliance:', error);
      alert('Failed to save appliance');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this appliance?')) {
      try {
        await commonMastersService.deleteKitchenAppliance(id);
        await fetchAppliances();
      } catch (error) {
        console.error('Error deleting appliance:', error);
        alert('Failed to delete appliance');
      }
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

  const getAvailabilityBadge = (availability: string) => {
    const colors = {
      'In Stock': 'bg-green-100 text-green-800',
      'Out of Stock': 'bg-red-100 text-red-800',
      'On Order': 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[availability as keyof typeof colors]}`}>
        {availability}
      </span>
    );
  };

  const filteredAppliances = useMemo(() => {
    return appliances.filter(appliance => {
      const matchesSearch = appliance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appliance.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appliance.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || appliance.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [appliances, searchTerm, filterCategory]);

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2">Appliance Master</h2>
        <p className="text-gray-600">Manage kitchen appliance catalog with specifications and pricing</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appliances..."
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
                <option value="Hob">Hob</option>
                <option value="Chimney">Chimney</option>
                <option value="Oven">Oven</option>
                <option value="Microwave">Microwave</option>
                <option value="Dishwasher">Dishwasher</option>
                <option value="Refrigerator">Refrigerator</option>
                <option value="Water Purifier">Water Purifier</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSelectedAppliance(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Appliance
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appliance
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category & Brand
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specifications
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating & Stock
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
              {filteredAppliances.map((appliance) => (
                <tr key={appliance.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{appliance.name}</div>
                      <div className="text-xs text-gray-500">{appliance.code}</div>
                      <div className="text-xs text-gray-400">{appliance.model}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="flex items-center gap-1 text-sm">
                        <Zap className="h-4 w-4 text-gray-400" />
                        <span>{appliance.category}</span>
                      </div>
                      <div className="text-xs text-gray-500">{appliance.brand}</div>
                      <div className="text-xs text-gray-400">{appliance.subcategory}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <Ruler className="h-3 w-3 text-gray-400" />
                        <span>{appliance.specifications.dimensions.width}×{appliance.specifications.dimensions.depth}×{appliance.specifications.dimensions.height} {appliance.specifications.dimensions.unit}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span>{appliance.specifications.power.wattage}W</span>
                      </div>
                      {appliance.specifications.capacity && (
                        <div className="text-gray-600">{appliance.specifications.capacity}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <DollarSign className="h-3 w-3" />
                        ₹{appliance.price.toLocaleString()}
                      </div>
                      {appliance.installationRequired && (
                        <div className="text-xs text-gray-500">
                          + ₹{appliance.installationCost} installation
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{appliance.rating}</span>
                        <span className="text-xs text-gray-500">({appliance.reviews})</span>
                      </div>
                      {getAvailabilityBadge(appliance.availability)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {getStatusBadge(appliance.status)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(appliance)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(appliance.id)}
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
                {selectedAppliance ? 'Edit Appliance' : 'Add New Appliance'}
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
                      ref={codeRef}
                      type="text"
                      defaultValue={selectedAppliance?.code}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="APP-XXX-XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      ref={nameRef}
                      type="text"
                      defaultValue={selectedAppliance?.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Appliance name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      ref={categoryRef}
                      defaultValue={selectedAppliance?.category || 'Hob'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Hob">Hob</option>
                      <option value="Chimney">Chimney</option>
                      <option value="Oven">Oven</option>
                      <option value="Microwave">Microwave</option>
                      <option value="Dishwasher">Dishwasher</option>
                      <option value="Refrigerator">Refrigerator</option>
                      <option value="Water Purifier">Water Purifier</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand *
                    </label>
                    <input
                      ref={brandRef}
                      type="text"
                      defaultValue={selectedAppliance?.brand}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Bosch, Faber"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model *
                    </label>
                    <input
                      ref={modelRef}
                      type="text"
                      defaultValue={selectedAppliance?.model}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Model number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width (mm) *
                    </label>
                    <input
                      ref={widthRef}
                      type="number"
                      defaultValue={selectedAppliance?.specifications.dimensions.width}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Depth (mm) *
                    </label>
                    <input
                      ref={depthRef}
                      type="number"
                      defaultValue={selectedAppliance?.specifications.dimensions.depth}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (mm) *
                    </label>
                    <input
                      ref={heightRef}
                      type="number"
                      defaultValue={selectedAppliance?.specifications.dimensions.height}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹) *
                    </label>
                    <input
                      ref={priceRef}
                      type="number"
                      defaultValue={selectedAppliance?.price}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Installation Cost (₹)
                    </label>
                    <input
                      ref={installationCostRef}
                      type="number"
                      defaultValue={selectedAppliance?.installationCost}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Availability
                    </label>
                    <select
                      ref={availabilityRef}
                      defaultValue={selectedAppliance?.availability || 'In Stock'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                      <option value="On Order">On Order</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      ref={statusRef}
                      defaultValue={selectedAppliance?.status || 'Active'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Discontinued">Discontinued</option>
                    </select>
                  </div>
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
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Appliance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
