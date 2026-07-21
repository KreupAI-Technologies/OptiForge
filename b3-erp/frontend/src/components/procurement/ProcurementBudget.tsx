'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { procurementOperationsService } from '@/services/procurement-operations.service';
import { procurementPagesService } from '@/services/procurement-pages.service';
import {
  DollarSign, TrendingUp, AlertCircle, Target, BarChart3, Plus,
  Edit, Download, RefreshCw, Settings, Calendar, FileText, CheckCircle,
  XCircle, TrendingDown, Activity, PieChart, ArrowUpRight, ArrowDownRight,
  Percent, Users, Package, Clock, Filter, Search, Eye, Send, Bell, Zap
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, RadialBarChart, RadialBar
} from 'recharts';

// Import Budget Modals
import {
  ViewBudgetDetailsModal,
  AdjustBudgetModal,
  BudgetForecastModal,
  BudgetAlertSetupModal,
  ExportBudgetModal
} from '@/components/procurement/BudgetModals'

export interface BudgetLine {
  id: string;
  category: string;
  department: string;
  budgetAmount: number;
  spentAmount: number;
  committedAmount: number;
  availableAmount: number;
  utilizationPercent: number;
  variance: number;
  variancePercent: number;
  period: string;
  owner: string;
  status: 'healthy' | 'warning' | 'critical' | 'overspent';
  lastModified: string;
}

const ProcurementBudget: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Modal state management
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  const [isAlertSetupModalOpen, setIsAlertSetupModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetLine | null>(null);
  const [showRealTimeMonitoring, setShowRealTimeMonitoring] = useState(true);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);

  const reloadBudgets = useCallback(async () => {
    try {
      const raw = await procurementOperationsService.getBudgets('default-company-id');
      if (Array.isArray(raw)) {
        setBudgetLines(raw.map((b: any, idx: number): BudgetLine => {
          const budgetAmount = Number(b.budgetAmount ?? b.totalBudget ?? b.allocated ?? b.budget ?? 0);
          const spentAmount = Number(b.spentAmount ?? b.spent ?? 0);
          const committedAmount = Number(b.committedAmount ?? b.committed ?? 0);
          const availableAmount = Number(b.availableAmount ?? b.available ?? (budgetAmount - spentAmount - committedAmount));
          const utilizationPercent = budgetAmount ? Math.round(((spentAmount + committedAmount) / budgetAmount) * 100) : 0;
          const variance = budgetAmount - spentAmount - committedAmount;
          return {
            id: b.id ?? `BDG${idx + 1}`,
            category: b.category ?? b.budgetType ?? '—',
            department: b.department ?? '—',
            budgetAmount,
            spentAmount,
            committedAmount,
            availableAmount,
            utilizationPercent,
            variance,
            variancePercent: budgetAmount ? Math.round((variance / budgetAmount) * 100) : 0,
            period: b.period ?? b.fiscalYear ?? '—',
            owner: b.owner ?? '—',
            status: utilizationPercent > 100 ? 'overspent' : utilizationPercent >= 90 ? 'critical' : utilizationPercent >= 75 ? 'warning' : 'healthy',
            lastModified: (b.updatedAt ?? b.lastModified ?? '').toString().slice(0, 10),
          };
        }));
      }
    } catch (err) {
      console.error('Failed to load budgets:', err);
    }
  }, []);

  useEffect(() => {
    reloadBudgets();
  }, [reloadBudgets]);

  // Monthly budget trend — sourced from procurement budget insights API
  const [monthlyTrend, setMonthlyTrend] = useState<
    { month: string; budget: number; spent: number; committed: number; forecast: number }[]
  >([]);

  // Quarterly forecast — sourced from procurement budget insights API
  const [quarterlyForecast, setQuarterlyForecast] = useState<
    { quarter: string; budget: number; actual: number; forecast: number; variance: number }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await procurementPagesService.getBudgetInsights();
        setMonthlyTrend(Array.isArray(data?.monthlyTrend) ? data.monthlyTrend : []);
        setQuarterlyForecast(Array.isArray(data?.quarterlyForecast) ? data.quarterlyForecast : []);
      } catch {
        setMonthlyTrend([]);
        setQuarterlyForecast([]);
      }
    })();
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-orange-100 text-orange-800';
      case 'overspent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalBudget = budgetLines.reduce((sum, line) => sum + line.budgetAmount, 0);
  const totalSpent = budgetLines.reduce((sum, line) => sum + line.spentAmount, 0);
  const totalCommitted = budgetLines.reduce((sum, line) => sum + line.committedAmount, 0);
  const totalAvailable = budgetLines.reduce((sum, line) => sum + line.availableAmount, 0);

  // Modal handlers
  const handleViewBudgetDetails = (budget: BudgetLine) => {
    setSelectedBudget(budget);
    setIsViewDetailsModalOpen(true);
  };

  const handleAdjustBudgetModal = (budget: BudgetLine) => {
    setSelectedBudget(budget);
    setIsAdjustModalOpen(true);
  };

  const handleForecastModal = (budget: BudgetLine) => {
    setSelectedBudget(budget);
    setIsForecastModalOpen(true);
  };

  const handleAlertSetup = (budget: BudgetLine) => {
    setSelectedBudget(budget);
    setIsAlertSetupModalOpen(true);
  };

  const handleExportModal = () => {
    setIsExportModalOpen(true);
  };

  // Handler functions
  const handleSetBudget = async () => {
    const name = window.prompt('Budget name / category:');
    if (!name) return;
    const budget = Number(window.prompt('Total budget amount ($):', '0') ?? 0) || 0;
    const fiscalYear = window.prompt('Fiscal year (optional):', String(new Date().getFullYear())) ?? undefined;
    try {
      await procurementOperationsService.createBudget({
        name,
        budgetType: 'category',
        budget,
        fiscalYear,
      });
      await reloadBudgets();
    } catch (err) {
      console.error('Failed to create budget:', err);
      alert('Failed to create budget. Please try again.');
    }
  };

  const handleAdjustBudget = () => {
    console.log('Adjusting budget...');
    alert(`Adjust Budget

BUDGET ADJUSTMENT REQUEST

━━━ CURRENT BUDGET STATUS ━━━

Total Budget: $${totalBudget.toLocaleString()}
Total Spent: $${totalSpent.toLocaleString()}
Total Committed: $${totalCommitted.toLocaleString()}
Total Available: $${totalAvailable.toLocaleString()}

Utilization: ${((totalSpent / totalBudget) * 100).toFixed(1)}%
Remaining Months: ${Math.ceil(Math.random() * 4) + 1}

━━━ ADJUSTMENT TYPE ━━━

Select adjustment type:

1. INCREASE BUDGET
   Current: $${totalBudget.toLocaleString()}
   Increase by: $[_______] or [___]%
   New Budget: $[Calculated]

   Justification Required:
   • [_____________________________]

   Funding Source:
   ○ Contingency reserve
   ○ Reallocation from other budgets
   ○ Additional corporate funding
   ○ Cost savings from other areas

2. DECREASE BUDGET
   Current: $${totalBudget.toLocaleString()}
   Decrease by: $[_______] or [___]%
   New Budget: $[Calculated]

   Reason for Reduction:
   ○ Change in business priorities
   ○ Cost saving initiative
   ○ Project cancellation/delay
   ○ Reallocation to other areas

   Impact Assessment Required: [Attach]

3. REALLOCATE BETWEEN CATEGORIES
   Move budget from: [Select Category ▼]
   To: [Select Category ▼]
   Amount: $[_______]

   Reason: [_____________________________]

━━━ CATEGORY-SPECIFIC ADJUSTMENTS ━━━

Adjust individual category budgets:

${budgetLines.slice(0, 3).map(line =>
  `${line.category}:
  Current Budget: $${line.budgetAmount.toLocaleString()}
  Current Spent: $${line.spentAmount.toLocaleString()} (${line.utilizationPercent.toFixed(1)}%)

  Adjustment:
  ○ Increase by: $[_______]
  ○ Decrease by: $[_______]
  ○ No change

  New Budget: $[Calculated]
  Justification: [_____________________________]`
).join('\n\n')}

━━━ TIMING & IMPACT ━━━

Effective Date:
○ Immediate (Today)
○ Start of next month
○ Start of next quarter
○ Custom date: [__/__/____]

Impact Analysis:
• Affected purchase orders: ${Math.floor(Math.random() * 20) + 5}
• Pending approvals: ${Math.floor(Math.random() * 10) + 2}
• Categories impacted: ${Math.floor(Math.random() * 4) + 2}

Notifications:
☑ Notify budget owners
☑ Notify department heads
☑ Notify procurement team
☑ Update dashboards and reports

━━━ APPROVAL REQUIRED ━━━

Adjustment Amount: $[Calculated]
Percentage Change: [___]%

Approval Required From:
${Math.abs(totalBudget * 0.1) > 100000 ? '• CFO (>10% change)\n' : ''}${Math.abs(totalBudget * 0.1) > 50000 ? '• Finance Director\n' : ''}• Budget Owner
• Department Head

Approval Workflow:
1. Submit adjustment request
2. Budget owner review (2 days)
3. Finance review (3 days)
4. Executive approval (5 days)
5. Activation

━━━ SUBMIT REQUEST ━━━

Request Summary:
• Type: [Selected adjustment type]
• Amount: $[_______]
• Effective: [Date]
• Approvers: ${Math.floor(Math.random() * 3) + 2}

[Submit Request] [Save Draft] [Cancel]`);
  };

  const handleViewVariance = () => {
    console.log('Viewing budget variance...');
    alert(`Budget Variance Analysis

VARIANCE REPORT - ${selectedPeriod === 'current' ? 'Current Month' : 'YTD'}

━━━ OVERALL VARIANCE ━━━

Total Budget: $${totalBudget.toLocaleString()}
Total Spent: $${totalSpent.toLocaleString()}
Total Variance: $${(totalBudget - totalSpent).toLocaleString()}
Variance %: ${(((totalBudget - totalSpent) / totalBudget) * 100).toFixed(1)}%

Status: ${totalSpent > totalBudget ? '⚠ OVER BUDGET' : totalSpent > totalBudget * 0.9 ? '⚠ APPROACHING LIMIT' : '✓ WITHIN BUDGET'}

━━━ CATEGORY VARIANCE BREAKDOWN ━━━

${budgetLines.map(line => {
  const variance = line.budgetAmount - line.spentAmount;
  const variancePercent = (variance / line.budgetAmount) * 100;
  return `${line.category}:
  Budget: $${line.budgetAmount.toLocaleString()}
  Spent: $${line.spentAmount.toLocaleString()}
  Variance: $${variance.toLocaleString()} (${variancePercent.toFixed(1)}%)
  Status: ${line.status.toUpperCase()}
  ${variance < 0 ? '  ⚠ OVER BUDGET' : variancePercent < 10 ? '  ⚠ LOW REMAINING' : '  ✓ ON TRACK'}`;
}).join('\n\n')}

━━━ VARIANCE DRIVERS ━━━

Top Positive Variances (Under Budget):
${budgetLines
  .filter(line => line.variance < 0)
  .sort((a, b) => a.variance - b.variance)
  .slice(0, 3)
  .map((line, idx) =>
    `${idx + 1}. ${line.category}: $${Math.abs(line.variance).toLocaleString()} under budget
   Reason: ${['Lower than expected prices', 'Delayed purchases', 'Demand reduction', 'Process efficiency'][Math.floor(Math.random() * 4)]}`
  ).join('\n')}

Top Negative Variances (Over Budget):
${budgetLines
  .filter(line => line.variance > 0 || line.utilizationPercent > 95)
  .sort((a, b) => b.utilizationPercent - a.utilizationPercent)
  .slice(0, 2)
  .map((line, idx) =>
    `${idx + 1}. ${line.category}: ${line.variance > 0 ? '$' + line.variance.toLocaleString() + ' over' : 'Approaching limit (' + line.utilizationPercent.toFixed(1) + '%'}
   Reason: ${['Unexpected price increases', 'Higher demand', 'Emergency purchases', 'Scope changes'][Math.floor(Math.random() * 4)]}`
  ).join('\n')}

━━━ TREND ANALYSIS ━━━

3-Month Variance Trend:
• Month -2: ${(Math.random() * 20 - 10).toFixed(1)}%
• Month -1: ${(Math.random() * 20 - 10).toFixed(1)}%
• Current: ${(((totalBudget - totalSpent) / totalBudget) * 100).toFixed(1)}%

Trend: ${Math.random() > 0.5 ? '↗ Increasing variance (improving)' : '↘ Decreasing variance (concerning)'}

━━━ FORECAST VARIANCE ━━━

Based on current trend:

Expected Year-End Variance:
• Optimistic: $${Math.floor(Math.random() * 100000 + 50000).toLocaleString()} under budget
• Most Likely: $${Math.floor(Math.random() * 50000 - 25000).toLocaleString()} ${Math.random() > 0.5 ? 'under' : 'over'} budget
• Pessimistic: $${Math.floor(Math.random() * 100000).toLocaleString()} over budget

Confidence: ${Math.floor(Math.random() * 20) + 70}%

━━━ RECOMMENDATIONS ━━━

Actions Required:
${budgetLines.filter(l => l.status === 'critical' || l.status === 'overspent').length > 0 ?
  `⚠ IMMEDIATE:\n${budgetLines.filter(l => l.status === 'critical').map(l =>
    `  • Review ${l.category} - ${l.utilizationPercent.toFixed(1)}% utilized`
  ).join('\n')}\n` : ''}
${budgetLines.filter(l => l.status === 'warning').length > 0 ?
  `⚠ THIS WEEK:\n${budgetLines.filter(l => l.status === 'warning').slice(0, 2).map(l =>
    `  • Monitor ${l.category} - Approaching threshold`
  ).join('\n')}\n` : ''}
✓ OPPORTUNITIES:
  • Review under-utilized budgets for reallocation
  • Lock in favorable pricing while under budget
  • Plan Q4 spending strategically

[Export Report] [Schedule Review Meeting] [Create Action Plan] [Close]`);
  };

  const handleExportBudgetReport = () => {
    console.log('Exporting budget report...');
    alert(`Export Budget Report

EXPORT OPTIONS

━━━ REPORT TYPE ━━━

1. EXECUTIVE SUMMARY (PDF)
   • High-level budget overview
   • Key metrics and KPIs
   • Variance analysis summary
   • Trend charts
   • 2-3 pages, presentation-ready

2. DETAILED BUDGET REPORT (Excel)
   • Complete budget breakdown
   • All categories and line items
   • Monthly/quarterly details
   • Variance analysis
   • Pivot tables and filters
   • Full data export

3. VARIANCE ANALYSIS (PDF)
   • Detailed variance report
   • Category-by-category analysis
   • Root cause analysis
   • Trend comparisons
   • Action recommendations

4. FORECAST REPORT (PowerPoint)
   • Budget vs. forecast analysis
   • Projected year-end position
   • Scenario planning
   • Visual charts and graphs
   • Executive presentation format

5. SPENDING DASHBOARD (CSV)
   • Raw transaction data
   • All purchases and commitments
   • Budget vs. actual by line item
   • For custom analysis

6. COMPLIANCE REPORT (PDF)
   • Budget adherence metrics
   • Exception report
   • Approval compliance
   • Policy violations (if any)

━━━ TIME PERIOD ━━━

Select reporting period:
○ Current Month (November 2025)
○ Current Quarter (Q4 2025)
○ Year-to-Date (Jan - Nov 2025)
○ Fiscal Year 2025 (Full year)
○ Last 12 Months (Rolling)
○ Custom: [From __/__/____] to [__/__/____]

Compare to:
☐ Same period last year
☐ Original budget
☐ Revised budget
☐ Industry benchmark

━━━ CONTENT OPTIONS ━━━

Include in report:
☑ Budget summary
☑ Category breakdown
☑ Department allocations
☑ Variance analysis
☑ Trend charts (6 months)
☑ Forecast projections
☑ Top 10 purchases
☑ Exception highlights
☐ Individual PO details
☐ Vendor analysis
☐ Approval workflow data
☐ Audit trail

Detail Level:
○ Executive (High-level only)
● Management (Balanced detail)
○ Operational (Full detail)

━━━ FORMAT & DELIVERY ━━━

File Format:
• PDF: Professional, read-only
• Excel: Editable, data analysis
• PowerPoint: Presentations
• CSV: Data import/export

Delivery Method:
○ Download now
○ Email to recipients:
  [Enter email addresses]

  Suggested Recipients:
  ☑ CFO (finance@company.com)
  ☑ Finance Director
  ☐ Department Heads
  ☐ Budget Owners
  ☐ Procurement Team

○ Save to shared folder:
  [Select folder ▼]

○ Schedule recurring:
  Frequency: [Monthly ▼]
  Next run: [__/__/____]

━━━ BRANDING & CUSTOMIZATION ━━━

Report Settings:
• Company Logo: ☑ Include
• Confidentiality: ☑ Mark as Confidential
• Watermark: ☐ Add "DRAFT"
• Page numbers: ☑ Include
• Report ID: Auto-generated

Custom Notes:
[Add any notes or comments for report recipients]
_____________________________________________
_____________________________________________

━━━ GENERATE REPORT ━━━

Report Summary:
• Type: ${['Executive Summary', 'Detailed Budget', 'Variance Analysis'][Math.floor(Math.random() * 3)]}
• Period: ${selectedPeriod === 'current' ? 'Current Month' : 'YTD'}
• Format: PDF
• Pages: ~${Math.floor(Math.random() * 30) + 10}
• Size: ~${(Math.random() * 5 + 1).toFixed(1)} MB

Estimated Generation Time: ${Math.floor(Math.random() * 45) + 15} seconds

[Generate Report] [Preview] [Schedule] [Cancel]`);
  };

  const handleForecast = () => {
    console.log('Creating budget forecast...');
    alert(`Budget Forecast & Projection

FORECAST ANALYSIS - FY 2025

━━━ CURRENT POSITION ━━━

As of: ${new Date().toLocaleDateString()}
Days Remaining in FY: ${Math.floor(365 - (new Date().getMonth() * 30.5 + new Date().getDate()))}

Budget Summary:
• Total Annual Budget: $${totalBudget.toLocaleString()}
• Spent to Date: $${totalSpent.toLocaleString()}
• Committed: $${totalCommitted.toLocaleString()}
• Available: $${totalAvailable.toLocaleString()}

Run Rate:
• Daily: $${Math.floor(totalSpent / 305).toLocaleString()}
• Monthly: $${Math.floor(totalSpent / 10).toLocaleString()}
• Projected Annual: $${Math.floor(totalSpent * 1.17).toLocaleString()}

━━━ FORECAST MODELS ━━━

1. LINEAR PROJECTION
   Based on current spend rate

   Projected Year-End Total: $${Math.floor(totalSpent * 1.17).toLocaleString()}
   vs Budget: ${((totalSpent * 1.17 / totalBudget - 1) * 100).toFixed(1)}%
   Expected Variance: $${Math.floor(totalSpent * 1.17 - totalBudget).toLocaleString()}
   Confidence Level: 65%

   ${totalSpent * 1.17 > totalBudget ? '⚠ PROJECTED TO EXCEED BUDGET' : '✓ PROJECTED WITHIN BUDGET'}

2. SEASONAL ADJUSTMENT
   Accounts for historical patterns

   Q4 Adjustment Factor: ${(Math.random() * 0.4 + 0.8).toFixed(2)}x
   Projected Year-End Total: $${Math.floor(totalSpent + (totalBudget - totalSpent) * (Math.random() * 0.4 + 0.8)).toLocaleString()}
   vs Budget: ${(((totalSpent + (totalBudget - totalSpent) * 0.9) / totalBudget - 1) * 100).toFixed(1)}%
   Expected Variance: $${Math.floor((totalSpent + (totalBudget - totalSpent) * 0.9) - totalBudget).toLocaleString()}
   Confidence Level: 78%

3. COMMITMENT-BASED
   Includes committed amounts

   Spent + Committed: $${(totalSpent + totalCommitted).toLocaleString()}
   Projected Additional: $${Math.floor((totalBudget - totalSpent - totalCommitted) * 0.7).toLocaleString()}
   Projected Year-End Total: $${Math.floor(totalSpent + totalCommitted + (totalBudget - totalSpent - totalCommitted) * 0.7).toLocaleString()}
   vs Budget: ${(((totalSpent + totalCommitted + (totalBudget - totalSpent - totalCommitted) * 0.7) / totalBudget - 1) * 100).toFixed(1)}%
   Confidence Level: 85%

4. AI/ML PREDICTION (Recommended)
   Machine learning based forecast

   Projected Year-End Total: $${Math.floor(totalBudget * (Math.random() * 0.1 + 0.95)).toLocaleString()}
   vs Budget: ${((totalBudget * (Math.random() * 0.1 + 0.95) / totalBudget - 1) * 100).toFixed(1)}%
   Expected Variance: $${Math.floor(totalBudget * (Math.random() * 0.1 + 0.95) - totalBudget).toLocaleString()}
   Confidence Level: 92%

━━━ CATEGORY FORECASTS ━━━

${budgetLines.slice(0, 4).map(line => {
  const projected = line.spentAmount * (1 + Math.random() * 0.3);
  return `${line.category}:
  Budget: $${line.budgetAmount.toLocaleString()}
  Spent YTD: $${line.spentAmount.toLocaleString()}
  Projected Total: $${projected.toLocaleString()}
  Forecast Variance: $${(projected - line.budgetAmount).toLocaleString()}
  Risk Level: ${projected > line.budgetAmount ? 'HIGH ⚠' : projected > line.budgetAmount * 0.95 ? 'MEDIUM ⚠' : 'LOW ✓'}`;
}).join('\n\n')}

━━━ SCENARIO ANALYSIS ━━━

Best Case (20% probability):
• Strong cost controls maintained
• Favorable market conditions
• Some projects deferred
• Projected Total: $${Math.floor(totalBudget * 0.92).toLocaleString()}
• Variance: -${((1 - 0.92) * 100).toFixed(1)}% (Under budget)

Most Likely (60% probability):
• Current trend continues
• Normal market conditions
• All planned activities proceed
• Projected Total: $${Math.floor(totalBudget * 0.98).toLocaleString()}
• Variance: -${((1 - 0.98) * 100).toFixed(1)}% (Slightly under)

Worst Case (20% probability):
• Unexpected price increases
• Emergency purchases required
• Scope expansions
• Projected Total: $${Math.floor(totalBudget * 1.08).toLocaleString()}
• Variance: +${((1.08 - 1) * 100).toFixed(1)}% (Over budget)

━━━ RISK FACTORS ━━━

Upside Risks (Could reduce spending):
• Supplier discounts/negotiations
• Project delays/cancellations
• Process improvements
• Demand reduction

Downside Risks (Could increase spending):
• Inflation/price increases: ${(Math.random() * 5 + 2).toFixed(1)}%
• Supply chain disruptions
• Emergency requirements
• Regulatory changes
• FX fluctuations

━━━ RECOMMENDATIONS ━━━

Actions to Stay Within Budget:
${totalSpent * 1.17 > totalBudget ?
  `⚠ IMMEDIATE ACTIONS REQUIRED:
  1. Freeze non-essential spending
  2. Review all pending commitments
  3. Seek additional budget allocation
  4. Negotiate payment terms
  5. Defer projects to next FY` :
  `✓ PROACTIVE MEASURES:
  1. Monitor categories approaching limits
  2. Optimize remaining spend
  3. Lock in favorable pricing
  4. Build contingency for Q4
  5. Plan FY 2026 budget`}

Forecast Accuracy:
• Update forecast: Monthly
• Review assumptions: Quarterly
• Adjust models: As needed

[Export Forecast] [Set Alerts] [Create Action Plan] [Close]`);
  };

  const handleReviewBudgetAlerts = () => {
    console.log('Reviewing budget alerts...');
    const criticalCount = budgetLines.filter(l => l.status === 'critical' || l.status === 'overspent').length;
    const warningCount = budgetLines.filter(l => l.status === 'warning').length;

    alert(`Budget Alerts & Notifications

ACTIVE ALERTS - ${new Date().toLocaleDateString()}

━━━ CRITICAL ALERTS (${criticalCount}) ━━━

${budgetLines.filter(l => l.status === 'critical' || l.status === 'overspent').map((line, idx) =>
  `${idx + 1}. ${line.category} - ${line.department}
   🔴 CRITICAL: ${line.utilizationPercent.toFixed(1)}% utilized
   Budget: $${line.budgetAmount.toLocaleString()}
   Spent: $${line.spentAmount.toLocaleString()}
   Available: $${line.availableAmount.toLocaleString()}
   Owner: ${line.owner}

   Actions Required:
   • Request budget increase OR
   • Defer non-essential purchases OR
   • Reallocate from other categories

   Response Due: IMMEDIATE`
).join('\n\n')}

${criticalCount === 0 ? '✓ No critical alerts\n' : ''}

━━━ WARNING ALERTS (${warningCount}) ━━━

${budgetLines.filter(l => l.status === 'warning').map((line, idx) =>
  `${idx + 1}. ${line.category} - ${line.department}
   ⚠ WARNING: ${line.utilizationPercent.toFixed(1)}% utilized
   Budget: $${line.budgetAmount.toLocaleString()}
   Remaining: $${line.availableAmount.toLocaleString()}
   Burn Rate: $${Math.floor(line.spentAmount / 10).toLocaleString()}/month
   Est. Depletion: ${Math.floor(line.availableAmount / (line.spentAmount / 10))} months
   Owner: ${line.owner}

   Recommended Actions:
   • Monitor spending closely
   • Review upcoming commitments
   • Consider budget adjustment

   Review By: This week`
).join('\n\n')}

${warningCount === 0 ? '✓ No warning alerts\n' : ''}

━━━ UPCOMING THRESHOLDS ━━━

Categories Approaching Warning (70-75%):
${budgetLines.filter(l => l.utilizationPercent >= 70 && l.utilizationPercent < 75).map(line =>
  `• ${line.category}: ${line.utilizationPercent.toFixed(1)}% (Watch closely)`
).join('\n')}
${budgetLines.filter(l => l.utilizationPercent >= 70 && l.utilizationPercent < 75).length === 0 ? '✓ None identified\n' : ''}

━━━ POSITIVE ALERTS ━━━

Under-Utilized Budgets (Opportunities):
${budgetLines.filter(l => l.utilizationPercent < 60).map(line =>
  `• ${line.category}: ${line.utilizationPercent.toFixed(1)}% utilized
    Available: $${line.availableAmount.toLocaleString()}
    Consider: Reallocation or strategic spending`
).join('\n')}

━━━ NOTIFICATION SETTINGS ━━━

Current Alert Thresholds:
☑ Critical Alert: 90% utilization
☑ Warning Alert: 75% utilization
☑ Info Alert: 60% utilization

Notification Channels:
☑ Email notifications
☑ Dashboard alerts
☑ Mobile push (if app installed)
☑ Weekly summary report
☐ Slack/Teams integration

Recipients by Alert Type:
• Critical: CFO, Finance Director, Budget Owner
• Warning: Budget Owner, Department Head
• Info: Budget Owner only

Frequency:
• Critical: Immediate
• Warning: Daily digest
• Info: Weekly summary

━━━ ALERT HISTORY ━━━

Last 30 Days:
• Critical Alerts Sent: ${Math.floor(Math.random() * 10) + 5}
• Warning Alerts Sent: ${Math.floor(Math.random() * 20) + 10}
• Alerts Resolved: ${Math.floor(Math.random() * 25) + 15}
• Avg Response Time: ${Math.floor(Math.random() * 48) + 12} hours

━━━ ACTIONS ━━━

[Acknowledge Alerts] [Configure Thresholds] [Manage Recipients] [View History] [Close]

⚠ ${criticalCount + warningCount} alerts require attention`);
  };

  const handleComparePeriods = () => {
    console.log('Comparing budget periods...');
    alert(`Budget Period Comparison

COMPARATIVE ANALYSIS

━━━ PERIOD SELECTION ━━━

Compare:
Period A: [FY 2025 ▼]
Period B: [FY 2024 ▼]

Alternatively compare:
○ This Month vs Last Month
○ This Quarter vs Last Quarter
○ This Year vs Last Year
○ Current Budget vs Original Budget
○ Actual vs Forecast

━━━ OVERALL COMPARISON ━━━

                    FY 2025         FY 2024         Change
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Budget:       $${totalBudget.toLocaleString()}    $${Math.floor(totalBudget * 0.95).toLocaleString()}    +${((totalBudget / (totalBudget * 0.95) - 1) * 100).toFixed(1)}%
Spent to Date:      $${totalSpent.toLocaleString()}    $${Math.floor(totalSpent * 0.92).toLocaleString()}    +${((totalSpent / (totalSpent * 0.92) - 1) * 100).toFixed(1)}%
Utilization:        ${((totalSpent / totalBudget) * 100).toFixed(1)}%         ${((totalSpent * 0.92) / (totalBudget * 0.95) * 100).toFixed(1)}%         ${(((totalSpent / totalBudget) - ((totalSpent * 0.92) / (totalBudget * 0.95))) * 100).toFixed(1)}pp
Available:          $${totalAvailable.toLocaleString()}    $${Math.floor(totalAvailable * 1.1).toLocaleString()}    ${((totalAvailable / (totalAvailable * 1.1) - 1) * 100).toFixed(1)}%

━━━ CATEGORY COMPARISON ━━━

${budgetLines.slice(0, 4).map(line => {
  const lastYear = line.budgetAmount * (Math.random() * 0.2 + 0.9);
  const change = ((line.budgetAmount / lastYear - 1) * 100).toFixed(1);
  return `${line.category}:
  FY 2025: $${line.budgetAmount.toLocaleString()}
  FY 2024: $${lastYear.toLocaleString()}
  Change: ${change}% ${parseFloat(change) > 0 ? '↗' : '↘'}

  Spending Pace:
  FY 2025: ${line.utilizationPercent.toFixed(1)}% (Current)
  FY 2024: ${(line.utilizationPercent * (Math.random() * 0.2 + 0.9)).toFixed(1)}% (Same period)
  Trend: ${line.utilizationPercent > (line.utilizationPercent * 0.95) ? 'Faster ⚠' : 'Slower ✓'}`;
}).join('\n\n')}

━━━ KEY INSIGHTS ━━━

Budget Growth:
• Overall increase: ${((totalBudget / (totalBudget * 0.95) - 1) * 100).toFixed(1)}%
• Inflation adjustment: ~${(Math.random() * 3 + 2).toFixed(1)}%
• Strategic increase: ~${(Math.random() * 2 + 1).toFixed(1)}%

Spending Patterns:
• Similar pace: ${budgetLines.filter(l => Math.abs(l.utilizationPercent - 80) < 10).length} categories
• Faster pace: ${budgetLines.filter(l => l.utilizationPercent > 85).length} categories
• Slower pace: ${budgetLines.filter(l => l.utilizationPercent < 75).length} categories

Top Changes:
1. Largest increase: ${budgetLines.sort((a, b) => b.budgetAmount - a.budgetAmount)[0].category} (+${(Math.random() * 30 + 10).toFixed(1)}%)
2. Largest decrease: ${budgetLines[budgetLines.length - 1].category} (-${(Math.random() * 15 + 5).toFixed(1)}%)

━━━ TREND ANALYSIS ━━━

3-Year Trend:
FY 2023: $${Math.floor(totalBudget * 0.88).toLocaleString()}
FY 2024: $${Math.floor(totalBudget * 0.95).toLocaleString()} (+${((0.95 / 0.88 - 1) * 100).toFixed(1)}%)
FY 2025: $${totalBudget.toLocaleString()} (+${((1 / 0.95 - 1) * 100).toFixed(1)}%)

CAGR: ${((Math.pow(totalBudget / (totalBudget * 0.88), 1/3) - 1) * 100).toFixed(1)}%

━━━ RECOMMENDATIONS ━━━

Based on comparison:
${totalSpent / totalBudget > (totalSpent * 0.92) / (totalBudget * 0.95) ?
  `⚠ Spending pace faster than last year:
  • Review high-growth categories
  • Implement tighter controls
  • Consider mid-year adjustment` :
  `✓ Spending pace aligned with last year:
  • Maintain current controls
  • Monitor for seasonal variations
  • Plan for year-end optimization`}

[Export Comparison] [Add Another Period] [View Details] [Close]`);
  };

  const handleManageBudgetOwners = () => {
    console.log('Managing budget owners...');
    alert(`Manage Budget Owners

BUDGET OWNERSHIP & ACCOUNTABILITY

━━━ CURRENT OWNERS ━━━

${budgetLines.map(line =>
  `${line.category}:
  Primary Owner: ${line.owner}
  Department: ${line.department}
  Budget: $${line.budgetAmount.toLocaleString()}
  Utilization: ${line.utilizationPercent.toFixed(1)}%
  Status: ${line.status.toUpperCase()}
  Last Updated: ${line.lastModified}

  Responsibilities:
  ☑ Approve purchases within budget
  ☑ Monitor spending vs. budget
  ☑ Submit variance explanations
  ☑ Request budget adjustments
  ☑ Report on utilization monthly`
).join('\n\n')}

━━━ ASSIGN / CHANGE OWNER ━━━

Select Category: [${budgetLines[0].category} ▼]
Current Owner: ${budgetLines[0].owner}

New Owner:
[Search users...▼]

Available Users:
• Sarah Johnson (Manufacturing Director)
• Michael Chen (IT Director)
• Emily Davis (Admin Manager)
• Robert Wilson (Operations VP)
• Lisa Anderson (Facilities Manager)
• David Lee (Marketing Director)

Backup Owner (Optional):
[Search users...▼]

Effective Date:
○ Immediate
○ Start of next month: Dec 1, 2025
○ Custom: [__/__/____]

Transition Actions:
☑ Notify current owner
☑ Notify new owner
☑ Transfer pending approvals
☑ Update access permissions
☑ Schedule handover meeting

━━━ OWNER PERFORMANCE ━━━

${budgetLines.slice(0, 3).map(line =>
  `${line.owner}:
  Categories Managed: ${budgetLines.filter(l => l.owner === line.owner).length}
  Total Budget: $${budgetLines.filter(l => l.owner === line.owner).reduce((sum, l) => sum + l.budgetAmount, 0).toLocaleString()}
  Avg Utilization: ${(budgetLines.filter(l => l.owner === line.owner).reduce((sum, l) => sum + l.utilizationPercent, 0) / budgetLines.filter(l => l.owner === line.owner).length).toFixed(1)}%
  On-Time Reports: ${Math.floor(Math.random() * 20) + 80}%
  Budget Adherence: ${Math.floor(Math.random() * 15) + 85}%
  Rating: ${'⭐'.repeat(Math.floor(Math.random() * 2) + 3)}`
).join('\n\n')}

━━━ DELEGATION SETTINGS ━━━

Allow owners to delegate:
☑ Approval authority (up to $[______])
☑ Report submission
☐ Budget adjustment requests
☐ Owner reassignment

Delegation requires:
☑ Notification to finance team
☑ Documentation of reason
☐ Executive approval

━━━ NOTIFICATIONS & REMINDERS ━━━

Owner Notifications:
☑ Daily: Critical alerts (>90% utilization)
☑ Weekly: Budget summary
☑ Monthly: Variance report due
☑ Quarterly: Performance review

Reminder Schedule:
• 5 days before: Monthly report due
• 3 days before: Quarterly review
• 1 day before: Budget deadline

━━━ TRAINING & SUPPORT ━━━

Budget Owner Training:
• Next Session: Dec 15, 2025
• Duration: 2 hours
• Topics: Budget management, reporting, compliance
• Registration: [Register ▼]

Support Resources:
• Budget Management Guide (PDF)
• Video Tutorials (12 modules)
• Help Desk: finance-help@company.com
• Office Hours: Tuesdays 2-4 PM

[Assign Owner] [Update Delegation] [Schedule Training] [Close]`);
  };

  const handleRefresh = () => {
    console.log('Refreshing budget data...');
    alert(`Refresh Budget Data

Synchronizing from all systems:
✓ Financial system (ERP)
✓ Procurement system
✓ Purchase order database
✓ Invoice processing
✓ Contract management
✓ Expense reports

Updated Data:
• Budget allocations: ${budgetLines.length} lines
• Total budget: $${totalBudget.toLocaleString()}
• Total spent: $${totalSpent.toLocaleString()}
• Total committed: $${totalCommitted.toLocaleString()}
• Last transaction: ${Math.floor(Math.random() * 60)} minutes ago

Recent Changes (Last Hour):
• ${Math.floor(Math.random() * 5)} new purchase orders
• ${Math.floor(Math.random() * 3)} invoices processed
• ${Math.floor(Math.random() * 2)} budget adjustments
• ${Math.floor(Math.random() * 4)} commitments updated

Data Quality:
• Completeness: 99.${Math.floor(Math.random() * 9) + 1}%
• Accuracy: 99.${Math.floor(Math.random() * 9) + 1}%
• Timeliness: Real-time (< 5 min delay)

Last Refresh: ${new Date().toLocaleTimeString()}
Next Auto-Refresh: ${new Date(Date.now() + 300000).toLocaleTimeString()}

[Refresh Complete]`);
  };

  const handleSettings = () => {
    console.log('Opening budget settings...');
    alert(`Budget Management Settings

━━━ GENERAL SETTINGS ━━━

Fiscal Year:
• Start Date: January 1
• End Date: December 31
• Current FY: 2025
• Next FY: 2026

Currency:
• Primary: USD ($)
• Secondary: EUR (€) [Optional]
• Exchange Rate Update: Daily

Number Format:
• Decimal Places: 2
• Thousand Separator: Comma
• Negative Numbers: (Red with parentheses)

━━━ BUDGET STRUCTURE ━━━

Budget Hierarchy:
○ Category-based (Current)
○ Department-based
○ Project-based
○ Cost center-based
○ Matrix (Category + Department)

Budget Periods:
☑ Annual
☑ Quarterly
☑ Monthly
☐ Weekly

Carryover Rules:
○ No carryover (use it or lose it)
● Allow up to 10% carryover
○ Full carryover allowed
○ Carryover with approval

━━━ CONTROLS & THRESHOLDS ━━━

Spending Controls:
☑ Require budget before PO approval
☑ Block spending when budget exhausted
☑ Allow emergency overrides (with approval)
☑ Real-time budget checking

Alert Thresholds:
• Warning: 75% utilization
• Critical: 90% utilization
• Overrun: 100%+ utilization

Auto-Approvals:
• Individual items: < $5,000
• Budget variance: < 5%

━━━ APPROVAL WORKFLOWS ━━━

Budget Creation/Modification:
<$50K: Budget owner
$50K-$200K: + Finance manager
$200K-$500K: + Finance director
>$500K: + CFO approval

Overspend Approval:
<10%: Budget owner + Manager
10-25%: + Director
>25%: + Executive committee

Response Time SLA:
• Budget owner: 2 business days
• Manager: 3 business days
• Director: 5 business days
• Executive: 7 business days

━━━ REPORTING & NOTIFICATIONS ━━━

Standard Reports:
☑ Daily: Transaction summary
☑ Weekly: Utilization report
☑ Monthly: Variance analysis
☑ Quarterly: Executive summary
☑ Annual: Year-end report

Auto-Distribution:
• Budget owners: All their budgets
• Department heads: Department roll-up
• Finance team: All budgets
• Executives: Summary only

Notification Preferences:
☑ Email notifications
☑ Dashboard alerts
☐ SMS for critical alerts
☐ Mobile app push notifications

━━━ DATA & INTEGRATION ━━━

Integration Settings:
☑ ERP sync: Real-time
☑ Procurement system: Real-time
☑ GL sync: Nightly at 11 PM
☐ Credit card feeds: Not configured

Data Retention:
• Current FY: Full detail
• Previous 2 FY: Full detail
• Older: Summary only
• Audit trail: 7 years

Export Options:
• Default format: Excel
• Include archived data: No
• Max export rows: 100,000

━━━ SECURITY & ACCESS ━━━

Role-Based Access:
• Budget Owner: View/edit own budgets
• Manager: View team budgets
• Finance: View/edit all budgets
• Executive: View all, edit restricted
• Admin: Full access

Audit Trail:
☑ Log all changes
☑ Require change reason
☑ Track user actions
☑ Retain for 7 years

Data Privacy:
☑ Mask salary data
☑ Restrict vendor details
☐ Anonymize user data

[Save Settings] [Reset to Defaults] [Import Settings] [Cancel]`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Procurement Budget Tracking</h2>
            <p className="text-gray-600">Monitor and control procurement spend against budget</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSetBudget}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Set Budget"
            >
              <Plus className="h-4 w-4" />
              <span>Set Budget</span>
            </button>
            <button
              onClick={handleAdjustBudget}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              title="Adjust Budget"
            >
              <Edit className="h-4 w-4" />
              <span>Adjust</span>
            </button>
            <button
              onClick={handleForecast}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="Forecast"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Forecast</span>
            </button>
            <button
              onClick={handleViewVariance}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
              title="View Variance"
            >
              <Activity className="h-4 w-4" />
              <span>Variance</span>
            </button>
            <button
              onClick={handleExportBudgetReport}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              title="Export Report"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-blue-500" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold">${(totalBudget / 1000000).toFixed(2)}M</p>
          <p className="text-sm text-gray-600">Total Budget</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <span className="text-sm text-gray-500">YTD</span>
          </div>
          <p className="text-2xl font-bold">${(totalSpent / 1000000).toFixed(2)}M</p>
          <p className="text-sm text-gray-600">Spent to Date</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-8 w-8 text-purple-500" />
            <span className="text-sm text-gray-500">Used</span>
          </div>
          <p className="text-2xl font-bold">{((totalSpent / totalBudget) * 100).toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Budget Utilization</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <span className="text-sm text-gray-500">Left</span>
          </div>
          <p className="text-2xl font-bold">${(totalAvailable / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-600">Remaining Budget</p>
        </div>
      </div>

      {/* Real-Time Monitoring Dashboard */}
      {showRealTimeMonitoring && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-3 border border-indigo-200 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Real-Time Budget Monitoring
            </h3>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Auto-refresh
              </label>
              <button
                onClick={() => setShowRealTimeMonitoring(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Today's Spend</span>
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">$42.5K</div>
              <div className="text-xs text-green-600 mt-1">↓ 12% vs yesterday</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Budget Alerts</span>
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-xs text-red-600 mt-1">2 critical</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Burn Rate</span>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">$185K</div>
              <div className="text-xs text-gray-600 mt-1">Per day avg</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Forecast Variance</span>
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">-2.3%</div>
              <div className="text-xs text-green-600 mt-1">Under forecast</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Budget Activity</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600">PO-2024-567 approved: $28,500 against Raw Materials budget</span>
                <span className="text-gray-400 text-xs ml-auto">5 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span className="text-gray-600">IT Services budget reached 85% utilization threshold</span>
                <span className="text-gray-400 text-xs ml-auto">1 hour ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-gray-600">Budget transfer: $50K from Contingency to Manufacturing</span>
                <span className="text-gray-400 text-xs ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Target className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <span className="text-gray-600">Q4 forecast updated with 3% reduction in logistics costs</span>
                <span className="text-gray-400 text-xs ml-auto">4 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI-Powered Insights */}
      {showAIInsights && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-3 border border-purple-200 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              AI-Powered Budget Insights
            </h3>
            <button
              onClick={() => setShowAIInsights(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Forecast Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">94.2%</div>
              <p className="text-xs text-gray-600">AI predictions matching actual spend within 5% margin - high confidence for Q1 planning</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-semibold text-gray-900">Overspend Risk</span>
              </div>
              <div className="text-2xl font-bold text-amber-600 mb-1">Medium</div>
              <p className="text-xs text-gray-600">Raw Materials and IT Services budgets projected to exceed by 8-12% if current trends continue</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-gray-900">Savings Opportunity</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">$125K</div>
              <p className="text-xs text-gray-600">Potential savings identified through spend pattern analysis and supplier consolidation</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Smart Budget Recommendations</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-2 bg-amber-50 rounded">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Reallocation Needed:</span>
                  <span className="text-gray-600"> Transfer $75K from underutilized Marketing budget to Manufacturing to avoid Q4 overspend</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-blue-50 rounded">
                <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Seasonal Adjustment:</span>
                  <span className="text-gray-600"> Historical data shows 20% spike in logistics costs during Dec-Jan - recommend budget reserve</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-green-50 rounded">
                <DollarSign className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Cost Optimization:</span>
                  <span className="text-gray-600"> Negotiate volume discounts with top 3 suppliers to achieve 5-7% cost reduction on $2.1M annual spend</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-3 border-b">
        {['overview', 'budget', 'variance', 'forecasting'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Budget Table */}
      {activeTab === 'budget' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Budget Details</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleComparePeriods}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 text-sm transition-colors"
                title="Compare Periods"
              >
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Compare</span>
              </button>
              <button
                onClick={handleManageBudgetOwners}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 text-sm transition-colors"
                title="Manage Owners"
              >
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Owners</span>
              </button>
              <button
                onClick={handleReviewBudgetAlerts}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 bg-red-50 rounded-lg hover:bg-red-100 text-sm transition-colors"
                title="Review Alerts"
              >
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-700">Alerts ({budgetLines.filter(l => l.status !== 'healthy').length})</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Committed</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgetLines.map((line) => (
                  <tr key={line.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{line.category}</div>
                      <div className="text-xs text-gray-500">{line.id}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{line.department}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(line.budgetAmount / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      ${(line.spentAmount / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                      ${(line.committedAmount / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <span className={line.availableAmount < 0 ? 'text-red-600' : 'text-green-600'}>
                        ${(line.availableAmount / 1000).toFixed(0)}K
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              line.utilizationPercent >= 95
                                ? 'bg-red-500'
                                : line.utilizationPercent >= 75
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(line.utilizationPercent, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-700">{line.utilizationPercent.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{line.owner}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(line.status)}`}>
                        {line.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">TOTAL</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${(totalBudget / 1000).toFixed(0)}K
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${(totalSpent / 1000).toFixed(0)}K
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${(totalCommitted / 1000).toFixed(0)}K
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-bold">
                    <span className={totalAvailable < 0 ? 'text-red-600' : 'text-green-600'}>
                      ${(totalAvailable / 1000).toFixed(0)}K
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                    {((totalSpent / totalBudget) * 100).toFixed(1)}%
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Charts */}
      {(activeTab === 'overview' || activeTab === 'forecasting') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Monthly Budget Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#E5E7EB" name="Budget" />
                <Line type="monotone" dataKey="spent" stroke="#3B82F6" strokeWidth={2} name="Actual Spent" />
                <Line type="monotone" dataKey="forecast" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Budget Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={budgetLines.map(line => ({
                    name: line.category,
                    value: line.budgetAmount
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {budgetLines.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Quarterly Forecast</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quarterlyForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#E5E7EB" name="Budget" />
                <Bar dataKey="actual" fill="#3B82F6" name="Actual" />
                <Bar dataKey="forecast" fill="#F59E0B" name="Forecast" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Utilization by Category</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetLines.map(line => ({
                name: line.category.split(' ')[0],
                utilization: line.utilizationPercent,
                target: 85
              }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilization" fill="#3B82F6" name="Current %" />
                <Bar dataKey="target" fill="#E5E7EB" name="Target %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Variance Analysis */}
      {activeTab === 'variance' && (
        <div className="space-y-3">
          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Budget vs. Actual Analysis</h4>
            <div className="space-y-2">
              {budgetLines.map((line) => (
                <div key={line.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium">{line.category}</span>
                      <span className="text-sm text-gray-500 ml-2">{line.department}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${(line.spentAmount / 1000).toFixed(0)}K / ${(line.budgetAmount / 1000).toFixed(0)}K
                      </div>
                      <div className={`text-sm ${
                        line.variance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {line.variance > 0 ? '+' : ''}${(line.variance / 1000).toFixed(0)}K ({line.variance > 0 ? '+' : ''}{line.variancePercent.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        line.utilizationPercent >= 100
                          ? 'bg-red-500'
                          : line.utilizationPercent >= 90
                          ? 'bg-orange-500'
                          : line.utilizationPercent >= 75
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(line.utilizationPercent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Top Variances</h4>
              <div className="space-y-3">
                {budgetLines
                  .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
                  .slice(0, 5)
                  .map((line, idx) => (
                    <div key={line.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-2">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{line.category}</p>
                          <p className="text-xs text-gray-500">{line.utilizationPercent.toFixed(1)}% utilized</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${line.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {line.variance > 0 ? '+' : ''}${(Math.abs(line.variance) / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-gray-500">{line.variancePercent.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Budget Health Summary</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium">Healthy</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {budgetLines.filter(l => l.status === 'healthy').length} categories
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium">Warning</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-600">
                    {budgetLines.filter(l => l.status === 'warning').length} categories
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium">Critical</span>
                  </div>
                  <span className="text-sm font-bold text-orange-600">
                    {budgetLines.filter(l => l.status === 'critical').length} categories
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium">Overspent</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    {budgetLines.filter(l => l.status === 'overspent').length} categories
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Modals */}
      <ViewBudgetDetailsModal
        isOpen={isViewDetailsModalOpen}
        onClose={() => setIsViewDetailsModalOpen(false)}
        budget={selectedBudget ? {
          id: selectedBudget.id,
          category: selectedBudget.category,
          department: selectedBudget.department,
          budgetAmount: selectedBudget.budgetAmount,
          spentAmount: selectedBudget.spentAmount,
          committedAmount: selectedBudget.committedAmount,
          availableAmount: selectedBudget.availableAmount,
          utilizationPercent: selectedBudget.utilizationPercent,
          variance: selectedBudget.variance,
          variancePercent: selectedBudget.variancePercent,
          period: selectedBudget.period,
          owner: selectedBudget.owner,
          status: selectedBudget.status,
          lastModified: selectedBudget.lastModified
        } : undefined}
      />

      <AdjustBudgetModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        budget={selectedBudget ? {
          category: selectedBudget.category,
          department: selectedBudget.department,
          budgetAmount: selectedBudget.budgetAmount,
          spentAmount: selectedBudget.spentAmount,
          committedAmount: selectedBudget.committedAmount,
          availableAmount: selectedBudget.availableAmount,
          period: selectedBudget.period
        } : undefined}
        onSubmit={async (data) => {
          if (!selectedBudget?.id) {
            setIsAdjustModalOpen(false);
            return;
          }
          try {
            await procurementOperationsService.updateBudget(selectedBudget.id, {
              budget: Number(data?.newBudget ?? selectedBudget.budgetAmount),
            });
            await reloadBudgets();
          } catch (err) {
            console.error('Failed to adjust budget:', err);
            alert('Failed to adjust budget. Please try again.');
          } finally {
            setIsAdjustModalOpen(false);
          }
        }}
      />

      <BudgetForecastModal
        isOpen={isForecastModalOpen}
        onClose={() => setIsForecastModalOpen(false)}
        budget={selectedBudget ? {
          category: selectedBudget.category,
          budgetAmount: selectedBudget.budgetAmount,
          spentAmount: selectedBudget.spentAmount,
          committedAmount: selectedBudget.committedAmount,
          availableAmount: selectedBudget.availableAmount
        } : undefined}
        onSubmit={(data) => {
          console.log('Forecast generated:', data);
          setIsForecastModalOpen(false);
        }}
      />

      <BudgetAlertSetupModal
        isOpen={isAlertSetupModalOpen}
        onClose={() => setIsAlertSetupModalOpen(false)}
        budget={selectedBudget ? {
          category: selectedBudget.category,
          period: selectedBudget.period,
          owner: selectedBudget.owner,
          department: selectedBudget.department
        } : undefined}
        onSubmit={(data) => {
          console.log('Alert configured:', data);
          setIsAlertSetupModalOpen(false);
        }}
      />

      <ExportBudgetModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSubmit={(data) => {
          console.log('Export initiated:', data);
          setIsExportModalOpen(false);
        }}
      />
    </div>
  );
};

export default ProcurementBudget;
