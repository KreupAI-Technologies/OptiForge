'use client';

import { useState, useMemo, useEffect } from 'react';
import { Shield, CheckCircle, Clock, XCircle, AlertTriangle, FileText, Eye, Upload } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { OnboardingTasksService, OnboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface DocumentVerification {
  id: string;
  candidateCode: string;
  candidateName: string;
  designation: string;
  department: string;
  joiningDate: string;
  documents: {
    aadharCard: 'pending' | 'verified' | 'rejected';
    panCard: 'pending' | 'verified' | 'rejected';
    educationCerts: 'pending' | 'verified' | 'rejected';
    experienceCerts: 'pending' | 'verified' | 'rejected';
    addressProof: 'pending' | 'verified' | 'rejected';
    photoId: 'pending' | 'verified' | 'rejected';
    bankDetails: 'pending' | 'verified' | 'rejected';
    policeClearance: 'pending' | 'verified' | 'rejected';
  };
  overallStatus: 'pending' | 'in_progress' | 'completed' | 'rejected';
  verifiedBy?: string;
  verificationDate?: string;
  remarks?: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<DocumentVerification | null>(null);

  const [mockVerifications, setMockVerifications] = useState<DocumentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OnboardingTasksService.list('verification');
        if (!active) return;
        const mapped = records.map((r: OnboardingTaskRecord) => ({
          id: r.id,
          employeeCode: r.employeeCode || '',
          employeeName: r.employeeName || '',
          designation: r.designation || '',
          department: r.department || '',
          joiningDate: r.joiningDate || '',
          status: (r.status as any) || 'pending',
          ...(r.data || {}),
        })) as unknown as DocumentVerification[];
        setMockVerifications(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockVerifications: DocumentVerification[] = [
    {
      id: '1', candidateCode: 'CND-2024-001', candidateName: 'Arun Verma', designation: 'CNC Operator',
      department: 'Manufacturing', joiningDate: '2024-12-01',
      documents: {
        aadharCard: 'verified', panCard: 'verified', educationCerts: 'verified', experienceCerts: 'verified',
        addressProof: 'verified', photoId: 'verified', bankDetails: 'pending', policeClearance: 'pending'
      },
      overallStatus: 'in_progress', verifiedBy: 'Priya Sharma'
    },
    {
      id: '2', candidateCode: 'CND-2024-002', candidateName: 'Sneha Patil', designation: 'Quality Inspector',
      department: 'Quality Assurance', joiningDate: '2024-12-05',
      documents: {
        aadharCard: 'verified', panCard: 'verified', educationCerts: 'verified', experienceCerts: 'verified',
        addressProof: 'verified', photoId: 'verified', bankDetails: 'verified', policeClearance: 'verified'
      },
      overallStatus: 'completed', verifiedBy: 'Priya Sharma', verificationDate: '2024-10-22'
    },
    {
      id: '3', candidateCode: 'CND-2024-003', candidateName: 'Karthik Reddy', designation: 'Production Supervisor',
      department: 'Manufacturing', joiningDate: '2024-11-25',
      documents: {
        aadharCard: 'verified', panCard: 'verified', educationCerts: 'verified', experienceCerts: 'verified',
        addressProof: 'verified', photoId: 'verified', bankDetails: 'verified', policeClearance: 'verified'
      },
      overallStatus: 'completed', verifiedBy: 'Priya Sharma', verificationDate: '2024-10-18'
    },
    {
      id: '4', candidateCode: 'CND-2024-004', candidateName: 'Neha Singh', designation: 'Maintenance Technician',
      department: 'Maintenance', joiningDate: '2024-12-10',
      documents: {
        aadharCard: 'verified', panCard: 'verified', educationCerts: 'pending', experienceCerts: 'pending',
        addressProof: 'verified', photoId: 'verified', bankDetails: 'pending', policeClearance: 'pending'
      },
      overallStatus: 'in_progress', verifiedBy: 'Priya Sharma'
    },
    {
      id: '5', candidateCode: 'CND-2024-005', candidateName: 'Divya Nair', designation: 'Safety Officer',
      department: 'Safety & Compliance', joiningDate: '2024-12-15',
      documents: {
        aadharCard: 'pending', panCard: 'pending', educationCerts: 'pending', experienceCerts: 'pending',
        addressProof: 'pending', photoId: 'pending', bankDetails: 'pending', policeClearance: 'pending'
      },
      overallStatus: 'pending'
    },
    {
      id: '6', candidateCode: 'CND-2024-006', candidateName: 'Priyanka Desai', designation: 'HR Executive',
      department: 'Human Resources', joiningDate: '2024-12-01',
      documents: {
        aadharCard: 'verified', panCard: 'verified', educationCerts: 'rejected', experienceCerts: 'verified',
        addressProof: 'verified', photoId: 'verified', bankDetails: 'verified', policeClearance: 'pending'
      },
      overallStatus: 'rejected', verifiedBy: 'Priya Sharma', remarks: 'Education certificates mismatch - requires re-submission'
    }
  ];

  const filteredVerifications = useMemo(() => {
    return mockVerifications.filter(verification =>
      selectedStatus === 'all' || verification.overallStatus === selectedStatus
    );
  }, [selectedStatus]);

  const stats = {
    total: mockVerifications.length,
    pending: mockVerifications.filter(v => v.overallStatus === 'pending').length,
    inProgress: mockVerifications.filter(v => v.overallStatus === 'in_progress').length,
    completed: mockVerifications.filter(v => v.overallStatus === 'completed').length,
    rejected: mockVerifications.filter(v => v.overallStatus === 'rejected').length,
    completionRate: Math.round((mockVerifications.filter(v => v.overallStatus === 'completed').length / mockVerifications.length) * 100)
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      verified: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      in_progress: AlertTriangle,
      completed: CheckCircle,
      rejected: XCircle,
      verified: CheckCircle
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const calculateProgress = (docs: DocumentVerification['documents']) => {
    const total = Object.keys(docs).length;
    const verified = Object.values(docs).filter(status => status === 'verified').length;
    return Math.round((verified / total) * 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const columns = [
    { key: 'candidateCode', label: 'Candidate ID', sortable: true,
      render: (v: string) => <div className="font-semibold text-gray-900">{v}</div>
    },
    { key: 'candidateName', label: 'Candidate', sortable: true,
      render: (v: string, row: DocumentVerification) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.designation}</div>
        </div>
      )
    },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'joiningDate', label: 'Joining Date', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-700">
          {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    { key: 'documents', label: 'Verification Progress', sortable: false,
      render: (_: any, row: DocumentVerification) => {
        const progress = calculateProgress(row.documents);
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
              <div className={`h-2 rounded-full ${getProgressColor(progress)}`} style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm font-semibold text-gray-900">{progress}%</span>
          </div>
        );
      }
    },
    { key: 'overallStatus', label: 'Status', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {getStatusIcon(v)}
          {v.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    { key: 'verifiedBy', label: 'Verified By', sortable: true,
      render: (v: string | undefined) => <div className="text-sm text-gray-700">{v || '—'}</div>
    },
    { key: 'actions', label: 'Actions', sortable: false,
      render: (_: any, row: DocumentVerification) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedCandidate(row);
              setShowDetailModal(true);
            }}
            className="p-1 hover:bg-gray-100 rounded"
           
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Upload className="h-4 w-4 text-blue-600" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          Document Verification
        </h1>
        <p className="text-gray-600 mt-2">Verify and manage candidate documents for background checks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Candidates</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
            </div>
            <Clock className="h-10 w-10 text-gray-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-emerald-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.completionRate}%</p>
            </div>
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Verifications Table */}
      <DataTable data={filteredVerifications} columns={columns} />

      {/* Document Checklist */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Documents Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Aadhar Card</div>
              <div className="text-xs text-gray-500">Government-issued identity proof</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">PAN Card</div>
              <div className="text-xs text-gray-500">Permanent Account Number</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Education Certificates</div>
              <div className="text-xs text-gray-500">Degree/diploma certificates</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Experience Certificates</div>
              <div className="text-xs text-gray-500">Previous employment proof</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Address Proof</div>
              <div className="text-xs text-gray-500">Current residence verification</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Photo ID</div>
              <div className="text-xs text-gray-500">Recent passport-size photograph</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Bank Details</div>
              <div className="text-xs text-gray-500">Cancelled cheque / bank statement</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Police Clearance</div>
              <div className="text-xs text-gray-500">Background verification certificate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Document Verification Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All documents must be verified before the candidate's joining date</li>
          <li>• Educational certificates should be verified against original documents</li>
          <li>• Experience letters must be verified with previous employers</li>
          <li>• Police clearance is mandatory for all permanent positions</li>
          <li>• Rejected documents require candidate to re-submit with corrections</li>
          <li>• Completed verification triggers automatic joining formalities</li>
        </ul>
      </div>
    </div>
  );
}
