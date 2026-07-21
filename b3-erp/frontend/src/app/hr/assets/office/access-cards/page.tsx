'use client';

import { useState, useMemo, useEffect } from 'react';
import { Key, User, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

function parseAccessZones(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((z) => String(z));
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((z) => String(z)) : [];
    } catch {
      return [];
    }
  }
  return [];
}

interface AccessCard {
  id: string;
  cardNumber: string;
  cardType: 'employee' | 'contractor' | 'visitor' | 'temp';
  issuedTo: string;
  employeeCode: string;
  department: string;
  designation: string;
  issueDate: string;
  expiryDate?: string;
  status: 'active' | 'inactive' | 'lost' | 'expired' | 'blocked';
  accessLevel: 'basic' | 'standard' | 'elevated' | 'admin';
  accessZones: string[];
  location: string;
  issuedBy: string;
  lastUsed?: string;
  remarks?: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('all');
  const [accessCards, setAccessCards] = useState<AccessCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AccessCard | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ issuedTo: '', cardNumber: '', employeeCode: '', department: '', designation: '', cardType: 'employee' as AccessCard['cardType'], accessLevel: 'basic' as AccessCard['accessLevel'], accessZones: '', location: '', issuedBy: '' });

  // NOTE: HrAssetsService exposes no access-card write endpoint (only getAccessCards read + createAssetRequest/updateAssetRequest).
  // Until a backend access-card mutation endpoint exists, the write actions below optimistically update local `accessCards` state only.
  const handleAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    const newCard: AccessCard = {
      id: Date.now().toString(),
      cardNumber: addForm.cardNumber,
      cardType: addForm.cardType,
      issuedTo: addForm.issuedTo,
      employeeCode: addForm.employeeCode,
      department: addForm.department,
      designation: addForm.designation,
      issueDate: today,
      status: 'active',
      accessLevel: addForm.accessLevel,
      accessZones: addForm.accessZones ? addForm.accessZones.split(',').map(s => s.trim()).filter(Boolean) : [],
      location: addForm.location,
      issuedBy: addForm.issuedBy,
    };
    setAccessCards(prev => [newCard, ...prev]);
    setShowAdd(false);
    setAddForm({ issuedTo: '', cardNumber: '', employeeCode: '', department: '', designation: '', cardType: 'employee', accessLevel: 'basic', accessZones: '', location: '', issuedBy: '' });
  };

  const handleDeactivate = (card: AccessCard) => {
    setAccessCards(prev => prev.map(c => c.id === card.id ? { ...c, status: 'inactive' } : c));
  };

  const handleReplace = (card: AccessCard) => {
    const today = new Date().toISOString().split('T')[0];
    setAccessCards(prev => prev.map(c => c.id === card.id ? { ...c, status: 'active', remarks: `Replacement issued ${today}` } : c));
  };

  const handleRenew = (card: AccessCard) => {
    const next = new Date();
    next.setFullYear(next.getFullYear() + 1);
    const nextIso = next.toISOString().split('T')[0];
    setAccessCards(prev => prev.map(c => c.id === card.id ? { ...c, status: 'active', expiryDate: nextIso } : c));
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrAssetsService.getAccessCards();
        const cardTypes: AccessCard['cardType'][] = ['employee', 'contractor', 'visitor', 'temp'];
        const statuses: AccessCard['status'][] = ['active', 'inactive', 'lost', 'expired', 'blocked'];
        const levels: AccessCard['accessLevel'][] = ['basic', 'standard', 'elevated', 'admin'];
        const mapped: AccessCard[] = raw.map((r, idx) => ({
          id: String(r.id ?? idx),
          cardNumber: r.cardNumber ?? '',
          cardType: cardTypes.includes(r.cardType as AccessCard['cardType'])
            ? (r.cardType as AccessCard['cardType'])
            : 'employee',
          issuedTo: r.issuedTo ?? '',
          employeeCode: r.employeeCode ?? '',
          department: r.department ?? '',
          designation: r.designation ?? '',
          issueDate: r.issueDate ?? '',
          expiryDate: r.expiryDate ?? undefined,
          status: statuses.includes(r.status as AccessCard['status'])
            ? (r.status as AccessCard['status'])
            : 'active',
          accessLevel: levels.includes(r.accessLevel as AccessCard['accessLevel'])
            ? (r.accessLevel as AccessCard['accessLevel'])
            : 'basic',
          accessZones: parseAccessZones(r.accessZones),
          location: r.location ?? '',
          issuedBy: r.issuedBy ?? '',
          lastUsed: r.lastUsed ?? undefined,
          remarks: r.remarks ?? undefined,
        }));
        if (!cancelled) setAccessCards(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load access cards');
          setAccessCards([]);
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

  const filteredCards = accessCards.filter(c => {
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (selectedType !== 'all' && c.cardType !== selectedType) return false;
    if (selectedAccessLevel !== 'all' && c.accessLevel !== selectedAccessLevel) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: accessCards.length,
    active: accessCards.filter(c => c.status === 'active').length,
    inactive: accessCards.filter(c => c.status === 'inactive').length,
    lost: accessCards.filter(c => c.status === 'lost').length,
    expired: accessCards.filter(c => c.status === 'expired').length
  }), [accessCards]);

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    lost: 'bg-red-100 text-red-700',
    expired: 'bg-orange-100 text-orange-700',
    blocked: 'bg-red-100 text-red-700'
  };

  const accessLevelColors = {
    basic: 'bg-gray-100 text-gray-700',
    standard: 'bg-blue-100 text-blue-700',
    elevated: 'bg-purple-100 text-purple-700',
    admin: 'bg-red-100 text-red-700'
  };

  const cardTypeColors = {
    employee: 'bg-blue-100 text-blue-700',
    contractor: 'bg-orange-100 text-orange-700',
    visitor: 'bg-green-100 text-green-700',
    temp: 'bg-yellow-100 text-yellow-700'
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Access Cards Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage and track access control cards</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading access cards…
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
          <p className="text-sm font-medium text-blue-600">Total Cards</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.active}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Inactive</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inactive}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <p className="text-sm font-medium text-red-600">Lost</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.lost}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <p className="text-sm font-medium text-orange-600">Expired</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{stats.expired}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="lost">Lost</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Types</option>
              <option value="employee">Employee</option>
              <option value="contractor">Contractor</option>
              <option value="visitor">Visitor</option>
              <option value="temp">Temporary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
            <select value={selectedAccessLevel} onChange={(e) => setSelectedAccessLevel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Levels</option>
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="elevated">Elevated</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setShowAdd(true)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Issue New Card
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredCards.map(card => {
          const daysUntilExpiry = card.expiryDate ? getDaysUntilExpiry(card.expiryDate) : null;
          const expiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

          return (
            <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Key className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{card.issuedTo}</h3>
                      <p className="text-sm text-gray-600">Card: {card.cardNumber} • {card.employeeCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${cardTypeColors[card.cardType]}`}>
                      {card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${accessLevelColors[card.accessLevel]}`}>
                      {card.accessLevel.charAt(0).toUpperCase() + card.accessLevel.slice(1)} Access
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[card.status]}`}>
                      {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                    </span>
                    {expiringSoon && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-50 text-yellow-700 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Expires in {daysUntilExpiry} days
                      </span>
                    )}
                  </div>
                </div>
                {card.expiryDate && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Expires On</p>
                    <p className="text-lg font-bold text-blue-600">{new Date(card.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Department</p>
                  <p className="text-sm font-semibold text-gray-900">{card.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Designation</p>
                  <p className="text-sm font-semibold text-gray-900">{card.designation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Issue Date</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {new Date(card.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                  <p className="text-sm font-semibold text-gray-900">{card.location}</p>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Access Zones</p>
                <div className="flex flex-wrap gap-2">
                  {card.accessZones.map((zone, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                      <CheckCircle className="h-3 w-3" />
                      {zone}
                    </span>
                  ))}
                </div>
              </div>

              {card.lastUsed && (
                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Last Used</p>
                  <p className="text-sm font-semibold text-gray-900">{card.lastUsed}</p>
                </div>
              )}

              {card.remarks && (
                <div className="bg-yellow-50 rounded-lg p-3 mb-2 border border-yellow-200">
                  <p className="text-xs text-yellow-700 uppercase font-medium mb-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Remarks
                  </p>
                  <p className="text-sm text-yellow-800">{card.remarks}</p>
                </div>
              )}

              <div className="flex gap-2">
                {card.status === 'active' && (
                  <>
                    <button onClick={() => setSelected(card)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                      View Access Log
                    </button>
                    <button onClick={() => handleDeactivate(card)} className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium text-sm">
                      Deactivate
                    </button>
                  </>
                )}
                {card.status === 'lost' && (
                  <button onClick={() => handleReplace(card)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                    Issue Replacement
                  </button>
                )}
                {card.status === 'expired' && (
                  <button onClick={() => handleRenew(card)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                    Renew Card
                  </button>
                )}
                <button onClick={() => setSelected(card)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Access Card Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Issued To</p>
                <p className="text-sm font-semibold text-gray-900">{selected.issuedTo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Card Number</p>
                <p className="text-sm font-semibold text-gray-900">{selected.cardNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Employee Code</p>
                <p className="text-sm font-semibold text-gray-900">{selected.employeeCode}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Card Type</p>
                <p className="text-sm font-semibold text-gray-900">{selected.cardType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Access Level</p>
                <p className="text-sm font-semibold text-gray-900">{selected.accessLevel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Department</p>
                <p className="text-sm font-semibold text-gray-900">{selected.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Designation</p>
                <p className="text-sm font-semibold text-gray-900">{selected.designation}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p>
                <p className="text-sm font-semibold text-gray-900">{selected.status}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Issue Date</p>
                <p className="text-sm font-semibold text-gray-900">{selected.issueDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Expiry Date</p>
                <p className="text-sm font-semibold text-gray-900">{selected.expiryDate || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Access Zones</p>
                <p className="text-sm font-semibold text-gray-900">{selected.accessZones.join(', ') || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Last Used</p>
                <p className="text-sm font-semibold text-gray-900">{selected.lastUsed || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                <p className="text-sm font-semibold text-gray-900">{selected.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Issued By</p>
                <p className="text-sm font-semibold text-gray-900">{selected.issuedBy}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Remarks</p>
                <p className="text-sm font-semibold text-gray-900">{selected.remarks || '—'}</p>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={() => setSelected(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Issue New Card</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issued To</label>
                <input value={addForm.issuedTo} onChange={(e) => setAddForm({ ...addForm, issuedTo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input value={addForm.cardNumber} onChange={(e) => setAddForm({ ...addForm, cardNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                <input value={addForm.employeeCode} onChange={(e) => setAddForm({ ...addForm, employeeCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input value={addForm.department} onChange={(e) => setAddForm({ ...addForm, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input value={addForm.designation} onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
                <select value={addForm.cardType} onChange={(e) => setAddForm({ ...addForm, cardType: e.target.value as AccessCard['cardType'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="employee">Employee</option>
                  <option value="contractor">Contractor</option>
                  <option value="visitor">Visitor</option>
                  <option value="temp">Temporary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                <select value={addForm.accessLevel} onChange={(e) => setAddForm({ ...addForm, accessLevel: e.target.value as AccessCard['accessLevel'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="elevated">Elevated</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input value={addForm.location} onChange={(e) => setAddForm({ ...addForm, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issued By</label>
                <input value={addForm.issuedBy} onChange={(e) => setAddForm({ ...addForm, issuedBy: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Zones</label>
                <input value={addForm.accessZones} onChange={(e) => setAddForm({ ...addForm, accessZones: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-500 mt-1">Comma-separated list of zones (e.g. Lobby, Floor 2, Server Room)</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                Cancel
              </button>
              <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
