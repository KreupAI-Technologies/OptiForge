'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter, Edit3, Eye, Trash2, Upload,
  Download, Save, X, CheckCircle, Tag, Grid, List, AlertCircle,
  TrendingUp, DollarSign, Percent, Calculator
} from 'lucide-react';
import { commonMastersService, HsnSac } from '@/services/common-masters.service';
import { pickAndParseCsv } from '@/lib/import';


interface HSNSACCode {
  id: string;
  code: string;
  type: 'HSN' | 'SAC';
  description: string;
  chapterCode: string;
  chapterDescription: string;
  status: 'active' | 'inactive';

  // Tax Information
  taxDetails: {
    defaultGSTRate: number;
    cess?: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    applicableFrom: string;
    applicableTo?: string;
  };

  // Classification
  classification: {
    section?: string;
    heading?: string;
    subHeading?: string;
  };

  // Usage
  usage: {
    domestic: boolean;
    import: boolean;
    export: boolean;
  };

  // Statistics
  statistics: {
    itemsLinked: number;
    transactionsCount: number;
    totalValue?: number;
  };

  // Compliance
  compliance: {
    eWayBillRequired: boolean;
    reverseChargeApplicable: boolean;
    exempted: boolean;
    exemptionReason?: string;
  };

  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

const HSNSACCodeMaster: React.FC = () => {
  const [codes, setCodes] = useState<HSNSACCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<HSNSACCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<HSNSACCode | null>(null);
  const companyId = 'MAIN_COMPANY_ID';

  useEffect(() => {
    loadHsnSacs();
  }, []);

  const loadHsnSacs = async () => {
    try {
      const data = await commonMastersService.getAllHsnSacs();
      // Map API data to component interface if needed, or use any
      const mappedData: any[] = data.map(h => ({
        id: h.id,
        code: h.code,
        description: h.description || '',
        type: h.code.startsWith('99') ? 'SAC' : 'HSN',
        status: h.isActive ? 'active' : 'inactive',
        taxDetails: { defaultGSTRate: h.gstPercentage, cgst: h.gstPercentage / 2, sgst: h.gstPercentage / 2, igst: h.gstPercentage },
        statistics: { itemsLinked: 0, transactionsCount: 0 }
      }));
      setCodes(mappedData);
      setFilteredCodes(mappedData);
    } catch (error) {
      console.error('Failed to load HSN/SAC codes:', error);
    }
  };

  const handleImport = async () => {
    try {
      const rows = await pickAndParseCsv();
      if (!rows) return;
      if (rows.length === 0) { alert('The selected CSV file has no data rows.'); return; }
      const result = await commonMastersService.bulkCreate('hsn-sacs', rows, companyId);
      await loadHsnSacs();
      alert(`Import complete: ${result.created} created, ${result.skipped} skipped (of ${result.total} rows).`);
    } catch (error) {
      console.error('Error importing hsn-sacs:', error);
      alert('Import failed. Please check the CSV format and try again.');
    }
  };

  const handleAddCode = () => {
    setEditingCode(null);
    setShowModal(true);
  };

  const handleEditCode = (code: HSNSACCode) => {
    setEditingCode(code);
    setShowModal(true);
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this HSN/SAC code?')) return;
    try {
      await commonMastersService.deleteHsnSac(id);
      await loadHsnSacs();
    } catch (error) {
      console.error('Failed to delete HSN/SAC code:', error);
      alert('Failed to delete HSN/SAC code.');
    }
  };

  const handleSaveCode = async (data: { code: string; description: string; gstPercentage: number; status: 'active' | 'inactive' }) => {
    try {
      if (editingCode) {
        await commonMastersService.updateHsnSac(editingCode.id, {
          code: data.code,
          description: data.description,
          gstPercentage: data.gstPercentage,
          isActive: data.status === 'active',
        });
      } else {
        await commonMastersService.createHsnSac({
          code: data.code,
          description: data.description,
          gstPercentage: data.gstPercentage,
          companyId,
        });
      }
      setShowModal(false);
      await loadHsnSacs();
    } catch (error) {
      console.error('Failed to save HSN/SAC code:', error);
      alert('Failed to save HSN/SAC code.');
    }
  };

  useEffect(() => {
    let filtered = codes;
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.code.includes(searchTerm) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.type === filterType);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }
    setFilteredCodes(filtered);
  }, [codes, searchTerm, filterType, filterStatus]);

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="">
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                HSN/SAC Code Master
              </h1>
              <p className="text-gray-600 mt-2">Manage tax classification codes for goods and services</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleImport} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button onClick={handleAddCode} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Code
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search HSN/SAC code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="HSN">HSN</option>
              <option value="SAC">SAC</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Codes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{codes.length}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">HSN Codes</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {codes.filter(c => c.type === 'HSN').length}
                </p>
              </div>
              <Tag className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SAC Codes</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {codes.filter(c => c.type === 'SAC').length}
                </p>
              </div>
              <FileText className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items Linked</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {codes.reduce((sum, c) => sum + c.statistics.itemsLinked, 0)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Codes List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">GST Rate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCodes.map(code => (
                <tr key={code.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{code.code}</div>
                    <div className="text-xs text-gray-500">Chapter: {code.chapterCode}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${code.type === 'HSN' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                      {code.type}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900 max-w-md">{code.description}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{code.taxDetails.defaultGSTRate}%</div>
                    <div className="text-xs text-gray-500">
                      CGST: {code.taxDetails.cgst}% | SGST: {code.taxDetails.sgst}%
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{code.statistics.itemsLinked}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${code.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {code.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Eye className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">View</span>
                      </button>
                      <button
                        onClick={() => handleEditCode(code)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        <Edit3 className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCode(code.id)}
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

      {showModal && (
        <HsnSacModal
          code={editingCode}
          onSave={handleSaveCode}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

interface HsnSacModalProps {
  code: HSNSACCode | null;
  onSave: (data: { code: string; description: string; gstPercentage: number; status: 'active' | 'inactive' }) => void;
  onClose: () => void;
}

function HsnSacModal({ code, onSave, onClose }: HsnSacModalProps) {
  const [formData, setFormData] = useState({
    code: code?.code || '',
    description: code?.description || '',
    gstPercentage: code?.taxDetails?.defaultGSTRate ?? 18,
    status: (code?.status || 'active') as 'active' | 'inactive',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      alert('Code is required.');
      return;
    }
    onSave({
      code: formData.code.trim(),
      description: formData.description.trim(),
      gstPercentage: Number(formData.gstPercentage),
      status: formData.status,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {code ? 'Edit HSN/SAC Code' : 'Add New HSN/SAC Code'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-3 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 9403.40"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.gstPercentage}
              onChange={(e) => setFormData({ ...formData, gstPercentage: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="pt-2 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {code ? 'Update Code' : 'Create Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HSNSACCodeMaster;
