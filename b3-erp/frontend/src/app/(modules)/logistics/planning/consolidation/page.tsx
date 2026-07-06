'use client';

import React, { useState, useEffect } from 'react';
import { LogisticsService } from '@/services/logistics.service';
import {
  Layers,
  Plus,
  Edit2,
  Eye,
  Search,
  Package,
  MapPin,
  Calendar,
  TrendingDown,
  CheckCircle,
  Clock,
  DollarSign,
  Truck
} from 'lucide-react';

interface ConsolidationOpportunity {
  id: number;
  consolidationId: string;
  opportunityName: string;
  origin: string;
  destination: string;
  targetDate: string;
  numberOfShipments: number;
  totalWeight: number; // in kg
  totalVolume: number; // in cubic meters
  estimatedVehicleType: string;
  vehicleCapacityWeight: number;
  vehicleCapacityVolume: number;
  utilizationPercentage: number;
  potentialSavings: number;
  currentCost: number;
  consolidatedCost: number;
  shipmentDetails: {
    shipmentId: string;
    weight: number;
    volume: number;
    priority: 'urgent' | 'high' | 'normal' | 'low';
  }[];
  status: 'identified' | 'planned' | 'confirmed' | 'consolidated' | 'rejected';
  createdDate: string;
  createdBy: string;
  lastModified: string;
  remarks: string;
}

function mapSuggestion(s: any, i: number): ConsolidationOpportunity {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: i + 1,
    consolidationId: s.id || '',
    opportunityName: s.reason || 'Consolidation opportunity',
    origin: 'Warehouse',
    destination: s.orders?.[0]?.deliveryAddress?.city || '',
    targetDate: today,
    numberOfShipments: s.orders?.length || 0,
    totalWeight: s.totalWeight || 0,
    totalVolume: s.totalVolume || 0,
    estimatedVehicleType: s.recommendedVehicle || '',
    vehicleCapacityWeight: 0,
    vehicleCapacityVolume: 0,
    utilizationPercentage: Math.round(s.consolidationScore || 0),
    potentialSavings: s.savings || 0,
    currentCost: (s.estimatedCost || 0) + (s.savings || 0),
    consolidatedCost: s.estimatedCost || 0,
    shipmentDetails: (s.orders || []).map((o: any) => ({
      shipmentId: o.orderNumber || o.id || '',
      weight: o.totalWeight || 0,
      volume: o.totalVolume || 0,
      priority: (o.priority || 'normal') as ConsolidationOpportunity['shipmentDetails'][number]['priority'],
    })),
    status: 'identified' as ConsolidationOpportunity['status'],
    createdDate: today,
    createdBy: 'system',
    lastModified: today,
    remarks: s.reason || '',
  };
}

export default function ConsolidationPlanningPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDestination, setSelectedDestination] = useState('all');

  const [opportunities, setOpportunities] = useState<ConsolidationOpportunity[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await LogisticsService.getConsolidationOpportunities();
        const rows = Array.isArray(raw) ? raw : [];
        setOpportunities(rows.map(mapSuggestion));
      } catch {
        setOpportunities([]);
      }
    })();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'identified': 'text-blue-600 bg-blue-50 border-blue-200',
      'planned': 'text-purple-600 bg-purple-50 border-purple-200',
      'confirmed': 'text-green-600 bg-green-50 border-green-200',
      'consolidated': 'text-gray-600 bg-gray-50 border-gray-200',
      'rejected': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'consolidated':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'identified':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-purple-500" />;
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 85) return 'text-green-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalOpportunities = opportunities.length;
  const activeOpportunities = opportunities.filter(o => o.status === 'identified' || o.status === 'planned' || o.status === 'confirmed').length;
  const totalPotentialSavings = opportunities.filter(o => o.status !== 'rejected' && o.status !== 'consolidated').reduce((sum, o) => sum + o.potentialSavings, 0);
  const avgUtilization = (opportunities.reduce((sum, o) => sum + o.utilizationPercentage, 0) / totalOpportunities).toFixed(1);

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.consolidationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opportunity.opportunityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opportunity.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opportunity.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || opportunity.status === selectedStatus;
    const matchesDestination = selectedDestination === 'all' || opportunity.destination.includes(selectedDestination);
    return matchesSearch && matchesStatus && matchesDestination;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Layers className="w-8 h-8 text-teal-600" />
            <span>Shipment Consolidation</span>
          </h1>
          <p className="text-gray-600 mt-1">Identify and plan shipment consolidation opportunities</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Consolidation</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between mb-2">
            <Layers className="w-8 h-8 text-teal-600" />
            <span className="text-2xl font-bold text-teal-900">{totalOpportunities}</span>
          </div>
          <div className="text-sm font-medium text-teal-700">Total Opportunities</div>
          <div className="text-xs text-teal-600 mt-1">All Status</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{activeOpportunities}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Active Opportunities</div>
          <div className="text-xs text-blue-600 mt-1">Ready to Consolidate</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">₹{(totalPotentialSavings / 1000).toFixed(0)}K</span>
          </div>
          <div className="text-sm font-medium text-green-700">Potential Savings</div>
          <div className="text-xs text-green-600 mt-1">Cost Reduction</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{avgUtilization}%</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Avg Utilization</div>
          <div className="text-xs text-purple-600 mt-1">Target: 85%+</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search consolidations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="identified">Identified</option>
            <option value="planned">Planned</option>
            <option value="confirmed">Confirmed</option>
            <option value="consolidated">Consolidated</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Destinations</option>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Chennai">Chennai</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Kochi">Kochi</option>
          </select>
        </div>
      </div>

      {/* Consolidation Opportunities Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consolidation Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipments</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Savings</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOpportunities.map((opportunity) => (
                <tr key={opportunity.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{opportunity.consolidationId}</div>
                    <div className="text-sm text-gray-600">{opportunity.opportunityName}</div>
                    <div className="text-xs text-gray-500 mt-1">By: {opportunity.createdBy}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span>{opportunity.origin}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>{opportunity.destination}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(opportunity.targetDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold text-gray-900">{opportunity.numberOfShipments}</span>
                    </div>
                    <div className="text-xs text-gray-600">{(opportunity.totalWeight / 1000).toFixed(1)}T</div>
                    <div className="text-xs text-gray-600">{opportunity.totalVolume}m³</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span>{opportunity.estimatedVehicleType}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Cap: {(opportunity.vehicleCapacityWeight / 1000).toFixed(1)}T / {opportunity.vehicleCapacityVolume}m³
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                        <div
                          className={`h-2 rounded-full ${
                            opportunity.utilizationPercentage >= 85 ? 'bg-green-500' :
                            opportunity.utilizationPercentage >= 70 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${opportunity.utilizationPercentage}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${getUtilizationColor(opportunity.utilizationPercentage)}`}>
                        {opportunity.utilizationPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1 text-sm font-bold text-green-600">
                      <TrendingDown className="w-4 h-4" />
                      <span>₹{(opportunity.potentialSavings / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      ₹{(opportunity.currentCost / 1000).toFixed(1)}K → ₹{(opportunity.consolidatedCost / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs text-gray-500">
                      {((opportunity.potentialSavings / opportunity.currentCost) * 100).toFixed(0)}% reduction
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(opportunity.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(opportunity.status)}`}>
                        {opportunity.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
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
      </div>

      {/* Consolidation Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Layers className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Consolidation Benefits</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Combine multiple shipments to the same destination to maximize vehicle utilization and reduce costs.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Reduced transportation costs per shipment</div>
            <div>• Improved vehicle capacity utilization</div>
            <div>• Lower carbon footprint per shipment</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Cost Optimization</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Achieve significant cost savings by consolidating shipments and optimizing vehicle usage.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Single vehicle vs. multiple trips</div>
            <div>• Shared fuel and toll costs</div>
            <div>• Reduced labor and overhead</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Shipment Planning</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Plan consolidations based on destination, delivery dates, and shipment priorities.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Same destination grouping</div>
            <div>• Compatible delivery windows</div>
            <div>• Priority-based consolidation</div>
          </div>
        </div>
      </div>
    </div>
  );
}
