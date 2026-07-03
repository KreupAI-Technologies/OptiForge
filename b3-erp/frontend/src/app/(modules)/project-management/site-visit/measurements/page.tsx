'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { projectManagementService, RoomMeasurements, Measurement, Project } from '@/services/ProjectManagementService';
import { useSearchParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  Ruler,
  Maximize,
  Minimize,
  Info
} from 'lucide-react';

export default function SiteMeasurementsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [rooms, setRooms] = useState<RoomMeasurements[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());

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
      const [project, data] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getSiteMeasurements(id)
      ]);
      setSelectedProject(project);
      setRooms(data);
      // Expand all rooms by default
      setExpandedRooms(new Set(data.map(r => r.id)));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load measurements.",
      });
      router.push('/project-management/site-visit/measurements');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = () => {
    const newRoom: RoomMeasurements = {
      id: `RM-${Date.now()}`,
      roomName: 'New Room',
      measurements: []
    };
    setRooms([...rooms, newRoom]);
    setExpandedRooms(new Set([...Array.from(expandedRooms), newRoom.id]));
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(rooms.filter(r => r.id !== roomId));
  };

  const handleRoomNameChange = (roomId: string, name: string) => {
    setRooms(rooms.map(r => r.id === roomId ? { ...r, roomName: name } : r));
  };

  const toggleRoom = (roomId: string) => {
    const newExpanded = new Set(expandedRooms);
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId);
    } else {
      newExpanded.add(roomId);
    }
    setExpandedRooms(newExpanded);
  };

  const handleAddMeasurement = (roomId: string) => {
    const newMeasurement: Measurement = {
      id: `M-${Date.now()}`,
      label: '',
      value: '',
      unit: 'mm',
      description: ''
    };
    setRooms(rooms.map(r => {
      if (r.id === roomId) {
        return { ...r, measurements: [...r.measurements, newMeasurement] };
      }
      return r;
    }));
  };

  const handleMeasurementChange = (roomId: string, measurementId: string, field: keyof Measurement, value: string) => {
    setRooms(rooms.map(r => {
      if (r.id === roomId) {
        const updatedMeasurements = r.measurements.map(m =>
          m.id === measurementId ? { ...m, [field]: value } : m
        );
        return { ...r, measurements: updatedMeasurements };
      }
      return r;
    }));
  };

  const handleDeleteMeasurement = (roomId: string, measurementId: string) => {
    setRooms(rooms.map(r => {
      if (r.id === roomId) {
        return { ...r, measurements: r.measurements.filter(m => m.id !== measurementId) };
      }
      return r;
    }));
  };

  const handleSave = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      await projectManagementService.saveSiteMeasurements(projectId, rooms);
      toast({
        title: "Measurements Saved",
        description: "Site dimensions have been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save measurements.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">
      {!projectId ? (
        <div className="w-full py-2 space-y-6">
          <div className="flex items-center gap-2 mb-3">
            <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Select Project for Measurements</h1>
              <p className="text-sm text-gray-500">Choose a project to capture actual dimensions</p>
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
                      onClick={() => router.push(`/project-management/site-visit/measurements?projectId=${project.id}`)}
                    >
                      Enter Dimensions
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full py-2 space-y-3 px-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => router.push('/project-management/site-visit/measurements')} className="p-0 hover:bg-transparent">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Site Measurements</h1>
                <p className="text-sm text-gray-500">
                  {selectedProject?.name} • Step 2.5: Capture actual dimensions via mobile app
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push('/project-management/site-visit/measurements')}>
                Change Project
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleAddRoom}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Room
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={loading || saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Measurements'}
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-center py-12 text-gray-500">Loading measurements...</p>
          ) : (
            <div className="space-y-3">
              {rooms.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Ruler className="w-12 h-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">No Measurements Yet</h3>
                  <p className="text-gray-500 mb-2">Start by adding a room to record dimensions.</p>
                  <Button onClick={handleAddRoom}>Add First Room</Button>
                </div>
              ) : (
                rooms.map((room) => (
                  <Card key={room.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 py-3 px-4 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={() => toggleRoom(room.id)}>
                          {expandedRooms.has(room.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        <Input
                          value={room.roomName}
                          onChange={(e) => handleRoomNameChange(room.id, e.target.value)}
                          className="h-8 w-48 font-medium bg-transparent border-transparent hover:border-gray-300 focus:bg-white transition-colors"
                          placeholder="Room Name"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteRoom(room.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    {expandedRooms.has(room.id) && (
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {room.measurements.map((measurement) => (
                            <div key={measurement.id} className="grid grid-cols-12 gap-3 items-start p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all">
                              <div className="col-span-3">
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Label</label>
                                <Input
                                  value={measurement.label}
                                  onChange={(e) => handleMeasurementChange(room.id, measurement.id, 'label', e.target.value)}
                                  placeholder="e.g. Wall A"
                                  className="h-8"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Value</label>
                                <Input
                                  type="number"
                                  value={measurement.value}
                                  onChange={(e) => handleMeasurementChange(room.id, measurement.id, 'value', e.target.value)}
                                  placeholder="0"
                                  className="h-8"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Unit</label>
                                <Select
                                  value={measurement.unit}
                                  onValueChange={(value) => handleMeasurementChange(room.id, measurement.id, 'unit', value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="mm">mm</SelectItem>
                                    <SelectItem value="cm">cm</SelectItem>
                                    <SelectItem value="m">m</SelectItem>
                                    <SelectItem value="sqm">sqm</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-4">
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                                <Input
                                  value={measurement.description || ''}
                                  onChange={(e) => handleMeasurementChange(room.id, measurement.id, 'description', e.target.value)}
                                  placeholder="Optional details..."
                                  className="h-8"
                                />
                              </div>
                              <div className="col-span-1 flex justify-end pt-6">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500" onClick={() => handleDeleteMeasurement(room.id, measurement.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button variant="outline" size="sm" className="w-full border-dashed text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50" onClick={() => handleAddMeasurement(room.id)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Measurement
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
