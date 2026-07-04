'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  TrendingUp,
  DollarSign,
  Target,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Star,
  Award,
  BarChart3,
  Settings,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Crown,
  Zap,
  Activity,
  MapPin
} from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'sales_rep' | 'sales_manager' | 'team_lead' | 'director' | 'vp_sales' | 'account_executive' | 'sdr';
  team: string;
  department: string;
  status: 'active' | 'inactive' | 'on_leave';
  location: string;
  timezone: string;
  hireDate: string;
  performance: {
    dealsWon: number;
    revenue: number;
    quota: number;
    quotaAttainment: number;
    activePipeline: number;
    pipelineValue: number;
    winRate: number;
    avgDealSize: number;
    salesCycle: number;
  };
  activities: {
    calls: number;
    emails: number;
    meetings: number;
    tasks: number;
  };
  metrics: {
    leadConversion: number;
    customerSatisfaction: number;
    responseTime: number; // hours
  };
  manager: string;
  directReports?: number;
  specializations: string[];
  certifications: string[];
  isTopPerformer: boolean;
  rank?: number;
}

interface Team {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'account_management' | 'customer_success' | 'business_development' | 'sales_ops';
  manager: string;
  members: number;
  status: 'active' | 'inactive';
  performance: {
    totalRevenue: number;
    totalQuota: number;
    quotaAttainment: number;
    activeDeals: number;
    wonDeals: number;
    avgWinRate: number;
  };
  territories: string[];
  createdAt: string;
}

export default function TeamsPage() {
  const [view, setView] = useState<'teams' | 'members'>('teams');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await crmService.salesTeams.getAll()) as any[];
        const mapped: Team[] = (Array.isArray(raw) ? raw : []).map((t: any) => ({
          id: String(t.id ?? ''),
          name: t.name ?? t.teamName ?? '',
          description: t.description ?? '',
          type: (t.type ?? 'sales') as Team['type'],
          manager: t.manager ?? t.managerName ?? '',
          members: Number(t.members ?? t.memberCount ?? 0),
          status: (t.status ?? 'active') as Team['status'],
          performance: {
            totalRevenue: Number(t.performance?.totalRevenue ?? t.totalRevenue ?? 0),
            totalQuota: Number(t.performance?.totalQuota ?? t.totalQuota ?? 0),
            quotaAttainment: Number(t.performance?.quotaAttainment ?? t.quotaAttainment ?? 0),
            activeDeals: Number(t.performance?.activeDeals ?? t.activeDeals ?? 0),
            wonDeals: Number(t.performance?.wonDeals ?? t.wonDeals ?? 0),
            avgWinRate: Number(t.performance?.avgWinRate ?? t.avgWinRate ?? 0),
          },
          territories: Array.isArray(t.territories) ? t.territories.map((x: any) => String(x)) : [],
          createdAt: t.createdAt ?? '',
        }));
        if (!cancelled) setTeams(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load teams');
          setTeams([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const teamsSeed: Team[] = [
    {
      id: 'TEAM-001',
      name: 'Enterprise Sales',
      description: 'Enterprise account executives handling large-scale deals',
      type: 'sales',
      manager: 'Sarah Johnson',
      members: 12,
      status: 'active',
      performance: {
        totalRevenue: 18500000,
        totalQuota: 20000000,
        quotaAttainment: 92.5,
        activeDeals: 47,
        wonDeals: 89,
        avgWinRate: 72
      },
      territories: ['North America East', 'North America West'],
      createdAt: '2024-01-15'
    },
    {
      id: 'TEAM-002',
      name: 'Mid-Market Sales',
      description: 'Sales team focused on mid-market opportunities',
      type: 'sales',
      manager: 'Michael Chen',
      members: 15,
      status: 'active',
      performance: {
        totalRevenue: 12300000,
        totalQuota: 14000000,
        quotaAttainment: 87.9,
        activeDeals: 68,
        wonDeals: 142,
        avgWinRate: 65
      },
      territories: ['North America', 'EMEA'],
      createdAt: '2024-01-15'
    },
    {
      id: 'TEAM-003',
      name: 'Customer Success',
      description: 'Customer success managers ensuring customer satisfaction and retention',
      type: 'customer_success',
      manager: 'Emily Rodriguez',
      members: 10,
      status: 'active',
      performance: {
        totalRevenue: 8900000,
        totalQuota: 8500000,
        quotaAttainment: 104.7,
        activeDeals: 34,
        wonDeals: 67,
        avgWinRate: 88
      },
      territories: ['Global'],
      createdAt: '2024-02-10'
    },
    {
      id: 'TEAM-004',
      name: 'Sales Development',
      description: 'SDR team focused on lead generation and qualification',
      type: 'business_development',
      manager: 'David Park',
      members: 18,
      status: 'active',
      performance: {
        totalRevenue: 3200000,
        totalQuota: 4000000,
        quotaAttainment: 80.0,
        activeDeals: 156,
        wonDeals: 234,
        avgWinRate: 45
      },
      territories: ['North America', 'EMEA', 'APAC'],
      createdAt: '2024-01-20'
    },
    {
      id: 'TEAM-005',
      name: 'Account Management',
      description: 'Account managers handling existing customer relationships',
      type: 'account_management',
      manager: 'Jennifer Martinez',
      members: 8,
      status: 'active',
      performance: {
        totalRevenue: 15600000,
        totalQuota: 15000000,
        quotaAttainment: 104.0,
        activeDeals: 29,
        wonDeals: 78,
        avgWinRate: 82
      },
      territories: ['Enterprise Accounts'],
      createdAt: '2024-03-01'
    }
  ];

  const members: TeamMember[] = [
    {
      id: 'MEM-001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      avatar: 'SJ',
      role: 'director',
      team: 'Enterprise Sales',
      department: 'Sales',
      status: 'active',
      location: 'New York, NY',
      timezone: 'EST',
      hireDate: '2022-03-15',
      performance: {
        dealsWon: 24,
        revenue: 3450000,
        quota: 3000000,
        quotaAttainment: 115.0,
        activePipeline: 12,
        pipelineValue: 2100000,
        winRate: 75,
        avgDealSize: 143750,
        salesCycle: 45
      },
      activities: {
        calls: 234,
        emails: 567,
        meetings: 89,
        tasks: 156
      },
      metrics: {
        leadConversion: 68,
        customerSatisfaction: 4.8,
        responseTime: 2.5
      },
      manager: 'VP Sales',
      directReports: 12,
      specializations: ['Enterprise Software', 'Cloud Solutions', 'Digital Transformation'],
      certifications: ['Salesforce Certified', 'AWS Partner'],
      isTopPerformer: true,
      rank: 1
    },
    {
      id: 'MEM-002',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      phone: '+1 (555) 234-5678',
      avatar: 'MC',
      role: 'sales_manager',
      team: 'Mid-Market Sales',
      department: 'Sales',
      status: 'active',
      location: 'San Francisco, CA',
      timezone: 'PST',
      hireDate: '2022-05-20',
      performance: {
        dealsWon: 32,
        revenue: 2890000,
        quota: 2500000,
        quotaAttainment: 115.6,
        activePipeline: 18,
        pipelineValue: 1650000,
        winRate: 72,
        avgDealSize: 90312,
        salesCycle: 38
      },
      activities: {
        calls: 298,
        emails: 645,
        meetings: 102,
        tasks: 178
      },
      metrics: {
        leadConversion: 65,
        customerSatisfaction: 4.7,
        responseTime: 3.0
      },
      manager: 'Sarah Johnson',
      directReports: 15,
      specializations: ['SaaS Solutions', 'Mid-Market', 'Account Growth'],
      certifications: ['HubSpot Certified', 'Google Analytics'],
      isTopPerformer: true,
      rank: 2
    },
    {
      id: 'MEM-003',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@company.com',
      phone: '+1 (555) 345-6789',
      avatar: 'ER',
      role: 'team_lead',
      team: 'Customer Success',
      department: 'Customer Success',
      status: 'active',
      location: 'Austin, TX',
      timezone: 'CST',
      hireDate: '2023-01-10',
      performance: {
        dealsWon: 18,
        revenue: 2150000,
        quota: 2000000,
        quotaAttainment: 107.5,
        activePipeline: 8,
        pipelineValue: 980000,
        winRate: 85,
        avgDealSize: 119444,
        salesCycle: 28
      },
      activities: {
        calls: 412,
        emails: 823,
        meetings: 156,
        tasks: 234
      },
      metrics: {
        leadConversion: 72,
        customerSatisfaction: 4.9,
        responseTime: 1.5
      },
      manager: 'Sarah Johnson',
      directReports: 10,
      specializations: ['Customer Retention', 'Upsell/Cross-sell', 'Customer Experience'],
      certifications: ['CSM Certified', 'NPS Practitioner'],
      isTopPerformer: true,
      rank: 3
    },
    {
      id: 'MEM-004',
      name: 'David Park',
      email: 'david.park@company.com',
      phone: '+1 (555) 456-7890',
      avatar: 'DP',
      role: 'account_executive',
      team: 'Enterprise Sales',
      department: 'Sales',
      status: 'active',
      location: 'Seattle, WA',
      timezone: 'PST',
      hireDate: '2023-03-01',
      performance: {
        dealsWon: 15,
        revenue: 1980000,
        quota: 2000000,
        quotaAttainment: 99.0,
        activePipeline: 10,
        pipelineValue: 1450000,
        winRate: 68,
        avgDealSize: 132000,
        salesCycle: 52
      },
      activities: {
        calls: 189,
        emails: 456,
        meetings: 67,
        tasks: 123
      },
      metrics: {
        leadConversion: 58,
        customerSatisfaction: 4.6,
        responseTime: 3.5
      },
      manager: 'Sarah Johnson',
      specializations: ['Enterprise Technology', 'Strategic Accounts'],
      certifications: ['MEDDIC Sales', 'Challenger Sale'],
      isTopPerformer: false
    },
    {
      id: 'MEM-005',
      name: 'Jennifer Martinez',
      email: 'jennifer.martinez@company.com',
      phone: '+1 (555) 567-8901',
      avatar: 'JM',
      role: 'account_executive',
      team: 'Account Management',
      department: 'Sales',
      status: 'active',
      location: 'Chicago, IL',
      timezone: 'CST',
      hireDate: '2023-06-15',
      performance: {
        dealsWon: 28,
        revenue: 1750000,
        quota: 1800000,
        quotaAttainment: 97.2,
        activePipeline: 14,
        pipelineValue: 1120000,
        winRate: 70,
        avgDealSize: 62500,
        salesCycle: 35
      },
      activities: {
        calls: 256,
        emails: 598,
        meetings: 92,
        tasks: 167
      },
      metrics: {
        leadConversion: 62,
        customerSatisfaction: 4.7,
        responseTime: 2.8
      },
      manager: 'Michael Chen',
      specializations: ['Financial Services', 'Account Expansion'],
      certifications: ['Salesforce Certified', 'SPIN Selling'],
      isTopPerformer: false
    },
    {
      id: 'MEM-006',
      name: 'Alex Thompson',
      email: 'alex.thompson@company.com',
      phone: '+1 (555) 678-9012',
      avatar: 'AT',
      role: 'sdr',
      team: 'Sales Development',
      department: 'Sales',
      status: 'active',
      location: 'Boston, MA',
      timezone: 'EST',
      hireDate: '2024-02-01',
      performance: {
        dealsWon: 45,
        revenue: 890000,
        quota: 1000000,
        quotaAttainment: 89.0,
        activePipeline: 32,
        pipelineValue: 650000,
        winRate: 42,
        avgDealSize: 19778,
        salesCycle: 21
      },
      activities: {
        calls: 567,
        emails: 1234,
        meetings: 178,
        tasks: 289
      },
      metrics: {
        leadConversion: 38,
        customerSatisfaction: 4.4,
        responseTime: 4.0
      },
      manager: 'David Park',
      specializations: ['Lead Generation', 'Cold Outreach', 'SMB'],
      certifications: ['SDR Bootcamp', 'LinkedIn Sales Navigator'],
      isTopPerformer: false
    },
    {
      id: 'MEM-007',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@company.com',
      phone: '+1 (555) 789-0123',
      avatar: 'LA',
      role: 'account_executive',
      team: 'Mid-Market Sales',
      department: 'Sales',
      status: 'active',
      location: 'Denver, CO',
      timezone: 'MST',
      hireDate: '2023-09-10',
      performance: {
        dealsWon: 22,
        revenue: 1650000,
        quota: 1700000,
        quotaAttainment: 97.1,
        activePipeline: 11,
        pipelineValue: 980000,
        winRate: 66,
        avgDealSize: 75000,
        salesCycle: 40
      },
      activities: {
        calls: 223,
        emails: 534,
        meetings: 78,
        tasks: 145
      },
      metrics: {
        leadConversion: 60,
        customerSatisfaction: 4.5,
        responseTime: 3.2
      },
      manager: 'Michael Chen',
      specializations: ['Healthcare', 'Vertical Markets'],
      certifications: ['HIPAA Compliance', 'Value Selling'],
      isTopPerformer: false
    },
    {
      id: 'MEM-008',
      name: 'Kevin Wong',
      email: 'kevin.wong@company.com',
      phone: '+1 (555) 890-1234',
      avatar: 'KW',
      role: 'sales_rep',
      team: 'Mid-Market Sales',
      department: 'Sales',
      status: 'on_leave',
      location: 'Los Angeles, CA',
      timezone: 'PST',
      hireDate: '2024-04-15',
      performance: {
        dealsWon: 12,
        revenue: 720000,
        quota: 900000,
        quotaAttainment: 80.0,
        activePipeline: 9,
        pipelineValue: 560000,
        winRate: 55,
        avgDealSize: 60000,
        salesCycle: 33
      },
      activities: {
        calls: 145,
        emails: 367,
        meetings: 52,
        tasks: 98
      },
      metrics: {
        leadConversion: 52,
        customerSatisfaction: 4.3,
        responseTime: 4.5
      },
      manager: 'Michael Chen',
      specializations: ['APAC Markets', 'Multi-language'],
      certifications: ['Sandler Training'],
      isTopPerformer: false
    }
  ];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = [
    {
      label: 'Total Teams',
      value: teams.length,
      subtitle: `${teams.filter(t => t.status === 'active').length} active`,
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Total Members',
      value: members.length,
      subtitle: `${members.filter(m => m.status === 'active').length} active`,
      icon: UserPlus,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Team Revenue',
      value: '$' + (teams.reduce((sum, t) => sum + t.performance.totalRevenue, 0) / 1000000).toFixed(1) + 'M',
      subtitle: 'Total YTD',
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Avg Quota Attainment',
      value: Math.round(teams.reduce((sum, t) => sum + t.performance.quotaAttainment, 0) / teams.length) + '%',
      subtitle: `${members.filter(m => m.performance.quotaAttainment >= 100).length} over quota`,
      icon: Target,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'vp_sales':
      case 'director': return 'bg-purple-100 text-purple-700';
      case 'sales_manager':
      case 'team_lead': return 'bg-blue-100 text-blue-700';
      case 'account_executive': return 'bg-green-100 text-green-700';
      case 'sales_rep': return 'bg-gray-100 text-gray-700';
      case 'sdr': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'on_leave': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPerformanceBadge = (quotaAttainment: number) => {
    if (quotaAttainment >= 100) return { icon: Crown, color: 'text-yellow-500', label: 'Exceeds Quota' };
    if (quotaAttainment >= 80) return { icon: CheckCircle, color: 'text-green-500', label: 'On Track' };
    return { icon: AlertCircle, color: 'text-orange-500', label: 'Needs Attention' };
  };

  return (
    <div className="w-full h-full px-3 py-2  space-y-3">
      {/* Header */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setView('teams')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'teams'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Teams
            </button>
            <button
              onClick={() => setView('members')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'members'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Members
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            <Plus className="w-5 h-5" />
            {view === 'teams' ? 'Add Team' : 'Add Member'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-white/70 text-xs mt-1">{stat.subtitle}</p>
                </div>
                <Icon className="w-12 h-12 text-white/30" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Teams View */}
      {view === 'teams' && (
        <div className="space-y-2">
          {teams.map((team) => {
            const quotaProgress = team.performance.quotaAttainment;

            return (
              <div key={team.id} className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(team.status)}`}>
                            {team.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{team.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            <span>Manager: <strong className="text-gray-900">{team.manager}</strong></span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span><strong className="text-gray-900">{team.members}</strong> members</span>
                          </div>
                          <span>•</span>
                          <span>Territories: <strong className="text-gray-900">{team.territories.join(', ')}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-5 h-5 text-blue-600" />
                      </button>
                      <button className="p-2 hover:bg-purple-50 rounded-lg transition-colors">
                        <Edit className="w-5 h-5 text-purple-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <Settings className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Team Performance */}
                  <div className="grid grid-cols-6 gap-2 mb-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Revenue</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${(team.performance.totalRevenue / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Quota</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${(team.performance.totalQuota / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Attainment</p>
                      <p className={`text-lg font-bold ${
                        quotaProgress >= 100 ? 'text-green-600' : quotaProgress >= 80 ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {quotaProgress.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Active Deals</p>
                      <p className="text-lg font-bold text-gray-900">{team.performance.activeDeals}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Won Deals</p>
                      <p className="text-lg font-bold text-gray-900">{team.performance.wonDeals}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                      <p className="text-lg font-bold text-gray-900">{team.performance.avgWinRate}%</p>
                    </div>
                  </div>

                  {/* Quota Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Quota Progress</span>
                      <span className={`text-xs font-bold ${
                        quotaProgress >= 100 ? 'text-green-600' : quotaProgress >= 80 ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {quotaProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          quotaProgress >= 100
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : quotaProgress >= 80
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                            : 'bg-gradient-to-r from-orange-500 to-orange-600'
                        }`}
                        style={{ width: `${Math.min(quotaProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Members View */}
      {view === 'members' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  Search Members
                </label>
                <input
                  type="text"
                  placeholder="Search by name, email, or team..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="director">Director</option>
                  <option value="sales_manager">Sales Manager</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="account_executive">Account Executive</option>
                  <option value="sales_rep">Sales Rep</option>
                  <option value="sdr">SDR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredMembers.map((member) => {
              const performanceBadge = getPerformanceBadge(member.performance.quotaAttainment);
              const PerformanceIcon = performanceBadge.icon;

              return (
                <div key={member.id} className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {member.avatar}
                          </div>
                          {member.isTopPerformer && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                              {member.rank === 1 ? <Crown className="w-4 h-4 text-yellow-900" /> : <Star className="w-3 h-3 text-yellow-900" />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                            {member.isTopPerformer && member.rank && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                                #{member.rank} Top Performer
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getRoleColor(member.role)}`}>
                              {member.role.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(member.status)}`}>
                              {member.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{member.team}</p>
                        </div>
                      </div>
                      <PerformanceIcon className={`w-6 h-6 ${performanceBadge.color}`} />
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 mb-2 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{member.location} ({member.timezone})</span>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-2">
                      <div>
                        <p className="text-xs text-gray-500">Revenue</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${(member.performance.revenue / 1000000).toFixed(2)}M
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Quota %</p>
                        <p className={`text-lg font-bold ${
                          member.performance.quotaAttainment >= 100 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {member.performance.quotaAttainment.toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Win Rate</p>
                        <p className="text-lg font-bold text-gray-900">{member.performance.winRate}%</p>
                      </div>
                    </div>

                    {/* Quota Progress */}
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            member.performance.quotaAttainment >= 100
                              ? 'bg-gradient-to-r from-green-500 to-green-600'
                              : 'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}
                          style={{ width: `${Math.min(member.performance.quotaAttainment, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Activity Stats */}
                    <div className="grid grid-cols-4 gap-2 mb-2 pb-4 border-b border-gray-200">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Calls</p>
                        <p className="text-sm font-semibold text-gray-900">{member.activities.calls}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Emails</p>
                        <p className="text-sm font-semibold text-gray-900">{member.activities.emails}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Meetings</p>
                        <p className="text-sm font-semibold text-gray-900">{member.activities.meetings}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Tasks</p>
                        <p className="text-sm font-semibold text-gray-900">{member.activities.tasks}</p>
                      </div>
                    </div>

                    {/* Specializations */}
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-500 mb-2">SPECIALIZATIONS</p>
                      <div className="flex flex-wrap gap-1">
                        {member.specializations.map((spec, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        Joined {new Date(member.hireDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-purple-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-purple-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <Settings className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {view === 'teams' ? 'Add New Team' : 'Add New Member'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">
                {view === 'teams'
                  ? 'Team creation form would include: team name, type, manager assignment, territory allocation, and quota settings.'
                  : 'Member creation form would include: name, email, role, team assignment, quota, and specializations.'}
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create {view === 'teams' ? 'Team' : 'Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
