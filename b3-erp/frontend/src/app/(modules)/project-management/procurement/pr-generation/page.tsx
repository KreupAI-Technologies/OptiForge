'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, FilePlus, Trash2, Send, Info } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { projectManagementService, Project } from '@/services/ProjectManagementService';

interface PRItem {
  id: string;
  name: string;
  category: string;
  shortfallQty: number;
  orderQty: number;
  unit: string;
  preferredVendor: string;
}

export default function GeneratePRPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PRItem[]>([]);
  const [notes, setNotes] = useState('');
  const [bomHeaderId, setBomHeaderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      const [project, receptions, shortfall] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getBOMReceptions(id).catch(() => []),
        projectManagementService.getPrShortfallItems(id).catch(() => []),
      ]);
      setSelectedProject(project);
      // Use the latest released/processed BOM as the requisition source.
      setBomHeaderId(receptions[0]?.id ?? null);

      // Prefer the project's real BOM-vs-stock shortfall lines from the backend.
      let sourced: PRItem[] = (shortfall ?? []).map((line) => ({
        id: line.id,
        name: line.name,
        category: line.category,
        shortfallQty: line.shortfallQty,
        orderQty: line.orderQty,
        unit: line.unit,
        preferredVendor: line.preferredVendor,
      }));

      // If the backend feed is empty, derive shortfall lines from project stock
      // (available < required), which is the same source of truth client-side.
      if (sourced.length === 0) {
        const stock = await projectManagementService.getStockItems(id).catch(() => []);
        sourced = stock
          .filter((s) => s.status === 'Shortfall' || s.availableQty < s.requiredQty)
          .map((s) => {
            const shortfallQty = Math.max(0, s.requiredQty - s.availableQty);
            return {
              id: s.id,
              name: s.name,
              category: s.category,
              shortfallQty,
              orderQty: shortfallQty,
              unit: s.unit,
              preferredVendor: 'Generic',
            };
          });
      }

      setItems(sourced);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load project data." });
      router.push('/project-management/procurement/pr-generation');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (id: string, qty: number) => {
    setItems(items.map(item => item.id === id ? { ...item, orderQty: qty } : item));
  };

  const handleVendorChange = (id: string, vendor: string) => {
    setItems(items.map(item => item.id === id ? { ...item, preferredVendor: vendor } : item));
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSubmit = async () => {
    if (!projectId) return;
    if (!bomHeaderId) {
      toast({
        variant: "destructive",
        title: "No released BOM",
        description: "A released BOM is required before generating a Purchase Requisition for this project.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await projectManagementService.createProcurementPR({
        projectId,
        bomHeaderId,
        requestedBy: 'Procurement Planner',
      });
      toast({
        title: "PR Generated",
        description: "Purchase Requisition submitted for approval.",
      });
      router.push('/project-management/procurement/approvals');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to generate PR",
        description: error instanceof Error ? error.message : "Could not create the requisition.",
      });
    } finally {
      setSubmitting(false);
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Select Project for PR Generation</h1>
            <p className="text-sm text-gray-500 font-medium">Step 4.3: Create PR for shortfall items</p>
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Generate Purchase Requisition</h1>
            <p className="text-sm text-gray-500 font-medium">{selectedProject?.name} • Step 4.3</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>Change Project</Button>
          <Button onClick={handleSubmit} size="sm" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Submitting…' : 'Submit for Approval'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading requisition data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FilePlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold tracking-tight">Requisition Items</CardTitle>
                    <CardDescription className="text-xs font-medium">Review and adjust quantities before submission</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50/30">
                    <TableRow>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Item Name</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Shortfall</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest w-[100px]">Order Qty</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Unit</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Preferred Vendor</TableHead>
                      <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-blue-50/20 transition-colors">
                        <TableCell className="font-bold text-gray-900">
                          {item.name}
                          <div className="text-xs text-gray-500 font-medium">{item.category}</div>
                        </TableCell>
                        <TableCell className="text-red-600 font-bold">{item.shortfallQty}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.orderQty}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            className="w-20 h-8"
                          />
                        </TableCell>
                        <TableCell className="text-sm font-medium">{item.unit}</TableCell>
                        <TableCell>
                          <Select value={item.preferredVendor} onValueChange={(val) => handleVendorChange(item.id, val)}>
                            <SelectTrigger className="h-8 w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Merino">Merino</SelectItem>
                              <SelectItem value="Greenlam">Greenlam</SelectItem>
                              <SelectItem value="Hettich India">Hettich India</SelectItem>
                              <SelectItem value="Hafele">Hafele</SelectItem>
                              <SelectItem value="Generic">Generic</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
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
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">Requisition Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Project Reference</Label>
                  <Input value={selectedProject?.name || ''} readOnly className="bg-gray-50 font-medium" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Required By Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Priority</Label>
                  <Select defaultValue="High">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High (Urgent)</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Notes / Justification</Label>
                  <Textarea
                    placeholder="Reason for purchase..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-24"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
