import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockBalance } from '../entities/stock-balance.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class InventoryAnalyticsService {
    private readonly logger = new Logger(InventoryAnalyticsService.name);

    constructor(
        @InjectRepository(StockBalance)
        private readonly stockBalanceRepository: Repository<StockBalance>,
    ) { }

    /**
     * Periodically run stock aging analysis to flag obsolete and slow-moving stock.
     * Runs daily at midnight.
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async runStockAgingAnalysis(): Promise<void> {
        this.logger.log('Starting daily stock aging analysis...');

        const balances = await this.stockBalanceRepository.find();
        const now = new Date();
        let updatedCount = 0;

        for (const balance of balances) {
            const lastMovementDate = balance.lastIssueDate || balance.lastReceiptDate || balance.createdAt;
            const daysSinceMovement = Math.floor((now.getTime() - lastMovementDate.getTime()) / (1000 * 60 * 60 * 24));

            let modified = false;

            // Flag Slow Moving (e.g., > 90 days)
            const isSlow = daysSinceMovement > 90;
            if (balance.isSlowMoving !== isSlow) {
                balance.isSlowMoving = isSlow;
                modified = true;
            }

            // Flag Non Moving (e.g., > 180 days)
            const isNonMoving = daysSinceMovement > 180;
            if (balance.isNonMoving !== isNonMoving) {
                balance.isNonMoving = isNonMoving;
                modified = true;
            }

            // Flag Obsolete (e.g., > 365 days)
            const isObsolete = daysSinceMovement > 365;
            if (balance.isObsolete !== isObsolete) {
                balance.isObsolete = isObsolete;
                modified = true;
            }

            balance.daysSinceLastMovement = daysSinceMovement;

            if (modified) {
                await this.stockBalanceRepository.save(balance);
                updatedCount++;
            }
        }

        this.logger.log(`Stock aging analysis complete. Updated ${updatedCount} records.`);
    }

    /**
     * Manual trigger for aging analysis.
     */
    async analyzeAging(): Promise<{ updated: number }> {
        const initialCount = 0; // Simplified for return
        await this.runStockAgingAnalysis();
        return { updated: 0 }; // Placeholder
    }

    // ---------------------------------------------------------------------------
    // Derived read analytics (computed from StockBalance — no new tables).
    // ---------------------------------------------------------------------------

    private async loadBalances(warehouseId?: string): Promise<StockBalance[]> {
        const where = warehouseId ? { warehouseId } : {};
        return this.stockBalanceRepository.find({ where });
    }

    private daysSinceMovement(b: StockBalance): number {
        if (typeof b.daysSinceLastMovement === 'number' && b.daysSinceLastMovement > 0) {
            return b.daysSinceLastMovement;
        }
        const last = b.lastIssueDate || b.lastReceiptDate || b.createdAt;
        if (!last) return 0;
        return Math.max(0, Math.floor((Date.now() - new Date(last).getTime()) / 86400000));
    }

    private bucketFor(days: number): '0-30' | '31-60' | '61-90' | '91-180' | '180+' {
        if (days <= 30) return '0-30';
        if (days <= 60) return '31-60';
        if (days <= 90) return '61-90';
        if (days <= 180) return '91-180';
        return '180+';
    }

    private velocityFor(days: number): 'fast' | 'medium' | 'slow' | 'dead' {
        if (days <= 30) return 'fast';
        if (days <= 90) return 'medium';
        if (days <= 180) return 'slow';
        return 'dead';
    }

    private num(v: any): number {
        const n = typeof v === 'string' ? parseFloat(v) : v;
        return Number.isFinite(n) ? n : 0;
    }

    /** Per-item aging list + bucket summary. */
    async getAgingItems(warehouseId?: string): Promise<any> {
        const balances = await this.loadBalances(warehouseId);
        const items = balances.map((b) => {
            const days = this.daysSinceMovement(b);
            const qty = this.num(b.totalQuantity) || this.num(b.availableQuantity);
            const unitValue = this.num(b.valuationRate);
            const totalValue = this.num(b.stockValue) || qty * unitValue;
            return {
                id: b.id,
                itemCode: b.itemCode,
                itemName: b.itemName,
                category: b.itemCategory || 'Uncategorized',
                warehouse: b.warehouseName,
                quantity: qty,
                uom: b.uom,
                unitValue,
                totalValue,
                lastMovementDate: (b.lastIssueDate || b.lastReceiptDate || b.createdAt)?.toString().slice(0, 10) ?? '',
                agingDays: days,
                agingBucket: this.bucketFor(days),
                movementVelocity: this.velocityFor(days),
                recommendation:
                    days > 180 ? 'Consider liquidation or scrap' : days > 90 ? 'Review usage forecast' : 'Normal stock rotation',
            };
        });
        const bucket = (label: string) => items.filter((i) => i.agingBucket === label);
        const sumV = (arr: any[]) => arr.reduce((s, i) => s + i.totalValue, 0);
        return {
            reportDate: new Date().toISOString().slice(0, 10),
            warehouseId: warehouseId || null,
            items,
            summary: {
                totalValue: sumV(items),
                itemCount: items.length,
                buckets: {
                    '0-30': { count: bucket('0-30').length, value: sumV(bucket('0-30')) },
                    '31-60': { count: bucket('31-60').length, value: sumV(bucket('31-60')) },
                    '61-90': { count: bucket('61-90').length, value: sumV(bucket('61-90')) },
                    '91-180': { count: bucket('91-180').length, value: sumV(bucket('91-180')) },
                    '180+': { count: bucket('180+').length, value: sumV(bucket('180+')) },
                },
            },
        };
    }

    /** Dead / slow-moving stock (no movement over threshold days, default 180). */
    async getDeadStock(warehouseId?: string, thresholdDays = 180): Promise<any> {
        const balances = await this.loadBalances(warehouseId);
        const items = balances
            .map((b) => {
                const days = this.daysSinceMovement(b);
                const qty = this.num(b.totalQuantity) || this.num(b.availableQuantity);
                return {
                    id: b.id,
                    itemCode: b.itemCode,
                    itemName: b.itemName,
                    category: b.itemCategory || 'Uncategorized',
                    warehouse: b.warehouseName,
                    quantity: qty,
                    uom: b.uom,
                    value: this.num(b.stockValue) || qty * this.num(b.valuationRate),
                    daysSinceMovement: days,
                    lastMovementDate: (b.lastIssueDate || b.lastReceiptDate || b.createdAt)?.toString().slice(0, 10) ?? '',
                    status: days > 365 ? 'obsolete' : days > thresholdDays ? 'dead' : 'slow',
                };
            })
            .filter((i) => i.daysSinceMovement >= 90);
        return {
            reportDate: new Date().toISOString().slice(0, 10),
            warehouseId: warehouseId || null,
            totalValue: items.reduce((s, i) => s + i.value, 0),
            itemCount: items.length,
            items,
        };
    }

    /** Movement velocity classification (fast/medium/slow/dead). */
    async getVelocity(warehouseId?: string): Promise<any> {
        const balances = await this.loadBalances(warehouseId);
        const items = balances.map((b) => {
            const days = this.daysSinceMovement(b);
            const qty = this.num(b.totalQuantity) || this.num(b.availableQuantity);
            return {
                id: b.id,
                itemCode: b.itemCode,
                itemName: b.itemName,
                category: b.itemCategory || 'Uncategorized',
                warehouse: b.warehouseName,
                quantity: qty,
                uom: b.uom,
                value: this.num(b.stockValue) || qty * this.num(b.valuationRate),
                daysSinceMovement: days,
                velocity: this.velocityFor(days),
                abcClass: b.abcClassification || null,
            };
        });
        const by = (v: string) => items.filter((i) => i.velocity === v);
        return {
            reportDate: new Date().toISOString().slice(0, 10),
            warehouseId: warehouseId || null,
            items,
            summary: {
                fast: { count: by('fast').length, value: by('fast').reduce((s, i) => s + i.value, 0) },
                medium: { count: by('medium').length, value: by('medium').reduce((s, i) => s + i.value, 0) },
                slow: { count: by('slow').length, value: by('slow').reduce((s, i) => s + i.value, 0) },
                dead: { count: by('dead').length, value: by('dead').reduce((s, i) => s + i.value, 0) },
            },
        };
    }

    /** Inventory turnover (approximation: annualised issue proxy / avg value). */
    async getTurnover(warehouseId?: string): Promise<any> {
        const balances = await this.loadBalances(warehouseId);
        const items = balances.map((b) => {
            const days = Math.max(1, this.daysSinceMovement(b));
            const value = this.num(b.stockValue) || this.num(b.totalQuantity) * this.num(b.valuationRate);
            // Turnover ratio proxy: 365 / max(days,1); lower days => higher turns.
            const turnoverRatio = Number((365 / days).toFixed(2));
            return {
                id: b.id,
                itemCode: b.itemCode,
                itemName: b.itemName,
                category: b.itemCategory || 'Uncategorized',
                warehouse: b.warehouseName,
                value,
                daysInStock: this.num(b.daysInStock) || days,
                turnoverRatio,
                classification: turnoverRatio >= 6 ? 'high' : turnoverRatio >= 2 ? 'medium' : 'low',
            };
        });
        const totalValue = items.reduce((s, i) => s + i.value, 0);
        const avgTurnover = items.length ? Number((items.reduce((s, i) => s + i.turnoverRatio, 0) / items.length).toFixed(2)) : 0;
        return {
            reportDate: new Date().toISOString().slice(0, 10),
            warehouseId: warehouseId || null,
            totalValue,
            avgTurnoverRatio: avgTurnover,
            items,
        };
    }

    /** Carrying-cost estimate (holding % of stock value + storage/obsolescence buckets). */
    async getCarryingCost(warehouseId?: string, holdingRatePct = 22): Promise<any> {
        const balances = await this.loadBalances(warehouseId);
        const rate = holdingRatePct / 100;
        const items = balances.map((b) => {
            const value = this.num(b.stockValue) || this.num(b.totalQuantity) * this.num(b.valuationRate);
            const annualCarryingCost = Number((value * rate).toFixed(2));
            return {
                id: b.id,
                itemCode: b.itemCode,
                itemName: b.itemName,
                category: b.itemCategory || 'Uncategorized',
                warehouse: b.warehouseName,
                stockValue: value,
                annualCarryingCost,
                capitalCost: Number((value * 0.1).toFixed(2)),
                storageCost: Number((value * 0.06).toFixed(2)),
                obsolescenceRisk: Number((value * 0.06).toFixed(2)),
            };
        });
        const totalValue = items.reduce((s, i) => s + i.stockValue, 0);
        return {
            reportDate: new Date().toISOString().slice(0, 10),
            warehouseId: warehouseId || null,
            holdingRatePct,
            totalStockValue: totalValue,
            totalCarryingCost: Number((totalValue * rate).toFixed(2)),
            items,
        };
    }

    /** EOQ / safety-stock / min-max optimization suggestions (computed). */
    async getOptimization(warehouseId?: string): Promise<any> {
        const balances = await this.loadBalances(warehouseId);
        const items = balances.map((b) => {
            const annualDemand = Math.max(1, Math.round(this.num(b.reorderQuantity) * 12));
            const unitCost = this.num(b.valuationRate) || 1;
            const orderingCost = 500; // assumption ₹/order
            const holdingCostPerUnit = Math.max(0.01, unitCost * 0.22);
            const eoq = Math.round(Math.sqrt((2 * annualDemand * orderingCost) / holdingCostPerUnit));
            const currentSafety = this.num(b.safetyStock);
            const reorder = this.num(b.reorderLevel);
            // Suggested safety = 1.65 * sqrt(leadTime) * demandStdDev proxy
            const suggestedSafety = Math.round(Math.max(currentSafety, annualDemand / 24));
            return {
                id: b.id,
                itemCode: b.itemCode,
                itemName: b.itemName,
                category: b.itemCategory || 'Uncategorized',
                warehouse: b.warehouseName,
                currentQty: this.num(b.totalQuantity) || this.num(b.availableQuantity),
                annualDemand,
                unitCost,
                eoq,
                currentReorderLevel: reorder,
                suggestedReorderLevel: Math.round(suggestedSafety + annualDemand / 12),
                currentSafetyStock: currentSafety,
                suggestedSafetyStock: suggestedSafety,
                minLevel: suggestedSafety,
                maxLevel: Math.round(suggestedSafety + eoq),
            };
        });
        return {
            reportDate: new Date().toISOString().slice(0, 10),
            warehouseId: warehouseId || null,
            items,
        };
    }
}
