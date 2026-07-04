'use client';

import React, { useState, useEffect } from 'react';
import { FinanceService } from '@/services/finance.service';
import {
  Users,
  Building,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Award
} from 'lucide-react';

interface Vendor {
  vendorId: string;
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  creditLimit: number;
  currentOutstanding: number;
  availableCredit: number;
  paymentTerms: string;
  averagePaymentDays: number;
  totalPurchases: number;
  onTimePaymentRate: number;
  riskRating: 'low' | 'medium' | 'high';
  vendorCategory: string;
  gstNumber: string;
  panNumber: string;
  bankAccount: string;
  ifscCode: string;
  preferredPaymentMethod: string;
  lastTransactionDate: string;
  accountManagerName: string;
  status: 'active' | 'inactive' | 'suspended';
  vendorSince: string;
}

export default function VendorManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Mock data
  const vendorStats = {
    totalVendors: 47,
    activeVendors: 42,
    totalCreditLimit: 35000000,
    totalOutstanding: 8750000,
    availableCredit: 26250000,
    highRiskVendors: 8
  };

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await FinanceService.getPayables();
        const risks = ['low', 'medium', 'high'];
        const statuses = ['active', 'inactive', 'suspended'];
        const mapped: Vendor[] = (Array.isArray(raw) ? raw : []).map((r: any) => {
          const creditLimit = Number(r.creditLimit ?? 0);
          const outstanding = Number(r.totalOutstanding ?? 0);
          const risk = String(r.riskRating ?? '').toLowerCase();
          const status = String(r.accountStatus ?? 'active').toLowerCase();
          const contact = r.vendorContact ?? {};
          return {
            vendorId: r.vendorId ?? r.id ?? '',
            vendorName: r.vendorName ?? '',
            contactPerson: contact.contactPerson ?? r.contactPerson ?? '',
            email: contact.email ?? r.email ?? '',
            phone: contact.phone ?? r.phone ?? '',
            address: contact.address ?? '',
            city: contact.city ?? '',
            state: contact.state ?? '',
            country: contact.country ?? '',
            creditLimit,
            currentOutstanding: outstanding,
            availableCredit: creditLimit - outstanding,
            paymentTerms: r.paymentTerms ?? '',
            averagePaymentDays: Number(r.creditPeriod ?? 0),
            totalPurchases: Number(r.totalPurchases ?? 0),
            onTimePaymentRate: Number(r.onTimePaymentRate ?? 0),
            riskRating: (risks.includes(risk) ? risk : 'low') as Vendor['riskRating'],
            vendorCategory: r.vendorCategory ?? '',
            gstNumber: r.gstNumber ?? '',
            panNumber: r.panNumber ?? '',
            bankAccount: r.bankAccount ?? '',
            ifscCode: r.ifscCode ?? '',
            preferredPaymentMethod: r.preferredPaymentMethod ?? '',
            lastTransactionDate: r.lastPaymentDate ? String(r.lastPaymentDate).slice(0, 10) : '',
            accountManagerName: r.accountManagerName ?? '',
            status: (statuses.includes(status) ? status : 'active') as Vendor['status'],
            vendorSince: r.vendorSince ? String(r.vendorSince).slice(0, 10) : '',
          };
        });
        if (!cancelled) setVendors(mapped);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load vendors');
          setVendors([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);


  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCreditUtilization = (outstanding: number, limit: number) => {
    return ((outstanding / limit) * 100).toFixed(1);
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.vendorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || vendor.vendorCategory === selectedCategory;
    const matchesRisk = selectedRisk === 'all' || vendor.riskRating === selectedRisk;
    const matchesStatus = selectedStatus === 'all' || vendor.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesRisk && matchesStatus;
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full h-full px-3 py-2">
          {isLoading && (
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading vendors…</div>
          )}
          {loadError && !isLoading && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>
          )}
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-6 w-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
              </div>
              <p className="text-sm text-gray-600">Manage vendor relationships and credit terms</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${showFilters ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus className="h-4 w-4" />
                <span>Add Vendor</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <Building className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{vendorStats.totalVendors}</p>
              <p className="text-xs text-green-600 mt-1">{vendorStats.activeVendors} active</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-700">Credit Limit</p>
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">₹{(vendorStats.totalCreditLimit / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-blue-600 mt-1">Total approved</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-yellow-700">Outstanding</p>
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-900">₹{(vendorStats.totalOutstanding / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-yellow-600 mt-1">{((vendorStats.totalOutstanding / vendorStats.totalCreditLimit) * 100).toFixed(1)}% utilized</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-red-700">High Risk</p>
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-900">{vendorStats.highRiskVendors}</p>
              <p className="text-xs text-red-600 mt-1">Vendors need attention</p>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Construction">Construction</option>
                  <option value="Services">Services</option>
                </select>

                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          )}

          {/* Vendor Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {filteredVendors.map((vendor) => (
              <div key={vendor.vendorId} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                  {/* Vendor Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{vendor.vendorName}</h3>
                        <p className="text-sm text-gray-500">{vendor.vendorId}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                        {vendor.status.toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(vendor.riskRating)}`}>
                        {vendor.riskRating.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Credit Information */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Credit Utilization</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{(vendor.currentOutstanding / 1000).toFixed(0)}K / ₹{(vendor.creditLimit / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${parseFloat(getCreditUtilization(vendor.currentOutstanding, vendor.creditLimit)) > 80
                            ? 'bg-red-500'
                            : parseFloat(getCreditUtilization(vendor.currentOutstanding, vendor.creditLimit)) > 60
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                        style={{ width: `${getCreditUtilization(vendor.currentOutstanding, vendor.creditLimit)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {getCreditUtilization(vendor.currentOutstanding, vendor.creditLimit)}% utilized
                      </span>
                      <span className="text-xs text-green-600">
                        ₹{(vendor.availableCredit / 1000).toFixed(0)}K available
                      </span>
                    </div>
                  </div>

                  {/* Vendor Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-2 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Payment Terms
                      </p>
                      <p className="font-medium text-gray-900">{vendor.paymentTerms}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Avg. Payment Days
                      </p>
                      <p className="font-medium text-gray-900">{vendor.averagePaymentDays} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1 flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        On-Time Rate
                      </p>
                      <p className="font-medium text-gray-900">{vendor.onTimePaymentRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Total Purchases
                      </p>
                      <p className="font-medium text-gray-900">₹{(vendor.totalPurchases / 1000).toFixed(0)}K</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="border-t border-gray-200 pt-3 mb-3">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{vendor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{vendor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{vendor.city}, {vendor.state}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedVendor(vendor)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vendor Details Modal */}
          {selectedVendor && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
              <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedVendor.vendorName}</h2>
                      <p className="text-sm text-gray-500">{selectedVendor.vendorId}</p>
                    </div>
                    <button
                      onClick={() => setSelectedVendor(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Status & Risk */}
                    <div className="flex gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedVendor.status)}`}>
                        {selectedVendor.status.toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(selectedVendor.riskRating)}`}>
                        {selectedVendor.riskRating.toUpperCase()} RISK
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600">
                        {selectedVendor.vendorCategory}
                      </span>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Contact Person</p>
                          <p className="font-medium text-gray-900">{selectedVendor.contactPerson}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Email</p>
                          <p className="font-medium text-gray-900">{selectedVendor.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Phone</p>
                          <p className="font-medium text-gray-900">{selectedVendor.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Account Manager</p>
                          <p className="font-medium text-gray-900">{selectedVendor.accountManagerName}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500 mb-1">Address</p>
                          <p className="font-medium text-gray-900">
                            {selectedVendor.address}, {selectedVendor.city}, {selectedVendor.state} - {selectedVendor.country}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Information</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Credit Limit</p>
                          <p className="font-medium text-gray-900">₹{(selectedVendor.creditLimit / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Current Outstanding</p>
                          <p className="font-medium text-gray-900">₹{(selectedVendor.currentOutstanding / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Available Credit</p>
                          <p className="font-medium text-green-600">₹{(selectedVendor.availableCredit / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Total Purchases</p>
                          <p className="font-medium text-gray-900">₹{(selectedVendor.totalPurchases / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Payment Terms</p>
                          <p className="font-medium text-gray-900">{selectedVendor.paymentTerms}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Preferred Payment Method</p>
                          <p className="font-medium text-gray-900">{selectedVendor.preferredPaymentMethod}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bank & Tax Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Bank & Tax Information</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">GST Number</p>
                          <p className="font-medium text-gray-900">{selectedVendor.gstNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">PAN Number</p>
                          <p className="font-medium text-gray-900">{selectedVendor.panNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Bank Account</p>
                          <p className="font-medium text-gray-900">{selectedVendor.bankAccount}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">IFSC Code</p>
                          <p className="font-medium text-gray-900">{selectedVendor.ifscCode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Metrics</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Average Payment Days</p>
                          <p className="font-medium text-gray-900">{selectedVendor.averagePaymentDays} days</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">On-Time Payment Rate</p>
                          <p className="font-medium text-green-600">{selectedVendor.onTimePaymentRate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Last Transaction</p>
                          <p className="font-medium text-gray-900">{selectedVendor.lastTransactionDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Vendor Since</p>
                          <p className="font-medium text-gray-900">{selectedVendor.vendorSince}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
