'use client';

import { useState, useEffect } from 'react';
import { projectManagementService } from '@/services/ProjectManagementService';
import { exportToCsv } from '@/lib/export';
import { ClipboardCheck, CheckCircle, XCircle, AlertTriangle, Plus, Download, Eye, Camera, Edit, FileText, Upload, Users, TrendingUp, Calendar, Shield } from 'lucide-react';
import {
 ScheduleInspectionModal,
 EditInspectionModal,
 UpdateChecklistModal,
 AddDefectModal,
 UploadPhotosModal,
 SignOffModal,
 UpdateStatusModal,
 AssignInspectorModal,
 AddChecklistItemModal,
 GenerateReportModal,
 ExportDataModal,
 ScheduleReInspectionModal,
 ViewFullDetailsModal,
 AddCorrectiveActionModal,
 ScheduleNextInspectionModal,
} from '@/components/project-management/QualityInspectionModals';

interface InspectionItem {
 id: string;
 checkPoint: string;
 criteria: string;
 result: 'Pass' | 'Fail' | 'NA' | 'Pending';
 remarks: string;
}

interface QualityInspection {
 id: string;
 inspectionNumber: string;
 projectId: string;
 projectName: string;
 inspectionDate: string;
 inspectionType: 'Pre-Installation' | 'During Installation' | 'Post-Installation' | 'Final Inspection' | 'Periodic';
 phase: string;
 workPackage: string;
 inspectorName: string;
 inspectorId: string;
 checklist: InspectionItem[];
 totalCheckPoints: number;
 passed: number;
 failed: number;
 notApplicable: number;
 pending: number;
 overallStatus: 'Passed' | 'Failed' | 'Conditional Pass' | 'Pending';
 defects: number;
 criticalDefects: number;
 photos: number;
 signedOff: boolean;
 signOffBy: string;
 signOffDate: string;
 nextInspectionDate: string;
 remarks: string;
}

export default function QualityInspectionPage() {
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState<string>('all');
 const [filterType, setFilterType] = useState<string>('all');
 const [showAddModal, setShowAddModal] = useState(false);
 const [selectedInspection, setSelectedInspection] = useState<QualityInspection | null>(null);
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 10;

 // Modal states
 const [showScheduleModal, setShowScheduleModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showChecklistModal, setShowChecklistModal] = useState(false);
 const [showDefectModal, setShowDefectModal] = useState(false);
 const [showPhotosModal, setShowPhotosModal] = useState(false);
 const [showSignOffModal, setShowSignOffModal] = useState(false);
 const [showStatusModal, setShowStatusModal] = useState(false);
 const [showAssignModal, setShowAssignModal] = useState(false);
 const [showAddItemModal, setShowAddItemModal] = useState(false);
 const [showReportModal, setShowReportModal] = useState(false);
 const [showExportModal, setShowExportModal] = useState(false);
 const [showReInspectionModal, setShowReInspectionModal] = useState(false);
 const [showDetailsModal, setShowDetailsModal] = useState(false);
 const [showCorrectiveModal, setShowCorrectiveModal] = useState(false);
 const [showNextInspectionModal, setShowNextInspectionModal] = useState(false);

 const [mockInspections, setMockInspections] = useState<QualityInspection[]>([
  {
   id: 'QI-001',
   inspectionNumber: 'QC-2025-001',
   projectId: 'PRJ-2025-001',
   projectName: 'Taj Hotels - Commercial Kitchen Setup',
   inspectionDate: '2025-01-20',
   inspectionType: 'During Installation',
   phase: 'Equipment Installation',
   workPackage: 'WP-001 - Cooking Equipment',
   inspectorName: 'Ramesh Kumar',
   inspectorId: 'EMP-QC-001',
   checklist: [
    { id: 'CHK-001', checkPoint: 'Equipment positioning as per layout', criteria: 'Within ±50mm tolerance', result: 'Pass', remarks: 'Positioned correctly' },
    { id: 'CHK-002', checkPoint: 'Leveling of equipment', criteria: 'Level within 2mm/meter', result: 'Pass', remarks: 'Properly leveled' },
    { id: 'CHK-003', checkPoint: 'SS304 grade verification', criteria: 'Material certificate check', result: 'Pass', remarks: 'Certificates verified' },
    { id: 'CHK-004', checkPoint: 'Welding quality', criteria: 'Smooth, no sharp edges', result: 'Fail', remarks: 'Minor grinding required at 3 joints' },
    { id: 'CHK-005', checkPoint: 'Electrical connections', criteria: 'As per wiring diagram', result: 'Pass', remarks: 'Proper earthing done' },
   ],
   totalCheckPoints: 5,
   passed: 4,
   failed: 1,
   notApplicable: 0,
   pending: 0,
   overallStatus: 'Conditional Pass',
   defects: 1,
   criticalDefects: 0,
   photos: 15,
   signedOff: false,
   signOffBy: '',
   signOffDate: '',
   nextInspectionDate: '2025-01-25',
   remarks: 'Minor welding corrections required. Re-inspection after rectification.',
  },
  {
   id: 'QI-002',
   inspectionNumber: 'QC-2025-002',
   projectId: 'PRJ-2025-002',
   projectName: 'BigBasket - Cold Room Installation',
   inspectionDate: '2025-01-19',
   inspectionType: 'Pre-Installation',
   phase: 'Site Preparation',
   workPackage: 'WP-002 - Civil Foundation',
   inspectorName: 'Suresh Patel',
   inspectorId: 'EMP-QC-002',
   checklist: [
    { id: 'CHK-006', checkPoint: 'Floor levelness', criteria: 'Level within 5mm over 10m', result: 'Pass', remarks: 'Floor properly leveled' },
    { id: 'CHK-007', checkPoint: 'Floor load capacity', criteria: 'Min 1500 kg/sqm', result: 'Pass', remarks: 'Load test report available' },
    { id: 'CHK-008', checkPoint: 'Drainage slope', criteria: '1:100 slope towards drain', result: 'Pass', remarks: 'Adequate slope provided' },
    { id: 'CHK-009', checkPoint: 'Wall moisture test', criteria: 'No dampness', result: 'Pass', remarks: 'Walls are dry' },
    { id: 'CHK-010', checkPoint: 'Power supply availability', criteria: '440V 3-phase with neutral', result: 'Pass', remarks: 'Dedicated transformer installed' },
   ],
   totalCheckPoints: 5,
   passed: 5,
   failed: 0,
   notApplicable: 0,
   pending: 0,
   overallStatus: 'Passed',
   defects: 0,
   criticalDefects: 0,
   photos: 12,
   signedOff: true,
   signOffBy: 'Project Manager',
   signOffDate: '2025-01-19',
   nextInspectionDate: '2025-01-26',
   remarks: 'Site ready for cold room panel installation. Proceed with next phase.',
  },
  {
   id: 'QI-003',
   inspectionNumber: 'QC-2025-003',
   projectId: 'PRJ-2025-003',
   projectName: 'L&T Campus - Industrial Kitchen',
   inspectionDate: '2025-01-21',
   inspectionType: 'Post-Installation',
   phase: 'Equipment Testing',
   workPackage: 'WP-003 - HVAC System',
   inspectorName: 'Vijay Sharma',
   inspectorId: 'EMP-QC-003',
   checklist: [
    { id: 'CHK-011', checkPoint: 'Air flow rate', criteria: 'Min 30 air changes/hour', result: 'Pass', remarks: '35 ACH achieved' },
    { id: 'CHK-012', checkPoint: 'Filter installation', criteria: 'G4 pre-filter + F7 main filter', result: 'Pass', remarks: 'Filters installed correctly' },
    { id: 'CHK-013', checkPoint: 'Duct leakage test', criteria: 'Max 3% leakage at 250Pa', result: 'Fail', remarks: 'Leakage detected at 2 joints - 5.2%' },
    { id: 'CHK-014', checkPoint: 'Noise level', criteria: 'Max 65dB at 1 meter', result: 'Pass', remarks: 'Noise level 62dB' },
    { id: 'CHK-015', checkPoint: 'Vibration isolation', criteria: 'Isolators installed and functional', result: 'Pass', remarks: 'Spring isolators working' },
    { id: 'CHK-016', checkPoint: 'Control panel functionality', criteria: 'All controls operational', result: 'Pending', remarks: 'Testing in progress' },
   ],
   totalCheckPoints: 6,
   passed: 4,
   failed: 1,
   notApplicable: 0,
   pending: 1,
   overallStatus: 'Failed',
   defects: 2,
   criticalDefects: 1,
   photos: 18,
   signedOff: false,
   signOffBy: '',
   signOffDate: '',
   nextInspectionDate: '2025-01-28',
   remarks: 'Critical: Duct leakage exceeds acceptable limit. Immediate rectification required.',
  },
  {
   id: 'QI-004',
   inspectionNumber: 'QC-2025-004',
   projectId: 'PRJ-2025-004',
   projectName: 'ITC Grand - Bakery Equipment Setup',
   inspectionDate: '2025-01-20',
   inspectionType: 'Final Inspection',
   phase: 'Project Completion',
   workPackage: 'WP-004 - Final Handover',
   inspectorName: 'Amit Singh',
   inspectorId: 'EMP-QC-004',
   checklist: [
    { id: 'CHK-017', checkPoint: 'All equipment operational', criteria: '100% functionality', result: 'Pass', remarks: 'All equipment tested and working' },
    { id: 'CHK-018', checkPoint: 'Safety interlocks', criteria: 'All safety features functional', result: 'Pass', remarks: 'Emergency stops tested' },
    { id: 'CHK-019', checkPoint: 'Cleaning and finishing', criteria: 'No scratches, clean surfaces', result: 'Pass', remarks: 'Equipment cleaned and polished' },
    { id: 'CHK-020', checkPoint: 'Documentation complete', criteria: 'Manuals, warranties, certificates', result: 'Pass', remarks: 'All documents handed over' },
    { id: 'CHK-021', checkPoint: 'Training completion', criteria: 'Staff trained and certified', result: 'Pass', remarks: '6 staff members trained' },
    { id: 'CHK-022', checkPoint: 'Client walkthrough', criteria: 'Client acceptance', result: 'Pass', remarks: 'Client satisfied with installation' },
   ],
   totalCheckPoints: 6,
   passed: 6,
   failed: 0,
   notApplicable: 0,
   pending: 0,
   overallStatus: 'Passed',
   defects: 0,
   criticalDefects: 0,
   photos: 25,
   signedOff: true,
   signOffBy: 'Client Representative',
   signOffDate: '2025-01-20',
   nextInspectionDate: '',
   remarks: 'Final inspection completed successfully. Project ready for handover.',
  },
  {
   id: 'QI-005',
   inspectionNumber: 'QC-2025-005',
   projectId: 'PRJ-2025-005',
   projectName: 'Godrej Properties - Modular Kitchen',
   inspectionDate: '2025-01-22',
   inspectionType: 'During Installation',
   phase: 'Cabinet Installation',
   workPackage: 'WP-005 - Cabinet Assembly',
   inspectorName: 'Dinesh Kumar',
   inspectorId: 'EMP-QC-005',
   checklist: [
    { id: 'CHK-023', checkPoint: 'Cabinet levelness', criteria: 'Level within 1mm', result: 'Pass', remarks: 'Cabinets properly leveled' },
    { id: 'CHK-024', checkPoint: 'Door alignment', criteria: 'Uniform gap of 3mm', result: 'Pass', remarks: 'Doors aligned correctly' },
    { id: 'CHK-025', checkPoint: 'Drawer operation', criteria: 'Smooth with soft close', result: 'Fail', remarks: 'One drawer requires adjustment' },
    { id: 'CHK-026', checkPoint: 'Hardware quality', criteria: 'Branded fittings as specified', result: 'Pass', remarks: 'Blum and Hettich fittings used' },
    { id: 'CHK-027', checkPoint: 'Finish quality', criteria: 'No scratches or damages', result: 'Pass', remarks: 'Excellent finish' },
   ],
   totalCheckPoints: 5,
   passed: 4,
   failed: 1,
   notApplicable: 0,
   pending: 0,
   overallStatus: 'Conditional Pass',
   defects: 1,
   criticalDefects: 0,
   photos: 10,
   signedOff: false,
   signOffBy: '',
   signOffDate: '',
   nextInspectionDate: '2025-01-24',
   remarks: 'Minor adjustment required for one drawer. Will be rectified within 2 days.',
  },
  {
   id: 'QI-006',
   inspectionNumber: 'QC-2025-006',
   projectId: 'PRJ-2025-001',
   projectName: 'Taj Hotels - Commercial Kitchen Setup',
   inspectionDate: '2025-01-18',
   inspectionType: 'Pre-Installation',
   phase: 'Site Preparation',
   workPackage: 'WP-006 - Electrical Infrastructure',
   inspectorName: 'Prakash Rao',
   inspectorId: 'EMP-QC-006',
   checklist: [
    { id: 'CHK-028', checkPoint: 'Power panel capacity', criteria: 'Min 200KVA', result: 'Pass', remarks: '250KVA transformer installed' },
    { id: 'CHK-029', checkPoint: 'Earthing resistance', criteria: 'Max 5 ohms', result: 'Pass', remarks: 'Measured 3.2 ohms' },
    { id: 'CHK-030', checkPoint: 'Cable sizing', criteria: 'As per load calculations', result: 'Pass', remarks: 'Verified with electrical drawings' },
    { id: 'CHK-031', checkPoint: 'Circuit breakers', criteria: 'Rated as per specifications', result: 'Pass', remarks: 'MCBs and RCCBs properly rated' },
    { id: 'CHK-032', checkPoint: 'Cable routing', criteria: 'Proper conduits and trays', result: 'Pass', remarks: 'Fire-rated cables used' },
   ],
   totalCheckPoints: 5,
   passed: 5,
   failed: 0,
   notApplicable: 0,
   pending: 0,
   overallStatus: 'Passed',
   defects: 0,
   criticalDefects: 0,
   photos: 14,
   signedOff: true,
   signOffBy: 'Electrical Engineer',
   signOffDate: '2025-01-18',
   nextInspectionDate: '2025-01-23',
   remarks: 'Electrical infrastructure ready for equipment connection.',
  },
  {
   id: 'QI-007',
   inspectionNumber: 'QC-2025-007',
   projectId: 'PRJ-2025-002',
   projectName: 'BigBasket - Cold Room Installation',
   inspectionDate: '2025-01-23',
   inspectionType: 'During Installation',
   phase: 'Panel Installation',
   workPackage: 'WP-007 - Insulation Panels',
   inspectorName: 'Ravi Shankar',
   inspectorId: 'EMP-QC-007',
   checklist: [
    { id: 'CHK-033', checkPoint: 'Panel thickness', criteria: '100mm PUF as specified', result: 'Pass', remarks: 'Verified with thickness gauge' },
    { id: 'CHK-034', checkPoint: 'Joint sealing', criteria: 'Airtight with proper gaskets', result: 'Pass', remarks: 'All joints properly sealed' },
    { id: 'CHK-035', checkPoint: 'Panel alignment', criteria: 'Straight within 3mm', result: 'Pass', remarks: 'Alignment checked with laser' },
    { id: 'CHK-036', checkPoint: 'Floor panel anchoring', criteria: 'Bolted at 600mm centers', result: 'Fail', remarks: 'Spacing exceeds at 3 locations' },
    { id: 'CHK-037', checkPoint: 'Cam-lock engagement', criteria: 'Full engagement of all locks', result: 'Pass', remarks: 'All cam-locks engaged' },
   ],
   totalCheckPoints: 5,
   passed: 4,
   failed: 1,
   notApplicable: 0,
   pending: 0,
   overallStatus: 'Conditional Pass',
   defects: 1,
   criticalDefects: 0,
   photos: 16,
   signedOff: false,
   signOffBy: '',
   signOffDate: '',
   nextInspectionDate: '2025-01-25',
   remarks: 'Additional anchor bolts to be installed at 3 locations.',
  },
  {
   id: 'QI-008',
   inspectionNumber: 'QC-2025-008',
   projectId: 'PRJ-2025-003',
   projectName: 'L&T Campus - Industrial Kitchen',
   inspectionDate: '2025-01-17',
   inspectionType: 'Periodic',
   phase: 'Ongoing Installation',
   workPackage: 'WP-008 - Safety Compliance',
   inspectorName: 'Venkat Rao',
   inspectorId: 'EMP-QC-008',
   checklist: [
    { id: 'CHK-038', checkPoint: 'Fire extinguishers', criteria: 'ABC type, serviceable, accessible', result: 'Pass', remarks: '8 extinguishers installed' },
    { id: 'CHK-039', checkPoint: 'Emergency exits', criteria: 'Clearly marked, unobstructed', result: 'Pass', remarks: '4 exits properly marked' },
    { id: 'CHK-040', checkPoint: 'PPE usage', criteria: '100% compliance by workers', result: 'Fail', remarks: '2 workers without safety shoes' },
    { id: 'CHK-041', checkPoint: 'Housekeeping', criteria: 'Clean, organized work area', result: 'Pass', remarks: 'Site properly maintained' },
    { id: 'CHK-042', checkPoint: 'First aid kit', criteria: 'Available and fully stocked', result: 'Pass', remarks: 'First aid box checked' },
    { id: 'CHK-043', checkPoint: 'Electrical safety', criteria: 'ELCB functional, no loose wires', result: 'Pass', remarks: 'Electrical safety OK' },
   ],
   totalCheckPoints: 6,
   passed: 5,
   failed: 1,
   notApplicable: 0,
   pending: 0,
   overallStatus: 'Conditional Pass',
   defects: 1,
   criticalDefects: 0,
   photos: 11,
   signedOff: false,
   signOffBy: '',
   signOffDate: '',
   nextInspectionDate: '2025-01-24',
   remarks: 'PPE compliance issue addressed. Workers warned and safety shoes provided.',
  },
  {
   id: 'QI-009',
   inspectionNumber: 'QC-2025-009',
   projectId: 'PRJ-2025-004',
   projectName: 'ITC Grand - Bakery Equipment Setup',
   inspectionDate: '2025-01-16',
   inspectionType: 'During Installation',
   phase: 'Equipment Installation',
   workPackage: 'WP-009 - Oven Installation',
   inspectorName: 'Mahesh Gupta',
   inspectorId: 'EMP-QC-009',
   checklist: [
    { id: 'CHK-044', checkPoint: 'Foundation strength', criteria: 'RCC foundation as per drawing', result: 'Pass', remarks: 'Foundation cured for 28 days' },
    { id: 'CHK-045', checkPoint: 'Equipment leveling', criteria: 'Level within 0.5mm', result: 'Pass', remarks: 'Spirit level verification done' },
    { id: 'CHK-046', checkPoint: 'Gas connection', criteria: 'Leak-free joints', result: 'Pass', remarks: 'Soap solution test passed' },
    { id: 'CHK-047', checkPoint: 'Ventilation hood alignment', criteria: 'Proper overhang above oven', result: 'Pass', remarks: 'Hood properly positioned' },
    { id: 'CHK-048', checkPoint: 'Temperature calibration', criteria: '±2°C accuracy', result: 'Pending', remarks: 'Calibration scheduled tomorrow' },
   ],
   totalCheckPoints: 5,
   passed: 4,
   failed: 0,
   notApplicable: 0,
   pending: 1,
   overallStatus: 'Pending',
   defects: 0,
   criticalDefects: 0,
   photos: 13,
   signedOff: false,
   signOffBy: '',
   signOffDate: '',
   nextInspectionDate: '2025-01-17',
   remarks: 'Awaiting calibration engineer for temperature verification.',
  },
  {
   id: 'QI-010',
   inspectionNumber: 'QC-2025-010',
   projectId: 'PRJ-2025-005',
   projectName: 'Godrej Properties - Modular Kitchen',
   inspectionDate: '2025-01-15',
   inspectionType: 'Pre-Installation',
   phase: 'Site Preparation',
   workPackage: 'WP-010 - Site Readiness',
   inspectorName: 'Deepak Shah',
   inspectorId: 'EMP-QC-010',
   checklist: [
    { id: 'CHK-049', checkPoint: 'Wall plastering complete', criteria: 'Smooth finish, no cracks', result: 'Pass', remarks: 'Walls properly finished' },
    { id: 'CHK-050', checkPoint: 'Electrical points', criteria: 'As per kitchen layout', result: 'Pass', remarks: '12 points as specified' },
    { id: 'CHK-051', checkPoint: 'Plumbing points', criteria: 'Hot and cold water, drain', result: 'Pass', remarks: 'All points available' },
    { id: 'CHK-052', checkPoint: 'Floor tiling', criteria: 'Level, non-slip tiles', result: 'Pass', remarks: 'Anti-skid tiles laid' },
    { id: 'CHK-053', checkPoint: 'False ceiling', criteria: 'Gypsum board, painted', result: 'NA', remarks: 'Will be done after cabinets' },
   ],
   totalCheckPoints: 5,
   passed: 4,
   failed: 0,
   notApplicable: 1,
   pending: 0,
   overallStatus: 'Passed',
   defects: 0,
   criticalDefects: 0,
   photos: 8,
   signedOff: true,
   signOffBy: 'Site Supervisor',
   signOffDate: '2025-01-15',
   nextInspectionDate: '2025-01-22',
   remarks: 'Site ready for cabinet installation. Proceed as planned.',
  },
 ]);

 useEffect(() => {
  projectManagementService.listQualityInspections()
   .then((rows) => { if (Array.isArray(rows) && rows.length > 0) setMockInspections(rows as unknown as QualityInspection[]); })
   .catch(() => { /* keep seed data on error */ });
 }, []);

 const stats = {
  totalInspections: mockInspections.length,
  passed: mockInspections.filter(i => i.overallStatus === 'Passed').length,
  failed: mockInspections.filter(i => i.overallStatus === 'Failed').length,
  conditionalPass: mockInspections.filter(i => i.overallStatus === 'Conditional Pass').length,
  pending: mockInspections.filter(i => i.overallStatus === 'Pending').length,
  totalDefects: mockInspections.reduce((sum, i) => sum + i.defects, 0),
  criticalDefects: mockInspections.reduce((sum, i) => sum + i.criticalDefects, 0),
 };

 const filteredInspections = mockInspections.filter((inspection) => {
  const matchesSearch =
   inspection.inspectionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
   inspection.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
   inspection.workPackage.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesStatus = filterStatus === 'all' || inspection.overallStatus === filterStatus;
  const matchesType = filterType === 'all' || inspection.inspectionType === filterType;
  return matchesSearch && matchesStatus && matchesType;
 });

 const totalPages = Math.ceil(filteredInspections.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const paginatedInspections = filteredInspections.slice(startIndex, startIndex + itemsPerPage);

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'Passed':
    return 'bg-green-100 text-green-800';
   case 'Failed':
    return 'bg-red-100 text-red-800';
   case 'Conditional Pass':
    return 'bg-yellow-100 text-yellow-800';
   case 'Pending':
    return 'bg-blue-100 text-blue-800';
   default:
    return 'bg-gray-100 text-gray-800';
  }
 };

 const getResultColor = (result: string) => {
  switch (result) {
   case 'Pass':
    return 'text-green-600';
   case 'Fail':
    return 'text-red-600';
   case 'NA':
    return 'text-gray-400';
   case 'Pending':
    return 'text-blue-600';
   default:
    return 'text-gray-600';
  }
 };

 const getResultIcon = (result: string) => {
  switch (result) {
   case 'Pass':
    return <CheckCircle className="h-5 w-5 text-green-600" />;
   case 'Fail':
    return <XCircle className="h-5 w-5 text-red-600" />;
   case 'Pending':
    return <AlertTriangle className="h-5 w-5 text-blue-600" />;
   default:
    return <span className="h-5 w-5 text-gray-400">N/A</span>;
  }
 };

 // Handler functions for all modals
 const handleSchedule = (data: any) => { console.log('Schedule:', data); setShowScheduleModal(false); };
 const handleEdit = (data: any) => { console.log('Edit:', data); setShowEditModal(false); setSelectedInspection(null); };
 const handleUpdateChecklist = (data: any) => { console.log('Update Checklist:', data); setShowChecklistModal(false); setSelectedInspection(null); };
 const handleAddDefect = (data: any) => { console.log('Add Defect:', data); setShowDefectModal(false); setSelectedInspection(null); };
 const handleUploadPhotos = (data: any) => { console.log('Upload Photos:', data); setShowPhotosModal(false); setSelectedInspection(null); };
 const handleSignOff = (data: any) => { console.log('Sign Off:', data); setShowSignOffModal(false); setSelectedInspection(null); };
 const handleUpdateStatus = (data: any) => { console.log('Update Status:', data); setShowStatusModal(false); setSelectedInspection(null); };
 const handleAssignInspector = (data: any) => { console.log('Assign:', data); setShowAssignModal(false); setSelectedInspection(null); };
 const handleAddItem = (data: any) => { console.log('Add Item:', data); setShowAddItemModal(false); setSelectedInspection(null); };
 const handleGenerateReport = (data: any) => { console.log('Report:', data); setShowReportModal(false); setSelectedInspection(null); };
 const handleExport = (data: any) => { exportToCsv('quality-inspections', filteredInspections as unknown as Record<string, unknown>[]); setShowExportModal(false); };
 const handleScheduleReInspection = (data: any) => { console.log('Re-Inspection:', data); setShowReInspectionModal(false); setSelectedInspection(null); };
 const handleAddCorrective = (data: any) => { console.log('Corrective:', data); setShowCorrectiveModal(false); setSelectedInspection(null); };
 const handleScheduleNext = (data: any) => { console.log('Next:', data); setShowNextInspectionModal(false); setSelectedInspection(null); };

 // Helper functions to open modals
 const openEditModal = (i: QualityInspection) => { setSelectedInspection(i); setShowEditModal(true); };
 const openChecklistModal = (i: QualityInspection) => { setSelectedInspection(i); setShowChecklistModal(true); };
 const openDefectModal = (i: QualityInspection) => { setSelectedInspection(i); setShowDefectModal(true); };
 const openPhotosModal = (i: QualityInspection) => { setSelectedInspection(i); setShowPhotosModal(true); };
 const openSignOffModal = (i: QualityInspection) => { setSelectedInspection(i); setShowSignOffModal(true); };
 const openStatusModal = (i: QualityInspection) => { setSelectedInspection(i); setShowStatusModal(true); };
 const openAssignModal = (i: QualityInspection) => { setSelectedInspection(i); setShowAssignModal(true); };
 const openAddItemModal = (i: QualityInspection) => { setSelectedInspection(i); setShowAddItemModal(true); };
 const openReportModal = (i: QualityInspection) => { setSelectedInspection(i); setShowReportModal(true); };
 const openReInspectionModal = (i: QualityInspection) => { setSelectedInspection(i); setShowReInspectionModal(true); };
 const openDetailsModal = (i: QualityInspection) => { setSelectedInspection(i); setShowDetailsModal(true); };
 const openCorrectiveModal = (i: QualityInspection) => { setSelectedInspection(i); setShowCorrectiveModal(true); };
 const openNextModal = (i: QualityInspection) => { setSelectedInspection(i); setShowNextInspectionModal(true); };

 return (
  <div className="p-6 space-y-3">
   {/* Header */}
   <div className="flex justify-between items-start">
    <div>
     <h1 className="text-3xl font-bold text-gray-900">Quality Inspection Checklist</h1>
     <p className="text-gray-600 mt-1">Project quality assurance and compliance tracking</p>
    </div>
    <div className="flex items-center space-x-3">
     <button
      onClick={() => setShowReportModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
     >
      <FileText className="h-5 w-5" />
      <span>Generate Report</span>
     </button>
     <button
      onClick={() => setShowExportModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
     >
      <Download className="h-5 w-5" />
      <span>Export</span>
     </button>
     <button
      onClick={() => setShowScheduleModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
     >
      <Plus className="h-5 w-5" />
      <span>Schedule Inspection</span>
     </button>
    </div>
   </div>

   {/* Statistics Cards */}
   <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Total</p>
       <p className="text-2xl font-bold text-gray-900">{stats.totalInspections}</p>
      </div>
      <ClipboardCheck className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Passed</p>
       <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
      </div>
      <CheckCircle className="h-8 w-8 text-green-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Failed</p>
       <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
      </div>
      <XCircle className="h-8 w-8 text-red-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Conditional</p>
       <p className="text-2xl font-bold text-yellow-600">{stats.conditionalPass}</p>
      </div>
      <AlertTriangle className="h-8 w-8 text-yellow-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Pending</p>
       <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
      </div>
      <AlertTriangle className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Defects</p>
       <p className="text-2xl font-bold text-orange-600">{stats.totalDefects}</p>
      </div>
      <AlertTriangle className="h-8 w-8 text-orange-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Critical</p>
       <p className="text-2xl font-bold text-red-600">{stats.criticalDefects}</p>
      </div>
      <XCircle className="h-8 w-8 text-red-600" />
     </div>
    </div>
   </div>

   {/* Filters */}
   <div className="bg-white p-3 rounded-lg border border-gray-200">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
     <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
      <input
       type="text"
       placeholder="Search by inspection number, project, work package..."
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
     </div>
     <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
      <select
       value={filterStatus}
       onChange={(e) => setFilterStatus(e.target.value)}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
       <option value="all">All Status</option>
       <option value="Passed">Passed</option>
       <option value="Failed">Failed</option>
       <option value="Conditional Pass">Conditional Pass</option>
       <option value="Pending">Pending</option>
      </select>
     </div>
     <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
      <select
       value={filterType}
       onChange={(e) => setFilterType(e.target.value)}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
       <option value="all">All Types</option>
       <option value="Pre-Installation">Pre-Installation</option>
       <option value="During Installation">During Installation</option>
       <option value="Post-Installation">Post-Installation</option>
       <option value="Final Inspection">Final Inspection</option>
       <option value="Periodic">Periodic</option>
      </select>
     </div>
    </div>
   </div>

   {/* Inspections Table */}
   <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
     <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
       <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Inspection Details
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Project / Phase
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Type
        </th>
        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
         Checkpoints
        </th>
        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
         Results
        </th>
        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
         Defects
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
       {paginatedInspections.map((inspection) => (
        <tr key={inspection.id} className="hover:bg-gray-50">
         <td className="px-4 py-4">
          <div>
           <div className="text-sm font-medium text-gray-900">{inspection.inspectionNumber}</div>
           <div className="text-sm text-gray-600">{inspection.inspectorName}</div>
           <div className="text-xs text-gray-500">{inspection.inspectionDate}</div>
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="text-sm font-medium text-gray-900">{inspection.projectId}</div>
          <div className="text-sm text-gray-600">{inspection.projectName}</div>
          <div className="text-xs text-gray-500">{inspection.phase}</div>
         </td>
         <td className="px-4 py-4">
          <div className="text-sm text-gray-900">{inspection.inspectionType}</div>
         </td>
         <td className="px-4 py-4 text-center">
          <div className="text-sm font-medium text-gray-900">{inspection.totalCheckPoints}</div>
          <div className="text-xs text-gray-500">checkpoints</div>
         </td>
         <td className="px-4 py-4">
          <div className="flex justify-center space-x-2 text-xs">
           <span className="text-green-600 font-medium">✓ {inspection.passed}</span>
           <span className="text-red-600 font-medium">✗ {inspection.failed}</span>
           <span className="text-gray-400 font-medium">- {inspection.notApplicable}</span>
           {inspection.pending > 0 && (
            <span className="text-blue-600 font-medium">⏳ {inspection.pending}</span>
           )}
          </div>
         </td>
         <td className="px-4 py-4 text-center">
          <div className="text-sm font-medium text-gray-900">{inspection.defects}</div>
          {inspection.criticalDefects > 0 && (
           <div className="text-xs text-red-600 font-semibold">
            {inspection.criticalDefects} Critical
           </div>
          )}
         </td>
         <td className="px-4 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inspection.overallStatus)}`}>
           {inspection.overallStatus}
          </span>
          {inspection.signedOff && (
           <div className="flex items-center mt-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Signed Off
           </div>
          )}
         </td>
         <td className="px-4 py-4 text-center">
          <button
           onClick={() => setSelectedInspection(inspection)}
           className="text-blue-600 hover:text-blue-800"
          >
           <Eye className="h-5 w-5" />
          </button>
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
       <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredInspections.length)}</span> of{' '}
       <span className="font-medium">{filteredInspections.length}</span> inspections
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
         className={`px-3 py-1 border rounded-md text-sm font-medium ${
          currentPage === page
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

   {/* View Inspection Details Modal */}
   {selectedInspection && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
     <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
       <div>
        <h2 className="text-xl font-bold text-gray-900">{selectedInspection.inspectionNumber}</h2>
        <p className="text-sm text-gray-600">{selectedInspection.projectName} - {selectedInspection.phase}</p>
       </div>
       <button
        onClick={() => setSelectedInspection(null)}
        className="text-gray-400 hover:text-gray-600"
       >
        ✕
       </button>
      </div>

      <div className="p-6 space-y-3">
       {/* Inspection Summary */}
       <div className="grid grid-cols-4 gap-2">
        <div className="bg-gray-50 p-3 rounded-lg">
         <p className="text-sm text-gray-600">Inspector</p>
         <p className="font-medium text-gray-900">{selectedInspection.inspectorName}</p>
         <p className="text-xs text-gray-500">{selectedInspection.inspectorId}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
         <p className="text-sm text-gray-600">Date</p>
         <p className="font-medium text-gray-900">{selectedInspection.inspectionDate}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
         <p className="text-sm text-gray-600">Type</p>
         <p className="font-medium text-gray-900">{selectedInspection.inspectionType}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
         <p className="text-sm text-gray-600">Status</p>
         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInspection.overallStatus)}`}>
          {selectedInspection.overallStatus}
         </span>
        </div>
       </div>

       {/* Checklist Items */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Inspection Checklist</h3>
        <div className="space-y-3">
         {selectedInspection.checklist.map((item, index) => (
          <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
           <div className="flex items-start justify-between">
            <div className="flex-1">
             <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
               {index + 1}. {item.checkPoint}
              </span>
             </div>
             <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Criteria:</span> {item.criteria}
             </p>
             {item.remarks && (
              <p className="text-sm text-gray-700 mt-1">
               <span className="font-medium">Remarks:</span> {item.remarks}
              </p>
             )}
            </div>
            <div className="flex items-center space-x-2 ml-4">
             {getResultIcon(item.result)}
             <span className={`font-semibold text-sm ${getResultColor(item.result)}`}>
              {item.result}
             </span>
            </div>
           </div>
          </div>
         ))}
        </div>
       </div>

       {/* Overall Remarks */}
       <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Overall Remarks</h3>
        <p className="text-sm text-gray-700">{selectedInspection.remarks}</p>
       </div>

       {/* Sign-off Status */}
       {selectedInspection.signedOff ? (
        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
         <div className="flex items-center space-x-2 text-green-800">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Inspection Signed Off</span>
         </div>
         <p className="text-sm text-green-700 mt-1">
          Signed by: {selectedInspection.signOffBy} on {selectedInspection.signOffDate}
         </p>
        </div>
       ) : (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
         <div className="flex items-center space-x-2 text-yellow-800">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">Awaiting Sign-off</span>
         </div>
         {selectedInspection.nextInspectionDate && (
          <p className="text-sm text-yellow-700 mt-1">
           Next inspection scheduled: {selectedInspection.nextInspectionDate}
          </p>
         )}
        </div>
       )}

       {/* Actions */}
       <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
         <Download className="h-4 w-4" />
         <span>Download Report</span>
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
         <Camera className="h-4 w-4" />
         <span>View Photos ({selectedInspection.photos})</span>
        </button>
        <button
         onClick={() => setSelectedInspection(null)}
         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
         Close
        </button>
       </div>
      </div>
     </div>
    </div>
   )}

   {/* All Modals */}
   <ScheduleInspectionModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} onSchedule={handleSchedule} />
   <EditInspectionModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedInspection(null); }} onEdit={handleEdit} inspection={selectedInspection} />
   <UpdateChecklistModal isOpen={showChecklistModal} onClose={() => { setShowChecklistModal(false); setSelectedInspection(null); }} onUpdate={handleUpdateChecklist} inspection={selectedInspection} />
   <AddDefectModal isOpen={showDefectModal} onClose={() => { setShowDefectModal(false); setSelectedInspection(null); }} onAdd={handleAddDefect} inspection={selectedInspection} />
   <UploadPhotosModal isOpen={showPhotosModal} onClose={() => { setShowPhotosModal(false); setSelectedInspection(null); }} onUpload={handleUploadPhotos} inspection={selectedInspection} />
   <SignOffModal isOpen={showSignOffModal} onClose={() => { setShowSignOffModal(false); setSelectedInspection(null); }} onSignOff={handleSignOff} inspection={selectedInspection} />
   <UpdateStatusModal isOpen={showStatusModal} onClose={() => { setShowStatusModal(false); setSelectedInspection(null); }} onUpdate={handleUpdateStatus} inspection={selectedInspection} />
   <AssignInspectorModal isOpen={showAssignModal} onClose={() => { setShowAssignModal(false); setSelectedInspection(null); }} onAssign={handleAssignInspector} inspection={selectedInspection} />
   <AddChecklistItemModal isOpen={showAddItemModal} onClose={() => { setShowAddItemModal(false); setSelectedInspection(null); }} onAdd={handleAddItem} inspection={selectedInspection} />
   <GenerateReportModal isOpen={showReportModal} onClose={() => { setShowReportModal(false); setSelectedInspection(null); }} onGenerate={handleGenerateReport} inspection={selectedInspection} />
   <ExportDataModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} onExport={handleExport} />
   <ScheduleReInspectionModal isOpen={showReInspectionModal} onClose={() => { setShowReInspectionModal(false); setSelectedInspection(null); }} onSchedule={handleScheduleReInspection} inspection={selectedInspection} />
   <ViewFullDetailsModal isOpen={showDetailsModal} onClose={() => { setShowDetailsModal(false); setSelectedInspection(null); }} inspection={selectedInspection} />
   <AddCorrectiveActionModal isOpen={showCorrectiveModal} onClose={() => { setShowCorrectiveModal(false); setSelectedInspection(null); }} onAdd={handleAddCorrective} inspection={selectedInspection} />
   <ScheduleNextInspectionModal isOpen={showNextInspectionModal} onClose={() => { setShowNextInspectionModal(false); setSelectedInspection(null); }} onSchedule={handleScheduleNext} inspection={selectedInspection} />

   {/* Add Inspection Modal */}
   {showAddModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
     <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
       <h2 className="text-xl font-bold text-gray-900">New Quality Inspection</h2>
       <button
        onClick={() => setShowAddModal(false)}
        className="text-gray-400 hover:text-gray-600"
       >
        ✕
       </button>
      </div>

      <div className="p-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
         <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option>Select Project</option>
          <option>PRJ-2025-001 - Taj Hotels</option>
          <option>PRJ-2025-002 - BigBasket</option>
          <option>PRJ-2025-003 - L&T Campus</option>
         </select>
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Date</label>
         <input
          type="date"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
         />
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Type</label>
         <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option>Pre-Installation</option>
          <option>During Installation</option>
          <option>Post-Installation</option>
          <option>Final Inspection</option>
          <option>Periodic</option>
         </select>
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
         <input
          type="text"
          placeholder="e.g., Equipment Installation"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
         />
        </div>
        <div className="md:col-span-2">
         <label className="block text-sm font-medium text-gray-700 mb-1">Work Package</label>
         <input
          type="text"
          placeholder="e.g., WP-001 - Cooking Equipment"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
         />
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name</label>
         <input
          type="text"
          placeholder="QC engineer name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
         />
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Inspector ID</label>
         <input
          type="text"
          placeholder="e.g., EMP-QC-001"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
         />
        </div>
       </div>

       <div className="flex justify-end space-x-3 mt-6">
        <button
         onClick={() => setShowAddModal(false)}
         className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
         Cancel
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
         Create Inspection
        </button>
       </div>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
