'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle, CheckCircle, TrendingUp, Target, Zap } from 'lucide-react'
import { SlaPolicyService, type SlaPolicyRecord, type SlaDashboardRecord } from '@/services/support.service'

export type SLAStatus = 'met' | 'at-risk' | 'breached';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface SLAPolicy {
  id: string;
  name: string;
  priority: Priority;
  firstResponseTime: number;
  resolutionTime: number;
  complianceRate: number;
  activeTickets: number;
}

const COMPANY_ID = 'company-1';

function normalizePriority(p?: string): Priority {
  const v = (p || '').toLowerCase();
  if (v === 'critical' || v === 'high' || v === 'medium' || v === 'low') return v;
  return 'medium';
}

export interface SLATicket {
  id: string;
  subject: string;
  priority: Priority;
  slaStatus: SLAStatus;
  timeRemaining: number;
  firstResponseDue: string;
  resolutionDue: string;
}

export default function SLAAutomation() {
  const [policies, setPolicies] = useState<SLAPolicy[]>([]);
  const [dashboard, setDashboard] = useState<SlaDashboardRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // At-risk ticket tracking (live per-ticket SLA timers) is out of scope for
  // this read-only wiring; the policy table + compliance KPIs are API-backed.
  const [tickets] = useState<SLATicket[]>([
    { id: 'TKT-001', subject: 'Production server down', priority: 'critical', slaStatus: 'at-risk', timeRemaining: 8, firstResponseDue: '10:15 AM', resolutionDue: '2:00 PM' },
    { id: 'TKT-002', subject: 'Database connection errors', priority: 'high', slaStatus: 'met', timeRemaining: 180, firstResponseDue: '11:30 AM', resolutionDue: '5:00 PM' },
    { id: 'TKT-003', subject: 'Feature request', priority: 'low', slaStatus: 'met', timeRemaining: 1200, firstResponseDue: '2:00 PM Tomorrow', resolutionDue: '2:00 PM +2 days' }
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [policyRows, dash] = await Promise.all([
          SlaPolicyService.getPolicies(COMPANY_ID),
          SlaPolicyService.getDashboard(COMPANY_ID),
        ]);
        if (cancelled) return;
        const mapped: SLAPolicy[] = (Array.isArray(policyRows) ? policyRows : []).map((p: SlaPolicyRecord) => ({
          id: p.id,
          name: p.slaName,
          priority: normalizePriority(p.priority),
          firstResponseTime: Number(p.firstResponseMinutes) || 0,
          resolutionTime: Number(p.resolutionMinutes) || 0,
          complianceRate: dash?.complianceRate ?? 0,
          activeTickets: 0,
        }));
        setPolicies(mapped);
        setDashboard(dash ?? null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load SLA data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getSLAStatusColor = (status: SLAStatus) => {
    const colors = {
      met: 'bg-green-100 text-green-700 border-green-300',
      'at-risk': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      breached: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Priority) => {
    const colors = {
      critical: 'bg-red-600',
      high: 'bg-orange-600',
      medium: 'bg-yellow-600',
      low: 'bg-green-600'
    };
    return colors[priority];
  };

  const complianceRate = dashboard?.complianceRate ?? 0;

  return (
    <div className="space-y-3">
      <div className="bg-white shadow-lg p-3">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Clock className="h-8 w-8 text-blue-600" />
          SLA Automation
        </h2>
        <p className="text-gray-600 mt-1">Automated SLA tracking, escalation, and compliance monitoring</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-3">
          <Target className="h-8 w-8 text-blue-600 mb-3" />
          <div className="text-3xl font-bold text-gray-900 mb-1">{loading ? '…' : `${complianceRate.toFixed(1)}%`}</div>
          <div className="text-sm text-gray-600">Compliance (30d)</div>
        </div>
        <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-3">
          <CheckCircle className="h-8 w-8 text-green-600 mb-3" />
          <div className="text-3xl font-bold text-green-600 mb-1">{loading ? '…' : (dashboard?.totalTickets ?? 0)}</div>
          <div className="text-sm text-gray-600">Tickets (30d)</div>
        </div>
        <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-3">
          <AlertTriangle className="h-8 w-8 text-yellow-600 mb-3" />
          <div className="text-3xl font-bold text-yellow-600 mb-1">{loading ? '…' : (dashboard?.breachedTickets ?? 0)}</div>
          <div className="text-sm text-gray-600">Breached</div>
        </div>
        <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-3">
          <Zap className="h-8 w-8 text-purple-600 mb-3" />
          <div className="text-3xl font-bold text-purple-600 mb-1">{loading ? '…' : (dashboard?.activePolicies ?? policies.length)}</div>
          <div className="text-sm text-gray-600">Active Policies</div>
        </div>
      </div>

      {/* SLA Policies */}
      <div className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">SLA Policies</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Policy</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Priority</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">First Response</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Resolution</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Compliance (30d)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-gray-500">Loading SLA policies…</td>
                </tr>
              )}
              {!loading && policies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-gray-500">No SLA policies configured</td>
                </tr>
              )}
              {!loading && policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">{policy.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(policy.priority)}`}>
                      {policy.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-900">{policy.firstResponseTime}m</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-900">{policy.resolutionTime / 60}h</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                        <div className={`h-2 rounded-full ${policy.complianceRate >= 90 ? 'bg-green-600' : 'bg-yellow-600'}`} style={{ width: `${policy.complianceRate}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{policy.complianceRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* At-Risk Tickets */}
      <div className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">SLA Tracking - Live</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{ticket.subject}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded border ${getSLAStatusColor(ticket.slaStatus)}`}>
                      {ticket.slaStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-gray-600">Time Remaining</div>
                      <div className="font-bold text-gray-900">{ticket.timeRemaining}m</div>
                    </div>
                    <div>
                      <div className="text-gray-600">First Response Due</div>
                      <div className="font-medium text-gray-900">{ticket.firstResponseDue}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Resolution Due</div>
                      <div className="font-medium text-gray-900">{ticket.resolutionDue}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
