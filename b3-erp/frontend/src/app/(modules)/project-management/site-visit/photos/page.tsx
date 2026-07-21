'use client';

export const dynamic = 'force-dynamic';

import { Project, projectManagementService } from '@/services/ProjectManagementService';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Upload,
  Clock,
  Trash2,
  Eye,
  Download,
  Camera,
  FileImage,
  CheckCircle,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';

interface SitePhoto {
  id: string;
  name: string;
  url: string;
  size: string;
  date: string;
}

export default function PhotoDocumentationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    } else {
      loadProjects();
    }
  }, [projectId]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectManagementService.getProjects();
      setProjects(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load projects.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProjectData = async (id: string) => {
    setLoading(true);
    try {
      const project = await projectManagementService.getProject(id);
      setSelectedProject(project);

      // The mobile-api exposes only an upload endpoint (POST /mobile-api/upload-photo/:projectId);
      // there is no photo-list (GET) route, so the gallery starts empty and populates as the
      // user uploads within this session. No seed/mock data.
      setPhotos([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details.",
      });
      router.push('/project-management/site-visit/photos');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArr = Array.from(files);
    const newPhotos: SitePhoto[] = fileArr.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      url: URL.createObjectURL(file),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));

    if (projectId) {
      try {
        await Promise.all(
          newPhotos.map((p) =>
            projectManagementService.uploadSitePhoto(projectId, {
              photoUrl: p.url,
              description: p.name,
            })
          )
        );
        setPhotos((prev) => [...newPhotos, ...prev]);
        toast({
          title: "Photos Uploaded",
          description: `Successfully uploaded ${fileArr.length} photo(s).`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Could not upload photos.",
        });
      }
    } else {
      setPhotos((prev) => [...newPhotos, ...prev]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string) => {
    // BACKEND GAP: mobile-api has no photo-DELETE endpoint, so this cannot be
    // persisted server-side. Guard with a confirm and remove from the local
    // gallery only. If a real DELETE route is added, call it here then reload.
    if (!window.confirm('Remove this photo from the gallery?')) return;
    setPhotos((prev) => prev.filter(p => p.id !== id));
    toast({
      title: "Photo Removed",
      description: "The photo has been removed from the gallery.",
    });
  };

  return (
    <div className="w-full h-screen overflow-y-auto overflow-x-hidden bg-gray-50 flex flex-col">
      {!projectId ? (
        <div className="w-full py-2 space-y-6">
          <div className="flex items-center gap-2 mb-3">
            <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Select Project for Photos</h1>
              <p className="text-sm text-gray-500">Choose a project to document with photos</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-500">Loading projects...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="mb-2">{project.projectCode}</Badge>
                      <Badge className={project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : ''}>
                        {project.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                    <CardDescription>{project.clientName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{project.projectType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-medium">{project.location}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => router.push(`/project-management/site-visit/photos?projectId=${project.id}`)}
                    >
                      View Photos
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full py-2 space-y-3 px-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => router.push('/project-management/site-visit/photos')} className="p-0 hover:bg-transparent">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Photo Documentation</h1>
                <p className="text-sm text-gray-500">
                  {selectedProject?.name} • Step 2.6: Capture site photos for reference
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/project-management/site-visit/photos')}>
                Change Project
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept="image/*"
              />
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleUploadClick}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photos
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Upload Area */}
            <Card className="md:col-span-3 border-dashed border-2 bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center cursor-pointer" onClick={handleUploadClick}>
                <div className="p-4 bg-blue-100 rounded-full mb-2 text-blue-600">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Drag & Drop or Click to Upload</h3>
                <p className="text-sm text-gray-500 mt-1">Support for JPG, PNG, HEIC</p>
              </CardContent>
            </Card>

            {/* Gallery */}
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden group relative">
                <div className="aspect-video bg-gray-200 relative">
                  {photo.url ? (
                    <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                      <ImageIcon className="w-12 h-12 opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(photo.url || '#', '_blank')}>
                      View
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(photo.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={photo.name}>
                        {photo.name}
                      </p>
                      <p className="text-xs text-gray-500">{photo.date} • {photo.size}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty gallery state */}
            {photos.length === 0 && (
              <div className="md:col-span-3 text-center py-8 text-gray-500">
                <FileImage className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No photos yet. Use “Upload Photos” to add site images.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
