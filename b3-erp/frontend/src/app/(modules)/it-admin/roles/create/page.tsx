'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Shield, Users, CheckSquare, Square, Copy, Eye, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { ItAdminService } from '@/services/it-admin.service';

interface PermissionAction {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
  approve: boolean;
}

interface ModulePermission {
  module: string;
  resources: {
    name: string;
    actions: PermissionAction;
  }[];
}

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: ModulePermission[];
}

export default function CreateRolePage() {
  const router = useRouter();
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [permissions, setPermissions] = useState<ModulePermission[]>([
    {
      module: 'User Management',
      resources: [
        { name: 'Users', actions: { create: false, read: false, update: false, delete: false, export: false, approve: false } },
        { name: 'Roles', actions: { create: false, read: false, update: false, delete: false, export: false, approve: false } }
      ]
    },
    {
      module: 'Sales',
      resources: [
        { name: 'Orders', actions: { create: false, read: false, update: false, delete: false, export: false, approve: false } },
        { name: 'Quotations', actions: { create: false, read: false, update: false, delete: false, export: false, approve: false } },
        { name: 'Invoices', actions: { create: false, read: false, update: false, delete: false, export: false, approve: false } }
      ]
    },
    {
      module: 'Production',
      resources: [
        { name: 'Work Orders', actions: { create: false, read: false, update: false, delete: false, export: false, approve: false } },
        { name: 'BOM', actions: { create: false, read: false, update: false, delete: false, export: false, approve: false } },
        { name: 'Quality', actions: { create: false, read: false, update: false, delete: false, export: false, approve: false } }
      ]
    },
    {
      module: 'Inventory',
      resources: [
        { name: 'Stock', actions: { create: false, read: false, update: false, delete: false, export: false, approve: false } },
        { name: 'Transfers', actions: { create: false, read: false, update: false, delete: false, export: false, approve: false } },
        { name: 'Adjustments', actions: { create: false, read: false, update: false, delete: false, export: false, approve: false } }
      ]
    },
    {
      module: 'Finance',
      resources: [
        { name: 'Payments', actions: { create: false, read: false, update: false, delete: false, export: false, approve: false } },
        { name: 'Budgets', actions: { create: false, read: false, update: false, delete: false, export: false, approve: false } }
      ]
    }
  ]);

  const templates: RoleTemplate[] = [
    {
      id: 'manager',
      name: 'Manager Template',
      description: 'Full departmental access with approval rights',
      permissions: [
        {
          module: 'Sales',
          resources: [
            { name: 'Orders', actions: { create: true, read: true, update: true, delete: false, export: true, approve: true } },
            { name: 'Quotations', actions: { create: true, read: true, update: true, delete: false, export: true, approve: true } }
          ]
        }
      ]
    },
    {
      id: 'supervisor',
      name: 'Supervisor Template',
      description: 'Operational access without deletion rights',
      permissions: [
        {
          module: 'Production',
          resources: [
            { name: 'Work Orders', actions: { create: true, read: true, update: true, delete: false, export: false, approve: false } }
          ]
        }
      ]
    },
    {
      id: 'operator',
      name: 'Operator Template',
      description: 'Limited access for task execution',
      permissions: [
        {
          module: 'Production',
          resources: [
            { name: 'Work Orders', actions: { create: false, read: true, update: true, delete: false, export: false, approve: false } }
          ]
        }
      ]
    },
    {
      id: 'viewer',
      name: 'Read-Only Template',
      description: 'View and export access only',
      permissions: [
        {
          module: 'Sales',
          resources: [
            { name: 'Orders', actions: { create: false, read: true, update: false, delete: false, export: true, approve: false } }
          ]
        }
      ]
    }
  ];

  const toggleModulePermissions = (moduleIndex: number, action: keyof PermissionAction) => {
    const newPermissions = [...permissions];
    const allEnabled = newPermissions[moduleIndex].resources.every(r => r.actions[action]);
    newPermissions[moduleIndex].resources.forEach(r => {
      r.actions[action] = !allEnabled;
    });
    setPermissions(newPermissions);
  };

  const toggleResourcePermission = (moduleIndex: number, resourceIndex: number, action: keyof PermissionAction) => {
    const newPermissions = [...permissions];
    newPermissions[moduleIndex].resources[resourceIndex].actions[action] = !newPermissions[moduleIndex].resources[resourceIndex].actions[action];
    setPermissions(newPermissions);
  };

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Reset all permissions first
      const resetPermissions = permissions.map(module => ({
        ...module,
        resources: module.resources.map(resource => ({
          ...resource,
          actions: { create: false, read: false, update: false, delete: false, export: false, approve: false }
        }))
      }));
      setPermissions(resetPermissions);
    }
  };

  const handleSave = async () => {
    if (!roleName.trim()) return;
    try {
      await ItAdminService.createRole({
        name: roleName,
        description: roleDescription,
        applicableModules: permissions.map((m) => m.module),
        permissions: permissions as any,
        status: 'active',
      });
      router.push('/it-admin/roles');
    } catch {
      // Keep the user on the page on failure.
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Role</h1>
          <p className="text-sm text-gray-500 mt-1">Define role details and assign permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Role Details */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Role Details</h2>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name *</label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Production Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Brief description of role responsibilities"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Role
                </button>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Copy className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">Templates</h2>
            </div>

            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedTemplate === template.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900 mb-1">{template.name}</p>
                  <p className="text-xs text-gray-600">{template.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-purple-700">
                Templates provide preset permissions. Customize them after applying.
              </p>
            </div>
          </div>

          {/* Permission Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Summary</h2>
            </div>

            <div className="space-y-2">
              {permissions.map((module) => {
                const totalActions = module.resources.reduce((acc, r) =>
                  acc + Object.values(r.actions).filter(Boolean).length, 0
                );
                return (
                  <div key={module.module} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700">{module.module}</span>
                    <span className="text-xs text-gray-600">{totalActions} permissions</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Assign Permissions</h2>

          <div className="space-y-3">
            {permissions.map((module, moduleIndex) => (
              <div key={module.module} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">{module.module}</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Resource</th>
                        <th className="text-center px-2 py-2">
                          <button
                            onClick={() => toggleModulePermissions(moduleIndex, 'create')}
                            className="text-xs font-semibold text-gray-600 hover:text-blue-600"
                          >
                            Create
                          </button>
                        </th>
                        <th className="text-center px-2 py-2">
                          <button
                            onClick={() => toggleModulePermissions(moduleIndex, 'read')}
                            className="text-xs font-semibold text-gray-600 hover:text-blue-600"
                          >
                            Read
                          </button>
                        </th>
                        <th className="text-center px-2 py-2">
                          <button
                            onClick={() => toggleModulePermissions(moduleIndex, 'update')}
                            className="text-xs font-semibold text-gray-600 hover:text-blue-600"
                          >
                            Update
                          </button>
                        </th>
                        <th className="text-center px-2 py-2">
                          <button
                            onClick={() => toggleModulePermissions(moduleIndex, 'delete')}
                            className="text-xs font-semibold text-gray-600 hover:text-blue-600"
                          >
                            Delete
                          </button>
                        </th>
                        <th className="text-center px-2 py-2">
                          <button
                            onClick={() => toggleModulePermissions(moduleIndex, 'export')}
                            className="text-xs font-semibold text-gray-600 hover:text-blue-600"
                          >
                            Export
                          </button>
                        </th>
                        <th className="text-center px-2 py-2">
                          <button
                            onClick={() => toggleModulePermissions(moduleIndex, 'approve')}
                            className="text-xs font-semibold text-gray-600 hover:text-blue-600"
                          >
                            Approve
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {module.resources.map((resource, resourceIndex) => (
                        <tr key={resource.name} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{resource.name}</td>
                          {(Object.keys(resource.actions) as Array<keyof PermissionAction>).map((action) => (
                            <td key={action} className="px-2 py-3 text-center">
                              <button
                                onClick={() => toggleResourcePermission(moduleIndex, resourceIndex, action)}
                                className="mx-auto"
                              >
                                {resource.actions[action] ? (
                                  <CheckSquare className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <Square className="w-5 h-5 text-gray-300" />
                                )}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Permission Guidelines:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>" Click column headers to toggle all permissions for that action in a module</li>
              <li>" Click individual checkboxes to fine-tune resource permissions</li>
              <li>" Use templates as starting points and customize as needed</li>
              <li>" Review the summary panel to ensure appropriate access levels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
