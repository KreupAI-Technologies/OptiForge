import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  ChartOfAccounts,
  GeneralLedger,
  JournalEntry,
  JournalEntryLine,
  Invoice,
  InvoiceLine,
  Payment,
  BankAccount,
  BankReconciliation,
  BankStatement,
  ReconciliationMatch,
  FinancialYear,
  FinancialPeriod,
  Budget,
  BudgetLine,
  CostCenter,
  StandardCost,
  VarianceAnalysis,
  WIPAccounting,
  JobCostSheet,
  CashFlowTransaction,
  AnticipatedReceipt,
  AnticipatedPayment,
  FixedAsset,
  AssetDepreciation,
  AssetMaintenance,
  TaxMaster,
  GSTTransaction,
  TDSTransaction,
  GSTRPeriod,
} from './entities';

// Controllers
import {
  ChartOfAccountsController,
  ChartOfAccountsSeederController,
  JournalEntryController,
  InvoiceController,
  PaymentController,
  FinancialReportsController,
  JobCostSheetController,
  BudgetController,
  FixedAssetController,
  CostCenterController,
  TaxMasterController,
  CashAnalyticsController,
} from './controllers';

// Services
import {
  ChartOfAccountsService,
  ChartOfAccountsSeederService,
  JournalEntryService,
  InvoiceService,
  PaymentService,
  FinancialReportsService,
  FinancialPeriodSeederService,
  TaxConfigSeederService,
  CostCenterSeederService,
  JobCostSheetService,
  BudgetCrudService,
  FixedAssetService,
  CostCenterCrudService,
  TaxMasterService,
  CashAnalyticsService,
} from './services';
import { AccountsReceivableService } from './services/accounts-receivable.service';
import { AccountsPayableService } from './services/accounts-payable.service';
import { BankReconciliationService } from './services/bank-reconciliation.service';
import { ConsolidationService } from './services/consolidation.service';
import { FinanceSeederService } from './services/finance-seeder.service';
import { Company } from '../core/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Core Accounting
      ChartOfAccounts,
      GeneralLedger,
      Company,

      // Journal Entries
      JournalEntry,
      JournalEntryLine,

      // Invoicing
      Invoice,
      InvoiceLine,

      // Payments
      Payment,

      // Banking
      BankAccount,
      BankReconciliation,
      BankStatement,
      ReconciliationMatch,

      // Financial Periods
      FinancialYear,
      FinancialPeriod,

      // Budgeting
      Budget,
      BudgetLine,

      // Cost Accounting
      CostCenter,
      StandardCost,
      VarianceAnalysis,
      WIPAccounting,
      JobCostSheet,

      // Cash Flow
      CashFlowTransaction,
      AnticipatedReceipt,
      AnticipatedPayment,

      // Fixed Assets
      FixedAsset,
      AssetDepreciation,
      AssetMaintenance,

      // Taxation
      TaxMaster,
      GSTTransaction,
      TDSTransaction,
      GSTRPeriod,
    ]),
  ],
  controllers: [
    ChartOfAccountsController,
    ChartOfAccountsSeederController,
    JournalEntryController,
    InvoiceController,
    PaymentController,
    FinancialReportsController,
    JobCostSheetController,
    BudgetController,
    FixedAssetController,
    CostCenterController,
    TaxMasterController,
    CashAnalyticsController,
  ],
  providers: [
    ChartOfAccountsService,
    ChartOfAccountsSeederService,
    JournalEntryService,
    InvoiceService,
    PaymentService,
    FinancialReportsService,
    AccountsReceivableService,
    AccountsPayableService,
    BankReconciliationService,
    FinancialPeriodSeederService,
    TaxConfigSeederService,
    CostCenterSeederService,
    ConsolidationService,
    FinanceSeederService,
    JobCostSheetService,
    BudgetCrudService,
    FixedAssetService,
    CostCenterCrudService,
    TaxMasterService,
    CashAnalyticsService,
  ],
  exports: [
    ChartOfAccountsService,
    ChartOfAccountsSeederService,
    JournalEntryService,
    InvoiceService,
    PaymentService,
    FinancialReportsService,
    AccountsReceivableService,
    AccountsPayableService,
    BankReconciliationService,
    FinancialPeriodSeederService,
    TaxConfigSeederService,
    CostCenterSeederService,
    ConsolidationService,
    FinanceSeederService,
  ],
})
export class FinanceModule { }
