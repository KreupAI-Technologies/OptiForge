'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Grid, Users, TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';

interface SkillLevel {
  level: number;
  label: string;
  color: string;
  description: string;
}

interface SkillColumn {
  id: string;
  name: string;
  key: string;
}

interface EmployeeSkill {
  employeeCode: string;
  employeeName: string;
  designation: string;
  // dynamic per-skill numeric levels keyed by skill id
  [skillKey: string]: string | number;
}

export default function SkillsMatrixPage() {
  const router = useRouter();
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [skills, setSkills] = useState<SkillColumn[]>([]);
  const [mockEmployees, setMockEmployees] = useState<EmployeeSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const skillLevels: SkillLevel[] = [
    { level: 0, label: 'None', color: 'bg-gray-200', description: 'No knowledge or experience' },
    { level: 1, label: 'Basic', color: 'bg-red-200', description: 'Basic theoretical knowledge' },
    { level: 2, label: 'Working', color: 'bg-yellow-200', description: 'Can perform with supervision' },
    { level: 3, label: 'Proficient', color: 'bg-blue-200', description: 'Can perform independently' },
    { level: 4, label: 'Expert', color: 'bg-green-200', description: 'Can train others' }
  ];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [rawSkills, rawUserSkills] = await Promise.all([
          HrPagesService.skills() as Promise<any[]>,
          HrPagesService.userSkills() as Promise<any[]>,
        ]);
        const skillList = Array.isArray(rawSkills) ? rawSkills : [];
        const userSkillList = Array.isArray(rawUserSkills) ? rawUserSkills : [];

        // Build skill columns from the skills catalogue.
        const columns: SkillColumn[] = skillList.map((s) => {
          const id = String(s.id ?? s.code ?? s.name ?? '');
          return { id, name: s.name ?? s.code ?? id, key: id };
        });

        // Group userSkills by employee, then map skillId -> proficiencyLevel.
        const byEmployee = new Map<string, EmployeeSkill>();
        for (const us of userSkillList) {
          const empId = String(us.employeeId ?? '');
          if (!empId) continue;
          let row = byEmployee.get(empId);
          if (!row) {
            row = {
              employeeCode: empId,
              employeeName: us.employeeName ?? empId,
              designation: us.designation ?? '',
            };
            // initialise all skill columns to 0
            columns.forEach((c) => { row![c.id] = 0; });
            byEmployee.set(empId, row);
          }
          const skillId = String(us.skillId ?? '');
          if (skillId) {
            row[skillId] = Number(us.proficiencyLevel ?? 0);
          }
        }

        if (!cancelled) {
          setSkills(columns);
          setMockEmployees(Array.from(byEmployee.values()));
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load skills matrix');
          setSkills([]);
          setMockEmployees([]);
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

  const getSkillColor = (level: number) => {
    const colors = ['bg-gray-200', 'bg-red-200', 'bg-yellow-200', 'bg-blue-200', 'bg-green-200'];
    return colors[level] || 'bg-gray-200';
  };

  const getSkillLabel = (level: number) => {
    return skillLevels.find(sl => sl.level === level)?.label || 'None';
  };

  // Calculate statistics
  const calculateSkillStats = () => {
    const stats: Record<string, { avgLevel: string; expertCount: number; gapCount: number }> = {};
    skills.forEach(skill => {
      const skillKey = skill.key as keyof EmployeeSkill;
      const levels = mockEmployees.map(emp => Number(emp[skillKey] ?? 0));
      const avgLevel = levels.length > 0
        ? levels.reduce((sum, level) => sum + level, 0) / levels.length
        : 0;
      const expertCount = levels.filter(level => level === 4).length;
      const gapCount = levels.filter(level => level <= 1).length;

      stats[skill.id] = {
        avgLevel: avgLevel.toFixed(1),
        expertCount,
        gapCount
      };
    });
    return stats;
  };

  const skillStats = calculateSkillStats();

  const overallStats = {
    totalEmployees: mockEmployees.length,
    totalSkills: skills.length,
    expertCount: mockEmployees.filter(emp =>
      skills.some(skill => Number(emp[skill.key] ?? 0) === 4)
    ).length,
    skillGaps: mockEmployees.reduce((sum, emp) =>
      sum + skills.filter(skill => Number(emp[skill.key] ?? 0) <= 1).length, 0
    )
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Grid className="h-8 w-8 text-indigo-600" />
          Skills Matrix
        </h1>
        <p className="text-gray-600 mt-2">Employee competency and skill level tracking</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading skills matrix…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && mockEmployees.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No employee skill data available yet.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-indigo-600">{overallStats.totalEmployees}</p>
            </div>
            <Users className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Skills Tracked</p>
              <p className="text-2xl font-bold text-purple-600">{overallStats.totalSkills}</p>
            </div>
            <Target className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expert Level</p>
              <p className="text-2xl font-bold text-green-600">{overallStats.expertCount}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Skill Gaps</p>
              <p className="text-2xl font-bold text-red-600">{overallStats.skillGaps}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>
      </div>

      {/* Skill Level Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h3 className="font-semibold text-gray-900 mb-3">Skill Level Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {skillLevels.map(level => (
            <div key={level.level} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded ${level.color} border border-gray-300 flex items-center justify-center font-bold text-gray-700`}>
                {level.level}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{level.label}</p>
                <p className="text-xs text-gray-600">{level.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Matrix Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto mb-3">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Employee Skills Matrix</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50">
                Employee
              </th>
              {skills.map(skill => (
                <th key={skill.id} className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div>{skill.name}</div>
                  <div className="text-xs font-normal text-gray-500 mt-1">
                    Avg: {skillStats[skill.id].avgLevel}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockEmployees.map((employee, idx) => (
              <tr key={employee.employeeCode} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 sticky left-0 bg-inherit">
                  <div>
                    <div className="font-semibold text-gray-900">{employee.employeeName}</div>
                    <div className="text-xs text-gray-500">{employee.employeeCode} • {employee.designation}</div>
                  </div>
                </td>
                {skills.map(skill => {
                  const skillKey = skill.key as keyof EmployeeSkill;
                  const level = Number(employee[skillKey] ?? 0);
                  return (
                    <td key={skill.id} className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <div className={`w-16 h-16 rounded-lg ${getSkillColor(level)} border border-gray-300 flex flex-col items-center justify-center`}>
                          <span className="text-2xl font-bold text-gray-700">{level}</span>
                          <span className="text-xs text-gray-600">{getSkillLabel(level)}</span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Skill Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Skill Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Skill Distribution Summary
          </h3>
          <div className="space-y-3">
            {skills.map(skill => {
              const stats = skillStats[skill.id];
              return (
                <div key={skill.id} className="border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">{skill.name}</p>
                    <span className="text-sm text-gray-600">Avg: {stats.avgLevel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-600">{stats.expertCount} Experts</span>
                    </div>
                    {stats.gapCount > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-gray-600">{stats.gapCount} Gaps</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Training Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Training Recommendations
          </h3>
          <div className="space-y-3">
            {skills.filter(skill => skillStats[skill.id].gapCount > 0).map(skill => (
              <div key={skill.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="font-medium text-gray-900 mb-1">{skill.name}</p>
                <p className="text-sm text-gray-600 mb-2">
                  {skillStats[skill.id].gapCount} employee(s) need training
                </p>
                <button
                  onClick={() => router.push(`/hr/training/programs/catalog?skill=${encodeURIComponent(skill.name)}`)}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  View Training Programs →
                </button>
              </div>
            ))}
            {skills.every(skill => skillStats[skill.id].gapCount === 0) && (
              <div className="text-center p-3 text-gray-500">
                <CheckCircle className="h-12 w-12 text-green-400 mb-2" />
                <p>All employees meet minimum skill requirements</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-indigo-900 mb-2">Skills Matrix Guidelines</h3>
        <ul className="text-sm text-indigo-800 space-y-1">
          <li>• Skills are assessed on a 0-4 scale from None to Expert level</li>
          <li>• Regular skill assessments help identify training needs and succession planning</li>
          <li>• Target: All critical skills should have at least 2 experts per department</li>
          <li>• Employees with skill gaps should be enrolled in relevant training programs</li>
          <li>• Expert-level employees can mentor and train others</li>
          <li>• Skills matrix should be reviewed and updated quarterly</li>
        </ul>
      </div>
    </div>
  );
}
