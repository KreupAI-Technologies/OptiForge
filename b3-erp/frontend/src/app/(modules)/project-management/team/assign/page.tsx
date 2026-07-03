'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Search, UserCheck, ShieldCheck, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { projectManagementService, Project, Supervisor } from '@/services/ProjectManagementService';

export default function AssignSupervisorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [assignedSupervisor, setAssignedSupervisor] = useState<Supervisor | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
      const [project, sups] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getSupervisors()
      ]);
      setSelectedProject(project);
      setSupervisors(sups);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details.",
      });
      router.push('/project-management/team/assign');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = (supervisor: Supervisor) => {
    setAssignedSupervisor(supervisor);
    toast({
      title: "Supervisor Assigned",
      description: `${supervisor.name} has been assigned to ${selectedProject?.name}.`,
    });
  };

  const filteredSupervisors = supervisors.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!projectId) {
    return (
      <div className="w-full py-2 space-y-6">
        <div className="flex items-center gap-2 mb-3 px-3">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Select Project for Supervisor Assignment</h1>
            <p className="text-sm text-gray-500">Step 2.11: Project supervisor allocation</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Loading projects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-3">
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
                    onClick={() => router.push(`/project-management/team/assign?projectId=${project.id}`)}
                  >
                    Manage Assignment
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
    <div className="w-full py-2 space-y-3">
      <div className="flex items-center justify-between mb-3 px-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/project-management/team/assign')} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assign Supervisor</h1>
            <p className="text-sm text-gray-500">{selectedProject?.name} • Step 2.11</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/project-management/team/assign')}>
          Change Project
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500">Loading details...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 px-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Available Supervisors</CardTitle>
              <CardDescription>Select a supervisor for this project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name or role..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                {filteredSupervisors.map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {person.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{person.name}</h4>
                          {person.status === 'Available' && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 bg-green-50 text-green-700 border-green-200">Available</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{person.role} • {person.exp} exp</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Active Projects</p>
                        <p className="font-medium text-gray-900 text-sm">{person.projects}</p>
                      </div>
                      <Button
                        size="sm"
                        disabled={person.status === 'Busy' || assignedSupervisor?.id === person.id}
                        variant={person.status === 'Busy' ? 'ghost' : assignedSupervisor?.id === person.id ? 'outline' : 'default'}
                        onClick={() => handleAssign(person)}
                        className="min-w-[100px]"
                      >
                        {assignedSupervisor?.id === person.id ? (
                          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Assigned</span>
                        ) : person.status === 'Busy' ? 'Unavailable' : 'Assign'}
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredSupervisors.length === 0 && (
                  <div className="py-8 text-center text-gray-500 border border-dashed rounded-lg">
                    No supervisors found matching your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Assignment</CardTitle>
                <CardDescription>Project leadership</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                {assignedSupervisor ? (
                  <div className="space-y-4 w-full">
                    <div className="relative inline-block">
                      <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold mx-auto">
                        {assignedSupervisor.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">{assignedSupervisor.name}</h3>
                      <p className="text-sm text-blue-600 font-medium">{assignedSupervisor.role}</p>
                    </div>
                    <div className="pt-4 grid grid-cols-2 gap-2 border-t text-sm">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-xs">Experience</p>
                        <p className="font-semibold">{assignedSupervisor.exp}</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-xs">Projects</p>
                        <p className="font-semibold">{assignedSupervisor.projects}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setAssignedSupervisor(null)}>
                      Remove Assignment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-100 rounded-full inline-block">
                      <UserCheck className="w-10 h-10 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">No Supervisor Assigned</h3>
                      <p className="text-sm text-gray-500 mt-1 px-4">Please select a supervisor from the list to oversee site operations.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <Briefcase className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="text-xs text-blue-700 leading-relaxed">
                    <strong>Quick Tip:</strong> Assign supervisors with relevant skills for {selectedProject?.projectType} projects to ensure the highest quality of site execution.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
