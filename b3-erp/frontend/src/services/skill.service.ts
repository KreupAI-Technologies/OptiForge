import {
  Skill,
  SkillCategory,
  ProficiencyLevel,
  UserSkill,
  SkillStatus,
  SkillType,
  SkillCategoryStatus,
  ProficiencyLevelStatus,
  UserSkillStatus,
  CreateSkillDto,
  UpdateSkillDto,
  CreateUserSkillDto,
  UpdateUserSkillDto,
} from '@/types/skill';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Mock Data - Categories
export const MOCK_SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'cat-1',
    code: 'DOMAIN',
    name: 'Domain Expertise',
    description: 'Industry-specific knowledge and expertise',
    icon: 'Briefcase',
    color: '#3B82F6',
    sortOrder: 1,
    status: SkillCategoryStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-2',
    code: 'AI-AUTOMATION',
    name: 'AI & Automation',
    description: 'AI-powered features and automation capabilities',
    icon: 'Brain',
    color: '#8B5CF6',
    sortOrder: 2,
    status: SkillCategoryStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-3',
    code: 'MARKETING',
    name: 'Marketing & Business',
    description: 'Marketing, sales, and business operations',
    icon: 'TrendingUp',
    color: '#10B981',
    sortOrder: 3,
    status: SkillCategoryStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-4',
    code: 'TECHNICAL',
    name: 'Technical Skills',
    description: 'Software development and technical capabilities',
    icon: 'Code',
    color: '#F59E0B',
    sortOrder: 4,
    status: SkillCategoryStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock Data - Skills (from user's screenshot)
export const MOCK_SKILLS: Skill[] = [
  {
    id: 'skill-1',
    code: 'workflow-manager',
    name: 'Workflow Manager',
    description: 'Expert domain skill for designing and implementing embedded workflow engines that orchestrate business processes (claims, approvals, HR requests, sales orders).',
    useCases: 'Use when (1) Designing workflow definition JSON schemas for config-as-code approaches, (2) Implementing state machines with complex transitions, (3) Building approval hierarchies and delegation rules.',
    categoryId: 'cat-1',
    skillType: SkillType.DOMAIN,
    icon: 'GitBranch',
    color: '#3B82F6',
    tags: ['workflow', 'automation', 'business-process'],
    requiresCertification: false,
    sortOrder: 1,
    status: SkillStatus.ACTIVE,
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-07'),
  },
  {
    id: 'skill-2',
    code: 'ai-automation',
    name: 'AI Automation',
    description: 'Documentation for AI-powered features and automation capabilities across the Chainora platform. Covers semantic search, quote comparison, ETA prediction, risk scoring, demand forecasting, document AI, route optimization, fraud detection, and intelligent automation.',
    useCases: 'Use when implementing AI features, machine learning models, predictive analytics, or automated decision-making systems.',
    categoryId: 'cat-2',
    skillType: SkillType.DOMAIN,
    icon: 'Brain',
    color: '#8B5CF6',
    tags: ['AI', 'automation', 'machine-learning', 'prediction'],
    requiresCertification: false,
    sortOrder: 2,
    status: SkillStatus.ACTIVE,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: 'skill-3',
    code: 'platform-capabilities',
    name: 'Platform Capabilities',
    description: 'Comprehensive documentation of Chainora platform\'s core competencies organized by domain. Use when discussing platform features, capabilities, user journeys, module specifications, or when designing new features that integrate with the platform.',
    useCases: 'Use when (1) Discussing platform features and capabilities, (2) Understanding user journeys, (3) Module specifications, (4) Designing new features.',
    categoryId: 'cat-1',
    skillType: SkillType.DOMAIN,
    icon: 'Layers',
    color: '#3B82F6',
    tags: ['platform', 'capabilities', 'features', 'documentation'],
    requiresCertification: false,
    sortOrder: 3,
    status: SkillStatus.ACTIVE,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: 'skill-4',
    code: 'developer-guidelines',
    name: 'Developer Guidelines',
    description: 'Comprehensive development standards and best practices for Chainora platform. Use when developers need guidance on coding standards, API conventions, database patterns, microservices architecture, event-driven design, security best practices.',
    useCases: 'Use when (1) Setting up development environment, (2) Writing code that follows platform standards, (3) Designing APIs, (4) Implementing security measures.',
    categoryId: 'cat-4',
    skillType: SkillType.TECHNICAL,
    icon: 'Code',
    color: '#F59E0B',
    tags: ['development', 'coding-standards', 'API', 'security'],
    requiresCertification: false,
    sortOrder: 4,
    status: SkillStatus.ACTIVE,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: 'skill-5',
    code: 'business-ops-marketing-manager',
    name: 'Business Ops & Marketing Manager',
    description: 'Business Operations & Marketing Manager who drives products to customers through commercial excellence. Use when (1) Creating killer demo flows that convert prospects to customers, (2) Building industry-specific pitch decks for sales teams.',
    useCases: 'Use when creating demos, sales presentations, customer success materials, or marketing content.',
    categoryId: 'cat-3',
    skillType: SkillType.DOMAIN,
    icon: 'Megaphone',
    color: '#10B981',
    tags: ['marketing', 'business-ops', 'sales', 'demos'],
    requiresCertification: false,
    sortOrder: 5,
    status: SkillStatus.ACTIVE,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'skill-6',
    code: 'linkedin-expert',
    name: 'LinkedIn Expert',
    description: 'Expert content creator for LinkedIn posts, Meta (Facebook/Instagram) posts, Google Business posts, and blog articles. Use this skill when asked to create social media content, project announcements, company updates, thought leadership articles.',
    useCases: 'Use when creating LinkedIn posts, social media content, blog articles, or professional networking content.',
    categoryId: 'cat-3',
    skillType: SkillType.DOMAIN,
    icon: 'Linkedin',
    color: '#0A66C2',
    tags: ['linkedin', 'social-media', 'content-creation', 'marketing'],
    requiresCertification: false,
    sortOrder: 6,
    status: SkillStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'skill-7',
    code: 'facility-management-expert',
    name: 'Facility Management Expert',
    description: 'Facility Management domain expert with cross-industry experience covering commercial, healthcare, education, hospitality, industrial, retail, and infrastructure facilities. Use when (1) Designing FM software modules (space management, maintenance, asset tracking).',
    useCases: 'Use when designing facility management features, space planning, maintenance scheduling, or asset management systems.',
    categoryId: 'cat-1',
    skillType: SkillType.DOMAIN,
    icon: 'Building2',
    color: '#6366F1',
    tags: ['facility-management', 'maintenance', 'asset-tracking', 'space-planning'],
    requiresCertification: false,
    sortOrder: 7,
    status: SkillStatus.ACTIVE,
    createdAt: new Date('2023-12-28'),
    updatedAt: new Date('2023-12-28'),
  },
  {
    id: 'skill-8',
    code: 'kreupai-solution-architect',
    name: 'Kreupai Solution Architect',
    description: 'Expert solution architect for designing and proposing SaaS applications and custom enterprise solutions based on customer RFPs. Use when (1) Analyzing and responding to RFPs/RFQs/EOIs, (2) Designing enterprise solution architectures.',
    useCases: 'Use when analyzing customer requirements, designing solution architectures, creating technical proposals, or responding to RFPs.',
    categoryId: 'cat-1',
    skillType: SkillType.DOMAIN,
    icon: 'FileText',
    color: '#059669',
    tags: ['solution-architecture', 'RFP', 'enterprise', 'SaaS', 'proposals'],
    requiresCertification: false,
    sortOrder: 8,
    status: SkillStatus.ACTIVE,
    createdAt: new Date('2023-12-27'),
    updatedAt: new Date('2023-12-27'),
  },
  {
    id: 'skill-9',
    code: 'landing-page-developer',
    name: 'Landing Page Developer',
    description: 'Create high-converting landing pages with expert frontend development and marketing strategy. Use this skill when asked to build landing pages, sales pages, product launch pages, SaaS marketing pages, app download pages, waitlist pages, or similar conversion-focused web pages.',
    useCases: 'Use when building landing pages, sales pages, product launch pages, SaaS marketing pages, app download pages, or waitlist pages.',
    categoryId: 'cat-4',
    skillType: SkillType.TECHNICAL,
    icon: 'Layout',
    color: '#EC4899',
    tags: ['landing-pages', 'frontend', 'marketing', 'conversion', 'web-development'],
    requiresCertification: false,
    sortOrder: 9,
    status: SkillStatus.ACTIVE,
    createdAt: new Date('2023-12-22'),
    updatedAt: new Date('2023-12-22'),
  },
  {
    id: 'skill-10',
    code: 'backend-engineer',
    name: 'Backend Engineer',
    description: 'Backend engineering skill that analyzes UI/UX components (React, React Native) and user flows to create normalized Prisma schemas, API endpoints, and proper frontend-backend wiring. Use when (1) Creating database schemas from UI designs.',
    useCases: 'Use when designing database schemas, creating API endpoints, implementing backend services, or wiring frontend to backend.',
    categoryId: 'cat-4',
    skillType: SkillType.TECHNICAL,
    icon: 'Server',
    color: '#0EA5E9',
    tags: ['backend', 'API', 'database', 'Prisma', 'Node.js'],
    requiresCertification: false,
    sortOrder: 10,
    status: SkillStatus.ACTIVE,
    createdAt: new Date('2023-12-22'),
    updatedAt: new Date('2023-12-22'),
  },
  {
    id: 'skill-11',
    code: 'quality-assurance-engineer',
    name: 'Quality Assurance Engineer',
    description: 'Skilled professional responsible for ensuring software quality through systematic testing, defect identification, and quality process implementation. Core competencies include manual and automated testing, test case design, bug tracking, and quality metrics.',
    useCases: 'Use when designing test cases, implementing automated tests, performing QA reviews, or setting up quality processes.',
    categoryId: 'cat-4',
    skillType: SkillType.TECHNICAL,
    icon: 'CheckCircle',
    color: '#14B8A6',
    tags: ['QA', 'testing', 'automation', 'quality', 'bug-tracking'],
    requiresCertification: false,
    sortOrder: 11,
    status: SkillStatus.ACTIVE,
    createdAt: new Date('2023-12-22'),
    updatedAt: new Date('2023-12-22'),
  },
];

// Mock Data - Proficiency Levels
export const MOCK_PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  {
    id: 'prof-1',
    code: 'BEGINNER',
    name: 'Beginner',
    description: 'Basic understanding and awareness',
    level: 1,
    color: '#94A3B8',
    criteria: 'Has basic knowledge but limited practical experience',
    status: ProficiencyLevelStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'prof-2',
    code: 'INTERMEDIATE',
    name: 'Intermediate',
    description: 'Working knowledge with some experience',
    level: 2,
    color: '#22C55E',
    criteria: 'Can apply the skill with some guidance',
    status: ProficiencyLevelStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'prof-3',
    code: 'ADVANCED',
    name: 'Advanced',
    description: 'Strong proficiency and extensive experience',
    level: 3,
    color: '#3B82F6',
    criteria: 'Can work independently and mentor others',
    status: ProficiencyLevelStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'prof-4',
    code: 'EXPERT',
    name: 'Expert',
    description: 'Deep expertise and thought leadership',
    level: 4,
    color: '#8B5CF6',
    criteria: 'Recognized expert who drives innovation',
    status: ProficiencyLevelStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'prof-5',
    code: 'MASTER',
    name: 'Master',
    description: 'Industry-leading expertise',
    level: 5,
    color: '#F59E0B',
    criteria: 'Industry expert and thought leader',
    status: ProficiencyLevelStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export class SkillService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Skill Category Methods
  static async getAllCategories(): Promise<SkillCategory[]> {
    if (USE_MOCK_DATA) {
      return [...MOCK_SKILL_CATEGORIES];
    }
    try {
      return await this.request<SkillCategory[]>('/hr/skill-categories');
    } catch (error) {
      console.warn('API error fetching categories, using mock data:', error);
      return [...MOCK_SKILL_CATEGORIES];
    }
  }

  static async getCategoryById(id: string): Promise<SkillCategory> {
    if (USE_MOCK_DATA) {
      const category = MOCK_SKILL_CATEGORIES.find((c) => c.id === id);
      if (!category) throw new Error('Category not found');
      return category;
    }
    try {
      return await this.request<SkillCategory>(`/hr/skill-categories/${id}`);
    } catch (error) {
      console.warn('API error fetching category, using mock data:', error);
      const category = MOCK_SKILL_CATEGORIES.find((c) => c.id === id);
      if (!category) throw new Error('Category not found');
      return category;
    }
  }

  // Skill Methods
  static async getAllSkills(filters?: {
    categoryId?: string;
    skillType?: string;
    status?: string;
    search?: string;
  }): Promise<Skill[]> {
    const getFilteredMockSkills = () => {
      let filteredSkills = [...MOCK_SKILLS];

      if (filters?.categoryId) {
        filteredSkills = filteredSkills.filter((s) => s.categoryId === filters.categoryId);
      }
      if (filters?.skillType) {
        filteredSkills = filteredSkills.filter((s) => s.skillType === filters.skillType);
      }
      if (filters?.status) {
        filteredSkills = filteredSkills.filter((s) => s.status === filters.status);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredSkills = filteredSkills.filter(
          (s) =>
            s.name.toLowerCase().includes(searchLower) ||
            s.code.toLowerCase().includes(searchLower) ||
            s.description?.toLowerCase().includes(searchLower)
        );
      }

      // Add category data to skills
      return filteredSkills.map((skill) => ({
        ...skill,
        category: MOCK_SKILL_CATEGORIES.find((c) => c.id === skill.categoryId),
      }));
    };

    if (USE_MOCK_DATA) {
      return getFilteredMockSkills();
    }

    try {
      const queryParams = new URLSearchParams();
      if (filters?.categoryId) queryParams.set('categoryId', filters.categoryId);
      if (filters?.skillType) queryParams.set('skillType', filters.skillType);
      if (filters?.status) queryParams.set('status', filters.status);
      if (filters?.search) queryParams.set('search', filters.search);

      return await this.request<Skill[]>(`/hr/skills?${queryParams.toString()}`);
    } catch (error) {
      console.warn('API error fetching skills, using mock data:', error);
      return getFilteredMockSkills();
    }
  }

  static async getSkillById(id: string): Promise<Skill> {
    const getMockSkill = () => {
      const skill = MOCK_SKILLS.find((s) => s.id === id);
      if (!skill) throw new Error('Skill not found');
      return {
        ...skill,
        category: MOCK_SKILL_CATEGORIES.find((c) => c.id === skill.categoryId),
      };
    };

    if (USE_MOCK_DATA) {
      return getMockSkill();
    }
    try {
      return await this.request<Skill>(`/hr/skills/${id}`);
    } catch (error) {
      console.warn('API error fetching skill by id, using mock data:', error);
      return getMockSkill();
    }
  }

  static async getSkillByCode(code: string): Promise<Skill> {
    const getMockSkill = () => {
      const skill = MOCK_SKILLS.find((s) => s.code === code);
      if (!skill) throw new Error('Skill not found');
      return {
        ...skill,
        category: MOCK_SKILL_CATEGORIES.find((c) => c.id === skill.categoryId),
      };
    };

    if (USE_MOCK_DATA) {
      return getMockSkill();
    }
    try {
      return await this.request<Skill>(`/hr/skills/code/${code}`);
    } catch (error) {
      console.warn('API error fetching skill by code, using mock data:', error);
      return getMockSkill();
    }
  }

  static async getSkillsGroupedByCategory(): Promise<Record<string, Skill[]>> {
    const getMockGrouped = () => {
      const grouped: Record<string, Skill[]> = {};

      MOCK_SKILLS.forEach((skill) => {
        const category = MOCK_SKILL_CATEGORIES.find((c) => c.id === skill.categoryId);
        const categoryName = category?.name || 'Uncategorized';

        if (!grouped[categoryName]) {
          grouped[categoryName] = [];
        }
        grouped[categoryName].push({
          ...skill,
          category,
        });
      });

      return grouped;
    };

    if (USE_MOCK_DATA) {
      return getMockGrouped();
    }
    try {
      return await this.request<Record<string, Skill[]>>('/hr/skills/grouped');
    } catch (error) {
      console.warn('API error fetching grouped skills, using mock data:', error);
      return getMockGrouped();
    }
  }

  static async createSkill(data: CreateSkillDto): Promise<Skill> {
    const createMockSkill = () => {
      const newSkill: Skill = {
        id: `skill-${Date.now()}`,
        ...data,
        skillType: data.skillType || SkillType.DOMAIN,
        requiresCertification: data.requiresCertification || false,
        sortOrder: data.sortOrder || MOCK_SKILLS.length + 1,
        status: data.status || SkillStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_SKILLS.push(newSkill);
      return newSkill;
    };

    if (USE_MOCK_DATA) {
      return createMockSkill();
    }
    return this.request<Skill>('/hr/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateSkill(id: string, data: UpdateSkillDto): Promise<Skill> {
    const updateMockSkill = () => {
      const index = MOCK_SKILLS.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Skill not found');

      MOCK_SKILLS[index] = {
        ...MOCK_SKILLS[index],
        ...data,
        updatedAt: new Date(),
      };
      return MOCK_SKILLS[index];
    };

    if (USE_MOCK_DATA) {
      return updateMockSkill();
    }
    return this.request<Skill>(`/hr/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteSkill(id: string): Promise<void> {
    const deleteMockSkill = () => {
      const index = MOCK_SKILLS.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Skill not found');
      MOCK_SKILLS.splice(index, 1);
    };

    if (USE_MOCK_DATA) {
      deleteMockSkill();
      return;
    }
    await this.request<void>(`/hr/skills/${id}`, {
      method: 'DELETE',
    });
  }

  // Proficiency Level Methods
  static async getAllProficiencyLevels(): Promise<ProficiencyLevel[]> {
    if (USE_MOCK_DATA) {
      return [...MOCK_PROFICIENCY_LEVELS];
    }
    try {
      return await this.request<ProficiencyLevel[]>('/hr/proficiency-levels');
    } catch (error) {
      console.warn('API error fetching proficiency levels, using mock data:', error);
      return [...MOCK_PROFICIENCY_LEVELS];
    }
  }

  // User Skill Methods
  static async getEmployeeSkills(employeeId: string): Promise<UserSkill[]> {
    if (USE_MOCK_DATA) {
      // Return empty array for mock - in real implementation, this would return user's skills
      return [];
    }
    try {
      return await this.request<UserSkill[]>(`/hr/user-skills/employee/${employeeId}`);
    } catch (error) {
      console.warn('API error fetching employee skills, using mock data:', error);
      return [];
    }
  }

  static async assignSkill(data: CreateUserSkillDto): Promise<UserSkill> {
    const createMockUserSkill = (): UserSkill => {
      const skill = MOCK_SKILLS.find((s) => s.id === data.skillId);
      return {
        id: `user-skill-${Date.now()}`,
        employeeId: data.employeeId,
        skillId: data.skillId,
        ...(skill ? { skill } : {}),
        proficiencyLevel: data.proficiencyLevel || 1,
        isEnabled: data.isEnabled !== false,
        status: data.status || UserSkillStatus.ACTIVE,
        notes: data.notes,
        metadata: data.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    };

    if (USE_MOCK_DATA) {
      return createMockUserSkill();
    }
    try {
      return await this.request<UserSkill>('/hr/user-skills', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('API error assigning skill, using mock data:', error);
      return createMockUserSkill();
    }
  }

  static async updateUserSkill(id: string, data: UpdateUserSkillDto): Promise<UserSkill> {
    const createMockResponse = (): UserSkill => {
      // In mock, just return with updated data
      return {
        id,
        employeeId: 'mock-employee',
        skillId: 'mock-skill',
        proficiencyLevel: data.proficiencyLevel ?? 1,
        isEnabled: data.isEnabled ?? true,
        status: data.status ?? UserSkillStatus.ACTIVE,
        notes: data.notes,
        metadata: data.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    };

    if (USE_MOCK_DATA) {
      return createMockResponse();
    }
    try {
      return await this.request<UserSkill>(`/hr/user-skills/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('API error updating user skill, using mock data:', error);
      return createMockResponse();
    }
  }

  static async removeUserSkill(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return;
    }
    try {
      await this.request<void>(`/hr/user-skills/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('API error removing user skill, using mock data:', error);
      // Silent fallback for delete operation
    }
  }

  // Analytics
  static async getSkillStatistics(): Promise<{
    totalSkills: number;
    activeSkills: number;
    totalCategories: number;
    skillsByCategory: Record<string, number>;
    skillsByType: Record<string, number>;
  }> {
    const getMockStatistics = () => {
      const skillsByCategory: Record<string, number> = {};
      const skillsByType: Record<string, number> = {};

      MOCK_SKILLS.forEach((skill) => {
        const categoryName = MOCK_SKILL_CATEGORIES.find((c) => c.id === skill.categoryId)?.name || 'Uncategorized';
        skillsByCategory[categoryName] = (skillsByCategory[categoryName] || 0) + 1;
        skillsByType[skill.skillType] = (skillsByType[skill.skillType] || 0) + 1;
      });

      return {
        totalSkills: MOCK_SKILLS.length,
        activeSkills: MOCK_SKILLS.filter((s) => s.status === SkillStatus.ACTIVE).length,
        totalCategories: MOCK_SKILL_CATEGORIES.length,
        skillsByCategory,
        skillsByType,
      };
    };

    if (USE_MOCK_DATA) {
      return getMockStatistics();
    }

    try {
      // In real implementation, this would be a dedicated endpoint
      const skills = await this.getAllSkills();
      const categories = await this.getAllCategories();

      const skillsByCategory: Record<string, number> = {};
      const skillsByType: Record<string, number> = {};

      skills.forEach((skill) => {
        const categoryName = skill.category?.name || 'Uncategorized';
        skillsByCategory[categoryName] = (skillsByCategory[categoryName] || 0) + 1;
        skillsByType[skill.skillType] = (skillsByType[skill.skillType] || 0) + 1;
      });

      return {
        totalSkills: skills.length,
        activeSkills: skills.filter((s) => s.status === SkillStatus.ACTIVE).length,
        totalCategories: categories.length,
        skillsByCategory,
        skillsByType,
      };
    } catch (error) {
      console.warn('API error fetching skill statistics, using mock data:', error);
      return getMockStatistics();
    }
  }
}
