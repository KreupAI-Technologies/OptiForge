'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  FileText,
  Plus,
  Trash2,
  Copy,
  Upload,
  DollarSign,
  Package,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  Eye,
  Link,
  Grid,
  List,
} from 'lucide-react';
import {
  estimationPricingLiveService,
  PricingRecord,
} from '@/services/estimation-pricing-live.service';
import {
  estimationMaterialCostService,
  MaterialCostRate,
} from '@/services/estimation-material-cost.service';
import { estimationPricingService } from '@/services/estimation-pricing.service';

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
  priceItems: PriceItem[];
}

export default function AddPricingPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<PriceListForm>({
    priceListName: '',
    description: '',
    currency: 'INR',
    customerSegment: 'wholesale',
    region: '',
    effectiveFrom: '',
    effectiveTo: '',
    taxIncluded: false,
    priceItems: [],
  });

  const [showPreview, setShowPreview] = useState(false);
  const [importSource, setImportSource] = useState<'manual' | 'existing' | 'catalog'>('manual');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const categories = ['Base Cabinets', 'Wall Cabinets', 'Countertops', 'Hardware', 'Tall Units', 'Accessories'];

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

  const handleAddManually = () => {
    setImportSource('manual');
    // Automatically add a new item to get started
    handleAddItem();
  };

  const handleImportFromExisting = async () => {
    setImportSource('existing');
    setImportLoading(true);
    setImportError(null);
    try {
      // Pull existing pricing records and turn each into an importable price item.
      const pricing = await estimationPricingLiveService.getPricing();
      const items: PriceItem[] = pricing.map((p: PricingRecord, idx) => {
        const basePrice = Number(p.baseCost ?? p.totalPrice ?? 0);
        const discountPercent = Number(p.discountPercentage ?? 0);
        return {
          id: `${Date.now()}-${idx}`,
          itemCode: p.pricingNumber ?? p.id,
          description: p.title ?? 'Imported pricing item',
          category: p.category ?? 'Base Cabinets',
          basePrice,
          discountPercent,
          marginPercent: Number(p.markupPercentage ?? 0),
          finalPrice: calculateFinalPrice(basePrice, discountPercent),
          unit: 'Unit',
        };
      });
      setFormData(prev => ({ ...prev, priceItems: items }));
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Failed to import from existing price lists',
      );
    } finally {
      setImportLoading(false);
    }
  };

  const handleLinkToCatalog = async () => {
    setImportSource('catalog');
    setImportLoading(true);
    setImportError(null);
    try {
      // Pull material cost rates (the catalog) and map each into a price item.
      const rates = await estimationMaterialCostService.getRates();
      const items: PriceItem[] = rates.map((r: MaterialCostRate, idx) => {
        const basePrice = Number(r.currentPrice ?? 0);
        return {
          id: `${Date.now()}-${idx}`,
          itemCode: r.materialCode ?? r.id,
          description: r.materialName ?? 'Catalog item',
          category: r.category ?? 'Base Cabinets',
          basePrice,
          discountPercent: 0,
          marginPercent: 0,
          finalPrice: calculateFinalPrice(basePrice, 0),
          unit: r.unit ?? 'Unit',
        };
      });
      setFormData(prev => ({ ...prev, priceItems: items }));
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Failed to link to catalog',
      );
    } finally {
      setImportLoading(false);
    }
  };

  const buildPricingPayload = () => {
    const baseCost = formData.priceItems.reduce((sum, item) => sum + (item.basePrice || 0), 0);
    const totalPrice = formData.priceItems.reduce((sum, item) => sum + (item.finalPrice || 0), 0);
    const avgMargin =
      formData.priceItems.length > 0
        ? formData.priceItems.reduce((sum, item) => sum + (item.marginPercent || 0), 0) /
          formData.priceItems.length
        : 0;
    const avgDiscount =
      formData.priceItems.length > 0
        ? formData.priceItems.reduce((sum, item) => sum + (item.discountPercent || 0), 0) /
          formData.priceItems.length
        : 0;
    return {
      title: formData.priceListName,
      description: formData.description,
      costEstimateId: '',
      currency: formData.currency,
      pricingStrategy: 'Cost Plus' as const,
      baseCost,
      markupPercentage: avgMargin,
      discountPercentage: avgDiscount,
      subtotal: baseCost,
      totalPrice,
      validUntil: formData.effectiveTo || undefined,
    };
  };

  const savePricing = async (status: 'Draft' | 'Pending Approval') => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await estimationPricingService.create('default-company-id', {
        ...buildPricingPayload(),
        status,
      });
      router.push('/estimation/pricing');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save price list');
      setIsSaving(false);
    }
  };

  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePricing('Draft');
  };

  const handleSubmitPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePricing('Pending Approval');
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      <form onSubmit={handleSubmitDraft}>
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
                  <h1 className="text-3xl font-bold text-gray-900">Create New Price List</h1>
                  <p className="text-sm text-gray-600 mt-1">Define pricing structure for customer segments</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
                </button>
              </div>
            </div>

            {showPreview && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-2">
                <h3 className="text-sm font-bold text-blue-900 mb-2">Preview Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-blue-600 font-medium">Name:</p>
                    <p className="text-blue-900">{formData.priceListName || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Segment:</p>
                    <p className="text-blue-900 capitalize">{formData.customerSegment}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Items:</p>
                    <p className="text-blue-900">{formData.priceItems.length}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Period:</p>
                    <p className="text-blue-900">
                      {formData.effectiveFrom && formData.effectiveTo
                        ? `${formData.effectiveFrom} to ${formData.effectiveTo}`
                        : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 1: Price List Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            Section 1: Price List Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Price List Name */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price List Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.priceListName}
                onChange={(e) => setFormData({ ...formData, priceListName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., B2B Dealers - Premium Tier A"
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
                placeholder="Brief description of this price list and its intended use"
              />
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region / Territory
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., West India - Maharashtra"
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

        {/* Section 2: Effective Dates */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-blue-600" />
            Section 2: Effective Dates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <p className="text-xs text-gray-500 mt-1">Date when this price list becomes active</p>
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
              <p className="text-xs text-gray-500 mt-1">Date when this price list expires</p>
            </div>
          </div>
        </div>

        {/* Section 3: Price Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Package className="h-6 w-6 mr-2 text-blue-600" />
              Section 3: Price Items ({formData.priceItems.length})
            </h2>
          </div>

          {/* Import Options */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-3 mb-3 border border-purple-200">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <Upload className="h-4 w-4 mr-2 text-purple-600" />
              How would you like to add items?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleAddManually}
                className={`p-4 rounded-lg border-2 transition-all ${
                  importSource === 'manual'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-blue-300'
                }`}
              >
                <Plus className="h-6 w-6 mb-2 text-blue-600" />
                <p className="text-sm font-semibold text-gray-900">Add Manually</p>
                <p className="text-xs text-gray-600 mt-1">Create items one by one</p>
              </button>

              <button
                type="button"
                onClick={handleImportFromExisting}
                className={`p-4 rounded-lg border-2 transition-all ${
                  importSource === 'existing'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-green-300'
                }`}
              >
                <Link className="h-6 w-6 mb-2 text-green-600" />
                <p className="text-sm font-semibold text-gray-900">Import from Existing</p>
                <p className="text-xs text-gray-600 mt-1">Copy from another price list</p>
              </button>

              <button
                type="button"
                onClick={handleLinkToCatalog}
                className={`p-4 rounded-lg border-2 transition-all ${
                  importSource === 'catalog'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 bg-white hover:border-purple-300'
                }`}
              >
                <Grid className="h-6 w-6 mb-2 text-purple-600" />
                <p className="text-sm font-semibold text-gray-900">Link to Catalog</p>
                <p className="text-xs text-gray-600 mt-1">Select from product catalog</p>
              </button>
            </div>
            {importLoading && (
              <p className="mt-2 text-xs text-blue-700">Importing items...</p>
            )}
            {importError && (
              <p className="mt-2 text-xs text-red-600">{importError}</p>
            )}
          </div>

          {/* Add Item Button */}
          <div className="flex items-center justify-between mb-2">
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
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Bulk Import CSV</span>
              </button>
            </div>

            <div className="text-sm text-gray-600">
              {formData.priceItems.length === 0 ? (
                <span className="flex items-center space-x-1 text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>No items added yet</span>
                </span>
              ) : (
                <span>Total: {formData.priceItems.length} items</span>
              )}
            </div>
          </div>

          {/* Items Table */}
          {formData.priceItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item Code</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Unit</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Base Price</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Discount %</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Margin %</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Final Price</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.priceItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={item.itemCode}
                          onChange={(e) => handlePriceItemChange(item.id, 'itemCode', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Code"
                          required
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handlePriceItemChange(item.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Description"
                          required
                        />
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={item.category}
                          onChange={(e) => handlePriceItemChange(item.id, 'category', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handlePriceItemChange(item.id, 'unit', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Unit"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={item.basePrice}
                          onChange={(e) => handlePriceItemChange(item.id, 'basePrice', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                          required
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
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Package className="h-16 w-16 text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium mb-2">No price items added yet</p>
              <p className="text-sm text-gray-500 mb-2">Start by adding items manually or import from existing sources</p>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Item</span>
              </button>
            </div>
          )}
        </div>

        {/* Summary Card */}
        {formData.priceItems.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 p-3 mb-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Price List Summary
            </h2>
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
        )}

        {/* Save Error */}
        {saveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/estimation/pricing')}
            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-60"
            >
              <Save className="h-5 w-5" />
              <span>{isSaving ? 'Saving...' : 'Save as Draft'}</span>
            </button>
            <button
              type="button"
              onClick={handleSubmitPublish}
              disabled={isSaving}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-60"
            >
              <TrendingUp className="h-5 w-5" />
              <span>{isSaving ? 'Saving...' : 'Publish Price List'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
