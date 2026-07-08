'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database, Building2, Package, Users, DollarSign, Globe, UserCog, Factory,
  ArrowRight, TrendingUp, FileText, CheckCircle, Clock, Search
} from 'lucide-react';
import { manufacturingMastersService } from '@/services/manufacturing-masters.service';

export default function CommonMastersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Live count badges for key master endpoints. Keyed by the master's path.
  const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const companyId = '1';
      // Map each master path to a loader that returns its record count.
      const loaders: Array<[string, () => Promise<{ length: number }>]> = [
        ['/common-masters/work-center-master', () => manufacturingMastersService.getAllWorkCenters(companyId)],
        ['/common-masters/routing-master', () => manufacturingMastersService.getAllRoutings(companyId)],
        ['/common-masters/machine-master', () => manufacturingMastersService.getAllMachines(companyId)],
        ['/common-masters/operation-master', () => manufacturingMastersService.getAllOperations(companyId)],
        ['/common-masters/skill-master', () => manufacturingMastersService.getAllSkills(companyId)],
        ['/common-masters/quality-parameter-master', () => manufacturingMastersService.getAllQualityParameters(companyId)],
        ['/common-masters/batch-lot-master', () => manufacturingMastersService.getAllBatches(companyId)],
      ];
      const results = await Promise.all(
        loaders.map(async ([path, fn]) => {
          try {
            const rows = await fn();
            return [path, Array.isArray(rows) ? rows.length : 0] as const;
          } catch {
            return [path, -1] as const; // -1 => failed to load, badge hidden
          }
        }),
      );
      if (!cancelled) {
        setLiveCounts(Object.fromEntries(results));
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Master category definitions with navigation
  const masterCategories = [
    {
      title: 'Organization & Company',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBg: 'hover:bg-blue-100',
      count: 8,
      activeCount: 7,
      description: 'Company, branches, departments, cost centers',
      masters: [
        { name: 'Company Master', path: '/common-masters/company-master' },
        { name: 'Branch Master', path: '/common-masters/branch-master' },
        { name: 'Department Master', path: '/common-masters/department-master' },
        { name: 'Cost Center Master', path: '/common-masters/cost-center-master' }
      ]
    },
    {
      title: 'Product & Items',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverBg: 'hover:bg-green-100',
      count: 8,
      activeCount: 8,
      description: 'Items, categories, brands, UOM, barcodes',
      masters: [
        { name: 'Item Master', path: '/common-masters/item-master' },
        { name: 'Item Group Master', path: '/common-masters/item-group-master' },
        { name: 'Item Category Master', path: '/common-masters/item-category-master' },
        { name: 'Brand Master', path: '/common-masters/brand-master' }
      ]
    },
    {
      title: 'Customer & Vendor',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverBg: 'hover:bg-purple-100',
      count: 4,
      activeCount: 4,
      description: 'Customers, vendors, categories',
      masters: [
        { name: 'Customer Master', path: '/common-masters/customer-master' },
        { name: 'Vendor Master', path: '/common-masters/vendor-master' },
        { name: 'Customer Category', path: '/common-masters/customer-category-master' },
        { name: 'Vendor Category', path: '/common-masters/vendor-category-master' }
      ]
    },
    {
      title: 'Financial',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      hoverBg: 'hover:bg-yellow-100',
      count: 5,
      activeCount: 5,
      description: 'Accounts, banks, taxes, payment terms',
      masters: [
        { name: 'Chart of Accounts', path: '/common-masters/chart-of-accounts-master' },
        { name: 'Bank Master', path: '/common-masters/bank-master' },
        { name: 'Tax Master', path: '/common-masters/tax-master' },
        { name: 'Payment Terms', path: '/common-masters/payment-terms-master' }
      ]
    },
    {
      title: 'Geographic',
      icon: Globe,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      hoverBg: 'hover:bg-indigo-100',
      count: 4,
      activeCount: 4,
      description: 'Countries, states, cities, territories',
      masters: [
        { name: 'Country Master', path: '/common-masters/country-master' },
        { name: 'State Master', path: '/common-masters/state-master' },
        { name: 'City Master', path: '/common-masters/city-master' },
        { name: 'Territory Master', path: '/common-masters/territory-master' }
      ]
    },
    {
      title: 'Human Resources',
      icon: UserCog,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      hoverBg: 'hover:bg-pink-100',
      count: 4,
      activeCount: 3,
      description: 'Employees, designations, shifts',
      masters: [
        { name: 'Employee Master', path: '/common-masters/employee-master' },
        { name: 'Designation Master', path: '/common-masters/designation-master' },
        { name: 'Shift Master', path: '/common-masters/shift-master' },
        { name: 'Skill Master', path: '/common-masters/skill-master' }
      ]
    },
    {
      title: 'Manufacturing',
      icon: Factory,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      hoverBg: 'hover:bg-orange-100',
      count: 4,
      activeCount: 4,
      description: 'Machines, work centers, operations',
      masters: [
        { name: 'Machine Master', path: '/common-masters/machine-master' },
        { name: 'Work Center Master', path: '/common-masters/work-center-master' },
        { name: 'Operation Master', path: '/common-masters/operation-master' },
        { name: 'Routing Master', path: '/common-masters/routing-master' }
      ]
    },
    {
      title: 'Kitchen Specific',
      icon: Package,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      hoverBg: 'hover:bg-red-100',
      count: 4,
      activeCount: 4,
      description: 'Cabinets, hardware, finishes, materials',
      masters: [
        { name: 'Cabinet Type Master', path: '/common-masters/cabinet-type-master' },
        { name: 'Hardware Master', path: '/common-masters/hardware-master' },
        { name: 'Finish Master', path: '/common-masters/finish-master' },
        { name: 'Material Grade Master', path: '/common-masters/material-grade-master' }
      ]
    }
  ];

  // Calculate total statistics
  const totalMasters = masterCategories.reduce((sum, cat) => sum + cat.count, 0);
  const totalActive = masterCategories.reduce((sum, cat) => sum + cat.activeCount, 0);
  const recentlyUpdated = 8;

  // Filter categories based on search
  const filteredCategories = masterCategories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.masters.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-3 py-2">
          <div className="w-full space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Database className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Common Master Files</h1>
                    <p className="text-gray-600">Centralized management of all master data</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-3xl font-bold mb-1">{totalMasters}</div>
                <div className="text-blue-100 text-sm">Total Master Types</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-3xl font-bold mb-1">{totalActive}</div>
                <div className="text-green-100 text-sm">Active Masters</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-3xl font-bold mb-1">{recentlyUpdated}</div>
                <div className="text-purple-100 text-sm">Recently Updated</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Database className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-3xl font-bold mb-1">8</div>
                <div className="text-orange-100 text-sm">Categories</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search master files by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Master Categories - Clickable Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <div
                    key={index}
                    className={`${category.bgColor} border-2 ${category.borderColor} rounded-xl p-3 shadow-md hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Icon className={`w-8 h-8 ${category.color}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-gray-700 font-medium">
                        <FileText className="w-4 h-4" />
                        {category.count} Masters
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full text-green-700 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        {category.activeCount} Active
                      </span>
                    </div>

                    <div className="space-y-2">
                      {category.masters.slice(0, 4).map((master) => {
                        const liveCount = liveCounts[master.path];
                        return (
                          <Link
                            key={master.path}
                            href={master.path}
                            className={`group flex items-center justify-between px-4 py-2 bg-white rounded-lg ${category.hoverBg} border border-gray-200 hover:border-gray-300 transition-all duration-200`}
                          >
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                              {master.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {liveCount !== undefined && liveCount >= 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                  {liveCount}
                                </span>
                              )}
                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-md p-8">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Master Data Management Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Centralized Data</h3>
                  <p className="text-sm text-gray-600">All master data in one unified system for consistent information across modules</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Role-Based Access</h3>
                  <p className="text-sm text-gray-600">Controlled access to master data with role-based permissions and audit trails</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                    <Factory className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Integration Ready</h3>
                  <p className="text-sm text-gray-600">Seamless integration with all ERP modules for real-time data synchronization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}