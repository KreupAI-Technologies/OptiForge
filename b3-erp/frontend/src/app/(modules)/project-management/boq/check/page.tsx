'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckSquare, FileSpreadsheet, AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { projectManagementService, BOQItem, Project } from '@/services/ProjectManagementService';
import { exportToCsv } from '@/lib/export';
import { useProjectContext } from '@/context/ProjectContext';
import { useSearchParams } from 'next/navigation';

export default function BOQCheckPage() {
  const { loadProject } = useProjectContext();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [items, setItems] = useState<BOQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      const [project, boqData] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getBOQItems(id)
      ]);
      setSelectedProject(project);
      setItems(boqData);
      loadProject({
        id: project.id,
        name: project.name,
        projectType: project.projectType || 'Commercial Kitchen',
        customerName: project.clientName,
        status: project.status
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details.",
      });
      router.push('/project-management/boq/check');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (id: string, newQty: string) => {
    const qty = parseInt(newQty) || 0;
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          drawingQty: qty,
          status: qty === item.boqQty ? 'Match' : 'Mismatch'
        };
      }
      return item;
    }));
  };

  const handleNotesChange = (id: string, notes: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, notes } : item
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save all items (in a real app, this might be a batch update)
      await Promise.all(items.map(item =>
        projectManagementService.updateBOQItem(item.id, item.drawingQty, item.notes)
      ));

      toast({
        title: "Verification Saved",
        description: "BOQ cross-check data has been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save verification data.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Real client-side export: build a BOQ cross-check discrepancy report (CSV/blob)
  // from the fetched BOQ items and trigger a browser download.
  const handleGenerateReport = () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Nothing to export",
        description: "No BOQ items are loaded for this project.",
      });
      return;
    }
    const projectSlug = (selectedProject?.projectCode || selectedProject?.name || 'project')
      .replace(/[^a-z0-9]+/gi, '_');
    exportToCsv(
      `BOQ_CrossCheck_${projectSlug}.csv`,
      items.map((item) => ({
        Item: item.description,
        'BOQ Qty': item.boqQty,
        'Drawing Qty': item.drawingQty,
        Status: item.status,
        Notes: item.notes ?? '',
      })),
      [
        { key: 'Item' },
        { key: 'BOQ Qty' },
        { key: 'Drawing Qty' },
        { key: 'Status' },
        { key: 'Notes' },
      ],
    );
    toast({
      title: "Report Downloaded",
      description: `BOQ cross-check report exported (${mismatchCount} mismatch${mismatchCount === 1 ? '' : 'es'}).`,
    });
  };

  const mismatchCount = items.filter(i => i.status === 'Mismatch').length;

  if (!projectId) {
    return (
      <div className="w-full py-2 space-y-6">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Select Project for BOQ Check</h1>
            <p className="text-sm text-gray-500">Choose a project to verify BOQ quantities match drawing specifications</p>
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
                    onClick={() => router.push(`/project-management/boq/check?projectId=${project.id}`)}
                  >
                    Check BOQ
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
          <Button variant="ghost" onClick={() => router.push('/project-management/boq/check')} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">BOQ Cross-Check</h1>
            <p className="text-sm text-gray-500">
              {selectedProject?.name} • Step 2.2: Verify BOQ quantities match drawings
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/project-management/boq/check')}>
          Change Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>BOQ Items Review</CardTitle>
            <CardDescription>Compare listed items with drawing callouts. Update 'Drawing Qty' to verify.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-gray-500">Loading items...</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-700">Item Description</th>
                      <th className="px-4 py-3 font-medium text-gray-700 w-24">BOQ Qty</th>
                      <th className="px-4 py-3 font-medium text-gray-700 w-32">Drawing Qty</th>
                      <th className="px-4 py-3 font-medium text-gray-700 w-24">Status</th>
                      <th className="px-4 py-3 font-medium text-gray-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{item.description}</td>
                        <td className="px-4 py-3 text-gray-600">{item.boqQty}</td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.drawingQty}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-20 h-8"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={item.status === 'Match' ? 'default' : 'destructive'} className={item.status === 'Match' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {item.status === 'Mismatch' && (
                            <Input
                              placeholder="Reason for mismatch..."
                              value={item.notes || ''}
                              onChange={(e) => handleNotesChange(item.id, e.target.value)}
                              className="h-8 text-xs"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Verification results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {mismatchCount > 0 ? (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-900">Discrepancies Detected</h4>
                    <p className="text-xs text-red-700 mt-1">{mismatchCount} item(s) have quantity mismatches. Please review and add notes.</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
                  <CheckSquare className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-900">All Items Match</h4>
                    <p className="text-xs text-green-700 mt-1">BOQ quantities align with drawing specifications.</p>
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-3">
                <Button className="w-full" onClick={handleSave} disabled={loading || saving}>
                  {saving ? 'Saving...' : 'Save Verification'}
                </Button>
                <Button className="w-full" variant="outline" onClick={handleGenerateReport}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
