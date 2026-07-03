'use client'

import { useState, useEffect } from 'react'
import { SupportAssignmentRuleService } from '@/services/support.service'
import { Save, Plus, Trash2, Users, Target, BarChart3, Settings, TrendingUp, AlertCircle } from 'lucide-react'

interface AssignmentRule {
  id: string
  name: string
  description: string
  priority: number
  conditions: {
    field: string
    operator: string
    value: string
  }[]
  assignmentLogic: 'Round Robin' | 'Load Balancing' | 'Skill-based' | 'Availability' | 'Manual'
  assignTo: string
  active: boolean
  matchedTickets: number
  avgAssignmentTime: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  currentWorkload: number
  maxCapacity: number
  skills: string[]
  availability: 'Available' | 'Busy' | 'Offline'
  avgResponseTime: string
}

export default function AutoAssignment() {
  const [activeTab, setActiveTab] = useState<'rules' | 'team' | 'settings'>('rules')

  const seedAssignmentRules: AssignmentRule[] = [
    {
      id: '1',
      name: 'Critical Infrastructure Tickets',
      description: 'Auto-assign P0 infrastructure tickets to on-call engineer',
      priority: 1,
      conditions: [
        { field: 'Priority', operator: 'equals', value: 'P0' },
        { field: 'Category', operator: 'equals', value: 'Infrastructure' }
      ],
      assignmentLogic: 'Availability',
      assignTo: 'On-Call Rotation',
      active: true,
      matchedTickets: 145,
      avgAssignmentTime: '< 1 min'
    },
    {
      id: '2',
      name: 'Network Issues - Skill Based',
      description: 'Assign network tickets to team members with network skills',
      priority: 2,
      conditions: [
        { field: 'Category', operator: 'equals', value: 'Network' }
      ],
      assignmentLogic: 'Skill-based',
      assignTo: 'Network Team',
      active: true,
      matchedTickets: 234,
      avgAssignmentTime: '2 min'
    },
    {
      id: '3',
      name: 'General Support - Round Robin',
      description: 'Distribute general support tickets evenly across L1 team',
      priority: 5,
      conditions: [
        { field: 'Category', operator: 'equals', value: 'General Support' },
        { field: 'Priority', operator: 'in', value: 'P2, P3' }
      ],
      assignmentLogic: 'Round Robin',
      assignTo: 'L1 Support Team',
      active: true,
      matchedTickets: 892,
      avgAssignmentTime: '1 min'
    },
    {
      id: '4',
      name: 'Application Tickets - Load Balancing',
      description: 'Assign application tickets based on current workload',
      priority: 3,
      conditions: [
        { field: 'Category', operator: 'equals', value: 'Application' }
      ],
      assignmentLogic: 'Load Balancing',
      assignTo: 'Application Support Team',
      active: true,
      matchedTickets: 456,
      avgAssignmentTime: '1.5 min'
    },
    {
      id: '5',
      name: 'Security Incidents',
      description: 'Route all security incidents to security team',
      priority: 1,
      conditions: [
        { field: 'Category', operator: 'equals', value: 'Security' },
        { field: 'Keywords', operator: 'contains', value: 'breach, malware, phishing' }
      ],
      assignmentLogic: 'Skill-based',
      assignTo: 'Security Team',
      active: true,
      matchedTickets: 23,
      avgAssignmentTime: '< 1 min'
    },
    {
      id: '6',
      name: 'VIP Customer Tickets',
      description: 'Assign VIP customer tickets to senior agents',
      priority: 2,
      conditions: [
        { field: 'Customer Type', operator: 'equals', value: 'VIP' }
      ],
      assignmentLogic: 'Skill-based',
      assignTo: 'Senior Support Team',
      active: true,
      matchedTickets: 178,
      avgAssignmentTime: '1 min'
    },
    {
      id: '7',
      name: 'Database Issues',
      description: 'Route database tickets to DBA team',
      priority: 2,
      conditions: [
        { field: 'Category', operator: 'equals', value: 'Database' }
      ],
      assignmentLogic: 'Availability',
      assignTo: 'DBA Team',
      active: true,
      matchedTickets: 87,
      avgAssignmentTime: '2 min'
    },
    {
      id: '8',
      name: 'Desktop Support Requests',
      description: 'Distribute desktop support evenly',
      priority: 6,
      conditions: [
        { field: 'Category', operator: 'equals', value: 'Desktop Support' }
      ],
      assignmentLogic: 'Round Robin',
      assignTo: 'Desktop Support Team',
      active: true,
      matchedTickets: 534,
      avgAssignmentTime: '3 min'
    }
  ]

  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule[]>(seedAssignmentRules)

  useEffect(() => {
    let cancelled = false
    SupportAssignmentRuleService.getRules()
      .then((rows) => {
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setAssignmentRules(rows as unknown as AssignmentRule[])
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Amit Patel',
      role: 'Senior Infrastructure Engineer',
      currentWorkload: 8,
      maxCapacity: 15,
      skills: ['Infrastructure', 'Database', 'Cloud'],
      availability: 'Available',
      avgResponseTime: '12 min'
    },
    {
      id: '2',
      name: 'Priya Sharma',
      role: 'Application Support Specialist',
      currentWorkload: 12,
      maxCapacity: 15,
      skills: ['Application', 'API', 'Integration'],
      availability: 'Busy',
      avgResponseTime: '18 min'
    },
    {
      id: '3',
      name: 'Rahul Verma',
      role: 'Network Engineer',
      currentWorkload: 6,
      maxCapacity: 12,
      skills: ['Network', 'Security', 'Firewall'],
      availability: 'Available',
      avgResponseTime: '15 min'
    },
    {
      id: '4',
      name: 'Rajesh Kumar',
      role: 'Security Analyst',
      currentWorkload: 4,
      maxCapacity: 10,
      skills: ['Security', 'Compliance', 'Forensics'],
      availability: 'Available',
      avgResponseTime: '10 min'
    },
    {
      id: '5',
      name: 'Sneha Reddy',
      role: 'Database Administrator',
      currentWorkload: 7,
      maxCapacity: 12,
      skills: ['Database', 'SQL', 'Performance'],
      availability: 'Available',
      avgResponseTime: '14 min'
    },
    {
      id: '6',
      name: 'Vikram Singh',
      role: 'Desktop Support',
      currentWorkload: 15,
      maxCapacity: 20,
      skills: ['Desktop', 'Hardware', 'Software'],
      availability: 'Busy',
      avgResponseTime: '25 min'
    }
  ]

  const stats = [
    {
      label: 'Active Rules',
      value: assignmentRules.filter(r => r.active).length,
      change: `${assignmentRules.length} total`,
      icon: Target,
      color: 'blue'
    },
    {
      label: 'Auto-Assigned Today',
      value: '234',
      change: '+12% vs yesterday',
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'Avg Assignment Time',
      value: '1.5 min',
      change: 'Target: < 2 min',
      icon: BarChart3,
      color: 'purple'
    },
    {
      label: 'Success Rate',
      value: '98.7%',
      change: 'Last 30 days',
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'Team Members',
      value: teamMembers.length,
      change: `${teamMembers.filter(t => t.availability === 'Available').length} available`,
      icon: Users,
      color: 'orange'
    },
    {
      label: 'Unassigned',
      value: '3',
      change: 'Awaiting manual assignment',
      icon: AlertCircle,
      color: 'red'
    }
  ]

  const getLogicColor = (logic: string) => {
    const colors: Record<string, string> = {
      'Round Robin': 'bg-blue-100 text-blue-700',
      'Load Balancing': 'bg-green-100 text-green-700',
      'Skill-based': 'bg-purple-100 text-purple-700',
      'Availability': 'bg-orange-100 text-orange-700',
      'Manual': 'bg-gray-100 text-gray-700'
    }
    return colors[logic] || 'bg-gray-100 text-gray-700'
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-700'
      case 'Busy': return 'bg-yellow-100 text-yellow-700'
      case 'Offline': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auto-Assignment Rules</h1>
          <p className="text-gray-600 mt-1">Configure intelligent ticket assignment automation</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Rule
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            purple: 'bg-purple-500',
            orange: 'bg-orange-500',
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

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'rules'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Assignment Rules
              </div>
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'team'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Workload
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </div>
            </button>
          </nav>
        </div>

        {/* Assignment Rules Tab */}
        {activeTab === 'rules' && (
          <div className="p-6 space-y-2">
            {assignmentRules.map((rule) => (
              <div key={rule.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        Priority {rule.priority}
                      </span>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${getLogicColor(rule.assignmentLogic)}`}>
                        {rule.assignmentLogic}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rule.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{rule.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-700 mb-1">CONDITIONS:</div>
                      <div className="flex flex-wrap gap-2">
                        {rule.conditions.map((cond, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
                            {cond.field} {cond.operator} <strong>{cond.value}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-200 rounded-lg text-sm">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Settings</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 hover:bg-gray-200 rounded-lg text-sm">
                      <Trash2 className="h-4 w-4 text-red-600" />
                      <span className="text-red-700">Delete</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-300">
                  <div className="flex gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Assign To:</span>
                      <span className="ml-1 font-medium text-gray-900">{rule.assignTo}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Matched:</span>
                      <span className="ml-1 font-semibold text-blue-600">{rule.matchedTickets} tickets</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Time:</span>
                      <span className="ml-1 font-medium text-green-600">{rule.avgAssignmentTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Team Workload Tab */}
        {activeTab === 'team' && (
          <div className="p-6">
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(member.availability)}`}>
                      {member.availability}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Current Workload</div>
                      <div className="text-lg font-semibold text-gray-900">{member.currentWorkload}/{member.maxCapacity}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Capacity</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {((member.currentWorkload / member.maxCapacity) * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Avg Response</div>
                      <div className="text-lg font-semibold text-gray-900">{member.avgResponseTime}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Skills</div>
                      <div className="text-sm text-gray-900">{member.skills.length} skills</div>
                    </div>
                  </div>

                  {/* Workload Bar */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (member.currentWorkload / member.maxCapacity) >= 0.9 ? 'bg-red-500' :
                          (member.currentWorkload / member.maxCapacity) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(member.currentWorkload / member.maxCapacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="p-6 space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Assignment Settings</h2>
              <p className="text-sm text-gray-600">Configure global auto-assignment behavior</p>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">General Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Enable auto-assignment</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Re-assign on agent unavailability</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Notify agent on assignment</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Allow manual override</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Capacity Management</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Max tickets per agent</label>
                    <input type="number" defaultValue="15" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Load balancing threshold</label>
                    <input type="number" defaultValue="80" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    <span className="text-xs text-gray-500">Percentage of capacity before redistributing</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
