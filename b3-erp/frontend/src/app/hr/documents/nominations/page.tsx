'use client';

import { useState, useMemo, useEffect } from 'react';
import { Users, Plus, Edit, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';
import { DocumentManagementService, ComplianceDocument } from '@/services/document-management.service';

interface Nomination {
  id: string;
  nominationType: string;
  nomineeName: string;
  relationship: string;
  dateOfBirth: string;
  sharePercentage: number;
  address: string;
  contactNumber: string;
  aadharNumber?: string;
  submittedOn: string;
  status: 'draft' | 'submitted' | 'approved';
  approvedBy?: string;
  approvedOn?: string;
}

export default function NominationsPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [mockNominations, setMockNominations] = useState<Nomination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Nomination | null>(null);
  const [editForm, setEditForm] = useState<{ nomineeName: string; relationship: string; sharePercentage: number; contactNumber: string }>({ nomineeName: '', relationship: '', sharePercentage: 0, contactNumber: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const emptyAddForm = {
    nominationType: '',
    nomineeName: '',
    relationship: '',
    dateOfBirth: '',
    sharePercentage: '',
    address: '',
    contactNumber: '',
    aadharNumber: '',
  };
  const [addForm, setAddForm] = useState({ ...emptyAddForm });

  const handleCreate = async () => {
    setIsCreating(true);
    setLoadError(null);
    try {
      await HrComplianceDocsService.createDocument({
        docCategory: 'nomination',
        documentType: addForm.nominationType,
        title: addForm.nomineeName,
        status: 'draft',
        meta: {
          relationship: addForm.relationship,
          dateOfBirth: addForm.dateOfBirth,
          sharePercentage: addForm.sharePercentage ? Number(addForm.sharePercentage) : 0,
          address: addForm.address,
          contactNumber: addForm.contactNumber,
          aadharNumber: addForm.aadharNumber,
        },
      });
      await load();
      setAddForm({ ...emptyAddForm });
      setShowAddForm(false);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to create nomination');
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (nom: Nomination) => {
    setEditing(nom);
    setEditForm({
      nomineeName: nom.nomineeName,
      relationship: nom.relationship,
      sharePercentage: nom.sharePercentage,
      contactNumber: nom.contactNumber,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setIsSaving(true);
    try {
      const payload = {
        documentName: editForm.nomineeName,
      } as Partial<ComplianceDocument>;
      await DocumentManagementService.updateComplianceDocument(editing.id, payload);
      setMockNominations(prev => prev.map(n => n.id === editing.id ? { ...n, ...editForm } : n));
      setEditing(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to update nomination');
    } finally {
      setIsSaving(false);
    }
  };

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const rows = await HrComplianceDocsService.getDocuments('nomination');
      const mapped: Nomination[] = rows.map((row) => {
        const meta = (row.meta || {}) as any;
        return {
          id: String(row.id),
          nominationType: row.documentType ?? '',
          nomineeName: row.title ?? '',
          relationship: meta.relationship ?? '',
          dateOfBirth: meta.dateOfBirth ?? '',
          sharePercentage: Number(meta.sharePercentage ?? 0),
          address: meta.address ?? '',
          contactNumber: meta.contactNumber ?? '',
          aadharNumber: meta.aadharNumber ?? '',
          submittedOn: row.uploadedOn ?? '',
          status: (row.status ?? 'draft') as Nomination['status'],
          approvedBy: row.verifiedBy ?? '',
          approvedOn: row.verifiedOn ?? '',
        };
      });
      setMockNominations(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load nominations');
      setMockNominations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredNominations = useMemo(() => {
    return mockNominations.filter(nom => {
      const matchesType = selectedType === 'all' || nom.nominationType === selectedType;
      const matchesStatus = selectedStatus === 'all' || nom.status === selectedStatus;
      return matchesType && matchesStatus;
    });
  }, [selectedType, selectedStatus, mockNominations]);

  const nominationTypes = ['all', ...Array.from(new Set(mockNominations.map(n => n.nominationType)))];

  const stats = {
    total: mockNominations.length,
    approved: mockNominations.filter(n => n.status === 'approved').length,
    submitted: mockNominations.filter(n => n.status === 'submitted').length,
    draft: mockNominations.filter(n => n.status === 'draft').length
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700'
  };

  const statusIcons = {
    draft: Clock,
    submitted: Clock,
    approved: CheckCircle
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nominations</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your EPF, Gratuity, and Insurance nominations</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Nomination
        </button>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading nominations…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Nominations</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.submitted}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.draft}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomination Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {nominationTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {filteredNominations.map(nom => {
          const StatusIcon = statusIcons[nom.status];
          const age = calculateAge(nom.dateOfBirth);

          return (
            <div key={nom.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{nom.nominationType}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${statusColors[nom.status]}`}>
                      <StatusIcon className="h-3 w-3" />
                      {nom.status.charAt(0).toUpperCase() + nom.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-md font-semibold text-gray-800">{nom.nomineeName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Relationship</p>
                  <p className="text-sm font-semibold text-gray-900">{nom.relationship}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Age</p>
                  <p className="text-sm font-semibold text-gray-900">{age} years</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Share Percentage</p>
                  <p className="text-lg font-bold text-blue-600">{nom.sharePercentage}%</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Address</p>
                  <p className="text-sm font-semibold text-gray-900">{nom.address}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Contact Number</p>
                  <p className="text-sm font-semibold text-gray-900">{nom.contactNumber}</p>
                </div>
                {nom.aadharNumber && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Aadhar Number</p>
                    <p className="text-sm font-semibold text-gray-900">{nom.aadharNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Submitted On</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(nom.submittedOn).toLocaleDateString('en-IN')}
                  </p>
                </div>
                {nom.approvedBy && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Approved By</p>
                    <p className="text-sm font-semibold text-gray-900">{nom.approvedBy}</p>
                    <p className="text-xs text-gray-500">{new Date(nom.approvedOn!).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
              </div>

              {nom.status === 'approved' && nom.approvedBy && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                  <div className="flex items-center gap-2 text-green-800 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Approved by <strong>{nom.approvedBy}</strong> on {new Date(nom.approvedOn!).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm">
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                {nom.status !== 'approved' && (
                  <button
                    onClick={() => openEdit(nom)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredNominations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Users className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No nominations found</h3>
          <p className="text-gray-600">No nominations match the selected filters</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Nomination Guidelines
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>• <strong>EPF Nomination (Form 2)</strong>: Mandatory for all EPF members as per EPF Act 1952</li>
          <li>• <strong>EPS Nomination (Form 10-D)</strong>: For pension scheme nomination</li>
          <li>• <strong>Gratuity Nomination (Form F)</strong>: As per Payment of Gratuity Act 1972</li>
          <li>• <strong>Group Insurance</strong>: Nomination for company-provided group life insurance</li>
          <li>• Total share percentage across all nominees must equal 100%</li>
          <li>• Multiple nominees allowed, but minor nominees require guardian details</li>
          <li>• Update nominations within 30 days of any life event (marriage, birth, etc.)</li>
          <li>• Nominee's Aadhar and address proof documents are mandatory</li>
        </ul>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Edit Nomination</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nominee Name</label>
                <input
                  type="text"
                  value={editForm.nomineeName}
                  onChange={(e) => setEditForm(f => ({ ...f, nomineeName: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Relationship</label>
                <input
                  type="text"
                  value={editForm.relationship}
                  onChange={(e) => setEditForm(f => ({ ...f, relationship: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Share Percentage</label>
                <input
                  type="number"
                  value={editForm.sharePercentage}
                  onChange={(e) => setEditForm(f => ({ ...f, sharePercentage: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="text"
                  value={editForm.contactNumber}
                  onChange={(e) => setEditForm(f => ({ ...f, contactNumber: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Add Nomination</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nomination Type</label>
                <input type="text" value={addForm.nominationType} onChange={(e) => setAddForm(f => ({ ...f, nominationType: e.target.value }))} placeholder="e.g., EPF Nomination" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nominee Name</label>
                <input type="text" value={addForm.nomineeName} onChange={(e) => setAddForm(f => ({ ...f, nomineeName: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Relationship</label>
                <input type="text" value={addForm.relationship} onChange={(e) => setAddForm(f => ({ ...f, relationship: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Date of Birth</label>
                <input type="date" value={addForm.dateOfBirth} onChange={(e) => setAddForm(f => ({ ...f, dateOfBirth: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Share Percentage</label>
                <input type="number" value={addForm.sharePercentage} onChange={(e) => setAddForm(f => ({ ...f, sharePercentage: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Contact Number</label>
                <input type="text" value={addForm.contactNumber} onChange={(e) => setAddForm(f => ({ ...f, contactNumber: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                <input type="text" value={addForm.address} onChange={(e) => setAddForm(f => ({ ...f, address: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Aadhar Number (optional)</label>
                <input type="text" value={addForm.aadharNumber} onChange={(e) => setAddForm(f => ({ ...f, aadharNumber: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setAddForm({ ...emptyAddForm }); setShowAddForm(false); }} disabled={isCreating} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleCreate} disabled={isCreating || !addForm.nomineeName.trim()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{isCreating ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
