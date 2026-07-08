import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

/**
 * Persistent backing for the inventory replenishment pages:
 *  - Auto-replenishment configurations (/inventory/replenishment/auto)
 *  - Reorder rules (/inventory/replenishment/rules)
 *  - Replenishment requests (/inventory/replenishment/create)
 *
 * These were previously "NEEDS BACKEND" placeholders on the frontend.
 */

export type ReplenishmentSchedule = 'realtime' | 'hourly' | 'daily' | 'weekly';

@Entity('auto_replenishment_configs')
export class AutoReplenishmentConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    configName: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 100, nullable: true })
    category: string;

    @Column({ length: 255, nullable: true })
    itemPattern: string;

    @Column({ default: true })
    enabled: boolean;

    @Column({ type: 'varchar', length: 20, default: 'daily' })
    schedule: ReplenishmentSchedule;

    @Column({ default: false })
    autoApprove: boolean;

    @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
    maxOrderValue: number;

    @Column({ type: 'json', nullable: true })
    notifyUsers: string[];

    @Column({ type: 'timestamp', nullable: true })
    lastRun: Date;

    @Column({ type: 'timestamp', nullable: true })
    nextRun: Date;

    @Column({ type: 'integer', default: 0 })
    totalRequests: number;

    @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
    successRate: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

export type ReorderRuleMethod =
    | 'reorder-point'
    | 'min-max'
    | 'consumption-based'
    | 'economic-order-qty';

export type ReorderRulePriority = 'critical' | 'high' | 'medium' | 'low';

@Entity('reorder_rules')
export class ReorderRule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    ruleName: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 100, nullable: true })
    category: string;

    @Column({ length: 255, nullable: true })
    itemFilter: string;

    @Column({ type: 'varchar', length: 40, default: 'reorder-point' })
    method: ReorderRuleMethod;

    @Column({ default: false })
    autoApprove: boolean;

    @Column({ type: 'varchar', length: 20, default: 'medium' })
    priority: ReorderRulePriority;

    @Column({ length: 255, nullable: true })
    supplier: string;

    @Column({ type: 'integer', default: 0 })
    leadTimeDays: number;

    @Column({ type: 'integer', default: 0 })
    safetyStockDays: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

export type ReplenishmentRequestStatus =
    | 'pending'
    | 'approved'
    | 'ordered'
    | 'cancelled';

@Entity('replenishment_requests')
export class ReplenishmentRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, length: 50 })
    requestNumber: string;

    @Column({ length: 100 })
    itemCode: string;

    @Column({ length: 255, nullable: true })
    itemName: string;

    @Column({ type: 'numeric', precision: 15, scale: 4 })
    quantity: number;

    @Column({ length: 20, nullable: true })
    uom: string;

    @Column({ type: 'varchar', length: 20, default: 'medium' })
    priority: ReorderRulePriority;

    @Column({ type: 'date', nullable: true })
    requestDate: string;

    @Column({ type: 'date', nullable: true })
    requiredBy: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    status: ReplenishmentRequestStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
