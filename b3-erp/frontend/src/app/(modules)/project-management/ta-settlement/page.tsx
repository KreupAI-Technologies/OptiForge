'use client';

import React, { useState, useEffect } from 'react';
import TASettlement from '@/components/project-management/TASettlement';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectManagementService } from '@/services/ProjectManagementService';

interface ProjectOption { id: string; name: string; }

export default function TASettlementPage() {
  const [selectedProject, setSelectedProject] = useState<string>('proj-001');
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const raw = await projectManagementService.getPmProjectPlansRaw();
        const mapped: ProjectOption[] = (raw || []).map((p: any) => ({
          id: String(p.id ?? p.projectId ?? p.projectCode ?? ''),
          name: p.projectName ?? p.name ?? p.projectCode ?? 'Project',
        })).filter((p: ProjectOption) => p.id);
        if (!cancelled && mapped.length) {
          setProjects(mapped);
          setSelectedProject(mapped[0].id);
        }
      } catch {
        if (!cancelled) setProjects([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="w-full py-2 space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">TA Settlement</h1>
        <div className="w-[300px]">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TASettlement projectId={selectedProject} />
    </div>
  );
}
