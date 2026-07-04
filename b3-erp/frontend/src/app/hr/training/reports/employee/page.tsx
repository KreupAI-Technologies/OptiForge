'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Clock,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface EmployeeRecord {
  id: number | string;
  name: string;
  role: string;
  department: string;
  location: string;
  email: string;
  phone: string;
  avatar: string;
}

const seedEmployees = [
  { id: 1, name: 'Alice Johnson', role: 'Senior Engineer', department: 'Engineering', location: 'New York', email: 'alice.j@optiforge.com', phone: '+1 (555) 123-4567', avatar: 'AJ' },
  { id: 2, name: 'Bob Smith', role: 'Product Manager', department: 'Product', location: 'London', email: 'bob.s@optiforge.com', phone: '+44 20 7123 4567', avatar: 'BS' },
  { id: 3, name: 'Charlie Davis', role: 'Sales Executive', department: 'Sales', location: 'San Francisco', email: 'charlie.d@optiforge.com', phone: '+1 (555) 987-6543', avatar: 'CD' },
];

const selectedEmployeeData = {
  ...seedEmployees[0],
  joinedDate: '2022-03-15',
  totalHours: 145,
  certifications: 4,
  budgetUsed: 2500,
  skills: [
    { subject: 'Leadership', A: 120, fullMark: 150 },
    { subject: 'Technical', A: 145, fullMark: 150 },
    { subject: 'Communication', A: 100, fullMark: 150 },
    { subject: 'Project Mgmt', A: 110, fullMark: 150 },
    { subject: 'Strategy', A: 90, fullMark: 150 },
    { subject: 'Mentoring', A: 130, fullMark: 150 },
  ],
  history: [
    { id: 1, course: 'Advanced React Patterns', date: '2023-11-10', status: 'Completed', score: '95%', credits: 20 },
    { id: 2, course: 'Engineering Leadership 101', date: '2023-09-22', status: 'Completed', score: '88%', credits: 15 },
    { id: 3, course: 'Safe Workplace Practices', date: '2024-01-15', status: 'Completed', score: '100%', credits: 5 },
    { id: 4, course: 'Cloud Architecture Summit', date: '2024-02-20', status: 'Upcoming', score: '-', credits: 10 },
  ]
};

export default function EmployeeReportsPage() {
  const [searchTerm, setSearchTerm] = useState('Alice Johnson');
  const [selectedEmployee, setSelectedEmployee] = useState(selectedEmployeeData);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.get<any[]>('/hr/employees'));
        const mapped: EmployeeRecord[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          id: r.id ?? '',
          name: r.name ?? [r.firstName, r.lastName].filter(Boolean).join(' ') ?? '',
          role: r.role ?? r.jobTitle ?? r.designation ?? '',
          department: r.department ?? r.departmentName ?? '',
          location: r.location ?? '',
          email: r.email ?? '',
          phone: r.phone ?? '',
          avatar: r.avatar ?? String(r.name ?? '').split(' ').map((n: string) => n[0]).join('').slice(0, 2),
        }));
        if (!cancelled) setEmployees(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load employees');
          setEmployees([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-8 w-8 text-purple-600" />
            Employee Training Reports
          </h1>
          <p className="text-gray-500 mt-1">Individual training profiles and history</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employee..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Profile
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading employees…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center text-2xl font-bold text-purple-600 mb-2 border-4 border-white shadow-lg">
              {selectedEmployee.avatar}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{selectedEmployee.name}</h2>
            <p className="text-purple-600 font-medium">{selectedEmployee.role}</p>

            <div className="w-full mt-6 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Briefcase className="w-4 h-4 mr-3 text-gray-400" />
                {selectedEmployee.department}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                {selectedEmployee.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                {selectedEmployee.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                {selectedEmployee.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                Joined {selectedEmployee.joinedDate}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-2">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{selectedEmployee.totalHours}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Training Hours</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{selectedEmployee.certifications}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Certificates</p>
            </div>
          </div>
        </div>

        {/* Skills Radar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2 self-start">Skill Profile</h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={selectedEmployee.skills}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar
                  name={selectedEmployee.name}
                  dataKey="A"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance / Stats Placeholder */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 relative overflow-hidden">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Budget Utilization</h3>
          <div className="relative z-10 mt-6">
            <span className="text-4xl font-extrabold text-gray-900">${selectedEmployee.budgetUsed}</span>
            <span className="text-gray-500 text-sm ml-2">used</span>
          </div>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">75% of annual allocation ($3,300)</p>

          <h3 className="text-lg font-bold text-gray-900 mt-8 mb-2">Mandatory Compliance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Code of Conduct
              </span>
              <span className="text-green-600 font-medium">Completed</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Data Privacy
              </span>
              <span className="text-green-600 font-medium">Completed</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                Safety Training
              </span>
              <span className="text-amber-600 font-medium">Due in 5 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Training History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Training History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-3 py-2">Course Name</th>
                <th className="px-3 py-2">Completion Date</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2 text-right">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {selectedEmployee.history.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 font-medium text-gray-900">{record.course}</td>
                  <td className="px-3 py-2 text-gray-500">{record.date}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${record.status === 'Completed' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                        record.status === 'Upcoming' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                          'bg-gray-50 text-gray-600 ring-gray-500/10'
                      }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-900">{record.score}</td>
                  <td className="px-3 py-2 text-right font-medium">{record.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
