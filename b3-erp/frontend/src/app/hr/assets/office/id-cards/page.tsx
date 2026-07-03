'use client';

import { useState, useMemo, useEffect } from 'react';
import { CreditCard, User, Calendar, AlertCircle } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface IDCard {
  id: string;
  cardNumber: string;
  cardType: 'employee' | 'contractor' | 'temp';
  issuedTo: string;
  employeeCode: string;
  department: string;
  designation: string;
  issueDate: string;
  expiryDate?: string;
  status: 'active' | 'inactive' | 'lost' | 'expired' | 'damaged';
  bloodGroup?: string;
  emergencyContact: string;
  photo: boolean;
  location: string;
  issuedBy: string;
  remarks?: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [idCards, setIdCards] = useState<IDCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrAssetsService.getIdCards();
        const cardTypes: IDCard['cardType'][] = ['employee', 'contractor', 'temp'];
        const statuses: IDCard['status'][] = ['active', 'inactive', 'lost', 'expired', 'damaged'];
        const mapped: IDCard[] = raw.map((r, idx) => ({
          id: String(r.id ?? idx),
          cardNumber: r.cardNumber ?? '',
          cardType: cardTypes.includes(r.cardType as IDCard['cardType'])
            ? (r.cardType as IDCard['cardType'])
            : 'employee',
          issuedTo: r.issuedTo ?? '',
          employeeCode: r.employeeCode ?? '',
          department: r.department ?? '',
          designation: r.designation ?? '',
          issueDate: r.issueDate ?? '',
          expiryDate: r.expiryDate ?? undefined,
          status: statuses.includes(r.status as IDCard['status'])
            ? (r.status as IDCard['status'])
            : 'active',
          bloodGroup: r.bloodGroup ?? undefined,
          emergencyContact: r.emergencyContact ?? '',
          photo: Boolean(r.photo),
          location: r.location ?? '',
          issuedBy: r.issuedBy ?? '',
          remarks: r.remarks ?? undefined,
        }));
        if (!cancelled) setIdCards(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load ID cards');
          setIdCards([]);
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

  const filteredCards = idCards.filter(c => {
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (selectedType !== 'all' && c.cardType !== selectedType) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: idCards.length,
    active: idCards.filter(c => c.status === 'active').length,
    lost: idCards.filter(c => c.status === 'lost').length,
    damaged: idCards.filter(c => c.status === 'damaged').length,
    expired: idCards.filter(c => c.status === 'expired').length
  }), [idCards]);

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    lost: 'bg-red-100 text-red-700',
    damaged: 'bg-orange-100 text-orange-700',
    expired: 'bg-gray-100 text-gray-700'
  };

  const cardTypeColors = {
    employee: 'bg-blue-100 text-blue-700',
    contractor: 'bg-orange-100 text-orange-700',
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
        <h1 className="text-2xl font-bold text-gray-900">ID Cards Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage employee identification cards</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading ID cards…
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
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <p className="text-sm font-medium text-red-600">Lost</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.lost}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <p className="text-sm font-medium text-orange-600">Damaged</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{stats.damaged}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Expired</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.expired}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="lost">Lost</option>
              <option value="damaged">Damaged</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Types</option>
              <option value="employee">Employee</option>
              <option value="contractor">Contractor</option>
              <option value="temp">Temporary</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
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
                      <CreditCard className="h-6 w-6 text-blue-600" />
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
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[card.status]}`}>
                      {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                    </span>
                    {expiringSoon && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-50 text-yellow-700 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Expires in {daysUntilExpiry} days
                      </span>
                    )}
                    {card.photo && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-green-50 text-green-700">
                        Photo ID
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

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                {card.bloodGroup && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-red-600 uppercase font-medium mb-1">Blood Group</p>
                    <p className="text-lg font-bold text-red-700">{card.bloodGroup}</p>
                  </div>
                )}
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 uppercase font-medium mb-1">Emergency Contact</p>
                  <p className="text-sm font-semibold text-blue-900">{card.emergencyContact}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Issued By</p>
                  <p className="text-sm font-semibold text-gray-900">{card.issuedBy}</p>
                </div>
              </div>

              {card.remarks && (
                <div className={`rounded-lg p-3 mb-2 ${card.status === 'lost' || card.status === 'damaged' ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                  <p className={`text-xs uppercase font-medium mb-1 flex items-center gap-1 ${card.status === 'lost' || card.status === 'damaged' ? 'text-yellow-700' : 'text-gray-600'}`}>
                    {(card.status === 'lost' || card.status === 'damaged') && <AlertCircle className="h-3 w-3" />}
                    Remarks
                  </p>
                  <p className={`text-sm ${card.status === 'lost' || card.status === 'damaged' ? 'text-yellow-800' : 'text-gray-700'}`}>{card.remarks}</p>
                </div>
              )}

              <div className="flex gap-2">
                {card.status === 'active' && (
                  <>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                      View Details
                    </button>
                    <button className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium text-sm">
                      Print Card
                    </button>
                  </>
                )}
                {(card.status === 'lost' || card.status === 'damaged') && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                    Issue Replacement
                  </button>
                )}
                {card.status === 'expired' && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                    Renew Card
                  </button>
                )}
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
