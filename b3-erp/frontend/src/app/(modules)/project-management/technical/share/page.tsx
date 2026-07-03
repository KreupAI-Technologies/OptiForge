'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, FileText, CheckCircle, Share2, AlertCircle, FileCheck, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { projectManagementService, Project, TechnicalDocument } from '@/services/ProjectManagementService';

export default function ShareDocumentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<TechnicalDocument[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [isShared, setIsShared] = useState(false);
  const [loading, setLoading] = useState(true);

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
      const [project, docs] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getTechnicalDocuments(id)
      ]);
      setSelectedProject(project);
      setDocuments(docs);
      setSelectedDocs([]);
      setIsShared(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details.",
      });
      router.push('/project-management/technical/share');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: string) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(documents.map(d => d.id));
    }
  };

  const handleShare = () => {
    if (selectedDocs.length !== documents.length) {
      toast({
        title: "Incomplete Selection",
        description: "Please select all required documents before sharing.",
        variant: "destructive",
      });
      return;
    }

    setIsShared(true);
    toast({
      title: "Documents Shared",
      description: `Documents for ${selectedProject?.name} shared with Technical Team.`,
    });

    setTimeout(() => {
      router.push('/project-management/technical/briefing');
    }, 2000);
  };

  if (!projectId) {
    return (
      <div className="w-full py-2 space-y-6 px-3">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Select Project for Handover</h1>
            <p className="text-sm text-gray-500">Step 3.1: Technical Team hand-over</p>
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
                      <span>Address:</span>
                      <span className="font-medium truncate ml-2">{project.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    onClick={() => router.push(`/project-management/technical/share?projectId=${project.id}`)}
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

  return (
    <div className="w-full py-2 space-y-3 px-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/project-management/technical/share')} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Share Documents to Technical</h1>
            <p className="text-sm text-gray-500">{selectedProject?.name} • Handover assets</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/project-management/technical/share')}>
          Change Project
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500">Loading documents...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Required Handover Package</CardTitle>
                    <CardDescription>Verify and select all documents for technical design</CardDescription>
                  </div>
                  {documents.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      {selectedDocs.length === documents.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <div key={doc.id} className={`flex items-center justify-between p-4 border rounded-xl transition-all ${selectedDocs.includes(doc.id) ? 'border-blue-200 bg-blue-50/30 shadow-sm' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        <Checkbox
                          id={doc.id}
                          checked={selectedDocs.includes(doc.id)}
                          onChange={() => handleToggle(doc.id)}
                          className="h-5 w-5"
                        />
                        <div className={`p-2 rounded-lg ${doc.type === 'BOQ' ? 'bg-orange-100' : doc.type === 'Drawing' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                          <FileText className={`w-5 h-5 ${doc.type === 'BOQ' ? 'text-orange-600' : doc.type === 'Drawing' ? 'text-blue-600' : 'text-purple-600'}`} />
                        </div>
                        <div>
                          <label htmlFor={doc.id} className="text-sm font-semibold text-gray-900 cursor-pointer block">
                            {doc.name}
                          </label>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-[10px] h-4 py-0">{doc.type}</Badge>
                            <span className="text-[10px] text-gray-500">Updated: {doc.date}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={doc.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-gray-500 border border-dashed rounded-xl">
                    No documents found for this project hand-over.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Handover Dashboard
                </CardTitle>
                <CardDescription className="text-blue-100">Hand off to Technical Design Team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-100">Package Completion</span>
                    <span className="font-bold">{selectedDocs.length}/{documents.length} Items</span>
                  </div>
                  <div className="w-full bg-blue-900/40 rounded-full h-3">
                    <div
                      className="bg-white h-3 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      style={{ width: `${documents.length > 0 ? (selectedDocs.length / documents.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 space-y-3">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-200 shrink-0" />
                    <p className="text-xs text-blue-50 leading-relaxed">
                      Handing over these documents confirms the project is ready for detailed technical specification. Ensure all dimensions are verified.
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold py-6 text-base"
                  onClick={handleShare}
                  disabled={isShared || documents.length === 0 || selectedDocs.length !== documents.length}
                >
                  {isShared ? (
                    <>
                      <FileCheck className="w-5 h-5 mr-2" />
                      Handover Complete
                    </>
                  ) : (
                    <>
                      <Share2 className="w-5 h-5 mr-2" />
                      Share Package
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3">Validation Rules</h4>
              <ul className="space-y-2 text-[11px] text-blue-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-blue-500" />
                  All 4 required documents must be attached
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-blue-500" />
                  Status must be "Ready" for all items
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-blue-500" />
                  Technical team lead notified on share
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
