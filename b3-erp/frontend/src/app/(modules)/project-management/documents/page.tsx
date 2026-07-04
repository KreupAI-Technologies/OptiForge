'use client';

import { useState, useEffect } from 'react';
import { projectManagementService } from '@/services/ProjectManagementService';
import { FileText, Folder, Upload, Download, Eye, Trash2, Search, Filter, Calendar, User, Edit, Share2, FolderInput, Lock, Clock, Archive, Tag, FileSearch } from 'lucide-react';
import {
  UploadDocumentModal,
  EditDocumentModal,
  ShareDocumentModal,
  MoveDocumentModal,
  CreateFolderModal,
  SetPermissionsModal,
  VersionHistoryModal,
  BulkDownloadModal,
  FilterDocumentsModal,
  SearchDocumentsModal,
  TagDocumentsModal,
  DeleteDocumentModal,
  PreviewDocumentModal,
  ViewDetailsModal,
} from '@/components/project-management/DocumentsModals';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';

interface Document {
  id: string;
  documentNumber: string;
  projectId: string;
  projectName: string;
  documentName: string;
  documentType: 'Drawing' | 'Specification' | 'Report' | 'Certificate' | 'Manual' | 'Contract' | 'Invoice' | 'Photo' | 'Confirmation' | 'Other';
  category: 'Technical' | 'Financial' | 'Legal' | 'Quality' | 'Safety' | 'Operational' | 'Confirmation';
  version: string;
  uploadDate: string;
  uploadedBy: string;
  fileSize: string;
  fileFormat: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Superseded' | 'Archived';
  accessLevel: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  reviewedBy: string;
  approvedBy: string;
  approvalDate: string;
  expiryDate: string;
  tags: string[];
  description: string;
  relatedDocuments: string[];
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'my_approvals'>('all');
  const itemsPerPage = 12;

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState(false);
  const [showBulkDownloadModal, setShowBulkDownloadModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);

  const [mockDocuments, setMockDocuments] = useState<Document[]>([
    // ==================== TAJ HOTELS - COMMERCIAL KITCHEN SETUP ====================
    {
      id: 'DOC-001',
      documentNumber: 'TAJ-DWG-2026-001',
      projectId: 'PRJ-2026-001',
      projectName: 'Taj Hotels Mumbai - Commercial Kitchen Setup',
      documentName: 'Kitchen Equipment Layout Plan - Final Approved',
      documentType: 'Drawing',
      category: 'Technical',
      version: '3.2',
      uploadDate: '2026-02-10',
      uploadedBy: 'Arjun Mehta',
      fileSize: '4.8 MB',
      fileFormat: 'DWG',
      status: 'Approved',
      accessLevel: 'Internal',
      reviewedBy: 'Ravi Krishnan (Lead Architect)',
      approvedBy: 'Taj Hotels - F&B Director',
      approvalDate: '2026-02-11',
      expiryDate: '',
      tags: ['Layout', 'Equipment', 'Approved', 'Phase-1', 'Kitchen Design'],
      description: 'Final approved layout plan showing all cooking stations, prep areas, cold storage, and dishwashing zones with exact equipment dimensions and utility connections. Includes compliance markings for FSSAI standards.',
      relatedDocuments: ['TAJ-DWG-2026-002', 'TAJ-SPEC-2026-001'],
    },
    {
      id: 'DOC-002',
      documentNumber: 'TAJ-DWG-2026-002',
      projectId: 'PRJ-2026-001',
      projectName: 'Taj Hotels Mumbai - Commercial Kitchen Setup',
      documentName: 'Electrical Single Line Diagram - Kitchen Power Distribution',
      documentType: 'Drawing',
      category: 'Technical',
      version: '2.1',
      uploadDate: '2026-02-08',
      uploadedBy: 'Prakash Rao',
      fileSize: '2.3 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Internal',
      reviewedBy: 'Suresh Nair (Electrical Consultant)',
      approvedBy: 'Taj Hotels - Engineering Head',
      approvalDate: '2026-02-09',
      expiryDate: '',
      tags: ['Electrical', 'SLD', 'Power Distribution', 'Load Calculation'],
      description: 'Complete electrical distribution diagram with 380V three-phase and 220V single-phase circuits. Total connected load: 485 kW. Includes emergency power backup provisions and earthing layout.',
      relatedDocuments: ['TAJ-DWG-2026-001', 'TAJ-RPT-2026-003'],
    },
    {
      id: 'DOC-003',
      documentNumber: 'TAJ-SPEC-2026-001',
      projectId: 'PRJ-2026-001',
      projectName: 'Taj Hotels Mumbai - Commercial Kitchen Setup',
      documentName: 'Kitchen Equipment Technical Specifications - Complete Set',
      documentType: 'Specification',
      category: 'Technical',
      version: '1.5',
      uploadDate: '2026-01-28',
      uploadedBy: 'Vikram Desai',
      fileSize: '8.6 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Internal',
      reviewedBy: 'Technical Review Board',
      approvedBy: 'Chief Technical Officer',
      approvalDate: '2026-01-30',
      expiryDate: '',
      tags: ['Specifications', 'Equipment', 'Technical', 'Compliance', 'FSSAI'],
      description: 'Comprehensive technical specifications for 127 pieces of kitchen equipment including: 8 cooking ranges, 4 combi ovens, 6 walk-in cold rooms, blast chillers, dishwashing systems, exhaust hoods, and food prep stations. All equipment compliant with FSSAI and BIS standards.',
      relatedDocuments: ['TAJ-DWG-2026-001', 'TAJ-CERT-2026-001'],
    },
    {
      id: 'DOC-004',
      documentNumber: 'TAJ-CERT-2026-001',
      projectId: 'PRJ-2026-001',
      projectName: 'Taj Hotels Mumbai - Commercial Kitchen Setup',
      documentName: 'Fire NOC Certificate - Kitchen Installation',
      documentType: 'Certificate',
      category: 'Safety',
      version: '1.0',
      uploadDate: '2026-02-05',
      uploadedBy: 'Vijay Sharma',
      fileSize: '1.2 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Public',
      reviewedBy: 'Taj Hotels - Safety Officer',
      approvedBy: 'Mumbai Fire Department',
      approvalDate: '2026-02-05',
      expiryDate: '2027-02-05',
      tags: ['Certificate', 'Fire Safety', 'Compliance', 'NOC', 'Mandatory'],
      description: 'Fire No Objection Certificate (NOC) from Mumbai Fire Department certifying compliance with NBC 2016 Part 4 fire safety requirements. Includes fire suppression system approval for kitchen hood exhaust.',
      relatedDocuments: ['TAJ-RPT-2026-001'],
    },
    {
      id: 'DOC-005',
      documentNumber: 'TAJ-CNT-2026-001',
      projectId: 'PRJ-2026-001',
      projectName: 'Taj Hotels Mumbai - Commercial Kitchen Setup',
      documentName: 'Master Service Agreement - Project Contract',
      documentType: 'Contract',
      category: 'Legal',
      version: '1.0',
      uploadDate: '2025-11-20',
      uploadedBy: 'Legal Team',
      fileSize: '2.8 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Confidential',
      reviewedBy: 'Corporate Legal Counsel',
      approvedBy: 'Managing Director',
      approvalDate: '2025-11-22',
      expiryDate: '2028-11-22',
      tags: ['Contract', 'Legal', 'Agreement', 'MSA', 'Confidential'],
      description: 'Master Service Agreement covering the complete kitchen setup project including equipment supply, installation, commissioning, training, and 3-year warranty period. Total contract value: INR 4.85 Crores.',
      relatedDocuments: ['TAJ-INV-2026-001', 'TAJ-INV-2026-002'],
    },
    {
      id: 'DOC-006',
      documentNumber: 'TAJ-INV-2026-001',
      projectId: 'PRJ-2026-001',
      projectName: 'Taj Hotels Mumbai - Commercial Kitchen Setup',
      documentName: 'Tax Invoice - Phase 1 Completion (40% Milestone)',
      documentType: 'Invoice',
      category: 'Financial',
      version: '1.0',
      uploadDate: '2026-02-12',
      uploadedBy: 'Finance Department',
      fileSize: '0.9 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Confidential',
      reviewedBy: 'Finance Controller',
      approvedBy: 'Taj Hotels - Procurement Head',
      approvalDate: '2026-02-13',
      expiryDate: '',
      tags: ['Invoice', 'Payment', 'Phase-1', 'Milestone', 'GST'],
      description: 'Phase 1 completion tax invoice for equipment delivery and preliminary installation. Amount: INR 1,94,00,000 (inclusive of 18% GST). Payment terms: Net 30 days.',
      relatedDocuments: ['TAJ-CNT-2026-001'],
    },
    {
      id: 'DOC-007',
      documentNumber: 'TAJ-RPT-2026-001',
      projectId: 'PRJ-2026-001',
      projectName: 'Taj Hotels Mumbai - Commercial Kitchen Setup',
      documentName: 'Fire Safety Audit Report - Pre-Installation Assessment',
      documentType: 'Report',
      category: 'Safety',
      version: '1.0',
      uploadDate: '2026-01-15',
      uploadedBy: 'Safety Consultant',
      fileSize: '3.4 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Internal',
      reviewedBy: 'Safety Committee',
      approvedBy: 'Taj Hotels - Operations Director',
      approvalDate: '2026-01-18',
      expiryDate: '',
      tags: ['Safety', 'Audit', 'Fire', 'Assessment', 'Compliance'],
      description: 'Comprehensive fire safety audit report covering fire load assessment, escape route analysis, suppression system adequacy, and recommendations for kitchen area. All 23 safety checkpoints passed.',
      relatedDocuments: ['TAJ-CERT-2026-001'],
    },
    {
      id: 'DOC-008',
      documentNumber: 'TAJ-MAN-2026-001',
      projectId: 'PRJ-2026-001',
      projectName: 'Taj Hotels Mumbai - Commercial Kitchen Setup',
      documentName: 'Operations & Maintenance Manual - Complete Kitchen Equipment',
      documentType: 'Manual',
      category: 'Operational',
      version: '1.0',
      uploadDate: '2026-02-10',
      uploadedBy: 'Service Engineering Team',
      fileSize: '24.5 MB',
      fileFormat: 'PDF',
      status: 'Under Review',
      accessLevel: 'Public',
      reviewedBy: 'QC Manager',
      approvedBy: '',
      approvalDate: '',
      expiryDate: '',
      tags: ['Manual', 'O&M', 'Training', 'Maintenance', 'Troubleshooting'],
      description: 'Comprehensive O&M manual (456 pages) covering all 127 equipment items. Includes daily/weekly/monthly maintenance schedules, troubleshooting guides, spare parts list, and video QR codes for operation training.',
      relatedDocuments: ['TAJ-SPEC-2026-001'],
    },
    // ==================== BIGBASKET - COLD STORAGE FACILITY ====================
    {
      id: 'DOC-009',
      documentNumber: 'BB-DWG-2026-001',
      projectId: 'PRJ-2026-002',
      projectName: 'BigBasket Bengaluru - Cold Storage Distribution Center',
      documentName: 'Cold Room Layout & Refrigeration P&ID',
      documentType: 'Drawing',
      category: 'Technical',
      version: '2.0',
      uploadDate: '2026-02-05',
      uploadedBy: 'Karthik Venkatesh',
      fileSize: '5.2 MB',
      fileFormat: 'DWG',
      status: 'Approved',
      accessLevel: 'Internal',
      reviewedBy: 'Cold Chain Engineering Lead',
      approvedBy: 'BigBasket - Supply Chain Director',
      approvalDate: '2026-02-07',
      expiryDate: '',
      tags: ['Cold Storage', 'P&ID', 'Refrigeration', 'Layout', 'HACCP'],
      description: 'Detailed cold room layout showing 6 temperature zones (-25°C to +8°C) with total capacity 2,400 MT. Includes refrigerant piping diagram, defrost system, and HACCP compliance markings.',
      relatedDocuments: ['BB-SPEC-2026-001', 'BB-RPT-2026-001'],
    },
    {
      id: 'DOC-010',
      documentNumber: 'BB-RPT-2026-001',
      projectId: 'PRJ-2026-002',
      projectName: 'BigBasket Bengaluru - Cold Storage Distribution Center',
      documentName: 'Temperature Mapping & Validation Protocol Report',
      documentType: 'Report',
      category: 'Quality',
      version: '1.0',
      uploadDate: '2026-02-12',
      uploadedBy: 'Quality Assurance Team',
      fileSize: '6.8 MB',
      fileFormat: 'PDF',
      status: 'Under Review',
      accessLevel: 'Internal',
      reviewedBy: 'QA Manager - Pending',
      approvedBy: '',
      approvalDate: '',
      expiryDate: '',
      tags: ['Validation', 'Temperature Mapping', 'Quality', 'Commissioning', 'IQ/OQ/PQ'],
      description: '72-hour temperature mapping study across all cold zones with 48 data loggers. Includes IQ/OQ/PQ protocols, deviation analysis, and recommendations. Pull-down test: Target achieved in 2.5 hours.',
      relatedDocuments: ['BB-DWG-2026-001', 'BB-CERT-2026-001'],
    },
    {
      id: 'DOC-011',
      documentNumber: 'BB-CERT-2026-001',
      projectId: 'PRJ-2026-002',
      projectName: 'BigBasket Bengaluru - Cold Storage Distribution Center',
      documentName: 'FSSAI Cold Storage License Certificate',
      documentType: 'Certificate',
      category: 'Legal',
      version: '1.0',
      uploadDate: '2026-02-08',
      uploadedBy: 'Compliance Team',
      fileSize: '0.6 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Public',
      reviewedBy: 'Legal Compliance Officer',
      approvedBy: 'FSSAI - Karnataka',
      approvalDate: '2026-02-08',
      expiryDate: '2031-02-08',
      tags: ['FSSAI', 'License', 'Cold Storage', 'Compliance', 'Food Safety'],
      description: 'FSSAI Central License for cold storage operations. License No: 10026789000123. Covers frozen foods, dairy, meat, seafood, and pharmaceutical cold chain storage categories.',
      relatedDocuments: ['BB-RPT-2026-001'],
    },
    {
      id: 'DOC-012',
      documentNumber: 'BB-PHT-2026-001',
      projectId: 'PRJ-2026-002',
      projectName: 'BigBasket Bengaluru - Cold Storage Distribution Center',
      documentName: 'Installation Progress Photos - Week 8',
      documentType: 'Photo',
      category: 'Quality',
      version: '1.0',
      uploadDate: '2026-02-10',
      uploadedBy: 'Site Supervisor',
      fileSize: '42.3 MB',
      fileFormat: 'ZIP',
      status: 'Approved',
      accessLevel: 'Internal',
      reviewedBy: 'Project Manager',
      approvedBy: 'Site Inspection Team',
      approvalDate: '2026-02-11',
      expiryDate: '',
      tags: ['Photos', 'Progress', 'Installation', 'Week-8', 'Documentation'],
      description: 'High-resolution installation progress photos (78 images) showing: compressor room setup, panel installation, floor coil laying, PUF panel erection, and door fitting. Geo-tagged with timestamps.',
      relatedDocuments: [],
    },
    // ==================== L&T CAMPUS - INDUSTRIAL KITCHEN ====================
    {
      id: 'DOC-013',
      documentNumber: 'LT-DWG-2026-001',
      projectId: 'PRJ-2026-003',
      projectName: 'L&T Tech Park Chennai - Industrial Canteen Setup',
      documentName: '3D Render - Kitchen & Dining Area Visualization',
      documentType: 'Drawing',
      category: 'Technical',
      version: '1.0',
      uploadDate: '2026-01-20',
      uploadedBy: 'Design Team',
      fileSize: '18.6 MB',
      fileFormat: 'PNG',
      status: 'Approved',
      accessLevel: 'Public',
      reviewedBy: 'Interior Design Consultant',
      approvedBy: 'L&T Facilities Management',
      approvalDate: '2026-01-22',
      expiryDate: '',
      tags: ['3D Render', 'Visualization', 'Design', 'Canteen', 'Presentation'],
      description: 'Photorealistic 3D render showing the complete industrial canteen layout with 500-seat capacity. Includes live cooking stations, salad bar, dessert counter, and beverage dispensing area.',
      relatedDocuments: ['LT-SPEC-2026-001'],
    },
    {
      id: 'DOC-014',
      documentNumber: 'LT-SPEC-2026-001',
      projectId: 'PRJ-2026-003',
      projectName: 'L&T Tech Park Chennai - Industrial Canteen Setup',
      documentName: 'Equipment BOQ & Technical Specifications',
      documentType: 'Specification',
      category: 'Technical',
      version: '2.3',
      uploadDate: '2026-01-25',
      uploadedBy: 'Sales Engineering',
      fileSize: '5.4 MB',
      fileFormat: 'XLSX',
      status: 'Under Review',
      accessLevel: 'Internal',
      reviewedBy: 'Under Review - Technical Team',
      approvedBy: '',
      approvalDate: '',
      expiryDate: '',
      tags: ['BOQ', 'Specifications', 'Equipment List', 'Pricing', 'Technical'],
      description: 'Detailed Bill of Quantities with 156 line items. Includes equipment specifications, quantities, unit rates, GST breakup, and delivery schedule. Total project value: INR 2.18 Crores.',
      relatedDocuments: ['LT-DWG-2026-001'],
    },
    {
      id: 'DOC-015',
      documentNumber: 'LT-RPT-2026-001',
      projectId: 'PRJ-2026-003',
      projectName: 'L&T Tech Park Chennai - Industrial Canteen Setup',
      documentName: 'HVAC & Kitchen Exhaust Design Report',
      documentType: 'Report',
      category: 'Technical',
      version: '1.2',
      uploadDate: '2026-02-01',
      uploadedBy: 'MEP Consultant',
      fileSize: '4.2 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Internal',
      reviewedBy: 'Mechanical Engineer Lead',
      approvedBy: 'L&T Infrastructure Team',
      approvalDate: '2026-02-03',
      expiryDate: '',
      tags: ['HVAC', 'Exhaust', 'Ventilation', 'CFD Analysis', 'MEP'],
      description: 'Comprehensive HVAC design report with CFD analysis for kitchen exhaust system. Covers 8,500 CFM exhaust requirement, make-up air calculations, grease hood specifications, and energy recovery provisions.',
      relatedDocuments: ['LT-DWG-2026-002'],
    },
    // ==================== ITC GRAND - BAKERY EQUIPMENT ====================
    {
      id: 'DOC-016',
      documentNumber: 'ITC-DWG-2026-001',
      projectId: 'PRJ-2026-004',
      projectName: 'ITC Grand Kolkata - Artisan Bakery Setup',
      documentName: 'Bakery Production Line Layout - AutoCAD',
      documentType: 'Drawing',
      category: 'Technical',
      version: '1.4',
      uploadDate: '2026-02-02',
      uploadedBy: 'Design Engineering',
      fileSize: '3.8 MB',
      fileFormat: 'DWG',
      status: 'Approved',
      accessLevel: 'Internal',
      reviewedBy: 'Senior Design Engineer',
      approvedBy: 'ITC Hotels - Executive Chef',
      approvalDate: '2026-02-04',
      expiryDate: '',
      tags: ['Bakery', 'Layout', 'Production Line', 'AutoCAD', 'Equipment'],
      description: 'Detailed bakery production line layout showing: dough mixing station, proofing chambers, deck ovens, rotary rack ovens, cooling conveyors, and packaging area. Daily production capacity: 2,000 units.',
      relatedDocuments: ['ITC-SPEC-2026-001', 'ITC-MAN-2026-001'],
    },
    {
      id: 'DOC-017',
      documentNumber: 'ITC-MAN-2026-001',
      projectId: 'PRJ-2026-004',
      projectName: 'ITC Grand Kolkata - Artisan Bakery Setup',
      documentName: 'Combi Oven Operating Manual - Rational SCC 202',
      documentType: 'Manual',
      category: 'Operational',
      version: '1.0',
      uploadDate: '2026-02-08',
      uploadedBy: 'Equipment Vendor',
      fileSize: '15.2 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Public',
      reviewedBy: 'Service Engineer',
      approvedBy: 'Kitchen Operations Manager',
      approvalDate: '2026-02-09',
      expiryDate: '',
      tags: ['Manual', 'Combi Oven', 'Rational', 'Operation', 'Training'],
      description: 'Complete operating manual for Rational SelfCookingCenter 202 (20-tray capacity). Includes: cooking programs, cleaning procedures, iCookingControl settings, and ConnectedCooking cloud integration guide.',
      relatedDocuments: ['ITC-DWG-2026-001'],
    },
    {
      id: 'DOC-018',
      documentNumber: 'ITC-CERT-2026-001',
      projectId: 'PRJ-2026-004',
      projectName: 'ITC Grand Kolkata - Artisan Bakery Setup',
      documentName: 'Equipment Warranty Certificate - All Items',
      documentType: 'Certificate',
      category: 'Operational',
      version: '1.0',
      uploadDate: '2026-02-10',
      uploadedBy: 'Service Department',
      fileSize: '0.8 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Public',
      reviewedBy: 'After-Sales Manager',
      approvedBy: 'ITC Hotels - Procurement',
      approvalDate: '2026-02-11',
      expiryDate: '2029-02-11',
      tags: ['Warranty', 'Certificate', '3-Year', 'Service', 'AMC'],
      description: '3-year comprehensive warranty certificate covering all 42 bakery equipment items. Includes: parts, labor, emergency response (4-hour SLA), and annual preventive maintenance visits.',
      relatedDocuments: ['ITC-CNT-2026-001'],
    },
    // ==================== RELIANCE JIOMART - DISTRIBUTION CENTER ====================
    {
      id: 'DOC-019',
      documentNumber: 'JIO-DWG-2026-001',
      projectId: 'PRJ-2026-005',
      projectName: 'JioMart Hyderabad - Fresh Food Processing Center',
      documentName: 'Process Flow Diagram - Food Processing Line',
      documentType: 'Drawing',
      category: 'Technical',
      version: '1.0',
      uploadDate: '2026-02-01',
      uploadedBy: 'Process Engineering',
      fileSize: '2.6 MB',
      fileFormat: 'PDF',
      status: 'Draft',
      accessLevel: 'Internal',
      reviewedBy: '',
      approvedBy: '',
      approvalDate: '',
      expiryDate: '',
      tags: ['PFD', 'Process Flow', 'Food Processing', 'Draft', 'Review Pending'],
      description: 'Process flow diagram showing fresh produce processing: receiving, sorting, washing, cutting, packaging, and cold storage staging. Capacity: 50 MT/day fresh vegetables and fruits.',
      relatedDocuments: [],
    },
    {
      id: 'DOC-020',
      documentNumber: 'JIO-RPT-2026-001',
      projectId: 'PRJ-2026-005',
      projectName: 'JioMart Hyderabad - Fresh Food Processing Center',
      documentName: 'Site Survey & Feasibility Assessment Report',
      documentType: 'Report',
      category: 'Technical',
      version: '1.0',
      uploadDate: '2026-01-28',
      uploadedBy: 'Business Development',
      fileSize: '7.4 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Internal',
      reviewedBy: 'Technical Director',
      approvedBy: 'JioMart Operations Head',
      approvalDate: '2026-01-30',
      expiryDate: '',
      tags: ['Site Survey', 'Feasibility', 'Assessment', 'Infrastructure', 'Planning'],
      description: 'Comprehensive site survey report covering: building structure analysis, utility availability (power, water, drainage), accessibility assessment, environmental considerations, and infrastructure recommendations.',
      relatedDocuments: ['JIO-DWG-2026-001'],
    },
    // ==================== MARRIOTT HOTELS - RESTAURANT KITCHEN ====================
    {
      id: 'DOC-021',
      documentNumber: 'MAR-CONF-2026-001',
      projectId: 'PRJ-2026-006',
      projectName: 'Marriott Gurgaon - Specialty Restaurant Setup',
      documentName: 'Project Award Letter - Confirmed',
      documentType: 'Confirmation',
      category: 'Confirmation',
      version: '1.0',
      uploadDate: '2026-02-05',
      uploadedBy: 'Client Portal',
      fileSize: '0.5 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Confidential',
      reviewedBy: 'Business Development Head',
      approvedBy: 'Marriott International - India Region',
      approvalDate: '2026-02-06',
      expiryDate: '',
      tags: ['Confirmation', 'Award', 'Project Win', 'LOI', 'Contract'],
      description: 'Official Letter of Intent (LOI) confirming project award for specialty restaurant kitchen setup. Project scope: Japanese Teppanyaki station, Italian wood-fired pizza station, and main production kitchen.',
      relatedDocuments: [],
    },
    {
      id: 'DOC-022',
      documentNumber: 'MAR-DWG-2026-001',
      projectId: 'PRJ-2026-006',
      projectName: 'Marriott Gurgaon - Specialty Restaurant Setup',
      documentName: 'Teppanyaki Station Design - Detailed Drawing',
      documentType: 'Drawing',
      category: 'Technical',
      version: '1.2',
      uploadDate: '2026-02-08',
      uploadedBy: 'Design Center',
      fileSize: '3.2 MB',
      fileFormat: 'PDF',
      status: 'Under Review',
      accessLevel: 'Internal',
      reviewedBy: 'Under Review - Design Lead',
      approvedBy: '',
      approvalDate: '',
      expiryDate: '',
      tags: ['Teppanyaki', 'Design', 'Japanese Kitchen', 'Custom', 'Specialty'],
      description: 'Custom Teppanyaki station design with 3 cooking surfaces (1.2m x 0.6m each). Includes: built-in exhaust, refrigerated storage, mise en place stations, and guest seating layout for 18 covers.',
      relatedDocuments: ['MAR-CONF-2026-001'],
    },
    // ==================== APOLLO HOSPITALS - CENTRAL KITCHEN ====================
    {
      id: 'DOC-023',
      documentNumber: 'APL-SPEC-2026-001',
      projectId: 'PRJ-2026-007',
      projectName: 'Apollo Hospitals Delhi - Central Dietary Kitchen',
      documentName: 'Hospital Kitchen Equipment Specifications - NABH Compliant',
      documentType: 'Specification',
      category: 'Technical',
      version: '2.0',
      uploadDate: '2026-02-03',
      uploadedBy: 'Healthcare Projects Team',
      fileSize: '6.8 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Internal',
      reviewedBy: 'Hospital Infection Control Team',
      approvedBy: 'Apollo - Dietary Services Director',
      approvalDate: '2026-02-05',
      expiryDate: '',
      tags: ['Hospital Kitchen', 'NABH', 'Healthcare', 'Specifications', 'Dietary'],
      description: 'NABH-compliant kitchen equipment specifications for 800-bed hospital. Covers: therapeutic diet preparation, bulk cooking, patient tray assembly, diet office integration, and HACCP-compliant food handling equipment.',
      relatedDocuments: ['APL-CERT-2026-001'],
    },
    {
      id: 'DOC-024',
      documentNumber: 'APL-CERT-2026-001',
      projectId: 'PRJ-2026-007',
      projectName: 'Apollo Hospitals Delhi - Central Dietary Kitchen',
      documentName: 'ISO 22000:2018 Food Safety Management Certificate',
      documentType: 'Certificate',
      category: 'Quality',
      version: '1.0',
      uploadDate: '2026-02-06',
      uploadedBy: 'Quality Assurance',
      fileSize: '1.1 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Public',
      reviewedBy: 'Quality Manager',
      approvedBy: 'Bureau Veritas India',
      approvalDate: '2026-02-06',
      expiryDate: '2029-02-06',
      tags: ['ISO 22000', 'Food Safety', 'Certification', 'Quality', 'Compliance'],
      description: 'ISO 22000:2018 Food Safety Management System certification for hospital kitchen equipment supply and installation. Scope covers: design, manufacturing, supply, installation, and commissioning services.',
      relatedDocuments: ['APL-SPEC-2026-001'],
    },
    // ==================== AMAZON FRESH - DARK KITCHEN ====================
    {
      id: 'DOC-025',
      documentNumber: 'AMZ-DWG-2026-001',
      projectId: 'PRJ-2026-008',
      projectName: 'Amazon Fresh Pune - Cloud Kitchen Hub',
      documentName: 'Dark Kitchen Modular Layout - 12 Station Configuration',
      documentType: 'Drawing',
      category: 'Technical',
      version: '1.0',
      uploadDate: '2026-02-09',
      uploadedBy: 'Cloud Kitchen Specialist',
      fileSize: '4.4 MB',
      fileFormat: 'DWG',
      status: 'Draft',
      accessLevel: 'Restricted',
      reviewedBy: '',
      approvedBy: '',
      approvalDate: '',
      expiryDate: '',
      tags: ['Cloud Kitchen', 'Dark Kitchen', 'Modular', 'Layout', 'Amazon'],
      description: 'Modular dark kitchen layout with 12 independent cooking stations for different cuisine brands. Each station: 120 sq.ft with dedicated exhaust, fire suppression, and order management display.',
      relatedDocuments: [],
    },
    {
      id: 'DOC-026',
      documentNumber: 'AMZ-RPT-2026-001',
      projectId: 'PRJ-2026-008',
      projectName: 'Amazon Fresh Pune - Cloud Kitchen Hub',
      documentName: 'Energy Efficiency & Sustainability Assessment',
      documentType: 'Report',
      category: 'Operational',
      version: '1.0',
      uploadDate: '2026-02-10',
      uploadedBy: 'Sustainability Consultant',
      fileSize: '5.2 MB',
      fileFormat: 'PDF',
      status: 'Under Review',
      accessLevel: 'Internal',
      reviewedBy: 'Under Review - Amazon Sustainability Team',
      approvedBy: '',
      approvalDate: '',
      expiryDate: '',
      tags: ['Energy Efficiency', 'Sustainability', 'Green Kitchen', 'Carbon Footprint'],
      description: 'Comprehensive sustainability assessment covering: energy-efficient equipment selection (30% reduction target), water recycling provisions, waste management, and carbon footprint analysis.',
      relatedDocuments: ['AMZ-DWG-2026-001'],
    },
    // ==================== OBEROI HOTELS - FINE DINING ====================
    {
      id: 'DOC-027',
      documentNumber: 'OBR-DWG-2026-001',
      projectId: 'PRJ-2026-009',
      projectName: 'Oberoi Udaipur - Fine Dining Kitchen Renovation',
      documentName: 'Kitchen Renovation As-Built Drawing',
      documentType: 'Drawing',
      category: 'Technical',
      version: '3.0',
      uploadDate: '2026-02-11',
      uploadedBy: 'Senior Architect',
      fileSize: '6.2 MB',
      fileFormat: 'DWG',
      status: 'Approved',
      accessLevel: 'Internal',
      reviewedBy: 'Heritage Conservation Architect',
      approvedBy: 'Oberoi - General Manager',
      approvalDate: '2026-02-12',
      expiryDate: '',
      tags: ['Renovation', 'As-Built', 'Fine Dining', 'Heritage', 'Kitchen'],
      description: 'As-built drawing for heritage property kitchen renovation. Integrates modern kitchen equipment within historical building constraints. Includes structural modifications and MEP routing details.',
      relatedDocuments: ['OBR-RPT-2026-001'],
    },
    {
      id: 'DOC-028',
      documentNumber: 'OBR-RPT-2026-001',
      projectId: 'PRJ-2026-009',
      projectName: 'Oberoi Udaipur - Fine Dining Kitchen Renovation',
      documentName: 'Heritage Impact Assessment Report',
      documentType: 'Report',
      category: 'Legal',
      version: '1.0',
      uploadDate: '2026-01-25',
      uploadedBy: 'Heritage Consultant',
      fileSize: '8.6 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Public',
      reviewedBy: 'Archaeological Survey of India',
      approvedBy: 'State Heritage Commission',
      approvalDate: '2026-01-28',
      expiryDate: '',
      tags: ['Heritage', 'Impact Assessment', 'Conservation', 'Compliance', 'ASI'],
      description: 'Heritage impact assessment for kitchen renovation in Grade II heritage property. Covers: structural integrity analysis, vibration impact study, visual impact assessment, and conservation recommendations.',
      relatedDocuments: ['OBR-DWG-2026-001'],
    },
    // ==================== SWIGGY INSTAMART - MICRO FULFILLMENT ====================
    {
      id: 'DOC-029',
      documentNumber: 'SWG-INV-2026-001',
      projectId: 'PRJ-2026-010',
      projectName: 'Swiggy Instamart Mumbai - Micro Fulfillment Kitchen',
      documentName: 'Proforma Invoice - Kitchen Equipment Package',
      documentType: 'Invoice',
      category: 'Financial',
      version: '1.0',
      uploadDate: '2026-02-07',
      uploadedBy: 'Sales Team',
      fileSize: '0.7 MB',
      fileFormat: 'PDF',
      status: 'Under Review',
      accessLevel: 'Confidential',
      reviewedBy: 'Under Review - Swiggy Procurement',
      approvedBy: '',
      approvalDate: '',
      expiryDate: '',
      tags: ['Proforma', 'Invoice', 'Quotation', 'Equipment Package', 'Pricing'],
      description: 'Proforma invoice for micro fulfillment kitchen equipment package. Includes: compact cooking equipment, refrigerated storage, food prep stations, and packaging area. Total value: INR 68,50,000 + GST.',
      relatedDocuments: [],
    },
    {
      id: 'DOC-030',
      documentNumber: 'SWG-SPEC-2026-001',
      projectId: 'PRJ-2026-010',
      projectName: 'Swiggy Instamart Mumbai - Micro Fulfillment Kitchen',
      documentName: 'Compact Kitchen Equipment Specifications',
      documentType: 'Specification',
      category: 'Technical',
      version: '1.5',
      uploadDate: '2026-02-08',
      uploadedBy: 'Product Engineering',
      fileSize: '3.8 MB',
      fileFormat: 'PDF',
      status: 'Approved',
      accessLevel: 'Internal',
      reviewedBy: 'Technical Team',
      approvedBy: 'Swiggy - Kitchen Operations',
      approvalDate: '2026-02-09',
      expiryDate: '',
      tags: ['Compact', 'Micro Kitchen', 'Quick Service', 'Space Optimization'],
      description: 'Space-optimized equipment specifications for 400 sq.ft micro fulfillment kitchen. Focus on: rapid heating equipment, modular storage, easy cleaning, and high throughput (200 orders/hour capacity).',
      relatedDocuments: ['SWG-INV-2026-001'],
    },
  ]);

  useEffect(() => {
    projectManagementService.listPmDocuments()
     .then((rows) => { if (Array.isArray(rows) && rows.length > 0) setMockDocuments(rows as unknown as Document[]); })
     .catch(() => { /* keep seed data on error */ });
  }, []);

  const stats = {
    totalDocuments: mockDocuments.length,
    approved: mockDocuments.filter(d => d.status === 'Approved').length,
    pending: mockDocuments.filter(d => d.status === 'Under Review').length,
    draft: mockDocuments.filter(d => d.status === 'Draft').length,
    totalSize: mockDocuments.reduce((sum, d) => {
      const size = parseFloat(d.fileSize);
      return sum + size;
    }, 0).toFixed(1),
  };

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || doc.documentType === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesProject = filterProject === 'all' || doc.projectId === filterProject;

    // Tab filtering
    const matchesTab = activeTab === 'all' || (activeTab === 'my_approvals' && doc.status === 'Under Review'); // Mock logic for "My Approvals"

    return matchesSearch && matchesType && matchesStatus && matchesProject && matchesTab;
  });

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + itemsPerPage);

  const uniqueProjects = Array.from(new Set(mockDocuments.map(d => d.projectId)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Superseded':
        return 'bg-gray-100 text-gray-800';
      case 'Archived':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Drawing':
        return '📐';
      case 'Specification':
        return '📋';
      case 'Report':
        return '📊';
      case 'Certificate':
        return '🏆';
      case 'Manual':
        return '📖';
      case 'Contract':
        return '📝';
      case 'Invoice':
        return '💰';
      case 'Photo':
        return '📷';
      default:
        return '📄';
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'Public':
        return 'text-green-600';
      case 'Internal':
        return 'text-blue-600';
      case 'Confidential':
        return 'text-orange-600';
      case 'Restricted':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Handler functions
  const handleUpload = (data: any) => {
    console.log('Uploading document:', data);
    setShowUploadModal(false);
  };

  const handleEdit = (data: any) => {
    console.log('Editing document:', selectedDocument?.id, data);
    setShowEditModal(false);
    setSelectedDocument(null);
  };

  const handleShare = (data: any) => {
    console.log('Sharing document:', selectedDocument?.id, data);
    setShowShareModal(false);
    setSelectedDocument(null);
  };

  const handleMove = (data: any) => {
    console.log('Moving document:', selectedDocument?.id, data);
    setShowMoveModal(false);
    setSelectedDocument(null);
  };

  const handleCreateFolder = (data: any) => {
    console.log('Creating folder:', data);
    setShowCreateFolderModal(false);
  };

  const handleSetPermissions = (data: any) => {
    console.log('Setting permissions:', selectedDocument?.id, data);
    setShowPermissionsModal(false);
    setSelectedDocument(null);
  };

  const handleVersionHistory = () => {
    console.log('Version history for:', selectedDocument?.id);
    setShowVersionHistoryModal(false);
    setSelectedDocument(null);
  };

  const handleBulkDownload = () => {
    console.log('Bulk downloading:', selectedDocuments.length, 'documents');
    setShowBulkDownloadModal(false);
  };

  const handleFilterDocuments = (data: any) => {
    console.log('Applying filters:', data);
    setShowFilterModal(false);
  };

  const handleSearchDocuments = (data: any) => {
    console.log('Searching documents:', data);
    setShowSearchModal(false);
  };

  const handleTagDocuments = (data: any) => {
    console.log('Tagging documents:', selectedDocuments.length, data);
    setShowTagModal(false);
  };

  const handleDelete = async () => {
    const doc = selectedDocument;
    if (!doc) {
      setShowDeleteModal(false);
      return;
    }
    try {
      await projectManagementService.deletePmDocument(String(doc.id));
      setMockDocuments(prev => prev.filter(d => d.id !== doc.id));
      setSelectedDocuments(prev => prev.filter(d => d.id !== doc.id));
    } catch (err) {
      alert('Failed to delete document. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setSelectedDocument(null);
    }
  };

  const handlePreview = () => {
    console.log('Previewing document:', selectedDocument?.id);
  };

  const handleViewDetails = () => {
    console.log('Viewing details:', selectedDocument?.id);
  };

  // Helper functions to open modals with context
  const openEditModal = (doc: Document) => {
    setSelectedDocument(doc);
    setShowEditModal(true);
  };

  const openShareModal = (doc: Document) => {
    setSelectedDocument(doc);
    setShowShareModal(true);
  };

  const openMoveModal = (doc: Document) => {
    setSelectedDocument(doc);
    setShowMoveModal(true);
  };

  const openPermissionsModal = (doc: Document) => {
    setSelectedDocument(doc);
    setShowPermissionsModal(true);
  };

  const openVersionHistoryModal = (doc: Document) => {
    setSelectedDocument(doc);
    setShowVersionHistoryModal(true);
  };

  const openPreviewModal = (doc: Document) => {
    setSelectedDocument(doc);
    setShowPreviewModal(true);
  };

  const openDeleteModal = (doc: Document) => {
    setSelectedDocument(doc);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (doc: Document) => {
    setSelectedDocument(doc);
    setShowDetailsModal(true);
  };

  return (
    <div className="w-full h-screen overflow-y-auto overflow-x-hidden">
      <div className="px-3 py-2 space-y-3">
        {/* Professional Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage and organize all project documents in one place</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-3">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`${activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                All Documents
              </button>
              <button
                onClick={() => setActiveTab('my_approvals')}
                className={`${activeTab === 'my_approvals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                My Approvals
                <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                  {mockDocuments.filter(d => d.status === 'Under Review').length}
                </span>
              </button>
            </nav>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Document</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Select Document Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/project-management/documents/upload/boq" className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Bill of Quantities (BOQ)</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/project-management/documents/upload/drawings" className="cursor-pointer">
                    <Folder className="mr-2 h-4 w-4" />
                    <span>Drawings & Plans</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/project-management/documents/upload/renders" className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    <span>3D Renders & Visuals</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowUploadModal(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Other Documents</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <FolderInput className="h-4 w-4" />
              <span>Create Folder</span>
            </button>
            <button
              onClick={() => setShowSearchModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <FileSearch className="h-4 w-4" />
              <span>Advanced Search</span>
            </button>
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <button
              onClick={() => setShowBulkDownloadModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Archive className="h-4 w-4" />
              <span>Bulk Download</span>
            </button>
            <button
              onClick={() => setShowTagModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Tag className="h-4 w-4" />
              <span>Tag Selected</span>
            </button>
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalSize} MB</p>
              </div>
              <Folder className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents, tags, projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
              >
                <option value="all">All Types</option>
                <option value="Drawing">Drawings</option>
                <option value="Specification">Specifications</option>
                <option value="Confirmation">Confirmation</option>
                <option value="Contract">Contracts</option>
                <option value="Report">Reports</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
              >
                <option value="all">All Categories</option>
                <option value="Technical">Technical</option>
                <option value="Legal">Legal</option>
                <option value="Confirmation">Confirmation</option>
                <option value="Quality">Quality</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Superseded">Superseded</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                {uniqueProjects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* View Mode Toggle and Selection Info */}
        <div className="flex justify-between items-center">
          <div>
            {selectedDocuments.length > 0 && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-blue-700">
                  {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedDocuments([])}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
            >
              Grid View
            </button>
          </div>
        </div>

        {/* Documents List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.length === paginatedDocuments.length && paginatedDocuments.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocuments(paginatedDocuments);
                          } else {
                            setSelectedDocuments([]);
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type / Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version / Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedDocuments.map((doc) => (
                    <tr key={doc.id} className={`hover:bg-gray-50 ${selectedDocuments.some(d => d.id === doc.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedDocuments.some(d => d.id === doc.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setSelectedDocuments(prev => {
                              if (isChecked) {
                                return [...prev, doc];
                              } else {
                                return prev.filter(d => d.id !== doc.id);
                              }
                            });
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getTypeIcon(doc.documentType)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doc.documentName}</div>
                            <div className="text-xs text-gray-500">{doc.documentNumber}</div>
                            <div className="text-xs text-gray-500">{doc.fileSize} • {doc.fileFormat}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{doc.projectId}</div>
                        <div className="text-xs text-gray-500">{doc.projectName}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{doc.documentType}</div>
                        <div className="text-xs text-gray-500">{doc.category}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">v{doc.version}</div>
                        <div className="text-xs text-gray-500">{doc.uploadDate}</div>
                        <div className="text-xs text-gray-500">by {doc.uploadedBy}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                        <div className={`text-xs mt-1 ${getAccessLevelColor(doc.accessLevel)}`}>
                          {doc.accessLevel}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-center space-y-2">
                          {/* First row - 5 buttons */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => openPreviewModal(doc)}
                              className="p-1.5 rounded hover:bg-violet-50 text-violet-600 hover:text-violet-800 transition-colors"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDetailsModal(doc)}
                              className="p-1.5 rounded hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-colors"
                              title="View Details"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(doc)}
                              className="p-1.5 rounded hover:bg-green-50 text-green-600 hover:text-green-800 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openShareModal(doc)}
                              className="p-1.5 rounded hover:bg-purple-50 text-purple-600 hover:text-purple-800 transition-colors"
                              title="Share"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                            <button
                              className="p-1.5 rounded hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition-colors"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                          {/* Second row - 4 buttons */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => openMoveModal(doc)}
                              className="p-1.5 rounded hover:bg-orange-50 text-orange-600 hover:text-orange-800 transition-colors"
                              title="Move"
                            >
                              <FolderInput className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openPermissionsModal(doc)}
                              className="p-1.5 rounded hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 transition-colors"
                              title="Permissions"
                            >
                              <Lock className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openVersionHistoryModal(doc)}
                              className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600 hover:text-yellow-800 transition-colors"
                              title="Version History"
                            >
                              <Clock className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(doc)}
                              className="p-1.5 rounded hover:bg-red-50 text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredDocuments.length)}</span> of{' '}
                  <span className="font-medium">{filteredDocuments.length}</span> documents
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {paginatedDocuments.map((doc) => (
                <div key={doc.id} className={`bg-white rounded-lg border ${selectedDocuments.some(d => d.id === doc.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} p-3 hover:shadow-lg transition-shadow cursor-pointer relative`}>
                  <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedDocuments.some(d => d.id === doc.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        const isChecked = e.target.checked;
                        setSelectedDocuments(prev => {
                          if (isChecked) {
                            return [...prev, doc];
                          } else {
                            return prev.filter(d => d.id !== doc.id);
                          }
                        });
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-5xl mb-3">{getTypeIcon(doc.documentType)}</span>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">{doc.documentName}</h3>
                    <p className="text-xs text-gray-500 mb-2">{doc.documentNumber}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                    <p className="text-xs text-gray-500">{doc.fileSize} • {doc.fileFormat}</p>
                    <p className="text-xs text-gray-500">v{doc.version}</p>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-center space-y-2 mt-4 w-full">
                      {/* First row - 3 buttons */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openPreviewModal(doc)}
                          className="p-2 rounded hover:bg-violet-50 text-violet-600 hover:text-violet-800 transition-colors"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 rounded hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openShareModal(doc)}
                          className="p-2 rounded hover:bg-purple-50 text-purple-600 hover:text-purple-800 transition-colors"
                          title="Share"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                      {/* Second row - 3 buttons */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEditModal(doc)}
                          className="p-2 rounded hover:bg-green-50 text-green-600 hover:text-green-800 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openMoveModal(doc)}
                          className="p-2 rounded hover:bg-orange-50 text-orange-600 hover:text-orange-800 transition-colors"
                          title="Move"
                        >
                          <FolderInput className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(doc)}
                          className="p-2 rounded hover:bg-red-50 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination for Grid View */}
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Modals */}
        <UploadDocumentModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />

        <EditDocumentModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onEdit={handleEdit}
          doc={selectedDocument}
        />

        <ShareDocumentModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShare={handleShare}
          doc={selectedDocument}
        />

        <MoveDocumentModal
          isOpen={showMoveModal}
          onClose={() => setShowMoveModal(false)}
          onMove={handleMove}
          doc={selectedDocument}
        />

        <CreateFolderModal
          isOpen={showCreateFolderModal}
          onClose={() => setShowCreateFolderModal(false)}
          onCreate={handleCreateFolder}
        />

        <SetPermissionsModal
          isOpen={showPermissionsModal}
          onClose={() => setShowPermissionsModal(false)}
          onSet={handleSetPermissions}
          doc={selectedDocument}
        />

        <VersionHistoryModal
          isOpen={showVersionHistoryModal}
          onClose={() => setShowVersionHistoryModal(false)}
          doc={selectedDocument}
        />

        <BulkDownloadModal
          isOpen={showBulkDownloadModal}
          onClose={() => setShowBulkDownloadModal(false)}
          onDownload={handleBulkDownload}
          selectedDocs={selectedDocuments}
        />

        <FilterDocumentsModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={handleFilterDocuments}
        />

        <SearchDocumentsModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          onSearch={handleSearchDocuments}
        />

        <TagDocumentsModal
          isOpen={showTagModal}
          onClose={() => setShowTagModal(false)}
          onTag={handleTagDocuments}
          selectedDocs={selectedDocuments}
        />

        <DeleteDocumentModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDelete}
          doc={selectedDocument}
        />

        <PreviewDocumentModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          doc={selectedDocument}
        />

        <ViewDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          doc={selectedDocument}
        />
      </div>
    </div>
  );
}
