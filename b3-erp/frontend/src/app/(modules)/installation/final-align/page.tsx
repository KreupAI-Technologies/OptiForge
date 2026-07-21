'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { projectManagementService, Project } from '@/services/ProjectManagementService';
import {
    ArrowLeft,
    ArrowRight,
    Crosshair,
    CheckCircle2,
    AlertTriangle,
    Maximize,
    Search,
    Loader2,
    FolderKanban,
    Building2
} from 'lucide-react';

interface ProjectInfo {
    id: string;
    name: string;
    clientName: string;
    status: string;
}

interface FinalCheck {
    id: string;
    description: string;
    status: 'Pending' | 'Perfect' | 'Adjusted';
}

const CHECKLIST_TYPE = 'final-align';

function FinalAlignPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    const [checks, setChecks] = useState<FinalCheck[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showIssueModal, setShowIssueModal] = useState(false);
    const [issueTitle, setIssueTitle] = useState('');
    const [issueDescription, setIssueDescription] = useState('');
    const [issueSeverity, setIssueSeverity] = useState('Medium');
    const [isReportingIssue, setIsReportingIssue] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) loadChecklist(selectedProject.id);
    }, [selectedProject]);

    const loadChecklist = async (projectId: string) => {
        try {
            const items = await projectManagementService.getInstallationChecklist(projectId, CHECKLIST_TYPE);
            setChecks(items.map((it) => ({
                id: it.id,
                description: it.label,
                status: (it.status as FinalCheck['status']) || 'Pending',
            })));
        } catch (error) {
            console.error('Error loading final alignment checklist:', error);
        }
    };

    const loadProjects = async () => {
        try {
            const allProjects = await projectManagementService.getProjects();
            const projectInfos: ProjectInfo[] = allProjects.map((p: Project) => ({
                id: p.id,
                name: p.name || `Project ${p.id}`,
                clientName: p.clientName || 'Unknown Client',
                status: p.status || 'active',
            }));
            setProjects(projectInfos);

            const projectId = searchParams.get('projectId');
            if (projectId) {
                const found = projectInfos.find(p => p.id === projectId);
                if (found) setSelectedProject(found);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setIsLoadingProjects(false);
        }
    };

    const handleProjectSelect = (project: ProjectInfo) => {
        setSelectedProject(project);
        toast({ title: 'Project Selected', description: `Viewing final alignment for ${project.name}` });
    };

    const handleChangeProject = () => setSelectedProject(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleStatusChange = (id: string, status: FinalCheck['status']) => {
        setChecks(checks.map(c =>
            c.id === id ? { ...c, status } : c
        ));
        projectManagementService.updateInstallationChecklistItem(id, { status }).catch((error) => {
            console.error('Error saving final alignment status:', error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save check. Please retry.' });
        });
    };

    const handleComplete = async () => {
        if (!selectedProject) return;
        setIsSubmitting(true);
        try {
            const done = checks.filter(c => c.status !== 'Pending').length;
            await projectManagementService.completeInstallationChecklist(selectedProject.id, CHECKLIST_TYPE);
            await projectManagementService.createInstallDailyReport({
                projectId: selectedProject.id,
                workDone: `Final alignment complete: ${done}/${checks.length} checks passed (${checks.map(c => c.description).join(', ')}).`,
                overallProgress: 90,
            });
            toast({
                title: 'Final Alignment Complete',
                description: 'All alignment checks passed. Progress saved.',
            });
            router.push(`/installation/photo-doc?projectId=${selectedProject.id}`);
        } catch (error) {
            console.error('Error saving final alignment progress:', error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not record final alignment progress. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReportIssue = async () => {
        if (!selectedProject || !issueTitle.trim()) return;
        setIsReportingIssue(true);
        try {
            await projectManagementService.createSiteIssue({
                projectId: selectedProject.id,
                projectName: selectedProject.name,
                issueTitle: issueTitle.trim(),
                issueType: 'Alignment',
                severity: issueSeverity,
                description: issueDescription.trim(),
                status: 'Open',
                reportedDate: new Date().toISOString(),
            });
            toast({ title: 'Issue Reported', description: 'Alignment issue logged to site issues.' });
            setShowIssueModal(false);
            setIssueTitle('');
            setIssueDescription('');
            setIssueSeverity('Medium');
        } catch (error) {
            console.error('Error reporting alignment issue:', error);
            toast({ variant: 'destructive', title: 'Report Failed', description: 'Could not log the issue. Please retry.' });
        } finally {
            setIsReportingIssue(false);
        }
    };

    const getStatusBadge = (status: FinalCheck['status']) => {
        const styles = {
            'Perfect': 'bg-green-100 text-green-800 hover:bg-green-100',
            'Pending': 'bg-gray-100 text-gray-800 hover:bg-gray-100',
            'Adjusted': 'bg-blue-100 text-blue-800 hover:bg-blue-100'
        };
        return <Badge className={styles[status]}>{status}</Badge>;
    };

    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Crosshair className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Final Alignment</h1>
                                <p className="text-sm text-gray-600">Select a project for final alignment</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>

                    {isLoadingProjects ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                            <span className="ml-2 text-gray-600">Loading projects...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredProjects.map((project) => (
                                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProjectSelect(project)}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <FolderKanban className="h-5 w-5 text-orange-600" />
                                                <CardTitle className="text-base">{project.name}</CardTitle>
                                            </div>
                                            <Badge variant="outline" className="capitalize">{project.status}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Building2 className="h-4 w-4" />
                                            <span>{project.clientName}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full bg-orange-600 hover:bg-orange-700">Select Project</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-2 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Crosshair className="h-8 w-8 text-orange-600" />
                        8.7 Final Alignment
                    </h1>
                    <p className="text-muted-foreground">
                        {selectedProject.name} • {selectedProject.clientName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleChangeProject}>
                        Change Project
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/installation/accessory-fix?projectId=${selectedProject.id}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                        onClick={handleComplete}
                        disabled={checks.some(c => c.status === 'Pending') || isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Next: Photo Doc <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Alignment Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {checks.map((check) => (
                                <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                    <span className="font-medium">{check.description}</span>
                                    <div className="flex items-center gap-2">
                                        {check.status === 'Pending' ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600"
                                                    onClick={() => handleStatusChange(check.id, 'Perfect')}
                                                >
                                                    Perfect
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-blue-600"
                                                    onClick={() => handleStatusChange(check.id, 'Adjusted')}
                                                >
                                                    Adjusted
                                                </Button>
                                            </div>
                                        ) : (
                                            getStatusBadge(check.status)
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Alignment Guide</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                                <Maximize className="h-4 w-4" />
                                Critical Checkpoints
                            </h4>
                            <ul className="text-sm text-orange-700 space-y-2 list-disc list-inside">
                                <li>Ensure 3mm uniform gap between all shutters</li>
                                <li>Check horizontal alignment of drawer lines</li>
                                <li>Verify handles are perfectly level</li>
                                <li>Confirm skirting is flush with floor</li>
                                <li>Test all soft-close mechanisms after alignment</li>
                            </ul>
                        </div>
                        <div className="border-2 border-dashed rounded-lg p-3 text-center">
                            <p className="text-sm text-muted-foreground mb-2">
                                Use laser level for long horizontal lines
                            </p>
                            <Button variant="outline" size="sm" onClick={() => setShowIssueModal(true)}>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Report Alignment Issue
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {showIssueModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-4 py-3 border-b flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <h3 className="font-semibold text-lg">Report Alignment Issue</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <input
                                    type="text"
                                    value={issueTitle}
                                    onChange={(e) => setIssueTitle(e.target.value)}
                                    placeholder="e.g. Shutter gap exceeds tolerance"
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Severity</label>
                                <select
                                    value={issueSeverity}
                                    onChange={(e) => setIssueSeverity(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    value={issueDescription}
                                    onChange={(e) => setIssueDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Describe the alignment deviation…"
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="px-4 py-3 border-t flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowIssueModal(false)} disabled={isReportingIssue}>
                                Cancel
                            </Button>
                            <Button onClick={handleReportIssue} disabled={!issueTitle.trim() || isReportingIssue}>
                                {isReportingIssue && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Issue
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function FinalAlignPage() {
    return (
        <Suspense fallback={<div>Loading alignment...</div>}>
            <FinalAlignPageContent />
        </Suspense>
    );
}
