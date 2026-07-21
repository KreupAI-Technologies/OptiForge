'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, ChevronRight, Shield, Crown, Star, UserCog, Eye, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';
import { RoleService } from '@/services/role.service';

interface RoleNode {
  id: string;
  name: string;
  level: number;
  userCount: number;
  permissions: number;
  directReports: string[];
  canApprove: string[];
  canDelegate: boolean;
  icon: 'crown' | 'star' | 'shield' | 'usercog' | 'eye';
  color: string;
}

export default function RoleHierarchyPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [hierarchy, setHierarchy] = useState<RoleNode[]>([]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const loadHierarchy = useCallback(async () => {
    try {
      const roles = await ItAdminService.getRoleHierarchy();
      const list = Array.isArray(roles) ? roles : [];
      const mapped: RoleNode[] = list.map((role) => {
        const roleType = (role.roleType || '').toLowerCase();
        let level = 4;
        if (roleType.includes('admin')) level = 1;
        else if (roleType.includes('manager')) level = 2;
        else if (roleType.includes('supervisor')) level = 3;
        return {
          id: role.id,
          name: role.name,
          level,
          userCount: role.userCount || 0,
          permissions: Array.isArray(role.permissions) ? role.permissions.length : 0,
          directReports: [],
          canApprove: [],
          canDelegate: false,
          icon: 'shield',
          color: 'blue',
        };
      });
      setHierarchy(mapped);
    } catch {
      setHierarchy([]);
    }
  }, []);

  useEffect(() => {
    loadHierarchy();
  }, [loadHierarchy]);

  // Mirror roles/page.tsx: navigate to the shared role editor.
  const handleEdit = (roleId: string) => {
    router.push(`/it-admin/roles/create?roleId=${encodeURIComponent(roleId)}&mode=edit`);
  };

  const handleDelete = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) return;
    try {
      await RoleService.deleteRole(roleId);
      showToast(`Role "${roleName}" deleted`, 'success');
      await loadHierarchy();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : `Failed to delete ${roleName}`,
        'error',
      );
    }
  };

  const getIcon = (iconType: string) => {
    const iconMap = {
      crown: Crown,
      star: Star,
      shield: Shield,
      usercog: UserCog,
      eye: Eye
    };
    const IconComponent = iconMap[iconType as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  const getColorClasses = (color: string, selected: boolean) => {
    const colors = {
      purple: selected ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-purple-300 bg-white text-purple-600 hover:bg-purple-50',
      blue: selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-blue-300 bg-white text-blue-600 hover:bg-blue-50',
      green: selected ? 'border-green-500 bg-green-50 text-green-700' : 'border-green-300 bg-white text-green-600 hover:bg-green-50',
      yellow: selected ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-yellow-300 bg-white text-yellow-600 hover:bg-yellow-50',
      gray: selected ? 'border-gray-500 bg-gray-50 text-gray-700' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
      indigo: selected ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-indigo-300 bg-white text-indigo-600 hover:bg-indigo-50'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const selectedRoleData = hierarchy.find(r => r.id === selectedRole);
  const reportingRoles = selectedRoleData?.directReports.map(id => hierarchy.find(r => r.id === id)).filter(Boolean) || [];
  const approvalRoles = selectedRoleData?.canApprove.map(id => hierarchy.find(r => r.id === id)).filter(Boolean) || [];

  const renderHierarchyTree = () => {
    const levels = [1, 2, 3, 4];
    return (
      <div className="space-y-3">
        {levels.map((level) => {
          const rolesAtLevel = hierarchy.filter(r => r.level === level);
          if (rolesAtLevel.length === 0) return null;

          return (
            <div key={level}>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Level {level}
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {rolesAtLevel.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${getColorClasses(role.color, selectedRole === role.id)}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getIcon(role.icon)}
                      <p className="font-semibold">{role.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Users:</span>
                        <span className="font-semibold ml-1">{role.userCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Permissions:</span>
                        <span className="font-semibold ml-1">{role.permissions}%</span>
                      </div>
                    </div>
                    {role.directReports.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                        <p className="text-xs text-gray-600">
                          Manages: {role.directReports.length} role(s)
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {level < 4 && rolesAtLevel.some(r => r.directReports.length > 0) && (
                <div className="flex justify-center my-2">
                  <ChevronRight className="w-6 h-6 text-gray-400 transform rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-amber-50 to-yellow-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex-none px-3 py-2">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-amber-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Role Hierarchy</h1>
              <p className="text-gray-600">Visualize role relationships and reporting structure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden px-6">
        <div className="h-full overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Hierarchy Visualization */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-3">
          <div className="mb-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Organizational Hierarchy</h2>
            <p className="text-sm text-gray-600">Click on any role to view detailed relationships</p>
          </div>

          {renderHierarchyTree()}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Hierarchy Rules:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>" Higher-level roles can approve actions from lower-level roles</li>
              <li>" Direct reports indicate supervisory relationships</li>
              <li>" Permission inheritance flows from top to bottom</li>
              <li>" Delegation rights allow temporary permission transfers</li>
            </ul>
          </div>
        </div>

        {/* Role Details Panel */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">Role Details</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => selectedRoleData && handleEdit(selectedRoleData.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-amber-300 rounded-lg hover:bg-amber-50 text-sm"
                >
                  <Edit className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700">Edit</span>
                </button>
                <button
                  onClick={() => selectedRoleData && handleDelete(selectedRoleData.id, selectedRoleData.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span className="text-red-600">Delete</span>
                </button>
              </div>
            </div>

            {selectedRoleData && (
              <div className="space-y-2">
                <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${getColorClasses(selectedRoleData.color, true)}`}>
                  {getIcon(selectedRoleData.icon)}
                  <div>
                    <p className="font-bold">{selectedRoleData.name}</p>
                    <p className="text-xs">Level {selectedRoleData.level}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Users</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedRoleData.userCount}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Permissions</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedRoleData.permissions}%</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-semibold text-gray-900">Capabilities</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Can Delegate</span>
                      <span className={`text-xs font-semibold ${selectedRoleData.canDelegate ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedRoleData.canDelegate ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Direct Reports</span>
                      <span className="text-xs font-semibold text-gray-900">{selectedRoleData.directReports.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Approval Rights</span>
                      <span className="text-xs font-semibold text-gray-900">{selectedRoleData.canApprove.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {reportingRoles.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Direct Reports</h3>
              <div className="space-y-2">
                {reportingRoles.map((role) => (
                  <div key={role?.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {getIcon(role?.icon || 'shield')}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{role?.name}</p>
                      <p className="text-xs text-gray-600">{role?.userCount} users</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {approvalRoles.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Can Approve</h3>
              <div className="space-y-2">
                {approvalRoles.slice(0, 3).map((role) => (
                  <div key={role?.id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    {getIcon(role?.icon || 'shield')}
                    <p className="text-xs font-medium text-green-900">{role?.name}</p>
                  </div>
                ))}
                {approvalRoles.length > 3 && (
                  <p className="text-xs text-gray-600 text-center">
                    +{approvalRoles.length - 3} more roles
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-purple-900">Hierarchy Stats</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-700">Total Roles</span>
                <span className="text-sm font-bold text-purple-900">{hierarchy.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-700">Hierarchy Levels</span>
                <span className="text-sm font-bold text-purple-900">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-700">Total Users</span>
                <span className="text-sm font-bold text-purple-900">
                  {hierarchy.reduce((sum, r) => sum + r.userCount, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
