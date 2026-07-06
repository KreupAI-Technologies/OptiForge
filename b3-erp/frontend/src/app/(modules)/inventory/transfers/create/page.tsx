'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { inventoryService } from '@/services/InventoryService';
import {
  TruckIcon,
  Plus,
  Save,
  Send,
  Package,
  MapPin,
  Calendar,
  User,
  Hash,
  Search,
  AlertCircle
} from 'lucide-react';

interface TransferItem {
  id: number;
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  availableQty: number;
  batchNumber: string;
}

interface WarehouseOption {
  value: string;
  label: string;
}

export default function CreateTransferPage() {
  const router = useRouter();
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [transferType, setTransferType] = useState<'regular' | 'urgent' | 'scheduled'>('regular');
  const [requestedBy, setRequestedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<WarehouseOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const whs = await inventoryService.getWarehouses();
        if (!active) return;
        const options = (whs ?? []).map((w: any) => ({
          value: String(w?.id ?? w?.value ?? w?.code ?? ''),
          label: String(w?.name ?? w?.label ?? w?.warehouseName ?? w?.code ?? ''),
        }));
        if (options.length > 0) setWarehouseOptions(options);
      } catch (err) {
        console.error('Failed to load warehouses', err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const addTransferItem = () => {
    setTransferItems([
      ...transferItems,
      {
        id: Date.now(),
        itemCode: '',
        itemName: '',
        quantity: 0,
        uom: 'Nos',
        availableQty: 0,
        batchNumber: ''
      }
    ]);
  };

  const removeTransferItem = (id: number) => {
    setTransferItems(transferItems.filter(item => item.id !== id));
  };

  const updateTransferItem = (id: number, field: keyof TransferItem, value: any) => {
    setTransferItems(transferItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const buildPayload = () => ({
    transferType: 'Warehouse to Warehouse',
    transferDate: transferDate || new Date().toISOString().split('T')[0],
    fromWarehouseId: fromWarehouse,
    toWarehouseId: toWarehouse,
    purpose: transferType,
    remarks: notes,
    requestedBy,
    lines: transferItems.map((item, idx) => ({
      lineNumber: idx + 1,
      itemId: item.itemCode,
      itemCode: item.itemCode,
      itemName: item.itemName,
      requestedQuantity: item.quantity,
      uom: item.uom,
      batchNumber: item.batchNumber,
    })),
  });

  const handleSaveDraft = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await inventoryService.createStockTransfer({ ...buildPayload(), status: 'Draft' });
      router.push('/inventory/transfers');
    } catch (err) {
      console.error('Failed to save draft transfer', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await inventoryService.createStockTransfer(buildPayload());
      router.push('/inventory/transfers');
    } catch (err) {
      console.error('Failed to submit transfer', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <TruckIcon className="w-8 h-8 text-blue-600" />
            <span>Create Stock Transfer</span>
          </h1>
          <p className="text-gray-600 mt-1">Transfer inventory between warehouses</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Transfer</span>
          </button>
        </div>
      </div>

      {/* Transfer Information */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Transfer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Type <span className="text-red-500">*</span>
            </label>
            <select
              value={transferType}
              onChange={(e) => setTransferType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="regular">Regular Transfer</option>
              <option value="urgent">Urgent Transfer</option>
              <option value="scheduled">Scheduled Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requested By <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Employee name"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Warehouse <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={fromWarehouse}
                onChange={(e) => setFromWarehouse(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select source warehouse</option>
                {warehouseOptions.map((wh) => (
                  <option key={wh.value} value={wh.value}>{wh.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Warehouse <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={toWarehouse}
                onChange={(e) => setToWarehouse(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select destination warehouse</option>
                {warehouseOptions.map((wh) => (
                  <option key={wh.value} value={wh.value}>{wh.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Add any additional notes or instructions..."
          />
        </div>
      </div>

      {/* Transfer Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Transfer Items</h3>
          <button
            onClick={addTransferItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        {transferItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Code
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available Qty
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transfer Qty
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UOM
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch Number
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transferItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={item.itemCode}
                          onChange={(e) => updateTransferItem(item.id, 'itemCode', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Search..."
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => updateTransferItem(item.id, 'itemName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Item name"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-sm font-semibold text-gray-900">{item.availableQty}</span>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => updateTransferItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.uom}
                        onChange={(e) => updateTransferItem(item.id, 'uom', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="Nos">Nos</option>
                        <option value="Kg">Kg</option>
                        <option value="Ltrs">Ltrs</option>
                        <option value="Mtrs">Mtrs</option>
                        <option value="Pcs">Pcs</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.batchNumber}
                        onChange={(e) => updateTransferItem(item.id, 'batchNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Batch #"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => removeTransferItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500 mb-2">No items added yet</p>
            <button
              onClick={addTransferItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Item</span>
            </button>
          </div>
        )}
      </div>

      {/* Validation Warnings */}
      {transferItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900">Transfer Checklist</h4>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                <li>Verify all item quantities are within available stock</li>
                <li>Ensure batch numbers are correctly specified for tracked items</li>
                <li>Confirm source and destination warehouses are correct</li>
                <li>Add transportation details if applicable</li>
                <li>Get necessary approvals before submitting</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
