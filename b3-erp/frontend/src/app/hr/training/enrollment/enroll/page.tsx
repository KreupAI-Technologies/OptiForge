'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { UserPlus, Search, Users, Calendar, AlertTriangle } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  selected?: boolean;
}

interface Program {
  id: string;
  title: string;
  date: string;
  enrolled: number;
  capacity: number;
}

export default function EnrollmentPage() {
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.trainingEnrollments<any[]>();
        if (!cancelled) setEmployees(Array.isArray(rows) ? (rows as any) : []);
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

  const programs: Program[] = [
    { id: '1', title: 'Advanced React Patterns', date: '2024-04-10', enrolled: 15, capacity: 20 },
    { id: '2', title: 'Effective Communication', date: '2024-04-12', enrolled: 48, capacity: 50 },
    { id: '3', title: 'Security Compliance', date: '2024-04-15', enrolled: 30, capacity: 30 },
  ];

  const currentProgram = programs.find(p => p.id === selectedProgram);

  const toggleSelection = (id: string) => {
    setEmployees(employees.map(emp =>
      emp.id === id ? { ...emp, selected: !emp.selected } : emp
    ));
  };

  const handleEnroll = () => {
    const selectedCount = employees.filter(e => e.selected).length;
    if (selectedCount === 0) return;

    if (currentProgram && (currentProgram.enrolled + selectedCount > currentProgram.capacity)) {
      alert(`Cannot enroll ${selectedCount} employees. Only ${currentProgram.capacity - currentProgram.enrolled} spots remaining.`);
      return;
    }

    alert(`Successfully enrolled ${selectedCount} employees in ${currentProgram?.title}`);
    setEmployees(employees.map(e => ({ ...e, selected: false })));
  };

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="h-8 w-8 text-purple-600" />
            Enroll in Training
          </h1>
          <p className="text-gray-500 mt-1">Register employees for upcoming training sessions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Program Selection */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              Select Session
            </h3>
            <div className="space-y-3">
              {programs.map(program => (
                <div
                  key={program.id}
                  onClick={() => setSelectedProgram(program.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedProgram === program.id
                      ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                      : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-gray-900">{program.title}</h4>
                    {program.enrolled >= program.capacity && (
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">FULL</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{program.date}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${program.enrolled >= program.capacity ? 'bg-red-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${(program.enrolled / program.capacity) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-600 font-medium">{program.enrolled}/{program.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Employee Selection */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-400" />
                Select Employees
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or role..."
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none w-64"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-3">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                    <th className="pb-3 w-10">
                      <input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500" />
                    </th>
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3">
                        <input
                          type="checkbox"
                          checked={!!emp.selected}
                          onChange={() => toggleSelection(emp.id)}
                          className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 font-medium text-gray-900">{emp.name}</td>
                      <td className="py-3 text-gray-600 text-sm">{emp.role}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                          {emp.department}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{employees.filter(e => e.selected).length}</span> employees selected
              </div>
              <button
                onClick={handleEnroll}
                disabled={!selectedProgram}
                className={`px-6 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${selectedProgram
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <UserPlus className="h-4 w-4" />
                Confirm Enrollment
              </button>
            </div>
            {!selectedProgram && (
              <p className="text-right text-xs text-orange-500 mt-2 flex items-center justify-end gap-1">
                <AlertTriangle className="h-3 w-3" />
                Please select a training session first
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
