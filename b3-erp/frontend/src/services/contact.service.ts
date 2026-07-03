/**
 * Contact Service
 * Handles all contact-related API operations for the CRM module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces
// ============================================================================

export type ContactType = 'primary' | 'secondary' | 'billing' | 'technical';
export type ContactStatus = 'active' | 'inactive' | 'vip';
export type ContactRole = 'Decision Maker' | 'Influencer' | 'User' | 'Gatekeeper' | 'Technical Buyer' | 'Economic Buyer';
export type Department = 'Sales' | 'Marketing' | 'IT' | 'Finance' | 'Operations' | 'HR' | 'Executive';

export interface ContactRoleData {
  id: string;
  role: ContactRole;
  department: Department;
  isPrimary: boolean;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  position: string;
  type: ContactType;
  status: ContactStatus;
  value: number;
  createdAt: string;
  roles: ContactRoleData[];
  department?: Department;
  location?: string;
  lastContactDate?: string;
  linkedIn?: string;
}

export interface CreateContactDto {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  position: string;
  type: ContactType;
  status?: ContactStatus;
  value?: number;
  roles?: ContactRoleData[];
  department?: Department;
  location?: string;
  linkedIn?: string;
}

export interface UpdateContactDto extends Partial<CreateContactDto> {}

export interface ContactFilters {
  status?: ContactStatus;
  role?: ContactRole;
  department?: Department;
  company?: string;
  location?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Williams',
    company: 'Premier Kitchen Designs Ltd',
    email: 'sarah.williams@premierkitchen.com',
    phone: '+1 234-567-1001',
    position: 'Head of Procurement',
    type: 'primary',
    status: 'vip',
    value: 125000,
    createdAt: '2025-09-15',
    roles: [
      { id: 'r1', role: 'Decision Maker', department: 'Executive', isPrimary: true },
      { id: 'r2', role: 'Economic Buyer', department: 'Finance', isPrimary: false }
    ],
    department: 'Executive',
    location: 'New York, NY',
    lastContactDate: '2025-10-20',
    linkedIn: 'https://linkedin.com/in/sarahwilliams'
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    company: 'Urban Kitchen Solutions',
    email: 'm.chen@urbankitchen.com',
    phone: '+1 234-567-1002',
    position: 'Operations Manager',
    type: 'primary',
    status: 'active',
    value: 85000,
    createdAt: '2025-09-20',
    roles: [
      { id: 'r3', role: 'Influencer', department: 'Operations', isPrimary: true }
    ],
    department: 'Operations',
    location: 'Los Angeles, CA',
    lastContactDate: '2025-10-18',
  },
  {
    id: '3',
    firstName: 'Jennifer',
    lastName: 'Rodriguez',
    company: 'Metro Manufacturing Inc',
    email: 'j.rodriguez@metromanuf.com',
    phone: '+1 234-567-1003',
    position: 'Purchase Director',
    type: 'primary',
    status: 'active',
    value: 95000,
    createdAt: '2025-10-01',
    roles: [
      { id: 'r4', role: 'Decision Maker', department: 'Sales', isPrimary: true }
    ],
    department: 'Sales',
    location: 'Chicago, IL',
    lastContactDate: '2025-10-15',
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Thompson',
    company: 'Premier Kitchen Designs Ltd',
    email: 'd.thompson@premierkitchen.com',
    phone: '+1 234-567-1004',
    position: 'Finance Manager',
    type: 'billing',
    status: 'active',
    value: 0,
    createdAt: '2025-10-02',
    roles: [
      { id: 'r5', role: 'Economic Buyer', department: 'Finance', isPrimary: true }
    ],
    department: 'Finance',
    location: 'New York, NY',
    lastContactDate: '2025-10-10',
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Anderson',
    company: 'Signature Kitchens Co',
    email: 'l.anderson@signaturekitchens.com',
    phone: '+1 234-567-1005',
    position: 'CEO',
    type: 'primary',
    status: 'vip',
    value: 150000,
    createdAt: '2025-10-05',
    roles: [
      { id: 'r6', role: 'Decision Maker', department: 'Executive', isPrimary: true },
      { id: 'r7', role: 'Economic Buyer', department: 'Executive', isPrimary: false }
    ],
    department: 'Executive',
    location: 'San Francisco, CA',
    lastContactDate: '2025-10-22',
    linkedIn: 'https://linkedin.com/in/lisaanderson'
  },
];

// ============================================================================
// Contact Service Class
// ============================================================================

export class ContactService {
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
   * Get all contacts with optional filters
   */
  static async getAllContacts(filters?: ContactFilters): Promise<Contact[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredContacts = [...MOCK_CONTACTS];

      if (filters?.status) {
        filteredContacts = filteredContacts.filter((c) => c.status === filters.status);
      }
      if (filters?.role) {
        filteredContacts = filteredContacts.filter((c) =>
          c.roles.some((r) => r.role === filters.role)
        );
      }
      if (filters?.department) {
        filteredContacts = filteredContacts.filter((c) => c.department === filters.department);
      }
      if (filters?.company) {
        filteredContacts = filteredContacts.filter((c) => c.company === filters.company);
      }
      if (filters?.location) {
        filteredContacts = filteredContacts.filter((c) => c.location === filters.location);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredContacts = filteredContacts.filter(
          (c) =>
            c.firstName.toLowerCase().includes(searchLower) ||
            c.lastName.toLowerCase().includes(searchLower) ||
            c.company.toLowerCase().includes(searchLower) ||
            c.email.toLowerCase().includes(searchLower)
        );
      }

      // Pagination
      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredContacts = filteredContacts.slice(start, end);
      }

      return filteredContacts;
    }

    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.role) queryParams.set('role', filters.role);
    if (filters?.department) queryParams.set('department', filters.department);
    if (filters?.company) queryParams.set('company', filters.company);
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<Contact[]>(`/crm/contacts?${queryParams.toString()}`);
  }

  /**
   * Get contact by ID
   */
  static async getContactById(id: string): Promise<Contact> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const contact = MOCK_CONTACTS.find((c) => c.id === id);
      if (!contact) throw new Error('Contact not found');
      return contact;
    }
    return this.request<Contact>(`/crm/contacts/${id}`);
  }

  /**
   * Create a new contact
   */
  static async createContact(data: CreateContactDto): Promise<Contact> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newContact: Contact = {
        id: `contact-${Date.now()}`,
        ...data,
        status: data.status || 'active',
        value: data.value || 0,
        roles: data.roles || [],
        createdAt: new Date().toISOString().split('T')[0],
        lastContactDate: new Date().toISOString().split('T')[0],
      };
      MOCK_CONTACTS.push(newContact);
      return newContact;
    }
    return this.request<Contact>('/crm/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing contact
   */
  static async updateContact(id: string, data: UpdateContactDto): Promise<Contact> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_CONTACTS.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Contact not found');

      MOCK_CONTACTS[index] = {
        ...MOCK_CONTACTS[index],
        ...data,
        lastContactDate: new Date().toISOString().split('T')[0],
      };
      return MOCK_CONTACTS[index];
    }
    return this.request<Contact>(`/crm/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a contact
   */
  static async deleteContact(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = MOCK_CONTACTS.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Contact not found');
      MOCK_CONTACTS.splice(index, 1);
      return;
    }
    await this.request<void>(`/crm/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get contact statistics
   */
  static async getStatistics(): Promise<{
    totalContacts: number;
    activeContacts: number;
    vipContacts: number;
    totalValue: number;
    contactsByStatus: Record<string, number>;
    contactsByCompany: Record<string, number>;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const contactsByStatus: Record<string, number> = {};
      const contactsByCompany: Record<string, number> = {};

      MOCK_CONTACTS.forEach((contact) => {
        contactsByStatus[contact.status] = (contactsByStatus[contact.status] || 0) + 1;
        contactsByCompany[contact.company] = (contactsByCompany[contact.company] || 0) + 1;
      });

      return {
        totalContacts: MOCK_CONTACTS.length,
        activeContacts: MOCK_CONTACTS.filter((c) => c.status === 'active').length,
        vipContacts: MOCK_CONTACTS.filter((c) => c.status === 'vip').length,
        totalValue: MOCK_CONTACTS.reduce((sum, c) => sum + c.value, 0),
        contactsByStatus,
        contactsByCompany,
      };
    }

    return this.request<{
      totalContacts: number;
      activeContacts: number;
      vipContacts: number;
      totalValue: number;
      contactsByStatus: Record<string, number>;
      contactsByCompany: Record<string, number>;
    }>('/crm/contacts/statistics');
  }
}

// Export singleton instance
export const contactService = ContactService;
