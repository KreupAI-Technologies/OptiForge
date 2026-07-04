'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Workflow, // Representing process/investigation
  FileText,
  CheckSquare,
  Clock,
  ArrowRight,
  ZoomIn,
  AlertCircle,
  Users
} from 'lucide-react';
import { HrSafetyService, SafetyIncident } from '@/services/hr-safety.service';

interface InvestigationRow {
  id: string;
  incidentId: string;
  title: string;
  leadInvestigator: string;
  startDate: string;
  status: string;
  stage: string;
  completion: number;
}

const rcaMethods = [
  { id: 'fishbone', name: 'Fishbone Diagram', desc: 'Cause and effect visualization', active: true },
  { id: '5whys', name: '5 Whys', desc: 'Iterative interrogative technique', active: false },
  { id: 'fmea', name: 'FMEA', desc: 'Failure Mode and Effects Analysis', active: false },
];

export default function IncidentInvestigationPage() {
  const [activeTab, setActiveTab] = useState('Active');
  const [investigations, setInvestigations] = useState<InvestigationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrSafetyService.getIncidents('investigation');
        const mapped: InvestigationRow[] = rows.map((row: SafetyIncident) => {
          const meta = (row.meta || {}) as any;
          return {
            id: String(row.id),
            incidentId: row.incidentNumber ?? meta.incidentId ?? '',
            title: meta.title ?? row.description ?? '',
            leadInvestigator: row.investigator ?? '',
            startDate: row.reportedDate ?? row.incidentDate ?? '',
            status: row.status ?? '',
            stage: meta.stage ?? row.rootCause ?? '',
            completion: meta.completion ?? 0,
          };
        });
        if (!cancelled) setInvestigations(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load investigations');
          setInvestigations([]);
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

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="h-8 w-8 text-orange-600" />
            Incident Investigation
          </h1>
          <p className="text-gray-500 mt-1">Root cause analysis and corrective action tracking</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter Cases
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading investigations…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Column: Active Investigations */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('Active')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Active' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Active Cases
            </button>
            <button
              onClick={() => setActiveTab('Closed')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Closed' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Closed History
            </button>
          </div>

          <div className="space-y-2">
            {investigations.map((inv) => (
              <div key={inv.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{inv.title}</h3>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">{inv.id}</span>
                    </div>
                    <p className="text-sm text-gray-500">Related Incident: <span className="font-medium text-orange-600">{inv.incidentId}</span></p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${inv.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                    {inv.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Lead: {inv.leadInvestigator}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Started: {inv.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Workflow className="w-4 h-4 text-gray-400" />
                    <span>Stage: {inv.stage}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>Progress</span>
                    <span>{inv.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${inv.completion === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${inv.completion}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">View Evidence</button>
                  <button className="text-sm text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center">
                    Continue Investigation <ArrowRight className="w-3 h-3 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Tools & Actions */}
        <div className="space-y-3">
          {/* RCA Tools */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Analysis Tools</h3>
            <div className="space-y-3">
              {rcaMethods.map((method) => (
                <div key={method.id} className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-3 ${method.active ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
                  <div className={`mt-1 p-1 rounded-full ${method.active ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Workflow className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{method.name}</h4>
                    <p className="text-xs text-gray-500">{method.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Corrective Actions Summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Corrective Actions</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <CheckSquare className="w-4 h-4 text-green-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Repair anti-slip coating</p>
                  <p className="text-xs text-gray-500">Completed · Apr 04</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <CheckSquare className="w-4 h-4 text-orange-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Operator re-training</p>
                  <p className="text-xs text-gray-500">In Progress · Due Apr 15</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckSquare className="w-4 h-4 text-gray-300 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Update traffic plan</p>
                  <p className="text-xs text-gray-500">Pending · Due Apr 20</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-colors">
              + Assign New Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
