'use client';

import { useState, useMemo, useEffect } from 'react';
import { MessageSquare, Search, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { HrComplianceDocsService, HrGrievance as HrGrievanceDto } from '@/services/hr-compliance-docs.service';

interface Grievance {
  id: string;
  grievanceNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  category: 'discrimination' | 'harassment' | 'workConditions' | 'compensation' | 'promotion' | 'termination' | 'other';
  subcategory: string;
  filedDate: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'filed' | 'under_review' | 'investigating' | 'resolved' | 'closed' | 'escalated';
  assignedTo?: string;
  targetResolutionDate?: string;
  actualResolutionDate?: string;
  resolutionDetails?: string;
  employeeSatisfaction?: 'satisfied' | 'neutral' | 'dissatisfied';
  isAnonymous: boolean;
  witnesses?: string[];
  evidenceProvided: boolean;
  remarks?: string;
}

export default function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [items, setItems] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [detailGrievance, setDetailGrievance] = useState<Grievance | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await HrComplianceDocsService.getGrievances('grievance');
        if (!active) return;
        const mapped: Grievance[] = rows.map((r: HrGrievanceDto) => ({
          id: r.id,
          grievanceNumber: r.caseNumber || '',
          employeeId: r.employeeId || '',
          employeeName: r.employeeName || '',
          department: r.department || '',
          category: (r.category as Grievance['category']) || 'other',
          subcategory: r.subcategory || '',
          filedDate: r.filedDate || '',
          description: r.description || '',
          priority: (r.priority as Grievance['priority']) || 'medium',
          status: (r.status as Grievance['status']) || 'filed',
          assignedTo: r.assignedTo,
          targetResolutionDate: r.targetResolutionDate,
          actualResolutionDate: r.actualResolutionDate,
          resolutionDetails: r.resolutionDetails,
          employeeSatisfaction: (r.employeeSatisfaction as Grievance['employeeSatisfaction']),
          isAnonymous: r.isAnonymous ?? false,
          witnesses: r.witnesses || [],
          evidenceProvided: r.evidenceProvided ?? false,
          remarks: r.remarks,
        }));
        setItems(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load grievances');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleGrievanceStatus = async (id: string, next: Grievance['status']) => {
    try {
      setUpdatingId(id);
      await HrComplianceDocsService.updateGrievance(id, { status: next });
      setItems(prev => prev.map(g => g.id === id ? { ...g, status: next } : g));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update grievance');
    } finally {
      setUpdatingId(null);
    }
  };

  const sourceGrievances = items;

  const filteredGrievances = useMemo(() => {
    return sourceGrievances.filter(grievance => {
      const matchesSearch = grievance.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           grievance.grievanceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           grievance.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || grievance.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || grievance.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || grievance.priority === selectedPriority;
      return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
    });
  }, [searchTerm, selectedCategory, selectedStatus, selectedPriority, sourceGrievances]);

  const stats = {
    total: sourceGrievances.length,
    pending: sourceGrievances.filter(g => g.status === 'filed' || g.status === 'under_review' || g.status === 'investigating').length,
    resolved: sourceGrievances.filter(g => g.status === 'resolved' || g.status === 'closed').length,
    urgent: sourceGrievances.filter(g => g.priority === 'urgent').length
  };

  const categoryColors = {
    discrimination: 'bg-red-100 text-red-700 border-red-300',
    harassment: 'bg-orange-100 text-orange-700 border-orange-300',
    workConditions: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    compensation: 'bg-blue-100 text-blue-700 border-blue-300',
    promotion: 'bg-purple-100 text-purple-700 border-purple-300',
    termination: 'bg-gray-100 text-gray-700 border-gray-300',
    other: 'bg-gray-100 text-gray-700 border-gray-300'
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };

  const statusColors = {
    filed: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    investigating: 'bg-orange-100 text-orange-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
    escalated: 'bg-red-100 text-red-700'
  };

  const satisfactionColors = {
    satisfied: 'bg-green-100 text-green-700',
    neutral: 'bg-yellow-100 text-yellow-700',
    dissatisfied: 'bg-red-100 text-red-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-orange-600" />
          Grievance Redressal System
        </h1>
        <p className="text-sm text-gray-600 mt-1">Employee grievance tracking and resolution management</p>
      </div>

      {loading && (
        <div className="mb-3 text-sm text-gray-500">Loading grievances…</div>
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
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Grievances</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <MessageSquare className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Pending</p>
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

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Urgent</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.urgent}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search grievance..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">All Categories</option>
              <option value="discrimination">Discrimination</option>
              <option value="harassment">Harassment</option>
              <option value="workConditions">Work Conditions</option>
              <option value="compensation">Compensation</option>
              <option value="promotion">Promotion</option>
              <option value="termination">Termination</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">All Status</option>
              <option value="filed">Filed</option>
              <option value="under_review">Under Review</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredGrievances.map((grievance) => (
          <div key={grievance.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{grievance.grievanceNumber}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${categoryColors[grievance.category]}`}>
                    {grievance.category.replace(/([A-Z])/g, ' $1').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[grievance.priority]}`}>
                    {grievance.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[grievance.status]}`}>
                    {grievance.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {grievance.isAnonymous && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                      ANONYMOUS
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 font-medium">{grievance.employeeName} {!grievance.isAnonymous && `(${grievance.employeeId})`}</p>
                <p className="text-xs text-gray-600">Department: {grievance.department} | {grievance.subcategory}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Filed Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(grievance.filedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              {grievance.targetResolutionDate && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Target Resolution</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(grievance.targetResolutionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              )}
              {grievance.assignedTo && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Assigned To</p>
                  <p className="text-sm font-bold text-gray-900">{grievance.assignedTo}</p>
                </div>
              )}
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
              <p className="text-xs text-orange-600 uppercase font-medium mb-1">Grievance Description</p>
              <p className="text-sm text-orange-900">{grievance.description}</p>
            </div>

            {grievance.witnesses && grievance.witnesses.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">Witnesses</p>
                <p className="text-sm text-blue-900">{grievance.witnesses.join(', ')}</p>
              </div>
            )}

            {grievance.resolutionDetails && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-green-600 uppercase font-medium mb-1">Resolution Details</p>
                <p className="text-sm text-green-900">{grievance.resolutionDetails}</p>
                {grievance.actualResolutionDate && (
                  <p className="text-xs text-green-700 mt-2">
                    Resolved on: {new Date(grievance.actualResolutionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}

            {grievance.employeeSatisfaction && (
              <div className={`border rounded-lg p-3 mb-2 ${satisfactionColors[grievance.employeeSatisfaction].replace('text', 'border').replace('100', '200')}`}>
                <p className={`text-xs uppercase font-medium mb-1 ${satisfactionColors[grievance.employeeSatisfaction].replace('bg-', 'text-').replace('-100', '-600')}`}>
                  Employee Satisfaction
                </p>
                <span className={`px-2 py-1 text-xs font-medium rounded ${satisfactionColors[grievance.employeeSatisfaction]}`}>
                  {grievance.employeeSatisfaction.toUpperCase()}
                </span>
              </div>
            )}

            {grievance.remarks && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-yellow-600 uppercase font-medium mb-1">Remarks</p>
                <p className="text-sm text-yellow-900">{grievance.remarks}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button onClick={() => setDetailGrievance(grievance)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Full Details
              </button>
              {(grievance.status === 'filed' || grievance.status === 'under_review') && (
                <button
                  onClick={() => handleGrievanceStatus(grievance.id, 'investigating')}
                  disabled={updatingId === grievance.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                >
                  {updatingId === grievance.id ? 'Starting...' : 'Start Investigation'}
                </button>
              )}
              {grievance.status === 'investigating' && (
                <button
                  onClick={() => handleGrievanceStatus(grievance.id, 'resolved')}
                  disabled={updatingId === grievance.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                >
                  {updatingId === grievance.id ? 'Updating...' : 'Mark as Resolved'}
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <span className={`text-xs ${grievance.evidenceProvided ? 'text-green-600' : 'text-gray-500'}`}>
                  {grievance.evidenceProvided ? '✓ Evidence Provided' : 'No Evidence'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {detailGrievance && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Grievance Details — {detailGrievance.grievanceNumber}</h2>
              <button onClick={() => setDetailGrievance(null)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div><span className="text-gray-500">Employee:</span> <span className="font-medium text-gray-900">{detailGrievance.employeeName}</span></div>
              <div><span className="text-gray-500">Department:</span> <span className="font-medium text-gray-900">{detailGrievance.department}</span></div>
              <div><span className="text-gray-500">Category:</span> <span className="font-medium text-gray-900">{detailGrievance.category}</span></div>
              <div><span className="text-gray-500">Subcategory:</span> <span className="font-medium text-gray-900">{detailGrievance.subcategory}</span></div>
              <div><span className="text-gray-500">Priority:</span> <span className="font-medium text-gray-900">{detailGrievance.priority}</span></div>
              <div><span className="text-gray-500">Status:</span> <span className="font-medium text-gray-900">{detailGrievance.status}</span></div>
              <div><span className="text-gray-500">Filed Date:</span> <span className="font-medium text-gray-900">{detailGrievance.filedDate}</span></div>
              {detailGrievance.assignedTo && <div><span className="text-gray-500">Assigned To:</span> <span className="font-medium text-gray-900">{detailGrievance.assignedTo}</span></div>}
              {detailGrievance.targetResolutionDate && <div><span className="text-gray-500">Target Resolution:</span> <span className="font-medium text-gray-900">{detailGrievance.targetResolutionDate}</span></div>}
              {detailGrievance.actualResolutionDate && <div><span className="text-gray-500">Actual Resolution:</span> <span className="font-medium text-gray-900">{detailGrievance.actualResolutionDate}</span></div>}
              <div><span className="text-gray-500">Anonymous:</span> <span className="font-medium text-gray-900">{detailGrievance.isAnonymous ? 'Yes' : 'No'}</span></div>
              <div><span className="text-gray-500">Evidence Provided:</span> <span className="font-medium text-gray-900">{detailGrievance.evidenceProvided ? 'Yes' : 'No'}</span></div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 mb-3">
              <p className="text-xs text-orange-600 uppercase font-medium mb-1">Description</p>
              <p className="text-sm text-orange-900">{detailGrievance.description}</p>
            </div>
            {detailGrievance.witnesses && detailGrievance.witnesses.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-3">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">Witnesses</p>
                <p className="text-sm text-blue-900">{detailGrievance.witnesses.join(', ')}</p>
              </div>
            )}
            {detailGrievance.resolutionDetails && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200 mb-3">
                <p className="text-xs text-green-600 uppercase font-medium mb-1">Resolution Details</p>
                <p className="text-sm text-green-900">{detailGrievance.resolutionDetails}</p>
              </div>
            )}
            {detailGrievance.employeeSatisfaction && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-3">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Employee Satisfaction</p>
                <p className="text-sm font-bold text-gray-900">{detailGrievance.employeeSatisfaction.toUpperCase()}</p>
              </div>
            )}
            {detailGrievance.remarks && (
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 mb-3">
                <p className="text-xs text-yellow-600 uppercase font-medium mb-1">Remarks</p>
                <p className="text-sm text-yellow-900">{detailGrievance.remarks}</p>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button onClick={() => setDetailGrievance(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
