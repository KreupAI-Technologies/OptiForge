'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2, Plus, Search, Filter, Edit2, Trash2, MoreVertical,
  MapPin, Phone, Mail, Globe, Users, Calendar, Clock,
  TrendingUp, AlertTriangle, CheckCircle2, XCircle, AlertCircle,
  DollarSign, Shield, FileText, Package, Truck, CreditCard
} from 'lucide-react';
import { commonMastersService } from '@/services/common-masters.service';

interface Branch {
  id: string;
  code: string;
  name: string;
  type: 'Head Office' | 'Branch' | 'Regional Office' | 'Sales Office' | 'Service Center';
  companyId: string;
  companyName: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    landmark?: string;
  };
  contact: {
    phone: string;
    altPhone?: string;
    fax?: string;
    email: string;
    website?: string;
  };
  registration: {
    gstNo?: string;
    panNo?: string;
    tanNo?: string;
    cinNo?: string;
    licenseNo?: string;
    registrationNo?: string;
  };
  banking: {
    bankName: string;
    accountNo: string;
    accountName: string;
    ifscCode: string;
    swiftCode?: string;
    branchAddress?: string;
  };
  operational: {
    branchManager: string;
    employees: number;
    departments: string[];
    costCenter?: string;
    profitCenter?: string;
    businessSegment?: string;
  };
  accounting: {
    currency: string;
    fiscalYear: string;
    taxRegion: string;
    chartOfAccounts: string;
    cashAccount?: string;
    bankAccount?: string;
  };
  settings: {
    inventoryEnabled: boolean;
    salesEnabled: boolean;
    purchaseEnabled: boolean;
    manufacturingEnabled: boolean;
    serviceEnabled: boolean;
    warehouseLinked?: string;
  };
  performance: {
    revenue?: number;
    expenses?: number;
    profit?: number;
    targetRevenue?: number;
    employeeProductivity?: number;
  };
  status: 'Active' | 'Inactive' | 'Under Setup' | 'Closed';
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  };
}

export default function BranchMaster() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentTab, setCurrentTab] = useState('basic');

  const loadBranches = async () => {
    try {
      const data = await commonMastersService.getAllBranches();
      const mapped: Branch[] = data.map((b) => ({
        id: b.id,
        code: '',
        name: b.name,
        type: 'Branch',
        companyId: b.companyId,
        companyName: '',
        address: {
          line1: b.address || '',
          city: b.city?.name || '',
          state: '',
          country: '',
          pincode: '',
        },
        contact: {
          phone: '',
          email: '',
        },
        registration: {},
        banking: {
          bankName: '',
          accountNo: '',
          accountName: '',
          ifscCode: '',
        },
        operational: {
          branchManager: '',
          employees: 0,
          departments: [],
        },
        accounting: {
          currency: 'INR',
          fiscalYear: 'April-March',
          taxRegion: '',
          chartOfAccounts: '',
        },
        settings: {
          inventoryEnabled: false,
          salesEnabled: false,
          purchaseEnabled: false,
          manufacturingEnabled: false,
          serviceEnabled: false,
        },
        performance: {},
        status: b.isActive ? 'Active' : 'Inactive',
        metadata: {
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt),
          createdBy: '',
          updatedBy: '',
        },
      }));
      setBranches(mapped);
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
    setCurrentTab('basic');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      try {
        await commonMastersService.deleteBranch(id);
        await loadBranches();
      } catch (error) {
        console.error('Failed to delete branch:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Under Setup': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
      'Closed': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
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

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'Head Office': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'Branch': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Regional Office': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      'Sales Office': { bg: 'bg-green-100', text: 'text-green-800' },
      'Service Center': { bg: 'bg-orange-100', text: 'text-orange-800' }
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {type}
      </span>
    );
  };

  const filteredBranches = useMemo(() => {
    return branches.filter(branch => {
      const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           branch.address.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || branch.type === filterType;
      const matchesStatus = filterStatus === 'All' || branch.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [branches, searchTerm, filterType, filterStatus]);

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2">Branch Master</h2>
        <p className="text-gray-600">Manage branch offices and operational locations</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search branches..."
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
                <option value="Head Office">Head Office</option>
                <option value="Branch">Branch</option>
                <option value="Regional Office">Regional Office</option>
                <option value="Sales Office">Sales Office</option>
                <option value="Service Center">Service Center</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Under Setup">Under Setup</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSelectedBranch(null);
                setIsModalOpen(true);
                setCurrentTab('basic');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Branch
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Company
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operations
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
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
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{branch.name}</div>
                      <div className="text-sm text-gray-500">{branch.code}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      {getTypeBadge(branch.type)}
                      <div className="text-xs text-gray-600">{branch.companyName}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{branch.address.city}, {branch.address.state}</span>
                      </div>
                      <div className="text-xs text-gray-500">{branch.address.country}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-xs">{branch.contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{branch.contact.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span>{branch.operational.employees} employees</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Manager: {branch.operational.branchManager}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {branch.performance?.revenue && (
                      <div className="text-sm">
                        <div className="font-medium">
                          ₹{(branch.performance.revenue / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-xs text-gray-500">
                          Profit: {branch.performance.profit &&
                            ((branch.performance.profit / branch.performance.revenue) * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {getStatusBadge(branch.status)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(branch)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
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
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {selectedBranch ? 'Edit Branch' : 'Add New Branch'}
              </h3>
            </div>

            <div className="flex border-b border-gray-200">
              {['basic', 'address', 'registration', 'banking', 'operational', 'accounting', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-4 py-2 font-medium capitalize ${
                    currentTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'basic' ? 'Basic Info' : tab}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {currentTab === 'basic' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch Code *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.code}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="BR-XXX-000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch Name *
                      </label>
                      <input
                        id="branch-name-input"
                        type="text"
                        defaultValue={selectedBranch?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter branch name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch Type *
                      </label>
                      <select defaultValue={selectedBranch?.type || 'Branch'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="Head Office">Head Office</option>
                        <option value="Branch">Branch</option>
                        <option value="Regional Office">Regional Office</option>
                        <option value="Sales Office">Sales Office</option>
                        <option value="Service Center">Service Center</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company *
                      </label>
                      <select defaultValue={selectedBranch?.companyId}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="1">TechCorp Industries Ltd</option>
                        <option value="2">Global Manufacturing Inc</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.contact.phone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+91-xx-xxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        defaultValue={selectedBranch?.contact.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="branch@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select defaultValue={selectedBranch?.status || 'Active'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Under Setup">Under Setup</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              )}

              {currentTab === 'address' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      id="branch-address-input"
                      type="text"
                      defaultValue={selectedBranch?.address.line1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedBranch?.address.line2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.address.city}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.address.state}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.address.country}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PIN/ZIP Code *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.address.pincode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Landmark
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedBranch?.address.landmark}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {currentTab === 'registration' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Number
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.registration.gstNo}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.registration.panNo}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TAN Number
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.registration.tanNo}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CIN Number
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.registration.cinNo}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Number
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.registration.licenseNo}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.registration.registrationNo}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'banking' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.banking.bankName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.banking.accountNo}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedBranch?.banking.accountName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IFSC Code *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.banking.ifscCode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SWIFT Code
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.banking.swiftCode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Branch Address
                    </label>
                    <textarea
                      defaultValue={selectedBranch?.banking.branchAddress}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {currentTab === 'operational' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch Manager *
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.operational.branchManager}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Employees
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedBranch?.operational.employees}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departments
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Admin', 'Finance', 'HR', 'IT', 'Operations', 'Sales', 'Service', 'Production'].map(dept => (
                        <label key={dept} className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={selectedBranch?.operational.departments?.includes(dept)}
                            className="mr-2"
                          />
                          <span className="text-sm">{dept}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost Center
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.operational.costCenter}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profit Center
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.operational.profitCenter}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Segment
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedBranch?.operational.businessSegment}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {currentTab === 'accounting' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency *
                      </label>
                      <select defaultValue={selectedBranch?.accounting.currency || 'INR'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fiscal Year *
                      </label>
                      <select defaultValue={selectedBranch?.accounting.fiscalYear || 'April-March'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="April-March">April - March</option>
                        <option value="January-December">January - December</option>
                        <option value="July-June">July - June</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Region
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.accounting.taxRegion}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chart of Accounts
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.accounting.chartOfAccounts}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cash Account
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.accounting.cashAccount}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Account
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBranch?.accounting.bankAccount}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'settings' && (
                <div className="space-y-2">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedBranch?.settings.inventoryEnabled}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Inventory Management Enabled
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedBranch?.settings.salesEnabled}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Sales Module Enabled
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedBranch?.settings.purchaseEnabled}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Purchase Module Enabled
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedBranch?.settings.manufacturingEnabled}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Manufacturing Module Enabled
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedBranch?.settings.serviceEnabled}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Service Module Enabled
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Linked Warehouse
                    </label>
                    <select defaultValue={selectedBranch?.settings.warehouseLinked}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">None</option>
                      <option value="WH-001">Main Warehouse</option>
                      <option value="WH-002">Secondary Warehouse</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const nameEl = document.getElementById('branch-name-input') as HTMLInputElement | null;
                  const addressEl = document.getElementById('branch-address-input') as HTMLInputElement | null;
                  const name = nameEl?.value?.trim() || '';
                  const address = addressEl?.value?.trim() || '';
                  try {
                    if (selectedBranch) {
                      await commonMastersService.updateBranch(selectedBranch.id, { name, address });
                    } else {
                      await commonMastersService.createBranch({
                        name,
                        companyId: 'default-company-id',
                        address,
                      });
                    }
                    setIsModalOpen(false);
                    await loadBranches();
                  } catch (error) {
                    console.error('Failed to save branch:', error);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {selectedBranch ? 'Update' : 'Create'} Branch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}