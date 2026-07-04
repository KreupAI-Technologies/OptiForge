'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { FileText, Edit2, Save, X, AlertCircle, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PolicySetting {
  id: string;
  category: string;
  settings: {
    id: string;
    label: string;
    value: string | number | boolean;
    type: 'text' | 'number' | 'boolean' | 'select';
    options?: string[];
    unit?: string;
    description: string;
  }[];
}

export default function ExpensePoliciesPage() {
  const [policies, setPolicies] = useState<PolicySetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.expenseBudgets<any[]>();
        if (!cancelled) setPolicies(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setPolicies([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});

  const handleEdit = (categoryId: string) => {
    const category = policies.find(p => p.id === categoryId);
    if (category) {
      const values: Record<string, any> = {};
      category.settings.forEach(setting => {
        values[setting.id] = setting.value;
      });
      setEditedValues(values);
      setEditingCategory(categoryId);
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setEditedValues({});
  };

  const handleSave = () => {
    if (!editingCategory) return;

    setPolicies(policies.map(policy => {
      if (policy.id === editingCategory) {
        return {
          ...policy,
          settings: policy.settings.map(setting => ({
            ...setting,
            value: editedValues[setting.id] !== undefined ? editedValues[setting.id] : setting.value
          }))
        };
      }
      return policy;
    }));

    setEditingCategory(null);
    setEditedValues({});

    toast({
      title: "Policies Updated",
      description: "Expense policies have been updated successfully"
    });
  };

  const handleValueChange = (settingId: string, value: any) => {
    setEditedValues({
      ...editedValues,
      [settingId]: value
    });
  };

  const renderSettingInput = (setting: PolicySetting['settings'][0], isEditing: boolean) => {
    const value = isEditing ? (editedValues[setting.id] ?? setting.value) : setting.value;

    if (!isEditing) {
      if (setting.type === 'boolean') {
        return (
          <span className={`px-3 py-1 text-sm font-medium rounded ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {value ? 'Enabled' : 'Disabled'}
          </span>
        );
      }
      return (
        <span className="text-sm font-semibold text-gray-900">
          {setting.unit && setting.type === 'number' && setting.unit.startsWith('₹') ? setting.unit.replace('₹', '₹') : ''}
          {value}
          {setting.unit && !setting.unit.startsWith('₹') ? ` ${setting.unit}` : ''}
        </span>
      );
    }

    switch (setting.type) {
      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => handleValueChange(setting.id, e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">{value ? 'Enabled' : 'Disabled'}</span>
          </label>
        );
      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => handleValueChange(setting.id, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'number':
        return (
          <div className="flex items-center gap-2">
            {setting.unit?.startsWith('₹') && <span className="text-sm text-gray-700">{setting.unit.split('/')[0]}</span>}
            <input
              type="number"
              value={value as number}
              onChange={(e) => handleValueChange(setting.id, parseInt(e.target.value) || 0)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            {setting.unit && !setting.unit.startsWith('₹') && <span className="text-sm text-gray-700">{setting.unit}</span>}
          </div>
        );
      default:
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleValueChange(setting.id, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        );
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-7 w-7 text-purple-600" />
          Expense Policies
        </h1>
        <p className="text-sm text-gray-600 mt-1">Configure company-wide expense policies and limits</p>
      </div>

      {/* Info Alert */}
      <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Policy Guidelines</h3>
            <p className="text-sm text-blue-800">
              These policies apply to all expense claims company-wide. Changes will take effect immediately.
              Ensure policies comply with local labor laws and tax regulations.
            </p>
          </div>
        </div>
      </div>

      {/* Policy Categories */}
      <div className="space-y-3">
        {policies.map((policy) => {
          const isEditing = editingCategory === policy.id;

          return (
            <div key={policy.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-3 py-2 flex items-center justify-between border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{policy.category}</h2>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium text-sm"
                      >
                        <Check className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2 font-medium text-sm"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(policy.id)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium text-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-2">
                  {policy.settings.map((setting) => (
                    <div key={setting.id} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">{setting.label}</div>
                        <div className="text-sm text-gray-600">{setting.description}</div>
                      </div>
                      <div className="ml-4">
                        {renderSettingInput(setting, isEditing)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Box */}
      {policies.length >= 5 && policies[0]?.settings?.length >= 4 &&
        policies[1]?.settings?.length >= 4 && policies[2]?.settings?.length >= 1 &&
        policies[3]?.settings?.length >= 1 && policies[4]?.settings?.length >= 2 && (
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Key Policy Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-purple-800">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-purple-600" />
            <span>Expenses must be submitted within {policies[0].settings[0].value} days</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-purple-600" />
            <span>Receipt mandatory for expenses above ₹{policies[0].settings[3].value}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-purple-600" />
            <span>Hotel limit: ₹{policies[1].settings[3].value}/night (Metro cities)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-purple-600" />
            <span>Daily meal allowance: ₹{policies[2].settings[0].value}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-purple-600" />
            <span>Reimbursements processed on {policies[4].settings[1].value}th of every month</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-purple-600" />
            <span>Mobile reimbursement: ₹{policies[3].settings[0].value}/month</span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
