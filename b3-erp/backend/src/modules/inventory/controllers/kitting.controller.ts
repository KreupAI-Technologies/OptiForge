import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { KittingService } from '../services/kitting.service';

@Controller('inventory/kitting')
export class KittingController {
    constructor(private readonly kittingService: KittingService) {}

    // ---- Kits ----
    @Get('kits')
    findAllKits(@Query('status') status?: string, @Query('search') search?: string) {
        return this.kittingService.findAllKits({ status, search });
    }

    @Get('kits/:id')
    findKit(@Param('id') id: string) {
        return this.kittingService.findKit(id);
    }

    @Post('kits')
    createKit(@Body() body: any) {
        return this.kittingService.createKit(body);
    }

    @Put('kits/:id')
    updateKit(@Param('id') id: string, @Body() body: any) {
        return this.kittingService.updateKit(id, body);
    }

    @Delete('kits/:id')
    removeKit(@Param('id') id: string) {
        return this.kittingService.removeKit(id);
    }

    // ---- Assembly orders ----
    @Get('assembly')
    findAssembly(@Query('status') status?: string, @Query('search') search?: string) {
        return this.kittingService.findAllOrders('assembly', { status, search });
    }

    @Post('assembly')
    createAssembly(@Body() body: any) {
        return this.kittingService.createOrder({ ...body, orderType: 'assembly' });
    }

    // ---- Disassembly orders ----
    @Get('disassembly')
    findDisassembly(@Query('status') status?: string, @Query('search') search?: string) {
        return this.kittingService.findAllOrders('disassembly', { status, search });
    }

    @Post('disassembly')
    createDisassembly(@Body() body: any) {
        return this.kittingService.createOrder({ ...body, orderType: 'disassembly' });
    }

    // ---- Shared order routes ----
    @Get('orders/:id')
    findOrder(@Param('id') id: string) {
        return this.kittingService.findOrder(id);
    }

    @Put('orders/:id')
    updateOrder(@Param('id') id: string, @Body() body: any) {
        return this.kittingService.updateOrder(id, body);
    }

    @Delete('orders/:id')
    removeOrder(@Param('id') id: string) {
        return this.kittingService.removeOrder(id);
    }
}
