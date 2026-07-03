'use client';

import { useState } from 'react';
import { exportToCsv } from '@/lib/export';
import {
 Flag,
 Plus,
 Edit,
 Copy,
 Trash2,
 Eye,
 Clock,
 CheckCircle,
 Calendar,
 DollarSign,
 FileText,
 Users,
 AlertCircle,
 TrendingUp,
 Settings,
 Download,
 Upload,
} from 'lucide-react';
import {
 CreateMilestoneTemplateModal,
 EditMilestoneTemplateModal,
 DuplicateMilestoneTemplateModal,
 DeleteMilestoneTemplateModal,
 ManageMilestonesModal,
 ViewTemplateDetailsModal,
 ExportTemplateModal,
 ImportTemplateModal,
} from '@/components/project-management/MilestoneTemplatesModals';

interface MilestoneTemplate {
 id: string;
 templateName: string;
 projectType: string;
 description: string;
 totalMilestones: number;
 estimatedDuration: string;
 milestones: Milestone[];
 usageCount: number;
 lastUsed: string;
 createdBy: string;
 createdDate: string;
 isActive: boolean;
}

interface Milestone {
 milestoneName: string;
 phase: string;
 order: number;
 description: string;
 duration: string;
 paymentPercentage?: number;
 dependencies: string[];
 deliverables: string[];
 approvalRequired: boolean;
 criticalMilestone: boolean;
}

export default function MilestoneTemplatesPage() {
 const [searchTerm, setSearchTerm] = useState('');
 const [projectTypeFilter, setProjectTypeFilter] = useState('all');
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [selectedTemplate, setSelectedTemplate] = useState<MilestoneTemplate | null>(null);
 const [showDetailModal, setShowDetailModal] = useState(false);

 // New modal states
 const [showEditModal, setShowEditModal] = useState(false);
 const [showDuplicateModal, setShowDuplicateModal] = useState(false);
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [showManageMilestonesModal, setShowManageMilestonesModal] = useState(false);
 const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
 const [showExportModal, setShowExportModal] = useState(false);
 const [showImportModal, setShowImportModal] = useState(false);

 // Handlers
 const handleCreate = (data: any) => {
  console.log('Create template:', data);
  setShowCreateModal(false);
 };

 const handleEdit = (template: MilestoneTemplate) => {
  setSelectedTemplate(template);
  setShowEditModal(true);
 };

 const handleDuplicate = (template: MilestoneTemplate) => {
  setSelectedTemplate(template);
  setShowDuplicateModal(true);
 };

 const handleDelete = (template: MilestoneTemplate) => {
  setSelectedTemplate(template);
  setShowDeleteModal(true);
 };

 const handleManageMilestones = (template: MilestoneTemplate) => {
  setSelectedTemplate(template);
  setShowManageMilestonesModal(true);
 };

 const handleViewDetails = (template: MilestoneTemplate) => {
  setSelectedTemplate(template);
  setShowViewDetailsModal(true);
 };

 const handleExport = (template: MilestoneTemplate) => {
  setSelectedTemplate(template);
  setShowExportModal(true);
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

 const handleMilestonesSave = (data: any) => {
  console.log('Milestones saved:', data);
  setShowManageMilestonesModal(false);
  setSelectedTemplate(null);
 };

 const handleExportSave = (data: any) => {
  exportToCsv('milestone-templates', filteredTemplates as unknown as Record<string, unknown>[]);
  setShowExportModal(false);
  setSelectedTemplate(null);
 };

 const handleImport = (data: any) => {
  console.log('Import template:', data);
  setShowImportModal(false);
 };

 // Mock data - 8 comprehensive milestone templates
 const mockTemplates: MilestoneTemplate[] = [
  {
   id: '1',
   templateName: 'Commercial Kitchen - Full Installation Milestones',
   projectType: 'Commercial Kitchen',
   description: 'Standard milestone set for complete kitchen installation projects',
   totalMilestones: 12,
   estimatedDuration: '5-6 months',
   milestones: [
    {
     milestoneName: 'Project Kickoff & Site Survey',
     phase: 'Planning & Design',
     order: 1,
     description: 'Initial project kickoff meeting and comprehensive site survey',
     duration: '1 week',
     paymentPercentage: 10,
     dependencies: [],
     deliverables: ['Site Survey Report', 'Measurement Drawings', 'Photo Documentation'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Design Approval',
     phase: 'Planning & Design',
     order: 2,
     description: 'Complete kitchen design approval by client',
     duration: '2 weeks',
     paymentPercentage: 15,
     dependencies: ['Project Kickoff & Site Survey'],
     deliverables: ['Layout Drawings', '3D Renders', 'Equipment List', 'BOQ'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'FSSAI & Regulatory Approvals',
     phase: 'Planning & Design',
     order: 3,
     description: 'Obtain necessary regulatory approvals',
     duration: '2 weeks',
     dependencies: ['Design Approval'],
     deliverables: ['FSSAI Application', 'Fire NOC', 'Building Permits'],
     approvalRequired: true,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Material Procurement Complete',
     phase: 'Procurement',
     order: 4,
     description: 'All materials and equipment procured',
     duration: '4 weeks',
     paymentPercentage: 20,
     dependencies: ['Design Approval'],
     deliverables: ['Purchase Orders', 'Delivery Schedule', 'Material Inspection Reports'],
     approvalRequired: false,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Civil & MEP Work Completion',
     phase: 'Installation',
     order: 5,
     description: 'Civil modifications and MEP installations complete',
     duration: '3 weeks',
     paymentPercentage: 10,
     dependencies: ['Material Procurement Complete'],
     deliverables: ['Civil Work Completion Certificate', 'MEP Drawings As-Built'],
     approvalRequired: true,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Equipment Installation - Phase 1',
     phase: 'Installation',
     order: 6,
     description: 'First phase equipment installation complete',
     duration: '2 weeks',
     paymentPercentage: 10,
     dependencies: ['Civil & MEP Work Completion'],
     deliverables: ['Installation Photos', 'Progress Report'],
     approvalRequired: false,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Equipment Installation - Phase 2',
     phase: 'Installation',
     order: 7,
     description: 'Second phase equipment installation complete',
     duration: '3 weeks',
     paymentPercentage: 10,
     dependencies: ['Equipment Installation - Phase 1'],
     deliverables: ['Installation Photos', 'Progress Report'],
     approvalRequired: false,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Complete Installation Done',
     phase: 'Installation',
     order: 8,
     description: 'All equipment installed and integrated',
     duration: '1 week',
     paymentPercentage: 10,
     dependencies: ['Equipment Installation - Phase 2'],
     deliverables: ['Installation Completion Report', 'As-Built Drawings'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Testing & Quality Inspection',
     phase: 'Testing & Commissioning',
     order: 9,
     description: 'Complete testing and quality inspection',
     duration: '1 week',
     dependencies: ['Complete Installation Done'],
     deliverables: ['Test Reports', 'Quality Inspection Checklist', 'Defect List'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Commissioning Complete',
     phase: 'Testing & Commissioning',
     order: 10,
     description: 'Equipment commissioning and trial runs complete',
     duration: '1 week',
     paymentPercentage: 10,
     dependencies: ['Testing & Quality Inspection'],
     deliverables: ['Commissioning Report', 'Performance Test Results'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Staff Training',
     phase: 'Training & Handover',
     order: 11,
     description: 'Kitchen staff training complete',
     duration: '3 days',
     dependencies: ['Commissioning Complete'],
     deliverables: ['Training Manual', 'Training Attendance', 'Training Certificates'],
     approvalRequired: false,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Final Handover & Project Closure',
     phase: 'Training & Handover',
     order: 12,
     description: 'Project handover with all documentation',
     duration: '2 days',
     paymentPercentage: 5,
     dependencies: ['Staff Training'],
     deliverables: ['Handover Certificate', 'O&M Manuals', 'Warranty Documents', 'Final Invoice'],
     approvalRequired: true,
     criticalMilestone: true,
    },
   ],
   usageCount: 28,
   lastUsed: '2024-05-15',
   createdBy: 'Rajesh Kumar',
   createdDate: '2023-08-10',
   isActive: true,
  },
  {
   id: '2',
   templateName: 'Cold Room - Standard Installation Milestones',
   projectType: 'Cold Room',
   description: 'Standard milestones for cold room and cold storage projects',
   totalMilestones: 10,
   estimatedDuration: '4-5 months',
   milestones: [
    {
     milestoneName: 'Site Survey & Technical Assessment',
     phase: 'Site Assessment & Design',
     order: 1,
     description: 'Initial site survey and technical feasibility assessment',
     duration: '1 week',
     paymentPercentage: 15,
     dependencies: [],
     deliverables: ['Site Survey Report', 'Technical Feasibility Report', 'Load Calculations'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Design & Engineering Approval',
     phase: 'Site Assessment & Design',
     order: 2,
     description: 'Complete design and engineering drawings approved',
     duration: '2 weeks',
     paymentPercentage: 10,
     dependencies: ['Site Survey & Technical Assessment'],
     deliverables: ['Technical Drawings', 'Equipment Specifications', 'Thermal Calculations'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Structural Preparation Complete',
     phase: 'Structural Preparation',
     order: 3,
     description: 'Civil works and structural modifications complete',
     duration: '3 weeks',
     paymentPercentage: 15,
     dependencies: ['Design & Engineering Approval'],
     deliverables: ['Civil Work Completion Report', 'Structural Inspection Certificate'],
     approvalRequired: true,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Insulation Panel Installation',
     phase: 'Structural Preparation',
     order: 4,
     description: 'Cold room panel installation complete',
     duration: '2 weeks',
     paymentPercentage: 15,
     dependencies: ['Structural Preparation Complete'],
     deliverables: ['Panel Installation Report', 'Insulation Test Report'],
     approvalRequired: false,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Refrigeration Equipment Installation',
     phase: 'Equipment Installation',
     order: 5,
     description: 'Refrigeration system installation complete',
     duration: '3 weeks',
     paymentPercentage: 15,
     dependencies: ['Insulation Panel Installation'],
     deliverables: ['Equipment Installation Report', 'Piping Layout'],
     approvalRequired: false,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Electrical & Control System',
     phase: 'Equipment Installation',
     order: 6,
     description: 'Electrical and automation systems installed',
     duration: '1 week',
     paymentPercentage: 10,
     dependencies: ['Refrigeration Equipment Installation'],
     deliverables: ['Electrical Completion Report', 'Control Panel Documentation'],
     approvalRequired: false,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Pre-Commissioning Tests',
     phase: 'Testing & Commissioning',
     order: 7,
     description: 'Initial testing before full commissioning',
     duration: '3 days',
     dependencies: ['Electrical & Control System'],
     deliverables: ['Pre-Commissioning Test Results', 'Punch List'],
     approvalRequired: true,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Performance Testing',
     phase: 'Testing & Commissioning',
     order: 8,
     description: 'Temperature stabilization and performance validation',
     duration: '1 week',
     paymentPercentage: 10,
     dependencies: ['Pre-Commissioning Tests'],
     deliverables: ['Performance Test Report', 'Temperature Log'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Commissioning Certificate',
     phase: 'Testing & Commissioning',
     order: 9,
     description: 'Final commissioning and certificate issuance',
     duration: '2 days',
     paymentPercentage: 5,
     dependencies: ['Performance Testing'],
     deliverables: ['Commissioning Certificate', 'Test Certificates'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Handover & Training',
     phase: 'Handover & Training',
     order: 10,
     description: 'Final handover with operator training',
     duration: '2 days',
     paymentPercentage: 5,
     dependencies: ['Commissioning Certificate'],
     deliverables: ['Handover Certificate', 'O&M Manual', 'Training Certificate', 'Maintenance Schedule'],
     approvalRequired: true,
     criticalMilestone: true,
    },
   ],
   usageCount: 22,
   lastUsed: '2024-05-20',
   createdBy: 'Priya Sharma',
   createdDate: '2023-09-15',
   isActive: true,
  },
  {
   id: '3',
   templateName: 'Switchgear - Industrial Installation Milestones',
   projectType: 'Switchgear',
   description: 'Comprehensive milestones for industrial switchgear projects',
   totalMilestones: 14,
   estimatedDuration: '5-7 months',
   milestones: [
    {
     milestoneName: 'Design Basis & Single Line Diagram',
     phase: 'Engineering & Design',
     order: 1,
     description: 'Electrical design basis and SLD approval',
     duration: '2 weeks',
     paymentPercentage: 10,
     dependencies: [],
     deliverables: ['Design Basis Document', 'Single Line Diagram', 'Load Schedule'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Detailed Engineering Approval',
     phase: 'Engineering & Design',
     order: 2,
     description: 'Complete engineering drawings and specifications',
     duration: '3 weeks',
     paymentPercentage: 10,
     dependencies: ['Design Basis & Single Line Diagram'],
     deliverables: ['Panel GA Drawings', 'Wiring Diagrams', 'Bill of Materials'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Type Test Certificates Submission',
     phase: 'Engineering & Design',
     order: 3,
     description: 'All required type test certificates submitted',
     duration: '1 week',
     dependencies: ['Detailed Engineering Approval'],
     deliverables: ['Type Test Certificates', 'Product Datasheets'],
     approvalRequired: true,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Panel Manufacturing - 50% Complete',
     phase: 'Panel Manufacturing',
     order: 4,
     description: 'Half of panels manufactured',
     duration: '4 weeks',
     paymentPercentage: 15,
     dependencies: ['Detailed Engineering Approval'],
     deliverables: ['Manufacturing Progress Report', 'Quality Inspection Reports'],
     approvalRequired: false,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Panel Manufacturing - 100% Complete',
     phase: 'Panel Manufacturing',
     order: 5,
     description: 'All panels manufactured',
     duration: '4 weeks',
     paymentPercentage: 15,
     dependencies: ['Panel Manufacturing - 50% Complete'],
     deliverables: ['Final Manufacturing Report', 'Quality Certificates'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Factory Acceptance Test (FAT)',
     phase: 'Panel Manufacturing',
     order: 6,
     description: 'Successful FAT conducted at factory',
     duration: '1 week',
     paymentPercentage: 10,
     dependencies: ['Panel Manufacturing - 100% Complete'],
     deliverables: ['FAT Report', 'Test Results', 'Non-Conformance Report (if any)'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Dispatch to Site',
     phase: 'Panel Manufacturing',
     order: 7,
     description: 'Panels dispatched to installation site',
     duration: '3 days',
     dependencies: ['Factory Acceptance Test (FAT)'],
     deliverables: ['Dispatch Documents', 'Packing List', 'Insurance Documents'],
     approvalRequired: false,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Site Readiness Inspection',
     phase: 'Site Installation',
     order: 8,
     description: 'Site ready for panel installation',
     duration: '2 days',
     dependencies: ['Dispatch to Site'],
     deliverables: ['Site Readiness Report'],
     approvalRequired: true,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Panel Installation Complete',
     phase: 'Site Installation',
     order: 9,
     description: 'All panels installed and positioned',
     duration: '3 weeks',
     paymentPercentage: 15,
     dependencies: ['Site Readiness Inspection'],
     deliverables: ['Installation Report', 'As-Built Drawings'],
     approvalRequired: false,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Cable Termination & Wiring',
     phase: 'Site Installation',
     order: 10,
     description: 'All cable terminations and wiring complete',
     duration: '2 weeks',
     dependencies: ['Panel Installation Complete'],
     deliverables: ['Cable Schedule', 'Termination Checklist'],
     approvalRequired: false,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Pre-Commissioning Tests',
     phase: 'Testing & Commissioning',
     order: 11,
     description: 'Pre-commissioning checks and tests',
     duration: '1 week',
     dependencies: ['Cable Termination & Wiring'],
     deliverables: ['Pre-Commissioning Test Report'],
     approvalRequired: true,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Energization & Load Testing',
     phase: 'Testing & Commissioning',
     order: 12,
     description: 'System energized and load tests conducted',
     duration: '1 week',
     paymentPercentage: 10,
     dependencies: ['Pre-Commissioning Tests'],
     deliverables: ['Energization Report', 'Load Test Results'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Site Acceptance Test (SAT)',
     phase: 'Testing & Commissioning',
     order: 13,
     description: 'Successful SAT at site',
     duration: '3 days',
     paymentPercentage: 5,
     dependencies: ['Energization & Load Testing'],
     deliverables: ['SAT Report', 'Final Test Certificates'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Final Documentation & Handover',
     phase: 'Documentation & Handover',
     order: 14,
     description: 'Complete documentation handover',
     duration: '1 week',
     paymentPercentage: 5,
     dependencies: ['Site Acceptance Test (SAT)'],
     deliverables: ['O&M Manuals', 'As-Built Drawings', 'Test Certificates', 'Training Records', 'Warranty Certificate'],
     approvalRequired: true,
     criticalMilestone: true,
    },
   ],
   usageCount: 15,
   lastUsed: '2024-05-10',
   createdBy: 'Sandeep Yadav',
   createdDate: '2023-10-20',
   isActive: true,
  },
  {
   id: '4',
   templateName: 'Kitchen Upgrade - Quick Milestones',
   projectType: 'Commercial Kitchen',
   description: 'Streamlined milestones for kitchen upgrade projects',
   totalMilestones: 6,
   estimatedDuration: '2-3 months',
   milestones: [
    {
     milestoneName: 'Assessment & Upgrade Plan',
     phase: 'Assessment & Planning',
     order: 1,
     description: 'Current state assessment and upgrade planning',
     duration: '1 week',
     paymentPercentage: 20,
     dependencies: [],
     deliverables: ['Assessment Report', 'Upgrade Plan', 'Equipment List'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Equipment Procurement',
     phase: 'Equipment Procurement',
     order: 2,
     description: 'New equipment procured',
     duration: '3 weeks',
     paymentPercentage: 30,
     dependencies: ['Assessment & Upgrade Plan'],
     deliverables: ['Purchase Orders', 'Delivery Confirmation'],
     approvalRequired: false,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Old Equipment Removal',
     phase: 'Installation & Upgrade',
     order: 3,
     description: 'Existing equipment removed',
     duration: '2 days',
     dependencies: ['Equipment Procurement'],
     deliverables: ['Removal Checklist'],
     approvalRequired: false,
     criticalMilestone: false,
    },
    {
     milestoneName: 'New Equipment Installation',
     phase: 'Installation & Upgrade',
     order: 4,
     description: 'New equipment installed and integrated',
     duration: '1 week',
     paymentPercentage: 30,
     dependencies: ['Old Equipment Removal'],
     deliverables: ['Installation Report', 'Integration Checklist'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Testing & Training',
     phase: 'Testing & Handover',
     order: 5,
     description: 'Equipment testing and staff training',
     duration: '3 days',
     paymentPercentage: 15,
     dependencies: ['New Equipment Installation'],
     deliverables: ['Test Reports', 'Training Certificate'],
     approvalRequired: false,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Final Handover',
     phase: 'Testing & Handover',
     order: 6,
     description: 'Project closure and handover',
     duration: '1 day',
     paymentPercentage: 5,
     dependencies: ['Testing & Training'],
     deliverables: ['Handover Certificate', 'O&M Manual', 'Warranty Documents'],
     approvalRequired: true,
     criticalMilestone: true,
    },
   ],
   usageCount: 35,
   lastUsed: '2024-05-28',
   createdBy: 'Amit Patel',
   createdDate: '2023-11-05',
   isActive: true,
  },
  {
   id: '5',
   templateName: 'Modular Cold Room - Fast Track Milestones',
   projectType: 'Cold Room',
   description: 'Quick deployment milestones for modular cold room projects',
   totalMilestones: 5,
   estimatedDuration: '1-2 months',
   milestones: [
    {
     milestoneName: 'Site Survey & Design',
     phase: 'Site Survey & Design',
     order: 1,
     description: 'Quick site survey and modular design',
     duration: '1 week',
     paymentPercentage: 25,
     dependencies: [],
     deliverables: ['Site Survey Report', 'Modular Design Layout'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Modular Panel Procurement',
     phase: 'Procurement',
     order: 2,
     description: 'Pre-fabricated panels procured',
     duration: '2 weeks',
     paymentPercentage: 30,
     dependencies: ['Site Survey & Design'],
     deliverables: ['Purchase Orders', 'Delivery Schedule'],
     approvalRequired: false,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Quick Installation',
     phase: 'Installation',
     order: 3,
     description: 'Modular panels installed',
     duration: '1 week',
     paymentPercentage: 25,
     dependencies: ['Modular Panel Procurement'],
     deliverables: ['Installation Photos', 'Installation Checklist'],
     approvalRequired: false,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Testing & Performance Validation',
     phase: 'Testing & Handover',
     order: 4,
     description: 'Temperature testing and validation',
     duration: '3 days',
     paymentPercentage: 15,
     dependencies: ['Quick Installation'],
     deliverables: ['Test Report', 'Temperature Log'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Handover',
     phase: 'Testing & Handover',
     order: 5,
     description: 'Quick handover with documentation',
     duration: '1 day',
     paymentPercentage: 5,
     dependencies: ['Testing & Performance Validation'],
     deliverables: ['Handover Certificate', 'User Manual', 'Warranty Card'],
     approvalRequired: true,
     criticalMilestone: true,
    },
   ],
   usageCount: 42,
   lastUsed: '2024-05-30',
   createdBy: 'Deepak Mehta',
   createdDate: '2023-12-01',
   isActive: true,
  },
  {
   id: '6',
   templateName: 'Central Kitchen - Large Scale Milestones',
   projectType: 'Commercial Kitchen',
   description: 'Comprehensive milestones for large central kitchen projects',
   totalMilestones: 15,
   estimatedDuration: '8-10 months',
   milestones: [
    {
     milestoneName: 'Concept Design Approval',
     phase: 'Concept & Design',
     order: 1,
     description: 'Initial concept and workflow design',
     duration: '3 weeks',
     paymentPercentage: 8,
     dependencies: [],
     deliverables: ['Concept Design', 'Workflow Layout', 'Preliminary BOQ'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Detailed Design Approval',
     phase: 'Concept & Design',
     order: 2,
     description: 'Detailed engineering and design',
     duration: '3 weeks',
     paymentPercentage: 7,
     dependencies: ['Concept Design Approval'],
     deliverables: ['Detailed Drawings', 'Equipment Specifications', 'Final BOQ'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'FSSAI & Statutory Approvals',
     phase: 'Regulatory Approvals',
     order: 3,
     description: 'All regulatory approvals obtained',
     duration: '4 weeks',
     dependencies: ['Detailed Design Approval'],
     deliverables: ['FSSAI License', 'Fire NOC', 'Trade License'],
     approvalRequired: true,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Equipment Procurement - Phase 1',
     phase: 'Procurement & Fabrication',
     order: 4,
     description: 'First phase equipment ordered',
     duration: '4 weeks',
     paymentPercentage: 15,
     dependencies: ['Detailed Design Approval'],
     deliverables: ['Purchase Orders', 'Delivery Schedule'],
     approvalRequired: false,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Equipment Procurement - Phase 2',
     phase: 'Procurement & Fabrication',
     order: 5,
     description: 'Second phase equipment ordered',
     duration: '4 weeks',
     paymentPercentage: 10,
     dependencies: ['Equipment Procurement - Phase 1'],
     deliverables: ['Purchase Orders', 'Delivery Confirmation'],
     approvalRequired: false,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Custom Fabrication Complete',
     phase: 'Procurement & Fabrication',
     order: 6,
     description: 'All custom equipment fabricated',
     duration: '4 weeks',
     paymentPercentage: 10,
     dependencies: ['Equipment Procurement - Phase 1'],
     deliverables: ['Fabrication Completion Report', 'Quality Certificates'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Civil Works Complete',
     phase: 'Civil & MEP Works',
     order: 7,
     description: 'All civil modifications done',
     duration: '6 weeks',
     paymentPercentage: 10,
     dependencies: ['FSSAI & Statutory Approvals'],
     deliverables: ['Civil Completion Certificate'],
     approvalRequired: true,
     criticalMilestone: false,
    },
    {
     milestoneName: 'MEP Installation Complete',
     phase: 'Civil & MEP Works',
     order: 8,
     description: 'Mechanical, electrical, plumbing done',
     duration: '2 weeks',
     paymentPercentage: 10,
     dependencies: ['Civil Works Complete'],
     deliverables: ['MEP Completion Report', 'As-Built Drawings'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Equipment Installation - 50%',
     phase: 'Equipment Installation',
     order: 9,
     description: 'Half equipment installed',
     duration: '3 weeks',
     paymentPercentage: 8,
     dependencies: ['MEP Installation Complete', 'Custom Fabrication Complete'],
     deliverables: ['Installation Progress Report'],
     approvalRequired: false,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Equipment Installation - 100%',
     phase: 'Equipment Installation',
     order: 10,
     description: 'All equipment installed',
     duration: '3 weeks',
     paymentPercentage: 7,
     dependencies: ['Equipment Installation - 50%'],
     deliverables: ['Installation Completion Report'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Testing & Quality Inspection',
     phase: 'Testing & Commissioning',
     order: 11,
     description: 'Complete testing and inspection',
     duration: '2 weeks',
     dependencies: ['Equipment Installation - 100%'],
     deliverables: ['Test Reports', 'Quality Inspection Report'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Trial Production Run',
     phase: 'Testing & Commissioning',
     order: 12,
     description: 'Production trial run',
     duration: '1 week',
     paymentPercentage: 5,
     dependencies: ['Testing & Quality Inspection'],
     deliverables: ['Trial Run Report'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Final FSSAI Inspection',
     phase: 'Testing & Commissioning',
     order: 13,
     description: 'FSSAI final inspection and approval',
     duration: '3 days',
     dependencies: ['Trial Production Run'],
     deliverables: ['FSSAI Approval Certificate'],
     approvalRequired: true,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Staff Training',
     phase: 'Training & Handover',
     order: 14,
     description: 'Comprehensive staff training',
     duration: '1 week',
     paymentPercentage: 3,
     dependencies: ['Final FSSAI Inspection'],
     deliverables: ['Training Materials', 'Training Certificates'],
     approvalRequired: false,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Final Handover',
     phase: 'Training & Handover',
     order: 15,
     description: 'Complete project handover',
     duration: '2 days',
     paymentPercentage: 2,
     dependencies: ['Staff Training'],
     deliverables: ['Handover Certificate', 'Complete Documentation', 'Warranty Documents'],
     approvalRequired: true,
     criticalMilestone: true,
    },
   ],
   usageCount: 8,
   lastUsed: '2024-04-20',
   createdBy: 'Rajesh Kumar',
   createdDate: '2024-01-10',
   isActive: true,
  },
  {
   id: '7',
   templateName: 'Switchgear Maintenance - Service Milestones',
   projectType: 'Switchgear',
   description: 'Service milestones for switchgear maintenance projects',
   totalMilestones: 6,
   estimatedDuration: '2-3 months',
   milestones: [
    {
     milestoneName: 'Initial Assessment & Testing',
     phase: 'Assessment & Planning',
     order: 1,
     description: 'Complete assessment and diagnostic testing',
     duration: '1 week',
     paymentPercentage: 20,
     dependencies: [],
     deliverables: ['Assessment Report', 'Test Results', 'Recommendation Report'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Work Plan Approval',
     phase: 'Assessment & Planning',
     order: 2,
     description: 'Maintenance plan approved by client',
     duration: '1 week',
     dependencies: ['Initial Assessment & Testing'],
     deliverables: ['Detailed Work Plan', 'Material List', 'Schedule'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Spare Parts Procurement',
     phase: 'Equipment Procurement',
     order: 3,
     description: 'All spare parts and materials procured',
     duration: '3 weeks',
     paymentPercentage: 30,
     dependencies: ['Work Plan Approval'],
     deliverables: ['Purchase Orders', 'Material Receipts'],
     approvalRequired: false,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Maintenance & Upgrade Work',
     phase: 'Upgrade & Maintenance',
     order: 4,
     description: 'Maintenance work and upgrades done',
     duration: '2 weeks',
     paymentPercentage: 30,
     dependencies: ['Spare Parts Procurement'],
     deliverables: ['Work Completion Report', 'Updated Drawings'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Testing & Certification',
     phase: 'Testing & Certification',
     order: 5,
     description: 'Complete testing and certification',
     duration: '1 week',
     paymentPercentage: 15,
     dependencies: ['Maintenance & Upgrade Work'],
     deliverables: ['Test Certificates', 'Compliance Certificates'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Documentation & Handover',
     phase: 'Testing & Certification',
     order: 6,
     description: 'Final documentation and handover',
     duration: '2 days',
     paymentPercentage: 5,
     dependencies: ['Testing & Certification'],
     deliverables: ['Updated O&M Manuals', 'Test Reports', 'Maintenance Schedule'],
     approvalRequired: true,
     criticalMilestone: true,
    },
   ],
   usageCount: 18,
   lastUsed: '2024-05-05',
   createdBy: 'Sandeep Yadav',
   createdDate: '2024-02-15',
   isActive: true,
  },
  {
   id: '8',
   templateName: 'Blast Freezer Installation Milestones',
   projectType: 'Cold Room',
   description: 'Specialized milestones for blast freezer projects',
   totalMilestones: 11,
   estimatedDuration: '4-5 months',
   milestones: [
    {
     milestoneName: 'Technical Design & Calculations',
     phase: 'Technical Design',
     order: 1,
     description: 'Thermal design and engineering calculations',
     duration: '2 weeks',
     paymentPercentage: 12,
     dependencies: [],
     deliverables: ['Thermal Calculations', 'Technical Drawings', 'Equipment Specifications'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Design Approval',
     phase: 'Technical Design',
     order: 2,
     description: 'Client approval of design',
     duration: '1 week',
     dependencies: ['Technical Design & Calculations'],
     deliverables: ['Approved Drawings', 'Final Specifications'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Equipment Procurement',
     phase: 'Equipment Procurement',
     order: 3,
     description: 'Specialized equipment procured',
     duration: '6 weeks',
     paymentPercentage: 20,
     dependencies: ['Design Approval'],
     deliverables: ['Purchase Orders', 'Delivery Confirmation'],
     approvalRequired: false,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Civil Works Complete',
     phase: 'Civil & Insulation Works',
     order: 4,
     description: 'Structural modifications complete',
     duration: '3 weeks',
     paymentPercentage: 15,
     dependencies: ['Design Approval'],
     deliverables: ['Civil Completion Report'],
     approvalRequired: true,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Insulation Work Complete',
     phase: 'Civil & Insulation Works',
     order: 5,
     description: 'Thermal insulation installed',
     duration: '1 week',
     paymentPercentage: 10,
     dependencies: ['Civil Works Complete'],
     deliverables: ['Insulation Test Report'],
     approvalRequired: true,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Freezer Equipment Installation',
     phase: 'Equipment Installation',
     order: 6,
     description: 'Blast freezer equipment installed',
     duration: '2 weeks',
     paymentPercentage: 15,
     dependencies: ['Insulation Work Complete', 'Equipment Procurement'],
     deliverables: ['Installation Report'],
     approvalRequired: false,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Refrigeration System Installation',
     phase: 'Equipment Installation',
     order: 7,
     description: 'Refrigeration and piping complete',
     duration: '2 weeks',
     paymentPercentage: 12,
     dependencies: ['Freezer Equipment Installation'],
     deliverables: ['Piping Layout', 'System Integration Report'],
     approvalRequired: false,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Pre-Commissioning',
     phase: 'Testing & Commissioning',
     order: 8,
     description: 'Initial system checks',
     duration: '3 days',
     dependencies: ['Refrigeration System Installation'],
     deliverables: ['Pre-Commissioning Checklist'],
     approvalRequired: true,
     criticalMilestone: false,
    },
    {
     milestoneName: 'Performance Testing',
     phase: 'Testing & Commissioning',
     order: 9,
     description: 'Freezing performance validation',
     duration: '1 week',
     paymentPercentage: 10,
     dependencies: ['Pre-Commissioning'],
     deliverables: ['Performance Test Report', 'Freezing Curve Data'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Trial Run with Product',
     phase: 'Testing & Commissioning',
     order: 10,
     description: 'Actual product trial freezing',
     duration: '2 days',
     dependencies: ['Performance Testing'],
     deliverables: ['Trial Run Report', 'Product Quality Test'],
     approvalRequired: true,
     criticalMilestone: true,
    },
    {
     milestoneName: 'Final Handover',
     phase: 'Testing & Commissioning',
     order: 11,
     description: 'Project closure and documentation',
     duration: '2 days',
     paymentPercentage: 6,
     dependencies: ['Trial Run with Product'],
     deliverables: ['Handover Certificate', 'O&M Manual', 'Training Materials', 'Warranty Certificate'],
     approvalRequired: true,
     criticalMilestone: true,
    },
   ],
   usageCount: 6,
   lastUsed: '2024-03-15',
   createdBy: 'Priya Sharma',
   createdDate: '2024-01-20',
   isActive: true,
  },
 ];

 const filteredTemplates = mockTemplates.filter((template) => {
  const matchesSearch =
   template.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
   template.description.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesType = projectTypeFilter === 'all' || template.projectType === projectTypeFilter;
  return matchesSearch && matchesType;
 });

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
        <Flag className="w-6 h-6 text-blue-600" />
       </div>
      </div>
     </div>

     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Total Milestones</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
         {mockTemplates.reduce((sum, t) => sum + t.totalMilestones, 0)}
        </p>
        <p className="text-xs text-gray-500 mt-1">Across all templates</p>
       </div>
       <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
        <CheckCircle className="w-6 h-6 text-green-600" />
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
       <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
        <TrendingUp className="w-6 h-6 text-purple-600" />
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
       <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
        <FileText className="w-6 h-6 text-cyan-600" />
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
       placeholder="Search templates..."
       value={searchTerm}
       onChange={(e) => setSearchTerm(e.target.value)}
       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      />
     </div>
     <select
      value={projectTypeFilter}
      onChange={(e) => setProjectTypeFilter(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
     >
      <option value="all">All Project Types</option>
      <option value="Commercial Kitchen">Commercial Kitchen</option>
      <option value="Cold Room">Cold Room</option>
      <option value="Switchgear">Switchgear</option>
     </select>
    </div>
   </div>

   {/* Templates Grid */}
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    {filteredTemplates.map((template) => (
     <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
       <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.templateName}</h3>
        <p className="text-sm text-gray-600">{template.description}</p>
       </div>
       <button
        onClick={() => {
         setSelectedTemplate(template);
         setShowDetailModal(true);
        }}
        className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg"
       >
        <Eye className="w-4 h-4" />
       </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
       <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600 mb-1">Project Type</p>
        <p className="text-sm font-medium text-gray-900">{template.projectType}</p>
       </div>
       <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600 mb-1">Duration</p>
        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
         <Clock className="w-3 h-3" /> {template.estimatedDuration}
        </p>
       </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-2 text-center">
       <div className="bg-blue-50 rounded-lg p-2">
        <p className="text-lg font-bold text-blue-600">{template.totalMilestones}</p>
        <p className="text-xs text-gray-600">Milestones</p>
       </div>
       <div className="bg-green-50 rounded-lg p-2">
        <p className="text-lg font-bold text-green-600">
         {template.milestones.filter(m => m.criticalMilestone).length}
        </p>
        <p className="text-xs text-gray-600">Critical</p>
       </div>
       <div className="bg-purple-50 rounded-lg p-2">
        <p className="text-lg font-bold text-purple-600">{template.usageCount}</p>
        <p className="text-xs text-gray-600">Usage</p>
       </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
       <p className="text-xs text-gray-500 mb-3">
        Last used {new Date(template.lastUsed).toLocaleDateString('en-IN')} • Created by {template.createdBy}
       </p>
       <div className="space-y-2">
        <div className="flex gap-2">
         <button
          onClick={() => handleViewDetails(template)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 text-sm"
         >
          <Eye className="w-4 h-4" />
          View Details
         </button>
         <button
          onClick={() => handleDuplicate(template)}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          title="Duplicate"
         >
          <Copy className="w-4 h-4 text-gray-600" />
         </button>
         <button
          onClick={() => handleEdit(template)}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          title="Edit"
         >
          <Edit className="w-4 h-4 text-gray-600" />
         </button>
        </div>

        <div className="flex gap-2">
         <button
          onClick={() => handleManageMilestones(template)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
          title="Manage Milestones"
         >
          <Settings className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-gray-700">Milestones</span>
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
          onClick={() => handleDelete(template)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-300 rounded-lg hover:bg-red-50 text-xs"
          title="Delete"
         >
          <Trash2 className="w-3.5 h-3.5 text-red-600" />
         </button>
        </div>
       </div>
      </div>
     </div>
    ))}
   </div>

   {/* All Modals */}
   <CreateMilestoneTemplateModal
    isOpen={showCreateModal}
    onClose={() => setShowCreateModal(false)}
    onCreate={handleCreate}
   />

   <EditMilestoneTemplateModal
    isOpen={showEditModal}
    onClose={() => {
     setShowEditModal(false);
     setSelectedTemplate(null);
    }}
    onSave={handleEditSave}
    template={selectedTemplate}
   />

   <DuplicateMilestoneTemplateModal
    isOpen={showDuplicateModal}
    onClose={() => {
     setShowDuplicateModal(false);
     setSelectedTemplate(null);
    }}
    onDuplicate={handleDuplicateSave}
    template={selectedTemplate}
   />

   <DeleteMilestoneTemplateModal
    isOpen={showDeleteModal}
    onClose={() => {
     setShowDeleteModal(false);
     setSelectedTemplate(null);
    }}
    onDelete={handleDeleteConfirm}
    template={selectedTemplate}
   />

   <ManageMilestonesModal
    isOpen={showManageMilestonesModal}
    onClose={() => {
     setShowManageMilestonesModal(false);
     setSelectedTemplate(null);
    }}
    onSave={handleMilestonesSave}
    template={selectedTemplate}
   />

   <ViewTemplateDetailsModal
    isOpen={showViewDetailsModal}
    onClose={() => {
     setShowViewDetailsModal(false);
     setSelectedTemplate(null);
    }}
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
    onImport={handleImport}
   />
    </div>
   </div>
  </div>
 );
}
