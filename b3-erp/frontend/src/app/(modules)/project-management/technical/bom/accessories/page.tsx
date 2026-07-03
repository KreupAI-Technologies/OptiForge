'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Save, Trash2, ArrowRight, Package, LayoutGrid, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { projectManagementService, Project, AccessoryItem } from '@/services/ProjectManagementService';

export default function AccessoriesBOMPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [items, setItems] = useState<AccessoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState<Partial<AccessoryItem>>({ category: '', name: '', quantity: 1, unit: 'pcs', notes: '' });

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
      const [project, bomData] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getAccessoriesBOM(id)
      ]);
      setSelectedProject(project);
      setItems(bomData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load BOM data.",
      });
      router.push('/project-management/technical/bom/accessories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.category || !newItem.name) {
      toast({
        title: "Missing Information",
        description: "Please select a category and name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const item: AccessoryItem = {
        id: `ACC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        projectId: projectId!,
        category: newItem.category || '',
        name: newItem.name || '',
        quantity: newItem.quantity || 1,
        unit: newItem.unit || 'pcs',
        notes: newItem.notes || '',
      };

      await projectManagementService.addAccessoryItem(item);
      setItems([...items, item]);
      setNewItem({ category: '', name: '', quantity: 1, unit: 'pcs', notes: '' });

      toast({
        title: "Item Added",
        description: "Accessory added to BOM.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await projectManagementService.deleteAccessoryItem(id);
      setItems(items.filter(i => i.id !== id));
      toast({
        title: "Item Deleted",
        description: "Accessory removed from BOM.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete item.",
      });
    }
  };

  const handleSave = () => {
    toast({
      title: "BOM Saved",
      description: `Accessories BOM for ${selectedProject?.name} has been updated.`,
    });
  };

  const handleNext = () => {
    router.push('/project-management/technical/specs/shutters');
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
            <h1 className="text-2xl font-bold text-gray-900">Select Project for Accessories</h1>
            <p className="text-sm text-gray-500">Step 3.5: Define fittings, hardware, and accessories</p>
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
                      <span className="font-medium truncate ml-2 text-right text-xs text-gray-500 uppercase">{project.location}</span>
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

  // View 2: Accessories BOM Table & Form
  return (
    <div className="w-full py-2 space-y-4 px-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push(window.location.pathname)} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accessories BOM</h1>
            <p className="text-sm text-gray-500">{selectedProject?.name} • Step 3.5</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>
            Change Project
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleNext} size="sm" className="bg-blue-600 hover:bg-blue-700">
            Next: Shutter Specs <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500">Loading BOM data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-sm overflow-hidden border-none ring-1 ring-gray-200">
              <CardHeader className="bg-gray-50/80 border-b py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg shadow-sm border border-purple-200">
                    <Package className="w-5 h-5 text-purple-600 font-bold" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Bill of Materials</CardTitle>
                    <CardDescription>Fittings and hardware specifications</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="font-bold text-gray-700">Category</TableHead>
                      <TableHead className="font-bold text-gray-700">Item Name</TableHead>
                      <TableHead className="font-bold text-gray-700">Qty</TableHead>
                      <TableHead className="font-bold text-gray-700">Unit</TableHead>
                      <TableHead className="font-bold text-gray-700">Notes</TableHead>
                      <TableHead className="text-right pr-6 font-bold text-gray-700">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-60 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                            <Package className="w-12 h-12 opacity-10" />
                            <p className="text-sm font-medium">No accessories added yet.</p>
                            <p className="text-xs opacity-60">Use the form on the right to start building your BOM.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id} className="group hover:bg-purple-50/20 transition-all border-b last:border-0">
                          <TableCell>
                            <Badge variant="outline" className="font-semibold text-[9px] bg-white border-purple-200 text-purple-700 uppercase tracking-tighter shadow-sm">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-gray-800">{item.name}</TableCell>
                          <TableCell className="font-bold text-purple-700">{item.quantity}</TableCell>
                          <TableCell className="text-gray-600 text-sm">{item.unit}</TableCell>
                          <TableCell className="text-gray-500 text-xs italic font-medium">{item.notes || '—'}</TableCell>
                          <TableCell className="text-right pr-6">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity border border-transparent hover:border-red-100"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              {items.length > 0 && (
                <CardFooter className="bg-gray-50/50 border-t py-3 px-6">
                  <p className="text-xs text-gray-500 font-medium tracking-tight">
                    Found <span className="font-bold text-purple-700">{items.length}</span> unique items in the technical BOM for this project.
                  </p>
                </CardFooter>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="shadow-sm border-purple-100 ring-1 ring-purple-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="bg-purple-100 p-1.5 rounded-md">
                    <Plus className="w-4 h-4 text-purple-600" />
                  </div>
                  Add New Item
                </CardTitle>
                <CardDescription>Append hardware to the project list</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Category</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(val) => setNewItem({ ...newItem, category: val })}
                  >
                    <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200 focus:ring-purple-500 transition-shadow">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hinges">Hinges</SelectItem>
                      <SelectItem value="Handles">Handles</SelectItem>
                      <SelectItem value="Runners">Drawer Runners</SelectItem>
                      <SelectItem value="Lift Systems">Lift Systems</SelectItem>
                      <SelectItem value="Locks">Locks</SelectItem>
                      <SelectItem value="Lighting">Cabinet Lighting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Item Name</Label>
                  <Input
                    placeholder="e.g., Soft Close Hinge 110°"
                    className="h-11 bg-gray-50/50 border-gray-200 focus:ring-purple-500 transition-shadow"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      className="h-11 bg-gray-50/50 border-gray-200 focus:ring-purple-500 transition-shadow"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Unit</Label>
                    <Select
                      value={newItem.unit}
                      onValueChange={(val) => setNewItem({ ...newItem, unit: val })}
                    >
                      <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200 focus:ring-purple-500 transition-shadow">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">Pieces</SelectItem>
                        <SelectItem value="sets">Sets</SelectItem>
                        <SelectItem value="pairs">Pairs</SelectItem>
                        <SelectItem value="meters">Meters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Notes / Remarks</Label>
                  <Input
                    placeholder="Brand, finish, etc."
                    className="h-11 bg-gray-50/50 border-gray-200 focus:ring-purple-500 transition-shadow font-medium text-xs"
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  />
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 py-6 font-bold shadow-md shadow-purple-100 transition-all active:scale-[0.98]" onClick={handleAddItem}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add to List
                </Button>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex gap-3 shadow-sm">
              <div className="bg-blue-100 p-1.5 rounded-full h-fit flex items-center justify-center border border-blue-200">
                <Info className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-tight">Ordering Guide</h4>
                <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
                  Verify drilling patterns for specialty hinges before confirming quantities. All hardware choices should align with the technical sharing agreement.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
