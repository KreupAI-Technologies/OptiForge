'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Save, Package, DollarSign, MapPin,
  AlertTriangle, CheckCircle, Info, Warehouse, BarChart3
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

export default function StockEditPage({ params: _params }: { params: { id: string } }) {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock existing data
  const [formData, setFormData] = useState<StockItemForm>({
    itemCode: 'RM-SS304-2MM',
    itemName: 'Stainless Steel Sheet 304 - 2mm Thickness',
    description: 'Premium grade 304 stainless steel sheets with 2mm thickness, 4x8 feet dimension. Corrosion resistant, suitable for food processing equipment and industrial applications.',
    category: 'Raw Materials',
    subCategory: 'Metal Sheets',
    uom: 'KG',
    hsnCode: '72193300',
    reorderLevel: 500,
    safetyStock: 300,
    maxLevel: 5000,
    leadTimeDays: 15,
    unitCost: 185.50,
    warehouse: 'Main Warehouse - Pune',
    zone: 'A',
    aisle: '01',
    rack: 'AA',
    bin: '001',
    batchEnabled: true,
    serialEnabled: false,
    status: 'active',
    notes: 'High-demand item. Maintain adequate stock levels at all times.'
  });

  useEffect(() => {
    const loadStock = async () => {
      try {
        const data = await inventoryService.getStockBalance(id);
        if (data) {
          setFormData(prev => ({
            ...prev,
            itemCode: data.itemCode ?? prev.itemCode,
            itemName: data.itemName ?? prev.itemName,
            uom: data.uom ?? prev.uom,
            reorderLevel: data.reorderLevel ?? prev.reorderLevel,
            safetyStock: data.safetyStock ?? prev.safetyStock,
            unitCost: data.valuationRate ?? prev.unitCost,
            warehouse: data.warehouseName ?? prev.warehouse,
          }));
        }
      } catch (error) {
        console.error('Failed to load stock balance', error);
      }
    };
    if (id) loadStock();
  }, [id]);

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

  const uomOptions = ['KG', 'PCS', 'MTR', 'LTR', 'SET', 'BOX', 'PKT', 'ROLL'];
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemCode.trim()) newErrors.itemCode = 'Item code is required';
    if (!formData.itemName.trim()) newErrors.itemName = 'Item name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.subCategory) newErrors.subCategory = 'Sub-category is required';
    if (!formData.uom) newErrors.uom = 'Unit of measure is required';
    if (!formData.hsnCode.trim()) newErrors.hsnCode = 'HSN code is required';
    if (formData.reorderLevel <= 0) newErrors.reorderLevel = 'Reorder level must be greater than 0';
    if (formData.safetyStock <= 0) newErrors.safetyStock = 'Safety stock must be greater than 0';
    if (formData.maxLevel <= formData.reorderLevel) newErrors.maxLevel = 'Max level must be greater than reorder level';
    if (formData.safetyStock >= formData.reorderLevel) newErrors.safetyStock = 'Safety stock must be less than reorder level';
    if (formData.leadTimeDays <= 0) newErrors.leadTimeDays = 'Lead time must be greater than 0';
    if (formData.unitCost <= 0) newErrors.unitCost = 'Unit cost must be greater than 0';
    if (!formData.warehouse) newErrors.warehouse = 'Warehouse is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        reorderLevel: formData.reorderLevel,
        safetyStock: formData.safetyStock,
        reorderQuantity: formData.maxLevel,
        valuationRate: formData.unitCost,
      };
      await inventoryService.updateStockBalance(id, payload);
      router.push('/inventory/stock');
    } catch (error) {
      setIsSaving(false);
      setErrors(prev => ({ ...prev, general: 'Failed to update stock item. Please try again.' }));
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to discard changes?')) {
      router.back();
    }
  };

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Stock Item</h1>
          <p className="text-gray-600 mt-1">Update stock item information and settings</p>
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
              <input
                type="text"
                value={formData.itemCode}
                onChange={(e) => handleInputChange('itemCode', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.itemCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="e.g., RM-SS304-2MM"
              />
              {errors.itemCode && (
                <p className="mt-1 text-sm text-red-600">{errors.itemCode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) => handleInputChange('itemName', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.itemName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.subCategory ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.uom ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.hsnCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="e.g., 72193300"
              />
              {errors.hsnCode && (
                <p className="mt-1 text-sm text-red-600">{errors.hsnCode}</p>
              )}
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.safetyStock ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.reorderLevel ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.maxLevel ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.leadTimeDays ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="0"
                min="0"
              />
              {errors.leadTimeDays && (
                <p className="mt-1 text-sm text-red-600">{errors.leadTimeDays}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Time to receive after ordering</p>
            </div>
          </div>

          {/* Visual Stock Level Indicator */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">Stock Level Configuration</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Safety Stock:</span>
                    <span className="font-semibold text-blue-900">{formData.safetyStock} {formData.uom}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Reorder Level:</span>
                    <span className="font-semibold text-blue-900">{formData.reorderLevel} {formData.uom}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Maximum Level:</span>
                    <span className="font-semibold text-blue-900">{formData.maxLevel} {formData.uom}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Operating Range:</span>
                    <span className="font-semibold text-blue-900">
                      {formData.reorderLevel - formData.safetyStock} {formData.uom} (between safety and reorder)
                    </span>
                  </div>
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.unitCost ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.warehouse ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                onChange={(e) => handleInputChange('zone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., A"
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rack</label>
              <input
                type="text"
                value={formData.rack}
                onChange={(e) => handleInputChange('rack', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AA"
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
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
