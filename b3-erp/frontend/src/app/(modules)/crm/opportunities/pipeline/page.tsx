'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  DollarSign,
  Target,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  Download,
  RefreshCw,
  ChevronRight,
  Building2,
  Mail,
  Phone,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  TrendingDown,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { crmService } from '@/services/crm.service';

interface Opportunity {
  id: string;
  name: string;
  accountName: string;
  contactName: string;
  email: string;
  phone: string;
  stage: string;
  value: number;
  probability: number;
  expectedCloseDate: string;
  owner: string;
  createdDate: string;
  lastActivity: string;
  nextStep: string;
  source: string;
  products: string[];
  priority: 'high' | 'medium' | 'low';
  daysInStage: number;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  probability: number;
  opportunities: Opportunity[];
}

const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    name: 'Modular Kitchen Project - Riverside Apartments',
    accountName: 'Riverside Developers Ltd',
    contactName: 'John Anderson',
    email: 'john.anderson@riverside.com',
    phone: '+1 234-567-8900',
    stage: 'qualification',
    value: 125000,
    probability: 20,
    expectedCloseDate: '2025-11-15',
    owner: 'Sarah Johnson',
    createdDate: '2025-10-01',
    lastActivity: '2025-10-18',
    nextStep: 'Schedule site visit and requirement gathering',
    source: 'Referral',
    products: ['Modular Kitchen', 'Countertops', 'Appliances'],
    priority: 'high',
    daysInStage: 5,
  },
  {
    id: '2',
    name: 'Office Furniture - Tech Solutions Inc',
    accountName: 'Tech Solutions Inc',
    contactName: 'Emily Chen',
    email: 'emily.chen@techsolutions.com',
    phone: '+1 234-567-8901',
    stage: 'needs-analysis',
    value: 85000,
    probability: 40,
    expectedCloseDate: '2025-11-30',
    owner: 'Michael Park',
    createdDate: '2025-09-15',
    lastActivity: '2025-10-19',
    nextStep: 'Send detailed proposal with 3D designs',
    source: 'Website',
    products: ['Office Cabinets', 'Workstations', 'Storage Solutions'],
    priority: 'high',
    daysInStage: 12,
  },
  {
    id: '3',
    name: 'Luxury Wardrobe Installation',
    accountName: 'Premium Homes',
    contactName: 'Robert Wilson',
    email: 'robert@premiumhomes.com',
    phone: '+1 234-567-8902',
    stage: 'proposal',
    value: 65000,
    probability: 60,
    expectedCloseDate: '2025-11-05',
    owner: 'Sarah Johnson',
    createdDate: '2025-09-20',
    lastActivity: '2025-10-20',
    nextStep: 'Follow up on proposal feedback',
    source: 'Trade Show',
    products: ['Custom Wardrobes', 'Closet Systems', 'Vanity Units'],
    priority: 'medium',
    daysInStage: 8,
  },
  {
    id: '4',
    name: 'Commercial Kitchen - Grand Hotel',
    accountName: 'Grand Hotel Group',
    contactName: 'Lisa Martinez',
    email: 'lisa.martinez@grandhotel.com',
    phone: '+1 234-567-8903',
    stage: 'negotiation',
    value: 250000,
    probability: 75,
    expectedCloseDate: '2025-10-28',
    owner: 'David Lee',
    createdDate: '2025-08-10',
    lastActivity: '2025-10-20',
    nextStep: 'Finalize contract terms and payment schedule',
    source: 'Direct',
    products: ['Commercial Kitchen Equipment', 'Stainless Steel Cabinets', 'Installation'],
    priority: 'high',
    daysInStage: 15,
  },
  {
    id: '5',
    name: 'Bathroom Renovation - Villa Project',
    accountName: 'Luxury Villas Inc',
    contactName: 'James Thompson',
    email: 'james@luxuryvillas.com',
    phone: '+1 234-567-8904',
    stage: 'proposal',
    value: 45000,
    probability: 55,
    expectedCloseDate: '2025-11-20',
    owner: 'Emily Davis',
    createdDate: '2025-09-25',
    lastActivity: '2025-10-17',
    nextStep: 'Present alternative design options',
    source: 'Partner',
    products: ['Vanity Units', 'Bathroom Cabinets', 'Mirrors'],
    priority: 'medium',
    daysInStage: 10,
  },
  {
    id: '6',
    name: 'Kitchen Modernization - Smart Homes',
    accountName: 'Smart Homes LLC',
    contactName: 'Patricia Brown',
    email: 'patricia@smarthomes.com',
    phone: '+1 234-567-8905',
    stage: 'qualification',
    value: 95000,
    probability: 25,
    expectedCloseDate: '2025-12-10',
    owner: 'Michael Park',
    createdDate: '2025-10-05',
    lastActivity: '2025-10-19',
    nextStep: 'Conduct budget and timeline discussion',
    source: 'Website',
    products: ['Smart Kitchen Solutions', 'Appliances', 'Cabinets'],
    priority: 'medium',
    daysInStage: 3,
  },
  {
    id: '7',
    name: 'Retail Store Fixtures - Fashion Outlet',
    accountName: 'Fashion Outlet Chain',
    contactName: 'David Kim',
    email: 'david.kim@fashionoutlet.com',
    phone: '+1 234-567-8906',
    stage: 'needs-analysis',
    value: 180000,
    probability: 45,
    expectedCloseDate: '2025-11-25',
    owner: 'Sarah Johnson',
    createdDate: '2025-09-10',
    lastActivity: '2025-10-18',
    nextStep: 'Schedule store layout consultation',
    source: 'Cold Call',
    products: ['Display Cabinets', 'Storage Systems', 'Fixtures'],
    priority: 'high',
    daysInStage: 18,
  },
  {
    id: '8',
    name: 'Hospital Furniture - Medical Center',
    accountName: 'Central Medical Center',
    contactName: 'Dr. Susan Clark',
    email: 'susan.clark@medcenter.com',
    phone: '+1 234-567-8907',
    stage: 'closed-won',
    value: 320000,
    probability: 100,
    expectedCloseDate: '2025-10-15',
    owner: 'David Lee',
    createdDate: '2025-07-15',
    lastActivity: '2025-10-15',
    nextStep: 'Begin implementation',
    source: 'Tender',
    products: ['Medical Cabinets', 'Storage Solutions', 'Nurse Stations'],
    priority: 'high',
    daysInStage: 5,
  },
];

const stages: Stage[] = [
  {
    id: 'qualification',
    name: 'Qualification',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    probability: 20,
    opportunities: [],
  },
  {
    id: 'needs-analysis',
    name: 'Needs Analysis',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    probability: 40,
    opportunities: [],
  },
  {
    id: 'proposal',
    name: 'Proposal/Quote',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    probability: 60,
    opportunities: [],
  },
  {
    id: 'negotiation',
    name: 'Negotiation',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    probability: 75,
    opportunities: [],
  },
  {
    id: 'closed-won',
    name: 'Closed Won',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    probability: 100,
    opportunities: [],
  },
  {
    id: 'closed-lost',
    name: 'Closed Lost',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    probability: 0,
    opportunities: [],
  },
];

export default function OpportunitiesPipelinePage() {
  const router = useRouter();
  const [pipelineData, setPipelineData] = useState<Stage[]>(stages);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>(mockOpportunities);

  // Map a crm_leads status to this page's stage ids.
  const stageIdFromLeadStatus = (s: string): string => {
    switch (s) {
      case 'qualified':
        return 'qualification';
      case 'new':
      case 'contacted':
        return 'needs-analysis';
      case 'proposal':
        return 'proposal';
      case 'negotiation':
        return 'negotiation';
      case 'won':
        return 'closed-won';
      case 'lost':
        return 'closed-lost';
      default:
        return 'needs-analysis';
    }
  };

  // Initialize pipeline with opportunities from the API (fallback to mock).
  useEffect(() => {
    let active = true;
    (async () => {
      let opps: Opportunity[] = mockOpportunities;
      try {
        const [pipeline, won, lost] = await Promise.all([
          crmService.opportunityViews.getPipeline(),
          crmService.opportunityViews.getWon(),
          crmService.opportunityViews.getLost(),
        ]);
        const flat: any[] = [];
        (Array.isArray(pipeline?.stages) ? pipeline.stages : []).forEach((st: any) => {
          (Array.isArray(st?.opportunities) ? st.opportunities : []).forEach((o: any) => flat.push(o));
        });
        (Array.isArray(won?.opportunities) ? won.opportunities : []).forEach((o: any) => flat.push(o));
        (Array.isArray(lost?.opportunities) ? lost.opportunities : []).forEach((o: any) => flat.push(o));
        if (flat.length) {
          opps = flat.map((o: any) => ({
            id: String(o?.id ?? ''),
            name: o?.name ?? '',
            accountName: o?.account ?? '',
            contactName: o?.contact ?? '',
            email: '',
            phone: '',
            stage: stageIdFromLeadStatus(String(o?.stage ?? '')),
            value: Number(o?.value ?? 0),
            probability: Number(o?.probability ?? 0),
            expectedCloseDate: o?.expectedCloseDate ?? '',
            owner: o?.owner ?? '',
            createdDate: '',
            lastActivity: o?.lastContactDate ?? '',
            nextStep: '',
            source: o?.source ?? '',
            products: [],
            priority: 'medium',
            daysInStage: 0,
          }));
        }
      } catch {
        opps = mockOpportunities;
      }
      if (!active) return;
      setAllOpportunities(opps);
      setPipelineData(
        stages.map((stage) => ({
          ...stage,
          opportunities: opps.filter((opp) => opp.stage === stage.id),
        })),
      );
    })();
    return () => {
      active = false;
    };
  }, []);

  // Calculate pipeline statistics
  const openOpps = allOpportunities.filter((o) => !o.stage.includes('closed'));
  const stats = {
    totalOpportunities: openOpps.length,
    totalValue: openOpps.reduce((sum, o) => sum + o.value, 0),
    weightedValue: openOpps.reduce((sum, o) => sum + o.value * (o.probability / 100), 0),
    avgDealSize: openOpps.length
      ? openOpps.reduce((sum, o) => sum + o.value, 0) / openOpps.length
      : 0,
    wonDeals: allOpportunities.filter((o) => o.stage === 'closed-won').length,
    wonValue: allOpportunities
      .filter((o) => o.stage === 'closed-won')
      .reduce((sum, o) => sum + o.value, 0),
  };

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      // Same column reordering
      const stage = pipelineData.find((s) => s.id === source.droppableId);
      if (!stage) return;

      const newOpportunities = Array.from(stage.opportunities);
      const [removed] = newOpportunities.splice(source.index, 1);
      newOpportunities.splice(destination.index, 0, removed);

      const newStages = pipelineData.map((s) =>
        s.id === source.droppableId ? { ...s, opportunities: newOpportunities } : s
      );

      setPipelineData(newStages);
    } else {
      // Moving between columns
      const sourceStage = pipelineData.find((s) => s.id === source.droppableId);
      const destStage = pipelineData.find((s) => s.id === destination.droppableId);

      if (!sourceStage || !destStage) return;

      const sourceOpportunities = Array.from(sourceStage.opportunities);
      const destOpportunities = Array.from(destStage.opportunities);

      const [movedOpportunity] = sourceOpportunities.splice(source.index, 1);
      movedOpportunity.stage = destination.droppableId;
      movedOpportunity.probability = destStage.probability;
      destOpportunities.splice(destination.index, 0, movedOpportunity);

      const newStages = pipelineData.map((s) => {
        if (s.id === source.droppableId) {
          return { ...s, opportunities: sourceOpportunities };
        }
        if (s.id === destination.droppableId) {
          return { ...s, opportunities: destOpportunities };
        }
        return s;
      });

      setPipelineData(newStages);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Open Opportunities</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalOpportunities}</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Pipeline Value</p>
              <p className="text-2xl font-bold text-green-900 mt-1">${(stats.totalValue / 1000).toFixed(0)}K</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Weighted Value</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">${(stats.weightedValue / 1000).toFixed(0)}K</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Avg Deal Size</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">${(stats.avgDealSize / 1000).toFixed(0)}K</p>
            </div>
            <BarChart3 className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Won Deals</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.wonDeals}</p>
            </div>
            <Award className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-600">Won Value</p>
              <p className="text-2xl font-bold text-teal-900 mt-1">${(stats.wonValue / 1000).toFixed(0)}K</p>
            </div>
            <CheckCircle className="h-8 w-8 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search opportunities by name, account, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Kanban Pipeline View */}
      {viewMode === 'kanban' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {pipelineData.map((stage) => {
              const stageValue = stage.opportunities.reduce((sum, opp) => sum + opp.value, 0);
              const stageCount = stage.opportunities.length;

              return (
                <Droppable key={stage.id} droppableId={stage.id}>
                  {(provided: any, snapshot: any) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-shrink-0 w-80 ${stage.bgColor} rounded-lg p-3 ${
                        snapshot.isDraggingOver ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      {/* Stage Header */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-bold text-lg ${stage.color}`}>{stage.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${stage.color} bg-white`}>
                            {stageCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            ${(stageValue / 1000).toFixed(0)}K
                          </span>
                          <span className="text-gray-500">{stage.probability}% prob</span>
                        </div>
                      </div>

                      {/* Opportunity Cards */}
                      <div className="space-y-3 min-h-[200px]">
                        {stage.opportunities.map((opportunity, index) => (
                          <Draggable key={opportunity.id} draggableId={opportunity.id} index={index}>
                            {(provided: any, snapshot: any) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg border-2 border-gray-200 p-3 cursor-move hover:shadow-lg transition-all ${
                                  snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500' : ''
                                }`}
                                onClick={() => setSelectedOpportunity(opportunity)}
                              >
                                {/* Priority & Value */}
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    {getPriorityIcon(opportunity.priority)}
                                    <span className="text-lg font-bold text-gray-900">
                                      ${(opportunity.value / 1000).toFixed(0)}K
                                    </span>
                                  </div>
                                  <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                    {opportunity.probability}%
                                  </span>
                                </div>

                                {/* Opportunity Name */}
                                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{opportunity.name}</h4>

                                {/* Account & Contact */}
                                <div className="space-y-1 mb-3 text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <Building2 className="h-3 w-3 mr-2" />
                                    <span className="truncate">{opportunity.accountName}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <Users className="h-3 w-3 mr-2" />
                                    <span className="truncate">{opportunity.contactName}</span>
                                  </div>
                                </div>

                                {/* Close Date */}
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>{new Date(opportunity.expectedCloseDate).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{opportunity.daysInStage}d in stage</span>
                                  </div>
                                </div>

                                {/* Owner */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                  <span className="text-xs text-gray-600">{opportunity.owner}</span>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/crm/opportunities/view/${opportunity.id}`);
                                      }}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/crm/opportunities/edit/${opportunity.id}`);
                                      }}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Opportunity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Probability</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Close Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockOpportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(opp.priority)}
                      <span className="font-medium text-gray-900">{opp.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{opp.accountName}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      {stages.find((s) => s.id === opp.stage)?.name}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-semibold text-gray-900">${(opp.value / 1000).toFixed(0)}K</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${opp.probability}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{opp.probability}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {new Date(opp.expectedCloseDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{opp.owner}</td>
                  <td className="px-3 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/crm/opportunities/view/${opp.id}`)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/crm/opportunities/edit/${opp.id}`)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
