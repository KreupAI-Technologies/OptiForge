'use client'

import { useState, useEffect } from 'react'
import { SupportAgentSkillService } from '@/services/support.service'
import { Award, TrendingUp, AlertCircle, CheckCircle, Star, Users, Filter, Search, Plus, Eye, BarChart3 } from 'lucide-react'

interface SkillMatrix {
  agentId: string
  agentName: string
  team: string
  avatar: string
  skills: {
    category: string
    skillName: string
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
    yearsExperience: number
    certifications: string[]
    lastUpdated: string
  }[]
  totalSkills: number
  expertLevel: number
  certifications: number
}

interface SkillGap {
  skill: string
  category: string
  required: number
  current: number
  gap: number
  priority: 'High' | 'Medium' | 'Low'
}

export default function TeamSkills() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<SkillMatrix | null>(null)

  const seedSkillMatrix: SkillMatrix[] = [
    {
      agentId: '1',
      agentName: 'Sarah Johnson',
      team: 'Infrastructure',
      avatar: 'SJ',
      skills: [
        { category: 'Infrastructure', skillName: 'Linux Administration', level: 'Expert', yearsExperience: 8, certifications: ['RHCE', 'Linux+'], lastUpdated: '2024-09-15' },
        { category: 'Cloud', skillName: 'AWS', level: 'Advanced', yearsExperience: 5, certifications: ['AWS Solutions Architect'], lastUpdated: '2024-10-01' },
        { category: 'Infrastructure', skillName: 'VMware', level: 'Expert', yearsExperience: 7, certifications: ['VCP'], lastUpdated: '2024-08-20' },
        { category: 'Networking', skillName: 'Network Configuration', level: 'Advanced', yearsExperience: 6, certifications: [], lastUpdated: '2024-07-10' }
      ],
      totalSkills: 12,
      expertLevel: 4,
      certifications: 4
    },
    {
      agentId: '2',
      agentName: 'Michael Chen',
      team: 'Application Support',
      avatar: 'MC',
      skills: [
        { category: 'Programming', skillName: 'Java Development', level: 'Expert', yearsExperience: 10, certifications: ['Oracle Certified Professional'], lastUpdated: '2024-09-20' },
        { category: 'Database', skillName: 'SQL', level: 'Advanced', yearsExperience: 9, certifications: [], lastUpdated: '2024-08-15' },
        { category: 'Application', skillName: 'Tomcat', level: 'Advanced', yearsExperience: 8, certifications: [], lastUpdated: '2024-07-30' },
        { category: 'Database', skillName: 'Oracle Database', level: 'Expert', yearsExperience: 7, certifications: ['Oracle DBA'], lastUpdated: '2024-10-05' }
      ],
      totalSkills: 10,
      expertLevel: 3,
      certifications: 2
    },
    {
      agentId: '3',
      agentName: 'Emily Davis',
      team: 'Security',
      avatar: 'ED',
      skills: [
        { category: 'Security', skillName: 'Firewall Management', level: 'Expert', yearsExperience: 6, certifications: ['Cisco Certified'], lastUpdated: '2024-10-10' },
        { category: 'Security', skillName: 'SIEM', level: 'Advanced', yearsExperience: 5, certifications: ['Splunk Certified'], lastUpdated: '2024-09-25' },
        { category: 'Security', skillName: 'Penetration Testing', level: 'Expert', yearsExperience: 5, certifications: ['CEH'], lastUpdated: '2024-10-01' },
        { category: 'Security', skillName: 'Security Compliance', level: 'Advanced', yearsExperience: 4, certifications: ['CISSP'], lastUpdated: '2024-08-18' }
      ],
      totalSkills: 8,
      expertLevel: 5,
      certifications: 5
    },
    {
      agentId: '4',
      agentName: 'David Kumar',
      team: 'Network',
      avatar: 'DK',
      skills: [
        { category: 'Networking', skillName: 'Cisco Networking', level: 'Expert', yearsExperience: 9, certifications: ['CCNP'], lastUpdated: '2024-10-12' },
        { category: 'Networking', skillName: 'Network Security', level: 'Advanced', yearsExperience: 7, certifications: [], lastUpdated: '2024-09-28' },
        { category: 'Networking', skillName: 'VPN Configuration', level: 'Expert', yearsExperience: 8, certifications: [], lastUpdated: '2024-09-05' },
        { category: 'Networking', skillName: 'Load Balancing', level: 'Advanced', yearsExperience: 6, certifications: ['F5 Certified'], lastUpdated: '2024-08-22' }
      ],
      totalSkills: 11,
      expertLevel: 4,
      certifications: 3
    },
    {
      agentId: '5',
      agentName: 'Lisa Martinez',
      team: 'Desktop Support',
      avatar: 'LM',
      skills: [
        { category: 'End User Support', skillName: 'Windows 10/11', level: 'Advanced', yearsExperience: 3, certifications: ['Microsoft Certified'], lastUpdated: '2024-10-08' },
        { category: 'Application', skillName: 'Office 365', level: 'Advanced', yearsExperience: 3, certifications: [], lastUpdated: '2024-09-15' },
        { category: 'Infrastructure', skillName: 'Active Directory', level: 'Intermediate', yearsExperience: 2, certifications: [], lastUpdated: '2024-08-30' },
        { category: 'Hardware', skillName: 'Hardware Troubleshooting', level: 'Advanced', yearsExperience: 4, certifications: ['A+ Certification'], lastUpdated: '2024-10-02' }
      ],
      totalSkills: 7,
      expertLevel: 1,
      certifications: 2
    },
    {
      agentId: '6',
      agentName: 'Robert Brown',
      team: 'Database',
      avatar: 'RB',
      skills: [
        { category: 'Database', skillName: 'SQL Server', level: 'Expert', yearsExperience: 12, certifications: ['Microsoft Certified DBA'], lastUpdated: '2024-09-18' },
        { category: 'Database', skillName: 'PostgreSQL', level: 'Advanced', yearsExperience: 8, certifications: [], lastUpdated: '2024-08-25' },
        { category: 'Database', skillName: 'Oracle Database', level: 'Expert', yearsExperience: 10, certifications: ['Oracle DBA'], lastUpdated: '2024-10-01' },
        { category: 'Database', skillName: 'MongoDB', level: 'Intermediate', yearsExperience: 3, certifications: [], lastUpdated: '2024-07-20' }
      ],
      totalSkills: 9,
      expertLevel: 5,
      certifications: 3
    },
    {
      agentId: '7',
      agentName: 'Anna Lee',
      team: 'Application Support',
      avatar: 'AL',
      skills: [
        { category: 'Programming', skillName: 'Python', level: 'Advanced', yearsExperience: 5, certifications: ['Python Developer'], lastUpdated: '2024-10-05' },
        { category: 'Programming', skillName: '.NET', level: 'Advanced', yearsExperience: 4, certifications: [], lastUpdated: '2024-09-12' },
        { category: 'Application', skillName: 'API Development', level: 'Advanced', yearsExperience: 4, certifications: [], lastUpdated: '2024-08-28' },
        { category: 'Cloud', skillName: 'Docker', level: 'Intermediate', yearsExperience: 2, certifications: ['Docker Certified'], lastUpdated: '2024-10-10' }
      ],
      totalSkills: 8,
      expertLevel: 2,
      certifications: 2
    },
    {
      agentId: '8',
      agentName: 'Tom Wilson',
      team: 'Infrastructure',
      avatar: 'TW',
      skills: [
        { category: 'Cloud', skillName: 'Azure', level: 'Expert', yearsExperience: 6, certifications: ['Azure Administrator'], lastUpdated: '2024-10-08' },
        { category: 'Infrastructure', skillName: 'PowerShell', level: 'Advanced', yearsExperience: 7, certifications: [], lastUpdated: '2024-09-22' },
        { category: 'Infrastructure', skillName: 'Windows Server', level: 'Expert', yearsExperience: 9, certifications: ['MCSA'], lastUpdated: '2024-09-05' },
        { category: 'Infrastructure', skillName: 'Backup Solutions', level: 'Advanced', yearsExperience: 5, certifications: [], lastUpdated: '2024-08-15' }
      ],
      totalSkills: 10,
      expertLevel: 3,
      certifications: 2
    }
  ]

  const [skillMatrix, setSkillMatrix] = useState<SkillMatrix[]>(seedSkillMatrix)

  useEffect(() => {
    let cancelled = false
    SupportAgentSkillService.getSkills()
      .then((rows) => {
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setSkillMatrix(rows as unknown as SkillMatrix[])
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const skillGaps: SkillGap[] = [
    { skill: 'Kubernetes', category: 'Cloud', required: 3, current: 1, gap: 2, priority: 'High' },
    { skill: 'Azure DevOps', category: 'Cloud', required: 4, current: 2, gap: 2, priority: 'High' },
    { skill: 'Python', category: 'Programming', required: 5, current: 3, gap: 2, priority: 'Medium' },
    { skill: 'Machine Learning', category: 'AI/ML', required: 2, current: 0, gap: 2, priority: 'Medium' },
    { skill: 'Terraform', category: 'Infrastructure', required: 3, current: 1, gap: 2, priority: 'High' },
    { skill: 'React', category: 'Frontend', required: 3, current: 1, gap: 2, priority: 'Low' }
  ]

  const categories = ['All', 'Infrastructure', 'Cloud', 'Networking', 'Security', 'Database', 'Programming', 'Application', 'End User Support', 'Hardware']

  const stats = {
    totalSkills: skillMatrix.reduce((sum, agent) => sum + agent.totalSkills, 0),
    expertLevel: skillMatrix.reduce((sum, agent) => sum + agent.expertLevel, 0),
    totalCertifications: skillMatrix.reduce((sum, agent) => sum + agent.certifications, 0),
    avgSkillsPerAgent: (skillMatrix.reduce((sum, agent) => sum + agent.totalSkills, 0) / skillMatrix.length).toFixed(1),
    criticalGaps: skillGaps.filter(g => g.priority === 'High').length
  }

  const filteredAgents = skillMatrix.filter(agent => {
    const matchesSearch = searchTerm === '' ||
      agent.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.skills.some(s => s.skillName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'All' ||
      agent.skills.some(s => s.category === selectedCategory)
    
    return matchesSearch && matchesCategory
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-purple-100 text-purple-700'
      case 'Advanced': return 'bg-blue-100 text-blue-700'
      case 'Intermediate': return 'bg-green-100 text-green-700'
      case 'Beginner': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700'
      case 'Medium': return 'bg-yellow-100 text-yellow-700'
      case 'Low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Skills Matrix</h1>
          <p className="text-gray-600 mt-1">Manage team member skills and identify training needs</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Skill
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Skills</p>
              <p className="text-2xl font-bold mt-1">{stats.totalSkills}</p>
            </div>
            <Award className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expert Level</p>
              <p className="text-2xl font-bold mt-1">{stats.expertLevel}</p>
            </div>
            <Star className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certifications</p>
              <p className="text-2xl font-bold mt-1">{stats.totalCertifications}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg per Agent</p>
              <p className="text-2xl font-bold mt-1">{stats.avgSkillsPerAgent}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Gaps</p>
              <p className="text-2xl font-bold mt-1">{stats.criticalGaps}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Skill Gaps */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          Skill Gaps Analysis
        </h2>
        <div className="space-y-3">
          {skillGaps.map((gap, idx) => (
            <div key={idx} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{gap.skill}</span>
                  <span className="text-sm text-gray-500">{gap.category}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(gap.priority)}`}>
                    {gap.priority} Priority
                  </span>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  Plan Training
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Current: {gap.current} agents</span>
                    <span className="text-gray-600">Required: {gap.required} agents</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${gap.priority === 'High' ? 'bg-red-600' : gap.priority === 'Medium' ? 'bg-yellow-600' : 'bg-green-600'}`}
                      style={{ width: `${(gap.current / gap.required) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Gap</p>
                  <p className="text-xl font-bold text-red-600">{gap.gap}</p>
                </div>
              </div>
            </div>
          ))}
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
                placeholder="Search by agent name, team, or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">Agent</th>
                <th className="text-left p-3 font-medium text-gray-600">Team</th>
                <th className="text-left p-3 font-medium text-gray-600">Skills</th>
                <th className="text-left p-3 font-medium text-gray-600">Expert Level</th>
                <th className="text-left p-3 font-medium text-gray-600">Certifications</th>
                <th className="text-left p-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAgents.map((agent) => (
                <tr key={agent.agentId} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {agent.avatar}
                      </div>
                      <span className="font-medium">{agent.agentName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{agent.team}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {agent.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getLevelColor(skill.level)}`}
                          title={skill.skillName}
                        >
                          {skill.skillName}
                        </span>
                      ))}
                      {agent.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          +{agent.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{agent.expertLevel}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">{agent.certifications}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedAgent(agent)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Skills Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    {selectedAgent.avatar}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedAgent.agentName}</h2>
                    <p className="text-gray-600">{selectedAgent.team}</p>
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
              {/* Summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="border rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600">Total Skills</p>
                  <p className="text-3xl font-bold mt-1">{selectedAgent.totalSkills}</p>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600">Expert Level</p>
                  <p className="text-3xl font-bold mt-1">{selectedAgent.expertLevel}</p>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600">Certifications</p>
                  <p className="text-3xl font-bold mt-1">{selectedAgent.certifications}</p>
                </div>
              </div>

              {/* Skills by Category */}
              <div>
                <h3 className="font-semibold mb-2">Skills Breakdown</h3>
                <div className="space-y-2">
                  {selectedAgent.skills.map((skill, idx) => (
                    <div key={idx} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{skill.skillName}</h4>
                          <p className="text-sm text-gray-600">{skill.category}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(skill.level)}`}>
                          {skill.level}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Experience</p>
                          <p className="font-medium">{skill.yearsExperience} years</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Certifications</p>
                          <p className="font-medium">{skill.certifications.length > 0 ? skill.certifications.join(', ') : 'None'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Updated</p>
                          <p className="font-medium">{new Date(skill.lastUpdated).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Update Skills
                </button>
                <button className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Plan Training
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
