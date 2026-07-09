'use client';

import { useState, useEffect } from 'react';
import { Users, Briefcase, Crown, UserCheck, Target, TrendingUp, Mail, Phone, Building2, Award, Search, Filter, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Clock, BarChart3 } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface ContactRole {
  id: string;
  roleName: string;
  description: string;
  department: string;
  level: 'executive' | 'director' | 'manager' | 'specialist' | 'coordinator';
  contactCount: number;
  avgDealSize: number;
  conversionRate: number;
  avgResponseTime: number;
  influenceScore: number;
  color: string;
  isDecisionMaker: boolean;
  isBudgetHolder: boolean;
  isInfluencer: boolean;
  createdDate: string;
  status: 'active' | 'inactive';
}

interface RoleContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  roleId: string;
  lastContact: string;
  status: 'engaged' | 'cold' | 'hot';
  dealsPending: number;
  dealsClosed: number;
  totalValue: number;
}

export default function ContactRolesPage() {
  const [roles, setRoles] = useState<ContactRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<RoleContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true); setError(null);
        const data = await crmService.contactRoles.getAll();
        const rows = Array.isArray(data) ? data : [];
        if (!mounted) return;
        setRoles(rows.map((r: any): ContactRole => ({
          id: String(r.id ?? ''),
          roleName: r.roleName ?? r.name ?? '',
          description: r.description ?? '',
          department: r.department ?? r.category ?? '',
          level: (r.level ?? r.influenceLevel ?? 'specialist') as ContactRole['level'],
          contactCount: r.contactCount ?? 0,
          avgDealSize: r.avgDealSize ?? 0,
          conversionRate: r.conversionRate ?? 0,
          avgResponseTime: r.avgResponseTime ?? 0,
          influenceScore: r.influenceScore ?? 0,
          color: r.color ?? '',
          isDecisionMaker: r.isDecisionMaker ?? false,
          isBudgetHolder: r.isBudgetHolder ?? false,
          isInfluencer: r.isInfluencer ?? false,
          createdDate: r.createdDate ?? r.createdAt ?? '',
          status: (r.status ?? 'active') as ContactRole['status'],
        })));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load'); setRoles([]);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);
  const handleDeleteRole = async (id: string) => {
    if (!id) return;
    if (typeof window !== 'undefined' && !window.confirm('Delete this contact role?')) return;
    try {
      await crmService.contactRoles.delete(id);
      setRoles(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      setError(e?.message || 'Failed to delete role');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | 'executive' | 'director' | 'manager' | 'specialist' | 'coordinator'>('all');
  const [filterType, setFilterType] = useState<'all' | 'decision-maker' | 'budget-holder' | 'influencer'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'contacts' | 'deals' | 'influence'>('influence');
  const [selectedRole, setSelectedRole] = useState<ContactRole | null>(null);

  useEffect(() => {
    if (!selectedRole) {
      setContacts([]);
      setContactsError(null);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setContactsLoading(true);
        setContactsError(null);
        const detail: any = await crmService.contactRoles.getById(selectedRole.id);
        const rows: any[] = Array.isArray(detail?.contacts)
          ? detail.contacts
          : Array.isArray(detail?.members)
            ? detail.members
            : [];
        if (!mounted) return;
        setContacts(rows.map((c: any): RoleContact => ({
          id: String(c.id ?? ''),
          name: c.name ?? c.fullName ?? '',
          email: c.email ?? '',
          phone: c.phone ?? '',
          company: c.company ?? c.companyName ?? '',
          title: c.title ?? c.jobTitle ?? '',
          roleId: String(c.roleId ?? selectedRole.id),
          lastContact: c.lastContact ?? c.lastContactDate ?? '',
          status: (c.status ?? 'cold') as RoleContact['status'],
          dealsPending: Number(c.dealsPending ?? 0),
          dealsClosed: Number(c.dealsClosed ?? 0),
          totalValue: Number(c.totalValue ?? 0),
        })));
      } catch (e: any) {
        if (!mounted) return;
        setContactsError(e?.message || 'Failed to load contacts');
        setContacts([]);
      } finally {
        if (mounted) setContactsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedRole]);

  const filteredRoles = roles
    .filter(role => {
      const matchesSearch = role.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          role.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          role.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = filterLevel === 'all' || role.level === filterLevel;
      const matchesType = filterType === 'all' ||
                         (filterType === 'decision-maker' && role.isDecisionMaker) ||
                         (filterType === 'budget-holder' && role.isBudgetHolder) ||
                         (filterType === 'influencer' && role.isInfluencer);
      return matchesSearch && matchesLevel && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.roleName.localeCompare(b.roleName);
        case 'contacts':
          return b.contactCount - a.contactCount;
        case 'deals':
          return b.avgDealSize - a.avgDealSize;
        case 'influence':
          return b.influenceScore - a.influenceScore;
        default:
          return 0;
      }
    });

  const stats = {
    totalRoles: roles.filter(r => r.status === 'active').length,
    totalContacts: roles.reduce((sum, r) => sum + r.contactCount, 0),
    avgDealSize: roles.length ? roles.reduce((sum, r) => sum + r.avgDealSize, 0) / roles.length : 0,
    avgConversion: roles.length ? roles.reduce((sum, r) => sum + r.conversionRate, 0) / roles.length : 0,
    decisionMakers: roles.filter(r => r.isDecisionMaker).length,
    avgInfluence: roles.length ? roles.reduce((sum, r) => sum + r.influenceScore, 0) / roles.length : 0,
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'executive':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'director':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'manager':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'specialist':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'coordinator':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getInfluenceColor = (score: number) => {
    if (score >= 90) return 'text-purple-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-green-600';
    if (score >= 45) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getInfluenceLabel = (score: number) => {
    if (score >= 90) return 'Critical';
    if (score >= 75) return 'High';
    if (score >= 60) return 'Medium';
    if (score >= 45) return 'Moderate';
    return 'Low';
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {error && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>)}
      <div className="mb-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalRoles}</div>
            <div className="text-purple-100">Active Roles</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalContacts.toLocaleString()}</div>
            <div className="text-blue-100">Total Contacts</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">${(stats.avgDealSize / 1000).toFixed(0)}K</div>
            <div className="text-green-100">Avg Deal Size</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.avgConversion.toFixed(1)}%</div>
            <div className="text-orange-100">Avg Conversion</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Crown className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.decisionMakers}</div>
            <div className="text-red-100">Decision Makers</div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.avgInfluence.toFixed(0)}</div>
            <div className="text-pink-100">Avg Influence</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search roles, departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="executive">Executive</option>
                <option value="director">Director</option>
                <option value="manager">Manager</option>
                <option value="specialist">Specialist</option>
                <option value="coordinator">Coordinator</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="decision-maker">Decision Makers</option>
                <option value="budget-holder">Budget Holders</option>
                <option value="influencer">Influencers</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="influence">Sort by Influence</option>
                <option value="name">Sort by Name</option>
                <option value="contacts">Sort by Contacts</option>
                <option value="deals">Sort by Deal Size</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {loading && (
          <div className="py-8 text-center text-gray-500 text-sm">Loading contact roles…</div>
        )}
        {!loading && !error && filteredRoles.length === 0 && (
          <div className="py-8 text-center text-gray-500 text-sm">No contact roles found.</div>
        )}
        {filteredRoles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{role.roleName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(role.level)}`}>
                      {role.level}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{role.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Building2 className="w-4 h-4" />
                    {role.department}
                  </div>
                </div>
              </div>

              {/* Authority Badges */}
              <div className="flex flex-wrap gap-2 mb-2">
                {role.isDecisionMaker && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    <Crown className="w-3 h-3" />
                    Decision Maker
                  </span>
                )}
                {role.isBudgetHolder && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Budget Holder
                  </span>
                )}
                {role.isInfluencer && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <UserCheck className="w-3 h-3" />
                    Influencer
                  </span>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mb-2 pt-4 border-t border-gray-100">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    Contacts
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {role.contactCount.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Target className="w-4 h-4" />
                    Avg Deal Size
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(role.avgDealSize / 1000).toFixed(0)}K
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Conversion Rate
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {role.conversionRate.toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    Avg Response
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {role.avgResponseTime}h
                  </div>
                </div>
              </div>

              {/* Influence Score */}
              <div className="mb-2 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Influence Score</span>
                  <span className={`text-sm font-bold ${getInfluenceColor(role.influenceScore)}`}>
                    {role.influenceScore}/100 - {getInfluenceLabel(role.influenceScore)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      role.influenceScore >= 90 ? 'bg-purple-600' :
                      role.influenceScore >= 75 ? 'bg-blue-600' :
                      role.influenceScore >= 60 ? 'bg-green-600' :
                      role.influenceScore >= 45 ? 'bg-yellow-600' :
                      'bg-gray-600'
                    }`}
                    style={{ width: `${role.influenceScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setSelectedRole(role)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4" />
                  View Contacts ({role.contactCount})
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>

              {/* Metadata */}
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                Created: {new Date(role.createdDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Details Modal (simplified inline view) */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg  w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedRole.roleName}</h2>
                  <p className="text-gray-600">Contacts in this role</p>
                </div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-2">
                {contactsLoading && (
                  <div className="text-center py-8 text-gray-500">Loading contacts…</div>
                )}
                {contactsError && !contactsLoading && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {contactsError}
                  </div>
                )}
                {!contactsLoading && !contactsError && contacts.filter(c => c.roleId === selectedRole.id).map((contact) => (
                  <div key={contact.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{contact.name}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {contact.company}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {contact.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {contact.phone}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Pending</div>
                            <div className="text-lg font-bold text-orange-600">{contact.dealsPending}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Closed</div>
                            <div className="text-lg font-bold text-green-600">{contact.dealsClosed}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Value</div>
                            <div className="text-lg font-bold text-blue-600">
                              ${(contact.totalValue / 1000000).toFixed(1)}M
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!contactsLoading && !contactsError && contacts.filter(c => c.roleId === selectedRole.id).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No contacts found for this role
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
