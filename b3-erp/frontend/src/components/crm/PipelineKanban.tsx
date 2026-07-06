'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { crmService, asArray } from '@/services/crm.service';
import {
  DollarSign,
  Calendar,
  User,
  MoreVertical,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  Building2,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  GripVertical,
  Sparkles,
  Target,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

// Types
interface Opportunity {
  id: string;
  name: string;
  company: string;
  companyLogo?: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  expectedCloseDate: Date;
  owner: { id: string; name: string; avatar?: string };
  contacts: { name: string; role: string; email: string }[];
  daysInStage: number;
  lastActivity: Date;
  activityCount: number;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  health: 'healthy' | 'at-risk' | 'stale';
  source: string;
  notes?: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  probability: number;
  order: number;
}

interface PipelineKanbanProps {
  opportunities?: Opportunity[];
  stages?: Stage[];
  onOpportunityMove?: (opportunityId: string, fromStage: string, toStage: string) => void;
  onOpportunityClick?: (opportunityId: string) => void;
  onOpportunityEdit?: (opportunityId: string) => void;
  onAddOpportunity?: (stageId: string) => void;
  showWonLost?: boolean;
}

// Default stages
const defaultStages: Stage[] = [
  { id: 'lead', name: 'Lead', color: '#6B7280', probability: 10, order: 1 },
  { id: 'qualified', name: 'Qualified', color: '#3B82F6', probability: 25, order: 2 },
  { id: 'proposal', name: 'Proposal', color: '#8B5CF6', probability: 50, order: 3 },
  { id: 'negotiation', name: 'Negotiation', color: '#F59E0B', probability: 75, order: 4 },
  { id: 'closing', name: 'Closing', color: '#10B981', probability: 90, order: 5 },
];

// Sample opportunities
const generateSampleOpportunities = (): Opportunity[] => {
  const today = new Date();

  return [
    {
      id: 'opp-1',
      name: 'Enterprise Kitchen Installation',
      company: 'Marriott Hotels',
      value: 450000,
      currency: 'USD',
      stage: 'negotiation',
      probability: 75,
      expectedCloseDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
      owner: { id: 'u1', name: 'Sarah Johnson' },
      contacts: [{ name: 'John Smith', role: 'Procurement Director', email: 'john@marriott.com' }],
      daysInStage: 8,
      lastActivity: new Date(today.getTime() - 2 * 60 * 60 * 1000),
      activityCount: 24,
      tags: ['Enterprise', 'Hotels', 'Kitchen'],
      priority: 'high',
      health: 'healthy',
      source: 'Referral',
    },
    {
      id: 'opp-2',
      name: 'Restaurant Chain Upgrade',
      company: 'Chipotle',
      value: 320000,
      currency: 'USD',
      stage: 'proposal',
      probability: 50,
      expectedCloseDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
      owner: { id: 'u2', name: 'Michael Chen' },
      contacts: [{ name: 'Lisa Park', role: 'VP Operations', email: 'lisa@chipotle.com' }],
      daysInStage: 12,
      lastActivity: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      activityCount: 18,
      tags: ['Restaurant', 'QSR', 'Upgrade'],
      priority: 'high',
      health: 'at-risk',
      source: 'Trade Show',
    },
    {
      id: 'opp-3',
      name: 'Hospital Cafeteria Renovation',
      company: 'Mayo Clinic',
      value: 185000,
      currency: 'USD',
      stage: 'qualified',
      probability: 25,
      expectedCloseDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000),
      owner: { id: 'u1', name: 'Sarah Johnson' },
      contacts: [{ name: 'Dr. Roberts', role: 'Facilities Manager', email: 'roberts@mayo.edu' }],
      daysInStage: 5,
      lastActivity: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
      activityCount: 8,
      tags: ['Healthcare', 'Cafeteria'],
      priority: 'medium',
      health: 'healthy',
      source: 'Website',
    },
    {
      id: 'opp-4',
      name: 'University Dining Hall',
      company: 'Stanford University',
      value: 275000,
      currency: 'USD',
      stage: 'closing',
      probability: 90,
      expectedCloseDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      owner: { id: 'u3', name: 'Emily Davis' },
      contacts: [{ name: 'Mark Wilson', role: 'Director of Dining', email: 'mwilson@stanford.edu' }],
      daysInStage: 3,
      lastActivity: new Date(today.getTime() - 4 * 60 * 60 * 1000),
      activityCount: 32,
      tags: ['Education', 'Dining Hall'],
      priority: 'high',
      health: 'healthy',
      source: 'Cold Outreach',
    },
    {
      id: 'opp-5',
      name: 'Boutique Hotel Kitchen',
      company: 'The Ritz',
      value: 95000,
      currency: 'USD',
      stage: 'lead',
      probability: 10,
      expectedCloseDate: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000),
      owner: { id: 'u2', name: 'Michael Chen' },
      contacts: [{ name: 'Anna Lee', role: 'GM', email: 'anna@theritz.com' }],
      daysInStage: 2,
      lastActivity: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      activityCount: 3,
      tags: ['Luxury', 'Hotel'],
      priority: 'low',
      health: 'healthy',
      source: 'Partner',
    },
    {
      id: 'opp-6',
      name: 'Corporate Cafeteria',
      company: 'Google',
      value: 520000,
      currency: 'USD',
      stage: 'proposal',
      probability: 50,
      expectedCloseDate: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000),
      owner: { id: 'u1', name: 'Sarah Johnson' },
      contacts: [{ name: 'Dave Miller', role: 'Workplace Director', email: 'dave@google.com' }],
      daysInStage: 18,
      lastActivity: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      activityCount: 15,
      tags: ['Tech', 'Corporate', 'Large'],
      priority: 'high',
      health: 'stale',
      source: 'Referral',
    },
    {
      id: 'opp-7',
      name: 'Food Court Installation',
      company: 'Westfield Malls',
      value: 380000,
      currency: 'USD',
      stage: 'qualified',
      probability: 25,
      expectedCloseDate: new Date(today.getTime() + 75 * 24 * 60 * 60 * 1000),
      owner: { id: 'u3', name: 'Emily Davis' },
      contacts: [{ name: 'Tom Baker', role: 'Leasing Manager', email: 'tbaker@westfield.com' }],
      daysInStage: 10,
      lastActivity: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      activityCount: 12,
      tags: ['Retail', 'Food Court'],
      priority: 'medium',
      health: 'healthy',
      source: 'Inbound',
    },
  ];
};

// Map a stage id from the API record onto one of the default stage ids.
const normalizeStage = (raw: string): string => {
  const s = (raw || '').toLowerCase();
  if (['lead', 'prospecting', 'new'].includes(s)) return 'lead';
  if (['qualified', 'qualification', 'contacted'].includes(s)) return 'qualified';
  if (['proposal', 'needs-analysis', 'needs_analysis'].includes(s)) return 'proposal';
  if (['negotiation'].includes(s)) return 'negotiation';
  if (['closing', 'closed', 'closed_won', 'closed-won', 'won'].includes(s)) return 'closing';
  return s || 'lead';
};

// Map an API opportunity record onto the local Opportunity shape.
const mapApiOpportunity = (o: any): Opportunity => ({
  id: String(o?.id ?? ''),
  name: o?.name ?? '',
  company: o?.customerName ?? o?.account ?? o?.company ?? '',
  value: Number(o?.amount ?? o?.value ?? 0),
  currency: o?.currency ?? 'USD',
  stage: normalizeStage(String(o?.stage ?? '')),
  probability: Number(o?.probability ?? 0),
  expectedCloseDate: o?.expectedCloseDate ? new Date(o.expectedCloseDate) : new Date(),
  owner: { id: String(o?.ownerId ?? o?.owner ?? ''), name: o?.ownerName ?? o?.owner ?? 'Unassigned' },
  contacts: o?.contactName
    ? [{ name: o.contactName, role: o?.contactRole ?? '', email: o?.contactEmail ?? '' }]
    : [],
  daysInStage: Number(o?.daysInStage ?? 0),
  lastActivity: o?.lastActivity ? new Date(o.lastActivity) : new Date(),
  activityCount: Number(o?.activityCount ?? 0),
  tags: Array.isArray(o?.tags) ? o.tags : [],
  priority: (o?.priority ?? 'medium') as Opportunity['priority'],
  health: (o?.health ?? 'healthy') as Opportunity['health'],
  source: o?.source ?? o?.leadSource ?? '',
});

// Format currency
const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format relative time
const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

/**
 * PipelineKanban - Enhanced drag-drop opportunity board
 * Features smooth animations, card details, and stage management
 */
export function PipelineKanban({
  opportunities: propOpportunities,
  stages: propStages,
  onOpportunityMove,
  onOpportunityClick,
  onOpportunityEdit,
  onAddOpportunity,
  showWonLost = true,
}: PipelineKanbanProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(
    propOpportunities || []
  );
  const stages = propStages || defaultStages;

  // Load opportunities from the API when the parent does not supply them.
  useEffect(() => {
    if (propOpportunities) {
      setOpportunities(propOpportunities);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await crmService.opportunities.getAll();
        if (!active) return;
        setOpportunities(asArray(res).map(mapApiOpportunity));
      } catch {
        if (active) setOpportunities([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [propOpportunities]);

  const [draggedOpp, setDraggedOpp] = useState<Opportunity | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState<string | null>(null);

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesSearch =
        opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOwner = filterOwner === 'all' || opp.owner.id === filterOwner;
      const matchesPriority = filterPriority === 'all' || opp.priority === filterPriority;
      return matchesSearch && matchesOwner && matchesPriority;
    });
  }, [opportunities, searchQuery, filterOwner, filterPriority]);

  // Get opportunities by stage
  const getStageOpportunities = useCallback(
    (stageId: string) => filteredOpportunities.filter(opp => opp.stage === stageId),
    [filteredOpportunities]
  );

  // Calculate stage totals
  const getStageTotals = useCallback(
    (stageId: string) => {
      const stageOpps = getStageOpportunities(stageId);
      return {
        count: stageOpps.length,
        value: stageOpps.reduce((sum, o) => sum + o.value, 0),
        weightedValue: stageOpps.reduce((sum, o) => sum + o.value * (o.probability / 100), 0),
      };
    },
    [getStageOpportunities]
  );

  // Pipeline totals
  const pipelineTotals = useMemo(() => {
    return {
      totalValue: filteredOpportunities.reduce((sum, o) => sum + o.value, 0),
      weightedValue: filteredOpportunities.reduce(
        (sum, o) => sum + o.value * (o.probability / 100),
        0
      ),
      count: filteredOpportunities.length,
    };
  }, [filteredOpportunities]);

  // Unique owners for filter
  const owners = useMemo(() => {
    const ownerMap = new Map<string, { id: string; name: string }>();
    opportunities.forEach(opp => ownerMap.set(opp.owner.id, opp.owner));
    return Array.from(ownerMap.values());
  }, [opportunities]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, opp: Opportunity) => {
    setDraggedOpp(opp);
    e.dataTransfer.effectAllowed = 'move';
    // Add a slight delay for better visual feedback
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedOpp(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedOpp && draggedOpp.stage !== stageId) {
      const stage = stages.find(s => s.id === stageId);
      setOpportunities(prev =>
        prev.map(opp =>
          opp.id === draggedOpp.id
            ? {
                ...opp,
                stage: stageId,
                probability: stage?.probability || opp.probability,
                daysInStage: 0,
              }
            : opp
        )
      );
      // Persist the stage change; UI already updated optimistically above.
      crmService.opportunities
        .update(draggedOpp.id, { stage: stageId })
        .catch(() => {
          // On failure, revert the card to its original stage.
          setOpportunities(prev =>
            prev.map(opp =>
              opp.id === draggedOpp.id ? { ...opp, stage: draggedOpp.stage } : opp
            )
          );
        });
      onOpportunityMove?.(draggedOpp.id, draggedOpp.stage, stageId);
    }
    setDragOverStage(null);
  };

  // Get health indicator
  const getHealthIndicator = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      case 'at-risk':
        return <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />;
      case 'stale':
        return <Clock className="w-3.5 h-3.5 text-red-500" />;
      default:
        return null;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    };
    return styles[priority as keyof typeof styles] || styles.low;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Sales Pipeline</h1>
              <p className="text-sm text-gray-500">
                {pipelineTotals.count} opportunities • {formatCurrency(pipelineTotals.totalValue)} total •{' '}
                {formatCurrency(pipelineTotals.weightedValue)} weighted
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              />
            </div>

            {/* Owner Filter */}
            <select
              value={filterOwner}
              onChange={e => setFilterOwner(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            >
              <option value="all">All Owners</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Add Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              New Opportunity
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-3">
        <div className="flex gap-2 h-full min-w-max">
          {stages.map(stage => {
            const totals = getStageTotals(stage.id);
            const stageOpps = getStageOpportunities(stage.id);
            const isOver = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className={`flex-shrink-0 w-80 flex flex-col rounded-xl transition-all duration-200 ${
                  isOver
                    ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 ring-offset-2'
                    : 'bg-white dark:bg-gray-800'
                } border border-gray-200 dark:border-gray-700`}
                onDragOver={e => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{stage.name}</h3>
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        {totals.count}
                      </span>
                    </div>
                    <button
                      onClick={() => onAddOpportunity?.(stage.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{formatCurrency(totals.value)}</span>
                    <span className="text-xs text-gray-400">{stage.probability}% prob</span>
                  </div>
                </div>

                {/* Opportunity Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {stageOpps.map(opp => {
                    const isExpanded = expandedCard === opp.id;

                    return (
                      <div
                        key={opp.id}
                        draggable
                        onDragStart={e => handleDragStart(e, opp)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onOpportunityClick?.(opp.id)}
                        className={`group bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                          draggedOpp?.id === opp.id ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Card Header */}
                        <div className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                              {getHealthIndicator(opp.health)}
                            </div>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setExpandedCard(isExpanded ? null : opp.id);
                              }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>

                          <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                            {opp.name}
                          </h4>

                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <Building2 className="w-3.5 h-3.5" />
                            <span className="truncate">{opp.company}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatCurrency(opp.value, opp.currency)}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityBadge(opp.priority)}`}>
                              {opp.priority}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="px-3 pb-3 pt-0">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{opp.expectedCloseDate.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{opp.daysInStage}d in stage</span>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-600 pt-3 space-y-3">
                            {/* Owner */}
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{opp.owner.name}</span>
                            </div>

                            {/* Contact */}
                            {opp.contacts[0] && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">Contact:</span>
                                <span className="text-gray-700 dark:text-gray-300">
                                  {opp.contacts[0].name} ({opp.contacts[0].role})
                                </span>
                              </div>
                            )}

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1">
                              {opp.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Last Activity */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Last activity: {formatRelativeTime(opp.lastActivity)}</span>
                              <span>{opp.activityCount} activities</span>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2 pt-2">
                              <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500">
                                <Phone className="w-3.5 h-3.5" />
                                Call
                              </button>
                              <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500">
                                <Mail className="w-3.5 h-3.5" />
                                Email
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  onOpportunityEdit?.(opp.id);
                                }}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded hover:bg-blue-200"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Empty State */}
                  {stageOpps.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <Target className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">No opportunities</p>
                      <button
                        onClick={() => onAddOpportunity?.(stage.id)}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                      >
                        + Add one
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PipelineKanban;
