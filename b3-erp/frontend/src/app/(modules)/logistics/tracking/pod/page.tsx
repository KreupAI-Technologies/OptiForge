'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, FileText, CheckCircle, Image as ImageIcon, User, Calendar, MapPin, Clock, Download, Eye, Filter, AlertCircle } from 'lucide-react';
import { LogisticsService } from '@/services/logistics.service';

interface ProofOfDelivery {
  id: string;
  shipmentNo: string;
  trackingNumber: string;
  orderNo: string;
  customer: string;
  deliveryAddress: string;
  deliveredDate: string;
  deliveredTime: string;
  receiverName: string;
  receiverSignature: string;
  receiverPhone: string;
  deliveryAgent: string;
  agentId: string;
  items: number;
  totalWeight: number;
  vehicleNo: string;
  podType: 'signature' | 'photo' | 'otp' | 'contactless';
  images: string[];
  notes: string;
  condition: 'good' | 'damaged' | 'partial';
  verificationStatus: 'verified' | 'pending' | 'disputed';
  verifiedBy: string;
  verifiedDate: string;
}

export default function ProofOfDeliveryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [podTypeFilter, setPodTypeFilter] = useState<string>('all');
  const [selectedPOD, setSelectedPOD] = useState<ProofOfDelivery | null>(null);

  const podRecords: ProofOfDelivery[] = [
    {
      id: '1',
      shipmentNo: 'OB-2025-0534',
      trackingNumber: 'TRK-CHN-2025-4524',
      orderNo: 'SO-2025-1237',
      customer: 'Global Traders Inc',
      deliveryAddress: 'Plot 45, Industrial Area, Pune, Maharashtra - 411001',
      deliveredDate: '2025-10-23',
      deliveredTime: '15:45',
      receiverName: 'Ramesh Kumar',
      receiverSignature: 'Available',
      receiverPhone: '+91-98765-43210',
      deliveryAgent: 'Vijay Singh',
      agentId: 'DA-CHN-2025',
      items: 20,
      totalWeight: 890,
      vehicleNo: 'TN-04-GH-3456',
      podType: 'signature',
      images: ['delivery_photo_1.jpg', 'package_condition.jpg'],
      notes: 'Delivery completed successfully. All packages in good condition.',
      condition: 'good',
      verificationStatus: 'verified',
      verifiedBy: 'Logistics Manager',
      verifiedDate: '2025-10-23 16:30'
    },
    {
      id: '2',
      shipmentNo: 'OB-2025-0538',
      trackingNumber: 'TRK-CHN-2025-4528',
      orderNo: 'SO-2025-1241',
      customer: 'Southern Suppliers',
      deliveryAddress: '78, MG Road, Kochi, Kerala - 682001',
      deliveredDate: '2025-10-22',
      deliveredTime: '16:30',
      receiverName: 'Suresh Menon',
      receiverSignature: 'Available',
      receiverPhone: '+91-99876-54321',
      deliveryAgent: 'Arun Nair',
      agentId: 'DA-CHN-2031',
      items: 14,
      totalWeight: 410,
      vehicleNo: 'KL-07-BC-5678',
      podType: 'photo',
      images: ['delivery_photo_2.jpg', 'receiver_id.jpg', 'package_stack.jpg'],
      notes: 'Contactless delivery due to COVID protocols. Photos captured.',
      condition: 'good',
      verificationStatus: 'verified',
      verifiedBy: 'Operations Head',
      verifiedDate: '2025-10-22 17:15'
    },
    {
      id: '3',
      shipmentNo: 'OB-2025-0542',
      trackingNumber: 'TRK-CHN-2025-4532',
      orderNo: 'SO-2025-1245',
      customer: 'Apex Engineering',
      deliveryAddress: 'Unit 12, Tech Park, Hyderabad, Telangana - 500081',
      deliveredDate: '2025-10-21',
      deliveredTime: '14:20',
      receiverName: 'Prakash Reddy',
      receiverSignature: 'Available',
      receiverPhone: '+91-98234-56789',
      deliveryAgent: 'Mohan Rao',
      agentId: 'DA-CHN-2018',
      items: 18,
      totalWeight: 625,
      vehicleNo: 'TN-01-EF-7890',
      podType: 'otp',
      images: ['otp_verification.jpg'],
      notes: 'OTP verified successfully. Quick delivery process.',
      condition: 'good',
      verificationStatus: 'verified',
      verifiedBy: 'Warehouse Manager',
      verifiedDate: '2025-10-21 15:00'
    },
    {
      id: '4',
      shipmentNo: 'OB-2025-0545',
      trackingNumber: 'TRK-CHN-2025-4535',
      orderNo: 'SO-2025-1248',
      customer: 'Metro Manufacturing',
      deliveryAddress: '23, Industrial Estate, Bangalore, Karnataka - 560045',
      deliveredDate: '2025-10-20',
      deliveredTime: '11:30',
      receiverName: 'Lakshmi Iyer',
      receiverSignature: 'Available',
      receiverPhone: '+91-97123-45678',
      deliveryAgent: 'Rajesh Kumar',
      agentId: 'DA-CHN-2003',
      items: 12,
      totalWeight: 450,
      vehicleNo: 'TN-01-AB-1234',
      podType: 'signature',
      images: ['delivery_complete.jpg', 'signed_invoice.jpg'],
      notes: 'Delivered to warehouse receiving dock. Invoice signed.',
      condition: 'good',
      verificationStatus: 'verified',
      verifiedBy: 'Senior Manager',
      verifiedDate: '2025-10-20 12:15'
    },
    {
      id: '5',
      shipmentNo: 'OB-2025-0548',
      trackingNumber: 'TRK-CHN-2025-4538',
      orderNo: 'SO-2025-1251',
      customer: 'Precision Tools Ltd',
      deliveryAddress: '56, Phase II, Noida, Uttar Pradesh - 201301',
      deliveredDate: '2025-10-19',
      deliveredTime: '13:45',
      receiverName: 'Amit Sharma',
      receiverSignature: 'Available',
      receiverPhone: '+91-96543-21098',
      deliveryAgent: 'Vikram Singh',
      agentId: 'DA-CHN-2012',
      items: 16,
      totalWeight: 520,
      vehicleNo: 'UP-16-CD-2345',
      podType: 'contactless',
      images: ['contactless_delivery.jpg', 'package_location.jpg'],
      notes: 'Left at designated location as per customer instructions.',
      condition: 'good',
      verificationStatus: 'verified',
      verifiedBy: 'QC Team',
      verifiedDate: '2025-10-19 14:30'
    },
    {
      id: '6',
      shipmentNo: 'OB-2025-0551',
      trackingNumber: 'TRK-CHN-2025-4541',
      orderNo: 'SO-2025-1254',
      customer: 'Central Distributors',
      deliveryAddress: '89, Market Road, Indore, Madhya Pradesh - 452001',
      deliveredDate: '2025-10-18',
      deliveredTime: '10:15',
      receiverName: 'Deepak Jain',
      receiverSignature: 'Available',
      receiverPhone: '+91-95432-10987',
      deliveryAgent: 'Sanjay Patel',
      agentId: 'DA-CHN-2027',
      items: 22,
      totalWeight: 780,
      vehicleNo: 'MP-09-GH-3456',
      podType: 'signature',
      images: ['delivery_receipt.jpg', 'unloading_process.jpg'],
      notes: 'Large shipment delivered. Customer assisted in unloading.',
      condition: 'good',
      verificationStatus: 'pending',
      verifiedBy: '',
      verifiedDate: ''
    },
    {
      id: '7',
      shipmentNo: 'OB-2025-0553',
      trackingNumber: 'TRK-CHN-2025-4543',
      orderNo: 'SO-2025-1256',
      customer: 'Tech Solutions Inc',
      deliveryAddress: '34, Sector 62, Gurgaon, Haryana - 122001',
      deliveredDate: '2025-10-17',
      deliveredTime: '16:50',
      receiverName: 'Priya Malhotra',
      receiverSignature: 'Available',
      receiverPhone: '+91-94321-87654',
      deliveryAgent: 'Harish Kumar',
      agentId: 'DA-CHN-2035',
      items: 9,
      totalWeight: 285,
      vehicleNo: 'HR-26-IJ-4567',
      podType: 'photo',
      images: ['damaged_box.jpg', 'condition_report.jpg'],
      notes: 'Minor damage to outer packaging. Contents verified intact.',
      condition: 'damaged',
      verificationStatus: 'disputed',
      verifiedBy: 'Claims Team',
      verifiedDate: '2025-10-18 09:30'
    },
    {
      id: '8',
      shipmentNo: 'OB-2025-0556',
      trackingNumber: 'TRK-CHN-2025-4546',
      orderNo: 'SO-2025-1259',
      customer: 'Eastern Electronics',
      deliveryAddress: '12, Park Street, Kolkata, West Bengal - 700016',
      deliveredDate: '2025-10-16',
      deliveredTime: '12:30',
      receiverName: 'Abhijit Sen',
      receiverSignature: 'Available',
      receiverPhone: '+91-93210-98765',
      deliveryAgent: 'Ravi Das',
      agentId: 'DA-CHN-2041',
      items: 15,
      totalWeight: 495,
      vehicleNo: 'WB-01-KL-5678',
      podType: 'otp',
      images: ['otp_screen.jpg', 'delivery_confirmation.jpg'],
      notes: 'Express delivery completed ahead of schedule.',
      condition: 'good',
      verificationStatus: 'verified',
      verifiedBy: 'Delivery Supervisor',
      verifiedDate: '2025-10-16 13:00'
    }
  ];

  const podStats = {
    total: podRecords.length,
    verified: podRecords.filter(p => p.verificationStatus === 'verified').length,
    pending: podRecords.filter(p => p.verificationStatus === 'pending').length,
    disputed: podRecords.filter(p => p.verificationStatus === 'disputed').length,
    signature: podRecords.filter(p => p.podType === 'signature').length,
    photo: podRecords.filter(p => p.podType === 'photo').length,
    otp: podRecords.filter(p => p.podType === 'otp').length,
    contactless: podRecords.filter(p => p.podType === 'contactless').length
  };

  const filteredPODs = podRecords.filter(pod => {
    const matchesSearch =
      pod.shipmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pod.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pod.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pod.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pod.orderNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || pod.verificationStatus === statusFilter;
    const matchesPODType = podTypeFilter === 'all' || pod.podType === podTypeFilter;

    return matchesSearch && matchesStatus && matchesPODType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'disputed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return 'bg-green-100 text-green-700 border-green-200';
      case 'damaged': return 'bg-red-100 text-red-700 border-red-200';
      case 'partial': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPODTypeColor = (type: string) => {
    switch (type) {
      case 'signature': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'photo': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'otp': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'contactless': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proof of Delivery (POD)</h1>
          <p className="text-sm text-gray-500 mt-1">Digital delivery confirmations and signatures</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{podStats.total}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Total PODs</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{podStats.verified}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Verified</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{podStats.pending}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Pending</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{podStats.disputed}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Disputed</p>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <User className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{podStats.signature}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Signature</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <ImageIcon className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{podStats.photo}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Photo</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{podStats.otp}</span>
          </div>
          <p className="text-xs font-medium opacity-90">OTP</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{podStats.contactless}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Contactless</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by shipment no, tracking number, customer, or receiver name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="disputed">Disputed</option>
            </select>

            <select
              value={podTypeFilter}
              onChange={(e) => setPodTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All POD Types</option>
              <option value="signature">Signature</option>
              <option value="photo">Photo</option>
              <option value="otp">OTP</option>
              <option value="contactless">Contactless</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>Showing {filteredPODs.length} of {podStats.total} POD records</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredPODs.map((pod) => (
          <div key={pod.id} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{pod.shipmentNo}</h3>
                <p className="text-sm text-gray-500 font-mono mt-0.5">{pod.trackingNumber}</p>
                <p className="text-sm text-blue-600 mt-0.5">{pod.orderNo}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(pod.verificationStatus)}`}>
                  {pod.verificationStatus === 'verified' && <CheckCircle className="w-3 h-3" />}
                  {pod.verificationStatus}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPODTypeColor(pod.podType)}`}>
                  {pod.podType.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-blue-600 font-medium mb-1">Customer & Receiver</p>
                    <p className="text-sm font-semibold text-blue-900">{pod.customer}</p>
                    <p className="text-xs text-blue-700 mt-1">Received by: {pod.receiverName}</p>
                    <p className="text-xs text-blue-600 mt-0.5">{pod.receiverPhone}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-green-600 font-medium mb-1">Delivery Address</p>
                    <p className="text-sm text-green-900">{pod.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-purple-600 font-medium mb-1">Delivered</p>
                      <p className="text-sm font-semibold text-purple-900">{pod.deliveredDate}</p>
                      <p className="text-xs text-purple-700 mt-0.5">{pod.deliveredTime}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-orange-600 font-medium mb-1">Condition</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getConditionColor(pod.condition)}`}>
                        {pod.condition}
                      </span>
                      <p className="text-xs text-orange-700 mt-1">{pod.items} items " {pod.totalWeight}kg</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Delivery Agent</p>
                  <p className="font-medium text-gray-900">{pod.deliveryAgent}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{pod.agentId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Vehicle Number</p>
                  <p className="font-medium text-gray-900 font-mono">{pod.vehicleNo}</p>
                </div>
              </div>
            </div>

            {pod.images.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 font-medium mb-2">Attached Images ({pod.images.length})</p>
                <div className="flex gap-2 flex-wrap">
                  {pod.images.map((img, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                      <ImageIcon className="w-3 h-3" />
                      {img}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {pod.notes && (
              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                <p className="text-xs text-gray-500 font-medium mb-1">Delivery Notes</p>
                <p className="text-sm text-gray-700">{pod.notes}</p>
              </div>
            )}

            {pod.verificationStatus === 'verified' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-600 font-medium">Verified by {pod.verifiedBy}</p>
                </div>
                <p className="text-xs text-green-700 ml-6">{pod.verifiedDate}</p>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPODs.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mb-2" />
          <p className="text-gray-500 text-lg mb-2">No POD records found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">POD Types Explained:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <span className="font-medium">Signature POD:</span>
            <span>Traditional paper/digital signature from receiver</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">Photo POD:</span>
            <span>Photographic evidence of delivery and package condition</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">OTP POD:</span>
            <span>One-time password verification via SMS/app</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">Contactless POD:</span>
            <span>Location-based delivery without physical contact</span>
          </div>
        </div>
      </div>
    </div>
  );
}
