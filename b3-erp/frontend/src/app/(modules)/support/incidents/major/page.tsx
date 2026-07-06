'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Clock, Users, Activity, TrendingUp, Eye, CheckCircle2, XCircle, Calendar, Filter, Search } from 'lucide-react';
import { ITILService } from '@/services/support.service';

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1';

interface MajorIncident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  priority: 'P2';
  severity: 'Medium' | 'High';
  status: string;
  category: string;
  affectedServices: string[];
  reportedBy: string;
  reportedAt: string;
  assignedTo: string;
  assignedTeam: string;
  impactedUsers: number;
  impactedDepartments: string[];
  estimatedResolution: string;
  actualResolution?: string;
  timeElapsed: string;
  slaStatus: 'Within SLA' | 'At Risk';
  slaRemaining: string;
  businessImpact: string;
  workaround?: string;
  lastUpdate: string;
  resolutionProgress: number;
  rootCauseIdentified: boolean;
  preventiveMeasures?: string[];
}

const MajorIncidentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState<MajorIncident | null>(null);

  const [incidents, setIncidents] = useState<MajorIncident[]>([]);

  useEffect(() => {
    let cancelled = false;

    const statusMap: Record<string, string> = {
      open: 'Investigating',
      in_progress: 'In Progress',
      pending: 'Monitoring',
      resolved: 'Resolved',
      closed: 'Resolved',
    };

    const loadIncidents = async () => {
      try {
        const res = await ITILService.getIncidents(COMPANY_ID);
        const rows = Array.isArray(res?.data) ? res.data : [];
        const mapped: MajorIncident[] = rows.map((r: any) => ({
          id: r?.id ?? '',
          incidentNumber: r?.incidentNumber ?? '',
          title: r?.title ?? '',
          description: r?.description ?? '',
          priority: 'P2',
          severity: (r?.impact === 'high' ? 'High' : 'Medium') as 'Medium' | 'High',
          status: statusMap[r?.status] ?? (r?.status ?? ''),
          category: r?.category ?? '',
          affectedServices: Array.isArray(r?.affectedServices) ? r.affectedServices : [],
          reportedBy: r?.reportedBy ?? '',
          reportedAt: r?.createdAt ? String(r.createdAt) : '',
          assignedTo: r?.assignedTo ?? 'Unassigned',
          assignedTeam: r?.assignedTeam ?? '',
          impactedUsers: typeof r?.impactedUsers === 'number' ? r.impactedUsers : 0,
          impactedDepartments: Array.isArray(r?.impactedDepartments) ? r.impactedDepartments : [],
          estimatedResolution: r?.resolvedAt ? String(r.resolvedAt) : '',
          actualResolution: r?.resolvedAt ? String(r.resolvedAt) : undefined,
          timeElapsed: '',
          slaStatus: 'Within SLA',
          slaRemaining: '',
          businessImpact: r?.impact ? `Impact: ${r.impact}` : '',
          workaround: undefined,
          lastUpdate: r?.updatedAt ? String(r.updatedAt) : '',
          resolutionProgress: r?.status === 'resolved' || r?.status === 'closed' ? 100 : 0,
          rootCauseIdentified: Boolean(r?.resolutionCode),
          preventiveMeasures: undefined,
        }));
        if (!cancelled) setIncidents(mapped);
      } catch {
        if (!cancelled) setIncidents([]);
      }
    };

    loadIncidents();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = {
    totalMajor: incidents.length,
    inProgress: incidents.filter(i => i.status === 'In Progress').length,
    investigating: incidents.filter(i => i.status === 'Investigating').length,
    monitoring: incidents.filter(i => i.status === 'Monitoring').length,
    resolved: incidents.filter(i => i.status === 'Resolved').length,
    avgProgress: Math.round(incidents.filter(i => i.status !== 'Resolved').reduce((sum, i) => sum + i.resolutionProgress, 0) / incidents.filter(i => i.status !== 'Resolved').length),
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = searchTerm === '' || 
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || incident.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Investigating': return 'bg-yellow-100 text-yellow-800';
      case 'Monitoring': return 'bg-purple-100 text-purple-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const handleViewDetails = (incident: MajorIncident) => {
    setSelectedIncident(incident);
  };

  const handleCloseDetails = () => {
    setSelectedIncident(null);
  };

  return (
    <div className="p-6 max-w-[1600px]">
      {/* Header */}
      <div className="mb-3">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-3 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-3 bg-white/20 rounded-lg">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Major Incidents (P2)</h1>
                <p className="text-yellow-100 mt-1">Significant business impact - Resolution within 4 hours</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{stats.totalMajor}</div>
              <div className="text-yellow-100">Total Major Incidents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total P2</span>
            <AlertCircle className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.totalMajor}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">In Progress</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Investigating</span>
            <Search className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.investigating}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Monitoring</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.monitoring}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Progress</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.avgProgress}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-3 mb-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title or incident number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="In Progress">In Progress</option>
            <option value="Investigating">Investigating</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Performance Issue">Performance Issue</option>
            <option value="Application Error">Application Error</option>
            <option value="Data Issue">Data Issue</option>
            <option value="Network Problem">Network Problem</option>
            <option value="Integration Failure">Integration Failure</option>
          </select>
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredIncidents.map((incident) => (
          <div key={incident.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      P2
                    </span>
                    <span className="font-mono text-sm font-bold text-gray-900">{incident.incidentNumber}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{incident.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{incident.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Time Elapsed</div>
                  <div className="font-bold text-gray-900">{incident.timeElapsed}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">SLA Remaining</div>
                  <div className="font-bold text-green-600">{incident.slaRemaining}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Impacted Users</div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-900">{incident.impactedUsers}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Assigned To</div>
                  <div className="font-medium text-gray-900 text-sm">{incident.assignedTo}</div>
                </div>
              </div>

              {incident.status !== 'Resolved' && (
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Resolution Progress</span>
                    <span className="text-xs font-bold text-gray-900">{incident.resolutionProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(incident.resolutionProgress)}`}
                      style={{ width: `${incident.resolutionProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 mb-2">
                <div className="text-xs text-gray-600 mb-2">Business Impact:</div>
                <div className="text-sm text-gray-900 bg-yellow-50 rounded-lg p-3">{incident.businessImpact}</div>
              </div>

              {incident.workaround && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-2">
                  <div className="text-xs font-medium text-blue-900 mb-1">Workaround Available:</div>
                  <div className="text-sm text-blue-800">{incident.workaround}</div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  {incident.rootCauseIdentified && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Root Cause Found
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {incident.impactedDepartments.join(', ')}
                  </div>
                </div>
                <button
                  onClick={() => handleViewDetails(incident)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIncidents.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-600">No major incidents found matching your criteria</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl  w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedIncident.incidentNumber}</h3>
                <p className="text-gray-600">{selectedIncident.title}</p>
              </div>
              <button
                onClick={handleCloseDetails}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
              >
                <XCircle className="w-5 h-5" />
                <span className="text-gray-700">Close</span>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                    <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedIncident.description}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Business Impact</label>
                    <div className="bg-yellow-50 rounded-lg p-3 text-gray-900">{selectedIncident.businessImpact}</div>
                  </div>

                  {selectedIncident.workaround && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Workaround</label>
                      <div className="bg-blue-50 rounded-lg p-3 text-blue-900">{selectedIncident.workaround}</div>
                    </div>
                  )}

                  {selectedIncident.preventiveMeasures && selectedIncident.preventiveMeasures.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Preventive Measures</label>
                      <div className="space-y-2">
                        {selectedIncident.preventiveMeasures.map((measure, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-green-50 rounded-lg p-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-900">{measure}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                    <span className={`inline-flex px-3 py-1 rounded-full font-medium ${getStatusColor(selectedIncident.status)}`}>
                      {selectedIncident.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Progress</label>
                    <div className="text-3xl font-bold text-blue-600">{selectedIncident.resolutionProgress}%</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Assigned To</label>
                    <div className="font-medium text-gray-900">{selectedIncident.assignedTo}</div>
                    <div className="text-sm text-gray-600">{selectedIncident.assignedTeam}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Impacted Users</label>
                    <div className="text-2xl font-bold text-yellow-600">{selectedIncident.impactedUsers}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Departments</label>
                    <div className="space-y-1">
                      {selectedIncident.impactedDepartments.map((dept, idx) => (
                        <div key={idx} className="text-sm text-gray-900">{dept}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Root Cause</label>
                    <div className={`inline-flex items-center gap-2 ${selectedIncident.rootCauseIdentified ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedIncident.rootCauseIdentified ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      {selectedIncident.rootCauseIdentified ? 'Identified' : 'Not Yet Identified'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-3 border-t border-gray-200">
              <button
                onClick={handleCloseDetails}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MajorIncidentsPage;
