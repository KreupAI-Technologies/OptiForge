'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Edit,
  Eye,
  Package,
  Calendar,
  Tag,
  Plus
} from 'lucide-react';
import { salesConfigService } from '@/services/sales-config.service';

interface PriceListItem {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  basePrice: number;
  currentPrice: number;
  unit: string;
  effectiveFrom: string;
  lastUpdated: string;
  priceChange: number;
  priceChangePercent: number;
  moq: number; // Minimum Order Quantity
  stock: number;
}

export default function PriceListsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [priceList, setPriceList] = useState<PriceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await salesConfigService.getPriceListItems();
        const mapped: PriceListItem[] = (rows || []).map((r) => ({
          id: r.id,
          productCode: r.productCode || '',
          productName: r.productName,
          category: r.category || '',
          basePrice: Number(r.basePrice) || 0,
          currentPrice: Number(r.currentPrice) || 0,
          unit: r.unit || 'piece',
          effectiveFrom: r.effectiveFrom || '',
          lastUpdated: r.updatedAt || '',
          priceChange: Number(r.priceChange) || 0,
          priceChangePercent: Number(r.priceChangePercent) || 0,
          moq: Number(r.moq) || 0,
          stock: Number(r.stock) || 0,
        }));
        if (!cancelled) setPriceList(mapped);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load price list');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredProducts = priceList.filter(product => {
    const matchesSearch =
      product.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(priceList.map(p => p.category)));
  const totalProducts = priceList.length;
  const priceIncreases = priceList.filter(p => p.priceChange > 0).length;
  const priceDecreases = priceList.filter(p => p.priceChange < 0).length;
  const avgPrice = priceList.length > 0 ? priceList.reduce((sum, p) => sum + p.currentPrice, 0) / priceList.length : 0;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 px-3 py-2">
      <div className="space-y-3">
        {/* Inline Header */}
        <div className="flex items-center gap-3 ml-auto justify-end">
          <button className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
            Export Price List
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Update Prices
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold mt-2">{totalProducts}</p>
                <p className="text-indigo-100 text-xs mt-1">In price list</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Package className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Average Price</p>
                <p className="text-3xl font-bold mt-2">₹{(avgPrice / 1000).toFixed(1)}K</p>
                <p className="text-blue-100 text-xs mt-1">Across all products</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <IndianRupee className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Price Increases</p>
                <p className="text-3xl font-bold mt-2">{priceIncreases}</p>
                <p className="text-green-100 text-xs mt-1">Products</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Price Decreases</p>
                <p className="text-3xl font-bold mt-2">{priceDecreases}</p>
                <p className="text-red-100 text-xs mt-1">Products</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingDown className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by product code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price List Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold">Product Code</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">Product Name</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">Category</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold">Base Price</th>
                  <th className="px-3 py-2 text-right text-sm font-semibold">Current Price</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold">Change</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold">MOQ</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold">Stock</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product, index) => (
                  <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2">
                      <span className="font-mono text-sm font-medium text-gray-900">{product.productCode}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <p className="font-medium text-gray-900">{product.productName}</p>
                        <p className="text-xs text-gray-500">Unit: {product.unit}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="text-gray-600">₹{product.basePrice.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-semibold text-gray-900">₹{product.currentPrice.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {product.priceChange !== 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          {product.priceChange > 0 ? (
                            <>
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span className="text-green-600 font-medium text-sm">
                                +{product.priceChangePercent}%
                              </span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-4 h-4 text-red-500" />
                              <span className="text-red-600 font-medium text-sm">
                                {product.priceChangePercent}%
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="text-gray-700">{product.moq}</span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`font-medium ${product.stock < 100 ? 'text-red-600' : 'text-gray-700'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                          <Eye className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                          <Edit className="w-4 h-4 text-indigo-600" />
                          <span className="text-indigo-700">Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600">No products match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
