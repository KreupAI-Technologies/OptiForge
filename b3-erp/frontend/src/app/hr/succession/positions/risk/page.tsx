'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, TrendingUp, Users, Clock } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface PositionRisk {
  id: string;
  title: string;
  department: string;
  currentHolder: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  retirementRisk: number;
  turnoverRisk: number;
  knowledgeConcentration: number;
  successorReadiness: number;
  businessImpact: number;
  mitigationActions: string[];
  timeline: string;
}

export default function Page() {
  const router = useRouter();
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');

  const [rows, setRows] = useState<PositionRisk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getSuccession<PositionRisk>('position-risk');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setRows([]); setLoadError(err instanceof Error ? err.message : 'Failed to load data'); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredRisks = rows.filter(risk =>
    selectedRiskLevel === 'all' || risk.riskLevel === selectedRiskLevel
  );

  const stats = useMemo(() => ({
    total: rows.length,
    critical: rows.filter(r => r.riskLevel === 'critical').length,
    high: rows.filter(r => r.riskLevel === 'high').length,
    avgRisk: rows.length ? Math.round(rows.reduce((sum, r) => sum + r.riskScore, 0) / rows.length) : 0
  }), [rows]);

  const riskColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-teal-600" />
          Succession Risk Assessment
        </h1>
        <p className="text-sm text-gray-600 mt-1">Identify and mitigate succession risks</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Positions</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-600">Critical Risk</p>
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <p className="text-sm font-medium text-orange-600">High Risk</p>
          <p className="text-2xl font-bold text-orange-900">{stats.high}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
          <p className="text-2xl font-bold text-gray-900">{stats.avgRisk}%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Risk Level:</label>
          <select value={selectedRiskLevel} onChange={(e) => setSelectedRiskLevel(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="all">All Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRisks.map(risk => (
          <div key={risk.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{risk.title}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${riskColors[risk.riskLevel]}`}>
                    {risk.riskLevel.charAt(0).toUpperCase() + risk.riskLevel.slice(1)} Risk
                  </span>
                </div>
                <p className="text-sm text-gray-600">{risk.currentHolder} • {risk.department}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                <p className="text-3xl font-bold text-red-600">{risk.riskScore}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Retirement Risk</p>
                <div className="bg-gray-200 rounded-full h-2 mb-1">
                  <div className={`h-2 rounded-full ${getRiskColor(risk.retirementRisk)}`} style={{width: `${risk.retirementRisk}%`}}></div>
                </div>
                <p className="text-xs text-gray-600">{risk.retirementRisk}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Turnover Risk</p>
                <div className="bg-gray-200 rounded-full h-2 mb-1">
                  <div className={`h-2 rounded-full ${getRiskColor(risk.turnoverRisk)}`} style={{width: `${risk.turnoverRisk}%`}}></div>
                </div>
                <p className="text-xs text-gray-600">{risk.turnoverRisk}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Knowledge Risk</p>
                <div className="bg-gray-200 rounded-full h-2 mb-1">
                  <div className={`h-2 rounded-full ${getRiskColor(risk.knowledgeConcentration)}`} style={{width: `${risk.knowledgeConcentration}%`}}></div>
                </div>
                <p className="text-xs text-gray-600">{risk.knowledgeConcentration}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Successor Readiness</p>
                <div className="bg-gray-200 rounded-full h-2 mb-1">
                  <div className={`h-2 rounded-full ${getRiskColor(100 - risk.successorReadiness)}`} style={{width: `${risk.successorReadiness}%`}}></div>
                </div>
                <p className="text-xs text-gray-600">{risk.successorReadiness}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Business Impact</p>
                <div className="bg-gray-200 rounded-full h-2 mb-1">
                  <div className={`h-2 rounded-full ${getRiskColor(risk.businessImpact)}`} style={{width: `${risk.businessImpact}%`}}></div>
                </div>
                <p className="text-xs text-gray-600">{risk.businessImpact}%</p>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-3 mb-2 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <h4 className="text-sm font-bold text-orange-900">Mitigation Actions (Timeline: {risk.timeline})</h4>
              </div>
              <ul className="space-y-1">
                {risk.mitigationActions.map((action, idx) => (
                  <li key={idx} className="text-sm text-orange-900 flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <button onClick={() => router.push('/hr/succession/positions/risk')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Assessment
              </button>
              <button onClick={() => router.push('/hr/succession/positions/risk')} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm">
                Update Mitigation Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
