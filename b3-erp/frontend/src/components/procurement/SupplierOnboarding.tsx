'use client'

import React, { useState, useEffect } from 'react'
import {
  UserPlus,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  Building2,
  Shield,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  ChevronRight,
  Download,
  Eye,
  Edit,
  Send,
  XCircle,
  RefreshCw,
  Search,
  Plus,
  AlertTriangle,
  Filter,
  Star,
  ThumbsUp,
  MessageSquare,
  Paperclip,
  CheckSquare,
  Square,
  Info,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Activity,
  Lock,
  Unlock,
  Key,
  CreditCard,
  FileCheck,
  GitBranch,
  Settings
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
  RadialBarChart,
  RadialBar,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts'
import { procurementPagesService } from '@/services/procurement-pages.service'

interface OnboardingApplication {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  category: string
  status: 'new' | 'screening' | 'documentation' | 'verification' | 'approval' | 'completed' | 'rejected'
  progress: number
  submittedDate: string
  lastUpdate: string
  assignedTo: string
  riskScore?: number
  priority: 'high' | 'medium' | 'low'
}

interface OnboardingStep {
  id: number
  title: string
  description: string
  status: 'completed' | 'current' | 'pending'
  required: boolean
  documents?: string[]
  completedDate?: string
}

interface Document {
  id: string
  name: string
  type: string
  status: 'pending' | 'uploaded' | 'verified' | 'rejected'
  uploadedDate?: string
  expiryDate?: string
  required: boolean
}

export default function SupplierOnboarding() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedApplication, setSelectedApplication] = useState<OnboardingApplication | null>(null)
  const [showNewApplication, setShowNewApplication] = useState(false)

  // Applications (loaded from API)
  const [applications, setApplications] = useState<OnboardingApplication[]>([])

  useEffect(() => {
    let cancelled = false
    const loadOnboarding = async () => {
      try {
        const data = await procurementPagesService.getOnboardingInsights()
        const apps = Array.isArray(data?.applications) ? data.applications : []
        const mapped: OnboardingApplication[] = apps.map((a: any) => ({
          id: a?.vendorId ?? '',
          companyName: a?.vendorName ?? '',
          contactName: a?.contactName ?? '',
          email: a?.email ?? '',
          phone: a?.phone ?? '',
          category: a?.category ?? '',
          status: (a?.stage ?? 'new') as OnboardingApplication['status'],
          progress: a?.progress ?? 0,
          submittedDate: a?.submittedAt ?? '',
          lastUpdate: a?.lastUpdate ?? '',
          assignedTo: a?.assignedTo ?? '',
          riskScore: a?.riskScore ?? 0,
          priority: (a?.priority ?? 'medium') as OnboardingApplication['priority']
        }))
        if (!cancelled && mapped.length > 0) {
          setApplications(mapped)
        }
      } catch (err) {
        console.error('Failed to load onboarding insights:', err)
      }
    }
    loadOnboarding()
    return () => {
      cancelled = true
    }
  }, [])

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Initial Application',
      description: 'Basic company information and contact details',
      status: 'completed',
      required: true,
      completedDate: '2024-02-10'
    },
    {
      id: 2,
      title: 'Screening & Background Check',
      description: 'Financial stability and compliance verification',
      status: 'completed',
      required: true,
      completedDate: '2024-02-11'
    },
    {
      id: 3,
      title: 'Documentation Upload',
      description: 'Required certificates and legal documents',
      status: 'completed',
      required: true,
      documents: ['Business License', 'Tax Certificate', 'Insurance', 'Bank Details'],
      completedDate: '2024-02-12'
    },
    {
      id: 4,
      title: 'Verification & Validation',
      description: 'Document verification and reference checks',
      status: 'current',
      required: true
    },
    {
      id: 5,
      title: 'Risk Assessment',
      description: 'Financial and operational risk evaluation',
      status: 'pending',
      required: true
    },
    {
      id: 6,
      title: 'Approval & Contract',
      description: 'Final approval and contract signing',
      status: 'pending',
      required: true
    },
    {
      id: 7,
      title: 'System Access Setup',
      description: 'Portal access and integration setup',
      status: 'pending',
      required: false
    }
  ]

  const requiredDocuments: Document[] = [
    { id: 'DOC001', name: 'Business Registration Certificate', type: 'Legal', status: 'verified', uploadedDate: '2024-02-10', required: true },
    { id: 'DOC002', name: 'Tax Registration Certificate', type: 'Tax', status: 'verified', uploadedDate: '2024-02-10', required: true },
    { id: 'DOC003', name: 'Insurance Certificate', type: 'Insurance', status: 'uploaded', uploadedDate: '2024-02-12', expiryDate: '2024-12-31', required: true },
    { id: 'DOC004', name: 'Bank Account Details', type: 'Financial', status: 'verified', uploadedDate: '2024-02-11', required: true },
    { id: 'DOC005', name: 'ISO Certifications', type: 'Quality', status: 'uploaded', uploadedDate: '2024-02-12', required: false },
    { id: 'DOC006', name: 'Financial Statements', type: 'Financial', status: 'pending', required: true },
    { id: 'DOC007', name: 'Reference Letters', type: 'Reference', status: 'pending', required: false },
    { id: 'DOC008', name: 'NDA Agreement', type: 'Legal', status: 'uploaded', uploadedDate: '2024-02-13', required: true }
  ]

  const onboardingMetrics = {
    totalApplications: 45,
    inProgress: 18,
    completed: 22,
    rejected: 5,
    avgTime: 8.5,
    successRate: 81
  }

  const onboardingTrend = [
    { month: 'Jan', applications: 12, approved: 8, rejected: 2, pending: 2 },
    { month: 'Feb', applications: 15, approved: 10, rejected: 3, pending: 2 },
    { month: 'Mar', applications: 18, approved: 14, rejected: 2, pending: 2 },
    { month: 'Apr', applications: 14, approved: 11, rejected: 1, pending: 2 },
    { month: 'May', applications: 16, approved: 13, rejected: 2, pending: 1 },
    { month: 'Jun', applications: 20, approved: 16, rejected: 2, pending: 2 }
  ]

  const categoryDistribution = [
    { category: 'IT Services', count: 12, percentage: 27 },
    { category: 'Raw Materials', count: 8, percentage: 18 },
    { category: 'Logistics', count: 10, percentage: 22 },
    { category: 'Professional Services', count: 6, percentage: 13 },
    { category: 'Components', count: 5, percentage: 11 },
    { category: 'Others', count: 4, percentage: 9 }
  ]

  const onboardingFunnel = [
    { stage: 'Applications', value: 100, fill: '#3B82F6' },
    { stage: 'Screening', value: 85, fill: '#10B981' },
    { stage: 'Documentation', value: 70, fill: '#F59E0B' },
    { stage: 'Verification', value: 60, fill: '#8B5CF6' },
    { stage: 'Approval', value: 50, fill: '#EC4899' },
    { stage: 'Completed', value: 45, fill: '#14B8A6' }
  ]

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'approval': return 'bg-blue-100 text-blue-700'
      case 'verification': return 'bg-purple-100 text-purple-700'
      case 'documentation': return 'bg-amber-100 text-amber-700'
      case 'screening': return 'bg-yellow-100 text-yellow-700'
      case 'new': return 'bg-gray-100 text-gray-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Handler Functions
  const handleApproveSupplier = (application: OnboardingApplication) => {
    console.log('Approving supplier:', application.id);

    if (application.status !== 'approval') {
      alert(`Cannot Approve - Application Not Ready\n\nCurrent Status: ${application.status.toUpperCase()}\n\nThis application must complete all prior steps before approval:\n\n${application.status === 'new' ? '⏳ STEP 1: Screening & Background Check\n⏳ STEP 2: Documentation Upload\n⏳ STEP 3: Verification & Validation\n⏳ STEP 4: Risk Assessment' : application.status === 'screening' ? '⏳ STEP 2: Documentation Upload\n⏳ STEP 3: Verification & Validation\n⏳ STEP 4: Risk Assessment' : application.status === 'documentation' ? '⏳ STEP 3: Verification & Validation\n⏳ STEP 4: Risk Assessment' : application.status === 'verification' ? '⏳ STEP 4: Risk Assessment' : ''}\n\nEstimated time to approval readiness: ${application.status === 'new' ? '6-8 days' : application.status === 'screening' ? '4-6 days' : application.status === 'documentation' ? '2-4 days' : application.status === 'verification' ? '1-2 days' : 'N/A'}\n\nTo expedite:\n- Ensure all required documents are uploaded\n- Complete verification checks\n- Assign risk assessment tasks\n- Follow up with supplier for missing information`);
      return;
    }

    const checklistItems = [
      { item: 'All required documents verified', status: 'complete' },
      { item: 'Background check cleared', status: 'complete' },
      { item: 'Financial stability confirmed', status: 'complete' },
      { item: 'Reference checks completed', status: application.progress >= 85 ? 'complete' : 'pending' },
      { item: 'Risk assessment approved', status: (application.riskScore || 0) < 50 ? 'complete' : 'warning' },
      { item: 'Compliance requirements met', status: 'complete' },
      { item: 'Contract terms agreed', status: application.progress >= 90 ? 'complete' : 'pending' }
    ];

    const pendingItems = checklistItems.filter(item => item.status === 'pending');
    const warningItems = checklistItems.filter(item => item.status === 'warning');

    alert(`Approve Supplier: ${application.companyName}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nAPPLICATION DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nApplication ID: ${application.id}\nCompany: ${application.companyName}\nContact: ${application.contactName}\nCategory: ${application.category}\nSubmitted: ${application.submittedDate}\nProgress: ${application.progress}%\nRisk Score: ${application.riskScore || 'N/A'}\nAssigned To: ${application.assignedTo}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nAPPROVAL CHECKLIST\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${checklistItems.map(item => `${item.status === 'complete' ? '✓' : item.status === 'warning' ? '⚠️' : '☐'} ${item.item}`).join('\n')}\n\n${warningItems.length > 0 ? `⚠️ WARNINGS (${warningItems.length}):\n${warningItems.map(item => `- ${item.item}`).join('\n')}\n\n` : ''}${pendingItems.length > 0 ? `⏳ PENDING ITEMS (${pendingItems.length}):\n${pendingItems.map(item => `- ${item.item}`).join('\n')}\n\nCannot approve until all items are completed.\n\n` : ''}${pendingItems.length === 0 && warningItems.length === 0 ? '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nAPPROVAL PROCESS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✓ All requirements met - Ready for approval!\n\nUpon approval:\n\n1. SUPPLIER ACTIVATION:\n   - Create supplier master record\n   - Generate supplier ID\n   - Assign supplier classification\n   - Set payment terms and credit limit\n\n2. SYSTEM ACCESS:\n   - Create supplier portal account\n   - Email login credentials\n   - Grant appropriate permissions\n   - Enable PO and invoice access\n\n3. NOTIFICATIONS:\n   - Welcome email to supplier\n   - Onboarding completion certificate\n   - Portal user guide and training materials\n   - Procurement team notification\n\n4. CONTRACT EXECUTION:\n   - Finalize supplier agreement\n   - Digital signature collection\n   - Store executed contract\n   - Set contract review dates\n\n5. INTEGRATION SETUP:\n   - ERP system integration\n   - Catalog setup (if applicable)\n   - EDI/API connections\n   - Payment gateway configuration\n\nAPPROVAL LEVELS:\n- Procurement Manager: Auto-approved\n- CPO Approval: Required for high-risk or strategic suppliers\n- Finance Approval: Required for credit limit > $100K\n- Legal Approval: Completed\n\nEstimated activation time: 2-3 business days\n\nProceed with supplier approval?' : `Review and resolve ${pendingItems.length + warningItems.length} item(s) before approval.`}`);
  };

  const handleRejectApplication = (application: OnboardingApplication) => {
    console.log('Rejecting application:', application.id);

    alert(`Reject Supplier Application: ${application.companyName}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nAPPLICATION DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nApplication ID: ${application.id}\nCompany: ${application.companyName}\nContact: ${application.contactName} (${application.email})\nCategory: ${application.category}\nCurrent Status: ${application.status.toUpperCase()}\nProgress: ${application.progress}%\nSubmitted: ${application.submittedDate}\nAssigned To: ${application.assignedTo}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nREJECTION REASONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSelect primary reason for rejection:\n\n1. COMPLIANCE ISSUES:\n   □ Failed background check\n   □ Fraudulent documentation\n   □ Sanctions list match\n   □ Legal/regulatory violations\n   □ Expired certifications\n\n2. FINANCIAL CONCERNS:\n   □ Poor credit rating\n   □ Insufficient financial stability\n   □ Bankruptcy/insolvency risk\n   □ Outstanding tax liabilities\n   □ Inadequate insurance coverage\n\n3. CAPABILITY GAPS:\n   □ Does not meet quality standards\n   □ Insufficient capacity/capability\n   □ No relevant industry experience\n   □ Inadequate technical expertise\n   □ Cannot meet delivery requirements\n\n4. RISK FACTORS:\n   □ High risk score (>${application.riskScore})\n   □ Geographic/political risk\n   □ Cybersecurity concerns\n   □ Environmental/sustainability issues\n   □ Poor reference feedback\n\n5. DOCUMENTATION:\n   □ Incomplete application\n   □ Missing required documents\n   □ Unverifiable information\n   □ Non-responsive to requests\n   □ Unclear business structure\n\n6. STRATEGIC FIT:\n   □ Category not aligned with needs\n   □ Duplicate supplier\n   □ Better alternatives available\n   □ Conflict of interest\n   □ Geographic limitations\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nREJECTION WORKFLOW\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. SELECT REJECTION REASON(S):\n   - Choose one or more reasons from above\n   - Provide detailed explanation (required)\n   - Attach supporting evidence if available\n\n2. INTERNAL APPROVAL:\n   - Procurement Manager review\n   - Risk/Compliance sign-off (for compliance issues)\n   - Category Manager notification\n\n3. SUPPLIER NOTIFICATION:\n   - Professional rejection letter\n   - General feedback (no confidential details)\n   - Option to reapply after remediation\n   - Timeline for reapplication (if applicable)\n\n4. RECORD KEEPING:\n   - Document rejection in system\n   - Archive application and documents\n   - Add to rejection log for analytics\n   - Flag for future reference\n\n5. FOLLOW-UP OPTIONS:\n   □ Allow reapplication after 6 months\n   □ Allow reapplication after remediation\n   □ Permanent rejection\n   □ Suggest alternative partnership model\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNOTIFICATIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nWill notify:\n✉ ${application.contactName} (${application.email})\n✉ ${application.assignedTo} (Procurement Officer)\n✉ Procurement Manager\n✉ Category Manager\n\nREJECTION CONFIRMATION:\nThis action is REVERSIBLE within 30 days.\nAfter 30 days, supplier must submit new application.\n\nProvide detailed rejection comments and proceed?`);
  };

  const handleRequestDocuments = (application: OnboardingApplication) => {
    console.log('Requesting documents from:', application.id);

    const pendingDocs = requiredDocuments.filter(doc => doc.status === 'pending');
    const rejectedDocs = requiredDocuments.filter(doc => doc.status === 'rejected');
    const expiringDocs = requiredDocuments.filter(doc =>
      doc.expiryDate && new Date(doc.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );

    alert(`Request Documents: ${application.companyName}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nAPPLICATION DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nApplication ID: ${application.id}\nContact: ${application.contactName}\nEmail: ${application.email}\nPhone: ${application.phone}\nCurrent Status: ${application.status.toUpperCase()}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDOCUMENT STATUS SUMMARY\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📋 Total Required Documents: ${requiredDocuments.filter(doc => doc.required).length}\n✓ Verified: ${requiredDocuments.filter(doc => doc.status === 'verified').length}\n📤 Uploaded (Pending Review): ${requiredDocuments.filter(doc => doc.status === 'uploaded').length}\n⏳ Pending Upload: ${pendingDocs.length}\n❌ Rejected/Needs Replacement: ${rejectedDocs.length}\n⚠️ Expiring Soon (< 30 days): ${expiringDocs.length}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nREQUIRED DOCUMENTS - PENDING\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${pendingDocs.length > 0 ? pendingDocs.map((doc, idx) =>
  `${idx + 1}. ${doc.name}\n   Type: ${doc.type}\n   Status: PENDING UPLOAD\n   Required: ${doc.required ? 'YES (MANDATORY)' : 'Optional'}\n   Accepted Formats: PDF, JPG, PNG\n   Max Size: 10MB`
).join('\n\n') : 'All required documents uploaded ✓'}\n\n${rejectedDocs.length > 0 ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nREJECTED - NEEDS REPLACEMENT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${rejectedDocs.map((doc, idx) =>
  `${idx + 1}. ${doc.name}\n   Reason: [Document quality/authenticity issue]\n   Action: Upload replacement\n   Priority: HIGH`
).join('\n\n')}\n\n` : ''}${expiringDocs.length > 0 ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nEXPIRING SOON - RENEWAL NEEDED\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${expiringDocs.map((doc, idx) =>
  `${idx + 1}. ${doc.name}\n   Current Expiry: ${doc.expiryDate}\n   Days Remaining: ${Math.ceil((new Date(doc.expiryDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}\n   Action: Upload renewed document`
).join('\n\n')}\n\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDOCUMENT REQUEST OPTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. AUTOMATED EMAIL REQUEST:\n   ✓ Professional email template\n   ✓ Checklist of required documents\n   ✓ Upload instructions and portal link\n   ✓ Deadline for submission (7 days)\n   ✓ Contact details for questions\n\n2. PHONE FOLLOW-UP:\n   - Personal call to ${application.contactName}\n   - Explain document requirements\n   - Address any questions/concerns\n   - Confirm email received\n\n3. PORTAL NOTIFICATION:\n   - In-app notification\n   - Red badge on supplier portal\n   - Dashboard alert\n   - Required actions list\n\n4. URGENT REQUEST (EXPEDITED):\n   - Email + Phone + SMS\n   - 24-48 hour deadline\n   - Escalation to management\n   - For high-priority suppliers\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nREQUEST DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nDocument Request Type:\n□ Standard Request (7-day deadline)\n□ Urgent Request (2-day deadline)\n□ Reminder (for previous request)\n□ Escalation (2nd+ reminder)\n\nDelivery Method:\n☑ Email notification\n☑ Supplier portal notification\n□ SMS alert\n□ Phone call follow-up\n\nInclude:\n☑ Document checklist\n☑ Upload instructions\n☑ Deadline and consequences\n☑ Contact for assistance\n□ Sample documents\n\nEmail will be sent to:\n✉ ${application.email}\nCC: ${application.assignedTo}\n\nAutomated reminder: 2 days before deadline\nEscalation: If no response after deadline\n\nProceed with document request?`);
  };

  const handleCompleteOnboarding = (application: OnboardingApplication) => {
    console.log('Completing onboarding:', application.id);

    if (application.status !== 'completed' && application.progress < 100) {
      alert(`Cannot Complete Onboarding - Process Incomplete\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCURRENT STATUS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nApplication: ${application.id}\nCompany: ${application.companyName}\nStatus: ${application.status.toUpperCase()}\nProgress: ${application.progress}%\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nREMAINING STEPS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${onboardingSteps.filter(step => step.status !== 'completed').map((step, idx) =>
  `${idx + 1}. ${step.title}\n   Status: ${step.status.toUpperCase()}\n   ${step.description}\n   Required: ${step.required ? 'YES' : 'No (Optional)'}`
).join('\n\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNEXT ACTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${application.status === 'new' ? '1. Start screening & background check\n2. Request initial documentation\n3. Assign to verification team' : application.status === 'screening' ? '1. Complete background verification\n2. Request missing documents\n3. Proceed to documentation phase' : application.status === 'documentation' ? '1. Verify all uploaded documents\n2. Request any missing/rejected items\n3. Proceed to verification phase' : application.status === 'verification' ? '1. Complete reference checks\n2. Perform risk assessment\n3. Submit for approval' : application.status === 'approval' ? '1. Get final approval from stakeholders\n2. Execute contracts\n3. Setup system access' : 'N/A'}\n\nEstimated time to completion: ${100 - application.progress < 25 ? '1-2 days' : 100 - application.progress < 50 ? '3-5 days' : 100 - application.progress < 75 ? '5-8 days' : '8-12 days'}\n\nContact ${application.assignedTo} to expedite remaining steps.`);
      return;
    }

    alert(`Complete Supplier Onboarding: ${application.companyName}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nONBOARDING SUMMARY\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✓ Application ID: ${application.id}\n✓ Company: ${application.companyName}\n✓ Contact: ${application.contactName}\n✓ Category: ${application.category}\n✓ Submitted: ${application.submittedDate}\n✓ Duration: ${Math.ceil((new Date().getTime() - new Date(application.submittedDate).getTime()) / (1000 * 60 * 60 * 24))} days\n✓ Assigned To: ${application.assignedTo}\n✓ Progress: 100%\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCOMPLETED STEPS ✓\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${onboardingSteps.filter(step => step.required).map((step, idx) =>
  `${idx + 1}. ${step.title}\n   ✓ Completed: ${step.completedDate || 'Today'}\n   ${step.description}`
).join('\n\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nFINAL ONBOARDING ACTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. SUPPLIER ACTIVATION:\n   ✓ Generate Supplier ID: SUP-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}\n   ✓ Create master data record in ERP\n   ✓ Set payment terms: Net 30\n   ✓ Credit limit: $50,000 (initial)\n   ✓ Supplier classification: ${application.category}\n   ✓ Preferred status: Under evaluation\n\n2. SYSTEM ACCESS SETUP:\n   ✓ Create supplier portal account\n   ✓ Username: ${application.email}\n   ✓ Send welcome email with credentials\n   ✓ Grant permissions: PO View, Invoice Submit\n   ✓ Enable notifications\n\n3. DOCUMENTATION:\n   ✓ Executed supplier agreement stored\n   ✓ All certificates archived\n   ✓ Background check results filed\n   ✓ Onboarding checklist completed\n   ✓ Approval trail documented\n\n4. NOTIFICATIONS:\n   ✉ Welcome email to supplier\n   ✉ Onboarding certificate (PDF)\n   ✉ Portal user guide and training video\n   ✉ Category manager notification\n   ✉ Procurement team update\n   ✉ Finance/AP team notification\n\n5. INTEGRATION:\n   ✓ ERP master data sync\n   ✓ Enable PO processing\n   ✓ Setup invoice routing\n   ✓ Configure payment methods\n   ✓ Link to contracts module\n\n6. POST-ONBOARDING:\n   - Schedule 30-day check-in call\n   - Assign to category manager\n   - Enable performance tracking\n   - Setup quarterly review\n   - Add to preferred supplier evaluation\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nWELCOME PACKAGE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSupplier will receive:\n📧 Welcome email with portal link\n📄 Onboarding completion certificate\n📚 Supplier handbook & policies\n🎥 Portal training video (15 min)\n📞 Dedicated support contact\n📅 Upcoming webinar invite\n\nFirst PO expected: Within 7 days\nInitial order value: ~$5,000\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCONFIRMATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nMark ${application.companyName} as fully onboarded?\n\nThis will:\n✓ Close onboarding application\n✓ Activate supplier in all systems\n✓ Send welcome package\n✓ Enable transaction processing\n✓ Start performance monitoring\n\nProceed with onboarding completion?`);
  };

  const handleViewApplication = (application: OnboardingApplication) => {
    console.log('Viewing application:', application.id);

    const completedSteps = onboardingSteps.filter(step => step.status === 'completed').length;
    const currentStep = onboardingSteps.find(step => step.status === 'current');
    const verifiedDocs = requiredDocuments.filter(doc => doc.status === 'verified').length;
    const pendingDocs = requiredDocuments.filter(doc => doc.status === 'pending').length;

    alert(`Supplier Application Details\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCOMPANY INFORMATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nApplication ID: ${application.id}\nCompany Name: ${application.companyName}\nCategory: ${application.category}\nPriority: ${application.priority.toUpperCase()}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCONTACT DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nPrimary Contact: ${application.contactName}\nEmail: ${application.email}\nPhone: ${application.phone}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nONBOARDING PROGRESS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nStatus: ${application.status.toUpperCase()}\nProgress: ${application.progress}%\nCompleted Steps: ${completedSteps}/${onboardingSteps.filter(s => s.required).length}\nCurrent Step: ${currentStep?.title || 'N/A'}\n\nSubmitted: ${application.submittedDate}\nLast Updated: ${application.lastUpdate}\nTime in Process: ${Math.ceil((new Date().getTime() - new Date(application.submittedDate).getTime()) / (1000 * 60 * 60 * 24))} days\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDOCUMENTATION STATUS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nVerified Documents: ${verifiedDocs}/${requiredDocuments.filter(d => d.required).length}\nPending Upload: ${pendingDocs}\nExpiring Soon: ${requiredDocuments.filter(doc => doc.expiryDate && new Date(doc.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nRISK ASSESSMENT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nRisk Score: ${application.riskScore || 'Not assessed'}\nRisk Level: ${!application.riskScore ? 'TBD' : application.riskScore < 30 ? 'LOW' : application.riskScore < 60 ? 'MEDIUM' : 'HIGH'}\nFinancial Check: ${application.progress >= 50 ? 'Completed ✓' : 'Pending'}\nCompliance Check: ${application.progress >= 40 ? 'Completed ✓' : 'Pending'}\nReference Checks: ${application.progress >= 70 ? 'Completed ✓' : 'Pending'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nASSIGNMENT & OWNERSHIP\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nAssigned To: ${application.assignedTo}\nCategory Manager: [Auto-assigned]\nApproving Authority: Procurement Manager\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNEXT ACTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${application.status === 'approval' ? '• Review final approval checklist\n• Get stakeholder sign-off\n• Execute supplier agreement\n• Setup system access' : application.status === 'verification' ? '• Complete document verification\n• Perform reference checks\n• Conduct risk assessment\n• Prepare approval package' : application.status === 'documentation' ? '• Review uploaded documents\n• Request missing items\n• Verify document authenticity\n• Check expiry dates' : application.status === 'screening' ? '• Complete background check\n• Financial stability analysis\n• Compliance verification\n• Request documentation' : '• Begin initial screening\n• Contact supplier for info\n• Schedule kickoff call'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nQUICK ACTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n- View complete application form\n- Download all documents\n- Send message to supplier\n- Request additional information\n- Assign to different team member\n- Add notes/comments\n- View audit trail\n- Print application summary`);
  };

  const handleExportApplications = () => {
    console.log('Exporting applications...');

    alert(`Export Supplier Onboarding Data\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nEXPORT OPTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. APPLICATIONS REPORT:\n   - All applications with current status\n   - Contact details and progress tracking\n   - Risk scores and priority levels\n   - Timeline and duration metrics\n   \n   Format: Excel, CSV, PDF\n   Includes: ${applications.length} applications\n   Filters: By status, date, category, assignee\n\n2. ONBOARDING METRICS:\n   - Total applications (${onboardingMetrics.totalApplications})\n   - In progress (${onboardingMetrics.inProgress})\n   - Completed (${onboardingMetrics.completed})\n   - Rejected (${onboardingMetrics.rejected})\n   - Success rate (${onboardingMetrics.successRate}%)\n   - Average time (${onboardingMetrics.avgTime} days)\n   \n   Format: Excel dashboard, PDF report\n   Charts: Trend analysis, funnel, category breakdown\n\n3. DOCUMENT CHECKLIST:\n   - Required documents by supplier\n   - Verification status\n   - Expiry dates and renewals\n   - Missing documents report\n   \n   Format: Excel checklist, PDF summary\n   Grouped by: Supplier, Document type\n\n4. ONBOARDING TIMELINE:\n   - Step-by-step progress report\n   - Time spent at each stage\n   - Bottleneck analysis\n   - SLA compliance tracking\n   \n   Format: Gantt chart (PDF), Excel timeline\n\n5. AUDIT TRAIL:\n   - Complete history of all actions\n   - User activity log\n   - Document changes\n   - Approval workflow\n   \n   Format: PDF audit report, CSV log\n   Date range: Last 90 days (configurable)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSCHEDULED EXPORTS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSetup automated exports:\n□ Daily - New applications report\n□ Weekly - Progress summary (Fridays)\n□ Monthly - Comprehensive metrics\n□ Quarterly - Executive dashboard\n\nDelivery:\n✉ Email to procurement team\n📁 Save to shared drive\n☁️ Upload to cloud storage\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCUSTOM EXPORT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSelect fields to include:\n☑ Application details\n☑ Contact information\n☑ Progress and status\n☑ Risk assessment\n☑ Document status\n☑ Timeline metrics\n□ Comments/notes\n□ Approval history\n\nDate Range: Last 30 days\nFormat: Excel (.xlsx)\nDelivery: Download immediately\n\nProceed with export?`);
  };

  const handleRefresh = () => {
    console.log('Refreshing onboarding data...');
    alert('Refreshing Supplier Onboarding Data...\n\nUpdating:\n- Application statuses and progress\n- Document verification updates\n- Risk assessment scores\n- Onboarding metrics and KPIs\n- Team assignments\n- Pending actions and notifications\n\nSyncing with:\n- Supplier portal submissions\n- Verification services\n- Risk assessment tools\n- ERP system\n- Email/notification queue\n\nEstimated time: 5-10 seconds\n\nData refresh completed ✓');
  };

  const handleSettings = () => {
    console.log('Opening onboarding settings...');
    alert('Supplier Onboarding Settings\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n1. ONBOARDING WORKFLOW\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nConfigure onboarding steps:\n- Add/remove/reorder steps\n- Set step requirements (mandatory/optional)\n- Define step timelines and SLAs\n- Configure approval routing\n- Setup automated transitions\n\nWorkflow templates:\n□ Standard supplier onboarding (7 steps)\n□ Strategic supplier (extended due diligence)\n□ Low-risk supplier (expedited - 4 steps)\n□ Services supplier (specialized checks)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n2. DOCUMENT REQUIREMENTS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nRequired documents setup:\n- Define mandatory documents by category\n- Set expiry tracking and alerts\n- Configure document types and formats\n- Acceptance criteria and validation rules\n- Auto-verification settings\n\nDocument templates:\n- Upload standard forms\n- NDA templates\n- Supplier agreements\n- Information request forms\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n3. RISK ASSESSMENT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nRisk scoring configuration:\n- Financial risk weight: 30%\n- Compliance risk weight: 25%\n- Operational risk weight: 20%\n- Reputation risk weight: 15%\n- Geographic risk weight: 10%\n\nRisk thresholds:\n- Low: 0-30 (auto-approve eligible)\n- Medium: 31-60 (standard review)\n- High: 61-100 (enhanced due diligence)\n\nIntegrations:\n□ D&B credit check\n□ Sanctions screening\n□ Financial data providers\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n4. APPROVAL ROUTING\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nApproval workflow:\n- Define approval levels and thresholds\n- Category-based routing rules\n- Risk-based approval requirements\n- Escalation procedures\n- Timeout and reminder settings\n\nApproval matrix:\n- Procurement Manager: All suppliers\n- CPO: Strategic suppliers, high-risk\n- Finance: Credit limit > $100K\n- Legal: New supplier agreements\n- Compliance: High-risk categories\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n5. NOTIFICATIONS & ALERTS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nNotification settings:\n□ New application submitted\n□ Document uploaded by supplier\n□ Verification completed\n□ Approval required\n□ Application rejected\n□ Onboarding completed\n□ Document expiring (30-day alert)\n□ SLA breach warning\n\nDelivery channels:\n☑ Email\n☑ In-app notifications\n□ SMS (for urgent)\n□ Slack integration\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n6. SLAs & TARGETS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nPerformance targets:\n- Target onboarding time: < 10 days\n- Initial response time: < 24 hours\n- Document review time: < 48 hours\n- Approval turnaround: < 3 days\n- Success rate target: > 85%\n\nSLA escalation:\n- Yellow alert: 80% of SLA\n- Red alert: SLA breached\n- Auto-escalate to manager\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n7. INTEGRATION SETTINGS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSystem integrations:\n☑ ERP - Supplier master data sync\n☑ Supplier Portal - Application submission\n□ E-signature - Contract execution\n□ Background check services\n□ Credit rating agencies\n□ Compliance screening\n\nAPI Configuration:\n- Endpoint URLs\n- Authentication keys\n- Sync frequency\n- Error handling\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n8. USER PERMISSIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nRole-based access:\n- Procurement Officer: View, edit, request docs\n- Procurement Manager: All + approve/reject\n- Category Manager: View assigned categories\n- Finance: View, approve credit limits\n- Admin: Full system configuration\n\nSupplier portal access:\n- Self-registration settings\n- Document upload limits\n- Status visibility\n\nSave configuration changes?');
  };

  const handleBulkActions = () => {
    console.log('Opening bulk actions...');
    alert('Bulk Actions - Supplier Applications\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nBULK OPERATIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. BULK ASSIGNMENT:\n   - Select multiple applications\n   - Assign to team member\n   - Useful for workload distribution\n   - Automated notification to assignee\n\n2. BULK DOCUMENT REQUEST:\n   - Select applications missing documents\n   - Send standardized request email\n   - Set common deadline\n   - Track response rate\n\n3. BULK STATUS UPDATE:\n   - Move applications to next stage\n   - Update progress markers\n   - Trigger workflow actions\n   - Notification to stakeholders\n\n4. BULK APPROVAL/REJECTION:\n   - Review multiple ready applications\n   - Apply same decision criteria\n   - Add bulk comments\n   - Generate batch notifications\n\n5. BULK EXPORT:\n   - Select specific applications\n   - Export to Excel/PDF\n   - Custom field selection\n   - Batch download documents\n\n6. BULK REMINDERS:\n   - Send follow-up reminders\n   - Escalation notifications\n   - Deadline warnings\n   - Custom message templates\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nFILTERING\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSelect applications by:\n□ Status (e.g., all in "Documentation")\n□ Assignee\n□ Date range\n□ Priority level\n□ Risk score\n□ Category\n□ Progress threshold\n□ Document status\n\nCurrent selection: 0 applications\n\nApply filters to begin bulk operation.');
  };

  return (
    <div className="p-6 space-y-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-blue-600" />
              Supplier Onboarding Portal
            </h1>
            <p className="text-gray-600 mt-2">Streamlined supplier registration and verification process</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleSettings}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleBulkActions}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              title="Bulk Actions"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Bulk Actions</span>
            </button>
            <button
              onClick={handleExportApplications}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              title="Export Applications"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowNewApplication(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Application
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-600 text-sm font-medium">Total Applications</span>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{onboardingMetrics.totalApplications}</div>
            <div className="text-sm text-gray-600">This quarter</div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-600 text-sm font-medium">In Progress</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{onboardingMetrics.inProgress}</div>
            <div className="text-sm text-orange-600">5 urgent</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-600 text-sm font-medium">Completed</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{onboardingMetrics.completed}</div>
            <div className="text-sm text-gray-600">This month</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-600 text-sm font-medium">Rejected</span>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{onboardingMetrics.rejected}</div>
            <div className="text-sm text-gray-600">11% rate</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-600 text-sm font-medium">Avg Time</span>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{onboardingMetrics.avgTime}d</div>
            <div className="text-sm text-green-600">↓ 2 days</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-indigo-600 text-sm font-medium">Success Rate</span>
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{onboardingMetrics.successRate}%</div>
            <div className="text-sm text-green-600">↑ 5%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-t-xl">
          {['overview', 'applications', 'process', 'documents', 'verification', 'analytics'].map((tab) => (
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
              {/* Onboarding Funnel */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Onboarding Funnel</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <FunnelChart>
                    <Tooltip />
                    <Funnel
                      dataKey="value"
                      data={onboardingFunnel}
                      isAnimationActive
                    >
                      <LabelList position="center" fill="#fff" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>

              {/* Trend Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={onboardingTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                      <Legend />
                      <Area type="monotone" dataKey="applications" stackId="1" stroke="#3B82F6" fill="#DBEAFE" name="Applications" />
                      <Area type="monotone" dataKey="approved" stackId="2" stroke="#10B981" fill="#D1FAE5" name="Approved" />
                      <Area type="monotone" dataKey="rejected" stackId="3" stroke="#EF4444" fill="#FEE2E2" name="Rejected" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RePieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }) => `${category}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                </div>
                <div className="p-4 space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">{app.companyName}</div>
                          <div className="text-sm text-gray-600">{app.category} • {app.contactName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Progress</div>
                          <div className="font-medium">{app.progress}%</div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-2">
              {/* Filters */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Status</option>
                  <option>New</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Rejected</option>
                </select>
                <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  More Filters
                </button>
              </div>

              {/* Applications Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Application ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Company</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Progress</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Priority</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-blue-600">{app.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{app.companyName}</div>
                            <div className="text-sm text-gray-500">Applied: {app.submittedDate}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm text-gray-900">{app.contactName}</div>
                            <div className="text-sm text-gray-500">{app.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{app.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${app.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{app.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            app.priority === 'high' ? 'bg-red-100 text-red-700' :
                            app.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {app.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewApplication(app)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                              title="View Application Details"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700">View</span>
                            </button>

                            {app.status === 'documentation' && (
                              <button
                                onClick={() => handleRequestDocuments(app)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-amber-300 bg-amber-50 rounded-lg hover:bg-amber-100 text-sm transition-colors"
                                title="Request Documents"
                              >
                                <Upload className="w-4 h-4 text-amber-600" />
                                <span className="text-amber-700">Request Docs</span>
                              </button>
                            )}

                            {app.status === 'approval' && (
                              <>
                                <button
                                  onClick={() => handleApproveSupplier(app)}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 bg-green-50 rounded-lg hover:bg-green-100 text-sm transition-colors"
                                  title="Approve Supplier"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-green-700">Approve</span>
                                </button>
                                <button
                                  onClick={() => handleRejectApplication(app)}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 bg-red-50 rounded-lg hover:bg-red-100 text-sm transition-colors"
                                  title="Reject Application"
                                >
                                  <XCircle className="w-4 h-4 text-red-600" />
                                  <span className="text-red-700">Reject</span>
                                </button>
                              </>
                            )}

                            {app.status !== 'approval' && app.status !== 'completed' && app.status !== 'rejected' && (
                              <button
                                onClick={() => handleRejectApplication(app)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 bg-red-50 rounded-lg hover:bg-red-100 text-sm transition-colors"
                                title="Reject Application"
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span className="text-red-700">Reject</span>
                              </button>
                            )}

                            {(app.status === 'completed' || (app.status === 'approval' && app.progress >= 95)) && (
                              <button
                                onClick={() => handleCompleteOnboarding(app)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm transition-colors"
                                title="Complete Onboarding"
                              >
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-700">Complete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'process' && (
            <div className="space-y-3">
              {/* Onboarding Process Steps */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Onboarding Process</h3>
                <div className="relative">
                  {onboardingSteps.map((step, index) => (
                    <div key={step.id} className="relative flex items-start mb-8 last:mb-0">
                      {index !== onboardingSteps.length - 1 && (
                        <div className="absolute top-10 left-6 bottom-0 w-0.5 bg-gray-300"></div>
                      )}
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-500 text-white' :
                        step.status === 'current' ? 'bg-blue-500 text-white animate-pulse' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : step.status === 'current' ? (
                          <Clock className="w-6 h-6" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {step.title}
                              {step.required && <span className="ml-2 text-red-500">*</span>}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            {step.documents && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {step.documents.map((doc) => (
                                  <span key={doc} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                                    <FileText className="w-3 h-3" />
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {step.completedDate && (
                            <span className="text-sm text-gray-500">Completed: {step.completedDate}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Configuration */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Process Configuration</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Auto-approval Threshold</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Low Risk (Score {'>='} 80)</option>
                      <option>Medium Risk (Score {'>='} 60)</option>
                      <option>High Risk (Manual Only)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Expiry Alert (days)</label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                      <span className="text-sm text-gray-700">Send automated status updates to applicants</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                      <span className="text-sm text-gray-700">Require manager approval for high-risk suppliers</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Enable fast-track for preferred categories</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              {/* Document Requirements */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Documents</h3>
                <div className="space-y-3">
                  {requiredDocuments.map((doc) => (
                    <div key={doc.id} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            doc.status === 'verified' ? 'bg-green-100 text-green-600' :
                            doc.status === 'uploaded' ? 'bg-blue-100 text-blue-600' :
                            doc.status === 'rejected' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {doc.name}
                              {doc.required && <span className="ml-1 text-red-500">*</span>}
                            </div>
                            <div className="text-sm text-gray-600">
                              Type: {doc.type}
                              {doc.uploadedDate && ` • Uploaded: ${doc.uploadedDate}`}
                              {doc.expiryDate && ` • Expires: ${doc.expiryDate}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                            doc.status === 'uploaded' ? 'bg-blue-100 text-blue-700' :
                            doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {doc.status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {doc.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                            {doc.status}
                          </span>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            {doc.status === 'pending' ? (
                              <Upload className="w-4 h-4 text-gray-600" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Upload Area */}
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
                <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Select Files
                </button>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-3">
              {/* Verification Checklist */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Checklist</h3>
                <div className="space-y-3">
                  {[
                    { item: 'Business Registration Verified', status: 'completed', verifiedBy: 'John Smith', date: '2024-02-12' },
                    { item: 'Financial Stability Check', status: 'completed', verifiedBy: 'Sarah Johnson', date: '2024-02-13' },
                    { item: 'Reference Check (3 references)', status: 'in_progress', assignedTo: 'Mike Johnson' },
                    { item: 'Site Visit / Virtual Inspection', status: 'pending' },
                    { item: 'Compliance & Certification Review', status: 'completed', verifiedBy: 'Lisa Wong', date: '2024-02-14' },
                    { item: 'Risk Assessment Complete', status: 'pending' },
                    { item: 'Management Approval', status: 'pending' }
                  ].map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          check.status === 'completed' ? 'bg-green-500 text-white' :
                          check.status === 'in_progress' ? 'bg-blue-500 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {check.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : check.status === 'in_progress' ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{check.item}</div>
                          {check.verifiedBy && (
                            <div className="text-sm text-gray-600">Verified by: {check.verifiedBy} • {check.date}</div>
                          )}
                          {check.assignedTo && (
                            <div className="text-sm text-gray-600">Assigned to: {check.assignedTo}</div>
                          )}
                        </div>
                      </div>
                      {check.status !== 'completed' && (
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition">
                          {check.status === 'in_progress' ? 'Complete' : 'Start'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">72</div>
                    <div className="text-sm text-gray-600 mt-1">Overall Score</div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }} />
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">Medium</div>
                    <div className="text-sm text-gray-600 mt-1">Risk Level</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">B+</div>
                    <div className="text-sm text-gray-600 mt-1">Credit Rating</div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Financial Stability</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Operational Capability</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }} />
                      </div>
                      <span className="text-sm font-medium">70%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Compliance History</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }} />
                      </div>
                      <span className="text-sm font-medium">90%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-3">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Time by Stage</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { stage: 'Application', days: 0.5 },
                      { stage: 'Screening', days: 1.5 },
                      { stage: 'Documentation', days: 2.5 },
                      { stage: 'Verification', days: 3 },
                      { stage: 'Approval', days: 1 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="stage" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                      <Bar dataKey="days" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Success Rate by Category</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="100%" data={[
                      { name: 'IT Services', value: 92, fill: '#3B82F6' },
                      { name: 'Raw Materials', value: 85, fill: '#10B981' },
                      { name: 'Logistics', value: 78, fill: '#F59E0B' },
                      { name: 'Components', value: 88, fill: '#8B5CF6' }
                    ]}>
                      <RadialBar background dataKey="value" />
                      <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Key Insights */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Onboarding Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { metric: 'Average processing time reduced by 25%', impact: 'positive' },
                    { metric: '15% increase in first-time approval rate', impact: 'positive' },
                    { metric: 'Documentation bottleneck at verification stage', impact: 'negative' },
                    { metric: '92% supplier satisfaction with onboarding process', impact: 'positive' }
                  ].map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      {insight.impact === 'positive' ? (
                        <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      )}
                      <span className="text-sm text-gray-700">{insight.metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}