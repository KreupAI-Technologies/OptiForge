'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Calendar, Users, AlertTriangle, CheckCircle2, Clock, XCircle, GitBranch, Shield } from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service';

interface Change {
  id: string
  changeNumber: string
  title: string
  description: string
  type: 'Emergency' | 'Standard' | 'Normal'
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Scheduled' | 'In Progress' | 'Implemented' | 'Completed' | 'Rejected' | 'Cancelled'
  category: string
  affectedSystems: string[]
  plannedStart: string
  plannedEnd: string
  estimatedDowntime: string
  riskLevel: 'High' | 'Medium' | 'Low'
  approvalStatus: string
  cabApprovalRequired: boolean
  requestedBy: string
  assignedTo: string
  implementer: string
  backoutPlan: string
  businessImpact: string
  createdDate: string
  impactedUsers: number
}

export default function ChangeManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedChange, setSelectedChange] = useState<Change | null>(null)
  const [changes, setChanges] = useState<Change[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = (await supportPagesService.getScheduledChanges()) as any[];
        const mapped: Change[] = (Array.isArray(raw) ? raw : []).map((c: any) => ({
          id: String(c?.id ?? ''),
          changeNumber: String(c?.changeNumber ?? ''),
          title: String(c?.title ?? ''),
          description: String(c?.description ?? ''),
          type: (c?.type ?? 'Normal') as Change['type'],
          priority: (c?.priority ?? 'Medium') as Change['priority'],
          status: (c?.status ?? 'Draft') as Change['status'],
          category: String(c?.category ?? ''),
          affectedSystems: Array.isArray(c?.affectedSystems) ? c.affectedSystems.map((s: any) => String(s)) : [],
          plannedStart: String(c?.plannedStart ?? ''),
          plannedEnd: String(c?.plannedEnd ?? ''),
          estimatedDowntime: String(c?.estimatedDowntime ?? ''),
          riskLevel: (c?.riskLevel ?? 'Low') as Change['riskLevel'],
          approvalStatus: String(c?.approvalStatus ?? ''),
          cabApprovalRequired: Boolean(c?.cabApprovalRequired ?? false),
          requestedBy: String(c?.requestedBy ?? ''),
          assignedTo: String(c?.assignedTo ?? ''),
          implementer: String(c?.implementer ?? ''),
          backoutPlan: String(c?.backoutPlan ?? ''),
          businessImpact: String(c?.businessImpact ?? ''),
          createdDate: String(c?.createdDate ?? ''),
          impactedUsers: Number(c?.impactedUsers ?? 0),
        }));
        if (!cancelled) setChanges(mapped);
      } catch (err) {
        if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load changes'); setChanges([]); }
      } finally { if (!cancelled) setIsLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const changesSeed: Change[] = [
    {
      id: '1',
      changeNumber: 'CHG-2024-042',
      title: 'Database server upgrade to PostgreSQL v15.2',
      description: 'Upgrade production database servers from v14.8 to v15.2 for improved performance and security patches',
      type: 'Standard',
      priority: 'High',
      status: 'Pending Approval',
      category: 'Infrastructure',
      affectedSystems: ['Database Server', 'ERP Application', 'Reporting Tools'],
      plannedStart: '2024-10-25 02:00',
      plannedEnd: '2024-10-25 06:00',
      estimatedDowntime: '4 hours',
      riskLevel: 'High',
      approvalStatus: 'CAB Review Pending',
      cabApprovalRequired: true,
      requestedBy: 'Rajesh Kumar',
      assignedTo: 'Database Team',
      implementer: 'Amit Patel',
      backoutPlan: 'Restore from backup snapshot taken at 01:30 AM',
      businessImpact: 'ERP system will be unavailable during maintenance window',
      createdDate: '2024-10-18',
      impactedUsers: 450
    },
    {
      id: '2',
      changeNumber: 'CHG-2024-041',
      title: 'Deploy new CRM features v3.5',
      description: 'Deploy lead scoring, automated workflows, and enhanced reporting features',
      type: 'Normal',
      priority: 'Medium',
      status: 'Scheduled',
      category: 'Application',
      affectedSystems: ['CRM Application', 'Email Server'],
      plannedStart: '2024-10-23 20:00',
      plannedEnd: '2024-10-23 22:00',
      estimatedDowntime: '30 minutes',
      riskLevel: 'Low',
      approvalStatus: 'Approved',
      cabApprovalRequired: false,
      requestedBy: 'Priya Sharma',
      assignedTo: 'Application Team',
      implementer: 'Vikram Singh',
      backoutPlan: 'Rollback to v3.4 using blue-green deployment',
      businessImpact: 'Brief interruption to CRM access, minimal impact',
      createdDate: '2024-10-15',
      impactedUsers: 120
    },
    {
      id: '3',
      changeNumber: 'CHG-2024-040',
      title: 'Emergency security patch for web server',
      description: 'Apply critical security patch for CVE-2024-12345 vulnerability in web server software',
      type: 'Emergency',
      priority: 'Critical',
      status: 'Implemented',
      category: 'Security',
      affectedSystems: ['Web Server', 'Application Gateway'],
      plannedStart: '2024-10-20 14:00',
      plannedEnd: '2024-10-20 14:30',
      estimatedDowntime: '15 minutes',
      riskLevel: 'High',
      approvalStatus: 'Emergency Approved',
      cabApprovalRequired: false,
      requestedBy: 'Security Team',
      assignedTo: 'Infrastructure Team',
      implementer: 'Suresh Reddy',
      backoutPlan: 'Revert to previous server configuration',
      businessImpact: 'Brief website unavailability',
      createdDate: '2024-10-20',
      impactedUsers: 800
    },
    {
      id: '4',
      changeNumber: 'CHG-2024-039',
      title: 'Network firewall rule updates',
      description: 'Update firewall rules to allow new vendor VPN access and restrict outdated protocols',
      type: 'Standard',
      priority: 'Medium',
      status: 'Completed',
      category: 'Network',
      affectedSystems: ['Firewall', 'VPN Server'],
      plannedStart: '2024-10-19 18:00',
      plannedEnd: '2024-10-19 19:00',
      estimatedDowntime: 'No downtime',
      riskLevel: 'Low',
      approvalStatus: 'Approved',
      cabApprovalRequired: true,
      requestedBy: 'Network Team',
      assignedTo: 'Network Team',
      implementer: 'Deepak Gupta',
      backoutPlan: 'Restore previous firewall configuration from backup',
      businessImpact: 'No user impact expected',
      createdDate: '2024-10-12',
      impactedUsers: 0
    },
    {
      id: '5',
      changeNumber: 'CHG-2024-038',
      title: 'Upgrade email server to Exchange 2022',
      description: 'Migrate from Exchange 2019 to Exchange 2022 with enhanced security and collaboration features',
      type: 'Standard',
      priority: 'High',
      status: 'Approved',
      category: 'Infrastructure',
      affectedSystems: ['Email Server', 'Active Directory'],
      plannedStart: '2024-10-28 00:00',
      plannedEnd: '2024-10-28 06:00',
      estimatedDowntime: '6 hours',
      riskLevel: 'High',
      approvalStatus: 'Approved',
      cabApprovalRequired: true,
      requestedBy: 'IT Manager',
      assignedTo: 'Infrastructure Team',
      implementer: 'Rahul Sharma',
      backoutPlan: 'Failover to backup mail server, restore from snapshot',
      businessImpact: 'Email services unavailable during maintenance',
      createdDate: '2024-10-10',
      impactedUsers: 600
    },
    {
      id: '6',
      changeNumber: 'CHG-2024-037',
      title: 'Deploy inventory management module updates',
      description: 'Release v4.2 with batch tracking, barcode scanning, and cycle count improvements',
      type: 'Normal',
      priority: 'Medium',
      status: 'In Progress',
      category: 'Application',
      affectedSystems: ['Inventory System', 'Warehouse Mobile App'],
      plannedStart: '2024-10-22 16:00',
      plannedEnd: '2024-10-22 18:00',
      estimatedDowntime: '1 hour',
      riskLevel: 'Medium',
      approvalStatus: 'Approved',
      cabApprovalRequired: false,
      requestedBy: 'Warehouse Manager',
      assignedTo: 'Development Team',
      implementer: 'Sneha Patel',
      backoutPlan: 'Rollback deployment using automated pipeline',
      businessImpact: 'Warehouse operations temporarily paused',
      createdDate: '2024-10-08',
      impactedUsers: 85
    },
    {
      id: '7',
      changeNumber: 'CHG-2024-036',
      title: 'Backup system configuration changes',
      description: 'Reconfigure backup schedules and retention policies for compliance',
      type: 'Standard',
      priority: 'Low',
      status: 'Draft',
      category: 'Infrastructure',
      affectedSystems: ['Backup Server', 'Storage Array'],
      plannedStart: '2024-10-30 22:00',
      plannedEnd: '2024-10-30 23:00',
      estimatedDowntime: 'No downtime',
      riskLevel: 'Low',
      approvalStatus: 'Not Submitted',
      cabApprovalRequired: false,
      requestedBy: 'IT Operations',
      assignedTo: 'Infrastructure Team',
      implementer: 'TBD',
      backoutPlan: 'Restore previous backup configuration',
      businessImpact: 'No impact to business operations',
      createdDate: '2024-10-17',
      impactedUsers: 0
    },
    {
      id: '8',
      changeNumber: 'CHG-2024-035',
      title: 'Office 365 license tier upgrade',
      description: 'Upgrade 50 users from Business Basic to Business Standard for Teams features',
      type: 'Normal',
      priority: 'Low',
      status: 'Rejected',
      category: 'Software',
      affectedSystems: ['Office 365'],
      plannedStart: '2024-10-24 10:00',
      plannedEnd: '2024-10-24 10:30',
      estimatedDowntime: 'No downtime',
      riskLevel: 'Low',
      approvalStatus: 'Rejected - Budget Constraints',
      cabApprovalRequired: false,
      requestedBy: 'HR Manager',
      assignedTo: 'IT Support',
      implementer: 'N/A',
      backoutPlan: 'N/A',
      businessImpact: 'N/A',
      createdDate: '2024-10-14',
      impactedUsers: 50
    },
    {
      id: '9',
      changeNumber: 'CHG-2024-034',
      title: 'Production server OS patching',
      description: 'Apply monthly security and stability patches to all production Windows servers',
      type: 'Standard',
      priority: 'High',
      status: 'Scheduled',
      category: 'Infrastructure',
      affectedSystems: ['Application Servers', 'Web Servers', 'Database Servers'],
      plannedStart: '2024-10-26 01:00',
      plannedEnd: '2024-10-26 05:00',
      estimatedDowntime: '2 hours rolling restarts',
      riskLevel: 'Medium',
      approvalStatus: 'Approved',
      cabApprovalRequired: true,
      requestedBy: 'Security Team',
      assignedTo: 'Infrastructure Team',
      implementer: 'Automation Tool',
      backoutPlan: 'Rollback patches using WSUS',
      businessImpact: 'Brief service interruptions during rolling restarts',
      createdDate: '2024-10-11',
      impactedUsers: 550
    },
    {
      id: '10',
      changeNumber: 'CHG-2024-033',
      title: 'Implement multi-factor authentication',
      description: 'Deploy MFA for all VPN and remote access to enhance security posture',
      type: 'Standard',
      priority: 'High',
      status: 'Pending Approval',
      category: 'Security',
      affectedSystems: ['VPN Server', 'Active Directory', 'Authentication Service'],
      plannedStart: '2024-10-27 09:00',
      plannedEnd: '2024-10-27 12:00',
      estimatedDowntime: 'No downtime',
      riskLevel: 'Medium',
      approvalStatus: 'CAB Review Scheduled',
      cabApprovalRequired: true,
      requestedBy: 'Security Officer',
      assignedTo: 'Security Team',
      implementer: 'Karthik Menon',
      backoutPlan: 'Disable MFA requirement, revert to password-only authentication',
      businessImpact: 'Users require MFA app setup, training provided',
      createdDate: '2024-10-09',
      impactedUsers: 200
    }
  ]

  const stats = [
    {
      label: 'Total Changes',
      value: changes.length,
      change: '+3 this month',
      icon: GitBranch,
      color: 'blue'
    },
    {
      label: 'Pending Approval',
      value: changes.filter(c => c.status === 'Pending Approval').length,
      change: 'Needs attention',
      icon: Clock,
      color: 'yellow'
    },
    {
      label: 'Scheduled',
      value: changes.filter(c => c.status === 'Scheduled').length,
      change: 'Next 7 days',
      icon: Calendar,
      color: 'purple'
    },
    {
      label: 'In Progress',
      value: changes.filter(c => c.status === 'In Progress').length,
      change: 'Active now',
      icon: AlertTriangle,
      color: 'orange'
    },
    {
      label: 'Completed',
      value: changes.filter(c => c.status === 'Completed').length,
      change: '+5 this week',
      icon: CheckCircle2,
      color: 'green'
    },
    {
      label: 'Emergency',
      value: changes.filter(c => c.type === 'Emergency').length,
      change: 'Last 30 days',
      icon: Shield,
      color: 'red'
    }
  ]

  const filteredChanges = changes.filter(change => {
    const matchesSearch = change.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         change.changeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         change.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || change.status === statusFilter
    const matchesType = typeFilter === 'all' || change.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'Pending Approval': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Scheduled': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'In Progress': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Implemented': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200'
      case 'Cancelled': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500 text-white'
      case 'High': return 'bg-orange-500 text-white'
      case 'Medium': return 'bg-yellow-500 text-white'
      case 'Low': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency': return 'bg-red-100 text-red-700 border-red-200'
      case 'Standard': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Normal': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-600'
      case 'Medium': return 'text-yellow-600'
      case 'Low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="p-6 space-y-3">
      {isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"><div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />Loading changes…</div>)}
      {loadError && !isLoading && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>)}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Change Management</h1>
          <p className="text-gray-600 mt-1">Plan, approve, and track all system changes</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Request Change
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: 'bg-blue-500',
            yellow: 'bg-yellow-500',
            purple: 'bg-purple-500',
            orange: 'bg-orange-500',
            green: 'bg-green-500',
            red: 'bg-red-500'
          }
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">{stat.label}</span>
                <div className={`${colorClasses[stat.color as keyof typeof colorClasses]} p-2 rounded-lg`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.change}</div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search changes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Implemented">Implemented</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Emergency">Emergency</option>
              <option value="Standard">Standard</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Changes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredChanges.map((change) => (
          <div key={change.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(change.priority)}`}>
                      {change.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(change.type)}`}>
                      {change.type}
                    </span>
                    <span className="text-gray-500 text-sm">{change.changeNumber}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{change.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{change.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(change.status)}`}>
                  {change.status}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Planned: {change.plannedStart}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Downtime: {change.estimatedDowntime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className={`h-4 w-4 ${getRiskColor(change.riskLevel)}`} />
                  <span className={getRiskColor(change.riskLevel)}>Risk: {change.riskLevel}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Impacted: {change.impactedUsers} users</span>
                </div>
              </div>

              {/* Affected Systems */}
              <div className="mb-2">
                <div className="text-xs text-gray-500 mb-1">Affected Systems</div>
                <div className="flex flex-wrap gap-1">
                  {change.affectedSystems.map((system, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {system}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-gray-500">
                  <div>Requested by: {change.requestedBy}</div>
                  <div>Assigned to: {change.assignedTo}</div>
                </div>
                <button 
                  onClick={() => setSelectedChange(change)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredChanges.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Filter className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Changes Found</h3>
          <p className="text-gray-600">Try adjusting your filters or search query</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedChange.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-gray-600">{selectedChange.changeNumber}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedChange.priority)}`}>
                      {selectedChange.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(selectedChange.type)}`}>
                      {selectedChange.type}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedChange(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-2">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{selectedChange.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Status</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(selectedChange.status)}`}>
                    {selectedChange.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Category</h4>
                  <p className="text-gray-600">{selectedChange.category}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Planned Start</h4>
                  <p className="text-gray-600">{selectedChange.plannedStart}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Planned End</h4>
                  <p className="text-gray-600">{selectedChange.plannedEnd}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Estimated Downtime</h4>
                  <p className="text-gray-600">{selectedChange.estimatedDowntime}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Risk Level</h4>
                  <p className={getRiskColor(selectedChange.riskLevel)}>{selectedChange.riskLevel}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Affected Systems</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedChange.affectedSystems.map((system, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {system}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Business Impact</h4>
                <p className="text-gray-600">{selectedChange.businessImpact}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Backout Plan</h4>
                <p className="text-gray-600">{selectedChange.backoutPlan}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Requested By</h4>
                  <p className="text-gray-600">{selectedChange.requestedBy}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Assigned To</h4>
                  <p className="text-gray-600">{selectedChange.assignedTo}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Implementer</h4>
                  <p className="text-gray-600">{selectedChange.implementer}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Impacted Users</h4>
                  <p className="text-gray-600">{selectedChange.impactedUsers}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Approval Status</h4>
                <p className="text-gray-600">{selectedChange.approvalStatus}</p>
                {selectedChange.cabApprovalRequired && (
                  <p className="text-sm text-orange-600 mt-1">⚠ CAB Approval Required</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
