'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Package, Plus, Search, Edit2, Trash2, CheckCircle2,
  XCircle, Calendar, Hash, AlertCircle, Clock,
  MapPin, Thermometer, TrendingDown, Box, FileText
} from 'lucide-react';
import { manufacturingMastersService, Batch as BackendBatch } from '../../services/manufacturing-masters.service';

interface BatchLot {
  id: string;
  batchNumber: string;
  lotNumber: string;
  item: string;
  itemCode: string;
  quantity: number;
  uom: string;
  manufacturingDate: Date;
  expiryDate?: Date;
  shelfLife?: number;
  supplier?: string;
  poNumber?: string;
  warehouse: string;
  location: string;
  productionOrder?: string;
  qualityStatus: string;
  attributes: {
    color?: string;
    grade?: string;
    revision?: string;
    serialRange?: string;
  };
  traceability: {
    rawMaterialBatches?: string[];
    workOrders?: string[];
    operators?: string[];
  };
  testing: {
    inspectionDate?: Date;
    inspector?: string;
    testResults?: string;
    certificateNumber?: string;
  };
  status: string;
  notes: string;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  };
}

export default function BatchLotMaster() {
  const [batches, setBatches] = useState<BatchLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await manufacturingMastersService.getAllBatches('1');
      const mapped: BatchLot[] = data.map((b: BackendBatch) => ({
        id: b.id,
        batchNumber: b.batchNumber,
        lotNumber: `LOT-${b.batchNumber.substring(b.batchNumber.length - 5)}`,
        item: 'Various Items',
        itemCode: b.itemId || 'N/A',
        quantity: b.quantity || 0,
        uom: 'units',
        manufacturingDate: b.manufacturingDate ? new Date(b.manufacturingDate) : new Date(),
        expiryDate: b.expiryDate ? new Date(b.expiryDate) : undefined,
        warehouse: 'Main Warehouse',
        location: 'Zone A',
        qualityStatus: 'Approved',
        attributes: {},
        traceability: {},
        testing: {},
        status: 'Active',
        notes: '',
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'admin',
          updatedBy: 'admin'
        }
      }));
      setBatches(mapped);
    } catch (err) {
      console.error('Error fetching batches:', err);
      setError('Failed to load batch/lot records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedBatch, setSelectedBatch] = useState<BatchLot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterQualityStatus, setFilterQualityStatus] = useState<string>('All');

  const handleEdit = (batch: BatchLot) => {
    setSelectedBatch(batch);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this batch/lot?')) {
      setBatches(batches.filter(b => b.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Consumed': { bg: 'bg-gray-100', text: 'text-gray-800', icon: Box },
      'Quarantined': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
      'Expired': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      'Returned': { bg: 'bg-purple-100', text: 'text-purple-800', icon: TrendingDown }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const getQualityBadge = (qualityStatus: string) => {
    const qualityConfig = {
      'Approved': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      'On Hold': { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle }
    };
    const config = qualityConfig[qualityStatus as keyof typeof qualityConfig];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3" />
        {qualityStatus}
      </span>
    );
  };

  const getDaysUntilExpiry = (expiryDate?: Date) => {
    if (!expiryDate) return null;
    const days = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return <span className="text-red-600 font-medium">Expired</span>;
    if (days < 30) return <span className="text-orange-600 font-medium">{days} days</span>;
    if (days < 90) return <span className="text-yellow-600">{days} days</span>;
    return <span className="text-green-600">{days} days</span>;
  };

  const filteredBatches = useMemo(() => {
    return batches.filter(batch => {
      const matchesSearch = batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.item.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || batch.status === filterStatus;
      const matchesQuality = filterQualityStatus === 'All' || batch.qualityStatus === filterQualityStatus;
      return matchesSearch && matchesStatus && matchesQuality;
    });
  }, [batches, searchTerm, filterStatus, filterQualityStatus]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-3 text-gray-500">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Loading batch/lot records...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2">Batch/Lot Master</h2>
        <p className="text-gray-600">Manage production batches and lot traceability</p>
      </div>

      {batches.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3 flex items-center gap-3 text-blue-700">
          <Package className="h-5 w-5" />
          <span>No batch/lot records found.</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search batches/lots..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Consumed">Consumed</option>
                <option value="Quarantined">Quarantined</option>
                <option value="Expired">Expired</option>
                <option value="Returned">Returned</option>
              </select>
              <select
                value={filterQualityStatus}
                onChange={(e) => setFilterQualityStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Quality Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSelectedBatch(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Batch/Lot
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch/Lot Info
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <Hash className="h-3 w-3 text-gray-400" />
                        {batch.batchNumber}
                      </div>
                      <div className="text-xs text-gray-500">Lot: {batch.lotNumber}</div>
                      {batch.supplier && (
                        <div className="text-xs text-gray-400">{batch.supplier}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm text-gray-900">{batch.item}</div>
                      <div className="text-xs text-gray-500">{batch.itemCode}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium">
                      {batch.quantity.toLocaleString()} {batch.uom}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {batch.warehouse}
                      </div>
                      <div className="text-xs text-gray-500">{batch.location}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>Mfg: {batch.manufacturingDate.toLocaleDateString()}</span>
                      </div>
                      {batch.expiryDate && (
                        <div className="mt-1">
                          <span className="text-gray-500">Expires: </span>
                          {getDaysUntilExpiry(batch.expiryDate)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {getQualityBadge(batch.qualityStatus)}
                  </td>
                  <td className="px-3 py-2">
                    {getStatusBadge(batch.status)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(batch)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(batch.id)}
                        className="text-red-600 hover:text-red-800"
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full  max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {selectedBatch ? 'Edit Batch/Lot' : 'Add New Batch/Lot'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Number *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedBatch?.batchNumber}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="BATCH-YYYY-NNN"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lot Number *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedBatch?.lotNumber}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="LOT-X-NNNNN"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Code *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedBatch?.itemCode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Select item"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedBatch?.quantity}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UOM *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBatch?.uom}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="kg"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warehouse *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedBatch?.warehouse}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Select warehouse"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedBatch?.location}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Zone-Rack-Bin"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quality Status
                    </label>
                    <select
                      defaultValue={selectedBatch?.qualityStatus || 'Pending'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      defaultValue={selectedBatch?.status || 'Active'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Consumed">Consumed</option>
                      <option value="Quarantined">Quarantined</option>
                      <option value="Expired">Expired</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    defaultValue={selectedBatch?.notes}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Batch/Lot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
