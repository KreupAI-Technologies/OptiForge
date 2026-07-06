'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Package, DollarSign, MapPin,
  AlertTriangle, CheckCircle, Info, Warehouse, BarChart3, Plus
} from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';

interface StockItemForm {
  itemCode: string;
  itemName: string;
  description: string;
  category: string;
  subCategory: string;
  uom: string;
  hsnCode: string;
  initialStock: number;
  reorderLevel: number;
  safetyStock: number;
  maxLevel: number;
  leadTimeDays: number;
  unitCost: number;
  warehouse: string;
  zone: string;
  aisle: string;
  rack: string;
  bin: string;
  batchEnabled: boolean;
  serialEnabled: boolean;
  status: 'active' | 'inactive' | 'discontinued';
  notes: string;
}

export default function StockAddPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<StockItemForm>({
    itemCode: '',
    itemName: '',
    description: '',
    category: '',
    subCategory: '',
    uom: '',
    hsnCode: '',
    initialStock: 0,
    reorderLevel: 0,
    safetyStock: 0,
    maxLevel: 0,
    leadTimeDays: 7,
    unitCost: 0,
    warehouse: '',
    zone: '',
    aisle: '',
    rack: '',
    bin: '',
    batchEnabled: false,
    serialEnabled: false,
    status: 'active',
    notes: ''
  });

  const categories = [
    'Raw Materials',
    'Components',
    'Finished Goods',
    'Work in Progress',
    'Consumables',
    'Packaging Materials',
    'Tools & Equipment',
    'Spare Parts'
  ];

  const subCategories: Record<string, string[]> = {
    'Raw Materials': ['Metal Sheets', 'Metal Rods', 'Metal Tubes', 'Fasteners', 'Chemicals', 'Plastics'],
    'Components': ['Motors', 'Bearings', 'Gears', 'Seals', 'Switches', 'Sensors'],
    'Finished Goods': ['Kitchen Equipment', 'Industrial Ovens', 'Refrigeration Systems', 'Mixers'],
    'Work in Progress': ['Sub-Assemblies', 'Semi-Finished Products', 'Painted Components'],
    'Consumables': ['Welding Rods', 'Cutting Tools', 'Grinding Wheels', 'Lubricants'],
    'Packaging Materials': ['Cartons', 'Bubble Wrap', 'Strapping', 'Pallets'],
    'Tools & Equipment': ['Hand Tools', 'Power Tools', 'Measuring Instruments', 'Jigs & Fixtures'],
    'Spare Parts': ['Machine Spares', 'Electrical Spares', 'Hydraulic Spares']
  };

  const uomOptions = ['KG', 'PCS', 'MTR', 'LTR', 'SET', 'BOX', 'PKT', 'ROLL', 'UNIT'];
  const warehouses = [
    'Main Warehouse - Pune',
    'Auxiliary Storage - Pune',
    'Bangalore Warehouse',
    'Chennai Warehouse',
    'Delhi Warehouse'
  ];

  const handleInputChange = (field: keyof StockItemForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const generateItemCode = () => {
    const prefix = formData.category === 'Raw Materials' ? 'RM' :
      formData.category === 'Components' ? 'COMP' :
        formData.category === 'Finished Goods' ? 'FG' :
          formData.category === 'Work in Progress' ? 'WIP' :
            formData.category === 'Consumables' ? 'CONS' :
              formData.category === 'Packaging Materials' ? 'PKG' :
                formData.category === 'Tools & Equipment' ? 'TOOL' : 'SP';

    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    handleInputChange('itemCode', `${prefix}-${random}`);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemCode.trim()) newErrors.itemCode = 'Item code is required';
    if (!formData.itemName.trim()) newErrors.itemName = 'Item name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.subCategory) newErrors.subCategory = 'Sub-category is required';
    if (!formData.uom) newErrors.uom = 'Unit of measure is required';
    if (!formData.hsnCode.trim()) newErrors.hsnCode = 'HSN code is required';
    if (formData.reorderLevel < 0) newErrors.reorderLevel = 'Reorder level cannot be negative';
    if (formData.safetyStock < 0) newErrors.safetyStock = 'Safety stock cannot be negative';
    if (formData.maxLevel <= 0) newErrors.maxLevel = 'Max level must be greater than 0';
    if (formData.maxLevel <= formData.reorderLevel) newErrors.maxLevel = 'Max level must be greater than reorder level';
    if (formData.safetyStock > 0 && formData.safetyStock >= formData.reorderLevel) {
      newErrors.safetyStock = 'Safety stock must be less than reorder level';
    }
    if (formData.leadTimeDays <= 0) newErrors.leadTimeDays = 'Lead time must be greater than 0';
    if (formData.unitCost <= 0) newErrors.unitCost = 'Unit cost must be greater than 0';
    if (!formData.warehouse) newErrors.warehouse = 'Warehouse is required';
    if (formData.initialStock < 0) newErrors.initialStock = 'Initial stock cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        entryType: 'Material Receipt',
        postingDate: new Date().toISOString().slice(0, 10),
        toWarehouseId: formData.warehouse,
        remarks: formData.notes,
        lines: [
          {
            lineNumber: 1,
            itemId: formData.itemCode,
            itemCode: formData.itemCode,
            itemName: formData.itemName,
            description: formData.description,
            quantity: formData.initialStock || 0,
            uom: formData.uom,
            toLocationId: undefined,
          },
        ],
      };
      await inventoryService.createStockEntry(payload);
      router.push('/inventory/stock');
    } catch (error) {
      setIsSaving(false);
      setErrors(prev => ({ ...prev, general: 'Failed to create stock item. Please try again.' }));
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to discard this new stock item?')) {
      router.back();
    }
  };

  return (
    <div className="w-full h-full p-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Stock Item</h1>
          <p className="text-gray-600 mt-1">Create a new stock item with initial inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Basic Information */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Basic Information
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Code <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.itemCode}
                  onChange={(e) => handleInputChange('itemCode', e.target.value)}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.itemCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  placeholder="e.g., RM-SS304-2MM"
                />
                <button
                  type="button"
                  onClick={generateItemCode}
                  disabled={!formData.category}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Auto-Generate
                </button>
              </div>
              {errors.itemCode && (
                <p className="mt-1 text-sm text-red-600">{errors.itemCode}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Select category first to auto-generate</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) => handleInputChange('itemName', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.itemName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                placeholder="Enter item name"
              />
              {errors.itemName && (
                <p className="mt-1 text-sm text-red-600">{errors.itemName}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter detailed description of the item"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  handleInputChange('category', e.target.value);
                  handleInputChange('subCategory', '');
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub-Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subCategory}
                onChange={(e) => handleInputChange('subCategory', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.subCategory ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                disabled={!formData.category}
              >
                <option value="">Select Sub-Category</option>
                {formData.category && subCategories[formData.category]?.map(subCat => (
                  <option key={subCat} value={subCat}>{subCat}</option>
                ))}
              </select>
              {errors.subCategory && (
                <p className="mt-1 text-sm text-red-600">{errors.subCategory}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit of Measure (UOM) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.uom}
                onChange={(e) => handleInputChange('uom', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.uom ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
              >
                <option value="">Select UOM</option>
                {uomOptions.map(uom => (
                  <option key={uom} value={uom}>{uom}</option>
                ))}
              </select>
              {errors.uom && (
                <p className="mt-1 text-sm text-red-600">{errors.uom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HSN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.hsnCode}
                onChange={(e) => handleInputChange('hsnCode', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.hsnCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                placeholder="e.g., 72193300"
              />
              {errors.hsnCode && (
                <p className="mt-1 text-sm text-red-600">{errors.hsnCode}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">GST Harmonized System of Nomenclature code</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Stock Quantity
              </label>
              <input
                type="number"
                value={formData.initialStock}
                onChange={(e) => handleInputChange('initialStock', parseFloat(e.target.value))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.initialStock ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                placeholder="0"
                min="0"
              />
              {errors.initialStock && (
                <p className="mt-1 text-sm text-red-600">{errors.initialStock}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Opening balance for this item</p>
            </div>
          </div>
        </div>

        {/* Stock Planning Parameters */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Stock Planning Parameters
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Safety Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.safetyStock}
                onChange={(e) => handleInputChange('safetyStock', parseFloat(e.target.value))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.safetyStock ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                placeholder="0"
                min="0"
              />
              {errors.safetyStock && (
                <p className="mt-1 text-sm text-red-600">{errors.safetyStock}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Minimum stock to maintain</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => handleInputChange('reorderLevel', parseFloat(e.target.value))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.reorderLevel ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                placeholder="0"
                min="0"
              />
              {errors.reorderLevel && (
                <p className="mt-1 text-sm text-red-600">{errors.reorderLevel}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Trigger point for reordering</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.maxLevel}
                onChange={(e) => handleInputChange('maxLevel', parseFloat(e.target.value))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.maxLevel ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                placeholder="0"
                min="0"
              />
              {errors.maxLevel && (
                <p className="mt-1 text-sm text-red-600">{errors.maxLevel}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Maximum stock capacity</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Time (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.leadTimeDays}
                onChange={(e) => handleInputChange('leadTimeDays', parseInt(e.target.value))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.leadTimeDays ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                placeholder="7"
                min="1"
              />
              {errors.leadTimeDays && (
                <p className="mt-1 text-sm text-red-600">{errors.leadTimeDays}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Time to receive after ordering</p>
            </div>
          </div>

          {/* Visual Stock Level Indicator */}
          {formData.safetyStock > 0 && formData.reorderLevel > 0 && formData.maxLevel > 0 && (
            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">Stock Level Configuration</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">Safety Stock:</span>
                      <span className="font-semibold text-blue-900">{formData.safetyStock} {formData.uom || 'units'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">Reorder Level:</span>
                      <span className="font-semibold text-blue-900">{formData.reorderLevel} {formData.uom || 'units'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">Maximum Level:</span>
                      <span className="font-semibold text-blue-900">{formData.maxLevel} {formData.uom || 'units'}</span>
                    </div>
                    {formData.reorderLevel > formData.safetyStock && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-700">Operating Range:</span>
                        <span className="font-semibold text-blue-900">
                          {formData.reorderLevel - formData.safetyStock} {formData.uom || 'units'}
                        </span>
                      </div>
                    )}
                  </div>
                  {(formData.safetyStock >= formData.reorderLevel || formData.reorderLevel >= formData.maxLevel) && (
                    <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700">
                        Invalid configuration: Safety Stock &lt; Reorder Level &lt; Maximum Level
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Costing */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            Costing Information
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Cost (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => handleInputChange('unitCost', parseFloat(e.target.value))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.unitCost ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                placeholder="0.00"
                min="0"
              />
              {errors.unitCost && (
                <p className="mt-1 text-sm text-red-600">{errors.unitCost}</p>
              )}
            </div>

            <div className="flex items-end">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 w-full">
                <div className="text-sm text-purple-600 mb-1">Estimated Max Stock Value</div>
                <div className="text-2xl font-bold text-purple-900">
                  ₹{(formData.maxLevel * formData.unitCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {formData.initialStock > 0 && formData.unitCost > 0 && (
              <div className="col-span-2">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-green-700">Initial Stock Value:</div>
                    <div className="text-xl font-bold text-green-900">
                      ₹{(formData.initialStock * formData.unitCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Storage Location */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-orange-600" />
            Storage Location
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.warehouse}
                onChange={(e) => handleInputChange('warehouse', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.warehouse ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
              >
                <option value="">Select Warehouse</option>
                {warehouses.map(wh => (
                  <option key={wh} value={wh}>{wh}</option>
                ))}
              </select>
              {errors.warehouse && (
                <p className="mt-1 text-sm text-red-600">{errors.warehouse}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
              <input
                type="text"
                value={formData.zone}
                onChange={(e) => handleInputChange('zone', e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., A"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aisle</label>
              <input
                type="text"
                value={formData.aisle}
                onChange={(e) => handleInputChange('aisle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 01"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rack</label>
              <input
                type="text"
                value={formData.rack}
                onChange={(e) => handleInputChange('rack', e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AA"
                maxLength={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bin</label>
              <input
                type="text"
                value={formData.bin}
                onChange={(e) => handleInputChange('bin', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 001"
                maxLength={3}
              />
            </div>

            {formData.zone && formData.aisle && formData.rack && formData.bin && (
              <div className="col-span-2">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm text-green-700 font-medium">Full Location Code</div>
                      <div className="text-lg font-bold text-green-900 font-mono">
                        RM-{formData.zone}-{formData.aisle}-{formData.rack}-{formData.bin}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Options */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Tracking Options
          </h2>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="batchEnabled"
                checked={formData.batchEnabled}
                onChange={(e) => handleInputChange('batchEnabled', e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <label htmlFor="batchEnabled" className="font-medium text-gray-900 cursor-pointer">
                  Enable Batch Tracking
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Track stock by batch numbers. Useful for items with expiry dates or quality variations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="serialEnabled"
                checked={formData.serialEnabled}
                onChange={(e) => handleInputChange('serialEnabled', e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <label htmlFor="serialEnabled" className="font-medium text-gray-900 cursor-pointer">
                  Enable Serial Number Tracking
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Track each individual item by unique serial number. Ideal for high-value or warranty items.
                </p>
              </div>
            </div>
          </div>

          {(formData.batchEnabled || formData.serialEnabled) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  Tracking enabled items require additional details during stock transactions (receipt/issue).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Notes */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Additional Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter any additional notes or special instructions..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Stock Item
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
