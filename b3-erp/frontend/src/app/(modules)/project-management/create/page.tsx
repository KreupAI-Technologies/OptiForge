'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { exportToCsv } from '@/lib/export';
import {
    Save,
    X,
    Plus,
    Trash2,
    Building2,
    User,
    Calendar,
    DollarSign,
    FileText,
    Users,
    Package,
    Layers,
    Copy,
    Settings,
    Share,
    FileDown,
    FileUp,
    Archive,
    Star,
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
import { useProjectContext } from '@/context/ProjectContext';
import { projectManagementService } from '@/services/ProjectManagementService';

interface TeamMember {
    id: string;
    role: string;
    name: string;
    allocation: number;
}

interface Deliverable {
    id: string;
    name: string;
    type: string;
    plannedDate: string;
}

export default function CreateProjectPage() {
    const { loadProject } = useProjectContext();
    const router = useRouter();

    // Basic Information
    const [projectName, setProjectName] = useState('');
    const [projectType, setProjectType] = useState('Commercial Kitchen');
    const [salesOrderNumber, setSalesOrderNumber] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [awardDate, setAwardDate] = useState('');
    const [clientContactPerson, setClientContactPerson] = useState('');
    const [clientContactEmail, setClientContactEmail] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);

    // Timeline & Budget
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [estimatedBudget, setEstimatedBudget] = useState('');
    const [contractValue, setContractValue] = useState('');
    const [currency, setCurrency] = useState('INR');

    // Project Management
    const [projectManager, setProjectManager] = useState('');
    const [priority, setPriority] = useState('P2');
    const [department, setDepartment] = useState('Project Management');

    // Team Members
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        { id: '1', role: 'Project Manager', name: '', allocation: 100 },
    ]);

    // Deliverables
    const [deliverables, setDeliverables] = useState<Deliverable[]>([
        { id: '1', name: '', type: 'Equipment', plannedDate: '' },
    ]);

    // Scope & Requirements
    const [scope, setScope] = useState('');
    const [specialRequirements, setSpecialRequirements] = useState('');
    const [safetyRequirements, setSafetyRequirements] = useState('');

    // Template Modal States
    const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
    const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
    const [showDuplicateTemplateModal, setShowDuplicateTemplateModal] = useState(false);
    const [showDeleteTemplateModal, setShowDeleteTemplateModal] = useState(false);
    const [showTemplateSettingsModal, setShowTemplateSettingsModal] = useState(false);
    const [showShareTemplateModal, setShowShareTemplateModal] = useState(false);
    const [showExportTemplateModal, setShowExportTemplateModal] = useState(false);
    const [showImportTemplateModal, setShowImportTemplateModal] = useState(false);
    const [showArchiveTemplateModal, setShowArchiveTemplateModal] = useState(false);
    const [showFavoriteTemplateModal, setShowFavoriteTemplateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);

    // Functions
    const addTeamMember = () => {
        setTeamMembers([
            ...teamMembers,
            {
                id: Date.now().toString(),
                role: '',
                name: '',
                allocation: 100,
            },
        ]);
    };

    const removeTeamMember = (id: string) => {
        setTeamMembers(teamMembers.filter(member => member.id !== id));
    };

    const updateTeamMember = (id: string, field: keyof TeamMember, value: any) => {
        setTeamMembers(teamMembers.map(member =>
            member.id === id ? { ...member, [field]: value } : member
        ));
    };

    const addDeliverable = () => {
        setDeliverables([
            ...deliverables,
            {
                id: Date.now().toString(),
                name: '',
                type: 'Equipment',
                plannedDate: '',
            },
        ]);
    };

    const removeDeliverable = (id: string) => {
        setDeliverables(deliverables.filter(del => del.id !== id));
    };

    const updateDeliverable = (id: string, field: keyof Deliverable, value: any) => {
        setDeliverables(deliverables.map(del =>
            del.id === id ? { ...del, [field]: value } : del
        ));
    };

    const calculateDuration = () => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return diff > 0 ? `${diff} days` : 'Invalid date range';
        }
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const projectData = {
            projectName,
            projectType,
            customer: customerName,
            location,
            salesOrderNumber,
            projectManager,
            startDate,
            endDate,
            budget: parseFloat(estimatedBudget) || 0,
            priority: priority === 'P1' ? 'critical' : priority === 'P2' ? 'high' : priority === 'P3' ? 'medium' : 'low',
            awardDate,
            clientContactPerson,
            clientContactEmail,
        };

        try {
            // 1. Create Project
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData),
            });

            if (!response.ok) throw new Error('Failed to create project');
            const newProject = await response.json();

            // 2. Upload Attachments if any
            if (attachments.length > 0) {
                const formData = new FormData();
                attachments.forEach(file => formData.append('files', file));
                formData.append('category', 'confirmation');

                await fetch(`/api/projects/${newProject.id}/attachments`, {
                    method: 'POST',
                    body: formData,
                });
            }

            // 3. Initialize global ProjectContext
            loadProject({
                id: newProject.id,
                name: newProject.name,
                projectType: newProject.projectType as any,
                customerName: newProject.clientName,
                status: 'Planning'
            });

            // 4. Redirect
            router.push('/project-management');
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project. Please try again.');
        }
    };

    const handleCancel = () => {
        router.push('/project-management');
    };

    // Template Modal Handlers
    const [templateSaving, setTemplateSaving] = useState(false);
    const runTemplateSave = async (fn: () => Promise<unknown>, onDone: () => void) => {
        setTemplateSaving(true);
        try {
            const result = await fn();
            if (result === null) throw new Error('Request failed');
            onDone();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save template. Please try again.');
        } finally {
            setTemplateSaving(false);
        }
    };

    const handleCreateTemplate = (data: any) => runTemplateSave(
        () => projectManagementService.createPmTemplate(data),
        () => setShowCreateTemplateModal(false),
    );

    const handleEditTemplate = (data: any) => runTemplateSave(
        () => projectManagementService.updatePmTemplate(String(selectedTemplate!.id), data),
        () => { setShowEditTemplateModal(false); setSelectedTemplate(null); },
    );

    const handleDuplicateTemplate = (data: any) => runTemplateSave(
        () => projectManagementService.createPmTemplate({ ...selectedTemplate, ...data, id: undefined }),
        () => { setShowDuplicateTemplateModal(false); setSelectedTemplate(null); },
    );

    const handleDeleteTemplate = async () => {
        const templateId = selectedTemplate?.id;
        try {
            if (templateId) {
                await projectManagementService.deletePmTemplate(String(templateId));
            }
        } catch (err) {
            alert('Failed to delete template. Please try again.');
        } finally {
            setShowDeleteTemplateModal(false);
            setSelectedTemplate(null);
        }
    };

    const handleTemplateSettings = (data: any) => runTemplateSave(
        () => projectManagementService.updatePmTemplate(String(selectedTemplate!.id), data),
        () => { setShowTemplateSettingsModal(false); setSelectedTemplate(null); },
    );

    const handleShareTemplate = (data: any) => runTemplateSave(
        () => projectManagementService.updatePmTemplate(String(selectedTemplate!.id), data),
        () => { setShowShareTemplateModal(false); setSelectedTemplate(null); },
    );

    const handleExportTemplate = (_data: any) => {
        exportToCsv('project-template', selectedTemplate ? [selectedTemplate] : []);
        setShowExportTemplateModal(false);
        setSelectedTemplate(null);
    };

    const handleImportTemplate = (_file: File | null) => {
        // NEEDS BACKEND: no template import endpoint; file parsing must be server-side.
        alert('Template import is not available yet.');
        setShowImportTemplateModal(false);
    };

    const handleArchiveTemplate = () => runTemplateSave(
        () => projectManagementService.updatePmTemplate(String(selectedTemplate!.id), { status: 'archived' } as any),
        () => { setShowArchiveTemplateModal(false); setSelectedTemplate(null); },
    );

    const handleToggleFavorite = () => runTemplateSave(
        () => projectManagementService.updatePmTemplate(String(selectedTemplate!.id), { isFavorite: !selectedTemplate?.isFavorite } as any),
        () => { setShowFavoriteTemplateModal(false); setSelectedTemplate(null); },
    );

    // Helper functions to open modals with context
    const openEditTemplateModal = (template: any) => {
        setSelectedTemplate(template);
        setShowEditTemplateModal(true);
    };

    const openDuplicateTemplateModal = (template: any) => {
        setSelectedTemplate(template);
        setShowDuplicateTemplateModal(true);
    };

    return (
        <div className="w-full h-screen overflow-y-auto overflow-x-hidden">
            <div className="w-full px-3 py-2">
                {/* Page Header with Template Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Fill in the project details or start from a template to create a new project
                            </p>
                        </div>
                    </div>

                    {/* Template Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setShowImportTemplateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all border border-blue-200"
                        >
                            <Layers className="w-4 h-4" />
                            Use Template
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowCreateTemplateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-lg hover:from-green-100 hover:to-green-200 transition-all border border-green-200"
                        >
                            <Plus className="w-4 h-4" />
                            Create Template
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowImportTemplateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-all border border-indigo-200"
                        >
                            <FileUp className="w-4 h-4" />
                            Import Template
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowTemplateSettingsModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all border border-orange-200"
                        >
                            <Settings className="w-4 h-4" />
                            Template Settings
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Taj Hotel Commercial Kitchen Installation"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={projectType}
                                    onChange={(e) => setProjectType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="Commercial Kitchen">Commercial Kitchen</option>
                                    <option value="Cold Room">Cold Room</option>
                                    <option value="Switchgear">Switchgear</option>
                                    <option value="HVAC System">HVAC System</option>
                                    <option value="Modular Kitchen">Modular Kitchen</option>
                                    <option value="Food Processing">Food Processing</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sales Order Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={salesOrderNumber}
                                    onChange={(e) => setSalesOrderNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="SO-2024-XXX"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer ID
                                </label>
                                <input
                                    type="text"
                                    value={customerId}
                                    onChange={(e) => setCustomerId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="CUST-XXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Taj Hotels Limited"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Location <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Mumbai, Maharashtra"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Work Awarded Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="date"
                                        value={awardDate}
                                        onChange={(e) => setAwardDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Client Contact Person
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={clientContactPerson}
                                        onChange={(e) => setClientContactPerson(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="e.g., John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Client Contact Email
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="email"
                                        value={clientContactEmail}
                                        onChange={(e) => setClientContactEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="e.g., john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Brief description of the project scope and objectives..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Budget */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Timeline & Budget</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {startDate && endDate && (
                                <div className="md:col-span-2">
                                    <div className="bg-blue-50 rounded-lg p-3">
                                        <p className="text-sm text-blue-900">
                                            <span className="font-semibold">Project Duration:</span> {calculateDuration()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estimated Budget <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        value={estimatedBudget}
                                        onChange={(e) => setEstimatedBudget(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contract Value <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        value={contractValue}
                                        onChange={(e) => setContractValue(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>

                            {estimatedBudget && contractValue && (
                                <div className="md:col-span-2">
                                    <div className="bg-green-50 rounded-lg p-3">
                                        <p className="text-sm text-green-900">
                                            <span className="font-semibold">Estimated Profit Margin:</span>{' '}
                                            {(((parseFloat(contractValue) - parseFloat(estimatedBudget)) / parseFloat(contractValue)) * 100).toFixed(2)}%
                                            {' '}(₹{(parseFloat(contractValue) - parseFloat(estimatedBudget)).toLocaleString('en-IN')})
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Project Management */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Project Management</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Manager <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={projectManager}
                                    onChange={(e) => setProjectManager(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Manager</option>
                                    <option value="Rajesh Kumar">Rajesh Kumar</option>
                                    <option value="Priya Sharma">Priya Sharma</option>
                                    <option value="Amit Patel">Amit Patel</option>
                                    <option value="Sunita Reddy">Sunita Reddy</option>
                                    <option value="Manoj Kumar">Manoj Kumar</option>
                                    <option value="Neha Gupta">Neha Gupta</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Priority <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="P1">P1 - Critical</option>
                                    <option value="P2">P2 - High</option>
                                    <option value="P3">P3 - Medium</option>
                                    <option value="P4">P4 - Low</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Department
                                </label>
                                <select
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="Project Management">Project Management</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
                            </div>
                            <button
                                type="button"
                                onClick={addTeamMember}
                                className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Member
                            </button>
                        </div>

                        <div className="space-y-3">
                            {teamMembers.map((member, index) => (
                                <div key={member.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                                            <input
                                                type="text"
                                                value={member.role}
                                                onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="e.g., Site Supervisor"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={member.name}
                                                onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="Employee name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Allocation (%)</label>
                                            <input
                                                type="number"
                                                value={member.allocation}
                                                onChange={(e) => updateTeamMember(member.id, 'allocation', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                min="0"
                                                max="100"
                                            />
                                        </div>
                                    </div>
                                    {teamMembers.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeTeamMember(member.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"

                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key Deliverables */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Key Deliverables</h2>
                            </div>
                            <button
                                type="button"
                                onClick={addDeliverable}
                                className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Deliverable
                            </button>
                        </div>

                        <div className="space-y-3">
                            {deliverables.map((deliverable) => (
                                <div key={deliverable.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Deliverable Name</label>
                                            <input
                                                type="text"
                                                value={deliverable.name}
                                                onChange={(e) => updateDeliverable(deliverable.id, 'name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="e.g., Equipment Installation"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                                            <select
                                                value={deliverable.type}
                                                onChange={(e) => updateDeliverable(deliverable.id, 'type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            >
                                                <option value="Equipment">Equipment</option>
                                                <option value="Installation">Installation</option>
                                                <option value="Documentation">Documentation</option>
                                                <option value="Training">Training</option>
                                                <option value="Service">Service</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Planned Date</label>
                                            <input
                                                type="date"
                                                value={deliverable.plannedDate}
                                                onChange={(e) => updateDeliverable(deliverable.id, 'plannedDate', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                    </div>
                                    {deliverables.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeDeliverable(deliverable.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"

                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scope & Requirements */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Scope & Requirements</h2>
                        </div>

                        <div className="space-y-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Scope
                                </label>
                                <textarea
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Define the project scope, inclusions, and exclusions..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Special Requirements
                                </label>
                                <textarea
                                    value={specialRequirements}
                                    onChange={(e) => setSpecialRequirements(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Any special client requirements, certifications needed, etc..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Safety Requirements
                                </label>
                                <textarea
                                    value={safetyRequirements}
                                    onChange={(e) => setSafetyRequirements(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Safety protocols, PPE requirements, site restrictions..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Phase 1.2: Handover Package & Attachments */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <FileUp className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Handover Package (Confirmation DOCS)</h2>
                        </div>

                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center transition-colors hover:border-blue-400">
                            <input
                                type="file"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                                    }
                                }}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                <Plus className="w-12 h-12 text-blue-500 mb-2" />
                                <span className="text-sm text-gray-700 font-semibold text-center">Click to upload confirmation emails or award letters</span>
                                <span className="text-xs text-gray-500 mt-1">PDF, JPG, PNG supported (Max 10MB)</span>
                            </label>

                            {attachments.length > 0 && (
                                <div className="mt-6 w-full max-w-md">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-bold text-gray-800">Selected Files ({attachments.length}):</p>
                                        <button
                                            type="button"
                                            onClick={() => setAttachments([])}
                                            className="text-xs text-red-600 hover:underline"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <ul className="space-y-2">
                                        {attachments.map((file, i) => (
                                            <li key={i} className="text-sm text-blue-700 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-1">
                                                <div className="flex items-center gap-3 truncate">
                                                    <FileText className="w-4 h-4 flex-shrink-0" />
                                                    <span className="truncate font-medium">{file.name}</span>
                                                    <span className="text-xs text-blue-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                                                    className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                        {/* Template Quick Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCreateTemplateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all border border-purple-200"
                            >
                                <FileDown className="w-4 h-4" />
                                Save as Template
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowImportTemplateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 rounded-lg hover:from-cyan-100 hover:to-cyan-200 transition-all border border-cyan-200"
                            >
                                <Layers className="w-4 h-4" />
                                Use Template
                            </button>
                        </div>

                        {/* Main Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <X className="w-5 h-5" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Save className="w-5 h-5" />
                                Create Project
                            </button>
                        </div>
                    </div>
                </form>

                {/* Template Modals */}
                <CreateTemplateModal
                    isOpen={showCreateTemplateModal}
                    onClose={() => setShowCreateTemplateModal(false)}
                    onCreate={handleCreateTemplate}
                />

                <EditTemplateModal
                    isOpen={showEditTemplateModal}
                    onClose={() => setShowEditTemplateModal(false)}
                    onUpdate={handleEditTemplate}
                    template={selectedTemplate}
                />

                <DuplicateTemplateModal
                    isOpen={showDuplicateTemplateModal}
                    onClose={() => setShowDuplicateTemplateModal(false)}
                    onDuplicate={handleDuplicateTemplate}
                    template={selectedTemplate}
                />

                <DeleteTemplateModal
                    isOpen={showDeleteTemplateModal}
                    onClose={() => setShowDeleteTemplateModal(false)}
                    onDelete={handleDeleteTemplate}
                    template={selectedTemplate}
                />

                <TemplateSettingsModal
                    isOpen={showTemplateSettingsModal}
                    onClose={() => setShowTemplateSettingsModal(false)}
                    onSave={handleTemplateSettings}
                    template={selectedTemplate}
                />

                <ShareTemplateModal
                    isOpen={showShareTemplateModal}
                    onClose={() => setShowShareTemplateModal(false)}
                    onShare={handleShareTemplate}
                    template={selectedTemplate}
                />

                <ExportTemplateModal
                    isOpen={showExportTemplateModal}
                    onClose={() => setShowExportTemplateModal(false)}
                    onExport={handleExportTemplate}
                    template={selectedTemplate}
                />

                <ImportTemplateModal
                    isOpen={showImportTemplateModal}
                    onClose={() => setShowImportTemplateModal(false)}
                    onImport={handleImportTemplate}
                />

                <ArchiveTemplateModal
                    isOpen={showArchiveTemplateModal}
                    onClose={() => setShowArchiveTemplateModal(false)}
                    onArchive={handleArchiveTemplate}
                    template={selectedTemplate}
                />

                <FavoriteTemplateModal
                    isOpen={showFavoriteTemplateModal}
                    onClose={() => setShowFavoriteTemplateModal(false)}
                    onToggleFavorite={handleToggleFavorite}
                    template={selectedTemplate}
                />
            </div>
        </div>
    );
}
