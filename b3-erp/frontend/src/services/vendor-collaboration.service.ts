import { apiClient } from './api/client';

// ==================== TypeScript Interfaces ====================

export type MessageType =
  | 'inquiry'
  | 'clarification'
  | 'quotation_update'
  | 'negotiation'
  | 'general'
  | 'document_request'
  | 'specification_change'
  | 'deadline_extension'
  | 'award_notification'
  | 'rejection_notification';

export type MessageStatus = 'draft' | 'sent' | 'delivered' | 'read' | 'replied' | 'archived';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface MessageAttachment {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface VendorMessage {
  id: string;
  companyId: string;
  rfqId: string;
  rfqNumber: string;
  quotationId?: string;
  vendorId: string;
  vendorName: string;
  vendorEmail?: string;
  vendorContactPerson?: string;
  messageType: MessageType;
  priority: MessagePriority;
  subject: string;
  message: string;
  status: MessageStatus;
  isOutbound: boolean;
  parentMessageId?: string;
  threadId?: string;
  attachments?: MessageAttachment[];
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  repliedAt?: string;
  requiresResponse: boolean;
  responseDeadline?: string;
  isResponded: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageDto {
  companyId: string;
  rfqId: string;
  rfqNumber: string;
  quotationId?: string;
  vendorId: string;
  vendorName: string;
  vendorEmail?: string;
  vendorContactPerson?: string;
  messageType: MessageType;
  priority?: MessagePriority;
  subject: string;
  message: string;
  isOutbound: boolean;
  attachments?: MessageAttachment[];
  requiresResponse?: boolean;
  responseDeadline?: string;
  createdBy: string;
  createdByName: string;
}

export interface MessageFilter {
  companyId: string;
  rfqId?: string;
  vendorId?: string;
  messageType?: MessageType;
  status?: MessageStatus;
  isOutbound?: boolean;
  requiresResponse?: boolean;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface MessageResponse {
  data: VendorMessage[];
  total: number;
  page: number;
  limit: number;
}

// ==================== Mock Data ====================

const MOCK_MESSAGES: VendorMessage[] = [
  {
    id: 'msg-001',
    companyId: 'company-001',
    rfqId: 'rfq-001',
    rfqNumber: 'RFQ-2025-0001',
    vendorId: 'vendor-001',
    vendorName: 'ABC Supplies Ltd',
    vendorEmail: 'sales@abcsupplies.com',
    vendorContactPerson: 'David Chen',
    messageType: 'inquiry',
    priority: 'normal',
    subject: 'Clarification on Item Specifications',
    message:
      'Dear Team,\n\nWe have reviewed RFQ-2025-0001 and would like to request clarification on the specifications for Item #3 - Industrial Printer. Could you please confirm the required print speed and whether duplex printing is mandatory?\n\nBest regards,\nDavid Chen',
    status: 'replied',
    isOutbound: false,
    requiresResponse: true,
    isResponded: true,
    createdBy: 'vendor-user-001',
    createdByName: 'David Chen',
    createdAt: '2025-02-02T10:00:00Z',
    updatedAt: '2025-02-02T14:00:00Z',
    sentAt: '2025-02-02T10:00:00Z',
    readAt: '2025-02-02T11:00:00Z',
    repliedAt: '2025-02-02T14:00:00Z',
  },
  {
    id: 'msg-002',
    companyId: 'company-001',
    rfqId: 'rfq-001',
    rfqNumber: 'RFQ-2025-0001',
    vendorId: 'vendor-001',
    vendorName: 'ABC Supplies Ltd',
    vendorEmail: 'sales@abcsupplies.com',
    messageType: 'clarification',
    priority: 'normal',
    subject: 'RE: Clarification on Item Specifications',
    message:
      'Dear David,\n\nThank you for your inquiry. For Item #3, the required print speed is minimum 30 pages per minute. Duplex printing is preferred but not mandatory.\n\nPlease let us know if you have any other questions.\n\nBest regards,\nProcurement Team',
    status: 'read',
    isOutbound: true,
    parentMessageId: 'msg-001',
    threadId: 'msg-001',
    requiresResponse: false,
    isResponded: false,
    createdBy: 'user-001',
    createdByName: 'John Smith',
    createdAt: '2025-02-02T14:00:00Z',
    updatedAt: '2025-02-02T15:00:00Z',
    sentAt: '2025-02-02T14:00:00Z',
    readAt: '2025-02-02T15:00:00Z',
  },
  {
    id: 'msg-003',
    companyId: 'company-001',
    rfqId: 'rfq-001',
    rfqNumber: 'RFQ-2025-0001',
    vendorId: 'vendor-002',
    vendorName: 'XYZ Trading Co',
    vendorEmail: 'procurement@xyztrading.com',
    vendorContactPerson: 'Emily Wong',
    messageType: 'deadline_extension',
    priority: 'high',
    subject: 'Request for Deadline Extension',
    message:
      'Dear Procurement Team,\n\nDue to ongoing supply chain challenges, we kindly request a 3-day extension for submitting our quotation for RFQ-2025-0001.\n\nWe appreciate your understanding.\n\nBest regards,\nEmily Wong',
    status: 'sent',
    isOutbound: false,
    requiresResponse: true,
    isResponded: false,
    responseDeadline: '2025-02-05T17:00:00Z',
    createdBy: 'vendor-user-002',
    createdByName: 'Emily Wong',
    createdAt: '2025-02-03T09:00:00Z',
    updatedAt: '2025-02-03T09:00:00Z',
    sentAt: '2025-02-03T09:00:00Z',
  },
  {
    id: 'msg-004',
    companyId: 'company-001',
    rfqId: 'rfq-002',
    rfqNumber: 'RFQ-2025-0002',
    vendorId: 'vendor-003',
    vendorName: 'Global Parts Inc',
    vendorEmail: 'sales@globalparts.com',
    messageType: 'award_notification',
    priority: 'high',
    subject: 'RFQ Award Notification - RFQ-2025-0002',
    message:
      'Dear Global Parts Inc,\n\nWe are pleased to inform you that your quotation for RFQ-2025-0002 has been selected. Please find the award details attached.\n\nOur team will contact you shortly to finalize the purchase order.\n\nBest regards,\nProcurement Team',
    status: 'delivered',
    isOutbound: true,
    requiresResponse: false,
    isResponded: false,
    attachments: [
      {
        fileName: 'Award_Letter_RFQ-2025-0002.pdf',
        fileUrl: '/attachments/award_letter_rfq_2025_0002.pdf',
        fileSize: 125000,
        fileType: 'application/pdf',
        uploadedAt: '2025-02-06T10:00:00Z',
      },
    ],
    createdBy: 'user-003',
    createdByName: 'Michael Brown',
    createdAt: '2025-02-06T10:00:00Z',
    updatedAt: '2025-02-06T10:30:00Z',
    sentAt: '2025-02-06T10:00:00Z',
    deliveredAt: '2025-02-06T10:30:00Z',
  },
];

// ==================== Service Class ====================

class VendorCollaborationService {
  private baseUrl = '/procurement/vendor-collaboration';

  async createMessage(dto: CreateMessageDto): Promise<VendorMessage> {
    try {
      const response = await apiClient.post<VendorMessage>(`${this.baseUrl}/messages`, dto);
      return response.data;
    } catch (error) {
      console.error('API Error creating message, using mock:', error);

      const newMessage: VendorMessage = {
        id: `msg-${Date.now()}`,
        ...dto,
        priority: dto.priority || 'normal',
        status: 'draft',
        requiresResponse: dto.requiresResponse || false,
        isResponded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      MOCK_MESSAGES.push(newMessage);
      return newMessage;
    }
  }

  async getMessages(filter: MessageFilter): Promise<MessageResponse> {
    try {
      const params = new URLSearchParams();
      params.append('companyId', filter.companyId);
      if (filter.rfqId) params.append('rfqId', filter.rfqId);
      if (filter.vendorId) params.append('vendorId', filter.vendorId);
      if (filter.messageType) params.append('messageType', filter.messageType);
      if (filter.status) params.append('status', filter.status);
      if (filter.isOutbound !== undefined) params.append('isOutbound', String(filter.isOutbound));
      if (filter.requiresResponse !== undefined)
        params.append('requiresResponse', String(filter.requiresResponse));
      if (filter.fromDate) params.append('fromDate', filter.fromDate);
      if (filter.toDate) params.append('toDate', filter.toDate);
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());

      const response = await apiClient.get<MessageResponse>(
        `${this.baseUrl}/messages?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching messages, using mock data:', error);

      let filteredMessages = [...MOCK_MESSAGES];

      if (filter.rfqId) {
        filteredMessages = filteredMessages.filter((m) => m.rfqId === filter.rfqId);
      }
      if (filter.vendorId) {
        filteredMessages = filteredMessages.filter((m) => m.vendorId === filter.vendorId);
      }
      if (filter.messageType) {
        filteredMessages = filteredMessages.filter((m) => m.messageType === filter.messageType);
      }
      if (filter.status) {
        filteredMessages = filteredMessages.filter((m) => m.status === filter.status);
      }
      if (filter.isOutbound !== undefined) {
        filteredMessages = filteredMessages.filter((m) => m.isOutbound === filter.isOutbound);
      }
      if (filter.requiresResponse !== undefined) {
        filteredMessages = filteredMessages.filter(
          (m) => m.requiresResponse === filter.requiresResponse
        );
      }

      return {
        data: filteredMessages,
        total: filteredMessages.length,
        page: filter.page || 1,
        limit: filter.limit || 50,
      };
    }
  }

  async getMessageById(id: string): Promise<VendorMessage> {
    try {
      const response = await apiClient.get<VendorMessage>(`${this.baseUrl}/messages/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching message, using mock data:', error);
      const message = MOCK_MESSAGES.find((m) => m.id === id);
      if (!message) throw new Error('Message not found');
      return message;
    }
  }

  async sendMessage(id: string): Promise<VendorMessage> {
    try {
      const response = await apiClient.post<VendorMessage>(`${this.baseUrl}/messages/${id}/send`, {});
      return response.data;
    } catch (error) {
      console.error('API Error sending message, using mock:', error);
      const index = MOCK_MESSAGES.findIndex((m) => m.id === id);
      if (index === -1) throw new Error('Message not found');

      MOCK_MESSAGES[index] = {
        ...MOCK_MESSAGES[index],
        status: 'sent',
        sentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return MOCK_MESSAGES[index];
    }
  }

  async markAsRead(id: string): Promise<VendorMessage> {
    try {
      const response = await apiClient.post<VendorMessage>(`${this.baseUrl}/messages/${id}/read`, {});
      return response.data;
    } catch (error) {
      console.error('API Error marking message as read, using mock:', error);
      const index = MOCK_MESSAGES.findIndex((m) => m.id === id);
      if (index === -1) throw new Error('Message not found');

      MOCK_MESSAGES[index] = {
        ...MOCK_MESSAGES[index],
        status: 'read',
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return MOCK_MESSAGES[index];
    }
  }

  async replyToMessage(
    parentMessageId: string,
    dto: {
      companyId: string;
      messageType: MessageType;
      priority?: MessagePriority;
      subject: string;
      message: string;
      isOutbound: boolean;
      attachments?: MessageAttachment[];
      requiresResponse?: boolean;
      responseDeadline?: string;
      createdBy: string;
      createdByName: string;
    }
  ): Promise<VendorMessage> {
    try {
      const response = await apiClient.post<VendorMessage>(
        `${this.baseUrl}/messages/${parentMessageId}/reply`,
        dto
      );
      return response.data;
    } catch (error) {
      console.error('API Error replying to message, using mock:', error);
      const parentMessage = MOCK_MESSAGES.find((m) => m.id === parentMessageId);
      if (!parentMessage) throw new Error('Parent message not found');

      const reply: VendorMessage = {
        id: `msg-${Date.now()}`,
        companyId: dto.companyId,
        rfqId: parentMessage.rfqId,
        rfqNumber: parentMessage.rfqNumber,
        vendorId: parentMessage.vendorId,
        vendorName: parentMessage.vendorName,
        vendorEmail: parentMessage.vendorEmail,
        messageType: dto.messageType,
        priority: dto.priority || 'normal',
        subject: dto.subject,
        message: dto.message,
        status: 'draft',
        isOutbound: dto.isOutbound,
        parentMessageId,
        threadId: parentMessage.threadId || parentMessage.id,
        attachments: dto.attachments,
        requiresResponse: dto.requiresResponse || false,
        responseDeadline: dto.responseDeadline,
        isResponded: false,
        createdBy: dto.createdBy,
        createdByName: dto.createdByName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      MOCK_MESSAGES.push(reply);
      return reply;
    }
  }

  async getThread(threadId: string): Promise<VendorMessage[]> {
    try {
      const response = await apiClient.get<VendorMessage[]>(`${this.baseUrl}/thread/${threadId}`);
      return response.data;
    } catch (error) {
      console.error('API Error fetching thread, using mock data:', error);
      return MOCK_MESSAGES.filter((m) => m.threadId === threadId || m.id === threadId).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
  }

  async getRfqMessages(rfqId: string): Promise<VendorMessage[]> {
    try {
      const response = await apiClient.get<VendorMessage[]>(
        `${this.baseUrl}/rfq/${rfqId}/messages`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching RFQ messages, using mock data:', error);
      return MOCK_MESSAGES.filter((m) => m.rfqId === rfqId).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  async getPendingResponses(companyId: string): Promise<VendorMessage[]> {
    try {
      const response = await apiClient.get<VendorMessage[]>(
        `${this.baseUrl}/pending-responses?companyId=${companyId}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error fetching pending responses, using mock data:', error);
      return MOCK_MESSAGES.filter((m) => m.requiresResponse && !m.isResponded);
    }
  }

  async getUnreadCount(companyId: string, isOutbound: boolean): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>(
        `${this.baseUrl}/unread-count?companyId=${companyId}&isOutbound=${isOutbound}`
      );
      return response.data.count;
    } catch (error) {
      console.error('API Error fetching unread count, using mock data:', error);
      return MOCK_MESSAGES.filter((m) => m.isOutbound === isOutbound && m.status === 'sent').length;
    }
  }

  async archiveMessage(id: string): Promise<VendorMessage> {
    try {
      const response = await apiClient.post<VendorMessage>(
        `${this.baseUrl}/messages/${id}/archive`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error('API Error archiving message, using mock:', error);
      const index = MOCK_MESSAGES.findIndex((m) => m.id === id);
      if (index === -1) throw new Error('Message not found');

      MOCK_MESSAGES[index] = {
        ...MOCK_MESSAGES[index],
        status: 'archived',
        updatedAt: new Date().toISOString(),
      };
      return MOCK_MESSAGES[index];
    }
  }

  async deleteMessage(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/messages/${id}`);
    } catch (error) {
      console.error('API Error deleting message, using mock:', error);
      const index = MOCK_MESSAGES.findIndex((m) => m.id === id);
      if (index === -1) throw new Error('Message not found');
      if (MOCK_MESSAGES[index].status !== 'draft') {
        throw new Error('Only draft messages can be deleted');
      }
      MOCK_MESSAGES.splice(index, 1);
    }
  }
}

export const vendorCollaborationService = new VendorCollaborationService();
