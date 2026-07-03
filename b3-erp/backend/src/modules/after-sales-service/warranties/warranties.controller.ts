import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { WarrantiesService } from './warranties.service';
import { CreateWarrantyDto } from '../dto/create-warranty.dto';
import { UpdateWarrantyDto } from '../dto/update-warranty.dto';
import { CreateWarrantyClaimDto } from '../dto/create-warranty-claim.dto';

@Controller('after-sales/warranties')
export class WarrantiesController {
  constructor(private readonly warrantiesService: WarrantiesService) {}

  @Post()
  create(@Body() createWarrantyDto: CreateWarrantyDto) {
    return this.warrantiesService.create(createWarrantyDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('warrantyType') warrantyType?: string,
  ) {
    return this.warrantiesService.findAll({ status, customerId, warrantyType });
  }

  @Get('expiring')
  getExpiringWarranties(@Query('days') days: string = '30') {
    return this.warrantiesService.getExpiringWarranties(parseInt(days));
  }

  @Get('statistics')
  getStatistics() {
    return this.warrantiesService.getStatistics();
  }

  @Get('claims')
  findAllClaims(
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('warrantyId') warrantyId?: string,
  ) {
    return this.warrantiesService.findAllClaims({
      status,
      customerId,
      warrantyId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warrantiesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWarrantyDto: UpdateWarrantyDto,
  ) {
    return this.warrantiesService.update(id, updateWarrantyDto);
  }

  @Post(':id/claim')
  createClaim(
    @Param('id') id: string,
    @Body() createWarrantyClaimDto: CreateWarrantyClaimDto,
  ) {
    return this.warrantiesService.createClaim(id, createWarrantyClaimDto);
  }

  @Post(':id/extend')
  extendWarranty(
    @Param('id') id: string,
    @Body()
    extensionData: {
      durationMonths: number;
      extensionValue: number;
      updatedBy: string;
    },
  ) {
    return this.warrantiesService.extendWarranty(
      id,
      extensionData.durationMonths,
      extensionData.extensionValue,
      extensionData.updatedBy,
    );
  }

  @Post(':id/transfer')
  transferWarranty(
    @Param('id') id: string,
    @Body()
    transferData: {
      newCustomerId: string;
      newCustomerName: string;
      transferReason: string;
      transferredBy: string;
    },
  ) {
    return this.warrantiesService.transferWarranty(
      id,
      transferData.newCustomerId,
      transferData.newCustomerName,
      transferData.transferReason,
      transferData.transferredBy,
    );
  }

  @Post(':id/void')
  voidWarranty(
    @Param('id') id: string,
    @Body() body: { reason: string; updatedBy: string },
  ) {
    return this.warrantiesService.voidWarranty(id, body.reason, body.updatedBy);
  }

  @Get('claims/:claimId')
  findClaim(@Param('claimId') claimId: string) {
    return this.warrantiesService.findClaim(claimId);
  }

  @Patch('claims/:claimId/approve')
  approveClaim(
    @Param('claimId') claimId: string,
    @Body() body: { approvedBy: string; approvalNotes?: string },
  ) {
    return this.warrantiesService.approveClaim(
      claimId,
      body.approvedBy,
      body.approvalNotes,
    );
  }

  @Patch('claims/:claimId/reject')
  rejectClaim(
    @Param('claimId') claimId: string,
    @Body() body: { rejectedBy: string; rejectionReason: string },
  ) {
    return this.warrantiesService.rejectClaim(
      claimId,
      body.rejectedBy,
      body.rejectionReason,
    );
  }

  @Patch('claims/:claimId/close')
  closeClaim(
    @Param('claimId') claimId: string,
    @Body()
    body: {
      resolution: string;
      closedBy: string;
      actualCost?: number;
      partsReplaced?: string[];
    },
  ) {
    return this.warrantiesService.closeClaim(
      claimId,
      body.resolution,
      body.closedBy,
      body.actualCost,
      body.partsReplaced,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warrantiesService.remove(id);
  }
}
