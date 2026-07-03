import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * HR Shift Roster Entry
 * Backs the /hr/shifts/roster page. One row per employee holding the weekly
 * shift map (day -> shift code) as JSON.
 */
@Entity('hr_shift_roster_entries')
export class ShiftRosterEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true })
  employeeName: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'varchar', nullable: true })
  weekStart: string;

  @Column({ type: 'json', nullable: true })
  shifts: Record<string, string>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
