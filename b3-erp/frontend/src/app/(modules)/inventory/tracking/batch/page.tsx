'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Package, MapPin, Calendar, AlertTriangle, CheckCircle, Layers } from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';

interface BatchItem {
  id: string;
  batchNumber: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  manufacturedDate: string;
  expiryDate: string;
  supplier: string;
  location: string;
  status: 'active' | 'quarantine' | 'expired' | 'depleted';
  purchaseOrder: string;
  receivedDate: string;
}

export default function BatchTrackingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const batchItems: BatchItem[] = [
    {
      id: '1',
      batchNumber: 'BATCH-2025-001',
      itemCode: 'RM-001',
      itemName: 'Steel Sheet 1mm',
      quantity: 450,
      uom: 'Sheets',
      manufacturedDate: '2025-09-15',
      expiryDate: '2027-09-15',
      supplier: 'Steel Corp Ltd',
      location: 'Zone A - Bin A-01-R01',
      status: 'active',
      purchaseOrder: 'PO-2025-123',
      receivedDate: '2025-10-01'
    },
    {
      id: '2',
      batchNumber: 'BATCH-2025-002',
      itemCode: 'CP-015',
      itemName: 'Hydraulic Oil Grade 46',
      quantity: 80,
      uom: 'Liters',
      manufacturedDate: '2025-08-20',
      expiryDate: '2026-02-20',
      supplier: 'LubeTech Industries',
      location: 'Zone D - Bin D-01-R02',
      status: 'active',
      purchaseOrder: 'PO-2025-234',
      receivedDate: '2025-09-10'
    },
    {
      id: '3',
      batchNumber: 'BATCH-2024-156',
      itemCode: 'CHM-008',
      itemName: 'Cutting Fluid Concentrate',
      quantity: 25,
      uom: 'Liters',
      manufacturedDate: '2024-10-10',
      expiryDate: '2025-10-10',
      supplier: 'ChemSupply Co',
      location: 'Zone D - Bin D-02-R01',
      status: 'expired',
      purchaseOrder: 'PO-2024-892',
      receivedDate: '2024-11-05'
    },
    {
      id: '4',
      batchNumber: 'BATCH-2025-045',
      itemCode: 'RM-012',
      itemName: 'Aluminum Alloy 6061',
      quantity: 120,
      uom: 'Kg',
      manufacturedDate: '2025-09-01',
      expiryDate: 'N/A',
      supplier: 'MetalWorks Inc',
      location: 'Zone B - Bin B-01-R03',
      status: 'quarantine',
      purchaseOrder: 'PO-2025-345',
      receivedDate: '2025-10-15'
    },
    {
      id: '5',
      batchNumber: 'BATCH-2025-067',
      itemCode: 'CS-022',
      itemName: 'Welding Electrodes 3.2mm',
      quantity: 0,
      uom: 'Kg',
      manufacturedDate: '2025-07-15',
      expiryDate: '2027-07-15',
      supplier: 'WeldTech Supplies',
      location: 'N/A',
      status: 'depleted',
      purchaseOrder: 'PO-2025-456',
      receivedDate: '2025-08-20'
    }
  ];

  const filteredItems = batchItems.filter(item => {
    const matchesSearch = item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'quarantine': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'depleted': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Batch/Lot Tracking</h1>
            <p className="text-sm text-gray-500 mt-1">Track inventory by batch and lot numbers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Batches</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{batchItems.length}</p>
            </div>
            <Layers className="w-6 h-6 text-blue-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {batchItems.filter(i => i.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Quarantine</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">
                {batchItems.filter(i => i.status === 'quarantine').length}
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 text-yellow-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Expired</p>
              <p className="text-3xl font-bold text-red-900 mt-1">
                {batchItems.filter(i => i.status === 'expired').length}
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by batch number or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="quarantine">Quarantine</option>
            <option value="expired">Expired</option>
            <option value="depleted">Depleted</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufactured</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-bold text-gray-900">{item.batchNumber}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">{item.itemCode}</div>
                    <div className="text-xs text-gray-500">{item.itemName}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">
                    {item.quantity} {item.uom}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {item.manufacturedDate}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.expiryDate !== 'N/A' ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {item.expiryDate}
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.supplier}</td>
                  <td className="px-4 py-3">
                    {item.location !== 'N/A' ? (
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {item.location}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No batches found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
