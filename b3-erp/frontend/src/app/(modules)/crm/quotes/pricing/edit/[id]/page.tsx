'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, X, Percent, DollarSign, TrendingUp, Users, Package, Calendar, AlertCircle } from 'lucide-react';
import { crmService } from '@/services/crm.service';

export default function EditPricingRulePage() {
  const router = useRouter();
  const params = useParams();
  const ruleId = params?.id as string;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ruleType: 'volume' as 'volume' | 'customer' | 'product' | 'seasonal' | 'bundle' | 'time-limited',
    discountType: 'percentage' as 'percentage' | 'fixed' | 'tiered',
    discountValue: '',
    priority: '',
    isActive: true,
    validFrom: '',
    validUntil: '',
  });

  const [conditions, setConditions] = useState<string[]>(['']);
  const [applicableProducts, setApplicableProducts] = useState<string[]>(['']);
  const [applicableCustomers, setApplicableCustomers] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [stats, setStats] = useState<{ usageCount: number; totalSavings: number; createdDate: string }>({
    usageCount: 0,
    totalSavings: 0,
    createdDate: '',
  });

  // Fetch the real pricing rule record and prefill the form.
  useEffect(() => {
    if (!ruleId) return;
    let cancelled = false;
    crmService.pricingRules
      .getById(ruleId)
      .then((r: any) => {
        if (cancelled || !r || typeof r !== 'object') return;
        setFormData(prev => ({
          ...prev,
          name: r.name ?? r.ruleName ?? prev.name,
          description: r.description ?? prev.description,
          ruleType: (r.ruleType ?? prev.ruleType),
          discountType: (r.discountType ?? prev.discountType),
          discountValue: r.discountValue != null ? String(r.discountValue) : prev.discountValue,
          priority: r.priority != null ? String(r.priority) : prev.priority,
          isActive: r.isActive ?? prev.isActive,
          validFrom: (r.validFrom ?? prev.validFrom ?? '').toString().slice(0, 10),
          validUntil: r.validUntil ? r.validUntil.toString().slice(0, 10) : prev.validUntil,
        }));
        if (Array.isArray(r.conditions) && r.conditions.length > 0) setConditions(r.conditions);
        if (Array.isArray(r.applicableProducts) && r.applicableProducts.length > 0) setApplicableProducts(r.applicableProducts);
        if (Array.isArray(r.applicableCustomers) && r.applicableCustomers.length > 0) setApplicableCustomers(r.applicableCustomers);
        setStats({
          usageCount: Number(r.usageCount ?? 0),
          totalSavings: Number(r.totalSavings ?? 0),
          createdDate: (r.createdDate ?? r.createdAt ?? '').toString().slice(0, 10),
        });
      })
      .catch(() => { /* leave defaults on failure */ });
    return () => {
      cancelled = true;
    };
  }, [ruleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.discountValue) newErrors.discountValue = 'Discount value is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (!formData.validFrom) newErrors.validFrom = 'Valid from date is required';
    if (conditions.filter(c => c.trim()).length === 0) newErrors.conditions = 'At least one condition is required';
    if (applicableProducts.filter(p => p.trim()).length === 0) newErrors.applicableProducts = 'At least one product is required';
    if (applicableCustomers.filter(c => c.trim()).length === 0) newErrors.applicableCustomers = 'At least one customer segment is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        ruleType: formData.ruleType,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        priority: Number(formData.priority),
        isActive: formData.isActive,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil || undefined,
        conditions: conditions.filter(c => c.trim()),
        applicableProducts: applicableProducts.filter(p => p.trim()),
        applicableCustomers: applicableCustomers.filter(c => c.trim()),
      };
      await crmService.pricingRules.update(ruleId, payload);
      router.push('/crm/quotes/pricing');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update pricing rule');
      setSaving(false);
    }
  };

  const addCondition = () => {
    setConditions([...conditions, '']);
  };

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((_, i) => i !== index));
    }
  };

  const updateCondition = (index: number, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = value;
    setConditions(newConditions);
  };

  const addProduct = () => {
    setApplicableProducts([...applicableProducts, '']);
  };

  const removeProduct = (index: number) => {
    if (applicableProducts.length > 1) {
      setApplicableProducts(applicableProducts.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (index: number, value: string) => {
    const newProducts = [...applicableProducts];
    newProducts[index] = value;
    setApplicableProducts(newProducts);
  };

  const addCustomer = () => {
    setApplicableCustomers([...applicableCustomers, '']);
  };

  const removeCustomer = (index: number) => {
    if (applicableCustomers.length > 1) {
      setApplicableCustomers(applicableCustomers.filter((_, i) => i !== index));
    }
  };

  const updateCustomer = (index: number, value: string) => {
    const newCustomers = [...applicableCustomers];
    newCustomers[index] = value;
    setApplicableCustomers(newCustomers);
  };

  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case 'volume': return <TrendingUp className="w-5 h-5" />;
      case 'customer': return <Users className="w-5 h-5" />;
      case 'product': return <Package className="w-5 h-5" />;
      case 'seasonal': return <Calendar className="w-5 h-5" />;
      case 'bundle': return <Package className="w-5 h-5" />;
      case 'time-limited': return <Calendar className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing Rules
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Pricing Rule</h1>
          <p className="text-gray-600 mt-2">Update pricing rule configuration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-3">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rule Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Enterprise Volume Discount"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe when and how this rule should be applied"
                    />
                    {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rule Type *
                      </label>
                      <select
                        value={formData.ruleType}
                        onChange={(e) => setFormData({ ...formData, ruleType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="volume">Volume Based</option>
                        <option value="customer">Customer Based</option>
                        <option value="product">Product Based</option>
                        <option value="seasonal">Seasonal</option>
                        <option value="bundle">Bundle</option>
                        <option value="time-limited">Time Limited</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority *
                      </label>
                      <input
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        min="1"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.priority ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="1"
                      />
                      {errors.priority && <p className="text-red-600 text-sm mt-1">{errors.priority}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Discount Configuration */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Discount Configuration</h2>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Type *
                      </label>
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                        <option value="tiered">Tiered</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Value *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.discountValue}
                          onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                          min="0"
                          step="0.01"
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.discountValue ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder={formData.discountType === 'percentage' ? '15' : '500'}
                        />
                        {formData.discountType === 'percentage' ? (
                          <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        ) : (
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        )}
                      </div>
                      {errors.discountValue && <p className="text-red-600 text-sm mt-1">{errors.discountValue}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Validity Period */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Validity Period</h2>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid From *
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.validFrom ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.validFrom && <p className="text-red-600 text-sm mt-1">{errors.validFrom}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for no end date</p>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Conditions *</h2>
                  <button
                    type="button"
                    onClick={addCondition}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Condition
                  </button>
                </div>
                <div className="space-y-3">
                  {conditions.map((condition, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={condition}
                        onChange={(e) => updateCondition(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Order quantity > 100"
                      />
                      {conditions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCondition(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.conditions && <p className="text-red-600 text-sm mt-2">{errors.conditions}</p>}
              </div>

              {/* Applicable Products */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Applicable Products *</h2>
                  <button
                    type="button"
                    onClick={addProduct}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>
                <div className="space-y-3">
                  {applicableProducts.map((product, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={product}
                        onChange={(e) => updateProduct(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., All Software Products"
                      />
                      {applicableProducts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.applicableProducts && <p className="text-red-600 text-sm mt-2">{errors.applicableProducts}</p>}
              </div>

              {/* Applicable Customers */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Applicable Customers *</h2>
                  <button
                    type="button"
                    onClick={addCustomer}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Customer Segment
                  </button>
                </div>
                <div className="space-y-3">
                  {applicableCustomers.map((customer, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={customer}
                        onChange={(e) => updateCustomer(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., All Customers"
                      />
                      {applicableCustomers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCustomer(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.applicableCustomers && <p className="text-red-600 text-sm mt-2">{errors.applicableCustomers}</p>}
              </div>

              {/* Action Buttons */}
              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-3">
              {/* Current Performance */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Performance</h3>
                <div className="space-y-2">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                    <div className="text-sm text-blue-700 mb-1">Times Applied</div>
                    <div className="text-2xl font-bold text-blue-900">{stats.usageCount}</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                    <div className="text-sm text-green-700 mb-1">Total Savings</div>
                    <div className="text-2xl font-bold text-green-900">
                      ${(stats.totalSavings / 1000).toFixed(0)}K
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Created</div>
                    <div className="text-gray-900">
                      {new Date(stats.createdDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rule Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rule Summary</h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Rule Type</div>
                    <div className="flex items-center gap-2 text-gray-900">
                      {getRuleTypeIcon(formData.ruleType)}
                      <span className="capitalize">{formData.ruleType.replace('-', ' ')}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Discount</div>
                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                      {formData.discountType === 'percentage' ? (
                        <Percent className="w-4 h-4" />
                      ) : (
                        <DollarSign className="w-4 h-4" />
                      )}
                      <span>
                        {formData.discountValue ? (
                          formData.discountType === 'percentage' ? `${formData.discountValue}%` : `$${formData.discountValue}`
                        ) : (
                          '-'
                        )}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Priority</div>
                    <div className="text-gray-900 font-semibold">
                      {formData.priority || '-'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Status</div>
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      formData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Rule is active</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
