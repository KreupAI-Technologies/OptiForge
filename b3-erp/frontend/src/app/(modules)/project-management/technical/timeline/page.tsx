'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, Calculator, Clock, CheckCircle, AlertTriangle, Layers, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { projectManagementService, Project, TechnicalDrawingTimeline } from '@/services/ProjectManagementService';

export default function DrawingTimelinePage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculator State
  const [complexity, setComplexity] = useState<'Low' | 'Medium' | 'High' | 'Complex'>('Medium');
  const [resources, setResources] = useState('2');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedDays, setEstimatedDays] = useState(0);
  const [completionDate, setCompletionDate] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    } else {
      loadProjects();
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedProject) {
      calculateTimeline();
    }
  }, [complexity, resources, startDate, selectedProject]);

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
      const [project, tData] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getDrawingTimeline(id)
      ]);
      setSelectedProject(project);

      if (tData) {
        setComplexity(tData.complexity);
        setResources(tData.resources.toString());
        setStartDate(tData.startDate);
        setEstimatedDays(tData.estimatedDays);
        setCompletionDate(tData.completionDate);
        setIsConfirmed(tData.isConfirmed);
      } else {
        setIsConfirmed(false);
        // Default values already set
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details.",
      });
      router.push('/project-management/technical/timeline');
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeline = () => {
    let baseDays = 5; // Medium complexity default
    if (complexity === 'Low') baseDays = 3;
    if (complexity === 'High') baseDays = 10;
    if (complexity === 'Complex') baseDays = 18;

    const resCount = parseInt(resources || '1');
    const resourceFactor = 2 / (resCount > 0 ? resCount : 1); // Base 2 designers
    const totalDays = Math.ceil(baseDays * resourceFactor);

    setEstimatedDays(totalDays);

    const start = new Date(startDate);
    const end = new Date(start);
    let daysAdded = 0;

    // Add working days only (skip weekends)
    while (daysAdded < totalDays) {
      end.setDate(end.getDate() + 1);
      if (end.getDay() !== 0 && end.getDay() !== 6) {
        daysAdded++;
      }
    }

    setCompletionDate(end.toISOString().split('T')[0]);
  };

  const handleConfirm = async () => {
    try {
      const timelineData: TechnicalDrawingTimeline = {
        projectId: projectId!,
        complexity,
        resources: parseInt(resources),
        startDate,
        estimatedDays,
        completionDate,
        isConfirmed: true,
      };

      await projectManagementService.updateDrawingTimeline(timelineData);
      setIsConfirmed(true);

      toast({
        title: "Timeline Confirmed",
        description: `Drawing schedule for ${selectedProject?.name} set to end on ${completionDate}`,
      });

      setTimeout(() => {
        router.push('/project-management/technical/drawings');
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save timeline confirmation.",
      });
    }
  };

  if (!projectId) {
    return (
      <div className="w-full py-2 space-y-6 px-3">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Select Project for Timeline</h1>
            <p className="text-sm text-gray-500">Step 3.3: Set technical drawing deadline</p>
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
                      <span>Address:</span>
                      <span className="font-medium truncate ml-2">{project.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    onClick={() => router.push(`/project-management/technical/timeline?projectId=${project.id}`)}
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

  return (
    <div className="w-full py-2 space-y-4 px-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/project-management/technical/timeline')} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Drawing Timeline Estimation</h1>
            <p className="text-sm text-gray-500">{selectedProject?.name} • Step 3.3</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/project-management/technical/timeline')}>
          Change Project
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500">Loading calculator...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  Project Complexity & Resources
                </CardTitle>
                <CardDescription>Adjust variables to generate a realistic technical schedule</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-gray-500">Design Complexity</Label>
                    <Select value={complexity} onValueChange={(v: any) => setComplexity(v)} disabled={isConfirmed}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low - Standard Modular Layout</SelectItem>
                        <SelectItem value="Medium">Medium - Semi-Custom Units</SelectItem>
                        <SelectItem value="High">High - Bespoke Luxury Joinery</SelectItem>
                        <SelectItem value="Complex">Complex - Full Architectural Woodwork</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-gray-500">Assigned Drafters</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        className="pl-9 h-11"
                        value={resources}
                        disabled={isConfirmed}
                        onChange={(e) => setResources(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-gray-500">Timeline Start Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        className="pl-9 h-11"
                        value={startDate}
                        disabled={isConfirmed}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-amber-900">Important Consideration</h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      This calculation assumes 8-hour working days and excludes weekends. It does not account for public holidays or delayed client approvals on concepts.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-none bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Calculator className="w-5 h-5 text-blue-400" />
                  Estimation Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                <div className="space-y-1 text-center py-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Planned Duration</p>
                  <p className="text-4xl font-black text-white">{estimatedDays} <span className="text-lg font-normal text-slate-400 italic">Days</span></p>
                </div>

                <div className="space-y-4 px-2">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm italic">Start:</span>
                    </div>
                    <span className="font-mono text-blue-300">{startDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm italic font-bold text-blue-400">Target End:</span>
                    </div>
                    <span className="text-xl font-bold text-green-400 underline decoration-green-500/30 underline-offset-4">{completionDate}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 group"
                  onClick={handleConfirm}
                  disabled={isConfirmed}
                >
                  {isConfirmed ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Timeline Approved
                    </>
                  ) : (
                    <>
                      Confirm & Commit Schedule
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {isConfirmed && (
              <div className="p-4 rounded-xl border border-green-100 bg-green-50/50 flex flex-col items-center text-center space-y-2">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-green-900 uppercase">Status: Scheduled</h4>
                  <p className="text-[10px] text-green-700">The technical team has been notified of this deadline.</p>
                </div>
                <Button variant="link" className="text-xs text-blue-600 h-6 p-0" onClick={() => router.push('/project-management/technical/drawings')}>
                  Go to Drawing Management
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
