'use client';

import { useState, useEffect } from 'react';
import { projectManagementService } from '@/services/ProjectManagementService';
import { exportToCsv } from '@/lib/export';
import { MapPin, Camera, Ruler, CheckCircle, AlertTriangle, Clock, Plus, Download, Eye, Edit, FileText, Upload, Image, FileCode, ClipboardList, MessageSquare, TrendingUp, FileSpreadsheet, Filter } from 'lucide-react';
import {
 ScheduleSurveyModal,
 EditSurveyModal,
 UpdateMeasurementsModal,
 UploadPhotosModal,
 AddDrawingsModal,
 RecordSiteConditionsModal,
 AddIssuesModal,
 AddRecommendationsModal,
 UpdateStatusModal,
 GenerateReportModal,
 ExportDataModal,
 ViewFullDetailsModal,
} from '@/components/project-management/SiteSurveyModals';

interface SiteSurvey {
 id: string;
 surveyNumber: string;
 projectId: string;
 projectName: string;
 projectType: string;
 surveyDate: string;
 siteName: string;
 siteAddress: string;
 city: string;
 state: string;
 surveyorName: string;
 surveyorContact: string;
 status: 'Scheduled' | 'In Progress' | 'Completed' | 'On Hold';
 measurements: {
  length: number;
  width: number;
  height: number;
  area: number;
 };
 accessibility: 'Good' | 'Moderate' | 'Difficult';
 powerAvailable: boolean;
 waterAvailable: boolean;
 drainageAvailable: boolean;
 floorLevel: string;
 ceilingType: string;
 wallCondition: string;
 ventilation: string;
 naturalLight: string;
 existingEquipment: string;
 obstacles: string;
 specialRequirements: string;
 photosCount: number;
 drawingsCount: number;
 issues: string[];
 recommendations: string[];
 estimatedBudget: number;
 completionPercent: number;
}

export default function SiteSurveyPage() {
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState<string>('all');
 const [showAddModal, setShowAddModal] = useState(false);
 const [selectedSurvey, setSelectedSurvey] = useState<SiteSurvey | null>(null);
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;

 // Modal states
 const [showScheduleModal, setShowScheduleModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
 const [showPhotosModal, setShowPhotosModal] = useState(false);
 const [showDrawingsModal, setShowDrawingsModal] = useState(false);
 const [showConditionsModal, setShowConditionsModal] = useState(false);
 const [showIssuesModal, setShowIssuesModal] = useState(false);
 const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
 const [showStatusModal, setShowStatusModal] = useState(false);
 const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
 const [showExportModal, setShowExportModal] = useState(false);
 const [showDetailsModal, setShowDetailsModal] = useState(false);

 const [mockSurveys, setMockSurveys] = useState<SiteSurvey[]>([
  {
   id: 'SS-001',
   surveyNumber: 'SURV-2025-001',
   projectId: 'PRJ-2025-001',
   projectName: 'Taj Hotels - Commercial Kitchen Setup',
   projectType: 'Commercial Kitchen',
   surveyDate: '2025-01-10',
   siteName: 'Taj Hotels - Main Kitchen',
   siteAddress: 'Apollo Bunder Road, Colaba',
   city: 'Mumbai',
   state: 'Maharashtra',
   surveyorName: 'Ramesh Kumar',
   surveyorContact: '+91-9876543210',
   status: 'Completed',
   measurements: {
    length: 25.5,
    width: 18.2,
    height: 4.5,
    area: 464.1,
   },
   accessibility: 'Good',
   powerAvailable: true,
   waterAvailable: true,
   drainageAvailable: true,
   floorLevel: 'Ground Floor',
   ceilingType: 'RCC Slab with false ceiling provision',
   wallCondition: 'Good - Plastered and painted',
   ventilation: 'Existing exhaust system - needs upgrade',
   naturalLight: 'Limited - artificial lighting required',
   existingEquipment: 'Old kitchen equipment to be removed',
   obstacles: 'Two load bearing columns in center area',
   specialRequirements: 'Fire suppression system mandatory, Health dept. approval needed',
   photosCount: 45,
   drawingsCount: 8,
   issues: ['Existing drainage insufficient', 'Power capacity needs upgrade to 200KVA', 'Ceiling height limited in one corner'],
   recommendations: ['Install new drainage system', 'Upgrade electrical panel', 'Use low-profile equipment in corner area', 'Add additional exhaust hoods'],
   estimatedBudget: 8500000,
   completionPercent: 100,
  },
  {
   id: 'SS-002',
   surveyNumber: 'SURV-2025-002',
   projectId: 'PRJ-2025-002',
   projectName: 'BigBasket - Cold Room Installation',
   projectType: 'Cold Room',
   surveyDate: '2025-01-12',
   siteName: 'BigBasket Warehouse - Cold Storage',
   siteAddress: 'Electronic City Phase 2',
   city: 'Bangalore',
   state: 'Karnataka',
   surveyorName: 'Suresh Patel',
   surveyorContact: '+91-9876543211',
   status: 'Completed',
   measurements: {
    length: 15.0,
    width: 12.0,
    height: 3.5,
    area: 180.0,
   },
   accessibility: 'Good',
   powerAvailable: true,
   waterAvailable: true,
   drainageAvailable: true,
   floorLevel: 'First Floor',
   ceilingType: 'Metal deck roofing',
   wallCondition: 'New construction - ready for installation',
   ventilation: 'Not required for cold room',
   naturalLight: 'None - insulated space',
   existingEquipment: 'None',
   obstacles: 'Nil',
   specialRequirements: 'Heavy duty flooring for forklift operation, FSSI compliance required',
   photosCount: 32,
   drawingsCount: 6,
   issues: ['Floor load capacity to be verified', 'Backup power arrangement needed'],
   recommendations: ['Install reinforced flooring', 'Setup DG backup with auto changeover', 'Install temperature monitoring system'],
   estimatedBudget: 4200000,
   completionPercent: 100,
  },
  {
   id: 'SS-003',
   surveyNumber: 'SURV-2025-003',
   projectId: 'PRJ-2025-003',
   projectName: 'L&T Campus - Industrial Kitchen',
   projectType: 'Industrial Kitchen',
   surveyDate: '2025-01-14',
   siteName: 'L&T Campus Cafeteria',
   siteAddress: 'Saki Vihar Road, Powai',
   city: 'Mumbai',
   state: 'Maharashtra',
   surveyorName: 'Vijay Sharma',
   surveyorContact: '+91-9876543212',
   status: 'In Progress',
   measurements: {
    length: 30.0,
    width: 20.0,
    height: 5.0,
    area: 600.0,
   },
   accessibility: 'Moderate',
   powerAvailable: true,
   waterAvailable: true,
   drainageAvailable: false,
   floorLevel: 'Ground Floor',
   ceilingType: 'High ceiling with exposed beams',
   wallCondition: 'Requires waterproofing treatment',
   ventilation: 'Nil - complete system needed',
   naturalLight: 'Good - large windows on one side',
   existingEquipment: 'Minimal - to be retained',
   obstacles: 'Service corridor access limited to 3 meters width',
   specialRequirements: 'Capacity for 2000 meals per day, Multiple cuisine zones needed',
   photosCount: 28,
   drawingsCount: 4,
   issues: ['No drainage system', 'Insufficient ventilation', 'Access for large equipment difficult'],
   recommendations: ['Plan phased installation', 'Install complete drainage network', 'Design modular kitchen layout', 'Use smaller equipment that can be assembled on site'],
   estimatedBudget: 12000000,
   completionPercent: 65,
  },
  {
   id: 'SS-004',
   surveyNumber: 'SURV-2025-004',
   projectId: 'PRJ-2025-004',
   projectName: 'ITC Grand - Bakery Equipment Setup',
   projectType: 'Commercial Kitchen',
   surveyDate: '2025-01-15',
   siteName: 'ITC Grand - Bakery Section',
   siteAddress: 'Gachibowli Main Road',
   city: 'Hyderabad',
   state: 'Telangana',
   surveyorName: 'Amit Singh',
   surveyorContact: '+91-9876543213',
   status: 'Completed',
   measurements: {
    length: 12.0,
    width: 10.0,
    height: 3.8,
    area: 120.0,
   },
   accessibility: 'Good',
   powerAvailable: true,
   waterAvailable: true,
   drainageAvailable: true,
   floorLevel: 'Basement',
   ceilingType: 'RCC with waterproofing',
   wallCondition: 'Excellent - tiled walls',
   ventilation: 'Existing but needs enhancement',
   naturalLight: 'None - basement location',
   existingEquipment: 'Old bakery ovens - functional',
   obstacles: 'Low ceiling height in entry passage',
   specialRequirements: 'Temperature controlled environment, Dust-free zone needed',
   photosCount: 38,
   drawingsCount: 5,
   issues: ['Humidity control needed', 'Entry passage height restriction'],
   recommendations: ['Install HVAC with dehumidifier', 'Plan equipment assembly inside', 'Add proper lighting - min 500 lux'],
   estimatedBudget: 3500000,
   completionPercent: 100,
  },
  {
   id: 'SS-005',
   surveyNumber: 'SURV-2025-005',
   projectId: 'PRJ-2025-005',
   projectName: 'Godrej Properties - Modular Kitchen',
   projectType: 'Modular Kitchen',
   surveyDate: '2025-01-16',
   siteName: 'Godrej Elements - Sample Flat',
   siteAddress: 'Hinjewadi Phase 3',
   city: 'Pune',
   state: 'Maharashtra',
   surveyorName: 'Dinesh Kumar',
   surveyorContact: '+91-9876543214',
   status: 'Scheduled',
   measurements: {
    length: 4.5,
    width: 3.2,
    height: 3.0,
    area: 14.4,
   },
   accessibility: 'Good',
   powerAvailable: true,
   waterAvailable: true,
   drainageAvailable: true,
   floorLevel: '12th Floor',
   ceilingType: 'Gypsum false ceiling',
   wallCondition: 'Painted - ready for installation',
   ventilation: 'Window available',
   naturalLight: 'Excellent',
   existingEquipment: 'None',
   obstacles: 'Nil',
   specialRequirements: 'Premium finish, Smart kitchen features required',
   photosCount: 15,
   drawingsCount: 3,
   issues: ['Limited space', 'No provision for chimney outlet'],
   recommendations: ['Use space-saving designs', 'Install recirculation type chimney', 'Maximize vertical storage'],
   estimatedBudget: 450000,
   completionPercent: 0,
  },
  {
   id: 'SS-006',
   surveyNumber: 'SURV-2025-006',
   projectId: 'PRJ-2025-006',
   projectName: 'Siemens - Switchgear Manufacturing Unit',
   projectType: 'Switchgear',
   surveyDate: '2025-01-17',
   siteName: 'Siemens Factory - Assembly Bay',
   siteAddress: 'Kalwa Industrial Area',
   city: 'Thane',
   state: 'Maharashtra',
   surveyorName: 'Prakash Rao',
   surveyorContact: '+91-9876543215',
   status: 'In Progress',
   measurements: {
    length: 40.0,
    width: 25.0,
    height: 8.0,
    area: 1000.0,
   },
   accessibility: 'Good',
   powerAvailable: true,
   waterAvailable: true,
   drainageAvailable: true,
   floorLevel: 'Ground Floor',
   ceilingType: 'Industrial shed - steel structure',
   wallCondition: 'Industrial grade',
   ventilation: 'Adequate industrial ventilation',
   naturalLight: 'Good - skylight roof',
   existingEquipment: 'Assembly benches present',
   obstacles: 'Overhead crane path to be avoided',
   specialRequirements: 'ESD flooring, Clean room conditions, Heavy equipment foundation',
   photosCount: 52,
   drawingsCount: 12,
   issues: ['Vibration isolation needed for testing equipment', 'Dust control required'],
   recommendations: ['Install anti-vibration pads', 'Setup air filtration system', 'Dedicated testing chamber'],
   estimatedBudget: 15000000,
   completionPercent: 45,
  },
  {
   id: 'SS-007',
   surveyNumber: 'SURV-2025-007',
   projectId: 'PRJ-2025-007',
   projectName: 'Reliance Retail - Cold Storage',
   projectType: 'Cold Room',
   surveyDate: '2025-01-18',
   siteName: 'Reliance Retail Hub',
   siteAddress: 'Gota Ahmedabad',
   city: 'Ahmedabad',
   state: 'Gujarat',
   surveyorName: 'Ravi Shankar',
   surveyorContact: '+91-9876543216',
   status: 'Scheduled',
   measurements: {
    length: 20.0,
    width: 15.0,
    height: 4.0,
    area: 300.0,
   },
   accessibility: 'Moderate',
   powerAvailable: true,
   waterAvailable: true,
   drainageAvailable: true,
   floorLevel: 'Ground Floor',
   ceilingType: 'Pre-engineered building',
   wallCondition: 'New construction',
   ventilation: 'Not applicable',
   naturalLight: 'None - insulated structure',
   existingEquipment: 'None',
   obstacles: 'Site leveling pending',
   specialRequirements: 'Multi-temperature zones, Heavy duty racking system',
   photosCount: 0,
   drawingsCount: 0,
   issues: ['Site preparation incomplete', 'Power connection pending'],
   recommendations: ['Complete civil work first', 'Install transformer for dedicated power', 'Plan for future expansion'],
   estimatedBudget: 7500000,
   completionPercent: 0,
  },
  {
   id: 'SS-008',
   surveyNumber: 'SURV-2025-008',
   projectId: 'PRJ-2025-008',
   projectName: 'Marriott Hotel - Kitchen Renovation',
   projectType: 'Commercial Kitchen',
   surveyDate: '2025-01-19',
   siteName: 'Marriott Convention Center Kitchen',
   siteAddress: 'Seaport Airport Road',
   city: 'Kochi',
   state: 'Kerala',
   surveyorName: 'Venkat Rao',
   surveyorContact: '+91-9876543217',
   status: 'Scheduled',
   measurements: {
    length: 22.0,
    width: 16.0,
    height: 4.2,
    area: 352.0,
   },
   accessibility: 'Difficult',
   powerAvailable: true,
   waterAvailable: true,
   drainageAvailable: true,
   floorLevel: 'Second Floor',
   ceilingType: 'Acoustic ceiling tiles',
   wallCondition: 'Requires renovation',
   ventilation: 'Old system - complete replacement needed',
   naturalLight: 'Limited',
   existingEquipment: 'Extensive - to be removed',
   obstacles: 'Ongoing hotel operations - phased work required',
   specialRequirements: 'Zero downtime during peak hours, Noise control mandatory',
   photosCount: 0,
   drawingsCount: 0,
   issues: ['Work during operational hours', 'Material movement through service lift only', 'Coordination with hotel operations'],
   recommendations: ['Night shift work plan', 'Pre-fabricate maximum components off-site', 'Detailed project staging plan'],
   estimatedBudget: 9500000,
   completionPercent: 0,
  },
 ]);

 useEffect(() => {
  projectManagementService.listPmSiteSurveys()
   .then((rows) => { if (Array.isArray(rows) && rows.length > 0) setMockSurveys(rows as unknown as SiteSurvey[]); })
   .catch(() => { /* keep seed data on error */ });
 }, []);

 const stats = {
  totalSurveys: mockSurveys.length,
  completed: mockSurveys.filter(s => s.status === 'Completed').length,
  inProgress: mockSurveys.filter(s => s.status === 'In Progress').length,
  scheduled: mockSurveys.filter(s => s.status === 'Scheduled').length,
  totalPhotos: mockSurveys.reduce((sum, s) => sum + s.photosCount, 0),
  avgCompletion: (mockSurveys.reduce((sum, s) => sum + s.completionPercent, 0) / mockSurveys.length).toFixed(0),
 };

 const filteredSurveys = mockSurveys.filter((survey) => {
  const matchesSearch =
   survey.surveyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
   survey.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
   survey.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
   survey.city.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesStatus = filterStatus === 'all' || survey.status === filterStatus;
  return matchesSearch && matchesStatus;
 });

 const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const paginatedSurveys = filteredSurveys.slice(startIndex, startIndex + itemsPerPage);

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'Completed':
    return 'bg-green-100 text-green-800';
   case 'In Progress':
    return 'bg-blue-100 text-blue-800';
   case 'Scheduled':
    return 'bg-yellow-100 text-yellow-800';
   case 'On Hold':
    return 'bg-red-100 text-red-800';
   default:
    return 'bg-gray-100 text-gray-800';
  }
 };

 const getAccessibilityColor = (accessibility: string) => {
  switch (accessibility) {
   case 'Good':
    return 'text-green-600';
   case 'Moderate':
    return 'text-yellow-600';
   case 'Difficult':
    return 'text-red-600';
   default:
    return 'text-gray-600';
  }
 };

 // Handler functions
 const handleScheduleSurvey = (data: any) => {
  console.log('Schedule Survey:', data);
  setShowScheduleModal(false);
 };

 const handleEditSurvey = (data: any) => {
  console.log('Edit Survey:', data);
  setShowEditModal(false);
  setSelectedSurvey(null);
 };

 const handleUpdateMeasurements = (data: any) => {
  console.log('Update Measurements:', data);
  setShowMeasurementsModal(false);
  setSelectedSurvey(null);
 };

 const handleUploadPhotos = (data: any) => {
  console.log('Upload Photos:', data);
  setShowPhotosModal(false);
  setSelectedSurvey(null);
 };

 const handleAddDrawings = (data: any) => {
  console.log('Add Drawings:', data);
  setShowDrawingsModal(false);
  setSelectedSurvey(null);
 };

 const handleRecordConditions = (data: any) => {
  console.log('Record Site Conditions:', data);
  setShowConditionsModal(false);
  setSelectedSurvey(null);
 };

 const handleAddIssue = (data: any) => {
  console.log('Add Issue:', data);
  setShowIssuesModal(false);
  setSelectedSurvey(null);
 };

 const handleAddRecommendation = (data: any) => {
  console.log('Add Recommendation:', data);
  setShowRecommendationsModal(false);
  setSelectedSurvey(null);
 };

 const handleUpdateStatus = (data: any) => {
  console.log('Update Status:', data);
  setShowStatusModal(false);
  setSelectedSurvey(null);
 };

 const handleGenerateReport = (data: any) => {
  console.log('Generate Report:', data);
  setShowGenerateReportModal(false);
  setSelectedSurvey(null);
 };

 const handleExportData = (data: any) => {
  exportToCsv('site-survey', filteredSurveys as unknown as Record<string, unknown>[]);
  setShowExportModal(false);
 };

 // Helper functions to open modals with selected survey
 const openEditModal = (survey: SiteSurvey) => {
  setSelectedSurvey(survey);
  setShowEditModal(true);
 };

 const openMeasurementsModal = (survey: SiteSurvey) => {
  setSelectedSurvey(survey);
  setShowMeasurementsModal(true);
 };

 const openPhotosModal = (survey: SiteSurvey) => {
  setSelectedSurvey(survey);
  setShowPhotosModal(true);
 };

 const openDrawingsModal = (survey: SiteSurvey) => {
  setSelectedSurvey(survey);
  setShowDrawingsModal(true);
 };

 const openConditionsModal = (survey: SiteSurvey) => {
  setSelectedSurvey(survey);
  setShowConditionsModal(true);
 };

 const openIssuesModal = (survey: SiteSurvey) => {
  setSelectedSurvey(survey);
  setShowIssuesModal(true);
 };

 const openRecommendationsModal = (survey: SiteSurvey) => {
  setSelectedSurvey(survey);
  setShowRecommendationsModal(true);
 };

 const openStatusModal = (survey: SiteSurvey) => {
  setSelectedSurvey(survey);
  setShowStatusModal(true);
 };

 const openGenerateReportModal = (survey: SiteSurvey) => {
  setSelectedSurvey(survey);
  setShowGenerateReportModal(true);
 };

 const openDetailsModal = (survey: SiteSurvey) => {
  setSelectedSurvey(survey);
  setShowDetailsModal(true);
 };

 return (
  <div className="p-6 space-y-3">
   {/* Header */}
   <div className="flex justify-between items-start">
    <div>
     <h1 className="text-3xl font-bold text-gray-900">Site Survey & Preparation</h1>
     <p className="text-gray-600 mt-1">Pre-installation site assessment and planning</p>
    </div>
    <div className="flex items-center space-x-3">
     <button
      onClick={() => setShowGenerateReportModal(true)}
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
      <span>Export Data</span>
     </button>
     <button
      onClick={() => setShowScheduleModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
     >
      <Plus className="h-5 w-5" />
      <span>Schedule Survey</span>
     </button>
    </div>
   </div>

   {/* Statistics Cards */}
   <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Total Surveys</p>
       <p className="text-2xl font-bold text-gray-900">{stats.totalSurveys}</p>
      </div>
      <MapPin className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Completed</p>
       <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
      </div>
      <CheckCircle className="h-8 w-8 text-green-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">In Progress</p>
       <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
      </div>
      <Clock className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Scheduled</p>
       <p className="text-2xl font-bold text-yellow-600">{stats.scheduled}</p>
      </div>
      <Clock className="h-8 w-8 text-yellow-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Total Photos</p>
       <p className="text-2xl font-bold text-purple-600">{stats.totalPhotos}</p>
      </div>
      <Camera className="h-8 w-8 text-purple-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Avg Progress</p>
       <p className="text-2xl font-bold text-indigo-600">{stats.avgCompletion}%</p>
      </div>
      <Ruler className="h-8 w-8 text-indigo-600" />
     </div>
    </div>
   </div>

   {/* Filters */}
   <div className="bg-white p-3 rounded-lg border border-gray-200">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
     <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
      <input
       type="text"
       placeholder="Search by survey number, project, site, city..."
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
       <option value="Completed">Completed</option>
       <option value="In Progress">In Progress</option>
       <option value="Scheduled">Scheduled</option>
       <option value="On Hold">On Hold</option>
      </select>
     </div>
    </div>
   </div>

   {/* Survey Cards Grid */}
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    {paginatedSurveys.map((survey) => (
     <div key={survey.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-2">
       <div>
        <div className="flex items-center space-x-2">
         <h3 className="text-lg font-bold text-gray-900">{survey.surveyNumber}</h3>
         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
          {survey.status}
         </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{survey.projectId} - {survey.projectType}</p>
       </div>
       <button
        onClick={() => openDetailsModal(survey)}
        className="text-blue-600 hover:text-blue-800"
       >
        <Eye className="h-5 w-5" />
       </button>
      </div>

      {/* Project Info */}
      <div className="mb-2">
       <p className="font-medium text-gray-900">{survey.projectName}</p>
       <p className="text-sm text-gray-600">{survey.siteName}</p>
       <p className="text-xs text-gray-500">{survey.siteAddress}, {survey.city}, {survey.state}</p>
      </div>

      {/* Measurements */}
      <div className="grid grid-cols-4 gap-2 mb-2 bg-gray-50 p-3 rounded-lg">
       <div>
        <p className="text-xs text-gray-500">Length</p>
        <p className="text-sm font-semibold text-gray-900">{survey.measurements.length}m</p>
       </div>
       <div>
        <p className="text-xs text-gray-500">Width</p>
        <p className="text-sm font-semibold text-gray-900">{survey.measurements.width}m</p>
       </div>
       <div>
        <p className="text-xs text-gray-500">Height</p>
        <p className="text-sm font-semibold text-gray-900">{survey.measurements.height}m</p>
       </div>
       <div>
        <p className="text-xs text-gray-500">Area</p>
        <p className="text-sm font-semibold text-gray-900">{survey.measurements.area} m²</p>
       </div>
      </div>

      {/* Site Details */}
      <div className="grid grid-cols-2 gap-3 mb-2 text-sm">
       <div className="flex items-center space-x-2">
        <span className="text-gray-600">Accessibility:</span>
        <span className={`font-medium ${getAccessibilityColor(survey.accessibility)}`}>
         {survey.accessibility}
        </span>
       </div>
       <div className="flex items-center space-x-2">
        <span className="text-gray-600">Floor:</span>
        <span className="font-medium text-gray-900">{survey.floorLevel}</span>
       </div>
       <div className="flex items-center space-x-2">
        <CheckCircle className={`h-4 w-4 ${survey.powerAvailable ? 'text-green-600' : 'text-gray-300'}`} />
        <span className="text-gray-600">Power</span>
       </div>
       <div className="flex items-center space-x-2">
        <CheckCircle className={`h-4 w-4 ${survey.waterAvailable ? 'text-green-600' : 'text-gray-300'}`} />
        <span className="text-gray-600">Water</span>
       </div>
       <div className="flex items-center space-x-2">
        <CheckCircle className={`h-4 w-4 ${survey.drainageAvailable ? 'text-green-600' : 'text-gray-300'}`} />
        <span className="text-gray-600">Drainage</span>
       </div>
       <div className="flex items-center space-x-2">
        <Camera className="h-4 w-4 text-blue-600" />
        <span className="text-gray-600">{survey.photosCount} Photos</span>
       </div>
      </div>

      {/* Issues */}
      {survey.issues.length > 0 && (
       <div className="mb-2">
        <div className="flex items-center space-x-2 mb-2">
         <AlertTriangle className="h-4 w-4 text-yellow-600" />
         <span className="text-sm font-medium text-gray-700">{survey.issues.length} Issues Identified</span>
        </div>
        <ul className="space-y-1">
         {survey.issues.slice(0, 2).map((issue, index) => (
          <li key={index} className="text-xs text-gray-600 ml-6">• {issue}</li>
         ))}
         {survey.issues.length > 2 && (
          <li className="text-xs text-blue-600 ml-6">+ {survey.issues.length - 2} more...</li>
         )}
        </ul>
       </div>
      )}

      {/* Action Buttons */}
      <div className="mb-2 pb-4 border-b border-gray-200">
       <p className="text-sm font-medium text-gray-700 mb-3">Quick Actions</p>
       <div className="grid grid-cols-4 gap-2">
        <button
         onClick={() => openEditModal(survey)}
         className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs"
        >
         <Edit className="h-3.5 w-3.5" />
         <span>Edit</span>
        </button>
        <button
         onClick={() => openMeasurementsModal(survey)}
         className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-xs"
        >
         <Ruler className="h-3.5 w-3.5" />
         <span>Measures</span>
        </button>
        <button
         onClick={() => openPhotosModal(survey)}
         className="flex items-center justify-center space-x-1 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-xs"
        >
         <Image className="h-3.5 w-3.5" />
         <span>Photos</span>
        </button>
        <button
         onClick={() => openDrawingsModal(survey)}
         className="flex items-center justify-center space-x-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-xs"
        >
         <FileCode className="h-3.5 w-3.5" />
         <span>Drawings</span>
        </button>
        <button
         onClick={() => openConditionsModal(survey)}
         className="flex items-center justify-center space-x-1 px-3 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 text-xs"
        >
         <ClipboardList className="h-3.5 w-3.5" />
         <span>Conditions</span>
        </button>
        <button
         onClick={() => openIssuesModal(survey)}
         className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-xs"
        >
         <AlertTriangle className="h-3.5 w-3.5" />
         <span>Issues</span>
        </button>
        <button
         onClick={() => openRecommendationsModal(survey)}
         className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs"
        >
         <MessageSquare className="h-3.5 w-3.5" />
         <span>Suggest</span>
        </button>
        <button
         onClick={() => openStatusModal(survey)}
         className="flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 text-xs"
        >
         <TrendingUp className="h-3.5 w-3.5" />
         <span>Status</span>
        </button>
        <button
         onClick={() => openGenerateReportModal(survey)}
         className="flex items-center justify-center space-x-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-xs"
        >
         <FileText className="h-3.5 w-3.5" />
         <span>Report</span>
        </button>
        <button
         onClick={() => openDetailsModal(survey)}
         className="flex items-center justify-center space-x-1 px-3 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 text-xs"
        >
         <Eye className="h-3.5 w-3.5" />
         <span>Details</span>
        </button>
       </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
       <div className="text-sm">
        <p className="text-gray-600">Surveyor: <span className="font-medium text-gray-900">{survey.surveyorName}</span></p>
        <p className="text-xs text-gray-500">{survey.surveyDate}</p>
       </div>
       <div className="text-right">
        <p className="text-sm text-gray-600">Est. Budget</p>
        <p className="font-bold text-gray-900">₹{(survey.estimatedBudget / 100000).toFixed(2)}L</p>
       </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
       <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600">Survey Progress</span>
        <span className="text-xs font-semibold text-gray-900">{survey.completionPercent}%</span>
       </div>
       <div className="w-full bg-gray-200 rounded-full h-2">
        <div
         className="bg-blue-600 h-2 rounded-full"
         style={{ width: `${survey.completionPercent}%` }}
        ></div>
       </div>
      </div>
     </div>
    ))}
   </div>

   {/* Pagination */}
   <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
    <div className="flex items-center justify-between">
     <div className="text-sm text-gray-700">
      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
      <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredSurveys.length)}</span> of{' '}
      <span className="font-medium">{filteredSurveys.length}</span> surveys
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

   {/* All Modals */}
   <ScheduleSurveyModal
    isOpen={showScheduleModal}
    onClose={() => setShowScheduleModal(false)}
    onSchedule={handleScheduleSurvey}
   />

   <EditSurveyModal
    isOpen={showEditModal}
    onClose={() => {
     setShowEditModal(false);
     setSelectedSurvey(null);
    }}
    onEdit={handleEditSurvey}
    survey={selectedSurvey}
   />

   <UpdateMeasurementsModal
    isOpen={showMeasurementsModal}
    onClose={() => {
     setShowMeasurementsModal(false);
     setSelectedSurvey(null);
    }}
    onUpdate={handleUpdateMeasurements}
    survey={selectedSurvey}
   />

   <UploadPhotosModal
    isOpen={showPhotosModal}
    onClose={() => {
     setShowPhotosModal(false);
     setSelectedSurvey(null);
    }}
    onUpload={handleUploadPhotos}
    survey={selectedSurvey}
   />

   <AddDrawingsModal
    isOpen={showDrawingsModal}
    onClose={() => {
     setShowDrawingsModal(false);
     setSelectedSurvey(null);
    }}
    onAdd={handleAddDrawings}
    survey={selectedSurvey}
   />

   <RecordSiteConditionsModal
    isOpen={showConditionsModal}
    onClose={() => {
     setShowConditionsModal(false);
     setSelectedSurvey(null);
    }}
    onRecord={handleRecordConditions}
    survey={selectedSurvey}
   />

   <AddIssuesModal
    isOpen={showIssuesModal}
    onClose={() => {
     setShowIssuesModal(false);
     setSelectedSurvey(null);
    }}
    onAdd={handleAddIssue}
    survey={selectedSurvey}
   />

   <AddRecommendationsModal
    isOpen={showRecommendationsModal}
    onClose={() => {
     setShowRecommendationsModal(false);
     setSelectedSurvey(null);
    }}
    onAdd={handleAddRecommendation}
    survey={selectedSurvey}
   />

   <UpdateStatusModal
    isOpen={showStatusModal}
    onClose={() => {
     setShowStatusModal(false);
     setSelectedSurvey(null);
    }}
    onUpdate={handleUpdateStatus}
    survey={selectedSurvey}
   />

   <GenerateReportModal
    isOpen={showGenerateReportModal}
    onClose={() => {
     setShowGenerateReportModal(false);
     setSelectedSurvey(null);
    }}
    onGenerate={handleGenerateReport}
   />

   <ExportDataModal
    isOpen={showExportModal}
    onClose={() => setShowExportModal(false)}
    onExport={handleExportData}
   />

   <ViewFullDetailsModal
    isOpen={showDetailsModal}
    onClose={() => {
     setShowDetailsModal(false);
     setSelectedSurvey(null);
    }}
    survey={selectedSurvey}
   />
  </div>
 );
}
