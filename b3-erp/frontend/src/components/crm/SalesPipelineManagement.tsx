'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Target, Award, Users, Calendar, BarChart3, ArrowRight, ChevronDown, Briefcase, TrendingDown, AlertTriangle } from 'lucide-react';
import { crmService, asArray } from '@/services/crm.service';
import CrmDataState from './CrmDataState';

export interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closing' | 'won' | 'lost';
  probability: number;
  expectedCloseDate: string;
  owner: string;
  daysInStage: number;
  lastActivity: string;
}

const STAGE_IDS = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closing', 'won', 'lost'] as const;

// Normalise arbitrary backend stage strings into the local pipeline stage ids.
function normaliseStage(raw: any): Deal['stage'] {
  const s = String(raw ?? '').toLowerCase().replace(/[\s_-]+/g, '');
  if (s.includes('won') || s === 'closedwon') return 'won';
  if (s.includes('lost') || s === 'closedlost') return 'lost';
  if (s.includes('closing') || s.includes('closed')) return 'closing';
  if (s.includes('negotiat')) return 'negotiation';
  if (s.includes('proposal') || s.includes('quote')) return 'proposal';
  if (s.includes('qualif')) return 'qualification';
  if (s.includes('prospect') || s.includes('lead') || s.includes('new')) return 'prospecting';
  return (STAGE_IDS as readonly string[]).includes(s) ? (s as Deal['stage']) : 'prospecting';
}

const stages = [
  { id: 'prospecting', name: 'Prospecting', color: 'bg-gray-500', probability: 20 },
  { id: 'qualification', name: 'Qualification', color: 'bg-blue-500', probability: 40 },
  { id: 'proposal', name: 'Proposal', color: 'bg-purple-500', probability: 60 },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-500', probability: 75 },
  { id: 'closing', name: 'Closing', color: 'bg-green-500', probability: 90 },
  { id: 'won', name: 'Won', color: 'bg-emerald-600', probability: 100 },
  { id: 'lost', name: 'Lost', color: 'bg-red-500', probability: 0 }
];

export default function SalesPipelineManagement() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await crmService.opportunities.getAll();
        const rows = asArray<any>(res);
        const mapped: Deal[] = rows.map((o: any) => ({
          id: String(o.id ?? ''),
          name: o.name ?? o.opportunityNumber ?? '',
          company: o.customerName ?? o.company ?? '',
          value: Number(o.amount ?? o.value ?? 0),
          stage: normaliseStage(o.stage),
          probability: Number(o.probability ?? 0),
          expectedCloseDate: o.expectedCloseDate ?? '',
          owner: o.ownerName ?? o.owner ?? '',
          daysInStage: Number(o.daysInStage ?? 0),
          lastActivity: o.lastActivity ?? o.updatedAt ?? '',
        }));
        if (mounted) { setDeals(mapped); setError(null); }
      } catch (e) {
        if (mounted) { setDeals([]); setError(e instanceof Error ? e.message : 'Failed to load pipeline'); }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const wonDeals = deals.filter(d => d.stage === 'won');
  const lostDeals = deals.filter(d => d.stage === 'lost');

  const stats = {
    totalValue: activeDeals.reduce((sum, d) => sum + d.value, 0),
    weightedValue: activeDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0),
    avgDealSize: activeDeals.length > 0 ? activeDeals.reduce((sum, d) => sum + d.value, 0) / activeDeals.length : 0,
    totalDeals: activeDeals.length,
    wonValue: wonDeals.reduce((sum, d) => sum + d.value, 0),
    avgSalesCycle: 45,
    winRate: deals.length > 0 ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100) : 0
  };

  const getStageDeals = (stageId: string) => {
    return deals.filter(d => d.stage === stageId);
  };

  const getStageValue = (stageId: string) => {
    return getStageDeals(stageId).reduce((sum, d) => sum + d.value, 0);
  };

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: string) => {
    if (draggedDeal && draggedDeal.stage !== stageId) {
      const dealId = draggedDeal.id;
      setDeals(deals.map(d =>
        d.id === dealId
          ? { ...d, stage: stageId as Deal['stage'], daysInStage: 0 }
          : d
      ));
      // Persist the stage change to the backend.
      crmService.opportunities.update(dealId, { stage: stageId }).catch(() => {});
      setDraggedDeal(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Target className="h-8 w-8 text-blue-600 mr-3" />
          Visual Sales Pipeline Management
        </h2>
        <p className="text-gray-600 mt-1">Drag-and-drop pipeline with weighted forecasting and deal velocity tracking</p>
      </div>

      <CrmDataState
        loading={loading}
        error={error}
        empty={!loading && !error && deals.length === 0}
        loadingText="Loading pipeline…"
        emptyText="No opportunities found in the pipeline."
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Pipeline Value</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">${(stats.totalValue / 1000).toFixed(0)}K</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Weighted Value</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">${(stats.weightedValue / 1000).toFixed(0)}K</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg Deal Size</p>
              <p className="text-2xl font-bold text-green-900 mt-1">${(stats.avgDealSize / 1000).toFixed(0)}K</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Active Deals</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.totalDeals}</p>
            </div>
            <Briefcase className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Won This Month</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">${(stats.wonValue / 1000).toFixed(0)}K</p>
            </div>
            <Award className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Avg Sales Cycle</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.avgSalesCycle}d</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Win Rate</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">{stats.winRate}%</p>
            </div>
            <Target className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Pipeline Kanban Board */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
          <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
          Deal Pipeline - Drag & Drop to Move Stages
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
          {stages.filter(s => !['won', 'lost'].includes(s.id)).map((stage) => (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
              className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-3 min-h-[400px]"
            >
              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{stage.name}</h4>
                  <span className="text-xs font-semibold text-gray-500">{stage.probability}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{getStageDeals(stage.id).length} deals</span>
                  <span className="font-semibold text-gray-900">${(getStageValue(stage.id) / 1000).toFixed(0)}K</span>
                </div>
                <div className={`mt-2 h-1 rounded-full ${stage.color}`}></div>
              </div>

              <div className="space-y-3">
                {getStageDeals(stage.id).map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal)}
                    className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="font-semibold text-gray-900 text-sm mb-1">{deal.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{deal.company}</div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-blue-600">${(deal.value / 1000).toFixed(0)}K</span>
                      <span className="text-xs text-gray-500">{deal.probability}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{deal.owner}</span>
                      <span className="text-gray-400">{deal.daysInStage}d in stage</span>
                    </div>
                    {deal.daysInStage > 14 && (
                      <div className="mt-2 flex items-center space-x-1 text-xs text-orange-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Stalled</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Conversion Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
            <ArrowRight className="h-5 w-5 text-green-600 mr-2" />
            Stage Conversion Rates
          </h3>
          <div className="space-y-2">
            {stages.filter(s => !['won', 'lost'].includes(s.id)).map((stage, index, arr) => {
              if (index === arr.length - 1) return null;
              const nextStage = arr[index + 1];
              const currentDeals = getStageDeals(stage.id).length;
              const nextDeals = getStageDeals(nextStage.id).length;
              const conversionRate = currentDeals > 0 ? Math.round((nextDeals / currentDeals) * 100) : 0;

              return (
                <div key={stage.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{nextStage.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${conversionRate >= 70 ? 'bg-green-500' : conversionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(conversionRate, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-12 text-right">{conversionRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
            <Calendar className="h-5 w-5 text-purple-600 mr-2" />
            Sales Cycle Duration by Stage
          </h3>
          <div className="space-y-2">
            {stages.filter(s => !['won', 'lost'].includes(s.id)).map((stage) => {
              const stageDeals = getStageDeals(stage.id);
              const avgDays = stageDeals.length > 0
                ? Math.round(stageDeals.reduce((sum, d) => sum + d.daysInStage, 0) / stageDeals.length)
                : 0;
              const maxDays = 30;

              return (
                <div key={stage.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 w-32">{stage.name}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${stage.color}`}
                        style={{ width: `${Math.min((avgDays / maxDays) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-16 text-right">{avgDays} days</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Won and Lost Deals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center">
            <Award className="h-5 w-5 text-green-600 mr-2" />
            Recently Won Deals
          </h3>
          <div className="space-y-3">
            {wonDeals.map((deal) => (
              <div key={deal.id} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{deal.name}</div>
                    <div className="text-xs text-gray-500">{deal.company}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">${(deal.value / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-500">{deal.owner}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-3 border border-red-200">
          <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center">
            <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
            Recently Lost Deals
          </h3>
          <div className="space-y-3">
            {lostDeals.map((deal) => (
              <div key={deal.id} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{deal.name}</div>
                    <div className="text-xs text-gray-500">{deal.company}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">${(deal.value / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-500">{deal.owner}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
