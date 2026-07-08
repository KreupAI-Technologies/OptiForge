'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, Download, Plus, FileText } from 'lucide-react';
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

interface POItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

export default function POCreationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState('Merino Industries Ltd.');
  const [items, setItems] = useState<POItem[]>([]);

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
        { id: '1', description: 'Laminate - White Gloss (Merino)', qty: 25, unit: 'sheets', rate: 1200, amount: 30000 },
        { id: '2', description: 'Hettich Soft Close Hinge', qty: 60, unit: 'pcs', rate: 250, amount: 15000 },
      ]);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load project data." });
      router.push('/project-management/procurement/po-creation');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = totalAmount * 0.18;
  const grandTotal = totalAmount + tax;

  // NEEDS BACKEND: the project procurement controller exposes PR + GRN only,
  // there is no create-PO endpoint yet, so this remains an optimistic transition.
  const handleCreatePO = () => {
    toast({ title: "Purchase Order Created", description: "PO has been generated and sent to vendor." });
    setTimeout(() => { router.push('/project-management/procurement/vendor-tracking'); }, 1500);
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Select Project for PO Creation</h1>
            <p className="text-sm text-gray-500 font-medium">Step 4.5: Generate PO from approved requisition</p>
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Purchase Order</h1>
            <p className="text-sm text-gray-500 font-medium">{selectedProject?.name} • Step 4.5</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>Change Project</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Draft</Button>
          <Button onClick={handleCreatePO} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4 mr-2" />Issue PO
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading PO data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">PO Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Vendor</Label>
                    <Select value={vendor} onValueChange={setVendor}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Merino Industries Ltd.">Merino Industries Ltd.</SelectItem>
                        <SelectItem value="Greenlam Industries">Greenlam Industries</SelectItem>
                        <SelectItem value="Hettich India Pvt Ltd">Hettich India Pvt Ltd</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">PO Date</Label>
                    <Input type="date" defaultValue="2025-02-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Reference PR</Label>
                    <Input value="PR-2025-001" readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Expected Delivery</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Shipping Address</Label>
                  <Textarea defaultValue="Factory Unit 2, Industrial Area, Sector 5, Bangalore - 560001" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 border-b py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-bold tracking-tight">Line Items</CardTitle>
                </div>
                <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" />Add Item</Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50/30">
                    <TableRow>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Description</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Qty</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Unit</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Rate</TableHead>
                      <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest pr-6">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-blue-50/20 transition-colors">
                        <TableCell className="font-bold text-gray-900">{item.description}</TableCell>
                        <TableCell className="font-medium">{item.qty}</TableCell>
                        <TableCell className="font-medium">{item.unit}</TableCell>
                        <TableCell className="font-medium">₹ {item.rate}</TableCell>
                        <TableCell className="text-right font-bold pr-6">₹ {item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex flex-col items-end space-y-2 border-t pt-4 bg-gray-50/30 pr-6">
                <div className="flex justify-between w-48 text-sm"><span>Subtotal:</span><span className="font-medium">₹ {totalAmount.toLocaleString()}</span></div>
                <div className="flex justify-between w-48 text-sm"><span>GST (18%):</span><span className="font-medium">₹ {tax.toLocaleString()}</span></div>
                <div className="flex justify-between w-48 font-bold text-lg"><span>Total:</span><span>₹ {grandTotal.toLocaleString()}</span></div>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Payment Terms</Label>
                  <Select defaultValue="Net 30">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Advance">100% Advance</SelectItem>
                      <SelectItem value="Net 30">Net 30 Days</SelectItem>
                      <SelectItem value="Net 60">Net 60 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Notes to Vendor</Label>
                  <Textarea placeholder="Special instructions..." className="h-32" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
