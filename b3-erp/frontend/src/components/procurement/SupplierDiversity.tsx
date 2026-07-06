'use client';

import React, { useState, useEffect } from 'react';
import { procurementPagesService } from '@/services/procurement-pages.service';
import {
  Users, Globe, Award, TrendingUp, BarChart3, Target, Plus,
  Edit, Download, RefreshCw, Settings, CheckCircle, XCircle,
  AlertCircle, FileText, Shield, Star, TrendingDown, Activity,
  Percent, DollarSign, Package, Clock, Filter, Search, Eye, Send
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export interface DiverseSupplier {
  id: string;
  name: string;
  category: string;
  certifications: string[];
  annualSpend: number;
  diversityType: 'minority' | 'women' | 'veteran' | 'disability' | 'lgbt' | 'small-business';
  status: 'active' | 'inactive' | 'pending';
  certifiedBy: string;
  certificationDate: string;
  expirationDate: string;
  rating: number;
}

const SupplierDiversity: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  // Diverse suppliers - seeded with sample data, populated from API
  const [diverseSuppliers, setDiverseSuppliers] = useState<DiverseSupplier[]>([
    {
      id: 'DS001',
      name: 'Women Tech Solutions Inc',
      category: 'IT Services',
      certifications: ['WBENC', 'ISO 9001'],
      annualSpend: 450000,
      diversityType: 'women',
      status: 'active',
      certifiedBy: 'WBENC',
      certificationDate: '2023-01-15',
      expirationDate: '2026-01-15',
      rating: 4.8
    },
    {
      id: 'DS002',
      name: 'Veteran Manufacturing Co',
      category: 'Raw Materials',
      certifications: ['NVBDC', 'ISO 14001'],
      annualSpend: 380000,
      diversityType: 'veteran',
      status: 'active',
      certifiedBy: 'NVBDC',
      certificationDate: '2023-03-20',
      expirationDate: '2026-03-20',
      rating: 4.6
    },
    {
      id: 'DS003',
      name: 'Minority Business Supplies',
      category: 'Office Supplies',
      certifications: ['NMSDC'],
      annualSpend: 280000,
      diversityType: 'minority',
      status: 'active',
      certifiedBy: 'NMSDC',
      certificationDate: '2023-02-10',
      expirationDate: '2026-02-10',
      rating: 4.7
    },
    {
      id: 'DS004',
      name: 'Small Business Logistics',
      category: 'Transportation',
      certifications: ['SBA 8(a)'],
      annualSpend: 320000,
      diversityType: 'small-business',
      status: 'active',
      certifiedBy: 'SBA',
      certificationDate: '2023-05-05',
      expirationDate: '2026-05-05',
      rating: 4.5
    },
    {
      id: 'DS005',
      name: 'Disability Services Group',
      category: 'Professional Services',
      certifications: ['USBLN'],
      annualSpend: 180000,
      diversityType: 'disability',
      status: 'active',
      certifiedBy: 'USBLN',
      certificationDate: '2023-04-12',
      expirationDate: '2026-04-12',
      rating: 4.9
    },
    {
      id: 'DS006',
      name: 'Pride Tech Consultants',
      category: 'IT Consulting',
      certifications: ['NGLCC'],
      annualSpend: 220000,
      diversityType: 'lgbt',
      status: 'active',
      certifiedBy: 'NGLCC',
      certificationDate: '2023-06-18',
      expirationDate: '2026-06-18',
      rating: 4.7
    }
  ]);

  // Populate diverse suppliers from the diversity insights API
  useEffect(() => {
    const loadDiversity = async () => {
      try {
        const data = await procurementPagesService.getDiversityInsights();
        const vendors = Array.isArray(data?.vendors) ? data.vendors : [];
        if (vendors.length === 0) return;

        const mapDiversityType = (
          classification: string
        ): DiverseSupplier['diversityType'] => {
          const c = (classification || '').toLowerCase();
          if (c.includes('women')) return 'women';
          if (c.includes('veteran')) return 'veteran';
          if (c.includes('disab')) return 'disability';
          if (c.includes('lgbt')) return 'lgbt';
          if (c.includes('small')) return 'small-business';
          return 'minority';
        };

        const mapped: DiverseSupplier[] = vendors.map((v: any, idx: number) => ({
          id: String(v?.vendorId ?? `DS${idx + 1}`),
          name: String(v?.vendorName ?? 'Unknown Supplier'),
          category: String(v?.classification ?? 'Uncategorized'),
          certifications: v?.certified ? [String(v?.classification ?? 'Certified')] : [],
          annualSpend: Number(v?.spend ?? 0),
          diversityType: mapDiversityType(v?.classification),
          status: v?.certified ? 'active' : 'pending',
          certifiedBy: v?.certified ? String(v?.classification ?? '') : '',
          certificationDate: '',
          expirationDate: '',
          rating: 0,
        }));

        if (mapped.length > 0) setDiverseSuppliers(mapped);
      } catch (err) {
        // Keep seeded sample data on failure
        console.error('Failed to load diversity insights', err);
      }
    };
    loadDiversity();
  }, []);

  // Mock data - Monthly diversity spend
  const monthlyDiversitySpend = [
    { month: 'Jul', diverseSpend: 145000, totalSpend: 520000, target: 150000 },
    { month: 'Aug', diverseSpend: 158000, totalSpend: 540000, target: 150000 },
    { month: 'Sep', diverseSpend: 152000, totalSpend: 535000, target: 150000 },
    { month: 'Oct', diverseSpend: 165000, totalSpend: 560000, target: 150000 },
    { month: 'Nov', diverseSpend: 172000, totalSpend: 580000, target: 150000 },
    { month: 'Dec', diverseSpend: 168000, totalSpend: 575000, target: 150000 }
  ];

  // Mock data - Diversity breakdown
  const diversityBreakdown = [
    { type: 'Women-Owned', count: 12, spend: 850000, percentage: 32 },
    { type: 'Minority-Owned', count: 15, spend: 720000, percentage: 27 },
    { type: 'Veteran-Owned', count: 8, spend: 580000, percentage: 22 },
    { type: 'Small Business', count: 10, spend: 420000, percentage: 16 },
    { type: 'Disability-Owned', count: 3, spend: 180000, percentage: 7 },
    { type: 'LGBT-Owned', count: 5, spend: 220000, percentage: 8 }
  ];

  const getDiversityTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'women': 'bg-pink-100 text-pink-800',
      'minority': 'bg-purple-100 text-purple-800',
      'veteran': 'bg-blue-100 text-blue-800',
      'small-business': 'bg-green-100 text-green-800',
      'disability': 'bg-orange-100 text-orange-800',
      'lgbt': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalDiverseSpend = diverseSuppliers.reduce((sum, s) => sum + s.annualSpend, 0);
  const totalSuppliers = diverseSuppliers.length;

  // Handler functions
  const handleTrackDiversitySpend = () => {
    console.log('Tracking diversity spend...');
    alert(`Track Diversity Spend

DIVERSITY SPEND TRACKING

━━━ CURRENT PERIOD SUMMARY ━━━

Period: FY 2025 YTD
Total Procurement Spend: $${(totalDiverseSpend * 3.5).toLocaleString()}
Diverse Supplier Spend: $${totalDiverseSpend.toLocaleString()}
Diversity %: ${((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}%

━━━ SPEND BY DIVERSITY TYPE ━━━

${diversityBreakdown.map(d =>
  `${d.type}:
  Suppliers: ${d.count}
  Annual Spend: $${d.spend.toLocaleString()}
  % of Diverse Spend: ${d.percentage}%
  Avg per Supplier: $${Math.floor(d.spend / d.count).toLocaleString()}`
).join('\n\n')}

━━━ MONTHLY TREND ━━━

Last 6 Months:
${monthlyDiversitySpend.map(m =>
  `${m.month}: $${m.diverseSpend.toLocaleString()} (${((m.diverseSpend / m.totalSpend) * 100).toFixed(1)}% of total)`
).join('\n')}

Average Monthly: $${Math.floor(monthlyDiversitySpend.reduce((sum, m) => sum + m.diverseSpend, 0) / monthlyDiversitySpend.length).toLocaleString()}
Trend: ${monthlyDiversitySpend[monthlyDiversitySpend.length - 1].diverseSpend > monthlyDiversitySpend[0].diverseSpend ? '↗ Increasing' : '↘ Decreasing'}

━━━ TOP DIVERSE SUPPLIERS ━━━

${diverseSuppliers
  .sort((a, b) => b.annualSpend - a.annualSpend)
  .slice(0, 5)
  .map((s, idx) =>
    `${idx + 1}. ${s.name}
   Type: ${s.diversityType.replace('-', ' ').toUpperCase()}
   Spend: $${s.annualSpend.toLocaleString()}
   Rating: ${'⭐'.repeat(Math.floor(s.rating))} ${s.rating.toFixed(1)}/5`
  ).join('\n\n')}

━━━ CATEGORY BREAKDOWN ━━━

Diverse Spend by Category:
${Array.from(new Set(diverseSuppliers.map(s => s.category))).map(cat => {
  const catSuppliers = diverseSuppliers.filter(s => s.category === cat);
  const catSpend = catSuppliers.reduce((sum, s) => sum + s.annualSpend, 0);
  return `• ${cat}: $${catSpend.toLocaleString()} (${catSuppliers.length} suppliers)`;
}).join('\n')}

━━━ TRACKING OPTIONS ━━━

Track Spend By:
○ Diversity Type
○ Category
○ Department
○ Supplier
○ Certification
○ Geography

Time Period:
○ Current Month
○ Current Quarter
○ Year-to-Date
○ Last 12 Months
○ Custom: [From __/__/__] to [__/__/__]

View Options:
☑ Include certifications
☑ Show trends
☑ Compare to goals
☑ Highlight top performers
☐ Include inactive suppliers

[Export Data] [Schedule Report] [View Details] [Close]`);
  };

  const handleSetGoals = () => {
    console.log('Setting diversity goals...');
    alert(`Set Diversity Goals

DIVERSITY SPEND GOALS - FY 2025

━━━ CORPORATE DIVERSITY TARGETS ━━━

Current Corporate Goal: 25% of total spend
Current Achievement: ${((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}%
Gap: ${(25 - (totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}pp

Target Spend: $${Math.floor((totalDiverseSpend * 3.5) * 0.25).toLocaleString()}
Current Spend: $${totalDiverseSpend.toLocaleString()}
Gap: $${Math.floor((totalDiverseSpend * 3.5) * 0.25 - totalDiverseSpend).toLocaleString()}

━━━ SET OVERALL GOALS ━━━

Total Diverse Spend Goal:
• Annual Target: $[_____________]
• % of Total Spend: [___]%
• Current FY 2025: $${totalDiverseSpend.toLocaleString()}
• Recommended: 25-30% of total spend

Quarterly Breakdown:
• Q1 Goal: $[_______] ([___]% - Suggested: 25%)
• Q2 Goal: $[_______] ([___]% - Suggested: 25%)
• Q3 Goal: $[_______] ([___]% - Suggested: 25%)
• Q4 Goal: $[_______] ([___]% - Suggested: 25%)

━━━ DIVERSITY TYPE GOALS ━━━

Set goals by diversity classification:

Women-Owned Business (WBE):
Current: $${diversityBreakdown.find(d => d.type === 'Women-Owned')?.spend.toLocaleString()}
Goal: $[_______] or [___]% of diverse spend
Target Suppliers: [___]

Minority-Owned Business (MBE):
Current: $${diversityBreakdown.find(d => d.type === 'Minority-Owned')?.spend.toLocaleString()}
Goal: $[_______] or [___]% of diverse spend
Target Suppliers: [___]

Veteran-Owned Business (VBE):
Current: $${diversityBreakdown.find(d => d.type === 'Veteran-Owned')?.spend.toLocaleString()}
Goal: $[_______] or [___]% of diverse spend
Target Suppliers: [___]

Small Business:
Current: $${diversityBreakdown.find(d => d.type === 'Small Business')?.spend.toLocaleString()}
Goal: $[_______] or [___]% of diverse spend
Target Suppliers: [___]

Disability-Owned (DOBE):
Current: $${diversityBreakdown.find(d => d.type === 'Disability-Owned')?.spend.toLocaleString()}
Goal: $[_______] or [___]% of diverse spend
Target Suppliers: [___]

LGBT-Owned (LGBTBE):
Current: $${diversityBreakdown.find(d => d.type === 'LGBT-Owned')?.spend.toLocaleString()}
Goal: $[_______] or [___]% of diverse spend
Target Suppliers: [___]

━━━ CATEGORY-SPECIFIC GOALS ━━━

Set diversity goals by procurement category:

${Array.from(new Set(diverseSuppliers.map(s => s.category))).slice(0, 4).map(cat => {
  const catSpend = diverseSuppliers.filter(s => s.category === cat).reduce((sum, s) => sum + s.annualSpend, 0);
  return `${cat}:
  Current Diverse Spend: $${catSpend.toLocaleString()}
  Goal: $[_______] or [___]%
  Target # of Suppliers: [___]`;
}).join('\n\n')}

━━━ STRATEGIC INITIATIVES ━━━

Diversity Program Goals:

Supplier Development:
☐ Onboard [___] new diverse suppliers per quarter
☐ Provide [___] hours of training/mentoring
☐ Host [___] supplier diversity events

Spend Growth:
☐ Increase diverse spend by [___]% YoY
☐ Achieve [___]% diverse spend in top 5 categories
☐ Expand to [___] new diverse suppliers

Certification Support:
☐ Support [___] suppliers in certification process
☐ Verify/renew [___] certifications annually
☐ Partner with [___] certification bodies

━━━ GOAL TRACKING & REPORTING ━━━

Monitoring:
☑ Monthly progress reviews
☑ Quarterly business reviews
☑ Annual comprehensive report
☑ Real-time dashboard updates

Alert Thresholds:
• Below 80% of goal: Warning
• Below 90% of goal: Monitor closely
• Above 100% of goal: Celebrate & share

Reporting:
• Internal: Monthly to procurement team
• Executive: Quarterly to C-suite
• External: Annual sustainability report
• Compliance: As required by regulations

━━━ ACCOUNTABILITY ━━━

Goal Owners:
• Overall Goal: Chief Procurement Officer
• Category Goals: Category Managers
• Supplier Development: Diversity Program Manager
• Compliance: Legal & Compliance Team

Performance Metrics:
☑ Link to procurement KPIs
☑ Include in annual reviews
☐ Tie to compensation/bonuses
☑ Recognize top performers

[Save Goals] [Import Template] [Reset] [Cancel]`);
  };

  const handleGenerateReports = () => {
    console.log('Generating diversity reports...');
    alert(`Generate Diversity Reports

SUPPLIER DIVERSITY REPORTING

━━━ REPORT TYPES ━━━

1. EXECUTIVE SUMMARY (PDF)
   • High-level diversity metrics
   • Goal achievement status
   • Year-over-year comparison
   • Key highlights and wins
   • 2-3 pages, board-ready

2. DETAILED DIVERSITY REPORT (Excel)
   • Complete supplier list
   • Spend by diversity type
   • Category breakdown
   • Monthly trends
   • Certification details
   • Full data export with pivot tables

3. COMPLIANCE REPORT (PDF)
   • Regulatory compliance status
   • Required certifications
   • Spend thresholds met/missed
   • Audit trail
   • Supporting documentation
   • Government submission ready

4. SUPPLIER SCORECARD (PDF/Excel)
   • Individual supplier performance
   • Rating and evaluation
   • Spend history
   • Certification status
   • Relationship strength
   • Development opportunities

5. IMPACT REPORT (PowerPoint)
   • Social impact metrics
   • Jobs supported
   • Economic impact
   • Community engagement
   • Success stories
   • Visual presentation format

6. QUARTERLY BUSINESS REVIEW (PowerPoint)
   • Quarterly performance
   • Goal progress
   • New suppliers onboarded
   • Challenges and solutions
   • Next quarter plans
   • Stakeholder presentation

━━━ REPORT PARAMETERS ━━━

Time Period:
○ Current Month (November 2025)
○ Current Quarter (Q4 2025)
● Year-to-Date (Jan - Nov 2025)
○ Fiscal Year 2025 (Full year)
○ Last 12 Months (Rolling)
○ Custom: [From __/__/____] to [__/__/____]

Include:
☑ Spend analysis
☑ Supplier details
☑ Certifications
☑ Goal achievement
☑ Trend analysis
☑ Benchmarking
☑ Success stories
☐ Contract details
☐ Payment terms
☐ Individual transactions

Diversity Types:
☑ Women-Owned (WBE)
☑ Minority-Owned (MBE)
☑ Veteran-Owned (VBE)
☑ Small Business
☑ Disability-Owned (DOBE)
☑ LGBT-Owned (LGBTBE)

━━━ METRICS TO INCLUDE ━━━

Key Performance Indicators:
☑ Total diverse spend: $${totalDiverseSpend.toLocaleString()}
☑ % of total spend: ${((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}%
☑ Number of diverse suppliers: ${totalSuppliers}
☑ New suppliers added (YTD): ${Math.floor(Math.random() * 10) + 5}
☑ Average rating: ${(diverseSuppliers.reduce((sum, s) => sum + s.rating, 0) / totalSuppliers).toFixed(2)}/5
☑ Goal achievement: ${Math.floor(Math.random() * 20) + 80}%
☑ YoY growth: ${(Math.random() * 15 + 5).toFixed(1)}%

Breakdown Metrics:
☑ Spend by diversity type
☑ Spend by category
☑ Spend by department
☑ Geographic distribution
☑ Certification status
☑ Supplier tier (Tier 1, Tier 2)

━━━ BENCHMARKING ━━━

Compare Against:
☐ Industry average (Manufacturing: ~18%)
☐ Best-in-class (Target: 25-30%)
☐ Previous year performance
☐ Peer companies
☐ Internal goals

Show:
☐ Ranking vs. peers
☐ Gap analysis
☐ Improvement recommendations

━━━ DELIVERY & DISTRIBUTION ━━━

Format:
• PDF: Professional, read-only
• Excel: Data analysis, editable
• PowerPoint: Presentations
• CSV: Raw data export

Distribution:
Recipients:
☑ CEO
☑ Chief Procurement Officer
☑ Diversity & Inclusion Officer
☑ Sustainability Team
☐ Board of Directors
☐ External stakeholders
☐ Certification bodies

Delivery Method:
○ Download now
○ Email to recipients
○ Save to shared folder: [Select ▼]
● All of the above

Schedule Recurring:
○ Weekly
● Monthly (1st of each month)
○ Quarterly (End of quarter)
○ Annually (Year-end)
○ Custom schedule

━━━ COMPLIANCE & CERTIFICATION ━━━

Include Compliance Documentation:
☑ Certification copies
☑ Verification letters
☑ Audit trails
☑ Affidavits
☐ Tax documents
☐ Insurance certificates

Certifying Bodies Included:
☑ WBENC (Women's Business Enterprise)
☑ NMSDC (Minority Supplier Development)
☑ NVBDC (Veteran Business Development)
☑ SBA (Small Business Administration)
☑ NGLCC (LGBT Chamber of Commerce)
☑ USBLN (Disability Business Enterprise)

━━━ GENERATE REPORT ━━━

Report Summary:
• Type: Detailed Diversity Report
• Period: YTD 2025
• Format: Excel + PDF Summary
• Recipients: 5
• Estimated Size: ${(Math.random() * 8 + 2).toFixed(1)} MB
• Generation Time: ~${Math.floor(Math.random() * 45) + 30} seconds

[Generate Now] [Preview] [Schedule] [Cancel]`);
  };

  const handleCertifySuppliers = () => {
    console.log('Certifying suppliers...');
    alert(`Certify Diverse Suppliers

SUPPLIER CERTIFICATION MANAGEMENT

━━━ CERTIFICATION OVERVIEW ━━━

Total Diverse Suppliers: ${totalSuppliers}
Certified Suppliers: ${diverseSuppliers.filter(s => s.certifications.length > 0).length}
Pending Certification: ${Math.floor(Math.random() * 5) + 2}
Expiring Soon (< 90 days): ${Math.floor(Math.random() * 3) + 1}

━━━ CERTIFICATION TYPES ━━━

Supported Certifications:

1. WOMEN-OWNED BUSINESS (WBE)
   Certifying Body: WBENC
   Requirements:
   • 51%+ owned by women
   • Managed and controlled by women
   • US-based business
   Current Suppliers: ${diverseSuppliers.filter(s => s.diversityType === 'women').length}

2. MINORITY-OWNED BUSINESS (MBE)
   Certifying Body: NMSDC
   Requirements:
   • 51%+ owned by minority individuals
   • Managed and controlled by minorities
   • For-profit enterprise
   Current Suppliers: ${diverseSuppliers.filter(s => s.diversityType === 'minority').length}

3. VETERAN-OWNED BUSINESS (VBE)
   Certifying Body: NVBDC
   Requirements:
   • 51%+ owned by veterans
   • Veteran controls day-to-day operations
   • DD-214 verification
   Current Suppliers: ${diverseSuppliers.filter(s => s.diversityType === 'veteran').length}

4. SMALL BUSINESS
   Certifying Body: SBA
   Requirements:
   • Meets SBA size standards
   • Independently owned
   • Not dominant in field
   Current Suppliers: ${diverseSuppliers.filter(s => s.diversityType === 'small-business').length}

5. DISABILITY-OWNED (DOBE)
   Certifying Body: USBLN
   Requirements:
   • 51%+ owned by disabled individuals
   • Daily management by disabled owner
   • Disability documentation
   Current Suppliers: ${diverseSuppliers.filter(s => s.diversityType === 'disability').length}

6. LGBT-OWNED BUSINESS (LGBTBE)
   Certifying Body: NGLCC
   Requirements:
   • 51%+ owned by LGBT individuals
   • Managed and controlled by LGBT owners
   • Certification application
   Current Suppliers: ${diverseSuppliers.filter(s => s.diversityType === 'lgbt').length}

━━━ ADD NEW CERTIFICATION ━━━

Supplier Information:
• Supplier Name: [Search existing or add new ▼]
• Tax ID/EIN: [___-_______]
• Contact Person: [_______________]
• Email: [_______________]
• Phone: [_______________]

Certification Details:
• Certification Type: [Select ▼]
  - Women-Owned (WBE)
  - Minority-Owned (MBE)
  - Veteran-Owned (VBE)
  - Small Business
  - Disability-Owned (DOBE)
  - LGBT-Owned (LGBTBE)

• Certifying Body: [Auto-populated based on type]
• Certification Number: [_______________]
• Issue Date: [__/__/____]
• Expiration Date: [__/__/____]
• Verification Method:
  ○ Direct from certifying body
  ○ Supplier-provided certificate
  ○ Third-party verification

Documents Required:
☐ Certification certificate (PDF)
☐ Tax documents
☐ Ownership verification
☐ Articles of incorporation
☐ Additional supporting docs

━━━ VERIFY EXISTING CERTIFICATIONS ━━━

Suppliers Requiring Verification:

${diverseSuppliers.slice(0, 3).map(s =>
  `${s.name}:
  Certification: ${s.certifications.join(', ')}
  Certified By: ${s.certifiedBy}
  Expiration: ${s.expirationDate}
  Status: ${new Date(s.expirationDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) ? '⚠ EXPIRING SOON' : '✓ Valid'}

  Actions:
  [Verify Now] [Request Renewal] [View Certificate]`
).join('\n\n')}

Verification Process:
1. Contact certifying body
2. Verify certification number
3. Check expiration date
4. Validate ownership percentage
5. Update system records
6. Notify supplier of status

━━━ CERTIFICATION RENEWALS ━━━

Expiring Certifications (Next 90 Days):

${diverseSuppliers
  .filter(s => new Date(s.expirationDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
  .map(s =>
    `• ${s.name}
  Expires: ${s.expirationDate} (${Math.floor((new Date(s.expirationDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days)
  Type: ${s.diversityType.toUpperCase()}
  Action: [Send Renewal Reminder]`
  ).join('\n')}

Renewal Reminder Schedule:
☑ 90 days before expiration
☑ 60 days before expiration
☑ 30 days before expiration
☑ 14 days before expiration
☑ 7 days before expiration

━━━ CERTIFICATION SUPPORT ━━━

Support Services for Suppliers:

Educational Resources:
• Certification guides by type
• Application checklists
• Required documentation lists
• Tips for successful certification
• FAQ and troubleshooting

Direct Support:
• Help desk: diversity@company.com
• Phone support: 1-800-XXX-XXXX
• Office hours: Mon-Fri 9am-5pm
• Certification workshops: Quarterly
• One-on-one consultations

Financial Support:
• Certification fee reimbursement: Up to $[___]
• Application assistance grants
• Documentation preparation support

━━━ COMPLIANCE & AUDIT ━━━

Certification Compliance:
☑ All certifications verified annually
☑ Documentation on file
☑ Expiration tracking active
☑ Renewal process automated
☑ Audit trail maintained

Audit Requirements:
• Random audits: ${Math.floor(Math.random() * 10) + 10}% of suppliers annually
• Triggered audits: Change in ownership, complaints
• Documentation: Maintained for 7 years
• Reporting: Annual compliance report

[Add Certification] [Verify Existing] [Schedule Audit] [Close]`);
  };

  const handleAddDiverseSupplier = () => {
    console.log('Adding diverse supplier...');
    alert(`Add Diverse Supplier

ONBOARD NEW DIVERSE SUPPLIER

━━━ STEP 1: BASIC INFORMATION ━━━

Company Details:
• Legal Business Name: [_______________]
• DBA (if different): [_______________]
• Tax ID (EIN): [___-_______]
• DUNS Number: [_________]

Business Address:
• Street: [_______________]
• City: [_______________]
• State: [__] ZIP: [_____]
• Country: [_______________]

Contact Information:
• Primary Contact: [_______________]
• Title: [_______________]
• Email: [_______________]
• Phone: [_______________]
• Website: [_______________]

━━━ STEP 2: DIVERSITY CLASSIFICATION ━━━

Select Diversity Type(s):
☐ Women-Owned Business Enterprise (WBE)
☐ Minority-Owned Business Enterprise (MBE)
   - Specify: ☐ Asian ☐ Black ☐ Hispanic ☐ Native American ☐ Other
☐ Veteran-Owned Business Enterprise (VBE)
   - ☐ Service-Disabled Veteran-Owned
☐ Small Business
   - ☐ SBA 8(a) ☐ HUBZone ☐ Other
☐ Disability-Owned Business Enterprise (DOBE)
☐ LGBT-Owned Business Enterprise (LGBTBE)

Ownership Structure:
• Ownership Percentage: [___]%
• Owned by diverse individuals: [___]%
• Management Control: [Yes ▼]
• Daily Operations: [Yes ▼]

━━━ STEP 3: CERTIFICATIONS ━━━

Current Certifications:
☐ WBENC (Women's Business Enterprise)
☐ NMSDC (Minority Supplier Development)
☐ NVBDC (Veteran Business Development)
☐ SBA Certified
☐ USBLN (Disability Business Enterprise)
☐ NGLCC (LGBT Chamber)
☐ ISO 9001
☐ ISO 14001
☐ Other: [_______________]

For Each Certification:
• Certification Number: [_______________]
• Certifying Body: [_______________]
• Issue Date: [__/__/____]
• Expiration Date: [__/__/____]
• Upload Certificate: [Browse...]

Self-Certification:
☐ Allow if third-party certification pending
  Requires: Affidavit of ownership and control
  Valid for: 90 days pending verification

━━━ STEP 4: CAPABILITIES & CATEGORIES ━━━

Products/Services Offered:
Primary Category: [Select ▼]
${Array.from(new Set(diverseSuppliers.map(s => s.category))).map(cat => `  - ${cat}`).join('\n')}

Additional Categories:
☐ Raw Materials
☐ Electronic Components
☐ IT Services
☐ Professional Services
☐ Office Supplies
☐ Transportation/Logistics
☐ Facilities/Maintenance
☐ Marketing Services
☐ Other: [_______________]

Capabilities:
[Describe products/services in detail]
_____________________________________________
_____________________________________________

Annual Capacity: $[_____________]
Minimum Order: $[_____________]
Lead Time: [___] days

━━━ STEP 5: FINANCIAL INFORMATION ━━━

Company Size:
• Annual Revenue: $[_____________]
• Number of Employees: [___]
• Years in Business: [___]

Banking Information:
• Bank Name: [_______________]
• Account Type: [Checking ▼]
• Routing Number: [_________]
• Account Number: [_______________]
• Payment Terms: [Net 30 ▼]

Financial References:
1. [_______________] - [_______________]
2. [_______________] - [_______________]

━━━ STEP 6: INSURANCE & COMPLIANCE ━━━

Insurance Coverage:
☐ General Liability: $[_____________]
  Policy #: [_______________]
  Expiration: [__/__/____]

☐ Workers Compensation: $[_____________]
  Policy #: [_______________]
  Expiration: [__/__/____]

☐ Professional Liability (if applicable): $[_____________]
  Policy #: [_______________]
  Expiration: [__/__/____]

Compliance:
☐ W-9 Form provided
☐ Certificate of Insurance provided
☐ Background check completed
☐ Conflict of interest disclosure
☐ Code of conduct agreement

━━━ STEP 7: DEVELOPMENT PLAN ━━━

Supplier Development Goals:
Projected Annual Spend: $[_____________]
Growth Target (Year 1): [___]%
Strategic Partnership: ☐ Yes ☐ No

Support Needed:
☐ Capacity building
☐ Technical training
☐ Financial support
☐ Mentoring
☐ Networking opportunities
☐ Marketing/visibility

Development Activities:
☐ Quarterly business reviews
☐ Annual capacity assessment
☐ Joint improvement projects
☐ Access to training programs

━━━ STEP 8: APPROVAL WORKFLOW ━━━

Supplier Onboarding Approval:

Submitted by: [Current User]
Date: ${new Date().toLocaleDateString()}

Approval Required:
1. ☐ Category Manager - Review capabilities
2. ☐ Diversity Manager - Verify certifications
3. ☐ Finance - Approve payment terms
4. ☐ Legal - Review contracts
5. ☐ Procurement Director - Final approval

Estimated Approval Time: 5-10 business days

━━━ REVIEW & SUBMIT ━━━

Supplier Summary:
• Business Name: [Entered above]
• Diversity Type: [Selected above]
• Certifications: [Listed above]
• Primary Category: [Selected above]
• Projected Annual Spend: $[Entered above]

Next Steps:
1. Submit application
2. Approval workflow initiated
3. Background checks conducted
4. Certifications verified
5. Supplier portal access created
6. Welcome package sent
7. Initial order placement

[Save as Draft] [Submit for Approval] [Cancel]`);
  };

  const handleManagePrograms = () => {
    console.log('Managing diversity programs...');
    alert(`Manage Diversity Programs

SUPPLIER DIVERSITY PROGRAMS

━━━ ACTIVE PROGRAMS ━━━

1. SUPPLIER DEVELOPMENT PROGRAM
   Objective: Build capacity of diverse suppliers

   Activities:
   • Monthly training webinars
   • Quarterly workshops
   • One-on-one mentoring
   • Technical assistance
   • Financial literacy support

   Participants: ${Math.floor(Math.random() * 15) + 10} suppliers
   Budget: $${Math.floor(Math.random() * 100000 + 50000).toLocaleString()}
   Status: Active

   Recent Activities:
   • Nov 15: Financial Planning Workshop (12 attendees)
   • Oct 28: Quality Management Training (8 attendees)
   • Oct 10: Business Strategy Session (15 attendees)

2. TIER 2 DIVERSE SUPPLIER PROGRAM
   Objective: Encourage prime suppliers to use diverse subcontractors

   Requirements:
   • Prime suppliers report Tier 2 spend
   • Minimum 15% diverse Tier 2 spend
   • Quarterly reporting required
   • Recognition for top performers

   Participating Primes: ${Math.floor(Math.random() * 10) + 5}
   Tier 2 Diverse Spend: $${Math.floor(Math.random() * 500000 + 200000).toLocaleString()}
   Status: Active

3. SUPPLIER MATCHMAKING PROGRAM
   Objective: Connect diverse suppliers with opportunities

   Activities:
   • Quarterly networking events
   • Online supplier directory
   • Capability presentations
   • Business speed dating
   • Industry conferences

   Events This Year: ${Math.floor(Math.random() * 6) + 4}
   Connections Made: ${Math.floor(Math.random() * 50) + 30}
   New Contracts: ${Math.floor(Math.random() * 10) + 5}

4. CERTIFICATION SUPPORT PROGRAM
   Objective: Help suppliers obtain diversity certifications

   Services:
   • Application guidance
   • Documentation assistance
   • Fee reimbursement (up to $500)
   • Renewal reminders
   • Verification support

   Suppliers Supported: ${Math.floor(Math.random() * 20) + 10}
   Certifications Achieved: ${Math.floor(Math.random() * 15) + 8}
   Reimbursements Paid: $${Math.floor(Math.random() * 10000 + 5000).toLocaleString()}

5. FAST TRACK ONBOARDING
   Objective: Expedite onboarding for certified diverse suppliers

   Benefits:
   • Reduced approval time (5 vs 15 days)
   • Dedicated support contact
   • Priority for new opportunities
   • Simplified documentation

   Suppliers Fast-Tracked: ${Math.floor(Math.random() * 12) + 6} (YTD)
   Avg Time to Onboard: 6 days
   Satisfaction Score: 4.7/5

━━━ CREATE NEW PROGRAM ━━━

Program Setup:

Program Name: [_______________]
Objective: [_______________]
Target Participants: [___] suppliers
Budget: $[_____________]
Duration: [___] months
Owner: [Select User ▼]

Program Type:
○ Development & Training
○ Networking & Matchmaking
○ Financial Support
○ Certification Assistance
○ Capacity Building
○ Recognition & Awards
○ Other: [_______________]

Activities Planned:
☐ Workshops/Training
☐ Networking events
☐ Mentoring
☐ Financial grants
☐ Technical assistance
☐ Marketing support
☐ Other: [_______________]

Success Metrics:
• Participants: [___]
• Spend impact: $[_____________]
• Certifications: [___]
• Satisfaction: [___]/5
• Custom: [_______________]

━━━ PROGRAM PERFORMANCE ━━━

Overall Impact (All Programs):

Participation:
• Total Participants: ${Math.floor(Math.random() * 40) + 30}
• Unique Suppliers: ${totalSuppliers}
• Participation Rate: ${Math.floor(Math.random() * 30) + 60}%
• Repeat Participants: ${Math.floor(Math.random() * 20) + 10}

Business Impact:
• New Diverse Suppliers: +${Math.floor(Math.random() * 8) + 5} (YTD)
• Spend Increase: +${(Math.random() * 20 + 10).toFixed(1)}% YoY
• New Certifications: ${Math.floor(Math.random() * 12) + 8}
• Contracts Awarded: ${Math.floor(Math.random() * 25) + 15}

Satisfaction:
• Program Satisfaction: ${(Math.random() * 0.5 + 4.5).toFixed(1)}/5
• Would Recommend: ${Math.floor(Math.random() * 10) + 90}%
• Net Promoter Score: ${Math.floor(Math.random() * 20) + 60}

Financial:
• Total Investment: $${Math.floor(Math.random() * 300000 + 200000).toLocaleString()}
• ROI: ${(Math.random() * 5 + 3).toFixed(1)}x
• Cost per Supplier: $${Math.floor(Math.random() * 5000 + 3000).toLocaleString()}

━━━ PROGRAM CALENDAR ━━━

Upcoming Activities:

December 2025:
• Dec 5: Year-End Celebration & Awards
• Dec 12: Certification Workshop
• Dec 19: 2026 Planning Session

January 2026:
• Jan 10: New Year Kickoff
• Jan 24: Financial Planning Workshop
• Jan 31: Quarterly Business Review

February 2026:
• Feb 7: Supplier Matchmaking Event
• Feb 14: Valentine's Diversity Fair
• Feb 28: Certification Support Session

━━━ RECOGNITION & AWARDS ━━━

Supplier of the Year Awards:

Categories:
• Supplier of the Year - Overall
• Rising Star Award - New supplier
• Innovation Award - New solutions
• Growth Award - Highest growth
• Partnership Award - Best collaboration
• Impact Award - Social impact

Selection Criteria:
☑ Spend volume
☑ Quality metrics
☑ On-time delivery
☑ Innovation
☑ Responsiveness
☑ Sustainability
☑ Community impact

Award Process:
1. Nominations open: Jan 1
2. Nominations close: Feb 15
3. Review committee: Feb 16-28
4. Winners announced: March 15
5. Awards ceremony: April 10

[Create Program] [View Analytics] [Schedule Event] [Close]`);
  };

  const handleViewAnalytics = () => {
    console.log('Viewing diversity analytics...');
    alert(`Diversity Program Analytics

COMPREHENSIVE ANALYTICS DASHBOARD

━━━ EXECUTIVE SUMMARY ━━━

Overall Diversity Performance:

Total Diverse Spend: $${totalDiverseSpend.toLocaleString()}
Total Procurement Spend: $${(totalDiverseSpend * 3.5).toLocaleString()}
Diversity %: ${((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}%

Goal: 25%
Achievement: ${(((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100) / 25 * 100).toFixed(0)}%
Gap to Goal: ${(25 - (totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}pp

Supplier Count:
• Total Diverse Suppliers: ${totalSuppliers}
• Active This Month: ${Math.floor(totalSuppliers * 0.9)}
• New This Year: ${Math.floor(Math.random() * 10) + 5}
• Average per Category: ${(totalSuppliers / Array.from(new Set(diverseSuppliers.map(s => s.category))).length).toFixed(1)}

━━━ TREND ANALYSIS ━━━

Year-over-Year Growth:

Spend Growth:
• FY 2023: $${Math.floor(totalDiverseSpend * 0.82).toLocaleString()}
• FY 2024: $${Math.floor(totalDiverseSpend * 0.92).toLocaleString()} (+${(((totalDiverseSpend * 0.92) / (totalDiverseSpend * 0.82) - 1) * 100).toFixed(1)}%)
• FY 2025: $${totalDiverseSpend.toLocaleString()} (+${(((totalDiverseSpend) / (totalDiverseSpend * 0.92) - 1) * 100).toFixed(1)}%)
• CAGR: ${((Math.pow(totalDiverseSpend / (totalDiverseSpend * 0.82), 1/2) - 1) * 100).toFixed(1)}%

Supplier Growth:
• FY 2023: ${Math.floor(totalSuppliers * 0.75)}
• FY 2024: ${Math.floor(totalSuppliers * 0.88)} (+${Math.floor(totalSuppliers * 0.88) - Math.floor(totalSuppliers * 0.75)})
• FY 2025: ${totalSuppliers} (+${totalSuppliers - Math.floor(totalSuppliers * 0.88)})

Monthly Trend (Last 6 Months):
${monthlyDiversitySpend.map(m => {
  const pct = ((m.diverseSpend / m.totalSpend) * 100).toFixed(1);
  return `${m.month}: $${m.diverseSpend.toLocaleString()} (${pct}%)`;
}).join('\n')}

Trend Direction: ${monthlyDiversitySpend[5].diverseSpend > monthlyDiversitySpend[0].diverseSpend ? '↗ INCREASING' : '↘ DECREASING'}
Avg Monthly Growth: ${(((monthlyDiversitySpend[5].diverseSpend / monthlyDiversitySpend[0].diverseSpend) - 1) * 100 / 5).toFixed(1)}%

━━━ DIVERSITY TYPE ANALYSIS ━━━

Performance by Classification:

${diversityBreakdown.map(d => {
  const suppliers = diverseSuppliers.filter(s => s.diversityType.toLowerCase() === d.type.toLowerCase().replace('-owned', '').replace(' ', '-'));
  return `${d.type}:
  Suppliers: ${d.count}
  Spend: $${d.spend.toLocaleString()}
  % of Diverse Spend: ${d.percentage}%
  Avg per Supplier: $${Math.floor(d.spend / d.count).toLocaleString()}
  Growth YoY: +${(Math.random() * 25 + 5).toFixed(1)}%
  Goal Status: ${d.percentage > 15 ? '✓ Meeting' : '⚠ Below'} target`;
}).join('\n\n')}

━━━ CATEGORY ANALYSIS ━━━

Diverse Spend by Procurement Category:

${Array.from(new Set(diverseSuppliers.map(s => s.category))).map(cat => {
  const catSuppliers = diverseSuppliers.filter(s => s.category === cat);
  const catSpend = catSuppliers.reduce((sum, s) => sum + s.annualSpend, 0);
  const catTotal = catSpend * (Math.random() * 2 + 2);
  return `${cat}:
  Suppliers: ${catSuppliers.length}
  Diverse Spend: $${catSpend.toLocaleString()}
  Total Category Spend: $${catTotal.toLocaleString()}
  Diversity %: ${((catSpend / catTotal) * 100).toFixed(1)}%
  Goal: 25%
  Status: ${((catSpend / catTotal) * 100) >= 25 ? '✓' : '⚠'} ${((catSpend / catTotal) * 100) >= 25 ? 'Achieving' : 'Below'} goal`;
}).join('\n\n')}

━━━ GEOGRAPHIC ANALYSIS ━━━

Diverse Supplier Distribution:

By Region:
• Northeast: ${Math.floor(totalSuppliers * 0.3)} suppliers (${(Math.random() * 500000 + 200000).toLocaleString()})
• Southeast: ${Math.floor(totalSuppliers * 0.25)} suppliers ($${(Math.random() * 400000 + 150000).toLocaleString()})
• Midwest: ${Math.floor(totalSuppliers * 0.20)} suppliers ($${(Math.random() * 350000 + 100000).toLocaleString()})
• Southwest: ${Math.floor(totalSuppliers * 0.15)} suppliers ($${(Math.random() * 300000 + 80000).toLocaleString()})
• West: ${Math.floor(totalSuppliers * 0.10)} suppliers ($${(Math.random() * 250000 + 50000).toLocaleString()})

Top States:
1. California: ${Math.floor(totalSuppliers * 0.18)} suppliers
2. Texas: ${Math.floor(totalSuppliers * 0.15)} suppliers
3. New York: ${Math.floor(totalSuppliers * 0.12)} suppliers
4. Florida: ${Math.floor(totalSuppliers * 0.10)} suppliers
5. Illinois: ${Math.floor(totalSuppliers * 0.08)} suppliers

━━━ SUPPLIER PERFORMANCE ━━━

Top Performing Diverse Suppliers:

By Spend:
${diverseSuppliers.sort((a, b) => b.annualSpend - a.annualSpend).slice(0, 5).map((s, idx) =>
  `${idx + 1}. ${s.name}
  Spend: $${s.annualSpend.toLocaleString()}
  Type: ${s.diversityType.toUpperCase()}
  Rating: ${s.rating}/5`
).join('\n')}

By Rating:
${diverseSuppliers.sort((a, b) => b.rating - a.rating).slice(0, 5).map((s, idx) =>
  `${idx + 1}. ${s.name}
  Rating: ${s.rating}/5
  Spend: $${s.annualSpend.toLocaleString()}
  Type: ${s.diversityType.toUpperCase()}`
).join('\n')}

Overall Metrics:
• Average Rating: ${(diverseSuppliers.reduce((sum, s) => sum + s.rating, 0) / totalSuppliers).toFixed(2)}/5
• Ratings >4.5: ${diverseSuppliers.filter(s => s.rating >= 4.5).length} suppliers
• Ratings <4.0: ${diverseSuppliers.filter(s => s.rating < 4.0).length} suppliers

━━━ CERTIFICATION STATUS ━━━

Certification Metrics:

Certified Suppliers: ${diverseSuppliers.filter(s => s.certifications.length > 0).length}
Multiple Certifications: ${diverseSuppliers.filter(s => s.certifications.length > 1).length}
Self-Certified Only: ${Math.floor(Math.random() * 3)}
Certification Pending: ${Math.floor(Math.random() * 5) + 2}

Expiring Soon (< 90 days): ${diverseSuppliers.filter(s => new Date(s.expirationDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)).length}
Expired: ${Math.floor(Math.random() * 2)}

Certification Bodies:
${Array.from(new Set(diverseSuppliers.map(s => s.certifiedBy))).map(body => {
  const count = diverseSuppliers.filter(s => s.certifiedBy === body).length;
  return `• ${body}: ${count} suppliers`;
}).join('\n')}

━━━ BENCHMARKING ━━━

Industry Comparison:

Our Performance: ${((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}%
Industry Average: ${(Math.random() * 5 + 18).toFixed(1)}%
Best in Class: ${(Math.random() * 5 + 28).toFixed(1)}%
Gap to Best: ${((Math.random() * 5 + 28) - (totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}pp

Ranking: ${Math.floor(Math.random() * 20) + 10} of 50 (Peer Group)
Percentile: ${Math.floor(Math.random() * 30) + 60}th

Year-over-Year Improvement:
• Last Year: ${((totalDiverseSpend * 0.92) / (totalDiverseSpend * 3.5 * 0.95) * 100).toFixed(1)}%
• This Year: ${((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}%
• Improvement: +${(((totalDiverseSpend / (totalDiverseSpend * 3.5)) - (totalDiverseSpend * 0.92) / (totalDiverseSpend * 3.5 * 0.95)) * 100).toFixed(1)}pp

━━━ PREDICTIVE INSIGHTS ━━━

Forecast & Projections:

Year-End Projection (FY 2025):
• Projected Diverse Spend: $${Math.floor(totalDiverseSpend * 1.08).toLocaleString()}
• Projected Total Spend: $${Math.floor(totalDiverseSpend * 3.5 * 1.05).toLocaleString()}
• Projected Diversity %: ${((totalDiverseSpend * 1.08) / (totalDiverseSpend * 3.5 * 1.05) * 100).toFixed(1)}%
• Confidence: ${Math.floor(Math.random() * 15) + 75}%

Goal Achievement Forecast:
• Goal: 25%
• Current Pace: ${((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}%
• Projected: ${((totalDiverseSpend * 1.08) / (totalDiverseSpend * 3.5 * 1.05) * 100).toFixed(1)}%
• Status: ${((totalDiverseSpend * 1.08) / (totalDiverseSpend * 3.5 * 1.05) * 100) >= 25 ? '✓ ON TRACK' : '⚠ AT RISK'}

Recommendations:
${((totalDiverseSpend * 1.08) / (totalDiverseSpend * 3.5 * 1.05) * 100) >= 25 ?
  `• Maintain current trajectory
• Continue supplier development programs
• Share best practices across categories
• Recognize and celebrate success` :
  `• Accelerate onboarding of new diverse suppliers
• Increase spend with existing diverse suppliers
• Focus on underperforming categories
• Implement corrective action plan
• Consider strategic initiatives`}

[Export Analytics] [Schedule Report] [Deep Dive] [Close]`);
  };

  const handleRefresh = () => {
    console.log('Refreshing diversity data...');
    alert(`Refresh Diversity Data

Synchronizing from all systems:
✓ Supplier database
✓ Procurement transactions
✓ Certification database
✓ Spend analytics
✓ Program management
✓ External verification services

Updated Information:
• Diverse Suppliers: ${totalSuppliers}
• Total Diverse Spend: $${totalDiverseSpend.toLocaleString()}
• Active Certifications: ${diverseSuppliers.filter(s => s.certifications.length > 0).length}
• Diversity %: ${((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}%

Recent Changes (Last 24 Hours):
• ${Math.floor(Math.random() * 3)} new transactions
• ${Math.floor(Math.random() * 2)} certification updates
• ${Math.floor(Math.random() * 2)} supplier profile changes
• ${Math.floor(Math.random() * 1)} new certifications

Data Quality:
• Completeness: 99.${Math.floor(Math.random() * 9) + 1}%
• Accuracy: 99.${Math.floor(Math.random() * 9) + 1}%
• Certification Verification: 100%
• Last External Sync: ${Math.floor(Math.random() * 120)} minutes ago

Last Refresh: ${new Date().toLocaleTimeString()}
Next Auto-Refresh: ${new Date(Date.now() + 3600000).toLocaleTimeString()}

[Refresh Complete]`);
  };

  const handleSettings = () => {
    console.log('Opening diversity settings...');
    alert(`Supplier Diversity Settings

━━━ GENERAL SETTINGS ━━━

Program Configuration:
• Program Name: Supplier Diversity Initiative
• Program Owner: [Select User ▼]
• Start Date: January 1, 2023
• Status: Active

Corporate Goals:
• Overall Diversity Target: [___]% (Current: 25%)
• Tier 2 Diversity Target: [___]% (Current: 15%)
• Annual Spend Goal: $[_____________]
• Supplier Count Goal: [___]

━━━ DIVERSITY CLASSIFICATIONS ━━━

Enabled Classifications:
☑ Women-Owned Business (WBE)
☑ Minority-Owned Business (MBE)
☑ Veteran-Owned Business (VBE)
☑ Small Business
☑ Disability-Owned Business (DOBE)
☑ LGBT-Owned Business (LGBTBE)
☐ Historically Underutilized Business (HUB)
☐ Custom: [_______________]

Minimum Ownership Threshold:
• Standard: 51%
• Alternative: [___]% (with justification)

━━━ CERTIFICATION SETTINGS ━━━

Accepted Certifying Bodies:

Women-Owned:
☑ WBENC (Women's Business Enterprise National Council)
☑ State/Local WBE programs
☐ SBA Women-Owned Small Business
☐ Custom certifier: [_______________]

Minority-Owned:
☑ NMSDC (National Minority Supplier Development Council)
☑ State/Local MBE programs
☐ Custom certifier: [_______________]

Veteran-Owned:
☑ NVBDC (National Veteran Business Development Council)
☑ VA Verification
☑ State Veteran programs
☐ Custom certifier: [_______________]

Small Business:
☑ SBA 8(a) Program
☑ HUBZone
☑ Small Disadvantaged Business
☐ Custom certifier: [_______________]

Disability-Owned:
☑ USBLN (US Business Leadership Network)
☑ Disability:IN
☐ Custom certifier: [_______________]

LGBT-Owned:
☑ NGLCC (National LGBT Chamber of Commerce)
☑ Local LGBT chambers
☐ Custom certifier: [_______________]

Verification Requirements:
☑ Third-party certification required
☐ Allow self-certification with affidavit
☑ Annual re-verification
☑ Spot audits: ${Math.floor(Math.random() * 15) + 5}% annually

Expiration Handling:
• Send reminders: [90] days before expiration
• Grace period: [30] days after expiration
• Auto-suspend if expired: ☑ Yes ☐ No

━━━ REPORTING SETTINGS ━━━

Standard Reports:
☑ Monthly diversity dashboard
☑ Quarterly executive summary
☑ Annual comprehensive report
☑ Ad-hoc reporting as needed

Report Distribution:
• CEO: Quarterly
• CPO: Monthly
• Diversity Officer: Weekly
• Category Managers: Monthly
• Board of Directors: Annually

Compliance Reporting:
☑ Government compliance reports
☑ Customer reporting requirements
☑ Internal audit reports
☑ Public sustainability disclosures

Metrics Tracked:
☑ Spend by diversity type
☑ Supplier count
☑ Goal achievement
☑ Year-over-year growth
☑ Category performance
☑ Geographic distribution
☑ Tier 2 diversity spend
☑ Certification status

━━━ PROGRAM SETTINGS ━━━

Supplier Development:
☑ Enable development programs
☑ Training workshops
☑ Mentoring opportunities
☑ Networking events
☑ Certification support
☑ Capacity building

Investment:
• Annual Program Budget: $[_____________]
• Per-Supplier Investment: Up to $[_______]
• Certification Reimbursement: Up to $[_______]
• Training Budget: $[_____________]

Recognition:
☑ Annual Supplier Awards
☑ Quarterly spotlights
☑ Success story publications
☑ Referral incentives

━━━ INTEGRATION SETTINGS ━━━

System Integrations:
☑ ERP system: Real-time sync
☑ Supplier portal: Bidirectional
☑ Spend analytics: Daily refresh
☑ Certification databases: Weekly verification
☐ External reporting platforms

Data Feeds:
☑ WBENC database
☑ NMSDC database
☑ NVBDC database
☑ SBA database
☐ Custom API: [_______________]

Auto-Updates:
☑ Supplier certifications
☑ Spend data
☑ Performance metrics
☐ Market intelligence

━━━ NOTIFICATION SETTINGS ━━━

Alert Types:
☑ Certification expiring soon
☑ Goal achievement milestones
☑ New diverse supplier onboarded
☑ Spend threshold reached
☑ Performance issues
☑ Program events

Recipients:
• Diversity Manager: All alerts
• Procurement Team: Relevant alerts
• Suppliers: Their alerts only
• Executives: Summary only

Delivery Method:
☑ Email
☑ Dashboard notifications
☐ SMS (for critical alerts)
☐ Mobile app

Frequency:
• Critical: Immediate
• Important: Daily digest
• Informational: Weekly summary

━━━ PRIVACY & SECURITY ━━━

Data Access:
• Diversity data visibility: [Role-based ▼]
• Supplier details: [Restricted ▼]
• Financial information: [Finance team only ▼]
• Certification documents: [Authorized users ▼]

Audit Trail:
☑ Log all data access
☑ Track changes
☑ Require change justification
☑ Maintain for 7 years

Confidentiality:
☑ Protect supplier proprietary data
☑ Secure certification documents
☑ Comply with privacy regulations
☑ Annual security reviews

[Save Settings] [Reset to Defaults] [Export Config] [Cancel]`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Supplier Diversity Management</h2>
            <p className="text-gray-600">Promote diversity and inclusion in supplier partnerships</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleAddDiverseSupplier}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Add Diverse Supplier"
            >
              <Plus className="h-4 w-4" />
              <span>Add Supplier</span>
            </button>
            <button
              onClick={handleManagePrograms}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              title="Manage Programs"
            >
              <Award className="h-4 w-4" />
              <span>Programs</span>
            </button>
            <button
              onClick={handleGenerateReports}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              title="Generate Reports"
            >
              <Download className="h-4 w-4" />
              <span>Reports</span>
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
            <Users className="h-8 w-8 text-blue-500" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold">{totalSuppliers}</p>
          <p className="text-sm text-gray-600">Diverse Suppliers</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-green-500" />
            <span className="text-sm text-gray-500">YTD</span>
          </div>
          <p className="text-2xl font-bold">${(totalDiverseSpend / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-gray-600">Diverse Spend</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-8 w-8 text-purple-500" />
            <span className="text-sm text-gray-500">Current</span>
          </div>
          <p className="text-2xl font-bold">{((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Diversity Spend %</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-8 w-8 text-orange-500" />
            <span className="text-sm text-gray-500">Verified</span>
          </div>
          <p className="text-2xl font-bold">{diverseSuppliers.filter(s => s.certifications.length > 0).length}</p>
          <p className="text-sm text-gray-600">Certified Suppliers</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-3 border-b">
        {['overview', 'suppliers', 'performance', 'programs'].map((tab) => (
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

      {/* Suppliers Table */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Diverse Supplier Portfolio</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleTrackDiversitySpend}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 text-sm transition-colors"
                title="Track Spend"
              >
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Track Spend</span>
              </button>
              <button
                onClick={handleSetGoals}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm transition-colors"
                title="Set Goals"
              >
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700">Set Goals</span>
              </button>
              <button
                onClick={handleCertifySuppliers}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 bg-green-50 rounded-lg hover:bg-green-100 text-sm transition-colors"
                title="Certify Suppliers"
              >
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-green-700">Certify</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diversity Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certifications</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Spend</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {diverseSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                        <div className="text-xs text-gray-500">{supplier.id}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{supplier.category}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDiversityTypeColor(supplier.diversityType)}`}>
                        {supplier.diversityType.toUpperCase().replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {supplier.certifications.map((cert, idx) => (
                          <span key={idx} className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(supplier.annualSpend / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-900">{supplier.rating}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(supplier.status)}`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.expirationDate}</div>
                      {new Date(supplier.expirationDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                        <div className="text-xs text-orange-600">⚠ Expiring Soon</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Charts */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Monthly Diversity Spend Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyDiversitySpend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="diverseSpend" stroke="#10B981" strokeWidth={2} name="Diverse Spend" />
                <Line type="monotone" dataKey="target" stroke="#E5E7EB" strokeWidth={2} strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Diversity Type Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={diversityBreakdown.map(d => ({
                    name: d.type,
                    value: d.spend
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.split('-')[0]}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {diversityBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Diversity Spend by Type</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={diversityBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="spend" fill="#8B5CF6" name="Spend ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Supplier Count by Type</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={diversityBreakdown} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="Suppliers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Goal Achievement</h4>
              <div className="mb-2">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Diversity Spend Goal</span>
                  <span className="text-sm font-medium">25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-green-500"
                    style={{ width: `${((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100 / 25 * 100)}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Current: {((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100).toFixed(1)}%
                  ({(((totalDiverseSpend / (totalDiverseSpend * 3.5)) * 100) / 25 * 100).toFixed(0)}% of goal)
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Top Diversity Types</h4>
              <div className="space-y-3">
                {diversityBreakdown.slice(0, 3).map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mr-2">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium">{d.type}</span>
                    </div>
                    <span className="text-sm text-gray-600">${(d.spend / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={handleViewAnalytics}
                  className="w-full flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>View Analytics</span>
                </button>
                <button
                  onClick={handleSetGoals}
                  className="w-full flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Target className="h-4 w-4" />
                  <span>Set Goals</span>
                </button>
                <button
                  onClick={handleGenerateReports}
                  className="w-full flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Recent Activity</h4>
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New diverse supplier onboarded</p>
                  <p className="text-xs text-gray-500 mt-1">{diverseSuppliers[0].name} - {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <Award className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Certification renewed</p>
                  <p className="text-xs text-gray-500 mt-1">{diverseSuppliers[1].name} - {diverseSuppliers[1].certifications[0]}</p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Monthly goal exceeded</p>
                  <p className="text-xs text-gray-500 mt-1">{((monthlyDiversitySpend[monthlyDiversitySpend.length - 1].diverseSpend / monthlyDiversitySpend[monthlyDiversitySpend.length - 1].target - 1) * 100).toFixed(1)}% above target</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Supplier Development Program</h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Build capacity and capabilities of diverse suppliers through training and mentorship</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Participants</span>
                  <span className="font-medium">{Math.floor(totalSuppliers * 0.6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Events This Year</span>
                  <span className="font-medium">{Math.floor(Math.random() * 8) + 6}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Satisfaction</span>
                  <span className="font-medium">4.7/5</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Certification Support</h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Help suppliers obtain and maintain diversity certifications</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Suppliers Supported</span>
                  <span className="font-medium">{Math.floor(Math.random() * 15) + 10}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Certifications Achieved</span>
                  <span className="font-medium">{Math.floor(Math.random() * 12) + 8}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reimbursements</span>
                  <span className="font-medium">${Math.floor(Math.random() * 10000 + 5000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <h4 className="font-semibold mb-2">Upcoming Events</h4>
            <div className="space-y-3">
              <div className="flex items-start p-3 border border-gray-200 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Supplier Networking Event</p>
                  <p className="text-xs text-gray-500 mt-1">December 15, 2025 • 2:00 PM - 5:00 PM</p>
                  <p className="text-xs text-gray-600 mt-1">Connect diverse suppliers with procurement opportunities</p>
                </div>
                <button className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100">
                  Register
                </button>
              </div>
              <div className="flex items-start p-3 border border-gray-200 rounded-lg">
                <Clock className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Certification Workshop</p>
                  <p className="text-xs text-gray-500 mt-1">January 10, 2026 • 10:00 AM - 12:00 PM</p>
                  <p className="text-xs text-gray-600 mt-1">Learn about certification process and requirements</p>
                </div>
                <button className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded hover:bg-purple-100">
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDiversity;
