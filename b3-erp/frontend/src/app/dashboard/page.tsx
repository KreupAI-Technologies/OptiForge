'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  ShoppingCart,
  Package,
  Factory,
  DollarSign,
  UserCog,
  ShoppingBag,
  Calculator,
  Workflow,
  BarChart3,
  Truck,
  Headphones,
  Settings,
  Search,
  Bell,
  User,
  Menu,
  ChevronDown,
  Wrench,
  FolderKanban,
  Zap,
} from 'lucide-react';
import MegaMenu from '@/components/MegaMenu';
import Sidebar from '@/components/Sidebar';
import { StatHighlight, ModuleLink, PremiumCard } from '@/components/dashboard/DashboardWidgets';
import {
  dashboardOverviewService,
  type DashboardOverviewMetrics,
} from '@/services/dashboard-overview.service';

// Module definitions
const modules = [
  {
    id: 'crm',
    name: 'CRM',
    description: 'Customer Relationship Management',
    icon: Users,
    href: '/crm',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    stats: { total: 1234, new: 45 },
  },
  {
    id: 'sales',
    name: 'Sales',
    description: 'Sales Order Management',
    icon: ShoppingCart,
    href: '/sales',
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    stats: { total: 856, new: 23 },
  },
  {
    id: 'estimation',
    name: 'Estimation',
    description: 'Cost Estimation & Quotations',
    icon: Calculator,
    href: '/estimation',
    color: 'bg-gradient-to-br from-purple-500 to-pink-600',
    stats: { total: 432, new: 12 },
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Warehouse & Stock Management',
    icon: Package,
    href: '/inventory',
    color: 'bg-gradient-to-br from-orange-500 to-amber-600',
    stats: { total: 3421, new: 87 },
  },
  {
    id: 'production',
    name: 'Production',
    description: 'Production Planning & Control',
    icon: Factory,
    href: '/production',
    color: 'bg-gradient-to-br from-red-500 to-rose-600',
    stats: { total: 234, new: 15 },
  },
  {
    id: 'procurement',
    name: 'Procurement',
    description: 'Purchase Order Management',
    icon: ShoppingBag,
    href: '/procurement',
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    stats: { total: 567, new: 28 },
  },
  {
    id: 'project-management',
    name: 'Project Management',
    description: 'Manufacturing Project Execution',
    icon: FolderKanban,
    href: '/project-management/dashboard',
    color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    stats: { total: 10, new: 2 },
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Financial Accounting',
    icon: DollarSign,
    href: '/finance',
    color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    stats: { total: 2341, new: 156 },
  },
  {
    id: 'hr',
    name: 'HR',
    description: 'Human Resource Management',
    icon: UserCog,
    href: '/hr',
    color: 'bg-gradient-to-br from-pink-500 to-rose-600',
    stats: { total: 145, new: 3 },
  },
  {
    id: 'workflow',
    name: 'Workflow',
    description: 'Workflow Automation',
    icon: Workflow,
    href: '/workflow',
    color: 'bg-gradient-to-br from-cyan-500 to-teal-600',
    stats: { total: 89, new: 7 },
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Report Generation & Analytics',
    icon: BarChart3,
    href: '/reports',
    color: 'bg-gradient-to-br from-teal-500 to-emerald-600',
    stats: { total: 432, new: 21 },
  },
  {
    id: 'logistics',
    name: 'Logistics',
    description: 'Logistics & Transportation',
    icon: Truck,
    href: '/logistics',
    color: 'bg-gradient-to-br from-lime-500 to-green-600',
    stats: { total: 312, new: 18 },
  },
  {
    id: 'after-sales-service',
    name: 'After Sales Service',
    description: 'Service Contracts & Field Support',
    icon: Wrench,
    href: '/after-sales-service/dashboard',
    color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    stats: { total: 287, new: 24 },
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Customer Support & Incidents',
    icon: Headphones,
    href: '/support',
    color: 'bg-gradient-to-br from-rose-500 to-red-600',
    stats: { total: 156, new: 9 },
  },
  {
    id: 'it-admin',
    name: 'IT Admin',
    description: 'System Administration',
    icon: Settings,
    href: '/it-admin',
    color: 'bg-gradient-to-br from-gray-500 to-slate-600',
    stats: { total: 45, new: 2 },
  },
];

function formatCount(n: number): string {
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString('en-IN');
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardOverviewMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    dashboardOverviewService
      .getOverview()
      .then((res) => {
        if (active) setMetrics(res.metrics);
      })
      .finally(() => {
        if (active) setMetricsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredModules = modules.filter((module) => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const megaMenuItems = [
    { id: 'sales', name: 'Sales & Marketing' },
    { id: 'operations', name: 'Operations' },
    { id: 'projects', name: 'Projects' },
    { id: 'admin', name: 'Admin & Support' },
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
        {/* Header - Glassmorphism */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-sm flex-shrink-0">
          <div className="w-full px-4">
            <div className="flex justify-between items-center h-12">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="relative w-8 h-8 flex-shrink-0 bg-white rounded-lg p-1 shadow-inner border border-gray-100">
                    <Image
                      src="/optiforge-logo.png"
                      alt="OptiForge Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-brand-blue tracking-tighter leading-none drop-shadow-sm">OptiForge</h1>
                    <p className="text-[8px] text-blue-400 font-black uppercase tracking-[0.2em] mt-0.5">Manufacturing OS</p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="hidden xl:flex items-center space-x-1 bg-gray-100/50 p-0.5 rounded-xl">
                {megaMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMegaMenu(activeMegaMenu === item.id ? null : item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${activeMegaMenu === item.id
                      ? 'bg-white text-blue-600 shadow-sm font-bold'
                      : 'text-gray-500 hover:text-blue-600 hover:bg-white/50 font-medium'
                      }`}
                  >
                    <span className="text-xs">{item.name}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${activeMegaMenu === item.id ? 'rotate-180' : ''}`} />
                  </button>
                ))}
              </nav>

              <div className="flex items-center space-x-3">
                <div className="relative hidden md:block group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 pl-9 pr-3 py-1.5 bg-gray-100/80 border-transparent rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-all rounded-lg hover:bg-white shadow-sm border border-transparent hover:border-blue-100">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse shadow-sm"></span>
                </button>
                <div className="h-6 w-[1px] bg-gray-200 hidden md:block"></div>
                <button className="flex items-center space-x-2 p-1 bg-white/50 rounded-lg border border-white/50 hover:bg-white hover:border-blue-100 transition-all shadow-sm">
                  <div className="h-7 w-7 bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-700 rounded-md flex items-center justify-center shadow-md transform active:scale-95 transition-transform">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-tight leading-none mb-0.5 whitespace-nowrap">Root Admin</p>
                    <p className="text-[8px] text-gray-500 font-bold whitespace-nowrap">Superuser</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {activeMegaMenu && (
            <MegaMenu activeMenu={activeMegaMenu} onClose={() => setActiveMegaMenu(null)} />
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-[1920px] mx-auto space-y-4">
            {/* Page Title & Quick Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">Command Center</h2>
                <p className="text-sm text-gray-500 font-medium">Enterprise Orchestration & Real-time Oversight</p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-black uppercase tracking-tight text-[10px] hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all shadow-md">
                <Zap className="h-4 w-4" />
                <span>Quick Actions</span>
              </button>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <StatHighlight
                label="Orders Flow"
                value={metricsLoading ? '—' : formatCount(metrics?.totalOrders ?? 0)}
                subValue={metricsLoading ? 'Loading…' : `${formatCount(metrics?.customers ?? 0)} customers`}
                icon={ShoppingCart}
                colorClass="bg-blue-600"
              />
              <StatHighlight
                label="Invoices"
                value={metricsLoading ? '—' : formatCount(metrics?.totalInvoices ?? 0)}
                subValue={metricsLoading ? 'Loading…' : `${formatCount(metrics?.openTickets ?? 0)} open tickets`}
                icon={DollarSign}
                colorClass="bg-emerald-600"
              />
              <StatHighlight
                label="Manufacturing"
                value={metricsLoading ? '—' : formatCount(metrics?.production ?? 0)}
                subValue={metricsLoading ? 'Loading…' : `${formatCount(metrics?.employees ?? 0)} employees`}
                icon={Factory}
                colorClass="bg-orange-600"
              />
              <StatHighlight
                label="Stock Level"
                value={metricsLoading ? '—' : formatCount(metrics?.inventoryItems ?? 0)}
                subValue={metricsLoading ? 'Loading…' : '• Live stock catalog'}
                icon={Package}
                colorClass="bg-indigo-600"
              />
            </div>

            {/* Module Grid Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-1.5 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Active Modules</h3>
                </div>
                <div className="flex bg-gray-100/50 p-0.5 rounded-lg">
                  {['All', 'Operations', 'Finance'].map(tab => (
                    <button key={tab} className={`px-3 py-1 text-[10px] font-black uppercase tracking-tight rounded-md transition-all ${tab === 'All' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {filteredModules.map((module) => (
                  <ModuleLink
                    key={module.id}
                    name={module.name}
                    description={module.description}
                    href={module.href}
                    icon={module.icon}
                    color={module.color}
                    stats={module.stats}
                  />
                ))}
              </div>

              {filteredModules.length === 0 && (
                <PremiumCard className="p-16 flex flex-col items-center justify-center text-center">
                  <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Search className="h-10 w-10 text-blue-200" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">No results matching "{searchQuery}"</h3>
                  <p className="text-gray-500 max-w-md font-medium">Try searching for a different keyword or explore our full module catalog.</p>
                </PremiumCard>
              )}
            </div>

            {/* Intelligence Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <PremiumCard className="lg:col-span-2 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-black text-gray-900">Production Intelligence</h3>
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight mb-1">Active Jobs</p>
                    <p className="text-2xl font-black text-blue-900">47</p>
                    <p className="text-[9px] text-blue-500 font-medium">↑ 12 from yesterday</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-xl">
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-tight mb-1">Completed Today</p>
                    <p className="text-2xl font-black text-green-900">23</p>
                    <p className="text-[9px] text-green-500 font-medium">↑ 8% efficiency</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-xl">
                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-tight mb-1">On Hold</p>
                    <p className="text-2xl font-black text-orange-900">5</p>
                    <p className="text-[9px] text-orange-500 font-medium">Awaiting materials</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-xl">
                    <p className="text-[10px] font-bold text-purple-600 uppercase tracking-tight mb-1">Machine Util.</p>
                    <p className="text-2xl font-black text-purple-900">87%</p>
                    <p className="text-[9px] text-purple-500 font-medium">↑ 3% this week</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-gray-700">CNC Machine #1</span>
                    </div>
                    <span className="text-[10px] font-black text-green-600 uppercase">Running</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-gray-700">Edge Bander #2</span>
                    </div>
                    <span className="text-[10px] font-black text-green-600 uppercase">Running</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-gray-700">Laser Cutter #1</span>
                    </div>
                    <span className="text-[10px] font-black text-yellow-600 uppercase">Maintenance</span>
                  </div>
                </div>
              </PremiumCard>
              <PremiumCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-black text-gray-900">Recent Activity</h3>
                  <UserCog className="w-5 h-5 text-purple-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">New order #SO-2456</p>
                      <p className="text-[10px] text-gray-500">Kitchen Project - ₹4.5L</p>
                    </div>
                    <span className="text-[9px] text-gray-400 whitespace-nowrap">2m ago</span>
                  </div>
                  <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">Stock received</p>
                      <p className="text-[10px] text-gray-500">Marine Plywood - 50 sheets</p>
                    </div>
                    <span className="text-[9px] text-gray-400 whitespace-nowrap">15m ago</span>
                  </div>
                  <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Factory className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">Production complete</p>
                      <p className="text-[10px] text-gray-500">WO-1892 - 45 cabinets</p>
                    </div>
                    <span className="text-[9px] text-gray-400 whitespace-nowrap">1h ago</span>
                  </div>
                  <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">Dispatch scheduled</p>
                      <p className="text-[10px] text-gray-500">DO-892 - Mumbai Site</p>
                    </div>
                    <span className="text-[9px] text-gray-400 whitespace-nowrap">2h ago</span>
                  </div>
                </div>
              </PremiumCard>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-gray-100 flex-shrink-0">
          <div className="w-full px-4 py-2 flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-3">
              <div className="text-left border-l-2 border-blue-600 pl-3">
                <p className="text-xs font-black text-gray-900 tracking-tight">OptiForge <span className="text-blue-600">v4.0 Platinum</span></p>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em]">© 2026 KreupAI Technologies LLC</p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div className="flex space-x-4">
                {['Help Center', 'API Docs', 'Legal'].map(link => (
                  <Link key={link} href="#" className="text-[9px] font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-tight">{link}</Link>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200"></div>
                <span className="text-[9px] font-black text-green-600 uppercase tracking-tight">System Operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
