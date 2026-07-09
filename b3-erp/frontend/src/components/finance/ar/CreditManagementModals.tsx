'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Lock, Unlock, TrendingUp, FileText, CheckCircle } from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

// ==================== CREDIT HOLD MODAL ====================
interface CreditHoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
}

export const CreditHoldModal: React.FC<CreditHoldModalProps> = ({ isOpen, onClose, customer }) => {
  const [reason, setReason] = useState('');
  const [holdType, setHoldType] = useState('full');
  const [blockNewOrders, setBlockNewOrders] = useState(true);
  const [blockShipments, setBlockShipments] = useState(true);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [notifySales, setNotifySales] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.id) {
      onClose();
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await FinanceService.updateCreditLimit(String(customer.id), {
        onHold: true,
        status: 'blocked',
        holdType,
        holdReason: reason,
        blockNewOrders,
        blockShipments,
        notifyCustomer,
        notifySales,
      });
      onClose();
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to place credit hold');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-2 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Place Credit Hold</h2>
              <p className="text-red-100 text-sm">CUST-001 • ABC Corporation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Credit Hold Action</h3>
                <p className="text-sm text-red-700">
                  This customer will be prevented from placing new orders and/or receiving shipments until the hold is released.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Summary */}
          <div className="bg-gray-50 rounded-lg p-3 mb-2">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Credit Limit:</span>
                <p className="font-semibold text-gray-900">₹500,000</p>
              </div>
              <div>
                <span className="text-gray-600">Credit Used:</span>
                <p className="font-semibold text-orange-600">₹475,000</p>
              </div>
              <div>
                <span className="text-gray-600">Overdue:</span>
                <p className="font-semibold text-red-600">₹125,000</p>
              </div>
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hold Type <span className="text-red-500">*</span>
            </label>
            <select
              value={holdType}
              onChange={(e) => setHoldType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="full">Full Hold (Orders & Shipments)</option>
              <option value="orders_only">Block New Orders Only</option>
              <option value="shipments_only">Block Shipments Only</option>
              <option value="warning">Warning Hold (Allow with approval)</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Hold <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Explain why credit hold is being placed..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Actions */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">Automatic Actions</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={blockNewOrders}
                onChange={(e) => setBlockNewOrders(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Block new orders from this customer</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={blockShipments}
                onChange={(e) => setBlockShipments(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Block pending shipments</span>
            </label>
          </div>

          {/* Notifications */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">Notifications</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifyCustomer}
                onChange={(e) => setNotifyCustomer(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Notify customer via email</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifySales}
                onChange={(e) => setNotifySales(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Notify sales team</span>
            </label>
          </div>

          {saveError && (
            <p className="text-sm text-red-600 mb-2">{saveError}</p>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Placing…' : 'Place Hold'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== RELEASE CREDIT HOLD MODAL ====================
interface ReleaseCreditHoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
}

export const ReleaseCreditHoldModal: React.FC<ReleaseCreditHoldModalProps> = ({ isOpen, onClose, customer }) => {
  const [releaseReason, setReleaseReason] = useState('');
  const [releaseConditions, setReleaseConditions] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [notifySales, setNotifySales] = useState(true);
  const [restoreFullCredit, setRestoreFullCredit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.id) {
      onClose();
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await FinanceService.updateCreditLimit(String(customer.id), {
        onHold: false,
        status: 'active',
        releaseReason,
        releaseConditions,
        restoreFullCredit,
        notifyCustomer,
        notifySales,
      });
      onClose();
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to release credit hold');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-2 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Release Credit Hold</h2>
              <p className="text-green-100 text-sm">CUST-001 • ABC Corporation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Hold Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
            <div className="flex gap-3">
              <Lock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">Current Hold Status</h3>
                <div className="text-sm text-orange-700 space-y-1">
                  <p>• Hold Type: <span className="font-medium">Full Hold</span></p>
                  <p>• Placed On: <span className="font-medium">2025-01-28</span></p>
                  <p>• Days on Hold: <span className="font-medium">7 days</span></p>
                  <p>• Reason: <span className="font-medium">Credit limit exceeded, overdue payments</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-gray-50 rounded-lg p-3 mb-2">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Current Status</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Total Due:</span>
                <p className="font-semibold text-gray-900">₹125,000</p>
              </div>
              <div>
                <span className="text-gray-600">Overdue:</span>
                <p className="font-semibold text-red-600">₹50,000</p>
              </div>
              <div>
                <span className="text-gray-600">Credit Used:</span>
                <p className="font-semibold text-orange-600">95%</p>
              </div>
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Release <span className="text-red-500">*</span>
            </label>
            <textarea
              value={releaseReason}
              onChange={(e) => setReleaseReason(e.target.value)}
              rows={4}
              placeholder="Explain why the hold is being released (e.g., payment received, credit approved, etc.)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conditions/Notes
            </label>
            <textarea
              value={releaseConditions}
              onChange={(e) => setReleaseConditions(e.target.value)}
              rows={3}
              placeholder="Any conditions or special notes for future reference..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Options */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={restoreFullCredit}
                onChange={(e) => setRestoreFullCredit(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Restore full credit privileges</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifyCustomer}
                onChange={(e) => setNotifyCustomer(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Notify customer that hold has been released</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifySales}
                onChange={(e) => setNotifySales(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Notify sales team</span>
            </label>
          </div>

          {saveError && (
            <p className="text-sm text-red-600 mb-2">{saveError}</p>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Releasing…' : 'Release Hold'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== CREDIT REVIEW MODAL ====================
interface CreditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
}

export const CreditReviewModal: React.FC<CreditReviewModalProps> = ({ isOpen, onClose, customer }) => {
  const [reviewDecision, setReviewDecision] = useState('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [recommendedLimit, setRecommendedLimit] = useState('600000');
  const [paymentScore, setPaymentScore] = useState(85);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.id) {
      onClose();
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload: Record<string, any> = {
        reviewDecision,
        reviewNotes,
        paymentScore,
        lastReviewDate: new Date().toISOString(),
      };
      // Only push a new credit limit when the reviewer changed it.
      if (reviewDecision === 'increase' || reviewDecision === 'decrease') {
        payload.creditLimit = Number(recommendedLimit) || 0;
      }
      if (reviewDecision === 'hold' || reviewDecision === 'reject') {
        payload.onHold = true;
        payload.status = 'blocked';
      }
      await FinanceService.updateCreditLimit(String(customer.id), payload);
      onClose();
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to submit credit review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Credit Review</h2>
              <p className="text-blue-100 text-sm">CUST-001 • ABC Corporation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Payment Score */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 mb-3 border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-blue-900">Payment Performance Score</h3>
              <div className="text-4xl font-bold text-blue-600">{paymentScore}</div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-4 mb-2">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                style={{ width: `${paymentScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-blue-700">
              <span>Poor (0-40)</span>
              <span>Fair (41-60)</span>
              <span>Good (61-80)</span>
              <span>Excellent (81-100)</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
              <div className="text-green-700 text-sm font-medium mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-green-900">₹52.5L</div>
              <div className="text-xs text-green-600 mt-1">45 invoices</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
              <div className="text-blue-700 text-sm font-medium mb-1">Avg Payment</div>
              <div className="text-2xl font-bold text-blue-900">28 days</div>
              <div className="text-xs text-blue-600 mt-1">Terms: Net 30</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-200">
              <div className="text-orange-700 text-sm font-medium mb-1">Current Due</div>
              <div className="text-2xl font-bold text-orange-900">₹125K</div>
              <div className="text-xs text-orange-600 mt-1">5 days overdue</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
              <div className="text-purple-700 text-sm font-medium mb-1">Credit Used</div>
              <div className="text-2xl font-bold text-purple-900">95%</div>
              <div className="text-xs text-purple-600 mt-1">₹475K / ₹500K</div>
            </div>
          </div>

          {/* Payment History */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 pb-2 border-b">Payment History (Last 12 Months)</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="grid grid-cols-6 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">On-time Payments:</span>
                  <p className="font-semibold text-green-600">38 / 45 (84%)</p>
                </div>
                <div>
                  <span className="text-gray-600">Late Payments:</span>
                  <p className="font-semibold text-orange-600">7 / 45 (16%)</p>
                </div>
                <div>
                  <span className="text-gray-600">Avg Delay:</span>
                  <p className="font-semibold text-gray-900">3 days</p>
                </div>
                <div>
                  <span className="text-gray-600">Disputed Items:</span>
                  <p className="font-semibold text-gray-900">2</p>
                </div>
                <div>
                  <span className="text-gray-600">Returns/Credits:</span>
                  <p className="font-semibold text-gray-900">₹15K</p>
                </div>
                <div>
                  <span className="text-gray-600">Bad Debt:</span>
                  <p className="font-semibold text-green-600">₹0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Decision <span className="text-red-500">*</span>
              </label>
              <select
                value={reviewDecision}
                onChange={(e) => setReviewDecision(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="approve">Approve - Maintain Current Limit</option>
                <option value="increase">Approve - Increase Credit Limit</option>
                <option value="decrease">Approve with Caution - Decrease Limit</option>
                <option value="hold">Place on Hold - Requires Payment</option>
                <option value="reject">Reject - Suspend Credit</option>
              </select>
            </div>

            {(reviewDecision === 'increase' || reviewDecision === 'decrease') && (
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommended Credit Limit (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={recommendedLimit}
                  onChange={(e) => setRecommendedLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  step="10000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current Limit: ₹500,000 | Change: {reviewDecision === 'increase' ? '+' : '-'}₹{Math.abs(parseFloat(recommendedLimit) - 500000).toLocaleString()}
                </p>
              </div>
            )}

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={5}
                placeholder="Provide detailed analysis and justification for your decision..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {saveError && (
              <p className="text-sm text-red-600 mb-2">{saveError}</p>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==================== AGING ALERT SETTINGS MODAL ====================
interface AgingAlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgingAlertSettingsModal: React.FC<AgingAlertSettingsModalProps> = ({ isOpen, onClose }) => {
  const [enable30DayAlert, setEnable30DayAlert] = useState(true);
  const [enable60DayAlert, setEnable60DayAlert] = useState(true);
  const [enable90DayAlert, setEnable90DayAlert] = useState(true);
  const [criticalAmount, setCriticalAmount] = useState('100000');
  const [autoHoldThreshold, setAutoHoldThreshold] = useState('90');
  const [notifyEmails, setNotifyEmails] = useState('finance@company.com, manager@company.com');
  const [dailyDigest, setDailyDigest] = useState(true);

  if (!isOpen) return null;

  // NOTE: no aging-alert-settings persistence endpoint exists on the finance
  // backend yet, so this dialog collects settings and closes without a fake
  // save. Wire to a real endpoint once it is available (see NEEDS BACKEND).
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-3 py-2 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Aging Alert Settings</h2>
              <p className="text-amber-100 text-sm">Configure automatic alerts for overdue accounts</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Alert Thresholds */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 pb-2 border-b">Alert Thresholds</h3>
            <div className="space-y-2">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={enable30DayAlert}
                    onChange={(e) => setEnable30DayAlert(e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <div>
                    <span className="font-semibold text-orange-900">30 Days Overdue Alert</span>
                    <p className="text-sm text-orange-700">Send alert when invoices are 30+ days past due</p>
                  </div>
                </label>
                {enable30DayAlert && (
                  <div className="ml-8 text-sm text-orange-700">
                    <p>Action: <span className="font-medium">Send payment reminder to customer</span></p>
                  </div>
                )}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={enable60DayAlert}
                    onChange={(e) => setEnable60DayAlert(e.target.checked)}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                  />
                  <div>
                    <span className="font-semibold text-red-900">60 Days Overdue Alert</span>
                    <p className="text-sm text-red-700">Send escalation alert for 60+ days overdue</p>
                  </div>
                </label>
                {enable60DayAlert && (
                  <div className="ml-8 text-sm text-red-700">
                    <p>Action: <span className="font-medium">Escalate to credit manager, notify sales team</span></p>
                  </div>
                )}
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={enable90DayAlert}
                    onChange={(e) => setEnable90DayAlert(e.target.checked)}
                    className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-semibold text-rose-900">90+ Days Overdue - Critical</span>
                    <p className="text-sm text-rose-700">Critical alert for severely overdue accounts</p>
                  </div>
                </label>
                {enable90DayAlert && (
                  <div className="ml-8 text-sm text-rose-700">
                    <p>Action: <span className="font-medium">Consider collections, legal action, credit hold</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Automatic Actions */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 pb-2 border-b">Automatic Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Critical Amount Threshold (₹)
                </label>
                <input
                  type="number"
                  value={criticalAmount}
                  onChange={(e) => setCriticalAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  step="10000"
                />
                <p className="text-xs text-gray-500 mt-1">Trigger immediate alert if overdue amount exceeds this</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto Credit Hold (Days)
                </label>
                <input
                  type="number"
                  value={autoHoldThreshold}
                  onChange={(e) => setAutoHoldThreshold(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Automatically place credit hold after X days overdue</p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 pb-2 border-b">Notification Settings</h3>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Recipients (comma separated)
              </label>
              <input
                type="text"
                value={notifyEmails}
                onChange={(e) => setNotifyEmails(e.target.value)}
                placeholder="email1@company.com, email2@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">Send daily digest of all aging accounts (9:00 AM)</span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg hover:from-amber-700 hover:to-yellow-700 transition-colors font-medium"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== CREDIT APPROVAL REQUEST MODAL ====================
interface CreditApprovalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
}

export const CreditApprovalRequestModal: React.FC<CreditApprovalRequestModalProps> = ({ isOpen, onClose, customer }) => {
  const [requestType, setRequestType] = useState('limit_increase');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [justification, setJustification] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.id) {
      onClose();
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await FinanceService.updateCreditLimit(String(customer.id), {
        pendingRequest: {
          requestType,
          requestedAmount: Number(requestedAmount) || 0,
          justification,
          urgency,
          attachments,
          requestedAt: new Date().toISOString(),
        },
      });
      onClose();
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to submit credit approval request');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Credit Approval Request</h2>
              <p className="text-indigo-100 text-sm">CUST-001 • ABC Corporation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Current Credit Info */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 mb-3 border border-indigo-200">
            <h3 className="font-semibold text-indigo-900 mb-3">Current Credit Status</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-indigo-700">Current Limit:</span>
                <p className="font-semibold text-indigo-900">₹500,000</p>
              </div>
              <div>
                <span className="text-indigo-700">Credit Used:</span>
                <p className="font-semibold text-indigo-900">₹475,000 (95%)</p>
              </div>
              <div>
                <span className="text-indigo-700">Available:</span>
                <p className="font-semibold text-green-600">₹25,000</p>
              </div>
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Type <span className="text-red-500">*</span>
            </label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="limit_increase">Credit Limit Increase</option>
              <option value="temporary_increase">Temporary Limit Increase</option>
              <option value="payment_terms">Payment Terms Extension</option>
              <option value="hold_release">Release Credit Hold</option>
              <option value="exception">Credit Exception/Override</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {requestType.includes('increase') ? 'Requested New Limit (₹)' : 'Requested Amount (₹)'} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value)}
              placeholder={requestType.includes('increase') ? '750000' : '50000'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              step="10000"
            />
            {requestType === 'limit_increase' && requestedAmount && (
              <p className="text-xs text-gray-500 mt-1">
                Increase: +₹{(parseFloat(requestedAmount) - 500000).toLocaleString()} ({(((parseFloat(requestedAmount) - 500000) / 500000) * 100).toFixed(1)}%)
              </p>
            )}
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgency Level <span className="text-red-500">*</span>
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="low">Low - Standard Review (5-7 days)</option>
              <option value="normal">Normal - Regular Priority (2-3 days)</option>
              <option value="high">High - Expedited Review (1 day)</option>
              <option value="critical">Critical - Immediate Approval Needed (Same day)</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Justification <span className="text-red-500">*</span>
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={6}
              placeholder="Provide detailed justification including:
- Reason for request
- Customer's business growth/new projects
- Payment history and reliability
- Expected revenue impact
- Risk assessment"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Supporting Documents */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Supporting Documents</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                <span className="text-gray-700">Customer financial statements attached</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                <span className="text-gray-700">Sales forecast/pipeline report attached</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                <span className="text-gray-700">Trade references verified</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                <span className="text-gray-700">Credit report obtained</span>
              </label>
            </div>
          </div>

          {saveError && (
            <p className="text-sm text-red-600 mb-2">{saveError}</p>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Submitting…' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== APPROVE/REJECT CREDIT REQUEST MODAL ====================
interface ApproveRejectCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  request?: any;
}

export const ApproveRejectCreditModal: React.FC<ApproveRejectCreditModalProps> = ({ isOpen, onClose, request }) => {
  const [decision, setDecision] = useState('approve');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [conditions, setConditions] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetId = request?.creditLimitId ?? request?.customerId ?? request?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) {
      onClose();
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const approved = decision.startsWith('approve');
      const payload: Record<string, any> = {
        requestDecision: decision,
        approvalNotes,
        conditions,
        effectiveDate,
      };
      if (approved && request?.requestedAmount) {
        payload.creditLimit = Number(request.requestedAmount) || undefined;
      }
      await FinanceService.updateCreditLimit(String(targetId), payload);
      onClose();
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to record credit decision');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-green-600 text-white px-3 py-2 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Review Credit Request</h2>
              <p className="text-teal-100 text-sm">Request #CR-2025-001</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Request Details */}
          <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-lg p-3 mb-3 border border-teal-200">
            <h3 className="font-semibold text-teal-900 mb-3">Request Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-teal-700">Customer:</span>
                <p className="font-semibold text-teal-900">ABC Corporation (CUST-001)</p>
              </div>
              <div>
                <span className="text-teal-700">Requested By:</span>
                <p className="font-semibold text-teal-900">John Doe (Sales)</p>
              </div>
              <div>
                <span className="text-teal-700">Request Type:</span>
                <p className="font-semibold text-teal-900">Credit Limit Increase</p>
              </div>
              <div>
                <span className="text-teal-700">Urgency:</span>
                <p className="font-semibold text-orange-600">High</p>
              </div>
              <div>
                <span className="text-teal-700">Current Limit:</span>
                <p className="font-semibold text-teal-900">₹500,000</p>
              </div>
              <div>
                <span className="text-teal-700">Requested Limit:</span>
                <p className="font-semibold text-green-600">₹750,000 (+50%)</p>
              </div>
            </div>
          </div>

          {/* Justification */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 mb-2">Business Justification</h3>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
              Customer has secured a new major contract worth ₹2.5M annually. Expected to increase monthly orders by 60%. Payment history excellent with 95% on-time payments. Currently utilizing 95% of credit limit which is limiting order capacity.
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decision <span className="text-red-500">*</span>
              </label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              >
                <option value="approve">Approve - Full Amount Requested</option>
                <option value="approve_partial">Approve - Partial Amount</option>
                <option value="approve_conditional">Approve - With Conditions</option>
                <option value="reject">Reject - Deny Request</option>
                <option value="more_info">Request More Information</option>
              </select>
            </div>

            {decision === 'approve_conditional' && (
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approval Conditions
                </label>
                <textarea
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  rows={3}
                  placeholder="Specify conditions for approval (e.g., personal guarantee, monthly reviews, etc.)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decision Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={5}
                placeholder="Provide detailed notes about your decision..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            {saveError && (
              <p className="text-sm text-red-600 mb-2">{saveError}</p>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  decision === 'reject'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                    : 'bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700'
                } text-white`}
              >
                {saving ? 'Saving…' : decision === 'reject' ? 'Reject Request' : 'Approve Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
