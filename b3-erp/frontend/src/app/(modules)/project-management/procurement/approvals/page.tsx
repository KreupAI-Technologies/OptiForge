'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projectManagementService, Project } from '@/services/ProjectManagementService';

interface ApprovalRequest {
  id: string;
  type: string;
  project: string;
  amount: string;
  requester: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  level: 'L1' | 'L2' | 'L3';
}

export default function ApprovalWorkflowPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);

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
      const [project, prs] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getProcurementPr(id).catch(() => []),
      ]);
      setSelectedProject(project);
      // Real project purchase requisitions from the procurement backend.
      const mapped: ApprovalRequest[] = (prs || []).map((pr: any) => ({
        id: pr.id,
        type: 'Purchase Requisition',
        project: project.name,
        amount: pr.totalAmount ? `₹ ${Number(pr.totalAmount).toLocaleString('en-IN')}` : '—',
        requester: pr.requestedBy || '—',
        date: (pr.createdAt || '').toString().split('T')[0] || '',
        status: pr.status === 'APPROVED' ? 'Approved' : pr.status === 'REJECTED' ? 'Rejected' : 'Pending',
        level: 'L1',
      }));
      setRequests(mapped);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load project data." });
      router.push('/project-management/procurement/approvals');
    } finally {
      setLoading(false);
    }
  };

  // NOTE: the procurement backend exposes PR create/list but no PR status-update
  // endpoint, so approve/reject is an optimistic UI transition until that lands.
  const handleApprove = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    toast({ title: "Request Approved", description: `${id} has been approved successfully.` });
    if (id.startsWith('PR')) {
      setTimeout(() => { router.push('/project-management/procurement/po-creation'); }, 1000);
    }
  };

  const handleReject = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
    toast({ title: "Request Rejected", description: `${id} has been returned to the requester.`, variant: "destructive" });
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Select Project for Approvals</h1>
            <p className="text-sm text-gray-500 font-medium">Step 4.4: Review and approve procurement requests</p>
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Approval Workflow</h1>
            <p className="text-sm text-gray-500 font-medium">{selectedProject?.name} • Step 4.4</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>Change Project</Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading approval requests...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requests.filter(r => r.status === 'Pending').length}</div>
                <p className="text-[10px] text-muted-foreground font-medium">Awaiting your action</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Approved Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requests.filter(r => r.status === 'Approved').length}</div>
                <p className="text-[10px] text-muted-foreground font-medium">Processed successfully</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requests.filter(r => r.status === 'Rejected').length}</div>
                <p className="text-[10px] text-muted-foreground font-medium">Returned for revision</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b py-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">Approval Queue</CardTitle>
                  <CardDescription className="text-xs font-medium">Manage PRs and POs requiring authorization</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="pending">
                <TabsList className="m-4 mb-2">
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="m-0">
                  <Table>
                    <TableHeader className="bg-gray-50/30">
                      <TableRow>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Request ID</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Type</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Amount</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Requester</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Level</TableHead>
                        <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.filter(r => r.status === 'Pending').map((req) => (
                        <TableRow key={req.id} className="hover:bg-blue-50/20 transition-colors">
                          <TableCell className="font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            {req.id}
                          </TableCell>
                          <TableCell className="text-sm font-medium">{req.type}</TableCell>
                          <TableCell className="font-bold text-gray-900">{req.amount}</TableCell>
                          <TableCell className="text-sm font-medium">{req.requester}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px] font-bold">{req.level}</Badge></TableCell>
                          <TableCell className="text-right space-x-2 pr-6">
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50 font-bold h-8 text-xs" onClick={() => handleApprove(req.id)}>Approve</Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold h-8 text-xs" onClick={() => handleReject(req.id)}>Reject</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {requests.filter(r => r.status === 'Pending').length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500 font-medium">No pending approvals found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="history" className="m-0">
                  <Table>
                    <TableHeader className="bg-gray-50/30">
                      <TableRow>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Request ID</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Type</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Amount</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                        <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest pr-6">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.filter(r => r.status !== 'Pending').map((req) => (
                        <TableRow key={req.id} className="hover:bg-blue-50/20 transition-colors">
                          <TableCell className="font-bold text-gray-900">{req.id}</TableCell>
                          <TableCell className="text-sm font-medium">{req.type}</TableCell>
                          <TableCell className="font-bold">{req.amount}</TableCell>
                          <TableCell>
                            <Badge variant={req.status === 'Approved' ? 'default' : 'destructive'} className="text-[10px] font-bold">{req.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6 font-medium">{req.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
