'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, PackageCheck, AlertTriangle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from '@/components/ui/badge';
import { projectManagementService, Project } from '@/services/ProjectManagementService';

interface GRNItem {
  id: string;
  description: string;
  orderedQty: number;
  receivedQty: number;
  unit: string;
  accepted: boolean;
  remarks: string;
}

export default function GRNEntryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GRNItem[]>([]);

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
      setItems([
        { id: '1', description: 'Laminate - White Gloss (Merino)', orderedQty: 25, receivedQty: 25, unit: 'sheets', accepted: true, remarks: '' },
        { id: '2', description: 'Hettich Soft Close Hinge', orderedQty: 60, receivedQty: 58, unit: 'pcs', accepted: true, remarks: '2 pcs missing' },
      ]);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load project data." });
      router.push('/project-management/procurement/grn');
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (id: string, qty: number) => {
    setItems(items.map(item => item.id === id ? { ...item, receivedQty: qty } : item));
  };

  const handleAcceptChange = (id: string, checked: boolean) => {
    setItems(items.map(item => item.id === id ? { ...item, accepted: checked } : item));
  };

  const handleRemarksChange = (id: string, text: string) => {
    setItems(items.map(item => item.id === id ? { ...item, remarks: text } : item));
  };

  const handleSubmit = () => {
    toast({ title: "GRN Submitted", description: "Goods Receipt Note #GRN-2025-045 created successfully." });
    setTimeout(() => { router.push('/project-management/procurement/bom-reception'); }, 1500);
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Select Project for GRN Entry</h1>
            <p className="text-sm text-gray-500 font-medium">Step 4.8: Record received goods and verify quality</p>
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">GRN Entry & Verification</h1>
            <p className="text-sm text-gray-500 font-medium">{selectedProject?.name} • Step 4.8</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>Change Project</Button>
          <Button onClick={handleSubmit} size="sm" className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />Submit GRN
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading GRN data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <PackageCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold tracking-tight">Received Items</CardTitle>
                    <CardDescription className="text-xs font-medium">Verify quantity and quality against PO</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50/30">
                    <TableRow>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest w-[50px]">Accept</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Description</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Ordered</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Received</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Unit</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-blue-50/20 transition-colors">
                        <TableCell>
                          <Checkbox
                            checked={item.accepted}
                            onChange={(e) => handleAcceptChange(item.id, e.target.checked)}
                          />
                        </TableCell>
                        <TableCell className="font-bold text-gray-900">{item.description}</TableCell>
                        <TableCell className="font-medium">{item.orderedQty}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.receivedQty}
                            onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value))}
                            className={`w-20 h-8 ${item.receivedQty !== item.orderedQty ? 'border-orange-500 bg-orange-50' : ''}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{item.unit}</TableCell>
                        <TableCell>
                          <Input
                            value={item.remarks}
                            onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                            placeholder="Issues?"
                            className="h-8"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">Receipt Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">PO Reference</Label>
                  <Input value="PO-2025-088" readOnly className="bg-gray-50 font-medium" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Vendor Invoice No.</Label>
                  <Input placeholder="INV-12345" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Received Date</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Received By</Label>
                  <Input defaultValue="Store Manager" />
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 mt-4">
                  <h4 className="font-bold text-yellow-900 mb-2 flex items-center text-xs uppercase tracking-widest">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Quality Check
                  </h4>
                  <p className="text-xs text-yellow-700 font-medium leading-relaxed">
                    Ensure all items are inspected for damages before accepting. Rejected items should be marked in remarks.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
