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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RouteService } from '../services/route.service';
import {
  CreateRouteDto,
  UpdateRouteDto,
  RouteResponseDto,
} from '../dto';

@ApiTags('Logistics - Route')
@Controller('logistics/routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new route' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RouteResponseDto,
  })
  async create(
    @Body() createDto: CreateRouteDto,
  ): Promise<RouteResponseDto> {
    return this.routeService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all routes' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'routeType', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [RouteResponseDto],
  })
  async findAll(
    @Query('status') status?: string,
    @Query('routeType') routeType?: string,
    @Query('originCity') originCity?: string,
    @Query('destinationCity') destinationCity?: string,
  ): Promise<RouteResponseDto[]> {
    return this.routeService.findAll({ status, routeType, originCity, destinationCity });
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active routes' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [RouteResponseDto],
  })
  async findActive(): Promise<RouteResponseDto[]> {
    return this.routeService.findActive();
  }

  @Post('optimize')
  @ApiOperation({
    summary: 'Batch-optimize all active routes (deterministic heuristic)',
  })
  @ApiResponse({ status: HttpStatus.OK })
  async optimizeAll(): Promise<any> {
    return this.routeService.optimizeAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RouteResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<RouteResponseDto> {
    return this.routeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update route' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RouteResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRouteDto,
  ): Promise<RouteResponseDto> {
    return this.routeService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete route' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.routeService.remove(id);
  }

  @Post(':id/optimize')
  @ApiOperation({ summary: 'Optimize route' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RouteResponseDto,
  })
  async optimize(@Param('id') id: string): Promise<RouteResponseDto> {
    return this.routeService.optimizeRoute(id);
  }

  @Get(':id/distance')
  @ApiOperation({ summary: 'Calculate route distance' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  async calculateDistance(@Param('id') id: string): Promise<any> {
    return this.routeService.calculateDistance(id);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get route performance metrics' })
  @ApiParam({ name: 'id' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  async getPerformance(@Param('id') id: string): Promise<any> {
    return this.routeService.getRoutePerformance(id);
  }
}
