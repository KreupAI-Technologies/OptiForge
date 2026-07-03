'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Trash2, Users, Settings, Search, Eye, Filter } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  permissions: string[];
  createdDate: string;
  members: GroupMember[];
}

export default function UserGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await ItAdminService.getUserGroups();
        const mapped: UserGroup[] = (Array.isArray(raw) ? raw : []).map((g) => ({
          id: String(g.id),
          name: g.name ?? '',
          description: g.description ?? '',
          memberCount: Number(g.memberCount ?? (g.members?.length ?? 0)),
          permissions: Array.isArray(g.permissions) ? g.permissions : [],
          createdDate: g.createdDate ?? '',
          members: Array.isArray(g.members) ? g.members : [],
        }));
        if (!cancelled) setGroups(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load user groups');
          setGroups([]);
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

  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPermission, setFilterPermission] = useState('');

  const allPermissions = ['view', 'edit', 'delete', 'export', 'manage_users', 'system_config'];

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterPermission === '' || group.permissions.includes(filterPermission))
  );

  const handleDeleteMember = (groupId: string, memberId: string) => {
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, members: g.members.filter(m => m.id !== memberId), memberCount: g.memberCount - 1 }
        : g
    ));
  };

  const getPermissionColor = (permission: string) => {
    const colors: Record<string, string> = {
      'view': 'bg-blue-100 text-blue-800',
      'edit': 'bg-green-100 text-green-800',
      'delete': 'bg-red-100 text-red-800',
      'export': 'bg-purple-100 text-purple-800',
      'manage_users': 'bg-orange-100 text-orange-800',
      'system_config': 'bg-indigo-100 text-indigo-800'
    };
    return colors[permission] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3">
      <div className="w-full">
        {loadError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
            {loadError}
          </div>
        )}
        {isLoading && (
          <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-700">
            Loading user groups...
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-200 rounded-lg text-slate-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">User Groups</h1>
              <p className="text-slate-600 mt-1">Manage user groups and permissions</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/it-admin/users/groups/new')}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            New Group
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filterPermission}
            onChange={(e) => setFilterPermission(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Permissions</option>
            {allPermissions.map(perm => (
              <option key={perm} value={perm}>
                {perm.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredGroups.map(group => (
            <div key={group.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Group Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{group.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{group.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-lg text-red-600">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Permissions */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {group.permissions.map(perm => (
                    <span
                      key={perm}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getPermissionColor(perm)}`}
                    >
                      {perm.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex gap-2 text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {group.memberCount} members
                  </span>
                  <span>Created: {new Date(group.createdDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Members Preview */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-900">Members ({group.members.length})</h4>
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowDetails(true);
                    }}
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View All
                  </button>
                </div>

                {/* Member List Preview */}
                <div className="space-y-2">
                  {group.members.slice(0, 3).map(member => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                        <p className="text-xs text-slate-600 truncate">{member.email}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap ml-2">
                        {member.role}
                      </span>
                    </div>
                  ))}
                  {group.members.length > 3 && (
                    <p className="text-xs text-slate-600 pt-2">+{group.members.length - 3} more</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Members Detail Modal */}
        {showDetails && selectedGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 sticky top-0 bg-white flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedGroup.name}</h2>
                  <p className="text-sm text-slate-600 mt-1">{selectedGroup.members.length} members</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Members List */}
              <div className="p-6">
                <div className="space-y-3">
                  {selectedGroup.members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-sm text-slate-600">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                          {member.role}
                        </span>
                        <button
                          onClick={() => handleDeleteMember(selectedGroup.id, member.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 font-medium"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Members
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
