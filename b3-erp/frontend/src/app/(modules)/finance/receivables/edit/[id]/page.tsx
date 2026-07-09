'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FinanceService } from '@/services/finance.service';
import {
  ArrowLeft,
  Save,
  X,
  Building2,
  Calendar,
  FileText,
  User,
  Target,
  Clock,
  AlertCircle,
  DollarSign,
} from 'lucide-react';

// TypeScript Interfaces
interface FollowUpSchedule {
  id: string;
  date: string;
  time: string;
  activity: 'call' | 'email' | 'meeting' | 'site_visit';
  notes: string;
}

interface ReceivableFormData {
  customerId: string;
  customerName: string;
  invoiceReference: string;
  amount: number;
  dueDate: string;
  agingDays: number;

  // Collection Details
  collectionAgent: string;
  collectionPriority: 'low' | 'medium' | 'high';

  // Follow-up Schedule
  followUpSchedule: FollowUpSchedule[];

  // Notes
  notes: string;
  promiseToPay: string;
  promiseAmount: number;
  promiseDate: string;
  internalRemarks: string;
}

// Empty form shell; hydrated from the backend on mount.
const emptyReceivable: ReceivableFormData = {
  customerId: '',
  customerName: '',
  invoiceReference: '',
  amount: 0,
  dueDate: '',
  agingDays: 0,

  collectionAgent: '',
  collectionPriority: 'medium',

  followUpSchedule: [],

  notes: '',
  promiseToPay: '',
  promiseAmount: 0,
  promiseDate: '',
  internalRemarks: '',
};

const activityTypes = [
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'In-Person Meeting' },
  { value: 'site_visit', label: 'Site Visit' },
];

export default function EditReceivablePage() {
  const router = useRouter();
  const params = useParams();
  const receivableId = params.id as string;

  const [formData, setFormData] = useState<ReceivableFormData>(emptyReceivable);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!receivableId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    setNotFound(false);
    (async () => {
      try {
        const raw = await FinanceService.getReceivable(receivableId);
        if (cancelled) return;
        const m: any = raw || {};
        if (!raw || (m.id == null && m.customerName == null && m.invoiceReference == null)) {
          setNotFound(true);
          return;
        }
        setFormData((prev) => ({
          ...prev,
          ...(m.customerId != null ? { customerId: String(m.customerId) } : {}),
          ...(m.customerName != null ? { customerName: String(m.customerName) } : {}),
          ...(m.invoiceReference != null ? { invoiceReference: String(m.invoiceReference) } : {}),
          ...(m.amount != null ? { amount: Number(m.amount) } : {}),
          ...(m.dueDate != null ? { dueDate: String(m.dueDate) } : {}),
          ...(m.agingDays != null ? { agingDays: Number(m.agingDays) } : {}),
          ...(m.collectionAgent != null ? { collectionAgent: String(m.collectionAgent) } : {}),
          ...(m.notes != null ? { notes: String(m.notes) } : {}),
        }));
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message || 'Failed to load receivable');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [receivableId, reloadKey]);

  const addFollowUp = () => {
    const newFollowUp: FollowUpSchedule = {
      id: Date.now().toString(),
      date: '',
      time: '',
      activity: 'call',
      notes: '',
    };

    setFormData({
      ...formData,
      followUpSchedule: [...formData.followUpSchedule, newFollowUp],
    });
  };

  const removeFollowUp = (index: number) => {
    const updatedSchedule = formData.followUpSchedule.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      followUpSchedule: updatedSchedule,
    });
  };

  const handleFollowUpChange = (index: number, field: keyof FollowUpSchedule, value: any) => {
    const updatedSchedule = [...formData.followUpSchedule];
    updatedSchedule[index] = {
      ...updatedSchedule[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      followUpSchedule: updatedSchedule,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await FinanceService.updateReceivable(receivableId, formData);
      router.push(`/finance/receivables/view/${receivableId}`);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to update receivable');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const calculateAgingDays = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm text-blue-700">
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center justify-between">
          <span className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {loadError}
          </span>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="ml-3 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
      {notFound && !isLoading && (
        <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm text-yellow-700">
          Receivable not found.
        </div>
      )}
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push(`/finance/receivables/view/${receivableId}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Receivable Details</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Receivable</h1>
            <p className="text-sm text-gray-600 mt-1">Update collection details and follow-up schedule</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Customer & Invoice Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            Customer & Invoice Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* Customer */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter customer name"
                required
              />
            </div>

            {/* Invoice Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Reference <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.invoiceReference}
                onChange={(e) => setFormData({ ...formData, invoiceReference: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="INV-2025-XXXX"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
              {formData.amount > 0 && (
                <p className="text-xs text-gray-600 mt-1">{formatCurrency(formData.amount)}</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => {
                  const agingDays = calculateAgingDays(e.target.value);
                  setFormData({
                    ...formData,
                    dueDate: e.target.value,
                    agingDays,
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Aging Days (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aging Days
              </label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 flex items-center justify-between">
                <span className="text-gray-900 font-semibold">{formData.agingDays} days</span>
                {formData.agingDays > 30 && (
                  <AlertCircle className={`h-5 w-5 ${formData.agingDays > 60 ? 'text-red-500' : 'text-yellow-500'}`} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Collection Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Collection Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Collection Agent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection Agent <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.collectionAgent}
                onChange={(e) => setFormData({ ...formData, collectionAgent: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter collection agent name"
                required
              />
            </div>

            {/* Collection Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.collectionPriority}
                onChange={(e) => setFormData({ ...formData, collectionPriority: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Promise to Pay */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
            Promise to Pay
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Promise Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promise Amount (₹)
              </label>
              <input
                type="number"
                value={formData.promiseAmount || ''}
                onChange={(e) => setFormData({ ...formData, promiseAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            {/* Promise Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promise Date
              </label>
              <input
                type="date"
                value={formData.promiseDate}
                onChange={(e) => setFormData({ ...formData, promiseDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Promise Details */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promise Details
              </label>
              <textarea
                value={formData.promiseToPay}
                onChange={(e) => setFormData({ ...formData, promiseToPay: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter promise to pay details"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Follow-up Schedule */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Follow-up Schedule
            </h2>
            <button
              type="button"
              onClick={addFollowUp}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Follow-up
            </button>
          </div>

          <div className="space-y-2">
            {formData.followUpSchedule.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mb-3 text-gray-400" />
                <p>No follow-ups scheduled. Click "Add Follow-up" to create one.</p>
              </div>
            ) : (
              formData.followUpSchedule.map((followUp, index) => (
                <div key={followUp.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Follow-up {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeFollowUp(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {/* Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={followUp.date}
                        onChange={(e) => handleFollowUpChange(index, 'date', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={followUp.time}
                        onChange={(e) => handleFollowUpChange(index, 'time', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Activity Type */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Activity Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={followUp.activity}
                        onChange={(e) => handleFollowUpChange(index, 'activity', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        {activityTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={followUp.notes}
                        onChange={(e) => handleFollowUpChange(index, 'notes', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter follow-up notes"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Additional Notes
          </h2>

          <div className="space-y-2">
            {/* General Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter collection notes, customer feedback, or issues"
                rows={3}
              />
            </div>

            {/* Internal Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Remarks (Not visible to customer)
              </label>
              <textarea
                value={formData.internalRemarks}
                onChange={(e) => setFormData({ ...formData, internalRemarks: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-yellow-50 border-yellow-200"
                placeholder="Enter internal remarks for team use only"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push(`/finance/receivables/view/${receivableId}`)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{isSubmitting ? 'Updating...' : 'Update Receivable'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
