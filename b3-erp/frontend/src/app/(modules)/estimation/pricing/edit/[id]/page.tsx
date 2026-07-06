'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { estimationPricingService } from '@/services/estimation-pricing.service';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Copy,
  Upload,
  DollarSign,
  Percent,
  Package,
  Tag,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  FileText,
  Filter,
} from 'lucide-react';

interface PriceItem {
  id: string;
  itemCode: string;
  description: string;
  category: string;
  basePrice: number;
  discountPercent: number;
  marginPercent: number;
  finalPrice: number;
  unit: string;
}

interface PriceListForm {
  priceListName: string;
  description: string;
  currency: string;
  customerSegment: 'retail' | 'wholesale' | 'distributor' | 'oem' | 'premium' | 'all';
  region: string;
  effectiveFrom: string;
  effectiveTo: string;
  taxIncluded: boolean;
  status: 'draft' | 'under_review' | 'approved' | 'active';
  priceItems: PriceItem[];
}

export default function EditPricingPage() {
  const router = useRouter();
  const params = useParams();
  const priceListId = params.id as string;

  const [formData, setFormData] = useState<PriceListForm>({
    priceListName: 'B2B Dealers - Premium Tier A',
    description: 'Premium pricing for tier A wholesale dealers with 15% standard margin',
    currency: 'INR',
    customerSegment: 'wholesale',
    region: 'West India - Maharashtra',
    effectiveFrom: '2025-10-01',
    effectiveTo: '2026-03-31',
    taxIncluded: false,
    status: 'active',
    priceItems: [
      {
        id: '1',
        itemCode: 'MK-BASE-001',
        description: 'Standard Base Cabinet 600mm - Oak Finish',
        category: 'Base Cabinets',
        basePrice: 12500,
        discountPercent: 10,
        marginPercent: 18,
        finalPrice: 11250,
        unit: 'Unit',
      },
      {
        id: '2',
        itemCode: 'MK-WALL-002',
        description: 'Wall Cabinet 800mm with Glass Door',
        category: 'Wall Cabinets',
        basePrice: 15800,
        discountPercent: 12,
        marginPercent: 20,
        finalPrice: 13904,
        unit: 'Unit',
      },
      {
        id: '3',
        itemCode: 'MK-COUNT-003',
        description: 'Granite Countertop - Black Galaxy',
        category: 'Countertops',
        basePrice: 450,
        discountPercent: 8,
        marginPercent: 22,
        finalPrice: 414,
        unit: 'Sq.Ft',
      },
    ],
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bulkDiscount, setBulkDiscount] = useState<string>('');
  const [bulkMargin, setBulkMargin] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await estimationPricingService.findOne('default-company-id', priceListId)) as any;
        if (!cancelled && raw) {
          setFormData((prev) => ({
            ...prev,
            priceListName: raw.title ?? raw.priceListName ?? prev.priceListName,
            description: raw.description ?? prev.description,
            currency: raw.currency ?? prev.currency,
            status:
              (String(raw.status ?? '').toLowerCase().replace(/\s+/g, '_') as PriceListForm['status']) ||
              prev.status,
            effectiveFrom: (raw.quotationDate ?? prev.effectiveFrom)?.slice?.(0, 10) ?? prev.effectiveFrom,
            effectiveTo: (raw.validUntil ?? prev.effectiveTo)?.slice?.(0, 10) ?? prev.effectiveTo,
            priceItems: prev.priceItems,
          }));
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load pricing');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [priceListId]);

  const categories = ['all', 'Base Cabinets', 'Wall Cabinets', 'Countertops', 'Hardware', 'Tall Units'];

  const calculateFinalPrice = (basePrice: number, discountPercent: number): number => {
    return basePrice - (basePrice * discountPercent / 100);
  };

  const handlePriceItemChange = (id: string, field: keyof PriceItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      priceItems: prev.priceItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate final price if base price or discount changes
          if (field === 'basePrice' || field === 'discountPercent') {
            const basePrice = field === 'basePrice' ? Number(value) : updatedItem.basePrice;
            const discountPercent = field === 'discountPercent' ? Number(value) : updatedItem.discountPercent;
            updatedItem.finalPrice = calculateFinalPrice(basePrice, discountPercent);
          }

          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const handleAddItem = () => {
    const newItem: PriceItem = {
      id: Date.now().toString(),
      itemCode: '',
      description: '',
      category: 'Base Cabinets',
      basePrice: 0,
      discountPercent: 0,
      marginPercent: 0,
      finalPrice: 0,
      unit: 'Unit',
    };
    setFormData(prev => ({
      ...prev,
      priceItems: [...prev.priceItems, newItem],
    }));
  };

  const handleRemoveItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      priceItems: prev.priceItems.filter(item => item.id !== id),
    }));
  };

  const handleDuplicateItem = (id: string) => {
    const itemToDuplicate = formData.priceItems.find(item => item.id === id);
    if (itemToDuplicate) {
      const newItem = {
        ...itemToDuplicate,
        id: Date.now().toString(),
        itemCode: `${itemToDuplicate.itemCode}-COPY`,
      };
      setFormData(prev => ({
        ...prev,
        priceItems: [...prev.priceItems, newItem],
      }));
    }
  };

  const handleApplyBulkDiscount = () => {
    if (!bulkDiscount) return;

    const discount = parseFloat(bulkDiscount);
    setFormData(prev => ({
      ...prev,
      priceItems: prev.priceItems.map(item => {
        if (selectedCategory === 'all' || item.category === selectedCategory) {
          return {
            ...item,
            discountPercent: discount,
            finalPrice: calculateFinalPrice(item.basePrice, discount),
          };
        }
        return item;
      }),
    }));
    setBulkDiscount('');
  };

  const handleApplyBulkMargin = () => {
    if (!bulkMargin) return;

    const margin = parseFloat(bulkMargin);
    setFormData(prev => ({
      ...prev,
      priceItems: prev.priceItems.map(item => {
        if (selectedCategory === 'all' || item.category === selectedCategory) {
          return {
            ...item,
            marginPercent: margin,
          };
        }
        return item;
      }),
    }));
    setBulkMargin('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = Array.isArray(formData.priceItems) ? formData.priceItems : [];
    const avgDiscount =
      items.length > 0 ? items.reduce((sum, i) => sum + (i.discountPercent ?? 0), 0) / items.length : 0;
    const avgMargin =
      items.length > 0 ? items.reduce((sum, i) => sum + (i.marginPercent ?? 0), 0) / items.length : 0;
    const totalValue = items.reduce((sum, i) => sum + (i.finalPrice ?? 0), 0);

    setIsSaving(true);
    setSaveError(null);
    try {
      await estimationPricingService.update('default-company-id', priceListId, {
        title: formData.priceListName,
        description: formData.description,
        currency: formData.currency,
        discountPercentage: avgDiscount ?? 0,
        markupPercentage: avgMargin ?? 0,
        totalPrice: totalValue ?? 0,
        quotationDate: formData.effectiveFrom,
        validUntil: formData.effectiveTo,
      });
      router.push('/estimation/pricing/view/' + priceListId);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save price list');
      setIsSaving(false);
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? formData.priceItems
    : formData.priceItems.filter(item => item.category === selectedCategory);

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      <form onSubmit={handleSubmit}>
        {isLoading && (
          <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            Loading pricing...
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {loadError}
          </div>
        )}
        {saveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {saveError}
          </div>
        )}
        {/* Header */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => router.push('/estimation/pricing')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Price Lists</span>
          </button>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Edit Price List</h1>
                  <p className="text-sm text-gray-600 mt-1">Price List ID: PL-2025-001</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => router.push('/estimation/pricing')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Price List Header Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            Price List Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Price List Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price List Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.priceListName}
                onChange={(e) => setFormData({ ...formData, priceListName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            {/* Customer Segment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Segment <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.customerSegment}
                onChange={(e) => setFormData({ ...formData, customerSegment: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="distributor">Distributor</option>
                <option value="oem">OEM</option>
                <option value="premium">Premium</option>
                <option value="all">All Segments</option>
              </select>
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Effective From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Effective To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective To <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.effectiveTo}
                onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tax Included */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="taxIncluded"
                checked={formData.taxIncluded}
                onChange={(e) => setFormData({ ...formData, taxIncluded: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="taxIncluded" className="text-sm font-medium text-gray-700">
                Tax Included in Prices
              </label>
            </div>
          </div>
        </div>

        {/* Price Items Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Package className="h-6 w-6 mr-2 text-blue-600" />
              Price Items ({formData.priceItems.length})
            </h2>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 mb-3 border border-blue-200">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
              Bulk Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Filter by Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                  ))}
                </select>
              </div>

              {/* Apply Discount */}
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Apply Discount %
                  </label>
                  <input
                    type="number"
                    value={bulkDiscount}
                    onChange={(e) => setBulkDiscount(e.target.value)}
                    placeholder="e.g., 10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyBulkDiscount}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
                >
                  Apply
                </button>
              </div>

              {/* Apply Margin */}
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Apply Margin %
                  </label>
                  <input
                    type="number"
                    value={bulkMargin}
                    onChange={(e) => setBulkMargin(e.target.value)}
                    placeholder="e.g., 18"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyBulkMargin}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item Code</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Base Price</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Discount %</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Margin %</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Final Price</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={item.itemCode}
                        onChange={(e) => handlePriceItemChange(item.id, 'itemCode', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Code"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handlePriceItemChange(item.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Description"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={item.category}
                        onChange={(e) => handlePriceItemChange(item.id, 'category', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {categories.filter(cat => cat !== 'all').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        value={item.basePrice}
                        onChange={(e) => handlePriceItemChange(item.id, 'basePrice', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        value={item.discountPercent}
                        onChange={(e) => handlePriceItemChange(item.id, 'discountPercent', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        value={item.marginPercent}
                        onChange={(e) => handlePriceItemChange(item.id, 'marginPercent', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-sm font-bold text-green-900 text-center">
                        ₹{item.finalPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateItem(item.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                         
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                         
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

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600">No items in this category</p>
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-blue-200 p-3 mb-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Price List Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase mb-1">Total Items</p>
              <p className="text-2xl font-bold text-blue-900">{formData.priceItems.length}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase mb-1">Avg. Discount</p>
              <p className="text-2xl font-bold text-orange-900">
                {formData.priceItems.length > 0
                  ? (formData.priceItems.reduce((sum, item) => sum + item.discountPercent, 0) / formData.priceItems.length).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase mb-1">Avg. Margin</p>
              <p className="text-2xl font-bold text-green-900">
                {formData.priceItems.length > 0
                  ? (formData.priceItems.reduce((sum, item) => sum + item.marginPercent, 0) / formData.priceItems.length).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase mb-1">Total Value</p>
              <p className="text-2xl font-bold text-purple-900">
                ₹{formData.priceItems.reduce((sum, item) => sum + item.finalPrice, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/estimation/pricing')}
            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            <span>{isSaving ? 'Saving...' : 'Save Price List'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
