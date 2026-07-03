import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto, ResetPasswordDto } from '../dto/change-password.dto';
import { PasswordHistoryService } from './password-history.service';
import { AuditLogService } from './audit-log.service';
import { UserRoleService } from './user-role.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly passwordHistoryService: PasswordHistoryService,
    private readonly auditLogService: AuditLogService,
    private readonly userRoleService: UserRoleService,
  ) { }

  async create(createDto: CreateUserDto, createdBy?: string): Promise<User> {
    // Check if username or email already exists
    const existing = await this.repository.findOne({
      where: [
        { username: createDto.username },
        { email: createDto.email },
      ],
    });

    if (existing) {
      if (existing.username === createDto.username) {
        throw new ConflictException('Username already exists');
      }
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createDto.password, 10);

    // Create user
    const user = this.repository.create({
      ...createDto,
      passwordHash,
      fullName: `${createDto.firstName} ${createDto.lastName}`,
      createdBy,
      passwordChangedAt: new Date(),
    });

    const savedUser = await this.repository.save(user);

    // Save password history
    await this.passwordHistoryService.createHistory(
      savedUser.id,
      passwordHash,
      'FIRST_LOGIN',
    );

    // Assign roles if provided
    if (createDto.roleIds && createDto.roleIds.length > 0) {
      await this.userRoleService.assignRoles(
        savedUser.id,
        createDto.roleIds,
        createdBy,
      );
    }

    // Log audit
    await this.auditLogService.log({
      userId: savedUser.id,
      username: savedUser.username,
      module: 'it-admin',
      action: 'CREATE',
      description: `User ${savedUser.username} created`,
      entityType: 'User',
      entityId: savedUser.id,
      entityName: savedUser.fullName,
    });

    return savedUser;
  }

  async findAll(filters?: any): Promise<User[]> {
    const query = this.repository.createQueryBuilder('user');

    if (filters?.status) {
      query.andWhere('user.status = :status', { status: filters.status });
    }

    if (filters?.userType) {
      query.andWhere('user.userType = :userType', { userType: filters.userType });
    }

    if (filters?.department) {
      query.andWhere('user.department = :department', {
        department: filters.department,
      });
    }

    if (filters?.search) {
      query.andWhere(
        '(user.username ILIKE :search OR user.email ILIKE :search OR user.fullName ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    query.orderBy('user.fullName', 'ASC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repository.findOne({
      where: { id },
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
        'userRoles.role.rolePermissions.permission',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.repository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.username = :username', { username })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.repository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(
    id: string,
    updateDto: UpdateUserDto,
    updatedBy?: string,
  ): Promise<User> {
    const user = await this.findOne(id);

    // If email is being changed, check for conflicts
    if (updateDto.email && updateDto.email !== user.email) {
      const existing = await this.repository.findOne({
        where: { email: updateDto.email },
      });
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    const oldValues = { ...user };
    Object.assign(user, updateDto, { updatedBy });

    if (updateDto.firstName || updateDto.lastName) {
      user.fullName = `${user.firstName} ${user.lastName}`;
    }

    const updated = await this.repository.save(user);

    // Log audit
    await this.auditLogService.log({
      userId: updated.id,
      username: updated.username,
      module: 'it-admin',
      action: 'UPDATE',
      description: `User ${updated.username} updated`,
      entityType: 'User',
      entityId: updated.id,
      entityName: updated.fullName,
      oldValues,
      newValues: updated,
    });

    return updated;
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.repository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Verify current password
    const isValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Verify new password confirmation
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Check if new password is same as current
    const isSame = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.passwordHash,
    );

    if (isSame) {
      throw new BadRequestException(
        'New password cannot be the same as current password',
      );
    }

    // Check password history (last 5 passwords)
    const canUse = await this.passwordHistoryService.canUsePassword(
      id,
      changePasswordDto.newPassword,
      5,
    );

    if (!canUse) {
      throw new BadRequestException(
        'Password was used recently. Please choose a different password',
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Update user
    user.passwordHash = passwordHash;
    user.passwordChangedAt = new Date();
    user.mustChangePassword = false;
    await this.repository.save(user);

    // Save to history
    await this.passwordHistoryService.createHistory(
      id,
      passwordHash,
      'USER_INITIATED',
    );

    // Log audit
    await this.auditLogService.log({
      userId: id,
      username: user.username,
      module: 'it-admin',
      action: 'PASSWORD_CHANGE',
      description: `User ${user.username} changed password`,
      entityType: 'User',
      entityId: id,
      entityName: user.fullName,
    });

    return { message: 'Password changed successfully' };
  }

  async resetPassword(
    id: string,
    resetPasswordDto: ResetPasswordDto,
    resetBy?: string,
  ): Promise<{ message: string }> {
    const user = await this.findOne(id);

    // Verify password confirmation
    if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    // Update user
    user.passwordHash = passwordHash;
    user.passwordChangedAt = new Date();
    user.mustChangePassword = true;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null as unknown as Date;
    await this.repository.save(user);

    // Save to history
    await this.passwordHistoryService.createHistory(
      id,
      passwordHash,
      'ADMIN_RESET',
      resetBy,
    );

    // Log audit
    await this.auditLogService.log({
      userId: id,
      username: user.username,
      module: 'it-admin',
      action: 'PASSWORD_RESET',
      description: `User ${user.username} password reset by admin`,
      entityType: 'User',
      entityId: id,
      entityName: user.fullName,
    });

    return { message: 'Password reset successfully. User must change password on next login' };
  }

  async activate(id: string, activatedBy?: string): Promise<User> {
    const user = await this.findOne(id);

    user.status = UserStatus.ACTIVE;
    user.activatedAt = new Date();
    user.activatedBy = activatedBy ?? 'SYSTEM';

    const updated = await this.repository.save(user);

    // Log audit
    await this.auditLogService.log({
      userId: id,
      username: user.username,
      module: 'it-admin',
      action: 'ACTIVATE',
      description: `User ${user.username} activated`,
      entityType: 'User',
      entityId: id,
      entityName: user.fullName,
    });

    return updated;
  }

  async deactivate(
    id: string,
    reason: string,
    deactivatedBy?: string,
  ): Promise<User> {
    const user = await this.findOne(id);

    user.status = UserStatus.INACTIVE;
    user.deactivatedAt = new Date();
    user.deactivatedBy = deactivatedBy ?? 'SYSTEM';
    user.deactivationReason = reason;

    const updated = await this.repository.save(user);

    // Log audit
    await this.auditLogService.log({
      userId: id,
      username: user.username,
      module: 'it-admin',
      action: 'DEACTIVATE',
      description: `User ${user.username} deactivated: ${reason}`,
      entityType: 'User',
      entityId: id,
      entityName: user.fullName,
    });

    return updated;
  }

  async suspend(id: string, suspendedBy?: string): Promise<User> {
    const user = await this.findOne(id);

    user.status = UserStatus.SUSPENDED;

    const updated = await this.repository.save(user);

    // Log audit
    await this.auditLogService.log({
      userId: id,
      username: user.username,
      module: 'it-admin',
      action: 'SUSPEND',
      description: `User ${user.username} suspended`,
      entityType: 'User',
      entityId: id,
      entityName: user.fullName,
    });

    return updated;
  }

  async unlock(id: string, unlockedBy?: string): Promise<User> {
    const user = await this.findOne(id);

    user.status = UserStatus.ACTIVE;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null as unknown as Date;

    const updated = await this.repository.save(user);

    // Log audit
    await this.auditLogService.log({
      userId: id,
      username: user.username,
      module: 'it-admin',
      action: 'UNLOCK',
      description: `User ${user.username} unlocked`,
      entityType: 'User',
      entityId: id,
      entityName: user.fullName,
    });

    return updated;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.repository.remove(user);
  }
}
