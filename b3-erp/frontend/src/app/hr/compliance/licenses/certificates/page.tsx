'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileCheck, Search, CheckCircle, Download, Eye, Upload } from 'lucide-react';
import { HrComplianceDocsService, ComplianceLicense } from '@/services/hr-compliance-docs.service';

interface Certificate {
  id: string;
  certificateName: string;
  certificateNumber: string;
  issuingAuthority: string;
  category: 'compliance' | 'training' | 'inspection' | 'audit' | 'other';
  issueDate: string;
  validUntil?: string;
  status: 'valid' | 'expired' | 'pending_verification';
  location: string;
  relatedLicense?: string;
  documentUrl?: string;
  verifiedBy?: string;
  verificationDate?: string;
  remarks?: string;
}

export default function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await HrComplianceDocsService.getLicenses('certificate');
        if (!active) return;
        const mapped: Certificate[] = rows.map((r: ComplianceLicense) => ({
          id: r.id,
          certificateName: r.name || '',
          certificateNumber: r.number || '',
          issuingAuthority: r.authority || '',
          category: (r.category as Certificate['category']) || 'other',
          issueDate: r.issueDate || '',
          validUntil: r.validUntil,
          status: (r.status as Certificate['status']) || 'valid',
          location: r.location || '',
          relatedLicense: r.relatedLicense,
          documentUrl: r.documentUrl,
          verifiedBy: r.verifiedBy,
          verificationDate: r.verificationDate,
          remarks: r.remarks,
        }));
        setCertificates(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load certificates');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const mockCertificates: Certificate[] = [
    {
      id: '1',
      certificateName: 'Factory Safety Inspection Certificate',
      certificateNumber: 'FSI/MH/2024/001',
      issuingAuthority: 'Factory Inspectorate, Maharashtra',
      category: 'inspection',
      issueDate: '2024-08-15',
      validUntil: '2025-08-14',
      status: 'valid',
      location: 'Mumbai Manufacturing Unit',
      relatedLicense: 'Factory License FL/MH/2024/12345',
      verifiedBy: 'Rajesh Kumar',
      verificationDate: '2024-08-16',
      remarks: 'Annual safety inspection completed successfully'
    },
    {
      id: '2',
      certificateName: 'Fire Safety Compliance Certificate',
      certificateNumber: 'FSC/MH/2024/98765',
      issuingAuthority: 'Mumbai Fire Brigade',
      category: 'compliance',
      issueDate: '2024-03-20',
      validUntil: '2025-03-19',
      status: 'valid',
      location: 'Mumbai Manufacturing Unit',
      relatedLicense: 'Fire Safety Certificate',
      verifiedBy: 'Suresh Mehta',
      verificationDate: '2024-03-21',
      remarks: 'All fire safety equipment verified and functional'
    },
    {
      id: '3',
      certificateName: 'Environmental Compliance Certificate',
      certificateNumber: 'ECC/MH/2024/555',
      issuingAuthority: 'Maharashtra Pollution Control Board',
      category: 'audit',
      issueDate: '2024-06-10',
      validUntil: '2025-06-09',
      status: 'valid',
      location: 'Mumbai Manufacturing Unit',
      relatedLicense: 'Environmental Clearance EC/MH/2023/11111',
      verifiedBy: 'Vikram Singh',
      verificationDate: '2024-06-11',
      remarks: 'All emission levels within permissible limits'
    },
    {
      id: '4',
      certificateName: 'Boiler Inspection Certificate',
      certificateNumber: 'BIC/MH/2024/789',
      issuingAuthority: 'Boiler Inspectorate, Maharashtra',
      category: 'inspection',
      issueDate: '2024-05-01',
      validUntil: '2025-04-30',
      status: 'valid',
      location: 'Mumbai Manufacturing Unit',
      verifiedBy: 'Anil Desai',
      verificationDate: '2024-05-02',
      remarks: 'Boiler pressure test conducted successfully'
    },
    {
      id: '5',
      certificateName: 'Fire Safety Training Certificate',
      certificateNumber: 'FST/2024/156',
      issuingAuthority: 'National Safety Council',
      category: 'training',
      issueDate: '2024-07-15',
      validUntil: '2027-07-14',
      status: 'valid',
      location: 'All Locations',
      verifiedBy: 'Priya Sharma',
      verificationDate: '2024-07-16',
      remarks: '45 employees completed fire safety training'
    },
    {
      id: '6',
      certificateName: 'Electrical Safety Inspection Certificate',
      certificateNumber: 'ESI/MH/2024/321',
      issuingAuthority: 'Electrical Inspectorate, Maharashtra',
      category: 'inspection',
      issueDate: '2024-04-10',
      validUntil: '2025-04-09',
      status: 'valid',
      location: 'Mumbai Manufacturing Unit',
      verifiedBy: 'Rahul Verma',
      verificationDate: '2024-04-11',
      remarks: 'All electrical installations inspected and certified'
    },
    {
      id: '7',
      certificateName: 'Water Quality Test Certificate',
      certificateNumber: 'WQT/MH/2024/444',
      issuingAuthority: 'Maharashtra Pollution Control Board',
      category: 'audit',
      issueDate: '2024-09-05',
      validUntil: '2025-03-04',
      status: 'valid',
      location: 'Mumbai Manufacturing Unit',
      verifiedBy: 'Vikram Singh',
      verificationDate: '2024-09-06',
      remarks: 'Effluent treatment plant functioning properly'
    },
    {
      id: '8',
      certificateName: 'ISO 45001:2018 Certificate',
      certificateNumber: 'ISO45001/2024/B3',
      issuingAuthority: 'Bureau Veritas India',
      category: 'compliance',
      issueDate: '2024-01-20',
      validUntil: '2027-01-19',
      status: 'valid',
      location: 'All Locations',
      verifiedBy: 'External Auditor',
      verificationDate: '2024-01-20',
      remarks: 'Occupational Health & Safety Management System certified'
    }
  ];

  const sourceCertificates = certificates.length > 0 ? certificates : mockCertificates;

  const filteredCertificates = useMemo(() => {
    return sourceCertificates.filter(cert => {
      const matchesSearch = cert.certificateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cert.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || cert.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || cert.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus, sourceCertificates]);

  const stats = {
    total: sourceCertificates.length,
    valid: sourceCertificates.filter(c => c.status === 'valid').length,
    expired: sourceCertificates.filter(c => c.status === 'expired').length,
    pending: sourceCertificates.filter(c => c.status === 'pending_verification').length
  };

  const statusColors = {
    valid: 'bg-green-100 text-green-700 border-green-300',
    expired: 'bg-red-100 text-red-700 border-red-300',
    pending_verification: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  };

  const categoryColors = {
    compliance: 'bg-blue-100 text-blue-700',
    training: 'bg-purple-100 text-purple-700',
    inspection: 'bg-orange-100 text-orange-700',
    audit: 'bg-teal-100 text-teal-700',
    other: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-green-600" />
          Compliance Certificates
        </h1>
        <p className="text-sm text-gray-600 mt-1">Repository of compliance, inspection, and certification documents</p>
      </div>

      {loading && (
        <div className="mb-3 text-sm text-gray-500">Loading certificates…</div>
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
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Certificates</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
              <p className="text-xs text-blue-700 mt-1">All categories</p>
            </div>
            <FileCheck className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Valid</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.valid}</p>
              <p className="text-xs text-green-700 mt-1">Currently valid</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Expired</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.expired}</p>
              <p className="text-xs text-red-700 mt-1">Need renewal</p>
            </div>
            <FileCheck className="h-10 w-10 text-red-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
              <p className="text-xs text-yellow-700 mt-1">Verification</p>
            </div>
            <Upload className="h-10 w-10 text-yellow-600 opacity-60" />
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
                placeholder="Search certificates..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="all">All Categories</option>
              <option value="compliance">Compliance</option>
              <option value="training">Training</option>
              <option value="inspection">Inspection</option>
              <option value="audit">Audit</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="all">All Status</option>
              <option value="valid">Valid</option>
              <option value="expired">Expired</option>
              <option value="pending_verification">Pending Verification</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredCertificates.length > 0 ? (
          filteredCertificates.map((certificate) => (
            <div key={certificate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{certificate.certificateName}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 flex items-center gap-1 ${statusColors[certificate.status]}`}>
                      <CheckCircle className="h-3 w-3" />
                      {certificate.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${categoryColors[certificate.category]}`}>
                      {certificate.category.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">Certificate No: {certificate.certificateNumber}</p>
                  <p className="text-xs text-gray-600">Issuing Authority: {certificate.issuingAuthority}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Issue Date</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(certificate.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {certificate.validUntil && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Valid Until</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(certificate.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Location</p>
                  <p className="text-sm font-bold text-gray-900">{certificate.location}</p>
                </div>
                {certificate.verifiedBy && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Verified By</p>
                    <p className="text-sm font-bold text-gray-900">{certificate.verifiedBy}</p>
                  </div>
                )}
              </div>

              {certificate.relatedLicense && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-2">
                  <p className="text-xs text-blue-600 uppercase font-medium mb-1">Related License</p>
                  <p className="text-sm text-blue-900">{certificate.relatedLicense}</p>
                </div>
              )}

              {certificate.remarks && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                  <p className="text-xs text-yellow-600 uppercase font-medium mb-1">Remarks</p>
                  <p className="text-sm text-yellow-900">{certificate.remarks}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Certificate
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <FileCheck className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No certificates found</h3>
            <p className="text-gray-600">No certificates match the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
