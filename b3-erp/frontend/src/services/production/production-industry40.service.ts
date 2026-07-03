import { apiClient } from '../api/client';

// ==================== TypeScript Interfaces ====================

export type DigitalTwinType = 'machine' | 'production_line' | 'work_center' | 'factory';
export type TwinStatus = 'connected' | 'disconnected' | 'syncing' | 'error';
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

export interface DigitalTwin {
  id: string;
  companyId: string;
  code: string;
  name: string;
  description?: string;
  twinType: DigitalTwinType;
  status: TwinStatus;
  physicalAssetId: string;
  physicalAssetName: string;
  lastSyncAt?: string;
  syncIntervalSeconds: number;
  currentState?: {
    operationalStatus: string;
    temperature: number;
    vibration: number;
    powerConsumption: number;
    cycleTime: number;
    outputRate: number;
    errorCodes: string[];
    alerts: string[];
    lastUpdate: string;
  };
  sensors?: {
    sensorId: string;
    sensorType: string;
    name: string;
    unit: string;
    currentValue: number;
    minThreshold: number;
    maxThreshold: number;
    isActive: boolean;
  }[];
  performanceMetrics?: {
    oee: number;
    availability: number;
    performance: number;
    quality: number;
    mtbf: number;
    mttr: number;
    utilizationRate: number;
  };
  predictiveInsights?: {
    type: string;
    prediction: string;
    probability: number;
    recommendedAction: string;
    estimatedImpact: string;
    generatedAt: string;
  }[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentHealth {
  id: string;
  companyId: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  healthScore: number;
  healthStatus: HealthStatus;
  assessmentDate: string;
  healthIndicators: {
    indicator: string;
    value: number;
    unit: string;
    status: HealthStatus;
    weight: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];
  predictedFailureDate?: string;
  remainingUsefulLife?: number;
  maintenanceRecommendations?: {
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    estimatedCost: number;
    estimatedDowntime: number;
  }[];
  historicalScores: {
    date: string;
    score: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface AIInsight {
  id: string;
  companyId: string;
  insightType: 'prediction' | 'anomaly' | 'recommendation' | 'optimization';
  category: 'quality' | 'maintenance' | 'efficiency' | 'cost' | 'safety';
  title: string;
  description: string;
  confidence: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed';
  relatedEntityType?: string;
  relatedEntityId?: string;
  relatedEntityName?: string;
  impactMetrics?: {
    metric: string;
    currentValue: number;
    predictedValue: number;
    improvement: number;
    unit: string;
  }[];
  suggestedActions?: {
    action: string;
    priority: number;
    estimatedBenefit: string;
    complexity: 'low' | 'medium' | 'high';
  }[];
  validUntil?: string;
  generatedAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

// ==================== Mock Data ====================

const MOCK_DIGITAL_TWINS: DigitalTwin[] = [
  {
    id: 'twin-001',
    companyId: 'company-001',
    code: 'DT-CNC-001',
    name: 'CNC Milling Machine #1 Digital Twin',
    description: 'Real-time digital replica of CNC Milling Machine #1',
    twinType: 'machine',
    status: 'connected',
    physicalAssetId: 'mach-001',
    physicalAssetName: 'CNC Milling Machine #1',
    lastSyncAt: '2025-01-15T16:30:00Z',
    syncIntervalSeconds: 30,
    currentState: {
      operationalStatus: 'running',
      temperature: 42.5,
      vibration: 0.25,
      powerConsumption: 15.2,
      cycleTime: 2.45,
      outputRate: 24.5,
      errorCodes: [],
      alerts: [],
      lastUpdate: '2025-01-15T16:30:00Z',
    },
    sensors: [
      { sensorId: 'sens-001', sensorType: 'temperature', name: 'Spindle Temperature', unit: 'C', currentValue: 42.5, minThreshold: 20, maxThreshold: 60, isActive: true },
      { sensorId: 'sens-002', sensorType: 'vibration', name: 'Spindle Vibration', unit: 'mm/s', currentValue: 0.25, minThreshold: 0, maxThreshold: 1.0, isActive: true },
      { sensorId: 'sens-003', sensorType: 'power', name: 'Power Consumption', unit: 'kW', currentValue: 15.2, minThreshold: 0, maxThreshold: 25, isActive: true },
    ],
    performanceMetrics: {
      oee: 82.5,
      availability: 92.0,
      performance: 89.5,
      quality: 99.2,
      mtbf: 720,
      mttr: 45,
      utilizationRate: 85.0,
    },
    predictiveInsights: [
      {
        type: 'maintenance',
        prediction: 'Spindle bearing replacement recommended within 30 days',
        probability: 85,
        recommendedAction: 'Schedule preventive maintenance for spindle bearing',
        estimatedImpact: 'Prevent 8-hour unplanned downtime',
        generatedAt: '2025-01-15T12:00:00Z',
      },
    ],
    isActive: true,
    createdBy: 'user-001',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2025-01-15T16:30:00Z',
  },
  {
    id: 'twin-002',
    companyId: 'company-001',
    code: 'DT-LINE-A',
    name: 'Assembly Line A Digital Twin',
    description: 'Complete digital twin of Assembly Line A',
    twinType: 'production_line',
    status: 'connected',
    physicalAssetId: 'line-001',
    physicalAssetName: 'Assembly Line A',
    lastSyncAt: '2025-01-15T16:29:00Z',
    syncIntervalSeconds: 60,
    currentState: {
      operationalStatus: 'running',
      temperature: 25.0,
      vibration: 0.1,
      powerConsumption: 45.0,
      cycleTime: 2.5,
      outputRate: 24.0,
      errorCodes: [],
      alerts: ['Station 3 nearing capacity threshold'],
      lastUpdate: '2025-01-15T16:29:00Z',
    },
    performanceMetrics: {
      oee: 78.5,
      availability: 88.0,
      performance: 92.0,
      quality: 97.0,
      mtbf: 480,
      mttr: 30,
      utilizationRate: 82.0,
    },
    isActive: true,
    createdBy: 'user-001',
    createdAt: '2024-06-15T00:00:00Z',
    updatedAt: '2025-01-15T16:29:00Z',
  },
];

const MOCK_EQUIPMENT_HEALTH: EquipmentHealth[] = [
  {
    id: 'health-001',
    companyId: 'company-001',
    equipmentId: 'mach-001',
    equipmentCode: 'CNC-MILL-001',
    equipmentName: 'CNC Milling Machine #1',
    healthScore: 85,
    healthStatus: 'healthy',
    assessmentDate: '2025-01-15',
    healthIndicators: [
      { indicator: 'Spindle Health', value: 82, unit: '%', status: 'healthy', weight: 0.3, trend: 'stable' },
      { indicator: 'Bearing Condition', value: 78, unit: '%', status: 'warning', weight: 0.25, trend: 'declining' },
      { indicator: 'Electrical Systems', value: 95, unit: '%', status: 'healthy', weight: 0.2, trend: 'stable' },
      { indicator: 'Coolant System', value: 88, unit: '%', status: 'healthy', weight: 0.15, trend: 'improving' },
      { indicator: 'Lubrication', value: 90, unit: '%', status: 'healthy', weight: 0.1, trend: 'stable' },
    ],
    predictedFailureDate: '2025-03-15',
    remainingUsefulLife: 60,
    maintenanceRecommendations: [
      { recommendation: 'Replace spindle bearings', priority: 'high', estimatedCost: 2500, estimatedDowntime: 8 },
      { recommendation: 'Flush and replace coolant', priority: 'medium', estimatedCost: 300, estimatedDowntime: 2 },
    ],
    historicalScores: [
      { date: '2025-01-01', score: 88 },
      { date: '2025-01-08', score: 86 },
      { date: '2025-01-15', score: 85 },
    ],
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T16:00:00Z',
  },
];

const MOCK_AI_INSIGHTS: AIInsight[] = [
  {
    id: 'insight-001',
    companyId: 'company-001',
    insightType: 'prediction',
    category: 'maintenance',
    title: 'Predictive Maintenance Alert: CNC Mill #1 Spindle Bearing',
    description: 'Machine learning model predicts spindle bearing degradation based on vibration patterns. Replacement recommended within 30 days to avoid unplanned downtime.',
    confidence: 85,
    severity: 'high',
    status: 'new',
    relatedEntityType: 'machine',
    relatedEntityId: 'mach-001',
    relatedEntityName: 'CNC Milling Machine #1',
    impactMetrics: [
      { metric: 'Downtime Prevention', currentValue: 0, predictedValue: 8, improvement: 8, unit: 'hours' },
      { metric: 'Cost Avoidance', currentValue: 0, predictedValue: 12000, improvement: 12000, unit: 'USD' },
    ],
    suggestedActions: [
      { action: 'Schedule bearing replacement during next maintenance window', priority: 1, estimatedBenefit: 'Prevent 8hr downtime', complexity: 'medium' },
      { action: 'Order replacement bearings from approved supplier', priority: 2, estimatedBenefit: 'Reduce lead time', complexity: 'low' },
    ],
    validUntil: '2025-02-15T00:00:00Z',
    generatedAt: '2025-01-15T12:00:00Z',
    createdAt: '2025-01-15T12:00:00Z',
  },
  {
    id: 'insight-002',
    companyId: 'company-001',
    insightType: 'optimization',
    category: 'efficiency',
    title: 'Production Schedule Optimization Opportunity',
    description: 'Analysis of production data suggests job sequencing can be improved to reduce setup time by 15% and increase throughput.',
    confidence: 78,
    severity: 'medium',
    status: 'new',
    relatedEntityType: 'production_line',
    relatedEntityId: 'line-001',
    relatedEntityName: 'Assembly Line A',
    impactMetrics: [
      { metric: 'Setup Time Reduction', currentValue: 100, predictedValue: 85, improvement: 15, unit: '%' },
      { metric: 'Throughput Increase', currentValue: 100, predictedValue: 108, improvement: 8, unit: '%' },
    ],
    suggestedActions: [
      { action: 'Implement recommended job sequence for next production run', priority: 1, estimatedBenefit: '8% throughput increase', complexity: 'low' },
      { action: 'Group similar jobs to minimize changeovers', priority: 2, estimatedBenefit: '15% setup reduction', complexity: 'medium' },
    ],
    generatedAt: '2025-01-15T14:00:00Z',
    createdAt: '2025-01-15T14:00:00Z',
  },
  {
    id: 'insight-003',
    companyId: 'company-001',
    insightType: 'anomaly',
    category: 'quality',
    title: 'Quality Anomaly Detected: Increased Defect Rate',
    description: 'Statistical process control detected abnormal increase in defect rate for Product A. Root cause analysis suggests tool wear on Station 3.',
    confidence: 92,
    severity: 'high',
    status: 'acknowledged',
    relatedEntityType: 'work_center',
    relatedEntityId: 'wc-003',
    relatedEntityName: 'Assembly Station 3',
    impactMetrics: [
      { metric: 'Defect Rate', currentValue: 2.5, predictedValue: 0.5, improvement: 80, unit: '%' },
      { metric: 'Scrap Cost', currentValue: 1500, predictedValue: 300, improvement: 1200, unit: 'USD/day' },
    ],
    suggestedActions: [
      { action: 'Replace worn tooling on Station 3', priority: 1, estimatedBenefit: 'Reduce defects by 80%', complexity: 'low' },
      { action: 'Increase inspection frequency until tool replacement', priority: 2, estimatedBenefit: 'Catch defects early', complexity: 'low' },
    ],
    generatedAt: '2025-01-15T10:00:00Z',
    acknowledgedBy: 'user-002',
    acknowledgedAt: '2025-01-15T10:30:00Z',
    createdAt: '2025-01-15T10:00:00Z',
  },
];

// ==================== Service Class ====================

class ProductionIndustry40Service {
  private baseUrl = '/production';

  // Digital Twins
  async findAllDigitalTwins(filters?: { twinType?: DigitalTwinType; status?: TwinStatus }): Promise<DigitalTwin[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.twinType) params.append('twinType', filters.twinType);
      if (filters?.status) params.append('status', filters.status);
      const response = await apiClient.get<DigitalTwin[]>(`${this.baseUrl}/digital-twins?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching digital twins, using mock data:', error);
      let result = [...MOCK_DIGITAL_TWINS];
      if (filters?.twinType) result = result.filter((t) => t.twinType === filters.twinType);
      if (filters?.status) result = result.filter((t) => t.status === filters.status);
      return result;
    }
  }

  async findDigitalTwinById(id: string): Promise<DigitalTwin> {
    try {
      const response = await apiClient.get<DigitalTwin>(`${this.baseUrl}/digital-twins/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching digital twin, using mock data:', error);
      const twin = MOCK_DIGITAL_TWINS.find((t) => t.id === id);
      if (!twin) throw new Error(`Digital Twin with ID ${id} not found`);
      return twin;
    }
  }

  async syncDigitalTwin(id: string): Promise<DigitalTwin> {
    try {
      const response = await apiClient.post<DigitalTwin>(`${this.baseUrl}/digital-twins/${id}/sync`, {});
      return response.data;
    } catch (error) {
      console.error('API Error syncing digital twin, using mock data:', error);
      const index = MOCK_DIGITAL_TWINS.findIndex((t) => t.id === id);
      if (index === -1) throw new Error(`Digital Twin with ID ${id} not found`);
      MOCK_DIGITAL_TWINS[index] = {
        ...MOCK_DIGITAL_TWINS[index],
        status: 'connected',
        lastSyncAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return MOCK_DIGITAL_TWINS[index];
    }
  }

  async getDigitalTwinSensorData(id: string): Promise<DigitalTwin['sensors']> {
    try {
      const response = await apiClient.get<DigitalTwin['sensors']>(`${this.baseUrl}/digital-twins/${id}/sensors`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching sensor data, using mock data:', error);
      const twin = MOCK_DIGITAL_TWINS.find((t) => t.id === id);
      if (!twin) throw new Error(`Digital Twin with ID ${id} not found`);
      return twin.sensors || [];
    }
  }

  // Equipment Health
  async findAllEquipmentHealth(filters?: { healthStatus?: HealthStatus }): Promise<EquipmentHealth[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.healthStatus) params.append('healthStatus', filters.healthStatus);
      const response = await apiClient.get<EquipmentHealth[]>(`${this.baseUrl}/equipment-health?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching equipment health, using mock data:', error);
      let result = [...MOCK_EQUIPMENT_HEALTH];
      if (filters?.healthStatus) result = result.filter((h) => h.healthStatus === filters.healthStatus);
      return result;
    }
  }

  async getEquipmentHealthById(equipmentId: string): Promise<EquipmentHealth> {
    try {
      const response = await apiClient.get<EquipmentHealth>(`${this.baseUrl}/equipment-health/${equipmentId}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching equipment health, using mock data:', error);
      const health = MOCK_EQUIPMENT_HEALTH.find((h) => h.equipmentId === equipmentId);
      if (!health) throw new Error(`Equipment Health for ${equipmentId} not found`);
      return health;
    }
  }

  async getHealthTrend(equipmentId: string, days: number = 30): Promise<{ date: string; score: number }[]> {
    try {
      const response = await apiClient.get<{ date: string; score: number }[]>(
        `${this.baseUrl}/equipment-health/${equipmentId}/trend?days=${days}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching health trend, using mock data:', error);
      const health = MOCK_EQUIPMENT_HEALTH.find((h) => h.equipmentId === equipmentId);
      return health?.historicalScores || [];
    }
  }

  // AI Insights
  async findAllAIInsights(filters?: {
    insightType?: string;
    category?: string;
    status?: string;
    severity?: string;
  }): Promise<AIInsight[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.insightType) params.append('insightType', filters.insightType);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.severity) params.append('severity', filters.severity);
      const response = await apiClient.get<AIInsight[]>(`${this.baseUrl}/ai-insights?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching AI insights, using mock data:', error);
      let result = [...MOCK_AI_INSIGHTS];
      if (filters?.insightType) result = result.filter((i) => i.insightType === filters.insightType);
      if (filters?.category) result = result.filter((i) => i.category === filters.category);
      if (filters?.status) result = result.filter((i) => i.status === filters.status);
      if (filters?.severity) result = result.filter((i) => i.severity === filters.severity);
      return result;
    }
  }

  async acknowledgeInsight(id: string, acknowledgedBy: string): Promise<AIInsight> {
    try {
      const response = await apiClient.post<AIInsight>(`${this.baseUrl}/ai-insights/${id}/acknowledge`, { acknowledgedBy });
      return response.data;
    } catch (error) {
      console.error('API Error acknowledging insight, using mock data:', error);
      const index = MOCK_AI_INSIGHTS.findIndex((i) => i.id === id);
      if (index === -1) throw new Error(`AI Insight with ID ${id} not found`);
      MOCK_AI_INSIGHTS[index] = {
        ...MOCK_AI_INSIGHTS[index],
        status: 'acknowledged',
        acknowledgedBy,
        acknowledgedAt: new Date().toISOString(),
      };
      return MOCK_AI_INSIGHTS[index];
    }
  }

  async resolveInsight(id: string, resolvedBy: string): Promise<AIInsight> {
    try {
      const response = await apiClient.post<AIInsight>(`${this.baseUrl}/ai-insights/${id}/resolve`, { resolvedBy });
      return response.data;
    } catch (error) {
      console.error('API Error resolving insight, using mock data:', error);
      const index = MOCK_AI_INSIGHTS.findIndex((i) => i.id === id);
      if (index === -1) throw new Error(`AI Insight with ID ${id} not found`);
      MOCK_AI_INSIGHTS[index] = {
        ...MOCK_AI_INSIGHTS[index],
        status: 'resolved',
        resolvedBy,
        resolvedAt: new Date().toISOString(),
      };
      return MOCK_AI_INSIGHTS[index];
    }
  }

  async getInsightsDashboard(): Promise<{
    totalInsights: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    recentInsights: AIInsight[];
  }> {
    try {
      const response = await apiClient.get<{
        totalInsights: number;
        byStatus: Record<string, number>;
        bySeverity: Record<string, number>;
        byCategory: Record<string, number>;
        recentInsights: AIInsight[];
      }>(`${this.baseUrl}/ai-insights/dashboard`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching insights dashboard, using mock data:', error);
      return {
        totalInsights: MOCK_AI_INSIGHTS.length,
        byStatus: { new: 2, acknowledged: 1, resolved: 0 },
        bySeverity: { critical: 0, high: 2, medium: 1, low: 0, info: 0 },
        byCategory: { maintenance: 1, efficiency: 1, quality: 1 },
        recentInsights: MOCK_AI_INSIGHTS.slice(0, 5),
      };
    }
  }
}

export const productionIndustry40Service = new ProductionIndustry40Service();
