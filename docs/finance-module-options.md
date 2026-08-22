# Finance Module — Menu & Options

**Location:** `b3-erp/frontend/src/app/(modules)/finance`
**Backend:** `b3-erp/backend/src/modules/finance` (NestJS, port 3001)
**Scale:** 43 top-level options across 119 pages

> Legend: sub-items marked _(CRUD)_ are list/detail/add/edit routes, not standalone menu entries.

---

## Core Accounting

### accounting
- Chart of Accounts — `accounting/chart-of-accounts`
- General Ledger — `accounting/general-ledger`
- Journal Entries — `accounting/journal-entries`
- Ledger Report — `accounting/ledger-report`
- Trial Balance — `accounting/trial-balance`
- Periods — `accounting/periods`
- _(CRUD)_ `accounting/add` · `accounting/edit/[id]` · `accounting/view/[id]`

### general-ledger
- General Ledger — `general-ledger`

### ledger
- Ledger Detail — `ledger/[id]` _(CRUD)_

### journal
- Journal Detail — `journal/[id]` _(CRUD)_

### period-operations
- Period Close — `period-operations/period-close`
- Close — `period-operations/close`
- Year-End — `period-operations/year-end`

### periods
- Periods — `periods`

---

## Payables & Receivables

### accounts-payable
- Accounts Payable — `accounts-payable`

### payables
- Bills — `payables/bills`
- Payments — `payables/payments`
- Aging — `payables/aging`
- Vendor Management — `payables/vendor-management`
- _(CRUD)_ `payables/add` · `payables/edit/[id]` · `payables/view/[id]`

### accounts-receivable
- Accounts Receivable — `accounts-receivable`

### receivables
- Invoices — `receivables/invoices`
- Collections — `receivables/collections`
- Aging — `receivables/aging`
- Credit Management — `receivables/credit-management`
- _(CRUD)_ `receivables/add` · `receivables/edit/[id]` · `receivables/view/[id]`

### credit
- Credit — `credit`

---

## Billing, Invoices & Payments

### billing
- Billing — `billing`

### invoices
- Invoices — `invoices`
- _(CRUD)_ `invoices/add` · `invoices/add-enhanced` · `invoices/edit/[id]` · `invoices/view/[id]`

### payments
- Payments — `payments`
- _(CRUD)_ `payments/add` · `payments/edit/[id]` · `payments/view/[id]`

### payment-verification
- Payment Verification — `payment-verification`

### expense-claims
- Expense Claims — `expense-claims`
- Claim Detail — `expense-claims/[id]` _(CRUD)_

---

## Cash & Banking

### cash
- Bank Accounts — `cash/bank-accounts`
- Bank Reconciliation — `cash/bank-reconciliation`
- Cash Flow Forecast — `cash/cash-flow-forecast`
- Anticipated Receipts — `cash/anticipated-receipts`
- Anticipated Payments — `cash/anticipated-payments`

### cash-flow
- Cash Flow — `cash-flow`

### petty-cash
- Petty Cash — `petty-cash`

### banks
- Banks — `banks`

### bank-reconciliation
- Bank Reconciliation — `bank-reconciliation`

### reconciliation
- Reconciliation — `reconciliation`

---

## Budgeting & Costing

### budget
- Budget — `budget`

### budgeting
- Budgets — `budgeting/budgets`
- Budget vs Actual — `budgeting/budget-vs-actual`
- Multi-Year Planning — `budgeting/multi-year-planning`

### cost-centers
- Cost Centers — `cost-centers`

### costing
- Cost Centers — `costing/cost-centers`
- Profit Centers — `costing/profit-centers`
- Job Costing — `costing/job-costing`
- Standard Costing — `costing/standard-costing`
- Variance Analysis — `costing/variance-analysis`
- WIP Accounting — `costing/wip-accounting`
- _(CRUD)_ `costing/edit/[id]` · `costing/view/[id]`

---

## Assets, Investments & Currency

### assets
- Fixed Assets — `assets/fixed-assets`
- Depreciation — `assets/depreciation`
- Asset Disposal — `assets/asset-disposal`

### investments
- Investments — `investments`

### currency
- Exchange Rates — `currency/exchange-rates`
- Management — `currency/management`

### multi-currency
- Multi-Currency — `multi-currency`

### tax
- GST — `tax/gst`
- TDS — `tax/tds`
- Tax Reports — `tax/tax-reports`

---

## Reporting & Analytics

### dashboard
- Dashboard — `dashboard`

### analytics
- KPI Dashboard — `analytics/kpi-dashboard`
- Financial Ratios — `analytics/financial-ratios`
- Profitability Analysis — `analytics/profitability-analysis`

### reporting
- Report Builder — `reporting/report-builder`

### reports
- Balance Sheet — `reports/balance-sheet`
- Profit & Loss — `reports/profit-loss`
- Cash Flow — `reports/cash-flow`
- Trial Balance — `reports/trial-balance`

### consolidation
- Financial Consolidation — `consolidation/financial-consolidation`
- Intercompany — `consolidation/intercompany`

---

## Controls & Automation

### controls
- Approval Workflows — `controls/approval-workflows`
- Audit Trail — `controls/audit-trail`
- Documents — `controls/documents`

### workflows
- Workflows — `workflows`

### automation
- Recurring Transactions — `automation/recurring-transactions`
- Workflows — `automation/workflows`
- Alerts — `automation/alerts`

### advanced-features
- Advanced Features — `advanced-features`

### integration
- Procurement Integration — `integration/procurement`
- Production Integration — `integration/production`

### integrations
- Integrations — `integrations`

---

## Notes — Potential Duplicate / Legacy Routes
The following near-duplicate pairs likely overlap or are legacy routes and should be reviewed/consolidated:

| Pair | Observation |
|------|-------------|
| `budget` / `budgeting` | `budget` is a single stub; `budgeting` holds the real sub-pages |
| `payables` / `accounts-payable` | `payables` has full sub-pages; `accounts-payable` is a single page |
| `receivables` / `accounts-receivable` | `receivables` has full sub-pages; `accounts-receivable` is a single page |
| `cost-centers` / `costing/cost-centers` | Same concept in two locations |
| `bank-reconciliation` / `reconciliation` / `cash/bank-reconciliation` | Three reconciliation entry points |
| `cash-flow` / `cash/cash-flow-forecast` / `reports/cash-flow` | Three cash-flow views |
| `reporting` / `reports` | `reporting` = builder; `reports` = statements |
| `integration` / `integrations` | Overlapping integration hubs |
| `currency` / `multi-currency` | Overlapping currency areas |
| `general-ledger` / `accounting/general-ledger` | GL exposed at two paths |
| `periods` / `accounting/periods` / `period-operations` | Period management spread across three areas |
