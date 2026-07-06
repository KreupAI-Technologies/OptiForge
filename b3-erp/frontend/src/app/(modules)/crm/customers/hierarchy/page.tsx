'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ChevronDown, ChevronRight, Users, DollarSign, Package, MapPin, Phone, Mail, Globe, Plus, Edit, Trash2, Eye, Network, ArrowRight } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface CustomerNode {
  id: string;
  name: string;
  type: 'parent' | 'subsidiary' | 'branch' | 'division';
  industry: string;
  location: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  employees: number;
  annualRevenue: number;
  accountValue: number;
  activeContracts: number;
  relationshipStart: string;
  status: 'active' | 'inactive' | 'pending';
  children?: CustomerNode[];
}

interface HierarchyNodeProps {
  node: CustomerNode;
  level: number;
}

function HierarchyNode({ node, level }: HierarchyNodeProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'parent':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'subsidiary':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'branch':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'division':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'parent':
        return <Building2 className="w-5 h-5" />;
      case 'subsidiary':
        return <Network className="w-5 h-5" />;
      case 'branch':
        return <MapPin className="w-5 h-5" />;
      case 'division':
        return <Package className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  const hasChildren = node.children && node.children.length > 0;
  const indentClass = `ml-${level * 8}`;

  return (
    <div className="mb-2">
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="p-6">
          <div className="flex items-start gap-2">
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 p-1 hover:bg-gray-100 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-7"></div>}

            {/* Node Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(node.type)}`}>
                    {getTypeIcon(node.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{node.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(node.type)}`}>
                        {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
                      </span>
                      <span className="text-gray-600 text-sm">{node.industry}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/crm/customers/view/${node.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => router.push(`/crm/customers/edit/${node.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-2 mb-2 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </div>
                  <div className="text-gray-900 font-medium">{node.location}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <Users className="w-4 h-4" />
                    Contact Person
                  </div>
                  <div className="text-gray-900 font-medium">{node.contactPerson}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                  <div className="text-blue-600 hover:underline cursor-pointer">{node.email}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </div>
                  <div className="text-gray-900">{node.phone}</div>
                </div>
                {node.website && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <Globe className="w-4 h-4" />
                      Website
                    </div>
                    <div className="text-blue-600 hover:underline cursor-pointer">{node.website}</div>
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    Employees
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {node.employees.toLocaleString()}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
                    <DollarSign className="w-4 h-4" />
                    Annual Revenue
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    ${(node.annualRevenue / 1000000000).toFixed(1)}B
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-600 text-sm mb-1">
                    <DollarSign className="w-4 h-4" />
                    Account Value
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    ${(node.accountValue / 1000000).toFixed(1)}M
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-orange-600 text-sm mb-1">
                    <Package className="w-4 h-4" />
                    Active Contracts
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {node.activeContracts}
                  </div>
                </div>
              </div>

              {/* Relationship Info */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600">
                <span>Customer since: {new Date(node.relationshipStart).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  node.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {node.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-12 mt-4 pl-4 border-l-2 border-gray-200">
          {node.children!.map((child) => (
            <HierarchyNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomerHierarchyPage() {
  const router = useRouter();
  const [hierarchies, setHierarchies] = useState<CustomerNode[]>([]);

  useEffect(() => {
    let active = true;
    const mapNode = (n: any): CustomerNode => ({
      id: String(n?.id ?? ''),
      name: n?.name ?? '',
      type: 'parent',
      industry: n?.industry ?? '',
      location: n?.location ?? '',
      contactPerson: n?.contactPerson ?? '',
      email: n?.email ?? '',
      phone: n?.phone ?? '',
      employees: Number(n?.employees ?? 0),
      annualRevenue: Number(n?.annualRevenue ?? 0),
      accountValue: Number(n?.lifetimeValue ?? 0),
      activeContracts: Number(n?.activeContracts ?? 0),
      relationshipStart: n?.relationshipStart ?? '',
      status: (n?.status === 'inactive' ? 'inactive' : 'active') as CustomerNode['status'],
      children: Array.isArray(n?.children) ? n.children.map(mapNode) : [],
    });
    (async () => {
      try {
        const data = await crmService.customers.getHierarchy();
        if (!active) return;
        const rows = Array.isArray(data) ? data : [];
        setHierarchies(rows.map(mapNode));
      } catch {
        if (active) setHierarchies([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const calculateTotalStats = () => {
    const calculateNode = (node: CustomerNode): any => {
      let total = {
        customers: 1,
        employees: node.employees,
        revenue: node.annualRevenue,
        accountValue: node.accountValue,
        contracts: node.activeContracts,
      };

      if (node.children) {
        node.children.forEach((child) => {
          const childStats = calculateNode(child);
          total.customers += childStats.customers;
          total.employees += childStats.employees;
          total.revenue += childStats.revenue;
          total.accountValue += childStats.accountValue;
          total.contracts += childStats.contracts;
        });
      }

      return total;
    };

    let grandTotal = {
      customers: 0,
      employees: 0,
      revenue: 0,
      accountValue: 0,
      contracts: 0,
    };

    hierarchies.forEach((hierarchy) => {
      const stats = calculateNode(hierarchy);
      grandTotal.customers += stats.customers;
      grandTotal.employees += stats.employees;
      grandTotal.revenue += stats.revenue;
      grandTotal.accountValue += stats.accountValue;
      grandTotal.contracts += stats.contracts;
    });

    return grandTotal;
  };

  const stats = calculateTotalStats();

  return (
    <div className="w-full h-full px-3 py-2 ">
      <div className="mb-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.customers}</div>
            <div className="text-purple-100">Total Entities</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{(stats.employees / 1000).toFixed(0)}K</div>
            <div className="text-blue-100">Total Employees</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">
              ${(stats.revenue / 1000000000).toFixed(1)}B
            </div>
            <div className="text-green-100">Total Revenue</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">
              ${(stats.accountValue / 1000000).toFixed(1)}M
            </div>
            <div className="text-orange-100">Account Value</div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.contracts}</div>
            <div className="text-pink-100">Active Contracts</div>
          </div>
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="space-y-3">
        {hierarchies.map((hierarchy) => (
          <HierarchyNode key={hierarchy.id} node={hierarchy} level={0} />
        ))}
      </div>
    </div>
  );
}
