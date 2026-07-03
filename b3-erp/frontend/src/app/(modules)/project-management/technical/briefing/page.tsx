'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Users, FileText, CheckCircle, Plus, X, Briefcase, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projectManagementService, Project, TechnicalBriefing } from '@/services/ProjectManagementService';

export default function LayoutBriefingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [briefing, setBriefing] = useState<TechnicalBriefing | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [attendees, setAttendees] = useState<string[]>(['Project Manager', 'Technical Lead']);
  const [newAttendee, setNewAttendee] = useState('');

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
      const [project, bData] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getTechnicalBriefing(id)
      ]);
      setSelectedProject(project);

      if (bData) {
        setBriefing(bData);
        setDate(bData.date);
        setTime(bData.time);
        setNotes(bData.notes);
        setAttendees(bData.attendees);
      } else {
        setBriefing(null);
        // Reset form for new project
        setDate('');
        setTime('');
        setNotes('');
        setAttendees(['Project Manager', 'Technical Lead']);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details.",
      });
      router.push('/project-management/technical/briefing');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttendee = () => {
    if (newAttendee && !attendees.includes(newAttendee)) {
      setAttendees([...attendees, newAttendee]);
      setNewAttendee('');
    }
  };

  const handleRemoveAttendee = (attendee: string) => {
    setAttendees(attendees.filter(a => a !== attendee));
  };

  const handleComplete = async () => {
    if (!date || !time || !notes) {
      toast({
        title: "Missing Information",
        description: "Please fill in all details before completing the briefing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedBriefing: TechnicalBriefing = {
        projectId: projectId!,
        date,
        time,
        notes,
        attendees,
        isCompleted: true,
      };

      await projectManagementService.updateTechnicalBriefing(updatedBriefing);
      setBriefing(updatedBriefing);

      toast({
        title: "Briefing Completed",
        description: `Briefing record updated for ${selectedProject?.name}.`,
      });

      setTimeout(() => {
        router.push('/project-management/technical/timeline');
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save briefing record.",
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
            <h1 className="text-2xl font-bold text-gray-900">Select Project for Briefing</h1>
            <p className="text-sm text-gray-500">Step 3.2: Technical alignment session</p>
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
                      <span className="font-medium truncate ml-2 text-right">{project.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    onClick={() => router.push(`/project-management/technical/briefing?projectId=${project.id}`)}
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
          <Button variant="ghost" onClick={() => router.push('/project-management/technical/briefing')} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Technical Briefing Session</h1>
            <p className="text-sm text-gray-500">{selectedProject?.name} • Step 3.2</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/project-management/technical/briefing')}>
          Change Project
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500">Loading session data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Record Session Details
                </CardTitle>
                <CardDescription>Conduct alignment briefing with the technical design team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-gray-500">Date of Briefing</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        className="pl-9"
                        value={date}
                        disabled={briefing?.isCompleted}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-gray-500">Briefing Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        type="time"
                        className="pl-9"
                        value={time}
                        disabled={briefing?.isCompleted}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 border rounded-xl bg-gray-50/30">
                  <Label className="text-xs uppercase font-bold text-gray-500">Session Attendees</Label>
                  {!briefing?.isCompleted && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add attendee name..."
                        value={newAttendee}
                        onChange={(e) => setNewAttendee(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddAttendee()}
                      />
                      <Button onClick={handleAddAttendee} variant="outline" size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {attendees.map((attendee) => (
                      <Badge key={attendee} variant="secondary" className="pl-1 pr-2 py-1 flex items-center gap-1.5 bg-white border">
                        <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                          <Users className="w-3 h-3 text-purple-600" />
                        </div>
                        <span className="text-gray-700">{attendee}</span>
                        {!briefing?.isCompleted && (
                          <button onClick={() => handleRemoveAttendee(attendee)} className="ml-1 hover:text-red-500 text-gray-400">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-gray-500">Briefing Notes & Requirements</Label>
                  <Textarea
                    placeholder="Record key discussion points, design constraints, and special requirements..."
                    className="min-h-[150px] bg-white"
                    value={notes}
                    disabled={briefing?.isCompleted}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
              {!briefing?.isCompleted && (
                <CardFooter className="bg-gray-50/50 border-t justify-end py-4">
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 px-8"
                    onClick={handleComplete}
                  >
                    Complete & Save Briefing
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-purple-100 bg-purple-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-900 flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Agenda Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    "Review Approved BOQ & Drawings",
                    "Discuss Specific Site Constraints",
                    "Confirm Appliance Specifications",
                    "Set Timeline & Deadline Expectations",
                    "Assign Technical Point of Contact"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-full p-0.5 ${briefing?.isCompleted ? 'bg-green-100' : 'bg-purple-100'}`}>
                        <CheckCircle className={`w-3.5 h-3.5 ${briefing?.isCompleted ? 'text-green-600' : 'text-purple-400'}`} />
                      </div>
                      <span className="text-sm text-purple-800 leading-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="p-5 rounded-xl border border-blue-100 bg-blue-50/50">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-blue-900">Why this matters</h4>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    The briefing session is the single most important alignment point. Clear communication here prevents rework during the technical drawing phase.
                  </p>
                </div>
              </div>
            </div>

            {briefing?.isCompleted && (
              <Card className="bg-green-50 border-green-100 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-900">Record Completed</h4>
                      <p className="text-xs text-green-700 px-4">
                        This session record is now locked and has been shared with all attendees.
                      </p>
                    </div>
                    <Button variant="outline" className="w-full text-xs h-8" onClick={() => router.push('/project-management/technical/timeline')}>
                      View Technical Timeline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
