'use client';

import { useState, useEffect } from 'react';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
 Settings,
 Workflow,
 Bell,
 Shield,
 DollarSign,
 Calendar,
 FileText,
 Users,
 CheckCircle,
 AlertCircle,
 Save,
 RefreshCw,
 Lock,
 Database,
 Cloud,
 Code,
 Upload,
 Download,
 Sliders,
 Mail,
} from 'lucide-react';
import {
 GeneralSettingsModal,
 NotificationSettingsModal,
 AccessControlModal,
 IntegrationSettingsModal,
 WorkflowSettingsModal,
 CustomFieldsModal,
 EmailTemplatesModal,
 ReportSettingsModal,
 BudgetSettingsModal,
 SecuritySettingsModal,
 BackupSettingsModal,
 APISettingsModal,
 AdvancedSettingsModal,
 ImportExportModal,
 ResetSettingsModal,
} from '@/components/project-management/SettingsModals';

export default function ProjectSettingsPage() {
 const [activeTab, setActiveTab] = useState<'general' | 'workflow' | 'notifications' | 'approvals' | 'integrations'>('general');
 const [hasChanges, setHasChanges] = useState(false);

 // General Settings State
 const [defaultCurrency, setDefaultCurrency] = useState('INR');
 const [fiscalYearStart, setFiscalYearStart] = useState('04-01');
 const [defaultProjectPrefix, setDefaultProjectPrefix] = useState('PRJ');
 const [autoNumbering, setAutoNumbering] = useState(true);
 const [documentRetention, setDocumentRetention] = useState('7');

 // Workflow Settings
 const [projectApprovalRequired, setProjectApprovalRequired] = useState(true);
 const [milestoneApprovalRequired, setMilestoneApprovalRequired] = useState(true);
 const [budgetApprovalThreshold, setBudgetApprovalThreshold] = useState('5000000');
 const [changeOrderApprovalLevels, setChangeOrderApprovalLevels] = useState('2');
 const [documentApprovalRequired, setDocumentApprovalRequired] = useState(true);

 // Notification Settings
 const [projectStartNotification, setProjectStartNotification] = useState(true);
 const [milestoneCompleteNotification, setMilestoneCompleteNotification] = useState(true);
 const [budgetExceededNotification, setBudgetExceededNotification] = useState(true);
 const [scheduleDelayNotification, setScheduleDelayNotification] = useState(true);
 const [emailNotifications, setEmailNotifications] = useState(true);
 const [smsNotifications, setSmsNotifications] = useState(false);

 // Approval Settings
 const [projectManagerApproval, setProjectManagerApproval] = useState(true);
 const [departmentHeadApproval, setDepartmentHeadApproval] = useState(true);
 const [financeApproval, setFinanceApproval] = useState(true);
 const [ceoApprovalThreshold, setCeoApprovalThreshold] = useState('10000000');

 const [isSaving, setIsSaving] = useState(false);

 // Load persisted settings from the backend on mount.
 useEffect(() => {
  let mounted = true;
  const load = async () => {
   try {
    const s = await projectManagementService.getPmSettings();
    if (!s || !mounted) return;
    setDefaultCurrency(s.defaultCurrency ?? 'INR');
    setFiscalYearStart(s.fiscalYearStart ?? '04-01');
    setDefaultProjectPrefix(s.defaultProjectPrefix ?? 'PRJ');
    setAutoNumbering(s.autoNumbering ?? true);
    setDocumentRetention(s.documentRetention ?? '7');
    setProjectApprovalRequired(s.projectApprovalRequired ?? true);
    setMilestoneApprovalRequired(s.milestoneApprovalRequired ?? true);
    setBudgetApprovalThreshold(s.budgetApprovalThreshold ?? '5000000');
    setChangeOrderApprovalLevels(s.changeOrderApprovalLevels ?? '2');
    setDocumentApprovalRequired(s.documentApprovalRequired ?? true);
    setProjectStartNotification(s.projectStartNotification ?? true);
    setMilestoneCompleteNotification(s.milestoneCompleteNotification ?? true);
    setBudgetExceededNotification(s.budgetExceededNotification ?? true);
    setScheduleDelayNotification(s.scheduleDelayNotification ?? true);
    setEmailNotifications(s.emailNotifications ?? true);
    setSmsNotifications(s.smsNotifications ?? false);
    setProjectManagerApproval(s.projectManagerApproval ?? true);
    setDepartmentHeadApproval(s.departmentHeadApproval ?? true);
    setFinanceApproval(s.financeApproval ?? true);
    setCeoApprovalThreshold(s.ceoApprovalThreshold ?? '10000000');
   } catch (err) {
    console.error('Error loading project settings:', err);
   }
  };
  load();
  return () => {
   mounted = false;
  };
 }, []);

 // Modal States
 const [showGeneralModal, setShowGeneralModal] = useState(false);
 const [showNotificationModal, setShowNotificationModal] = useState(false);
 const [showAccessModal, setShowAccessModal] = useState(false);
 const [showIntegrationModal, setShowIntegrationModal] = useState(false);
 const [showWorkflowModal, setShowWorkflowModal] = useState(false);
 const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);
 const [showEmailTemplatesModal, setShowEmailTemplatesModal] = useState(false);
 const [showReportSettingsModal, setShowReportSettingsModal] = useState(false);
 const [showBudgetSettingsModal, setShowBudgetSettingsModal] = useState(false);
 const [showSecurityModal, setShowSecurityModal] = useState(false);
 const [showBackupModal, setShowBackupModal] = useState(false);
 const [showAPIModal, setShowAPIModal] = useState(false);
 const [showAdvancedModal, setShowAdvancedModal] = useState(false);
 const [showImportExportModal, setShowImportExportModal] = useState(false);
 const [showResetModal, setShowResetModal] = useState(false);

 const handleSave = async () => {
  setIsSaving(true);
  try {
   const saved = await projectManagementService.savePmSettings({
    defaultCurrency,
    fiscalYearStart,
    defaultProjectPrefix,
    autoNumbering,
    documentRetention,
    projectApprovalRequired,
    milestoneApprovalRequired,
    documentApprovalRequired,
    budgetApprovalThreshold,
    changeOrderApprovalLevels,
    projectStartNotification,
    milestoneCompleteNotification,
    budgetExceededNotification,
    scheduleDelayNotification,
    emailNotifications,
    smsNotifications,
    projectManagerApproval,
    departmentHeadApproval,
    financeApproval,
    ceoApprovalThreshold,
   });
   if (saved) {
    setHasChanges(false);
    alert('Settings saved successfully!');
   } else {
    alert('Failed to save settings. Please try again.');
   }
  } catch (err) {
   console.error('Error saving settings:', err);
   alert('Failed to save settings. Please try again.');
  } finally {
   setIsSaving(false);
  }
 };

 const handleReset = () => {
  // Reset to defaults
  setHasChanges(false);
 };

 // Persist a partial settings payload from a category modal to the backend.
 // PmSettings is stored as a single merged document, so each modal saves its
 // own slice via savePmSettings (partial merge).
 const persistModalSettings = async (settings: any) => {
  try {
   await projectManagementService.savePmSettings(settings);
  } catch (err) {
   console.error('Error saving settings:', err);
  }
 };

 // Modal Handlers
 const handleGeneralSettings = async (settings?: any) => {
  if (settings) {
   await persistModalSettings(settings);
  }
  setShowGeneralModal(false);
 };

 const handleNotificationSettings = async (settings?: any) => {
  if (settings) {
   await persistModalSettings(settings);
  }
  setShowNotificationModal(false);
 };

 const handleAccessControl = async (settings?: any) => {
  if (settings) {
   await persistModalSettings(settings);
  }
  setShowAccessModal(false);
 };

 const handleIntegrationSettings = async (settings?: any) => {
  if (settings) {
   await persistModalSettings(settings);
  }
  setShowIntegrationModal(false);
 };

 const handleWorkflowSettings = async (settings?: any) => {
  if (settings) {
   await persistModalSettings(settings);
  }
  setShowWorkflowModal(false);
 };

 const handleCustomFields = async (settings?: any) => {
  if (settings) {
   await persistModalSettings(settings);
  }
  setShowCustomFieldsModal(false);
 };

 const handleEmailTemplates = async (settings?: any) => {
  if (settings) {
   await persistModalSettings(settings);
  }
  setShowEmailTemplatesModal(false);
 };

 const handleReportSettings = async (settings?: any) => {
  if (settings) {
   await persistModalSettings(settings);
  }
  setShowReportSettingsModal(false);
 };

 const handleBudgetSettings = async (settings?: any) => {
  if (settings) {
   await persistModalSettings(settings);
  }
  setShowBudgetSettingsModal(false);
 };

 const handleSecuritySettings = async (settings?: any) => {
  if (settings) {
   await persistModalSettings(settings);
  }
  setShowSecurityModal(false);
 };

 const handleBackupSettings = async (settings?: any) => {
  if (settings) {
   await persistModalSettings(settings);
  }
  setShowBackupModal(false);
 };

 const handleAPISettings = async (settings?: any) => {
  if (settings) {
   await persistModalSettings(settings);
  }
  setShowAPIModal(false);
 };

 const handleAdvancedSettings = async (settings?: any) => {
  if (settings) {
   await persistModalSettings(settings);
  }
  setShowAdvancedModal(false);
 };

 const handleImportExport = () => {
  setShowImportExportModal(false);
 };

 const handleResetSettings = () => {
  // Reset the in-memory form to defaults; handleReset clears the dirty flag.
  // A dedicated reset endpoint does not exist, so no backend call is made here.
  setShowResetModal(false);
  handleReset();
 };

 return (
  <div className="h-screen flex flex-col overflow-hidden">
   <div className="flex-1 overflow-y-auto overflow-x-hidden">
    <div className="px-3 py-2 max-w-[1400px]">
     {/* Header with Title and Quick Access */}
     <div className="mb-3">
      <div className="flex flex-col gap-2">
       <div className="flex items-center justify-between">
        <div>
         <h1 className="text-2xl font-bold text-gray-900">Project Management Settings</h1>
         <p className="text-sm text-gray-600 mt-1">Configure and customize your project management module</p>
        </div>
        {hasChanges && (
         <div className="flex gap-3">
          <button
           onClick={handleReset}
           className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
           <RefreshCw className="w-4 h-4" />
           Reset
          </button>
          <button
           onClick={handleSave}
           className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
           <Save className="w-4 h-4" />
           Save Changes
          </button>
         </div>
        )}
       </div>

       {/* Quick Access Buttons */}
       <div className="flex flex-wrap gap-2">
        <button
         onClick={() => setShowGeneralModal(true)}
         className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm"
        >
         <Settings className="w-4 h-4" />
         General
        </button>
        <button
         onClick={() => setShowNotificationModal(true)}
         className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm"
        >
         <Bell className="w-4 h-4" />
         Notifications
        </button>
        <button
         onClick={() => setShowAccessModal(true)}
         className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm"
        >
         <Lock className="w-4 h-4" />
         Access Control
        </button>
        <button
         onClick={() => setShowSecurityModal(true)}
         className="flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 text-sm"
        >
         <Shield className="w-4 h-4" />
         Security
        </button>
        <button
         onClick={() => setShowBackupModal(true)}
         className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm"
        >
         <Database className="w-4 h-4" />
         Backup
        </button>
        <button
         onClick={() => setShowAPIModal(true)}
         className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm"
        >
         <Code className="w-4 h-4" />
         API
        </button>
        <button
         onClick={() => setShowImportExportModal(true)}
         className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 text-sm"
        >
         <Upload className="w-4 h-4" />
         Import/Export
        </button>
        <button
         onClick={() => setShowAdvancedModal(true)}
         className="flex items-center gap-2 px-3 py-2 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 text-sm"
        >
         <Sliders className="w-4 h-4" />
         Advanced
        </button>
       </div>
      </div>
     </div>

     {/* Settings Quick Access Menu */}
     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Settings Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
       <button
        onClick={() => setShowGeneralModal(true)}
        className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
          <Settings className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">General</span>
        </div>
       </button>

       <button
        onClick={() => setShowNotificationModal(true)}
        className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
          <Bell className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">Notifications</span>
        </div>
       </button>

       <button
        onClick={() => setShowAccessModal(true)}
        className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
          <Lock className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">Access Control</span>
        </div>
       </button>

       <button
        onClick={() => setShowIntegrationModal(true)}
        className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
          <Cloud className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">Integrations</span>
        </div>
       </button>

       <button
        onClick={() => setShowWorkflowModal(true)}
        className="p-4 border-2 border-teal-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
          <Workflow className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">Workflow</span>
        </div>
       </button>

       <button
        onClick={() => setShowCustomFieldsModal(true)}
        className="p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">Custom Fields</span>
        </div>
       </button>

       <button
        onClick={() => setShowEmailTemplatesModal(true)}
        className="p-4 border-2 border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg flex items-center justify-center">
          <Mail className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">Email Templates</span>
        </div>
       </button>

       <button
        onClick={() => setShowReportSettingsModal(true)}
        className="p-4 border-2 border-emerald-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">Reports</span>
        </div>
       </button>

       <button
        onClick={() => setShowBudgetSettingsModal(true)}
        className="p-4 border-2 border-cyan-200 rounded-lg hover:border-cyan-400 hover:bg-cyan-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-lg flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">Budget</span>
        </div>
       </button>

       <button
        onClick={() => setShowSecurityModal(true)}
        className="p-4 border-2 border-pink-200 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-pink-700 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">Security</span>
        </div>
       </button>

       <button
        onClick={() => setShowBackupModal(true)}
        className="p-4 border-2 border-amber-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center">
          <Database className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">Backup</span>
        </div>
       </button>

       <button
        onClick={() => setShowAPIModal(true)}
        className="p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
          <Code className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">API</span>
        </div>
       </button>

       <button
        onClick={() => setShowAdvancedModal(true)}
        className="p-4 border-2 border-violet-200 rounded-lg hover:border-violet-400 hover:bg-violet-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-violet-700 rounded-lg flex items-center justify-center">
          <Sliders className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">Advanced</span>
        </div>
       </button>

       <button
        onClick={() => setShowImportExportModal(true)}
        className="p-4 border-2 border-rose-200 rounded-lg hover:border-rose-400 hover:bg-rose-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-rose-700 rounded-lg flex items-center justify-center">
          <Upload className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">Import/Export</span>
        </div>
       </button>

       <button
        onClick={() => setShowResetModal(true)}
        className="p-4 border-2 border-slate-200 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-all"
       >
        <div className="flex flex-col items-center gap-2">
         <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-white" />
         </div>
         <span className="text-sm font-medium text-gray-900">Reset</span>
        </div>
       </button>
      </div>
     </div>

     {/* Tabs */}
     <div className="flex border-b border-gray-200 mb-3 overflow-x-auto">
    <button
     onClick={() => setActiveTab('general')}
     className={`px-3 py-2 font-medium whitespace-nowrap ${
      activeTab === 'general'
       ? 'text-cyan-600 border-b-2 border-cyan-600'
       : 'text-gray-600 hover:text-gray-900'
     }`}
    >
     <div className="flex items-center gap-2">
      <Settings className="w-4 h-4" />
      General Settings
     </div>
    </button>
    <button
     onClick={() => setActiveTab('workflow')}
     className={`px-3 py-2 font-medium whitespace-nowrap ${
      activeTab === 'workflow'
       ? 'text-cyan-600 border-b-2 border-cyan-600'
       : 'text-gray-600 hover:text-gray-900'
     }`}
    >
     <div className="flex items-center gap-2">
      <Workflow className="w-4 h-4" />
      Workflow & Approvals
     </div>
    </button>
    <button
     onClick={() => setActiveTab('notifications')}
     className={`px-3 py-2 font-medium whitespace-nowrap ${
      activeTab === 'notifications'
       ? 'text-cyan-600 border-b-2 border-cyan-600'
       : 'text-gray-600 hover:text-gray-900'
     }`}
    >
     <div className="flex items-center gap-2">
      <Bell className="w-4 h-4" />
      Notifications
     </div>
    </button>
    <button
     onClick={() => setActiveTab('approvals')}
     className={`px-3 py-2 font-medium whitespace-nowrap ${
      activeTab === 'approvals'
       ? 'text-cyan-600 border-b-2 border-cyan-600'
       : 'text-gray-600 hover:text-gray-900'
     }`}
    >
     <div className="flex items-center gap-2">
      <Shield className="w-4 h-4" />
      Approval Levels
     </div>
    </button>
    <button
     onClick={() => setActiveTab('integrations')}
     className={`px-3 py-2 font-medium whitespace-nowrap ${
      activeTab === 'integrations'
       ? 'text-cyan-600 border-b-2 border-cyan-600'
       : 'text-gray-600 hover:text-gray-900'
     }`}
    >
     <div className="flex items-center gap-2">
      <Users className="w-4 h-4" />
      Integrations
     </div>
    </button>
   </div>

   {/* General Settings Tab */}
   {activeTab === 'general' && (
    <div className="space-y-3">
     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
       <DollarSign className="w-5 h-5 text-cyan-600" />
       Financial Settings
      </h3>
      <div className="space-y-2">
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
         Default Currency
        </label>
        <select
         value={defaultCurrency}
         onChange={(e) => {
          setDefaultCurrency(e.target.value);
          setHasChanges(true);
         }}
         className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
         <option value="INR">INR - Indian Rupee (₹)</option>
         <option value="USD">USD - US Dollar ($)</option>
         <option value="EUR">EUR - Euro (€)</option>
         <option value="GBP">GBP - British Pound (£)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Currency used for all project budgets and financial calculations</p>
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
         Fiscal Year Start
        </label>
        <input
         type="text"
         value={fiscalYearStart}
         onChange={(e) => {
          setFiscalYearStart(e.target.value);
          setHasChanges(true);
         }}
         placeholder="MM-DD"
         className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Format: MM-DD (e.g., 04-01 for April 1st)</p>
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
         Budget Variance Alert Threshold
        </label>
        <div className="flex items-center gap-2 w-full md:w-1/2">
         <input
          type="number"
          placeholder="10"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
         />
         <span className="text-gray-700">%</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Alert when project budget variance exceeds this percentage</p>
       </div>
      </div>
     </div>

     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
       <FileText className="w-5 h-5 text-cyan-600" />
       Project Numbering
      </h3>
      <div className="space-y-2">
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
         Project ID Prefix
        </label>
        <input
         type="text"
         value={defaultProjectPrefix}
         onChange={(e) => {
          setDefaultProjectPrefix(e.target.value);
          setHasChanges(true);
         }}
         placeholder="PRJ"
         className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Prefix for auto-generated project IDs (e.g., PRJ001, PRJ002)</p>
       </div>

       <div className="flex items-center gap-3">
        <input
         type="checkbox"
         id="autoNumbering"
         checked={autoNumbering}
         onChange={(e) => {
          setAutoNumbering(e.target.checked);
          setHasChanges(true);
         }}
         className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
        />
        <label htmlFor="autoNumbering" className="text-sm text-gray-700">
         Enable auto-numbering for project IDs
        </label>
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
         Next Project Number
        </label>
        <input
         type="number"
         placeholder="001"
         disabled={!autoNumbering}
         className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">Starting number for new projects</p>
       </div>
      </div>
     </div>

     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
       <Calendar className="w-5 h-5 text-cyan-600" />
       Document Management
      </h3>
      <div className="space-y-2">
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
         Document Retention Period
        </label>
        <div className="flex items-center gap-2 w-full md:w-1/2">
         <select
          value={documentRetention}
          onChange={(e) => {
           setDocumentRetention(e.target.value);
           setHasChanges(true);
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
         >
          <option value="3">3 years</option>
          <option value="5">5 years</option>
          <option value="7">7 years</option>
          <option value="10">10 years</option>
          <option value="permanent">Permanent</option>
         </select>
        </div>
        <p className="text-xs text-gray-500 mt-1">How long project documents should be retained after project closure</p>
       </div>

       <div className="flex items-center gap-3">
        <input
         type="checkbox"
         id="versionControl"
         defaultChecked
         className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
        />
        <label htmlFor="versionControl" className="text-sm text-gray-700">
         Enable document version control
        </label>
       </div>

       <div className="flex items-center gap-3">
        <input
         type="checkbox"
         id="autoArchive"
         defaultChecked
         className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
        />
        <label htmlFor="autoArchive" className="text-sm text-gray-700">
         Automatically archive completed projects after 90 days
        </label>
       </div>
      </div>
     </div>

     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
       <h3 className="text-lg font-semibold text-gray-900">Advanced Configuration</h3>
       <button
        onClick={() => setShowGeneralModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
       >
        <Settings className="w-4 h-4" />
        Advanced General Settings
       </button>
      </div>
      <p className="text-sm text-gray-600">
       Configure additional general settings, advanced project defaults, and system-wide preferences.
      </p>
     </div>
    </div>
   )}

   {/* Workflow & Approvals Tab */}
   {activeTab === 'workflow' && (
    <div className="space-y-3">
     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
       <CheckCircle className="w-5 h-5 text-cyan-600" />
       Project Workflow
      </h3>
      <div className="space-y-2">
       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">Project Creation Approval</p>
         <p className="text-sm text-gray-600">Require approval before creating new projects</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
         <input
          type="checkbox"
          checked={projectApprovalRequired}
          onChange={(e) => {
           setProjectApprovalRequired(e.target.checked);
           setHasChanges(true);
          }}
          className="sr-only peer"
         />
         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
       </div>

       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">Milestone Approval</p>
         <p className="text-sm text-gray-600">Require approval for milestone completion</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
         <input
          type="checkbox"
          checked={milestoneApprovalRequired}
          onChange={(e) => {
           setMilestoneApprovalRequired(e.target.checked);
           setHasChanges(true);
          }}
          className="sr-only peer"
         />
         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
       </div>

       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">Document Approval</p>
         <p className="text-sm text-gray-600">Require approval for critical project documents</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
         <input
          type="checkbox"
          checked={documentApprovalRequired}
          onChange={(e) => {
           setDocumentApprovalRequired(e.target.checked);
           setHasChanges(true);
          }}
          className="sr-only peer"
         />
         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
       </div>
      </div>
     </div>

     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
       <DollarSign className="w-5 h-5 text-cyan-600" />
       Budget & Financial Approvals
      </h3>
      <div className="space-y-2">
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
         Budget Approval Threshold
        </label>
        <div className="flex items-center gap-2 w-full md:w-1/2">
         <span className="text-gray-700">₹</span>
         <input
          type="text"
          value={budgetApprovalThreshold}
          onChange={(e) => {
           setBudgetApprovalThreshold(e.target.value);
           setHasChanges(true);
          }}
          placeholder="5000000"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
         />
        </div>
        <p className="text-xs text-gray-500 mt-1">Projects above this budget require additional approval</p>
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
         Change Order Approval Levels
        </label>
        <select
         value={changeOrderApprovalLevels}
         onChange={(e) => {
          setChangeOrderApprovalLevels(e.target.value);
          setHasChanges(true);
         }}
         className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
         <option value="1">1 Level (Project Manager)</option>
         <option value="2">2 Levels (PM + Department Head)</option>
         <option value="3">3 Levels (PM + Dept Head + Finance)</option>
         <option value="4">4 Levels (PM + Dept Head + Finance + CEO)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Number of approval levels required for change orders</p>
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
         Purchase Order Approval Limit
        </label>
        <div className="flex items-center gap-2 w-full md:w-1/2">
         <span className="text-gray-700">₹</span>
         <input
          type="text"
          placeholder="1000000"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
         />
        </div>
        <p className="text-xs text-gray-500 mt-1">POs above this amount require Finance approval</p>
       </div>
      </div>
     </div>

     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
       <Workflow className="w-5 h-5 text-cyan-600" />
       Project Lifecycle Stages
      </h3>
      <div className="space-y-3">
       {[
        { stage: 'Planning', color: 'bg-gray-500' },
        { stage: 'In Progress', color: 'bg-blue-500' },
        { stage: 'On Hold', color: 'bg-yellow-500' },
        { stage: 'Completed', color: 'bg-green-500' },
        { stage: 'Cancelled', color: 'bg-red-500' },
       ].map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
         <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
          <span className="font-medium text-gray-900">{item.stage}</span>
         </div>
         <button className="text-sm text-cyan-600 hover:text-cyan-700">Edit</button>
        </div>
       ))}
      </div>
     </div>

     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
       <h3 className="text-lg font-semibold text-gray-900">Advanced Workflow Configuration</h3>
       <button
        onClick={() => setShowWorkflowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
       >
        <Workflow className="w-4 h-4" />
        Advanced Workflow Settings
       </button>
      </div>
      <p className="text-sm text-gray-600">
       Configure advanced approval workflows, custom stages, and automated workflow rules.
      </p>
     </div>
    </div>
   )}

   {/* Notifications Tab */}
   {activeTab === 'notifications' && (
    <div className="space-y-3">
     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
       <Bell className="w-5 h-5 text-cyan-600" />
       Project Notifications
      </h3>
      <div className="space-y-2">
       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">Project Start</p>
         <p className="text-sm text-gray-600">Notify when a new project starts</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
         <input
          type="checkbox"
          checked={projectStartNotification}
          onChange={(e) => {
           setProjectStartNotification(e.target.checked);
           setHasChanges(true);
          }}
          className="sr-only peer"
         />
         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
       </div>

       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">Milestone Complete</p>
         <p className="text-sm text-gray-600">Notify when milestones are completed</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
         <input
          type="checkbox"
          checked={milestoneCompleteNotification}
          onChange={(e) => {
           setMilestoneCompleteNotification(e.target.checked);
           setHasChanges(true);
          }}
          className="sr-only peer"
         />
         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
       </div>

       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">Budget Exceeded</p>
         <p className="text-sm text-gray-600">Alert when project budget is exceeded</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
         <input
          type="checkbox"
          checked={budgetExceededNotification}
          onChange={(e) => {
           setBudgetExceededNotification(e.target.checked);
           setHasChanges(true);
          }}
          className="sr-only peer"
         />
         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
       </div>

       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">Schedule Delay</p>
         <p className="text-sm text-gray-600">Alert when projects are behind schedule</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
         <input
          type="checkbox"
          checked={scheduleDelayNotification}
          onChange={(e) => {
           setScheduleDelayNotification(e.target.checked);
           setHasChanges(true);
          }}
          className="sr-only peer"
         />
         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
       </div>
      </div>
     </div>

     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
       <Bell className="w-5 h-5 text-cyan-600" />
       Notification Channels
      </h3>
      <div className="space-y-2">
       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">Email Notifications</p>
         <p className="text-sm text-gray-600">Send notifications via email</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
         <input
          type="checkbox"
          checked={emailNotifications}
          onChange={(e) => {
           setEmailNotifications(e.target.checked);
           setHasChanges(true);
          }}
          className="sr-only peer"
         />
         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
       </div>

       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">SMS Notifications</p>
         <p className="text-sm text-gray-600">Send critical alerts via SMS</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
         <input
          type="checkbox"
          checked={smsNotifications}
          onChange={(e) => {
           setSmsNotifications(e.target.checked);
           setHasChanges(true);
          }}
          className="sr-only peer"
         />
         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
       </div>

       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">In-App Notifications</p>
         <p className="text-sm text-gray-600">Show notifications in the application</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
         <input type="checkbox" defaultChecked className="sr-only peer" />
         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
       </div>
      </div>
     </div>

     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
       <h3 className="text-lg font-semibold text-gray-900">Email Templates & Preferences</h3>
       <button
        onClick={() => setShowEmailTemplatesModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
       >
        <Mail className="w-4 h-4" />
        Manage Email Templates
       </button>
      </div>
      <p className="text-sm text-gray-600">
       Customize email notification templates, subject lines, and sender preferences.
      </p>
     </div>
    </div>
   )}

   {/* Approval Levels Tab */}
   {activeTab === 'approvals' && (
    <div className="space-y-3">
     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
       <Shield className="w-5 h-5 text-cyan-600" />
       Approval Hierarchy
      </h3>
      <div className="space-y-2">
       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">Project Manager</p>
         <p className="text-sm text-gray-600">First level approval for all project activities</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
         <input
          type="checkbox"
          checked={projectManagerApproval}
          onChange={(e) => {
           setProjectManagerApproval(e.target.checked);
           setHasChanges(true);
          }}
          className="sr-only peer"
         />
         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
       </div>

       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">Department Head</p>
         <p className="text-sm text-gray-600">Second level approval for critical decisions</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
         <input
          type="checkbox"
          checked={departmentHeadApproval}
          onChange={(e) => {
           setDepartmentHeadApproval(e.target.checked);
           setHasChanges(true);
          }}
          className="sr-only peer"
         />
         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
       </div>

       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">Finance Department</p>
         <p className="text-sm text-gray-600">Approval for financial and budgetary matters</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
         <input
          type="checkbox"
          checked={financeApproval}
          onChange={(e) => {
           setFinanceApproval(e.target.checked);
           setHasChanges(true);
          }}
          className="sr-only peer"
         />
         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
         CEO Approval Threshold
        </label>
        <div className="flex items-center gap-2 w-full md:w-1/2">
         <span className="text-gray-700">₹</span>
         <input
          type="text"
          value={ceoApprovalThreshold}
          onChange={(e) => {
           setCeoApprovalThreshold(e.target.value);
           setHasChanges(true);
          }}
          placeholder="10000000"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
         />
        </div>
        <p className="text-xs text-gray-500 mt-1">Projects above this amount require CEO approval</p>
       </div>
      </div>
     </div>

     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Approval Workflow Diagram</h3>
      <div className="bg-gray-50 rounded-lg p-3">
       <div className="flex flex-col md:flex-row items-center justify-center gap-3">
        <div className="text-center">
         <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
          <Users className="w-8 h-8 text-blue-600" />
         </div>
         <p className="text-sm font-medium text-gray-900">Project Manager</p>
         <p className="text-xs text-gray-600">Level 1</p>
        </div>
        <div className="text-gray-400">→</div>
        <div className="text-center">
         <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2">
          <Shield className="w-8 h-8 text-purple-600" />
         </div>
         <p className="text-sm font-medium text-gray-900">Department Head</p>
         <p className="text-xs text-gray-600">Level 2</p>
        </div>
        <div className="text-gray-400">→</div>
        <div className="text-center">
         <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
          <DollarSign className="w-8 h-8 text-green-600" />
         </div>
         <p className="text-sm font-medium text-gray-900">Finance</p>
         <p className="text-xs text-gray-600">Level 3</p>
        </div>
        <div className="text-gray-400">→</div>
        <div className="text-center">
         <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
          <AlertCircle className="w-8 h-8 text-red-600" />
         </div>
         <p className="text-sm font-medium text-gray-900">CEO</p>
         <p className="text-xs text-gray-600">Level 4</p>
        </div>
       </div>
      </div>
     </div>

     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
       <h3 className="text-lg font-semibold text-gray-900">Access Control & Permissions</h3>
       <button
        onClick={() => setShowAccessModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
       >
        <Lock className="w-4 h-4" />
        Manage Access Control
       </button>
      </div>
      <p className="text-sm text-gray-600">
       Configure detailed user roles, permissions, and access control settings for different approval levels.
      </p>
     </div>
    </div>
   )}

   {/* Integrations Tab */}
   {activeTab === 'integrations' && (
    <div className="space-y-3">
     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Module Integrations</h3>
      <div className="space-y-2">
       <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2">
         <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-blue-600" />
         </div>
         <div>
          <p className="font-medium text-gray-900">Finance Module</p>
          <p className="text-sm text-gray-600">Sync project budgets and costs with finance</p>
         </div>
        </div>
        <div className="flex items-center gap-3">
         <span className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          Connected
         </span>
         <button
          onClick={() => setShowIntegrationModal(true)}
          className="text-sm text-cyan-600 hover:text-cyan-700"
         >
          Configure
         </button>
        </div>
       </div>

       <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2">
         <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-green-600" />
         </div>
         <div>
          <p className="font-medium text-gray-900">HR Module</p>
          <p className="text-sm text-gray-600">Sync resource allocation with HR system</p>
         </div>
        </div>
        <div className="flex items-center gap-3">
         <span className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          Connected
         </span>
         <button
          onClick={() => setShowIntegrationModal(true)}
          className="text-sm text-cyan-600 hover:text-cyan-700"
         >
          Configure
         </button>
        </div>
       </div>

       <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2">
         <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-purple-600" />
         </div>
         <div>
          <p className="font-medium text-gray-900">Procurement Module</p>
          <p className="text-sm text-gray-600">Link project materials with procurement</p>
         </div>
        </div>
        <div className="flex items-center gap-3">
         <span className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          Connected
         </span>
         <button
          onClick={() => setShowIntegrationModal(true)}
          className="text-sm text-cyan-600 hover:text-cyan-700"
         >
          Configure
         </button>
        </div>
       </div>

       <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2">
         <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
          <Settings className="w-6 h-6 text-cyan-600" />
         </div>
         <div>
          <p className="font-medium text-gray-900">Production Module</p>
          <p className="text-sm text-gray-600">Connect project deliverables with production</p>
         </div>
        </div>
        <div className="flex items-center gap-3">
         <span className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          Connected
         </span>
         <button
          onClick={() => setShowIntegrationModal(true)}
          className="text-sm text-cyan-600 hover:text-cyan-700"
         >
          Configure
         </button>
        </div>
       </div>
      </div>
     </div>

     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">External Integrations</h3>
      <div className="space-y-2">
       <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">Email Server (SMTP)</p>
         <p className="text-sm text-gray-600">Configure email notifications</p>
        </div>
        <button
         onClick={() => setShowEmailTemplatesModal(true)}
         className="text-sm text-cyan-600 hover:text-cyan-700"
        >
         Configure
        </button>
       </div>

       <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">SMS Gateway</p>
         <p className="text-sm text-gray-600">Setup SMS notifications</p>
        </div>
        <button
         onClick={() => setShowIntegrationModal(true)}
         className="text-sm text-cyan-600 hover:text-cyan-700"
        >
         Configure
        </button>
       </div>

       <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
        <div>
         <p className="font-medium text-gray-900">Cloud Storage</p>
         <p className="text-sm text-gray-600">Connect document storage</p>
        </div>
        <button
         onClick={() => setShowBackupModal(true)}
         className="text-sm text-cyan-600 hover:text-cyan-700"
        >
         Configure
        </button>
       </div>
      </div>
     </div>

     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
       <h3 className="text-lg font-semibold text-gray-900">API Configuration</h3>
       <button
        onClick={() => setShowAPIModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
       >
        <Code className="w-4 h-4" />
        Manage API Settings
       </button>
      </div>
      <p className="text-sm text-gray-600">
       Configure API keys, webhooks, and third-party integrations.
      </p>
     </div>
    </div>
   )}

   {/* Save Button (Fixed at bottom when changes exist) */}
   {hasChanges && (
    <div className="fixed bottom-6 right-6 flex gap-3 shadow-lg">
     <button
      onClick={handleReset}
      className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50"
     >
      <RefreshCw className="w-4 h-4" />
      Reset Changes
     </button>
     <button
      onClick={handleSave}
      className="flex items-center gap-2 px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 shadow-lg"
     >
      <Save className="w-4 h-4" />
      Save All Changes
     </button>
    </div>
   )}
    </div>
   </div>

   {/* All Modals */}
   <GeneralSettingsModal
    isOpen={showGeneralModal}
    onClose={() => setShowGeneralModal(false)}
    onSave={handleGeneralSettings}
   />
   <NotificationSettingsModal
    isOpen={showNotificationModal}
    onClose={() => setShowNotificationModal(false)}
    onSave={handleNotificationSettings}
   />
   <AccessControlModal
    isOpen={showAccessModal}
    onClose={() => setShowAccessModal(false)}
    onSave={handleAccessControl}
   />
   <IntegrationSettingsModal
    isOpen={showIntegrationModal}
    onClose={() => setShowIntegrationModal(false)}
    onSave={handleIntegrationSettings}
   />
   <WorkflowSettingsModal
    isOpen={showWorkflowModal}
    onClose={() => setShowWorkflowModal(false)}
    onSave={handleWorkflowSettings}
   />
   <CustomFieldsModal
    isOpen={showCustomFieldsModal}
    onClose={() => setShowCustomFieldsModal(false)}
    onSave={handleCustomFields}
   />
   <EmailTemplatesModal
    isOpen={showEmailTemplatesModal}
    onClose={() => setShowEmailTemplatesModal(false)}
    onSave={handleEmailTemplates}
   />
   <ReportSettingsModal
    isOpen={showReportSettingsModal}
    onClose={() => setShowReportSettingsModal(false)}
    onSave={handleReportSettings}
   />
   <BudgetSettingsModal
    isOpen={showBudgetSettingsModal}
    onClose={() => setShowBudgetSettingsModal(false)}
    onSave={handleBudgetSettings}
   />
   <SecuritySettingsModal
    isOpen={showSecurityModal}
    onClose={() => setShowSecurityModal(false)}
    onSave={handleSecuritySettings}
   />
   <BackupSettingsModal
    isOpen={showBackupModal}
    onClose={() => setShowBackupModal(false)}
    onSave={handleBackupSettings}
   />
   <APISettingsModal
    isOpen={showAPIModal}
    onClose={() => setShowAPIModal(false)}
    onSave={handleAPISettings}
   />
   <AdvancedSettingsModal
    isOpen={showAdvancedModal}
    onClose={() => setShowAdvancedModal(false)}
    onSave={handleAdvancedSettings}
   />
   <ImportExportModal
    isOpen={showImportExportModal}
    onClose={handleImportExport}
   />
   <ResetSettingsModal
    isOpen={showResetModal}
    onClose={() => setShowResetModal(false)}
    onReset={handleResetSettings}
   />
  </div>
 );
}
