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
  Wrench,
  CheckSquare,
  Users
} from 'lucide-react';
import { projectManagementService, Project } from '@/services/ProjectManagementService';
import { ProductionJobService } from '@/services/ProductionJobService';

interface AssemblyJob {
  id: string;
  assemblyName: string;
  components: string[];
  assignedTeam: string;
  status: 'Pending' | 'In Progress' | 'QC Ready' | 'Completed';
  progress: number;
}

export default function FabricationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<AssemblyJob[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

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
      const rows = await ProductionJobService.listJobs(id, 'fabrication');
      setJobs(rows.map((r) => ({
        id: r.jobCode || r.id,
        assemblyName: r.partName || '',
        components: Array.isArray(r.extra?.components) ? r.extra!.components : [],
        assignedTeam: r.extra?.assignedTeam || '',
        status: (r.status as AssemblyJob['status']) || 'Pending',
        progress: r.extra?.progress ?? 0,
      })));
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load project data." });
      router.push('/project-management/production/fabrication');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string) => {
    const current = jobs.find(j => j.id === id);
    const willComplete = current?.status === 'In Progress';
    const prev = jobs;
    setJobs(jobs.map(job => {
      if (job.id === id) {
        if (job.status === 'Pending') return { ...job, status: 'In Progress' as const, progress: 25 };
        if (job.status === 'In Progress') return { ...job, status: 'QC Ready' as const, progress: 100 };
        return job;
      }
      return job;
    }));
    // Persist an assembly production log when the job reaches QC Ready.
    if (!willComplete || !projectId) {
      toast({ title: 'Assembly Updated', description: 'Job status advanced.' });
      return;
    }
    setSavingId(id);
    try {
      await projectManagementService.logProductionOperation({
        projectId,
        operationType: 'assembly',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        yieldCount: 1,
      });
      toast({ title: 'Assembly Logged', description: `Job ${id} ready for QC and logged to production.` });
    } catch (error) {
      setJobs(prev);
      toast({ variant: 'destructive', title: 'Could not log operation', description: error instanceof Error ? error.message : 'Failed to log assembly operation.' });
    } finally {
      setSavingId(null);
    }
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Select Project for Fabrication</h1>
            <p className="text-sm text-gray-500 font-medium">Step 5.3: Track assembly progress and component integration</p>
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
              <Wrench className="h-6 w-6 text-yellow-600" />
              5.3 Fabrication & Assembly
            </h1>
            <p className="text-sm text-gray-500 font-medium">{selectedProject?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>Change Project</Button>
          <Button onClick={() => router.push('/project-management/production/welding')} size="sm">
            Next: Welding <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading assembly jobs...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b py-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 font-bold text-gray-900">
                    {job.assemblyName}
                    <Badge variant="outline" className="text-[10px] font-bold">{job.id}</Badge>
                  </CardTitle>
                  <Badge className={`text-[10px] font-bold ${job.status === 'QC Ready' ? 'bg-purple-100 text-purple-800' :
                      job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Components</h4>
                    <ul className="list-disc list-inside text-sm font-medium text-gray-700">
                      {job.components.map((comp, i) => (
                        <li key={i}>{comp}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Team</h4>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Users className="h-4 w-4" /> {job.assignedTeam}
                    </div>
                  </div>

                  <div className="flex flex-col justify-end gap-2">
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-yellow-500 h-full transition-all duration-500"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-end">
                      {job.status !== 'QC Ready' && job.status !== 'Completed' && (
                        <Button onClick={() => handleStatusUpdate(job.id)} disabled={savingId === job.id} className="bg-blue-600 hover:bg-blue-700 font-bold">
                          {savingId === job.id ? 'Saving…' : job.status === 'Pending' ? 'Start Assembly' : 'Mark Ready for QC'}
                        </Button>
                      )}
                      {job.status === 'QC Ready' && (
                        <Button variant="outline" disabled className="font-bold">
                          <CheckSquare className="mr-2 h-4 w-4" /> Awaiting QC
                        </Button>
                      )}
                    </div>
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
