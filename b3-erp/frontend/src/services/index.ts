/**
 * Services Index
 * Barrel export file for all services in ManufacturingOS
 */

// =============================================================================
// HR Services
// =============================================================================
export * from './employee.service';
export * from './skill.service';
export * from './onboarding.service';
export * from './offboarding.service';
export * from './asset-management.service';
export * from './document-management.service';
// Both onboarding.service and document-management.service export a `DocumentStatus`
// enum. Re-export the document-management variant explicitly to resolve the
// star-export ambiguity (an explicit export overrides ambiguous star exports).
export { DocumentStatus } from './document-management.service';

// =============================================================================
// Finance Services
// =============================================================================
export * from './finance.service';

// =============================================================================
// Sales Services
// =============================================================================
export * from './rfp.service';

// =============================================================================
// CRM Services
// =============================================================================
export * from './interactions.service';

// =============================================================================
// Inventory Services
// =============================================================================
export * from './InventoryService';

// =============================================================================
// Procurement Services
// =============================================================================
export * from './VendorService';

// =============================================================================
// Workflow Services
// =============================================================================
export * from './ApprovalService';

// =============================================================================
// Project Management Services
// =============================================================================
export {
  type Project,
  type ProjectTask,
  type ProjectResource,
  type ProjectBudget,
  type ProjectMilestone,
  type TimeLog,
  // TAClaim and EmergencySpareRequest are exported from api module
  type FieldScheduleItem,
  type Measurement,
  type RoomMeasurements,
  type Discrepancy,
  type BOQItem,
  type Drawing,
  projectManagementService
} from './ProjectManagementService';

// =============================================================================
// Quality Services
// =============================================================================
export * from './inspection.service';
export * from './ncr.service';
export {
  CAPAStatus,
  CAPAType,
  CAPAPriority,
  CAPASource,
  ActionStatus,
  type CAPA,
  type CAPAAction,
  type CAPAAttachment,
  type CAPAApproval,
  type EffectivenessReview,
  type CreateCAPADto,
  type UpdateCAPADto,
  type CAPAFilters,
  CAPAService,
  capaService
} from './capa.service';

// =============================================================================
// IT Admin Services
// =============================================================================
export * from './permission.service';
export * from './system-config.service';
export * from './notification.service';

// =============================================================================
// Core Services
// =============================================================================
export * from './customer.service';

// =============================================================================
// After-Sales Services
// =============================================================================
export * from './asset.service';

// =============================================================================
// Production - Sustainability Services
// =============================================================================
export * from './sustainability.service';

// =============================================================================
// Production - Resilience Services
// =============================================================================
export * from './resilience.service';

// =============================================================================
// Production - Collaboration Services
// =============================================================================
export * from './collaboration.service';

// =============================================================================
// API Services
// =============================================================================
export * from './api';
