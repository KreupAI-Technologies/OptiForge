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
  Scissors,
  AlertTriangle,
  Printer
} from 'lucide-react';
import { projectManagementService, Project } from '@/services/ProjectManagementService';

interface LaserJob {
  id: string;
  partName: string;
  material: string;
  thickness: string;
  quantity: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  logoEtchVerified: boolean;
}

export default function LaserCuttingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<LaserJob[]>([]);
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
      setJobs([
        { id: 'LJ-001', partName: 'Main Frame - Top', material: 'SS 304', thickness: '2mm', quantity: 10, status: 'Pending', logoEtchVerified: false },
        { id: 'LJ-002', partName: 'Side Panel - Left', material: 'MS CRCA', thickness: '1.5mm', quantity: 25, status: 'In Progress', logoEtchVerified: true },
        { id: 'LJ-003', partName: 'Mounting Bracket', material: 'Aluminium 5052', thickness: '3mm', quantity: 50, status: 'Completed', logoEtchVerified: true },
      ]);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load project data." });
      router.push('/project-management/production/laser-cutting');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: LaserJob['status']) => {
    const prev = jobs;
    setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus } : job));
    if (newStatus !== 'Completed' || !projectId) {
      toast({ title: 'Status Updated', description: `Job ${id} status changed to ${newStatus}` });
      return;
    }
    setSavingId(id);
    try {
      await projectManagementService.logProductionOperation({
        projectId,
        operationType: 'laser',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        yieldCount: 1,
      });
      toast({ title: 'Laser Cut Logged', description: `Job ${id} completed and logged to production.` });
    } catch (error) {
      setJobs(prev);
      toast({ variant: 'destructive', title: 'Could not log operation', description: error instanceof Error ? error.message : 'Failed to log laser operation.' });
    } finally {
      setSavingId(null);
    }
  };

  const handleLogoEtchToggle = (id: string) => {
    setJobs(jobs.map(job => {
      if (job.id === id) {
        const newValue = !job.logoEtchVerified;
        if (newValue) {
          toast({ title: 'Logo Etch Verified', description: `Logo etching confirmed for ${job.partName}. Ready for bending.` });
        }
        return { ...job, logoEtchVerified: newValue };
      }
      return job;
    }));
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Select Project for Laser Cutting</h1>
            <p className="text-sm text-gray-500 font-medium">Step 5.1: Manage laser cutting jobs and verify logo etching</p>
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
              <Scissors className="h-6 w-6 text-orange-600" />
              5.1 Laser Cutting
            </h1>
            <p className="text-sm text-gray-500 font-medium">{selectedProject?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>Change Project</Button>
          <Button onClick={() => router.push('/project-management/production/bending')} size="sm">
            Next: Bending <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading cutting jobs...</p>
        </div>
      ) : (
        <>
          <Card className="border-l-4 border-l-red-500 bg-red-50 border-none shadow-sm">
            <CardContent className="pt-4 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-700 text-sm">CRITICAL PROCESS RULE</h3>
                <p className="text-xs text-red-600">Company logo MUST be etched BEFORE bending process - this is irreversible!</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b py-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Scissors className="w-5 h-5 text-orange-600" />
                </div>
                <CardTitle className="text-lg font-bold tracking-tight">Cutting Job Queue</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/30 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <tr>
                    <th className="p-4">Job ID</th>
                    <th className="p-4">Part Name</th>
                    <th className="p-4">Material</th>
                    <th className="p-4">Qty</th>
                    <th className="p-4">Logo Etch</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-t hover:bg-blue-50/20 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{job.id}</td>
                      <td className="p-4 font-medium">{job.partName}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{job.material}</span>
                          <span className="text-xs text-gray-500">{job.thickness}</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{job.quantity}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={job.logoEtchVerified}
                            onChange={() => handleLogoEtchToggle(job.id)}
                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            id={`etch-${job.id}`}
                          />
                          <label htmlFor={`etch-${job.id}`} className={`text-xs font-bold ${job.logoEtchVerified ? 'text-green-600' : 'text-gray-500'}`}>
                            {job.logoEtchVerified ? 'Verified' : 'Pending'}
                          </label>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={
                          job.status === 'Completed' ? 'default' :
                            job.status === 'In Progress' ? 'secondary' : 'outline'
                        } className={`text-[10px] font-bold ${job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''
                          }`}>{job.status}</Badge>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex justify-end gap-2">
                          {job.status !== 'Completed' && (
                            <Button size="sm" variant="outline" className="h-8 text-xs font-bold" disabled={savingId === job.id}
                              onClick={() => handleStatusChange(job.id, job.status === 'Pending' ? 'In Progress' : 'Completed')}>
                              {savingId === job.id ? 'Saving…' : job.status === 'Pending' ? 'Start' : 'Complete'}
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
