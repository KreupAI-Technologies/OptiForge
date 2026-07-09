import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  StockTransfer,
  StockTransferLine,
  TransferStatus,
} from '../entities/stock-transfer.entity';
import {
  CreateStockTransferDto,
  UpdateStockTransferDto,
  StockTransferResponseDto,
} from '../dto';

@Injectable()
export class StockTransferService {
  constructor(
    @InjectRepository(StockTransfer)
    private readonly stockTransferRepository: Repository<StockTransfer>,
    @InjectRepository(StockTransferLine)
    private readonly stockTransferLineRepository: Repository<StockTransferLine>,
    private readonly dataSource: DataSource,
  ) { }

  async create(
    createDto: CreateStockTransferDto,
  ): Promise<StockTransferResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const transferNumber = await this.generateTransferNumber();

      const transfer = manager.create(StockTransfer, {
        ...createDto,
        transferNumber,
        status: TransferStatus.DRAFT,
        totalValue: 0,
      });

      const saved = await manager.save(StockTransfer, transfer);

      const lines = createDto.lines.map((lineDto) =>
        manager.create(StockTransferLine, {
          ...lineDto,
          stockTransferId: saved.id,
          dispatchedQuantity: 0,
          receivedQuantity: 0,
        }),
      );

      await manager.save(StockTransferLine, lines);
      return this.findOne(saved.id);
    });
  }

  async findAll(filters?: any): Promise<StockTransferResponseDto[]> {
    const query =
      this.stockTransferRepository.createQueryBuilder('stockTransfer');

    if (filters?.status) {
      query.andWhere('stockTransfer.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.warehouseId) {
      query.andWhere(
        '(stockTransfer.fromWarehouseId = :warehouseId OR stockTransfer.toWarehouseId = :warehouseId)',
        { warehouseId: filters.warehouseId },
      );
    }

    query.orderBy('stockTransfer.transferDate', 'DESC');
    const transfers = await query.getMany();
    return Promise.all(transfers.map((t) => this.findOne(t.id)));
  }

  async getInTransit(): Promise<StockTransferResponseDto[]> {
    const transfers = await this.stockTransferRepository.find({
      where: { status: TransferStatus.IN_TRANSIT },
      order: { transferDate: 'ASC' },
    });
    return Promise.all(transfers.map((t) => this.findOne(t.id)));
  }

  async findOne(id: string): Promise<StockTransferResponseDto> {
    const transfer = await this.stockTransferRepository.findOne({
      where: { id },
      relations: ['lines'],
    });

    if (!transfer) {
      throw new NotFoundException(`Stock transfer with ID ${id} not found`);
    }

    return this.mapToResponseDto(transfer);
  }

  async update(
    id: string,
    updateDto: UpdateStockTransferDto,
  ): Promise<StockTransferResponseDto> {
    const transfer = await this.stockTransferRepository.findOne({
      where: { id },
    });

    if (!transfer) {
      throw new NotFoundException(`Stock transfer with ID ${id} not found`);
    }

    if (transfer.status !== TransferStatus.DRAFT) {
      throw new BadRequestException('Can only update draft transfers');
    }

    Object.assign(transfer, updateDto);
    await this.stockTransferRepository.save(transfer);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const transfer = await this.stockTransferRepository.findOne({
      where: { id },
    });

    if (!transfer) {
      throw new NotFoundException(`Stock transfer with ID ${id} not found`);
    }

    if (transfer.status !== TransferStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft transfers');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(StockTransferLine, { stockTransferId: id });
      await manager.delete(StockTransfer, { id });
    });
  }

  async submit(id: string): Promise<StockTransferResponseDto> {
    const transfer = await this.stockTransferRepository.findOne({
      where: { id },
    });

    if (!transfer) {
      throw new NotFoundException(`Stock transfer with ID ${id} not found`);
    }

    transfer.status = TransferStatus.SUBMITTED;
    await this.stockTransferRepository.save(transfer);
    return this.findOne(id);
  }

  async approve(id: string): Promise<StockTransferResponseDto> {
    const transfer = await this.stockTransferRepository.findOne({
      where: { id },
    });

    if (!transfer) {
      throw new NotFoundException(`Stock transfer with ID ${id} not found`);
    }

    if (
      transfer.status !== TransferStatus.SUBMITTED &&
      transfer.status !== TransferStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Only submitted transfers can be approved',
      );
    }

    transfer.status = TransferStatus.APPROVED;
    transfer.approvedAt = new Date();
    await this.stockTransferRepository.save(transfer);
    return this.findOne(id);
  }

  async reject(
    id: string,
    rejectionReason?: string,
  ): Promise<StockTransferResponseDto> {
    const transfer = await this.stockTransferRepository.findOne({
      where: { id },
    });

    if (!transfer) {
      throw new NotFoundException(`Stock transfer with ID ${id} not found`);
    }

    if (
      transfer.status === TransferStatus.RECEIVED ||
      transfer.status === TransferStatus.IN_TRANSIT ||
      transfer.status === TransferStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot reject a transfer in status ${transfer.status}`,
      );
    }

    transfer.status = TransferStatus.REJECTED;
    transfer.rejectedAt = new Date();
    if (rejectionReason) {
      transfer.rejectionReason = rejectionReason;
    }
    await this.stockTransferRepository.save(transfer);
    return this.findOne(id);
  }

  async dispatch(id: string): Promise<StockTransferResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const transfer = await manager.findOne(StockTransfer, {
        where: { id },
        relations: ['lines'],
      });

      if (!transfer) {
        throw new NotFoundException(`Stock transfer with ID ${id} not found`);
      }

      // Create dispatch stock entry and update quantities
      transfer.status = TransferStatus.IN_TRANSIT;
      transfer.dispatchedAt = new Date();
      const saved = await manager.save(StockTransfer, transfer);

      return this.findOne(saved.id);
    });
  }

  async receive(id: string, receiveData: any): Promise<StockTransferResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const transfer = await manager.findOne(StockTransfer, {
        where: { id },
        relations: ['lines'],
      });

      if (!transfer) {
        throw new NotFoundException(`Stock transfer with ID ${id} not found`);
      }

      // Create receipt stock entry and update quantities
      transfer.status = TransferStatus.RECEIVED;
      transfer.receivedAt = new Date();
      transfer.actualReceiptDate = new Date();
      const saved = await manager.save(StockTransfer, transfer);

      return this.findOne(saved.id);
    });
  }

  async cancel(id: string): Promise<StockTransferResponseDto> {
    const transfer = await this.stockTransferRepository.findOne({
      where: { id },
    });

    if (!transfer) {
      throw new NotFoundException(`Stock transfer with ID ${id} not found`);
    }

    if (transfer.status === TransferStatus.RECEIVED) {
      throw new BadRequestException('Cannot cancel received transfer');
    }

    transfer.status = TransferStatus.CANCELLED;
    transfer.cancelledAt = new Date();
    await this.stockTransferRepository.save(transfer);
    return this.findOne(id);
  }

  private async generateTransferNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.stockTransferRepository.count();
    return `ST-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private mapToResponseDto(transfer: StockTransfer): StockTransferResponseDto {
    return {
      ...transfer,
      lines: transfer.lines?.map((line) => ({ ...line })) || [],
    } as any;
  }
}
