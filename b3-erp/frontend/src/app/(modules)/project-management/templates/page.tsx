'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { exportToCsv } from '@/lib/export';
import {
 Layers,
 Plus,
 Edit,
 Copy,
 Trash2,
 Eye,
 CheckCircle,
 Clock,
 Users,
 Calendar,
 DollarSign,
 FileText,
 Settings,
 Star,
 TrendingUp,
 Share2,
 Download,
 Upload,
 Archive,
} from 'lucide-react';
import {
 CreateTemplateModal,
 EditTemplateModal,
 DuplicateTemplateModal,
 DeleteTemplateModal,
 TemplateSettingsModal,
 ShareTemplateModal,
 ExportTemplateModal,
 ImportTemplateModal,
 ArchiveTemplateModal,
 FavoriteTemplateModal,
} from '@/components/project-management/TemplatesModals';

interface ProjectTemplate {
 id: string;
 templateName: string;
 projectType: string;
 description: string;
 category: 'Standard' | 'Custom' | 'Industry';
 complexity: 'Simple' | 'Medium' | 'Complex';
 estimatedDuration: string;
 estimatedBudget: string;
 phases: TemplatePhase[];
 milestones: number;
 tasks: number;
 resources: string[];
 deliverables: string[];
 defaultSettings: TemplateSettings;
 usageCount: number;
 lastUsed: string;
 createdBy: string;
 createdDate: string;
 isActive: boolean;
 isFavorite: boolean;
 tags: string[];
}

interface TemplatePhase {
 phaseName: string;
 duration: string;
 milestones: number;
 tasks: number;
 description: string;
}

interface TemplateSettings {
 defaultCurrency: string;
 budgetApprovalRequired: boolean;
 qualityChecksRequired: boolean;
 riskAssessmentRequired: boolean;
 changeOrderApprovalLevels: number;
 documentationMandatory: boolean;
}

export default function ProjectTemplatesPage() {
 const router = useRouter();
 const [searchTerm, setSearchTerm] = useState('');
 const [categoryFilter, setCategoryFilter] = useState('all');
 const [complexityFilter, setComplexityFilter] = useState('all');
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
 const [showDetailModal, setShowDetailModal] = useState(false);

 // Modal states for new modals
 const [showEditModal, setShowEditModal] = useState(false);
 const [showDuplicateModal, setShowDuplicateModal] = useState(false);
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [showSettingsModal, setShowSettingsModal] = useState(false);
 const [showShareModal, setShowShareModal] = useState(false);
 const [showExportModal, setShowExportModal] = useState(false);
 const [showImportModal, setShowImportModal] = useState(false);
 const [showArchiveModal, setShowArchiveModal] = useState(false);
 const [showFavoriteModal, setShowFavoriteModal] = useState(false);

 // Handlers
 const handleEdit = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowEditModal(true);
 };

 const handleDuplicate = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowDuplicateModal(true);
 };

 const handleDelete = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowDeleteModal(true);
 };

 const handleSettings = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowSettingsModal(true);
 };

 const handleShare = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowShareModal(true);
 };

 const handleExport = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowExportModal(true);
 };

 const handleArchive = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowArchiveModal(true);
 };

 const handleFavorite = (template: ProjectTemplate) => {
  setSelectedTemplate(template);
  setShowFavoriteModal(true);
 };

 const handleCreate = (data: any) => {
  console.log('Create template:', data);
  setShowCreateModal(false);
 };

 const handleEditSave = (data: any) => {
  console.log('Edit template:', data);
  setShowEditModal(false);
  setSelectedTemplate(null);
 };

 const handleDuplicateSave = (data: any) => {
  console.log('Duplicate template:', data);
  setShowDuplicateModal(false);
  setSelectedTemplate(null);
 };

 const handleDeleteConfirm = () => {
  console.log('Delete template:', selectedTemplate?.id);
  setShowDeleteModal(false);
  setSelectedTemplate(null);
 };

 const handleSettingsSave = (data: any) => {
  console.log('Settings saved:', data);
  setShowSettingsModal(false);
  setSelectedTemplate(null);
 };

 const handleShareSave = (data: any) => {
  console.log('Share template:', data);
  setShowShareModal(false);
  setSelectedTemplate(null);
 };

 const handleExportSave = (data: any) => {
  exportToCsv('project-templates', filteredTemplates as unknown as Record<string, unknown>[]);
  setShowExportModal(false);
  setSelectedTemplate(null);
 };

 const handleImportSave = (data: any) => {
  console.log('Import template:', data);
  setShowImportModal(false);
 };

 const handleArchiveSave = () => {
  console.log('Archive template:', selectedTemplate?.id);
  setShowArchiveModal(false);
  setSelectedTemplate(null);
 };

 const handleFavoriteSave = () => {
  console.log('Toggle favorite:', selectedTemplate?.id);
  setShowFavoriteModal(false);
  setSelectedTemplate(null);
 };

 // Mock data - 10 comprehensive templates
 const mockTemplates: ProjectTemplate[] = [
  {
   id: '1',
   templateName: 'Commercial Kitchen - Full Installation',
   projectType: 'Commercial Kitchen',
   description: 'Complete commercial kitchen installation with design, procurement, installation, and commissioning',
   category: 'Standard',
   complexity: 'Complex',
   estimatedDuration: '5-6 months',
   estimatedBudget: '₹75L - ₹1.2Cr',
   phases: [
    { phaseName: 'Planning & Design', duration: '4 weeks', milestones: 2, tasks: 15, description: 'Site survey, design, and approval' },
    { phaseName: 'Procurement', duration: '6 weeks', milestones: 3, tasks: 20, description: 'Material procurement and vendor management' },
    { phaseName: 'Installation', duration: '8 weeks', milestones: 4, tasks: 35, description: 'On-site installation and integration' },
    { phaseName: 'Testing & Commissioning', duration: '3 weeks', milestones: 2, tasks: 18, description: 'Testing, commissioning, and handover' },
    { phaseName: 'Training & Handover', duration: '1 week', milestones: 1, tasks: 8, description: 'Staff training and final handover' },
   ],
   milestones: 12,
   tasks: 96,
   resources: ['Project Manager', 'Design Engineer', 'Installation Supervisor', 'Commissioning Engineer', 'Quality Inspector', 'Safety Officer'],
   deliverables: ['Design Drawings', 'BOQ', 'Installation Plan', 'Test Reports', 'Commissioning Certificates', 'O&M Manuals', 'Training Materials'],
   defaultSettings: {
    defaultCurrency: 'INR',
    budgetApprovalRequired: true,
    qualityChecksRequired: true,
    riskAssessmentRequired: true,
    changeOrderApprovalLevels: 2,
    documentationMandatory: true,
   },
   usageCount: 28,
   lastUsed: '2024-05-15',
   createdBy: 'Rajesh Kumar',
   createdDate: '2023-08-10',
   isActive: true,
   isFavorite: true,
   tags: ['Kitchen', 'Installation', 'Full Service', 'Hotels', 'Restaurants'],
  },
  {
   id: '2',
   templateName: 'Cold Room - Standard Installation',
   projectType: 'Cold Room',
   description: 'Standard cold room installation for warehousing and food processing facilities',
   category: 'Standard',
   complexity: 'Complex',
   estimatedDuration: '4-5 months',
   estimatedBudget: '₹90L - ₹1.5Cr',
   phases: [
    { phaseName: 'Site Assessment & Design', duration: '3 weeks', milestones: 2, tasks: 12, description: 'Site evaluation and technical design' },
    { phaseName: 'Structural Preparation', duration: '4 weeks', milestones: 2, tasks: 18, description: 'Civil works and structural modifications' },
    { phaseName: 'Equipment Installation', duration: '6 weeks', milestones: 3, tasks: 28, description: 'Panel installation and refrigeration setup' },
    { phaseName: 'Testing & Commissioning', duration: '3 weeks', milestones: 2, tasks: 15, description: 'Performance testing and validation' },
    { phaseName: 'Handover & Training', duration: '1 week', milestones: 1, tasks: 6, description: 'Documentation and operator training' },
   ],
   milestones: 10,
   tasks: 79,
   resources: ['Project Manager', 'Refrigeration Engineer', 'Electrical Engineer', 'Installation Team', 'Commissioning Specialist', 'Quality Inspector'],
   deliverables: ['Technical Drawings', 'Load Calculations', 'Installation Manual', 'Test Certificates', 'Performance Reports', 'Maintenance Schedule'],
   defaultSettings: {
    defaultCurrency: 'INR',
    budgetApprovalRequired: true,
    qualityChecksRequired: true,
    riskAssessmentRequired: true,
    changeOrderApprovalLevels: 2,
    documentationMandatory: true,
   },
   usageCount: 22,
   lastUsed: '2024-05-20',
   createdBy: 'Priya Sharma',
   createdDate: '2023-09-15',
   isActive: true,
   isFavorite: true,
   tags: ['Cold Room', 'Refrigeration', 'Warehousing', 'Food Processing'],
  },
  {
   id: '3',
   templateName: 'Switchgear Installation - Industrial',
   projectType: 'Switchgear',
   description: 'Industrial switchgear installation with testing and commissioning',
   category: 'Standard',
   complexity: 'Complex',
   estimatedDuration: '5-7 months',
   estimatedBudget: '₹1.5Cr - ₹3Cr',
   phases: [
    { phaseName: 'Engineering & Design', duration: '5 weeks', milestones: 3, tasks: 22, description: 'Electrical design and engineering' },
    { phaseName: 'Panel Manufacturing', duration: '8 weeks', milestones: 4, tasks: 35, description: 'Switchgear panel fabrication' },
    { phaseName: 'Site Installation', duration: '6 weeks', milestones: 3, tasks: 28, description: 'On-site installation and wiring' },
    { phaseName: 'Testing & Commissioning', duration: '4 weeks', milestones: 3, tasks: 25, description: 'Comprehensive testing and commissioning' },
    { phaseName: 'Documentation & Handover', duration: '1 week', milestones: 1, tasks: 10, description: 'Final documentation and handover' },
   ],
   milestones: 14,
   tasks: 120,
   resources: ['Project Manager', 'Electrical Engineer', 'Panel Designer', 'Installation Supervisor', 'Testing Engineer', 'Commissioning Engineer', 'Safety Officer'],
   deliverables: ['SLD Drawings', 'Panel Drawings', 'Test Reports', 'Commissioning Certificates', 'As-Built Drawings', 'O&M Manuals'],
   defaultSettings: {
    defaultCurrency: 'INR',
    budgetApprovalRequired: true,
    qualityChecksRequired: true,
    riskAssessmentRequired: true,
    changeOrderApprovalLevels: 3,
    documentationMandatory: true,
   },
   usageCount: 15,
   lastUsed: '2024-05-10',
   createdBy: 'Sandeep Yadav',
   createdDate: '2023-10-20',
   isActive: true,
   isFavorite: false,
   tags: ['Switchgear', 'Electrical', 'Industrial', 'Power Distribution'],
  },
  {
   id: '4',
   templateName: 'Kitchen Upgrade - Quick Renovation',
   projectType: 'Commercial Kitchen',
   description: 'Quick kitchen upgrade and equipment replacement for existing facilities',
   category: 'Standard',
   complexity: 'Medium',
   estimatedDuration: '2-3 months',
   estimatedBudget: '₹30L - ₹60L',
   phases: [
    { phaseName: 'Assessment & Planning', duration: '2 weeks', milestones: 1, tasks: 8, description: 'Current state assessment and planning' },
    { phaseName: 'Equipment Procurement', duration: '4 weeks', milestones: 2, tasks: 12, description: 'Equipment selection and procurement' },
    { phaseName: 'Installation & Upgrade', duration: '4 weeks', milestones: 2, tasks: 20, description: 'Equipment installation and integration' },
    { phaseName: 'Testing & Handover', duration: '2 weeks', milestones: 1, tasks: 10, description: 'Testing and final handover' },
   ],
   milestones: 6,
   tasks: 50,
   resources: ['Project Manager', 'Installation Supervisor', 'Technician Team', 'Quality Inspector'],
   deliverables: ['Upgrade Plan', 'Equipment List', 'Installation Report', 'Test Certificates', 'Training Summary'],
   defaultSettings: {
    defaultCurrency: 'INR',
    budgetApprovalRequired: true,
    qualityChecksRequired: true,
    riskAssessmentRequired: false,
    changeOrderApprovalLevels: 1,
    documentationMandatory: true,
   },
   usageCount: 35,
   lastUsed: '2024-05-28',
   createdBy: 'Amit Patel',
   createdDate: '2023-11-05',
   isActive: true,
   isFavorite: true,
   tags: ['Kitchen', 'Upgrade', 'Renovation', 'Quick Turnaround'],
  },
  {
   id: '5',
   templateName: 'Cold Room - Modular Small Scale',
   projectType: 'Cold Room',
   description: 'Small-scale modular cold room for restaurants and small businesses',
   category: 'Standard',
   complexity: 'Simple',
   estimatedDuration: '1-2 months',
   estimatedBudget: '₹15L - ₹35L',
   phases: [
    { phaseName: 'Site Survey & Design', duration: '1 week', milestones: 1, tasks: 5, description: 'Site evaluation and modular design' },
    { phaseName: 'Procurement', duration: '3 weeks', milestones: 1, tasks: 8, description: 'Modular panel procurement' },
    { phaseName: 'Installation', duration: '2 weeks', milestones: 2, tasks: 12, description: 'Quick installation of modular units' },
    { phaseName: 'Testing & Handover', duration: '1 week', milestones: 1, tasks: 5, description: 'Performance testing and handover' },
   ],
   milestones: 5,
   tasks: 30,
   resources: ['Project Coordinator', 'Installation Team', 'Refrigeration Technician'],
   deliverables: ['Layout Drawing', 'Installation Report', 'Test Certificate', 'User Manual'],
   defaultSettings: {
    defaultCurrency: 'INR',
    budgetApprovalRequired: false,
    qualityChecksRequired: true,
    riskAssessmentRequired: false,
    changeOrderApprovalLevels: 1,
    documentationMandatory: false,
   },
   usageCount: 42,
   lastUsed: '2024-05-30',
   createdBy: 'Deepak Mehta',
   createdDate: '2023-12-01',
   isActive: true,
   isFavorite: false,
   tags: ['Cold Room', 'Modular', 'Small Scale', 'Quick Install'],
  },
  {
   id: '6',
   templateName: 'Central Kitchen - Large Scale',
   projectType: 'Commercial Kitchen',
   description: 'Large-scale central kitchen for cloud kitchens and institutional catering',
   category: 'Custom',
   complexity: 'Complex',
   estimatedDuration: '8-10 months',
   estimatedBudget: '₹2Cr - ₹5Cr',
   phases: [
    { phaseName: 'Concept & Design', duration: '6 weeks', milestones: 3, tasks: 25, description: 'Detailed design and workflow planning' },
    { phaseName: 'Regulatory Approvals', duration: '4 weeks', milestones: 2, tasks: 15, description: 'FSSAI and statutory approvals' },
    { phaseName: 'Procurement & Fabrication', duration: '12 weeks', milestones: 5, tasks: 40, description: 'Equipment procurement and custom fabrication' },
    { phaseName: 'Civil & MEP Works', duration: '8 weeks', milestones: 4, tasks: 35, description: 'Civil modifications and MEP installation' },
    { phaseName: 'Equipment Installation', duration: '6 weeks', milestones: 3, tasks: 30, description: 'Kitchen equipment installation' },
    { phaseName: 'Testing & Commissioning', duration: '4 weeks', milestones: 3, tasks: 22, description: 'Complete testing and commissioning' },
    { phaseName: 'Training & Handover', duration: '2 weeks', milestones: 1, tasks: 12, description: 'Staff training and handover' },
   ],
   milestones: 21,
   tasks: 179,
   resources: ['Project Manager', 'Design Team', 'MEP Consultant', 'Installation Manager', 'Commissioning Team', 'Quality Manager', 'Safety Officer', 'Training Coordinator'],
   deliverables: ['Master Design', 'Workflow Layout', 'BOQ', 'MEP Drawings', 'Installation Plan', 'Test Reports', 'FSSAI Documents', 'Training Materials', 'O&M Manuals'],
   defaultSettings: {
    defaultCurrency: 'INR',
    budgetApprovalRequired: true,
    qualityChecksRequired: true,
    riskAssessmentRequired: true,
    changeOrderApprovalLevels: 3,
    documentationMandatory: true,
   },
   usageCount: 8,
   lastUsed: '2024-04-20',
   createdBy: 'Rajesh Kumar',
   createdDate: '2024-01-10',
   isActive: true,
   isFavorite: false,
   tags: ['Central Kitchen', 'Large Scale', 'Cloud Kitchen', 'Institutional'],
  },
  {
   id: '7',
   templateName: 'Switchgear - Maintenance & Upgrade',
   projectType: 'Switchgear',
   description: 'Switchgear maintenance, testing, and selective upgrades',
   category: 'Standard',
   complexity: 'Medium',
   estimatedDuration: '2-3 months',
   estimatedBudget: '₹40L - ₹80L',
   phases: [
    { phaseName: 'Assessment & Planning', duration: '2 weeks', milestones: 1, tasks: 10, description: 'Current state assessment and upgrade planning' },
    { phaseName: 'Equipment Procurement', duration: '4 weeks', milestones: 2, tasks: 12, description: 'Replacement parts procurement' },
    { phaseName: 'Upgrade & Maintenance', duration: '4 weeks', milestones: 2, tasks: 18, description: 'Component replacement and maintenance' },
    { phaseName: 'Testing & Certification', duration: '2 weeks', milestones: 1, tasks: 12, description: 'Comprehensive testing and certification' },
   ],
   milestones: 6,
   tasks: 52,
   resources: ['Project Manager', 'Electrical Engineer', 'Testing Technicians', 'Installation Team'],
   deliverables: ['Assessment Report', 'Upgrade Plan', 'Test Reports', 'Compliance Certificates', 'Maintenance Schedule'],
   defaultSettings: {
    defaultCurrency: 'INR',
    budgetApprovalRequired: true,
    qualityChecksRequired: true,
    riskAssessmentRequired: true,
    changeOrderApprovalLevels: 2,
    documentationMandatory: true,
   },
   usageCount: 18,
   lastUsed: '2024-05-05',
   createdBy: 'Sandeep Yadav',
   createdDate: '2024-02-15',
   isActive: true,
   isFavorite: false,
   tags: ['Switchgear', 'Maintenance', 'Upgrade', 'Testing'],
  },
  {
   id: '8',
   templateName: 'Blast Freezer Installation',
   projectType: 'Cold Room',
   description: 'Blast freezer installation for seafood processing and quick freezing',
   category: 'Custom',
   complexity: 'Complex',
   estimatedDuration: '4-5 months',
   estimatedBudget: '₹1Cr - ₹2Cr',
   phases: [
    { phaseName: 'Technical Design', duration: '3 weeks', milestones: 2, tasks: 15, description: 'Thermal design and engineering' },
    { phaseName: 'Equipment Procurement', duration: '8 weeks', milestones: 3, tasks: 20, description: 'Specialized equipment procurement' },
    { phaseName: 'Civil & Insulation Works', duration: '4 weeks', milestones: 2, tasks: 15, description: 'Structural works and insulation' },
    { phaseName: 'Equipment Installation', duration: '4 weeks', milestones: 2, tasks: 18, description: 'Freezer and refrigeration installation' },
    { phaseName: 'Testing & Commissioning', duration: '2 weeks', milestones: 2, tasks: 15, description: 'Performance testing and validation' },
   ],
   milestones: 11,
   tasks: 83,
   resources: ['Project Manager', 'Thermal Engineer', 'Refrigeration Specialist', 'Installation Team', 'Commissioning Engineer'],
   deliverables: ['Thermal Calculations', 'Equipment Specifications', 'Installation Report', 'Performance Test Reports', 'O&M Manual'],
   defaultSettings: {
    defaultCurrency: 'INR',
    budgetApprovalRequired: true,
    qualityChecksRequired: true,
    riskAssessmentRequired: true,
    changeOrderApprovalLevels: 2,
    documentationMandatory: true,
   },
   usageCount: 6,
   lastUsed: '2024-03-15',
   createdBy: 'Priya Sharma',
   createdDate: '2024-01-20',
   isActive: true,
   isFavorite: false,
   tags: ['Blast Freezer', 'Cold Room', 'Seafood', 'Quick Freeze'],
  },
  {
   id: '9',
   templateName: 'Display Kitchen Installation',
   projectType: 'Commercial Kitchen',
   description: 'Open/display kitchen installation for modern restaurants and hotels',
   category: 'Custom',
   complexity: 'Medium',
   estimatedDuration: '3-4 months',
   estimatedBudget: '₹50L - ₹1Cr',
   phases: [
    { phaseName: 'Design & Aesthetics', duration: '3 weeks', milestones: 2, tasks: 12, description: 'Aesthetic design with functional layout' },
    { phaseName: 'Custom Fabrication', duration: '6 weeks', milestones: 3, tasks: 20, description: 'Custom equipment fabrication' },
    { phaseName: 'Installation & Integration', duration: '4 weeks', milestones: 2, tasks: 18, description: 'Installation with aesthetic finishing' },
    { phaseName: 'Testing & Training', duration: '2 weeks', milestones: 1, tasks: 10, description: 'Testing and chef training' },
   ],
   milestones: 8,
   tasks: 60,
   resources: ['Project Manager', 'Kitchen Designer', 'Fabrication Team', 'Installation Team', 'Chef Trainer'],
   deliverables: ['Design Renders', 'Fabrication Drawings', 'Installation Report', 'Training Summary'],
   defaultSettings: {
    defaultCurrency: 'INR',
    budgetApprovalRequired: true,
    qualityChecksRequired: true,
    riskAssessmentRequired: false,
    changeOrderApprovalLevels: 2,
    documentationMandatory: true,
   },
   usageCount: 12,
   lastUsed: '2024-04-10',
   createdBy: 'Amit Patel',
   createdDate: '2023-11-25',
   isActive: true,
   isFavorite: false,
   tags: ['Display Kitchen', 'Open Kitchen', 'Custom', 'Aesthetic'],
  },
  {
   id: '10',
   templateName: 'Emergency Power Distribution - Switchgear',
   projectType: 'Switchgear',
   description: 'Emergency backup power distribution system with UPS and DG integration',
   category: 'Custom',
   complexity: 'Complex',
   estimatedDuration: '4-6 months',
   estimatedBudget: '₹1.2Cr - ₹2.5Cr',
   phases: [
    { phaseName: 'System Design', duration: '4 weeks', milestones: 2, tasks: 18, description: 'Complete electrical system design' },
    { phaseName: 'Equipment Procurement', duration: '8 weeks', milestones: 3, tasks: 22, description: 'UPS, DG, and switchgear procurement' },
    { phaseName: 'Installation', duration: '6 weeks', milestones: 3, tasks: 28, description: 'Complete system installation' },
    { phaseName: 'Integration & Testing', duration: '4 weeks', milestones: 3, tasks: 25, description: 'System integration and testing' },
    { phaseName: 'Commissioning & Training', duration: '2 weeks', milestones: 1, tasks: 12, description: 'Final commissioning and training' },
   ],
   milestones: 12,
   tasks: 105,
   resources: ['Project Manager', 'Electrical Consultant', 'Installation Manager', 'Testing Engineer', 'Commissioning Engineer'],
   deliverables: ['SLD', 'Equipment Specifications', 'Installation Manual', 'Test Reports', 'Commissioning Certificate', 'Training Materials'],
   defaultSettings: {
    defaultCurrency: 'INR',
    budgetApprovalRequired: true,
    qualityChecksRequired: true,
    riskAssessmentRequired: true,
    changeOrderApprovalLevels: 3,
    documentationMandatory: true,
   },
   usageCount: 5,
   lastUsed: '2024-02-28',
   createdBy: 'Sandeep Yadav',
   createdDate: '2024-01-05',
   isActive: true,
   isFavorite: false,
   tags: ['Emergency Power', 'Backup', 'UPS', 'DG', 'Switchgear'],
  },
 ];

 const filteredTemplates = mockTemplates.filter((template) => {
  const matchesSearch =
   template.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
   template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
   template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
  const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
  const matchesComplexity = complexityFilter === 'all' || template.complexity === complexityFilter;
  return matchesSearch && matchesCategory && matchesComplexity;
 });

 const getCategoryColor = (category: string) => {
  switch (category) {
   case 'Standard':
    return 'text-blue-600 bg-blue-50';
   case 'Custom':
    return 'text-purple-600 bg-purple-50';
   case 'Industry':
    return 'text-green-600 bg-green-50';
   default:
    return 'text-gray-600 bg-gray-50';
  }
 };

 const getComplexityColor = (complexity: string) => {
  switch (complexity) {
   case 'Simple':
    return 'text-green-600 bg-green-50';
   case 'Medium':
    return 'text-yellow-600 bg-yellow-50';
   case 'Complex':
    return 'text-red-600 bg-red-50';
   default:
    return 'text-gray-600 bg-gray-50';
  }
 };

 return (
  <div className="h-screen flex flex-col overflow-hidden">
   <div className="flex-1 overflow-y-auto overflow-x-hidden">
    <div className="px-3 py-2">
     {/* Action Bar */}
     <div className="mb-3">
      <div className="flex items-center justify-end gap-3 mb-2">
       <button
        onClick={() => setShowImportModal(true)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
       >
        <Upload className="w-4 h-4" />
        Import Template
       </button>
       <button
        onClick={() => setShowCreateModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
       >
        <Plus className="w-4 h-4" />
        Create Template
       </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Total Templates</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{mockTemplates.length}</p>
        <p className="text-xs text-green-600 mt-1">{mockTemplates.filter(t => t.isActive).length} active</p>
       </div>
       <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <Layers className="w-6 h-6 text-blue-600" />
       </div>
      </div>
     </div>

     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Most Used</p>
        <p className="text-lg font-bold text-gray-900 mt-1 truncate">
         {mockTemplates.sort((a, b) => b.usageCount - a.usageCount)[0]?.templateName.split('-')[0]}
        </p>
        <p className="text-xs text-gray-500 mt-1">
         {mockTemplates.sort((a, b) => b.usageCount - a.usageCount)[0]?.usageCount} times
        </p>
       </div>
       <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
        <TrendingUp className="w-6 h-6 text-green-600" />
       </div>
      </div>
     </div>

     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Favorites</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
         {mockTemplates.filter(t => t.isFavorite).length}
        </p>
        <p className="text-xs text-yellow-600 mt-1">Marked as favorite</p>
       </div>
       <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
        <Star className="w-6 h-6 text-yellow-600" />
       </div>
      </div>
     </div>

     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Total Usage</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
         {mockTemplates.reduce((sum, t) => sum + t.usageCount, 0)}
        </p>
        <p className="text-xs text-gray-500 mt-1">Projects created</p>
       </div>
       <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
        <FileText className="w-6 h-6 text-purple-600" />
       </div>
      </div>
     </div>
    </div>
   </div>

   {/* Filters */}
   <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-3">
    <div className="flex flex-col md:flex-row gap-2">
     <div className="flex-1">
      <input
       type="text"
       placeholder="Search templates by name, description, or tags..."
       value={searchTerm}
       onChange={(e) => setSearchTerm(e.target.value)}
       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      />
     </div>
     <select
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
     >
      <option value="all">All Categories</option>
      <option value="Standard">Standard</option>
      <option value="Custom">Custom</option>
      <option value="Industry">Industry</option>
     </select>
     <select
      value={complexityFilter}
      onChange={(e) => setComplexityFilter(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
     >
      <option value="all">All Complexity</option>
      <option value="Simple">Simple</option>
      <option value="Medium">Medium</option>
      <option value="Complex">Complex</option>
     </select>
    </div>
   </div>

   {/* Templates Grid */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    {filteredTemplates.map((template) => (
     <div
      key={template.id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
     >
      <div className="flex items-start justify-between mb-2">
       <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
         <h3 className="text-lg font-semibold text-gray-900">{template.templateName}</h3>
         {template.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
        </div>
        <p className="text-sm text-gray-600">{template.projectType}</p>
       </div>
      </div>

      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{template.description}</p>

      <div className="space-y-2 mb-2">
       <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Category:</span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(template.category)}`}>
         {template.category}
        </span>
       </div>
       <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Complexity:</span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getComplexityColor(template.complexity)}`}>
         {template.complexity}
        </span>
       </div>
       <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 flex items-center gap-1">
         <Clock className="w-3 h-3" /> Duration:
        </span>
        <span className="text-gray-900">{template.estimatedDuration}</span>
       </div>
       <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 flex items-center gap-1">
         <DollarSign className="w-3 h-3" /> Budget:
        </span>
        <span className="text-gray-900">{template.estimatedBudget}</span>
       </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-2 text-center">
       <div className="bg-blue-50 rounded-lg p-2">
        <p className="text-lg font-bold text-blue-600">{template.phases.length}</p>
        <p className="text-xs text-gray-600">Phases</p>
       </div>
       <div className="bg-green-50 rounded-lg p-2">
        <p className="text-lg font-bold text-green-600">{template.milestones}</p>
        <p className="text-xs text-gray-600">Milestones</p>
       </div>
       <div className="bg-purple-50 rounded-lg p-2">
        <p className="text-lg font-bold text-purple-600">{template.tasks}</p>
        <p className="text-xs text-gray-600">Tasks</p>
       </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-2">
       <p className="text-xs text-gray-500 mb-2">
        Used {template.usageCount} times • Last used {new Date(template.lastUsed).toLocaleDateString('en-IN')}
       </p>
       <div className="flex flex-wrap gap-1">
        {template.tags.slice(0, 3).map((tag, idx) => (
         <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
          {tag}
         </span>
        ))}
        {template.tags.length > 3 && (
         <span className="text-xs text-gray-500">+{template.tags.length - 3}</span>
        )}
       </div>
      </div>

      <div className="space-y-2">
       <div className="flex gap-2">
        <button
         onClick={() => {
          setSelectedTemplate(template);
          setShowDetailModal(true);
         }}
         className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 text-sm"
        >
         <Eye className="w-4 h-4" />
         View Details
        </button>
        <button
         onClick={() => handleDuplicate(template)}
         className="inline-flex items-center gap-1.5 px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm"
        >
         <Copy className="w-4 h-4" />
        </button>
        <button
         onClick={() => handleEdit(template)}
         className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
         <Edit className="w-4 h-4 text-gray-600" />
        </button>
       </div>

       <div className="flex gap-2">
        <button
         onClick={() => handleShare(template)}
         className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
         title="Share"
        >
         <Share2 className="w-3.5 h-3.5 text-gray-600" />
         <span className="text-gray-700">Share</span>
        </button>
        <button
         onClick={() => handleExport(template)}
         className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
         title="Export"
        >
         <Download className="w-3.5 h-3.5 text-gray-600" />
         <span className="text-gray-700">Export</span>
        </button>
        <button
         onClick={() => handleSettings(template)}
         className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
         title="Settings"
        >
         <Settings className="w-3.5 h-3.5 text-gray-600" />
        </button>
        <button
         onClick={() => handleFavorite(template)}
         className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
         title="Favorite"
        >
         <Star className={`w-3.5 h-3.5 ${template.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
        </button>
        <button
         onClick={() => handleArchive(template)}
         className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
         title="Archive"
        >
         <Archive className="w-3.5 h-3.5 text-gray-600" />
        </button>
        <button
         onClick={() => handleDelete(template)}
         className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-300 rounded-lg hover:bg-red-50 text-xs"
         title="Delete"
        >
         <Trash2 className="w-3.5 h-3.5 text-red-600" />
        </button>
       </div>
      </div>
     </div>
    ))}
   </div>

   {/* Template Detail Modal */}
   {showDetailModal && selectedTemplate && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
     <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
       <div className="flex items-start justify-between">
        <div>
         <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.templateName}</h2>
         <p className="text-gray-600 mt-1">{selectedTemplate.description}</p>
        </div>
        <button
         onClick={() => {
          setShowDetailModal(false);
          setSelectedTemplate(null);
         }}
         className="text-gray-400 hover:text-gray-600"
        >
         ✕
        </button>
       </div>
      </div>

      <div className="p-6 space-y-3">
       {/* Overview */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
         <div>
          <p className="text-sm text-gray-600">Project Type</p>
          <p className="font-medium text-gray-900">{selectedTemplate.projectType}</p>
         </div>
         <div>
          <p className="text-sm text-gray-600">Duration</p>
          <p className="font-medium text-gray-900">{selectedTemplate.estimatedDuration}</p>
         </div>
         <div>
          <p className="text-sm text-gray-600">Budget Range</p>
          <p className="font-medium text-gray-900">{selectedTemplate.estimatedBudget}</p>
         </div>
         <div>
          <p className="text-sm text-gray-600">Complexity</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getComplexityColor(selectedTemplate.complexity)}`}>
           {selectedTemplate.complexity}
          </span>
         </div>
        </div>
       </div>

       {/* Phases */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Phases</h3>
        <div className="space-y-3">
         {selectedTemplate.phases.map((phase, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-3">
           <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900">{phase.phaseName}</h4>
            <span className="text-sm text-gray-600">{phase.duration}</span>
           </div>
           <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
           <div className="flex gap-2 text-xs text-gray-500">
            <span>{phase.milestones} milestones</span>
            <span>{phase.tasks} tasks</span>
           </div>
          </div>
         ))}
        </div>
       </div>

       {/* Resources */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Resources</h3>
        <div className="flex flex-wrap gap-2">
         {selectedTemplate.resources.map((resource, idx) => (
          <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
           <Users className="w-3 h-3 mr-1" />
           {resource}
          </span>
         ))}
        </div>
       </div>

       {/* Deliverables */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Deliverables</h3>
        <div className="grid grid-cols-2 gap-2">
         {selectedTemplate.deliverables.map((deliverable, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
           <CheckCircle className="w-4 h-4 text-green-600" />
           {deliverable}
          </div>
         ))}
        </div>
       </div>
      </div>

      <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
       <button
        onClick={() => {
         setShowDetailModal(false);
         setSelectedTemplate(null);
        }}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
       >
        Close
       </button>
       <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
        Use This Template
       </button>
      </div>
     </div>
    </div>
   )}

   {/* All Modals */}
   <CreateTemplateModal
    isOpen={showCreateModal}
    onClose={() => setShowCreateModal(false)}
    onCreate={handleCreate}
   />

   <EditTemplateModal
    isOpen={showEditModal}
    onClose={() => {
     setShowEditModal(false);
     setSelectedTemplate(null);
    }}
    onUpdate={handleEditSave}
    template={selectedTemplate}
   />

   <DuplicateTemplateModal
    isOpen={showDuplicateModal}
    onClose={() => {
     setShowDuplicateModal(false);
     setSelectedTemplate(null);
    }}
    onDuplicate={handleDuplicateSave}
    template={selectedTemplate}
   />

   <DeleteTemplateModal
    isOpen={showDeleteModal}
    onClose={() => {
     setShowDeleteModal(false);
     setSelectedTemplate(null);
    }}
    onDelete={handleDeleteConfirm}
    template={selectedTemplate}
   />

   <TemplateSettingsModal
    isOpen={showSettingsModal}
    onClose={() => {
     setShowSettingsModal(false);
     setSelectedTemplate(null);
    }}
    onSave={handleSettingsSave}
    template={selectedTemplate}
   />

   <ShareTemplateModal
    isOpen={showShareModal}
    onClose={() => {
     setShowShareModal(false);
     setSelectedTemplate(null);
    }}
    onShare={handleShareSave}
    template={selectedTemplate}
   />

   <ExportTemplateModal
    isOpen={showExportModal}
    onClose={() => {
     setShowExportModal(false);
     setSelectedTemplate(null);
    }}
    onExport={handleExportSave}
    template={selectedTemplate}
   />

   <ImportTemplateModal
    isOpen={showImportModal}
    onClose={() => setShowImportModal(false)}
    onImport={handleImportSave}
   />

   <ArchiveTemplateModal
    isOpen={showArchiveModal}
    onClose={() => {
     setShowArchiveModal(false);
     setSelectedTemplate(null);
    }}
    onArchive={handleArchiveSave}
    template={selectedTemplate}
   />

   <FavoriteTemplateModal
    isOpen={showFavoriteModal}
    onClose={() => {
     setShowFavoriteModal(false);
     setSelectedTemplate(null);
    }}
    onToggleFavorite={handleFavoriteSave}
    template={selectedTemplate}
   />
    </div>
   </div>
  </div>
 );
}
