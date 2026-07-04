'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  AlertTriangle,
  AlertCircle,
  PlayCircle,
  Clock,
  ChevronRight,
  ShieldAlert,
  FileCheck
} from 'lucide-react';
import { HrSafetyService, SafetyTraining } from '@/services/hr-safety.service';

interface Procedure {
  id: string;
  title: string;
  category: string;
  description: string;
  steps: number;
  duration: string;
  lastReview: string;
  importance: string;
}

const importantContacts = [
  { name: 'Emergency Services', number: '911', type: 'External' },
  { name: 'Site Safety Officer', number: '+1 (555) 012-3456', type: 'Internal' },
  { name: 'Poison Control', number: '1-800-222-1222', type: 'External' },
];

export default function SafetyProceduresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await HrSafetyService.getTrainings('procedure');
        const mapped: Procedure[] = rows.map((row: SafetyTraining) => {
          const meta = (row.meta || {}) as any;
          return {
            id: String(row.code ?? row.id ?? ''),
            title: row.title ?? '',
            category: row.category ?? '',
            description: row.description ?? '',
            steps: meta.steps ?? 0,
            duration: row.duration ?? '',
            lastReview: row.reviewDate ?? row.effectiveDate ?? '',
            importance: meta.importance ?? '',
          };
        });
        if (!cancelled) setProcedures(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load procedures');
          setProcedures([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProcedures = procedures.filter(proc => {
    const matchesSearch = proc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' ||
      (activeTab === 'Emergency' && proc.importance === 'Critical') ||
      (activeTab === 'Routine' && proc.importance !== 'Critical');
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-6 space-y-3">
      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading procedures…
        </div>
      )}
      {loadError && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-orange-600" />
            Standard Operating Procedures
          </h1>
          <p className="text-gray-500 mt-1">Access safety protocols and emergency guides</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search procedures..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Content: Procedure List */}
        <div className="lg:col-span-2 space-y-3">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'All' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              All Procedures
            </button>
            <button
              onClick={() => setActiveTab('Emergency')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Emergency' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Critical / Emergency
            </button>
            <button
              onClick={() => setActiveTab('Routine')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Routine' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Routine / Operational
            </button>
          </div>

          <div className="space-y-2">
            {filteredProcedures.map((proc) => (
              <div key={proc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${proc.importance === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {proc.importance === 'Critical' ? <ShieldAlert className="w-6 h-6" /> : <FileCheck className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{proc.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">{proc.id}</span>
                        {proc.importance === 'Critical' && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">CRITICAL</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{proc.description}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <span className="flex items-center"><ClipboardList className="w-3 h-3 mr-1" /> {proc.steps} Steps</span>
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {proc.duration}</span>
                        <span className="flex items-center">Updated: {proc.lastReview}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Emergency & Quick Actions */}
        <div className="space-y-3">
          {/* Emergency Contacts Card */}
          <div className="bg-red-50 rounded-xl border border-red-100 p-3">
            <h3 className="text-lg font-bold text-red-800 flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Emergency Contacts
            </h3>
            <ul className="space-y-3">
              {importantContacts.map((contact, idx) => (
                <li key={idx} className="flex justify-between items-center pb-2 border-b border-red-100 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-red-900">{contact.name}</p>
                    <p className="text-xs text-red-600">{contact.type}</p>
                  </div>
                  <span className="text-sm font-bold text-red-800 bg-white px-2 py-1 rounded border border-red-100">
                    {contact.number}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-red-100">
              <button className="w-full py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Incident
              </button>
            </div>
          </div>

          {/* Quick Guides */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Guides</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all">
                <PlayCircle className="w-8 h-8 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Proper Lifting Technique</p>
                  <p className="text-xs text-gray-500">Video • 2 min</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all">
                <PlayCircle className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fire Extinguisher Usage</p>
                  <p className="text-xs text-gray-500">Video • 3 min</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all">
                <PlayCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">PPE Selection Guide</p>
                  <p className="text-xs text-gray-500">Interactive • 5 min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
