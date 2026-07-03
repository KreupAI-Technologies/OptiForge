'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, DollarSign, Calendar, CheckCircle } from 'lucide-react';
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
import { projectManagementService, Project } from '@/services/ProjectManagementService';

interface Payment {
  id: string;
  poId: string;
  vendor: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  method: string;
}

export default function PaymentProcessingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

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
      setPayments([
        { id: 'PAY-001', poId: 'PO-2025-088', vendor: 'Merino Industries', amount: 15000, dueDate: '2025-02-01', status: 'Paid', method: 'Bank Transfer' },
        { id: 'PAY-002', poId: 'PO-2025-089', vendor: 'Hettich India', amount: 28500, dueDate: '2025-02-15', status: 'Pending', method: 'Cheque' },
        { id: 'PAY-003', poId: 'PO-2025-090', vendor: 'Greenlam', amount: 45000, dueDate: '2025-02-20', status: 'Pending', method: 'NEFT' },
      ]);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load project data." });
      router.push('/project-management/procurement/payments');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = (id: string) => {
    setPayments(payments.map(p => p.id === id ? { ...p, status: 'Paid' } : p));
    toast({ title: "Payment Processed", description: `Payment ${id} has been marked as Paid.` });
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Select Project for Payments</h1>
            <p className="text-sm text-gray-500 font-medium">Step 4.7: Manage vendor payments and track financial milestones</p>
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payment Processing</h1>
            <p className="text-sm text-gray-500 font-medium">{selectedProject?.name} • Step 4.7</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>Change Project</Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading payment data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Outstanding</CardTitle>
                <DollarSign className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹ {payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</div>
                <p className="text-[10px] text-muted-foreground font-medium">Across {payments.filter(p => p.status === 'Pending').length} invoices</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Upcoming Due</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-[10px] text-muted-foreground font-medium">Due within 7 days</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Paid This Month</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹ {payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</div>
                <p className="text-[10px] text-muted-foreground font-medium">Successfully processed</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b py-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">Payment Schedule</CardTitle>
                  <CardDescription className="text-xs font-medium">Track and process payments linked to Purchase Orders</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/30">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Payment ID</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">PO Reference</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Vendor</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Due Date</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Amount</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Method</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-blue-50/20 transition-colors">
                      <TableCell className="font-bold text-gray-900">{payment.id}</TableCell>
                      <TableCell className="font-medium">{payment.poId}</TableCell>
                      <TableCell className="font-medium">{payment.vendor}</TableCell>
                      <TableCell className="font-medium">{payment.dueDate}</TableCell>
                      <TableCell className="font-bold text-gray-900">₹ {payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{payment.method}</TableCell>
                      <TableCell>
                        <Badge variant={
                          payment.status === 'Paid' ? 'default' :
                            payment.status === 'Overdue' ? 'destructive' : 'outline'
                        } className="text-[10px] font-bold">{payment.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {payment.status === 'Pending' && (
                          <Button size="sm" className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700" onClick={() => handleProcessPayment(payment.id)}>
                            <CreditCard className="w-3 h-3 mr-1" />Pay Now
                          </Button>
                        )}
                        {payment.status === 'Paid' && (
                          <Button size="sm" variant="ghost" disabled className="h-8 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1 text-green-500" />Completed
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
