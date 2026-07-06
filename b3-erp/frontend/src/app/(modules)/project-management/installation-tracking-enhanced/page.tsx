'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
    Wrench,
    Users,
    Calendar,
    MapPin,
    CheckCircle,
    ArrowLeft,
    Building2,
    FileText,
    Clock,
    AlertCircle,
    Plus,
    Trash2,
    Camera,
    ClipboardCheck,
    Package,
    Shield,
    CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { StepIndicator } from '@/components/ui/StepIndicator';
import {
    useAutoSaveDraft,
    AutoSaveIndicator,
    DraftRecoveryBanner,
    useUnsavedChangesWarning,
    HelpIcon,
    FormProgressIndicator
} from '@/components/ui/FormUX';
import { useProjectContext } from '@/context/ProjectContext';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    contactNumber: string;
}

interface SafetyCheckItem {
    id: string;
    item: string;
    checked: boolean;
    remarks: string;
}

interface QualityCheckItem {
    id: string;
    checkPoint: string;
    status: 'pending' | 'pass' | 'fail' | 'na';
    remarks: string;
}

interface InstallationFormData {
    // Step 1: Project & Equipment
    projectId: string;
    projectName: string;
    activityNumber: string;
    equipmentItem: string;
    equipmentCode: string;
    installationType: string;
    location: string;
    zone: string;

    // Step 2: Schedule
    plannedStartDate: string;
    plannedEndDate: string;
    actualStartDate: string;
    actualEndDate: string;
    estimatedDuration: number;
    durationUnit: string;

    // Step 3: Team
    teamMembers: TeamMember[];
    supervisor: string;
    supervisorPhone: string;

    // Step 4: Safety & Quality
    safetyChecklist: SafetyCheckItem[];
    qualityChecklist: QualityCheckItem[];

    // Step 5: Progress & Review
    progress: number;
    status: string;
    materialStatus: string;
    toolsRequired: string;
    remarks: string;
    issues: string;
    photosUploaded: number;
}

const STEPS = [
    { id: 'equipment', label: 'Equipment', description: 'Project and equipment details', icon: Package },
    { id: 'schedule', label: 'Schedule', description: 'Installation timeline', icon: Calendar },
    { id: 'team', label: 'Team', description: 'Assign installation team', icon: Users },
    { id: 'safety', label: 'Safety & QC', description: 'Safety and quality checks', icon: Shield },
    { id: 'review', label: 'Review', description: 'Review and create', icon: CheckCircle },
];

const FORM_FIELDS = [
    { name: 'projectId', required: true },
    { name: 'equipmentItem', required: true },
    { name: 'location', required: true },
    { name: 'plannedStartDate', required: true },
    { name: 'plannedEndDate', required: true },
    { name: 'teamMembers', required: true, validate: (v: unknown) => Array.isArray(v) && v.length > 0 },
    { name: 'supervisor', required: true },
];

interface ProjectOption { id: string; name: string; }
interface EquipmentItem { code: string; name: string; }

const DEFAULT_SAFETY_CHECKLIST: SafetyCheckItem[] = [
    { id: '1', item: 'PPE available for all team members', checked: false, remarks: '' },
    { id: '2', item: 'Work area secured and cordoned off', checked: false, remarks: '' },
    { id: '3', item: 'Electrical isolation completed', checked: false, remarks: '' },
    { id: '4', item: 'Gas lines secured (if applicable)', checked: false, remarks: '' },
    { id: '5', item: 'Fire extinguisher accessible', checked: false, remarks: '' },
    { id: '6', item: 'First aid kit available on site', checked: false, remarks: '' },
    { id: '7', item: 'Emergency contact numbers displayed', checked: false, remarks: '' },
    { id: '8', item: 'Lifting equipment certified (if required)', checked: false, remarks: '' },
];

const DEFAULT_QUALITY_CHECKLIST: QualityCheckItem[] = [
    { id: '1', checkPoint: 'Equipment unpacking and visual inspection', status: 'pending', remarks: '' },
    { id: '2', checkPoint: 'Base/foundation preparation verified', status: 'pending', remarks: '' },
    { id: '3', checkPoint: 'Equipment positioning and leveling', status: 'pending', remarks: '' },
    { id: '4', checkPoint: 'Utility connections (electrical/plumbing/gas)', status: 'pending', remarks: '' },
    { id: '5', checkPoint: 'Functional testing completed', status: 'pending', remarks: '' },
    { id: '6', checkPoint: 'Safety devices tested and operational', status: 'pending', remarks: '' },
    { id: '7', checkPoint: 'Calibration completed (if required)', status: 'pending', remarks: '' },
    { id: '8', checkPoint: 'Documentation and manuals handed over', status: 'pending', remarks: '' },
];

export default function InstallationTrackingEnhancedPage() {
    const { loadProject } = useProjectContext();
    const router = useRouter();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showDraftBanner, setShowDraftBanner] = useState(true);
    const [equipmentCatalog, setEquipmentCatalog] = useState<EquipmentItem[]>([]);
    const [projects, setProjects] = useState<ProjectOption[]>([]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const rows = await projectManagementService.listEquipmentCatalog();
                if (!active || !rows) return;
                setEquipmentCatalog(rows.map((r) => ({ code: r.code || '', name: r.name || '' })));
            } catch {
                if (active) setEquipmentCatalog([]);
            }
        })();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const rows = await projectManagementService.getProjects();
                if (!active) return;
                setProjects((Array.isArray(rows) ? rows : []).map((p) => ({ id: p.id, name: p.name })));
            } catch {
                if (active) setProjects([]);
            }
        })();
        return () => { active = false; };
    }, []);

    const [formData, setFormData] = useState<InstallationFormData>({
        // Step 1
        projectId: '',
        projectName: '',
        activityNumber: `INST-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        equipmentItem: '',
        equipmentCode: '',
        installationType: 'new',
        location: '',
        zone: '',

        // Step 2
        plannedStartDate: '',
        plannedEndDate: '',
        actualStartDate: '',
        actualEndDate: '',
        estimatedDuration: 1,
        durationUnit: 'days',

        // Step 3
        teamMembers: [],
        supervisor: '',
        supervisorPhone: '',

        // Step 4
        safetyChecklist: DEFAULT_SAFETY_CHECKLIST,
        qualityChecklist: DEFAULT_QUALITY_CHECKLIST,

        // Step 5
        progress: 0,
        status: 'not_started',
        materialStatus: 'available',
        toolsRequired: '',
        remarks: '',
        issues: '',
        photosUploaded: 0,
    });

    // Auto-save functionality
    const { lastSaved, isSaving, hasDraft, clearDraft, restoreDraft } = useAutoSaveDraft(
        formData as unknown as Record<string, unknown>,
        { key: 'installation-tracking-enhanced' }
    );

    // Unsaved changes warning
    const hasUnsavedChanges = formData.projectId !== '' || formData.equipmentItem !== '';
    useUnsavedChangesWarning(hasUnsavedChanges);

    const handleRestoreDraft = () => {
        const draft = restoreDraft();
        if (draft) {
            setFormData(draft as unknown as InstallationFormData);
            toast({ title: 'Draft Restored', description: 'Your previous progress has been restored.' });
        }
        setShowDraftBanner(false);
    };

    const handleDiscardDraft = () => {
        clearDraft();
        setShowDraftBanner(false);
    };

    const updateFormData = (field: keyof InstallationFormData, value: unknown) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleProjectChange = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        updateFormData('projectId', projectId);
        updateFormData('projectName', project?.name || '');

        if (project) {
            loadProject({
                id: project.id,
                name: project.name,
                projectType: 'Commercial Kitchen', // Mock data doesn't have type
                customerName: 'Unknown Customer', // Mock data doesn't have customer
                status: 'In Progress'
            });
        }
    };

    const handleEquipmentChange = (code: string) => {
        const equipment = equipmentCatalog.find(e => e.code === code);
        updateFormData('equipmentCode', code);
        updateFormData('equipmentItem', equipment?.name || '');
    };

    // Team management
    const addTeamMember = () => {
        const newMember: TeamMember = {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            role: 'technician',
            contactNumber: '',
        };
        updateFormData('teamMembers', [...formData.teamMembers, newMember]);
    };

    const updateTeamMember = (id: string, field: keyof TeamMember, value: string) => {
        const updated = formData.teamMembers.map(member =>
            member.id === id ? { ...member, [field]: value } : member
        );
        updateFormData('teamMembers', updated);
    };

    const removeTeamMember = (id: string) => {
        updateFormData('teamMembers', formData.teamMembers.filter(m => m.id !== id));
    };

    // Safety checklist management
    const updateSafetyItem = (id: string, field: keyof SafetyCheckItem, value: unknown) => {
        const updated = formData.safetyChecklist.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        updateFormData('safetyChecklist', updated);
    };

    // Quality checklist management
    const updateQualityItem = (id: string, field: keyof QualityCheckItem, value: unknown) => {
        const updated = formData.qualityChecklist.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        updateFormData('qualityChecklist', updated);
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 0) {
            if (!formData.projectId) newErrors.projectId = 'Project is required';
            if (!formData.equipmentCode) newErrors.equipmentCode = 'Equipment is required';
            if (!formData.location) newErrors.location = 'Location is required';
        } else if (step === 1) {
            if (!formData.plannedStartDate) newErrors.plannedStartDate = 'Start date is required';
            if (!formData.plannedEndDate) newErrors.plannedEndDate = 'End date is required';
        } else if (step === 2) {
            if (formData.teamMembers.length === 0) newErrors.teamMembers = 'At least one team member is required';
            if (!formData.supervisor) newErrors.supervisor = 'Supervisor is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < STEPS.length - 1) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = () => {
        if (validateStep(currentStep)) {
            clearDraft();
            toast({
                title: 'Installation Activity Created',
                description: `Activity ${formData.activityNumber} has been successfully created.`,
            });
            router.push('/project-management/installation-tracking');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'not_started': return 'bg-gray-100 text-gray-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'on_hold': return 'bg-yellow-100 text-yellow-800';
            case 'delayed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getQCStatusColor = (status: string) => {
        switch (status) {
            case 'pass': return 'bg-green-100 text-green-800';
            case 'fail': return 'bg-red-100 text-red-800';
            case 'na': return 'bg-gray-100 text-gray-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const safetyProgress = formData.safetyChecklist.filter(item => item.checked).length;
    const qualityProgress = formData.qualityChecklist.filter(item => item.status === 'pass').length;

    return (
        <div className="w-full py-2 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Installation Activity</h1>
                        <p className="text-sm text-gray-500">Phase 8: Installation & Handover - Track equipment installation</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
                    <FormProgressIndicator
                        fields={FORM_FIELDS}
                        values={formData as unknown as Record<string, unknown>}
                        variant="circular"
                        size="sm"
                        showFieldCount={false}
                    />
                </div>
            </div>

            {/* Draft Recovery Banner */}
            {showDraftBanner && (
                <DraftRecoveryBanner
                    hasDraft={hasDraft}
                    onRestore={handleRestoreDraft}
                    onDiscard={handleDiscardDraft}
                />
            )}

            {/* Step Indicator */}
            <Card>
                <CardContent className="pt-6">
                    <StepIndicator
                        steps={STEPS.map(s => ({ id: s.id, label: s.label, description: s.description }))}
                        currentStep={currentStep}
                        variant="default"
                    />
                </CardContent>
            </Card>

            {/* Step Content */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {(() => {
                            const Icon = STEPS[currentStep].icon;
                            return <Icon className="h-5 w-5 text-blue-600" />;
                        })()}
                        {STEPS[currentStep].label}
                    </CardTitle>
                    <CardDescription>{STEPS[currentStep].description}</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Step 1: Equipment */}
                    {currentStep === 0 && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        Project <span className="text-red-500">*</span>
                                        <HelpIcon content="Select the project for this installation" />
                                    </Label>
                                    <Select value={formData.projectId} onValueChange={handleProjectChange}>
                                        <SelectTrigger className={errors.projectId ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects.map(project => (
                                                <SelectItem key={project.id} value={project.id}>
                                                    {project.id} - {project.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.projectId && <p className="text-sm text-red-500">{errors.projectId}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Activity Number</Label>
                                    <Input value={formData.activityNumber} disabled className="bg-gray-50" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        Equipment <span className="text-red-500">*</span>
                                        <HelpIcon content="Select equipment to be installed" />
                                    </Label>
                                    <Select value={formData.equipmentCode} onValueChange={handleEquipmentChange}>
                                        <SelectTrigger className={errors.equipmentCode ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select equipment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {equipmentCatalog.map(eq => (
                                                <SelectItem key={eq.code} value={eq.code}>
                                                    {eq.code} - {eq.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.equipmentCode && <p className="text-sm text-red-500">{errors.equipmentCode}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Installation Type</Label>
                                    <Select value={formData.installationType} onValueChange={(v) => updateFormData('installationType', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">New Installation</SelectItem>
                                            <SelectItem value="replacement">Replacement</SelectItem>
                                            <SelectItem value="modification">Modification</SelectItem>
                                            <SelectItem value="upgrade">Upgrade</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        Location <span className="text-red-500">*</span>
                                        <HelpIcon content="Specific location where equipment will be installed" />
                                    </Label>
                                    <Input
                                        value={formData.location}
                                        onChange={(e) => updateFormData('location', e.target.value)}
                                        placeholder="e.g., Main Kitchen - Cooking Section"
                                        className={errors.location ? 'border-red-500' : ''}
                                    />
                                    {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Zone</Label>
                                    <Select value={formData.zone} onValueChange={(v) => updateFormData('zone', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select zone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="zone_a">Zone A</SelectItem>
                                            <SelectItem value="zone_b">Zone B</SelectItem>
                                            <SelectItem value="zone_c">Zone C</SelectItem>
                                            <SelectItem value="zone_d">Zone D</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {formData.projectName && formData.equipmentItem && (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-800">
                                        <Package className="h-5 w-5" />
                                        <span className="font-medium">Selected:</span>
                                        <span>{formData.equipmentItem}</span>
                                        <span className="text-blue-600">for</span>
                                        <span>{formData.projectName}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Schedule */}
                    {currentStep === 1 && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        Planned Start Date <span className="text-red-500">*</span>
                                        <HelpIcon content="Scheduled start date for installation" />
                                    </Label>
                                    <Input
                                        type="date"
                                        value={formData.plannedStartDate}
                                        onChange={(e) => updateFormData('plannedStartDate', e.target.value)}
                                        className={errors.plannedStartDate ? 'border-red-500' : ''}
                                    />
                                    {errors.plannedStartDate && <p className="text-sm text-red-500">{errors.plannedStartDate}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        Planned End Date <span className="text-red-500">*</span>
                                        <HelpIcon content="Expected completion date" />
                                    </Label>
                                    <Input
                                        type="date"
                                        value={formData.plannedEndDate}
                                        onChange={(e) => updateFormData('plannedEndDate', e.target.value)}
                                        className={errors.plannedEndDate ? 'border-red-500' : ''}
                                    />
                                    {errors.plannedEndDate && <p className="text-sm text-red-500">{errors.plannedEndDate}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Actual Start Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.actualStartDate}
                                        onChange={(e) => updateFormData('actualStartDate', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Actual End Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.actualEndDate}
                                        onChange={(e) => updateFormData('actualEndDate', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Estimated Duration</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={formData.estimatedDuration}
                                            onChange={(e) => updateFormData('estimatedDuration', parseInt(e.target.value) || 1)}
                                            className="w-24"
                                        />
                                        <Select value={formData.durationUnit} onValueChange={(v) => updateFormData('durationUnit', v)}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="hours">Hours</SelectItem>
                                                <SelectItem value="days">Days</SelectItem>
                                                <SelectItem value="weeks">Weeks</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {formData.plannedStartDate && formData.plannedEndDate && (
                                <div className="p-4 bg-amber-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-amber-800">
                                        <Calendar className="h-5 w-5" />
                                        <span className="font-medium">Schedule Summary:</span>
                                        <span>{formData.plannedStartDate} to {formData.plannedEndDate}</span>
                                        <span>({formData.estimatedDuration} {formData.durationUnit})</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Team */}
                    {currentStep === 2 && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        Supervisor <span className="text-red-500">*</span>
                                        <HelpIcon content="Supervisor responsible for this installation" />
                                    </Label>
                                    <Input
                                        value={formData.supervisor}
                                        onChange={(e) => updateFormData('supervisor', e.target.value)}
                                        placeholder="Supervisor name"
                                        className={errors.supervisor ? 'border-red-500' : ''}
                                    />
                                    {errors.supervisor && <p className="text-sm text-red-500">{errors.supervisor}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Supervisor Phone</Label>
                                    <Input
                                        value={formData.supervisorPhone}
                                        onChange={(e) => updateFormData('supervisorPhone', e.target.value)}
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2">
                                        Team Members <span className="text-red-500">*</span>
                                        <HelpIcon content="Add installation team members" />
                                    </Label>
                                    <Button onClick={addTeamMember} variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Member
                                    </Button>
                                </div>

                                {errors.teamMembers && (
                                    <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.teamMembers}
                                    </div>
                                )}

                                {formData.teamMembers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                        <Users className="h-12 w-12 mb-2 text-gray-300" />
                                        <p>No team members added yet</p>
                                        <Button onClick={addTeamMember} variant="link" className="mt-2">
                                            Click to add team members
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {formData.teamMembers.map((member, index) => (
                                            <Card key={member.id} className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                                        <div className="space-y-2">
                                                            <Label>Name</Label>
                                                            <Input
                                                                value={member.name}
                                                                onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                                                                placeholder="Team member name"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Role</Label>
                                                            <Select
                                                                value={member.role}
                                                                onValueChange={(v) => updateTeamMember(member.id, 'role', v)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="technician">Technician</SelectItem>
                                                                    <SelectItem value="electrician">Electrician</SelectItem>
                                                                    <SelectItem value="plumber">Plumber</SelectItem>
                                                                    <SelectItem value="helper">Helper</SelectItem>
                                                                    <SelectItem value="welder">Welder</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Contact</Label>
                                                            <Input
                                                                value={member.contactNumber}
                                                                onChange={(e) => updateTeamMember(member.id, 'contactNumber', e.target.value)}
                                                                placeholder="Phone number"
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeTeamMember(member.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Users className="h-5 w-5" />
                                    <span className="font-medium">Team Size:</span>
                                    <span>{formData.teamMembers.length} members</span>
                                    {formData.supervisor && (
                                        <>
                                            <span className="mx-2">|</span>
                                            <span>Supervised by {formData.supervisor}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Safety & Quality */}
                    {currentStep === 3 && (
                        <div className="space-y-3">
                            {/* Safety Checklist */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 text-lg font-semibold">
                                        <Shield className="h-5 w-5 text-orange-600" />
                                        Safety Checklist
                                        <span className="text-sm font-normal text-gray-500">
                                            ({safetyProgress}/{formData.safetyChecklist.length} completed)
                                        </span>
                                    </Label>
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500 transition-all"
                                            style={{ width: `${(safetyProgress / formData.safetyChecklist.length) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <Card>
                                    <CardContent className="pt-4 space-y-3">
                                        {formData.safetyChecklist.map((item) => (
                                            <div key={item.id} className="flex items-center gap-2 py-2 border-b last:border-b-0">
                                                <Checkbox
                                                    checked={item.checked}
                                                    onChange={(checked) => updateSafetyItem(item.id, 'checked', checked)}
                                                />
                                                <span className={`flex-1 ${item.checked ? 'text-gray-500 line-through' : ''}`}>
                                                    {item.item}
                                                </span>
                                                <Input
                                                    value={item.remarks}
                                                    onChange={(e) => updateSafetyItem(item.id, 'remarks', e.target.value)}
                                                    placeholder="Remarks"
                                                    className="w-48"
                                                />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quality Checklist */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 text-lg font-semibold">
                                        <ClipboardCheck className="h-5 w-5 text-green-600" />
                                        Quality Checkpoints
                                        <span className="text-sm font-normal text-gray-500">
                                            ({qualityProgress}/{formData.qualityChecklist.length} passed)
                                        </span>
                                    </Label>
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 transition-all"
                                            style={{ width: `${(qualityProgress / formData.qualityChecklist.length) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <Card>
                                    <CardContent className="pt-4 space-y-3">
                                        {formData.qualityChecklist.map((item) => (
                                            <div key={item.id} className="flex items-center gap-2 py-2 border-b last:border-b-0">
                                                <span className="flex-1 text-sm">{item.checkPoint}</span>
                                                <Select
                                                    value={item.status}
                                                    onValueChange={(v) => updateQualityItem(item.id, 'status', v)}
                                                >
                                                    <SelectTrigger className="w-28">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="pass">Pass</SelectItem>
                                                        <SelectItem value="fail">Fail</SelectItem>
                                                        <SelectItem value="na">N/A</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <span className={`px-2 py-1 rounded text-xs ${getQCStatusColor(item.status)}`}>
                                                    {item.status.toUpperCase()}
                                                </span>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review */}
                    {currentStep === 4 && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        Progress (%)
                                        <HelpIcon content="Overall installation progress" />
                                    </Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.progress}
                                        onChange={(e) => updateFormData('progress', parseInt(e.target.value) || 0)}
                                    />
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all"
                                            style={{ width: `${formData.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={formData.status} onValueChange={(v) => updateFormData('status', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="not_started">Not Started</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="on_hold">On Hold</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="delayed">Delayed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Material Availability</Label>
                                    <Select value={formData.materialStatus} onValueChange={(v) => updateFormData('materialStatus', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="partial">Partial</SelectItem>
                                            <SelectItem value="not_available">Not Available</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tools Required</Label>
                                    <Input
                                        value={formData.toolsRequired}
                                        onChange={(e) => updateFormData('toolsRequired', e.target.value)}
                                        placeholder="e.g., Wrench Set, Multimeter, etc."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Remarks</Label>
                                <Textarea
                                    value={formData.remarks}
                                    onChange={(e) => updateFormData('remarks', e.target.value)}
                                    placeholder="Any additional remarks or notes"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Issues (if any)</Label>
                                <Textarea
                                    value={formData.issues}
                                    onChange={(e) => updateFormData('issues', e.target.value)}
                                    placeholder="Document any issues encountered"
                                    rows={2}
                                />
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                                <Card className="bg-gray-50">
                                    <CardContent className="pt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Package className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium">Equipment</span>
                                        </div>
                                        <p className="text-xs text-gray-600">{formData.equipmentItem || 'Not selected'}</p>
                                        <p className="text-xs text-gray-500">{formData.location}</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-50">
                                    <CardContent className="pt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium">Schedule</span>
                                        </div>
                                        <p className="text-xs text-gray-600">{formData.plannedStartDate || 'Not set'}</p>
                                        <p className="text-xs text-gray-500">to {formData.plannedEndDate || 'Not set'}</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-50">
                                    <CardContent className="pt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium">Team</span>
                                        </div>
                                        <p className="text-xs text-gray-600">{formData.teamMembers.length} members</p>
                                        <p className="text-xs text-gray-500">Supervisor: {formData.supervisor || 'Not assigned'}</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-50">
                                    <CardContent className="pt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ClipboardCheck className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium">Checklists</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Safety: {safetyProgress}/{formData.safetyChecklist.length}</p>
                                        <p className="text-xs text-gray-500">Quality: {qualityProgress}/{formData.qualityChecklist.length}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-800">
                                    <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(formData.status)}`}>
                                        {formData.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <span className="mx-2">|</span>
                                    <span className="font-medium">{formData.progress}% Complete</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>

                {currentStep < STEPS.length - 1 ? (
                    <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                        Next Step
                        <CheckCircle className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                        <Wrench className="w-4 h-4 mr-2" />
                        Create Installation Activity
                    </Button>
                )}
            </div>
        </div>
    );
}
