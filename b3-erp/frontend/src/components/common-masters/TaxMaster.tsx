'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calculator, Percent, FileText, Globe, TrendingUp, Download, Upload, Grid, List } from 'lucide-react';
import { commonMastersService, Tax } from '@/services/common-masters.service';

const taxTypes = ['sales', 'purchase', 'service', 'vat', 'gst', 'excise', 'custom', 'withholding'];
const rateTypes = ['percentage', 'fixed'];
const calculationMethods = ['exclusive', 'inclusive'];
const roundingMethods = ['round', 'round_up', 'round_down'];
const filingFrequencies = ['monthly', 'quarterly', 'yearly', 'none'];
const territories = ['All States', 'Inter-State', 'Local', 'International'];
const customerTypes = ['B2B', 'B2C', 'Government', 'Export'];

export default function TaxMaster() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const data = await commonMastersService.getAllTaxes();
      setTaxes(data);
    } catch (error) {
      console.error('Failed to fetch taxes:', error);
    } finally {
      setLoading(false);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState('basic');

  const filteredTaxes = taxes.filter(tax => {
    const matchesSearch = tax.taxName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tax.taxCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tax.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tax.taxType === filterType;
    const matchesStatus = filterStatus === 'all' || tax.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddTax = () => {
    setEditingTax(null);
    setShowModal(true);
    setActiveTab('basic');
  };

  const handleEditTax = (tax: Tax) => {
    setEditingTax(tax);
    setShowModal(true);
    setActiveTab('basic');
  };

  const handleDeleteTax = (id: string) => {
    if (confirm('Are you sure you want to delete this tax?')) {
      setTaxes(taxes.filter(tax => tax.id !== id));
    }
  };

  const handleSaveTax = (taxData: any) => {
    if (editingTax) {
      setTaxes(taxes.map(tax =>
        tax.id === editingTax.id
          ? { ...tax, ...taxData, updatedAt: new Date().toISOString().split('T')[0] }
          : tax
      ));
    } else {
      const newTax: Tax = {
        id: Date.now().toString(),
        ...taxData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setTaxes([...taxes, newTax]);
    }
    setShowModal(false);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      sales: 'bg-blue-100 text-blue-800',
      purchase: 'bg-purple-100 text-purple-800',
      service: 'bg-yellow-100 text-yellow-800',
      vat: 'bg-indigo-100 text-indigo-800',
      gst: 'bg-green-100 text-green-800',
      excise: 'bg-orange-100 text-orange-800',
      custom: 'bg-pink-100 text-pink-800',
      withholding: 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-8 h-8 text-blue-600" />
              Tax Master
            </h1>
            <p className="text-gray-600">Manage tax configurations and compliance</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleAddTax}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Tax
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search taxes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            {taxTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate & Components</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicability</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statistics</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTaxes.map((tax) => (
                  <tr key={tax.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tax.taxName}</div>
                        <div className="text-sm text-gray-500">{tax.taxCode}</div>
                        <span className={getTypeBadge(tax.taxType)}>
                          {tax.taxType}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {tax.rate}{tax.rateType === 'percentage' ? '%' : ' Fixed'}
                      </div>
                      {tax.taxComponents.map((comp: any, idx: number) => (
                        <div key={idx} className="text-xs text-gray-500">
                          {comp.componentName}: {comp.rate}%
                        </div>
                      ))}
                      <div className="text-xs text-gray-500">
                        {tax.calculation.method}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tax.applicability.applicableOn}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tax.applicability.territory.join(', ')}
                      </div>
                      {tax.validity.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {tax.compliance.reportingRequired && (
                        <div className="text-sm text-gray-900">
                          Filing: {tax.compliance.filingFrequency}
                        </div>
                      )}
                      {tax.compliance.taxRegistrationNumber && (
                        <div className="text-xs text-gray-500">
                          {tax.compliance.taxRegistrationNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tax.statistics.totalTransactions} txns
                      </div>
                      <div className="text-sm text-gray-500">
                        Collected: {formatCurrency(tax.statistics.totalTaxCollected)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Paid: {formatCurrency(tax.statistics.totalTaxPaid)}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={getStatusBadge(tax.status)}>
                        {tax.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditTax(tax)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Edit</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Eye className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTax(tax.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTaxes.map((tax) => (
            <div key={tax.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{tax.taxName}</h3>
                  <p className="text-sm text-gray-500">{tax.taxCode}</p>
                  <span className={getTypeBadge(tax.taxType)}>
                    {tax.taxType}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditTax(tax)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTax(tax.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 mb-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Rate:</span>
                  <span className="font-medium">
                    {tax.rate}{tax.rateType === 'percentage' ? '%' : ' Fixed'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium">{tax.calculation.method}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Territory:</span>
                  <span className="font-medium">{tax.applicability.territory[0]}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Transactions:</span>
                  <span className="font-medium">{tax.statistics.totalTransactions}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={getStatusBadge(tax.status)}>
                  {tax.status}
                </span>
                {tax.validity.isDefault && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Default
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TaxModal
          tax={editingTax}
          onSave={handleSaveTax}
          onClose={() => setShowModal(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}

interface TaxModalProps {
  tax: Tax | null;
  onSave: (tax: any) => void;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function TaxModal({ tax, onSave, onClose, activeTab, setActiveTab }: TaxModalProps) {
  const [formData, setFormData] = useState({
    taxCode: tax?.taxCode || '',
    taxName: tax?.taxName || '',
    taxType: tax?.taxType || 'gst',
    status: tax?.status || 'active',
    description: tax?.description || '',
    rate: tax?.rate || 0,
    rateType: tax?.rateType || 'percentage',
    taxComponents: tax?.taxComponents || [],
    applicability: tax?.applicability || {
      applicableOn: 'both',
      territory: [],
      customerType: [],
      itemCategory: [],
      minAmount: 0,
      maxAmount: undefined
    },
    calculation: tax?.calculation || {
      method: 'exclusive',
      roundingMethod: 'round',
      decimalPlaces: 2,
      taxOnTax: false,
      sequence: 1
    },
    compliance: tax?.compliance || {
      taxRegistrationNumber: '',
      hsnCode: '',
      sacCode: '',
      reportingRequired: false,
      filingFrequency: 'none'
    },
    validity: tax?.validity || {
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
      isDefault: false
    },
    accounting: tax?.accounting || {
      salesTaxAccount: '',
      purchaseTaxAccount: '',
      taxPayableAccount: '',
      taxReceivableAccount: ''
    },
    statistics: tax?.statistics || {
      totalTransactions: 0,
      totalTaxCollected: 0,
      totalTaxPaid: 0,
      lastApplied: new Date().toISOString().split('T')[0]
    }
  });

  const [newComponent, setNewComponent] = useState({ componentName: '', rate: 0, account: '' });

  const handleAddComponent = () => {
    if (newComponent.componentName && newComponent.rate > 0) {
      setFormData({
        ...formData,
        taxComponents: [...formData.taxComponents, newComponent]
      });
      setNewComponent({ componentName: '', rate: 0, account: '' });
    }
  };

  const handleRemoveComponent = (index: number) => {
    setFormData({
      ...formData,
      taxComponents: formData.taxComponents.filter((_: any, i: number) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Calculator },
    { id: 'components', label: 'Tax Components', icon: Percent },
    { id: 'applicability', label: 'Applicability', icon: Globe },
    { id: 'calculation', label: 'Calculation', icon: TrendingUp },
    { id: 'compliance', label: 'Compliance', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {tax ? 'Edit Tax' : 'Add New Tax'}
          </h2>
        </div>

        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-96">
          <div className="px-3 py-2">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Code</label>
                  <input
                    type="text"
                    value={formData.taxCode}
                    onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Name</label>
                  <input
                    type="text"
                    value={formData.taxName}
                    onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Type</label>
                  <select
                    value={formData.taxType}
                    onChange={(e) => setFormData({ ...formData, taxType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {taxTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate Type</label>
                  <select
                    value={formData.rateType}
                    onChange={(e) => setFormData({ ...formData, rateType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {rateTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effective From</label>
                  <input
                    type="date"
                    value={formData.validity.effectiveFrom}
                    onChange={(e) => setFormData({ ...formData, validity: { ...formData.validity, effectiveFrom: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effective To</label>
                  <input
                    type="date"
                    value={formData.validity.effectiveTo}
                    onChange={(e) => setFormData({ ...formData, validity: { ...formData.validity, effectiveTo: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.validity.isDefault}
                      onChange={(e) => setFormData({ ...formData, validity: { ...formData.validity, isDefault: e.target.checked } })}
                      className="mr-2"
                    />
                    Set as Default Tax
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'components' && (
              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tax Components</h3>
                  <div className="space-y-2 mb-2">
                    {formData.taxComponents.map((component: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1">{component.componentName}</span>
                        <span>{component.rate}%</span>
                        <span className="text-sm text-gray-500">{component.account}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Component Name"
                    value={newComponent.componentName}
                    onChange={(e) => setNewComponent({ ...newComponent, componentName: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Rate (%)"
                    step="0.01"
                    value={newComponent.rate}
                    onChange={(e) => setNewComponent({ ...newComponent, rate: Number(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Account Code"
                      value={newComponent.account}
                      onChange={(e) => setNewComponent({ ...newComponent, account: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddComponent}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'applicability' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applicable On</label>
                  <select
                    value={formData.applicability.applicableOn}
                    onChange={(e) => setFormData({ ...formData, applicability: { ...formData.applicability, applicableOn: e.target.value as any } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="goods">Goods</option>
                    <option value="services">Services</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Territory</label>
                  <div className="grid grid-cols-2 gap-2">
                    {territories.map(territory => (
                      <label key={territory} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.applicability.territory.includes(territory)}
                          onChange={(e) => {
                            const terr = e.target.checked
                              ? [...formData.applicability.territory, territory]
                              : formData.applicability.territory.filter((t: string) => t !== territory);
                            setFormData({ ...formData, applicability: { ...formData.applicability, territory: terr } });
                          }}
                          className="mr-2"
                        />
                        {territory}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {customerTypes.map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.applicability.customerType.includes(type)}
                          onChange={(e) => {
                            const types = e.target.checked
                              ? [...formData.applicability.customerType, type]
                              : formData.applicability.customerType.filter((t: string) => t !== type);
                            setFormData({ ...formData, applicability: { ...formData.applicability, customerType: types } });
                          }}
                          className="mr-2"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                    <input
                      type="number"
                      value={formData.applicability.minAmount}
                      onChange={(e) => setFormData({ ...formData, applicability: { ...formData.applicability, minAmount: Number(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                    <input
                      type="number"
                      value={formData.applicability.maxAmount || ''}
                      onChange={(e) => setFormData({ ...formData, applicability: { ...formData.applicability, maxAmount: e.target.value ? Number(e.target.value) : undefined } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calculation' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Method</label>
                  <select
                    value={formData.calculation.method}
                    onChange={(e) => setFormData({ ...formData, calculation: { ...formData.calculation, method: e.target.value as any } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {calculationMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rounding Method</label>
                  <select
                    value={formData.calculation.roundingMethod}
                    onChange={(e) => setFormData({ ...formData, calculation: { ...formData.calculation, roundingMethod: e.target.value as any } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {roundingMethods.map(method => (
                      <option key={method} value={method}>{method.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Decimal Places</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={formData.calculation.decimalPlaces}
                    onChange={(e) => setFormData({ ...formData, calculation: { ...formData.calculation, decimalPlaces: Number(e.target.value) } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sequence</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.calculation.sequence}
                    onChange={(e) => setFormData({ ...formData, calculation: { ...formData.calculation, sequence: Number(e.target.value) } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.calculation.taxOnTax}
                      onChange={(e) => setFormData({ ...formData, calculation: { ...formData.calculation, taxOnTax: e.target.checked } })}
                      className="mr-2"
                    />
                    Calculate Tax on Tax
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Registration Number</label>
                  <input
                    type="text"
                    value={formData.compliance.taxRegistrationNumber}
                    onChange={(e) => setFormData({ ...formData, compliance: { ...formData.compliance, taxRegistrationNumber: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={formData.compliance.hsnCode}
                    onChange={(e) => setFormData({ ...formData, compliance: { ...formData.compliance, hsnCode: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SAC Code</label>
                  <input
                    type="text"
                    value={formData.compliance.sacCode}
                    onChange={(e) => setFormData({ ...formData, compliance: { ...formData.compliance, sacCode: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filing Frequency</label>
                  <select
                    value={formData.compliance.filingFrequency}
                    onChange={(e) => setFormData({ ...formData, compliance: { ...formData.compliance, filingFrequency: e.target.value as any } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {filingFrequencies.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.compliance.reportingRequired}
                      onChange={(e) => setFormData({ ...formData, compliance: { ...formData.compliance, reportingRequired: e.target.checked } })}
                      className="mr-2"
                    />
                    Reporting Required
                  </label>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="px-3 py-2 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {tax ? 'Update Tax' : 'Create Tax'}
          </button>
        </div>
      </div>
    </div>
  );
}