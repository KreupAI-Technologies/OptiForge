'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ServiceContractService,
  ServiceContract,
  ContractStatus,
  ContractType,
  PricingTier,
  BillingFrequency,
  UpdateServiceContractDto,
} from '@/services/service-contract.service';
import { Save, X, AlertCircle, FileText } from 'lucide-react';

const STATUS_OPTIONS: ContractStatus[] = [
  'draft',
  'active',
  'expired',
  'renewed',
  'terminated',
  'suspended',
];
const TYPE_OPTIONS: ContractType[] = [
  'AMC',
  'CMC',
  'Pay Per Visit',
  'Parts & Labor',
  'Extended Warranty',
];
const TIER_OPTIONS: PricingTier[] = ['Basic', 'Standard', 'Premium', 'Enterprise'];
const BILLING_OPTIONS: BillingFrequency[] = ['monthly', 'quarterly', 'half_yearly', 'annual'];

export default function EditServiceContractPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [contract, setContract] = useState<ServiceContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [contractType, setContractType] = useState<ContractType>('AMC');
  const [status, setStatus] = useState<ContractStatus>('draft');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');
  const [pricingTier, setPricingTier] = useState<PricingTier>('Standard');
  const [contractValue, setContractValue] = useState('');
  const [responseTimeSLA, setResponseTimeSLA] = useState('');
  const [resolutionTimeSLA, setResolutionTimeSLA] = useState('');
  const [accountManager, setAccountManager] = useState('');
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('quarterly');
  const [autoRenewal, setAutoRenewal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ServiceContractService.getServiceContractById(String(params.id));
        if (cancelled) return;
        if (!data || typeof data !== 'object') {
          setError('Service contract not found.');
          setContract(null);
          return;
        }
        setContract(data);
        setCustomerName(data.customerName ?? '');
        setContractType(data.contractType ?? 'AMC');
        setStatus(data.status ?? 'draft');
        setStartDate(data.startDate ? String(data.startDate).split('T')[0] : '');
        setDuration(data.duration != null ? String(data.duration) : '');
        setPricingTier(data.pricingTier ?? 'Standard');
        setContractValue(data.contractValue != null ? String(data.contractValue) : '');
        setResponseTimeSLA(data.responseTimeSLA != null ? String(data.responseTimeSLA) : '');
        setResolutionTimeSLA(data.resolutionTimeSLA != null ? String(data.resolutionTimeSLA) : '');
        setAccountManager(data.accountManager ?? '');
        setBillingFrequency(data.billingFrequency ?? 'quarterly');
        setAutoRenewal(Boolean(data.autoRenewal));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load service contract.');
          setContract(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const dto: UpdateServiceContractDto = {
        customerName,
        contractType,
        status,
        startDate,
        duration: duration === '' ? undefined : Number(duration),
        pricingTier,
        contractValue: contractValue === '' ? undefined : Number(contractValue),
        responseTimeSLA: responseTimeSLA === '' ? undefined : Number(responseTimeSLA),
        resolutionTimeSLA: resolutionTimeSLA === '' ? undefined : Number(resolutionTimeSLA),
        accountManager,
        billingFrequency,
        autoRenewal,
      };
      await ServiceContractService.updateServiceContract(String(params.id), dto);
      router.push('/after-sales-service/service-contracts');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-red-900">Unable to load contract</h2>
            <p className="text-sm text-red-700 mt-1">{error || 'Service contract not found.'}</p>
            <button
              onClick={() => router.push('/after-sales-service/service-contracts')}
              className="mt-3 px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Back to Contracts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Edit Service Contract</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">{contract.contractNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <span className="text-sm text-red-700">{saveError}</span>
          </div>
        )}

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Contract Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContractStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Tier</label>
              <select
                value={pricingTier}
                onChange={(e) => setPricingTier(e.target.value as PricingTier)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIER_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (months)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Value (₹)
              </label>
              <input
                type="number"
                value={contractValue}
                onChange={(e) => setContractValue(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Manager
              </label>
              <input
                type="text"
                value={accountManager}
                onChange={(e) => setAccountManager(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Response SLA (hours)
              </label>
              <input
                type="number"
                value={responseTimeSLA}
                onChange={(e) => setResponseTimeSLA(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolution SLA (hours)
              </label>
              <input
                type="number"
                value={resolutionTimeSLA}
                onChange={(e) => setResolutionTimeSLA(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billing Frequency
              </label>
              <select
                value={billingFrequency}
                onChange={(e) => setBillingFrequency(e.target.value as BillingFrequency)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BILLING_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center md:col-span-2 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRenewal}
                  onChange={(e) => setAutoRenewal(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Enable auto-renewal</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
