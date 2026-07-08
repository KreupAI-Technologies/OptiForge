'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Calculator, AlertCircle } from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

interface FormState {
  costSheetNumber: string;
  jobNumber: string;
  jobName: string;
  projectType: string;
  customer: string;
  costingDate: string;
  status: string;
  costEngineer: string;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalActualCost: number;
  profitMargin: number;
}

export default function JobCostingEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      setNotFound(false);
      try {
        const c = await FinanceService.getJobCostSheet(params.id);
        if (cancelled) return;
        if (!c || !c.id) {
          setNotFound(true);
          return;
        }
        setForm({
          costSheetNumber: c.costSheetNumber ?? '',
          jobNumber: c.jobNumber ?? '',
          jobName: c.jobName ?? '',
          projectType: c.projectType ?? '',
          customer: c.customer ?? '',
          costingDate: c.costingDate ? String(c.costingDate).slice(0, 10) : '',
          status: c.status ?? 'Draft',
          costEngineer: c.costEngineer ?? '',
          materialCost: Number(c.materialCost ?? 0),
          laborCost: Number(c.laborCost ?? 0),
          overheadCost: Number(c.overheadCost ?? 0),
          totalActualCost: Number(c.totalActualCost ?? 0),
          profitMargin: Number(c.profitMargin ?? 0),
        });
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load cost sheet');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const setField = (key: keyof FormState, value: string | number) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await FinanceService.updateJobCostSheet(params.id, {
        costSheetNumber: form.costSheetNumber,
        jobNumber: form.jobNumber,
        jobName: form.jobName,
        projectType: form.projectType,
        customer: form.customer,
        costingDate: form.costingDate,
        status: form.status,
        costEngineer: form.costEngineer,
        materialCost: form.materialCost,
        laborCost: form.laborCost,
        overheadCost: form.overheadCost,
        totalActualCost: form.totalActualCost,
        profitMargin: form.profitMargin,
      });
      router.push('/finance/costing');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save cost sheet');
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm';

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Cost Sheet</h1>
            <p className="text-gray-600 text-sm">{form?.costSheetNumber}</p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading cost sheet…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {notFound && !isLoading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Cost sheet not found.
        </div>
      )}

      {form && !isLoading && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
          {saveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {saveError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cost Sheet No.</label>
              <input type="text" value={form.costSheetNumber} onChange={(e) => setField('costSheetNumber', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Job Number</label>
              <input type="text" value={form.jobNumber} onChange={(e) => setField('jobNumber', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Job Name</label>
              <input type="text" value={form.jobName} onChange={(e) => setField('jobName', e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Project Type</label>
              <input type="text" value={form.projectType} onChange={(e) => setField('projectType', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Customer</label>
              <input type="text" value={form.customer} onChange={(e) => setField('customer', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Costing Date</label>
              <input type="date" value={form.costingDate} onChange={(e) => setField('costingDate', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setField('status', e.target.value)} className={inputCls}>
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Revised">Revised</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cost Engineer</label>
              <input type="text" value={form.costEngineer} onChange={(e) => setField('costEngineer', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Profit Margin (%)</label>
              <input type="number" step="0.1" value={form.profitMargin} onChange={(e) => setField('profitMargin', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Material Cost</label>
              <input type="number" step="0.01" value={form.materialCost} onChange={(e) => setField('materialCost', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Labor Cost</label>
              <input type="number" step="0.01" value={form.laborCost} onChange={(e) => setField('laborCost', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Overhead Cost</label>
              <input type="number" step="0.01" value={form.overheadCost} onChange={(e) => setField('overheadCost', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Total Actual Cost</label>
              <input type="number" step="0.01" value={form.totalActualCost} onChange={(e) => setField('totalActualCost', Number(e.target.value))} className={inputCls} />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/finance/costing')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
