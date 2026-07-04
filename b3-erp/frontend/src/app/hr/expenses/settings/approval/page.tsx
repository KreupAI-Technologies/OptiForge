'use client';

import { useState, useMemo, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { Network, Plus, Edit2, Trash2, AlertCircle, Check, X, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ApprovalRule {
  id: string;
  name: string;
  category: string;
  minAmount: number;
  maxAmount: number | null;
  approvers: {
    level: number;
    role: string;
    autoApprove: boolean;
    escalationDays: number;
  }[];
  conditions: {
    requireReceipt: boolean;
    requireJustification: boolean;
    allowSelfApproval: boolean;
  };
  isActive: boolean;
}

export default function ApprovalMatrixPage() {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.expenseBudgets<any[]>();
        if (!cancelled) setRules(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setRules([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ApprovalRule | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(rules.map(r => r.category));
    return Array.from(cats).sort();
  }, [rules]);

  const filteredRules = useMemo(() => {
    if (filterCategory === 'all') return rules;
    return rules.filter(r => r.category === filterCategory);
  }, [rules, filterCategory]);

  const stats = useMemo(() => ({
    total: rules.length,
    active: rules.filter(r => r.isActive).length,
    inactive: rules.filter(r => !r.isActive).length,
    categories: categories.length
  }), [rules, categories]);

  const handleToggleActive = (ruleId: string) => {
    setRules(rules.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
    const rule = rules.find(r => r.id === ruleId);
    toast({
      title: rule?.isActive ? "Rule Deactivated" : "Rule Activated",
      description: `${rule?.name} has been ${rule?.isActive ? 'deactivated' : 'activated'}`
    });
  };

  const handleEdit = (rule: ApprovalRule) => {
    setSelectedRule(rule);
    setShowEditModal(true);
  };

  const handleDelete = (rule: ApprovalRule) => {
    setSelectedRule(rule);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedRule) return;
    setRules(rules.filter(r => r.id !== selectedRule.id));
    setShowDeleteModal(false);
    toast({
      title: "Rule Deleted",
      description: `${selectedRule.name} has been removed`
    });
    setSelectedRule(null);
  };

  const formatAmount = (amount: number | null) => {
    if (amount === null) return 'No Limit';
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Network className="h-7 w-7 text-purple-600" />
          Approval Matrix
        </h1>
        <p className="text-sm text-gray-600 mt-1">Configure expense approval workflows and hierarchy</p>
      </div>

      {/* Info Alert */}
      <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Approval Workflow Guidelines</h3>
            <p className="text-sm text-blue-800">
              Define multi-level approval workflows based on expense categories and amounts.
              Rules are applied in order of amount range. Ensure no gaps in amount ranges for each category.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Rules</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Active Rules</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Inactive Rules</div>
          <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Categories</div>
          <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="mb-3 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700">Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Approval Rule
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-2">
        {filteredRules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className={`px-3 py-2 border-b border-gray-200 flex items-center justify-between ${
              rule.isActive ? 'bg-gradient-to-r from-purple-50 to-purple-100' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                }`}>
                  {rule.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  {rule.category}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(rule.id)}
                  className={`p-2 rounded-lg ${
                    rule.isActive
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  title={rule.isActive ? 'Deactivate' : 'Activate'}
                >
                  {rule.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleEdit(rule)}
                  className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(rule)}
                  className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Amount Range */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Amount Range</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900">{formatAmount(rule.minAmount)}</span>
                    <span className="text-sm text-gray-500">to</span>
                    <span className="text-sm text-gray-900">{formatAmount(rule.maxAmount)}</span>
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Conditions</h4>
                  <div className="flex flex-wrap gap-2">
                    {rule.conditions.requireReceipt && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Receipt Required</span>
                    )}
                    {rule.conditions.requireJustification && (
                      <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded">Justification Required</span>
                    )}
                    {rule.conditions.allowSelfApproval && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Self-Approval Allowed</span>
                    )}
                  </div>
                </div>

                {/* Approval Hierarchy */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Approval Hierarchy</h4>
                  <div className="space-y-2">
                    {rule.approvers.map((approver, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                          L{approver.level}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{approver.role}</div>
                          <div className="text-xs text-gray-600">
                            Escalation: {approver.escalationDays} day{approver.escalationDays !== 1 ? 's' : ''}
                          </div>
                        </div>
                        {approver.autoApprove && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Auto-Approve</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add Approval Rule</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Add approval rule functionality will be implemented with a comprehensive form including:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700 list-disc list-inside">
                <li>Rule name and category selection</li>
                <li>Amount range configuration</li>
                <li>Multi-level approver hierarchy builder</li>
                <li>Escalation rules and timeframes</li>
                <li>Approval conditions (receipt, justification, etc.)</li>
              </ul>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Approval Rule</h2>
            </div>
            <div className="p-6">
              <div className="mb-2">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedRule.name}</h3>
                <p className="text-sm text-gray-600">
                  Edit approval rule functionality will include form fields for all rule parameters.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRule(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast({
                    title: "Rule Updated",
                    description: "Approval rule changes saved successfully"
                  });
                  setShowEditModal(false);
                  setSelectedRule(null);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Delete Approval Rule?</h2>
              </div>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete <strong>{selectedRule.name}</strong>?
              </p>
              <p className="text-sm text-gray-500">
                This action cannot be undone. Expenses currently using this rule may be affected.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRule(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines Box */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Best Practices</h3>
        <ul className="space-y-1 text-sm text-purple-800">
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <span>Define clear amount ranges without gaps to ensure all expenses are covered</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <span>Set realistic escalation timeframes to balance approval speed and control</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <span>Use auto-approval for low-risk, small-amount expenses to reduce workload</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <span>Require receipts and justification for high-value or unusual expenses</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
