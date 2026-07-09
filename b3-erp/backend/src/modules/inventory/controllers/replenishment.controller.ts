import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ReplenishmentService } from '../services/replenishment.service';
import {
    CreateAutoReplenishmentConfigDto,
    UpdateAutoReplenishmentConfigDto,
    ToggleAutoReplenishmentConfigDto,
    CreateReorderRuleDto,
    CreateReplenishmentRequestDto,
} from '../dto/replenishment.dto';

@ApiTags('Inventory - Replenishment')
@Controller('inventory/replenishment')
export class ReplenishmentController {
    constructor(private readonly replenishmentService: ReplenishmentService) {}

    // ---- Auto-replenishment configs ----

    @Get('configs')
    @ApiOperation({ summary: 'List auto-replenishment configurations' })
    @ApiResponse({ status: HttpStatus.OK })
    async listConfigs() {
        return this.replenishmentService.findAllConfigs();
    }

    @Post('configs')
    @ApiOperation({ summary: 'Create an auto-replenishment configuration' })
    @ApiResponse({ status: HttpStatus.CREATED })
    async createConfig(@Body() dto: CreateAutoReplenishmentConfigDto) {
        return this.replenishmentService.createConfig(dto);
    }

    @Put('configs/:id')
    @ApiOperation({ summary: 'Update an auto-replenishment configuration' })
    @ApiParam({ name: 'id' })
    async updateConfig(
        @Param('id') id: string,
        @Body() dto: UpdateAutoReplenishmentConfigDto,
    ) {
        return this.replenishmentService.updateConfig(id, dto);
    }

    @Patch('configs/:id/toggle')
    @ApiOperation({ summary: 'Enable/disable an auto-replenishment configuration' })
    @ApiParam({ name: 'id' })
    async toggleConfig(
        @Param('id') id: string,
        @Body() dto: ToggleAutoReplenishmentConfigDto,
    ) {
        return this.replenishmentService.toggleConfig(id, dto.enabled);
    }

    @Delete('configs/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete an auto-replenishment configuration' })
    @ApiParam({ name: 'id' })
    async deleteConfig(@Param('id') id: string) {
        await this.replenishmentService.deleteConfig(id);
    }

    // ---- Reorder rules ----

    @Get('rules')
    @ApiOperation({ summary: 'List reorder rules' })
    @ApiResponse({ status: HttpStatus.OK })
    async listRules() {
        return this.replenishmentService.findAllRules();
    }

    @Post('rules')
    @ApiOperation({ summary: 'Create a reorder rule' })
    @ApiResponse({ status: HttpStatus.CREATED })
    async createRule(@Body() dto: CreateReorderRuleDto) {
        return this.replenishmentService.createRule(dto);
    }

    @Delete('rules/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a reorder rule' })
    @ApiParam({ name: 'id' })
    async deleteRule(@Param('id') id: string) {
        await this.replenishmentService.deleteRule(id);
    }

    // ---- Replenishment requests ----

    @Get('requests')
    @ApiOperation({ summary: 'List replenishment requests' })
    @ApiResponse({ status: HttpStatus.OK })
    async listRequests() {
        return this.replenishmentService.findAllRequests();
    }

    @Post('requests')
    @ApiOperation({ summary: 'Create a replenishment request' })
    @ApiResponse({ status: HttpStatus.CREATED })
    async createRequest(@Body() dto: CreateReplenishmentRequestDto) {
        return this.replenishmentService.createRequest(dto);
    }
}
