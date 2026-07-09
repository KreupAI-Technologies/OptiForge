'use client';

import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Eye, Edit3, CheckCircle, AlertCircle, User, MapPin, Calendar, ClipboardList, Hash, Package, FileText, CheckSquare, Play } from 'lucide-react';

// Interfaces
export interface DefectCategory {
  id: string;
  category: string;
  count: number;
  severity?: 'minor' | 'major' | 'critical';
}

export interface Inspection {
  id: string;
  workOrderId: string;
  productName: string;
  productCode: string;
  inspectionType: 'incoming' | 'in-process' | 'final' | 'pre-shipment';
  inspectionDate: string;
  inspector: string;
  inspectorId: string;
  workCenter: string;
  workCenterId: string;
  sampleSize: number;
  defectsFound: number;
  status: 'pending' | 'passed' | 'failed' | 'conditional';
  defectCategories: DefectCategory[];
  remarks?: string;
  approver?: string;
  approvedDate?: string;
  approverComments?: string;
}

// 1. VIEW INSPECTION MODAL
interface ViewInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: Inspection | null;
  onEdit: (inspection: Inspection) => void;
}

export const ViewInspectionModal: React.FC<ViewInspectionModalProps> = ({ isOpen, onClose, inspection, onEdit }) => {
  if (!isOpen || !inspection) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'conditional':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'bg-blue-100 text-blue-800';
      case 'in-process':
        return 'bg-purple-100 text-purple-800';
      case 'final':
        return 'bg-green-100 text-green-800';
      case 'pre-shipment':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'minor':
        return 'bg-yellow-100 text-yellow-700';
      case 'major':
        return 'bg-orange-100 text-orange-700';
      case 'critical':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const passRate = inspection.sampleSize > 0
    ? (((inspection.sampleSize - inspection.defectsFound) / inspection.sampleSize) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg w-full  max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Inspection Details</h2>
            <p className="text-sm opacity-90">ID: {inspection.id}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {/* Inspection Summary Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inspection Summary</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Hash className="h-4 w-4 text-gray-600" />
                  <p className="text-xs text-gray-600">Work Order</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{inspection.workOrderId}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="h-4 w-4 text-gray-600" />
                  <p className="text-xs text-gray-600">Product</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{inspection.productName}</p>
                <p className="text-xs text-gray-600">{inspection.productCode}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <ClipboardList className="h-4 w-4 text-gray-600" />
                  <p className="text-xs text-gray-600">Inspection Type</p>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(inspection.inspectionType)}`}>
                  {inspection.inspectionType.toUpperCase().replace('-', ' ')}
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <p className="text-xs text-gray-600">Inspection Date</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{inspection.inspectionDate}</p>
              </div>
            </div>
          </div>

          {/* Inspector Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inspector Information</h3>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{inspection.inspector}</p>
                  <p className="text-xs text-gray-600">Inspector ID: {inspection.inspectorId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Size and Defects Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Metrics</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 mb-1">Sample Size</p>
                <p className="text-2xl font-bold text-blue-900">{inspection.sampleSize}</p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs text-red-600 mb-1">Defects Found</p>
                <p className="text-2xl font-bold text-red-900">{inspection.defectsFound}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-600 mb-1">Pass Rate</p>
                <p className="text-2xl font-bold text-green-900">{passRate}%</p>
              </div>
            </div>
          </div>

          {/* Defect Categories Breakdown */}
          {inspection.defectCategories && inspection.defectCategories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Defect Categories</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Count
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Severity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inspection.defectCategories.map((defect) => (
                      <tr key={defect.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{defect.category}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{defect.count}</td>
                        <td className="px-4 py-3">
                          {defect.severity && (
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(defect.severity)}`}>
                              {defect.severity.toUpperCase()}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pass/Fail Status with Color-Coded Badge */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inspection Status</h3>
            <div className={`p-4 rounded-lg border-2 ${getStatusColor(inspection.status)}`}>
              <div className="flex items-center space-x-3">
                {inspection.status === 'passed' ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <AlertCircle className="h-6 w-6" />
                )}
                <div>
                  <p className="text-lg font-bold uppercase">{inspection.status}</p>
                  {inspection.status === 'conditional' && (
                    <p className="text-xs mt-1">Product approved with conditions</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Work Center Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Work Center</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{inspection.workCenter}</p>
                  <p className="text-xs text-gray-600">Work Center ID: {inspection.workCenterId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          {inspection.remarks && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Remarks</h3>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-gray-700">{inspection.remarks}</p>
                </div>
              </div>
            </div>
          )}

          {/* Approval Information (if approved) */}
          {inspection.approver && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Approval Information</h3>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Approved By:</span>
                  <span className="text-sm font-semibold text-gray-900">{inspection.approver}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Approved Date:</span>
                  <span className="text-sm font-semibold text-gray-900">{inspection.approvedDate}</span>
                </div>
                {inspection.approverComments && (
                  <div className="pt-2 border-t border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Approver Comments:</p>
                    <p className="text-sm text-gray-700">{inspection.approverComments}</p>
                  </div>
                )}
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
            <button
              onClick={() => {
                onEdit(inspection);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Inspection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. EDIT INSPECTION MODAL
interface EditInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Inspection) => void;
  inspection?: Inspection | null;
  mode?: 'edit' | 'conduct';
}

export const EditInspectionModal: React.FC<EditInspectionModalProps> = ({ isOpen, onClose, onSave, inspection, mode = 'edit' }) => {
  const [formData, setFormData] = useState<Partial<Inspection>>({
    workOrderId: inspection?.workOrderId || '',
    productName: inspection?.productName || '',
    productCode: inspection?.productCode || '',
    inspectionType: inspection?.inspectionType || 'in-process',
    inspectionDate: inspection?.inspectionDate || new Date().toISOString().split('T')[0],
    inspector: inspection?.inspector || '',
    inspectorId: inspection?.inspectorId || '',
    workCenter: inspection?.workCenter || '',
    workCenterId: inspection?.workCenterId || '',
    sampleSize: inspection?.sampleSize || 0,
    defectsFound: inspection?.defectsFound || 0,
    status: inspection?.status || 'pending',
    remarks: inspection?.remarks || '',
  });

  const [defectCategories, setDefectCategories] = useState<DefectCategory[]>(
    inspection?.defectCategories || []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sampleSize || formData.sampleSize <= 0) {
      newErrors.sampleSize = 'Sample size must be greater than 0';
    }

    if (formData.defectsFound === undefined || formData.defectsFound < 0) {
      newErrors.defectsFound = 'Defects found cannot be negative';
    }

    if (formData.defectsFound! > formData.sampleSize!) {
      newErrors.defectsFound = 'Defects found cannot exceed sample size';
    }

    if (!formData.workOrderId) {
      newErrors.workOrderId = 'Work order is required';
    }

    if (!formData.productName) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.inspector) {
      newErrors.inspector = 'Inspector is required';
    }

    if (!formData.workCenter) {
      newErrors.workCenter = 'Work center is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const inspectionData: Inspection = {
      id: inspection?.id || `INS-${Date.now()}`,
      workOrderId: formData.workOrderId!,
      productName: formData.productName!,
      productCode: formData.productCode!,
      inspectionType: formData.inspectionType!,
      inspectionDate: formData.inspectionDate!,
      inspector: formData.inspector!,
      inspectorId: formData.inspectorId!,
      workCenter: formData.workCenter!,
      workCenterId: formData.workCenterId!,
      sampleSize: formData.sampleSize!,
      defectsFound: formData.defectsFound!,
      status: formData.status!,
      defectCategories: defectCategories,
      remarks: formData.remarks,
    };

    onSave(inspectionData);
    onClose();
  };

  const handleAddDefectCategory = () => {
    setDefectCategories([
      ...defectCategories,
      { id: `defect-${Date.now()}`, category: '', count: 0, severity: 'minor' }
    ]);
  };

  const handleRemoveDefectCategory = (index: number) => {
    setDefectCategories(defectCategories.filter((_, i) => i !== index));
  };

  const handleDefectCategoryChange = (index: number, field: keyof DefectCategory, value: any) => {
    const updated = [...defectCategories];
    (updated[index] as any)[field] = value;
    setDefectCategories(updated);
  };

  if (!isOpen) return null;

  const inspectors = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis'];
  const workCenters = ['Assembly Line 1', 'Assembly Line 2', 'Quality Lab', 'Packaging', 'Welding Station'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg w-full  max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {mode === 'conduct' ? 'Conduct Inspection' : (inspection ? 'Edit Inspection' : 'Create Inspection')}
          </h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Order ID *</label>
                <input
                  type="text"
                  value={formData.workOrderId}
                  onChange={(e) => setFormData({ ...formData, workOrderId: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.workOrderId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="WO-2024-001"
                  required
                />
                {errors.workOrderId && <p className="text-xs text-red-600 mt-1">{errors.workOrderId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.productName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Premium Modular Kitchen"
                  required
                />
                {errors.productName && <p className="text-xs text-red-600 mt-1">{errors.productName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Code</label>
                <input
                  type="text"
                  value={formData.productCode}
                  onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="PMK-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Type *</label>
                <select
                  value={formData.inspectionType}
                  onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="incoming">Incoming Inspection</option>
                  <option value="in-process">In-Process Inspection</option>
                  <option value="final">Final Inspection</option>
                  <option value="pre-shipment">Pre-Shipment Inspection</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Date *</label>
                <input
                  type="date"
                  value={formData.inspectionDate}
                  onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="conditional">Conditional Pass</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inspector and Work Center */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Assignment</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inspector *</label>
                <select
                  value={formData.inspector}
                  onChange={(e) => {
                    const selectedInspector = e.target.value;
                    setFormData({
                      ...formData,
                      inspector: selectedInspector,
                      inspectorId: `INS-${selectedInspector.replace(/\s/g, '')}`
                    });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.inspector ? 'border-red-500' : 'border-gray-300'
                    }`}
                  required
                >
                  <option value="">Select Inspector</option>
                  {inspectors.map((inspector) => (
                    <option key={inspector} value={inspector}>{inspector}</option>
                  ))}
                </select>
                {errors.inspector && <p className="text-xs text-red-600 mt-1">{errors.inspector}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Center *</label>
                <select
                  value={formData.workCenter}
                  onChange={(e) => {
                    const selectedWorkCenter = e.target.value;
                    setFormData({
                      ...formData,
                      workCenter: selectedWorkCenter,
                      workCenterId: `WC-${selectedWorkCenter.replace(/\s/g, '')}`
                    });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.workCenter ? 'border-red-500' : 'border-gray-300'
                    }`}
                  required
                >
                  <option value="">Select Work Center</option>
                  {workCenters.map((workCenter) => (
                    <option key={workCenter} value={workCenter}>{workCenter}</option>
                  ))}
                </select>
                {errors.workCenter && <p className="text-xs text-red-600 mt-1">{errors.workCenter}</p>}
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Metrics</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sample Size *</label>
                <input
                  type="number"
                  value={formData.sampleSize}
                  onChange={(e) => setFormData({ ...formData, sampleSize: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.sampleSize ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="100"
                  min="1"
                  required
                />
                {errors.sampleSize && <p className="text-xs text-red-600 mt-1">{errors.sampleSize}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Defects Found *</label>
                <input
                  type="number"
                  value={formData.defectsFound}
                  onChange={(e) => setFormData({ ...formData, defectsFound: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.defectsFound ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="5"
                  min="0"
                  required
                />
                {errors.defectsFound && <p className="text-xs text-red-600 mt-1">{errors.defectsFound}</p>}
              </div>
            </div>
          </div>

          {/* Defect Categories Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Defect Categories</h3>
              <button
                type="button"
                onClick={handleAddDefectCategory}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Category</span>
              </button>
            </div>

            {defectCategories.length > 0 ? (
              <div className="space-y-3">
                {defectCategories.map((defect, index) => (
                  <div key={defect.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-12 gap-3 items-start">
                      <div className="col-span-5">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                        <input
                          type="text"
                          value={defect.category}
                          onChange={(e) => handleDefectCategoryChange(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Scratch, Dent, Misalignment"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Count</label>
                        <input
                          type="number"
                          value={defect.count}
                          onChange={(e) => handleDefectCategoryChange(index, 'count', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div className="col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                        <select
                          value={defect.severity}
                          onChange={(e) => handleDefectCategoryChange(index, 'severity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="minor">Minor</option>
                          <option value="major">Major</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>

                      <div className="col-span-1 pt-6">
                        <button
                          type="button"
                          onClick={() => handleRemoveDefectCategory(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No defect categories added. Click &quot;Add Category&quot; to start.
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remarks</h3>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Additional notes or observations about the inspection..."
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
              <span>
                {mode === 'conduct' ? 'Submit Results' : (inspection ? 'Update Inspection' : 'Create Inspection')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. APPROVE INSPECTION MODAL
interface ApproveInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (decision: 'approve' | 'reject' | 'request-changes', comments: string, signature: string) => void;
  inspection: Inspection | null;
}

export const ApproveInspectionModal: React.FC<ApproveInspectionModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  inspection
}) => {
  const [decision, setDecision] = useState<'approve' | 'reject' | 'request-changes'>('approve');
  const [comments, setComments] = useState('');
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!comments.trim()) {
      setError('Approver comments are required');
      return;
    }

    if (!signature.trim()) {
      setError('Signature/authorization is required');
      return;
    }

    onApprove(decision, comments, signature);

    // Reset form
    setDecision('approve');
    setComments('');
    setSignature('');
    setError('');
    onClose();
  };

  if (!isOpen || !inspection) return null;

  const getDecisionDescription = () => {
    switch (decision) {
      case 'approve':
        return 'The inspection results are satisfactory and the product/material is approved for next stage.';
      case 'reject':
        return 'The inspection results are unsatisfactory. The product/material is rejected and requires corrective action.';
      case 'request-changes':
        return 'The inspection results require further review or minor corrections before final approval.';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-2 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Approve Inspection</h2>
            <p className="text-sm opacity-90">ID: {inspection.id}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {/* Inspection Summary (Read-only) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inspection Summary</h3>
            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-xs text-gray-600 mb-1">Work Order</p>
                <p className="text-sm font-semibold text-gray-900">{inspection.workOrderId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Product</p>
                <p className="text-sm font-semibold text-gray-900">{inspection.productName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Inspector</p>
                <p className="text-sm font-semibold text-gray-900">{inspection.inspector}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Inspection Date</p>
                <p className="text-sm font-semibold text-gray-900">{inspection.inspectionDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Sample Size</p>
                <p className="text-sm font-semibold text-gray-900">{inspection.sampleSize}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Defects Found</p>
                <p className="text-sm font-semibold text-gray-900">{inspection.defectsFound}</p>
              </div>
            </div>
          </div>

          {/* Approval Decision */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Approval Decision *</h3>
            <div className="space-y-3">
              <label className="flex items-start p-3 bg-white border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="decision"
                  value="approve"
                  checked={decision === 'approve'}
                  onChange={(e) => setDecision(e.target.value as any)}
                  className="mt-1 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <div className="ml-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">Approve</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Accept inspection results and approve for next stage
                  </p>
                </div>
              </label>

              <label className="flex items-start p-3 bg-white border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="decision"
                  value="reject"
                  checked={decision === 'reject'}
                  onChange={(e) => setDecision(e.target.value as any)}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <div className="ml-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-semibold text-gray-900">Reject</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Reject inspection results and require corrective action
                  </p>
                </div>
              </label>

              <label className="flex items-start p-3 bg-white border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="decision"
                  value="request-changes"
                  checked={decision === 'request-changes'}
                  onChange={(e) => setDecision(e.target.value as any)}
                  className="mt-1 h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <div className="ml-3">
                  <div className="flex items-center space-x-2">
                    <Edit3 className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-semibold text-gray-900">Request Changes</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Request additional review or minor corrections
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Change Status Explanation */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Decision Impact</p>
                <p className="text-sm text-blue-800">{getDecisionDescription()}</p>
              </div>
            </div>
          </div>

          {/* Approver Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approver Comments *
            </label>
            <textarea
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                setError('');
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${error && !comments.trim() ? 'border-red-500' : 'border-gray-300'
                }`}
              rows={4}
              placeholder="Provide detailed comments about your decision..."
              required
            />
            {error && !comments.trim() && (
              <p className="text-xs text-red-600 mt-1">Comments are required</p>
            )}
          </div>

          {/* Signature/Authorization Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digital Signature / Authorization Code *
            </label>
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={signature}
                onChange={(e) => {
                  setSignature(e.target.value);
                  setError('');
                }}
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${error && !signature.trim() ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter your name or authorization code"
                required
              />
            </div>
            {error && !signature.trim() && (
              <p className="text-xs text-red-600 mt-1">Signature/authorization is required</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              By providing your signature, you confirm the accuracy of your decision and accept responsibility for this approval.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

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
              className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${decision === 'approve'
                ? 'bg-green-600 hover:bg-green-700'
                : decision === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-orange-600 hover:bg-orange-700'
                }`}
            >
              <CheckCircle className="h-4 w-4" />
              <span>Submit Decision</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
