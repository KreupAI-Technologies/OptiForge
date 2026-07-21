'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Filter, AlertOctagon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { projectManagementService, Discrepancy, Project } from '@/services/ProjectManagementService';
import { useSearchParams } from 'next/navigation';

export default function DiscrepanciesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewIssue, setViewIssue] = useState<Discrepancy | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    reportedBy: 'Current User' // Mock user
  });

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
      const [project, discrepanciesData] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getDiscrepancies(id)
      ]);
      setSelectedProject(project);
      setDiscrepancies(discrepanciesData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details.",
      });
      router.push('/project-management/discrepancies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async () => {
    if (!newIssue.title || !newIssue.description) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      const created = await projectManagementService.createDiscrepancy(newIssue);
      setDiscrepancies([created, ...discrepancies]);
      setIsDialogOpen(false);
      setNewIssue({ title: '', description: '', priority: 'Medium', reportedBy: 'Current User' });
      toast({
        title: "Issue Logged",
        description: "New discrepancy has been recorded.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log new issue.",
      });
    }
  };

  // Real client-side filter over the already-fetched discrepancies.
  const toggleActiveFilter = () => setShowActiveOnly((prev) => !prev);

  const visibleDiscrepancies = showActiveOnly
    ? discrepancies.filter((d) => d.status !== 'Resolved')
    : discrepancies;

  if (!projectId) {
    return (
      <div className="w-full py-2 space-y-6">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Select Project for Discrepancies</h1>
            <p className="text-sm text-gray-500">Choose a project to record mismatches for client clarification</p>
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
                    onClick={() => router.push(`/project-management/discrepancies?projectId=${project.id}`)}
                  >
                    Log Issues
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/project-management/discrepancies')} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Log Discrepancies</h1>
            <p className="text-sm text-gray-500">
              {selectedProject?.name} • Step 2.3: Record mismatches for client clarification
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/project-management/discrepancies')}>
            Change Project
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Log New Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Log New Discrepancy</DialogTitle>
                <DialogDescription>
                  Describe the issue found during verification.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Issue Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Quantity Mismatch"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newIssue.priority}
                    onValueChange={(value: 'High' | 'Medium' | 'Low') => setNewIssue({ ...newIssue, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High - Critical Blocker</SelectItem>
                      <SelectItem value="Medium">Medium - Needs Resolution</SelectItem>
                      <SelectItem value="Low">Low - Minor Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the discrepancy..."
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateIssue}>Log Issue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Issues</CardTitle>
              <CardDescription>Track resolution of identified discrepancies</CardDescription>
            </div>
            <Button variant={showActiveOnly ? 'default' : 'outline'} size="sm" onClick={toggleActiveFilter}>
              <Filter className="w-4 h-4 mr-2" />
              {showActiveOnly ? 'Showing Active' : 'Filter Active'}
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-gray-500">Loading discrepancies...</p>
            ) : (
              <div className="space-y-2">
                {visibleDiscrepancies.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    {showActiveOnly ? 'No active discrepancies.' : 'No discrepancies logged yet.'}
                  </p>
                ) : (
                  visibleDiscrepancies.map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-2">
                        <div className={`p-2 rounded-full mt-1 ${issue.priority === 'High' ? 'bg-red-100 text-red-600' :
                          issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                          <AlertOctagon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{issue.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>ID: {issue.id}</span>
                            <span>•</span>
                            <span>Reported: {issue.date}</span>
                            <span>•</span>
                            <span>By: {issue.reportedBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${issue.status === 'Open' ? 'bg-red-100 text-red-700' :
                          issue.status === 'In Review' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                          {issue.status}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => setViewIssue(issue)}>View</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View discrepancy details — populated from the already-fetched row object */}
      <Dialog open={!!viewIssue} onOpenChange={(open) => { if (!open) setViewIssue(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{viewIssue?.title}</DialogTitle>
            <DialogDescription>Discrepancy {viewIssue?.id}</DialogDescription>
          </DialogHeader>
          {viewIssue && (
            <div className="grid gap-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge className={
                  viewIssue.priority === 'High' ? 'bg-red-100 text-red-700' :
                  viewIssue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }>{viewIssue.priority} Priority</Badge>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  viewIssue.status === 'Open' ? 'bg-red-100 text-red-700' :
                  viewIssue.status === 'In Review' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>{viewIssue.status}</span>
              </div>
              <div>
                <Label className="text-gray-500">Description</Label>
                <p className="text-gray-900 mt-1">{viewIssue.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-500">Reported By</Label>
                  <p className="text-gray-900 mt-1">{viewIssue.reportedBy}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Date</Label>
                  <p className="text-gray-900 mt-1">{viewIssue.date}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewIssue(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
