'use client';

export const dynamic = 'force-dynamic';

import { Project, projectManagementService, SiteVisit } from '@/services/ProjectManagementService';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, MapPin, User } from 'lucide-react';

export default function ScheduleSiteVisitPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
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
      const [project, projectVisits] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getSiteVisits(id)
      ]);
      setSelectedProject(project);
      setVisits(projectVisits);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details.",
      });
      router.push('/project-management/site-visit/schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    toast({
      title: "Appointment Confirmed",
      description: "Site visit has been scheduled successfully.",
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
              <h1 className="text-2xl font-bold text-gray-900">Select Project for Site Visit</h1>
              <p className="text-sm text-gray-500">Choose a project to coordinate site access</p>
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
                  <CardHeader className="pt-0">
                    <Button
                      className="w-full"
                      onClick={() => router.push(`/project-management/site-visit/schedule?projectId=${project.id}`)}
                    >
                      Select Project
                    </Button>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full py-2 space-y-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => router.push('/project-management/site-visit/schedule')} className="p-0 hover:bg-transparent">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Schedule Site Visit</h1>
                <p className="text-sm text-gray-500">
                  {selectedProject?.name} • Step 2.4: Coordinate with client for site access
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/project-management/site-visit/schedule')}>
              Change Project
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>New Appointment</CardTitle>
                <CardDescription>Enter visit details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input id="date" type="date" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input id="time" type="time" className="pl-9" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input id="location" placeholder="Site Address" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Client Contact</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input id="contact" placeholder="Name & Phone" className="pl-9" />
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleBooking}>Confirm Booking</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Visits</CardTitle>
                <CardDescription>Scheduled site inspections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {visits.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No upcoming visits scheduled.</p>
                ) : (
                  visits.map((visit) => (
                    <div key={visit.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-900">{visit.location}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${visit.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>{visit.status}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> {visit.date}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" /> {visit.time}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        <User className="w-3 h-3" /> {visit.contactName}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
