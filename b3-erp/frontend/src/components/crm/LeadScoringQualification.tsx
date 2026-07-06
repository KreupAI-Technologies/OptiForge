'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Star, Award, Target, Users, Activity, Brain, Zap, Filter, ChevronRight, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { crmService, asArray } from '@/services/crm.service';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D';
  status: 'hot' | 'warm' | 'cold' | 'qualified' | 'disqualified';
  behavioralScore: number;
  demographicScore: number;
  firmographicScore: number;
  engagementLevel: 'high' | 'medium' | 'low';
  lastActivity: string;
  dealValue: number;
  probability: number;
}

const gradeColors: Record<string, string> = {
  A: 'bg-green-100 text-green-800 border-green-300',
  B: 'bg-blue-100 text-blue-800 border-blue-300',
  C: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  D: 'bg-red-100 text-red-800 border-red-300'
};

const statusColors: Record<string, string> = {
  hot: 'bg-red-100 text-red-700 border-red-300',
  warm: 'bg-orange-100 text-orange-700 border-orange-300',
  cold: 'bg-blue-100 text-blue-700 border-blue-300',
  qualified: 'bg-green-100 text-green-700 border-green-300',
  disqualified: 'bg-gray-100 text-gray-700 border-gray-300'
};

function gradeFromScore(score: number): Lead['grade'] {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

export default function LeadScoringQualification() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Prefer analytics-provided scoring; fall back to raw leads list.
        let rows: any[] = [];
        try {
          const scoring = await crmService.crmAnalytics.getLeadScoring();
          rows = asArray<any>(scoring?.leads ?? scoring);
        } catch {
          rows = [];
        }
        if (!rows.length) {
          const leadsRes = await crmService.leads.getAll();
          rows = asArray<any>(leadsRes);
        }
        const mapped: Lead[] = rows.map((l: any) => {
          const totalScore = Number(l.totalScore ?? l.score ?? l.leadScore ?? 0);
          return {
            id: String(l.id ?? ''),
            name: l.name ?? `${l.firstName ?? ''} ${l.lastName ?? ''}`.trim(),
            company: l.company ?? l.companyName ?? l.customerName ?? '',
            email: l.email ?? '',
            phone: l.phone ?? l.mobile ?? '',
            totalScore,
            grade: (l.grade === 'A' || l.grade === 'B' || l.grade === 'C' || l.grade === 'D' ? l.grade : gradeFromScore(totalScore)) as Lead['grade'],
            status: (l.status ?? 'cold') as Lead['status'],
            behavioralScore: Number(l.behavioralScore ?? 0),
            demographicScore: Number(l.demographicScore ?? 0),
            firmographicScore: Number(l.firmographicScore ?? 0),
            engagementLevel: (l.engagementLevel ?? 'low') as Lead['engagementLevel'],
            lastActivity: l.lastActivity ?? l.updatedAt ?? '',
            dealValue: Number(l.dealValue ?? l.estimatedValue ?? l.value ?? 0),
            probability: Number(l.probability ?? 0),
          };
        });
        if (mounted) setLeads(mapped);
      } catch (e) {
        if (mounted) setLeads([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredLeads = leads.filter(lead => {
    if (filterGrade !== 'all' && lead.grade !== filterGrade) return false;
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    totalLeads: leads.length,
    hotLeads: leads.filter(l => l.status === 'hot').length,
    qualifiedLeads: leads.filter(l => l.status === 'qualified').length,
    avgScore: leads.length ? Math.round(leads.reduce((sum, l) => sum + l.totalScore, 0) / leads.length) : 0,
    gradeA: leads.filter(l => l.grade === 'A').length,
    gradeB: leads.filter(l => l.grade === 'B').length
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="h-8 w-8 text-purple-600 mr-3" />
            AI-Powered Lead Scoring & Qualification
          </h2>
          <p className="text-gray-600 mt-1">Intelligent lead prioritization with behavioral, demographic, and firmographic scoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live scoring active</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Leads</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.totalLeads}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Hot Leads</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.hotLeads}</p>
            </div>
            <Zap className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Qualified</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.qualifiedLeads}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Avg Score</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.avgScore}</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Grade A</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.gradeA}</p>
            </div>
            <Award className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Grade B</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.gradeB}</p>
            </div>
            <Star className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Grades</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
            <option value="D">Grade D</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
            <option value="qualified">Qualified</option>
            <option value="disqualified">Disqualified</option>
          </select>
          <div className="flex-1"></div>
          <span className="text-sm text-gray-600">{filteredLeads.length} leads shown</span>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <div>
                      <div className="font-semibold text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.company}</div>
                      <div className="text-xs text-gray-400">{lead.lastActivity}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            lead.totalScore >= 80 ? 'bg-green-500' :
                            lead.totalScore >= 60 ? 'bg-blue-500' :
                            lead.totalScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${lead.totalScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{lead.totalScore}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${gradeColors[lead.grade]}`}>
                      {lead.grade}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1">
                      {lead.engagementLevel === 'high' ? (
                        <>
                          <Activity className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">High</span>
                        </>
                      ) : lead.engagementLevel === 'medium' ? (
                        <>
                          <Activity className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-700 font-medium">Medium</span>
                        </>
                      ) : (
                        <>
                          <Activity className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-700 font-medium">Low</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm font-semibold text-gray-900">${lead.dealValue.toLocaleString()}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm text-gray-900">{lead.probability}%</span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      <span>View Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedLead.name}</h3>
                  <p className="text-gray-600">{selectedLead.company}</p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {/* Overall Score */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <h4 className="text-lg font-bold text-purple-900 mb-2">Overall Lead Score</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-purple-900">{selectedLead.totalScore}</span>
                  <span className={`px-4 py-2 text-lg font-bold rounded-full border ${gradeColors[selectedLead.grade]}`}>
                    Grade {selectedLead.grade}
                  </span>
                </div>
                <div className="bg-white rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all"
                    style={{ width: `${selectedLead.totalScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm font-medium text-blue-600 mb-2">Behavioral Score</p>
                  <p className="text-2xl font-bold text-blue-900">{selectedLead.behavioralScore}</p>
                  <div className="mt-2 bg-white rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${selectedLead.behavioralScore}%` }}></div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-sm font-medium text-green-600 mb-2">Demographic Score</p>
                  <p className="text-2xl font-bold text-green-900">{selectedLead.demographicScore}</p>
                  <div className="mt-2 bg-white rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${selectedLead.demographicScore}%` }}></div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <p className="text-sm font-medium text-orange-600 mb-2">Firmographic Score</p>
                  <p className="text-2xl font-bold text-orange-900">{selectedLead.firmographicScore}</p>
                  <div className="mt-2 bg-white rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${selectedLead.firmographicScore}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Qualification Criteria */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Auto-Qualification Criteria</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Lead Score ≥ 80</span>
                    {selectedLead.totalScore >= 80 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Engagement Level: High</span>
                    {selectedLead.engagementLevel === 'high' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Deal Value ≥ $50,000</span>
                    {selectedLead.dealValue >= 50000 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Win Probability ≥ 60%</span>
                    {selectedLead.probability >= 60 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (selectedLead) {
                      const leadId = selectedLead.id;
                      // Update the lead status to qualified
                      setLeads(prev => prev.map(lead =>
                        lead.id === leadId
                          ? { ...lead, status: 'qualified' as const }
                          : lead
                      ));
                      // Persist the qualification
                      crmService.leads.update(leadId, { status: 'qualified' }).catch(() => {});
                      // Close the modal
                      setSelectedLead(null);
                    }
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Qualify Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">AI-Powered Lead Scoring</h4>
            <p className="text-sm text-blue-800">
              Scores are calculated in real-time using behavioral engagement (email opens, website visits), demographic data (job title, industry),
              and firmographic factors (company size, revenue). Leads with scores ≥80 and high engagement are auto-qualified for sales follow-up.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
