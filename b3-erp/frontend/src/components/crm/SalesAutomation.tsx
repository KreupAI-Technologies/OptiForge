'use client';

import React, { useState, useEffect } from 'react';
import { Zap, GitBranch, Mail, Users, FileText, DollarSign, CheckCircle2, Clock, TrendingUp, Bot, PlayCircle, Pause } from 'lucide-react';
import { crmService, asArray } from '@/services/crm.service';

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  status: 'active' | 'paused' | 'draft';
  executionCount: number;
  successRate: number;
  lastRun: string;
  category: 'lead-routing' | 'follow-up' | 'email-sequence' | 'deal-stage' | 'approval' | 'quote';
}

const categoryColors: Record<string, string> = {
  'lead-routing': 'bg-blue-100 text-blue-700 border-blue-300',
  'follow-up': 'bg-green-100 text-green-700 border-green-300',
  'email-sequence': 'bg-purple-100 text-purple-700 border-purple-300',
  'deal-stage': 'bg-orange-100 text-orange-700 border-orange-300',
  'approval': 'bg-red-100 text-red-700 border-red-300',
  'quote': 'bg-indigo-100 text-indigo-700 border-indigo-300'
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-700'
};

export default function SalesAutomation() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await crmService.campaignAutomations.getAll();
        const rows = asArray<any>(res);
        const mapped: AutomationRule[] = rows.map((r: any) => ({
          id: String(r.id ?? ''),
          name: r.name ?? '',
          trigger: r.trigger ?? r.triggerType ?? r.triggerCondition ?? '',
          actions: Array.isArray(r.actions)
            ? r.actions.map((a: any) => (typeof a === 'string' ? a : a?.name ?? a?.type ?? JSON.stringify(a)))
            : [],
          status: (r.status === 'active' || r.status === 'paused' || r.status === 'draft' ? r.status : (r.isActive === false ? 'paused' : 'active')) as AutomationRule['status'],
          executionCount: Number(r.executionCount ?? r.runCount ?? 0),
          successRate: Number(r.successRate ?? 0),
          lastRun: r.lastRun ?? r.lastRunAt ?? r.updatedAt ?? '',
          category: (r.category ?? 'follow-up') as AutomationRule['category'],
        }));
        if (mounted) setRules(mapped);
      } catch (e) {
        if (mounted) setRules([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredRules = rules.filter(rule =>
    filterCategory === 'all' || rule.category === filterCategory
  );

  const toggleRuleStatus = (ruleId: string) => {
    const target = rules.find(r => r.id === ruleId);
    const nextStatus = target?.status === 'active' ? 'paused' : 'active';
    setRules(rules.map(rule =>
      rule.id === ruleId
        ? { ...rule, status: rule.status === 'active' ? 'paused' : 'active' }
        : rule
    ));
    if (target) {
      crmService.campaignAutomations.update(ruleId, { status: nextStatus }).catch(() => {});
    }
  };

  const stats = {
    totalRules: rules.length,
    activeRules: rules.filter(r => r.status === 'active').length,
    totalExecutions: rules.reduce((sum, r) => sum + r.executionCount, 0),
    avgSuccessRate: rules.length ? Math.round(rules.reduce((sum, r) => sum + r.successRate, 0) / rules.length) : 0,
    timeSaved: 245, // hours per month
    leadsAutoAssigned: rules[0]?.executionCount || 0
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Zap className="h-8 w-8 text-yellow-600 mr-3" />
          Sales Automation & Workflows
        </h2>
        <p className="text-gray-600 mt-1">Automated lead routing, email sequences, deal progression, and approval workflows</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Total Rules</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.totalRules}</p>
            </div>
            <GitBranch className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Rules</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.activeRules}</p>
            </div>
            <PlayCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Executions</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalExecutions}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Success Rate</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.avgSuccessRate}%</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Time Saved</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.timeSaved}h</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Auto-Assigned</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">{stats.leadsAutoAssigned}</p>
            </div>
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
            <Zap className="h-4 w-4" />
            <span>Create New Automation</span>
          </button>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="all">All Categories</option>
            <option value="lead-routing">Lead Routing</option>
            <option value="follow-up">Follow-up</option>
            <option value="email-sequence">Email Sequence</option>
            <option value="deal-stage">Deal Stage</option>
            <option value="approval">Approval</option>
            <option value="quote">Quote</option>
          </select>
        </div>
      </div>

      {/* Automation Rules */}
      <div className="space-y-2">
        {filteredRules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{rule.name}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusColors[rule.status]}`}>
                    {rule.status}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${categoryColors[rule.category]}`}>
                    {rule.category.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span>✅ {rule.executionCount} executions</span>
                  <span>📊 {rule.successRate}% success</span>
                  <span>🕒 {rule.lastRun}</span>
                </div>
              </div>
              <button
                onClick={() => toggleRuleStatus(rule.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  rule.status === 'active'
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {rule.status === 'active' ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    <span>Activate</span>
                  </>
                )}
              </button>
            </div>

            {/* Trigger */}
            <div className="mb-2">
              <div className="flex items-center space-x-2 mb-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">TRIGGER:</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">{rule.trigger}</p>
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-semibold text-gray-700">ACTIONS:</span>
              </div>
              <div className="space-y-2">
                {rule.actions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-yellow-700">{index + 1}</span>
                    </div>
                    <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                      <p className="text-sm text-yellow-900">{action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Rate Bar */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Success Rate</span>
                <span className="text-sm font-bold text-gray-900">{rule.successRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    rule.successRate >= 90 ? 'bg-green-500' :
                    rule.successRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${rule.successRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Email Sequence Builder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
          <Mail className="h-5 w-5 text-purple-600 mr-2" />
          Email Sequence Template Example
        </h3>
        <div className="space-y-3">
          {[
            { day: 'Day 0', subject: 'Welcome! Here\'s what you need to know', sent: 512 },
            { day: 'Day 3', subject: 'Quick question about your requirements', sent: 487 },
            { day: 'Day 7', subject: 'Case study: How TechCorp achieved 40% efficiency', sent: 412 },
            { day: 'Day 14', subject: 'Limited time offer - 15% discount', sent: 348 }
          ].map((email, index, arr) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-purple-900">{email.subject}</p>
                    <p className="text-xs text-purple-600">{email.day} • {email.sent} sent</p>
                  </div>
                  <div className="text-xs text-purple-700">
                    {index < arr.length - 1 && <span>Open rate: {90 - index * 10}%</span>}
                  </div>
                </div>
              </div>
              {index < arr.length - 1 && (
                <div className="flex flex-col items-center">
                  <div className="h-8 w-0.5 bg-purple-300"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Approval Workflow Example */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
          <FileText className="h-5 w-5 text-red-600 mr-2" />
          Discount Approval Workflow
        </h3>
        <div className="flex items-center justify-between">
          {[
            { role: 'Sales Rep', discount: '0-15%', auto: true },
            { role: 'Sales Manager', discount: '15-25%', auto: false },
            { role: 'VP Sales', discount: '25%+', auto: false }
          ].map((step, index, arr) => (
            <React.Fragment key={index}>
              <div className="flex-1 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-red-900">{step.role}</p>
                <p className="text-xs text-red-600 mt-1">{step.discount}</p>
                {step.auto && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Auto-approved
                  </span>
                )}
              </div>
              {index < arr.length - 1 && (
                <div className="px-4">
                  <div className="h-0.5 w-12 bg-red-300"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
