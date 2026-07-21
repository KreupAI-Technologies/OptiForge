import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * The set of per-check installation checklist types. One row per check item,
 * one logical checklist per (projectId, checklistType). Backs the six
 * (modules)/installation/* checklist pages (cabinet-align, trial-wall,
 * accessory-fix, final-align, final-inspection, kitchen-cleaning).
 */
export enum InstallationChecklistType {
    CABINET_ALIGN = 'cabinet-align',
    TRIAL_WALL = 'trial-wall',
    ACCESSORY_FIX = 'accessory-fix',
    FINAL_ALIGN = 'final-align',
    FINAL_INSPECTION = 'final-inspection',
    KITCHEN_CLEANING = 'kitchen-cleaning',
}

/**
 * A single, individually-auditable installation checklist item.
 *
 * Rows are seeded lazily (on first read of a project's checklist for a type)
 * from INSTALLATION_CHECKLIST_TEMPLATES in the service, so no data migration
 * of content is needed — only the additive DDL for the table itself.
 *
 * Fixes genuine QA data-loss: previously each installation page held a
 * HARDCODED array and per-item Pass/Fail clicks were UI-only (never persisted);
 * only a summary string was saved on Complete. Now every per-item result
 * (status, deviation, notes) is persisted individually.
 */
@Entity('installation_checklist_items')
@Index('IDX_installation_checklist_items_project_type', ['projectId', 'checklistType'])
export class InstallationChecklistItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'company_id', nullable: true })
    companyId: string | null;

    @Column({ name: 'project_id' })
    projectId: string;

    @Column({
        name: 'checklist_type',
        type: 'enum',
        enum: InstallationChecklistType,
    })
    checklistType: InstallationChecklistType;

    /** Stable machine key for the item within its checklist (e.g. 'base-units-wall-a'). */
    @Column({ name: 'item_key' })
    itemKey: string;

    /** Human-readable label shown in the UI (e.g. 'Base Units - Wall A'). */
    @Column()
    label: string;

    /** Optional grouping/category (used by final-inspection: Functionality/Safety/...). */
    @Column({ nullable: true })
    category: string | null;

    /** Optional secondary label (used by accessory-fix location). */
    @Column({ name: 'sub_label', nullable: true })
    subLabel: string | null;

    /**
     * Per-item result status. Free-form string so each checklist type keeps its
     * own vocabulary (Pending/Aligned/Issue, Pending/Verified/Adjustment Needed,
     * Pending/Installed/Testing, Pending/Perfect/Adjusted, Pending/Pass/Fail,
     * Pending/Cleaned). Seeded as 'Pending'.
     */
    @Column({ default: 'Pending' })
    status: string;

    /** Numeric deviation in mm — used by cabinet-align; null otherwise. */
    @Column({ type: 'numeric', nullable: true })
    deviation: number | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
