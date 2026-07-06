import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InventoryPolicyService } from '../services/inventory-policy.service';

@Controller('inventory/policies')
export class InventoryPolicyController {
    constructor(private readonly policyService: InventoryPolicyService) {}

    @Get()
    findAll(@Query('policyType') policyType?: string, @Query('status') status?: string, @Query('search') search?: string) {
        return this.policyService.findAll({ policyType, status, search });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.policyService.findOne(id);
    }

    @Post()
    create(@Body() body: any) {
        return this.policyService.create(body);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.policyService.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.policyService.remove(id);
    }
}
