import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus, UserType } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole, UserRoleStatus } from '../entities/user-role.entity';

@Injectable()
export class AdminUserSeederService implements OnModuleInit {
  private readonly logger = new Logger(AdminUserSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) { }

  async onModuleInit(): Promise<void> {
    // Delay to ensure roles are seeded first
    setTimeout(() => this.seedAdminUser(), 3000);
  }

  async seedAdminUser(): Promise<void> {
    this.logger.log('Seeding default admin user...');

    const adminEmail = 'admin@manufacturingos.com';
    const adminUsername = 'admin';
    const adminPassword = 'Admin@123';

    try {
      // Check if admin user already exists
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: adminEmail },
          { username: adminUsername },
        ],
      });

      if (existingUser) {
        if (!existingUser.isSystemAdmin) {
          existingUser.isSystemAdmin = true;
          await this.userRepository.save(existingUser);
          this.logger.log('Updated existing admin user with isSystemAdmin: true');
        } else {
          this.logger.log('Admin user already exists with isSystemAdmin: true, skipping creation');
        }
        // Proceed to ensure role assignment
        await this.ensureRoleAssignment(existingUser);
        return;
      }

      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

      // Create the admin user
      const adminUser = this.userRepository.create({
        username: adminUsername,
        email: adminEmail,
        passwordHash: passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        fullName: 'System Administrator',
        phoneNumber: '+1234567890',
        employeeId: 'EMP-ADMIN-001',
        userType: UserType.INTERNAL,
        status: UserStatus.ACTIVE,
        isSystemAdmin: true,
        department: 'IT',
        designation: 'System Administrator',
        location: 'Headquarters',
        isEmailVerified: true,
        twoFactorEnabled: false,
        mustChangePassword: false,
        activatedAt: new Date(),
        activatedBy: 'system',
        preferences: {
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'DD/MM/YYYY',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
        },
        metadata: {
          seededAt: new Date().toISOString(),
          source: 'system-seeder',
          version: '1.0',
        },
        createdBy: 'system',
      });

      const savedUser = await this.userRepository.save(adminUser);
      this.logger.log(`Created admin user: ${adminEmail}`);

      await this.ensureRoleAssignment(savedUser);

      this.logger.log('Admin user seeding completed successfully');
      this.logger.log('---------------------------------------------');
      this.logger.log('Default Admin Credentials:');
      this.logger.log(`  Email: ${adminEmail}`);
      this.logger.log(`  Username: ${adminUsername}`);
      this.logger.log(`  Password: ${adminPassword}`);
      this.logger.log('---------------------------------------------');
      this.logger.warn('Please change the default password after first login!');
    } catch (error) {
      this.logger.error(`Failed to seed admin user: ${error.message}`);
    }
  }

  private async ensureRoleAssignment(user: User): Promise<void> {
    // Find the SUPER_ADMIN role
    const superAdminRole = await this.roleRepository.findOne({
      where: { code: 'SUPER_ADMIN' },
    });

    if (!superAdminRole) {
      this.logger.warn('SUPER_ADMIN role not found, user created without role assignment');
      return;
    }

    // Check if user-role mapping already exists
    const existingUserRole = await this.userRoleRepository.findOne({
      where: {
        userId: user.id,
        roleId: superAdminRole.id,
      },
    });

    if (!existingUserRole) {
      // Assign SUPER_ADMIN role to the admin user
      const userRole = this.userRoleRepository.create({
        userId: user.id,
        roleId: superAdminRole.id,
        status: UserRoleStatus.ACTIVE,
        isPrimary: true,
        assignedAt: new Date(),
        assignedBy: 'system',
        effectiveFrom: new Date(),
        approvedBy: 'system',
        approvedAt: new Date(),
        metadata: {
          seededAt: new Date().toISOString(),
          source: 'system-seeder',
          reason: 'Default system administrator',
        },
        createdBy: 'system',
      } as Partial<UserRole>);

      await this.userRoleRepository.save(userRole);
      this.logger.log(`Assigned SUPER_ADMIN role to admin user`);

      // Update role user count
      await this.roleRepository.increment(
        { id: superAdminRole.id },
        'userCount',
        1,
      );
    }
  }
}
