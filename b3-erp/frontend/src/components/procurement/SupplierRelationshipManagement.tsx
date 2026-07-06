'use client';

import React, { useState, useEffect } from 'react'
import { vendorService } from '@/services/VendorService'
import {
  Users,
  Building2,
  Award,
  TrendingUp,
  Shield,
  Star,
  MessageSquare,
  Calendar,
  FileText,
  BarChart3,
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Globe,
  MapPin,
  Package,
  DollarSign,
  Percent,
  Target,
  Zap,
  Heart,
  ThumbsUp,
  RefreshCw,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Settings,
  XCircle,
  ClipboardCheck,
  TrendingDown,
  BookOpen
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts'

interface Supplier {
  id: string
  name: string
  category: string
  status: 'active' | 'inactive' | 'suspended' | 'onboarding'
  tier: 'strategic' | 'preferred' | 'approved' | 'probation'
  performanceScore: number
  riskScore: number
  spend: number
  contracts: number
  location: string
  contact: {
    name: string
    email: string
    phone: string
  }
  certifications: string[]
  lastReview: string
  nextReview: string
}

export default function SupplierRelationshipManagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [filterTier, setFilterTier] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showScorecards, setShowScorecards] = useState(false)
  const [showHealthDashboard, setShowHealthDashboard] = useState(true)

  // Mock data
  const MOCK_SUPPLIERS: Supplier[] = [
    {
      id: 'SUP001',
      name: 'Global Tech Solutions',
      category: 'IT Services',
      status: 'active',
      tier: 'strategic',
      performanceScore: 92,
      riskScore: 15,
      spend: 3500000,
      contracts: 8,
      location: 'San Francisco, USA',
      contact: {
        name: 'John Smith',
        email: 'john.smith@globaltech.com',
        phone: '+1-415-555-0123'
      },
      certifications: ['ISO 9001', 'ISO 27001', 'SOC 2'],
      lastReview: '2024-01-15',
      nextReview: '2024-04-15'
    },
    {
      id: 'SUP002',
      name: 'Premier Manufacturing Co',
      category: 'Raw Materials',
      status: 'active',
      tier: 'strategic',
      performanceScore: 88,
      riskScore: 25,
      spend: 5200000,
      contracts: 12,
      location: 'Detroit, USA',
      contact: {
        name: 'Sarah Johnson',
        email: 'sarah@premiermfg.com',
        phone: '+1-313-555-0456'
      },
      certifications: ['ISO 9001', 'ISO 14001'],
      lastReview: '2024-01-20',
      nextReview: '2024-04-20'
    },
    {
      id: 'SUP003',
      name: 'Express Logistics Ltd',
      category: 'Logistics',
      status: 'active',
      tier: 'preferred',
      performanceScore: 85,
      riskScore: 30,
      spend: 2800000,
      contracts: 6,
      location: 'Chicago, USA',
      contact: {
        name: 'Mike Chen',
        email: 'mchen@expresslog.com',
        phone: '+1-312-555-0789'
      },
      certifications: ['ISO 9001', 'C-TPAT'],
      lastReview: '2024-02-01',
      nextReview: '2024-05-01'
    },
    {
      id: 'SUP004',
      name: 'Quality Components Inc',
      category: 'Components',
      status: 'active',
      tier: 'approved',
      performanceScore: 78,
      riskScore: 40,
      spend: 1500000,
      contracts: 4,
      location: 'Austin, USA',
      contact: {
        name: 'Lisa Wong',
        email: 'lwong@qualitycomp.com',
        phone: '+1-512-555-0234'
      },
      certifications: ['ISO 9001'],
      lastReview: '2024-01-10',
      nextReview: '2024-04-10'
    }
  ]

  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS)

  useEffect(() => {
    let cancelled = false
    const statusMap: Record<string, Supplier['status']> = {
      ACTIVE: 'active', INACTIVE: 'inactive', BLACKLISTED: 'suspended', SUSPENDED: 'suspended', ONBOARDING: 'onboarding',
    }
    const load = async () => {
      try {
        const res = await vendorService.getVendors()
        const list = Array.isArray((res as any)?.data) ? (res as any).data : (Array.isArray(res) ? res : [])
        if (!cancelled && list.length) {
          setSuppliers(list.map((v: any, idx: number): Supplier => ({
            id: v.id ?? v.vendorCode ?? `SUP${idx + 1}`,
            name: v.vendorName ?? v.name ?? '—',
            category: v.category ?? '—',
            status: statusMap[String(v.status ?? '').toUpperCase()] ?? 'active',
            tier: v.isApproved ? 'approved' : 'probation',
            performanceScore: Number(v.averageRating ?? 0) * 20,
            riskScore: 0,
            spend: Number(v.totalPurchases ?? 0),
            contracts: 0,
            location: v.address ?? '—',
            contact: {
              name: v.contactPerson ?? '—',
              email: v.email ?? '',
              phone: v.phone ?? '',
            },
            certifications: [],
            lastReview: (v.lastPurchaseDate ?? '').toString().slice(0, 10),
            nextReview: '',
          })))
        }
      } catch {
        // keep sample data on error
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const performanceTrend = [
    { month: 'Jan', strategic: 88, preferred: 82, approved: 75 },
    { month: 'Feb', strategic: 89, preferred: 83, approved: 76 },
    { month: 'Mar', strategic: 91, preferred: 84, approved: 77 },
    { month: 'Apr', strategic: 90, preferred: 85, approved: 78 },
    { month: 'May', strategic: 92, preferred: 85, approved: 79 },
    { month: 'Jun', strategic: 93, preferred: 86, approved: 80 }
  ]

  const categoryDistribution = [
    { name: 'IT Services', value: 3500000, suppliers: 8 },
    { name: 'Raw Materials', value: 5200000, suppliers: 12 },
    { name: 'Logistics', value: 2800000, suppliers: 6 },
    { name: 'Components', value: 1500000, suppliers: 15 },
    { name: 'Professional Services', value: 980000, suppliers: 5 },
    { name: 'Facilities', value: 620000, suppliers: 3 }
  ]

  const riskMatrix = [
    { supplier: 'Global Tech Solutions', impact: 85, probability: 15, spend: 3500000 },
    { supplier: 'Premier Manufacturing', impact: 90, probability: 25, spend: 5200000 },
    { supplier: 'Express Logistics', impact: 75, probability: 30, spend: 2800000 },
    { supplier: 'Quality Components', impact: 60, probability: 40, spend: 1500000 },
    { supplier: 'Pro Services Group', impact: 50, probability: 20, spend: 980000 }
  ]

  const relationshipHealth = [
    { aspect: 'Communication', score: 85 },
    { aspect: 'Quality', score: 88 },
    { aspect: 'Delivery', score: 82 },
    { aspect: 'Innovation', score: 75 },
    { aspect: 'Cost Competitiveness', score: 80 },
    { aspect: 'Responsiveness', score: 90 }
  ]

  const engagementActivities = [
    { date: '2024-02-15', type: 'meeting', supplier: 'Global Tech Solutions', subject: 'Quarterly Business Review', status: 'completed' },
    { date: '2024-02-18', type: 'audit', supplier: 'Premier Manufacturing Co', subject: 'Quality Audit', status: 'scheduled' },
    { date: '2024-02-20', type: 'training', supplier: 'Express Logistics Ltd', subject: 'System Integration Training', status: 'scheduled' },
    { date: '2024-02-22', type: 'review', supplier: 'Quality Components Inc', subject: 'Performance Review', status: 'pending' }
  ]

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  // Handler 1: Schedule QBR (Quarterly Business Review)
  const handleScheduleQBR = () => {
    alert(`📅 Schedule Quarterly Business Review

QBR SCHEDULING WIZARD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: SELECT SUPPLIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Strategic Suppliers (QBR Required):
✓ Global Tech Solutions - Last QBR: Q1 2024
✓ Premier Manufacturing Co - Last QBR: Q1 2024
⚠️  Express Logistics Ltd - OVERDUE (Due: Q4 2023)
✓ Quality Components Inc - Last QBR: Q4 2023

STEP 2: QBR AGENDA TEMPLATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Standard QBR Agenda Items:
1. Executive Summary & Relationship Overview (15 min)
2. Performance Metrics Review (30 min)
   • Quality: Defect rates, returns, compliance
   • Delivery: On-time delivery, lead times
   • Cost: Pricing trends, savings opportunities
   • Service: Responsiveness, issue resolution

3. Strategic Initiatives & Innovation (20 min)
   • Joint development projects
   • Process improvements
   • Technology integration
   • Sustainability programs

4. Risk Assessment & Mitigation (15 min)
   • Supply chain risks
   • Financial health
   • Geopolitical factors
   • Capacity constraints

5. Action Items & Next Steps (10 min)
   • Outstanding issues
   • Improvement plans
   • Contract renewals
   • Next QBR date

STEP 3: MEETING LOGISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Proposed Dates:
   • March 15, 2024 @ 2:00 PM EST
   • March 18, 2024 @ 10:00 AM EST
   • March 22, 2024 @ 1:00 PM EST

🏢 Meeting Format:
   ☑️ In-Person (Recommended for Strategic)
   ☐ Virtual (Video Conference)
   ☐ Hybrid

👥 Required Attendees:
Internal Team:
   • VP of Procurement
   • Category Manager
   • Quality Assurance Manager
   • Contract Specialist

Supplier Team:
   • Account Executive
   • Operations Manager
   • Quality Director
   • Technical Support Lead

STEP 4: PRE-QBR PREPARATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Documents to Prepare:
✓ Performance scorecard (last 90 days)
✓ Spend analysis by category
✓ Quality metrics and trends
✓ Delivery performance report
✓ Open issues tracker
✓ Innovation pipeline review
✓ Risk assessment summary
✓ Contract renewal timeline

Supplier Preparation Request:
✓ Business update presentation
✓ Capacity planning forecast
✓ Innovation roadmap
✓ Quality improvement initiatives
✓ Cost reduction opportunities

STEP 5: POST-QBR ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Automatic Actions:
✓ Meeting minutes distribution (within 24 hours)
✓ Action item tracking in system
✓ Performance improvement plan updates
✓ Next QBR auto-scheduled (90 days)
✓ Stakeholder summary report

QBR SCHEDULING CONFIRMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Supplier: Global Tech Solutions
Date: March 15, 2024 @ 2:00 PM EST
Location: Conference Room A / Zoom Link
Duration: 90 minutes
Attendees: 8 confirmed

✅ Calendar invites sent to all participants
✅ Pre-read materials will be shared 3 days before
✅ Zoom link generated and included in invite
✅ Conference room reserved
✅ Catering arranged for in-person attendees

📧 Confirmation email sent to all stakeholders
⏰ Reminder notifications scheduled (7 days, 3 days, 1 day before)
📊 Performance dashboard prepared and accessible

QBR scheduled successfully!
Next Action: Prepare pre-read materials by March 12, 2024`);
  };

  // Handler 2: Log Meetings
  const handleLogMeetings = () => {
    alert(`📝 Log Supplier Meeting

MEETING LOGGING SYSTEM:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MEETING DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Meeting Type:
☐ Quarterly Business Review
☑️ Performance Review
☐ Issue Resolution
☐ Contract Negotiation
☐ Innovation Workshop
☐ Quality Audit
☐ Informal Check-in
☐ Site Visit

Supplier: Global Tech Solutions
Date: ${new Date().toLocaleDateString()}
Time: 2:00 PM - 3:30 PM (90 minutes)
Location: Virtual (Zoom)
Meeting ID: MTG-2024-0245

ATTENDEES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Internal Participants (5):
✓ Sarah Johnson - Category Manager (Lead)
✓ Michael Chen - Procurement Director
✓ Emily Davis - Quality Manager
✓ Robert Wilson - Contract Specialist
✓ Lisa Anderson - Operations Coordinator

Supplier Participants (4):
✓ John Smith - Account Executive
✓ David Brown - Operations Manager
✓ Jennifer Lee - Quality Director
✓ Mark Thompson - Technical Lead

MEETING AGENDA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ✅ Review Previous Action Items (10 min)
2. ✅ Performance Metrics Discussion (25 min)
3. ✅ Quality Issues Resolution (15 min)
4. ✅ Innovation Opportunities (20 min)
5. ✅ Contract Renewal Discussion (15 min)
6. ✅ Action Items & Next Steps (5 min)

KEY DISCUSSION POINTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Performance Review:
• Quality acceptance rate: 97.2% (Target: 98%)
  - Discussed root causes of defects
  - Supplier committed to process improvements
  - Target: Achieve 98.5% by Q2 2024

• On-time delivery: 96.5% (Target: 95%) ✅
  - Excellent performance maintained
  - Supplier expanded capacity by 15%
  - No issues anticipated for next quarter

• Cost savings achieved: $125,000 YTD
  - Process optimization initiatives successful
  - Additional opportunities identified: $50K potential
  - Joint cost reduction team to be formed

Quality Issues Discussed:
• Issue #QA-2024-012: Component tolerance variations
  - Root cause: Supplier equipment calibration
  - Corrective action: Weekly calibration schedule implemented
  - Status: Resolved, monitoring for 30 days

• Issue #QA-2024-018: Packaging damage during transit
  - Root cause: Inadequate packaging materials
  - Corrective action: New packaging spec approved
  - Timeline: Implementation by March 1, 2024

Innovation & Collaboration:
• Joint R&D project proposal: AI-based demand forecasting
  - Investment required: $75,000 (split 50/50)
  - Expected ROI: 15% reduction in inventory costs
  - Decision: Approved, kickoff scheduled March 20

• Technology integration: EDI system enhancement
  - Real-time inventory visibility
  - Automated order processing
  - Target completion: Q2 2024

Contract Renewal:
• Current contract expires: June 30, 2024
• Renewal discussions to begin: April 1, 2024
• Key terms to negotiate:
  - Volume commitments and pricing
  - SLA improvements (target 24-hour response)
  - Innovation partnership framework
  - Sustainability targets

DECISIONS MADE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ✅ Approved AI forecasting pilot project
2. ✅ Committed to joint quality improvement team
3. ✅ Scheduled contract renewal kickoff meeting
4. ✅ Agreed to monthly performance reviews (vs quarterly)
5. ✅ Established innovation steering committee

ACTION ITEMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Our Team:
1. Sarah Johnson - Draft AI project charter (Due: Feb 28)
2. Emily Davis - Schedule quality team meetings (Due: Feb 25)
3. Robert Wilson - Prepare contract renewal timeline (Due: March 5)
4. Michael Chen - Approve innovation budget (Due: Feb 23)

Supplier Team:
1. John Smith - Submit cost reduction proposals (Due: March 1)
2. Jennifer Lee - Provide quality improvement plan (Due: Feb 27)
3. David Brown - Complete packaging spec changes (Due: March 1)
4. Mark Thompson - EDI integration project plan (Due: March 10)

MEETING OUTCOMES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Rating: ⭐⭐⭐⭐⭐ (5/5)
Relationship Status: Strong
Risk Level: Low
Collaboration Score: 95%

Next Meeting Scheduled:
Type: Monthly Performance Review
Date: March 22, 2024 @ 2:00 PM
Location: Virtual

MEETING ARTIFACTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Meeting recording saved to SharePoint
✓ Minutes distributed to all attendees
✓ Action items added to tracking system
✓ Performance scorecard updated
✓ Calendar holds sent for next meetings
✓ Supplier relationship dashboard updated

✅ Meeting logged successfully!
📧 Meeting summary emailed to all participants
📊 Action items visible in dashboard
🔔 Automated reminders set for all deliverables

Last updated: ${new Date().toLocaleString()}`);
  };

  // Handler 3: Track Action Items
  const handleTrackActionItems = () => {
    alert(`📋 Supplier Action Item Tracking

ACTION ITEM DASHBOARD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUMMARY STATISTICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Active Action Items: 24
✅ Completed: 156 (YTD)
⏰ Due This Week: 8
🔴 Overdue: 3
⚠️  At Risk: 5
📊 On-Time Completion Rate: 87.5%

CRITICAL & OVERDUE ITEMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 OVERDUE (3 items):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Item #AI-2024-089
   Supplier: Premier Manufacturing Co
   Owner: David Chen (Supplier Quality Manager)
   Task: Submit corrective action plan for defect reduction
   Due Date: Feb 10, 2024 (6 days overdue)
   Priority: HIGH
   Impact: Quality improvement initiative delayed
   Escalation: Sent to supplier VP Operations
   Status: Follow-up call scheduled for today

2. Item #AI-2024-104
   Supplier: Express Logistics Ltd
   Owner: Mike Chen (Supplier Account Rep)
   Task: Provide Q1 2024 capacity planning forecast
   Due Date: Feb 12, 2024 (4 days overdue)
   Priority: MEDIUM
   Impact: Production planning at risk
   Escalation: 2nd reminder sent
   Status: Supplier committed to delivery by EOD today

3. Item #AI-2024-112
   Supplier: Quality Components Inc
   Owner: Lisa Wong (Supplier Operations)
   Task: Complete EDI integration testing
   Due Date: Feb 15, 2024 (1 day overdue)
   Priority: LOW
   Impact: Minor - automation efficiency delayed
   Escalation: None yet
   Status: Awaiting IT resource allocation

⚠️  AT RISK (5 items):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Item #AI-2024-125
   Supplier: Global Tech Solutions
   Task: AI forecasting pilot - project charter
   Owner: John Smith
   Due: Feb 28, 2024 (12 days remaining)
   Status: Draft in progress
   Risk: Resource constraints identified
   Mitigation: Additional PM support assigned

2. Item #AI-2024-130
   Supplier: Premier Manufacturing Co
   Task: ISO 9001 recertification documentation
   Owner: Sarah Johnson (Supplier Quality Dir)
   Due: Feb 29, 2024 (13 days remaining)
   Status: 60% complete
   Risk: Audit schedule conflicts
   Mitigation: Extended deadline requested

3. Item #AI-2024-135
   Supplier: Express Logistics Ltd
   Task: New packaging specification implementation
   Owner: Mike Chen
   Due: March 1, 2024 (14 days remaining)
   Status: Materials ordered, delivery delayed
   Risk: Supply chain disruption
   Mitigation: Backup supplier identified

4. Item #AI-2024-142
   Supplier: Quality Components Inc
   Task: Cost reduction proposal submission
   Owner: Lisa Wong
   Due: March 5, 2024 (18 days remaining)
   Status: Analysis phase
   Risk: Insufficient data for business case
   Mitigation: Joint workshop scheduled

5. Item #AI-2024-148
   Supplier: Global Tech Solutions
   Task: Contract renewal terms negotiation prep
   Owner: Robert Wilson (Our team)
   Due: March 10, 2024 (23 days remaining)
   Status: Initial draft prepared
   Risk: Legal review bottleneck
   Mitigation: Legal team prioritizing review

✅ DUE THIS WEEK (8 items):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feb 19 (2 days):
• Quality improvement plan - Premier Mfg (On track)
• Monthly performance report - Express Logistics (On track)

Feb 21 (4 days):
• Innovation proposal review - Global Tech (On track)
• Capacity forecast update - Quality Components (On track)

Feb 23 (6 days):
• Budget approval for AI project - Our team (On track)
• Supplier diversity certification - Premier Mfg (On track)

Feb 24 (7 days):
• Site visit preparation - Express Logistics (On track)
• Contract amendment review - Quality Components (On track)

ACTION ITEMS BY SUPPLIER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Global Tech Solutions:
• Total Active: 6 items
• Overdue: 0
• At Risk: 2
• On-Time Rate: 92%
• Avg Days to Complete: 12 days

Premier Manufacturing Co:
• Total Active: 8 items
• Overdue: 1 ⚠️
• At Risk: 2
• On-Time Rate: 78% ⚠️
• Avg Days to Complete: 18 days

Express Logistics Ltd:
• Total Active: 5 items
• Overdue: 1 ⚠️
• At Risk: 1
• On-Time Rate: 85%
• Avg Days to Complete: 14 days

Quality Components Inc:
• Total Active: 5 items
• Overdue: 1 ⚠️
• At Risk: 1
• On-Time Rate: 82%
• Avg Days to Complete: 16 days

PERFORMANCE TRENDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Last 30 Days:
• Items Created: 32
• Items Completed: 28
• Items Overdue: 5
• Avg Completion Time: 14.5 days
• On-Time Rate: 87.5%

Last 90 Days:
• Items Created: 98
• Items Completed: 85
• Items Overdue: 12
• Avg Completion Time: 15.2 days
• On-Time Rate: 86.7%

AUTOMATED ACTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Daily email digest sent to all owners
✓ Overdue items escalated to managers
✓ Weekly status reports generated
✓ At-risk items flagged 5 days before due date
✓ Completion notifications sent to stakeholders
✓ Performance scorecards updated in real-time

TRACKING SYSTEM FEATURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Real-time status updates
✅ Automated reminder notifications
✅ Escalation workflows
✅ Performance analytics
✅ Mobile app integration
✅ Supplier portal access
✅ Document attachment support
✅ Comment/discussion threads
✅ Audit trail logging

NEXT ACTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Follow up on 3 overdue items today
2. Review at-risk items with category managers
3. Schedule check-in calls with underperforming suppliers
4. Update action item templates based on feedback
5. Conduct monthly action item retrospective

✅ Action item tracking dashboard updated
📊 Performance metrics refreshed
🔔 Notifications sent for overdue items
📧 Weekly summary report scheduled for Friday

Last synchronized: ${new Date().toLocaleString()}`);
  };

  // Handler 4: Measure Satisfaction
  const handleMeasureSatisfaction = () => {
    alert(`📊 Supplier Satisfaction Measurement

SATISFACTION SURVEY SYSTEM:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERALL SATISFACTION SCORE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current Quarter: 4.3/5.0 (86%)
Previous Quarter: 4.1/5.0 (82%)
Trend: ↑ +4% Improvement ✅
Industry Benchmark: 4.0/5.0
Our Performance: Above Average ⭐

SATISFACTION BREAKDOWN BY CATEGORY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Communication & Responsiveness:
Score: 4.5/5.0 (90%) ⭐⭐⭐⭐⭐
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Email response time: 4.6/5.0
• Phone availability: 4.4/5.0
• Meeting effectiveness: 4.7/5.0
• Clarity of requirements: 4.3/5.0

Strengths:
✓ Fast response to inquiries
✓ Proactive communication on issues
✓ Clear escalation processes
✓ Regular business reviews

Areas for Improvement:
⚠️  More advance notice for forecast changes
⚠️  Better coordination across internal teams

Payment & Financial:
Score: 4.2/5.0 (84%) ⭐⭐⭐⭐
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Payment timeliness: 4.6/5.0 ✅
• Invoice processing: 3.8/5.0 ⚠️
• Pricing transparency: 4.3/5.0
• Contract terms fairness: 4.2/5.0

Strengths:
✓ Consistent on-time payments
✓ Fair pricing negotiations
✓ Transparent cost structures

Areas for Improvement:
⚠️  Reduce invoice disputes (current: 12%)
⚠️  Faster payment approval process
⚠️  Better visibility into payment status

Quality & Technical Requirements:
Score: 4.1/5.0 (82%) ⭐⭐⭐⭐
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Specification clarity: 4.0/5.0
• Technical support: 4.3/5.0
• Quality standards: 4.2/5.0
• Testing requirements: 3.9/5.0 ⚠️

Strengths:
✓ Clear quality standards
✓ Responsive technical team
✓ Collaborative problem-solving

Areas for Improvement:
⚠️  More detailed specifications upfront
⚠️  Streamline testing/approval processes
⚠️  Better documentation of requirements

Forecasting & Planning:
Score: 3.9/5.0 (78%) ⭐⭐⭐
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Forecast accuracy: 3.7/5.0 ⚠️
• Lead time consistency: 4.0/5.0
• Demand visibility: 3.8/5.0 ⚠️
• Capacity planning: 4.1/5.0

Strengths:
✓ Reasonable lead time expectations
✓ Flexibility for urgent needs

Areas for Improvement:
⚠️  Improve forecast accuracy (currently 72%)
⚠️  Provide longer-term visibility (6+ months)
⚠️  More collaborative planning sessions
⚠️  Better communication of demand changes

Partnership & Collaboration:
Score: 4.4/5.0 (88%) ⭐⭐⭐⭐⭐
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Innovation collaboration: 4.5/5.0
• Joint problem solving: 4.6/5.0
• Strategic alignment: 4.3/5.0
• Long-term commitment: 4.2/5.0

Strengths:
✓ Strong collaborative culture
✓ Open to innovation initiatives
✓ Fair treatment as partners
✓ Transparent communication

Areas for Improvement:
⚠️  More joint innovation projects
⚠️  Longer contract commitments for strategic suppliers

SATISFACTION BY SUPPLIER TIER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Strategic Tier:
• Average Score: 4.6/5.0 (92%)
• Response Rate: 100%
• Key Strength: Partnership approach
• Focus Area: Innovation collaboration

Preferred Tier:
• Average Score: 4.3/5.0 (86%)
• Response Rate: 95%
• Key Strength: Fair treatment
• Focus Area: Growth opportunities

Approved Tier:
• Average Score: 3.8/5.0 (76%)
• Response Rate: 78%
• Key Strength: Clear processes
• Focus Area: Communication consistency

SURVEY METHODOLOGY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Survey Frequency: Quarterly
Response Rate: 89% (133/150 suppliers)
Survey Method: Online + Phone interviews
Survey Duration: 10-15 minutes
Incentive: Quarterly business review summary

Question Categories:
• Communication (8 questions)
• Financial/Payment (6 questions)
• Quality/Technical (7 questions)
• Forecasting/Planning (6 questions)
• Partnership (5 questions)
• Open-ended feedback (3 questions)

SUPPLIER FEEDBACK HIGHLIGHTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Top Positive Comments:
1. "Best customer to work with - fair, transparent, responsive"
   - Global Tech Solutions

2. "Payment always on time, good communication"
   - Premier Manufacturing Co

3. "Open to innovation and collaboration"
   - Express Logistics Ltd

4. "Clear quality standards and expectations"
   - Quality Components Inc

Top Improvement Suggestions:
1. "More advance notice on forecast changes (30+ days)"
   - 45% of suppliers

2. "Faster invoice approval and payment processing"
   - 38% of suppliers

3. "Better coordination between procurement and operations"
   - 32% of suppliers

4. "More detailed technical specifications upfront"
   - 28% of suppliers

ACTION PLAN BASED ON FEEDBACK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Immediate Actions (Next 30 Days):
1. Implement 45-day rolling forecast requirement
2. Streamline invoice approval workflow
3. Create cross-functional alignment meetings
4. Enhance specification templates

Short-term (90 Days):
1. Deploy supplier portal for payment visibility
2. Conduct specification writing training
3. Establish monthly forecast review process
4. Create supplier feedback response protocol

Long-term (6-12 Months):
1. Implement AI-based demand forecasting
2. Achieve 85% forecast accuracy
3. Reduce invoice cycle time to 15 days
4. Launch innovation partnership program

COMPETITIVE ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Our Score: 4.3/5.0 (86%)
Competitor A: 3.8/5.0 (76%)
Competitor B: 4.0/5.0 (80%)
Competitor C: 4.2/5.0 (84%)
Industry Leader: 4.5/5.0 (90%)

Our Position: #2 in industry
Gap to Leader: -0.2 points
Improvement Target: 4.5/5.0 by Q4 2024

✅ Satisfaction survey results analyzed
📊 Improvement action plan created
🎯 Targets set for next quarter
📧 Summary report sent to leadership
🔄 Next survey scheduled: April 1, 2024

Last updated: ${new Date().toLocaleString()}`);
  };

  // Handler 5: Conduct Performance Review
  const handlePerformanceReview = () => {
    alert(`📈 Supplier Performance Review

COMPREHENSIVE PERFORMANCE ASSESSMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUPPLIER: Global Tech Solutions
Review Period: Q4 2023 (Oct 1 - Dec 31, 2023)
Review Type: Quarterly Business Review
Reviewer: Sarah Johnson, Category Manager
Review Date: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Rating: ⭐⭐⭐⭐⭐ (92/100)
Performance Status: EXCEEDS EXPECTATIONS
Tier Classification: STRATEGIC
Recommendation: CONTINUE & EXPAND PARTNERSHIP

Key Highlights:
✅ Exceeded all quality targets
✅ Outstanding on-time delivery (98.5%)
✅ Successful innovation collaboration
✅ Strong cost management and savings
✅ Excellent communication and responsiveness

Areas of Excellence:
1. Quality performance consistently above 95%
2. Zero critical safety incidents
3. Proactive issue resolution
4. Innovation partnership contributions

DETAILED PERFORMANCE METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. QUALITY PERFORMANCE (Weight: 30%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Score: 94/100 ⭐⭐⭐⭐⭐

Quality Acceptance Rate:
• Target: ≥ 95%
• Actual: 97.5%
• Score: 100/100 ✅

Defect Rate:
• Target: ≤ 2%
• Actual: 1.2%
• Score: 95/100 ✅

Return Rate:
• Target: ≤ 1%
• Actual: 0.8%
• Score: 92/100 ✅

Customer Complaints:
• Target: ≤ 5 per quarter
• Actual: 2
• Score: 96/100 ✅

Corrective Actions:
• Open CARs: 1 (low priority)
• Closed On-Time: 100%
• Score: 90/100 ✅

Quality Trend: ↑ Improving
Previous Quarter: 96.2%
Improvement: +1.3%

2. DELIVERY PERFORMANCE (Weight: 25%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Score: 96/100 ⭐⭐⭐⭐⭐

On-Time Delivery:
• Target: ≥ 95%
• Actual: 98.5%
• Score: 100/100 ✅

Lead Time Performance:
• Target: ≤ 30 days
• Actual: 26 days avg
• Score: 93/100 ✅

Order Fill Rate:
• Target: ≥ 98%
• Actual: 99.2%
• Score: 98/100 ✅

Expedite Requests:
• Total: 3 (all fulfilled)
• Success Rate: 100%
• Score: 90/100 ✅

Delivery Trend: → Stable
Previous Quarter: 98.2%
Change: +0.3%

3. COST & VALUE (Weight: 20%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Score: 88/100 ⭐⭐⭐⭐

Competitive Pricing:
• Market Position: Top 25%
• Score: 85/100 ✅

Cost Savings Delivered:
• Target: $50,000/quarter
• Actual: $68,000
• Score: 95/100 ✅

Price Stability:
• Variance: +1.2% (within tolerance)
• Score: 90/100 ✅

Invoice Accuracy:
• Target: ≥ 99%
• Actual: 98.5%
• Score: 82/100 ⚠️

Total Cost of Ownership:
• Competitive position: Good
• Score: 88/100 ✅

Cost Trend: → Stable
Year-over-year: +2.5% (inflation-adjusted)

4. RESPONSIVENESS & SERVICE (Weight: 15%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Score: 95/100 ⭐⭐⭐⭐⭐

Response Time:
• Target: ≤ 24 hours
• Actual: 8 hours avg
• Score: 100/100 ✅

Issue Resolution:
• Avg Resolution Time: 3.5 days
• Target: ≤ 5 days
• Score: 95/100 ✅

Communication Quality:
• Survey Score: 4.6/5.0
• Score: 92/100 ✅

Account Management:
• Proactive updates: Excellent
• Score: 95/100 ✅

Service Trend: ↑ Improving
Customer satisfaction up 8%

5. INNOVATION & COLLABORATION (Weight: 10%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Score: 90/100 ⭐⭐⭐⭐⭐

Innovation Initiatives:
• Joint projects: 2 active
• Ideas submitted: 8
• Ideas implemented: 3
• Score: 92/100 ✅

Technology Adoption:
• EDI integration: Completed
• Supplier portal: Active user
• Score: 90/100 ✅

Sustainability:
• Carbon reporting: Complete
• Green initiatives: 4 active
• Score: 88/100 ✅

Innovation Trend: ↑ Strong growth
Partnership maturity increasing

WEIGHTED OVERALL SCORE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quality (30%): 94 × 0.30 = 28.2
Delivery (25%): 96 × 0.25 = 24.0
Cost (20%): 88 × 0.20 = 17.6
Service (15%): 95 × 0.15 = 14.3
Innovation (10%): 90 × 0.10 = 9.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL SCORE: 93.1/100 ⭐⭐⭐⭐⭐

PERFORMANCE RATING SCALE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
90-100: Exceeds Expectations ⭐⭐⭐⭐⭐
80-89: Meets Expectations ⭐⭐⭐⭐
70-79: Needs Improvement ⭐⭐⭐
60-69: Unsatisfactory ⭐⭐
<60: Critical Performance Issues ⭐

STRENGTHS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Exceptional quality consistency (97.5% acceptance)
2. Outstanding delivery reliability (98.5% on-time)
3. Proactive communication and issue resolution
4. Strong innovation partnership mentality
5. Competitive pricing with value-added services
6. Excellent customer service and responsiveness

IMPROVEMENT OPPORTUNITIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Invoice accuracy (currently 98.5%, target 99%)
   • Root cause: Manual data entry errors
   • Action: Implement automated invoice generation
   • Timeline: Q1 2024

2. Cost competitiveness in certain categories
   • Action: Joint cost reduction workshops
   • Target: Additional $25K savings in Q1
   • Timeline: Ongoing

3. Expand innovation pipeline
   • Action: Quarterly innovation review meetings
   • Target: 5 new ideas per quarter
   • Timeline: Starting Q1 2024

RISK ASSESSMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Risk Level: LOW ✅

Supply Continuity: LOW
Financial Health: STRONG
Quality Risk: LOW
Capacity Risk: LOW
Geopolitical Risk: MEDIUM (monitor)

RECOMMENDATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ✅ MAINTAIN Strategic Tier classification
2. ✅ EXPAND partnership scope
3. ✅ INCREASE contract value by 15%
4. ✅ EXTEND contract term to 3 years
5. ✅ NOMINATE for Supplier Excellence Award

NEXT ACTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Schedule contract renewal discussion (March 2024)
2. Plan joint innovation workshop (February 2024)
3. Conduct site visit to supplier facility (April 2024)
4. Review and approve volume increase (January 2024)
5. Present findings to executive stakeholders

✅ Performance review completed
📊 Scorecard updated in system
📧 Report shared with stakeholder team
📅 Next review scheduled: April 15, 2024
🏆 Supplier notified of excellent performance

Generated: ${new Date().toLocaleString()}
Approved by: Sarah Johnson, Category Manager`);
  };

  // Handler 6: Manage Supplier Development
  const handleSupplierDevelopment = () => {
    alert(`🎓 Supplier Development Program

SUPPLIER DEVELOPMENT INITIATIVES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROGRAM OVERVIEW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Suppliers in Program: 18
Active Development Plans: 12
Completed Programs (YTD): 8
Success Rate: 87.5%
Total Investment: $245,000
ROI Achieved: 340% ($832,000 value created)

DEVELOPMENT CATEGORIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Quality Improvement Programs (6 active)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Program: Six Sigma Green Belt Training
Supplier: Premier Manufacturing Co
Status: In Progress (Month 4 of 6)
Investment: $25,000
Objectives:
• Reduce defect rate from 3.2% to <2%
• Implement statistical process control
• Train 5 quality engineers

Progress:
✓ Module 1-3 completed (50%)
✓ 2 projects identified
⏳ First project kickoff scheduled
Target Completion: April 2024

Expected Benefits:
• $125,000 annual cost savings
• 40% reduction in quality issues
• Improved process capability

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Program: ISO 9001:2015 Certification Support
Supplier: Quality Components Inc
Status: In Progress (Month 2 of 8)
Investment: $35,000
Objectives:
• Achieve ISO 9001:2015 certification
• Establish quality management system
• Improve documentation practices

Progress:
✓ Gap analysis completed
✓ Quality manual drafted
⏳ Internal audit training scheduled
Target Completion: June 2024

Expected Benefits:
• Improved quality consistency
• Better supplier tier classification
• Expanded business opportunities

2. Operational Excellence (4 active)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Program: Lean Manufacturing Implementation
Supplier: Express Logistics Ltd
Status: Planning Phase
Investment: $45,000
Objectives:
• Reduce lead times by 20%
• Improve warehouse efficiency
• Eliminate waste in processes

Planned Activities:
• Value stream mapping workshop (Feb)
• 5S implementation (Mar-Apr)
• Kaizen events (May-Jun)
Target Completion: July 2024

Expected Benefits:
• $180,000 annual savings
• 15% capacity increase
• Improved delivery performance

3. Technology & Digital Transformation (3 active)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Program: EDI/API Integration
Supplier: Global Tech Solutions
Status: Implementation (80% complete)
Investment: $30,000
Objectives:
• Real-time inventory visibility
• Automated order processing
• Electronic invoicing

Progress:
✓ System design completed
✓ Development 90% complete
✓ Testing in progress
⏳ Production rollout: March 1
Target Completion: March 2024

Expected Benefits:
• 50% reduction in order processing time
• Eliminate data entry errors
• $75,000 annual efficiency savings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Program: Supplier Portal Training
Supplier: All Strategic Suppliers
Status: Ongoing
Investment: $15,000
Objectives:
• 100% portal adoption
• Self-service capabilities
• Real-time collaboration

Progress:
✓ 15/18 suppliers trained
✓ 85% active usage rate
⏳ Advanced features training scheduled
Target: 95% adoption by Q2 2024

4. Financial & Business Development (2 active)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Program: Cost Reduction Workshop Series
Supplier: Multiple (6 suppliers)
Status: Series 2 of 4
Investment: $20,000
Objectives:
• Identify joint cost savings
• Value engineering opportunities
• Process optimization

Completed Workshops:
✓ Workshop 1: Material optimization
✓ Workshop 2: Logistics efficiency
⏳ Workshop 3: Design for manufacturing (Mar)
⏳ Workshop 4: Automation opportunities (Apr)

Results to Date:
• 23 cost reduction ideas identified
• $185,000 potential annual savings
• 8 projects approved for implementation

5. Sustainability & ESG (3 active)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Program: Carbon Footprint Reduction
Supplier: Premier Manufacturing Co
Status: Assessment Phase
Investment: $25,000
Objectives:
• Measure Scope 1, 2, 3 emissions
• Develop reduction roadmap
• Implement green initiatives

Planned Activities:
• Carbon audit (Feb-Mar)
• Reduction plan development (Apr)
• Initiative implementation (May-Dec)
Target: 15% reduction by end 2024

DEVELOPMENT METHODOLOGY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1: Assessment (Weeks 1-2)
• Current state analysis
• Gap identification
• Opportunity assessment
• Business case development

Phase 2: Planning (Weeks 3-4)
• Development plan creation
• Resource allocation
• Timeline and milestones
• Success metrics definition

Phase 3: Implementation (Months 2-6)
• Training and workshops
• Process improvements
• Technology deployment
• Change management

Phase 4: Validation (Month 7)
• Results measurement
• ROI calculation
• Lessons learned
• Continuous improvement

Phase 5: Sustainment (Ongoing)
• Performance monitoring
• Best practice sharing
• Advanced training
• Program expansion

INVESTMENT FRAMEWORK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Funding Sources:
• Procurement development budget: 60%
• Supplier co-investment: 30%
• Shared savings: 10%

Approval Criteria:
• Minimum ROI: 200%
• Payback period: <18 months
• Strategic alignment: High
• Risk level: Low-Medium

Investment Tiers:
• Tier 1 (<$10K): Category Manager approval
• Tier 2 ($10K-$50K): Director approval
• Tier 3 (>$50K): VP approval + business case

SUCCESS METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quality Improvements:
• Defect rate reduction: 35% average
• Customer complaints: -45%
• Quality cost reduction: $285K

Operational Improvements:
• Lead time reduction: 18% average
• On-time delivery: +12%
• Capacity increase: 22%

Financial Results:
• Total cost savings: $832,000
• Efficiency gains: $425,000
• Revenue growth enabled: $1.2M

Relationship Improvements:
• Supplier satisfaction: +15%
• Partnership strength: +25%
• Innovation collaboration: +40%

PROGRAM RECOGNITION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Supplier Development Awards:
🏆 Most Improved Supplier 2023
   Winner: Quality Components Inc
   Achievement: 25-point performance increase

🏆 Innovation Partnership Award
   Winner: Global Tech Solutions
   Achievement: 3 joint development projects

🏆 Sustainability Leadership
   Winner: Premier Manufacturing Co
   Achievement: 20% carbon reduction

NEXT PROGRAM CYCLE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Planning Period: Q1 2024
New Programs: 6 planned
Budget: $180,000
Focus Areas:
• Digital transformation
• Sustainability
• Innovation capability
• Supply chain resilience

✅ Development programs on track
📊 Results exceeding targets
🎯 High supplier engagement
💰 Strong ROI performance
🏆 Recognition program successful

Last updated: ${new Date().toLocaleString()}`);
  };

  return (
    <div className="p-6 space-y-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Supplier Relationship Management
            </h1>
            <p className="text-gray-600 mt-2">Build and maintain strong partnerships with your supply chain</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleScheduleQBR}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Schedule QBR
            </button>
            <button
              onClick={handleLogMeetings}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Log Meeting
            </button>
            <button
              onClick={handleTrackActionItems}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              Action Items
            </button>
            <button
              onClick={handleMeasureSatisfaction}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Satisfaction
            </button>
          </div>
        </div>

        {/* Additional Action Buttons Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={handlePerformanceReview}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Performance Review</span>
          </button>
          <button
            onClick={handleSupplierDevelopment}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Supplier Development</span>
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-600 text-sm font-medium">Total Suppliers</span>
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">147</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+12 this quarter</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-600 text-sm font-medium">Strategic Partners</span>
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">18</div>
            <div className="text-sm text-gray-600">12% of total</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-600 text-sm font-medium">Avg Performance</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">87.5</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+2.3 points</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-600 text-sm font-medium">Risk Level</span>
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">Low</div>
            <div className="text-sm text-gray-600">28% avg risk score</div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-rose-600 text-sm font-medium">Engagement Score</span>
              <Heart className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">92%</div>
            <div className="text-sm text-gray-600">Very High</div>
          </div>
        </div>
      </div>

      {/* Supplier Health Dashboard */}
      {showHealthDashboard && (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl shadow-sm p-3 border border-teal-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Supplier Health Monitoring</h2>
                <p className="text-sm text-gray-600">Real-time supplier health indicators and risk alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScorecards(!showScorecards)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                {showScorecards ? 'Hide' : 'View'} Scorecards
              </button>
              <button
                onClick={() => setShowHealthDashboard(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
            {/* Health Indicator 1 */}
            <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Excellent Health</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">24</div>
              <div className="text-xs text-gray-600 mt-1">Score: 90-100</div>
              <div className="mt-2 flex items-center gap-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }} />
                </div>
                <span className="text-xs text-gray-600">72%</span>
              </div>
            </div>

            {/* Health Indicator 2 */}
            <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Good Health</span>
                <ThumbsUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">18</div>
              <div className="text-xs text-gray-600 mt-1">Score: 75-89</div>
              <div className="mt-2 flex items-center gap-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '18%' }} />
                </div>
                <span className="text-xs text-gray-600">18%</span>
              </div>
            </div>

            {/* Health Indicator 3 */}
            <div className="bg-white rounded-lg p-3 border-l-4 border-amber-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Needs Attention</span>
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">8</div>
              <div className="text-xs text-gray-600 mt-1">Score: 60-74</div>
              <div className="mt-2 flex items-center gap-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '8%' }} />
                </div>
                <span className="text-xs text-gray-600">8%</span>
              </div>
            </div>

            {/* Health Indicator 4 */}
            <div className="bg-white rounded-lg p-3 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Critical</span>
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">2</div>
              <div className="text-xs text-gray-600 mt-1">Score: Below 60</div>
              <div className="mt-2 flex items-center gap-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '2%' }} />
                </div>
                <span className="text-xs text-gray-600">2%</span>
              </div>
            </div>
          </div>

          {/* Quick Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">Financial Risk Detected</h4>
                <p className="text-xs text-gray-600 mt-1">Quality Components Inc - Credit score dropped 15 points</p>
                <button className="text-xs text-red-600 hover:text-red-700 font-medium mt-1">Review Details →</button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">Delivery Performance Drop</h4>
                <p className="text-xs text-gray-600 mt-1">Express Logistics - On-time delivery fell to 82% (target: 95%)</p>
                <button className="text-xs text-amber-600 hover:text-amber-700 font-medium mt-1">View Metrics →</button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 flex items-start gap-3">
              <Star className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">Excellence Achievement</h4>
                <p className="text-xs text-gray-600 mt-1">Global Tech Solutions - 6 months of perfect performance</p>
                <button className="text-xs text-green-600 hover:text-green-700 font-medium mt-1">Send Recognition →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Scorecards */}
      {showScorecards && (
        <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Detailed Supplier Scorecards
            </h2>
            <button
              onClick={() => setShowScorecards(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Close Scorecards
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {suppliers.slice(0, 4).map((supplier) => (
              <div key={supplier.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.tier === 'strategic' ? 'bg-purple-100 text-purple-700' :
                        supplier.tier === 'preferred' ? 'bg-blue-100 text-blue-700' :
                        supplier.tier === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {supplier.tier.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-600">{supplier.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{supplier.performanceScore}</div>
                    <div className="text-xs text-gray-600">Overall Score</div>
                  </div>
                </div>

                {/* Scorecard Metrics */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Quality</span>
                      <span className="font-medium text-gray-900">{supplier.performanceScore - 2}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${supplier.performanceScore - 2}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Delivery</span>
                      <span className="font-medium text-gray-900">{supplier.performanceScore + 3}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${supplier.performanceScore + 3}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Cost Competitiveness</span>
                      <span className="font-medium text-gray-900">{supplier.performanceScore - 5}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${supplier.performanceScore - 5}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Innovation</span>
                      <span className="font-medium text-gray-900">{supplier.performanceScore - 8}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${supplier.performanceScore - 8}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Compliance</span>
                      <span className="font-medium text-gray-900">{supplier.performanceScore + 1}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${supplier.performanceScore + 1}%` }} />
                    </div>
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-xs text-gray-600">Spend</div>
                    <div className="text-sm font-bold text-gray-900">${(supplier.spend / 1000000).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Contracts</div>
                    <div className="text-sm font-bold text-gray-900">{supplier.contracts}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Risk</div>
                    <div className={`text-sm font-bold ${
                      supplier.riskScore < 25 ? 'text-green-600' :
                      supplier.riskScore < 50 ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {supplier.riskScore < 25 ? 'Low' : supplier.riskScore < 50 ? 'Medium' : 'High'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-t-xl">
          {['overview', 'suppliers', 'performance', 'engagement', 'risk', 'collaboration'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {/* Performance Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance by Tier</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" domain={[70, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                      <Legend />
                      <Line type="monotone" dataKey="strategic" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} name="Strategic" />
                      <Line type="monotone" dataKey="preferred" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Preferred" />
                      <Line type="monotone" dataKey="approved" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} name="Approved" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Spend by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${(value / 1000000).toFixed(2)}M`} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Relationship Health Radar */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Relationship Health Metrics</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={relationshipHealth}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="aspect" stroke="#6B7280" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6B7280" />
                    <Radar name="Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.5} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Upcoming Activities */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Engagement Activities</h3>
                </div>
                <div className="p-4 space-y-3">
                  {engagementActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${
                          activity.type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'audit' ? 'bg-amber-100 text-amber-600' :
                          activity.type === 'training' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {activity.type === 'meeting' && <MessageSquare className="w-5 h-5" />}
                          {activity.type === 'audit' && <Shield className="w-5 h-5" />}
                          {activity.type === 'training' && <Award className="w-5 h-5" />}
                          {activity.type === 'review' && <Star className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{activity.subject}</div>
                          <div className="text-sm text-gray-600">{activity.supplier}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{activity.date}</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                          activity.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="space-y-2">
              {/* Suppliers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            supplier.tier === 'strategic' ? 'bg-purple-100 text-purple-700' :
                            supplier.tier === 'preferred' ? 'bg-blue-100 text-blue-700' :
                            supplier.tier === 'approved' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {supplier.tier}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{supplier.category}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.status === 'active' ? 'bg-green-100 text-green-700' :
                        supplier.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                        supplier.status === 'suspended' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {supplier.status === 'active' && <CheckCircle className="w-3 h-3" />}
                        {supplier.status === 'inactive' && <XCircle className="w-3 h-3" />}
                        {supplier.status === 'suspended' && <AlertTriangle className="w-3 h-3" />}
                        {supplier.status === 'onboarding' && <Clock className="w-3 h-3" />}
                        {supplier.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <div className="text-xs text-gray-500">Performance</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                supplier.performanceScore >= 85 ? 'bg-green-500' :
                                supplier.performanceScore >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${supplier.performanceScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{supplier.performanceScore}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Risk Score</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                supplier.riskScore <= 30 ? 'bg-green-500' :
                                supplier.riskScore <= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${supplier.riskScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{supplier.riskScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${(supplier.spend / 1000000).toFixed(1)}M
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {supplier.contracts} contracts
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {supplier.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <button className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition flex items-center justify-center gap-1">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button className="flex-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        Engage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
