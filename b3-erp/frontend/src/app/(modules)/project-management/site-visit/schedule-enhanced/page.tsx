'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  X,
  Plus,
  Trash2,
  Users,
  AlertTriangle,
  Camera,
  Ruler,
  ClipboardList,
} from 'lucide-react';
import { StepIndicator } from '@/components/ui/StepIndicator';
import {
  useAutoSaveDraft,
  AutoSaveIndicator,
  DraftRecoveryBanner,
  useUnsavedChangesWarning,
  HelpIcon,
  FormProgressIndicator,
} from '@/components/ui/FormUX';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { projectManagementService } from '@/services/ProjectManagementService';

// Field help content
const FIELD_HELP = {
  visitType: {
    title: 'Visit Type',
    content: 'Initial: First site survey. Follow-up: Verification visit. Final: Pre-installation inspection.',
  },
  duration: {
    title: 'Estimated Duration',
    content: 'Plan for adequate time. Include travel, setup, measurements, photos, and client discussions.',
  },
  equipment: {
    title: 'Required Equipment',
    content: 'Select tools needed for the visit. This helps ensure nothing is forgotten and prepares the team.',
  },
  objectives: {
    title: 'Visit Objectives',
    content: 'Define clear goals for the site visit. This ensures all required data is captured in one trip.',
  },
  accessRequirements: {
    title: 'Site Access Requirements',
    content: 'Note any special access requirements like security clearance, safety gear, or timing restrictions.',
  },
};

// Types
interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
}

interface VisitObjective {
  id: string;
  description: string;
  completed: boolean;
}

interface FormData {
  // Project Selection
  project: string;
  projectName: string;
  // Visit Details
  visitType: string;
  date: string;
  time: string;
  duration: string;
  // Location
  location: string;
  address: string;
  landmark: string;
  accessNotes: string;
  // Client Contact
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientDesignation: string;
  // Team
  teamMembers: TeamMember[];
  // Equipment
  equipment: string[];
  // Objectives
  objectives: VisitObjective[];
  // Notes
  notes: string;
  specialRequirements: string;
}

const STEPS = [
  { id: 'project', label: 'Project', description: 'Select project', icon: FileText },
  { id: 'schedule', label: 'Schedule', description: 'Date and time', icon: Calendar },
  { id: 'location', label: 'Location', description: 'Site details', icon: MapPin },
  { id: 'team', label: 'Team', description: 'Assign members', icon: Users },
  { id: 'objectives', label: 'Objectives', description: 'Visit goals', icon: ClipboardList },
  { id: 'review', label: 'Confirm', description: 'Review and schedule', icon: CheckCircle },
];

// Reference-data types (wired to NestJS backend at runtime)
type EquipmentOption = { id: string; label: string; icon: React.ComponentType<{ className?: string }> };
type ProjectOption = { label: string; value: string; location: string; address: string };
type EmployeeOption = { label: string; value: string; phone: string };

const initialFormData: FormData = {
  project: '',
  projectName: '',
  visitType: 'initial',
  date: '',
  time: '',
  duration: '2',
  location: '',
  address: '',
  landmark: '',
  accessNotes: '',
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  clientDesignation: '',
  teamMembers: [{ id: '1', name: '', role: 'Site Engineer', phone: '' }],
  equipment: ['camera', 'measuring_tape', 'clipboard'],
  objectives: [
    { id: '1', description: 'Verify site dimensions', completed: false },
    { id: '2', description: 'Photo documentation', completed: false },
    { id: '3', description: 'Check utility connections', completed: false },
  ],
  notes: '',
  specialRequirements: '',
};

export default function ScheduleSiteVisitEnhancedPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reference data (wired to NestJS backend)
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<EquipmentOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await projectManagementService.getPmProjectPlansRaw();
        if (cancelled) return;
        setProjects((rows || []).map((p: any) => {
          const code = p.projectCode || p.code || p.id;
          const name = p.projectName || p.name || '';
          return {
            label: code ? `${code} - ${name}` : name,
            value: p.id || code,
            location: p.location || '',
            address: p.location || '',
          };
        }));
      } catch { /* leave empty on error */ }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await projectManagementService.getHrEmployeesRaw();
        if (cancelled) return;
        setEmployees((rows || []).map((e: any) => ({
          label: e.fullName || `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.name || '',
          value: e.id,
          phone: e.mobileNumber || e.phone || e.contactNumber || '',
        })));
      } catch { /* leave empty on error */ }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await projectManagementService.getPmEquipmentCatalogRaw();
        if (cancelled) return;
        setEquipmentOptions((rows || []).map((eq: any) => ({
          id: eq.code || eq.id,
          label: eq.name || eq.code || '',
          icon: Ruler,
        })));
      } catch { /* leave empty on error */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // Auto-save draft
  const { lastSaved, isSaving, hasDraft, clearDraft, restoreDraft } = useAutoSaveDraft(
    formData as unknown as Record<string, unknown>,
    {
      key: 'site-visit-schedule-form',
      debounceMs: 3000,
    }
  );

  // Unsaved changes warning
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
  useUnsavedChangesWarning(hasUnsavedChanges && !isSubmitting);

  // Handle draft restoration
  const handleRestoreDraft = () => {
    const draft = restoreDraft();
    if (draft) {
      setFormData(draft as unknown as FormData);
    }
  };

  // Form fields for progress indicator
  const formFields = useMemo(() => [
    { name: 'project', required: true },
    { name: 'date', required: true },
    { name: 'time', required: true },
    { name: 'location', required: true },
    { name: 'clientName', required: true },
    { name: 'clientPhone', required: true },
  ], []);

  // Update form data
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Team member functions
  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        { id: Date.now().toString(), name: '', role: '', phone: '' },
      ],
    }));
  };

  const removeTeamMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m.id !== id),
    }));
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    }));
  };

  // Objective functions
  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [
        ...prev.objectives,
        { id: Date.now().toString(), description: '', completed: false },
      ],
    }));
  };

  const removeObjective = (id: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter(o => o.id !== id),
    }));
  };

  const updateObjective = (id: string, description: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map(o =>
        o.id === id ? { ...o, description } : o
      ),
    }));
  };

  // Toggle equipment
  const toggleEquipment = (equipmentId: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipmentId)
        ? prev.equipment.filter(e => e !== equipmentId)
        : [...prev.equipment, equipmentId],
    }));
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Project
        if (!formData.project) newErrors.project = 'Please select a project';
        break;
      case 1: // Schedule
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';
        if (!formData.duration) newErrors.duration = 'Duration is required';
        break;
      case 2: // Location
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        break;
      case 3: // Team
        if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
        if (!formData.clientPhone.trim()) newErrors.clientPhone = 'Client phone is required';
        if (formData.teamMembers.length === 0 || !formData.teamMembers[0].name) {
          newErrors.team = 'At least one team member is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Site visit scheduled:', formData);
      clearDraft();
      router.push('/project-management/site-visit/measurements');
    } catch (error) {
      console.error('Error scheduling visit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Select Project</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={projects}
                value={formData.project}
                onChange={(val) => {
                  updateFormData('project', val);
                  const selectedProject = projects.find(p => p.value === val);
                  if (selectedProject) {
                    updateFormData('projectName', selectedProject.label.split(' - ')[1] || '');
                    updateFormData('location', selectedProject.location);
                    updateFormData('address', selectedProject.address);
                  }
                }}
                placeholder="Select a project"
                addNewLabel="Create Project"
                addNewHref="/project-management/create-enhanced"
                error={!!errors.project}
              />
              {errors.project && <p className="mt-1 text-sm text-red-500">{errors.project}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                Visit Type
                <HelpIcon content={FIELD_HELP.visitType.content} title={FIELD_HELP.visitType.title} />
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'initial', label: 'Initial Survey', desc: 'First site assessment' },
                  { value: 'followup', label: 'Follow-up', desc: 'Verification visit' },
                  { value: 'final', label: 'Final Inspection', desc: 'Pre-installation check' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateFormData('visitType', type.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${formData.visitType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <p className="font-medium text-gray-900">{type.label}</p>
                    <p className="text-sm text-gray-500">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Schedule Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => updateFormData('time', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.time ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Duration (hours)
                  <HelpIcon content={FIELD_HELP.duration.content} title={FIELD_HELP.duration.title} />
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => updateFormData('duration', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours (Half day)</option>
                  <option value="8">8 hours (Full day)</option>
                </select>
              </div>
            </div>

            {formData.date && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Scheduled for:</span> {formatDate(formData.date)} at {formData.time || '--:--'}
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Site Location</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="e.g., Taj Hotels, Mumbai"
                />
                {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Landmark</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => updateFormData('landmark', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nearby landmark for easy navigation"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Complete address with pin code"
                />
                {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Access Requirements / Notes
                  <HelpIcon content={FIELD_HELP.accessRequirements.content} title={FIELD_HELP.accessRequirements.title} />
                </label>
                <textarea
                  value={formData.accessNotes}
                  onChange={(e) => updateFormData('accessNotes', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Gate pass required, security check, PPE needed, etc."
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Contact & Team</h2>
            </div>

            {/* Client Contact */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Client Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => updateFormData('clientName', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.clientName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Client contact name"
                    />
                  </div>
                  {errors.clientName && <p className="mt-1 text-sm text-red-500">{errors.clientName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <input
                    type="text"
                    value={formData.clientDesignation}
                    onChange={(e) => updateFormData('clientDesignation', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Project Manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => updateFormData('clientPhone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.clientPhone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  {errors.clientPhone && <p className="mt-1 text-sm text-red-500">{errors.clientPhone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => updateFormData('clientEmail', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@company.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 uppercase">Site Visit Team</h3>
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Member
                </button>
              </div>
              {errors.team && <p className="mb-2 text-sm text-red-500">{errors.team}</p>}

              <div className="space-y-3">
                {formData.teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <SearchableSelect
                        options={employees}
                        value={member.name}
                        onChange={(val) => {
                          updateTeamMember(member.id, 'name', val);
                          const selectedEmp = employees.find(e => e.value === val);
                          if (selectedEmp) {
                            updateTeamMember(member.id, 'phone', selectedEmp.phone);
                          }
                        }}
                        placeholder="Search Member"
                        addNewLabel="Add Employee"
                        addNewHref="/common-masters/employee-master"
                      />
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Role"
                      />
                      <input
                        type="tel"
                        value={member.phone}
                        onChange={(e) => updateTeamMember(member.id, 'phone', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Phone"
                      />
                    </div>
                    {formData.teamMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTeamMember(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Visit Objectives & Equipment</h2>
            </div>

            {/* Equipment */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                Required Equipment
                <HelpIcon content={FIELD_HELP.equipment.content} title={FIELD_HELP.equipment.title} />
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {equipmentOptions.map((equip) => {
                  const Icon = equip.icon;
                  const isSelected = formData.equipment.includes(equip.id);
                  return (
                    <button
                      key={equip.id}
                      type="button"
                      onClick={() => toggleEquipment(equip.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                        {equip.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Objectives */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  Visit Objectives
                  <HelpIcon content={FIELD_HELP.objectives.content} title={FIELD_HELP.objectives.title} />
                </label>
                <button
                  type="button"
                  onClick={addObjective}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Objective
                </button>
              </div>
              <div className="space-y-2">
                {formData.objectives.map((objective, index) => (
                  <div key={objective.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-xs font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={objective.description}
                      onChange={(e) => updateObjective(objective.id, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Describe the objective..."
                    />
                    {formData.objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeObjective(objective.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional instructions or notes for the visit..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Review & Confirm</h2>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              {/* Project & Schedule */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Schedule Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Project:</span>
                    <p className="font-medium text-gray-900">{formData.projectName || formData.project}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Visit Type:</span>
                    <p className="font-medium text-gray-900 capitalize">{formData.visitType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date & Time:</span>
                    <p className="font-medium text-gray-900">{formatDate(formData.date)} at {formData.time}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium text-gray-900">{formData.duration} hour(s)</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Location</h3>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{formData.location}</p>
                  <p className="text-gray-600">{formData.address}</p>
                  {formData.accessNotes && (
                    <p className="text-yellow-600 mt-2">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      {formData.accessNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact & Team */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Contact & Team</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Client Contact:</span>
                    <p className="font-medium text-gray-900">{formData.clientName}</p>
                    <p className="text-gray-600">{formData.clientPhone}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Team:</span>
                    <p className="font-medium text-gray-900">
                      {formData.teamMembers.filter(m => m.name).map(m => m.name).join(', ') || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Equipment & Objectives */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Equipment & Objectives</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.equipment.map((equipId) => {
                    const equip = equipmentOptions.find(e => e.id === equipId);
                    return equip ? (
                      <span key={equipId} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {equip.label}
                      </span>
                    ) : null;
                  })}
                </div>
                <ul className="space-y-1">
                  {formData.objectives.filter(o => o.description).map((obj, i) => (
                    <li key={obj.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {obj.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-3 py-2">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Schedule Site Visit</h1>
              <p className="text-sm text-gray-600 mt-1">Phase 2: Design & Site Assessment - Step 2.4</p>
            </div>
            <div className="flex items-center gap-2">
              <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
              <FormProgressIndicator
                fields={formFields}
                values={formData as unknown as Record<string, unknown>}
                variant="circular"
                size="md"
              />
            </div>
          </div>

          {hasDraft && currentStep === 0 && (
            <DraftRecoveryBanner
              hasDraft={hasDraft}
              onRestore={handleRestoreDraft}
              onDiscard={clearDraft}
            />
          )}
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            variant="default"
          />
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/project-management/phase-2')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goToPrevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>

              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Schedule Visit
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
