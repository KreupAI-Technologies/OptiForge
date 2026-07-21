import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    InstallationChecklistItem,
    InstallationChecklistType,
} from '../entities/installation-checklist-item.entity';

/**
 * Server-side DEFAULT TEMPLATES for each installation checklist type.
 *
 * These lists were previously HARDCODED in each frontend page. They are moved
 * here so the checklist is the server's source of truth and every item is
 * persisted (id, status, deviation, notes) rather than living only in React
 * state. Seeded lazily on first read of a (projectId, checklistType).
 */
interface TemplateItem {
    itemKey: string;
    label: string;
    category?: string;
    subLabel?: string;
    defaultStatus?: string;
}

export const INSTALLATION_CHECKLIST_TEMPLATES: Record<
    InstallationChecklistType,
    TemplateItem[]
> = {
    // 8.4 Cabinet Alignment — per-row Aligned/Issue + deviation(mm) + notes.
    [InstallationChecklistType.CABINET_ALIGN]: [
        { itemKey: 'base-units-wall-a', label: 'Base Units - Wall A' },
        { itemKey: 'tall-units-wall-b', label: 'Tall Units - Wall B' },
        { itemKey: 'island-unit', label: 'Island Unit' },
    ],
    // 8.5 Trial Wall — per-check Pass/Fail (Verified / Adjustment Needed).
    [InstallationChecklistType.TRIAL_WALL]: [
        { itemKey: 'wall-panel-fitment', label: 'Wall Panel Fitment' },
        { itemKey: 'gap-consistency-3mm', label: 'Gap Consistency (3mm)' },
        { itemKey: 'corner-joints', label: 'Corner Joints' },
        { itemKey: 'vertical-plumb', label: 'Vertical Plumb' },
    ],
    // 8.6 Accessory Fix — per-accessory Install/Verify (Testing -> Installed).
    [InstallationChecklistType.ACCESSORY_FIX]: [
        { itemKey: 'soft-close-hinges', label: 'Soft Close Hinges', subLabel: 'All Cabinets' },
        { itemKey: 'tandem-box-runners', label: 'Tandem Box Runners', subLabel: 'Drawers' },
        { itemKey: 'corner-carousel', label: 'Corner Carousel', subLabel: 'Corner Unit' },
        { itemKey: 'cutlery-tray', label: 'Cutlery Tray', subLabel: 'Top Drawer' },
    ],
    // 8.7 Final Alignment — per-check Perfect/Adjusted.
    [InstallationChecklistType.FINAL_ALIGN]: [
        { itemKey: 'door-gaps-3mm-uniform', label: 'Door Gaps (3mm uniform)' },
        { itemKey: 'drawer-front-alignment', label: 'Drawer Front Alignment' },
        { itemKey: 'shutter-leveling', label: 'Shutter Leveling' },
        { itemKey: 'handle-alignment', label: 'Handle Alignment' },
        { itemKey: 'skirting-alignment', label: 'Skirting Alignment' },
    ],
    // 8.9 Final Inspection — per-point Pass/Fail/Reset (HIGHEST VALUE, auditable).
    [InstallationChecklistType.FINAL_INSPECTION]: [
        { itemKey: 'drawers-open-close-smoothly', label: 'All drawers open/close smoothly', category: 'Functionality' },
        { itemKey: 'hinges-soft-close-working', label: 'Hinges adjusted and soft-close working', category: 'Functionality' },
        { itemKey: 'no-scratches-or-dents', label: 'No scratches or dents on surfaces', category: 'Aesthetics' },
        { itemKey: 'gaps-uniform-3mm', label: 'Gaps are uniform (3mm)', category: 'Aesthetics' },
        { itemKey: 'wall-units-securely-mounted', label: 'Wall units securely mounted', category: 'Safety' },
        { itemKey: 'inside-cabinets-free-of-dust', label: 'Inside cabinets free of dust', category: 'Cleanliness' },
    ],
    // 8.10 Kitchen Cleaning — per-task done toggle (Pending <-> Cleaned).
    [InstallationChecklistType.KITCHEN_CLEANING]: [
        { itemKey: 'countertops-surfaces', label: 'Countertops & Surfaces' },
        { itemKey: 'inside-cabinets-drawers', label: 'Inside Cabinets & Drawers' },
        { itemKey: 'floor-area', label: 'Floor Area' },
        { itemKey: 'remove-debris-packaging', label: 'Remove Debris & Packaging' },
        { itemKey: 'wipe-down-appliances', label: 'Wipe Down Appliances' },
    ],
};

@Injectable()
export class InstallationChecklistService {
    constructor(
        @InjectRepository(InstallationChecklistItem)
        private readonly itemRepository: Repository<InstallationChecklistItem>,
    ) {}

    /**
     * Read the checklist for a (projectId, checklistType). If no rows exist yet,
     * seed them from the server-side default template and persist before
     * returning. Rows come back ordered by sortOrder.
     */
    async getChecklist(
        projectId: string,
        checklistType: InstallationChecklistType,
        companyId?: string,
    ): Promise<InstallationChecklistItem[]> {
        const existing = await this.itemRepository.find({
            where: { projectId, checklistType },
            order: { sortOrder: 'ASC' },
        });
        if (existing.length > 0) return existing;

        const template = INSTALLATION_CHECKLIST_TEMPLATES[checklistType] ?? [];
        const seeded = template.map((t, idx) =>
            this.itemRepository.create({
                companyId: companyId ?? null,
                projectId,
                checklistType,
                itemKey: t.itemKey,
                label: t.label,
                category: t.category ?? null,
                subLabel: t.subLabel ?? null,
                status: t.defaultStatus ?? 'Pending',
                deviation: null,
                notes: null,
                sortOrder: idx,
            }),
        );
        if (seeded.length === 0) return [];
        return this.itemRepository.save(seeded);
    }

    /** Persist a single checklist item's status / deviation / notes. */
    async updateItem(
        itemId: string,
        data: { status?: string; deviation?: number | null; notes?: string | null },
    ): Promise<InstallationChecklistItem> {
        const item = await this.itemRepository.findOne({ where: { id: itemId } });
        if (!item) throw new NotFoundException('Installation checklist item not found');

        if (data.status !== undefined) item.status = data.status;
        if (data.deviation !== undefined) item.deviation = data.deviation;
        if (data.notes !== undefined) item.notes = data.notes;

        return this.itemRepository.save(item);
    }

    /**
     * Mark a checklist "complete". This subsystem is item-centric (no header
     * row), so completion is expressed by ensuring the checklist exists and
     * returning its full, persisted state. The page keeps its existing
     * createInstallDailyReport behavior — this is additive per-item durability.
     */
    async complete(
        projectId: string,
        checklistType: InstallationChecklistType,
        companyId?: string,
    ): Promise<{ projectId: string; checklistType: InstallationChecklistType; completedAt: Date; items: InstallationChecklistItem[] }> {
        const items = await this.getChecklist(projectId, checklistType, companyId);
        return {
            projectId,
            checklistType,
            completedAt: new Date(),
            items,
        };
    }
}
