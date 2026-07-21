'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileText, Calendar, AlertCircle, CheckCircle, Building, X } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface AMCContract {
  id: string;
  contractId: string;
  assetCategory: 'laptop' | 'desktop' | 'mobile' | 'printer' | 'server' | 'network' | 'other';
  vendor: string;
  vendorContact: string;
  startDate: string;
  endDate: string;
  duration: number;
  numberOfAssets: number;
  contractValue: number;
  paymentTerms: 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
  coverage: string[];
  responseTime: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'pending_renewal';
  renewalDate?: string;
  location: string;
  contactPerson: string;
  remarks?: string;
}

function parseCoverage(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [contracts, setContracts] = useState<AMCContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detailContract, setDetailContract] = useState<AMCContract | null>(null);
  const [transitioningId, setTransitioningId] = useState<string | null>(null);

  const handleRenewContract = async (contract: AMCContract) => {
    setTransitioningId(contract.id);
    setLoadError(null);
    const renewalDate = new Date().toISOString().slice(0, 10);
    try {
      await HrAssetsService.updateAmcContract(contract.id, { status: 'active', renewalDate });
      setContracts(prev =>
        prev.map(c => (c.id === contract.id ? { ...c, status: 'active', renewalDate } : c)),
      );
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to renew contract');
    } finally {
      setTransitioningId(null);
    }
  };
  const [showForm, setShowForm] = useState(false);

  const emptyForm = {
    contractId: '',
    assetCategory: 'laptop',
    vendor: '',
    vendorContact: '',
    startDate: '',
    endDate: '',
    duration: '',
    numberOfAssets: '',
    contractValue: '',
    paymentTerms: 'annual',
    coverage: '',
    responseTime: '',
    location: '',
    contactPerson: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const coverageArr = form.coverage
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const created = await HrAssetsService.createAmcContract({
        contractId: form.contractId,
        assetCategory: form.assetCategory,
        vendor: form.vendor,
        vendorContact: form.vendorContact,
        startDate: form.startDate,
        endDate: form.endDate,
        duration: Number(form.duration) || 0,
        numberOfAssets: Number(form.numberOfAssets) || 0,
        contractValue: Number(form.contractValue) || 0,
        paymentTerms: form.paymentTerms,
        coverage: JSON.stringify(coverageArr),
        responseTime: form.responseTime,
        status: 'active',
        location: form.location,
        contactPerson: form.contactPerson,
      });
      const row: AMCContract = {
        id: String(created.id),
        contractId: created.contractId ?? form.contractId,
        assetCategory: (created.assetCategory ?? form.assetCategory) as AMCContract['assetCategory'],
        vendor: created.vendor ?? form.vendor,
        vendorContact: created.vendorContact ?? form.vendorContact,
        startDate: created.startDate ?? form.startDate,
        endDate: created.endDate ?? form.endDate,
        duration: Number(created.duration ?? form.duration ?? 0),
        numberOfAssets: Number(created.numberOfAssets ?? form.numberOfAssets ?? 0),
        contractValue: Number(created.contractValue ?? form.contractValue ?? 0),
        paymentTerms: (created.paymentTerms ?? form.paymentTerms) as AMCContract['paymentTerms'],
        coverage: parseCoverage(created.coverage ?? coverageArr),
        responseTime: created.responseTime ?? form.responseTime,
        status: (created.status ?? 'active') as AMCContract['status'],
        renewalDate: created.renewalDate ?? undefined,
        location: created.location ?? form.location,
        contactPerson: created.contactPerson ?? form.contactPerson,
        remarks: created.remarks ?? undefined,
      };
      setContracts((prev) => [row, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to add contract');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrAssetsService.getAmcContracts();
        const mapped: AMCContract[] = raw.map((c) => ({
          id: String(c.id),
          contractId: c.contractId ?? '',
          assetCategory: (c.assetCategory ?? 'other') as AMCContract['assetCategory'],
          vendor: c.vendor ?? '',
          vendorContact: c.vendorContact ?? '',
          startDate: c.startDate ?? '',
          endDate: c.endDate ?? '',
          duration: Number(c.duration ?? 0),
          numberOfAssets: Number(c.numberOfAssets ?? 0),
          contractValue: Number(c.contractValue ?? 0),
          paymentTerms: (c.paymentTerms ?? 'annual') as AMCContract['paymentTerms'],
          coverage: parseCoverage(c.coverage),
          responseTime: c.responseTime ?? '',
          status: (c.status ?? 'active') as AMCContract['status'],
          renewalDate: c.renewalDate ?? undefined,
          location: c.location ?? '',
          contactPerson: c.contactPerson ?? '',
          remarks: c.remarks ?? undefined,
        }));
        if (!cancelled) setContracts(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load AMC contracts');
          setContracts([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredContracts = contracts.filter(c => {
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && c.assetCategory !== selectedCategory) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    expiring: contracts.filter(c => c.status === 'expiring_soon').length,
    expired: contracts.filter(c => c.status === 'expired').length,
    totalValue: contracts.filter(c => c.status === 'active' || c.status === 'expiring_soon').reduce((sum, c) => sum + c.contractValue, 0)
  }), [contracts]);

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    expiring_soon: 'bg-yellow-100 text-yellow-700',
    expired: 'bg-red-100 text-red-700',
    pending_renewal: 'bg-orange-100 text-orange-700'
  };

  const categoryColors = {
    laptop: 'bg-blue-100 text-blue-700',
    desktop: 'bg-purple-100 text-purple-700',
    mobile: 'bg-green-100 text-green-700',
    printer: 'bg-orange-100 text-orange-700',
    server: 'bg-red-100 text-red-700',
    network: 'bg-indigo-100 text-indigo-700',
    other: 'bg-gray-100 text-gray-700'
  };

  const paymentTermsLabel = {
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    half_yearly: 'Half-Yearly',
    annual: 'Annual'
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">AMC Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage Annual Maintenance Contracts for assets</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading AMC contracts…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Contracts</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.active}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <p className="text-sm font-medium text-yellow-600">Expiring Soon</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.expiring}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <p className="text-sm font-medium text-red-600">Expired</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.expired}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-sm font-medium text-purple-600">Total Value</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">₹{(stats.totalValue / 100000).toFixed(2)}L</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Categories</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="printer">Printer</option>
              <option value="server">Server</option>
              <option value="network">Network</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setShowForm(true)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Add Contract
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredContracts.map(contract => {
          const daysLeft = getDaysUntilExpiry(contract.endDate);
          return (
            <div key={contract.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{contract.vendor}</h3>
                      <p className="text-sm text-gray-600">Contract ID: {contract.contractId} • {contract.vendorContact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${categoryColors[contract.assetCategory]}`}>
                      {contract.assetCategory.charAt(0).toUpperCase() + contract.assetCategory.slice(1)}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[contract.status]}`}>
                      {contract.status === 'expiring_soon' ? 'Expiring Soon' : contract.status === 'pending_renewal' ? 'Pending Renewal' : contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </span>
                    {contract.status === 'active' && daysLeft <= 90 && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-50 text-yellow-700 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {daysLeft} days left
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Contract Value</p>
                  <p className="text-2xl font-bold text-blue-600">₹{contract.contractValue.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-600 mt-1">{paymentTermsLabel[contract.paymentTerms]}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Duration</p>
                  <p className="text-sm font-semibold text-gray-900">{contract.duration} months</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Assets Covered</p>
                  <p className="text-sm font-semibold text-gray-900">{contract.numberOfAssets}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Response Time</p>
                  <p className="text-sm font-semibold text-gray-900">{contract.responseTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                  <p className="text-sm font-semibold text-gray-900">{contract.location}</p>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Coverage</p>
                <div className="flex flex-wrap gap-2">
                  {contract.coverage.map((item, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                      <CheckCircle className="h-3 w-3" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 py-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(contract.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className="text-gray-400 mx-2">→</span>
                  <div>
                    <p className="text-xs text-gray-500">End Date</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(contract.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Contact Person</p>
                    <p className="text-sm font-semibold text-gray-900">{contract.contactPerson}</p>
                  </div>
                </div>
              </div>

              {contract.remarks && (
                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Remarks</p>
                  <p className="text-sm text-gray-700">{contract.remarks}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setDetailContract(contract)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                  View Details
                </button>
                {(contract.status === 'expiring_soon' || contract.status === 'expired') && (
                  <button onClick={() => handleRenewContract(contract)} disabled={transitioningId === contract.id} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm disabled:opacity-50">
                    Renew Contract
                  </button>
                )}
                {contract.status === 'active' && (
                  <button onClick={() => setDetailContract(contract)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                    Edit Contract
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {detailContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
              <h2 className="text-lg font-bold text-white">AMC Contract Details</h2>
              <button onClick={() => setDetailContract(null)} className="text-white hover:text-blue-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Vendor</p>
                  <p className="font-semibold text-gray-900">{detailContract.vendor}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Contract ID</p>
                  <p className="font-semibold text-gray-900">{detailContract.contractId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Vendor Contact</p>
                  <p className="font-semibold text-gray-900">{detailContract.vendorContact}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Asset Category</p>
                  <p className="font-semibold text-gray-900">{detailContract.assetCategory}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Contract Value</p>
                  <p className="font-semibold text-gray-900">₹{detailContract.contractValue.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Payment Terms</p>
                  <p className="font-semibold text-gray-900">{detailContract.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Duration</p>
                  <p className="font-semibold text-gray-900">{detailContract.duration} months</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Number of Assets</p>
                  <p className="font-semibold text-gray-900">{detailContract.numberOfAssets}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Response Time</p>
                  <p className="font-semibold text-gray-900">{detailContract.responseTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <p className="font-semibold text-gray-900">{detailContract.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Start Date</p>
                  <p className="font-semibold text-gray-900">{detailContract.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">End Date</p>
                  <p className="font-semibold text-gray-900">{detailContract.endDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Location</p>
                  <p className="font-semibold text-gray-900">{detailContract.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Contact Person</p>
                  <p className="font-semibold text-gray-900">{detailContract.contactPerson}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase">Coverage</p>
                  <p className="font-semibold text-gray-900">{detailContract.coverage.join(', ')}</p>
                </div>
                {detailContract.remarks && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase">Remarks</p>
                    <p className="font-semibold text-gray-900">{detailContract.remarks}</p>
                  </div>
                )}
              </div>
              <button onClick={() => setDetailContract(null)} className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
              <h2 className="text-lg font-bold text-white">Add AMC Contract</h2>
              <button onClick={() => setShowForm(false)} className="text-white hover:text-blue-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {submitError && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {submitError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract ID</label>
                  <input value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Category</label>
                  <select value={form.assetCategory} onChange={(e) => setForm({ ...form, assetCategory: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="laptop">Laptop</option>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                    <option value="printer">Printer</option>
                    <option value="server">Server</option>
                    <option value="network">Network</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  <input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Contact</label>
                  <input value={form.vendorContact} onChange={(e) => setForm({ ...form, vendorContact: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months)</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Assets</label>
                  <input type="number" value={form.numberOfAssets} onChange={(e) => setForm({ ...form, numberOfAssets: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value</label>
                  <input type="number" value={form.contractValue} onChange={(e) => setForm({ ...form, contractValue: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <select value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half_yearly">Half-Yearly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Response Time</label>
                  <input value={form.responseTime} onChange={(e) => setForm({ ...form, responseTime: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage (comma-separated)</label>
                  <input value={form.coverage} onChange={(e) => setForm({ ...form, coverage: e.target.value })} placeholder="On-site support, Parts replacement" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-60">
                  {isSubmitting ? 'Adding…' : 'Add Contract'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
