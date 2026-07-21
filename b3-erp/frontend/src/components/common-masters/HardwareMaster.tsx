'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Wrench, Plus, Search, Edit2, Trash2, CheckCircle2,
  XCircle, Package, DollarSign, Palette, Box
} from 'lucide-react';
import { manufacturingMastersService, KitchenHardware as BackendHardware } from '@/services/manufacturing-masters.service';
import { commonMastersService } from '@/services/common-masters.service';

interface Hardware {
  id: string;
  code: string;
  name: string;
  category: 'Hinges' | 'Handles' | 'Drawer Slides' | 'Locks' | 'Knobs' | 'Pull-outs' | 'Accessories';
  subcategory: string;
  specifications: {
    material: string;
    finish: string;
    size: string;
    weight: number;
    loadCapacity?: number;
  };
  finishOptions: string[];
  suitableFor: string[];
  brand: string;
  priceRange: {
    min: number;
    max: number;
  };
  warranty: string;
  installationType: string;
  features: string[];
  stock: number;
  reorderLevel: number;
  status: string;
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
}

export default function HardwareMaster() {
  const companyId = '123e4567-e89b-12d3-a456-426614174000';
  const [hardware, setHardware] = useState<Hardware[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHardware, setSelectedHardware] = useState<Hardware | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const codeRef = React.useRef<HTMLInputElement>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const categoryRef = React.useRef<HTMLSelectElement>(null);
  const brandRef = React.useRef<HTMLInputElement>(null);
  const materialRef = React.useRef<HTMLInputElement>(null);
  const finishRef = React.useRef<HTMLInputElement>(null);
  const priceMinRef = React.useRef<HTMLInputElement>(null);
  const priceMaxRef = React.useRef<HTMLInputElement>(null);
  const warrantyRef = React.useRef<HTMLInputElement>(null);
  const stockRef = React.useRef<HTMLInputElement>(null);
  const reorderLevelRef = React.useRef<HTMLInputElement>(null);
  const statusRef = React.useRef<HTMLSelectElement>(null);

  useEffect(() => {
    fetchHardware();
  }, []);

  const fetchHardware = async () => {
    try {
      setIsLoading(true);
      const data = await manufacturingMastersService.getAllKitchenHardware(companyId);

      const mapped: Hardware[] = data.map(hw => ({
        id: hw.id,
        code: hw.code,
        name: hw.name,
        category: hw.category as any,
        subcategory: hw.subcategory || '',
        specifications: {
          material: hw.specifications?.material || '',
          finish: hw.specifications?.finish || '',
          size: hw.specifications?.size || '',
          weight: hw.specifications?.weight || 0,
          loadCapacity: hw.specifications?.loadCapacity
        },
        finishOptions: [],
        suitableFor: [],
        brand: hw.brand || '',
        priceRange: {
          min: hw.priceMin,
          max: hw.priceMax
        },
        warranty: hw.warranty || '',
        installationType: hw.installationType || 'Concealed',
        features: hw.features,
        stock: hw.stock,
        reorderLevel: hw.reorderLevel,
        status: hw.status
      }));

      setHardware(mapped);
    } catch (error) {
      console.error('Error fetching hardware:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: Hardware) => {
    setSelectedHardware(item);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const code = codeRef.current?.value?.trim() || '';
    const name = nameRef.current?.value?.trim() || '';
    const category = categoryRef.current?.value || '';
    const brand = brandRef.current?.value || '';
    const material = materialRef.current?.value || '';
    const finish = finishRef.current?.value || '';
    const priceMin = Number(priceMinRef.current?.value) || 0;
    const priceMax = Number(priceMaxRef.current?.value) || 0;
    const warranty = warrantyRef.current?.value || '';
    const stock = Number(stockRef.current?.value) || 0;
    const reorderLevel = Number(reorderLevelRef.current?.value) || 0;
    const status = statusRef.current?.value || 'Active';

    if (!code || !name) {
      alert('Code and Name are required');
      return;
    }

    const payload = {
      code,
      name,
      companyId,
      category,
      manufacturer: brand,
      price: priceMin,
      specifications: { material, finish },
      brand,
      priceMin,
      priceMax,
      warranty,
      stock,
      reorderLevel,
      status
    };

    try {
      if (selectedHardware) {
        await commonMastersService.updateKitchenHardware(selectedHardware.id, payload as any);
      } else {
        await commonMastersService.createKitchenHardware(payload as any);
      }
      setIsModalOpen(false);
      await fetchHardware();
    } catch (error) {
      console.error('Error saving hardware:', error);
      alert('Failed to save hardware');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this hardware item?')) {
      try {
        await commonMastersService.deleteKitchenHardware(id);
        await fetchHardware();
      } catch (error) {
        console.error('Error deleting hardware:', error);
        alert('Failed to delete hardware');
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

  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock === 0) return <span className="text-red-600 font-medium">Out of Stock</span>;
    if (stock <= reorderLevel) return <span className="text-orange-600 font-medium">Low Stock</span>;
    return <span className="text-green-600">In Stock</span>;
  };

  const filteredHardware = useMemo(() => {
    return hardware.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [hardware, searchTerm, filterCategory]);

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2">Hardware Master</h2>
        <p className="text-gray-600">Manage kitchen cabinet fittings, accessories, and hardware components</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search hardware..."
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
                <option value="Hinges">Hinges</option>
                <option value="Handles">Handles</option>
                <option value="Drawer Slides">Drawer Slides</option>
                <option value="Locks">Locks</option>
                <option value="Knobs">Knobs</option>
                <option value="Pull-outs">Pull-outs</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSelectedHardware(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Hardware
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hardware Item
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specifications
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price Range
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
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
              {filteredHardware.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.code}</div>
                      <div className="text-xs text-gray-400">{item.brand}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="flex items-center gap-1 text-sm">
                        <Wrench className="h-4 w-4 text-gray-400" />
                        <span>{item.category}</span>
                      </div>
                      <div className="text-xs text-gray-500">{item.subcategory}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <Box className="h-3 w-3 text-gray-400" />
                        <span>{item.specifications.material}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Palette className="h-3 w-3 text-gray-400" />
                        <span>{item.specifications.finish}</span>
                      </div>
                      <div className="text-gray-500">{item.specifications.size}</div>
                      {item.specifications.loadCapacity && (
                        <div className="font-medium text-blue-600">
                          Load: {item.specifications.loadCapacity}kg
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <DollarSign className="h-3 w-3" />
                        ₹{item.priceRange.min} - ₹{item.priceRange.max}
                      </div>
                      <div className="text-xs text-gray-500">Warranty: {item.warranty}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div>{item.stock.toLocaleString()} units</div>
                      <div className="text-xs">{getStockStatus(item.stock, item.reorderLevel)}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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
                {selectedHardware ? 'Edit Hardware Item' : 'Add New Hardware'}
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
                      defaultValue={selectedHardware?.code}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="HW-XXX-XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      ref={nameRef}
                      defaultValue={selectedHardware?.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Hardware item name"
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
                      defaultValue={selectedHardware?.category || 'Hinges'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Hinges">Hinges</option>
                      <option value="Handles">Handles</option>
                      <option value="Drawer Slides">Drawer Slides</option>
                      <option value="Locks">Locks</option>
                      <option value="Knobs">Knobs</option>
                      <option value="Pull-outs">Pull-outs</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      ref={brandRef}
                      defaultValue={selectedHardware?.brand}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Hettich, Hafele, Blum"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material *
                    </label>
                    <input
                      type="text"
                      ref={materialRef}
                      defaultValue={selectedHardware?.specifications.material}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Stainless Steel, Cold Rolled Steel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Finish *
                    </label>
                    <input
                      type="text"
                      ref={finishRef}
                      defaultValue={selectedHardware?.specifications.finish}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Brushed, Polished, Matt"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Price (₹) *
                    </label>
                    <input
                      type="number"
                      ref={priceMinRef}
                      defaultValue={selectedHardware?.priceRange.min}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Price (₹) *
                    </label>
                    <input
                      type="number"
                      ref={priceMaxRef}
                      defaultValue={selectedHardware?.priceRange.max}
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
                      defaultValue={selectedHardware?.warranty}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 5 Years"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      ref={stockRef}
                      defaultValue={selectedHardware?.stock}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Level
                    </label>
                    <input
                      type="number"
                      ref={reorderLevelRef}
                      defaultValue={selectedHardware?.reorderLevel}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    ref={statusRef}
                    defaultValue={selectedHardware?.status || 'Active'}
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
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Hardware
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
