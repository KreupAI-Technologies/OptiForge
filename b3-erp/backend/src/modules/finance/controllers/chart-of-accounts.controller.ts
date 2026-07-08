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
import { ChartOfAccountsService } from '../services/chart-of-accounts.service';
import {
  CreateChartOfAccountsDto,
  UpdateChartOfAccountsDto,
  ChartOfAccountsResponseDto,
} from '../dto';

@ApiTags('Finance - Chart of Accounts')
@Controller('finance/chart-of-accounts')
export class ChartOfAccountsController {
  constructor(
    private readonly chartOfAccountsService: ChartOfAccountsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account created successfully',
    type: ChartOfAccountsResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async create(
    @Body() createDto: CreateChartOfAccountsDto,
  ): Promise<ChartOfAccountsResponseDto> {
    return this.chartOfAccountsService.create(createDto);
  }

  @Post('bulk-import')
  @ApiOperation({ summary: 'Bulk import chart-of-accounts from parsed JSON rows' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Import summary (per-row results)',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid payload' })
  async bulkImport(
    @Body()
    body: {
      accounts?: any[];
      rows?: any[];
      validateOnly?: boolean;
      createdBy?: string;
    },
  ): Promise<any> {
    const rows = body?.accounts ?? body?.rows ?? [];
    return this.chartOfAccountsService.bulkImport(rows, {
      validateOnly: body?.validateOnly,
      createdBy: body?.createdBy,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiQuery({ name: 'accountType', required: false, description: 'Filter by account type' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'parentId', required: false, description: 'Filter by parent account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of accounts',
    type: [ChartOfAccountsResponseDto],
  })
  async findAll(
    @Query('accountType') accountType?: string,
    @Query('isActive') isActive?: boolean,
    @Query('parentId') parentId?: string,
  ): Promise<ChartOfAccountsResponseDto[]> {
    return this.chartOfAccountsService.findAll({
      accountType,
      isActive,
      parentId,
    });
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get account hierarchy tree' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hierarchical account tree',
  })
  async getHierarchy(): Promise<any> {
    return this.chartOfAccountsService.getHierarchy();
  }

  @Get('by-type/:accountType')
  @ApiOperation({ summary: 'Get accounts by type' })
  @ApiParam({ name: 'accountType', description: 'Account type' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Accounts of specified type',
    type: [ChartOfAccountsResponseDto],
  })
  async getByType(
    @Param('accountType') accountType: string,
  ): Promise<ChartOfAccountsResponseDto[]> {
    return this.chartOfAccountsService.getByType(accountType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account details',
    type: ChartOfAccountsResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account not found' })
  async findOne(@Param('id') id: string): Promise<ChartOfAccountsResponseDto> {
    return this.chartOfAccountsService.findOne(id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiQuery({ name: 'asOfDate', required: false, description: 'Balance as of date (YYYY-MM-DD)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account balance details',
  })
  async getAccountBalance(
    @Param('id') id: string,
    @Query('asOfDate') asOfDate?: string,
  ): Promise<any> {
    return this.chartOfAccountsService.getAccountBalance(id, asOfDate);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get account transactions' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account transactions',
  })
  async getTransactions(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ): Promise<any> {
    return this.chartOfAccountsService.getTransactions(id, {
      startDate,
      endDate,
      limit,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account updated successfully',
    type: ChartOfAccountsResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateChartOfAccountsDto,
  ): Promise<ChartOfAccountsResponseDto> {
    return this.chartOfAccountsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Account deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account not found' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete account with transactions or children',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.chartOfAccountsService.remove(id);
  }

  @Post(':id/reconcile')
  @ApiOperation({ summary: 'Mark account as reconciled' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account reconciled successfully',
  })
  async reconcile(@Param('id') id: string): Promise<any> {
    return this.chartOfAccountsService.reconcileAccount(id);
  }
}
