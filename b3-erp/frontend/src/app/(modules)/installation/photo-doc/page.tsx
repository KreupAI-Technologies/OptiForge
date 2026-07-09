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
    Camera,
    Image as ImageIcon,
    Upload,
    Trash2,
    Search,
    Loader2,
    FolderKanban,
    Building2
} from 'lucide-react';

// Owning-record type used to key installation photos in the attachments store.
const PHOTO_ENTITY_TYPE = 'installation-photo';

interface ProjectInfo {
    id: string;
    name: string;
    clientName: string;
    status: string;
}

function PhotoDocPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    const [photos, setPhotos] = useState<Attachment[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            loadPhotos(selectedProject.id);
        } else {
            setPhotos([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProject?.id]);

    const loadPhotos = async (projectId: string) => {
        setIsLoadingPhotos(true);
        setPhotoError(null);
        try {
            const rows = await AttachmentsService.list(PHOTO_ENTITY_TYPE, projectId);
            setPhotos(rows);
        } catch (error) {
            setPhotoError(error instanceof Error ? error.message : 'Failed to load photos');
            setPhotos([]);
        } finally {
            setIsLoadingPhotos(false);
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
        toast({ title: 'Project Selected', description: `Viewing photo documentation for ${project.name}` });
    };

    const handleChangeProject = () => setSelectedProject(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const handleSelectFilesClick = () => {
        fileInputRef.current?.click();
    };

    const handleFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedProject) return;
        const files = Array.from(e.target.files ?? []);
        // Reset the input so choosing the same file again re-triggers change.
        e.target.value = '';
        if (files.length === 0) return;

        setIsUploading(true);
        setPhotoError(null);
        try {
            await Promise.all(
                files.map((file) =>
                    AttachmentsService.upload(file, PHOTO_ENTITY_TYPE, selectedProject.id),
                ),
            );
            await loadPhotos(selectedProject.id);
            toast({
                title: 'Upload Complete',
                description: `${files.length} photo(s) added to project documentation.`,
            });
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Upload failed';
            setPhotoError(msg);
            toast({ variant: 'destructive', title: 'Upload Failed', description: msg });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setPhotoError(null);
        try {
            await AttachmentsService.remove(id);
            setPhotos((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Delete failed';
            setPhotoError(msg);
            toast({ variant: 'destructive', title: 'Delete Failed', description: msg });
        }
    };

    const handleComplete = async () => {
        if (!selectedProject) return;
        setIsSubmitting(true);
        try {
            await projectManagementService.createInstallDailyReport({
                projectId: selectedProject.id,
                workDone: `Photo documentation captured: ${photos.length} photo(s).`,
                progressPhotos: photos.map((p) => AttachmentsService.downloadUrl(p.id)),
                overallProgress: 92,
            });
            toast({
                title: 'Documentation Complete',
                description: 'Project photos saved successfully.',
            });
            router.push(`/installation/final-inspection?projectId=${selectedProject.id}`);
        } catch (error) {
            console.error('Error saving photo documentation:', error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not save photo documentation. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!selectedProject) {
        return (
            <div className="w-full h-screen overflow-y-auto bg-gray-50">
                <div className="px-4 py-4 space-y-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Camera className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Photo Documentation</h1>
                                <p className="text-sm text-gray-600">Select a project for photo documentation</p>
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
                        <Camera className="h-8 w-8 text-orange-600" />
                        8.8 Photo Documentation
                    </h1>
                    <p className="text-muted-foreground">
                        {selectedProject.name} • {selectedProject.clientName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleChangeProject}>
                        Change Project
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/installation/final-align?projectId=${selectedProject.id}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                        onClick={handleComplete}
                        disabled={photos.length === 0 || isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Next: Final Inspection <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="md:col-span-3">
                    <CardContent className="pt-6">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFilesChosen}
                        />
                        <div
                            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isUploading ? 'opacity-60 cursor-wait' : 'hover:bg-muted/50 cursor-pointer'}`}
                            onClick={isUploading ? undefined : handleSelectFilesClick}
                        >
                            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                                {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                            </div>
                            <h3 className="font-semibold text-lg mb-1">Upload Project Photos</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                Click to select one or more images
                            </p>
                            <Button disabled={isUploading} onClick={(e) => { e.stopPropagation(); handleSelectFilesClick(); }}>
                                {isUploading ? 'Uploading…' : 'Select Files'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {photoError && (
                    <div className="md:col-span-3 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-2 text-sm">
                        {photoError}
                    </div>
                )}

                {isLoadingPhotos ? (
                    <div className="md:col-span-3 flex items-center justify-center py-12 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading photos…
                    </div>
                ) : photos.length > 0 ? (
                    photos.map((photo) => {
                        const isImage = photo.mimeType?.startsWith('image/');
                        const src = AttachmentsService.downloadUrl(photo.id);
                        return (
                            <Card key={photo.id} className="overflow-hidden group">
                                <div className="aspect-video bg-gray-100 relative flex items-center justify-center">
                                    {isImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={src} alt={photo.fileName} className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-12 w-12 text-gray-300" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleDelete(photo.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-3">
                                    <div className="font-medium text-sm truncate">{photo.fileName}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {(photo.size / 1024).toFixed(0)} KB
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="md:col-span-3 text-center py-12 text-muted-foreground">
                        No photos uploaded yet. Please add documentation photos.
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PhotoDocPage() {
    return (
        <Suspense fallback={<div>Loading photo doc...</div>}>
            <PhotoDocPageContent />
        </Suspense>
    );
}
