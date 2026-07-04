'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Filter, Users, Clock, Award, TrendingUp, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { OperatorDetailModal, OperatorDetail } from '@/components/shopfloor/ShopFloorDetailModals';
import { exportToCsv } from '@/lib/export';
import { OperatorExportModal, OperatorExportConfig } from '@/components/shopfloor/ShopFloorExportModals';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

interface Operator {
  id: string;
  employeeId: string;
  operatorName: string;
  department: string;
  shift: 'morning' | 'afternoon' | 'night';
  station: string | null;
  currentWO: string | null;
  currentProduct: string | null;
  status: 'active' | 'on-break' | 'idle' | 'offline';
  skillLevel: 'expert' | 'advanced' | 'intermediate' | 'beginner';
  shiftStartTime: string;
  activeHours: number;
  breakHours: number;
  todayProduced: number;
  todayRejected: number;
  todayEfficiency: number;
  weeklyProduced: number;
  weeklyRejected: number;
  weeklyEfficiency: number;
  qualityScore: number;
  certifications: string[];
  lastActivity: string;
}

interface ShiftSummary {
  shift: string;
  totalOperators: number;
  activeOperators: number;
  onBreak: number;
  idle: number;
  totalProduced: number;
  avgEfficiency: number;
}

export default function ShopFloorOperatorPage() {
  const router = useRouter();
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterShift, setFilterShift] = useState<string>('all');

  // Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<OperatorDetail | null>(null);

  // Operators (live)
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = (await ProductionOrphanService.getOperatorWorkstations()) as any[];
        const mapped: Operator[] = (raw || []).map((r: any) => ({
          id: String(r.id ?? ''),
          employeeId: String(r.employeeId ?? ''),
          operatorName: String(r.operatorName ?? ''),
          department: String(r.department ?? ''),
          shift: (r.shift ?? 'morning') as Operator['shift'],
          station: r.station ?? null,
          currentWO: r.currentWO ?? null,
          currentProduct: r.currentProduct ?? null,
          status: (r.status ?? 'offline') as Operator['status'],
          skillLevel: (r.skillLevel ?? 'beginner') as Operator['skillLevel'],
          shiftStartTime: String(r.shiftStartTime ?? ''),
          activeHours: Number(r.activeHours ?? 0),
          breakHours: Number(r.breakHours ?? 0),
          todayProduced: Number(r.todayProduced ?? 0),
          todayRejected: Number(r.todayRejected ?? 0),
          todayEfficiency: Number(r.todayEfficiency ?? 0),
          weeklyProduced: Number(r.weeklyProduced ?? 0),
          weeklyRejected: Number(r.weeklyRejected ?? 0),
          weeklyEfficiency: Number(r.weeklyEfficiency ?? 0),
          qualityScore: Number(r.qualityScore ?? 0),
          certifications: Array.isArray(r.certifications) ? r.certifications.map((c: any) => String(c)) : [],
          lastActivity: String(r.lastActivity ?? ''),
        }));
        if (!cancelled) setOperators(mapped);
      } catch (err) {
        if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setOperators([]); }
      } finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredOperators = operators.filter(op => {
    const deptMatch = filterDepartment === 'all' || op.department === filterDepartment;
    const statusMatch = filterStatus === 'all' || op.status === filterStatus;
    const shiftMatch = filterShift === 'all' || op.shift === filterShift;
    return deptMatch && statusMatch && shiftMatch;
  });

  // Calculate shift summaries
  const shiftSummaries: ShiftSummary[] = [
    {
      shift: 'Morning',
      totalOperators: operators.filter(o => o.shift === 'morning').length,
      activeOperators: operators.filter(o => o.shift === 'morning' && o.status === 'active').length,
      onBreak: operators.filter(o => o.shift === 'morning' && o.status === 'on-break').length,
      idle: operators.filter(o => o.shift === 'morning' && o.status === 'idle').length,
      totalProduced: operators.filter(o => o.shift === 'morning').reduce((sum, o) => sum + o.todayProduced, 0),
      avgEfficiency: operators.filter(o => o.shift === 'morning' && o.status === 'active').reduce((sum, o) => sum + o.todayEfficiency, 0) / operators.filter(o => o.shift === 'morning' && o.status === 'active').length || 0
    },
    {
      shift: 'Afternoon',
      totalOperators: operators.filter(o => o.shift === 'afternoon').length,
      activeOperators: operators.filter(o => o.shift === 'afternoon' && o.status === 'active').length,
      onBreak: operators.filter(o => o.shift === 'afternoon' && o.status === 'on-break').length,
      idle: operators.filter(o => o.shift === 'afternoon' && o.status === 'idle').length,
      totalProduced: operators.filter(o => o.shift === 'afternoon').reduce((sum, o) => sum + o.todayProduced, 0),
      avgEfficiency: operators.filter(o => o.shift === 'afternoon' && o.status === 'active').reduce((sum, o) => sum + o.todayEfficiency, 0) / operators.filter(o => o.shift === 'afternoon' && o.status === 'active').length || 0
    }
  ];

  const totalActiveOperators = operators.filter(o => o.status === 'active').length;
  const totalOperators = operators.length;
  const avgQualityScore = operators.reduce((sum, o) => sum + o.qualityScore, 0) / operators.length;
  const totalTodayProduced = operators.reduce((sum, o) => sum + o.todayProduced, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'on-break': return 'text-yellow-700 bg-yellow-100';
      case 'idle': return 'text-orange-700 bg-orange-100';
      case 'offline': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getSkillColor = (skill: string) => {
    switch (skill) {
      case 'expert': return 'text-purple-700 bg-purple-100';
      case 'advanced': return 'text-blue-700 bg-blue-100';
      case 'intermediate': return 'text-green-700 bg-green-100';
      case 'beginner': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 100) return 'text-green-600';
    if (efficiency >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Handler functions
  const handleViewOperator = (operator: Operator) => {
    // Convert operator data to OperatorDetail format
    const operatorDetail: OperatorDetail = {
      id: operator.id,
      name: operator.operatorName,
      employeeId: operator.employeeId,
      shift: operator.shift,
      station: operator.station || 'Not Assigned',
      department: operator.department,
      status: operator.status === 'active' ? 'active' : operator.status === 'on-break' ? 'break' : operator.status === 'idle' ? 'idle' : 'offline',
      currentWorkOrder: operator.currentWO || undefined,
      currentOperation: operator.currentProduct || undefined,
      operationStartTime: operator.shiftStartTime,
      elapsedTime: `${operator.activeHours}h`,
      efficiency: operator.todayEfficiency,
      targetParts: Math.round(operator.todayProduced / (operator.todayEfficiency / 100)),
      actualParts: operator.todayProduced,
      goodParts: operator.todayProduced - operator.todayRejected,
      rejectedParts: operator.todayRejected,
      qualityRate: operator.qualityScore,
      defectCount: operator.todayRejected,
      reworkCount: Math.round(operator.todayRejected * 0.5),
      totalOperations: operator.status === 'active' ? Math.floor(Math.random() * 5) + 3 : 0,
      totalPartsToday: operator.todayProduced,
      totalDowntime: `${operator.breakHours}h`,
      lastActivityTime: operator.lastActivity,
      skillLevel: operator.skillLevel.charAt(0).toUpperCase() + operator.skillLevel.slice(1),
      certifications: operator.certifications,
      contactInfo: {
        phone: '+91 98765 43210',
        email: `${operator.operatorName.toLowerCase().replace(' ', '.')}@company.com`,
      },
    };
    setSelectedOperator(operatorDetail);
    setIsDetailOpen(true);
  };

  const handleExport = () => {
    setIsExportOpen(true);
  };

  const handleExportSubmit = (config: OperatorExportConfig) => {
    exportToCsv('operators', filteredOperators as unknown as Record<string, unknown>[]);
    setIsExportOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"><div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />Loading…</div>)}
      {loadError && !isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>)}
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
            <h1 className="text-2xl font-bold text-gray-900">Operator Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor operator performance and assignments</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Operators</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalOperators}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Users className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Now</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{totalActiveOperators}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Quality Score</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{avgQualityScore.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Award className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Today Produced</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{totalTodayProduced}</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <Package className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Shift Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        {shiftSummaries.map((shift) => (
          <div key={shift.shift} className="bg-white rounded-xl border border-gray-200 p-3">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{shift.shift} Shift</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Total Operators</p>
                <p className="text-2xl font-bold text-blue-900">{shift.totalOperators}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-900">{shift.activeOperators}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600">On Break</p>
                <p className="text-2xl font-bold text-yellow-900">{shift.onBreak}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600">Idle</p>
                <p className="text-2xl font-bold text-orange-900">{shift.idle}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600">Produced Today</p>
                <p className="text-2xl font-bold text-purple-900">{shift.totalProduced}</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <p className="text-sm text-pink-600">Avg Efficiency</p>
                <p className="text-2xl font-bold text-pink-900">{shift.avgEfficiency.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            <option value="Cutting">Cutting</option>
            <option value="Welding">Welding</option>
            <option value="Finishing">Finishing</option>
            <option value="Assembly">Assembly</option>
            <option value="Quality Control">Quality Control</option>
            <option value="Packaging">Packaging</option>
          </select>
          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Shifts</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="night">Night</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on-break">On Break</option>
            <option value="idle">Idle</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Operators Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Assignment</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Today</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOperators.map((operator) => (
                <tr
                  key={operator.id}
                  className="hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md"
                  onClick={() => handleViewOperator(operator)}
                >
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{operator.operatorName}</div>
                      <div className="text-sm text-gray-500">{operator.employeeId}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{operator.department}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-700 capitalize">{operator.shift}</span>
                  </td>
                  <td className="px-3 py-2">
                    {operator.status === 'active' && operator.currentWO ? (
                      <div>
                        <div className="text-sm font-medium text-blue-600">{operator.currentWO}</div>
                        <div className="text-sm text-gray-500">{operator.station}</div>
                        <div className="text-xs text-gray-400">{operator.currentProduct}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">{operator.todayProduced}</div>
                    {operator.todayRejected > 0 && (
                      <div className="text-xs text-red-600">{operator.todayRejected} rejected</div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    {operator.status === 'active' ? (
                      <span className={`text-sm font-bold ${getEfficiencyColor(operator.todayEfficiency)}`}>
                        {operator.todayEfficiency}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Award className={`w-4 h-4 ${operator.qualityScore >= 95 ? 'text-green-600' : 'text-yellow-600'}`} />
                      <span className="text-sm font-medium text-gray-900">{operator.qualityScore.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getSkillColor(operator.skillLevel)}`}>
                      {operator.skillLevel}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(operator.status)}`}>
                      {operator.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <OperatorDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        operator={selectedOperator}
      />

      <OperatorExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExportSubmit}
        operatorName={selectedOperator?.name}
      />
    </div>
  );
}
