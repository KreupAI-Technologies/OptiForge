'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Building, Calendar, Users, CheckCircle, Clock, Search, Filter, Plus, UserPlus, CheckSquare, ChevronRight, X, User } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { toast } from '@/hooks/use-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface NewJoiner {
  id: string;
  employeeCode: string;
  name: string;
  department: string;
  designation: string;
  joinDate: string;
  mentor: string | null;
  inductionStatus: 'Pending' | 'Scheduled' | 'In Progress' | 'Completed';
  inductionProgress: number; // 0-100
  scheduledDate: string | null;
  tasks: {
    id: string;
    label: string;
    completed: boolean;
  }[];
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedJoiner, setSelectedJoiner] = useState<NewJoiner | null>(null);

  // Form State for Schedule
  const [scheduleDate, setScheduleDate] = useState('');
  const [mentorName, setMentorName] = useState('');

  const [joiners, setJoiners] = useState<NewJoiner[]>([]);

  // Fetch onboarding tasks / induction records from backend
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/hr/onboarding-tasks?companyId=default-company-id`);
        if (!res.ok) {
          if (!cancelled) setJoiners([]);
          return;
        }
        const json = await res.json();
        const rows = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
        if (!Array.isArray(rows) || rows.length === 0) {
          if (!cancelled) setJoiners([]);
          return;
        }
        // Map raw rows defensively into the NewJoiner shape.
        const mapped: NewJoiner[] = rows.map((r: any, idx: number) => {
          const rawTasks = Array.isArray(r?.tasks) ? r.tasks : [];
          const tasks = rawTasks.map((t: any, ti: number) => ({
            id: String(t?.id ?? `t${ti + 1}`),
            label: String(t?.label ?? t?.name ?? t?.title ?? ''),
            completed: Boolean(t?.completed ?? t?.done ?? false),
          }));
          const statusRaw = String(r?.inductionStatus ?? r?.status ?? 'Pending');
          const allowed = ['Pending', 'Scheduled', 'In Progress', 'Completed'];
          const inductionStatus = (allowed.includes(statusRaw) ? statusRaw : 'Pending') as NewJoiner['inductionStatus'];
          return {
            id: String(r?.id ?? r?._id ?? idx),
            employeeCode: String(r?.employeeCode ?? r?.code ?? ''),
            name: String(r?.name ?? r?.employeeName ?? ''),
            department: String(r?.department ?? ''),
            designation: String(r?.designation ?? ''),
            joinDate: String(r?.joinDate ?? r?.joinedOn ?? ''),
            mentor: r?.mentor ?? null,
            inductionStatus,
            inductionProgress: Number(r?.inductionProgress ?? r?.progress ?? 0) || 0,
            scheduledDate: r?.scheduledDate ?? null,
            tasks,
          };
        });
        if (!cancelled) setJoiners(mapped);
      } catch {
        if (!cancelled) setJoiners([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Derived Stats
  const stats = useMemo(() => {
    return {
      activeInductions: joiners.filter(j => j.inductionStatus === 'In Progress').length,
      pendingSchedules: joiners.filter(j => j.inductionStatus === 'Pending').length,
      completedThisMonth: joiners.filter(j => j.inductionStatus === 'Completed').length,
      mentorsAssigned: joiners.filter(j => j.mentor !== null).length,
    };
  }, [joiners]);

  const filteredJoiners = useMemo(() => {
    return joiners.filter(joiner => {
      const matchesStatus = selectedStatus === 'All' || joiner.inductionStatus === selectedStatus;
      const matchesSearch = searchTerm === '' ||
        joiner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        joiner.department.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [joiners, selectedStatus, searchTerm]);

  // Safe Date Rendering Component
  const DateDisplay = ({ date }: { date: string | null }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted || !date) return <span>{date || '-'}</span>;
    return <span>{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-purple-100 text-purple-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenSchedule = (joiner: NewJoiner) => {
    setSelectedJoiner(joiner);
    setScheduleDate('');
    setMentorName('');
    setShowScheduleModal(true);
  };

  const handleOpenChecklist = (joiner: NewJoiner) => {
    setSelectedJoiner(joiner);
    setShowChecklistModal(true);
  };

  const handleScheduleSubmit = async () => {
    if (!selectedJoiner || !scheduleDate || !mentorName) {
      toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/hr/onboarding-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'default-company-id',
          employeeId: selectedJoiner.id,
          employeeCode: selectedJoiner.employeeCode,
          name: selectedJoiner.name,
          department: selectedJoiner.department,
          designation: selectedJoiner.designation,
          mentor: mentorName,
          scheduledDate: scheduleDate,
          inductionStatus: 'Scheduled',
        }),
      });
      if (!res.ok) {
        alert('Failed to save.');
        return;
      }
    } catch {
      alert('Failed to save.');
      return;
    }

    setJoiners(prev => prev.map(j =>
      j.id === selectedJoiner.id
        ? { ...j, mentor: mentorName, scheduledDate: scheduleDate, inductionStatus: 'Scheduled' }
        : j
    ));

    toast({ title: 'Induction Scheduled', description: `Scheduled for ${selectedJoiner.name}` });
    setShowScheduleModal(false);
    setSelectedJoiner(null);
  };

  const toggleTask = (taskId: string) => {
    if (!selectedJoiner) return;

    const updatedTasks = selectedJoiner.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    const completedCount = updatedTasks.filter(t => t.completed).length;
    const progress = Math.round((completedCount / updatedTasks.length) * 100);
    const newStatus = progress === 100 ? 'Completed' : (progress > 0 ? 'In Progress' : selectedJoiner.inductionStatus);

    const updatedJoiner = { ...selectedJoiner, tasks: updatedTasks, inductionProgress: progress, inductionStatus: newStatus };

    setSelectedJoiner(updatedJoiner);
    setJoiners(prev => prev.map(j => j.id === updatedJoiner.id ? updatedJoiner : j));
  };

  const columns = [
    {
      key: 'name', label: 'Employee', sortable: true,
      render: (v: string, row: NewJoiner) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.designation}</div>
        </div>
      )
    },
    { key: 'department', label: 'Department', sortable: true },
    {
      key: 'joinDate', label: 'Joined On', sortable: true,
      render: (v: string) => <DateDisplay date={v} />
    },
    {
      key: 'mentor', label: 'Mentor', sortable: true,
      render: (v: string | null) => (
        v ? <span className="flex items-center gap-1 text-sm"><User className="h-3 w-3" /> {v}</span>
          : <span className="text-xs text-gray-400 italic">Not Assigned</span>
      )
    },
    {
      key: 'inductionStatus', label: 'Status', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {v}
        </span>
      )
    },
    {
      key: 'inductionProgress', label: 'Progress', sortable: true,
      render: (v: number) => (
        <div className="w-full max-w-[100px]">
          <div className="flex justify-between text-xs mb-1">
            <span>{v}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${v}%` }}></div>
          </div>
        </div>
      )
    },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (_: any, row: NewJoiner) => (
        <div className="flex gap-2">
          {row.inductionStatus === 'Pending' ? (
            <button
              onClick={() => handleOpenSchedule(row)}
              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"
              title="Schedule Induction"
            >
              <Calendar className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => handleOpenChecklist(row)}
              className="p-1.5 hover:bg-green-50 text-green-600 rounded-md transition-colors"
              title="View Checklist"
            >
              <CheckSquare className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Building className="h-8 w-8 text-blue-600" />
          Department Induction
        </h1>
        <p className="text-gray-600 mt-2">Manage onboarding and induction for new department members</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Inductions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeInductions}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-100" />
          </div>
        </div>
        <div className="bg-white border-l-4 border-yellow-500 rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Schedule</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingSchedules}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-100" />
          </div>
        </div>
        <div className="bg-white border-l-4 border-green-500 rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed (Month)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedThisMonth}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-100" />
          </div>
        </div>
        <div className="bg-white border-l-4 border-purple-500 rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Mentors Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.mentorsAssigned}</p>
            </div>
            <Users className="h-8 w-8 text-purple-100" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-2 justify-between items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            {['All', 'Pending', 'Scheduled', 'In Progress', 'Completed'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${selectedStatus === status
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <DataTable data={filteredJoiners} columns={columns} />

        {filteredJoiners.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p>No induction records found.</p>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedJoiner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Schedule Induction</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Employee</p>
                <p className="text-lg font-semibold text-gray-900">{selectedJoiner.name}</p>
                <p className="text-sm text-gray-500">{selectedJoiner.designation} • {selectedJoiner.department}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Induction Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Mentor</label>
                <input
                  type="text"
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  placeholder="Enter mentor name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Modal */}
      {showChecklistModal && selectedJoiner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Induction Task List</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(selectedJoiner.inductionStatus)}`}>
                  {selectedJoiner.inductionStatus}
                </span>
              </div>
              <button onClick={() => setShowChecklistModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-3">
                <h4 className="font-semibold text-gray-900">{selectedJoiner.name}</h4>
                <p className="text-sm text-gray-500 mb-2">{selectedJoiner.designation}</p>

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{selectedJoiner.inductionProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${selectedJoiner.inductionProgress}%` }}></div>
                </div>
              </div>

              <div className="space-y-3">
                {selectedJoiner.tasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center transition-colors ${task.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 bg-white'
                        }`}
                    >
                      {task.completed && <CheckSquare className="h-3.5 w-3.5" />}
                    </button>
                    <div>
                      <p className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end">
              <button
                onClick={() => setShowChecklistModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
