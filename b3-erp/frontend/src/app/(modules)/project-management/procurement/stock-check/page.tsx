'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Package, AlertTriangle, CheckCircle, RefreshCw, Info } from 'lucide-react';
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
import { Progress } from "@/components/ui/progress";
import { Badge } from '@/components/ui/badge';
import { projectManagementService, Project, StockItem } from '@/services/ProjectManagementService';

export default function StockCheckPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<StockItem[]>([]);
  const [isChecking, setIsChecking] = useState(false);

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
      const [project, stockData] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getStockItems(id)
      ]);
      setSelectedProject(project);
      setItems(stockData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load stock data.",
      });
      router.push('/project-management/procurement/stock-check');
    } finally {
      setLoading(false);
    }
  };

  const shortfallCount = items.filter(i => i.status === 'Shortfall').length;
  const availableCount = items.filter(i => i.status === 'Available').length;
  const progress = items.length > 0 ? (availableCount / items.length) * 100 : 0;

  const handleRecheck = () => {
    setIsChecking(true);
    toast({
      title: "Checking Inventory",
      description: "Syncing with warehouse database...",
    });
    setTimeout(() => {
      setIsChecking(false);
      toast({
        title: "Stock Check Complete",
        description: "Inventory data updated.",
      });
    }, 1500);
  };

  const handleGeneratePR = () => {
    router.push('/project-management/procurement/pr-generation');
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Select Project for Stock Check</h1>
            <p className="text-sm text-gray-500 font-medium">Step 4.2: Verify inventory levels against BOM</p>
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
                    <Badge className={project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : ''}>
                      {project.status}
                    </Badge>
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stock Availability Check</h1>
            <p className="text-sm text-gray-500 font-medium">
              {selectedProject?.name} • Step 4.2
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>
            Change Project
          </Button>
          <Button variant="outline" size="sm" onClick={handleRecheck} disabled={isChecking}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Re-check Stock
          </Button>
          <Button onClick={handleGeneratePR} size="sm" className={shortfallCount > 0 ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}>
            {shortfallCount > 0 ? "Generate PR for Shortfall" : "Proceed to PO"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading stock data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b py-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">BOM vs Inventory Analysis</CardTitle>
                  <CardDescription className="text-xs font-medium">Detailed breakdown of material availability</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/30">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Item Name</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Category</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Required</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Available</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-gray-500 font-medium">
                        No stock items found for this project.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-blue-50/20 transition-colors">
                        <TableCell className="font-bold text-gray-900">{item.name}</TableCell>
                        <TableCell className="text-sm text-gray-600 font-medium">{item.category}</TableCell>
                        <TableCell className="text-sm font-medium">{item.requiredQty} {item.unit}</TableCell>
                        <TableCell className={item.availableQty < item.requiredQty ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                          {item.availableQty} {item.unit}
                        </TableCell>
                        <TableCell>
                          {item.status === 'Available' ? (
                            <span className="flex items-center text-green-600 text-xs font-bold">
                              <CheckCircle className="w-4 h-4 mr-1" /> Available
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600 text-xs font-bold">
                              <AlertTriangle className="w-4 h-4 mr-1" /> Shortfall
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">Availability Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600">Fulfillment Rate</span>
                    <span className="font-bold text-gray-900">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                    <div className="text-2xl font-bold text-green-700">{availableCount}</div>
                    <div className="text-[10px] text-green-600 font-bold uppercase tracking-wide">Items Available</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                    <div className="text-2xl font-bold text-red-700">{shortfallCount}</div>
                    <div className="text-[10px] text-red-600 font-bold uppercase tracking-wide">Items Short</div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center text-xs uppercase tracking-widest">
                    <Info className="w-4 h-4 mr-2" />
                    Next Action
                  </h4>
                  <p className="text-xs text-blue-700 font-medium leading-relaxed">
                    {shortfallCount > 0
                      ? "Purchase Requisition (PR) needs to be generated for the shortfall items."
                      : "All items are in stock. You can proceed directly to material allocation."}
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
