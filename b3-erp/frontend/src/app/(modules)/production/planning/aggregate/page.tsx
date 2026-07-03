'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Plus, Calendar, Users, Package, TrendingUp, Factory, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { NewPlanModal, ExportPlanModal, ScenarioComparisonModal } from '@/components/production/AggregatePlanningModals';

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

  // Mock data for aggregate plans
  const [plans, setPlans] = useState<AggregatePlan[]>([
    {
      id: '1',
      planNumber: 'AP-2025-Q4',
      planName: 'Q4 2025 Aggregate Production Plan - Kitchen Products',
      planningPeriod: 'Q4 2025',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      status: 'active',
      createdBy: 'Priya Sharma',
      createdDate: '2025-09-15',
      months: [
        {
          month: 'Oct 2025',
          forecastedDemand: 8500,
          productionPlan: 8800,
          beginningInventory: 1200,
          endingInventory: 1500,
          regularTimeCapacity: 9000,
          regularTimeProduction: 8800,
          overtimeCapacity: 1500,
          overtimeProduction: 0,
          subcontractingProduction: 0,
          requiredWorkers: 145,
          hiredWorkers: 5,
          laidOffWorkers: 0,
          totalCost: 12850000,
          inventoryCost: 450000,
          productionCost: 11800000,
          hiringCost: 250000,
          layoffCost: 0,
          overtimeCost: 0,
          subcontractingCost: 350000
        },
        {
          month: 'Nov 2025',
          forecastedDemand: 9200,
          productionPlan: 9500,
          beginningInventory: 1500,
          endingInventory: 1800,
          regularTimeCapacity: 9000,
          regularTimeProduction: 9000,
          overtimeCapacity: 1500,
          overtimeProduction: 500,
          subcontractingProduction: 0,
          requiredWorkers: 150,
          hiredWorkers: 5,
          laidOffWorkers: 0,
          totalCost: 14280000,
          inventoryCost: 540000,
          productionCost: 12600000,
          hiringCost: 250000,
          layoffCost: 0,
          overtimeCost: 890000,
          subcontractingCost: 0
        },
        {
          month: 'Dec 2025',
          forecastedDemand: 10500,
          productionPlan: 10800,
          beginningInventory: 1800,
          endingInventory: 2100,
          regularTimeCapacity: 9000,
          regularTimeProduction: 9000,
          overtimeCapacity: 1500,
          overtimeProduction: 1200,
          subcontractingProduction: 600,
          requiredWorkers: 155,
          hiredWorkers: 5,
          laidOffWorkers: 0,
          totalCost: 16950000,
          inventoryCost: 630000,
          productionCost: 13200000,
          hiringCost: 250000,
          layoffCost: 0,
          overtimeCost: 2140000,
          subcontractingCost: 730000
        }
      ]
    },
    {
      id: '2',
      planNumber: 'AP-2025-Q3',
      planName: 'Q3 2025 Aggregate Production Plan - Kitchen Products',
      planningPeriod: 'Q3 2025',
      startDate: '2025-07-01',
      endDate: '2025-09-30',
      status: 'completed',
      createdBy: 'Priya Sharma',
      createdDate: '2025-06-15',
      months: [
        {
          month: 'Jul 2025',
          forecastedDemand: 7800,
          productionPlan: 8000,
          beginningInventory: 1100,
          endingInventory: 1300,
          regularTimeCapacity: 8500,
          regularTimeProduction: 8000,
          overtimeCapacity: 1500,
          overtimeProduction: 0,
          subcontractingProduction: 0,
          requiredWorkers: 135,
          hiredWorkers: 0,
          laidOffWorkers: 5,
          totalCost: 11650000,
          inventoryCost: 390000,
          productionCost: 10800000,
          hiringCost: 0,
          layoffCost: 350000,
          overtimeCost: 0,
          subcontractingCost: 110000
        },
        {
          month: 'Aug 2025',
          forecastedDemand: 8100,
          productionPlan: 8200,
          beginningInventory: 1300,
          endingInventory: 1400,
          regularTimeCapacity: 8500,
          regularTimeProduction: 8200,
          overtimeCapacity: 1500,
          overtimeProduction: 0,
          subcontractingProduction: 0,
          requiredWorkers: 138,
          hiredWorkers: 3,
          laidOffWorkers: 0,
          totalCost: 11980000,
          inventoryCost: 420000,
          productionCost: 11100000,
          hiringCost: 150000,
          layoffCost: 0,
          overtimeCost: 0,
          subcontractingCost: 310000
        },
        {
          month: 'Sep 2025',
          forecastedDemand: 8400,
          productionPlan: 8600,
          beginningInventory: 1400,
          endingInventory: 1600,
          regularTimeCapacity: 8500,
          regularTimeProduction: 8500,
          overtimeCapacity: 1500,
          overtimeProduction: 100,
          subcontractingProduction: 0,
          requiredWorkers: 140,
          hiredWorkers: 2,
          laidOffWorkers: 0,
          totalCost: 12450000,
          inventoryCost: 480000,
          productionCost: 11550000,
          hiringCost: 100000,
          layoffCost: 0,
          overtimeCost: 180000,
          subcontractingCost: 140000
        }
      ]
    }
  ]);

  // Handler functions
  const handleCreatePlan = (planData: Partial<AggregatePlan>) => {
    const newPlan: AggregatePlan = {
      id: `${plans.length + 1}`,
      planNumber: planData.planNumber || '',
      planName: planData.planName || '',
      planningPeriod: planData.planningPeriod || '',
      startDate: planData.startDate || '',
      endDate: planData.endDate || '',
      status: planData.status || 'draft',
      createdBy: 'Current User',
      createdDate: new Date().toISOString().split('T')[0],
      months: [],
    };
    setPlans([...plans, newPlan]);
    alert('Plan created successfully!');
  };

  const handleEditPlan = (planData: Partial<AggregatePlan>) => {
    if (!selectedPlanForEdit) return;
    setPlans(plans.map((p) =>
      p.id === selectedPlanForEdit.id ? { ...p, ...planData } : p
    ));
    alert('Plan updated successfully!');
  };

  const handleExport = (format: string, options: any) => {
    exportToCsv('aggregate-plan', plans as unknown as Record<string, unknown>[]);
  };

  const currentPlan = plans.find(plan => plan.planNumber === selectedPlan) || plans[0];

  const totalDemand = currentPlan.months.reduce((sum, m) => sum + m.forecastedDemand, 0);
  const totalProduction = currentPlan.months.reduce((sum, m) => sum + m.productionPlan, 0);
  const totalCost = currentPlan.months.reduce((sum, m) => sum + m.totalCost, 0);
  const avgCapacityUtilization = currentPlan.months.reduce((sum, m) =>
    sum + (m.regularTimeProduction / m.regularTimeCapacity * 100), 0) / currentPlan.months.length;

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
