'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Tag, DollarSign, Calendar, CheckCircle, AlertCircle, ShoppingCart, TrendingDown, TrendingUp, Download, Upload } from 'lucide-react';
import { commonMastersService, PriceList } from '@/services/common-masters.service';

const COMPANY_ID = '1';

export default function PriceListMaster() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    priceListCode: '',
    priceListName: '',
    description: '',
    effectiveFrom: '',
    effectiveTo: '',
    applicableFor: 'sales',
    pricingMethod: 'fixed',
    currency: 'INR',
    includeTax: false,
    isDefault: false,
    status: 'active',
  });

  useEffect(() => {
    fetchPriceLists();
  }, []);

  const fetchPriceLists = async () => {
    try {
      setLoading(true);
      const data = await commonMastersService.getAllPriceLists();
      setPriceLists(data);
    } catch (error) {
      console.error('Failed to fetch price lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (pl: PriceList | null) => {
    setSelectedPriceList(pl);
    setForm({
      priceListCode: pl?.priceListCode ?? '',
      priceListName: pl?.priceListName ?? '',
      description: pl?.description ?? '',
      effectiveFrom: pl?.effectiveFrom ? pl.effectiveFrom.split('T')[0] : '',
      effectiveTo: pl?.effectiveTo ? pl.effectiveTo.split('T')[0] : '',
      applicableFor: pl?.applicableFor ?? 'sales',
      pricingMethod: pl?.pricingMethod ?? 'fixed',
      currency: pl?.currency ?? 'INR',
      includeTax: pl?.includeTax ?? false,
      isDefault: pl?.isDefault ?? false,
      status: pl?.status ?? 'active',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.priceListCode.trim()) { alert('Price List Code is required.'); return; }
    if (!form.priceListName.trim()) { alert('Price List Name is required.'); return; }
    if (!form.effectiveFrom) { alert('Effective From date is required.'); return; }
    try {
      setIsSaving(true);
      const payload = {
        priceListCode: form.priceListCode.trim(),
        priceListName: form.priceListName.trim(),
        description: form.description.trim() || undefined,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo || undefined,
        applicableFor: form.applicableFor,
        pricingMethod: form.pricingMethod,
        currency: form.currency,
        includeTax: form.includeTax,
        isDefault: form.isDefault,
        status: form.status,
      };
      if (selectedPriceList) {
        await commonMastersService.updatePriceList(selectedPriceList.id, payload);
      } else {
        await commonMastersService.createPriceList({ ...payload, companyId: COMPANY_ID });
      }
      setIsModalOpen(false);
      await fetchPriceLists();
      alert(`Price list ${selectedPriceList ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving price list:', error);
      alert('Failed to save price list. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price list?')) return;
    try {
      await commonMastersService.deletePriceList(id);
      await fetchPriceLists();
    } catch (error) {
      console.error('Error deleting price list:', error);
      alert('Failed to delete price list. Please try again.');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredPriceLists = priceLists.filter(pl => {
    const matchesSearch = pl.priceListName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pl.priceListCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || pl.applicableFor === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="">
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Tag className="w-8 h-8 text-purple-600" />
                Price List Master
              </h1>
              <p className="text-gray-600 mt-2">Manage pricing structures and price lists</p>
            </div>
            <button
              onClick={() => openModal(null)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Price List
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search price lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="sales">Sales</option>
              <option value="purchase">Purchase</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Price Lists</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{priceLists.length}</p>
              </div>
              <Tag className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sales Price Lists</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {priceLists.filter(pl => pl.applicableFor === 'sales').length}
                </p>
              </div>
              <TrendingDown className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Purchase Price Lists</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {priceLists.filter(pl => pl.applicableFor === 'purchase').length}
                </p>
              </div>
              <TrendingDown className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {priceLists.filter(pl => pl.status === 'active').length}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Price Lists */}
        <div className="space-y-2">
          {filteredPriceLists.map(priceList => (
            <div key={priceList.id} className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{priceList.priceListName}</h3>
                    {priceList.isDefault && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        Default
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${priceList.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : priceList.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                      {priceList.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{priceList.priceListCode}</p>
                  <p className="text-sm text-gray-500">{priceList.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(priceList)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Edit className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(priceList.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-red-700">Delete</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Price List Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium capitalize">{priceList.pricingMethod}</span>
                    </div>
                    {priceList.markupPercentage !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {priceList.markupPercentage >= 0 ? 'Markup:' : 'Markdown:'}
                        </span>
                        <span className={`font-medium ${priceList.markupPercentage >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                          {Math.abs(priceList.markupPercentage)}%
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Currency:</span>
                      <span className="font-medium">{priceList.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Include Tax:</span>
                      <span className="font-medium">{priceList.includeTax ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Applicability</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className={`font-medium capitalize ${priceList.applicableFor === 'sales' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                        {priceList.applicableFor}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{priceList.customerCategory === 'all' ? 'All' : `Category ${priceList.customerCategory}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{priceList.items?.length ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Validity Period</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Effective From:</span>
                      <span className="font-medium">
                        {new Date(priceList.effectiveFrom).toLocaleDateString()}
                      </span>
                    </div>
                    {priceList.effectiveTo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Effective To:</span>
                        <span className="font-medium">
                          {new Date(priceList.effectiveTo).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Item Prices */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Item Prices ({priceList.items?.length ?? 0})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(priceList.items ?? []).slice(0, 6).map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 rounded p-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.itemName}</p>
                        <p className="text-xs text-gray-500">{item.itemCode}</p>
                        {item.minQty && (
                          <p className="text-xs text-orange-600">Min Qty: {item.minQty}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {(priceList.items?.length ?? 0) > 6 && (
                  <button className="mt-3 text-sm text-purple-600 hover:text-purple-800">
                    View all {priceList.items?.length ?? 0} items →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {selectedPriceList ? 'Edit Price List' : 'Add New Price List'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input
                    type="text"
                    value={form.priceListCode}
                    onChange={(e) => setForm({ ...form, priceListCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="PL-2025-01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.priceListName}
                    onChange={(e) => setForm({ ...form, priceListName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Standard Sales Price List"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effective From *</label>
                  <input
                    type="date"
                    value={form.effectiveFrom}
                    onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effective To</label>
                  <input
                    type="date"
                    value={form.effectiveTo}
                    onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applicable For</label>
                  <select
                    value={form.applicableFor}
                    onChange={(e) => setForm({ ...form, applicableFor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="sales">Sales</option>
                    <option value="purchase">Purchase</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Method</label>
                  <select
                    value={form.pricingMethod}
                    onChange={(e) => setForm({ ...form, pricingMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="markup">Markup</option>
                    <option value="markdown">Markdown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <input
                    type="text"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.includeTax}
                      onChange={(e) => setForm({ ...form, includeTax: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Include Tax</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Default</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : `${selectedPriceList ? 'Update' : 'Create'} Price List`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
