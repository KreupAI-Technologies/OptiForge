'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit, Calculator, DollarSign, TrendingUp, TrendingDown,
  AlertCircle, FileText,
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

interface JobCosting {
  id: string;
  costSheetNumber: string;
  jobNumber: string;
  jobName: string;
  projectType: string;
  customer: string;
  costingDate: string;
  status: string;
  totalEstimatedCost: number;
  totalActualCost: number;
  variance: number;
  variancePercent: number;
  profitMargin: number;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  costEngineer: string;
}

export default function JobCostingViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [costing, setCosting] = useState<JobCosting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

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
        setCosting({
          id: c.id,
          costSheetNumber: c.costSheetNumber ?? '',
          jobNumber: c.jobNumber ?? '',
          jobName: c.jobName ?? '',
          projectType: c.projectType ?? '',
          customer: c.customer ?? '',
          costingDate: c.costingDate ?? '',
          status: c.status ?? '',
          totalEstimatedCost: Number(c.totalEstimatedCost ?? 0),
          totalActualCost: Number(c.totalActualCost ?? 0),
          variance: Number(c.variance ?? 0),
          variancePercent: Number(c.variancePercent ?? 0),
          profitMargin: Number(c.profitMargin ?? 0),
          materialCost: Number(c.materialCost ?? 0),
          laborCost: Number(c.laborCost ?? 0),
          overheadCost: Number(c.overheadCost ?? 0),
          costEngineer: c.costEngineer ?? '',
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Revised': return 'bg-yellow-100 text-yellow-700';
      case 'Closed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">{costing?.jobName || 'Cost Sheet'}</h1>
              {costing && (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(costing.status)}`}>
                  {costing.status}
                </span>
              )}
            </div>
            <p className="text-gray-600">{costing?.costSheetNumber}</p>
          </div>
        </div>
        {costing && (
          <button
            onClick={() => router.push(`/finance/costing/edit/${params.id}`)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        )}
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

      {costing && !isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estimated Cost</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(costing.totalEstimatedCost)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actual Cost</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(costing.totalActualCost)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Variance</p>
                  <p className={`text-2xl font-bold mt-1 ${costing.variance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {costing.variance >= 0 ? '+' : ''}{formatCurrency(costing.variance)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${costing.variance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {costing.variance >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
              <div className={`mt-2 text-sm ${costing.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {costing.variance >= 0 ? '+' : ''}{costing.variancePercent.toFixed(1)}%
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{costing.profitMargin}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Job Details
              </h2>
              <div className="space-y-3">
                {[
                  ['Cost Sheet No.', costing.costSheetNumber],
                  ['Job Number', costing.jobNumber],
                  ['Project Type', costing.projectType],
                  ['Customer', costing.customer],
                  ['Costing Date', costing.costingDate],
                  ['Cost Engineer', costing.costEngineer],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-900">{value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-600" />
                Cost Breakdown
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Material Cost</span>
                  <span className="font-medium text-gray-900">{formatCurrency(costing.materialCost)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Labor Cost</span>
                  <span className="font-medium text-gray-900">{formatCurrency(costing.laborCost)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Overhead Cost</span>
                  <span className="font-medium text-gray-900">{formatCurrency(costing.overheadCost)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-900 font-semibold">Total Estimated</span>
                  <span className="font-bold text-blue-700">{formatCurrency(costing.totalEstimatedCost)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
