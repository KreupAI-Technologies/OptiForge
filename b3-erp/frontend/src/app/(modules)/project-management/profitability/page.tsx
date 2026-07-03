'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { exportToCsv } from '@/lib/export';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  Eye,
  Target,
  Calculator,
  AlertTriangle,
  FileText,
  Lock,
  Users,
  Plus,
} from 'lucide-react';
import {
  ProfitabilityDetailsModal,
  MarginAnalysisModal,
  RevenueRecognitionModal,
  ProfitForecastModal,
  CostAllocationModal,
  PaymentTrackingModal,
  ProfitabilityReportModal,
  ExportProfitabilityModal,
  BenchmarkComparisonModal,
  RiskAssessmentModal,
} from '@/components/project-management/ProfitabilityModals';

interface ProjectProfitability {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  projectType: string;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  contractValue: number;
  actualRevenue: number;
  revenueRecognized: number;
  totalBudget: number;
  actualCost: number;
  directCosts: CostBreakdown;
  indirectCosts: CostBreakdown;
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  budgetVariance: number;
  variancePercent: number;
  billedAmount: number;
  outstandingAmount: number;
  paymentStatus: 'Fully Paid' | 'Partially Paid' | 'Pending' | 'Overdue';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface CostBreakdown {
  material: number;
  labor: number;
  subcontractor: number;
  equipment: number;
  overhead: number;
  other: number;
  total: number;
}

interface ProfitabilityMetrics {
  totalProjects: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  avgGrossMargin: number;
  avgNetMargin: number;
  profitableProjects: number;
  lossProjects: number;
  bestPerformer: string;
  worstPerformer: string;
}

export default function ProfitabilityAnalysisPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-year');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showProfitabilityDetailsModal, setShowProfitabilityDetailsModal] = useState(false);
  const [showMarginAnalysisModal, setShowMarginAnalysisModal] = useState(false);
  const [showRevenueAnalysisModal, setShowRevenueAnalysisModal] = useState(false);
  const [showCostAnalysisModal, setShowCostAnalysisModal] = useState(false);
  const [showRiskAssessmentModal, setShowRiskAssessmentModal] = useState(false);
  const [showPaymentAnalysisModal, setShowPaymentAnalysisModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectProfitability | null>(null);

  // Mock data - 10 projects
  const mockProjects: ProjectProfitability[] = [
    {
      id: '1',
      projectId: 'PRJ001',
      projectName: 'Taj Kitchen Upgrade - Mumbai',
      clientName: 'Taj Hotels',
      projectType: 'Commercial Kitchen',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      status: 'In Progress',
      contractValue: 8500000,
      actualRevenue: 8500000,
      revenueRecognized: 6375000,
      totalBudget: 6500000,
      actualCost: 5100000,
      directCosts: {
        material: 2800000,
        labor: 1500000,
        subcontractor: 600000,
        equipment: 200000,
        overhead: 0,
        other: 0,
        total: 5100000,
      },
      indirectCosts: {
        material: 0,
        labor: 0,
        subcontractor: 0,
        equipment: 0,
        overhead: 750000,
        other: 125000,
        total: 875000,
      },
      grossProfit: 3400000,
      grossMargin: 40.0,
      netProfit: 2525000,
      netMargin: 29.7,
      budgetVariance: -1400000,
      variancePercent: -21.5,
      billedAmount: 6800000,
      outstandingAmount: 1700000,
      paymentStatus: 'Partially Paid',
      riskLevel: 'Low',
    },
    {
      id: '2',
      projectId: 'PRJ002',
      projectName: 'BigBasket Cold Chain - Bangalore',
      clientName: 'BigBasket',
      projectType: 'Cold Room',
      startDate: '2024-01-20',
      endDate: '2024-06-15',
      status: 'In Progress',
      contractValue: 12000000,
      actualRevenue: 12000000,
      revenueRecognized: 10200000,
      totalBudget: 9200000,
      actualCost: 7650000,
      directCosts: {
        material: 4200000,
        labor: 2100000,
        subcontractor: 900000,
        equipment: 450000,
        overhead: 0,
        other: 0,
        total: 7650000,
      },
      indirectCosts: {
        material: 0,
        labor: 0,
        subcontractor: 0,
        equipment: 0,
        overhead: 950000,
        other: 150000,
        total: 1100000,
      },
      grossProfit: 4350000,
      grossMargin: 36.3,
      netProfit: 3250000,
      netMargin: 27.1,
      budgetVariance: -1550000,
      variancePercent: -16.8,
      billedAmount: 9000000,
      outstandingAmount: 3000000,
      paymentStatus: 'Partially Paid',
      riskLevel: 'Low',
    },
    {
      id: '3',
      projectId: 'PRJ003',
      projectName: 'L&T Cold Room Installation - Delhi',
      clientName: 'L&T Construction',
      projectType: 'Cold Room',
      startDate: '2024-02-01',
      endDate: '2024-07-15',
      status: 'In Progress',
      contractValue: 15000000,
      actualRevenue: 15000000,
      revenueRecognized: 9000000,
      totalBudget: 11500000,
      actualCost: 6900000,
      directCosts: {
        material: 3800000,
        labor: 1900000,
        subcontractor: 800000,
        equipment: 400000,
        overhead: 0,
        other: 0,
        total: 6900000,
      },
      indirectCosts: {
        material: 0,
        labor: 0,
        subcontractor: 0,
        equipment: 0,
        overhead: 1200000,
        other: 200000,
        total: 1400000,
      },
      grossProfit: 8100000,
      grossMargin: 54.0,
      netProfit: 6700000,
      netMargin: 44.7,
      budgetVariance: -4600000,
      variancePercent: -40.0,
      billedAmount: 7500000,
      outstandingAmount: 7500000,
      paymentStatus: 'Partially Paid',
      riskLevel: 'Low',
    },
    {
      id: '4',
      projectId: 'PRJ004',
      projectName: 'ITC Hotel Kitchen - Pune',
      clientName: 'ITC Hotels',
      projectType: 'Commercial Kitchen',
      startDate: '2024-02-05',
      endDate: '2024-06-30',
      status: 'In Progress',
      contractValue: 7500000,
      actualRevenue: 7500000,
      revenueRecognized: 5625000,
      totalBudget: 5800000,
      actualCost: 4800000,
      directCosts: {
        material: 2600000,
        labor: 1400000,
        subcontractor: 600000,
        equipment: 200000,
        overhead: 0,
        other: 0,
        total: 4800000,
      },
      indirectCosts: {
        material: 0,
        labor: 0,
        subcontractor: 0,
        equipment: 0,
        overhead: 700000,
        other: 100000,
        total: 800000,
      },
      grossProfit: 2700000,
      grossMargin: 36.0,
      netProfit: 1900000,
      netMargin: 25.3,
      budgetVariance: -1000000,
      variancePercent: -17.2,
      billedAmount: 5250000,
      outstandingAmount: 2250000,
      paymentStatus: 'Partially Paid',
      riskLevel: 'Medium',
    },
    {
      id: '5',
      projectId: 'PRJ005',
      projectName: 'Godrej Central Kitchen - Hyderabad',
      clientName: 'Godrej Industries',
      projectType: 'Commercial Kitchen',
      startDate: '2024-02-10',
      endDate: '2024-07-20',
      status: 'In Progress',
      contractValue: 9500000,
      actualRevenue: 9500000,
      revenueRecognized: 5700000,
      totalBudget: 7300000,
      actualCost: 4380000,
      directCosts: {
        material: 2400000,
        labor: 1200000,
        subcontractor: 600000,
        equipment: 180000,
        overhead: 0,
        other: 0,
        total: 4380000,
      },
      indirectCosts: {
        material: 0,
        labor: 0,
        subcontractor: 0,
        equipment: 0,
        overhead: 850000,
        other: 120000,
        total: 970000,
      },
      grossProfit: 5120000,
      grossMargin: 53.9,
      netProfit: 4150000,
      netMargin: 43.7,
      budgetVariance: -2920000,
      variancePercent: -40.0,
      billedAmount: 4750000,
      outstandingAmount: 4750000,
      paymentStatus: 'Partially Paid',
      riskLevel: 'Low',
    },
    {
      id: '6',
      projectId: 'PRJ006',
      projectName: 'Siemens Switchgear Project - Chennai',
      clientName: 'Siemens India',
      projectType: 'Switchgear',
      startDate: '2024-02-15',
      endDate: '2024-07-30',
      status: 'In Progress',
      contractValue: 18000000,
      actualRevenue: 18000000,
      revenueRecognized: 10800000,
      totalBudget: 14000000,
      actualCost: 8400000,
      directCosts: {
        material: 4800000,
        labor: 2200000,
        subcontractor: 1000000,
        equipment: 400000,
        overhead: 0,
        other: 0,
        total: 8400000,
      },
      indirectCosts: {
        material: 0,
        labor: 0,
        subcontractor: 0,
        equipment: 0,
        overhead: 1500000,
        other: 250000,
        total: 1750000,
      },
      grossProfit: 9600000,
      grossMargin: 53.3,
      netProfit: 7850000,
      netMargin: 43.6,
      budgetVariance: -5600000,
      variancePercent: -40.0,
      billedAmount: 9000000,
      outstandingAmount: 9000000,
      paymentStatus: 'Partially Paid',
      riskLevel: 'Low',
    },
    {
      id: '7',
      projectId: 'PRJ007',
      projectName: 'Reliance Switchgear Upgrade - Ahmedabad',
      clientName: 'Reliance Industries',
      projectType: 'Switchgear',
      startDate: '2024-03-01',
      endDate: '2024-08-30',
      status: 'In Progress',
      contractValue: 22000000,
      actualRevenue: 22000000,
      revenueRecognized: 8800000,
      totalBudget: 17500000,
      actualCost: 7000000,
      directCosts: {
        material: 4000000,
        labor: 1800000,
        subcontractor: 900000,
        equipment: 300000,
        overhead: 0,
        other: 0,
        total: 7000000,
      },
      indirectCosts: {
        material: 0,
        labor: 0,
        subcontractor: 0,
        equipment: 0,
        overhead: 1800000,
        other: 300000,
        total: 2100000,
      },
      grossProfit: 15000000,
      grossMargin: 68.2,
      netProfit: 12900000,
      netMargin: 58.6,
      budgetVariance: -10500000,
      variancePercent: -60.0,
      billedAmount: 6600000,
      outstandingAmount: 15400000,
      paymentStatus: 'Partially Paid',
      riskLevel: 'Low',
    },
    {
      id: '8',
      projectId: 'PRJ008',
      projectName: 'Marriott Kitchen Upgrade - Kochi',
      clientName: 'Marriott Hotels',
      projectType: 'Commercial Kitchen',
      startDate: '2024-03-10',
      endDate: '2024-08-15',
      status: 'In Progress',
      contractValue: 6500000,
      actualRevenue: 6500000,
      revenueRecognized: 2600000,
      totalBudget: 5000000,
      actualCost: 2000000,
      directCosts: {
        material: 1100000,
        labor: 600000,
        subcontractor: 200000,
        equipment: 100000,
        overhead: 0,
        other: 0,
        total: 2000000,
      },
      indirectCosts: {
        material: 0,
        labor: 0,
        subcontractor: 0,
        equipment: 0,
        overhead: 550000,
        other: 75000,
        total: 625000,
      },
      grossProfit: 4500000,
      grossMargin: 69.2,
      netProfit: 3875000,
      netMargin: 59.6,
      budgetVariance: -3000000,
      variancePercent: -60.0,
      billedAmount: 1950000,
      outstandingAmount: 4550000,
      paymentStatus: 'Partially Paid',
      riskLevel: 'Medium',
    },
    {
      id: '9',
      projectId: 'PRJ009',
      projectName: 'Zomato Central Kitchen - Gurgaon',
      clientName: 'Zomato',
      projectType: 'Commercial Kitchen',
      startDate: '2023-09-01',
      endDate: '2024-02-28',
      status: 'Completed',
      contractValue: 11000000,
      actualRevenue: 11000000,
      revenueRecognized: 11000000,
      totalBudget: 8500000,
      actualCost: 7800000,
      directCosts: {
        material: 4300000,
        labor: 2100000,
        subcontractor: 900000,
        equipment: 500000,
        overhead: 0,
        other: 0,
        total: 7800000,
      },
      indirectCosts: {
        material: 0,
        labor: 0,
        subcontractor: 0,
        equipment: 0,
        overhead: 950000,
        other: 150000,
        total: 1100000,
      },
      grossProfit: 3200000,
      grossMargin: 29.1,
      netProfit: 2100000,
      netMargin: 19.1,
      budgetVariance: 700000,
      variancePercent: 8.2,
      billedAmount: 11000000,
      outstandingAmount: 0,
      paymentStatus: 'Fully Paid',
      riskLevel: 'Low',
    },
    {
      id: '10',
      projectId: 'PRJ010',
      projectName: 'Prestige Cold Storage - Jaipur',
      clientName: 'Prestige Group',
      projectType: 'Cold Room',
      startDate: '2023-08-15',
      endDate: '2024-01-31',
      status: 'Completed',
      contractValue: 9800000,
      actualRevenue: 10300000,
      revenueRecognized: 10300000,
      totalBudget: 7500000,
      actualCost: 8200000,
      directCosts: {
        material: 4600000,
        labor: 2200000,
        subcontractor: 1000000,
        equipment: 400000,
        overhead: 0,
        other: 0,
        total: 8200000,
      },
      indirectCosts: {
        material: 0,
        labor: 0,
        subcontractor: 0,
        equipment: 0,
        overhead: 850000,
        other: 125000,
        total: 975000,
      },
      grossProfit: 2100000,
      grossMargin: 20.4,
      netProfit: 1125000,
      netMargin: 10.9,
      budgetVariance: -700000,
      variancePercent: -9.3,
      billedAmount: 10300000,
      outstandingAmount: 0,
      paymentStatus: 'Fully Paid',
      riskLevel: 'Low',
    },
  ];

  // Calculate overall metrics
  const metrics: ProfitabilityMetrics = {
    totalProjects: mockProjects.length,
    totalRevenue: mockProjects.reduce((sum, p) => sum + p.actualRevenue, 0),
    totalCost: mockProjects.reduce((sum, p) => sum + p.actualCost + p.indirectCosts.total, 0),
    totalProfit: mockProjects.reduce((sum, p) => sum + p.netProfit, 0),
    avgGrossMargin: mockProjects.reduce((sum, p) => sum + p.grossMargin, 0) / mockProjects.length,
    avgNetMargin: mockProjects.reduce((sum, p) => sum + p.netMargin, 0) / mockProjects.length,
    profitableProjects: mockProjects.filter(p => p.netProfit > 0).length,
    lossProjects: mockProjects.filter(p => p.netProfit <= 0).length,
    bestPerformer: mockProjects.sort((a, b) => b.netMargin - a.netMargin)[0]?.projectName || 'N/A',
    worstPerformer: mockProjects.sort((a, b) => a.netMargin - b.netMargin)[0]?.projectName || 'N/A',
  };

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesType = projectTypeFilter === 'all' || project.projectType === projectTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getMarginColor = (margin: number) => {
    if (margin >= 40) return 'text-green-600 bg-green-50';
    if (margin >= 25) return 'text-blue-600 bg-blue-50';
    if (margin >= 15) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-50';
      case 'In Progress':
        return 'text-blue-600 bg-blue-50';
      case 'Planning':
        return 'text-gray-600 bg-gray-50';
      case 'On Hold':
        return 'text-yellow-600 bg-yellow-50';
      case 'Cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'Fully Paid':
        return 'text-green-600 bg-green-50';
      case 'Partially Paid':
        return 'text-yellow-600 bg-yellow-50';
      case 'Pending':
        return 'text-orange-600 bg-orange-50';
      case 'Overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-green-600 bg-green-50';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'High':
        return 'text-orange-600 bg-orange-50';
      case 'Critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Handler functions for modals
  const handleViewDetails = (project: ProjectProfitability) => {
    setSelectedProject(project);
    setShowProfitabilityDetailsModal(true);
  };

  const handleMarginAnalysis = (project: ProjectProfitability) => {
    setSelectedProject(project);
    setShowMarginAnalysisModal(true);
  };

  const handleCostAnalysis = (project: ProjectProfitability) => {
    setSelectedProject(project);
    setShowCostAnalysisModal(true);
  };

  const handleRevenueAnalysis = (project: ProjectProfitability) => {
    setSelectedProject(project);
    setShowRevenueAnalysisModal(true);
  };

  const handleRiskAssessment = (project: ProjectProfitability) => {
    setSelectedProject(project);
    setShowRiskAssessmentModal(true);
  };

  const handlePaymentAnalysis = (project: ProjectProfitability) => {
    setSelectedProject(project);
    setShowPaymentAnalysisModal(true);
  };

  const handleForecast = (project: ProjectProfitability) => {
    setSelectedProject(project);
    setShowForecastModal(true);
  };

  const handleRevenueUpdate = (data: any) => {
    console.log('Revenue update:', data);
    setShowRevenueAnalysisModal(false);
  };

  const handleExport = (format: string) => {
    exportToCsv('profitability', filteredProjects as unknown as Record<string, unknown>[]);
    setShowExportModal(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profitability Analysis</h1>
            <p className="text-gray-600 mt-1">Project-wise financial performance and margin analysis</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowMarginAnalysisModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Target className="w-4 h-4" />
              Margin Analysis
            </button>
            <button
              onClick={() => setShowRiskAssessmentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <AlertTriangle className="w-4 h-4" />
              Risk Assessment
            </button>
            <button
              onClick={() => setShowComparisonModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <BarChart3 className="w-4 h-4" />
              Compare Projects
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <FileText className="w-4 h-4" />
              Generate Report
            </button>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="current-month">Current Month</option>
              <option value="current-quarter">Current Quarter</option>
              <option value="current-year">Current Year</option>
              <option value="last-year">Last Year</option>
              <option value="all-time">All Time</option>
            </select>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Overall Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{(metrics.totalRevenue / 10000000).toFixed(2)}Cr
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  From {metrics.totalProjects} projects
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Profit</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ₹{(metrics.totalProfit / 10000000).toFixed(2)}Cr
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Cost: ₹{(metrics.totalCost / 10000000).toFixed(2)}Cr
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Gross Margin</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.avgGrossMargin.toFixed(1)}%</p>
                <p className="text-xs text-gray-600 mt-1">Net: {metrics.avgNetMargin.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Project Performance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {metrics.profitableProjects}/{metrics.totalProjects}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {((metrics.profitableProjects / metrics.totalProjects) * 100).toFixed(0)}% profitable
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Best & Worst Performers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Best Performing Project</p>
                <p className="text-lg font-bold text-green-900">{metrics.bestPerformer}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-yellow-700 font-medium">Needs Attention</p>
                <p className="text-lg font-bold text-yellow-900">{metrics.worstPerformer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by project name, client, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={projectTypeFilter}
            onChange={(e) => setProjectTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="Commercial Kitchen">Commercial Kitchen</option>
            <option value="Cold Room">Cold Room</option>
            <option value="Switchgear">Switchgear</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Details
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract Value
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual Cost
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Profit
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Margin
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Profit
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Margin
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.projectName}</div>
                      <div className="text-sm text-gray-500">{project.clientName}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {project.projectId} • {project.projectType}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{(project.contractValue / 100000).toFixed(2)}L
                    </div>
                    <div className="text-xs text-gray-500">
                      Budget: ₹{(project.totalBudget / 100000).toFixed(2)}L
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      ₹{(project.actualCost / 100000).toFixed(2)}L
                    </div>
                    <div className="text-xs text-gray-500">
                      + ₹{(project.indirectCosts.total / 100000).toFixed(2)}L indirect
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <div className={`text-sm font-medium ${project.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{(project.grossProfit / 100000).toFixed(2)}L
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMarginColor(project.grossMargin)}`}>
                      {project.grossMargin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <div className={`text-sm font-medium ${project.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{(project.netProfit / 100000).toFixed(2)}L
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMarginColor(project.netMargin)}`}>
                      {project.netMargin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentColor(project.paymentStatus)}`}>
                      {project.paymentStatus}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Outstanding: ₹{(project.outstandingAmount / 100000).toFixed(1)}L
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewDetails(project)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleMarginAnalysis(project)}
                        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                        title="Margin Analysis"
                      >
                        <Target className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleCostAnalysis(project)}
                        className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50"
                        title="Cost Analysis"
                      >
                        <Calculator className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRevenueAnalysis(project)}
                        className="text-orange-600 hover:text-orange-800 p-1 rounded hover:bg-orange-50"
                        title="Revenue Analysis"
                      >
                        <DollarSign className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRiskAssessment(project)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        title="Risk Assessment"
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handlePaymentAnalysis(project)}
                        className="text-teal-600 hover:text-teal-800 p-1 rounded hover:bg-teal-50"
                        title="Payment Analysis"
                      >
                        <DollarSign className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProfitabilityDetailsModal
        isOpen={showProfitabilityDetailsModal}
        onClose={() => setShowProfitabilityDetailsModal(false)}
        project={selectedProject}
      />

      <MarginAnalysisModal
        isOpen={showMarginAnalysisModal}
        onClose={() => setShowMarginAnalysisModal(false)}
        project={selectedProject}
        projects={filteredProjects}
      />

      <RevenueRecognitionModal
        isOpen={showRevenueAnalysisModal}
        onClose={() => setShowRevenueAnalysisModal(false)}
        project={selectedProject}
        onUpdate={handleRevenueUpdate}
      />

      <ProfitForecastModal
        isOpen={showForecastModal}
        onClose={() => setShowForecastModal(false)}
        project={selectedProject}
      />

      <CostAllocationModal
        isOpen={showCostAnalysisModal}
        onClose={() => setShowCostAnalysisModal(false)}
        project={selectedProject}
      />

      <PaymentTrackingModal
        isOpen={showPaymentAnalysisModal}
        onClose={() => setShowPaymentAnalysisModal(false)}
        project={selectedProject}
      />

      <ProfitabilityReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        project={selectedProject}
      />

      <ExportProfitabilityModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />

      <BenchmarkComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        projects={filteredProjects}
      />

      <RiskAssessmentModal
        isOpen={showRiskAssessmentModal}
        onClose={() => setShowRiskAssessmentModal(false)}
        project={selectedProject}
        projects={filteredProjects}
      />
    </div>
  );
}
