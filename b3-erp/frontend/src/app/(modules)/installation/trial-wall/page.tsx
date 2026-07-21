'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { projectManagementService, Project } from '@/services/ProjectManagementService';
import { AttachmentsService, Attachment } from '@/services/attachments.service';
import {
    ArrowLeft,
    ArrowRight,
    LayoutGrid,
    CheckCircle2,
    Camera,
    Ruler,
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

interface TrialCheck {
    id: string;
    item: string;
    status: 'Pending' | 'Verified' | 'Adjustment Needed';
}

const CHECKLIST_TYPE = 'trial-wall';
// Owning-record type used to key trial-wall photos in the attachments store.
const PHOTO_ENTITY_TYPE = 'trial-wall-photo';

function TrialWallPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    const [checks, setChecks] = useState<TrialCheck[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [photos, setPhotos] = useState<Attachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            loadChecklist(selectedProject.id);
            loadPhotos(selectedProject.id);
        } else {
            setPhotos([]);
        }
    }, [selectedProject]);

    const loadPhotos = async (projectId: string) => {
        try {
            const rows = await AttachmentsService.list(PHOTO_ENTITY_TYPE, projectId);
            setPhotos(rows);
        } catch (error) {
            console.error('Error loading trial wall photos:', error);
            setPhotos([]);
        }
    };

    const handleCaptureClick = () => fileInputRef.current?.click();

    const handleFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedProject) return;
        const files = Array.from(e.target.files ?? []);
        e.target.value = '';
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            await Promise.all(
                files.map((file) =>
                    AttachmentsService.upload(file, PHOTO_ENTITY_TYPE, selectedProject.id),
                ),
            );
            await loadPhotos(selectedProject.id);
            toast({ title: 'Upload Complete', description: `${files.length} photo(s) added.` });
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Upload failed';
            toast({ variant: 'destructive', title: 'Upload Failed', description: msg });
        } finally {
            setIsUploading(false);
        }
    };

    const loadChecklist = async (projectId: string) => {
        try {
            const items = await projectManagementService.getInstallationChecklist(projectId, CHECKLIST_TYPE);
            setChecks(items.map((it) => ({
                id: it.id,
                item: it.label,
                status: (it.status as TrialCheck['status']) || 'Pending',
            })));
        } catch (error) {
            console.error('Error loading trial wall checklist:', error);
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
        toast({ title: 'Project Selected', description: `Viewing trial wall for ${project.name}` });
    };

    const handleChangeProject = () => setSelectedProject(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleStatusChange = (id: string, status: TrialCheck['status']) => {
        setChecks(checks.map(c =>
            c.id === id ? { ...c, status } : c
        ));
        projectManagementService.updateInstallationChecklistItem(id, { status }).catch((error) => {
            console.error('Error saving trial wall status:', error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save check. Please retry.' });
        });
    };

    const handleComplete = async () => {
        if (!selectedProject) return;
        setIsSubmitting(true);
        try {
            const verified = checks.filter(c => c.status === 'Verified').length;
            await projectManagementService.completeInstallationChecklist(selectedProject.id, CHECKLIST_TYPE);
            await projectManagementService.createInstallDailyReport({
                projectId: selectedProject.id,
                workDone: `Trial wall assembly verified: ${verified}/${checks.length} checks passed (${checks.map(c => c.item).join(', ')}).`,
                overallProgress: 50,
            });
            toast({
                title: 'Trial Wall Verified',
                description: 'Trial assembly checks completed. Progress saved.',
            });
            router.push(`/installation/accessory-fix?projectId=${selectedProject.id}`);
        } catch (error) {
            console.error('Error saving trial wall progress:', error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not record trial wall progress. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: TrialCheck['status']) => {
        const styles = {
            'Verified': 'bg-green-100 text-green-800 hover:bg-green-100',
            'Pending': 'bg-gray-100 text-gray-800 hover:bg-gray-100',
            'Adjustment Needed': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
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
                                <LayoutGrid className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Trial Wall</h1>
                                <p className="text-sm text-gray-600">Select a project for trial assembly</p>
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
                        <LayoutGrid className="h-8 w-8 text-orange-600" />
                        8.5 Trial Wall
                    </h1>
                    <p className="text-muted-foreground">
                        {selectedProject.name} • {selectedProject.clientName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleChangeProject}>
                        Change Project
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/installation/cabinet-align?projectId=${selectedProject.id}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                        onClick={handleComplete}
                        disabled={checks.some(c => c.status === 'Pending') || isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Next: Accessory Fix <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Trial Assembly Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {checks.map((check) => (
                                <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${check.status === 'Verified' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium">{check.item}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {check.status === 'Pending' ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(check.id, 'Verified')}
                                                >
                                                    Pass
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(check.id, 'Adjustment Needed')}
                                                >
                                                    Fail
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
                        <CardTitle>Visual Documentation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFilesChosen}
                        />
                        <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-2">
                            <Camera className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">Upload photos of trial assembly</p>
                            <Button variant="outline" size="sm" disabled={isUploading} onClick={handleCaptureClick}>
                                {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                {isUploading ? 'Uploading…' : 'Capture / Upload'}
                            </Button>
                        </div>
                        {photos.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                                {photos.map((photo) => (
                                    <a
                                        key={photo.id}
                                        href={AttachmentsService.downloadUrl(photo.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block aspect-square bg-gray-100 rounded overflow-hidden border"
                                        title={photo.fileName}
                                    >
                                        {photo.mimeType?.startsWith('image/') ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={AttachmentsService.downloadUrl(photo.id)} alt={photo.fileName} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-xs text-gray-400 p-1 text-center truncate">{photo.fileName}</div>
                                        )}
                                    </a>
                                ))}
                            </div>
                        )}
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                                <Ruler className="h-4 w-4" />
                                Tolerance Guidelines
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                                <li>Panel gaps should be uniform (3mm ± 0.5mm)</li>
                                <li>Vertical alignment deviation max 1mm per meter</li>
                                <li>Surface flushness deviation max 0.5mm</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function TrialWallPage() {
    return (
        <Suspense fallback={<div>Loading trial wall...</div>}>
            <TrialWallPageContent />
        </Suspense>
    );
}
