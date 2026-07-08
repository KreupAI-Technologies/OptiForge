'use client';

import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Brain, Target, TrendingUp, AlertTriangle, Lightbulb, Award, FileText, Calendar, Zap } from 'lucide-react';
import { crmService, asArray } from '@/services/crm.service';
import CrmDataState from './CrmDataState';

export interface Recommendation {
  id: string;
  type: 'next-action' | 'win-probability' | 'churn-risk' | 'upsell' | 'competitive-intel';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  confidence: number;
  relatedTo: string;
  suggestedAction: string;
  impact: string;
}

const typeIcons: Record<string, any> = {
  'next-action': Target,
  'win-probability': TrendingUp,
  'churn-risk': AlertTriangle,
  'upsell': Award,
  'competitive-intel': Brain
};

const typeColors: Record<string, string> = {
  'next-action': 'bg-blue-100 text-blue-700 border-blue-300',
  'win-probability': 'bg-purple-100 text-purple-700 border-purple-300',
  'churn-risk': 'bg-red-100 text-red-700 border-red-300',
  'upsell': 'bg-green-100 text-green-700 border-green-300',
  'competitive-intel': 'bg-orange-100 text-orange-700 border-orange-300'
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-700'
};

export default function CollaborationIntelligence() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await crmService.tasks.getAll();
        const rows = asArray<any>(res);
        const mapped: Recommendation[] = rows.map((t: any) => ({
          id: String(t.id ?? ''),
          type: (t.type ?? 'next-action') as Recommendation['type'],
          priority: (t.priority === 'high' || t.priority === 'medium' || t.priority === 'low' ? t.priority : 'medium') as Recommendation['priority'],
          title: t.title ?? t.subject ?? t.name ?? '',
          description: t.description ?? '',
          confidence: Number(t.confidence ?? 0),
          relatedTo: t.relatedTo ?? t.customerName ?? t.assignedToName ?? '',
          suggestedAction: t.suggestedAction ?? t.nextSteps ?? '',
          impact: t.impact ?? '',
        }));
        if (mounted) { setRecommendations(mapped); setError(null); }
      } catch (e) {
        if (mounted) { setRecommendations([]); setError(e instanceof Error ? e.message : 'Failed to load recommendations'); }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredRecommendations = recommendations.filter(rec => {
    if (filterType !== 'all' && rec.type !== filterType) return false;
    if (filterPriority !== 'all' && rec.priority !== filterPriority) return false;
    return true;
  });

  const stats = {
    totalRecommendations: recommendations.length,
    highPriority: recommendations.filter(r => r.priority === 'high').length,
    avgConfidence: recommendations.length ? Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length) : 0,
    churnRisks: recommendations.filter(r => r.type === 'churn-risk').length,
    upsellOpps: recommendations.filter(r => r.type === 'upsell').length,
    competitiveThreats: recommendations.filter(r => r.type === 'competitive-intel').length
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Brain className="h-8 w-8 text-purple-600 mr-3" />
          AI-Powered Collaboration & Intelligence
        </h2>
        <p className="text-gray-600 mt-1">Next best action recommendations, win probability predictions, and churn risk alerts</p>
      </div>

      <CrmDataState
        loading={loading}
        error={error}
        empty={!loading && !error && recommendations.length === 0}
        loadingText="Loading collaboration insights…"
        emptyText="No shared tasks or recommendations found."
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Recommendations</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.totalRecommendations}</p>
            </div>
            <Lightbulb className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">High Priority</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.highPriority}</p>
            </div>
            <Zap className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.avgConfidence}%</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Churn Risks</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.churnRisks}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Upsell Opps</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.upsellOpps}</p>
            </div>
            <Award className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Competitive</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.competitiveThreats}</p>
            </div>
            <Brain className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Types</option>
            <option value="next-action">Next Actions</option>
            <option value="win-probability">Win Probability</option>
            <option value="churn-risk">Churn Risks</option>
            <option value="upsell">Upsell Opportunities</option>
            <option value="competitive-intel">Competitive Intel</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <div className="flex-1"></div>
          <span className="text-sm text-gray-600">{filteredRecommendations.length} recommendations</span>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="space-y-2">
        {filteredRecommendations.map((rec) => {
          const TypeIcon = typeIcons[rec.type] ?? Target;
          return (
            <div key={rec.id} className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-3 hover:shadow-lg hover:border-purple-300 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${typeColors[rec.type]}`}>
                    <TypeIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{rec.title}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${priorityColors[rec.priority]}`}>
                        {rec.priority} priority
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${typeColors[rec.type]}`}>
                        {rec.type.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                    <p className="text-xs text-gray-500">📊 Related to: {rec.relatedTo}</p>
                  </div>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="mb-2 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">AI Confidence Level</span>
                  <span className="text-sm font-bold text-purple-900">{rec.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${rec.confidence}%` }}
                  ></div>
                </div>
              </div>

              {/* Suggested Action */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 mb-2 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Suggested Action:</p>
                    <p className="text-sm text-blue-800">{rec.suggestedAction}</p>
                  </div>
                </div>
              </div>

              {/* Impact */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 mb-1">Expected Impact:</p>
                    <p className="text-sm text-green-800">{rec.impact}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
                  Dismiss
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                  Take Action
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Playbook */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
          <FileText className="h-5 w-5 text-indigo-600 mr-2" />
          Sales Playbooks by Opportunity Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            { name: 'Enterprise Deal', steps: 8, avgWinRate: 65, avgDays: 90 },
            { name: 'SMB Quick Win', steps: 4, avgWinRate: 82, avgDays: 30 },
            { name: 'Competitive Displacement', steps: 10, avgWinRate: 48, avgDays: 120 }
          ].map((playbook, index) => (
            <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
              <h4 className="font-bold text-indigo-900 mb-3">{playbook.name}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-700">Steps:</span>
                  <span className="font-semibold text-indigo-900">{playbook.steps}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-700">Win Rate:</span>
                  <span className="font-semibold text-indigo-900">{playbook.avgWinRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-700">Avg Days:</span>
                  <span className="font-semibold text-indigo-900">{playbook.avgDays}</span>
                </div>
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                View Playbook
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Team Collaboration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
          <Users className="h-5 w-5 text-green-600 mr-2" />
          Team Collaboration & @Mentions
        </h3>
        <div className="space-y-3">
          {[
            { from: 'Sarah Johnson', to: 'Michael Chen', message: '@Michael - Can you review the pricing proposal for TechCorp? They want special terms.', time: '2 hours ago', deal: 'Enterprise ERP Implementation' },
            { from: 'David Park', to: 'Emily Davis', message: '@Emily - Customer asked about integration with SAP. Do we have a pre-built connector?', time: '5 hours ago', deal: 'Manufacturing Suite Upgrade' },
            { from: 'Emily Davis', to: 'Sarah Johnson', message: '@Sarah - Quick win! Customer just signed. Moving to onboarding phase.', time: '1 day ago', deal: 'Cloud Infrastructure Setup' }
          ].map((mention, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{mention.from}</span>
                    <span className="text-xs text-gray-500">→</span>
                    <span className="text-sm font-medium text-green-700">{mention.to}</span>
                    <span className="text-xs text-gray-400">• {mention.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{mention.message}</p>
                  <p className="text-xs text-gray-500">🔗 {mention.deal}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
