'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X, Search, Plus, AlertCircle, Package } from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';

interface ItemOption {
  itemCode: string;
  itemName: string;
  currentStock: number;
  minLevel: number;
  maxLevel: number;
  reorderPoint: number;
  uom: string;
  location: string;
  supplier: string;
  leadTime: number;
}

export default function CreateReplenishmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    itemCode: '',
    quantity: '',
    priority: 'medium',
    requestDate: new Date().toISOString().split('T')[0],
    requiredBy: '',
    notes: ''
  });

  const [selectedItem, setSelectedItem] = useState<ItemOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showItemSearch, setShowItemSearch] = useState(false);

  // Item picker source: GET /inventory/stock-balances.
  const [availableItems, setAvailableItems] = useState<ItemOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const balances = (await inventoryService.getStockBalances()) as any[];
        const mapped: ItemOption[] = (balances || []).map((b: any) => {
          const currentStock = Number(b.availableQuantity ?? b.freeQuantity ?? 0);
          const reorderPoint = Number(b.reorderLevel ?? 0);
          const reorderQty = Number(b.reorderQuantity ?? 0);
          return {
            itemCode: b.itemCode ?? '',
            itemName: b.itemName ?? '',
            currentStock,
            minLevel: reorderPoint,
            maxLevel: reorderPoint + reorderQty,
            reorderPoint,
            uom: b.uom ?? '',
            location: b.locationName ?? b.warehouseName ?? '',
            supplier: b.supplierName ?? b.vendorName ?? '',
            leadTime: Number(b.leadTimeDays ?? 0),
          };
        });
        if (!cancelled) setAvailableItems(mapped);
      } catch {
        if (!cancelled) setAvailableItems([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = availableItems.filter(item =>
    item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectItem = (item: ItemOption) => {
    setSelectedItem(item);
    setFormData({ ...formData, itemCode: item.itemCode });
    setShowItemSearch(false);
    setSearchQuery('');
  };

  const getSuggestedQuantity = () => {
    if (!selectedItem) return 0;
    return selectedItem.maxLevel - selectedItem.currentStock;
  };

  const getStockHealthColor = (current: number, min: number, reorder: number) => {
    if (current < min) return 'text-red-600';
    if (current < reorder) return 'text-orange-600';
    return 'text-green-600';
  };

  const [formError, setFormError] = useState<string | null>(null);

  // NEEDS BACKEND: there is no replenishment-request create endpoint. The item
  // picker sources from stock-balances (no reorder-suggestion id to approve or
  // convert to a PR), so a free-form request cannot be honestly persisted yet.
  // Validation is kept; the submit button is disabled until a create API exists.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !formData.quantity) {
      setFormError('Please select an item and enter a quantity.');
      return;
    }
    setFormError(
      'Cannot submit: no replenishment-request create endpoint is available yet. This requires backend support.'
    );
  };

  const handleCancel = () => {
    router.push('/inventory/replenishment');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Replenishment Request</h1>
          <p className="text-sm text-gray-500 mt-1">Request inventory replenishment for items</p>
        </div>
      </div>

      <div className="">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Item Selection</h3>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Item <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowItemSearch(!showItemSearch)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className={selectedItem ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedItem ? `${selectedItem.itemCode} - ${selectedItem.itemName}` : 'Click to select item...'}
                  </span>
                  <Search className="w-4 h-4 text-gray-400" />
                </button>

                {showItemSearch && (
                  <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search items..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredItems.map((item) => (
                        <button
                          key={item.itemCode}
                          type="button"
                          onClick={() => handleSelectItem(item)}
                          className="w-full px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{item.itemCode}</div>
                              <div className="text-xs text-gray-500">{item.itemName}</div>
                            </div>
                            <div className={`text-sm font-bold ${getStockHealthColor(item.currentStock, item.minLevel, item.reorderPoint)}`}>
                              {item.currentStock} {item.uom}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedItem && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Item Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <p className="text-xs text-blue-600">Current Stock</p>
                    <p className={`text-sm font-bold ${getStockHealthColor(selectedItem.currentStock, selectedItem.minLevel, selectedItem.reorderPoint)}`}>
                      {selectedItem.currentStock} {selectedItem.uom}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Min Level</p>
                    <p className="text-sm font-semibold text-blue-900">{selectedItem.minLevel} {selectedItem.uom}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Max Level</p>
                    <p className="text-sm font-semibold text-blue-900">{selectedItem.maxLevel} {selectedItem.uom}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Reorder Point</p>
                    <p className="text-sm font-semibold text-orange-600">{selectedItem.reorderPoint} {selectedItem.uom}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Location</p>
                    <p className="text-sm font-semibold text-blue-900">{selectedItem.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Supplier</p>
                    <p className="text-sm font-semibold text-blue-900">{selectedItem.supplier}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Lead Time</p>
                    <p className="text-sm font-semibold text-blue-900">{selectedItem.leadTime} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Suggested Qty</p>
                    <p className="text-sm font-bold text-green-600">{getSuggestedQuantity()} {selectedItem.uom}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Order <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                  {selectedItem && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, quantity: getSuggestedQuantity().toString() })}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Use Suggested
                    </button>
                  )}
                </div>
                {selectedItem && (
                  <p className="text-xs text-gray-500 mt-1">
                    Suggested: {getSuggestedQuantity()} {selectedItem.uom}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.requestDate}
                  onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required By
                </label>
                <input
                  type="date"
                  value={formData.requiredBy}
                  onChange={(e) => setFormData({ ...formData, requiredBy: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes / Remarks
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter any additional notes or special instructions..."
                />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">Important Notes:</h4>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Verify current stock levels before creating replenishment request</li>
                <li>Consider supplier lead time when setting required by date</li>
                <li>Critical priority requests will be processed immediately</li>
                <li>Ensure quantity does not exceed maximum stock level</li>
              </ul>
            </div>
          </div>

          {formError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            <strong>Not yet available:</strong> submitting a replenishment request needs a
            backend create endpoint (NEEDS BACKEND). The form and validation are ready; the
            Create button is disabled until that API exists.
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled
              title="Create not supported yet (NEEDS BACKEND)"
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              Create Request (TODO: needs backend)
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
