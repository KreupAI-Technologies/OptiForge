import { apiClient } from './api/client';

// ==================== TypeScript Interfaces ====================

export type WinLossStatus = 'Won' | 'Lost' | 'Pending' | 'No Bid' | 'Withdrawn';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface WinLossRecord {
  id: string;
  companyId: string;
  estimateId: string;
  estimateNumber: string;
  projectName: string;
  customerId?: string;
  customerName?: string;
  status: WinLossStatus;
  currency: string;
  estimatedAmount: number;
  actualAmount?: number;
  competitorPrice?: number;
  competitorName?: string;
  priceVariancePercentage?: number;
  submissionDate: string;
  decisionDate?: string;
  winLossReason?: string;
  estimatorId?: string;
  estimatorName?: string;
  createdAt: string;
}

export interface WinLossAnalysis {
  totalEstimates: number;
  won: number;
  lost: number;
  pending: number;
  winRate: number;
  totalEstimatedValue: number;
  totalWonValue: number;
  averageWinAmount: number;
  averageLossAmount: number;
  byReason: { reason: string; count: number }[];
  byCustomer: { customerName: string; won: number; lost: number; winRate: number }[];
  byEstimator: { estimatorName: string; won: number; lost: number; winRate: number }[];
  trend: { month: string; won: number; lost: number; winRate: number }[];
}

export interface AccuracyAnalysis {
  averageAccuracy: number;
  averageMaterialVariance: number;
  averageLaborVariance: number;
  averageOverheadVariance: number;
  averageTotalVariance: number;
  byCategory: { category: string; averageVariance: number; count: number }[];
  byEstimator: { estimatorName: string; averageAccuracy: number; count: number }[];
  trend: { month: string; averageAccuracy: number; count: number }[];
}

export interface RiskAnalysis {
  id: string;
  companyId: string;
  estimateId: string;
  estimateNumber: string;
  projectName: string;
  overallRiskLevel: RiskLevel;
  overallRiskScore: number;
  risks: {
    riskId: string;
    category: 'Technical' | 'Financial' | 'Schedule' | 'Resource' | 'External' | 'Other';
    description: string;
    probability: 'Low' | 'Medium' | 'High';
    impact: 'Low' | 'Medium' | 'High';
    riskScore: number;
    mitigationStrategy: string;
    mitigationCost: number;
    residualRisk: 'Low' | 'Medium' | 'High';
    owner: string;
    status: 'Identified' | 'Mitigated' | 'Accepted' | 'Closed';
  }[];
  totalMitigationCost: number;
  recommendedContingency: number;
  recommendedContingencyPercentage: number;
  whatIfScenarios?: {
    scenarioId: string;
    scenarioName: string;
    description: string;
    assumptions: { variable: string; value: number }[];
    resultingTotal: number;
    varianceFromBase: number;
    variancePercentage: number;
  }[];
  createdAt: string;
}

export interface EstimatorPerformance {
  id: string;
  companyId: string;
  estimatorId: string;
  estimatorName: string;
  year: number;
  month: number;
  totalEstimates: number;
  wonEstimates: number;
  lostEstimates: number;
  winRate: number;
  totalEstimatedValue: number;
  totalWonValue: number;
  averageAccuracy: number;
  averageMargin: number;
  averageTurnaroundDays: number;
}

export interface CategoryPerformance {
  category: string;
  totalEstimates: number;
  winRate: number;
  avgValue: number;
  accuracy: number;
}

export interface HistoricalBenchmark {
  id: string;
  companyId: string;
  category: string;
  subCategory?: string;
  metricName: string;
  unit: string;
  currency: string;
  averageValue: number;
  minValue: number;
  maxValue: number;
  medianValue: number;
  standardDeviation?: number;
  sampleSize: number;
  periodStart: string;
  periodEnd: string;
}

// ==================== Mock Data ====================

const MOCK_WIN_LOSS_RECORDS: WinLossRecord[] = [
  {
    id: 'wl-001',
    companyId: 'company-001',
    estimateId: 'est-001',
    estimateNumber: 'EST-2025-00001',
    projectName: 'Office Building Construction',
    customerId: 'cust-001',
    customerName: 'ABC Corporation',
    status: 'Won',
    currency: 'USD',
    estimatedAmount: 3022672.57,
    actualAmount: 3022672.57,
    submissionDate: '2025-01-26',
    decisionDate: '2025-01-30',
    estimatorId: 'user-001',
    estimatorName: 'John Estimator',
    createdAt: '2025-01-30T15:00:00Z',
  },
  {
    id: 'wl-002',
    companyId: 'company-001',
    estimateId: 'est-004',
    estimateNumber: 'EST-2024-00015',
    projectName: 'Hospital Renovation',
    customerId: 'cust-004',
    customerName: 'City Healthcare',
    status: 'Lost',
    currency: 'USD',
    estimatedAmount: 5500000,
    competitorPrice: 4800000,
    competitorName: 'BuildRight Inc',
    priceVariancePercentage: 14.58,
    submissionDate: '2024-11-15',
    decisionDate: '2024-12-01',
    winLossReason: 'Price - Competitor was 14.6% lower',
    estimatorId: 'user-001',
    estimatorName: 'John Estimator',
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 'wl-003',
    companyId: 'company-001',
    estimateId: 'est-002',
    estimateNumber: 'EST-2025-00002',
    projectName: 'Warehouse Renovation',
    customerId: 'cust-002',
    customerName: 'XYZ Logistics',
    status: 'Pending',
    currency: 'USD',
    estimatedAmount: 1035417.6,
    submissionDate: '2025-02-04',
    estimatorId: 'user-002',
    estimatorName: 'Sarah Estimator',
    createdAt: '2025-02-04T09:00:00Z',
  },
];

const MOCK_RISK_ANALYSES: RiskAnalysis[] = [
  {
    id: 'risk-001',
    companyId: 'company-001',
    estimateId: 'est-001',
    estimateNumber: 'EST-2025-00001',
    projectName: 'Office Building Construction',
    overallRiskLevel: 'Medium',
    overallRiskScore: 4.2,
    risks: [
      {
        riskId: 'r-001',
        category: 'Financial',
        description: 'Material price volatility',
        probability: 'Medium',
        impact: 'High',
        riskScore: 6,
        mitigationStrategy: 'Lock in prices with suppliers for 6 months',
        mitigationCost: 25000,
        residualRisk: 'Low',
        owner: 'Procurement Manager',
        status: 'Mitigated',
      },
      {
        riskId: 'r-002',
        category: 'Schedule',
        description: 'Weather delays during foundation work',
        probability: 'Low',
        impact: 'Medium',
        riskScore: 2,
        mitigationStrategy: 'Build weather contingency into schedule',
        mitigationCost: 0,
        residualRisk: 'Low',
        owner: 'Project Manager',
        status: 'Accepted',
      },
      {
        riskId: 'r-003',
        category: 'Resource',
        description: 'Skilled labor shortage',
        probability: 'Medium',
        impact: 'Medium',
        riskScore: 4,
        mitigationStrategy: 'Pre-commit with labor contractors',
        mitigationCost: 15000,
        residualRisk: 'Low',
        owner: 'HR Manager',
        status: 'Mitigated',
      },
    ],
    totalMitigationCost: 40000,
    recommendedContingency: 124162.5,
    recommendedContingencyPercentage: 5,
    whatIfScenarios: [
      {
        scenarioId: 'ws-001',
        scenarioName: 'Material Cost +10%',
        description: 'If material costs increase by 10%',
        assumptions: [{ variable: 'materialCost', value: 1.1 }],
        resultingTotal: 2731487.5,
        varianceFromBase: 248237.5,
        variancePercentage: 10,
      },
      {
        scenarioId: 'ws-002',
        scenarioName: 'Labor Cost +15%',
        description: 'If labor costs increase by 15%',
        assumptions: [{ variable: 'laborCost', value: 1.15 }],
        resultingTotal: 2580750,
        varianceFromBase: 97500,
        variancePercentage: 3.9,
      },
    ],
    createdAt: '2025-01-18T14:00:00Z',
  },
];

const MOCK_ESTIMATOR_PERFORMANCE: EstimatorPerformance[] = [
  {
    id: 'perf-001',
    companyId: 'company-001',
    estimatorId: 'user-001',
    estimatorName: 'John Estimator',
    year: 2025,
    month: 1,
    totalEstimates: 8,
    wonEstimates: 5,
    lostEstimates: 2,
    winRate: 71.43,
    totalEstimatedValue: 12500000,
    totalWonValue: 8200000,
    averageAccuracy: 94.5,
    averageMargin: 15.2,
    averageTurnaroundDays: 5.5,
  },
  {
    id: 'perf-002',
    companyId: 'company-001',
    estimatorId: 'user-002',
    estimatorName: 'Sarah Estimator',
    year: 2025,
    month: 1,
    totalEstimates: 6,
    wonEstimates: 4,
    lostEstimates: 1,
    winRate: 80.0,
    totalEstimatedValue: 8500000,
    totalWonValue: 6100000,
    averageAccuracy: 96.2,
    averageMargin: 14.8,
    averageTurnaroundDays: 4.2,
  },
];

const MOCK_BENCHMARKS: HistoricalBenchmark[] = [
  {
    id: 'bench-001',
    companyId: 'company-001',
    category: 'Material',
    subCategory: 'Concrete',
    metricName: 'Cost per Cubic Meter',
    unit: 'USD/CU M',
    currency: 'USD',
    averageValue: 325,
    minValue: 280,
    maxValue: 395,
    medianValue: 320,
    standardDeviation: 28.5,
    sampleSize: 45,
    periodStart: '2024-01-01',
    periodEnd: '2024-12-31',
  },
  {
    id: 'bench-002',
    companyId: 'company-001',
    category: 'Labor',
    subCategory: 'Electrical',
    metricName: 'Installation Cost per Square Foot',
    unit: 'USD/SQ FT',
    currency: 'USD',
    averageValue: 12.5,
    minValue: 9.0,
    maxValue: 18.0,
    medianValue: 12.0,
    standardDeviation: 2.8,
    sampleSize: 32,
    periodStart: '2024-01-01',
    periodEnd: '2024-12-31',
  },
];

// ==================== Service Class ====================

class EstimationAnalyticsService {
  private baseUrl = '/estimation/analytics';

  // Win/Loss Analysis
  async createWinLossRecord(
    companyId: string,
    data: Partial<WinLossRecord>
  ): Promise<WinLossRecord> {
    try {
      const response = await apiClient.post<WinLossRecord>(`${this.baseUrl}/win-loss`, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating win/loss record, using mock data:', error);
      const newRecord: WinLossRecord = {
        id: `wl-${Date.now()}`,
        companyId,
        estimateId: data.estimateId || '',
        estimateNumber: data.estimateNumber || '',
        projectName: data.projectName || 'Project',
        status: data.status || 'Pending',
        currency: data.currency || 'USD',
        estimatedAmount: data.estimatedAmount || 0,
        submissionDate: data.submissionDate || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        ...data,
      };
      MOCK_WIN_LOSS_RECORDS.push(newRecord);
      return newRecord;
    }
  }

  async updateWinLossRecord(
    companyId: string,
    id: string,
    data: Partial<WinLossRecord>
  ): Promise<WinLossRecord> {
    try {
      const response = await apiClient.patch<WinLossRecord>(
        `${this.baseUrl}/win-loss/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('API Error updating win/loss record, using mock data:', error);
      const index = MOCK_WIN_LOSS_RECORDS.findIndex((r) => r.id === id);
      if (index === -1) throw new Error(`Win/Loss Record with ID ${id} not found`);
      MOCK_WIN_LOSS_RECORDS[index] = { ...MOCK_WIN_LOSS_RECORDS[index], ...data };
      return MOCK_WIN_LOSS_RECORDS[index];
    }
  }

  async getWinLossAnalysis(
    companyId: string,
    fromDate: string,
    toDate: string
  ): Promise<WinLossAnalysis> {
    try {
      const response = await apiClient.get<WinLossAnalysis>(
        `${this.baseUrl}/win-loss/analysis?fromDate=${fromDate}&toDate=${toDate}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching win/loss analysis, using mock data:', error);
      const records = MOCK_WIN_LOSS_RECORDS.filter((r) => r.companyId === companyId);
      const won = records.filter((r) => r.status === 'Won');
      const lost = records.filter((r) => r.status === 'Lost');
      const pending = records.filter((r) => r.status === 'Pending');

      return {
        totalEstimates: records.length,
        won: won.length,
        lost: lost.length,
        pending: pending.length,
        winRate: won.length + lost.length > 0
          ? (won.length / (won.length + lost.length)) * 100
          : 0,
        totalEstimatedValue: records.reduce((sum, r) => sum + r.estimatedAmount, 0),
        totalWonValue: won.reduce((sum, r) => sum + (r.actualAmount || r.estimatedAmount), 0),
        averageWinAmount: won.length > 0
          ? won.reduce((sum, r) => sum + r.estimatedAmount, 0) / won.length
          : 0,
        averageLossAmount: lost.length > 0
          ? lost.reduce((sum, r) => sum + r.estimatedAmount, 0) / lost.length
          : 0,
        byReason: [],
        byCustomer: [],
        byEstimator: [],
        trend: [],
      };
    }
  }

  // Accuracy Analysis
  async getAccuracyAnalysis(
    companyId: string,
    fromDate: string,
    toDate: string
  ): Promise<AccuracyAnalysis> {
    try {
      const response = await apiClient.get<AccuracyAnalysis>(
        `${this.baseUrl}/accuracy/analysis?fromDate=${fromDate}&toDate=${toDate}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching accuracy analysis, using mock data:', error);
      return {
        averageAccuracy: 95.2,
        averageMaterialVariance: 3.5,
        averageLaborVariance: 4.2,
        averageOverheadVariance: 2.1,
        averageTotalVariance: 3.8,
        byCategory: [
          { category: 'Material', averageVariance: 3.5, count: 25 },
          { category: 'Labor', averageVariance: 4.2, count: 25 },
          { category: 'Overhead', averageVariance: 2.1, count: 20 },
        ],
        byEstimator: [
          { estimatorName: 'John Estimator', averageAccuracy: 94.5, count: 12 },
          { estimatorName: 'Sarah Estimator', averageAccuracy: 96.2, count: 10 },
        ],
        trend: [
          { month: '2024-10', averageAccuracy: 93.5, count: 8 },
          { month: '2024-11', averageAccuracy: 94.2, count: 10 },
          { month: '2024-12', averageAccuracy: 95.8, count: 12 },
          { month: '2025-01', averageAccuracy: 96.5, count: 8 },
        ],
      };
    }
  }

  // Risk Analysis
  async createRiskAnalysis(
    companyId: string,
    data: Partial<RiskAnalysis>
  ): Promise<RiskAnalysis> {
    try {
      const response = await apiClient.post<RiskAnalysis>(`${this.baseUrl}/risk`, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating risk analysis, using mock data:', error);
      const newAnalysis: RiskAnalysis = {
        id: `risk-${Date.now()}`,
        companyId,
        estimateId: data.estimateId || '',
        estimateNumber: data.estimateNumber || '',
        projectName: data.projectName || 'Project',
        overallRiskLevel: 'Medium',
        overallRiskScore: 0,
        risks: data.risks || [],
        totalMitigationCost: 0,
        recommendedContingency: 0,
        recommendedContingencyPercentage: 5,
        createdAt: new Date().toISOString(),
        ...data,
      };
      MOCK_RISK_ANALYSES.push(newAnalysis);
      return newAnalysis;
    }
  }

  async findRiskAnalysisByEstimate(
    companyId: string,
    estimateId: string
  ): Promise<RiskAnalysis | null> {
    try {
      const response = await apiClient.get<RiskAnalysis>(
        `${this.baseUrl}/risk/by-estimate/${estimateId}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching risk analysis, using mock data:', error);
      return MOCK_RISK_ANALYSES.find((r) => r.estimateId === estimateId) || null;
    }
  }

  async updateRiskAnalysis(
    companyId: string,
    id: string,
    data: Partial<RiskAnalysis>
  ): Promise<RiskAnalysis> {
    try {
      const response = await apiClient.patch<RiskAnalysis>(`${this.baseUrl}/risk/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error updating risk analysis, using mock data:', error);
      const index = MOCK_RISK_ANALYSES.findIndex((r) => r.id === id);
      if (index === -1) throw new Error(`Risk Analysis with ID ${id} not found`);
      MOCK_RISK_ANALYSES[index] = { ...MOCK_RISK_ANALYSES[index], ...data };
      return MOCK_RISK_ANALYSES[index];
    }
  }

  // Estimator Performance
  async getEstimatorPerformance(
    companyId: string,
    estimatorId: string,
    year: number
  ): Promise<EstimatorPerformance[]> {
    try {
      const response = await apiClient.get<EstimatorPerformance[]>(
        `${this.baseUrl}/performance/estimator/${estimatorId}?year=${year}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching estimator performance, using mock data:', error);
      return MOCK_ESTIMATOR_PERFORMANCE.filter(
        (p) => p.companyId === companyId && p.estimatorId === estimatorId && p.year === year
      );
    }
  }

  async getAllEstimatorsPerformance(
    companyId: string,
    year: number,
    month: number
  ): Promise<EstimatorPerformance[]> {
    try {
      const response = await apiClient.get<EstimatorPerformance[]>(
        `${this.baseUrl}/performance/all?year=${year}&month=${month}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching all estimators performance, using mock data:', error);
      return MOCK_ESTIMATOR_PERFORMANCE.filter(
        (p) => p.companyId === companyId && p.year === year && p.month === month
      );
    }
  }

  // Category Performance — real aggregation of estimates by category.
  // No mock fallback: on error, surface an empty list so the page shows its
  // empty-state rather than fabricated rows.
  async getCategoryPerformance(): Promise<CategoryPerformance[]> {
    try {
      const response = await apiClient.get<CategoryPerformance[]>(
        `${this.baseUrl}/category-performance`
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('API Error fetching category performance:', error);
      return [];
    }
  }

  // Historical Benchmarks
  async findBenchmarks(
    companyId: string,
    filters?: { category?: string; subCategory?: string }
  ): Promise<HistoricalBenchmark[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.subCategory) params.append('subCategory', filters.subCategory);

      const response = await apiClient.get<HistoricalBenchmark[]>(
        `${this.baseUrl}/benchmarks/all?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching benchmarks, using mock data:', error);
      let result = MOCK_BENCHMARKS.filter((b) => b.companyId === companyId);
      if (filters?.category) {
        result = result.filter((b) => b.category === filters.category);
      }
      if (filters?.subCategory) {
        result = result.filter((b) => b.subCategory === filters.subCategory);
      }
      return result;
    }
  }

  async createBenchmark(
    companyId: string,
    data: Partial<HistoricalBenchmark>
  ): Promise<HistoricalBenchmark> {
    try {
      const response = await apiClient.post<HistoricalBenchmark>(
        `${this.baseUrl}/benchmarks`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('API Error creating benchmark, using mock data:', error);
      const newBenchmark: HistoricalBenchmark = {
        id: `bench-${Date.now()}`,
        companyId,
        category: data.category || 'General',
        metricName: data.metricName || 'Metric',
        unit: data.unit || 'USD',
        currency: data.currency || 'USD',
        averageValue: data.averageValue || 0,
        minValue: data.minValue || 0,
        maxValue: data.maxValue || 0,
        medianValue: data.medianValue || 0,
        sampleSize: data.sampleSize || 0,
        periodStart: data.periodStart || new Date().toISOString().split('T')[0],
        periodEnd: data.periodEnd || new Date().toISOString().split('T')[0],
        ...data,
      };
      MOCK_BENCHMARKS.push(newBenchmark);
      return newBenchmark;
    }
  }
}

export const estimationAnalyticsService = new EstimationAnalyticsService();
