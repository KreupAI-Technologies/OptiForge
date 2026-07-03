'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Package, Truck, MapPin, Calendar, CheckCircle, Clock, AlertTriangle, Download, Filter } from 'lucide-react';
import { exportToCsv } from '@/lib/export';

interface InboundShipment {
  id: string;
  shipmentNo: string;
  poNumber: string;
  supplier: string;
  carrier: string;
  origin: string;
  destination: string;
  expectedDate: string;
  actualDate: string;
  items: number;
  totalQty: number;
  totalValue: number;
  status: 'scheduled' | 'in-transit' | 'arrived' | 'unloading' | 'completed' | 'delayed';
  trackingNumber: string;
  containerNo: string;
  priority: 'high' | 'medium' | 'low';
}

export default function InboundShippingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const inboundShipments: InboundShipment[] = [
    {
      id: '1',
      shipmentNo: 'IB-2025-0421',
      poNumber: 'PO-2025-1245',
      supplier: 'SteelCorp Industries',
      carrier: 'Global Freight Ltd',
      origin: 'Mumbai, India',
      destination: 'Warehouse A - Chennai',
      expectedDate: '2025-10-23',
      actualDate: '',
      items: 5,
      totalQty: 2500,
      totalValue: 125000,
      status: 'in-transit',
      trackingNumber: 'TRK-MUM-2025-8745',
      containerNo: 'MSCU-4567891',
      priority: 'high'
    },
    {
      id: '2',
      shipmentNo: 'IB-2025-0422',
      poNumber: 'PO-2025-1256',
      supplier: 'BearingTech Industries',
      carrier: 'Swift Logistics',
      origin: 'Pune, India',
      destination: 'Warehouse A - Chennai',
      expectedDate: '2025-10-22',
      actualDate: '',
      items: 3,
      totalQty: 850,
      totalValue: 95000,
      status: 'delayed',
      trackingNumber: 'TRK-PUN-2025-3421',
      containerNo: 'TOLU-7834561',
      priority: 'high'
    },
    {
      id: '3',
      shipmentNo: 'IB-2025-0423',
      poNumber: 'PO-2025-1267',
      supplier: 'MetalSource Ltd',
      carrier: 'Express Transport',
      origin: 'Bangalore, India',
      destination: 'Warehouse B - Chennai',
      expectedDate: '2025-10-25',
      actualDate: '',
      items: 8,
      totalQty: 4200,
      totalValue: 210000,
      status: 'scheduled',
      trackingNumber: 'TRK-BLR-2025-9876',
      containerNo: 'HJCU-2345678',
      priority: 'medium'
    },
    {
      id: '4',
      shipmentNo: 'IB-2025-0424',
      poNumber: 'PO-2025-1278',
      supplier: 'ChemSupply Co',
      carrier: 'SafeChem Transport',
      origin: 'Ahmedabad, India',
      destination: 'Warehouse A - Chennai',
      expectedDate: '2025-10-21',
      actualDate: '2025-10-21',
      items: 4,
      totalQty: 1200,
      totalValue: 48000,
      status: 'arrived',
      trackingNumber: 'TRK-AMD-2025-5432',
      containerNo: 'SCTU-8901234',
      priority: 'medium'
    },
    {
      id: '5',
      shipmentNo: 'IB-2025-0425',
      poNumber: 'PO-2025-1289',
      supplier: 'HydroTech Systems',
      carrier: 'Premium Freight',
      origin: 'Coimbatore, India',
      destination: 'Warehouse A - Chennai',
      expectedDate: '2025-10-21',
      actualDate: '2025-10-21',
      items: 2,
      totalQty: 45,
      totalValue: 67500,
      status: 'unloading',
      trackingNumber: 'TRK-CBE-2025-2109',
      containerNo: 'PFTU-4561237',
      priority: 'high'
    },
    {
      id: '6',
      shipmentNo: 'IB-2025-0426',
      poNumber: 'PO-2025-1290',
      supplier: 'WireTech Solutions',
      carrier: 'Fast Track Logistics',
      origin: 'Delhi, India',
      destination: 'Warehouse B - Chennai',
      expectedDate: '2025-10-20',
      actualDate: '2025-10-20',
      items: 6,
      totalQty: 890,
      totalValue: 34500,
      status: 'completed',
      trackingNumber: 'TRK-DEL-2025-7654',
      containerNo: 'FTCU-9012345',
      priority: 'low'
    }
  ];

  const filteredShipments = inboundShipments.filter(shipment => {
    const matchesSearch = shipment.shipmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || shipment.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'arrived': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'unloading': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'in-transit': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'delayed': return 'bg-red-100 text-red-700 border-red-200';
      case 'scheduled': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'arrived': return <Package className="w-3 h-3" />;
      case 'unloading': return <Truck className="w-3 h-3" />;
      case 'in-transit': return <Truck className="w-3 h-3" />;
      case 'delayed': return <AlertTriangle className="w-3 h-3" />;
      case 'scheduled': return <Clock className="w-3 h-3" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
            <h1 className="text-2xl font-bold text-gray-900">Inbound Shipping</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage incoming shipments from suppliers</p>
          </div>
        </div>
        <button onClick={() => exportToCsv('inbound-shipments', filteredShipments)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">In Transit</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">
                {inboundShipments.filter(s => s.status === 'in-transit').length}
              </p>
            </div>
            <Truck className="w-6 h-6 text-yellow-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Arrived</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {inboundShipments.filter(s => s.status === 'arrived' || s.status === 'unloading').length}
              </p>
            </div>
            <Package className="w-6 h-6 text-blue-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Delayed</p>
              <p className="text-3xl font-bold text-red-900 mt-1">
                {inboundShipments.filter(s => s.status === 'delayed').length}
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {inboundShipments.filter(s => s.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search shipments..."
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
            <option value="scheduled">Scheduled</option>
            <option value="in-transit">In Transit</option>
            <option value="arrived">Arrived</option>
            <option value="unloading">Unloading</option>
            <option value="delayed">Delayed</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shipment Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Items/Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected/Actual</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">{shipment.shipmentNo}</div>
                    <div className="text-xs text-gray-500">PO: {shipment.poNumber}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      <span className="font-mono">{shipment.trackingNumber}</span>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">{shipment.containerNo}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">{shipment.supplier}</div>
                    <div className="text-xs text-gray-500">{shipment.carrier}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-700">{shipment.origin}</div>
                        <div className="text-xs text-gray-400 my-1">→</div>
                        <div className="text-xs font-semibold text-gray-900">{shipment.destination}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm font-semibold text-gray-900">{shipment.items} items</div>
                    <div className="text-xs text-gray-500">{shipment.totalQty.toLocaleString()} units</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-bold text-blue-600">
                      Rs.{shipment.totalValue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">Expected: {shipment.expectedDate}</span>
                      </div>
                      {shipment.actualDate && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-green-600 font-semibold">Actual: {shipment.actualDate}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(shipment.priority)}`}>
                      {shipment.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(shipment.status)}`}>
                      {getStatusIcon(shipment.status)}
                      {shipment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredShipments.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-500">No inbound shipments found</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Inbound Shipping Process:</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>Scheduled:</strong> Shipment confirmed with supplier, awaiting dispatch</li>
          <li><strong>In Transit:</strong> Goods en route to destination warehouse</li>
          <li><strong>Arrived:</strong> Shipment reached warehouse, awaiting unloading</li>
          <li><strong>Unloading:</strong> Goods being unloaded and inspected</li>
          <li><strong>Completed:</strong> Goods received, inspected, and added to inventory</li>
          <li><strong>Delayed:</strong> Shipment delayed beyond expected date - requires attention</li>
        </ul>
      </div>
    </div>
  );
}
