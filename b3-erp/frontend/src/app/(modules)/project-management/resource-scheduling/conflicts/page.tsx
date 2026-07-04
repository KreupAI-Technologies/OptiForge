'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Split,
  RefreshCw,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ModalWrapper } from '@/components/ui/ModalWrapper';

interface Conflict {
  id: number;
  resource: string;
  role: string;
  type: string;
  severity: string;
  description: string;
  date: string;
  projects: string[];
}

export default function ConflictResolutionPage() {
  const router = useRouter();
  const [selectedConflict, setSelectedConflict] = useState<any>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await projectManagementService.getPmResourceAllocations();
        const mapped: Conflict[] = (raw || []).map((r: any, i: number) => {
          const projects = Array.isArray(r.projects)
            ? r.projects
            : [r.project ?? r.projectName ?? r.project_name].filter(Boolean);
          return {
            id: r.id ?? i + 1,
            resource: r.resource ?? r.resourceName ?? r.resource_name ?? r.resource?.name ?? '',
            role: r.role ?? r.resourceRole ?? r.resource?.role ?? '',
            type: r.conflictType ?? r.type ?? 'Double Booking',
            severity: r.severity ?? 'Medium',
            description: r.description ?? '',
            date: r.date ?? r.conflictDate ?? r.startDate ?? '',
            projects,
          };
        });
        if (!cancelled) setConflicts(mapped);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load');
          setConflicts([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const severityCounts = useMemo(() => ({
    high: conflicts.filter((c) => c.severity === 'High').length,
    medium: conflicts.filter((c) => c.severity === 'Medium').length,
    low: conflicts.filter((c) => c.severity === 'Low').length,
  }), [conflicts]);

  const handleResolveClick = (conflict: any) => {
    setSelectedConflict(conflict);
    setShowResolveModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className=" px-3 py-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Conflict Resolution</h1>
              <p className="text-sm text-gray-500">Identify and resolve resource scheduling conflicts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
        <div className=" space-y-3">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Card className="bg-red-50 border-red-100">
              <CardContent className="p-6 flex items-center gap-2">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-900">High Severity</p>
                  <h3 className="text-2xl font-bold text-red-700">{severityCounts.high}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-100">
              <CardContent className="p-6 flex items-center gap-2">
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-900">Medium Severity</p>
                  <h3 className="text-2xl font-bold text-orange-700">{severityCounts.medium}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-100">
              <CardContent className="p-6 flex items-center gap-2">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-900">Low Severity</p>
                  <h3 className="text-2xl font-bold text-yellow-700">{severityCounts.low}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conflicts List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Conflicts</CardTitle>
              <CardDescription>Review and take action on the following issues</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="text-sm text-gray-500 py-4">Loading conflicts…</div>
              )}
              {loadError && (
                <div className="text-sm text-red-600 py-4">{loadError}</div>
              )}
              {!isLoading && !loadError && conflicts.length === 0 && (
                <div className="text-sm text-gray-500 py-4">No conflicts found.</div>
              )}
              <div className="space-y-2">
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-2 mb-2 md:mb-0">
                      <div className={`p-2 rounded-lg ${conflict.severity === 'High' ? 'bg-red-100 text-red-600' :
                          conflict.severity === 'Medium' ? 'bg-orange-100 text-orange-600' :
                            'bg-yellow-100 text-yellow-600'
                        }`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{conflict.resource}</h3>
                          <span className="text-sm text-gray-500">• {conflict.role}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-1">{conflict.type}</p>
                        <p className="text-sm text-gray-500 mt-1">{conflict.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {conflict.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Affected: {conflict.projects.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 md:flex-none"
                        onClick={() => handleResolveClick(conflict)}
                      >
                        Resolve
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                        Ignore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resolution Modal */}
      <ModalWrapper
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Resolve Conflict"
        size="lg"
      >
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Conflict Details</h4>
            <p className="text-sm text-gray-600">{selectedConflict?.description}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Suggested Actions</h4>
            <div className="grid grid-cols-1 gap-2">
              <button className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-left group">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Reassign Task</h5>
                  <p className="text-sm text-gray-500 mt-1">Assign "Project B" task to an available resource with similar skills (e.g., Suresh Patel).</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-blue-500" />
              </button>

              <button className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors text-left group">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Reschedule</h5>
                  <p className="text-sm text-gray-500 mt-1">Move "Project A" task to start on 13th Jun (Next available slot).</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-green-500" />
              </button>

              <button className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors text-left group">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200">
                  <Split className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Split Allocation</h5>
                  <p className="text-sm text-gray-500 mt-1">Split the task between Rajesh Kumar and another resource.</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-purple-500" />
              </button>
            </div>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
}
