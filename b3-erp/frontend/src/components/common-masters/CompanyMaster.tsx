'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  Building2, Plus, Search, Filter, Edit3, Eye, Trash2, Upload,
  Download, Copy, MoreVertical, MapPin, Phone, Mail, Globe,
  Calendar, Users, Package, DollarSign, FileText, CheckCircle,
  XCircle, AlertCircle, Settings, Save, X, Check
} from 'lucide-react';

// Interface matching the structure used in the UI
// Mapped from Backend Entity: Company
interface Company {
  id: string;
  code: string;
  name: string;
  shortName: string;
  type: 'holding' | 'subsidiary' | 'branch' | 'division';
  parentCompany?: string;
  status: 'active' | 'inactive' | 'suspended';
  incorporationDate: string;
  registrationNumber: string;
  taxId: string;
  address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    fax?: string;
  };
  financial: {
    baseCurrency: string;
    fiscalYearStart: string;
    reportingCurrency?: string;
  };
  legal: {
    legalName: string;
    businessType: string;
    industry: string;
    licenses: string[];
  };
}

const CompanyMaster: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // API Base URL (NEXT_PUBLIC_API_URL already includes the /api/v1 prefix)
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/companies`;

  // Mock Data
  const MOCK_COMPANIES: Company[] = [
    {
      id: '1',
      code: 'OPT-HQ',
      name: 'OptiForge Industries HQ',
      shortName: 'OptiForge HQ',
      type: 'holding',
      status: 'active',
      incorporationDate: '2010-01-15',
      registrationNumber: 'CIN-88229-X',
      taxId: 'TAX-US-9920',
      address: {
        line1: '1200 Manufacturing Blvd',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        postalCode: '78701'
      },
      contact: {
        phone: '+1-512-555-0100',
        email: 'info@optiforge.com',
        website: 'www.optiforge.com'
      },
      financial: {
        baseCurrency: 'USD',
        fiscalYearStart: '01-01'
      },
      legal: {
        legalName: 'OptiForge Industries Inc.',
        businessType: 'Corporation',
        industry: 'Industrial Manufacturing',
        licenses: ['ISO-9001', 'OSHA-Certified']
      }
    },
    {
      id: '2',
      code: 'OPT-EU',
      name: 'OptiForge Europe GmbH',
      shortName: 'OptiForge EU',
      type: 'subsidiary',
      status: 'active',
      incorporationDate: '2015-06-20',
      registrationNumber: 'HRB-20239',
      taxId: 'DE-8829910',
      address: {
        line1: 'Industriestraße 45',
        city: 'Stuttgart',
        country: 'Germany',
        postalCode: '70173'
      },
      contact: {
        phone: '+49-711-555-0922',
        email: 'eu-sales@optiforge.com'
      },
      financial: {
        baseCurrency: 'EUR',
        fiscalYearStart: '01-01'
      },
      legal: {
        legalName: 'OptiForge Europe GmbH',
        businessType: 'GmbH',
        industry: 'Manufacturing',
        licenses: ['CE-Marking']
      }
    },
    {
      id: '3',
      code: 'OPT-ASIA',
      name: 'OptiForge Asia Pacific Pte Ltd',
      shortName: 'OptiForge APAC',
      type: 'subsidiary',
      status: 'active',
      incorporationDate: '2018-03-10',
      registrationNumber: 'UEN-2018299X',
      taxId: 'SG-299201',
      address: {
        line1: '88 Market Street',
        city: 'Singapore',
        country: 'Singapore',
        postalCode: '048948'
      },
      contact: {
        phone: '+65-6555-0192',
        email: 'apac@optiforge.com'
      },
      financial: {
        baseCurrency: 'SGD',
        fiscalYearStart: '04-01'
      },
      legal: {
        legalName: 'OptiForge Asia Pacific Pte Ltd',
        businessType: 'Private Limited',
        industry: 'Logistics',
        licenses: []
      }
    }
  ];

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);

      // Adapt backend entity to frontend interface
      const adaptedCompanies: Company[] = response.data.map((c: any) => ({
        id: c.id,
        code: c.registrationNumber || 'N/A', // Using Reg No as Code
        name: c.name,
        shortName: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
        type: c.isEliminationEntity ? 'holding' : 'subsidiary',
        status: c.isActive ? 'active' : 'inactive',
        incorporationDate: c.fiscalYearStart,
        registrationNumber: c.registrationNumber,
        taxId: c.taxId,
        address: {
          line1: c.address,
          city: '', // Single string in backend, mapping limitation
          country: ''
        },
        contact: {
          phone: c.phone,
          email: c.email
        },
        financial: {
          baseCurrency: c.baseCurrency,
          fiscalYearStart: c.fiscalYearStart
        },
        legal: {
          legalName: c.name,
          businessType: 'Corporation', // Default
          industry: 'Manufacturing', // Default
          licenses: []
        }
      }));

      setCompanies(adaptedCompanies);
      setFilteredCompanies(adaptedCompanies);
    } catch (error) {
      console.warn('Failed to fetch companies from API, using mock data:', error);
      // Fallback to mock data
      setCompanies(MOCK_COMPANIES);
      setFilteredCompanies(MOCK_COMPANIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    let filtered = companies;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.shortName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(company => company.status === filterStatus);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(company => company.type === filterType);
    }

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, filterStatus, filterType]);

  const handleCreateCompany = () => {
    setSelectedCompany(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/${companyId}`);
        fetchCompanies();
      } catch (error) {
        console.error('Failed to delete company:', error);
        alert('Failed to delete company');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <XCircle className="h-4 w-4" />;
      case 'suspended': return <AlertCircle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'holding': return 'bg-purple-100 text-purple-800';
      case 'subsidiary': return 'bg-blue-100 text-blue-800';
      case 'branch': return 'bg-green-100 text-green-800';
      case 'division': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const CompanyModal = () => {
    const [formData, setFormData] = useState<Partial<Company>>(
      selectedCompany || {
        code: '',
        name: '',
        shortName: '',
        type: 'subsidiary',
        status: 'active',
        incorporationDate: '',
        registrationNumber: '',
        taxId: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          state: '',
          country: '',
          postalCode: ''
        },
        contact: {
          phone: '',
          email: '',
          website: '',
          fax: ''
        },
        financial: {
          baseCurrency: 'USD',
          fiscalYearStart: '01-01',
          reportingCurrency: ''
        },
        legal: {
          legalName: '',
          businessType: '',
          industry: '',
          licenses: []
        }
      }
    );

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const payload = {
          name: formData.name,
          taxId: formData.taxId,
          registrationNumber: formData.registrationNumber,
          baseCurrency: formData.financial?.baseCurrency || 'USD',
          fiscalYearStart: formData.incorporationDate ? new Date(formData.incorporationDate) : new Date(),
          address: `${formData.address?.line1 || ''} ${formData.address?.city || ''}`,
          email: formData.contact?.email,
          phone: formData.contact?.phone,
          isActive: formData.status === 'active',
        };

        if (modalMode === 'create') {
          await axios.post(API_URL, payload);
        } else if (modalMode === 'edit' && selectedCompany) {
          await axios.put(`${API_URL}/${selectedCompany.id}`, payload);
        }
        setIsModalOpen(false);
        fetchCompanies();
      } catch (error) {
        console.error('Failed to save company:', error);
        alert('Failed to save company');
      }
    };

    const isViewMode = modalMode === 'view';

    if (!mounted) return null;

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
          <div className="flex justify-between items-center p-3 border-b sticky top-0 bg-white z-10">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {modalMode === 'create' ? 'Create Company' : modalMode === 'edit' ? 'Edit Company' : 'Company Details'}
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-3">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Company Code (Reg No) *</label>
                <input
                  type="text"
                  value={formData.registrationNumber || ''}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., KAI"
                  disabled={isViewMode}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company Type *</label>
                <select
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Company['type'] })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isViewMode}
                  required
                >
                  <option value="holding">Holding Company</option>
                  <option value="subsidiary">Subsidiary</option>
                  <option value="branch">Branch Office</option>
                  <option value="division">Division</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Full company name"
                  disabled={isViewMode}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Short Name *</label>
                <input
                  type="text"
                  value={formData.shortName || ''}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Short name"
                  disabled={isViewMode}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Company['status'] })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isViewMode}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Incorporation Date</label>
                <input
                  type="date"
                  value={formData.incorporationDate ? new Date(formData.incorporationDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, incorporationDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isViewMode}
                />
              </div>
            </div>

            {/* Registration Details */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Registration Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Registration Number</label>
                  <input
                    type="text"
                    value={formData.registrationNumber || ''}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tax ID</label>
                  <input
                    type="text"
                    value={formData.taxId || ''}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Address Information</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={formData.address?.line1 || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, line1: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={formData.address?.line2 || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, line2: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={formData.address?.city || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      value={formData.address?.state || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.address?.country || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, country: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={formData.address?.postalCode || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, postalCode: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.contact?.phone || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, phone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.contact?.email || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.contact?.website || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, website: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fax</label>
                  <input
                    type="tel"
                    value={formData.contact?.fax || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, fax: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white p-3 z-10 border-t">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {isViewMode ? 'Close' : 'Cancel'}
              </button>
              {!isViewMode && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {modalMode === 'create' ? 'Create Company' : 'Update Company'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };



  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Master</h1>
          <p className="text-gray-500 text-sm">Manage your organization structure and legal entities</p>
        </div>
        <div className="flex gap-3">
          <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-600">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={handleCreateCompany}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3 mb-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center border rounded-lg px-3 py-2 flex-1 min-w-64">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search companies..."
              className="outline-none flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border rounded-lg"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            className="px-3 py-2 border rounded-lg"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="holding">Holding Company</option>
            <option value="subsidiary">Subsidiary</option>
            <option value="branch">Branch Office</option>
            <option value="division">Division</option>
          </select>
          <button className="px-3 py-2 border rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-500">Loading companies...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{company.shortName}</h3>
                      <p className="text-sm text-gray-600">{company.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(company.status)}`}>
                      {getStatusIcon(company.status)}
                      {company.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-2">
                  <p className="font-medium">{company.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(company.type)}`}>
                      {company.type}
                    </span>
                    {company.parentCompany && (
                      <span className="text-xs">Parent: {company.parentCompany}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{company.address.city}, {company.address.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{company.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>{company.financial.baseCurrency}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewCompany(company)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditCompany(company)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                      title="Edit Company"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete Company"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <button className="p-2 text-gray-600 hover:text-gray-800 rounded">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredCompanies.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-500 mb-2">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first company'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
              <button
                onClick={handleCreateCompany}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Company
              </button>
            )}
          </div>
        </div>
      )}

      {isModalOpen && <CompanyModal />}
    </div>
  );
};

export default CompanyMaster;