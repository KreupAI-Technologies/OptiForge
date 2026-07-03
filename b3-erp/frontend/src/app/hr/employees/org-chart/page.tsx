'use client';

import React, { useState, useEffect } from 'react';
import { Network, ZoomIn, ZoomOut, Download, Maximize2, ChevronDown, ChevronRight, Users, Mail, Phone, Building } from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';

interface OrgNode {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  level: number;
  children?: OrgNode[];
  directReports: number;
}

const mockOrgData: OrgNode = {
  id: 'CEO001',
  name: 'Arun Kumar',
  designation: 'Chief Executive Officer',
  department: 'Executive',
  email: 'arun.kumar@company.com',
  phone: '+91 9876543200',
  level: 0,
  directReports: 4,
  children: [
    {
      id: 'COO001',
      name: 'Rajesh Sharma',
      designation: 'Chief Operating Officer',
      department: 'Operations',
      email: 'rajesh.sharma@company.com',
      phone: '+91 9876543201',
      level: 1,
      directReports: 3,
      children: [
        {
          id: 'PM001',
          name: 'Vijay Patel',
          designation: 'Production Manager',
          department: 'Production',
          email: 'vijay.patel@company.com',
          phone: '+91 9876543210',
          level: 2,
          directReports: 15,
          children: [
            {
              id: 'PS001',
              name: 'Suresh Reddy',
              designation: 'Production Supervisor',
              department: 'Production',
              email: 'suresh.reddy@company.com',
              phone: '+91 9876543211',
              level: 3,
              directReports: 8
            },
            {
              id: 'PS002',
              name: 'Amit Singh',
              designation: 'Production Supervisor',
              department: 'Production',
              email: 'amit.singh@company.com',
              phone: '+91 9876543212',
              level: 3,
              directReports: 7
            }
          ]
        },
        {
          id: 'QM001',
          name: 'Priya Desai',
          designation: 'Quality Manager',
          department: 'Quality',
          email: 'priya.desai@company.com',
          phone: '+91 9876543213',
          level: 2,
          directReports: 8,
          children: [
            {
              id: 'QC001',
              name: 'Neha Kapoor',
              designation: 'QC Supervisor',
              department: 'Quality',
              email: 'neha.kapoor@company.com',
              phone: '+91 9876543214',
              level: 3,
              directReports: 5
            }
          ]
        },
        {
          id: 'MM001',
          name: 'Karthik Iyer',
          designation: 'Maintenance Manager',
          department: 'Maintenance',
          email: 'karthik.iyer@company.com',
          phone: '+91 9876543215',
          level: 2,
          directReports: 6,
          children: [
            {
              id: 'MT001',
              name: 'Ravi Kumar',
              designation: 'Maintenance Technician',
              department: 'Maintenance',
              email: 'ravi.kumar@company.com',
              phone: '+91 9876543216',
              level: 3,
              directReports: 4
            }
          ]
        }
      ]
    },
    {
      id: 'CFO001',
      name: 'Meera Nair',
      designation: 'Chief Financial Officer',
      department: 'Finance',
      email: 'meera.nair@company.com',
      phone: '+91 9876543202',
      level: 1,
      directReports: 2,
      children: [
        {
          id: 'AM001',
          name: 'Divya Reddy',
          designation: 'Accounts Manager',
          department: 'Finance',
          email: 'divya.reddy@company.com',
          phone: '+91 9876543217',
          level: 2,
          directReports: 5
        },
        {
          id: 'FM001',
          name: 'Ankit Verma',
          designation: 'Finance Manager',
          department: 'Finance',
          email: 'ankit.verma@company.com',
          phone: '+91 9876543218',
          level: 2,
          directReports: 3
        }
      ]
    },
    {
      id: 'CHRO001',
      name: 'Kavita Singh',
      designation: 'Chief HR Officer',
      department: 'HR',
      email: 'kavita.singh@company.com',
      phone: '+91 9876543203',
      level: 1,
      directReports: 2,
      children: [
        {
          id: 'HRM001',
          name: 'Lakshmi Menon',
          designation: 'HR Manager',
          department: 'HR',
          email: 'lakshmi.menon@company.com',
          phone: '+91 9876543219',
          level: 2,
          directReports: 4
        },
        {
          id: 'TA001',
          name: 'Rohit Joshi',
          designation: 'Talent Acquisition Lead',
          department: 'HR',
          email: 'rohit.joshi@company.com',
          phone: '+91 9876543220',
          level: 2,
          directReports: 2
        }
      ]
    },
    {
      id: 'CTO001',
      name: 'Arjun Mehta',
      designation: 'Chief Technology Officer',
      department: 'IT',
      email: 'arjun.mehta@company.com',
      phone: '+91 9876543204',
      level: 1,
      directReports: 2,
      children: [
        {
          id: 'ITM001',
          name: 'Sanjay Gupta',
          designation: 'IT Manager',
          department: 'IT',
          email: 'sanjay.gupta@company.com',
          phone: '+91 9876543221',
          level: 2,
          directReports: 4
        }
      ]
    }
  ]
};

function OrgNodeCard({ node, expanded, onToggle }: { node: OrgNode; expanded: boolean; onToggle: () => void }) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative">
      <div className={`bg-white border-2 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow ${
        node.level === 0 ? 'border-purple-500' :
        node.level === 1 ? 'border-blue-500' :
        node.level === 2 ? 'border-green-500' :
        'border-gray-300'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                node.level === 0 ? 'bg-purple-600' :
                node.level === 1 ? 'bg-blue-600' :
                node.level === 2 ? 'bg-green-600' :
                'bg-gray-600'
              }`}>
                {node.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{node.name}</div>
                <div className="text-xs text-gray-600">{node.designation}</div>
              </div>
            </div>

            <div className="mt-2 space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Building className="w-3 h-3" />
                {node.department}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {node.email}
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {node.phone}
              </div>
              <div className="flex items-center gap-1 text-blue-600 font-medium">
                <Users className="w-3 h-3" />
                {node.directReports} Direct Reports
              </div>
            </div>
          </div>

          {hasChildren && (
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {expanded ? (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function OrgTree({ node, level = 0 }: { node: OrgNode; level?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <OrgNodeCard node={node} expanded={expanded} onToggle={() => setExpanded(!expanded)} />

      {hasChildren && expanded && (
        <div className="relative mt-8">
          {/* Vertical connector */}
          <div className="absolute left-1/2 -top-8 w-0.5 h-8 bg-gray-300"></div>

          <div className="flex gap-8 relative">
            {/* Horizontal connector */}
            {node.children!.length > 1 && (
              <div
                className="absolute -top-4 h-0.5 bg-gray-300"
                style={{
                  left: '50%',
                  right: '50%',
                  transform: 'translateX(-50%)',
                  width: `${(node.children!.length - 1) * 300}px`
                }}
              ></div>
            )}

            {node.children!.map((child, index) => (
              <div key={child.id} className="relative flex flex-col items-center">
                {/* Vertical connector to child */}
                <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-gray-300"></div>

                <div style={{ minWidth: '280px' }}>
                  <OrgTree node={child} level={level + 1} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const emptyOrgNode: OrgNode = {
  id: '',
  name: 'No Data',
  designation: '',
  department: '',
  email: '',
  phone: '',
  level: 0,
  directReports: 0,
};

export default function OrgChartPage() {
  const [zoom, setZoom] = useState(100);
  const [orgData, setOrgData] = useState<OrgNode>(emptyOrgNode);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPagesService.employees<any[]>();
        const list = raw ?? [];
        // Build a lookup of OrgNode by id and track children.
        const nodeMap = new Map<string, OrgNode>();
        list.forEach((e) => {
          const id = String(e.id ?? '');
          const fullName = e.fullName || `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim();
          nodeMap.set(id, {
            id,
            name: fullName || (e.employeeCode ?? id),
            designation: e.designationId ? String(e.designationId) : '',
            department: e.departmentId ? String(e.departmentId) : '',
            email: e.companyEmail ?? e.personalEmail ?? '',
            phone: e.mobileNumber ?? '',
            level: 0,
            directReports: 0,
            children: [],
          });
        });
        const roots: OrgNode[] = [];
        list.forEach((e) => {
          const id = String(e.id ?? '');
          const node = nodeMap.get(id);
          if (!node) return;
          const managerId = e.reportingManagerId ? String(e.reportingManagerId) : null;
          const manager = managerId ? nodeMap.get(managerId) : undefined;
          if (manager) {
            manager.children = manager.children ?? [];
            manager.children.push(node);
          } else {
            roots.push(node);
          }
        });
        // Assign levels + directReports counts by walking from roots.
        const assign = (node: OrgNode, level: number) => {
          node.level = level;
          node.directReports = node.children?.length ?? 0;
          node.children?.forEach((c) => assign(c, level + 1));
        };
        let root: OrgNode;
        if (roots.length === 0) {
          root = emptyOrgNode;
        } else if (roots.length === 1) {
          root = roots[0];
          assign(root, 0);
        } else {
          // Multiple roots: wrap them under a synthetic organisation root.
          root = {
            id: 'org-root',
            name: 'Organization',
            designation: '',
            department: '',
            email: '',
            phone: '',
            level: 0,
            directReports: roots.length,
            children: roots,
          };
          roots.forEach((r) => assign(r, 1));
        }
        if (!cancelled) setOrgData(root);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load organization chart');
          setOrgData(emptyOrgNode);
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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));

  const totalEmployees = (node: OrgNode): number => {
    let count = 1;
    if (node.children) {
      node.children.forEach(child => {
        count += totalEmployees(child);
      });
    }
    return count;
  };

  const countByLevel = (node: OrgNode, level: number): number => {
    let count = node.level === level ? 1 : 0;
    if (node.children) {
      node.children.forEach(child => {
        count += countByLevel(child, level);
      });
    }
    return count;
  };

  const stats = {
    total: totalEmployees(orgData),
    executive: countByLevel(orgData, 0) + countByLevel(orgData, 1),
    management: countByLevel(orgData, 2),
    supervisory: countByLevel(orgData, 3),
    levels: 4
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Network className="w-7 h-7 text-blue-600" />
            Organization Chart
          </h1>
          <p className="text-gray-600 mt-1">Visual hierarchy of company structure</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading organization chart…
        </div>
      )}
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Total Employees</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Executive Level</div>
          <div className="text-2xl font-bold text-purple-600">{stats.executive}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Management</div>
          <div className="text-2xl font-bold text-blue-600">{stats.management}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Supervisory</div>
          <div className="text-2xl font-bold text-green-600">{stats.supervisory}</div>
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="text-sm text-gray-600 mb-1">Org Levels</div>
          <div className="text-2xl font-bold text-orange-600">{stats.levels}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleZoomOut}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={zoom <= 50}
            >
              <ZoomOut className="h-4 w-4" />
              Zoom Out
            </button>
            <div className="flex items-center px-4 py-2 bg-gray-50 rounded-lg">
              <span className="font-medium">{zoom}%</span>
            </div>
            <button
              onClick={handleZoomIn}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={zoom >= 150}
            >
              <ZoomIn className="h-4 w-4" />
              Zoom In
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export Chart
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-auto p-8">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s'
          }}
        >
          <OrgTree key={orgData.id} node={orgData} />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2">
          <Network className="w-5 h-5 inline mr-2" />
          Organization Chart Features
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ Interactive hierarchical visualization with expandable/collapsible nodes</li>
          <li>✓ Color-coded levels: Purple (Executive), Blue (C-Level), Green (Management), Gray (Supervisory)</li>
          <li>✓ Complete employee information: name, designation, department, contact details</li>
          <li>✓ Direct reports count for each position</li>
          <li>✓ Zoom controls (50%-150%) for detailed viewing</li>
          <li>✓ Export functionality for offline viewing and presentations</li>
        </ul>
      </div>
    </div>
  );
}
