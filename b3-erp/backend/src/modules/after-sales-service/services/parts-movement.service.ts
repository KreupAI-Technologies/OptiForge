import { Injectable } from '@nestjs/common';

/**
 * In-memory-seeded parts-movement service backing the after-sales parts
 * pages (requisition, consumption, returns). Persistence contract lives in
 * the additive `as_parts_movement` table (see orphan_after_sales.sql and
 * entities/parts-movement.entity.ts).
 */
@Injectable()
export class PartsMovementService {
  private requisitions: any[] = [
    {
      id: 'REQ-001',
      requisitionNumber: 'PR-2026-0101',
      requestDate: '2026-06-28',
      requiredDate: '2026-07-05',
      requestedBy: 'Rajesh Kumar',
      department: 'Field Service',
      serviceRequestId: 'SR-2026-0045',
      customerId: 'CUST-001',
      customerName: 'Sharma Kitchens Pvt Ltd',
      priority: 'high',
      status: 'submitted',
      totalItems: 3,
      totalValue: 24500,
      estimatedCost: 24500,
      actualCost: 0,
      supplier: 'CoolTech Spares',
      expectedDelivery: '2026-07-04',
      deliveryLocation: 'Bangalore Service Hub',
      justification: 'Compressor replacement for emergency repair',
      internalNotes: 'Expedite - customer under SLA',
      items: [
        {
          id: 'RI-1',
          partNumber: 'CMP-4500',
          partName: 'Refrigeration Compressor 4.5T',
          category: 'Refrigeration',
          manufacturer: 'CoolTech',
          requestedQuantity: 1,
          approvedQuantity: 0,
          receivedQuantity: 0,
          unitCost: 18000,
          totalCost: 18000,
          currentStock: 0,
          urgencyLevel: 'critical',
          alternativeAccepted: false,
          supplierPartNumber: 'CT-CMP-4500',
          status: 'pending',
          notes: '',
        },
      ],
      attachments: [],
    },
    {
      id: 'REQ-002',
      requisitionNumber: 'PR-2026-0102',
      requestDate: '2026-06-25',
      requiredDate: '2026-07-02',
      requestedBy: 'Priya Singh',
      department: 'Installation',
      customerName: 'City Cafe Express',
      priority: 'medium',
      status: 'approved',
      approvedBy: 'Operations Manager',
      approvalDate: '2026-06-26',
      totalItems: 2,
      totalValue: 8600,
      estimatedCost: 8600,
      actualCost: 8600,
      deliveryLocation: 'Bangalore Warehouse',
      justification: 'Installation kit for new kitchen line',
      internalNotes: '',
      items: [],
      attachments: [],
    },
  ];

  private consumptions: any[] = [
    {
      id: 'CON-001',
      consumptionId: 'PC-2026-0201',
      consumptionDate: '2026-06-29',
      consumedBy: 'Rajesh Kumar',
      technicianId: 'TECH-001',
      department: 'Field Service',
      serviceRequestId: 'SR-2026-0045',
      customerName: 'Sharma Kitchens Pvt Ltd',
      jobType: 'repair',
      location: 'Customer Site - Koramangala',
      workOrderNumber: 'WO-2026-0045',
      totalItems: 2,
      totalValue: 6200,
      consumptionType: 'emergency',
      approvalStatus: 'auto_approved',
      items: [
        {
          id: 'CI-1',
          partNumber: 'THR-220',
          partName: 'Thermostat 220V',
          category: 'Electrical',
          manufacturer: 'ThermoMax',
          quantityConsumed: 1,
          unitCost: 3200,
          totalCost: 3200,
          stockBefore: 12,
          stockAfter: 11,
          reason: 'defective',
          replacementType: 'identical',
          warranty: false,
          notes: '',
        },
      ],
      laborHours: 2.5,
      completionStatus: 'completed',
      customerSatisfaction: 5,
      costCenter: 'CC-FS-BLR',
      billable: true,
      notes: 'Emergency repair completed within SLA',
      attachments: [],
    },
  ];

  private returns: any[] = [
    {
      id: 'RET-001',
      returnId: 'PRT-2026-0301',
      returnDate: '2026-06-27',
      returnedBy: 'Amit Patel',
      technicianId: 'TECH-002',
      department: 'Field Service',
      customerName: 'Prestige Developers',
      returnReason: 'unused',
      returnType: 'full_return',
      location: 'Bangalore Service Hub',
      originalRequisitionId: 'PR-2026-0099',
      totalItems: 1,
      totalValue: 4500,
      refundAmount: 4275,
      creditNoteIssued: false,
      status: 'inspected',
      inspectedBy: 'Store Keeper',
      inspectionDate: '2026-06-28',
      qualityStatus: 'passed',
      items: [
        {
          id: 'RTI-1',
          partNumber: 'FLT-300',
          partName: 'Water Filter Cartridge',
          category: 'Filtration',
          manufacturer: 'AquaPure',
          quantityReturned: 1,
          quantityAccepted: 1,
          quantityRejected: 0,
          unitCost: 4500,
          totalCost: 4500,
          returnReason: 'unused',
          condition: 'new',
          restockable: true,
          inspectionNotes: 'Sealed, restockable',
          action: 'restock',
        },
      ],
      restockingFee: 225,
      restockingFeePercent: 5,
      notes: '',
      attachments: [],
    },
  ];

  getRequisitions(): any[] {
    return this.requisitions;
  }

  getConsumptions(): any[] {
    return this.consumptions;
  }

  getReturns(): any[] {
    return this.returns;
  }
}
