import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Project } from '../../project/entities/project.entity';
import { Invoice } from '../../finance/entities/invoice.entity';
import { PurchaseOrder } from '../../procurement/entities/purchase-order.entity';
import { TimeLog } from '../entities/time-log.entity';
import { GeneralLedger } from '../../finance/entities/general-ledger.entity';
import { ProjectBudget } from '../entities/project-budget.entity';

@Injectable()
export class ProjectFinancialsService {
    constructor(
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
        @InjectRepository(PurchaseOrder)
        private poRepository: Repository<PurchaseOrder>,
        @InjectRepository(TimeLog)
        private timeLogRepository: Repository<TimeLog>,
        @InjectRepository(GeneralLedger)
        private ledgerRepository: Repository<GeneralLedger>,
        @InjectRepository(ProjectBudget)
        private budgetRepository: Repository<ProjectBudget>,
        private dataSource: DataSource,
    ) { }

    async trackExpense(projectId: string, amount: number, category: string, description?: string): Promise<Project> {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project) {
            throw new NotFoundException(`Project with ID ${projectId} not found`);
        }

        project.budgetSpent = (Number(project.budgetSpent) || 0) + amount;
        // this.calculateFinancials(project); // Disabled until fields exist

        return this.projectRepository.save(project);
    }

    async trackIncome(projectId: string, amount: number, source: string, description?: string): Promise<Project> {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project) {
            throw new NotFoundException(`Project with ID ${projectId} not found`);
        }

        // project.totalIncome += amount; // Field does not exist
        // this.calculateFinancials(project);

        return project; // No-op for now
    }

    async syncProjectFinancials(projectId: string): Promise<Project> {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project) throw new NotFoundException('Project not found');

        // 1. Aggregate Revenue (Sales Invoices)
        const invoices = await this.invoiceRepository.find({ where: { projectId } });
        const totalIncome = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);

        // 2. Aggregate Material Costs (Purchase Orders)
        const pos = await this.poRepository.find({ where: { project: project.projectCode } });
        const materialExpenditure = pos.reduce((sum, po) => sum + Number(po.totalAmount || 0), 0);

        // 3. Aggregate Labor Costs (Time Logs)
        // Note: For now using a standard hourly rate of 500 until employee-specific rates are implemented
        const timeLogs = await this.timeLogRepository.find({ where: { projectId } });
        const laborExpenditure = timeLogs.reduce((sum, log) => sum + (Number(log.hours) * 500), 0);

        // 4. Aggregate Manual Ledger Entries
        const ledgerEntries = await this.ledgerRepository.find({ where: { project: project.projectCode } });
        const miscExpenditure = ledgerEntries.reduce((sum, entry) => sum + (Number(entry.debitAmount) - Number(entry.creditAmount)), 0);

        project.totalIncome = totalIncome;
        project.totalExpenditure = materialExpenditure + laborExpenditure + miscExpenditure;
        project.netProfit = project.totalIncome - project.totalExpenditure;
        project.profitMargin = project.totalIncome > 0 ? (project.netProfit / project.totalIncome) * 100 : 0;
        project.budgetSpent = project.totalExpenditure;

        return await this.projectRepository.save(project);
    }

    async calculateIoE(projectId: string): Promise<{ income: number; expenditure: number; margin: number; status: string }> {
        const project = await this.syncProjectFinancials(projectId);

        return {
            income: Number(project.totalIncome),
            expenditure: Number(project.totalExpenditure),
            margin: Number(project.netProfit),
            status: project.netProfit >= 0 ? 'Profitable' : 'Loss',
        };
    }

    /**
     * Rich financial breakdown for the Project Financials dashboard.
     * Reuses the same real repos/aggregation as syncProjectFinancials, and additionally
     * exposes per-category sub-totals, a monthly income/expense trend and recent transactions.
     * All values are derived from existing rows only; missing data degrades to 0 / [].
     */
    async getFinancialBreakdown(projectId: string): Promise<{
        budget: number;
        totalIncome: number;
        totalExpenditure: number;
        margin: number;
        materialExpenditure: number;
        laborExpenditure: number;
        miscExpenditure: number;
        expensesByCategory: { name: string; value: number; color: string }[];
        monthlyTrend: { name: string; income: number; expense: number; cashFlow: number }[];
        recentTransactions: { id: string; date: string; description: string; category: string; amount: number; status: string }[];
    }> {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project) throw new NotFoundException('Project not found');

        // --- Real aggregation (mirrors syncProjectFinancials) ---
        const invoices = await this.invoiceRepository.find({ where: { projectId } });
        const totalIncome = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);

        const pos = await this.poRepository.find({ where: { project: project.projectCode } });
        const materialExpenditure = pos.reduce((sum, po) => sum + Number(po.totalAmount || 0), 0);

        const timeLogs = await this.timeLogRepository.find({ where: { projectId } });
        const laborExpenditure = timeLogs.reduce((sum, log) => sum + (Number(log.hours) * 500), 0);

        const ledgerEntries = await this.ledgerRepository.find({ where: { project: project.projectCode } });
        const miscExpenditure = ledgerEntries.reduce((sum, entry) => sum + (Number(entry.debitAmount) - Number(entry.creditAmount)), 0);

        const totalExpenditure = materialExpenditure + laborExpenditure + miscExpenditure;
        const margin = totalIncome - totalExpenditure;

        // --- Budget ---
        // Prefer the project-level allocation; fall back to the sum of ProjectBudget rows.
        let budget = Number(project.budgetAllocated || 0);
        if (!budget) {
            const budgets = await this.budgetRepository.find({ where: { projectId } });
            budget = budgets.reduce((sum, b) => sum + Number(b.budgetAllocated || 0), 0);
        }

        // --- Expenses by category (real sub-totals, component's hex colors) ---
        const expensesByCategory = [
            { name: 'Materials', value: materialExpenditure, color: '#0088FE' },
            { name: 'Labor', value: laborExpenditure, color: '#00C49F' },
            { name: 'Misc/Overhead', value: miscExpenditure, color: '#FFBB28' },
        ];

        // --- Monthly trend: aggregate invoices (income) & POs (expense) by month ---
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyMap = new Map<string, { key: string; year: number; month: number; name: string; income: number; expense: number }>();

        const bucketFor = (raw: any) => {
            if (!raw) return null;
            const d = new Date(raw);
            if (isNaN(d.getTime())) return null;
            const year = d.getFullYear();
            const month = d.getMonth();
            const key = `${year}-${String(month).padStart(2, '0')}`;
            let bucket = monthlyMap.get(key);
            if (!bucket) {
                bucket = { key, year, month, name: monthNames[month], income: 0, expense: 0 };
                monthlyMap.set(key, bucket);
            }
            return bucket;
        };

        for (const inv of invoices) {
            const bucket = bucketFor(inv.invoiceDate);
            if (bucket) bucket.income += Number(inv.totalAmount || 0);
        }
        for (const po of pos) {
            const bucket = bucketFor(po.poDate);
            if (bucket) bucket.expense += Number(po.totalAmount || 0);
        }

        const monthlyTrend = Array.from(monthlyMap.values())
            .sort((a, b) => (a.year - b.year) || (a.month - b.month))
            .slice(-7)
            .map((b) => ({ name: b.name, income: b.income, expense: b.expense, cashFlow: b.income - b.expense }));

        // --- Recent transactions: real invoices (+) and POs/ledger (-) ---
        const txns: { id: string; date: string; sortDate: number; description: string; category: string; amount: number; status: string }[] = [];

        for (const inv of invoices) {
            const d = inv.invoiceDate ? new Date(inv.invoiceDate) : null;
            txns.push({
                id: inv.id,
                date: d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : '',
                sortDate: d && !isNaN(d.getTime()) ? d.getTime() : 0,
                description: inv.invoiceNumber ? `Invoice ${inv.invoiceNumber}` : 'Sales Invoice',
                category: 'Income',
                amount: Number(inv.totalAmount || 0),
                status: inv.status || 'Draft',
            });
        }
        for (const po of pos) {
            const d = po.poDate ? new Date(po.poDate) : null;
            txns.push({
                id: po.id,
                date: d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : '',
                sortDate: d && !isNaN(d.getTime()) ? d.getTime() : 0,
                description: po.poNumber ? `PO ${po.poNumber} - ${po.vendorName || ''}`.trim() : 'Purchase Order',
                category: 'Materials',
                amount: -Number(po.totalAmount || 0),
                status: po.status || 'Draft',
            });
        }
        for (const entry of ledgerEntries) {
            const d = entry.postingDate ? new Date(entry.postingDate) : null;
            const net = Number(entry.debitAmount) - Number(entry.creditAmount);
            txns.push({
                id: entry.id,
                date: d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : '',
                sortDate: d && !isNaN(d.getTime()) ? d.getTime() : 0,
                description: entry.description || 'Ledger Entry',
                category: 'Misc/Overhead',
                amount: -net,
                status: entry.status || 'Draft',
            });
        }

        const recentTransactions = txns
            .sort((a, b) => b.sortDate - a.sortDate)
            .slice(0, 5)
            .map(({ sortDate, ...rest }) => rest);

        return {
            budget,
            totalIncome,
            totalExpenditure,
            margin,
            materialExpenditure,
            laborExpenditure,
            miscExpenditure,
            expensesByCategory,
            monthlyTrend,
            recentTransactions,
        };
    }
}
