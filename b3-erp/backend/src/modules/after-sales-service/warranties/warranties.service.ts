import { Injectable } from '@nestjs/common';
import { CreateWarrantyDto } from '../dto/create-warranty.dto';
import { UpdateWarrantyDto } from '../dto/update-warranty.dto';
import { CreateWarrantyClaimDto } from '../dto/create-warranty-claim.dto';
import {
  Warranty,
  WarrantyClaim,
  WarrantyStatus,
  WarrantyClaimStatus as ClaimStatus,
} from '../entities/warranty.entity';

@Injectable()
export class WarrantiesService {
  private warranties: Warranty[] = [];
  private claims: WarrantyClaim[] = [];
  private warrantyIdCounter = 1;
  private claimIdCounter = 1;

  constructor() {
    this.seedClaims();
  }

  private seedClaims(): void {
    if (this.claims.length > 0) return;
    const now = new Date();
    const seed: Array<Partial<WarrantyClaim>> = [
      {
        warrantyId: 'WARRANTY-000001',
        equipmentId: 'MK-SS304-2025-001',
        faultDescription:
          'Gas burner ignition system failure - requires control valve replacement',
        faultCategory: 'Component Failure',
        customerId: 'CUST001',
        customerName: 'Sharma Modular Kitchens Pvt Ltd',
        contactPhone: '+91-98765-43210',
        claimReason: 'Manufacturing defect in control valve',
        actionRequired: 'Replace control valve',
        status: ClaimStatus.SUBMITTED,
        eligibilityStatus: 'eligible',
        partsCost: 8000,
        laborCost: 4500,
        totalCost: 12500,
        createdBy: 'system',
      },
      {
        warrantyId: 'WARRANTY-000002',
        equipmentId: 'HB-4B-2024-234',
        faultDescription: 'Gas leak from main supply line connection',
        faultCategory: 'Safety Issue',
        customerId: 'CUST002',
        customerName: 'Prestige Developers Bangalore',
        contactPhone: '+91-98765-54321',
        claimReason: 'Installation-related safety hazard',
        actionRequired: 'Investigate and reseal supply line',
        status: ClaimStatus.UNDER_REVIEW,
        eligibilityStatus: 'partial',
        partsCost: 15000,
        laborCost: 7000,
        totalCost: 22000,
        createdBy: 'system',
      },
      {
        warrantyId: 'WARRANTY-000003',
        equipmentId: 'DW-14PS-2023-890',
        faultDescription: 'Water pump motor failure causing drainage issues',
        faultCategory: 'Motor Failure',
        customerId: 'CUST005',
        customerName: 'DLF Universal Projects',
        contactPhone: '+91-98765-11111',
        claimReason: 'Normal wear motor failure under warranty',
        actionRequired: 'Replace water pump motor',
        status: ClaimStatus.APPROVED,
        eligibilityStatus: 'eligible',
        approvedBy: 'Rohit Sharma',
        approvalDate: now,
        partsCost: 12000,
        laborCost: 4500,
        totalCost: 16500,
        createdBy: 'system',
      },
    ];

    for (const s of seed) {
      const defaults: Partial<WarrantyClaim> = {
        faultDate: now,
        claimDate: now,
        eligibilityChecked: true,
        approvalRequired: true,
        customerCharge: 0,
        companyBearing: 0,
        oemClaim: false,
        createdAt: now,
        updatedAt: now,
      };
      const claim = {
        ...defaults,
        ...s,
        id: `CLAIM-${String(this.claimIdCounter++).padStart(6, '0')}`,
        claimNumber: `WCL-${now.getFullYear()}-${String(this.claimIdCounter).padStart(5, '0')}`,
      } as WarrantyClaim;
      this.claims.push(claim);
    }
  }

  findAllClaims(filters?: {
    status?: string;
    customerId?: string;
    warrantyId?: string;
  }): WarrantyClaim[] {
    let result = [...this.claims];
    if (filters?.status) {
      result = result.filter((c) => c.status === filters.status);
    }
    if (filters?.customerId) {
      result = result.filter((c) => c.customerId === filters.customerId);
    }
    if (filters?.warrantyId) {
      result = result.filter((c) => c.warrantyId === filters.warrantyId);
    }
    return result;
  }

  create(createWarrantyDto: CreateWarrantyDto): Warranty {
    const warranty: Warranty = {
      id: `WARRANTY-${String(this.warrantyIdCounter++).padStart(6, '0')}`,
      warrantyNumber: `WRN-${new Date().getFullYear()}-${String(this.warrantyIdCounter).padStart(5, '0')}`,
      status: WarrantyStatus.ACTIVE,
      ...createWarrantyDto,
      totalClaims: 0,
      totalClaimCost: 0,
      // remainingCoverage: 100, // Not in entity
      // transferHistory: [], // Not in entity
      extensionOfferSent: false,
      approvedClaims: 0,
      rejectedClaims: 0,
      expiryAlertDays: [90, 60, 30],
      termsAndConditions: 'Standard warranty terms apply.',
      manufacturerWarranty: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.warranties.push(warranty);
    return warranty;
  }

  findAll(filters?: {
    status?: string;
    customerId?: string;
    warrantyType?: string;
  }): Warranty[] {
    let filtered = [...this.warranties];

    if (filters?.status) {
      filtered = filtered.filter((w) => w.status === filters.status);
    }
    if (filters?.customerId) {
      filtered = filtered.filter((w) => w.customerId === filters.customerId);
    }
    if (filters?.warrantyType) {
      filtered = filtered.filter(
        (w) => w.warrantyType === filters.warrantyType,
      );
    }

    return filtered;
  }

  findOne(id: string): Warranty | null {
    return this.warranties.find((w) => w.id === id) || null;
  }

  update(
    id: string,
    updateWarrantyDto: UpdateWarrantyDto,
  ): Warranty | null {
    const index = this.warranties.findIndex((w) => w.id === id);
    if (index === -1) return null;

    this.warranties[index] = {
      ...this.warranties[index],
      ...updateWarrantyDto,
      status: updateWarrantyDto.status as WarrantyStatus || this.warranties[index].status,
      updatedAt: new Date(),
    };

    return this.warranties[index];
  }

  extendWarranty(
    id: string,
    durationMonths: number,
    extensionValue: number,
    updatedBy: string,
  ): Warranty | null {
    const warranty = this.findOne(id);
    if (!warranty) return null;

    // Calculate new end date
    const newEndDate = new Date(warranty.endDate);
    newEndDate.setMonth(newEndDate.getMonth() + durationMonths);

    // Create extended warranty
    const extendedWarranty: Warranty = {
      ...warranty,
      id: `WARRANTY-${String(this.warrantyIdCounter++).padStart(6, '0')}`,
      warrantyNumber: `WRN-${new Date().getFullYear()}-${String(this.warrantyIdCounter).padStart(5, '0')}`,
      status: WarrantyStatus.ACTIVE,
      endDate: newEndDate,
      durationMonths: warranty.durationMonths + durationMonths,
      isExtended: true,
      baseWarrantyId: warranty.isExtended ? warranty.baseWarrantyId : id,
      extendedCost: extensionValue,
      // remainingCoverage: 100, // Not in entity
      updatedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mark original warranty as extended
    // warranty.status = WarrantyStatus.EXTENDED; // EXTENDED not in enum, keeping ACTIVE or adding to enum if needed. Assuming ACTIVE for now as it is extended.
    // actually let's check if EXTENDED is in enum. It is NOT in the file I viewed.
    // But wait, WarrantyType has EXTENDED. WarrantyStatus has ACTIVE, EXPIRED, CLAIMED, TRANSFERRED, CANCELLED.
    // I will use ACTIVE for now.
    warranty.status = WarrantyStatus.ACTIVE;
    warranty.updatedBy = updatedBy;
    warranty.updatedAt = new Date();

    this.warranties.push(extendedWarranty);
    return extendedWarranty;
  }

  transferWarranty(
    id: string,
    newCustomerId: string,
    newCustomerName: string,
    transferReason: string,
    transferredBy: string,
  ): Warranty | null {
    const warranty = this.findOne(id);
    if (!warranty) return null;

    // Record transfer history - Entity only supports current transfer details
    // const transferRecord = { ... };
    // warranty.transferHistory = warranty.transferHistory || [];
    // warranty.transferHistory.push(transferRecord);

    // Update customer details
    warranty.transferredFrom = warranty.customerId;
    warranty.transferredTo = newCustomerId;
    warranty.transferDate = new Date();
    warranty.transferReason = transferReason;

    warranty.customerId = newCustomerId;
    warranty.customerName = newCustomerName;
    warranty.updatedBy = transferredBy;
    warranty.updatedAt = new Date();

    return warranty;
  }

  voidWarranty(
    id: string,
    reason: string,
    updatedBy: string,
  ): Warranty | null {
    const warranty = this.findOne(id);
    if (!warranty) return null;

    warranty.status = WarrantyStatus.CANCELLED;
    // warranty.voidDate = new Date(); // Not in entity
    // warranty.voidReason = reason; // Not in entity
    // We can use cancellation fields if they existed, or just update status and notes
    // warranty.internalNotes = reason; // internalNotes not in entity either?
    // Let's just update status and updatedBy
    warranty.updatedBy = updatedBy;
    warranty.updatedAt = new Date();

    return warranty;
  }

  getExpiringWarranties(days: number): Warranty[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.warranties.filter((warranty) => {
      return (
        warranty.status === WarrantyStatus.ACTIVE &&
        warranty.endDate >= now &&
        warranty.endDate <= futureDate
      );
    });
  }

  createClaim(
    warrantyId: string,
    createWarrantyClaimDto: CreateWarrantyClaimDto,
  ): WarrantyClaim | null {
    const warranty = this.findOne(warrantyId);
    if (!warranty) return null;

    if (warranty.status !== WarrantyStatus.ACTIVE) {
      throw new Error('Can only create claims for active warranties');
    }

    const claim: WarrantyClaim = {
      ...createWarrantyClaimDto,
      id: `CLAIM-${String(this.claimIdCounter++).padStart(6, '0')}`,
      claimNumber: `WCL-${new Date().getFullYear()}-${String(this.claimIdCounter).padStart(5, '0')}`,
      warrantyId,
      // warrantyNumber: warranty.warrantyNumber, // Not in entity
      status: ClaimStatus.SUBMITTED,
      // evaluationDate: undefined, // Not in entity
      approvalDate: undefined,
      // rejectionDate: null, // Not in entity
      // completionDate: null, // Not in entity
      createdAt: new Date(),
      updatedAt: new Date(),
      eligibilityChecked: false,
      eligibilityStatus: 'pending',
      approvalRequired: true,
      laborCost: 0,
      partsCost: 0,
      totalCost: 0,
      customerCharge: 0,
      companyBearing: 0,
      oemClaim: false,
    };

    this.claims.push(claim);

    // Update warranty claim count
    warranty.totalClaims += 1;
    // warranty.lastClaimDate = new Date(); // Not in entity
    warranty.updatedAt = new Date();

    return claim;
  }

  findClaim(claimId: string): WarrantyClaim | null {
    return this.claims.find((c) => c.id === claimId) || null;
  }

  approveClaim(
    claimId: string,
    approvedBy: string,
    approvalNotes?: string,
  ): WarrantyClaim | null {
    const claim = this.findClaim(claimId);
    if (!claim) return null;

    claim.status = ClaimStatus.APPROVED;
    claim.approvalDate = new Date();
    claim.approvedBy = approvedBy;
    claim.approvalNotes = approvalNotes;
    claim.updatedAt = new Date();

    return claim;
  }

  rejectClaim(
    claimId: string,
    rejectedBy: string,
    rejectionReason: string,
  ): WarrantyClaim | null {
    const claim = this.findClaim(claimId);
    if (!claim) return null;

    claim.status = ClaimStatus.REJECTED;
    // claim.rejectionDate = new Date(); // Not in entity
    // claim.rejectedBy = rejectedBy; // Not in entity
    claim.rejectionReason = rejectionReason;
    claim.reviewedBy = rejectedBy; // Use reviewedBy instead
    claim.updatedAt = new Date();

    return claim;
  }

  closeClaim(
    claimId: string,
    resolution: string,
    closedBy: string,
    actualCost?: number,
    partsReplaced?: string[],
  ): WarrantyClaim | null {
    const claim = this.findClaim(claimId);
    if (!claim) return null;

    claim.status = ClaimStatus.CLOSED;
    claim.resolutionDate = new Date();
    claim.resolutionNotes = resolution;
    claim.totalCost = actualCost ?? claim.totalCost;
    // claim.partsReplaced = partsReplaced; // Type mismatch. Service receives string[], entity expects object[].
    // We need to map string[] to object[] or change service signature.
    // For now, let's assume partsReplaced in service is just names and map to basic objects.
    if (partsReplaced) {
      claim.partsReplaced = partsReplaced.map(name => ({ partId: 'unknown', partName: name, quantity: 1, cost: 0 }));
    }
    claim.updatedAt = new Date();

    // Update warranty total claim value
    const warranty = this.findOne(claim.warrantyId);
    if (warranty && actualCost) {
      warranty.totalClaimCost += actualCost;
      warranty.updatedAt = new Date();
    }

    return claim;
  }

  getStatistics() {
    const total = this.warranties.length;
    const active = this.warranties.filter(
      (w) => w.status === WarrantyStatus.ACTIVE,
    ).length;
    const expiring30Days = this.getExpiringWarranties(30).length;
    const totalClaims = this.claims.length;
    const pendingClaims = this.claims.filter(
      (c) => c.status === ClaimStatus.SUBMITTED,
    ).length;
    const approvedClaims = this.claims.filter(
      (c) => c.status === ClaimStatus.APPROVED,
    ).length;

    return {
      totalWarranties: total,
      activeWarranties: active,
      expiringIn30Days: expiring30Days,
      totalClaims,
      pendingClaims,
      approvedClaims,
      claimApprovalRate:
        totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0,
      averageClaimsPerWarranty: total > 0 ? totalClaims / total : 0,
    };
  }

  remove(id: string): { message: string } {
    const index = this.warranties.findIndex((w) => w.id === id);
    if (index === -1) {
      return { message: 'Warranty not found' };
    }

    this.warranties.splice(index, 1);
    return { message: 'Warranty deleted successfully' };
  }
}
