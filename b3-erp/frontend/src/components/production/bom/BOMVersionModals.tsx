'use client';

import React, { useState } from 'react';
import { X, Save, Eye, Edit3, Plus, Calendar, TrendingUp, TrendingDown, Minus, FileText, CheckCircle, Clock, User, AlertCircle, Copy } from 'lucide-react';

export interface BOMVersion {
  id: string;
  versionNumber: string;
  revisionNumber: string;
  status: 'current' | 'previous' | 'obsolete';
  effectiveFrom: string;
  effectiveUntil?: string;
  changeReason: string;
  changedBy: string;
  changedDate: string;
  approvedBy?: string;
  approvalDate?: string;
  totalCost: number;
  previousCost?: number;
  componentCount: number;
  componentsAdded?: number;
  componentsRemoved?: number;
  componentsModified?: number;
  notes?: string;
  productId: string;
  productName: string;
}

// View Version Details Modal
interface ViewVersionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: BOMVersion | null;
  onEdit?: (version: BOMVersion) => void;
}

export const ViewVersionDetailsModal: React.FC<ViewVersionDetailsModalProps> = ({
  isOpen,
  onClose,
  version,
  onEdit
}) => {
  if (!isOpen || !version) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'previous':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'obsolete':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const costChange = version.previousCost
    ? ((version.totalCost - version.previousCost) / version.previousCost) * 100
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg w-full  max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Eye className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">BOM Version Details</h2>
              <p className="text-sm opacity-90">{version.productName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {/* Version Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Version Information</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-xs text-indigo-600 mb-1">Version Number</p>
                <p className="text-xl font-bold text-indigo-900">{version.versionNumber}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-600 mb-1">Revision Number</p>
                <p className="text-xl font-bold text-purple-900">{version.revisionNumber}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border-2">
                <p className="text-xs text-gray-600 mb-2">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(version.status)}`}>
                  {version.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Change Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Information</h3>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-3">
              <div className="flex items-start space-x-2">
                <User className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Changed By</p>
                  <p className="text-sm font-semibold text-gray-900">{version.changedBy}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Changed Date</p>
                  <p className="text-sm font-semibold text-gray-900">{version.changedDate}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Change Reason</p>
                  <p className="text-sm font-medium text-gray-900">{version.changeReason}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Comparison */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Comparison</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 mb-1">Current Total Cost</p>
                <p className="text-xl font-bold text-blue-900">₹{version.totalCost.toLocaleString()}</p>
              </div>
              {version.previousCost && (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Previous Total Cost</p>
                    <p className="text-xl font-bold text-gray-900">₹{version.previousCost.toLocaleString()}</p>
                  </div>
                  <div className={`p-4 rounded-lg border ${
                    costChange > 0 ? 'bg-red-50 border-red-200' :
                    costChange < 0 ? 'bg-green-50 border-green-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`text-xs mb-1 ${
                      costChange > 0 ? 'text-red-600' :
                      costChange < 0 ? 'text-green-600' :
                      'text-gray-600'
                    }`}>Cost Change</p>
                    <div className="flex items-center space-x-2">
                      {costChange > 0 ? (
                        <TrendingUp className="h-5 w-5 text-red-600" />
                      ) : costChange < 0 ? (
                        <TrendingDown className="h-5 w-5 text-green-600" />
                      ) : (
                        <Minus className="h-5 w-5 text-gray-600" />
                      )}
                      <p className={`text-xl font-bold ${
                        costChange > 0 ? 'text-red-900' :
                        costChange < 0 ? 'text-green-900' :
                        'text-gray-900'
                      }`}>
                        {costChange > 0 ? '+' : ''}{costChange.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Effective Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Effective Dates</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-xs text-green-600 mb-1">Effective From</p>
                  <p className="text-sm font-semibold text-green-900">{version.effectiveFrom}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-xs text-orange-600 mb-1">Effective Until</p>
                  <p className="text-sm font-semibold text-orange-900">
                    {version.effectiveUntil || 'Current Version'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Information */}
          {version.approvedBy && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Approval Information</h3>
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-green-600 mb-1">Approved By</p>
                    <p className="text-sm font-semibold text-green-900">{version.approvedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Approval Date</p>
                    <p className="text-sm font-semibold text-green-900">{version.approvalDate}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Component Changes Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Component Changes Summary</h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                <p className="text-xs text-blue-600 mb-1">Total Components</p>
                <p className="text-2xl font-bold text-blue-900">{version.componentCount}</p>
              </div>
              {version.componentsAdded !== undefined && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                  <p className="text-xs text-green-600 mb-1">Added</p>
                  <p className="text-2xl font-bold text-green-900">+{version.componentsAdded}</p>
                </div>
              )}
              {version.componentsRemoved !== undefined && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
                  <p className="text-xs text-red-600 mb-1">Removed</p>
                  <p className="text-2xl font-bold text-red-900">-{version.componentsRemoved}</p>
                </div>
              )}
              {version.componentsModified !== undefined && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
                  <p className="text-xs text-orange-600 mb-1">Modified</p>
                  <p className="text-2xl font-bold text-orange-900">{version.componentsModified}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {version.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{version.notes}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(version);
                  onClose();
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Version</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Version Modal
interface EditVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<BOMVersion>) => void;
  version: BOMVersion | null;
}

export const EditVersionModal: React.FC<EditVersionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  version
}) => {
  const [formData, setFormData] = useState<Partial<BOMVersion>>({
    notes: version?.notes || '',
    effectiveFrom: version?.effectiveFrom || '',
    effectiveUntil: version?.effectiveUntil || '',
    changeReason: version?.changeReason || '',
    status: version?.status || 'current',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (version) {
      setFormData({
        notes: version.notes || '',
        effectiveFrom: version.effectiveFrom || '',
        effectiveUntil: version.effectiveUntil || '',
        changeReason: version.changeReason || '',
        status: version.status || 'current',
      });
      setErrors({});
    }
  }, [version]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate effective dates
    if (formData.effectiveFrom && formData.effectiveUntil) {
      const fromDate = new Date(formData.effectiveFrom);
      const untilDate = new Date(formData.effectiveUntil);
      if (untilDate <= fromDate) {
        newErrors.effectiveUntil = 'Effective until date must be after effective from date';
      }
    }

    // Status transition rule: cannot change from 'obsolete' to 'current' directly
    if (version?.status === 'obsolete' && formData.status === 'current') {
      newErrors.status = 'Cannot change obsolete version to current directly';
    }

    // Validate change reason if status is changing
    if (version?.status !== formData.status && !formData.changeReason?.trim()) {
      newErrors.changeReason = 'Change reason is required when changing status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave({
      ...formData,
      id: version?.id,
    });
    onClose();
  };

  if (!isOpen || !version) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Edit3 className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Edit Version Metadata</h2>
              <p className="text-sm opacity-90">Version {version.versionNumber} - Rev {version.revisionNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {/* Status Change */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="current">Current</option>
              <option value="previous">Previous</option>
              <option value="obsolete">Obsolete</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.status}</span>
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Current: Active version used for production. Previous: Superseded version. Obsolete: No longer in use.
            </p>
          </div>

          {/* Effective Dates */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Effective Dates</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective From
                </label>
                <input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective Until
                </label>
                <input
                  type="date"
                  value={formData.effectiveUntil}
                  onChange={(e) => setFormData({ ...formData, effectiveUntil: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.effectiveUntil ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.effectiveUntil && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.effectiveUntil}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Change Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Change Reason {formData.status !== version.status && <span className="text-red-600">*</span>}
            </label>
            <textarea
              value={formData.changeReason}
              onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.changeReason ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Describe the reason for this change..."
            />
            {errors.changeReason && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.changeReason}</span>
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Additional notes about this version..."
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Version Modal
interface CreateVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Partial<BOMVersion>) => void;
  sourceVersion: BOMVersion | null;
}

export const CreateVersionModal: React.FC<CreateVersionModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  sourceVersion
}) => {
  const [formData, setFormData] = useState({
    versionNumber: '',
    revisionNumber: '',
    changeReason: '',
    copyComponents: true,
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (sourceVersion && isOpen) {
      const currentVersion = parseFloat(sourceVersion.versionNumber);
      const newVersion = (currentVersion + 0.1).toFixed(1);
      setFormData({
        versionNumber: newVersion,
        revisionNumber: 'A',
        changeReason: '',
        copyComponents: true,
        effectiveFrom: new Date().toISOString().split('T')[0],
      });
      setErrors({});
    }
  }, [sourceVersion, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.versionNumber.trim()) {
      newErrors.versionNumber = 'Version number is required';
    }

    if (!formData.revisionNumber.trim()) {
      newErrors.revisionNumber = 'Revision number is required';
    }

    if (!formData.changeReason.trim()) {
      newErrors.changeReason = 'Change reason is required';
    }

    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = 'Effective from date is required';
    }

    // Validate version number format (uniqueness is enforced server-side on create)
    const versionRegex = /^\d+\.\d+$/;
    if (formData.versionNumber && !versionRegex.test(formData.versionNumber)) {
      newErrors.versionNumber = 'Version number must be in format X.X (e.g., 2.0, 2.1)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // The creating user is stamped server-side from the authenticated request.
    onCreate({
      ...formData,
      status: 'current',
      productId: sourceVersion?.productId,
      productName: sourceVersion?.productName,
      changedDate: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  if (!isOpen || !sourceVersion) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Plus className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Create New Version</h2>
              <p className="text-sm opacity-90">{sourceVersion.productName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {/* Source Version Display */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Source Version</h3>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Current Version</p>
                  <p className="text-lg font-bold text-blue-900">
                    Version {sourceVersion.versionNumber} - Rev {sourceVersion.revisionNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">Components</p>
                  <p className="text-lg font-bold text-blue-900">{sourceVersion.componentCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* New Version Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">New Version Details</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.versionNumber}
                  onChange={(e) => setFormData({ ...formData, versionNumber: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.versionNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="2.0"
                />
                {errors.versionNumber && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.versionNumber}</span>
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">Format: X.X (e.g., 2.0, 2.1)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revision Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.revisionNumber}
                  onChange={(e) => setFormData({ ...formData, revisionNumber: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.revisionNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="A"
                />
                {errors.revisionNumber && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.revisionNumber}</span>
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">Format: A, B, C or 1, 2, 3</p>
              </div>
            </div>
          </div>

          {/* Change Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Change Reason <span className="text-red-600">*</span>
            </label>
            <textarea
              value={formData.changeReason}
              onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.changeReason ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Describe the reason for creating this new version..."
              required
            />
            {errors.changeReason && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.changeReason}</span>
              </p>
            )}
          </div>

          {/* Copy Options */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Copy Options</h3>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-2 border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                <input
                  type="radio"
                  name="copyOption"
                  checked={formData.copyComponents}
                  onChange={() => setFormData({ ...formData, copyComponents: true })}
                  className="mt-0.5 h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Copy className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-900">Copy All Components</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Create new version with all {sourceVersion.componentCount} components from version {sourceVersion.versionNumber}
                  </p>
                </div>
              </label>
              <label className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="radio"
                  name="copyOption"
                  checked={!formData.copyComponents}
                  onChange={() => setFormData({ ...formData, copyComponents: false })}
                  className="mt-0.5 h-4 w-4 text-gray-600 focus:ring-gray-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Start with Empty BOM</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Create new version without components (you can add them later)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Effective From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effective From <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.effectiveFrom ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.effectiveFrom && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.effectiveFrom}</span>
                </p>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Date when this version becomes active</span>
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Version</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
