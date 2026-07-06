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
import { ApVendorAccount } from './entities/ap-vendor-account.entity';
import { ArCustomerAccount } from './entities/ar-customer-account.entity';
import { AdvancedFeature } from './entities/advanced-feature.entity';
import {
  FinanceExchangeRate,
  FinanceRecurringTransaction,
  FinanceApprovalWorkflow,
  FinanceAlert,
  FinanceDocument,
  FinanceAuditTrail,
  FinanceCreditLimit,
  FinanceInvestment,
  FinanceReportTemplate,
} from './entities/finance-extras.entity';

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
import { AdvancedAnalyticsController } from './controllers/advanced-analytics.controller';
import { ApVendorAccountController } from './controllers/ap-vendor-account.controller';
import { ArCustomerAccountController } from './controllers/ar-customer-account.controller';
import { AdvancedFeatureController } from './controllers/advanced-feature.controller';

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
import { AdvancedAnalyticsService } from './services/advanced-analytics.service';
import { ApVendorAccountService } from './services/ap-vendor-account.service';
import { ArCustomerAccountService } from './services/ar-customer-account.service';
import { AdvancedFeatureService } from './services/advanced-feature.service';
import { FinanceExtrasService } from './services/finance-extras.service';
import { FinanceExtrasController } from './controllers/finance-extras.controller';
import { FinanceOperationsService } from './services/finance-operations.service';
import { FinanceOperationsController } from './controllers/finance-operations.controller';
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

      // Accounts Payable / Receivable master
      ApVendorAccount,
      ArCustomerAccount,
      AdvancedFeature,

      // Finance extras (new page-backing entities)
      FinanceExchangeRate,
      FinanceRecurringTransaction,
      FinanceApprovalWorkflow,
      FinanceAlert,
      FinanceDocument,
      FinanceAuditTrail,
      FinanceCreditLimit,
      FinanceInvestment,
      FinanceReportTemplate,
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
    AdvancedAnalyticsController,
    ApVendorAccountController,
    ArCustomerAccountController,
    AdvancedFeatureController,
    FinanceExtrasController,
    FinanceOperationsController,
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
    AdvancedAnalyticsService,
    ApVendorAccountService,
    ArCustomerAccountService,
    AdvancedFeatureService,
    FinanceExtrasService,
    FinanceOperationsService,
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
