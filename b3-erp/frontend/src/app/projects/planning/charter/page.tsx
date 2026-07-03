'use client';

import { useEffect, useState, useMemo } from 'react';
import { FileText, Search, Download, Save, Users, Target, Calendar, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { projectManagementService } from '@/services/ProjectManagementService';

interface ProjectCharter {
  id: string;
  projectCode: string;
  projectName: string;
  charterNumber: string;
  version: string;
  projectManager: string;
  sponsor: string;
  client: string;
  department: string;
  category: 'construction' | 'it' | 'manufacturing' | 'infrastructure' | 'r&d';
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'active';
  priority: 'critical' | 'high' | 'medium' | 'low';
  objectives: string[];
  scope: {
    included: string[];
    excluded: string[];
  };
  deliverables: string[];
  stakeholders: {
    name: string;
    role: string;
    responsibility: string;
  }[];
  budget: number;
  startDate: string;
  endDate: string;
  duration: string;
  risks: string[];
  assumptions: string[];
  constraints: string[];
  successCriteria: string[];
  approvals: {
    approver: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: string;
    comments?: string;
  }[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
  approvedDate?: string;
}

// Mock data for project charters
const mockCharterData: ProjectCharter[] = [
  {
    id: 'CHART-001',
    projectCode: 'PROJ-2025-001',
    projectName: 'Manufacturing Plant Expansion',
    charterNumber: 'CHT-2025-001',
    version: '2.0',
    projectManager: 'Rajesh Kumar',
    sponsor: 'Ramesh Patel - COO',
    client: 'ABC Manufacturing Ltd.',
    department: 'Operations',
    category: 'construction',
    status: 'approved',
    priority: 'critical',
    objectives: [
      'Increase production capacity by 50% to meet growing market demand',
      'Implement energy-efficient systems to reduce operational costs by 20%',
      'Achieve ISO 14001 environmental certification for the new facility',
      'Create 150 new job opportunities in the local community'
    ],
    scope: {
      included: [
        'Site preparation and foundation work (10,000 sq.m)',
        'Construction of main production building and auxiliary structures',
        'Installation of production machinery and equipment',
        'Electrical, HVAC, and fire safety systems',
        'Quality control laboratory setup',
        'Employee training and transition support'
      ],
      excluded: [
        'Procurement of raw materials for production',
        'Hiring and onboarding of permanent staff (HR responsibility)',
        'Marketing and sales activities for increased capacity',
        'Upgrades to existing plant facilities'
      ]
    },
    deliverables: [
      'Fully constructed and commissioned production facility',
      'Installed and tested production equipment',
      'Quality assurance and environmental certifications',
      'Operations and maintenance manuals',
      'Trained operations team',
      'Project closure report and lessons learned'
    ],
    stakeholders: [
      { name: 'Ramesh Patel', role: 'Project Sponsor', responsibility: 'Overall project authorization and funding approval' },
      { name: 'Rajesh Kumar', role: 'Project Manager', responsibility: 'Day-to-day project execution and team management' },
      { name: 'Priya Sharma', role: 'Operations Head', responsibility: 'Operations requirements and acceptance criteria' },
      { name: 'Amit Desai', role: 'Finance Director', responsibility: 'Budget oversight and financial controls' },
      { name: 'Local Government', role: 'Regulatory Authority', responsibility: 'Permits, inspections, and compliance' }
    ],
    budget: 35000000,
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    duration: '12 months',
    risks: [
      'Regulatory approval delays could impact project schedule',
      'Weather conditions may affect construction timeline',
      'Equipment delivery delays from international suppliers',
      'Budget overruns due to material price escalation',
      'Skilled labor shortage in the region'
    ],
    assumptions: [
      'All regulatory approvals will be obtained within 2 months',
      'Current market prices for materials will remain stable',
      'Qualified contractors and labor will be available',
      'No major changes to design after approval',
      'Client will provide timely approvals and decisions'
    ],
    constraints: [
      'Fixed budget of ₹35 Crores with 10% contingency',
      'Must complete before fiscal year end (March 2026)',
      'Limited construction hours due to residential area proximity',
      'Environmental regulations compliance mandatory',
      'Single-source supplier for specialized equipment'
    ],
    successCriteria: [
      'Project completed within approved budget (±5% variance)',
      'All deliverables meet quality standards and pass inspections',
      'Production capacity increase of minimum 45% achieved',
      'Zero lost-time accidents during construction',
      'Environmental certifications obtained within 3 months of completion'
    ],
    approvals: [
      { approver: 'Ramesh Patel', role: 'Project Sponsor', status: 'approved', date: '2025-03-15', comments: 'Approved with recommended contingency increase' },
      { approver: 'Amit Desai', role: 'Finance Director', status: 'approved', date: '2025-03-14', comments: 'Budget approved, ensure quarterly reviews' },
      { approver: 'Suresh Menon', role: 'CEO', status: 'approved', date: '2025-03-16', comments: 'Strategic initiative approved, critical for growth' }
    ],
    createdBy: 'Rajesh Kumar',
    createdDate: '2025-02-15',
    lastModified: '2025-03-10',
    approvedDate: '2025-03-16'
  },
  {
    id: 'CHART-002',
    projectCode: 'PROJ-2025-002',
    projectName: 'ERP System Implementation',
    charterNumber: 'CHT-2025-002',
    version: '1.1',
    projectManager: 'Amit Patel',
    sponsor: 'Neha Singh - CIO',
    client: 'XYZ Industries',
    department: 'IT',
    category: 'it',
    status: 'approved',
    priority: 'high',
    objectives: [
      'Implement integrated ERP system to replace legacy systems',
      'Improve data accuracy and real-time reporting capabilities',
      'Reduce manual processes and increase operational efficiency by 30%',
      'Enable better decision-making through advanced analytics'
    ],
    scope: {
      included: [
        'ERP software selection and licensing',
        'Modules: Finance, HR, Manufacturing, Supply Chain, CRM',
        'Data migration from existing systems',
        'System customization and configuration',
        'User training and change management',
        'Go-live support for 3 months'
      ],
      excluded: [
        'Hardware infrastructure upgrades (separate project)',
        'Custom software development beyond ERP scope',
        'Business process reengineering (BPR) consulting',
        'Post go-live ongoing support (BAU operations)'
      ]
    },
    deliverables: [
      'Configured and tested ERP system',
      'Migrated historical data (3 years)',
      'User documentation and training materials',
      'Integration with existing systems',
      'Trained super-users and end-users',
      'System acceptance and sign-off'
    ],
    stakeholders: [
      { name: 'Neha Singh', role: 'Project Sponsor', responsibility: 'Strategic alignment and executive support' },
      { name: 'Amit Patel', role: 'Project Manager', responsibility: 'Implementation execution and vendor management' },
      { name: 'Department Heads', role: 'Business Users', responsibility: 'Requirements definition and UAT' },
      { name: 'IT Team', role: 'Technical Support', responsibility: 'Infrastructure and integration support' }
    ],
    budget: 8500000,
    startDate: '2025-05-01',
    endDate: '2025-12-31',
    duration: '8 months',
    risks: [
      'User resistance to change and new system',
      'Data quality issues during migration',
      'Customization complexity leading to delays',
      'Integration challenges with legacy systems',
      'Key resource unavailability during critical phases'
    ],
    assumptions: [
      'Business users will dedicate time for requirements and testing',
      'Data cleansing will be completed before migration',
      'Vendor will provide adequate support resources',
      'IT infrastructure is adequate for ERP deployment',
      'Management support for change management activities'
    ],
    constraints: [
      'Go-live must be completed by December 31, 2025',
      'Limited budget for extensive customizations',
      'Business operations cannot be disrupted during transition',
      'Compliance with data privacy regulations mandatory',
      'Vendor-specific technology and architecture'
    ],
    successCriteria: [
      'All modules functional and integrated at go-live',
      'Data migration accuracy >99.5%',
      'User adoption rate >90% within 3 months',
      'System uptime >99% during business hours',
      'Positive ROI achieved within 24 months'
    ],
    approvals: [
      { approver: 'Neha Singh', role: 'CIO', status: 'approved', date: '2025-04-20', comments: 'Approved, critical for digital transformation' },
      { approver: 'Amit Desai', role: 'Finance Director', status: 'approved', date: '2025-04-18', comments: 'Budget approved, monitor spending closely' }
    ],
    createdBy: 'Amit Patel',
    createdDate: '2025-03-25',
    lastModified: '2025-04-15',
    approvedDate: '2025-04-20'
  },
  {
    id: 'CHART-003',
    projectCode: 'PROJ-2025-003',
    projectName: 'Solar Power Installation',
    charterNumber: 'CHT-2025-003',
    version: '1.0',
    projectManager: 'Sunita Reddy',
    sponsor: 'Vikram Mehta - Sustainability Head',
    client: 'Green Energy Corp',
    department: 'Facilities',
    category: 'infrastructure',
    status: 'approved',
    priority: 'high',
    objectives: [
      'Install 1 MW rooftop solar power system',
      'Reduce electricity costs by 40%',
      'Achieve carbon neutrality for facility operations',
      'Obtain renewable energy certificates (RECs)'
    ],
    scope: {
      included: [
        'Solar panel procurement and installation',
        'Inverters and electrical systems',
        'Grid integration and net metering setup',
        'Monitoring and control systems',
        'Structural assessments and reinforcements',
        'Regulatory approvals and certifications'
      ],
      excluded: [
        'Building structural upgrades beyond solar requirements',
        'Energy storage/battery systems (future phase)',
        'Electric vehicle charging infrastructure',
        'Energy efficiency improvements in building systems'
      ]
    },
    deliverables: [
      'Installed and commissioned 1 MW solar system',
      'Grid connection and net metering agreement',
      'Monitoring system with real-time dashboard',
      'Operations and maintenance plan',
      'Renewable energy certificates',
      'Performance guarantee documentation'
    ],
    stakeholders: [
      { name: 'Vikram Mehta', role: 'Project Sponsor', responsibility: 'Sustainability strategy alignment' },
      { name: 'Sunita Reddy', role: 'Project Manager', responsibility: 'Project execution and vendor coordination' },
      { name: 'Facilities Team', role: 'Operations', responsibility: 'Site access and daily operations support' },
      { name: 'Power Utility', role: 'External Stakeholder', responsibility: 'Grid connection and approvals' }
    ],
    budget: 12500000,
    startDate: '2025-06-01',
    endDate: '2025-12-31',
    duration: '7 months',
    risks: [
      'Roof structural capacity inadequate for panel weight',
      'Monsoon season delays during July-September',
      'Grid connection approval delays from utility',
      'Panel quality or performance issues',
      'Changes in government subsidies or policies'
    ],
    assumptions: [
      'Building roof is structurally sound for solar installation',
      'Government subsidies and incentives remain available',
      'Grid connection approval within 2 months',
      'Weather conditions suitable for installation',
      'No major electrical grid outages during integration'
    ],
    constraints: [
      'Installation must avoid monsoon peak (July-August)',
      'Work only during non-business hours (weekends)',
      'Budget limited to available subsidy amount',
      'Compliance with electrical safety codes mandatory',
      'Minimum 25-year panel warranty required'
    ],
    successCriteria: [
      'System generating rated capacity (1 MW)',
      'Electricity cost reduction >35%',
      'System uptime >95% annually',
      'Payback period <7 years',
      'RECs obtained within 6 months of commissioning'
    ],
    approvals: [
      { approver: 'Vikram Mehta', role: 'Sustainability Head', status: 'approved', date: '2025-05-15', comments: 'Aligned with sustainability goals' },
      { approver: 'Amit Desai', role: 'Finance Director', status: 'approved', date: '2025-05-12', comments: 'Approved with positive ROI' }
    ],
    createdBy: 'Sunita Reddy',
    createdDate: '2025-04-10',
    lastModified: '2025-05-05',
    approvedDate: '2025-05-15'
  },
  {
    id: 'CHART-004',
    projectCode: 'PROJ-2025-009',
    projectName: 'Supply Chain Optimization',
    charterNumber: 'CHT-2025-009',
    version: '1.0',
    projectManager: 'Anjali Gupta',
    sponsor: 'Rakesh Sharma - VP Supply Chain',
    client: 'Supply Solutions Inc.',
    department: 'Supply Chain',
    category: 'it',
    status: 'review',
    priority: 'medium',
    objectives: [
      'Implement advanced planning and optimization tools',
      'Reduce inventory holding costs by 25%',
      'Improve forecast accuracy to >90%',
      'Reduce stockouts and improve service levels to 98%'
    ],
    scope: {
      included: [
        'Supply chain planning software implementation',
        'Demand forecasting and inventory optimization modules',
        'Integration with ERP and WMS systems',
        'Historical data analysis and modeling',
        'User training and change management',
        'Performance monitoring dashboards'
      ],
      excluded: [
        'Warehouse management system upgrades',
        'Transportation management system (separate initiative)',
        'Supplier relationship management platform',
        'Physical warehouse layout changes'
      ]
    },
    deliverables: [
      'Configured supply chain planning system',
      'Integrated forecasting models',
      'Inventory optimization policies',
      'Real-time monitoring dashboards',
      'Trained planning team',
      'Implementation playbook'
    ],
    stakeholders: [
      { name: 'Rakesh Sharma', role: 'Project Sponsor', responsibility: 'Strategic direction and resource approval' },
      { name: 'Anjali Gupta', role: 'Project Manager', responsibility: 'Project delivery and stakeholder management' },
      { name: 'Planning Team', role: 'End Users', responsibility: 'Requirements and testing' },
      { name: 'IT Team', role: 'Technical Team', responsibility: 'Integration and support' }
    ],
    budget: 7500000,
    startDate: '2025-11-01',
    endDate: '2026-04-30',
    duration: '6 months',
    risks: [
      'Data quality issues affecting forecast accuracy',
      'Integration complexity with existing systems',
      'User adoption challenges',
      'Vendor implementation delays',
      'Change management resistance'
    ],
    assumptions: [
      'Historical data available for minimum 2 years',
      'Business processes documented and stable',
      'Users available for training and testing',
      'IT infrastructure adequate for deployment',
      'Management commitment to process changes'
    ],
    constraints: [
      'Implementation during low-demand season',
      'No disruption to ongoing operations',
      'Budget cap at ₹7.5 Crores',
      'Compliance with data security policies',
      'Must integrate with existing ERP system'
    ],
    successCriteria: [
      'Forecast accuracy improvement to >85% by month 3',
      'Inventory reduction of >20% within 6 months',
      'Service level improvement to >95%',
      'User satisfaction score >80%',
      'System performance <3 seconds response time'
    ],
    approvals: [
      { approver: 'Rakesh Sharma', role: 'VP Supply Chain', status: 'approved', date: '2025-10-18' },
      { approver: 'Amit Desai', role: 'Finance Director', status: 'pending', comments: 'Pending budget review' },
      { approver: 'Neha Singh', role: 'CIO', status: 'pending', comments: 'IT review in progress' }
    ],
    createdBy: 'Anjali Gupta',
    createdDate: '2025-09-15',
    lastModified: '2025-10-15'
  },
  {
    id: 'CHART-005',
    projectCode: 'PROJ-2025-012',
    projectName: 'Customer Portal Development',
    charterNumber: 'CHT-2025-012',
    version: '1.0',
    projectManager: 'Karan Malhotra',
    sponsor: 'Priya Nair - Head of Sales',
    client: 'Internal - Sales Department',
    department: 'IT',
    category: 'it',
    status: 'draft',
    priority: 'medium',
    objectives: [
      'Develop self-service customer portal',
      'Enable online order placement and tracking',
      'Improve customer experience and satisfaction',
      'Reduce customer service workload by 40%'
    ],
    scope: {
      included: [
        'Web portal design and development',
        'Mobile-responsive interface',
        'Order placement and tracking features',
        'Invoice and payment history access',
        'Integration with ERP and CRM systems',
        'Security and authentication framework'
      ],
      excluded: [
        'Mobile native apps (future phase)',
        'Advanced analytics and reporting',
        'Third-party marketplace integrations',
        'Payment gateway integration (use existing)'
      ]
    },
    deliverables: [
      'Fully functional customer portal',
      'Mobile-responsive design',
      'User documentation',
      'Admin configuration tools',
      'Security audit report',
      'Go-live support plan'
    ],
    stakeholders: [
      { name: 'Priya Nair', role: 'Project Sponsor', responsibility: 'Business requirements and funding' },
      { name: 'Karan Malhotra', role: 'Project Manager', responsibility: 'Project execution and delivery' },
      { name: 'Sales Team', role: 'Business Users', responsibility: 'Requirements and UAT' },
      { name: 'IT Development', role: 'Development Team', responsibility: 'Portal development and testing' }
    ],
    budget: 4500000,
    startDate: '2025-12-01',
    endDate: '2026-04-30',
    duration: '5 months',
    risks: [
      'Scope creep from stakeholder requests',
      'Integration challenges with legacy systems',
      'Security vulnerabilities',
      'User adoption by customers',
      'Resource availability during holidays'
    ],
    assumptions: [
      'Development team available full-time',
      'ERP APIs available for integration',
      'Customer database accurate and complete',
      'Hosting infrastructure ready',
      'Sales team support for customer onboarding'
    ],
    constraints: [
      'Launch before Q1 FY2026-27 sales campaign',
      'Must comply with GDPR and data privacy laws',
      'Single sign-on integration mandatory',
      'Budget limited to ₹45 Lakhs',
      'Must support 10,000+ concurrent users'
    ],
    successCriteria: [
      'Portal adoption by >60% customers in 3 months',
      'Page load time <2 seconds',
      'Zero critical security vulnerabilities',
      'Customer satisfaction score >4/5',
      'Customer service call reduction >30%'
    ],
    approvals: [
      { approver: 'Priya Nair', role: 'Head of Sales', status: 'pending', comments: 'Under review' },
      { approver: 'Amit Desai', role: 'Finance Director', status: 'pending' },
      { approver: 'Neha Singh', role: 'CIO', status: 'pending' }
    ],
    createdBy: 'Karan Malhotra',
    createdDate: '2025-10-01',
    lastModified: '2025-10-20'
  }
];

const VALID_CHARTER_CATEGORIES: ProjectCharter['category'][] = ['construction', 'it', 'manufacturing', 'infrastructure', 'r&d'];
const VALID_CHARTER_STATUSES: ProjectCharter['status'][] = ['draft', 'review', 'approved', 'rejected', 'active'];
const VALID_CHARTER_PRIORITIES: ProjectCharter['priority'][] = ['critical', 'high', 'medium', 'low'];

type CharterApproval = ProjectCharter['approvals'][number];
const VALID_APPROVAL_STATUSES: CharterApproval['status'][] = ['pending', 'approved', 'rejected'];

export default function ProjectCharterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [rows, setRows] = useState<ProjectCharter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await projectManagementService.listCharter();
        const list = Array.isArray(data) ? data : [];
        const mapped: ProjectCharter[] = list.map((r: any) => {
          const rawScope = r.scope && typeof r.scope === 'object' ? r.scope : {};
          const category = VALID_CHARTER_CATEGORIES.includes(r.category) ? r.category : 'it';
          const status = VALID_CHARTER_STATUSES.includes(r.status) ? r.status : 'draft';
          const priority = VALID_CHARTER_PRIORITIES.includes(r.priority) ? r.priority : 'medium';
          const stakeholders = Array.isArray(r.stakeholders)
            ? r.stakeholders.map((s: any) => ({
                name: s?.name ?? '',
                role: s?.role ?? '',
                responsibility: s?.responsibility ?? '',
              }))
            : [];
          const approvals = Array.isArray(r.approvals)
            ? r.approvals.map((a: any) => ({
                approver: a?.approver ?? '',
                role: a?.role ?? '',
                status: VALID_APPROVAL_STATUSES.includes(a?.status) ? a.status : 'pending',
                date: a?.date ?? undefined,
                comments: a?.comments ?? undefined,
              }))
            : [];
          return {
            id: String(r.id ?? ''),
            projectCode: r.projectCode ?? '',
            projectName: r.projectName ?? '',
            charterNumber: r.charterNumber ?? '',
            version: r.version ?? '',
            projectManager: r.projectManager ?? '',
            sponsor: r.sponsor ?? '',
            client: r.client ?? '',
            department: r.department ?? '',
            category,
            status,
            priority,
            objectives: Array.isArray(r.objectives) ? r.objectives.map((x: any) => String(x)) : [],
            scope: {
              included: Array.isArray(rawScope.included) ? rawScope.included.map((x: any) => String(x)) : [],
              excluded: Array.isArray(rawScope.excluded) ? rawScope.excluded.map((x: any) => String(x)) : [],
            },
            deliverables: Array.isArray(r.deliverables) ? r.deliverables.map((x: any) => String(x)) : [],
            stakeholders,
            budget: Number(r.budget ?? 0),
            startDate: r.startDate ?? '',
            endDate: r.endDate ?? '',
            duration: r.duration ?? '',
            risks: Array.isArray(r.risks) ? r.risks.map((x: any) => String(x)) : [],
            assumptions: Array.isArray(r.assumptions) ? r.assumptions.map((x: any) => String(x)) : [],
            constraints: Array.isArray(r.constraints) ? r.constraints.map((x: any) => String(x)) : [],
            successCriteria: Array.isArray(r.successCriteria) ? r.successCriteria.map((x: any) => String(x)) : [],
            approvals,
            createdBy: r.createdBy ?? '',
            createdDate: r.createdDate ?? '',
            lastModified: r.lastModified ?? '',
            approvedDate: r.approvedDate ?? undefined,
          };
        });
        if (!cancelled) {
          setRows(mapped);
          setLoadError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load charters');
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCharters = rows.length;
    const draftCharters = rows.filter(c => c.status === 'draft').length;
    const reviewCharters = rows.filter(c => c.status === 'review').length;
    const approvedCharters = rows.filter(c => c.status === 'approved').length;
    const activeCharters = rows.filter(c => c.status === 'active').length;
    const rejectedCharters = rows.filter(c => c.status === 'rejected').length;

    const totalBudget = rows.reduce((sum, c) => sum + c.budget, 0);
    const approvedBudget = rows
      .filter(c => ['approved', 'active'].includes(c.status))
      .reduce((sum, c) => sum + c.budget, 0);

    return {
      totalCharters,
      draftCharters,
      reviewCharters,
      approvedCharters,
      activeCharters,
      rejectedCharters,
      totalBudget,
      approvedBudget
    };
  }, [rows]);

  // Filter charters
  const filteredCharters = useMemo(() => {
    return rows.filter(charter => {
      const matchesSearch =
        charter.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charter.charterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charter.projectManager.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charter.sponsor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || charter.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || charter.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || charter.priority === selectedPriority;

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
    });
  }, [rows, searchTerm, selectedCategory, selectedStatus, selectedPriority]);

  const getCategoryBadge = (category: string) => {
    const badges = {
      'construction': 'bg-orange-100 text-orange-800',
      'it': 'bg-blue-100 text-blue-800',
      'manufacturing': 'bg-purple-100 text-purple-800',
      'infrastructure': 'bg-green-100 text-green-800',
      'r&d': 'bg-pink-100 text-pink-800'
    };
    return badges[category as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'draft': 'bg-gray-100 text-gray-800',
      'review': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'active': 'bg-blue-100 text-blue-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      'critical': 'bg-red-100 text-red-800',
      'high': 'bg-orange-100 text-orange-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-blue-100 text-blue-800'
    };
    return badges[priority as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getApprovalStatusBadge = (status: string) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="h-8 w-8 text-teal-600" />
          Project Charter
        </h1>
        <p className="text-gray-600 mt-2">Project definition, authorization, and stakeholder alignment documents • FY 2025-26</p>
      </div>

      {isLoading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading charters…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Summary Cards - 6 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-teal-700 text-sm font-medium">Total Charters</p>
            <FileText className="h-5 w-5 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-teal-900">{stats.totalCharters}</p>
          <p className="text-xs text-teal-600 mt-1">All projects</p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-700 text-sm font-medium">Draft</p>
            <FileText className="h-5 w-5 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.draftCharters}</p>
          <p className="text-xs text-gray-600 mt-1">In preparation</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-yellow-700 text-sm font-medium">In Review</p>
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-900">{stats.reviewCharters}</p>
          <p className="text-xs text-yellow-600 mt-1">Pending approval</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-700 text-sm font-medium">Approved</p>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.approvedCharters}</p>
          <p className="text-xs text-green-600 mt-1">Ready to execute</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-700 text-sm font-medium">Active</p>
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.activeCharters}</p>
          <p className="text-xs text-blue-600 mt-1">In execution</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-700 text-sm font-medium">Total Budget</p>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">₹{(stats.totalBudget / 10000000).toFixed(1)}Cr</p>
          <p className="text-xs text-purple-600 mt-1">₹{(stats.approvedBudget / 10000000).toFixed(1)}Cr approved</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <input
              type="text"
              placeholder="Search charter, PM, sponsor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="construction">Construction</option>
              <option value="it">IT</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="r&d">R&D</option>
            </select>
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
            </select>
          </div>
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charters List */}
      <div className="space-y-3 mb-3">
        {filteredCharters.map((charter) => (
          <div key={charter.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            {/* Header */}
            <div className="flex items-start justify-between mb-2 pb-4 border-b border-gray-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{charter.projectName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(charter.category)}`}>
                    {charter.category.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(charter.status)}`}>
                    {charter.status.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(charter.priority)}`}>
                    {charter.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium text-teal-600">{charter.charterNumber}</span>
                  <span>•</span>
                  <span>Version {charter.version}</span>
                  <span>•</span>
                  <span>{charter.projectCode}</span>
                </div>
              </div>
              <div className="text-right ml-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm mb-2">
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <p className="text-xs text-gray-500">Last modified: {new Date(charter.lastModified).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Project Manager
                </p>
                <p className="text-sm font-bold text-blue-900">{charter.projectManager}</p>
                <p className="text-xs text-blue-700 mt-1">{charter.department}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <p className="text-xs text-purple-600 font-medium mb-1 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Sponsor
                </p>
                <p className="text-sm font-bold text-purple-900">{charter.sponsor}</p>
                <p className="text-xs text-purple-700 mt-1">Executive owner</p>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <p className="text-xs text-green-600 font-medium mb-1 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Budget
                </p>
                <p className="text-sm font-bold text-green-900">₹{(charter.budget / 10000000).toFixed(2)}Cr</p>
                <p className="text-xs text-green-700 mt-1">Approved amount</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                <p className="text-xs text-orange-600 font-medium mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Duration
                </p>
                <p className="text-sm font-bold text-orange-900">{charter.duration}</p>
                <p className="text-xs text-orange-700 mt-1">
                  {new Date(charter.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} - {new Date(charter.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Objectives */}
            <div className="mb-2">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-teal-600" />
                Project Objectives ({charter.objectives.length})
              </h4>
              <ul className="space-y-1">
                {charter.objectives.map((obj, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-teal-600 font-bold mt-1">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scope Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  In Scope ({charter.scope.included.length})
                </h4>
                <ul className="space-y-1">
                  {charter.scope.included.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {charter.scope.included.length > 3 && (
                    <li className="text-xs text-gray-500 ml-5">+ {charter.scope.included.length - 3} more items</li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Out of Scope ({charter.scope.excluded.length})
                </h4>
                <ul className="space-y-1">
                  {charter.scope.excluded.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {charter.scope.excluded.length > 3 && (
                    <li className="text-xs text-gray-500 ml-5">+ {charter.scope.excluded.length - 3} more items</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Stakeholders */}
            <div className="mb-2">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Key Stakeholders ({charter.stakeholders.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {charter.stakeholders.map((stakeholder, idx) => (
                  <div key={idx} className="bg-gray-50 rounded p-2 text-sm">
                    <span className="font-medium text-gray-900">{stakeholder.name}</span>
                    <span className="text-gray-500 text-xs ml-2">({stakeholder.role})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approvals */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Approval Status
              </h4>
              <div className="space-y-2">
                {charter.approvals.map((approval, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded p-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusBadge(approval.status)}`}>
                        {approval.status.toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{approval.approver}</p>
                        <p className="text-xs text-gray-600">{approval.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {approval.date && (
                        <p className="text-xs text-gray-600">
                          {new Date(approval.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                      {approval.comments && (
                        <p className="text-xs text-gray-500 italic mt-1">{approval.comments}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guidelines Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-teal-600" />
          Project Charter Guidelines
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Charter Components</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Project Objectives:</strong> Clear, measurable goals aligned with business strategy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Scope Definition:</strong> Detailed in-scope and out-of-scope items to prevent scope creep</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Deliverables:</strong> Tangible outputs and outcomes expected from the project</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Stakeholders:</strong> Key individuals with authority, interest, or impact on project</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Budget & Timeline:</strong> Approved funding and project duration with milestones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong>Risks & Assumptions:</strong> Identified threats and underlying project assumptions</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Charter Status Flow</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-600 font-bold">•</span>
                <span><strong>Draft:</strong> Initial creation, work in progress, not yet submitted for approval</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span><strong>In Review:</strong> Submitted to approvers, under evaluation and review</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Approved:</strong> All required approvals obtained, authorized to proceed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span><strong>Rejected:</strong> Not approved, requires revision or cancellation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Active:</strong> Project initiated and execution underway</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Approval Requirements</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Executive Sponsor:</strong> Mandatory approval from project sponsor (budget owner)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Finance Director:</strong> Required for all projects {'>'}₹10 Lakhs budget</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>CXO Approval:</strong> CEO/CIO approval for strategic or high-value projects ({'>'}₹1 Crore)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Department Head:</strong> Approval from impacted department heads for cross-functional projects</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Compliance/Legal:</strong> Review required for projects with regulatory or legal implications</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>SMART Objectives:</strong> Specific, Measurable, Achievable, Relevant, Time-bound goals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Clear Scope:</strong> Explicitly define what's included and excluded to manage expectations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Stakeholder Engagement:</strong> Identify all stakeholders early and define their roles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Risk Assessment:</strong> Proactively identify risks and document mitigation strategies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Version Control:</strong> Maintain version history for all charter revisions and updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Realistic Planning:</strong> Ensure budget and timeline estimates are based on historical data</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
