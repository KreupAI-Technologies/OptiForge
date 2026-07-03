'use client'

import { useState, useEffect } from 'react'
import { Users, Star, TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle, Mail, Phone, MapPin, Calendar, Award, Filter, Search, Plus, Edit, Eye, BarChart3 } from 'lucide-react'
import { SupportAgentService } from '@/services/support.service'

interface Agent {
  id: string
  name: string
  email: string
  phone: string
  role: string
  team: string
  status: 'Available' | 'Busy' | 'Away' | 'Offline'
  avatar: string
  joinDate: string
  location: string
  shift: string
  activeTickets: number
  resolvedToday: number
  resolvedThisMonth: number
  avgResolutionTime: string
  satisfaction: number
  responseTime: string
  slaCompliance: number
  skills: string[]
  specializations: string[]
  certifications: string[]
  performance: {
    thisMonth: number
    lastMonth: number
    trend: 'up' | 'down' | 'stable'
  }
}

export default function TeamAgents() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState('')

  const seedAgents: Agent[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      role: 'Team Lead',
      team: 'Infrastructure',
      status: 'Available',
      avatar: 'SJ',
      joinDate: '2022-01-15',
      location: 'New York, USA',
      shift: '9:00 AM - 6:00 PM EST',
      activeTickets: 8,
      resolvedToday: 6,
      resolvedThisMonth: 127,
      avgResolutionTime: '2.4h',
      satisfaction: 4.9,
      responseTime: '8 min',
      slaCompliance: 98.5,
      skills: ['Linux', 'Networking', 'VMware', 'AWS'],
      specializations: ['Infrastructure', 'Cloud Services'],
      certifications: ['AWS Solutions Architect', 'ITIL Foundation', 'Linux Professional'],
      performance: { thisMonth: 127, lastMonth: 115, trend: 'up' }
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      phone: '+1 (555) 234-5678',
      role: 'Senior Engineer',
      team: 'Application Support',
      status: 'Busy',
      avatar: 'MC',
      joinDate: '2021-06-20',
      location: 'San Francisco, USA',
      shift: '8:00 AM - 5:00 PM PST',
      activeTickets: 12,
      resolvedToday: 4,
      resolvedThisMonth: 98,
      avgResolutionTime: '3.1h',
      satisfaction: 4.7,
      responseTime: '12 min',
      slaCompliance: 95.2,
      skills: ['Java', 'SQL', 'Tomcat', 'Oracle'],
      specializations: ['Application Development', 'Database'],
      certifications: ['Oracle Certified Professional', 'Java Developer'],
      performance: { thisMonth: 98, lastMonth: 102, trend: 'down' }
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      phone: '+1 (555) 345-6789',
      role: 'Security Specialist',
      team: 'Security',
      status: 'Available',
      avatar: 'ED',
      joinDate: '2020-09-10',
      location: 'Austin, USA',
      shift: '10:00 AM - 7:00 PM CST',
      activeTickets: 5,
      resolvedToday: 3,
      resolvedThisMonth: 82,
      avgResolutionTime: '1.8h',
      satisfaction: 5.0,
      responseTime: '5 min',
      slaCompliance: 99.8,
      skills: ['Firewall', 'SIEM', 'Penetration Testing', 'Encryption'],
      specializations: ['Security', 'Compliance'],
      certifications: ['CISSP', 'CEH', 'Security+'],
      performance: { thisMonth: 82, lastMonth: 78, trend: 'up' }
    },
    {
      id: '4',
      name: 'David Kumar',
      email: 'david.kumar@company.com',
      phone: '+1 (555) 456-7890',
      role: 'Network Engineer',
      team: 'Network',
      status: 'Available',
      avatar: 'DK',
      joinDate: '2021-03-25',
      location: 'Chicago, USA',
      shift: '7:00 AM - 4:00 PM CST',
      activeTickets: 10,
      resolvedToday: 8,
      resolvedThisMonth: 145,
      avgResolutionTime: '1.5h',
      satisfaction: 4.8,
      responseTime: '7 min',
      slaCompliance: 97.3,
      skills: ['Cisco', 'Network Security', 'VPN', 'Load Balancing'],
      specializations: ['Network', 'Infrastructure'],
      certifications: ['CCNP', 'Network+', 'ITIL'],
      performance: { thisMonth: 145, lastMonth: 140, trend: 'up' }
    },
    {
      id: '5',
      name: 'Lisa Martinez',
      email: 'lisa.martinez@company.com',
      phone: '+1 (555) 567-8901',
      role: 'Support Engineer',
      team: 'Desktop Support',
      status: 'Away',
      avatar: 'LM',
      joinDate: '2023-02-14',
      location: 'Miami, USA',
      shift: '9:00 AM - 6:00 PM EST',
      activeTickets: 15,
      resolvedToday: 5,
      resolvedThisMonth: 112,
      avgResolutionTime: '2.8h',
      satisfaction: 4.6,
      responseTime: '15 min',
      slaCompliance: 93.1,
      skills: ['Windows', 'Office 365', 'Active Directory', 'Hardware'],
      specializations: ['End User Support', 'Hardware'],
      certifications: ['Microsoft Certified', 'A+ Certification'],
      performance: { thisMonth: 112, lastMonth: 108, trend: 'up' }
    },
    {
      id: '6',
      name: 'Robert Brown',
      email: 'robert.brown@company.com',
      phone: '+1 (555) 678-9012',
      role: 'Database Administrator',
      team: 'Database',
      status: 'Offline',
      avatar: 'RB',
      joinDate: '2019-11-30',
      location: 'Seattle, USA',
      shift: '11:00 AM - 8:00 PM PST',
      activeTickets: 0,
      resolvedToday: 0,
      resolvedThisMonth: 56,
      avgResolutionTime: '4.2h',
      satisfaction: 4.9,
      responseTime: '10 min',
      slaCompliance: 96.8,
      skills: ['SQL Server', 'PostgreSQL', 'Oracle', 'MongoDB'],
      specializations: ['Database', 'Performance Tuning'],
      certifications: ['Microsoft Certified DBA', 'Oracle DBA'],
      performance: { thisMonth: 56, lastMonth: 58, trend: 'stable' }
    },
    {
      id: '7',
      name: 'Anna Lee',
      email: 'anna.lee@company.com',
      phone: '+1 (555) 789-0123',
      role: 'Support Engineer',
      team: 'Application Support',
      status: 'Busy',
      avatar: 'AL',
      joinDate: '2022-08-05',
      location: 'Boston, USA',
      shift: '8:00 AM - 5:00 PM EST',
      activeTickets: 11,
      resolvedToday: 7,
      resolvedThisMonth: 134,
      avgResolutionTime: '2.2h',
      satisfaction: 4.8,
      responseTime: '9 min',
      slaCompliance: 97.8,
      skills: ['Python', '.NET', 'API', 'Docker'],
      specializations: ['Application', 'DevOps'],
      certifications: ['Python Developer', 'Docker Certified'],
      performance: { thisMonth: 134, lastMonth: 125, trend: 'up' }
    },
    {
      id: '8',
      name: 'Tom Wilson',
      email: 'tom.wilson@company.com',
      phone: '+1 (555) 890-1234',
      role: 'Senior Engineer',
      team: 'Infrastructure',
      status: 'Available',
      avatar: 'TW',
      joinDate: '2020-04-12',
      location: 'Denver, USA',
      shift: '9:00 AM - 6:00 PM MST',
      activeTickets: 7,
      resolvedToday: 5,
      resolvedThisMonth: 119,
      avgResolutionTime: '2.6h',
      satisfaction: 4.7,
      responseTime: '11 min',
      slaCompliance: 96.2,
      skills: ['Azure', 'PowerShell', 'Windows Server', 'Backup'],
      specializations: ['Infrastructure', 'Cloud'],
      certifications: ['Azure Administrator', 'MCSA'],
      performance: { thisMonth: 119, lastMonth: 115, trend: 'up' }
    }
  ]

  const [agents, setAgents] = useState<Agent[]>(seedAgents)

  useEffect(() => {
    let cancelled = false
    SupportAgentService.getAgents()
      .then((rows) => {
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setAgents(rows as unknown as Agent[])
        }
      })
      .catch(() => { /* keep seed data on error */ })
    return () => { cancelled = true }
  }, [])

  const stats = {
    totalAgents: agents.length,
    available: agents.filter(a => a.status === 'Available').length,
    busy: agents.filter(a => a.status === 'Busy').length,
    avgSatisfaction: agents.length ? (agents.reduce((sum, a) => sum + a.satisfaction, 0) / agents.length).toFixed(1) : '0.0',
    avgSLACompliance: agents.length ? (agents.reduce((sum, a) => sum + a.slaCompliance, 0) / agents.length).toFixed(1) : '0.0',
    totalActiveTickets: agents.reduce((sum, a) => sum + a.activeTickets, 0)
  }

  const filteredAgents = agents.filter(agent => {
    const matchesTeam = selectedTeam === 'All' || agent.team === selectedTeam
    const matchesStatus = selectedStatus === 'All' || agent.status === selectedStatus
    const matchesSearch = searchTerm === '' ||
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTeam && matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700'
      case 'Busy': return 'bg-red-100 text-red-700'
      case 'Away': return 'bg-yellow-100 text-yellow-700'
      case 'Offline': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Agents</h1>
          <p className="text-gray-600 mt-1">Manage and monitor support team members</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Agent
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-6 gap-2">
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold mt-1">{stats.totalAgents}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold mt-1">{stats.available}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Busy</p>
              <p className="text-2xl font-bold mt-1">{stats.busy}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Tickets</p>
              <p className="text-2xl font-bold mt-1">{stats.totalActiveTickets}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Satisfaction</p>
              <p className="text-2xl font-bold mt-1">{stats.avgSatisfaction}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">SLA Compliance</p>
              <p className="text-2xl font-bold mt-1">{stats.avgSLACompliance}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Teams</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Application Support">Application Support</option>
            <option value="Security">Security</option>
            <option value="Network">Network</option>
            <option value="Desktop Support">Desktop Support</option>
            <option value="Database">Database</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="Away">Away</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-2 gap-2">
        {filteredAgents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-lg shadow-sm border p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {agent.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  <p className="text-sm text-gray-600">{agent.role}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                    <span className="text-xs text-gray-500">{agent.team}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(agent)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-2 pb-4 border-b">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{agent.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{agent.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{agent.location}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-600">Active</p>
                <p className="text-xl font-bold">{agent.activeTickets}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Resolved Today</p>
                <p className="text-xl font-bold">{agent.resolvedToday}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">This Month</p>
                <p className="text-xl font-bold">{agent.resolvedThisMonth}</p>
              </div>
            </div>

            {/* Performance */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-gray-600">CSAT</p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{agent.satisfaction}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600">Avg Time</p>
                <p className="font-medium">{agent.avgResolutionTime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">SLA</p>
                <div className="flex items-center gap-1">
                  <span className={`font-medium ${agent.slaCompliance >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {agent.slaCompliance}%
                  </span>
                  {agent.performance.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : agent.performance.trend === 'down' ? (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-600 mb-2">Top Skills</p>
              <div className="flex flex-wrap gap-1">
                {agent.skills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                    {skill}
                  </span>
                ))}
                {agent.skills.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    +{agent.skills.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedAgent.avatar}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
                    <p className="text-gray-600">{selectedAgent.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedAgent.status)}`}>
                        {selectedAgent.status}
                      </span>
                      <span className="text-sm text-gray-500">{selectedAgent.team}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {/* Contact & Work Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <h3 className="font-semibold">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedAgent.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedAgent.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{selectedAgent.location}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Work Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Joined: {new Date(selectedAgent.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Shift: {selectedAgent.shift}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Team: {selectedAgent.team}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="font-semibold mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-600">Active Tickets</p>
                    <p className="text-2xl font-bold mt-1">{selectedAgent.activeTickets}</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-600">Resolved This Month</p>
                    <p className="text-2xl font-bold mt-1">{selectedAgent.resolvedThisMonth}</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-600">Avg Resolution</p>
                    <p className="text-2xl font-bold mt-1">{selectedAgent.avgResolutionTime}</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="text-2xl font-bold mt-1">{selectedAgent.responseTime}</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-600">CSAT Score</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold">{selectedAgent.satisfaction}</span>
                    </div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-600">SLA Compliance</p>
                    <p className={`text-2xl font-bold mt-1 ${selectedAgent.slaCompliance >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedAgent.slaCompliance}%
                    </p>
                  </div>
                  <div className="border rounded-lg p-3 col-span-2">
                    <p className="text-sm text-gray-600">Month over Month</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold">{selectedAgent.performance.thisMonth}</span>
                      <span className="text-sm text-gray-500">vs {selectedAgent.performance.lastMonth}</span>
                      {selectedAgent.performance.trend === 'up' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : selectedAgent.performance.trend === 'down' ? (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills & Expertise */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h3 className="font-semibold mb-3">Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.specializations.map((spec, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Certifications
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {selectedAgent.certifications.map((cert, idx) => (
                    <div key={idx} className="border rounded-lg p-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
                <button className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Performance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
