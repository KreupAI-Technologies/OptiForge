'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Plus, Calendar, Users, Package, TrendingUp, Factory, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { NewPlanModal, ExportPlanModal, ScenarioComparisonModal } from '@/components/production/AggregatePlanningModals';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

interface AggregatePlan {
  id: string;
  planNumber: string;
  planName: string;
  planningPeriod: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'approved' | 'completed';
  createdBy: string;
  createdDate: string;
  months: MonthlyPlan[];
}

interface MonthlyPlan {
  month: string;
  forecastedDemand: number;
  productionPlan: number;
  beginningInventory: number;
  endingInventory: number;
  regularTimeCapacity: number;
  regularTimeProduction: number;
  overtimeCapacity: number;
  overtimeProduction: number;
  subcontractingProduction: number;
  requiredWorkers: number;
  hiredWorkers: number;
  laidOffWorkers: number;
  totalCost: number;
  inventoryCost: number;
  productionCost: number;
  hiringCost: number;
  layoffCost: number;
  overtimeCost: number;
  subcontractingCost: number;
}

export default function AggregatePlanningPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('AP-2025-Q4');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<AggregatePlan | null>(null);

  // Aggregate plans — loaded from API (starts empty; see loadPlans below).
  const [plans, setPlans] = useState<AggregatePlan[]>([]);

  // Defensive mapper: raw ORM record -> local AggregatePlan shape (mock-shape defaults per field).
  const mapPlan = (r: any): AggregatePlan => ({
    id: String(r?.id ?? r?._id ?? ''),
    planNumber: r?.planNumber ?? r?.plan_number ?? '',
    planName: r?.planName ?? r?.plan_name ?? '',
    planningPeriod: r?.planningPeriod ?? r?.planning_period ?? '',
    startDate: r?.startDate ?? r?.start_date ?? '',
    endDate: r?.endDate ?? r?.end_date ?? '',
    status: (r?.status as AggregatePlan['status']) ?? 'draft',
    createdBy: r?.createdBy ?? r?.created_by ?? '',
    createdDate: r?.createdDate ?? r?.created_date ?? (r?.createdAt ? String(r.createdAt).split('T')[0] : ''),
    months: Array.isArray(r?.months)
      ? r.months.map((m: any) => ({
          month: m?.month ?? '',
          forecastedDemand: m?.forecastedDemand ?? 0,
          productionPlan: m?.productionPlan ?? 0,
          beginningInventory: m?.beginningInventory ?? 0,
          endingInventory: m?.endingInventory ?? 0,
          regularTimeCapacity: m?.regularTimeCapacity ?? 0,
          regularTimeProduction: m?.regularTimeProduction ?? 0,
          overtimeCapacity: m?.overtimeCapacity ?? 0,
          overtimeProduction: m?.overtimeProduction ?? 0,
          subcontractingProduction: m?.subcontractingProduction ?? 0,
          requiredWorkers: m?.requiredWorkers ?? 0,
          hiredWorkers: m?.hiredWorkers ?? 0,
          laidOffWorkers: m?.laidOffWorkers ?? 0,
          totalCost: m?.totalCost ?? 0,
          inventoryCost: m?.inventoryCost ?? 0,
          productionCost: m?.productionCost ?? 0,
          hiringCost: m?.hiringCost ?? 0,
          layoffCost: m?.layoffCost ?? 0,
          overtimeCost: m?.overtimeCost ?? 0,
          subcontractingCost: m?.subcontractingCost ?? 0,
        }))
      : [],
  });

  const loadPlans = useCallback(async () => {
    try {
      const res = await ProductionOrphanService.getAggregatePlans();
      const data = Array.isArray(res) ? res : ((res as any)?.data ?? res);
      const mapped = Array.isArray(data) ? data.map(mapPlan) : [];
      setPlans(mapped);
    } catch (err) {
      console.error('Failed to load aggregate plans:', err);
      setPlans([]);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Handler functions
  const handleCreatePlan = async (planData: Partial<AggregatePlan>) => {
    try {
      const payload = {
        planNumber: planData.planNumber || '',
        planName: planData.planName || '',
        planningPeriod: planData.planningPeriod || '',
        startDate: planData.startDate || '',
        endDate: planData.endDate || '',
        status: planData.status || 'draft',
        months: planData.months || [],
      };
      await ProductionOrphanService.createAggregatePlan(payload);
      await loadPlans();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create aggregate plan:', err);
    }
  };

  const handleEditPlan = async (planData: Partial<AggregatePlan>) => {
    if (!selectedPlanForEdit) return;
    try {
      // No dedicated update endpoint — upsert by including the id in the body so the
      // backend can update-in-place; falls back to create if id is unknown.
      const payload = {
        id: selectedPlanForEdit.id,
        planNumber: planData.planNumber ?? selectedPlanForEdit.planNumber,
        planName: planData.planName ?? selectedPlanForEdit.planName,
        planningPeriod: planData.planningPeriod ?? selectedPlanForEdit.planningPeriod,
        startDate: planData.startDate ?? selectedPlanForEdit.startDate,
        endDate: planData.endDate ?? selectedPlanForEdit.endDate,
        status: planData.status ?? selectedPlanForEdit.status,
        months: planData.months ?? selectedPlanForEdit.months,
      };
      await ProductionOrphanService.createAggregatePlan(payload);
      await loadPlans();
      setIsEditModalOpen(false);
      setSelectedPlanForEdit(null);
    } catch (err) {
      console.error('Failed to update aggregate plan:', err);
    }
  };

  const handleExport = (format: string, options: any) => {
    exportToCsv('aggregate-plan', plans as unknown as Record<string, unknown>[]);
  };

  // Guard: plans may be empty while the API loads or when the DB has no records.
  const emptyPlan: AggregatePlan = {
    id: '',
    planNumber: '',
    planName: '',
    planningPeriod: '',
    startDate: '',
    endDate: '',
    status: 'draft',
    createdBy: '',
    createdDate: '',
    months: [],
  };
  const currentPlan = plans.find(plan => plan.planNumber === selectedPlan) || plans[0] || emptyPlan;

  const totalDemand = currentPlan.months.reduce((sum, m) => sum + m.forecastedDemand, 0);
  const totalProduction = currentPlan.months.reduce((sum, m) => sum + m.productionPlan, 0);
  const totalCost = currentPlan.months.reduce((sum, m) => sum + m.totalCost, 0);
  const avgCapacityUtilization = currentPlan.months.length > 0
    ? currentPlan.months.reduce((sum, m) =>
        sum + (m.regularTimeCapacity > 0 ? (m.regularTimeProduction / m.regularTimeCapacity * 100) : 0), 0) / currentPlan.months.length
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-700 bg-gray-100';
      case 'active': return 'text-blue-700 bg-blue-100';
      case 'approved': return 'text-green-700 bg-green-100';
      case 'completed': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {/* Inline Header */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aggregate Planning</h1>
            <p className="text-sm text-gray-500 mt-1">Long-term production capacity and resource planning</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScenarioModalOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Compare Scenarios</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Plan</span>
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Plan Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {plans.map(plan => (
                <option key={plan.id} value={plan.planNumber}>
                  {plan.planNumber} - {plan.planName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(currentPlan.status)}`}>
              {currentPlan.status}
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Planning Period</p>
            <p className="font-semibold text-gray-900">{currentPlan.planningPeriod}</p>
          </div>
          <div>
            <p className="text-gray-500">Duration</p>
            <p className="font-semibold text-gray-900">{currentPlan.startDate} to {currentPlan.endDate}</p>
          </div>
          <div>
            <p className="text-gray-500">Created By</p>
            <p className="font-semibold text-gray-900">{currentPlan.createdBy}</p>
          </div>
          <div>
            <p className="text-gray-500">Created Date</p>
            <p className="font-semibold text-gray-900">{currentPlan.createdDate}</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Demand</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalDemand.toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-1">units</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Package className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Production</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{totalProduction.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">units</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <Factory className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Cost</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">₹{(totalCost / 10000000).toFixed(1)}Cr</p>
              <p className="text-xs text-purple-600 mt-1">{currentPlan.planningPeriod}</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Capacity Used</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{avgCapacityUtilization.toFixed(1)}%</p>
              <p className="text-xs text-orange-600 mt-1">Regular time</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <Clock className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Production Plan Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-3">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Monthly Production Plan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Demand</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Production</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Begin Inv.</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">End Inv.</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Regular</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subcontract</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Workers</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPlan.months.map((month, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{month.month}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-900">{month.forecastedDemand.toLocaleString()}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-blue-600">{month.productionPlan.toLocaleString()}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-700">{month.beginningInventory.toLocaleString()}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-700">{month.endingInventory.toLocaleString()}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{month.regularTimeProduction.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {((month.regularTimeProduction / month.regularTimeCapacity) * 100).toFixed(0)}% used
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className={`text-sm ${month.overtimeProduction > 0 ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                      {month.overtimeProduction.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className={`text-sm ${month.subcontractingProduction > 0 ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                      {month.subcontractingProduction.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">{month.requiredWorkers}</div>
                    <div className="text-xs text-gray-500">
                      {month.hiredWorkers > 0 && <span className="text-green-600">+{month.hiredWorkers}</span>}
                      {month.laidOffWorkers > 0 && <span className="text-red-600">-{month.laidOffWorkers}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-gray-900">₹{(month.totalCost / 100000).toFixed(1)}L</span>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="px-3 py-2 text-sm text-gray-900">TOTAL</td>
                <td className="px-3 py-2 text-sm text-gray-900 text-right">{totalDemand.toLocaleString()}</td>
                <td className="px-3 py-2 text-sm text-blue-600 text-right">{totalProduction.toLocaleString()}</td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm text-gray-900 text-right">
                  {currentPlan.months.reduce((sum, m) => sum + m.regularTimeProduction, 0).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-sm text-orange-600 text-right">
                  {currentPlan.months.reduce((sum, m) => sum + m.overtimeProduction, 0).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-sm text-purple-600 text-right">
                  {currentPlan.months.reduce((sum, m) => sum + m.subcontractingProduction, 0).toLocaleString()}
                </td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm text-gray-900 text-right">₹{(totalCost / 10000000).toFixed(2)}Cr</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Cost Breakdown by Month</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Production</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subcontract</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hiring</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Layoff</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPlan.months.map((month, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{month.month}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-700">₹{(month.productionCost / 100000).toFixed(1)}L</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-700">₹{(month.inventoryCost / 100000).toFixed(1)}L</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className={`text-sm ${month.overtimeCost > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                      ₹{(month.overtimeCost / 100000).toFixed(1)}L
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className={`text-sm ${month.subcontractingCost > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                      ₹{(month.subcontractingCost / 100000).toFixed(1)}L
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className={`text-sm ${month.hiringCost > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      ₹{(month.hiringCost / 100000).toFixed(1)}L
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className={`text-sm ${month.layoffCost > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      ₹{(month.layoffCost / 100000).toFixed(1)}L
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-gray-900">₹{(month.totalCost / 100000).toFixed(1)}L</span>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="px-3 py-2 text-sm text-gray-900">TOTAL</td>
                <td className="px-3 py-2 text-sm text-gray-900 text-right">
                  ₹{(currentPlan.months.reduce((sum, m) => sum + m.productionCost, 0) / 10000000).toFixed(2)}Cr
                </td>
                <td className="px-3 py-2 text-sm text-gray-900 text-right">
                  ₹{(currentPlan.months.reduce((sum, m) => sum + m.inventoryCost, 0) / 100000).toFixed(1)}L
                </td>
                <td className="px-3 py-2 text-sm text-orange-600 text-right">
                  ₹{(currentPlan.months.reduce((sum, m) => sum + m.overtimeCost, 0) / 100000).toFixed(1)}L
                </td>
                <td className="px-3 py-2 text-sm text-purple-600 text-right">
                  ₹{(currentPlan.months.reduce((sum, m) => sum + m.subcontractingCost, 0) / 100000).toFixed(1)}L
                </td>
                <td className="px-3 py-2 text-sm text-green-600 text-right">
                  ₹{(currentPlan.months.reduce((sum, m) => sum + m.hiringCost, 0) / 100000).toFixed(1)}L
                </td>
                <td className="px-3 py-2 text-sm text-red-600 text-right">
                  ₹{(currentPlan.months.reduce((sum, m) => sum + m.layoffCost, 0) / 100000).toFixed(1)}L
                </td>
                <td className="px-3 py-2 text-sm text-gray-900 text-right">
                  ₹{(totalCost / 10000000).toFixed(2)}Cr
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <NewPlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePlan}
      />
      <NewPlanModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPlanForEdit(null);
        }}
        plan={selectedPlanForEdit}
        onSave={handleEditPlan}
      />
      <ExportPlanModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
      <ScenarioComparisonModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        currentPlan={currentPlan}
      />
    </div>
  );
}
