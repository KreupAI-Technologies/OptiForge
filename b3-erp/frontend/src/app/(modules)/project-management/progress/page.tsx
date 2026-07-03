'use client';

import React, { useState } from 'react';
import { exportToCsv } from '@/lib/export';
import {
 Calendar,
 Plus,
 Save,
 Users,
 Package,
 Clock,
 Camera,
 FileText,
 CheckCircle,
 AlertCircle,
 TrendingUp,
 BarChart,
 Target,
 Filter,
 Download,
 Share2,
 Eye,
 Image,
 Edit3,
} from 'lucide-react';
import {
 UpdateProgressModal,
 AddMilestoneProgressModal,
 LogActivityModal,
 ViewProgressReportModal,
 CompareProgressModal,
 SetKPIsModal,
 FilterProgressModal,
 ExportProgressModal,
 AddPhotoModal,
 ViewTimelineModal,
 ShareProgressModal,
 ViewDetailsModal,
} from '@/components/project-management/ProgressModals';

interface ProgressEntry {
 id: string;
 date: string;
 workPackage: string;
 activity: string;
 plannedWork: string;
 actualWork: string;
 completionPercent: number;
 laborDeployed: number;
 hoursWorked: number;
 materialUsed: string;
 equipmentUsed: string;
 issues: string;
 photos: number;
 weather: string;
 safetyIncidents: number;
 reportedBy: string;
 status: 'Draft' | 'Submitted' | 'Approved';
}

const mockProgressEntries: ProgressEntry[] = [
 {
  id: '1',
  date: '2024-03-14',
  workPackage: 'Equipment Installation',
  activity: 'Cooking Equipment Installation',
  plannedWork: 'Install 2 gas ranges and 1 convection oven',
  actualWork: 'Installed 2 gas ranges, convection oven delayed due to late delivery',
  completionPercent: 70,
  laborDeployed: 6,
  hoursWorked: 48,
  materialUsed: 'Gas ranges (2), connecting pipes, fittings',
  equipmentUsed: 'Forklift, power tools, welding equipment',
  issues: 'Convection oven delivery delayed by 1 day',
  photos: 5,
  weather: 'Clear',
  safetyIncidents: 0,
  reportedBy: 'Suresh Patel',
  status: 'Approved',
 },
 {
  id: '2',
  date: '2024-03-13',
  workPackage: 'Equipment Installation',
  activity: 'Refrigeration Units Setup',
  plannedWork: 'Install walk-in cooler panels',
  actualWork: 'Completed panel installation, started refrigeration unit mounting',
  completionPercent: 60,
  laborDeployed: 4,
  hoursWorked: 32,
  materialUsed: 'Cooler panels (20), insulation, door frame',
  equipmentUsed: 'Scaffolding, power drill, level',
  issues: 'None',
  photos: 3,
  weather: 'Clear',
  safetyIncidents: 0,
  reportedBy: 'Installation Team B',
  status: 'Approved',
 },
 {
  id: '3',
  date: '2024-03-12',
  workPackage: 'Equipment Installation',
  activity: 'Exhaust System Installation',
  plannedWork: 'Mount exhaust hood #1 and ductwork',
  actualWork: 'Hood mounted, ductwork 50% complete',
  completionPercent: 50,
  laborDeployed: 5,
  hoursWorked: 40,
  materialUsed: 'Exhaust hood, duct pipes, hangers, fasteners',
  equipmentUsed: 'Cherry picker, cutting tools, welding machine',
  issues: 'Ceiling height mismatch, required design adjustment',
  photos: 4,
  weather: 'Clear',
  safetyIncidents: 0,
  reportedBy: 'HVAC Team',
  status: 'Submitted',
 },
 {
  id: '4',
  date: '2024-03-11',
  workPackage: 'Civil Work',
  activity: 'Electrical Infrastructure',
  plannedWork: 'Complete main panel installation and wiring',
  actualWork: 'Main panel installed, wiring 80% complete',
  completionPercent: 85,
  laborDeployed: 3,
  hoursWorked: 24,
  materialUsed: 'Electrical panel, cables, conduits, circuit breakers',
  equipmentUsed: 'Voltage tester, cable puller, crimping tools',
  issues: 'None',
  photos: 2,
  weather: 'Clear',
  safetyIncidents: 0,
  reportedBy: 'Electrical Team',
  status: 'Approved',
 },
 {
  id: '5',
  date: '2024-03-10',
  workPackage: 'Civil Work',
  activity: 'Drainage & Plumbing',
  plannedWork: 'Install floor drains and connect to main line',
  actualWork: 'All 8 floor drains installed and tested',
  completionPercent: 100,
  laborDeployed: 4,
  hoursWorked: 32,
  materialUsed: 'Floor drains, PVC pipes, cement, sealant',
  equipmentUsed: 'Jackhammer, pipe cutter, testing equipment',
  issues: 'None',
  photos: 6,
  weather: 'Clear',
  safetyIncidents: 0,
  reportedBy: 'Plumbing Team',
  status: 'Approved',
 },
];

export default function DailyProgressPage() {
 const [entries] = useState<ProgressEntry[]>(mockProgressEntries);
 const [showAddModal, setShowAddModal] = useState(false);
 const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
 const [newEntry, setNewEntry] = useState({
  workPackage: '',
  activity: '',
  plannedWork: '',
  actualWork: '',
  completionPercent: 0,
  laborDeployed: 0,
  hoursWorked: 0,
  materialUsed: '',
  equipmentUsed: '',
  issues: '',
  weather: 'Clear',
  safetyIncidents: 0,
 });

 // Modal states
 const [showUpdateModal, setShowUpdateModal] = useState(false);
 const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
 const [showLogActivityModal, setShowLogActivityModal] = useState(false);
 const [showViewReportModal, setShowViewReportModal] = useState(false);
 const [showCompareModal, setShowCompareModal] = useState(false);
 const [showSetKPIsModal, setShowSetKPIsModal] = useState(false);
 const [showFilterModal, setShowFilterModal] = useState(false);
 const [showExportModal, setShowExportModal] = useState(false);
 const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
 const [showTimelineModal, setShowTimelineModal] = useState(false);
 const [showShareModal, setShowShareModal] = useState(false);
 const [showDetailsModal, setShowDetailsModal] = useState(false);
 const [selectedEntry, setSelectedEntry] = useState<ProgressEntry | null>(null);

 // Calculate statistics
 const todayEntries = entries.filter(e => e.date === new Date().toISOString().split('T')[0]);
 const stats = {
  totalEntries: entries.length,
  todayEntries: todayEntries.length,
  avgCompletion: Math.round(entries.reduce((sum, e) => sum + e.completionPercent, 0) / entries.length),
  totalLabor: entries.reduce((sum, e) => sum + e.laborDeployed, 0),
  totalHours: entries.reduce((sum, e) => sum + e.hoursWorked, 0),
  safetyIncidents: entries.reduce((sum, e) => sum + e.safetyIncidents, 0),
 };

 const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
   day: '2-digit',
   month: 'short',
   year: 'numeric',
  });
 };

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'Approved': return 'bg-green-100 text-green-700';
   case 'Submitted': return 'bg-blue-100 text-blue-700';
   case 'Draft': return 'bg-gray-100 text-gray-700';
   default: return 'bg-gray-100 text-gray-700';
  }
 };

 // Modal handlers
 const handleUpdateProgress = (data: any) => {
  console.log('Update progress:', data);
  setShowUpdateModal(false);
 };

 const handleAddMilestone = (data: any) => {
  console.log('Add milestone:', data);
  setShowAddMilestoneModal(false);
 };

 const handleLogActivity = (data: any) => {
  console.log('Log activity:', data);
  setShowLogActivityModal(false);
 };

 const handleViewReport = () => {
  console.log('View report');
 };

 const handleCompareProgress = () => {
  console.log('Compare progress');
 };

 const handleSetKPIs = (data: any) => {
  console.log('Set KPIs:', data);
  setShowSetKPIsModal(false);
 };

 const handleFilterProgress = (data: any) => {
  console.log('Filter progress:', data);
  setShowFilterModal(false);
 };

 const handleExportProgress = (data: any) => {
  exportToCsv('progress-entries', entries as unknown as Record<string, unknown>[]);
  setShowExportModal(false);
 };

 const handleAddPhoto = () => {
  console.log('Add photo for entry:', selectedEntry?.id);
  setShowAddPhotoModal(false);
 };

 const handleViewTimeline = () => {
  console.log('View timeline');
 };

 const handleShareProgress = (data: any) => {
  console.log('Share progress:', data);
  setShowShareModal(false);
 };

 const handleViewDetails = () => {
  console.log('View details for entry:', selectedEntry?.id);
 };

 // Helper functions to open modals with context
 const openUpdateModal = (entry: ProgressEntry) => {
  setSelectedEntry(entry);
  setShowUpdateModal(true);
 };

 const openDetailsModal = (entry: ProgressEntry) => {
  setSelectedEntry(entry);
  setShowDetailsModal(true);
 };

 const openAddPhotoModal = (entry: ProgressEntry) => {
  setSelectedEntry(entry);
  setShowAddPhotoModal(true);
 };

 const openShareModal = (entry: ProgressEntry) => {
  setSelectedEntry(entry);
  setShowShareModal(true);
 };

 return (
  <div className="w-full h-screen overflow-y-auto overflow-x-hidden">
   <div className="px-3 py-2 space-y-3">
    {/* Enhanced Header Section */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-3 mb-3">
     <div className="flex items-center justify-between mb-2">
      <div>
       <h1 className="text-2xl font-bold text-white mb-1">Daily Progress Tracking</h1>
       <p className="text-blue-100">Monitor and manage daily project progress with comprehensive tracking</p>
      </div>
     </div>

     {/* Action Buttons */}
     <div className="flex flex-wrap gap-2">
      <button
       onClick={() => setShowAddModal(true)}
       className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
      >
       <Plus className="w-4 h-4" />
       <span className="text-sm font-medium">Add Entry</span>
      </button>
      <button
       onClick={() => setShowAddMilestoneModal(true)}
       className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
      >
       <Target className="w-4 h-4" />
       <span className="text-sm font-medium">Add Milestone</span>
      </button>
      <button
       onClick={() => setShowLogActivityModal(true)}
       className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
      >
       <Edit3 className="w-4 h-4" />
       <span className="text-sm font-medium">Log Activity</span>
      </button>
      <button
       onClick={() => setShowViewReportModal(true)}
       className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
      >
       <FileText className="w-4 h-4" />
       <span className="text-sm font-medium">View Report</span>
      </button>
      <button
       onClick={() => setShowCompareModal(true)}
       className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
      >
       <BarChart className="w-4 h-4" />
       <span className="text-sm font-medium">Compare</span>
      </button>
      <button
       onClick={() => setShowSetKPIsModal(true)}
       className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
      >
       <Target className="w-4 h-4" />
       <span className="text-sm font-medium">Set KPIs</span>
      </button>
      <button
       onClick={() => setShowFilterModal(true)}
       className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors shadow-sm"
      >
       <Filter className="w-4 h-4" />
       <span className="text-sm font-medium">Filter</span>
      </button>
      <button
       onClick={() => setShowExportModal(true)}
       className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
      >
       <Download className="w-4 h-4" />
       <span className="text-sm font-medium">Export</span>
      </button>
      <button
       onClick={() => setShowTimelineModal(true)}
       className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
      >
       <TrendingUp className="w-4 h-4" />
       <span className="text-sm font-medium">Timeline</span>
      </button>
     </div>
    </div>

    {/* Statistics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600">Total Entries</p>
      <FileText className="w-5 h-5 text-blue-600" />
     </div>
     <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
     <p className="text-xs text-gray-500 mt-1">{stats.todayEntries} today</p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600">Avg Completion</p>
      <CheckCircle className="w-5 h-5 text-green-600" />
     </div>
     <p className="text-2xl font-bold text-green-900">{stats.avgCompletion}%</p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600">Total Labor</p>
      <Users className="w-5 h-5 text-purple-600" />
     </div>
     <p className="text-2xl font-bold text-purple-900">{stats.totalLabor}</p>
     <p className="text-xs text-gray-500 mt-1">person-days</p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600">Total Hours</p>
      <Clock className="w-5 h-5 text-orange-600" />
     </div>
     <p className="text-2xl font-bold text-orange-900">{stats.totalHours}</p>
     <p className="text-xs text-gray-500 mt-1">manhours</p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600">Safety</p>
      <AlertCircle className={`w-5 h-5 ${stats.safetyIncidents === 0 ? 'text-green-600' : 'text-red-600'}`} />
     </div>
     <p className={`text-2xl font-bold ${stats.safetyIncidents === 0 ? 'text-green-900' : 'text-red-900'}`}>
      {stats.safetyIncidents}
     </p>
     <p className="text-xs text-gray-500 mt-1">incidents</p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600">Photos</p>
      <Camera className="w-5 h-5 text-blue-600" />
     </div>
     <p className="text-2xl font-bold text-blue-900">
      {entries.reduce((sum, e) => sum + e.photos, 0)}
     </p>
     <p className="text-xs text-gray-500 mt-1">total photos</p>
    </div>
   </div>

   {/* Date Filter */}
   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
    <div className="flex items-center gap-2">
     <Calendar className="w-5 h-5 text-gray-400" />
     <input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
     />
     <p className="text-sm text-gray-600">
      Showing entries for: <span className="font-medium text-gray-900">{formatDate(selectedDate)}</span>
     </p>
    </div>
   </div>

   {/* Progress Entries */}
   <div className="space-y-2">
    {entries
     .filter(entry => !selectedDate || entry.date === selectedDate)
     .map((entry) => (
      <div key={entry.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
       <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
         <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{entry.activity}</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
           {entry.status}
          </span>
          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
           {entry.workPackage}
          </span>
         </div>
         <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
           <Calendar className="w-4 h-4" />
           {formatDate(entry.date)}
          </div>
          <div className="flex items-center gap-1">
           <Users className="w-4 h-4" />
           {entry.laborDeployed} workers
          </div>
          <div className="flex items-center gap-1">
           <Clock className="w-4 h-4" />
           {entry.hoursWorked} hours
          </div>
          <div className="flex items-center gap-1">
           <Camera className="w-4 h-4" />
           {entry.photos} photos
          </div>
         </div>
        </div>
        <div className="text-right">
         <div className="flex items-center gap-2 justify-end mb-1">
          <div className="w-24 bg-gray-200 rounded-full h-2">
           <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${entry.completionPercent}%` }}
           ></div>
          </div>
          <span className="text-sm font-bold text-blue-900">{entry.completionPercent}%</span>
         </div>
         <p className="text-xs text-gray-500">Progress</p>
        </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
        <div className="bg-blue-50 rounded-lg p-3">
         <p className="text-xs font-medium text-blue-900 mb-2">Planned Work</p>
         <p className="text-sm text-gray-700">{entry.plannedWork}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
         <p className="text-xs font-medium text-green-900 mb-2">Actual Work</p>
         <p className="text-sm text-gray-700">{entry.actualWork}</p>
        </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
        <div>
         <p className="text-xs font-medium text-gray-600 mb-1">Materials Used</p>
         <p className="text-sm text-gray-900">{entry.materialUsed}</p>
        </div>
        <div>
         <p className="text-xs font-medium text-gray-600 mb-1">Equipment Used</p>
         <p className="text-sm text-gray-900">{entry.equipmentUsed}</p>
        </div>
       </div>

       {entry.issues && entry.issues !== 'None' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-2">
         <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
           <p className="text-xs font-medium text-yellow-900 mb-1">Issues Reported</p>
           <p className="text-sm text-yellow-800">{entry.issues}</p>
          </div>
         </div>
        </div>
       )}

       <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3 text-sm mb-2">
         <div>
          <span className="text-gray-600">Weather: </span>
          <span className="font-medium text-gray-900">{entry.weather}</span>
         </div>
         <div>
          <span className="text-gray-600">Safety Incidents: </span>
          <span className={`font-medium ${entry.safetyIncidents === 0 ? 'text-green-900' : 'text-red-900'}`}>
           {entry.safetyIncidents}
          </span>
         </div>
         <div>
          <span className="text-gray-600">Reported by: </span>
          <span className="font-medium text-gray-900">{entry.reportedBy}</span>
         </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
         <button
          onClick={() => openDetailsModal(entry)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
         >
          <Eye className="w-4 h-4" />
          View Details
         </button>
         <button
          onClick={() => openAddPhotoModal(entry)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
         >
          <Camera className="w-4 h-4" />
          View Photos
         </button>
         <button
          onClick={() => openUpdateModal(entry)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
         >
          <Edit3 className="w-4 h-4" />
          Edit
         </button>
         <button
          onClick={() => openAddPhotoModal(entry)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors"
         >
          <Image className="w-4 h-4" />
          Add Photo
         </button>
         <button
          onClick={() => openShareModal(entry)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
         >
          <Share2 className="w-4 h-4" />
          Share
         </button>
        </div>
       </div>
      </div>
     ))}
   </div>

   {/* Add Entry Modal */}
   {showAddModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
     <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
       <h2 className="text-xl font-semibold text-gray-900">Add Daily Progress Entry</h2>
      </div>

      <div className="p-6 space-y-2">
       <div className="grid grid-cols-2 gap-2">
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
         <input
          type="date"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          defaultValue={new Date().toISOString().split('T')[0]}
         />
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Work Package</label>
         <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option>Equipment Installation</option>
          <option>Civil Work</option>
          <option>Testing & Commissioning</option>
         </select>
        </div>
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Activity</label>
        <input
         type="text"
         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         placeholder="e.g., Cooking Equipment Installation"
        />
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Planned Work</label>
        <textarea
         rows={3}
         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         placeholder="What was planned for today..."
        />
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Actual Work Completed</label>
        <textarea
         rows={3}
         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         placeholder="What was actually completed..."
        />
       </div>

       <div className="grid grid-cols-3 gap-2">
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Completion %</label>
         <input
          type="number"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0-100"
          min="0"
          max="100"
         />
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Labor Deployed</label>
         <input
          type="number"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Number of workers"
         />
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Hours Worked</label>
         <input
          type="number"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Total manhours"
         />
        </div>
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Materials Used</label>
        <textarea
         rows={2}
         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         placeholder="List materials consumed..."
        />
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Used</label>
        <textarea
         rows={2}
         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         placeholder="List equipment used..."
        />
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Issues / Challenges</label>
        <textarea
         rows={2}
         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         placeholder="Any issues encountered..."
        />
       </div>

       <div className="grid grid-cols-2 gap-2">
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Weather Conditions</label>
         <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option>Clear</option>
          <option>Cloudy</option>
          <option>Rain</option>
          <option>Heavy Rain</option>
         </select>
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Safety Incidents</label>
         <input
          type="number"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
          min="0"
         />
        </div>
       </div>
      </div>

      <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
       <button
        onClick={() => setShowAddModal(false)}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
       >
        Cancel
       </button>
       <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <Save className="w-5 h-5" />
        Save Entry
       </button>
      </div>
     </div>
    </div>
   )}

   {/* All 12 Progress Modals */}
   <UpdateProgressModal
    isOpen={showUpdateModal}
    onClose={() => setShowUpdateModal(false)}
    onUpdate={handleUpdateProgress}
   />

   <AddMilestoneProgressModal
    isOpen={showAddMilestoneModal}
    onClose={() => setShowAddMilestoneModal(false)}
    onAdd={handleAddMilestone}
   />

   <LogActivityModal
    isOpen={showLogActivityModal}
    onClose={() => setShowLogActivityModal(false)}
    onLog={handleLogActivity}
   />

   <ViewProgressReportModal
    isOpen={showViewReportModal}
    onClose={() => setShowViewReportModal(false)}
   />

   <CompareProgressModal
    isOpen={showCompareModal}
    onClose={() => setShowCompareModal(false)}
   />

   <SetKPIsModal
    isOpen={showSetKPIsModal}
    onClose={() => setShowSetKPIsModal(false)}
    onSet={handleSetKPIs}
   />

   <FilterProgressModal
    isOpen={showFilterModal}
    onClose={() => setShowFilterModal(false)}
    onApply={handleFilterProgress}
   />

   <ExportProgressModal
    isOpen={showExportModal}
    onClose={() => setShowExportModal(false)}
    onExport={handleExportProgress}
   />

   <AddPhotoModal
    isOpen={showAddPhotoModal}
    onClose={() => setShowAddPhotoModal(false)}
    onAdd={handleAddPhoto}
   />

   <ViewTimelineModal
    isOpen={showTimelineModal}
    onClose={() => setShowTimelineModal(false)}
   />

   <ShareProgressModal
    isOpen={showShareModal}
    onClose={() => setShowShareModal(false)}
    onShare={handleShareProgress}
   />

   <ViewDetailsModal
    isOpen={showDetailsModal}
    onClose={() => setShowDetailsModal(false)}
    progress={selectedEntry}
   />
   </div>
  </div>
 );
}
