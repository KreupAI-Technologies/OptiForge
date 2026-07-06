'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import {
  RefreshCw,
  Save,
  X,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  Info,
  ArrowRight
} from 'lucide-react';

export default function RenewContractPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Original Contract Data (fallback defaults so every field the JSX reads is defined)
  const FALLBACK_CONTRACT = {
    id: params.id,
    contractNumber: 'AMC-2025-0001',
    contractType: 'AMC',
    customerName: 'Sharma Kitchens Pvt Ltd',
    customerId: 'CUST-001',
    currentStartDate: '2025-01-01',
    currentEndDate: '2025-12-31',
    contractValue: 450000,
    totalValue: 531000,
    performanceMetrics: {
      serviceRequests: 12,
      slaCompliance: 95,
      avgResponseTime: 3.2,
      customerRating: 4.8
    }
  };

  const [originalContract, setOriginalContract] = useState(FALLBACK_CONTRACT);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await AfterSalesPagesService.contract(String(params.id));
        if (!cancelled && data && typeof data === 'object') {
          setOriginalContract(prev => ({ ...prev, ...data }));
        }
      } catch {
        // keep fallback on error
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  // Renewal Form State
  const [renewalType, setRenewalType] = useState<'Standard' | 'Modified'>('Standard');
  const [newStartDate, setNewStartDate] = useState('2026-01-01');
  const [newEndDate, setNewEndDate] = useState('2026-12-31');
  const [renewalDuration, setRenewalDuration] = useState('12');

  // Pricing
  const [applyPriceIncrease, setApplyPriceIncrease] = useState(true);
  const [priceIncreaseType, setPriceIncreaseType] = useState<'Percentage' | 'Fixed'>('Percentage');
  const [priceIncreaseValue, setPriceIncreaseValue] = useState('10');
  const [newContractValue, setNewContractValue] = useState(495000);
  const [newTotalValue, setNewTotalValue] = useState(584100);

  // Terms
  const [keepExistingTerms, setKeepExistingTerms] = useState(true);
  const [responseTimeSLA, setResponseTimeSLA] = useState('4');
  const [resolutionTimeSLA, setResolutionTimeSLA] = useState('24');
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [renewalNoticeDays, setRenewalNoticeDays] = useState('30');

  // Approvals
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [approverEmail, setApproverEmail] = useState('manager@b3macbis.com');
  const [renewalNotes, setRenewalNotes] = useState('');
  const [sendNotification, setSendNotification] = useState(true);

  const calculateNewPricing = () => {
    let newValue = originalContract.contractValue;

    if (applyPriceIncrease) {
      if (priceIncreaseType === 'Percentage') {
        newValue = originalContract.contractValue * (1 + parseFloat(priceIncreaseValue) / 100);
      } else {
        newValue = originalContract.contractValue + parseFloat(priceIncreaseValue);
      }
    }

    const tax = newValue * 0.18; // 18% GST
    const total = newValue + tax;

    setNewContractValue(Math.round(newValue));
    setNewTotalValue(Math.round(total));
  };

  React.useEffect(() => {
    calculateNewPricing();
  }, [applyPriceIncrease, priceIncreaseType, priceIncreaseValue]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/after-sales-service/service-contracts');
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 p-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Renew Contract</h1>
            <p className="text-sm text-gray-500 mt-1">
              Renewing contract {originalContract.contractNumber} for {originalContract.customerName}
            </p>
          </div>
          <div className="flex items-center gap-3">
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
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              {isSubmitting ? 'Processing...' : 'Create Renewal'}
            </button>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Contract Performance Summary</h3>
              <p className="text-sm text-gray-600 mt-1">Review the performance before renewal</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Service Requests</div>
              <div className="text-2xl font-bold text-gray-900">{originalContract.performanceMetrics.serviceRequests}</div>
              <div className="text-xs text-green-600 mt-1">✓ Well utilized</div>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">SLA Compliance</div>
              <div className="text-2xl font-bold text-gray-900">{originalContract.performanceMetrics.slaCompliance}%</div>
              <div className="text-xs text-green-600 mt-1">✓ Excellent performance</div>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Avg Response</div>
              <div className="text-2xl font-bold text-gray-900">{originalContract.performanceMetrics.avgResponseTime}h</div>
              <div className="text-xs text-green-600 mt-1">✓ Within SLA</div>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Customer Rating</div>
              <div className="text-2xl font-bold text-gray-900">{originalContract.performanceMetrics.customerRating}/5</div>
              <div className="text-xs text-green-600 mt-1">✓ Highly satisfied</div>
            </div>
          </div>
        </div>

        {/* Renewal Type */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Renewal Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className={`relative flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${renewalType === 'Standard' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <input
                type="radio"
                value="Standard"
                checked={renewalType === 'Standard'}
                onChange={(e) => setRenewalType(e.target.value as any)}
                className="mt-1"
              />
              <div className="ml-3">
                <div className="font-medium text-gray-900">Standard Renewal</div>
                <p className="text-sm text-gray-600 mt-1">
                  Renew with same terms and conditions. Only update dates and pricing.
                </p>
                <div className="mt-2 text-xs text-blue-600 font-medium">✓ Recommended for consistent performance</div>
              </div>
            </label>

            <label className={`relative flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${renewalType === 'Modified' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <input
                type="radio"
                value="Modified"
                checked={renewalType === 'Modified'}
                onChange={(e) => setRenewalType(e.target.value as any)}
                className="mt-1"
              />
              <div className="ml-3">
                <div className="font-medium text-gray-900">Modified Renewal</div>
                <p className="text-sm text-gray-600 mt-1">
                  Update terms, SLA, pricing, and coverage details as needed.
                </p>
                <div className="mt-2 text-xs text-gray-600">For contracts requiring changes</div>
              </div>
            </label>
          </div>
        </div>

        {/* Renewal Period */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Renewal Period</h2>

          <div className="bg-gray-50 p-3 rounded-lg mb-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Current Contract Period</div>
                <div className="font-medium text-gray-900 mt-1">
                  {formatDate(originalContract.currentStartDate)} to {formatDate(originalContract.currentEndDate)}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">New Contract Period</div>
                <div className="font-medium text-blue-600 mt-1">
                  {formatDate(newStartDate)} to {formatDate(newEndDate)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Typically day after current contract ends</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (months) <span className="text-red-500">*</span>
              </label>
              <select
                value={renewalDuration}
                onChange={(e) => {
                  setRenewalDuration(e.target.value);
                  const start = new Date(newStartDate);
                  const end = new Date(start);
                  end.setMonth(end.getMonth() + parseInt(e.target.value));
                  setNewEndDate(end.toISOString().split('T')[0]);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months (1 Year)</option>
                <option value="24">24 Months (2 Years)</option>
                <option value="36">36 Months (3 Years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Auto-calculated based on duration</p>
            </div>
          </div>
        </div>

        {/* Pricing Adjustment */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Pricing Adjustment</h2>

          <div className="mb-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={applyPriceIncrease}
                onChange={(e) => setApplyPriceIncrease(e.target.checked)}
                className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Apply price increase</span>
            </label>
          </div>

          {applyPriceIncrease && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Increase Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={priceIncreaseType}
                  onChange={(e) => setPriceIncreaseType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {priceIncreaseType === 'Percentage' ? 'Increase Percentage' : 'Increase Amount'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={priceIncreaseValue}
                  onChange={(e) => setPriceIncreaseValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={priceIncreaseType === 'Percentage' ? '10' : '50000'}
                  min="0"
                  step={priceIncreaseType === 'Percentage' ? '0.1' : '1000'}
                  required
                />
              </div>
            </div>
          )}

          {/* Pricing Comparison */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Pricing Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-600 mb-2">Current Contract</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Contract Value:</span>
                    <span className="font-medium">{formatCurrency(originalContract.contractValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (18%):</span>
                    <span className="font-medium">{formatCurrency(originalContract.contractValue * 0.18)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-1">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold">{formatCurrency(originalContract.totalValue)}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-600 mb-2">Renewed Contract</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Contract Value:</span>
                    <span className="font-medium text-blue-600">{formatCurrency(newContractValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (18%):</span>
                    <span className="font-medium text-blue-600">{formatCurrency(newContractValue * 0.18)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-1">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(newTotalValue)}</span>
                  </div>
                  {applyPriceIncrease && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-green-600 font-medium">
                          +{formatCurrency(newTotalValue - originalContract.totalValue)}
                          ({(((newTotalValue - originalContract.totalValue) / originalContract.totalValue) * 100).toFixed(1)}% increase)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & SLA */}
        {renewalType === 'Modified' && (
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Terms & SLA</h2>

            <div className="mb-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={keepExistingTerms}
                  onChange={(e) => setKeepExistingTerms(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Keep existing terms and SLA</span>
              </label>
            </div>

            {!keepExistingTerms && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Response Time SLA (hours)
                  </label>
                  <input
                    type="number"
                    value={responseTimeSLA}
                    onChange={(e) => setResponseTimeSLA(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="4"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resolution Time SLA (hours)
                  </label>
                  <input
                    type="number"
                    value={resolutionTimeSLA}
                    onChange={(e) => setResolutionTimeSLA(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="24"
                    min="1"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Auto-Renewal Settings */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Auto-Renewal Settings</h2>

          <div className="flex items-center gap-2 mb-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRenewal}
                onChange={(e) => setAutoRenewal(e.target.checked)}
                className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Enable auto-renewal for this contract</span>
            </label>
          </div>

          {autoRenewal && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renewal Notice Period (days)
                </label>
                <input
                  type="number"
                  value={renewalNoticeDays}
                  onChange={(e) => setRenewalNoticeDays(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="30"
                  min="7"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Days before expiry to notify about auto-renewal
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Approval Workflow */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Approval & Notifications</h2>

          <div className="space-y-2">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={requiresApproval}
                  onChange={(e) => setRequiresApproval(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Requires manager approval</span>
              </label>
            </div>

            {requiresApproval && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approver Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={approverEmail}
                  onChange={(e) => setApproverEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="manager@b3macbis.com"
                  required={requiresApproval}
                />
              </div>
            )}

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Send renewal notification to customer</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Notes</label>
              <textarea
                value={renewalNotes}
                onChange={(e) => setRenewalNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add any notes or special instructions for this renewal"
              />
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Renewal Process:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>New contract will be created with a unique contract number</li>
                <li>Original contract will be marked as "Renewed" and archived</li>
                <li>Customer will receive notification with new contract details</li>
                {requiresApproval && <li>Contract will be pending approval before activation</li>}
                <li>All service history will be linked to the new contract</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Renewal...' : requiresApproval ? 'Submit for Approval' : 'Create Renewal'}
          </button>
        </div>
      </form>
    </div>
  );
}
