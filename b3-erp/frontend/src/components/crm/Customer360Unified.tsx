'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { crmService, asArray } from '@/services/crm.service';
import {
  Building2,
  User,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  PhoneCall,
  Video,
  Users,
  Star,
  Edit,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Award,
  Briefcase,
  Receipt,
  ShoppingCart,
  Wrench,
  HeadphonesIcon,
  Send,
  Plus,
  Filter
} from 'lucide-react';

// Types
interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
  avatar?: string;
  lastContact?: Date;
}

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'deal' | 'order' | 'support';
  title: string;
  description: string;
  date: Date;
  user: string;
  outcome?: string;
  relatedTo?: { type: string; name: string; id: string };
}

interface Opportunity {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  expectedClose: Date;
  owner: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  value: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  assignee: string;
}

interface Customer {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  type: 'Enterprise' | 'Mid-Market' | 'SMB' | 'Startup';
  status: 'active' | 'inactive' | 'prospect' | 'churned';
  website: string;
  phone: string;
  email: string;
  address: { street: string; city: string; state: string; country: string; zip: string };
  owner: { id: string; name: string; avatar?: string };
  createdAt: Date;
  contacts: Contact[];
  healthScore: number;
  lifetimeValue: number;
  annualRevenue: number;
  lastOrderDate?: Date;
  openOpportunities: number;
  openOpportunitiesValue: number;
  tags: string[];
}

interface Customer360UnifiedProps {
  customer?: Customer;
  activities?: Activity[];
  opportunities?: Opportunity[];
  orders?: Order[];
  supportTickets?: SupportTicket[];
  onEditCustomer?: () => void;
  onAddActivity?: (type: string) => void;
  onViewOpportunity?: (id: string) => void;
  onViewOrder?: (id: string) => void;
  onViewTicket?: (id: string) => void;
}

// Empty customer template used before real data loads from the API.
const buildEmptyCustomer = (): Customer => ({
  id: '',
  name: '',
  industry: '',
  type: 'Enterprise',
  status: 'active',
  website: '',
  phone: '',
  email: '',
  address: { street: '', city: '', state: '', country: '', zip: '' },
  owner: { id: '', name: '' },
  createdAt: new Date(),
  contacts: [],
  healthScore: 0,
  lifetimeValue: 0,
  annualRevenue: 0,
  lastOrderDate: undefined,
  openOpportunities: 0,
  openOpportunitiesValue: 0,
  tags: [],
});

const toDate = (v: any): Date => {
  const d = v ? new Date(v) : new Date(NaN);
  return isNaN(d.getTime()) ? new Date() : d;
};

const mapCustomer = (c: any): Customer => ({
  id: String(c?.id ?? ''),
  name: c?.customerName ?? c?.name ?? '',
  industry: c?.industrySector ?? c?.industry ?? '',
  type: (c?.type ?? 'Enterprise') as Customer['type'],
  status: (['active', 'inactive', 'prospect', 'churned'].includes(c?.status) ? c.status : 'active') as Customer['status'],
  website: c?.website ?? '',
  phone: c?.generalPhone ?? c?.phone ?? '',
  email: c?.generalEmail ?? c?.email ?? '',
  address: {
    street: c?.address?.street ?? c?.buildingFlat ?? '',
    city: c?.address?.city ?? c?.city ?? '',
    state: c?.address?.state ?? c?.state ?? '',
    country: c?.address?.country ?? c?.country ?? '',
    zip: c?.address?.zip ?? c?.pinCode ?? '',
  },
  owner: { id: String(c?.owner?.id ?? ''), name: c?.owner?.name ?? c?.accountManager ?? '' },
  createdAt: toDate(c?.customerSince ?? c?.createdAt),
  contacts: [],
  healthScore: Number(c?.healthScore ?? 0),
  lifetimeValue: Number(c?.lifetimeValue ?? 0),
  annualRevenue: Number(c?.annualRevenue ?? 0),
  lastOrderDate: c?.lastOrderDate ? toDate(c.lastOrderDate) : undefined,
  openOpportunities: Number(c?.openOpportunities ?? 0),
  openOpportunitiesValue: Number(c?.openOpportunitiesValue ?? 0),
  tags: Array.isArray(c?.tags) ? c.tags : [],
});

const mapContacts = (rows: any[]): Contact[] =>
  rows.map((c: any, i: number) => ({
    id: String(c?.id ?? i),
    name: c?.name ?? [c?.firstName, c?.lastName].filter(Boolean).join(' ').trim(),
    title: c?.title ?? c?.jobTitle ?? '',
    email: c?.email ?? '',
    phone: c?.phone ?? c?.mobile ?? '',
    isPrimary: Boolean(c?.isPrimary),
    lastContact: c?.lastContact ? toDate(c.lastContact) : undefined,
  }));

const mapActivities = (rows: any[]): Activity[] =>
  rows.map((a: any, i: number) => ({
    id: String(a?.id ?? i),
    type: (['call', 'email', 'meeting', 'note', 'task', 'deal', 'order', 'support'].includes(a?.type)
      ? a.type
      : 'note') as Activity['type'],
    title: a?.subject ?? a?.title ?? 'Activity',
    description: a?.description ?? a?.notes ?? '',
    date: toDate(a?.startDate ?? a?.createdAt),
    user: a?.performedByName ?? a?.assignedToName ?? a?.user ?? 'System',
    outcome: a?.outcome ?? undefined,
  }));

const mapOpportunities = (rows: any[]): Opportunity[] =>
  rows.map((o: any, i: number) => ({
    id: String(o?.id ?? i),
    name: o?.name ?? o?.title ?? '',
    value: Number(o?.value ?? o?.amount ?? 0),
    stage: o?.stage ?? o?.stageName ?? '',
    probability: Number(o?.probability ?? 0),
    expectedClose: toDate(o?.expectedClose ?? o?.expectedCloseDate ?? o?.closeDate),
    owner: o?.ownerName ?? o?.owner ?? '',
  }));

const mapOrders = (rows: any[]): Order[] =>
  rows.map((q: any, i: number) => ({
    id: String(q?.id ?? i),
    orderNumber: q?.quoteNumber ?? q?.orderNumber ?? q?.number ?? q?.id ?? `Q-${i + 1}`,
    date: toDate(q?.createdAt ?? q?.sentDate),
    value: Number(q?.totalAmount ?? q?.amount ?? q?.value ?? 0),
    status: (['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(q?.status)
      ? q.status
      : q?.status === 'accepted'
      ? 'delivered'
      : q?.status === 'rejected'
      ? 'cancelled'
      : 'processing') as Order['status'],
    items: Array.isArray(q?.items) ? q.items.length : Number(q?.itemCount ?? 0),
  }));

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format date
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Format relative time
const formatRelativeTime = (date: Date) => {
  const now = Date.now();
  const diff = now - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(date);
};

// Activity icon mapping
const getActivityIcon = (type: string) => {
  const icons: Record<string, React.ElementType> = {
    call: PhoneCall,
    email: Mail,
    meeting: Video,
    note: FileText,
    task: CheckCircle,
    deal: Target,
    order: ShoppingCart,
    support: HeadphonesIcon,
  };
  return icons[type] || Activity;
};

// Activity color mapping
const getActivityColor = (type: string) => {
  const colors: Record<string, string> = {
    call: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    email: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    meeting: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    note: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    task: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    deal: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    order: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
    support: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
};

/**
 * Customer360Unified - Comprehensive customer view with timeline integration
 * Shows customer details, contacts, activities, opportunities, orders, and support
 */
export function Customer360Unified({
  customer: propCustomer,
  activities: propActivities,
  opportunities: propOpportunities,
  orders: propOrders,
  supportTickets: propTickets,
  onEditCustomer,
  onAddActivity,
  onViewOpportunity,
  onViewOrder,
  onViewTicket,
}: Customer360UnifiedProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'opportunities' | 'orders' | 'support'>('timeline');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [expandedContact, setExpandedContact] = useState<string | null>(null);

  // Live-loaded data. When the parent supplies props we use those; otherwise
  // the component fetches the first available customer and its related records.
  const [loadedCustomer, setLoadedCustomer] = useState<Customer | null>(null);
  const [loadedActivities, setLoadedActivities] = useState<Activity[]>([]);
  const [loadedOpportunities, setLoadedOpportunities] = useState<Opportunity[]>([]);
  const [loadedOrders, setLoadedOrders] = useState<Order[]>([]);
  const [loadedTickets, setLoadedTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    if (propCustomer) return; // parent-driven; nothing to fetch
    let cancelled = false;
    (async () => {
      try {
        const list: any[] = asArray(await crmService.customers.getAll());
        const first = list[0];
        if (!first?.id) return;
        const cid = String(first.id);

        const base = mapCustomer(first);
        if (!cancelled) setLoadedCustomer(base);

        const [contactsRaw, activitiesRaw, opportunitiesRaw, quotesRaw, ticketsRaw] = await Promise.all([
          crmService.customers.getContacts(cid).catch(() => []),
          crmService.customers.getActivities(cid).catch(() => []),
          crmService.customers.getOpportunities(cid).catch(() => []),
          crmService.customers.getQuotes(cid).catch(() => []),
          crmService.tickets
            .getAll({ customerId: cid } as any)
            .then((r: any) => (Array.isArray(r) ? r : r?.data ?? []))
            .catch(() => []),
        ]);

        if (cancelled) return;
        setLoadedCustomer({ ...base, contacts: mapContacts(asArray(contactsRaw)) });
        setLoadedActivities(mapActivities(asArray(activitiesRaw)));
        setLoadedOpportunities(mapOpportunities(asArray(opportunitiesRaw)));
        setLoadedOrders(mapOrders(asArray(quotesRaw)));
        setLoadedTickets(
          asArray<any>(ticketsRaw).map((t: any, i: number) => ({
            id: String(t?.id ?? i),
            ticketNumber: t?.ticketNumber ?? t?.number ?? t?.id ?? `TKT-${i + 1}`,
            subject: t?.subject ?? t?.title ?? '',
            status: (['open', 'in-progress', 'resolved', 'closed'].includes(t?.status)
              ? t.status
              : 'open') as SupportTicket['status'],
            priority: (['low', 'medium', 'high', 'urgent'].includes(t?.priority)
              ? t.priority
              : 'medium') as SupportTicket['priority'],
            createdAt: toDate(t?.createdAt),
            assignee: t?.assigneeName ?? t?.assignee ?? '',
          })),
        );
      } catch {
        // keep empty state on failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [propCustomer]);

  const customer = propCustomer || loadedCustomer || buildEmptyCustomer();
  const activities = propActivities || loadedActivities;
  const opportunities = propOpportunities || loadedOpportunities;
  const orders = propOrders || loadedOrders;
  const supportTickets = propTickets || loadedTickets;

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (activityFilter === 'all') return activities;
    return activities.filter(a => a.type === activityFilter);
  }, [activities, activityFilter]);

  // Health score color
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      prospect: 'bg-blue-100 text-blue-700',
      churned: 'bg-red-100 text-red-700',
    };
    return styles[status] || styles.inactive;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Customer Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className=" px-6 py-2">
          <div className="flex items-start justify-between">
            {/* Customer Info */}
            <div className="flex items-start gap-2">
              {/* Logo */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {customer.name.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(customer.status)}`}>
                    {customer.status}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                    {customer.type}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {customer.industry}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <a href={`https://${customer.website}`} className="hover:text-blue-600">{customer.website}</a>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {customer.address.city}, {customer.address.state}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {customer.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAddActivity?.('call')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200"
              >
                <Phone className="w-4 h-4" />
                Call
              </button>
              <button
                onClick={() => onAddActivity?.('email')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200"
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                onClick={() => onAddActivity?.('meeting')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Calendar className="w-4 h-4" />
                Schedule
              </button>
              <button
                onClick={onEditCustomer}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Edit className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-6 gap-2 mt-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Health Score</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getHealthColor(customer.healthScore)}`}>
                  {customer.healthScore}
                </div>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-2">
                <div
                  className={`h-full rounded-full ${
                    customer.healthScore >= 80 ? 'bg-green-500' :
                    customer.healthScore >= 60 ? 'bg-yellow-500' :
                    customer.healthScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${customer.healthScore}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Lifetime Value</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(customer.lifetimeValue)}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Annual Revenue</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(customer.annualRevenue)}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Open Pipeline</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(customer.openOpportunitiesValue)}</p>
              <p className="text-xs text-gray-400">{customer.openOpportunities} opportunities</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Last Order</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {customer.lastOrderDate ? formatRelativeTime(customer.lastOrderDate) : 'N/A'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Account Owner</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{customer.owner.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=" px-6 py-2">
        <div className="grid grid-cols-3 gap-3">
          {/* Left Column - Contacts */}
          <div className="col-span-1 space-y-3">
            {/* Contacts Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Contacts ({customer.contacts.length})
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">+ Add</button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {customer.contacts.map(contact => (
                  <div
                    key={contact.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => setExpandedContact(expandedContact === contact.id ? null : contact.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                            {contact.isPrimary && (
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{contact.title}</p>
                        </div>
                      </div>
                      {expandedContact === contact.id ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    {expandedContact === contact.id && (
                      <div className="mt-3 pl-13 space-y-2">
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                          <Mail className="w-4 h-4" />
                          {contact.email}
                        </a>
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </a>
                        {contact.lastContact && (
                          <p className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            Last contact: {formatRelativeTime(contact.lastContact)}
                          </p>
                        )}
                        <div className="flex gap-2 pt-2">
                          <button className="flex-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200">
                            Call
                          </button>
                          <button className="flex-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200">
                            Email
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Orders</span>
                  <span className="font-medium text-gray-900 dark:text-white">{orders.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Open Tickets</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {supportTickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Activities (30d)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{activities.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Customer Since</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(customer.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Timeline & Tabs */}
          <div className="col-span-2">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 mb-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              {[
                { id: 'timeline', label: 'Timeline', icon: Activity },
                { id: 'opportunities', label: 'Opportunities', icon: Target, count: opportunities.length },
                { id: 'orders', label: 'Orders', icon: ShoppingCart, count: orders.length },
                { id: 'support', label: 'Support', icon: HeadphonesIcon, count: supportTickets.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                {/* Timeline Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Activity Timeline</h3>
                    <select
                      value={activityFilter}
                      onChange={e => setActivityFilter(e.target.value)}
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700"
                    >
                      <option value="all">All Activities</option>
                      <option value="call">Calls</option>
                      <option value="email">Emails</option>
                      <option value="meeting">Meetings</option>
                      <option value="note">Notes</option>
                      <option value="deal">Deals</option>
                      <option value="order">Orders</option>
                      <option value="support">Support</option>
                    </select>
                  </div>
                  <button
                    onClick={() => onAddActivity?.('note')}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Log Activity
                  </button>
                </div>

                {/* Timeline Items */}
                <div className="p-4">
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                    {/* Activities */}
                    <div className="space-y-3">
                      {filteredActivities.map((activity, idx) => {
                        const Icon = getActivityIcon(activity.type);
                        const colorClass = getActivityColor(activity.type);

                        return (
                          <div key={activity.id} className="relative flex gap-2">
                            {/* Icon */}
                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                              <Icon className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                                </div>
                                <span className="text-xs text-gray-400">{formatRelativeTime(activity.date)}</span>
                              </div>

                              {activity.outcome && (
                                <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  {activity.outcome}
                                </p>
                              )}

                              {activity.relatedTo && (
                                <button className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  {activity.relatedTo.type}: {activity.relatedTo.name}
                                </button>
                              )}

                              <p className="text-xs text-gray-400 mt-2">by {activity.user}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Opportunities Tab */}
            {activeTab === 'opportunities' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Open Opportunities</h3>
                  <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                    <Plus className="w-4 h-4" />
                    New Opportunity
                  </button>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {opportunities.map(opp => (
                    <div
                      key={opp.id}
                      onClick={() => onViewOpportunity?.(opp.id)}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{opp.name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{opp.stage}</span>
                            <span>{opp.probability}% probability</span>
                            <span>Close: {formatDate(opp.expectedClose)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(opp.value)}</p>
                          <p className="text-xs text-gray-400">{opp.owner}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Order History</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => onViewOrder?.(order.id)}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span>{formatDate(order.date)}</span>
                            <span>{order.items} items</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(order.value)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Support Tickets</h3>
                  <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                    <Plus className="w-4 h-4" />
                    New Ticket
                  </button>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {supportTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => onViewTicket?.(ticket.id)}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">{ticket.ticketNumber}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white mt-1">{ticket.subject}</h4>
                          <p className="text-sm text-gray-500 mt-1">{formatDate(ticket.createdAt)} • {ticket.assignee}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                          ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                          ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {ticket.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Customer360Unified;
