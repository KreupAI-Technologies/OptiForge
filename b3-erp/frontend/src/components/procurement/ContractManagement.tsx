'use client'

import React, { useState, useEffect } from 'react'
import { procurementContractService } from '@/services/procurement-contract.service'
import {
  FileText,
  Calendar,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Shield,
  Users,
  Building2,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Bell,
  Timer,
  Award,
  Briefcase,
  Tag,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Paperclip,
  MessageSquare,
  Settings,
  MoreVertical,
  AlertCircle,
  CheckSquare,
  XSquare,
  Copy,
  Archive,
  Trash2,
  Star,
  GitBranch,
  Key,
  Lock,
  Unlock,
  FileEdit,
  Zap,
  Target
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
  ComposedChart,
  Scatter
} from 'recharts'

interface Contract {
  id: string
  title: string
  supplier: string
  type: 'master' | 'purchase' | 'service' | 'nda' | 'framework'
  status: 'draft' | 'negotiation' | 'active' | 'expiring' | 'expired' | 'terminated'
  value: number
  startDate: string
  endDate: string
  renewalDate?: string
  owner: string
  department: string
  compliance: number
  risk: 'low' | 'medium' | 'high'
  autoRenew: boolean
  notifications: number
}

interface ContractMilestone {
  id: string
  contractId: string
  title: string
  dueDate: string
  status: 'pending' | 'completed' | 'overdue'
  value?: number
  responsible: string
}

export default function ContractManagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showRenewalAlert, setShowRenewalAlert] = useState(true)
  const [showRealTimeMonitoring, setShowRealTimeMonitoring] = useState(true)
  const [showAIInsights, setShowAIInsights] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Sample data — used as fallback until the backend returns contracts.
  const [contracts, setContracts] = useState<Contract[]>([])

  const contractTypeMap: Record<string, Contract['type']> = {
    MASTER: 'master', PURCHASE: 'purchase', SERVICE: 'service', NDA: 'nda', FRAMEWORK: 'framework',
  }
  const contractStatusMap: Record<string, Contract['status']> = {
    DRAFT: 'draft', NEGOTIATION: 'negotiation', PENDING_APPROVAL: 'negotiation', ACTIVE: 'active',
    EXPIRING: 'expiring', EXPIRED: 'expired', TERMINATED: 'terminated',
  }

  const loadContracts = React.useCallback(async () => {
    try {
      const raw = await procurementContractService.getContracts()
      if (Array.isArray(raw) && raw.length) {
        setContracts(raw.map((c: any, idx: number): Contract => ({
          id: c.contractNumber ?? c.id ?? `CTR-${idx + 1}`,
          title: c.title ?? c.name ?? 'Untitled Contract',
          supplier: c.vendorName ?? c.supplier ?? c.vendor?.name ?? '—',
          type: contractTypeMap[String(c.contractType ?? c.type ?? '').toUpperCase()] ?? 'purchase',
          status: contractStatusMap[String(c.status ?? '').toUpperCase()] ?? 'draft',
          value: Number(c.value ?? c.contractValue ?? 0),
          startDate: (c.startDate ?? '').toString().slice(0, 10),
          endDate: (c.endDate ?? '').toString().slice(0, 10),
          renewalDate: c.renewalDate ? c.renewalDate.toString().slice(0, 10) : undefined,
          owner: c.owner ?? c.ownerName ?? '—',
          department: c.department ?? '—',
          compliance: Number(c.complianceScore ?? c.compliance ?? 100),
          risk: (String(c.riskLevel ?? c.risk ?? 'low').toLowerCase() as Contract['risk']),
          autoRenew: Boolean(c.autoRenew),
          notifications: Number(c.notifications ?? 0),
          _backendId: c.id ?? undefined,
        } as Contract & { _backendId?: string })))
      }
    } catch {
      // leave contracts empty on error
    }
  }, [])

  // Wire the genuine renew mutation to the backend endpoint
  // (POST /procurement/contracts/:id/renew) then refresh the list.
  const renewContractById = async (backendId: string | undefined, label: string) => {
    if (!backendId) {
      setActionError(`Cannot renew ${label}: missing contract id.`)
      return
    }
    setActionBusy(true)
    setActionError(null)
    try {
      await procurementContractService.renewContract(backendId)
      await loadContracts()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `Failed to renew ${label}`)
    } finally {
      setActionBusy(false)
    }
  }

  // Handler functions
  const handleCreateContract = async () => {
    const title = window.prompt('New contract title')?.trim();
    if (!title) return;
    setActionBusy(true);
    setActionError(null);
    try {
      await procurementContractService.createContract({ title, status: 'draft' });
      await loadContracts();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create contract');
    } finally {
      setActionBusy(false);
    }
  };

  const handleEditContract = async (contract: Contract) => {
    if (contract.status === 'expired' || contract.status === 'terminated') {
      setActionError(`Cannot edit ${contract.status} contract ${contract.id}.`);
      return;
    }
    const backendId = (contract as Contract & { _backendId?: string })._backendId;
    if (!backendId) {
      setActionError(`Cannot edit ${contract.id}: missing contract id.`);
      return;
    }
    const title = window.prompt('Contract title', contract.title)?.trim();
    if (!title || title === contract.title) return;
    setActionBusy(true);
    setActionError(null);
    try {
      await procurementContractService.updateContract(backendId, { title });
      await loadContracts();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `Failed to update ${contract.id}`);
    } finally {
      setActionBusy(false);
    }
  };

  const handleRenewContract = (contract: Contract) => {
    const backendId = (contract as Contract & { _backendId?: string })._backendId;
    if (!confirm(`Renew contract ${contract.id} — ${contract.title}?`)) return;
    void renewContractById(backendId, contract.id);
  };

  const handleAmendContract = async (contract: Contract) => {
    if (contract.status !== 'active') {
      setActionError(`Cannot amend ${contract.status} contract ${contract.id} — amendments require ACTIVE status.`);
      return;
    }
    const backendId = (contract as Contract & { _backendId?: string })._backendId;
    if (!backendId) {
      setActionError(`Cannot amend ${contract.id}: missing contract id.`);
      return;
    }
    const note = window.prompt('Amendment note (scope / financial / timeline change)')?.trim();
    if (!note) return;
    setActionBusy(true);
    setActionError(null);
    try {
      await procurementContractService.updateContract(backendId, { amendment: { note } });
      await loadContracts();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `Failed to amend ${contract.id}`);
    } finally {
      setActionBusy(false);
    }
  };

  const handleViewTerms = (contract: Contract) => {
    console.log('Viewing contract terms:', contract.id, contract);
    alert(`Contract Terms: ${contract.id} - ${contract.title}. Value: $${(contract.value / 1000).toFixed(0)}K, Type: ${contract.type.toUpperCase()}, Auto-Renewal: ${contract.autoRenew ? 'Yes' : 'No'}.`);
  };

  const handleExportContract = () => {
    console.log('Exporting contract data...');
    alert('Export Contract Report - This would export contract register, financial summary, renewal schedule, and compliance reports in various formats.');
  };

  const handleRefresh = () => {
    console.log('Refreshing contract data...');
    alert('Refreshing Contract Management - Updating contract status, compliance scores, and renewal dates.');
  };

  const handleSettings = () => {
    console.log('Opening contract settings...');
    alert('Contract Management Settings - Configure contract durations, approval workflows, renewal management, and compliance settings.');
  };

  const handleViewContract = (contract: Contract) => {
    console.log('Viewing contract details:', contract.id);
    const daysRemaining = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    console.log('Contract details:', { contract, daysRemaining });
    alert(`Contract: ${contract.id} - ${contract.title}. Supplier: ${contract.supplier}, Value: $${(contract.value / 1000).toFixed(0)}K, Status: ${contract.status.toUpperCase()}, Days Remaining: ${daysRemaining}.`);
  };

  useEffect(() => {
    void loadContracts()
  }, [loadContracts])

  const milestones: ContractMilestone[] = [
    {
      id: 'MS-001',
      contractId: 'CTR-2024-001',
      title: 'Quarterly Performance Review',
      dueDate: '2024-03-31',
      status: 'pending',
      responsible: 'John Matthews'
    },
    {
      id: 'MS-002',
      contractId: 'CTR-2024-002',
      title: 'Price Negotiation Deadline',
      dueDate: '2024-02-28',
      status: 'pending',
      value: 100000,
      responsible: 'Sarah Chen'
    },
    {
      id: 'MS-003',
      contractId: 'CTR-2024-001',
      title: 'Annual Audit',
      dueDate: '2024-06-30',
      status: 'pending',
      responsible: 'Audit Team'
    },
    {
      id: 'MS-004',
      contractId: 'CTR-2024-004',
      title: 'License Renewal Decision',
      dueDate: '2024-04-01',
      status: 'pending',
      responsible: 'Lisa Wong'
    }
  ]

  const contractValueTrend = [
    { month: 'Jan', active: 8500000, new: 450000, expired: 200000 },
    { month: 'Feb', active: 8750000, new: 680000, expired: 150000 },
    { month: 'Mar', active: 9100000, new: 520000, expired: 300000 },
    { month: 'Apr', active: 9300000, new: 750000, expired: 100000 },
    { month: 'May', active: 9600000, new: 380000, expired: 250000 },
    { month: 'Jun', active: 9850000, new: 620000, expired: 180000 }
  ]

  const contractsByType = [
    { type: 'Master Agreement', count: 12, value: 4500000 },
    { type: 'Purchase', count: 28, value: 3200000 },
    { type: 'Service', count: 18, value: 2800000 },
    { type: 'Framework', count: 8, value: 1500000 },
    { type: 'NDA', count: 45, value: 0 }
  ]

  const contractLifecycle = [
    { stage: 'Initiation', days: 5, contracts: 3 },
    { stage: 'Negotiation', days: 15, contracts: 8 },
    { stage: 'Approval', days: 7, contracts: 5 },
    { stage: 'Execution', days: 2, contracts: 2 },
    { stage: 'Active', days: 730, contracts: 68 },
    { stage: 'Renewal', days: 30, contracts: 12 }
  ]

  const complianceMetrics = [
    { metric: 'On-time Renewals', value: 92, target: 95, status: 'warning' },
    { metric: 'Compliance Score', value: 88, target: 90, status: 'warning' },
    { metric: 'Risk Assessment', value: 95, target: 85, status: 'good' },
    { metric: 'Audit Readiness', value: 78, target: 90, status: 'critical' },
    { metric: 'Vendor Performance', value: 86, target: 85, status: 'good' }
  ]

  const upcomingRenewals = contracts
    .filter(c => c.renewalDate && new Date(c.renewalDate) > new Date())
    .sort((a, b) => new Date(a.renewalDate!).getTime() - new Date(b.renewalDate!).getTime())
    .slice(0, 5)

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  return (
    <div className="p-6 space-y-3 bg-gray-50 min-h-screen">
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</div>
      )}
      {actionBusy && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">Processing contract action...</div>
      )}
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Contract Management
            </h1>
            <p className="text-gray-600 mt-2">Manage contract lifecycle, compliance, and renewals</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleRefresh} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2" title="Refresh Data">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleSettings} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={handleExportContract} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2" title="Export Report">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button onClick={handleCreateContract} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2" title="Create New Contract">
              <Plus className="w-4 h-4" />
              New Contract
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-600 text-sm font-medium">Active Contracts</span>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">86</div>
            <div className="text-sm text-gray-600">Total active</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-600 text-sm font-medium">Total Value</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">$12.8M</div>
            <div className="text-sm text-green-600">↑ 8% YoY</div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-600 text-sm font-medium">Expiring Soon</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-red-600">Next 30 days</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-600 text-sm font-medium">Compliance</span>
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">88%</div>
            <div className="text-sm text-yellow-600">2% below target</div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-rose-600 text-sm font-medium">Risk Level</span>
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">Medium</div>
            <div className="text-sm text-gray-600">8 high risk</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-600 text-sm font-medium">Savings</span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">$1.2M</div>
            <div className="text-sm text-gray-600">Through negotiation</div>
          </div>
        </div>

        {/* Renewal Alert */}
        {showRenewalAlert && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Upcoming Renewals Require Attention</h4>
              <p className="text-sm text-gray-600 mt-1">
                You have 12 contracts expiring in the next 30 days. 5 require immediate action for renewal negotiations.
              </p>
            </div>
            <button
              onClick={() => setShowRenewalAlert(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Real-Time Monitoring Dashboard */}
      {showRealTimeMonitoring && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-3 border border-indigo-200 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Real-Time Contract Monitoring
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
                <span className="text-sm font-medium text-gray-600">Active Changes</span>
                <FileEdit className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">4</div>
              <div className="text-xs text-blue-600 mt-1">2 amendments pending</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Renewals This Week</span>
                <RefreshCw className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-xs text-amber-600 mt-1">Decisions needed</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Compliance Alerts</span>
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">2</div>
              <div className="text-xs text-red-600 mt-1">1 critical</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Contract Value Change</span>
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">+$1.2M</div>
              <div className="text-xs text-green-600 mt-1">This month</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Contract Activity</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-gray-600">CTR-2024-003 executed and activated</span>
                <span className="text-gray-400 text-xs ml-auto">10 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FileEdit className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600">Amendment #2 submitted for CTR-2024-001</span>
                <span className="text-gray-400 text-xs ml-auto">1 hour ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span className="text-gray-600">Insurance certificate expiring for CTR-2024-002</span>
                <span className="text-gray-400 text-xs ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RefreshCw className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <span className="text-gray-600">Renewal initiated for Software License Agreement</span>
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
              AI-Powered Contract Intelligence
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
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Renewal Prediction</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">92%</div>
              <p className="text-xs text-gray-600">Success rate predicted for upcoming renewals based on supplier performance and market conditions</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-semibold text-gray-900">Risk Alert</span>
              </div>
              <div className="text-2xl font-bold text-amber-600 mb-1">3</div>
              <p className="text-xs text-gray-600">Contracts with compliance or performance issues requiring immediate attention before renewal</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-gray-900">Savings Opportunity</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">$380K</div>
              <p className="text-xs text-gray-600">Potential savings through renegotiation and contract consolidation opportunities identified</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Smart Contract Recommendations</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-2 bg-amber-50 rounded">
                <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Early Renewal Action:</span>
                  <span className="text-gray-600"> Start CTR-2024-002 renewal process now (120 days out) to secure better pricing before market rates increase</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-blue-50 rounded">
                <GitBranch className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Consolidation Opportunity:</span>
                  <span className="text-gray-600"> Merge 3 IT service contracts into single MSA to reduce management overhead and improve terms</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-red-50 rounded">
                <Shield className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Compliance Update Needed:</span>
                  <span className="text-gray-600"> 5 contracts require updated data protection clauses to meet new regulatory requirements</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-t-xl">
          {['overview', 'contracts', 'lifecycle', 'compliance', 'renewals', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex - 1 px - 4 py - 2 rounded - lg font - medium transition ${
  activeTab === tab
    ? 'bg-white text-blue-600 shadow-sm'
    : 'text-gray-600 hover:text-gray-900'
} `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {/* Contract Value Trend */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Value Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={contractValueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" tickFormatter={(value) => `$${ (value / 1000000).toFixed(1) } M`} />
                    <Tooltip
                      formatter={(value: number) => `$${ (value / 1000000).toFixed(2) } M`}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="active" fill="#DBEAFE" stroke="#3B82F6" name="Active Value" />
                    <Bar dataKey="new" fill="#10B981" name="New Contracts" />
                    <Bar dataKey="expired" fill="#EF4444" name="Expired" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Contract Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contracts by Type</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={contractsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percent }) => `${ type }: ${ (percent * 100).toFixed(0) }% `}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {contractsByType.map((entry, index) => (
                          <Cell key={`cell - ${ index } `} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Lifecycle Stages</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="100%" data={contractLifecycle}>
                      <RadialBar label={{ position: 'insideStart', fill: '#fff' }} background dataKey="contracts">
                        {contractLifecycle.map((entry, index) => (
                          <Cell key={`cell - ${ index } `} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </RadialBar>
                      <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" align="center" />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Upcoming Milestones */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Milestones & Deadlines</h3>
                </div>
                <div className="p-4 space-y-3">
                  {milestones.filter(m => m.status === 'pending').map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-2">
                        <div className={`p - 2 rounded - lg ${
  milestone.status === 'completed' ? 'bg-green-100 text-green-600' :
    milestone.status === 'overdue' ? 'bg-red-100 text-red-600' :
      'bg-yellow-100 text-yellow-600'
} `}>
                          <CheckSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{milestone.title}</div>
                          <div className="text-sm text-gray-600">Contract: {milestone.contractId} • {milestone.responsible}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{milestone.dueDate}</div>
                        {milestone.value && (
                          <div className="text-sm text-gray-600">${(milestone.value / 1000).toFixed(0)}K impact</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-2">
              {/* Filters */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search contracts..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="negotiation">In Negotiation</option>
                  <option value="expired">Expired</option>
                </select>
                <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  More Filters
                </button>
              </div>

              {/* Contracts Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Contract ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Supplier</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Value</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Period</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Compliance</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Risk</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-blue-600">{contract.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{contract.title}</div>
                            <div className="text-sm text-gray-500">{contract.type} • {contract.department}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{contract.supplier}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">${(contract.value / 1000000).toFixed(2)}M</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm text-gray-900">{contract.startDate}</div>
                            <div className="text-sm text-gray-500">to {contract.endDate}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline - flex items - center gap - 1 px - 2 py - 1 rounded - full text - xs font - medium ${
  contract.status === 'active' ? 'bg-green-100 text-green-700' :
    contract.status === 'expiring' ? 'bg-amber-100 text-amber-700' :
      contract.status === 'negotiation' ? 'bg-blue-100 text-blue-700' :
        contract.status === 'expired' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
} `}>
                            {contract.status === 'active' && <CheckCircle className="w-3 h-3" />}
                            {contract.status === 'expiring' && <Clock className="w-3 h-3" />}
                            {contract.status === 'negotiation' && <RefreshCw className="w-3 h-3" />}
                            {contract.status === 'expired' && <XCircle className="w-3 h-3" />}
                            {contract.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h - 2 rounded - full ${
  contract.compliance >= 90 ? 'bg-green-500' :
    contract.compliance >= 70 ? 'bg-yellow-500' :
      'bg-red-500'
} `}
                                style={{ width: `${ contract.compliance }% ` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{contract.compliance}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline - flex items - center gap - 1 px - 2 py - 1 rounded - full text - xs font - medium ${
  contract.risk === 'low' ? 'bg-green-100 text-green-700' :
    contract.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
      'bg-red-100 text-red-700'
} `}>
                            <Shield className="w-3 h-3" />
                            {contract.risk}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewContract(contract)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                              title="View Contract Details"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700">View</span>
                            </button>

                            {contract.status !== 'expired' && contract.status !== 'terminated' && (
                              <button
                                onClick={() => handleEditContract(contract)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm transition-colors"
                                title="Edit Contract"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-700">Edit</span>
                              </button>
                            )}

                            {(contract.status === 'active' || contract.status === 'expiring') && (
                              <button
                                onClick={() => handleRenewContract(contract)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 bg-green-50 rounded-lg hover:bg-green-100 text-sm transition-colors"
                                title="Renew Contract"
                              >
                                <RefreshCw className="w-4 h-4 text-green-600" />
                                <span className="text-green-700">Renew</span>
                              </button>
                            )}

                            {contract.status === 'active' && (
                              <button
                                onClick={() => handleAmendContract(contract)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-purple-300 bg-purple-50 rounded-lg hover:bg-purple-100 text-sm transition-colors"
                                title="Create Amendment"
                              >
                                <FileEdit className="w-4 h-4 text-purple-600" />
                                <span className="text-purple-700">Amend</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleViewTerms(contract)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                              title="View Terms & Conditions"
                            >
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700">Terms</span>
                            </button>

                            <button
                              className="p-2 hover:bg-gray-100 rounded relative transition-colors"
                              title={`${ contract.notifications } notification${ contract.notifications !== 1 ? 's' : '' } `}
                            >
                              <Bell className="w-4 h-4 text-gray-600" />
                              {contract.notifications > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full font-medium">
                                  {contract.notifications > 9 ? '9+' : contract.notifications}
                                </span>
                              )}
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

          {activeTab === 'lifecycle' && (
            <div className="space-y-3">
              {/* Lifecycle Overview */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
                {contractLifecycle.map((stage) => (
                  <div key={stage.stage} className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                    <div className="text-blue-600 text-sm font-medium mb-1">{stage.stage}</div>
                    <div className="text-2xl font-bold text-gray-900">{stage.contracts}</div>
                    <div className="text-sm text-gray-600">Avg: {stage.days}d</div>
                  </div>
                ))}
              </div>

              {/* Lifecycle Process */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Lifecycle Process</h3>
                <div className="relative">
                  <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-300"></div>
                  <div className="flex justify-between relative">
                    {['Request', 'Draft', 'Review', 'Negotiate', 'Approve', 'Execute', 'Manage', 'Renew/Close'].map((step, index) => (
                      <div key={step} className="flex flex-col items-center">
                        <div className={`w - 16 h - 16 rounded - full flex items - center justify - center z - 10 ${
  index <= 5 ? 'bg-green-500 text-white' :
    index === 6 ? 'bg-yellow-500 text-white animate-pulse' :
      'bg-gray-300 text-gray-600'
} `}>
                          {index <= 5 ? (
                            <CheckCircle className="w-8 h-8" />
                          ) : index === 6 ? (
                            <Clock className="w-8 h-8" />
                          ) : (
                            <span className="text-lg font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div className="mt-3 text-center">
                          <div className="text-xs font-medium text-gray-900">{step}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lifecycle Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Average Cycle Times</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Contract Creation</span>
                      <span className="font-medium">5 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Negotiation</span>
                      <span className="font-medium">15 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Approval</span>
                      <span className="font-medium">7 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Cycle</span>
                      <span className="font-medium">29 days</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Bottleneck Analysis</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Legal Review</span>
                        <span className="text-sm font-medium text-red-600">8 pending</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Finance Approval</span>
                        <span className="text-sm font-medium text-yellow-600">5 pending</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '50%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Signature</span>
                        <span className="text-sm font-medium text-green-600">2 pending</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Automation Opportunities</h4>
                  <div className="space-y-3">
                    <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition flex items-center justify-between">
                      <span className="text-sm text-gray-700">Template Generation</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition flex items-center justify-between">
                      <span className="text-sm text-gray-700">Approval Workflows</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition flex items-center justify-between">
                      <span className="text-sm text-gray-700">Renewal Reminders</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition flex items-center justify-between">
                      <span className="text-sm text-gray-700">Compliance Checks</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-3">
              {/* Compliance Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {complianceMetrics.map((metric) => (
                  <div key={metric.metric} className={`p - 4 rounded - lg border ${
  metric.status === 'good' ? 'bg-green-50 border-green-200' :
    metric.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
      'bg-red-50 border-red-200'
} `}>
                    <div className="text-sm font-medium text-gray-700 mb-2">{metric.metric}</div>
                    <div className="flex items-end gap-2">
                      <div className="text-2xl font-bold text-gray-900">{metric.value}%</div>
                      <div className="text-sm text-gray-500 pb-0.5">/ {metric.target}%</div>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h - 2 rounded - full ${
  metric.status === 'good' ? 'bg-green-500' :
    metric.status === 'warning' ? 'bg-yellow-500' :
      'bg-red-500'
} `}
                        style={{ width: `${ (metric.value / metric.target) * 100 }% ` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Compliance Issues */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Compliance Issues & Actions</h3>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { issue: 'Missing insurance certificates', contracts: 5, severity: 'high', dueDate: '2024-03-01' },
                    { issue: 'Expired vendor licenses', contracts: 3, severity: 'critical', dueDate: '2024-02-28' },
                    { issue: 'Incomplete audit documentation', contracts: 8, severity: 'medium', dueDate: '2024-03-15' },
                    { issue: 'Unsigned amendments', contracts: 2, severity: 'low', dueDate: '2024-03-30' }
                  ].map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p - 2 rounded - lg ${
  issue.severity === 'critical' ? 'bg-red-100 text-red-600' :
    issue.severity === 'high' ? 'bg-orange-100 text-orange-600' :
      issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
        'bg-gray-100 text-gray-600'
} `}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{issue.issue}</div>
                          <div className="text-sm text-gray-600">Affects {issue.contracts} contracts • Due: {issue.dueDate}</div>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                        Take Action
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Trail */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Audit Activities</h3>
                <div className="space-y-2">
                  {[
                    { action: 'Contract CTR-2024-001 compliance review completed', user: 'John Matthews', time: '2 hours ago' },
                    { action: 'Risk assessment updated for supplier contracts', user: 'Sarah Chen', time: '5 hours ago' },
                    { action: 'Quarterly compliance report generated', user: 'System', time: '1 day ago' },
                    { action: 'Insurance certificate uploaded for CTR-2024-003', user: 'Mike Johnson', time: '2 days ago' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <Activity className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{activity.action}</div>
                        <div className="text-xs text-gray-500">{activity.user} • {activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'renewals' && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Renewal Management</h3>

              {/* Renewal Timeline */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Upcoming Renewals Timeline</h4>
                <div className="space-y-3">
                  {upcomingRenewals.map((contract) => {
                    const daysUntilRenewal = Math.ceil((new Date(contract.renewalDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    return (
                      <div key={contract.id} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-gray-500">{contract.id}</span>
                              {contract.autoRenew && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Auto-renew
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-gray-900">{contract.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {contract.supplier}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                ${(contract.value / 1000000).toFixed(2)}M
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Expires: {contract.endDate}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text - 2xl font - bold ${
  daysUntilRenewal <= 30 ? 'text-red-600' :
    daysUntilRenewal <= 60 ? 'text-yellow-600' :
      'text-green-600'
} `}>
                              {daysUntilRenewal}
                            </div>
                            <div className="text-sm text-gray-500">days left</div>
                            <button
                              onClick={() => handleRenewContract(contract)}
                              disabled={actionBusy}
                              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition disabled:opacity-50"
                            >
                              Start Renewal
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Renewal Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Renewal Checklist</h4>
                  <div className="space-y-2">
                    {[
                      { task: 'Review contract performance', completed: true },
                      { task: 'Assess market rates', completed: true },
                      { task: 'Negotiate new terms', completed: false },
                      { task: 'Update compliance docs', completed: false },
                      { task: 'Obtain approvals', completed: false },
                      { task: 'Execute new contract', completed: false }
                    ].map((task, index) => (
                      <label key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          className="rounded border-gray-300"
                          readOnly
                        />
                        <span className={`text - sm ${ task.completed ? 'text-gray-500 line-through' : 'text-gray-900' } `}>
                          {task.task}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Renewal Settings</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Period</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>30 days before expiry</option>
                        <option>60 days before expiry</option>
                        <option>90 days before expiry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Auto-renewal Default</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Disabled</option>
                        <option>Enabled for low-value contracts</option>
                        <option>Enabled for all contracts</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                        <span className="text-sm text-gray-700">Email notifications</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                        <span className="text-sm text-gray-700">Dashboard alerts</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm text-gray-700">SMS notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-3">
              {/* Contract Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Value by Department</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { dept: 'IT', value: 3500000 },
                      { dept: 'Operations', value: 4200000 },
                      { dept: 'Procurement', value: 2800000 },
                      { dept: 'Finance', value: 1500000 },
                      { dept: 'HR', value: 800000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="dept" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" tickFormatter={(value) => `$${ (value / 1000000).toFixed(1) } M`} />
                      <Tooltip formatter={(value: number) => `$${ (value / 1000000).toFixed(2) } M`} />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Performance Metrics</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">On-time Renewals</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Cost Savings</span>
                        <span className="font-medium">$1.2M</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Supplier Satisfaction</span>
                        <span className="font-medium">4.2/5.0</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '84%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Contract Utilization</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: '78%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Insights & Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { insight: '15% of contracts are underutilized', action: 'Review and consolidate', impact: 'Save $200K/year' },
                    { insight: '8 contracts expiring without renewal plans', action: 'Initiate renewal process', impact: 'Avoid disruption' },
                    { insight: 'Compliance score below target', action: 'Update documentation', impact: 'Reduce risk' },
                    { insight: 'Opportunity for volume discounts', action: 'Consolidate suppliers', impact: 'Save $150K/year' }
                  ].map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.insight}</div>
                          <div className="text-sm text-gray-600 mt-1">Action: {item.action}</div>
                          <div className="text-sm text-green-600 mt-1">Impact: {item.impact}</div>
                        </div>
                      </div>
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