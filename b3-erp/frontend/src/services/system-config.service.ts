/**
 * System Configuration Service
 * Handles all system configuration-related API operations for the IT Admin module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces
// ============================================================================

export type ConfigCategory =
  | 'general'
  | 'security'
  | 'email'
  | 'notifications'
  | 'integrations'
  | 'workflow'
  | 'localization'
  | 'backup'
  | 'performance';

export type ConfigValueType = 'string' | 'number' | 'boolean' | 'json' | 'encrypted';

export interface SystemConfig {
  id: string;
  key: string;
  name: string;
  description: string;
  value: string;
  valueType: ConfigValueType;
  category: ConfigCategory;
  isEncrypted: boolean;
  isRequired: boolean;
  isEditable: boolean;
  defaultValue: string;
  validationPattern?: string;
  options?: string[];
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSystemConfigDto {
  key: string;
  name: string;
  description: string;
  value: string;
  valueType: ConfigValueType;
  category: ConfigCategory;
  isEncrypted?: boolean;
  isRequired?: boolean;
  defaultValue: string;
  validationPattern?: string;
  options?: string[];
}

export interface UpdateSystemConfigDto {
  name?: string;
  description?: string;
  value?: string;
  validationPattern?: string;
  options?: string[];
}

export interface SystemConfigFilters {
  category?: ConfigCategory;
  valueType?: ConfigValueType;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_SYSTEM_CONFIGS: SystemConfig[] = [
  {
    id: 'config-001',
    key: 'APP_NAME',
    name: 'Application Name',
    description: 'The name of the application displayed in the UI',
    value: 'ManufacturingOS',
    valueType: 'string',
    category: 'general',
    isEncrypted: false,
    isRequired: true,
    isEditable: true,
    defaultValue: 'ManufacturingOS',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'config-002',
    key: 'APP_VERSION',
    name: 'Application Version',
    description: 'Current application version',
    value: '1.5.0',
    valueType: 'string',
    category: 'general',
    isEncrypted: false,
    isRequired: true,
    isEditable: false,
    defaultValue: '1.0.0',
    createdAt: '2024-01-01',
    updatedAt: '2024-10-15',
  },
  {
    id: 'config-003',
    key: 'SESSION_TIMEOUT',
    name: 'Session Timeout',
    description: 'User session timeout in minutes',
    value: '30',
    valueType: 'number',
    category: 'security',
    isEncrypted: false,
    isRequired: true,
    isEditable: true,
    defaultValue: '30',
    validationPattern: '^[1-9][0-9]*$',
    createdAt: '2024-01-01',
    updatedAt: '2024-06-15',
  },
  {
    id: 'config-004',
    key: 'PASSWORD_MIN_LENGTH',
    name: 'Minimum Password Length',
    description: 'Minimum required password length',
    value: '8',
    valueType: 'number',
    category: 'security',
    isEncrypted: false,
    isRequired: true,
    isEditable: true,
    defaultValue: '8',
    validationPattern: '^[1-9][0-9]*$',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'config-005',
    key: 'MFA_ENABLED',
    name: 'Multi-Factor Authentication',
    description: 'Enable multi-factor authentication for all users',
    value: 'true',
    valueType: 'boolean',
    category: 'security',
    isEncrypted: false,
    isRequired: true,
    isEditable: true,
    defaultValue: 'false',
    createdAt: '2024-01-01',
    updatedAt: '2024-08-20',
  },
  {
    id: 'config-006',
    key: 'SMTP_HOST',
    name: 'SMTP Server Host',
    description: 'Email server hostname',
    value: 'smtp.manufacturingos.com',
    valueType: 'string',
    category: 'email',
    isEncrypted: false,
    isRequired: true,
    isEditable: true,
    defaultValue: '',
    createdAt: '2024-01-01',
    updatedAt: '2024-03-10',
  },
  {
    id: 'config-007',
    key: 'SMTP_PORT',
    name: 'SMTP Server Port',
    description: 'Email server port number',
    value: '587',
    valueType: 'number',
    category: 'email',
    isEncrypted: false,
    isRequired: true,
    isEditable: true,
    defaultValue: '587',
    options: ['25', '465', '587', '2525'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'config-008',
    key: 'SMTP_PASSWORD',
    name: 'SMTP Password',
    description: 'Email server authentication password',
    value: '********',
    valueType: 'encrypted',
    category: 'email',
    isEncrypted: true,
    isRequired: true,
    isEditable: true,
    defaultValue: '',
    createdAt: '2024-01-01',
    updatedAt: '2024-09-05',
    lastModifiedBy: 'admin@manufacturingos.com',
  },
  {
    id: 'config-009',
    key: 'NOTIFICATION_EMAIL_ENABLED',
    name: 'Email Notifications',
    description: 'Enable email notifications',
    value: 'true',
    valueType: 'boolean',
    category: 'notifications',
    isEncrypted: false,
    isRequired: true,
    isEditable: true,
    defaultValue: 'true',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'config-010',
    key: 'NOTIFICATION_SMS_ENABLED',
    name: 'SMS Notifications',
    description: 'Enable SMS notifications',
    value: 'false',
    valueType: 'boolean',
    category: 'notifications',
    isEncrypted: false,
    isRequired: true,
    isEditable: true,
    defaultValue: 'false',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'config-011',
    key: 'ERP_INTEGRATION_URL',
    name: 'ERP Integration URL',
    description: 'External ERP system integration endpoint',
    value: 'https://api.erp-integration.com/v1',
    valueType: 'string',
    category: 'integrations',
    isEncrypted: false,
    isRequired: false,
    isEditable: true,
    defaultValue: '',
    validationPattern: '^https?://.*$',
    createdAt: '2024-01-01',
    updatedAt: '2024-07-22',
  },
  {
    id: 'config-012',
    key: 'WORKFLOW_MAX_APPROVERS',
    name: 'Maximum Workflow Approvers',
    description: 'Maximum number of approvers in a workflow chain',
    value: '10',
    valueType: 'number',
    category: 'workflow',
    isEncrypted: false,
    isRequired: true,
    isEditable: true,
    defaultValue: '5',
    validationPattern: '^[1-9][0-9]*$',
    createdAt: '2024-01-01',
    updatedAt: '2024-05-18',
  },
  {
    id: 'config-013',
    key: 'DEFAULT_TIMEZONE',
    name: 'Default Timezone',
    description: 'Default timezone for the application',
    value: 'Asia/Kolkata',
    valueType: 'string',
    category: 'localization',
    isEncrypted: false,
    isRequired: true,
    isEditable: true,
    defaultValue: 'UTC',
    options: ['UTC', 'Asia/Kolkata', 'America/New_York', 'Europe/London', 'Asia/Singapore'],
    createdAt: '2024-01-01',
    updatedAt: '2024-02-28',
  },
  {
    id: 'config-014',
    key: 'DEFAULT_CURRENCY',
    name: 'Default Currency',
    description: 'Default currency for financial operations',
    value: 'INR',
    valueType: 'string',
    category: 'localization',
    isEncrypted: false,
    isRequired: true,
    isEditable: true,
    defaultValue: 'USD',
    options: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'SGD'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'config-015',
    key: 'BACKUP_SCHEDULE',
    name: 'Backup Schedule',
    description: 'Automated backup schedule configuration',
    value: '{"frequency": "daily", "time": "02:00", "retention": 30}',
    valueType: 'json',
    category: 'backup',
    isEncrypted: false,
    isRequired: true,
    isEditable: true,
    defaultValue: '{"frequency": "daily", "time": "00:00", "retention": 7}',
    createdAt: '2024-01-01',
    updatedAt: '2024-04-12',
  },
  {
    id: 'config-016',
    key: 'CACHE_TTL',
    name: 'Cache TTL',
    description: 'Default cache time-to-live in seconds',
    value: '3600',
    valueType: 'number',
    category: 'performance',
    isEncrypted: false,
    isRequired: true,
    isEditable: true,
    defaultValue: '3600',
    validationPattern: '^[1-9][0-9]*$',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'config-017',
    key: 'MAX_UPLOAD_SIZE',
    name: 'Maximum Upload Size',
    description: 'Maximum file upload size in MB',
    value: '50',
    valueType: 'number',
    category: 'performance',
    isEncrypted: false,
    isRequired: true,
    isEditable: true,
    defaultValue: '10',
    validationPattern: '^[1-9][0-9]*$',
    createdAt: '2024-01-01',
    updatedAt: '2024-06-30',
  },
];

// ============================================================================
// System Config Service Class
// ============================================================================

export class SystemConfigService {
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

  /**
   * Get all system configurations with optional filters
   */
  static async getAllConfigs(filters?: SystemConfigFilters): Promise<SystemConfig[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredConfigs = [...MOCK_SYSTEM_CONFIGS];

      if (filters?.category) {
        filteredConfigs = filteredConfigs.filter((c) => c.category === filters.category);
      }
      if (filters?.valueType) {
        filteredConfigs = filteredConfigs.filter((c) => c.valueType === filters.valueType);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredConfigs = filteredConfigs.filter(
          (c) =>
            c.key.toLowerCase().includes(searchLower) ||
            c.name.toLowerCase().includes(searchLower) ||
            c.description.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredConfigs = filteredConfigs.slice(start, end);
      }

      return filteredConfigs;
    }

    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.set('category', filters.category);
    if (filters?.valueType) queryParams.set('valueType', filters.valueType);
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<SystemConfig[]>(`/it-admin/system-config?${queryParams.toString()}`);
  }

  /**
   * Get configuration by ID
   */
  static async getConfigById(id: string): Promise<SystemConfig> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const config = MOCK_SYSTEM_CONFIGS.find((c) => c.id === id);
      if (!config) throw new Error('Configuration not found');
      return config;
    }
    return this.request<SystemConfig>(`/it-admin/system-config/${id}`);
  }

  /**
   * Get configuration by key
   */
  static async getConfigByKey(key: string): Promise<SystemConfig> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const config = MOCK_SYSTEM_CONFIGS.find((c) => c.key === key);
      if (!config) throw new Error('Configuration not found');
      return config;
    }
    return this.request<SystemConfig>(`/it-admin/system-config/key/${key}`);
  }

  /**
   * Get configurations by category
   */
  static async getConfigsByCategory(): Promise<Record<ConfigCategory, SystemConfig[]>> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const grouped: Record<string, SystemConfig[]> = {};

      MOCK_SYSTEM_CONFIGS.forEach((config) => {
        if (!grouped[config.category]) {
          grouped[config.category] = [];
        }
        grouped[config.category].push(config);
      });

      return grouped as Record<ConfigCategory, SystemConfig[]>;
    }

    return this.request<Record<ConfigCategory, SystemConfig[]>>('/it-admin/system-config/by-category');
  }

  /**
   * Create a new system configuration
   */
  static async createConfig(data: CreateSystemConfigDto): Promise<SystemConfig> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if key already exists
      const existingConfig = MOCK_SYSTEM_CONFIGS.find((c) => c.key === data.key);
      if (existingConfig) {
        throw new Error('Configuration key already exists');
      }

      const newConfig: SystemConfig = {
        id: `config-${Date.now()}`,
        ...data,
        isEncrypted: data.isEncrypted || false,
        isRequired: data.isRequired || false,
        isEditable: true,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      MOCK_SYSTEM_CONFIGS.push(newConfig);
      return newConfig;
    }
    return this.request<SystemConfig>('/it-admin/system-config', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing system configuration
   */
  static async updateConfig(id: string, data: UpdateSystemConfigDto): Promise<SystemConfig> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_SYSTEM_CONFIGS.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Configuration not found');

      if (!MOCK_SYSTEM_CONFIGS[index].isEditable) {
        throw new Error('This configuration is not editable');
      }

      MOCK_SYSTEM_CONFIGS[index] = {
        ...MOCK_SYSTEM_CONFIGS[index],
        ...data,
        updatedAt: new Date().toISOString().split('T')[0],
        lastModifiedBy: 'current-user@manufacturingos.com',
      };
      return MOCK_SYSTEM_CONFIGS[index];
    }
    return this.request<SystemConfig>(`/it-admin/system-config/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a system configuration
   */
  static async deleteConfig(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_SYSTEM_CONFIGS.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Configuration not found');

      if (MOCK_SYSTEM_CONFIGS[index].isRequired) {
        throw new Error('Cannot delete required configuration');
      }

      MOCK_SYSTEM_CONFIGS.splice(index, 1);
      return;
    }
    await this.request<void>(`/it-admin/system-config/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Reset configuration to default value
   */
  static async resetToDefault(id: string): Promise<SystemConfig> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_SYSTEM_CONFIGS.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Configuration not found');

      MOCK_SYSTEM_CONFIGS[index] = {
        ...MOCK_SYSTEM_CONFIGS[index],
        value: MOCK_SYSTEM_CONFIGS[index].defaultValue,
        updatedAt: new Date().toISOString().split('T')[0],
        lastModifiedBy: 'current-user@manufacturingos.com',
      };
      return MOCK_SYSTEM_CONFIGS[index];
    }
    return this.request<SystemConfig>(`/it-admin/system-config/${id}/reset`, {
      method: 'POST',
    });
  }

  /**
   * Get configuration statistics
   */
  static async getStatistics(): Promise<{
    totalConfigs: number;
    configsByCategory: Record<string, number>;
    editableConfigs: number;
    encryptedConfigs: number;
    recentlyModified: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const configsByCategory: Record<string, number> = {};
      MOCK_SYSTEM_CONFIGS.forEach((config) => {
        configsByCategory[config.category] = (configsByCategory[config.category] || 0) + 1;
      });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return {
        totalConfigs: MOCK_SYSTEM_CONFIGS.length,
        configsByCategory,
        editableConfigs: MOCK_SYSTEM_CONFIGS.filter((c) => c.isEditable).length,
        encryptedConfigs: MOCK_SYSTEM_CONFIGS.filter((c) => c.isEncrypted).length,
        recentlyModified: MOCK_SYSTEM_CONFIGS.filter(
          (c) => new Date(c.updatedAt) >= thirtyDaysAgo
        ).length,
      };
    }

    return this.request<{
      totalConfigs: number;
      configsByCategory: Record<string, number>;
      editableConfigs: number;
      encryptedConfigs: number;
      recentlyModified: number;
    }>('/it-admin/system-config/statistics');
  }
}

// Export singleton instance
export const systemConfigService = SystemConfigService;
