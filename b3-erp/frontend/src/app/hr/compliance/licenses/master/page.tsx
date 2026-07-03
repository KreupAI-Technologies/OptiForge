'use client';

import { useState, useMemo, useEffect } from 'react';
import { Award, Search, CheckCircle, AlertCircle, Clock, FileText, Download } from 'lucide-react';
import { HrComplianceDocsService, ComplianceLicense } from '@/services/hr-compliance-docs.service';

interface License {
  id: string;
  licenseName: string;
  licenseNumber: string;
  authority: string;
  category: 'labor' | 'factory' | 'safety' | 'environmental' | 'other';
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'pending_renewal';
  location: string;
  applicableTo: string;
  renewalFrequency: 'annual' | 'biennial' | '3_years' | '5_years' | 'lifetime';
  lastRenewalDate?: string;
  contactPerson: string;
  remarks?: string;
}

export default function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await HrComplianceDocsService.getLicenses('license');
        if (!active) return;
        const mapped: License[] = rows.map((r: ComplianceLicense) => ({
          id: r.id,
          licenseName: r.name || '',
          licenseNumber: r.number || '',
          authority: r.authority || '',
          category: (r.category as License['category']) || 'other',
          issueDate: r.issueDate || '',
          expiryDate: r.expiryDate || '',
          status: (r.status as License['status']) || 'active',
          location: r.location || '',
          applicableTo: r.applicableTo || '',
          renewalFrequency: (r.renewalFrequency as License['renewalFrequency']) || 'annual',
          lastRenewalDate: r.lastRenewalDate,
          contactPerson: r.contactPerson || '',
          remarks: r.remarks,
        }));
        setLicenses(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load licenses');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const mockLicenses: License[] = [
    {
      id: '1',
      licenseName: 'Factory License',
      licenseNumber: 'FL/MH/2024/12345',
      authority: 'Chief Inspector of Factories, Maharashtra',
      category: 'factory',
      issueDate: '2024-01-15',
      expiryDate: '2026-01-14',
      status: 'active',
      location: 'Mumbai Manufacturing Unit',
      applicableTo: 'All manufacturing operations',
      renewalFrequency: 'biennial',
      lastRenewalDate: '2024-01-15',
      contactPerson: 'Rajesh Kumar',
      remarks: 'Valid for 250 workers'
    },
    {
      id: '2',
      licenseName: 'Shops & Establishments License',
      licenseNumber: 'SE/MH/2024/67890',
      authority: 'Labour Commissioner, Maharashtra',
      category: 'labor',
      issueDate: '2024-04-01',
      expiryDate: '2025-03-31',
      status: 'expiring_soon',
      location: 'Corporate Office - Mumbai',
      applicableTo: 'Office premises',
      renewalFrequency: 'annual',
      lastRenewalDate: '2024-04-01',
      contactPerson: 'Priya Sharma',
      remarks: 'Renewal due in 2 months'
    },
    {
      id: '3',
      licenseName: 'Contract Labour License',
      licenseNumber: 'CL/MH/2023/45678',
      authority: 'Regional Labour Commissioner',
      category: 'labor',
      issueDate: '2023-06-10',
      expiryDate: '2026-06-09',
      status: 'active',
      location: 'Mumbai Manufacturing Unit',
      applicableTo: 'Contract workers',
      renewalFrequency: '3_years',
      lastRenewalDate: '2023-06-10',
      contactPerson: 'Amit Patel',
      remarks: 'Valid for 100 contract workers'
    },
    {
      id: '4',
      licenseName: 'Professional Tax Registration',
      licenseNumber: 'PT/MH/12345/2024',
      authority: 'Sales Tax Department, Maharashtra',
      category: 'labor',
      issueDate: '2024-02-01',
      expiryDate: '2025-01-31',
      status: 'expiring_soon',
      location: 'All locations in Maharashtra',
      applicableTo: 'All employees',
      renewalFrequency: 'annual',
      lastRenewalDate: '2024-02-01',
      contactPerson: 'Neha Desai',
      remarks: 'Annual renewal required'
    },
    {
      id: '5',
      licenseName: 'Fire Safety Certificate',
      licenseNumber: 'FSC/MH/2024/98765',
      authority: 'Mumbai Fire Brigade',
      category: 'safety',
      issueDate: '2024-03-20',
      expiryDate: '2025-03-19',
      status: 'active',
      location: 'Mumbai Manufacturing Unit',
      applicableTo: 'Factory premises',
      renewalFrequency: 'annual',
      lastRenewalDate: '2024-03-20',
      contactPerson: 'Suresh Mehta'
    },
    {
      id: '6',
      licenseName: 'Environmental Clearance',
      licenseNumber: 'EC/MH/2023/11111',
      authority: 'Maharashtra Pollution Control Board',
      category: 'environmental',
      issueDate: '2023-05-15',
      expiryDate: '2028-05-14',
      status: 'active',
      location: 'Mumbai Manufacturing Unit',
      applicableTo: 'Manufacturing operations',
      renewalFrequency: '5_years',
      lastRenewalDate: '2023-05-15',
      contactPerson: 'Vikram Singh',
      remarks: 'Environmental compliance mandatory'
    },
    {
      id: '7',
      licenseName: 'PF Registration',
      licenseNumber: 'MH/12345/000001',
      authority: 'EPFO Regional Office',
      category: 'labor',
      issueDate: '2020-01-01',
      expiryDate: '2099-12-31',
      status: 'active',
      location: 'All locations',
      applicableTo: 'All employees',
      renewalFrequency: 'lifetime',
      contactPerson: 'Anita Joshi',
      remarks: 'Permanent registration'
    },
    {
      id: '8',
      licenseName: 'ESI Registration',
      licenseNumber: 'ESI/MH/12345',
      authority: 'ESIC Regional Office',
      category: 'labor',
      issueDate: '2020-02-01',
      expiryDate: '2099-12-31',
      status: 'active',
      location: 'All locations',
      applicableTo: 'Employees earning up to ₹21,000',
      renewalFrequency: 'lifetime',
      contactPerson: 'Rahul Verma',
      remarks: 'Permanent registration'
    }
  ];

  const sourceLicenses = licenses.length > 0 ? licenses : mockLicenses;

  const filteredLicenses = useMemo(() => {
    return sourceLicenses.filter(license => {
      const matchesSearch = license.licenseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           license.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           license.authority.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || license.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || license.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus, sourceLicenses]);

  const stats = {
    total: sourceLicenses.length,
    active: sourceLicenses.filter(l => l.status === 'active').length,
    expiringSoon: sourceLicenses.filter(l => l.status === 'expiring_soon').length,
    expired: sourceLicenses.filter(l => l.status === 'expired').length
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-300',
    expiring_soon: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    expired: 'bg-red-100 text-red-700 border-red-300',
    pending_renewal: 'bg-orange-100 text-orange-700 border-orange-300'
  };

  const statusIcons = {
    active: CheckCircle,
    expiring_soon: Clock,
    expired: AlertCircle,
    pending_renewal: Clock
  };

  const categoryColors = {
    labor: 'bg-blue-100 text-blue-700',
    factory: 'bg-purple-100 text-purple-700',
    safety: 'bg-red-100 text-red-700',
    environmental: 'bg-green-100 text-green-700',
    other: 'bg-gray-100 text-gray-700'
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.floor((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="h-6 w-6 text-amber-600" />
          License Master
        </h1>
        <p className="text-sm text-gray-600 mt-1">Centralized repository of all compliance licenses and registrations</p>
      </div>

      {loading && (
        <div className="mb-3 text-sm text-gray-500">Loading licenses…</div>
      )}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error} — showing sample data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Licenses</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
              <p className="text-xs text-blue-700 mt-1">All categories</p>
            </div>
            <Award className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Active</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.active}</p>
              <p className="text-xs text-green-700 mt-1">Valid licenses</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Expiring Soon</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.expiringSoon}</p>
              <p className="text-xs text-yellow-700 mt-1">Within 90 days</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Expired</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.expired}</p>
              <p className="text-xs text-red-700 mt-1">Need renewal</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search licenses..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="all">All Categories</option>
              <option value="labor">Labor</option>
              <option value="factory">Factory</option>
              <option value="safety">Safety</option>
              <option value="environmental">Environmental</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="pending_renewal">Pending Renewal</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredLicenses.length > 0 ? (
          filteredLicenses.map((license) => {
            const StatusIcon = statusIcons[license.status];
            const daysUntilExpiry = getDaysUntilExpiry(license.expiryDate);

            return (
              <div key={license.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{license.licenseName}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 flex items-center gap-1 ${statusColors[license.status]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {license.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${categoryColors[license.category]}`}>
                        {license.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">License No: {license.licenseNumber}</p>
                    <p className="text-xs text-gray-600">Authority: {license.authority}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Issue Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(license.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Expiry Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(license.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Days Until Expiry</p>
                    <p className={`text-sm font-bold ${daysUntilExpiry < 90 ? 'text-red-600' : 'text-green-600'}`}>
                      {daysUntilExpiry > 1000 ? 'Lifetime' : `${daysUntilExpiry} days`}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Renewal Frequency</p>
                    <p className="text-sm font-bold text-gray-900">{license.renewalFrequency.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase font-medium mb-1">Location</p>
                    <p className="text-sm text-blue-900">{license.location}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-xs text-purple-600 uppercase font-medium mb-1">Applicable To</p>
                    <p className="text-sm text-purple-900">{license.applicableTo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Contact Person</p>
                    <p className="text-sm text-gray-900">{license.contactPerson}</p>
                  </div>
                  {license.lastRenewalDate && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 uppercase font-medium mb-1">Last Renewal Date</p>
                      <p className="text-sm text-gray-900">
                        {new Date(license.lastRenewalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>

                {license.remarks && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                    <p className="text-xs text-yellow-600 uppercase font-medium mb-1">Remarks</p>
                    <p className="text-sm text-yellow-900">{license.remarks}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download License
                  </button>
                  {(license.status === 'expiring_soon' || license.status === 'expired') && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                      Initiate Renewal
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Award className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No licenses found</h3>
            <p className="text-gray-600">No licenses match the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
