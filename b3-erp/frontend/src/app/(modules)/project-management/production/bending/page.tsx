'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  ArrowRight,
  FoldVertical,
  FileText,
  CheckCircle
} from 'lucide-react';
import { projectManagementService, Project } from '@/services/ProjectManagementService';

interface BendingJob {
  id: string;
  partName: string;
  material: string;
  bends: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  instructions: string;
}

export default function BendingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<BendingJob[]>([]);

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
      toast({ variant: "destructive", title: "Error", description: "Failed to load projects." });
    } finally {
      setLoading(false);
    }
  };

  const loadProjectData = async (id: string) => {
    setLoading(true);
    try {
      const project = await projectManagementService.getProject(id);
      setSelectedProject(project);
      setJobs([
        { id: 'BJ-001', partName: 'Main Frame - Top', material: 'SS 304 (2mm)', bends: 4, status: 'Pending', instructions: '90° bend at 50mm, 45° bend at 150mm' },
        { id: 'BJ-002', partName: 'Side Panel - Left', material: 'MS CRCA (1.5mm)', bends: 2, status: 'In Progress', instructions: 'Standard 90° flange bends' },
        { id: 'BJ-003', partName: 'Mounting Bracket', material: 'Aluminium 5052 (3mm)', bends: 6, status: 'Completed', instructions: 'Complex multi-stage bending' },
      ]);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load project data." });
      router.push('/project-management/production/bending');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (id: string, newStatus: BendingJob['status']) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus } : job));
    toast({ title: 'Status Updated', description: `Job ${id} marked as ${newStatus}` });
  };

  // View 1: Project Selection
  if (!projectId) {
    return (
      <div className="w-full py-2 space-y-6 px-3">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Select Project for Bending</h1>
            <p className="text-sm text-gray-500 font-medium">Step 5.2: Manage bending operations and view forming instructions</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading projects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow group border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <CardHeader className="pb-3 bg-gray-50/50 border-b">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2 font-bold tracking-tighter bg-white">{project.projectCode}</Badge>
                    <Badge className={project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : ''}>{project.status}</Badge>
                  </div>
                  <CardTitle className="text-xl line-clamp-1 font-bold">{project.name}</CardTitle>
                  <CardDescription className="font-medium">{project.clientName}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400 uppercase text-[10px] tracking-widest pt-0.5">Type</span>
                      <span className="font-medium">{project.projectType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 uppercase text-[10px] tracking-widest pt-0.5">Location</span>
                      <span className="font-medium truncate ml-2 text-right">{project.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    onClick={() => router.push(`${window.location.pathname}?projectId=${project.id}`)}
                  >
                    Select Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // View 2: Main Content
  return (
    <div className="w-full py-2 space-y-4 px-3 font-sans">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push(window.location.pathname)} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <FoldVertical className="h-6 w-6 text-blue-600" />
              5.2 Bending & Forming
            </h1>
            <p className="text-sm text-gray-500 font-medium">{selectedProject?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>Change Project</Button>
          <Button onClick={() => router.push('/project-management/production/fabrication')} size="sm">
            Next: Fabrication <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading bending jobs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50 border-b">
                <CardTitle className="text-sm font-bold text-gray-900">{job.id}</CardTitle>
                <Badge variant={
                  job.status === 'Completed' ? 'default' :
                    job.status === 'In Progress' ? 'secondary' : 'outline'
                } className={`text-[10px] font-bold ${job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''
                  }`}>{job.status}</Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{job.partName}</h3>
                    <p className="text-xs text-gray-500 font-medium">{job.material}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg text-xs">
                    <div className="flex items-center gap-2 mb-1 font-bold text-gray-700 uppercase tracking-widest text-[10px]">
                      <FileText className="h-3 w-3" /> Instructions:
                    </div>
                    <p className="font-medium text-gray-600">{job.instructions}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Bends: <span className="font-bold text-gray-900">{job.bends}</span></span>
                  </div>

                  <div className="pt-2">
                    {job.status === 'Pending' && (
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => handleStatusChange(job.id, 'In Progress')}>
                        Start Bending
                      </Button>
                    )}
                    {job.status === 'In Progress' && (
                      <Button className="w-full font-bold" variant="outline" onClick={() => handleStatusChange(job.id, 'Completed')}>
                        Mark Complete
                      </Button>
                    )}
                    {job.status === 'Completed' && (
                      <Button className="w-full font-bold" variant="outline" disabled>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Completed
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
