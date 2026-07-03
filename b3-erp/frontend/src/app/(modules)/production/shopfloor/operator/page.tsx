'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Filter, Users, Clock, Award, TrendingUp, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { OperatorDetailModal, OperatorDetail } from '@/components/shopfloor/ShopFloorDetailModals';
import { exportToCsv } from '@/lib/export';
import { OperatorExportModal, OperatorExportConfig } from '@/components/shopfloor/ShopFloorExportModals';

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

  // Mock data for operators
  const operators: Operator[] = [
    {
      id: '1',
      employeeId: 'EMP-1245',
      operatorName: 'Rajesh Kumar',
      department: 'Cutting',
      shift: 'morning',
      station: 'ST-CUT-01',
      currentWO: 'WO-2025-1135',
      currentProduct: 'Kitchen Sink - Double Bowl',
      status: 'active',
      skillLevel: 'expert',
      shiftStartTime: '08:00 AM',
      activeHours: 3.5,
      breakHours: 0.5,
      todayProduced: 32,
      todayRejected: 2,
      todayEfficiency: 112,
      weeklyProduced: 185,
      weeklyRejected: 8,
      weeklyEfficiency: 108,
      qualityScore: 96.2,
      certifications: ['CNC Machining', 'Safety Level 2', 'Quality Inspector'],
      lastActivity: '2 mins ago'
    },
    {
      id: '2',
      employeeId: 'EMP-1367',
      operatorName: 'Amit Patel',
      department: 'Welding',
      shift: 'morning',
      station: 'ST-WELD-01',
      currentWO: 'WO-2025-1138',
      currentProduct: 'Chrome Kitchen Faucet',
      status: 'active',
      skillLevel: 'advanced',
      shiftStartTime: '07:30 AM',
      activeHours: 4.0,
      breakHours: 0.5,
      todayProduced: 65,
      todayRejected: 3,
      todayEfficiency: 118,
      weeklyProduced: 342,
      weeklyRejected: 12,
      weeklyEfficiency: 115,
      qualityScore: 97.8,
      certifications: ['TIG Welding', 'MIG Welding', 'Safety Level 3'],
      lastActivity: '1 min ago'
    },
    {
      id: '3',
      employeeId: 'EMP-1489',
      operatorName: 'Priya Singh',
      department: 'Finishing',
      shift: 'morning',
      station: 'ST-POLISH-01',
      currentWO: 'WO-2025-1142',
      currentProduct: 'Cookware Set - Non-Stick',
      status: 'active',
      skillLevel: 'advanced',
      shiftStartTime: '08:45 AM',
      activeHours: 3.2,
      breakHours: 0.3,
      todayProduced: 18,
      todayRejected: 1,
      todayEfficiency: 92,
      weeklyProduced: 128,
      weeklyRejected: 5,
      weeklyEfficiency: 95,
      qualityScore: 98.5,
      certifications: ['Surface Finishing', 'Quality Control', 'Safety Level 2'],
      lastActivity: '30 secs ago'
    },
    {
      id: '4',
      employeeId: 'EMP-1512',
      operatorName: 'Suresh Reddy',
      department: 'Assembly',
      shift: 'morning',
      station: 'ST-ASSY-01',
      currentWO: 'WO-2025-1145',
      currentProduct: 'Built-in Kitchen Chimney',
      status: 'active',
      skillLevel: 'expert',
      shiftStartTime: '09:00 AM',
      activeHours: 3.0,
      breakHours: 0.0,
      todayProduced: 22,
      todayRejected: 0,
      todayEfficiency: 105,
      weeklyProduced: 145,
      weeklyRejected: 2,
      weeklyEfficiency: 102,
      qualityScore: 99.1,
      certifications: ['Assembly Line Lead', 'Electrical Assembly', 'Safety Level 3', 'Team Leader'],
      lastActivity: '3 mins ago'
    },
    {
      id: '5',
      employeeId: 'EMP-1634',
      operatorName: 'Vikram Shah',
      department: 'Cutting',
      shift: 'morning',
      station: null,
      currentWO: null,
      currentProduct: null,
      status: 'on-break',
      skillLevel: 'intermediate',
      shiftStartTime: '08:00 AM',
      activeHours: 3.0,
      breakHours: 1.0,
      todayProduced: 28,
      todayRejected: 3,
      todayEfficiency: 88,
      weeklyProduced: 142,
      weeklyRejected: 15,
      weeklyEfficiency: 89,
      qualityScore: 90.5,
      certifications: ['Laser Cutting', 'Safety Level 1'],
      lastActivity: '15 mins ago'
    },
    {
      id: '6',
      employeeId: 'EMP-1758',
      operatorName: 'Kavita Desai',
      department: 'Quality Control',
      shift: 'morning',
      station: 'ST-QC-01',
      currentWO: 'WO-2025-1140',
      currentProduct: 'Range Hood with LED',
      status: 'active',
      skillLevel: 'expert',
      shiftStartTime: '08:00 AM',
      activeHours: 4.0,
      breakHours: 0.0,
      todayProduced: 20,
      todayRejected: 2,
      todayEfficiency: 110,
      weeklyProduced: 118,
      weeklyRejected: 8,
      weeklyEfficiency: 112,
      qualityScore: 99.5,
      certifications: ['Quality Inspector Level 3', 'ISO 9001 Auditor', 'Safety Level 2', 'Six Sigma Green Belt'],
      lastActivity: '1 min ago'
    },
    {
      id: '7',
      employeeId: 'EMP-1892',
      operatorName: 'Ramesh Gupta',
      department: 'Packaging',
      shift: 'morning',
      station: 'ST-PACK-01',
      currentWO: 'WO-2025-1147',
      currentProduct: 'Kitchen Storage Container Set',
      status: 'active',
      skillLevel: 'intermediate',
      shiftStartTime: '07:45 AM',
      activeHours: 4.2,
      breakHours: 0.3,
      todayProduced: 78,
      todayRejected: 4,
      todayEfficiency: 122,
      weeklyProduced: 412,
      weeklyRejected: 18,
      weeklyEfficiency: 118,
      qualityScore: 95.8,
      certifications: ['Packaging Operations', 'Forklift Operator', 'Safety Level 1'],
      lastActivity: '45 secs ago'
    },
    {
      id: '8',
      employeeId: 'EMP-2015',
      operatorName: 'Deepak Sharma',
      department: 'Welding',
      shift: 'afternoon',
      station: null,
      currentWO: null,
      currentProduct: null,
      status: 'idle',
      skillLevel: 'beginner',
      shiftStartTime: '02:00 PM',
      activeHours: 0.5,
      breakHours: 0.0,
      todayProduced: 0,
      todayRejected: 0,
      todayEfficiency: 0,
      weeklyProduced: 95,
      weeklyRejected: 12,
      weeklyEfficiency: 78,
      qualityScore: 85.2,
      certifications: ['Basic Welding', 'Safety Level 1'],
      lastActivity: '25 mins ago'
    },
    {
      id: '9',
      employeeId: 'EMP-2143',
      operatorName: 'Sneha Kulkarni',
      department: 'Assembly',
      shift: 'afternoon',
      station: 'ST-ASSY-02',
      currentWO: 'WO-2025-1149',
      currentProduct: 'Mixer Grinder - 750W',
      status: 'active',
      skillLevel: 'advanced',
      shiftStartTime: '02:00 PM',
      activeHours: 1.8,
      breakHours: 0.2,
      todayProduced: 12,
      todayRejected: 0,
      todayEfficiency: 115,
      weeklyProduced: 168,
      weeklyRejected: 4,
      weeklyEfficiency: 110,
      qualityScore: 98.2,
      certifications: ['Electronic Assembly', 'Soldering Certification', 'Safety Level 2'],
      lastActivity: '2 mins ago'
    },
    {
      id: '10',
      employeeId: 'EMP-2287',
      operatorName: 'Mohan Das',
      department: 'Assembly',
      shift: 'morning',
      station: 'ST-ASSY-01',
      currentWO: 'WO-2025-1145',
      currentProduct: 'Built-in Kitchen Chimney',
      status: 'active',
      skillLevel: 'intermediate',
      shiftStartTime: '09:00 AM',
      activeHours: 3.0,
      breakHours: 0.0,
      todayProduced: 22,
      todayRejected: 1,
      todayEfficiency: 98,
      weeklyProduced: 132,
      weeklyRejected: 6,
      weeklyEfficiency: 95,
      qualityScore: 94.8,
      certifications: ['Assembly Operations', 'Safety Level 1'],
      lastActivity: '3 mins ago'
    }
  ];

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
