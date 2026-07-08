import { apiClient } from '../api/client';

// ==================== TypeScript Interfaces ====================

export interface SalesPlaybook {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  industry?: string;
  customerSegment?: string;
  stages: {
    stageNumber: number;
    stageName: string;
    objectives: string[];
    keyQuestions: string[];
    recommendedProducts?: string[];
    talkingPoints?: string[];
    objectionHandling?: { objection: string; response: string }[];
  }[];
  attachments?: { name: string; url: string; type: string }[];
  usageCount: number;
  successRate?: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationRule {
  id: string;
  companyId: string;
  ruleName: string;
  recommendationType: 'cross_sell' | 'up_sell' | 'bundle' | 'alternative';
  sourceProductId: string;
  sourceProductName?: string;
  targetProductIds: string[];
  targetProductNames?: string[];
  conditions?: { field: string; operator: string; value: unknown }[];
  priority: number;
  discountOffer?: number;
  reason: string;
  effectivenessScore?: number;
  isActive: boolean;
}

export interface SalesQuestionnaire {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  industry?: string;
  productCategory?: string;
  questions: {
    questionId: string;
    questionText: string;
    questionType: 'single_choice' | 'multiple_choice' | 'scale' | 'text' | 'number';
    options?: { value: string; label: string; score?: number }[];
    isRequired: boolean;
    displayOrder: number;
    logic?: { dependsOn: string; showWhen: string };
  }[];
  scoringLogic?: Record<string, unknown>;
  productMapping?: { scoreRange: { min: number; max: number }; productIds: string[] }[];
  isActive: boolean;
  createdAt: string;
}

export interface QuestionnaireResponse {
  id: string;
  companyId: string;
  questionnaireId: string;
  questionnaireName?: string;
  customerId?: string;
  opportunityId?: string;
  responses: { questionId: string; answer: unknown }[];
  totalScore?: number;
  recommendedProducts?: string[];
  completedAt: string;
  salesRepId: string;
}

export interface ProductRecommendation {
  productId: string;
  productName: string;
  reason: string;
  priority: number;
  discountOffer?: number;
  recommendationType: 'cross_sell' | 'up_sell' | 'bundle' | 'alternative';
}

export interface RecommendationMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  clickThroughRate: number;
  conversionRate: number;
  totalRevenue: number;
}

// ==================== Mock Data ====================

const MOCK_PLAYBOOKS: SalesPlaybook[] = [
  {
    id: 'playbook-001',
    companyId: 'company-001',
    name: 'CNC Machine Sales Playbook',
    description: 'Comprehensive guide for selling CNC machines to manufacturing clients',
    industry: 'Manufacturing',
    customerSegment: 'Mid-Market',
    stages: [
      {
        stageNumber: 1,
        stageName: 'Discovery',
        objectives: ['Understand current production capacity', 'Identify pain points'],
        keyQuestions: [
          'What machines are you currently using?',
          'What are your biggest production challenges?',
          'What is your current output volume?',
        ],
        talkingPoints: ['Industry trends', 'Competitive landscape'],
      },
      {
        stageNumber: 2,
        stageName: 'Solution Presentation',
        objectives: ['Present tailored solution', 'Demonstrate ROI'],
        keyQuestions: ['What features are most important to you?', 'What is your budget range?'],
        recommendedProducts: ['prod-001', 'prod-002'],
        objectionHandling: [
          { objection: 'Too expensive', response: 'Let me show you the ROI calculation...' },
          { objection: 'We need to think about it', response: 'What specific concerns do you have?' },
        ],
      },
    ],
    usageCount: 45,
    successRate: 68,
    isActive: true,
    createdBy: 'admin',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
];

const MOCK_RECOMMENDATIONS: RecommendationRule[] = [
  {
    id: 'rec-001',
    companyId: 'company-001',
    ruleName: 'Tooling Cross-sell for CNC Mill',
    recommendationType: 'cross_sell',
    sourceProductId: 'prod-001',
    sourceProductName: '5-Axis CNC Milling Machine',
    targetProductIds: ['tool-001', 'tool-002'],
    targetProductNames: ['Standard Tooling Package', 'Premium Tooling Package'],
    priority: 1,
    discountOffer: 10,
    reason: 'Essential tooling for optimal machine performance',
    effectivenessScore: 0.75,
    isActive: true,
  },
  {
    id: 'rec-002',
    companyId: 'company-001',
    ruleName: 'High-Speed Spindle Upgrade',
    recommendationType: 'up_sell',
    sourceProductId: 'prod-001',
    sourceProductName: '5-Axis CNC Milling Machine',
    targetProductIds: ['opt-spindle-hs'],
    targetProductNames: ['High-Speed Spindle Upgrade'],
    priority: 2,
    reason: 'Increase productivity by 25% with faster spindle speeds',
    effectivenessScore: 0.65,
    isActive: true,
  },
];

const MOCK_QUESTIONNAIRES: SalesQuestionnaire[] = [
  {
    id: 'quest-001',
    companyId: 'company-001',
    name: 'Manufacturing Needs Assessment',
    description: 'Assess customer manufacturing requirements to recommend the right solution',
    industry: 'Manufacturing',
    productCategory: 'CNC Machines',
    questions: [
      {
        questionId: 'q1',
        questionText: 'What is your primary manufacturing focus?',
        questionType: 'single_choice',
        options: [
          { value: 'milling', label: 'Milling Operations', score: 10 },
          { value: 'turning', label: 'Turning Operations', score: 10 },
          { value: 'both', label: 'Both Milling and Turning', score: 15 },
        ],
        isRequired: true,
        displayOrder: 1,
      },
      {
        questionId: 'q2',
        questionText: 'What is your typical batch size?',
        questionType: 'single_choice',
        options: [
          { value: 'prototype', label: 'Prototypes (1-5 pieces)', score: 5 },
          { value: 'small', label: 'Small batches (5-50 pieces)', score: 10 },
          { value: 'medium', label: 'Medium batches (50-500 pieces)', score: 15 },
          { value: 'large', label: 'Large batches (500+ pieces)', score: 20 },
        ],
        isRequired: true,
        displayOrder: 2,
      },
      {
        questionId: 'q3',
        questionText: 'What precision level do you require?',
        questionType: 'scale',
        options: [
          { value: '1', label: 'Standard (±0.1mm)' },
          { value: '2', label: 'High (±0.05mm)' },
          { value: '3', label: 'Very High (±0.01mm)' },
          { value: '4', label: 'Ultra Precision (±0.005mm)' },
        ],
        isRequired: true,
        displayOrder: 3,
      },
    ],
    productMapping: [
      { scoreRange: { min: 0, max: 25 }, productIds: ['prod-basic'] },
      { scoreRange: { min: 26, max: 40 }, productIds: ['prod-002'] },
      { scoreRange: { min: 41, max: 100 }, productIds: ['prod-001'] },
    ],
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
];

// ==================== Service Class ====================

class CPQGuidedSellingService {
  private baseUrl = '/cpq/guided-selling';

  // Playbooks
  async findAllPlaybooks(filters?: {
    industry?: string;
    customerSegment?: string;
    isActive?: boolean;
  }): Promise<SalesPlaybook[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.industry) params.append('industry', filters.industry);
      if (filters?.customerSegment) params.append('customerSegment', filters.customerSegment);
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
      const response = await apiClient.get<SalesPlaybook[]>(`${this.baseUrl}/playbooks?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching playbooks, using mock data:', error);
      let result = [...MOCK_PLAYBOOKS];
      if (filters?.industry) result = result.filter((p) => p.industry === filters.industry);
      if (filters?.isActive !== undefined) result = result.filter((p) => p.isActive === filters.isActive);
      return result;
    }
  }

  async findPlaybookById(id: string): Promise<SalesPlaybook> {
    try {
      const response = await apiClient.get<SalesPlaybook>(`${this.baseUrl}/playbooks/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching playbook, using mock data:', error);
      const playbook = MOCK_PLAYBOOKS.find((p) => p.id === id);
      if (!playbook) throw new Error(`Playbook with ID ${id} not found`);
      return playbook;
    }
  }

  async createPlaybook(data: Partial<SalesPlaybook>): Promise<SalesPlaybook> {
    try {
      const response = await apiClient.post<SalesPlaybook>(`${this.baseUrl}/playbooks`, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating playbook, using mock data:', error);
      const newPlaybook: SalesPlaybook = {
        id: `playbook-${Date.now()}`,
        companyId: 'company-001',
        name: data.name || 'New Playbook',
        stages: data.stages || [],
        usageCount: 0,
        isActive: true,
        createdBy: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      } as SalesPlaybook;
      MOCK_PLAYBOOKS.push(newPlaybook);
      return newPlaybook;
    }
  }

  async updatePlaybook(id: string, data: Partial<SalesPlaybook>): Promise<SalesPlaybook> {
    try {
      const response = await apiClient.patch<SalesPlaybook>(`${this.baseUrl}/playbooks/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error updating playbook, using mock data:', error);
      const index = MOCK_PLAYBOOKS.findIndex((p) => p.id === id);
      if (index === -1) throw new Error(`Playbook with ID ${id} not found`);
      MOCK_PLAYBOOKS[index] = { ...MOCK_PLAYBOOKS[index], ...data, updatedAt: new Date().toISOString() };
      return MOCK_PLAYBOOKS[index];
    }
  }

  async recordPlaybookUsage(id: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/playbooks/${id}/usage`, {});
    } catch (error) {
      console.error('API Error recording playbook usage:', error);
      const playbook = MOCK_PLAYBOOKS.find((p) => p.id === id);
      if (playbook) playbook.usageCount++;
    }
  }

  // Recommendations
  async findAllRecommendationRules(filters?: {
    recommendationType?: string;
    sourceProductId?: string;
    isActive?: boolean;
  }): Promise<RecommendationRule[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.recommendationType) params.append('recommendationType', filters.recommendationType);
      if (filters?.sourceProductId) params.append('sourceProductId', filters.sourceProductId);
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
      const response = await apiClient.get<RecommendationRule[]>(`${this.baseUrl}/recommendations?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching recommendations, using mock data:', error);
      let result = [...MOCK_RECOMMENDATIONS];
      if (filters?.recommendationType) result = result.filter((r) => r.recommendationType === filters.recommendationType);
      if (filters?.sourceProductId) result = result.filter((r) => r.sourceProductId === filters.sourceProductId);
      if (filters?.isActive !== undefined) result = result.filter((r) => r.isActive === filters.isActive);
      return result;
    }
  }

  async getProductRecommendations(
    productId: string,
    recommendationType?: 'cross_sell' | 'up_sell'
  ): Promise<ProductRecommendation[]> {
    try {
      const params = new URLSearchParams();
      if (recommendationType) params.append('type', recommendationType);
      const response = await apiClient.get<ProductRecommendation[]>(
        `${this.baseUrl}/recommendations/products/${productId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching product recommendations, using mock data:', error);
      return MOCK_RECOMMENDATIONS.filter((r) => r.sourceProductId === productId).map((r) => ({
        productId: r.targetProductIds[0],
        productName: r.targetProductNames?.[0] || 'Product',
        reason: r.reason,
        priority: r.priority,
        discountOffer: r.discountOffer,
        recommendationType: r.recommendationType,
      }));
    }
  }

  async createRecommendationRule(data: Partial<RecommendationRule>): Promise<RecommendationRule> {
    try {
      const response = await apiClient.post<RecommendationRule>(`${this.baseUrl}/recommendations`, data);
      return response.data;
    } catch (error) {
      console.error('API Error creating recommendation, using mock data:', error);
      const newRule: RecommendationRule = {
        id: `rec-${Date.now()}`,
        companyId: 'company-001',
        ruleName: data.ruleName || 'New Recommendation',
        recommendationType: data.recommendationType || 'cross_sell',
        sourceProductId: data.sourceProductId || '',
        targetProductIds: data.targetProductIds || [],
        priority: data.priority || 1,
        reason: data.reason || '',
        isActive: true,
        ...data,
      } as RecommendationRule;
      MOCK_RECOMMENDATIONS.push(newRule);
      return newRule;
    }
  }

  // Questionnaires
  async findAllQuestionnaires(filters?: {
    industry?: string;
    productCategory?: string;
    isActive?: boolean;
  }): Promise<SalesQuestionnaire[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.industry) params.append('industry', filters.industry);
      if (filters?.productCategory) params.append('productCategory', filters.productCategory);
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
      const response = await apiClient.get<SalesQuestionnaire[]>(`${this.baseUrl}/questionnaires?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching questionnaires, using mock data:', error);
      let result = [...MOCK_QUESTIONNAIRES];
      if (filters?.industry) result = result.filter((q) => q.industry === filters.industry);
      if (filters?.isActive !== undefined) result = result.filter((q) => q.isActive === filters.isActive);
      return result;
    }
  }

  async findQuestionnaireById(id: string): Promise<SalesQuestionnaire> {
    try {
      const response = await apiClient.get<SalesQuestionnaire>(`${this.baseUrl}/questionnaires/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching questionnaire, using mock data:', error);
      const questionnaire = MOCK_QUESTIONNAIRES.find((q) => q.id === id);
      if (!questionnaire) throw new Error(`Questionnaire with ID ${id} not found`);
      return questionnaire;
    }
  }

  async createQuestionnaire(data: Partial<SalesQuestionnaire>): Promise<SalesQuestionnaire> {
    const response = await apiClient.post<SalesQuestionnaire>(`${this.baseUrl}/questionnaires`, data);
    return response.data;
  }

  async updateQuestionnaire(id: string, data: Partial<SalesQuestionnaire>): Promise<SalesQuestionnaire> {
    const response = await apiClient.patch<SalesQuestionnaire>(`${this.baseUrl}/questionnaires/${id}`, data);
    return response.data;
  }

  async submitQuestionnaireResponse(data: Partial<QuestionnaireResponse>): Promise<QuestionnaireResponse> {
    try {
      const response = await apiClient.post<QuestionnaireResponse>(`${this.baseUrl}/questionnaires/responses`, data);
      return response.data;
    } catch (error) {
      console.error('API Error submitting questionnaire response, using mock data:', error);
      const newResponse: QuestionnaireResponse = {
        id: `resp-${Date.now()}`,
        companyId: 'company-001',
        questionnaireId: data.questionnaireId || '',
        responses: data.responses || [],
        completedAt: new Date().toISOString(),
        salesRepId: data.salesRepId || 'sales-001',
        recommendedProducts: ['prod-001'],
        ...data,
      } as QuestionnaireResponse;
      return newResponse;
    }
  }

  // Metrics
  async getRecommendationMetrics(filters?: {
    recommendationType?: 'cross_sell' | 'up_sell';
    fromDate?: Date;
    toDate?: Date;
  }): Promise<RecommendationMetrics> {
    try {
      const params = new URLSearchParams();
      if (filters?.recommendationType) params.append('recommendationType', filters.recommendationType);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate.toISOString());
      if (filters?.toDate) params.append('toDate', filters.toDate.toISOString());
      const response = await apiClient.get<RecommendationMetrics>(`${this.baseUrl}/metrics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching metrics, using mock data:', error);
      return {
        totalImpressions: 1250,
        totalClicks: 325,
        totalConversions: 78,
        clickThroughRate: 26,
        conversionRate: 24,
        totalRevenue: 185000,
      };
    }
  }
}

export const cpqGuidedSellingService = new CPQGuidedSellingService();
