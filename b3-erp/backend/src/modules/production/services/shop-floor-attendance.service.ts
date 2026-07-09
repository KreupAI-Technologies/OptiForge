import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopFloorAttendance } from '../entities/shop-floor-attendance.entity';

@Injectable()
export class ShopFloorAttendanceService {
  constructor(
    @InjectRepository(ShopFloorAttendance)
    private readonly repo: Repository<ShopFloorAttendance>,
  ) {}

  // Start a shift (clock-in). Used when an operator logs in at the terminal.
  async startShift(dto: Partial<ShopFloorAttendance>): Promise<ShopFloorAttendance> {
    const entity = this.repo.create({
      ...dto,
      clockIn: dto.clockIn ?? new Date(),
      shiftDate: dto.shiftDate ?? new Date().toISOString().split('T')[0],
      status: 'open',
    });
    return this.repo.save(entity);
  }

  // End a shift (clock-out) with the production summary from the terminal.
  // If an existing open record id is provided it is closed; otherwise a new
  // closed attendance record is created from the summary payload.
  async endShift(dto: Partial<ShopFloorAttendance> & { id?: string }): Promise<ShopFloorAttendance> {
    let entity: ShopFloorAttendance | null = null;
    if (dto.id) {
      entity = await this.repo.findOne({ where: { id: dto.id } });
      if (!entity) {
        throw new NotFoundException(`Attendance record with ID ${dto.id} not found`);
      }
    }
    if (!entity) {
      entity = this.repo.create({
        ...dto,
        clockIn: dto.clockIn ?? new Date(),
        shiftDate: dto.shiftDate ?? new Date().toISOString().split('T')[0],
      });
    }
    Object.assign(entity, {
      operatorId: dto.operatorId ?? entity.operatorId,
      operatorName: dto.operatorName ?? entity.operatorName,
      workCenterId: dto.workCenterId ?? entity.workCenterId,
      workCenterName: dto.workCenterName ?? entity.workCenterName,
      shift: dto.shift ?? entity.shift,
      totalProduced: dto.totalProduced ?? entity.totalProduced,
      totalRejected: dto.totalRejected ?? entity.totalRejected,
      totalRework: dto.totalRework ?? entity.totalRework,
      downtimeMinutes: dto.downtimeMinutes ?? entity.downtimeMinutes,
      notes: dto.notes ?? entity.notes,
      clockOut: dto.clockOut ?? new Date(),
      status: 'closed',
    });
    return this.repo.save(entity);
  }

  async findAll(filters?: {
    status?: string;
    operatorId?: string;
    shiftDate?: string;
  }): Promise<ShopFloorAttendance[]> {
    const query = this.repo.createQueryBuilder('a');
    if (filters?.status) {
      query.andWhere('a.status = :status', { status: filters.status });
    }
    if (filters?.operatorId) {
      query.andWhere('a.operatorId = :operatorId', { operatorId: filters.operatorId });
    }
    if (filters?.shiftDate) {
      query.andWhere('a.shiftDate = :shiftDate', { shiftDate: filters.shiftDate });
    }
    query.orderBy('a.createdAt', 'DESC');
    return query.getMany();
  }
}
