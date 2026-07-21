'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
  Camera,
  Upload
} from 'lucide-react';
import { projectManagementService, Project } from '@/services/ProjectManagementService';
import { ProductionJobService } from '@/services/ProductionJobService';
import { AttachmentsService } from '@/services/attachments.service';

const TRIAL_PHOTO_ENTITY_TYPE = 'production-trial';

interface TrialJob {
  id: string;
  jobCode: string;
  unitName: string;
  modules: number;
  status: 'Pending' | 'Assembled' | 'Verified';
  photoUploaded: boolean;
  extra: Record<string, any>;
}

export default function TrialWallPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<TrialJob[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
      const rows = await ProductionJobService.listJobs(id, 'trial');
      setJobs(rows.map((r) => ({
        id: r.id,
        jobCode: r.jobCode || r.id,
        unitName: r.partName || '',
        modules: r.extra?.modules ?? 0,
        status: (r.status as TrialJob['status']) || 'Pending',
        photoUploaded: !!r.extra?.photoUploaded,
        extra: r.extra || {},
      })));
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load project data." });
      router.push('/project-management/production/trial-wall');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: TrialJob['status']) => {
    const prev = jobs;
    const current = jobs.find(job => job.id === id);
    setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus } : job));
    // Persist the intermediate Pending→Assembled transition so it survives reload.
    if (newStatus !== 'Verified' || !projectId) {
      setSavingId(id);
      try {
        await ProductionJobService.updateStatus(id, { status: newStatus });
        toast({ title: 'Status Updated', description: `Job ${current?.jobCode || id} status changed to ${newStatus}` });
      } catch (error) {
        setJobs(prev);
        toast({ variant: 'destructive', title: 'Could not update status', description: error instanceof Error ? error.message : 'Failed to update job status.' });
      } finally {
        setSavingId(null);
      }
      return;
    }
    setSavingId(id);
    try {
      // Persist the job's own Verified status, plus the trial-report result.
      await ProductionJobService.updateStatus(id, { status: 'Verified' });
      const report = await projectManagementService.createProductionTrial(projectId, 'Trial Wall Inspector');
      if (report?.id) {
        await projectManagementService.updateProductionTrial(report.id, {
          result: 'PASS',
          notes: `Trial wall ${current?.jobCode || id} verified for fit and alignment.`,
        });
      }
      toast({ title: 'Trial Verified', description: `${current?.jobCode || id} verification recorded to production.` });
    } catch (error) {
      setJobs(prev);
      toast({ variant: 'destructive', title: 'Could not record trial', description: error instanceof Error ? error.message : 'Failed to record trial result.' });
    } finally {
      setSavingId(null);
    }
  };

  const handlePhotoChosen = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input so choosing the same file again re-triggers change.
    e.target.value = '';
    if (!file) return;
    const prev = jobs;
    const current = jobs.find(job => job.id === id);
    if (!current) return;
    setUploadingId(id);
    try {
      await AttachmentsService.upload(file, TRIAL_PHOTO_ENTITY_TYPE, id);
      // Persist the photo-uploaded flag on the job so it survives reload.
      const newExtra = { ...current.extra, photoUploaded: true };
      await ProductionJobService.updateStatus(id, { extra: newExtra });
      setJobs(jobs.map(job => job.id === id ? { ...job, photoUploaded: true, extra: newExtra } : job));
      toast({ title: 'Photo Uploaded', description: `Trial wall photo uploaded for ${current.unitName}.` });
    } catch (error) {
      setJobs(prev);
      toast({ variant: 'destructive', title: 'Upload Failed', description: error instanceof Error ? error.message : 'Failed to upload trial wall photo.' });
    } finally {
      setUploadingId(null);
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Select Project for Trial Wall</h1>
            <p className="text-sm text-gray-500 font-medium">Step 5.7: Verify assembly fit and alignment before final QC</p>
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
              <LayoutGrid className="h-6 w-6 text-orange-600" />
              5.7 Trial Wall
            </h1>
            <p className="text-sm text-gray-500 font-medium">{selectedProject?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>Change Project</Button>
          <Button onClick={() => router.push('/quality/inspections')} size="sm">
            Next: QC Inspection <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading trial assembly jobs...</p>
        </div>
      ) : (
        <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b py-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <LayoutGrid className="w-5 h-5 text-orange-600" />
              </div>
              <CardTitle className="text-lg font-bold tracking-tight">Trial Assembly Queue</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/30 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="p-4">Job ID</th>
                  <th className="p-4">Unit Name</th>
                  <th className="p-4">Modules</th>
                  <th className="p-4">Photo Proof</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-t hover:bg-blue-50/20 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{job.jobCode}</td>
                    <td className="p-4 font-medium">{job.unitName}</td>
                    <td className="p-4 font-medium">{job.modules} Units</td>
                    <td className="p-4">
                      {job.photoUploaded ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] font-bold">
                          <Camera className="w-3 h-3 mr-1" /> Uploaded
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 text-[10px] font-bold">
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant={
                        job.status === 'Verified' ? 'default' :
                          job.status === 'Assembled' ? 'secondary' : 'outline'
                      } className={`text-[10px] font-bold ${job.status === 'Verified' ? 'bg-green-100 text-green-800' :
                          job.status === 'Assembled' ? 'bg-blue-100 text-blue-800' : ''
                        }`}>{job.status}</Badge>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex justify-end gap-2">
                        {!job.photoUploaded && (
                          <>
                            <input
                              ref={(el) => { fileInputRefs.current[job.id] = el; }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoChosen(job.id, e)}
                            />
                            <Button size="sm" variant="outline" className="h-8 text-xs font-bold" disabled={uploadingId === job.id}
                              onClick={() => fileInputRefs.current[job.id]?.click()}>
                              <Upload className="h-3 w-3 mr-1" /> {uploadingId === job.id ? 'Uploading…' : 'Photo'}
                            </Button>
                          </>
                        )}
                        {job.status !== 'Verified' && (
                          <Button size="sm" variant="outline" className="h-8 text-xs font-bold" disabled={savingId === job.id}
                            onClick={() => handleStatusChange(job.id, job.status === 'Pending' ? 'Assembled' : 'Verified')}>
                            {savingId === job.id ? 'Saving…' : job.status === 'Pending' ? 'Assemble' : 'Verify'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
