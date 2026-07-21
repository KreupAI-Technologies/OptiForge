'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Truck, Package, CheckCircle, Clock, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { projectManagementService, Project } from '@/services/ProjectManagementService';
import { vendorShipmentService, VendorShipment } from '@/services/VendorShipmentService';

interface Shipment {
  id: string;
  poId: string;
  vendor: string;
  items: string;
  status: 'Dispatched' | 'In Transit' | 'Delivered' | 'Pending';
  eta: string;
  progress: number;
  lastLocation: string;
}

const STATUS_PROGRESS: Record<string, number> = {
  Pending: 0,
  Dispatched: 30,
  'In Transit': 60,
  Delivered: 100,
};

function toShipment(s: VendorShipment): Shipment {
  const status = (s.status as Shipment['status']) || 'Pending';
  return {
    id: s.id,
    poId: s.poId || s.id,
    vendor: s.vendorName || 'Unknown Vendor',
    items: s.itemDescription || '—',
    status,
    eta: s.expectedDelivery || 'TBD',
    progress: STATUS_PROGRESS[status] ?? 0,
    lastLocation: s.lastLocation || 'Vendor Warehouse',
  };
}

export default function VendorTrackingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);

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
      const rows = await vendorShipmentService.list(id);
      setShipments(rows.map(toShipment));
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load project data." });
      router.push('/project-management/procurement/vendor-tracking');
    } finally {
      setLoading(false);
    }
  };

  // Persist a tracking-refresh event and reflect the returned status.
  const handleTrack = async (shipment: Shipment) => {
    try {
      const updated = await vendorShipmentService.updateTracking(shipment.id, {
        status: shipment.status,
        location: shipment.lastLocation,
        event: 'Status refreshed from UI',
      });
      const next = toShipment(updated);
      setShipments((prev) => prev.map((s) => (s.id === next.id ? next : s)));
      toast({ title: "Tracking Updated", description: `${next.poId} — status: ${next.status}` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: `Failed to refresh ${shipment.poId}.` });
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Select Project for Vendor Tracking</h1>
            <p className="text-sm text-gray-500 font-medium">Step 4.6: Monitor delivery timelines and shipment status</p>
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor Tracking</h1>
            <p className="text-sm text-gray-500 font-medium">{selectedProject?.name} • Step 4.6</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>Change Project</Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading shipment data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <Card className="bg-blue-50 border-blue-100 border-none shadow-sm ring-1 ring-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-blue-900">In Transit</CardTitle>
                <Truck className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{shipments.filter(s => s.status === 'In Transit').length}</div>
                <p className="text-[10px] text-blue-600 font-medium">Shipments on the way</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-100 border-none shadow-sm ring-1 ring-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-orange-900">Pending Dispatch</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">{shipments.filter(s => s.status === 'Pending').length}</div>
                <p className="text-[10px] text-orange-600 font-medium">Awaiting vendor action</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-100 border-none shadow-sm ring-1 ring-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-green-900">Delivered (This Week)</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">5</div>
                <p className="text-[10px] text-green-600 font-medium">Ready for GRN</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b py-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">Active Shipments</CardTitle>
                  <CardDescription className="text-xs font-medium">Real-time tracking of open purchase orders</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {shipments.map((shipment) => (
                  <div key={shipment.id} className="border rounded-xl p-4 space-y-3 bg-white ring-1 ring-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Package className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg tracking-tight">{shipment.poId}</h3>
                          <p className="text-xs text-gray-500 font-medium">{shipment.vendor} • {shipment.items}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          shipment.status === 'In Transit' ? 'default' :
                            shipment.status === 'Pending' ? 'secondary' : 'outline'
                        } className="text-[10px] font-bold">{shipment.status}</Badge>
                        <p className="text-xs text-gray-500 mt-1 font-medium">ETA: {shipment.eta}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <span>Ordered</span>
                        <span>Dispatched</span>
                        <span>In Transit</span>
                        <span>Delivered</span>
                      </div>
                      <Progress value={shipment.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex gap-4 text-xs text-gray-600 font-medium">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Current: {shipment.lastLocation}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          Driver: +91 98765 43210
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 text-xs font-bold" onClick={() => handleTrack(shipment)}>
                        Refresh Status
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
