'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { projectManagementService, Drawing, Project } from '@/services/ProjectManagementService';
import { useSearchParams } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';

export default function DrawingVerificationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

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
      const [project, drawingsData] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getDrawings(id)
      ]);
      setSelectedProject(project);
      setDrawings(drawingsData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details.",
      });
      router.push('/project-management/documents/verification');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await projectManagementService.verifyDrawing(id, 'Verified');
      setDrawings(drawings.map(d => d.id === id ? { ...d, status: 'Verified' } : d));
      toast({
        title: "Drawing Verified",
        description: "The drawing has been marked as verified.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify drawing.",
      });
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectReason) return;
    try {
      await projectManagementService.verifyDrawing(rejectingId, 'Rejected', rejectReason);
      setDrawings(drawings.map(d => d.id === rejectingId ? { ...d, status: 'Rejected', notes: rejectReason } : d));
      setRejectingId(null);
      setRejectReason('');
      toast({
        title: "Drawing Rejected",
        description: "The drawing has been marked as rejected.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject drawing.",
      });
    }
  };

  const pendingCount = drawings.filter(d => d.status === 'Pending').length;
  const isComplete = pendingCount === 0 && drawings.length > 0;

  if (!projectId) {
    return (
      <div className="w-full py-2 space-y-6">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Select Project for Verification</h1>
            <p className="text-sm text-gray-500">Choose a project to verify its layout drawings against BOQ</p>
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
                    onClick={() => router.push(`/project-management/documents/verification?projectId=${project.id}`)}
                  >
                    Verify Drawings
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
          <Button variant="ghost" onClick={() => router.push('/project-management/documents/verification')} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Drawing Verification</h1>
            <p className="text-sm text-gray-500">
              {selectedProject?.name} • Step 2.1: Verify layout drawings against BOQ
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/project-management/documents/verification')}>
          Change Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Drawings List</CardTitle>
            <CardDescription>Review and verify each drawing below.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Loading drawings...</p>
            ) : (
              <div className="space-y-2">
                {drawings.map((drawing) => (
                  <div key={drawing.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{drawing.name}</h3>
                        <p className="text-sm text-gray-500">{drawing.type} • {drawing.version} • {drawing.uploadDate}</p>
                        {drawing.status === 'Rejected' && (
                          <p className="text-xs text-red-500 mt-1">Reason: {drawing.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {drawing.status === 'Pending' ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setRejectingId(drawing.id)}>Reject</Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleVerify(drawing.id)}>Verify</Button>
                        </>
                      ) : (
                        <Badge variant={drawing.status === 'Verified' ? 'default' : 'destructive'}>
                          {drawing.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-2 text-center space-y-2">
              {isComplete ? (
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              ) : (
                <div className="p-4 bg-yellow-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {isComplete ? "Verification Complete" : "Pending Verification"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {pendingCount} drawings require review
                </p>
              </div>
              <Button
                className="w-full"
                disabled={!isComplete}
                onClick={() => router.push('/project-management/documents/revisions')}
              >
                Proceed to Next Step
              </Button>
            </CardContent>
          </Card>

          {rejectingId && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">Reject Drawing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-red-600">Please provide a reason for rejection:</p>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Dimensions do not match BOQ..."
                  className="bg-white"
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setRejectingId(null)}>Cancel</Button>
                  <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={handleReject}>Confirm Rejection</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
