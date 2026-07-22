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
  GstReturn,
  TdsReturn,
  TdsChallan,
  PeriodCloseStep,
} from './entities';
import { ApVendorAccount } from './entities/ap-vendor-account.entity';
import { ArCustomerAccount } from './entities/ar-customer-account.entity';
import { AdvancedFeature } from './entities/advanced-feature.entity';
import { IntercompanyTransaction } from './entities/intercompany-transaction.entity';
import { CashTransaction } from './entities/cash-transaction.entity';
import { CurrencyMaster } from './entities/currency-master.entity';
import { CollectionActivity } from './entities/collection-activity.entity';
import { PaymentReminder } from './entities/payment-reminder.entity';
import { ForecastScenario } from './entities/forecast-scenario.entity';
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
  FinanceIntegration,
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
import { IntercompanyTransactionController } from './controllers/intercompany-transaction.controller';
import { CashTransactionController } from './controllers/cash-transaction.controller';
import { CurrencyMasterController } from './controllers/currency-master.controller';
import { CollectionActivityController } from './controllers/collection-activity.controller';
import { PaymentReminderController } from './controllers/payment-reminder.controller';
import { ForecastScenarioController } from './controllers/forecast-scenario.controller';

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
import { IntercompanyTransactionService } from './services/intercompany-transaction.service';
import { CashTransactionService } from './services/cash-transaction.service';
import { CurrencyMasterService } from './services/currency-master.service';
import { CollectionActivityService } from './services/collection-activity.service';
import { PaymentReminderService } from './services/payment-reminder.service';
import { ForecastScenarioService } from './services/forecast-scenario.service';
import { FinanceExtrasService } from './services/finance-extras.service';
import { FinanceExtrasController } from './controllers/finance-extras.controller';
import { FinanceOperationsService } from './services/finance-operations.service';
import { FinanceOperationsController } from './controllers/finance-operations.controller';
import { Company } from '../core/entities/company.entity';

// Statutory filings + period close + reports export
import { GstReturnService } from './services/gst-return.service';
import { TdsReturnService } from './services/tds-return.service';
import { PeriodCloseService } from './services/period-close.service';
import { GstReturnController } from './controllers/gst-return.controller';
import { TdsReturnController } from './controllers/tds-return.controller';
import { PeriodCloseController } from './controllers/period-close.controller';
import { ProfitLossExportController } from './controllers/profit-loss-export.controller';

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

      // Statutory filings (GST/TDS returns, challans) + period close
      GstReturn,
      TdsReturn,
      TdsChallan,
      PeriodCloseStep,

      // Accounts Payable / Receivable master
      ApVendorAccount,
      ArCustomerAccount,
      AdvancedFeature,

      // Net-new finance subsystems
      IntercompanyTransaction,
      CashTransaction,
      CurrencyMaster,
      CollectionActivity,
      PaymentReminder,
      ForecastScenario,

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
      FinanceIntegration,
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
    IntercompanyTransactionController,
    CashTransactionController,
    CurrencyMasterController,
    CollectionActivityController,
    PaymentReminderController,
    ForecastScenarioController,
    FinanceExtrasController,
    FinanceOperationsController,
    GstReturnController,
    TdsReturnController,
    PeriodCloseController,
    ProfitLossExportController,
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
    IntercompanyTransactionService,
    CashTransactionService,
    CurrencyMasterService,
    CollectionActivityService,
    PaymentReminderService,
    ForecastScenarioService,
    FinanceExtrasService,
    FinanceOperationsService,
    GstReturnService,
    TdsReturnService,
    PeriodCloseService,
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
