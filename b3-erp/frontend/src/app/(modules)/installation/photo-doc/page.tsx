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
    Camera,
    Image as ImageIcon,
    Upload,
    Trash2,
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

interface Photo {
    id: string;
    category: 'Overall' | 'Detail' | 'Defect';
    url: string;
    description: string;
}

function PhotoDocPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

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

    const handleUpload = () => {
        const newPhoto: Photo = {
            id: Date.now().toString(),
            category: 'Overall',
            url: '/placeholder-kitchen.jpg',
            description: 'Kitchen View ' + (photos.length + 1)
        };
        setPhotos([...photos, newPhoto]);
        toast({
            title: 'Photo Uploaded',
            description: 'Image added to project documentation',
        });
    };

    const handleDelete = (id: string) => {
        setPhotos(photos.filter(p => p.id !== id));
    };

    const handleComplete = async () => {
        if (!selectedProject) return;
        setIsSubmitting(true);
        try {
            await projectManagementService.createInstallDailyReport({
                projectId: selectedProject.id,
                workDone: `Photo documentation captured: ${photos.length} photo(s) (${Array.from(new Set(photos.map(p => p.category))).join(', ') || 'general'}).`,
                progressPhotos: photos.map(p => p.url),
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
                        <div className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer" onClick={handleUpload}>
                            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                                <Upload className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-1">Upload Project Photos</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                Drag and drop or click to upload images
                            </p>
                            <Button>Select Files</Button>
                        </div>
                    </CardContent>
                </Card>

                {photos.length > 0 ? (
                    photos.map((photo) => (
                        <Card key={photo.id} className="overflow-hidden group">
                            <div className="aspect-video bg-gray-100 relative flex items-center justify-center">
                                <ImageIcon className="h-12 w-12 text-gray-300" />
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
                                <div className="font-medium text-sm">{photo.description}</div>
                                <div className="text-xs text-muted-foreground">{photo.category}</div>
                            </CardContent>
                        </Card>
                    ))
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
