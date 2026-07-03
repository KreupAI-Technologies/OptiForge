import { apiClient } from './api/client';

// ==================== TypeScript Interfaces ====================

export type SourcingRuleType =
  | 'preferred_vendor'
  | 'single_source'
  | 'multiple_source'
  | 'competitive_bidding'
  | 'framework_agreement'
  | 'spot_purchase'
  | 'emergency';

export type SourcingTrigger =
  | 'amount_threshold'
  | 'item_category'
  | 'vendor_category'
  | 'department'
  | 'criticality'
  | 'lead_time';

export type SourcingRuleStatus = 'active' | 'inactive' | 'pending_approval' | 'expired';

export interface EvaluationCriterion {
  criterion: string;
  weightage: number;
}

export interface SourcingRule {
  id: string;
  companyId: string;
  ruleCode: string;
  ruleName: string;
  description?: string;
  ruleType: SourcingRuleType;
  status: SourcingRuleStatus;
  priority: number;
  triggerType: SourcingTrigger;
  triggerConditions: {
    minAmount?: number;
    maxAmount?: number;
    itemCategories?: string[];
    itemCodes?: string[];
    vendorCategories?: string[];
    vendorIds?: string[];
    departments?: string[];
    criticalityLevels?: string[];
    minLeadTime?: number;
    maxLeadTime?: number;
  };
  actions: {
    minVendors?: number;
    maxVendors?: number;
    preferredVendorIds?: string[];
    excludedVendorIds?: string[];
    requireApproval?: boolean;
    approvalLevels?: number;
    allowNegotiation?: boolean;
    requireTechnicalEvaluation?: boolean;
    requireCommercialEvaluation?: boolean;
    minQuotationsRequired?: number;
    evaluationCriteria?: EvaluationCriterion[];
    autoAwardThreshold?: number;
    requireJustificationAbove?: number;
  };
  vendorCriteria?: {
    minRating?: number;
    maxActiveContracts?: number;
    requiredCertifications?: string[];
    requiredCapabilities?: string[];
    geographicRestrictions?: string[];
    minExperience?: number;
    financialStability?: string;
  };
  timeConstraints?: {
    minRfqDuration?: number;
    maxRfqDuration?: number;
    defaultRfqDuration?: number;
    reminderBeforeDays?: number;
    autoCloseAfterDays?: number;
  };
  complianceRequirements?: {
    requireDocumentation?: boolean;
    requiredDocuments?: string[];
    requireAuditTrail?: boolean;
    requireApprovalJustification?: boolean;
    maxSingleSourceAmount?: number;
    competitiveBiddingThreshold?: number;
  };
  effectiveFrom: string;
  effectiveTo?: string;
  createdBy?: string;
  updatedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSourcingRuleDto {
  companyId: string;
  ruleCode: string;
  ruleName: string;
  description?: string;
  ruleType: SourcingRuleType;
  priority?: number;
  triggerType: SourcingTrigger;
  triggerConditions: SourcingRule['triggerConditions'];
  actions: SourcingRule['actions'];
  vendorCriteria?: SourcingRule['vendorCriteria'];
  timeConstraints?: SourcingRule['timeConstraints'];
  complianceRequirements?: SourcingRule['complianceRequirements'];
  effectiveFrom: string;
  effectiveTo?: string;
  createdBy: string;
}

export interface SourcingContext {
  companyId: string;
  amount: number;
  itemCategories?: string[];
  itemCodes?: string[];
  vendorCategory?: string;
  department?: string;
  criticality?: string;
  requiredLeadTime?: number;
}

export interface SourcingRecommendation {
  rule: SourcingRule;
  ruleType: SourcingRuleType;
  minVendors: number;
  maxVendors: number;
  preferredVendors: string[];
  excludedVendors: string[];
  requireApproval: boolean;
  approvalLevels: number;
  minQuotationsRequired: number;
  evaluationCriteria: EvaluationCriterion[];
  timeConstraints: {
    minDuration: number;
    maxDuration: number;
    defaultDuration: number;
  };
  complianceNotes: string[];
}

export interface ValidationResult {
  isValid: boolean;
  violations: string[];
  warnings: string[];
}

// ==================== Mock Data ====================

const MOCK_SOURCING_RULES: SourcingRule[] = [
  {
    id: 'rule-001',
    companyId: 'company-001',
    ruleCode: 'SR-COMP-10K',
    ruleName: 'Competitive Bidding Above $10,000',
    description: 'Requires competitive bidding for purchases above $10,000',
    ruleType: 'competitive_bidding',
    status: 'active',
    priority: 100,
    triggerType: 'amount_threshold',
    triggerConditions: {
      minAmount: 10000,
    },
    actions: {
      minVendors: 3,
      maxVendors: 10,
      requireApproval: true,
      approvalLevels: 2,
      minQuotationsRequired: 3,
      requireTechnicalEvaluation: true,
      requireCommercialEvaluation: true,
      evaluationCriteria: [
        { criterion: 'Price', weightage: 40 },
        { criterion: 'Quality', weightage: 30 },
        { criterion: 'Delivery', weightage: 20 },
        { criterion: 'Service', weightage: 10 },
      ],
    },
    complianceRequirements: {
      requireDocumentation: true,
      requireApprovalJustification: true,
      competitiveBiddingThreshold: 10000,
    },
    timeConstraints: {
      minRfqDuration: 7,
      maxRfqDuration: 30,
      defaultRfqDuration: 14,
      reminderBeforeDays: 3,
    },
    effectiveFrom: '2025-01-01',
    createdBy: 'user-001',
    approvedBy: 'user-003',
    approvedAt: '2024-12-20T10:00:00Z',
    createdAt: '2024-12-15T09:00:00Z',
    updatedAt: '2024-12-20T10:00:00Z',
  },
  {
    id: 'rule-002',
    companyId: 'company-001',
    ruleCode: 'SR-PREF-IT',
    ruleName: 'Preferred Vendor for IT Equipment',
    description: 'Use preferred vendors for IT equipment purchases',
    ruleType: 'preferred_vendor',
    status: 'active',
    priority: 90,
    triggerType: 'item_category',
    triggerConditions: {
      itemCategories: ['IT Equipment', 'Computer Hardware', 'Software'],
    },
    actions: {
      minVendors: 1,
      maxVendors: 3,
      preferredVendorIds: ['vendor-tech-001', 'vendor-tech-002'],
      requireApproval: false,
      minQuotationsRequired: 1,
      evaluationCriteria: [
        { criterion: 'Technical Capability', weightage: 40 },
        { criterion: 'Price', weightage: 30 },
        { criterion: 'Support', weightage: 30 },
      ],
    },
    vendorCriteria: {
      minRating: 4.0,
      requiredCertifications: ['ISO 27001', 'Microsoft Partner'],
    },
    timeConstraints: {
      defaultRfqDuration: 7,
    },
    effectiveFrom: '2025-01-01',
    createdBy: 'user-002',
    approvedBy: 'user-003',
    approvedAt: '2024-12-22T14:00:00Z',
    createdAt: '2024-12-18T11:00:00Z',
    updatedAt: '2024-12-22T14:00:00Z',
  },
  {
    id: 'rule-003',
    companyId: 'company-001',
    ruleCode: 'SR-EMRG',
    ruleName: 'Emergency Procurement',
    description: 'Streamlined process for emergency purchases',
    ruleType: 'emergency',
    status: 'active',
    priority: 150,
    triggerType: 'criticality',
    triggerConditions: {
      criticalityLevels: ['critical', 'urgent'],
    },
    actions: {
      minVendors: 1,
      maxVendors: 5,
      requireApproval: true,
      approvalLevels: 1,
      minQuotationsRequired: 1,
      allowNegotiation: true,
    },
    complianceRequirements: {
      requireDocumentation: true,
      requireApprovalJustification: true,
      maxSingleSourceAmount: 50000,
    },
    timeConstraints: {
      minRfqDuration: 1,
      maxRfqDuration: 5,
      defaultRfqDuration: 2,
    },
    effectiveFrom: '2025-01-01',
    createdBy: 'user-001',
    approvedBy: 'user-003',
    approvedAt: '2024-12-25T09:00:00Z',
    createdAt: '2024-12-20T15:00:00Z',
    updatedAt: '2024-12-25T09:00:00Z',
  },
  {
    id: 'rule-004',
    companyId: 'company-001',
    ruleCode: 'SR-FRAME-MRO',
    ruleName: 'Framework Agreement - MRO Supplies',
    description: 'Use framework agreement for MRO supplies',
    ruleType: 'framework_agreement',
    status: 'active',
    priority: 80,
    triggerType: 'item_category',
    triggerConditions: {
      itemCategories: ['MRO', 'Maintenance Supplies', 'Safety Equipment'],
      maxAmount: 25000,
    },
    actions: {
      minVendors: 1,
      maxVendors: 1,
      preferredVendorIds: ['vendor-mro-001'],
      requireApproval: false,
      minQuotationsRequired: 1,
      autoAwardThreshold: 5000,
    },
    timeConstraints: {
      defaultRfqDuration: 3,
      autoCloseAfterDays: 5,
    },
    effectiveFrom: '2025-01-01',
    effectiveTo: '2025-12-31',
    createdBy: 'user-002',
    approvedBy: 'user-003',
    approvedAt: '2024-12-28T10:00:00Z',
    createdAt: '2024-12-23T09:00:00Z',
    updatedAt: '2024-12-28T10:00:00Z',
  },
];

// ==================== Service Class ====================

class SourcingIntegrationService {
  private baseUrl = '/procurement/sourcing';

  async createRule(dto: CreateSourcingRuleDto): Promise<SourcingRule> {
    try {
      const response = await apiClient.post<SourcingRule>(`${this.baseUrl}/rules`, dto);
      return response.data;
    } catch (error) {
      console.error('API Error creating sourcing rule, using mock:', error);

      const newRule: SourcingRule = {
        id: `rule-${Date.now()}`,
        ...dto,
        status: 'pending_approval',
        priority: dto.priority || 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      MOCK_SOURCING_RULES.push(newRule);
      return newRule;
    }
  }

  async getRules(companyId: string, status?: SourcingRuleStatus): Promise<SourcingRule[]> {
    try {
      const params = new URLSearchParams({ companyId });
      if (status) params.append('status', status);

      const response = await apiClient.get<SourcingRule[]>(
        `${this.baseUrl}/rules?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching sourcing rules, using mock data:', error);

      let filteredRules = MOCK_SOURCING_RULES.filter((r) => r.companyId === companyId);
      if (status) {
        filteredRules = filteredRules.filter((r) => r.status === status);
      }

      return filteredRules.sort((a, b) => b.priority - a.priority);
    }
  }

  async getActiveRules(companyId: string): Promise<SourcingRule[]> {
    try {
      const response = await apiClient.get<SourcingRule[]>(
        `${this.baseUrl}/rules/active?companyId=${companyId}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching active rules, using mock data:', error);

      const today = new Date().toISOString().split('T')[0];
      return MOCK_SOURCING_RULES.filter(
        (r) =>
          r.companyId === companyId &&
          r.status === 'active' &&
          r.effectiveFrom <= today &&
          (!r.effectiveTo || r.effectiveTo >= today)
      ).sort((a, b) => b.priority - a.priority);
    }
  }

  async getRuleById(id: string): Promise<SourcingRule> {
    try {
      const response = await apiClient.get<SourcingRule>(`${this.baseUrl}/rules/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching sourcing rule, using mock data:', error);
      const rule = MOCK_SOURCING_RULES.find((r) => r.id === id);
      if (!rule) throw new Error('Sourcing rule not found');
      return rule;
    }
  }

  async updateRule(id: string, dto: Partial<CreateSourcingRuleDto>): Promise<SourcingRule> {
    try {
      const response = await apiClient.put<SourcingRule>(`${this.baseUrl}/rules/${id}`, dto);
      return response.data;
    } catch (error) {
      console.error('API Error updating sourcing rule, using mock:', error);
      const index = MOCK_SOURCING_RULES.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Sourcing rule not found');

      MOCK_SOURCING_RULES[index] = {
        ...MOCK_SOURCING_RULES[index],
        ...dto,
        updatedAt: new Date().toISOString(),
      };
      return MOCK_SOURCING_RULES[index];
    }
  }

  async activateRule(id: string, approvedBy: string): Promise<SourcingRule> {
    try {
      const response = await apiClient.post<SourcingRule>(`${this.baseUrl}/rules/${id}/activate`, {
        approvedBy,
      });
      return response.data;
    } catch (error) {
      console.error('API Error activating rule, using mock:', error);
      const index = MOCK_SOURCING_RULES.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Sourcing rule not found');

      MOCK_SOURCING_RULES[index] = {
        ...MOCK_SOURCING_RULES[index],
        status: 'active',
        approvedBy,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return MOCK_SOURCING_RULES[index];
    }
  }

  async deactivateRule(id: string): Promise<SourcingRule> {
    try {
      const response = await apiClient.post<SourcingRule>(
        `${this.baseUrl}/rules/${id}/deactivate`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error('API Error deactivating rule, using mock:', error);
      const index = MOCK_SOURCING_RULES.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Sourcing rule not found');

      MOCK_SOURCING_RULES[index] = {
        ...MOCK_SOURCING_RULES[index],
        status: 'inactive',
        updatedAt: new Date().toISOString(),
      };
      return MOCK_SOURCING_RULES[index];
    }
  }

  async deleteRule(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/rules/${id}`);
    } catch (error) {
      console.error('API Error deleting rule, using mock:', error);
      const index = MOCK_SOURCING_RULES.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Sourcing rule not found');
      MOCK_SOURCING_RULES.splice(index, 1);
    }
  }

  async getSourcingRecommendation(
    context: SourcingContext
  ): Promise<SourcingRecommendation | null> {
    try {
      const response = await apiClient.post<SourcingRecommendation | { message: string }>(
        `${this.baseUrl}/recommendation`,
        context
      );
      if ('message' in response.data) return null;
      return response.data;
    } catch (error) {
      console.error('API Error getting sourcing recommendation, using mock:', error);

      // Find matching rule
      const activeRules = MOCK_SOURCING_RULES.filter(
        (r) => r.companyId === context.companyId && r.status === 'active'
      ).sort((a, b) => b.priority - a.priority);

      for (const rule of activeRules) {
        if (this.ruleMatchesContext(rule, context)) {
          return this.buildRecommendation(rule);
        }
      }

      return null;
    }
  }

  async validateSourcingDecision(
    companyId: string,
    amount: number,
    vendorCount: number,
    ruleId?: string
  ): Promise<ValidationResult> {
    try {
      const response = await apiClient.post<ValidationResult>(`${this.baseUrl}/validate`, {
        companyId,
        amount,
        vendorCount,
        ruleId,
      });
      return response.data;
    } catch (error) {
      console.error('API Error validating sourcing decision, using mock:', error);

      const violations: string[] = [];
      const warnings: string[] = [];

      // Find applicable rule
      let rule: SourcingRule | undefined;
      if (ruleId) {
        rule = MOCK_SOURCING_RULES.find((r) => r.id === ruleId);
      } else {
        rule = MOCK_SOURCING_RULES.find(
          (r) =>
            r.companyId === companyId &&
            r.status === 'active' &&
            r.triggerType === 'amount_threshold' &&
            (!r.triggerConditions.minAmount || amount >= r.triggerConditions.minAmount)
        );
      }

      if (!rule) {
        warnings.push('No sourcing rule found for this purchase');
        return { isValid: true, violations, warnings };
      }

      // Check minimum vendors
      if (rule.actions.minVendors && vendorCount < rule.actions.minVendors) {
        violations.push(
          `Minimum ${rule.actions.minVendors} vendors required, but only ${vendorCount} selected`
        );
      }

      // Check competitive bidding threshold
      if (rule.complianceRequirements?.competitiveBiddingThreshold) {
        if (amount >= rule.complianceRequirements.competitiveBiddingThreshold && vendorCount < 3) {
          violations.push(
            `Competitive bidding (min 3 vendors) required for amounts above ${rule.complianceRequirements.competitiveBiddingThreshold}`
          );
        }
      }

      return {
        isValid: violations.length === 0,
        violations,
        warnings,
      };
    }
  }

  private ruleMatchesContext(rule: SourcingRule, context: SourcingContext): boolean {
    const { triggerConditions } = rule;

    if (rule.triggerType === 'amount_threshold') {
      if (triggerConditions.minAmount && context.amount < triggerConditions.minAmount) {
        return false;
      }
      if (triggerConditions.maxAmount && context.amount > triggerConditions.maxAmount) {
        return false;
      }
    }

    if (rule.triggerType === 'item_category') {
      if (triggerConditions.itemCategories?.length && context.itemCategories?.length) {
        const hasMatch = context.itemCategories.some((cat) =>
          triggerConditions.itemCategories!.includes(cat)
        );
        if (!hasMatch) return false;
      }
    }

    if (rule.triggerType === 'department') {
      if (triggerConditions.departments?.length && context.department) {
        if (!triggerConditions.departments.includes(context.department)) {
          return false;
        }
      }
    }

    if (rule.triggerType === 'criticality') {
      if (triggerConditions.criticalityLevels?.length && context.criticality) {
        if (!triggerConditions.criticalityLevels.includes(context.criticality)) {
          return false;
        }
      }
    }

    return true;
  }

  private buildRecommendation(rule: SourcingRule): SourcingRecommendation {
    const complianceNotes: string[] = [];

    if (rule.complianceRequirements?.requireDocumentation) {
      complianceNotes.push('Documentation required for this purchase');
    }
    if (rule.complianceRequirements?.requireApprovalJustification) {
      complianceNotes.push('Approval justification required');
    }
    if (rule.actions.requireTechnicalEvaluation) {
      complianceNotes.push('Technical evaluation required');
    }
    if (rule.actions.requireCommercialEvaluation) {
      complianceNotes.push('Commercial evaluation required');
    }

    return {
      rule,
      ruleType: rule.ruleType,
      minVendors: rule.actions.minVendors || 1,
      maxVendors: rule.actions.maxVendors || 10,
      preferredVendors: rule.actions.preferredVendorIds || [],
      excludedVendors: rule.actions.excludedVendorIds || [],
      requireApproval: rule.actions.requireApproval || false,
      approvalLevels: rule.actions.approvalLevels || 1,
      minQuotationsRequired: rule.actions.minQuotationsRequired || 1,
      evaluationCriteria: rule.actions.evaluationCriteria || [
        { criterion: 'Price', weightage: 40 },
        { criterion: 'Quality', weightage: 30 },
        { criterion: 'Delivery', weightage: 20 },
        { criterion: 'Service', weightage: 10 },
      ],
      timeConstraints: {
        minDuration: rule.timeConstraints?.minRfqDuration || 3,
        maxDuration: rule.timeConstraints?.maxRfqDuration || 30,
        defaultDuration: rule.timeConstraints?.defaultRfqDuration || 7,
      },
      complianceNotes,
    };
  }
}

export const sourcingIntegrationService = new SourcingIntegrationService();
