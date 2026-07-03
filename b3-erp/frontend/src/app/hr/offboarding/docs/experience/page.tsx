'use client';

import { useState, useMemo, useEffect } from 'react';
import { Award, CheckCircle, Clock, Download, Send, FileText } from 'lucide-react';
import { OffboardingTasksService, OffboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface ExperienceCertificate {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  lastWorkingDay: string;
  yearsOfService: number;
  monthsOfService: number;
  roles: string[];
  projects?: string[];
  status: 'pending' | 'generated' | 'approved' | 'issued';
  generatedBy?: string;
  generatedOn?: string;
  approvedBy?: string;
  issuedOn?: string;
  certificateNumber?: string;
}

export default function ExperienceCertificatePage() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'generated' | 'approved' | 'issued'>('pending');

  const [mockCertificates, setMockCertificates] = useState<ExperienceCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OffboardingTasksService.list('docs-experience');
        if (!active) return;
        const mapped = records.map((r: OffboardingTaskRecord) => ({
          id: r.id,
          employeeCode: r.employeeCode || '',
          employeeName: r.employeeName || '',
          designation: r.designation || '',
          department: r.department || '',
          status: (r.status as any) || 'pending',
          ...(r.data || {}),
        })) as unknown as ExperienceCertificate[];
        setMockCertificates(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockCertificates: ExperienceCertificate[] = [
    {
      id: 'EXP-CERT-001', employeeId: 'EMP001', employeeName: 'Rahul Sharma', designation: 'Senior Software Engineer', department: 'Engineering',
      joiningDate: '2020-01-15', lastWorkingDay: '2025-12-14', yearsOfService: 5, monthsOfService: 10,
      roles: ['Software Engineer', 'Senior Software Engineer'], projects: ['ERP System', 'Manufacturing Portal', 'Inventory Management'],
      status: 'generated', generatedBy: 'Priya Singh - HR Manager', generatedOn: '2025-12-12', certificateNumber: 'EXP/2025/001'
    },
    {
      id: 'EXP-CERT-002', employeeId: 'EMP002', employeeName: 'Priya Singh', designation: 'Marketing Manager', department: 'Marketing',
      joiningDate: '2016-06-10', lastWorkingDay: '2025-11-30', yearsOfService: 9, monthsOfService: 5,
      roles: ['Marketing Executive', 'Senior Marketing Executive', 'Marketing Manager'], projects: ['Brand Campaign 2020', 'Product Launch Q2', 'Digital Marketing Initiative'],
      status: 'issued', generatedBy: 'Amit Kumar - HR Head', generatedOn: '2025-11-28', approvedBy: 'Rajesh Patel - CEO', issuedOn: '2025-12-01', certificateNumber: 'EXP/2025/002'
    },
    {
      id: 'EXP-CERT-003', employeeId: 'EMP003', employeeName: 'Amit Kumar', designation: 'Product Manager', department: 'Product',
      joiningDate: '2010-03-20', lastWorkingDay: '2025-10-31', yearsOfService: 15, monthsOfService: 7,
      roles: ['Associate Product Manager', 'Product Manager', 'Senior Product Manager'], projects: ['Product Roadmap 2015-2020', 'Feature Development Q1', 'UX Improvement Initiative'],
      status: 'issued', generatedBy: 'Priya Singh - HR Manager', generatedOn: '2025-10-28', approvedBy: 'Rajesh Patel - CEO', issuedOn: '2025-11-05', certificateNumber: 'EXP/2025/003'
    },
    {
      id: 'EXP-CERT-004', employeeId: 'EMP004', employeeName: 'Neha Gupta', designation: 'Junior Developer', department: 'Engineering',
      joiningDate: '2022-05-15', lastWorkingDay: '2025-12-31', yearsOfService: 3, monthsOfService: 7,
      roles: ['Trainee', 'Junior Developer'], projects: ['Internal Tools', 'Bug Fix Sprint'],
      status: 'pending'
    },
    {
      id: 'EXP-CERT-005', employeeId: 'EMP005', employeeName: 'Vikram Malhotra', designation: 'VP of Sales', department: 'Sales',
      joiningDate: '2015-01-01', lastWorkingDay: '2025-09-30', yearsOfService: 10, monthsOfService: 9,
      roles: ['Sales Manager', 'Regional Sales Head', 'VP of Sales'], projects: ['Global Expansion 2018', 'Sales Force Automation'],
      status: 'approved', generatedBy: 'Anjali Desai - HR Exec', generatedOn: '2025-09-25', approvedBy: 'Rajesh Patel - CEO'
    },
    {
      id: 'EXP-CERT-006', employeeId: 'EMP006', employeeName: 'Anjali Desai', designation: 'HR Executive', department: 'Human Resources',
      joiningDate: '2021-02-10', lastWorkingDay: '2025-10-15', yearsOfService: 4, monthsOfService: 8,
      roles: ['HR Intern', 'HR Executive'], projects: ['Onboarding Process Revamp', 'Employee Engagement Survey'],
      status: 'generated', generatedBy: 'Priya Singh - HR Manager', generatedOn: '2025-10-14'
    },
    {
      id: 'EXP-CERT-007', employeeId: 'EMP007', employeeName: 'Rohan Mehra', designation: 'Content Strategist', department: 'Marketing',
      joiningDate: '2018-06-01', lastWorkingDay: '2025-11-15', yearsOfService: 7, monthsOfService: 5,
      roles: ['Content Writer', 'Senior Content Writer', 'Content Strategist'], projects: ['Blog Revamp', 'SEO Optimization 2023'],
      status: 'pending'
    },
    {
      id: 'EXP-CERT-008', employeeId: 'EMP008', employeeName: 'Suresh Raina', designation: 'Operations Manager', department: 'Operations',
      joiningDate: '2005-04-01', lastWorkingDay: '2025-08-31', yearsOfService: 20, monthsOfService: 5,
      roles: ['Operations Executive', 'Team Lead', 'Operations Manager'], projects: ['Factory Setup Phase 1', 'Supply Chain Optimization'],
      status: 'issued', generatedBy: 'Amit Kumar', generatedOn: '2025-08-28', approvedBy: 'Rajesh Patel', issuedOn: '2025-09-01', certificateNumber: 'EXP/2025/008'
    },
    {
      id: 'EXP-CERT-009', employeeId: 'EMP009', employeeName: 'Kavita Krishnan', designation: 'Lead Designer', department: 'Design',
      joiningDate: '2019-11-11', lastWorkingDay: '2025-12-05', yearsOfService: 6, monthsOfService: 0,
      roles: ['Graphic Designer', 'UI Designer', 'Lead Designer'], projects: ['Rebranding 2021', 'Mobile App Design System'],
      status: 'approved', generatedBy: 'Priya Singh', generatedOn: '2025-12-02', approvedBy: 'Rajesh Patel'
    },
    {
      id: 'EXP-CERT-010', employeeId: 'EMP010', employeeName: 'Deepak Verma', designation: 'System Admin', department: 'IT',
      joiningDate: '2023-01-15', lastWorkingDay: '2025-11-20', yearsOfService: 2, monthsOfService: 10,
      roles: ['IT Support', 'System Admin'], projects: ['Network Infrastructure Upgrade'],
      status: 'pending'
    }
  ];

  const filteredCertificates = useMemo(() => {
    return mockCertificates.filter(cert => cert.status === selectedTab);
  }, [selectedTab]);

  const stats = {
    pending: mockCertificates.filter(c => c.status === 'pending').length,
    generated: mockCertificates.filter(c => c.status === 'generated').length,
    approved: mockCertificates.filter(c => c.status === 'approved').length,
    issued: mockCertificates.filter(c => c.status === 'issued').length
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    generated: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    issued: 'bg-gray-100 text-gray-700'
  };

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    generated: <FileText className="h-4 w-4" />,
    approved: <CheckCircle className="h-4 w-4" />,
    issued: <CheckCircle className="h-4 w-4" />
  };

  const formatServicePeriod = (years: number, months: number) => {
    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    return parts.join(' and ');
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Exit Documents - Experience Certificate</h1>
        <p className="text-sm text-gray-600 mt-1">Generate and issue experience certificates for exiting employees</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Generated</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.generated}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
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

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Issued</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.issued}</p>
            </div>
            <Award className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="mb-2 flex gap-2">
        <button
          onClick={() => setSelectedTab('pending')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setSelectedTab('generated')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'generated'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Generated ({stats.generated})
        </button>
        <button
          onClick={() => setSelectedTab('approved')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Approved ({stats.approved})
        </button>
        <button
          onClick={() => setSelectedTab('issued')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'issued'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Issued ({stats.issued})
        </button>
      </div>

      <div className="space-y-2">
        {filteredCertificates.map(certificate => (
          <div key={certificate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{certificate.employeeName}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[certificate.status]}`}>
                    <span className="inline-flex items-center gap-1">
                      {statusIcons[certificate.status]}
                      {certificate.status.toUpperCase()}
                    </span>
                  </span>
                </div>
                <p className="text-sm text-gray-600">{certificate.designation} • {certificate.department}</p>
                {certificate.certificateNumber && (
                  <p className="text-xs text-gray-500 mt-1">Certificate No: {certificate.certificateNumber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Employment Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Joining Date</span>
                    <span className="font-medium text-gray-900">
                      {new Date(certificate.joiningDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Working Day</span>
                    <span className="font-medium text-gray-900">
                      {new Date(certificate.lastWorkingDay).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Total Service</span>
                    <span className="font-bold text-blue-600">
                      {formatServicePeriod(certificate.yearsOfService, certificate.monthsOfService)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Roles Held</h4>
                <div className="space-y-2">
                  {certificate.roles.map((role, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      <span className="text-sm text-gray-700">{role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {certificate.projects && certificate.projects.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-2">
                <h4 className="font-semibold text-blue-900 mb-3">Key Projects</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {certificate.projects.map((project, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-800">{project}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certificate.generatedBy && (
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <p>Generated by: {certificate.generatedBy} on {certificate.generatedOn && new Date(certificate.generatedOn).toLocaleDateString('en-IN')}</p>
                {certificate.approvedBy && (
                  <p>Approved by: {certificate.approvedBy}</p>
                )}
                {certificate.issuedOn && (
                  <p>Issued on: {new Date(certificate.issuedOn).toLocaleDateString('en-IN')}</p>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {certificate.status === 'pending' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                  <FileText className="inline h-4 w-4 mr-2" />
                  Generate Certificate
                </button>
              )}
              {certificate.status === 'generated' && (
                <>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                    <CheckCircle className="inline h-4 w-4 mr-2" />
                    Approve & Issue
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300">
                    <Download className="inline h-4 w-4 mr-2" />
                    Preview
                  </button>
                </>
              )}
              {certificate.status === 'approved' && (
                <>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm">
                    <Send className="inline h-4 w-4 mr-2" />
                    Issue to Employee
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300">
                    <Download className="inline h-4 w-4 mr-2" />
                    Download
                  </button>
                </>
              )}
              {certificate.status === 'issued' && (
                <>
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300">
                    <Download className="inline h-4 w-4 mr-2" />
                    Download
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300">
                    <Send className="inline h-4 w-4 mr-2" />
                    Resend to Employee
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
