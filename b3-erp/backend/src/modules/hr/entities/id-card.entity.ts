import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** HR ID Card (orphan-endpoint build) — backs /hr/assets/office/id-cards. */
@Entity('hr_id_cards')
export class IdCard {
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
  @Column({ type: 'varchar', nullable: true }) bloodGroup: string;
  @Column({ type: 'varchar', nullable: true }) emergencyContact: string;
  @Column({ type: 'boolean', default: false }) photo: boolean;
  @Column({ type: 'varchar', nullable: true }) location: string;
  @Column({ type: 'varchar', nullable: true }) issuedBy: string;
  @Column({ type: 'text', nullable: true }) remarks: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
