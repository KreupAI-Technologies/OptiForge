'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { inventoryService, AdjustmentReason } from '@/services/InventoryService';
import {
  Plus,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  AlertCircle,
  Save,
  Send,
  X
} from 'lucide-react';

interface AdjustmentItem {
  id: number;
  itemCode: string;
  itemName: string;
  currentQty: number;
  adjustedQty: number;
  adjustment: number;
  unitValue: number;
  valueImpact: number;
  reason: string;
  batchNumber?: string;
}

export default function CreateAdjustmentPage() {
  const router = useRouter();
  const [adjustmentDate, setAdjustmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [warehouse, setWarehouse] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'quantity' | 'value' | 'write-off'>('quantity');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [reasons, setReasons] = useState<AdjustmentReason[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await inventoryService.getAdjustmentReasons({ status: 'Active' });
        setReasons(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Failed to load adjustment reasons', e);
        setReasons([]);
      }
    })();
  }, []);

  // Map the form's adjustment-type selector to the backend enum
  const mapAdjustmentType = (
    t: 'quantity' | 'value' | 'write-off'
  ): 'Cycle Count' | 'Physical Inventory' | 'Write Off' | 'Write On' | 'Revaluation' | 'Damage' => {
    switch (t) {
      case 'write-off':
        return 'Write Off';
      case 'value':
        return 'Revaluation';
      case 'quantity':
      default:
        return 'Physical Inventory';
    }
  };

  const buildPayload = () => ({
    adjustmentType: mapAdjustmentType(adjustmentType),
    adjustmentDate: adjustmentDate || new Date().toISOString().split('T')[0],
    warehouseId: warehouse,
    reason,
    remarks: notes,
    referenceNumber,
    lines: adjustmentItems.map((item, idx) => ({
      lineNumber: idx + 1,
      itemId: item.itemCode,
      itemCode: item.itemCode,
      itemName: item.itemName,
      systemQuantity: item.currentQty,
      physicalQuantity: item.adjustedQty,
      uom: '',
      unitValue: item.unitValue,
      adjustmentReason: item.reason || reason,
      remarks: item.batchNumber ? `Batch: ${item.batchNumber}` : '',
    })),
  });

  // `submitForApproval` = create the draft, then submit it for approval.
  const submitAdjustment = async (submitForApproval: boolean) => {
    if (submitting) return;
    if (!warehouse) {
      alert('Please select a warehouse');
      return;
    }
    if (adjustmentItems.length === 0) {
      alert('Please add at least one item');
      return;
    }
    setSubmitting(true);
    try {
      const created = await inventoryService.createStockAdjustment(buildPayload());
      const newId = created?.id != null ? String(created.id) : undefined;
      if (submitForApproval && newId) {
        await inventoryService.submitStockAdjustment(newId);
      }
      router.push('/inventory/adjustments');
    } catch (e) {
      console.error('Failed to create stock adjustment', e);
      alert('Failed to create stock adjustment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const [adjustmentItems, setAdjustmentItems] = useState<AdjustmentItem[]>([]);

  const addAdjustmentItem = () => {
    const newItem: AdjustmentItem = {
      id: adjustmentItems.length + 1,
      itemCode: '',
      itemName: '',
      currentQty: 0,
      adjustedQty: 0,
      adjustment: 0,
      unitValue: 0,
      valueImpact: 0,
      reason: '',
      batchNumber: ''
    };
    setAdjustmentItems([...adjustmentItems, newItem]);
  };

  const removeAdjustmentItem = (id: number) => {
    setAdjustmentItems(adjustmentItems.filter(item => item.id !== id));
  };

  const updateAdjustmentItem = (id: number, field: keyof AdjustmentItem, value: any) => {
    setAdjustmentItems(adjustmentItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate adjustment and value impact
        if (field === 'adjustedQty' || field === 'currentQty') {
          updatedItem.adjustment = updatedItem.adjustedQty - updatedItem.currentQty;
          updatedItem.valueImpact = updatedItem.adjustment * updatedItem.unitValue;
        }
        
        if (field === 'unitValue') {
          updatedItem.valueImpact = updatedItem.adjustment * updatedItem.unitValue;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const totalItems = adjustmentItems.length;
  const totalValueImpact = adjustmentItems.reduce((sum, item) => sum + item.valueImpact, 0);
  const positiveAdjustments = adjustmentItems.filter(item => item.adjustment > 0).length;
  const negativeAdjustments = adjustmentItems.filter(item => item.adjustment < 0).length;

  const handleSaveDraft = async () => {
    await submitAdjustment(false);
  };

  const handleSubmit = async () => {
    await submitAdjustment(true);
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Plus className="w-8 h-8 text-blue-600" />
            <span>Create Inventory Adjustment</span>
          </h1>
          <p className="text-gray-600 mt-1">Record inventory quantity or value adjustments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveDraft}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving…' : 'Save Draft'}</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting…' : 'Submit for Approval'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{totalItems}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Total Items</div>
          <div className="text-xs text-blue-600 mt-1">In Adjustment</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{positiveAdjustments}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Increases</div>
          <div className="text-xs text-green-600 mt-1">Positive Adjustments</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{negativeAdjustments}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Decreases</div>
          <div className="text-xs text-red-600 mt-1">Negative Adjustments</div>
        </div>

        <div className={`bg-gradient-to-br ${totalValueImpact >= 0 ? 'from-purple-50 to-purple-100 border-purple-200' : 'from-orange-50 to-orange-100 border-orange-200'} rounded-lg p-3 border`}>
          <div className="flex items-center justify-between mb-2">
            {totalValueImpact >= 0 ? <TrendingUp className="w-8 h-8 text-purple-600" /> : <TrendingDown className="w-8 h-8 text-orange-600" />}
            <span className={`text-2xl font-bold ${totalValueImpact >= 0 ? 'text-purple-900' : 'text-orange-900'}`}>
              ₹{Math.abs(totalValueImpact / 1000).toFixed(1)}K
            </span>
          </div>
          <div className={`text-sm font-medium ${totalValueImpact >= 0 ? 'text-purple-700' : 'text-orange-700'}`}>Value Impact</div>
          <div className={`text-xs ${totalValueImpact >= 0 ? 'text-purple-600' : 'text-orange-600'} mt-1`}>
            {totalValueImpact >= 0 ? 'Increase' : 'Decrease'}
          </div>
        </div>
      </div>

      {/* Adjustment Form */}
      <div className="bg-white rounded-lg shadow p-3 space-y-3">
        <h3 className="text-lg font-semibold">Adjustment Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Date</label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={adjustmentDate}
                onChange={(e) => setAdjustmentDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
            <select
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Warehouse</option>
              <option value="main">Main Warehouse</option>
              <option value="assembly">Assembly Plant</option>
              <option value="fg">FG Store</option>
              <option value="rm">RM Store</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as 'quantity' | 'value' | 'write-off')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="quantity">Quantity Adjustment</option>
              <option value="value">Value Adjustment</option>
              <option value="write-off">Write-Off</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason Code</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Reason</option>
              {reasons.map((r) => (
                <option key={r.id || r.code} value={r.code}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="PO/Transfer/Cycle Count Number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Additional notes or comments..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Adjustment Items */}
      <div className="bg-white rounded-lg shadow p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Adjustment Items</h3>
          <button
            onClick={addAdjustmentItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adjusted Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adjustment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value Impact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adjustmentItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.itemCode}
                      onChange={(e) => updateAdjustmentItem(item.id, 'itemCode', e.target.value)}
                      placeholder="Item Code"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.itemName}
                      onChange={(e) => updateAdjustmentItem(item.id, 'itemName', e.target.value)}
                      placeholder="Item Name"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.currentQty}
                      onChange={(e) => updateAdjustmentItem(item.id, 'currentQty', Number(e.target.value))}
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.adjustedQty}
                      onChange={(e) => updateAdjustmentItem(item.id, 'adjustedQty', Number(e.target.value))}
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${item.adjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.adjustment >= 0 ? '+' : ''}{item.adjustment}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.unitValue}
                      onChange={(e) => updateAdjustmentItem(item.id, 'unitValue', Number(e.target.value))}
                      className="w-28 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${item.valueImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{Math.abs(item.valueImpact).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.reason}
                      onChange={(e) => updateAdjustmentItem(item.id, 'reason', e.target.value)}
                      placeholder="Reason"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.batchNumber}
                      onChange={(e) => updateAdjustmentItem(item.id, 'batchNumber', e.target.value)}
                      placeholder="Batch #"
                      className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeAdjustmentItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Warnings */}
      {totalValueImpact < -50000 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900">High Value Adjustment Warning</h4>
            <p className="text-sm text-yellow-700 mt-1">
              This adjustment has a significant negative impact on inventory value (₹{Math.abs(totalValueImpact / 1000).toFixed(1)}K). 
              Additional approval may be required.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
