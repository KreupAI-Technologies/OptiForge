'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { userManagementService, UserStatus } from '@/services/user-management.service';
import { leadService } from '@/services/lead.service';
import { crmService, asArray } from '@/services/crm.service';
import {
  Users,
  UserPlus,
  TrendingUp,
  Award,
  Target,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Mail,
  Phone,
} from 'lucide-react';

interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  team: string;
  assignedLeads: number;
  activeLeads: number;
  closedDeals: number;
  conversionRate: number;
  avgResponseTime: string;
  capacity: number;
  maxCapacity: number;
  performance: number;
  status: 'active' | 'away' | 'busy';
}

interface AssignmentRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  criteria: string;
  assignTo: string;
  description: string;
}

const mapRule = (r: any): AssignmentRule => ({
  id: String(r.id ?? ''),
  name: r.name ?? '',
  enabled: r.enabled ?? r.isActive ?? true,
  priority: Number(r.priority ?? 0),
  criteria: r.criteria ?? r.condition ?? '',
  assignTo: r.assignTo ?? r.assignedTo ?? r.target ?? '',
  description: r.description ?? '',
});

export default function LeadAssignmentPage() {
  const router = useRouter();
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Rule-name modal (replaces the previous window.prompt flow).
  // mode: 'create' → add a new rule; 'edit' → rename an existing rule.
  const [ruleModal, setRuleModal] = useState<{ mode: 'create' } | { mode: 'edit'; id: string } | null>(null);
  const [ruleNameValue, setRuleNameValue] = useState('');
  const [ruleSaving, setRuleSaving] = useState(false);
  const [ruleError, setRuleError] = useState<string | null>(null);

  const openCreateRuleModal = () => {
    setRuleModal({ mode: 'create' });
    setRuleNameValue('');
    setRuleError(null);
  };

  const openEditRuleModal = (rule: AssignmentRule) => {
    setRuleModal({ mode: 'edit', id: rule.id });
    setRuleNameValue(rule.name);
    setRuleError(null);
  };

  const closeRuleModal = () => {
    if (ruleSaving) return;
    setRuleModal(null);
    setRuleError(null);
  };

  const handleRuleModalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ruleModal) return;
    const name = ruleNameValue.trim();
    if (!name) {
      setRuleError('Rule name is required.');
      return;
    }
    setRuleSaving(true);
    setRuleError(null);
    try {
      if (ruleModal.mode === 'create') {
        await createRule({
          name,
          enabled: true,
          priority: assignmentRules.length + 1,
          criteria: '',
          assignTo: '',
          description: '',
        });
      } else {
        await updateRule(ruleModal.id, { name });
      }
      setRuleModal(null);
    } catch (err) {
      setRuleError(err instanceof Error ? err.message : 'Failed to save rule.');
    } finally {
      setRuleSaving(false);
    }
  };

  useEffect(() => {
    const fetchReps = async () => {
      try {
        const users = await userManagementService.getAllUsers({ department: 'Sales' });
        const mappedReps: SalesRep[] = users.map(u => ({
          id: u.id,
          name: u.displayName,
          email: u.email,
          phone: u.phone || '',
          avatar: u.firstName[0] + u.lastName[0],
          team: u.department,
          assignedLeads: Math.floor(Math.random() * 50), // Mocking performance stats for now
          activeLeads: Math.floor(Math.random() * 30),
          closedDeals: Math.floor(Math.random() * 15),
          conversionRate: parseFloat((Math.random() * 30).toFixed(1)),
          avgResponseTime: '2.5 hrs',
          capacity: Math.floor(Math.random() * 40),
          maxCapacity: 50,
          performance: 70 + Math.floor(Math.random() * 25),
          status: u.status === 'active' ? 'active' : 'busy'
        }));
        setSalesReps(mappedReps);
      } catch (error) {
        console.error('Failed to fetch sales reps:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReps();
  }, []);

  // Load assignment rules from backend
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await crmService.assignmentRules.getAll();
        setAssignmentRules(asArray(res).map(mapRule));
      } catch (error) {
        console.error('Failed to fetch assignment rules:', error);
        setAssignmentRules([]);
      }
    };
    fetchRules();
  }, []);

  const createRule = async (data: Partial<AssignmentRule>) => {
    try {
      const created = await crmService.assignmentRules.create({ companyId: 'default-company-id', ...data });
      setAssignmentRules((prev) => [...prev, mapRule(created)]);
    } catch (error) {
      console.error('Failed to create assignment rule:', error);
    }
  };

  const updateRule = async (id: string, data: Partial<AssignmentRule>) => {
    try {
      const updated = await crmService.assignmentRules.update(id, data);
      setAssignmentRules((prev) => prev.map((r) => (r.id === id ? mapRule(updated) : r)));
    } catch (error) {
      console.error('Failed to update assignment rule:', error);
    }
  };

  const deleteRule = async (id: string) => {
    try {
      await crmService.assignmentRules.delete(id);
      setAssignmentRules((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Failed to delete assignment rule:', error);
    }
  };

  const stats = {
    totalReps: salesReps.length,
    activeReps: salesReps.filter((r) => r.status === 'active').length,
    totalAssigned: salesReps.reduce((sum, r) => sum + r.assignedLeads, 0),
    avgConversion: salesReps.length > 0 ? (salesReps.reduce((sum, r) => sum + r.conversionRate, 0) / salesReps.length).toFixed(1) : '0.0',
  };

  const getCapacityColor = (capacity: number, maxCapacity: number) => {
    const percentage = (capacity / maxCapacity) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'away':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'busy':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const toggleRule = (ruleId: string) => {
    const rule = assignmentRules.find((r) => r.id === ruleId);
    if (!rule) return;
    // Optimistic update, then persist
    setAssignmentRules(
      assignmentRules.map((r) =>
        r.id === ruleId ? { ...r, enabled: !r.enabled } : r
      )
    );
    updateRule(ruleId, { enabled: !rule.enabled });
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Sales Reps</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalReps}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Now</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.activeReps}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Assigned</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.totalAssigned}</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Avg Conversion</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">{stats.avgConversion}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Assignment Rules Section */}
      {showSettings && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">Assignment Rules</h2>
            <button
              onClick={openCreateRuleModal}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Play className="h-4 w-4" />
              <span>Add New Rule</span>
            </button>
          </div>

          <div className="space-y-3">
            {assignmentRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-lg border-2 ${rule.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xs font-semibold text-gray-500">Priority {rule.priority}</span>
                      <h3 className="text-sm font-bold text-gray-900">{rule.name}</h3>
                      {rule.enabled ? (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-200 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-gray-500">
                        <span className="font-semibold">Criteria:</span> {rule.criteria}
                      </span>
                      <span className="text-gray-500">
                        <span className="font-semibold">Assign To:</span> {rule.assignTo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`p-2 rounded-lg transition-colors ${rule.enabled
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                      {rule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEditRuleModal(rule)}
                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (typeof window === 'undefined' || window.confirm(`Delete rule "${rule.name}"?`)) {
                          deleteRule(rule.id);
                        }
                      }}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales Reps Grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Sales Team Overview</h2>

        <div className="space-y-2">
          {salesReps.map((rep) => (
            <div
              key={rep.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                {/* Rep Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{rep.avatar}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{rep.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(
                          rep.status
                        )}`}
                      >
                        {rep.status}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                        {rep.team}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {rep.email}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {rep.phone}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        Avg Response: {rep.avgResponseTime}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{rep.assignedLeads}</p>
                    <p className="text-xs text-gray-500">Total Assigned</p>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{rep.activeLeads}</p>
                    <p className="text-xs text-gray-500">Active Now</p>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{rep.closedDeals}</p>
                    <p className="text-xs text-gray-500">Closed Deals</p>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{rep.conversionRate}%</p>
                    <p className="text-xs text-gray-500">Conversion</p>
                  </div>

                  {/* Capacity */}
                  <div className="w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Capacity</span>
                      <span className="text-xs font-semibold text-gray-700">
                        {rep.capacity}/{rep.maxCapacity}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-2 ${getCapacityColor(rep.capacity, rep.maxCapacity)}`}
                        style={{ width: `${(rep.capacity / rep.maxCapacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Performance Score */}
                  <div className="text-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${rep.performance >= 85
                          ? 'border-green-500 bg-green-50'
                          : rep.performance >= 70
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-red-500 bg-red-50'
                        }`}
                    >
                      <span className="text-xl font-bold text-gray-900">{rep.performance}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Performance</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => router.push(`/crm/leads?assignedTo=${rep.id}`)}
                      className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"

                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      <UserPlus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rule Name Modal (create / rename) */}
      {ruleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b px-5 py-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {ruleModal.mode === 'create' ? 'Add Assignment Rule' : 'Rename Assignment Rule'}
              </h3>
            </div>
            <form onSubmit={handleRuleModalSubmit}>
              <div className="space-y-3 px-5 py-4">
                {ruleError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {ruleError}
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Rule Name *</label>
                  <input
                    type="text"
                    autoFocus
                    value={ruleNameValue}
                    onChange={(e) => setRuleNameValue(e.target.value)}
                    placeholder="e.g. Round-robin for enterprise leads"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t px-5 py-3">
                <button
                  type="button"
                  onClick={closeRuleModal}
                  disabled={ruleSaving}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ruleSaving || !ruleNameValue.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {ruleSaving
                    ? 'Saving…'
                    : ruleModal.mode === 'create'
                      ? 'Add Rule'
                      : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
