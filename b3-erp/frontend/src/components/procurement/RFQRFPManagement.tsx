'use client'

import React, { useState, useEffect } from 'react'
import { procurementRFQService } from '@/services/procurement-rfq.service'
import {
  FileText,
  Send,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Package,
  Building2,
  TrendingUp,
  BarChart3,
  Star,
  Award,
  Filter,
  Search,
  Plus,
  Download,
  Upload,
  Eye,
  Edit,
  Copy,
  MessageSquare,
  Paperclip,
  ChevronRight,
  ArrowUpRight,
  Target,
  Zap,
  Shield,
  Timer,
  Tag,
  GitCompare,
  ThumbsUp,
  XCircle,
  RefreshCw,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Settings,
  MoreVertical
} from 'lucide-react'
import {
  LineChart,
  Line,
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
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts'

// Import RFQ Modals
import {
  CreateRFQModal,
  ViewRFQDetailsModal,
  SendRFQToSuppliersModal,
  CompareBidsModal,
  AwardBidModal,
  ExportRFQModal,
  RFQData,
  BidResponse as ModalBidResponse
} from '@/components/procurement/RFQModals'

interface RFQ {
  id: string
  title: string
  type: 'RFQ' | 'RFP' | 'RFI'
  status: 'draft' | 'published' | 'bidding' | 'evaluation' | 'awarded' | 'cancelled'
  category: string
  estimatedValue: number
  responseDeadline: string
  publishDate: string
  bidders: number
  responsesReceived: number
  owner: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  items: number
}

interface BidResponse {
  id: string
  rfqId: string
  supplier: string
  submittedDate: string
  totalAmount: number
  leadTime: string
  score: number
  status: 'submitted' | 'under_review' | 'shortlisted' | 'rejected' | 'awarded'
  compliance: number
  technicalScore: number
  commercialScore: number
}

export default function RFQRFPManagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [showComparison, setShowComparison] = useState(false)

  // Modal state management
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isSendToSuppliersModalOpen, setIsSendToSuppliersModalOpen] = useState(false)
  const [isCompareBidsModalOpen, setIsCompareBidsModalOpen] = useState(false)
  const [isAwardBidModalOpen, setIsAwardBidModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [selectedBid, setSelectedBid] = useState<BidResponse | null>(null)

  // Handler functions
  const handleCreateRFQ = () => {
    setIsCreateModalOpen(true)
  }

  const handleRefresh = () => {
    loadRfqs();
  };

  const handleSettings = () => {
    console.log('Opening RFQ settings...');
    alert('RFQ/RFP Settings\n\nDOCUMENT CONFIGURATION:\n- Default response period (14-30 days)\n- Minimum bidder requirements\n- Auto-publish rules\n- Notification preferences\n\nEVALUATION SETTINGS:\n- Default evaluation criteria\n- Scoring methodology\n- Minimum qualification scores\n- Consensus vs weighted scoring\n- Blind evaluation options\n\nWORKFLOW CONFIGURATION:\n- Approval routing rules\n- Value thresholds for approvals\n- Escalation procedures\n- Required reviewers\n\nSUPPLIER PORTAL:\n- Response submission format\n- Q&A process\n- Clarification deadlines\n- Amendment notifications\n- File upload limits\n\nTEMPLATE MANAGEMENT:\n- Template library\n- Custom templates\n- Standard clauses library\n- Evaluation matrices\n\nNOTIFICATION RULES:\n- Supplier invitations\n- Response confirmations\n- Deadline reminders\n- Amendment alerts\n- Award notifications\n\nCOMPLIANCE SETTINGS:\n- Conflict of interest checks\n- Fair competition rules\n- Audit trail requirements\n- Document retention (7 years)\n- Confidentiality rules\n\nINTEGRATIONS:\n- ERP system sync\n- Email integration\n- Document management\n- Supplier database\n- Contract management');
  };

  const handleExport = () => {
    setIsExportModalOpen(true)
  }

  const handleViewRFQ = (rfq: RFQ) => {
    setSelectedRFQ(rfq)
    setIsViewModalOpen(true)
  }

  const handleEditRFQ = (rfq: RFQ) => {
    console.log('Editing RFQ:', rfq.id);

    if (rfq.status === 'awarded') {
      alert(`Cannot Edit Awarded RFQ\n\nRFQ ${rfq.id} has been awarded and cannot be edited.\n\nTo make changes:\n- Create a new RFQ\n- Reference the original\n- Document the reason for re-sourcing\n\nCompleted RFQs are locked for audit compliance.`);
      return;
    }

    if (rfq.status === 'cancelled') {
      alert(`Cannot Edit Cancelled RFQ\n\nRFQ ${rfq.id} has been cancelled.\n\nOptions:\n- Create a new RFQ\n- Clone this RFQ to start fresh\n- Reference cancelled RFQ number`);
      return;
    }

    alert(`Edit RFQ/RFP: ${rfq.id}\n\nEDITABLE FIELDS:\n\n${rfq.status === 'draft' ? '✓ ALL FIELDS EDITABLE\nRFQ is in draft - make any changes needed' : '⚠️ LIMITED EDITING - RFQ IS ACTIVE'}\n\nBASIC INFORMATION:\n- Title and description ${rfq.status === 'draft' ? '✓' : '✗'}\n- Category ${rfq.status === 'draft' ? '✓' : '✗'}\n- Estimated value ${rfq.status === 'draft' ? '✓' : '✗'}\n- Priority level ✓\n\nREQUIREMENTS:\n- Item specifications ${rfq.status === 'draft' ? '✓' : 'Amendment only'}\n- Quantities ${rfq.status === 'draft' ? '✓' : 'Amendment only'}\n- Quality standards ${rfq.status === 'draft' ? '✓' : 'Amendment only'}\n- Technical specs ${rfq.status === 'draft' ? '✓' : 'Amendment only'}\n\nTIMELINE:\n- Publish date ${rfq.status === 'draft' ? '✓' : '✗'}\n- Response deadline ✓ (can extend with notification)\n- Evaluation dates ✓\n\nSUPPLIERS:\n- Add suppliers ✓\n- Remove suppliers ${rfq.status === 'draft' ? '✓' : '✗'}\n- Supplier qualifications ${rfq.status === 'draft' ? '✓' : '✗'}\n\nEVALUATION:\n- Criteria ${rfq.status === 'draft' ? '✓' : '✗'}\n- Weights ${rfq.status === 'draft' ? '✓' : '✗'}\n- Scoring method ${rfq.status === 'draft' ? '✓' : '✗'}\n\nDOCUMENTS:\n- Add new documents ✓\n- Replace documents ${rfq.status === 'draft' ? '✓' : 'Amendment only'}\n- Remove documents ${rfq.status === 'draft' ? '✓' : '✗'}\n\n${rfq.status !== 'draft' ? '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nAMENDMENT PROCESS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nFor active RFQs, changes require:\n\n1. AMENDMENT NOTIFICATION:\n   - All invited suppliers must be notified\n   - Email and portal notification\n   - Amendment number assigned\n\n2. DEADLINE EXTENSION:\n   - Significant changes require deadline extension\n   - Minimum 5 days extension recommended\n   - Suppliers can revise responses\n\n3. APPROVAL:\n   - Category manager approval required\n   - Procurement director (if material change)\n   - Document reason for amendment\n\n4. AUDIT TRAIL:\n   - All changes logged\n   - Original version retained\n   - Amendment history visible\n\nIMPACT ON RESPONSES:\n- Existing responses may need revision\n- Suppliers notified of changes\n- Extended deadline for updates' : ''}\n\nProceed with editing RFQ ${rfq.id}?`);
  };

  const handleViewBidResponse = (bid: BidResponse) => {
    console.log('Viewing bid response:', bid.id);

    const rfq = rfqList.find(r => r.id === bid.rfqId);

    alert(`Bid Response Details\n\n${bid.status === 'awarded' ? '🏆' : bid.status === 'shortlisted' ? '⭐' : bid.status === 'under_review' ? '🔍' : bid.status === 'rejected' ? '❌' : '📋'} STATUS: ${bid.status.toUpperCase().replace('_', ' ')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nBID INFORMATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSupplier: ${bid.supplier}\nRFQ: ${bid.rfqId}${rfq ? ' - ' + rfq.title : ''}\nSubmitted: ${bid.submittedDate}\nBid ID: ${bid.id}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCOMMERCIAL PROPOSAL\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nTotal Bid Amount: $${(bid.totalAmount / 1000).toFixed(0)}K\nCommercial Score: ${bid.commercialScore}/100\nLead Time: ${bid.leadTime}\n\n${rfq ? `vs Estimate: ${bid.totalAmount < rfq.estimatedValue ? '✓ ' + (((rfq.estimatedValue - bid.totalAmount) / rfq.estimatedValue) * 100).toFixed(1) + '% below budget' : '⚠️ ' + (((bid.totalAmount - rfq.estimatedValue) / rfq.estimatedValue) * 100).toFixed(1) + '% over budget'}` : ''}\n\nPricing Breakdown:\n- Base price: Competitive\n- Payment terms: Standard\n- Warranty: Included\n- Maintenance: Optional\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTECHNICAL PROPOSAL\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nTechnical Score: ${bid.technicalScore}/100\nCompliance: ${bid.compliance}%\n\n${bid.technicalScore >= 90 ? '✓ EXCELLENT TECHNICAL SUBMISSION\n- Exceeds requirements\n- Strong capability demonstrated\n- Innovation proposed' : bid.technicalScore >= 80 ? '✓ GOOD TECHNICAL SUBMISSION\n- Meets all requirements\n- Solid capability\n- Standard approach' : bid.technicalScore >= 70 ? '⚠️ ACCEPTABLE TECHNICAL SUBMISSION\n- Meets minimum requirements\n- Some gaps identified\n- Clarifications needed' : '❌ WEAK TECHNICAL SUBMISSION\n- Below requirements\n- Significant gaps\n- Not recommended'}\n\nTechnical Highlights:\n- Methodology: ${bid.technicalScore >= 85 ? 'Excellent' : 'Adequate'}\n- Team qualifications: ${bid.technicalScore >= 85 ? 'Strong' : 'Acceptable'}\n- Implementation plan: ${bid.technicalScore >= 85 ? 'Detailed' : 'Basic'}\n- Risk management: ${bid.technicalScore >= 85 ? 'Comprehensive' : 'Standard'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nOVERALL EVALUATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nOverall Score: ${bid.score}/100\n\nScore Breakdown:\n- Technical (60%): ${bid.technicalScore} → ${(bid.technicalScore * 0.6).toFixed(1)} points\n- Commercial (40%): ${bid.commercialScore} → ${(bid.commercialScore * 0.4).toFixed(1)} points\n\nRanking: ${bid.status === 'awarded' ? '#1 - WINNER' : bid.status === 'shortlisted' ? 'Top 3 - Shortlisted' : bid.status === 'under_review' ? 'Under Review' : bid.status === 'rejected' ? 'Not Qualified' : 'Submitted'}\n\n${bid.score >= 85 ? '🌟 HIGHLY RECOMMENDED\n→ Strong technical and commercial proposal\n→ Recommend for shortlist/award\n→ Conduct reference checks\n→ Schedule clarification meeting' : bid.score >= 75 ? '✓ RECOMMENDED\n→ Good proposal, meets requirements\n→ Consider for shortlist\n→ Request clarifications if needed' : bid.score >= 65 ? '⚠️ MARGINAL\n→ Meets minimum threshold\n→ Significant weaknesses\n→ Consider only if limited options' : '❌ NOT RECOMMENDED\n→ Below requirements\n→ Do not shortlist\n→ Send standard regret letter'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNEXT ACTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${bid.status === 'submitted' ? '1. Complete initial screening\n2. Verify compliance\n3. Score technical proposal\n4. Score commercial proposal\n5. Make shortlist decision' : bid.status === 'under_review' ? '1. Complete detailed evaluation\n2. Check references\n3. Request clarifications\n4. Make shortlist decision\n5. Schedule presentations (if needed)' : bid.status === 'shortlisted' ? '1. Schedule clarification meeting\n2. Conduct presentations\n3. Perform site visits (if needed)\n4. Request best and final offer\n5. Make award recommendation' : bid.status === 'awarded' ? '1. Issue purchase order\n2. Execute contract\n3. Supplier onboarding\n4. Notify unsuccessful bidders' : '1. Send regret letter\n2. Offer debriefing\n3. Update supplier records'}\n\nATTACHMENTS:\n- Technical proposal (PDF)\n- Price sheet (Excel)\n- Company profile\n- References\n- Certifications\n- Compliance matrix`);
  };

  const handleCompareBids = () => {
    setIsCompareBidsModalOpen(true)
  }

  const handleApproveReject = (bid: BidResponse, action: 'approve' | 'reject') => {
    console.log(`${action} bid:`, bid.id);

    if (action === 'approve') {
      alert(`Shortlist Bid Response\n\nSUPPLIER: ${bid.supplier}\nBID: ${bid.id}\nSCORE: ${bid.score}/100\n\nSHORTLIST CONFIRMATION:\n\nThis will:\n✓ Move bid to shortlisted status\n✓ Include in final evaluation\n✓ Schedule for presentations\n✓ Request clarifications\n✓ Notify evaluation team\n\nTYPICAL SHORTLIST SIZE: 2-3 suppliers\n\nNEXT STEPS:\n1. Clarification meeting scheduled\n2. Reference checks initiated\n3. Site visit (if applicable)\n4. Request best and final offer\n5. Presentation to evaluation committee\n\nSHORTLIST CRITERIA MET:\n✓ Score above threshold (${bid.score >= 75 ? 'Yes' : 'No'})\n✓ Compliance verified (${bid.compliance >= 85 ? 'Yes' : 'No'})\n✓ References checked (Pending)\n✓ Technical capability (${bid.technicalScore >= 75 ? 'Confirmed' : 'Questionable'})\n✓ Commercial viability (${bid.commercialScore >= 75 ? 'Confirmed' : 'Questionable'})\n\nConfirm shortlist for ${bid.supplier}?`);
    } else {
      alert(`Reject Bid Response\n\nSUPPLIER: ${bid.supplier}\nBID: ${bid.id}\nSCORE: ${bid.score}/100\n\nREJECTION CONFIRMATION:\n\n⚠️ This will:\n✗ Mark bid as rejected\n✗ Exclude from further evaluation\n✗ Send regret letter to supplier\n✗ Cannot be easily undone\n\nREJECTION REASON REQUIRED:\n□ Did not meet technical requirements\n□ Price not competitive\n□ Compliance issues\n□ Failed reference checks\n□ Delivery time unacceptable\n□ Other (specify)\n\nSUPPLIER COMMUNICATION:\n- Regret letter sent automatically\n- Debriefing offered (optional)\n- Feedback provided (if requested)\n- Maintain professional relationship\n\nBID REJECTION CRITERIA:\n${bid.score < 65 ? '✓ Score below minimum threshold' : ''}\n${bid.compliance < 80 ? '✓ Compliance issues identified' : ''}\n${bid.technicalScore < 70 ? '✓ Technical requirements not met' : ''}\n\nDOCUMENTATION:\n- Rejection reason recorded\n- Evaluation notes saved\n- Audit trail maintained\n\n⚠️ IMPORTANT:\nRejection decisions should be:\n- Fair and objective\n- Well documented\n- Based on evaluation criteria\n- Defendable if challenged\n\nProceed with rejection?`);
    }
  };

  const handleUseTemplate = (templateName: string) => {
    console.log('Using template:', templateName);
    alert(`Use RFQ/RFP Template\n\nTEMPLATE: ${templateName}\n\nTEMPLATE INCLUDES:\n\n📋 DOCUMENT STRUCTURE:\n- Pre-formatted sections\n- Standard clauses\n- Evaluation criteria\n- Response templates\n\n📄 STANDARD CONTENT:\n- Company background\n- Procurement process\n- Submission requirements\n- Terms and conditions\n- Confidentiality agreements\n\n✅ EVALUATION MATRIX:\n- Predefined criteria\n- Standard weights\n- Scoring guidelines\n- Decision matrix\n\n📎 ATTACHMENTS:\n- Response template\n- Compliance checklist\n- Technical specification format\n- Price sheet template\n\nCUSTOMIZATION OPTIONS:\n\n1. Use As-Is:\n   - Quick deployment\n   - Proven format\n   - Minimal changes needed\n\n2. Customize:\n   - Modify sections\n   - Add/remove requirements\n   - Adjust criteria weights\n   - Update specifications\n\n3. Save New Template:\n   - Create custom template\n   - Reuse for similar RFQs\n   - Share with team\n\nTEMPLATE BENEFITS:\n✓ Faster RFQ creation\n✓ Consistent format\n✓ Reduced errors\n✓ Best practices built-in\n✓ Compliance assured\n\nNext: Enter RFQ-specific details\n- Title and description\n- Specifications\n- Timeline\n- Invited suppliers\n\nLoad template ${templateName}?`);
  };

  const handleCreateTemplate = () => {
    console.log('Creating new template...');
    alert('Create New RFQ/RFP Template\n\nTEMPLATE WIZARD:\n\n1. TEMPLATE INFORMATION:\n   - Template name\n   - Category/industry\n   - Description\n   - Template type (RFQ/RFP/RFI)\n\n2. DOCUMENT STRUCTURE:\n   - Section organization\n   - Standard clauses\n   - Appendices\n   - Formatting\n\n3. REQUIREMENTS SECTIONS:\n   - Technical specifications\n   - Delivery requirements\n   - Quality standards\n   - Compliance needs\n\n4. EVALUATION CRITERIA:\n   - Criteria definition\n   - Default weights\n   - Scoring method\n   - Minimum thresholds\n\n5. RESPONSE FORMAT:\n   - Supplier response template\n   - Price sheet format\n   - Document requirements\n   - Submission process\n\n6. TERMS & CONDITIONS:\n   - Standard T&Cs\n   - Payment terms\n   - Delivery terms\n   - Warranties\n   - Confidentiality\n\n7. ATTACHMENTS:\n   - Standard forms\n   - Compliance checklists\n   - Sample agreements\n\nTEMPLATE FEATURES:\n\n□ Placeholders for custom content\n□ Variable sections (optional)\n□ Standard boilerplate\n□ Approval workflows\n□ Document version control\n\nTEMPLATE SHARING:\n- Save to personal library\n- Share with team\n- Set as department default\n- Publish to template library\n\nBEST PRACTICES:\n✓ Use clear, unambiguous language\n✓ Include all necessary information\n✓ Define evaluation criteria clearly\n✓ Specify submission requirements\n✓ Set realistic timelines\n✓ Include contact information\n\nCREATION OPTIONS:\n1. Start from scratch\n2. Clone existing template\n3. Import from document\n4. Use wizard\n\nProceed with template creation?');
  };

  const [rfqList, setRfqList] = useState<RFQ[]>([])

  const loadRfqs = async () => {
    const statusMap: Record<string, RFQ['status']> = {
      DRAFT: 'draft', PUBLISHED: 'published', SENT: 'published', BIDDING: 'bidding',
      'RESPONSES RECEIVED': 'bidding', 'UNDER EVALUATION': 'evaluation',
      EVALUATION: 'evaluation', AWARDED: 'awarded', CANCELLED: 'cancelled', EXPIRED: 'cancelled',
    }
    const priorityMap: Record<string, RFQ['priority']> = {
      LOW: 'low', MEDIUM: 'medium', HIGH: 'high', URGENT: 'urgent',
    }
    try {
      const res = await procurementRFQService.getAllRFQs()
      const list = Array.isArray((res as any)?.data) ? (res as any).data : (Array.isArray(res) ? res : [])
      setRfqList(list.map((r: any, idx: number): RFQ => ({
        id: r.id ?? r.rfqNumber ?? `RFQ-${idx + 1}`,
        title: r.title ?? '—',
        type: (String(r.type ?? 'RFQ').toUpperCase() as RFQ['type']),
        status: statusMap[String(r.status ?? '').toUpperCase()] ?? 'draft',
        category: r.category ?? r.department ?? '—',
        estimatedValue: Number(r.estimatedBudget ?? r.estimatedValue ?? r.totalValue ?? 0),
        responseDeadline: (r.responseDeadline ?? r.dueDate ?? '').toString().slice(0, 10),
        publishDate: (r.createdDate ?? r.sentDate ?? r.publishDate ?? r.createdAt ?? '').toString().slice(0, 10),
        bidders: Number(r.vendorCount ?? (Array.isArray(r.invitedVendors) ? r.invitedVendors.length : (Array.isArray(r.vendors) ? r.vendors.length : 0))),
        responsesReceived: Number(r.responsesReceived ?? (Array.isArray(r.quotes) ? r.quotes.length : 0) ?? r.quotationCount ?? 0),
        owner: r.requestedByName ?? r.owner ?? r.createdBy ?? '—',
        priority: priorityMap[String(r.priority ?? '').toUpperCase()] ?? 'medium',
        items: Array.isArray(r.items) ? r.items.length : Number(r.itemCount ?? 0),
      })))
    } catch {
      // leave list empty on error
    }
  }

  useEffect(() => {
    loadRfqs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bidResponses: BidResponse[] = [
    {
      id: 'BID-001',
      rfqId: 'RFQ-2024-001',
      supplier: 'TechPro Solutions',
      submittedDate: '2024-02-25',
      totalAmount: 485000,
      leadTime: '45 days',
      score: 92,
      status: 'shortlisted',
      compliance: 95,
      technicalScore: 90,
      commercialScore: 88
    },
    {
      id: 'BID-002',
      rfqId: 'RFQ-2024-001',
      supplier: 'Global Tech Services',
      submittedDate: '2024-02-24',
      totalAmount: 478000,
      leadTime: '60 days',
      score: 88,
      status: 'shortlisted',
      compliance: 92,
      technicalScore: 85,
      commercialScore: 90
    },
    {
      id: 'BID-003',
      rfqId: 'RFQ-2024-001',
      supplier: 'Innovation Systems',
      submittedDate: '2024-02-26',
      totalAmount: 510000,
      leadTime: '30 days',
      score: 85,
      status: 'under_review',
      compliance: 88,
      technicalScore: 92,
      commercialScore: 75
    }
  ]

  const rfqMetrics = {
    totalRFQs: 45,
    activeRFQs: 12,
    totalValue: 8500000,
    avgResponseRate: 72,
    avgCycletime: 18,
    savingsAchieved: 1250000
  }

  const rfqTrend = [
    { month: 'Jan', created: 8, awarded: 6, cancelled: 1 },
    { month: 'Feb', created: 10, awarded: 7, cancelled: 2 },
    { month: 'Mar', created: 9, awarded: 8, cancelled: 1 },
    { month: 'Apr', created: 12, awarded: 9, cancelled: 1 },
    { month: 'May', created: 11, awarded: 10, cancelled: 2 },
    { month: 'Jun', created: 14, awarded: 11, cancelled: 1 }
  ]

  const categoryDistribution = [
    { category: 'IT Services', count: 12, value: 2500000 },
    { category: 'Raw Materials', count: 18, value: 3200000 },
    { category: 'Logistics', count: 8, value: 1800000 },
    { category: 'Professional Services', count: 5, value: 800000 },
    { category: 'Office Supplies', count: 2, value: 200000 }
  ]

  const supplierParticipation = [
    { supplier: 'TechPro Solutions', participated: 15, won: 8, winRate: 53 },
    { supplier: 'Global Supplies Inc', participated: 12, won: 5, winRate: 42 },
    { supplier: 'Premier Manufacturing', participated: 10, won: 6, winRate: 60 },
    { supplier: 'Express Logistics', participated: 8, won: 3, winRate: 38 },
    { supplier: 'Innovation Systems', participated: 18, won: 7, winRate: 39 }
  ]

  const evaluationCriteria = [
    { criteria: 'Price', weight: 30 },
    { criteria: 'Quality', weight: 25 },
    { criteria: 'Delivery', weight: 20 },
    { criteria: 'Technical', weight: 15 },
    { criteria: 'Service', weight: 10 }
  ]

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  return (
    <div className="p-6 space-y-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              RFQ/RFP Management
            </h1>
            <p className="text-gray-600 mt-2">Manage requests for quotations and proposals efficiently</p>
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
              title="RFQ Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              title="Export Report"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleCreateRFQ}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              title="Create New RFQ/RFP"
            >
              <Plus className="w-4 h-4" />
              New RFQ/RFP
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-600 text-sm font-medium">Total RFQs</span>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{rfqMetrics.totalRFQs}</div>
            <div className="text-sm text-gray-600">This quarter</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-600 text-sm font-medium">Active RFQs</span>
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{rfqMetrics.activeRFQs}</div>
            <div className="text-sm text-orange-600">3 closing soon</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-600 text-sm font-medium">Total Value</span>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">${(rfqMetrics.totalValue / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-gray-600">Under bidding</div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-600 text-sm font-medium">Response Rate</span>
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{rfqMetrics.avgResponseRate}%</div>
            <div className="text-sm text-green-600">↑ 5% vs last</div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-rose-600 text-sm font-medium">Cycle Time</span>
              <Timer className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{rfqMetrics.avgCycletime}d</div>
            <div className="text-sm text-green-600">↓ 3 days</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-600 text-sm font-medium">Savings</span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">${(rfqMetrics.savingsAchieved / 1000000).toFixed(2)}M</div>
            <div className="text-sm text-gray-600">YTD achieved</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-t-xl">
          {['overview', 'rfqs', 'responses', 'evaluation', 'analytics', 'templates'].map((tab) => (
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
              {/* RFQ Activity Trend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">RFQ Activity Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={rfqTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                      <Legend />
                      <Area type="monotone" dataKey="created" stackId="1" stroke="#3B82F6" fill="#DBEAFE" name="Created" />
                      <Area type="monotone" dataKey="awarded" stackId="2" stroke="#10B981" fill="#D1FAE5" name="Awarded" />
                      <Area type="monotone" dataKey="cancelled" stackId="3" stroke="#EF4444" fill="#FEE2E2" name="Cancelled" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${(Number(value) / 1000000).toFixed(2)}M`} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Active RFQs Dashboard */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Active RFQs Requiring Attention</h3>
                </div>
                <div className="p-4 space-y-3">
                  {rfqList.filter(rfq => rfq.status !== 'awarded' && rfq.status !== 'cancelled').map((rfq) => (
                    <div key={rfq.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-gray-900">{rfq.id}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            rfq.type === 'RFP' ? 'bg-purple-100 text-purple-700' :
                            rfq.type === 'RFQ' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {rfq.type}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            rfq.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            rfq.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            rfq.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {rfq.priority === 'urgent' && <Zap className="w-3 h-3 mr-1" />}
                            {rfq.priority}
                          </span>
                        </div>
                        <div className="font-medium text-gray-900">{rfq.title}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Closes: {rfq.responseDeadline}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {rfq.responsesReceived}/{rfq.bidders} responses
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${(rfq.estimatedValue / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {Math.ceil((new Date(rfq.responseDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                          </div>
                          <div className={`text-xs ${
                            rfq.status === 'evaluation' ? 'text-amber-600' :
                            rfq.status === 'bidding' ? 'text-blue-600' :
                            'text-gray-600'
                          }`}>
                            {rfq.status}
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewRFQ(rfq)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rfqs' && (
            <div className="space-y-2">
              {/* Filters */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search RFQs/RFPs..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="rfq">RFQ</option>
                  <option value="rfp">RFP</option>
                  <option value="rfi">RFI</option>
                </select>
                <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  More Filters
                </button>
              </div>

              {/* RFQ Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">RFQ ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Value</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Deadline</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Responses</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rfqList.map((rfq) => (
                      <tr key={rfq.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-blue-600">{rfq.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{rfq.title}</div>
                            <div className="text-sm text-gray-500">{rfq.items} items</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            rfq.type === 'RFP' ? 'bg-purple-100 text-purple-700' :
                            rfq.type === 'RFQ' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {rfq.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{rfq.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">${(rfq.estimatedValue / 1000).toFixed(0)}K</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm text-gray-900">{rfq.responseDeadline}</div>
                            <div className="text-xs text-gray-500">
                              {Math.ceil((new Date(rfq.responseDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {Array.from({ length: Math.min(3, rfq.responsesReceived) }).map((_, i) => (
                                <div key={i} className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white"></div>
                              ))}
                              {rfq.responsesReceived > 3 && (
                                <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                                  <span className="text-xs">+{rfq.responsesReceived - 3}</span>
                                </div>
                              )}
                            </div>
                            <span className="text-sm text-gray-600">{rfq.responsesReceived}/{rfq.bidders}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            rfq.status === 'published' ? 'bg-blue-100 text-blue-700' :
                            rfq.status === 'bidding' ? 'bg-yellow-100 text-yellow-700' :
                            rfq.status === 'evaluation' ? 'bg-purple-100 text-purple-700' :
                            rfq.status === 'awarded' ? 'bg-green-100 text-green-700' :
                            rfq.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {rfq.status === 'published' && <Send className="w-3 h-3" />}
                            {rfq.status === 'bidding' && <Clock className="w-3 h-3" />}
                            {rfq.status === 'evaluation' && <GitCompare className="w-3 h-3" />}
                            {rfq.status === 'awarded' && <CheckCircle className="w-3 h-3" />}
                            {rfq.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewRFQ(rfq)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700">View</span>
                            </button>
                            <button
                              onClick={() => handleEditRFQ(rfq)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                              title="Edit RFQ"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700">Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="space-y-3">
              {/* Response Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-blue-600 text-sm font-medium mb-1">Total Responses</div>
                  <div className="text-2xl font-bold text-gray-900">48</div>
                  <div className="text-sm text-gray-600">Across all RFQs</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="text-yellow-600 text-sm font-medium mb-1">Under Review</div>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-sm text-gray-600">Pending evaluation</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-green-600 text-sm font-medium mb-1">Shortlisted</div>
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-sm text-gray-600">For final selection</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="text-purple-600 text-sm font-medium mb-1">Avg Score</div>
                  <div className="text-2xl font-bold text-gray-900">82.5</div>
                  <div className="text-sm text-gray-600">Quality rating</div>
                </div>
              </div>

              {/* Bid Responses Table */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Bid Responses</h3>
                  <button
                    onClick={handleCompareBids}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    title="Compare Selected Bids"
                  >
                    <GitCompare className="w-4 h-4" />
                    Compare Selected
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Supplier</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">RFQ</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Lead Time</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Score</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bidResponses.map((bid) => (
                        <tr key={bid.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input type="checkbox" className="rounded border-gray-300" />
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{bid.supplier}</div>
                              <div className="text-sm text-gray-500">Submitted: {bid.submittedDate}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-blue-600">{bid.rfqId}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">${(bid.totalAmount / 1000).toFixed(0)}K</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-900">{bid.leadTime}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      bid.score >= 85 ? 'bg-green-500' :
                                      bid.score >= 70 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${bid.score}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{bid.score}</span>
                              </div>
                              <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                <span>T: {bid.technicalScore}</span>
                                <span>C: {bid.commercialScore}</span>
                                <span>Comp: {bid.compliance}%</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              bid.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                              bid.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
                              bid.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              bid.status === 'awarded' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {bid.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewBidResponse(bid)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                                title="View Bid Details"
                              >
                                <Eye className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-700">View</span>
                              </button>
                              <button
                                onClick={() => handleApproveReject(bid, 'approve')}
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm"
                                title="Shortlist Bid"
                              >
                                <ThumbsUp className="w-4 h-4 text-green-600" />
                                <span className="text-green-600">Approve</span>
                              </button>
                              <button
                                onClick={() => handleApproveReject(bid, 'reject')}
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                                title="Reject Bid"
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span className="text-red-600">Reject</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evaluation' && (
            <div className="space-y-3">
              {/* Evaluation Criteria */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluation Criteria Weights</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {evaluationCriteria.map((criteria) => (
                    <div key={criteria.criteria} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">{criteria.criteria}</div>
                      <div className="text-2xl font-bold text-gray-900">{criteria.weight}%</div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${criteria.weight}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bid Comparison Matrix */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Bid Comparison Matrix</h3>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={[
                      { criteria: 'Price', supplierA: 85, supplierB: 90, supplierC: 75 },
                      { criteria: 'Quality', supplierA: 90, supplierB: 85, supplierC: 92 },
                      { criteria: 'Delivery', supplierA: 80, supplierB: 88, supplierC: 85 },
                      { criteria: 'Technical', supplierA: 92, supplierB: 78, supplierC: 88 },
                      { criteria: 'Service', supplierA: 88, supplierB: 82, supplierC: 90 }
                    ]}>
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis dataKey="criteria" stroke="#6B7280" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6B7280" />
                      <Radar name="TechPro Solutions" dataKey="supplierA" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Radar name="Global Tech Services" dataKey="supplierB" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      <Radar name="Innovation Systems" dataKey="supplierC" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Scoring Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Technical Evaluation</h4>
                  <div className="space-y-3">
                    {['Solution Architecture', 'Implementation Plan', 'Team Expertise', 'Innovation', 'Risk Management'].map((item) => (
                      <div key={item} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm font-medium">4.0</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Commercial Evaluation</h4>
                  <div className="space-y-3">
                    {['Price Competitiveness', 'Payment Terms', 'Warranty', 'Value for Money', 'Cost Breakdown'].map((item) => (
                      <div key={item} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm font-medium">4.2</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-3">
              {/* Supplier Win Rate Analysis */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Supplier Performance Analytics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={supplierParticipation}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="supplier" angle={-45} textAnchor="end" height={80} stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                    <Legend />
                    <Bar dataKey="participated" fill="#3B82F6" name="Participated" />
                    <Bar dataKey="won" fill="#10B981" name="Won" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Response Time Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Days to Respond</span>
                      <span className="font-medium">5.2</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fastest Response</span>
                      <span className="font-medium">1 day</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Slowest Response</span>
                      <span className="font-medium">14 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">On-Time Response Rate</span>
                      <span className="font-medium">92%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Cost Savings Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Savings YTD</span>
                      <span className="font-medium text-green-600">$1.25M</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Savings %</span>
                      <span className="font-medium">12.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Best Negotiation</span>
                      <span className="font-medium">28% saved</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Target Achievement</span>
                      <span className="font-medium">115%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Process Efficiency</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Cycle Time</span>
                      <span className="font-medium">18 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">First-Time Award Rate</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cancellation Rate</span>
                      <span className="font-medium text-red-600">5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Re-bid Rate</span>
                      <span className="font-medium">8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">RFQ/RFP Templates</h3>

              {/* Template Library */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { name: 'Standard RFQ Template', category: 'General', uses: 124, lastUpdated: '2024-01-15' },
                  { name: 'IT Services RFP', category: 'Technology', uses: 45, lastUpdated: '2024-02-01' },
                  { name: 'Construction RFQ', category: 'Facilities', uses: 28, lastUpdated: '2024-01-20' },
                  { name: 'Professional Services RFP', category: 'Services', uses: 62, lastUpdated: '2024-02-10' },
                  { name: 'Raw Materials RFQ', category: 'Supply Chain', uses: 89, lastUpdated: '2024-02-05' },
                  { name: 'Logistics RFP Template', category: 'Transportation', uses: 34, lastUpdated: '2024-01-25' }
                ].map((template) => (
                  <div key={template.name} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">More</span>
                      </button>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                    <div className="text-sm text-gray-600 mb-3">{template.category}</div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>Used {template.uses} times</span>
                      <span>Updated {template.lastUpdated}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUseTemplate(template.name)}
                        className="flex-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                        title="Use This Template"
                      >
                        Use Template
                      </button>
                      <button
                        onClick={() => handleUseTemplate(template.name)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                        title="Preview Template"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Template Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCreateTemplate}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                  title="Import Template from File"
                >
                  <Upload className="w-4 h-4" />
                  Import Template
                </button>
                <button
                  onClick={handleCreateTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  title="Create New RFQ/RFP Template"
                >
                  <Plus className="w-4 h-4" />
                  Create New Template
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RFQ Modals */}
      <CreateRFQModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await procurementRFQService.createRFQ({
              title: data.title,
              description: data.description || undefined,
              department: data.category || 'General',
              responseDeadline: data.responseDeadline,
              requiredDeliveryDate: data.awardTargetDate || data.responseDeadline,
              currency: data.currency || 'USD',
              estimatedBudget: data.estimatedValue || undefined,
              notes: data.termsAndConditions || undefined,
              items: (data.items || []).map((it) => ({
                itemId: it.itemId || it.itemCode,
                quantity: Number(it.quantity ?? 0),
                specifications: it.specifications || undefined,
                targetPrice: it.estimatedPrice,
                requiredDate: it.deliveryDate || data.responseDeadline,
              })),
              vendorIds: data.invitedSuppliers || [],
            })
            setIsCreateModalOpen(false)
            await loadRfqs()
          } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to create RFQ')
          }
        }}
      />

      <ViewRFQDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        rfq={selectedRFQ as RFQData | null}
      />

      <SendRFQToSuppliersModal
        isOpen={isSendToSuppliersModalOpen}
        onClose={() => setIsSendToSuppliersModalOpen(false)}
        rfq={selectedRFQ as RFQData | null}
        onSubmit={(data) => {
          console.log('Sending RFQ to suppliers:', data)
          setIsSendToSuppliersModalOpen(false)
        }}
      />

      <CompareBidsModal
        isOpen={isCompareBidsModalOpen}
        onClose={() => setIsCompareBidsModalOpen(false)}
        rfq={selectedRFQ as RFQData | null}
        bids={[]}
      />

      <AwardBidModal
        isOpen={isAwardBidModalOpen}
        onClose={() => setIsAwardBidModalOpen(false)}
        bid={selectedBid as ModalBidResponse | null}
        rfq={selectedRFQ as RFQData | null}
        onSubmit={(data) => {
          console.log('Awarding bid:', data)
          setIsAwardBidModalOpen(false)
        }}
      />

      <ExportRFQModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSubmit={(options: Record<string, unknown>) => {
          console.log('Exporting RFQ data:', options)
          setIsExportModalOpen(false)
        }}
      />
    </div>
  )
}