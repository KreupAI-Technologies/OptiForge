import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContractService } from '../services/contract.service';
import { VendorContract, ContractStatus, ContractType } from '../entities/vendor-contract.entity';

@ApiTags('Procurement - Vendor Contracts')
@Controller('procurement/contracts')
export class VendorContractController {
    constructor(private readonly contractService: ContractService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new vendor contract' })
    async create(@Body() createDto: Partial<VendorContract>): Promise<VendorContract> {
        return this.contractService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all vendor contracts' })
    async findAll(@Query() filters?: {
        status?: ContractStatus;
        vendorId?: string;
        contractType?: ContractType;
        expiringWithinDays?: number;
    }): Promise<VendorContract[]> {
        return this.contractService.findAll(filters);
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Get contract statistics' })
    async getStatistics(): Promise<any> {
        return this.contractService.getContractStatistics();
    }

    @Get('expiring')
    @ApiOperation({ summary: 'Get expiring contracts' })
    async getExpiring(@Query('days') days?: number): Promise<VendorContract[]> {
        return this.contractService.checkExpiringContracts(days);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get vendor contract by ID' })
    async findOne(@Param('id') id: string): Promise<VendorContract> {
        return this.contractService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update vendor contract' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: Partial<VendorContract>,
    ): Promise<VendorContract> {
        return this.contractService.update(id, updateDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete vendor contract' })
    async delete(@Param('id') id: string): Promise<void> {
        return this.contractService.delete(id);
    }

    @Post(':id/submit')
    @ApiOperation({ summary: 'Submit contract for approval' })
    async submitForApproval(
        @Param('id') id: string,
        @Body('userId') userId: string,
    ): Promise<VendorContract> {
        return this.contractService.submitForApproval(id, userId);
    }

    @Post(':id/approve')
    @ApiOperation({ summary: 'Approve vendor contract' })
    async approve(
        @Param('id') id: string,
        @Body() approvalData: { approvedBy: string; notes?: string },
    ): Promise<VendorContract> {
        return this.contractService.approve(id, approvalData.approvedBy, approvalData.notes);
    }

    @Post(':id/terminate')
    @ApiOperation({ summary: 'Terminate vendor contract' })
    async terminate(
        @Param('id') id: string,
        @Body() terminationData: { terminatedBy: string; reason: string },
    ): Promise<VendorContract> {
        return this.contractService.terminate(
            id,
            terminationData.terminatedBy,
            terminationData.reason,
        );
    }

    @Post(':id/renew')
    @ApiOperation({ summary: 'Renew vendor contract' })
    async renew(
        @Param('id') id: string,
        @Body() renewalData: { renewedBy: string; newEndDate: string },
    ): Promise<VendorContract> {
        return this.contractService.renew(
            id,
            renewalData.renewedBy,
            renewalData.newEndDate,
        );
    }
}
