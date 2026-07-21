'use client';

import { useState, useMemo, useEffect } from 'react';
import { Shield, Users, Clock, CheckCircle, AlertCircle, FileText, Calendar } from 'lucide-react';
import { HrComplianceDocsService, HrGrievance } from '@/services/hr-compliance-docs.service';

interface POSHComplaint {
  id: string;
  complaintNumber: string;
  filedDate: string;
  complainantDetails: 'Anonymous' | string;
  respondentName: string;
  respondentDesignation: string;
  respondentDepartment: string;
  incidentDate: string;
  incidentLocation: string;
  category: 'verbal' | 'physical' | 'written' | 'electronic' | 'quid_pro_quo' | 'hostile_environment';
  severity: 'minor' | 'moderate' | 'serious' | 'severe';
  status: 'filed' | 'preliminary_inquiry' | 'formal_inquiry' | 'resolved' | 'closed';
  icAssigned: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  actionTaken?: string;
  confidential: boolean;
  remarks?: string;
}

interface ICMember {
  name: string;
  designation: string;
  role: 'Presiding Officer' | 'Member' | 'External Member';
  gender: 'Male' | 'Female';
  tenure: string;
}

interface TrainingSession {
  id: string;
  date: string;
  topic: string;
  attendees: number;
  trainer: string;
  department: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [items, setItems] = useState<POSHComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await HrComplianceDocsService.getGrievances('posh');
        if (!active) return;
        const mapped: POSHComplaint[] = rows.map((r: HrGrievance) => ({
          id: r.id,
          complaintNumber: r.caseNumber || '',
          filedDate: r.filedDate || '',
          complainantDetails: r.complainantDetails || '',
          respondentName: r.respondentName || '',
          respondentDesignation: r.respondentDesignation || '',
          respondentDepartment: r.respondentDepartment || '',
          incidentDate: r.incidentDate || '',
          incidentLocation: r.incidentLocation || '',
          category: (r.category as POSHComplaint['category']) || 'verbal',
          severity: (r.severity as POSHComplaint['severity']) || 'moderate',
          status: (r.status as POSHComplaint['status']) || 'filed',
          icAssigned: r.icAssigned || '',
          targetCompletionDate: r.targetCompletionDate || '',
          actualCompletionDate: r.actualCompletionDate,
          actionTaken: r.actionTaken,
          confidential: r.confidential ?? true,
          remarks: r.remarks,
        }));
        setItems(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load complaints');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleUpdatePoshStatus = async (id: string) => {
    const nextStatus = 'resolved' as POSHComplaint['status'];
    try {
      setUpdatingId(id);
      await HrComplianceDocsService.updatePoshComplaint(id, { status: nextStatus });
      setItems(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update complaint');
    } finally {
      setUpdatingId(null);
    }
  };

  const icMembers: ICMember[] = [
    { name: 'Priya Sharma', designation: 'HR Director', role: 'Presiding Officer', gender: 'Female', tenure: '2024-2026' },
    { name: 'Neha Desai', designation: 'Legal Counsel', role: 'Member', gender: 'Female', tenure: '2024-2026' },
    { name: 'Rajesh Kumar', designation: 'Operations Head', role: 'Member', gender: 'Male', tenure: '2024-2026' },
    { name: 'Dr. Anita Rao (NGO Representative)', designation: 'Women\'s Rights Advocate', role: 'External Member', gender: 'Female', tenure: '2024-2026' }
  ];

  const trainingData: TrainingSession[] = [
    { id: '1', date: '2025-01-15', topic: 'POSH Awareness & Prevention', attendees: 125, trainer: 'Dr. Anita Rao', department: 'All Departments' },
    { id: '2', date: '2024-12-10', topic: 'Bystander Intervention Training', attendees: 85, trainer: 'Legal Team', department: 'Manufacturing' },
    { id: '3', date: '2024-11-20', topic: 'ICC Process & Procedures', attendees: 45, trainer: 'HR Team', department: 'Management' },
    { id: '4', date: '2024-10-05', topic: 'Creating Respectful Workplaces', attendees: 200, trainer: 'External Consultant', department: 'All Departments' }
  ];

  const sourceComplaints = items;

  const filteredComplaints = useMemo(() => {
    return sourceComplaints.filter(complaint => {
      const matchesStatus = selectedStatus === 'all' || complaint.status === selectedStatus;
      return matchesStatus;
    });
  }, [selectedStatus, sourceComplaints]);

  const stats = {
    totalComplaints: sourceComplaints.length,
    pending: sourceComplaints.filter(c => c.status === 'filed' || c.status === 'preliminary_inquiry' || c.status === 'formal_inquiry').length,
    resolved: sourceComplaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
    icMembers: icMembers.length,
    trainingAttendees2025: trainingData.filter(t => t.date.startsWith('2025')).reduce((sum, t) => sum + t.attendees, 0),
    complianceRate: 100
  };

  const severityColors = {
    minor: 'bg-blue-100 text-blue-700',
    moderate: 'bg-yellow-100 text-yellow-700',
    serious: 'bg-orange-100 text-orange-700',
    severe: 'bg-red-100 text-red-700'
  };

  const statusColors = {
    filed: 'bg-blue-100 text-blue-700',
    preliminary_inquiry: 'bg-yellow-100 text-yellow-700',
    formal_inquiry: 'bg-orange-100 text-orange-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-600" />
          POSH Compliance (Sexual Harassment Act 2013)
        </h1>
        <p className="text-sm text-gray-600 mt-1">Prevention of Sexual Harassment at Workplace - Internal Complaints Committee</p>
      </div>

      {loading && (
        <div className="mb-3 text-sm text-gray-500">Loading complaints…</div>
      )}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error} — showing sample data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Total Complaints</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.totalComplaints}</p>
            </div>
            <Shield className="h-10 w-10 text-red-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Under Investigation</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Resolved</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">ICC Members</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.icMembers}</p>
            </div>
            <Users className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-purple-600" />
          <h2 className="text-lg font-bold text-purple-900">Internal Complaints Committee (ICC)</h2>
        </div>
        <p className="text-sm text-purple-700 mb-2">As per POSH Act 2013, the committee comprises of at least 50% women members including an external member from NGO</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {icMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-600">{member.designation}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${member.gender === 'Female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                  {member.gender}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700">
                  {member.role}
                </span>
                <p className="text-xs text-gray-600">Tenure: {member.tenure}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-bold text-gray-900">Complaints Overview</h2>
          </div>
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-lg p-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="all">All Status</option>
                <option value="filed">Filed</option>
                <option value="preliminary_inquiry">Preliminary Inquiry</option>
                <option value="formal_inquiry">Formal Inquiry</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-xs text-red-600 uppercase font-medium mb-1">Avg Resolution Time</p>
                <p className="text-2xl font-bold text-red-900">62 days</p>
                <p className="text-xs text-red-700 mt-1">Target: &lt;90 days</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs text-green-600 uppercase font-medium mb-1">Compliance Rate</p>
                <p className="text-2xl font-bold text-green-900">{stats.complianceRate}%</p>
                <p className="text-xs text-green-700 mt-1">All statutory requirements met</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Awareness Training (2025)</h2>
          </div>
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 uppercase font-medium mb-1">Total Employees Trained</p>
              <p className="text-3xl font-bold text-blue-900">{stats.trainingAttendees2025}</p>
              <p className="text-xs text-blue-700 mt-1">Across {trainingData.filter(t => t.date.startsWith('2025')).length} sessions</p>
            </div>
            {trainingData.slice(0, 3).map((session) => (
              <div key={session.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-bold text-gray-900">{session.topic}</p>
                  <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                    {session.attendees} attendees
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} | {session.trainer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900">Complaint Cases (Confidential)</h2>
          <span className="px-3 py-1 text-xs font-medium rounded bg-red-100 text-red-700">
            STRICTLY CONFIDENTIAL
          </span>
        </div>
        <div className="space-y-2">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="bg-gray-50 rounded-lg border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{complaint.complaintNumber}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${severityColors[complaint.severity]}`}>
                      {complaint.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[complaint.status]}`}>
                      {complaint.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {complaint.confidential && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-700 text-white">
                        CONFIDENTIAL
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">Category: {complaint.category.replace('_', ' ').toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Filed Date</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(complaint.filedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Incident Date</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(complaint.incidentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Target Completion</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(complaint.targetCompletionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-red-600 uppercase font-medium mb-2">Details (Redacted for Privacy)</p>
                <div className="space-y-2 text-sm text-red-900">
                  <p><span className="font-medium">Complainant:</span> {complaint.complainantDetails}</p>
                  <p><span className="font-medium">Respondent:</span> {complaint.respondentName} ({complaint.respondentDesignation})</p>
                  <p><span className="font-medium">Location:</span> {complaint.incidentLocation}</p>
                  <p><span className="font-medium">Assigned to:</span> {complaint.icAssigned}</p>
                </div>
              </div>

              {complaint.actionTaken && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                  <p className="text-xs text-green-600 uppercase font-medium mb-1">Action Taken</p>
                  <p className="text-sm text-green-900">{complaint.actionTaken}</p>
                  {complaint.actualCompletionDate && (
                    <p className="text-xs text-green-700 mt-2">
                      Completed on: {new Date(complaint.actualCompletionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )}

              {complaint.remarks && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                  <p className="text-xs text-yellow-600 uppercase font-medium mb-1">Remarks</p>
                  <p className="text-sm text-yellow-900">{complaint.remarks}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  View Detailed Report
                </button>
                {complaint.status === 'formal_inquiry' && (
                  <button
                    onClick={() => handleUpdatePoshStatus(complaint.id)}
                    disabled={updatingId === complaint.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                  >
                    {updatingId === complaint.id ? 'Updating...' : 'Update Status'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <h2 className="text-lg font-bold text-red-900">Annual Compliance Checklist (POSH Act 2013)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-3 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900">ICC Constitution</p>
              <p className="text-xs text-gray-600 mt-1">Committee formed with 50%+ women members and external NGO representative</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900">Policy Display</p>
              <p className="text-xs text-gray-600 mt-1">POSH policy displayed at all workplace locations and on intranet</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900">Annual Training</p>
              <p className="text-xs text-gray-600 mt-1">Mandatory awareness programs conducted for all employees</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900">Annual Report</p>
              <p className="text-xs text-gray-600 mt-1">Report submitted to District Officer as per statutory requirements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
