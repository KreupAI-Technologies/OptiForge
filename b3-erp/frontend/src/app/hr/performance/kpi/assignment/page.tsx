'use client';

import { useState, useEffect } from 'react';
import { PerformanceManagementService } from '@/services/performance-management.service';
import { UserCheck, Plus, Trash2, Search } from 'lucide-react';
import DataTable from '@/components/DataTable';

interface KPI {
  id: string;
  title: string;
  description: string;
  target: string;
  weight: number;
  dueDate: string;
  status: 'assigned';
}

interface Employee {
  id: string;
  name: string;
  role: string;
  kpis: KPI[];
}

export default function KPIAssignmentPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await PerformanceManagementService.getKPIAssignments();
        const rows: any[] = Array.isArray(res?.data) ? res.data : [];
        // Group assignments by employeeId to build the Employee[] list.
        const byEmployee = new Map<string, Employee>();
        for (const row of rows) {
          const empId = String(row.employeeId ?? '');
          if (!empId) continue;
          let emp = byEmployee.get(empId);
          if (!emp) {
            emp = {
              id: empId,
              name: row.employeeName ?? empId,
              role: '',
              kpis: [],
            };
            byEmployee.set(empId, emp);
          }
          emp.kpis.push({
            id: String(row.id ?? ''),
            title: row.title ?? '',
            description: row.description ?? '',
            target: row.target ?? '',
            weight: Number(row.weightage ?? 0),
            dueDate: row.dueDate ?? '',
            status: 'assigned',
          });
        }
        if (!cancelled) setEmployees(Array.from(byEmployee.values()));
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setEmployees([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target: '',
    weight: '20',
    dueDate: ''
  });

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAssignKPI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;
    setIsSubmitting(true);
    setSubmitError(null);
    const weight = parseInt(formData.weight);
    try {
      const created = await PerformanceManagementService.createKPIAssignment({
        employeeId: selectedEmployeeId,
        employeeName: selectedEmployee?.name,
        title: formData.title,
        description: formData.description,
        target: formData.target,
        weightage: weight,
        dueDate: formData.dueDate,
        status: 'assigned',
      } as any);
      const newKPI: KPI = {
        id: String((created as any)?.id ?? Date.now().toString()),
        title: formData.title,
        description: formData.description,
        target: formData.target,
        weight,
        dueDate: formData.dueDate,
        status: 'assigned'
      };
      setEmployees(prev => prev.map(emp =>
        emp.id === selectedEmployeeId
          ? { ...emp, kpis: [...emp.kpis, newKPI] }
          : emp
      ));
      setFormData({
        title: '',
        description: '',
        target: '',
        weight: '20',
        dueDate: ''
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to assign KPI');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteKPI = async (kpi: KPI) => {
    if (!selectedEmployeeId || !kpi.id) return;
    setDeletingId(kpi.id);
    try {
      await PerformanceManagementService.deleteKPIAssignment(kpi.id);
      setEmployees(prev => prev.map(emp =>
        emp.id === selectedEmployeeId
          ? { ...emp, kpis: emp.kpis.filter(k => k.id !== kpi.id) }
          : emp
      ));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to delete KPI');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    { key: 'title', label: 'KPI Title', sortable: true },
    { key: 'target', label: 'Target', sortable: true },
    {
      key: 'weight',
      label: 'Weight',
      render: (v: number) => <span className="font-medium text-gray-700">{v}%</span>
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (v: string) => new Date(v).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_v: unknown, row: KPI) => (
        <button
          onClick={() => handleDeleteKPI(row)}
          disabled={deletingId === row.id}
          className="text-red-500 hover:text-red-700 disabled:opacity-50"
          title="Remove KPI"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )
    }
  ];

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="h-8 w-8 text-purple-600" />
            KPI Assignment
          </h1>
          <p className="text-gray-500 mt-1">Assign and manage Key Performance Indicators for your team.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Employee List Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Select Employee</h2>
            <div className="mt-2 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {employees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployeeId(emp.id)}
                className={`w-full text-left p-3 hover:bg-purple-50 transition-colors ${selectedEmployeeId === emp.id ? 'bg-purple-50 border-l-4 border-purple-600' : 'border-l-4 border-transparent'
                  }`}
              >
                <p className="font-medium text-gray-900">{emp.name}</p>
                <p className="text-xs text-gray-500">{emp.role}</p>
                <p className="text-xs text-purple-600 mt-1">{emp.kpis.length} KPIs assigned</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-3">
          {selectedEmployee ? (
            <>
              {/* Assignment Form */}
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-purple-600" />
                  Assign New KPI to {selectedEmployee.name}
                </h3>
                <form onSubmit={handleAssignKPI} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {submitError && (
                    <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                      {submitError}
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">KPI Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Increase Production Efficiency"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 15%"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.target}
                      onChange={e => setFormData({ ...formData, target: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.weight}
                      onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.dueDate}
                      onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
                    >
                      {isSubmitting ? 'Assigning…' : 'Assign KPI'}
                    </button>
                  </div>
                </form>
              </div>

              {/* KPI List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Assigned KPIs</h3>
                  <span className="text-sm text-gray-500">Total Weight: {selectedEmployee.kpis.reduce((acc, curr) => acc + curr.weight, 0)}%</span>
                </div>
                <DataTable columns={columns} data={selectedEmployee.kpis} />
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-500">
              <UserCheck className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-lg font-medium">Select an employee to manage KPIs</p>
              <p className="text-sm">Choose from the list on the left to view or assign KPIs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
