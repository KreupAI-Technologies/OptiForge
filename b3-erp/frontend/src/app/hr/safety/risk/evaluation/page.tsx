'use client';

import React, { useState, useEffect } from 'react';
import {
  Scale,
  Search,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  TrendingDown,
  Info,
  CheckSquare,
  ClipboardList,
  Clock
} from 'lucide-react';
import { HrSafetyService, SafetyHazard } from '@/services/hr-safety.service';

// Mock Data
const riskMatrix = [
  ['Low', 'Low', 'Low', 'Medium', 'Medium'],
  ['Low', 'Low', 'Medium', 'Medium', 'High'],
  ['Low', 'Medium', 'Medium', 'High', 'High'],
  ['Medium', 'Medium', 'High', 'High', 'Critical'],
  ['Medium', 'High', 'High', 'Critical', 'Critical'],
];

const evalMetrics = {
  likelihood: [1, 2, 3, 4, 5],
  severity: [1, 2, 3, 4, 5]
};

interface EvaluationItem {
  id: string;
  title: string;
  location: string;
  daysOpen: number;
  source: string;
}

export default function RiskEvaluationPage() {
  const [selectedLikelihood, setSelectedLikelihood] = useState<number | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<number | null>(null);
  const [pendingEvaluations, setPendingEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await HrSafetyService.getHazards('evaluation');
        const mapped: EvaluationItem[] = rows.map((row: SafetyHazard) => {
          const meta = (row.meta || {}) as any;
          return {
            id: String(row.id),
            title: row.title ?? '',
            location: row.location ?? '',
            daysOpen: Number(meta.daysOpen ?? 0) || 0,
            source: meta.source ?? row.category ?? '',
          };
        });
        if (!cancelled) setPendingEvaluations(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load pending evaluations');
          setPendingEvaluations([]);
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

  const getRiskResult = (l: number, s: number) => {
    return riskMatrix[l - 1][s - 1];
  };

  const getRiskColor = (result: string) => {
    switch (result) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeResult = selectedLikelihood && selectedSeverity ? getRiskResult(selectedLikelihood, selectedSeverity) : null;

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Scale className="h-8 w-8 text-orange-600" />
            Risk Evaluation
          </h1>
          <p className="text-gray-500 mt-1">Quantify risks using standard assessment matrices to prioritize mitigation</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading pending evaluations…
        </div>
      )}
      {loadError && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Risk Assessment Tool */}
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Interactive Risk Matrix</h3>
            {activeResult && (
              <div className={`px-4 py-1.5 rounded-lg border font-bold text-lg animate-in fade-in zoom-in duration-300 ${getRiskColor(activeResult)}`}>
                Result: {activeResult}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">1. Likelihood (Probability of occurrence)</label>
              <div className="flex gap-2">
                {evalMetrics.likelihood.map(val => (
                  <button
                    key={val}
                    onClick={() => setSelectedLikelihood(val)}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold transition-all ${selectedLikelihood === val ? 'bg-orange-600 border-orange-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">1: Rare | 2: Unlikely | 3: Possible | 4: Likely | 5: Frequent</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">2. Severity (Potential impact/harm)</label>
              <div className="flex gap-2">
                {evalMetrics.severity.map(val => (
                  <button
                    key={val}
                    onClick={() => setSelectedSeverity(val)}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold transition-all ${selectedSeverity === val ? 'bg-orange-600 border-orange-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">1: Insignificant | 2: Minor | 3: Moderate | 4: Major | 5: Catastrophic</p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <button
                disabled={!activeResult}
                className="w-full py-2 bg-orange-600 text-white rounded-lg font-bold shadow-sm hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Record Assessment for Selected Hazard
              </button>
              <p className="text-[11px] text-gray-500 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 mt-0.5 text-blue-500 flex-shrink-0" />
                RPN (Risk Priority Number) is calculated as Likelihood x Severity. Scores above 15 require immediate control measures.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1 mt-6">
            {riskMatrix.map((row, rIdx) => (
              row.map((cell, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`h-8 flex items-center justify-center text-[8px] font-bold rounded ${getRiskColor(cell)} border-opacity-30 ${selectedLikelihood === rIdx + 1 && selectedSeverity === cIdx + 1 ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                >
                  {cell.substring(0, 1)}
                </div>
              ))
            ))}
          </div>
        </div>

        {/* Pending Evaluations */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center justify-between">
              Pending Evaluations
              <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{pendingEvaluations.length} items</span>
            </h3>
            <div className="space-y-3">
              {pendingEvaluations.map((item) => (
                <div key={item.id} className="p-4 border border-gray-100 rounded-lg hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400">{item.id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {item.daysOpen}d Open
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors uppercase">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{item.location}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 italic">Src: {item.source}</span>
                    <button className="text-orange-600 font-bold flex items-center hover:translate-x-1 transition-transform">
                      Assess <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs text-center text-gray-500 hover:text-gray-900 font-medium">View All Pending Items</button>
          </div>

          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
            <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Evaluation Guidelines (ISO 45001)
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-2 text-xs text-blue-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                <span>Consider both existing controls and potential failure points.</span>
              </li>
              <li className="flex gap-2 text-xs text-blue-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                <span>Consult with workers directly involved in the process.</span>
              </li>
              <li className="flex gap-2 text-xs text-blue-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                <span>Re-evaluate risks periodically or after significant changes.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
