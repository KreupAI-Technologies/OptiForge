'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Truck, Plus, Search, Edit2, Trash2, CheckCircle2,
  XCircle, MapPin, Phone, Mail, Star, DollarSign,
  Award, FileText, Calendar, TrendingUp
} from 'lucide-react';
import { logisticsService } from '@/services/logistics.service';

interface Transporter {
  id: string;
  code: string;
  name: string;
  type: 'Road' | 'Rail' | 'Air' | 'Sea' | 'Multimodal';
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  gstNumber?: string;
  panNumber?: string;
  rating: number;
  services: string[];
  vehicles: number;
  coverage: string[];
  rates: {
    baseRate: number;
    perKmRate: number;
    perKgRate: number;
    currency: string;
  };
  performance: {
    onTimeDelivery: number;
    damageRate: number;
    totalShipments: number;
  };
  certifications: string[];
  status: 'Active' | 'Inactive' | 'Blacklisted';
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
}

export default function TransporterMaster() {
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [selectedTransporter, setSelectedTransporter] = useState<Transporter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const loadTransporters = useCallback(async () => {
    try {
      const rows = await logisticsService.getTransportCompanies();
      if (!Array.isArray(rows)) {
        setTransporters([]);
        return;
      }
      const mapped: Transporter[] = rows.map((r: any) => ({
        id: String(r.id ?? r._id ?? ''),
        code: r.companyCode || r.code || '',
        name: r.companyName || r.name || '',
        type: (r.transportMode || r.type || 'Road') as Transporter['type'],
        contactPerson: r.contactPerson || '',
        phone: r.phone || r.contactPhone || '',
        email: r.email || r.contactEmail || '',
        address: r.address || '',
        city: r.city || '',
        state: r.state || '',
        country: r.country || '',
        pincode: r.pincode || r.zipCode || '',
        gstNumber: r.gstNumber || '',
        panNumber: r.panNumber || '',
        rating: Number(r.rating) || 0,
        services: Array.isArray(r.services) ? r.services : [],
        vehicles: Number(r.vehicles) || 0,
        coverage: Array.isArray(r.coverage) ? r.coverage : [],
        rates: {
          baseRate: Number(r.rates?.baseRate ?? r.baseRate) || 0,
          perKmRate: Number(r.rates?.perKmRate ?? r.perKmRate) || 0,
          perKgRate: Number(r.rates?.perKgRate ?? r.perKgRate) || 0,
          currency: r.rates?.currency || r.currency || 'INR',
        },
        performance: {
          onTimeDelivery: Number(r.performance?.onTimeDelivery ?? r.onTimeDelivery) || 0,
          damageRate: Number(r.performance?.damageRate ?? r.damageRate) || 0,
          totalShipments: Number(r.performance?.totalShipments ?? r.totalShipments) || 0,
        },
        certifications: Array.isArray(r.certifications) ? r.certifications : [],
        status: (r.status || 'Active') as Transporter['status'],
        metadata: {
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
          createdBy: r.createdBy || '',
        },
      }));
      setTransporters(mapped);
    } catch {
      setTransporters([]);
    }
  }, []);

  useEffect(() => {
    loadTransporters();
  }, [loadTransporters]);

  const handleEdit = (transporter: Transporter) => {
    setSelectedTransporter(transporter);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transporter?')) {
      try {
        await logisticsService.deleteTransportCompany(id);
        await loadTransporters();
      } catch {
        setTransporters(transporters.filter(t => t.id !== id));
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Blacklisted': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
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

  const filteredTransporters = useMemo(() => {
    return transporters.filter(transporter => {
      const matchesSearch = transporter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transporter.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || transporter.type === filterType;
      const matchesStatus = filterStatus === 'All' || transporter.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transporters, searchTerm, filterType, filterStatus]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="h-8 w-8 text-orange-600" />
              Transporter Master
            </h1>
            <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-none">
              Manage logistics providers and carriers
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedTransporter(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest"
          >
            <Plus className="h-4 w-4" />
            Add Transporter
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm font-medium">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transporters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Types</option>
                  <option value="Road">Road</option>
                  <option value="Rail">Rail</option>
                  <option value="Air">Air</option>
                  <option value="Sea">Sea</option>
                  <option value="Multimodal">Multimodal</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blacklisted">Blacklisted</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transporter
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Contact
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coverage
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
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
                {filteredTransporters.map((transporter) => (
                  <tr key={transporter.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{transporter.name}</div>
                        <div className="text-xs text-gray-500">{transporter.code}</div>
                        <div className="text-xs text-gray-400">{transporter.vehicles} vehicles</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-blue-600 font-medium">
                          <Truck className="h-3 w-3" />
                          {transporter.type}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                          <Phone className="h-3 w-3" />
                          {transporter.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs">
                        {transporter.coverage.slice(0, 2).map((area, i) => (
                          <div key={i} className="text-gray-600">{area}</div>
                        ))}
                        {transporter.coverage.length > 2 && (
                          <div className="text-blue-600">+{transporter.coverage.length - 2} more</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs">
                        <div className="text-green-600 font-medium">
                          {transporter.performance.onTimeDelivery}% On-time
                        </div>
                        <div className="text-gray-600">
                          {transporter.performance.totalShipments.toLocaleString()} shipments
                        </div>
                        <div className="text-gray-500">
                          {transporter.performance.damageRate}% damage
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{transporter.rating}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {getStatusBadge(transporter.status)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(transporter)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transporter.id)}
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
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {selectedTransporter ? 'Edit Transporter' : 'Add New Transporter'}
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
                        Code *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedTransporter?.code}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="TRNS-XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedTransporter?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Transporter name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select
                        defaultValue={selectedTransporter?.type || 'Road'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Road">Road</option>
                        <option value="Rail">Rail</option>
                        <option value="Air">Air</option>
                        <option value="Sea">Sea</option>
                        <option value="Multimodal">Multimodal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        defaultValue={selectedTransporter?.status || 'Active'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Blacklisted">Blacklisted</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedTransporter?.contactPerson}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedTransporter?.phone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+91-XXXXXXXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      defaultValue={selectedTransporter?.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      defaultValue={selectedTransporter?.address}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Complete address"
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
                  Save Transporter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
