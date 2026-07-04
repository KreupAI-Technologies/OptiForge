'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { inventoryService } from '@/services/InventoryService';
import {
  ArrowLeft, Save, Package, Calendar, MapPin, FileText,
  Plus, Minus, AlertTriangle, Info, Search, Upload
} from 'lucide-react';

interface StockMovementForm {
  movementType: 'receipt' | 'issue' | 'adjustment' | 'return' | '';
  movementDate: string;
  itemCode: string;
  itemName: string;
  category: string;
  currentStock: number;
  quantity: number;
  uom: string;
  unitCost: number;
  referenceType: string;
  referenceNumber: string;
  warehouse: string;
  fromLocation: string;
  toLocation: string;
  reason: string;
  remarks: string;
  batchNumber: string;
  serialNumbers: string[];
}

interface StockItem {
  itemCode: string;
  itemName: string;
  category: string;
  currentStock: number;
  uom: string;
  unitCost: number;
  warehouse: string;
  location: string;
  batchEnabled: boolean;
  serialEnabled: boolean;
}

export default function StockMovementAddPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showItemSearch, setShowItemSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<StockMovementForm>({
    movementType: '',
    movementDate: new Date().toISOString().split('T')[0],
    itemCode: '',
    itemName: '',
    category: '',
    currentStock: 0,
    quantity: 0,
    uom: '',
    unitCost: 0,
    referenceType: '',
    referenceNumber: '',
    warehouse: '',
    fromLocation: '',
    toLocation: '',
    reason: '',
    remarks: '',
    batchNumber: '',
    serialNumbers: []
  });

  // Stock items for the search picker, loaded from stock balances.
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const balances = (await inventoryService.getStockBalances()) as any[];
        const mapped: StockItem[] = (balances || []).map((b: any) => {
          const available = Number(b.availableQuantity ?? b.freeQuantity ?? 0);
          const value = Number(b.stockValue ?? 0);
          return {
            itemCode: b.itemCode ?? '',
            itemName: b.itemName ?? '',
            category: b.category ?? b.itemCategory ?? '',
            currentStock: available,
            uom: b.uom ?? '',
            unitCost: Number(b.unitCost ?? (available > 0 ? value / available : 0)),
            warehouse: b.warehouseName ?? '',
            location: b.locationName ?? '',
            batchEnabled: Boolean(b.batchEnabled ?? false),
            serialEnabled: Boolean(b.serialEnabled ?? false),
          };
        });
        if (!cancelled) setStockItems(mapped);
      } catch {
        if (!cancelled) setStockItems([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const movementTypes = [
    { value: 'receipt', label: 'Receipt', description: 'Goods received into inventory' },
    { value: 'issue', label: 'Issue', description: 'Material issued to production/consumption' },
    { value: 'adjustment', label: 'Adjustment', description: 'Stock adjustment (increase/decrease)' },
    { value: 'return', label: 'Return', description: 'Material returned to inventory' }
  ];

  const referenceTypes = {
    receipt: ['Purchase Order', 'Transfer In', 'Production Return'],
    issue: ['Work Order', 'Sales Order', 'Internal Consumption'],
    adjustment: ['Physical Count', 'Damage', 'Obsolescence', 'System Correction'],
    return: ['Work Order Return', 'Customer Return', 'Vendor Return']
  };

  const warehouses = [
    'Main Warehouse - Pune',
    'Auxiliary Storage - Pune',
    'Bangalore Warehouse',
    'Chennai Warehouse'
  ];

  const handleInputChange = (field: keyof StockMovementForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const selectItem = (item: StockItem) => {
    setFormData(prev => ({
      ...prev,
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category,
      currentStock: item.currentStock,
      uom: item.uom,
      unitCost: item.unitCost,
      warehouse: item.warehouse,
      fromLocation: item.location,
      toLocation: item.location
    }));
    setShowItemSearch(false);
    setSearchQuery('');
  };

  const filteredItems = stockItems.filter(item =>
    item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addSerialNumber = () => {
    const newSerial = prompt('Enter serial number:');
    if (newSerial && !formData.serialNumbers.includes(newSerial)) {
      handleInputChange('serialNumbers', [...formData.serialNumbers, newSerial]);
    }
  };

  const removeSerialNumber = (index: number) => {
    handleInputChange('serialNumbers', formData.serialNumbers.filter((_, i) => i !== index));
  };

  const calculateBalanceAfter = () => {
    if (formData.movementType === 'receipt' || formData.movementType === 'return') {
      return formData.currentStock + formData.quantity;
    } else if (formData.movementType === 'issue') {
      return formData.currentStock - formData.quantity;
    } else if (formData.movementType === 'adjustment') {
      return formData.quantity; // For adjustments, quantity is the new balance
    }
    return formData.currentStock;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.movementType) newErrors.movementType = 'Movement type is required';
    if (!formData.movementDate) newErrors.movementDate = 'Movement date is required';
    if (!formData.itemCode) newErrors.itemCode = 'Please select an item';
    if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (formData.movementType === 'issue' && formData.quantity > formData.currentStock) {
      newErrors.quantity = 'Cannot issue more than available stock';
    }
    if (!formData.referenceType) newErrors.referenceType = 'Reference type is required';
    if (!formData.referenceNumber.trim()) newErrors.referenceNumber = 'Reference number is required';
    if (!formData.warehouse) newErrors.warehouse = 'Warehouse is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';

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

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      router.push('/inventory/movements');
    }, 1500);
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to discard this stock movement?')) {
      router.back();
    }
  };

  const balanceAfter = calculateBalanceAfter();

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
          <h1 className="text-3xl font-bold text-gray-900">Create Stock Movement</h1>
          <p className="text-gray-600 mt-1">Record a new stock transaction</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Movement Type Selection */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Movement Type</h2>
          <div className="grid grid-cols-2 gap-2">
            {movementTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  handleInputChange('movementType', type.value);
                  handleInputChange('referenceType', '');
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all ${formData.movementType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="font-semibold text-gray-900 mb-1">{type.label}</div>
                <div className="text-sm text-gray-600">{type.description}</div>
              </button>
            ))}
          </div>
          {errors.movementType && (
            <p className="mt-2 text-sm text-red-600">{errors.movementType}</p>
          )}
        </div>

        {formData.movementType && (
          <>
            {/* Basic Information */}
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Basic Information
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Movement Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.movementDate}
                    onChange={(e) => handleInputChange('movementDate', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.movementDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {errors.movementDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.movementDate}</p>
                  )}
                </div>

                <div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.referenceType}
                    onChange={(e) => handleInputChange('referenceType', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.referenceType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  >
                    <option value="">Select Reference Type</option>
                    {formData.movementType && referenceTypes[formData.movementType as keyof typeof referenceTypes]?.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.referenceType && (
                    <p className="mt-1 text-sm text-red-600">{errors.referenceType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.referenceNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder="e.g., PO-2025-001"
                  />
                  {errors.referenceNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.referenceNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Item Selection */}
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Item Selection
              </h2>

              {!formData.itemCode ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowItemSearch(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <Search className="w-5 h-5" />
                      <span className="font-medium">Search and Select Item</span>
                    </div>
                  </button>
                  {errors.itemCode && (
                    <p className="mt-2 text-sm text-red-600">{errors.itemCode}</p>
                  )}

                  {showItemSearch && (
                    <div className="mt-4 border border-gray-200 rounded-lg p-3">
                      <div className="mb-3">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by item code or name..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredItems.map((item) => (
                          <button
                            key={item.itemCode}
                            type="button"
                            onClick={() => selectItem(item)}
                            className="w-full p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                          >
                            <div className="font-semibold text-gray-900">{item.itemCode}</div>
                            <div className="text-sm text-gray-600">{item.itemName}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Current Stock: {item.currentStock} {item.uom} • {item.location}
                            </div>
                          </button>
                        ))}
                        {filteredItems.length === 0 && (
                          <div className="text-center py-4 text-gray-500">No items found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-mono font-bold text-blue-900 mb-1">{formData.itemCode}</div>
                        <div className="font-semibold text-gray-900 mb-2">{formData.itemName}</div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Category:</span>
                            <div className="font-medium text-gray-900">{formData.category}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Current Stock:</span>
                            <div className="font-bold text-blue-700">{formData.currentStock} {formData.uom}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Unit Cost:</span>
                            <div className="font-medium text-gray-900">₹{formData.unitCost.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange('itemCode', '');
                          handleInputChange('itemName', '');
                          handleInputChange('quantity', 0);
                        }}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.movementType === 'adjustment' ? 'New Balance' : 'Quantity'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.quantity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        placeholder="0"
                        min="0"
                      />
                      {errors.quantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                      )}
                    </div>

                    <div className="flex items-end">
                      <div className="w-full p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-sm text-green-700 mb-1">Balance After Movement</div>
                        <div className="text-2xl font-bold text-green-900">
                          {balanceAfter.toLocaleString()} {formData.uom}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Location Information */}
            {formData.itemCode && (
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Location Information
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {(formData.movementType === 'issue' || formData.movementType === 'adjustment') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Location</label>
                      <input
                        type="text"
                        value={formData.fromLocation}
                        onChange={(e) => handleInputChange('fromLocation', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., RM-A-01-AA-001"
                      />
                    </div>
                  )}
                  {(formData.movementType === 'receipt' || formData.movementType === 'return' || formData.movementType === 'adjustment') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To Location</label>
                      <input
                        type="text"
                        value={formData.toLocation}
                        onChange={(e) => handleInputChange('toLocation', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., RM-A-01-AA-001"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tracking Information */}
            {formData.itemCode && formData.quantity > 0 && (
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Tracking Information</h2>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter batch number (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Serial Numbers</label>
                    <div className="space-y-2">
                      {formData.serialNumbers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.serialNumbers.map((serial, index) => (
                            <div key={index} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg">
                              <span className="font-mono text-sm">{serial}</span>
                              <button
                                type="button"
                                onClick={() => removeSerialNumber(index)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={addSerialNumber}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                        Add Serial Number
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reason & Remarks */}
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Reason & Remarks</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.reason ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder="Enter the reason for this movement"
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Remarks</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter any additional notes or comments..."
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            {formData.itemCode && formData.quantity > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 mb-3">Movement Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-blue-700">Item:</span>
                        <div className="font-semibold text-blue-900">{formData.itemName}</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Movement Type:</span>
                        <div className="font-semibold text-blue-900 capitalize">{formData.movementType}</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Current Balance:</span>
                        <div className="font-semibold text-blue-900">{formData.currentStock} {formData.uom}</div>
                      </div>
                      <div>
                        <span className="text-blue-700">
                          {formData.movementType === 'adjustment' ? 'New Balance:' : 'Quantity:'}
                        </span>
                        <div className="font-semibold text-blue-900">{formData.quantity} {formData.uom}</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Balance After:</span>
                        <div className="font-bold text-lg text-green-700">{balanceAfter} {formData.uom}</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Total Value:</span>
                        <div className="font-bold text-lg text-blue-900">
                          ₹{(formData.quantity * formData.unitCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

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
                <Save className="w-4 h-4" />
                Create Movement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
