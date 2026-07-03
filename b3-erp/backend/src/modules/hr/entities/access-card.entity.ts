import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** HR Access Card (orphan-endpoint build) — backs /hr/assets/office/access-cards. accessZones = JSON text. */
@Entity('hr_access_cards')
export class AccessCard {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() companyId: string;
  @Column({ type: 'varchar', nullable: true }) cardNumber: string;
  @Column({ type: 'varchar', default: 'employee' }) cardType: string;
  @Column({ type: 'varchar', nullable: true }) issuedTo: string;
  @Column({ type: 'varchar', nullable: true }) employeeCode: string;
  @Column({ type: 'varchar', nullable: true }) department: string;
  @Column({ type: 'varchar', nullable: true }) designation: string;
  @Column({ type: 'varchar', nullable: true }) issueDate: string;
  @Column({ type: 'varchar', nullable: true }) expiryDate: string;
  @Column({ type: 'varchar', default: 'active' }) status: string;
  @Column({ type: 'varchar', default: 'basic' }) accessLevel: string;
  @Column({ type: 'text', nullable: true }) accessZones: string;
  @Column({ type: 'varchar', nullable: true }) location: string;
  @Column({ type: 'varchar', nullable: true }) issuedBy: string;
  @Column({ type: 'varchar', nullable: true }) lastUsed: string;
  @Column({ type: 'text', nullable: true }) remarks: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
