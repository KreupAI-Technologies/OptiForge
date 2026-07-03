'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Tag, DollarSign, Calendar, CheckCircle, AlertCircle, ShoppingCart, TrendingDown, TrendingUp, Download, Upload } from 'lucide-react';
import { commonMastersService, PriceList } from '@/services/common-masters.service';

export default function PriceListMaster() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(true);

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
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
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
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">View</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Edit className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Edit</span>
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
    </div>
  );
}
