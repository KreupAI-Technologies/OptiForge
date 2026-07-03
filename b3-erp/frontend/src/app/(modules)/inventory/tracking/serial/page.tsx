'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Filter, QrCode, Download, Plus, Edit2, Eye, AlertCircle } from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';

interface SerialProduct {
  serialNumber: string;
  productId: string;
  productName: string;
  category: string;
  batchNumber: string;
  manufacturingDate: string;
  warrantyExpiry: string;
  warrantyStatus: 'Active' | 'Expired' | 'Expiring Soon';
  location: string;
  status: 'In Stock' | 'Deployed' | 'In Repair' | 'Retired';
  customerName?: string;
  lastServiceDate?: string;
}

export default function SerialTrackingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<SerialProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns raw ORM shape (serialNumber/itemId/itemName/batchNumber/
        // manufacturingDate/warrantyEndDate/locationName/status/customerName/
        // lastServiceDate); map it to the page's SerialProduct model.
        const raw = (await inventoryService.getSerialNumbers()) as any[];
        const statusMap: Record<string, SerialProduct['status']> = {
          Available: 'In Stock', IN_STOCK: 'In Stock', 'In Stock': 'In Stock',
          Sold: 'Deployed', Issued: 'Deployed', Installed: 'Deployed', Deployed: 'Deployed',
          UnderRepair: 'In Repair', 'In Repair': 'In Repair', InRepair: 'In Repair',
          Retired: 'Retired', Scrapped: 'Retired',
        };
        const toDate = (d: any): string => (d ? String(d).split('T')[0] : '');
        const warrantyStatus = (endDate: any, isUnderWarranty: any): SerialProduct['warrantyStatus'] => {
          if (!endDate) return isUnderWarranty ? 'Active' : 'Expired';
          const end = new Date(endDate).getTime();
          const now = Date.now();
          if (isNaN(end)) return 'Active';
          if (end < now) return 'Expired';
          const days = (end - now) / (1000 * 60 * 60 * 24);
          return days <= 60 ? 'Expiring Soon' : 'Active';
        };
        const mapped: SerialProduct[] = raw.map((s) => ({
          serialNumber: s.serialNumber ?? '',
          productId: s.itemCode ?? s.itemId ?? '',
          productName: s.itemName ?? s.itemCode ?? '',
          category: s.category ?? '-',
          batchNumber: s.batchNumber ?? '-',
          manufacturingDate: toDate(s.manufacturingDate),
          warrantyExpiry: toDate(s.warrantyEndDate),
          warrantyStatus: warrantyStatus(s.warrantyEndDate, s.isUnderWarranty),
          location: s.locationName ?? s.warehouseName ?? '-',
          status: statusMap[s.status] ?? 'In Stock',
          customerName: s.customerName ?? undefined,
          lastServiceDate: toDate(s.lastServiceDate) || undefined,
        }));
        if (!cancelled) setProducts(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load serial numbers');
          setProducts([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [warrantyFilter, setWarrantyFilter] = useState('');

  const filteredProducts = products.filter(product =>
    (product.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || product.status === statusFilter) &&
    (warrantyFilter === '' || product.warrantyStatus === warrantyFilter)
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'In Stock': 'bg-blue-100 text-blue-800',
      'Deployed': 'bg-green-100 text-green-800',
      'In Repair': 'bg-yellow-100 text-yellow-800',
      'Retired': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getWarrantyColor = (warranty: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Expiring Soon': 'bg-orange-100 text-orange-800',
      'Expired': 'bg-red-100 text-red-800'
    };
    return colors[warranty] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-200 rounded-lg text-slate-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Serial Number Tracking</h1>
              <p className="text-slate-600 mt-1">Track products by serial number and warranty status</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">
            <QrCode className="w-5 h-5" />
            Scan QR
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="text-sm text-slate-600 mb-1">Total Products</p>
            <p className="text-2xl font-bold text-slate-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="text-sm text-slate-600 mb-1">Active Warranty</p>
            <p className="text-2xl font-bold text-green-600">{products.filter(p => p.warrantyStatus === 'Active').length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="text-sm text-slate-600 mb-1">Expiring Soon</p>
            <p className="text-2xl font-bold text-orange-600">{products.filter(p => p.warrantyStatus === 'Expiring Soon').length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="text-sm text-slate-600 mb-1">Deployed</p>
            <p className="text-2xl font-bold text-blue-600">{products.filter(p => p.status === 'Deployed').length}</p>
          </div>
        </div>

        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading serial numbers…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {!isLoading && !loadError && products.length === 0 && (
          <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No serial numbers found.
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Search by Serial / Product</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="SN-MK-2024-001 or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Deployed">Deployed</option>
                <option value="In Repair">In Repair</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            {/* Warranty Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Warranty</label>
              <select
                value={warrantyFilter}
                onChange={(e) => setWarrantyFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">All Warranty</option>
                <option value="Active">Active</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">1 product has expired warranty</p>
            <p className="text-sm text-red-800">Consider renewing warranty or scheduling maintenance</p>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Serial Number</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Product</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Batch</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Warranty</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Expiry Date</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Location</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr key={index} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono font-medium text-emerald-600">{product.serialNumber}</td>
                    <td className="px-3 py-2">
                      <div>
                        <p className="font-medium text-slate-900">{product.productName}</p>
                        <p className="text-xs text-slate-600">{product.productId}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{product.batchNumber}</td>
                    <td className="px-3 py-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getWarrantyColor(product.warrantyStatus)}`}>
                        {product.warrantyStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {new Date(product.warrantyExpiry).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-slate-600 text-sm">{product.location}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Eye className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Edit2 className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-slate-600">
              <QrCode className="w-12 h-12 mb-3 text-slate-400" />
              <p className="font-medium">No products found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 font-medium">
            <Download className="w-5 h-5" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
}
