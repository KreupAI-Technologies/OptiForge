'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, BookOpen, Award, Target, Calendar, CheckCircle, Clock } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface DevelopmentPlan {
  id: string;
  employeeName: string;
  employeeCode: string;
  currentRole: string;
  targetRole: string;
  department: string;
  photo: string;
  status: 'not_started' | 'in_progress' | 'on_track' | 'at_risk' | 'completed';
  startDate: string;
  targetCompletionDate: string;
  progress: number;
  skillGaps: {
    skill: string;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
  }[];
  developmentActivities: {
    activity: string;
    type: 'training' | 'mentoring' | 'project' | 'certification' | 'job_rotation' | 'workshop';
    status: 'completed' | 'in_progress' | 'planned';
    startDate: string;
    endDate: string;
    cost?: number;
  }[];
  milestones: {
    name: string;
    completed: boolean;
    dueDate: string;
  }[];
  mentor: string;
  budget: number;
  spentBudget: number;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const mockPlans: DevelopmentPlan[] = [
    {
      id: '1',
      employeeName: 'Kavita Singh',
      employeeCode: 'EMP008',
      currentRole: 'IT Lead',
      targetRole: 'CTO',
      department: 'IT',
      photo: '👩‍💼',
      status: 'in_progress',
      startDate: '2024-07-01',
      targetCompletionDate: '2025-06-30',
      progress: 65,
      skillGaps: [
        { skill: 'Executive Leadership', currentLevel: 75, requiredLevel: 95, gap: 20 },
        { skill: 'Board Communication', currentLevel: 60, requiredLevel: 90, gap: 30 },
        { skill: 'P&L Management', currentLevel: 65, requiredLevel: 90, gap: 25 },
        { skill: 'Strategic Planning', currentLevel: 80, requiredLevel: 95, gap: 15 }
      ],
      developmentActivities: [
        { activity: 'Executive Leadership Program - IIM Bangalore', type: 'training', status: 'in_progress', startDate: '2024-09-01', endDate: '2025-03-31', cost: 500000 },
        { activity: 'CFO Shadowing Program', type: 'mentoring', status: 'in_progress', startDate: '2024-10-01', endDate: '2025-06-30' },
        { activity: 'Board Presentation Workshop', type: 'workshop', status: 'planned', startDate: '2025-04-01', endDate: '2025-05-15', cost: 75000 },
        { activity: 'Digital Transformation Project Lead', type: 'project', status: 'in_progress', startDate: '2024-11-01', endDate: '2025-05-31' }
      ],
      milestones: [
        { name: 'Complete Executive Leadership Module 1', completed: true, dueDate: '2024-10-31' },
        { name: 'Lead quarterly board presentation', completed: true, dueDate: '2024-12-15' },
        { name: 'Complete P&L management certification', completed: false, dueDate: '2025-03-31' },
        { name: 'Complete digital transformation project', completed: false, dueDate: '2025-05-31' }
      ],
      mentor: 'Rajesh Kumar (CTO)',
      budget: 800000,
      spentBudget: 520000
    },
    {
      id: '2',
      employeeName: 'Arjun Kapoor',
      employeeCode: 'EMP007',
      currentRole: 'Sales Lead',
      targetRole: 'VP Sales',
      department: 'Sales',
      photo: '👨‍💼',
      status: 'on_track',
      startDate: '2024-09-01',
      targetCompletionDate: '2025-07-31',
      progress: 55,
      skillGaps: [
        { skill: 'Strategic Planning', currentLevel: 70, requiredLevel: 90, gap: 20 },
        { skill: 'Multi-Regional Management', currentLevel: 60, requiredLevel: 85, gap: 25 },
        { skill: 'Team Leadership (50+ team)', currentLevel: 65, requiredLevel: 90, gap: 25 },
        { skill: 'Business Development', currentLevel: 85, requiredLevel: 95, gap: 10 }
      ],
      developmentActivities: [
        { activity: 'Advanced Sales Leadership - XLRI', type: 'training', status: 'in_progress', startDate: '2024-10-01', endDate: '2025-04-30', cost: 350000 },
        { activity: 'Regional Strategy Project - South India', type: 'project', status: 'in_progress', startDate: '2024-11-01', endDate: '2025-05-31' },
        { activity: 'VP Sales Mentorship', type: 'mentoring', status: 'in_progress', startDate: '2024-09-01', endDate: '2025-07-31' },
        { activity: 'Cross-Regional Team Management', type: 'job_rotation', status: 'planned', startDate: '2025-05-01', endDate: '2025-07-31' }
      ],
      milestones: [
        { name: 'Complete sales strategy module', completed: true, dueDate: '2024-11-30' },
        { name: 'Lead regional expansion project', completed: false, dueDate: '2025-05-31' },
        { name: 'Build 50+ member team structure', completed: false, dueDate: '2025-06-30' },
        { name: 'Complete leadership certification', completed: false, dueDate: '2025-07-15' }
      ],
      mentor: 'Priya Sharma (VP Sales)',
      budget: 600000,
      spentBudget: 320000
    },
    {
      id: '3',
      employeeName: 'Rahul Mehta',
      employeeCode: 'EMP015',
      currentRole: 'Finance Manager',
      targetRole: 'CFO',
      department: 'Finance',
      photo: '👨‍💼',
      status: 'in_progress',
      startDate: '2024-08-01',
      targetCompletionDate: '2026-01-31',
      progress: 40,
      skillGaps: [
        { skill: 'Executive Leadership', currentLevel: 65, requiredLevel: 90, gap: 25 },
        { skill: 'Board Interactions', currentLevel: 50, requiredLevel: 85, gap: 35 },
        { skill: 'Investor Relations', currentLevel: 55, requiredLevel: 90, gap: 35 },
        { skill: 'Strategic Business Planning', currentLevel: 70, requiredLevel: 95, gap: 25 }
      ],
      developmentActivities: [
        { activity: 'Executive MBA (Finance) - IIM Ahmedabad', type: 'training', status: 'in_progress', startDate: '2024-08-01', endDate: '2026-01-31', cost: 2500000 },
        { activity: 'CFO Mentorship Program', type: 'mentoring', status: 'in_progress', startDate: '2024-09-01', endDate: '2025-12-31' },
        { activity: 'Board Meeting Shadowing', type: 'project', status: 'planned', startDate: '2025-07-01', endDate: '2025-12-31' },
        { activity: 'Investor Relations Workshop', type: 'workshop', status: 'planned', startDate: '2025-09-01', endDate: '2025-09-30', cost: 100000 }
      ],
      milestones: [
        { name: 'Complete EMBA semester 1', completed: true, dueDate: '2024-12-31' },
        { name: 'Shadow CFO in board meetings (3 sessions)', completed: false, dueDate: '2025-08-31' },
        { name: 'Lead investor presentation', completed: false, dueDate: '2025-10-31' },
        { name: 'Complete EMBA program', completed: false, dueDate: '2026-01-31' }
      ],
      mentor: 'Suresh Iyer (CFO)',
      budget: 3000000,
      spentBudget: 1200000
    },
    {
      id: '4',
      employeeName: 'Neha Gupta',
      employeeCode: 'EMP012',
      currentRole: 'HR Manager',
      targetRole: 'CHRO',
      department: 'HR',
      photo: '👩‍💼',
      status: 'on_track',
      startDate: '2024-06-01',
      targetCompletionDate: '2026-02-28',
      progress: 50,
      skillGaps: [
        { skill: 'C-Suite Leadership', currentLevel: 68, requiredLevel: 92, gap: 24 },
        { skill: 'Organizational Transformation', currentLevel: 72, requiredLevel: 95, gap: 23 },
        { skill: 'Business Strategy Alignment', currentLevel: 65, requiredLevel: 90, gap: 25 },
        { skill: 'Change Management', currentLevel: 78, requiredLevel: 95, gap: 17 }
      ],
      developmentActivities: [
        { activity: 'Senior HR Leadership Program - SHRM', type: 'training', status: 'in_progress', startDate: '2024-07-01', endDate: '2025-05-31', cost: 400000 },
        { activity: 'Business Strategy Workshops', type: 'workshop', status: 'in_progress', startDate: '2024-09-01', endDate: '2025-07-31', cost: 150000 },
        { activity: 'Change Management Certification - Prosci', type: 'certification', status: 'planned', startDate: '2025-06-01', endDate: '2025-08-31', cost: 200000 },
        { activity: 'Executive Coaching Program', type: 'mentoring', status: 'in_progress', startDate: '2024-06-01', endDate: '2025-12-31', cost: 300000 }
      ],
      milestones: [
        { name: 'Complete SHRM Senior Professional module', completed: true, dueDate: '2024-10-31' },
        { name: 'Lead organizational transformation project', completed: false, dueDate: '2025-06-30' },
        { name: 'Complete change management certification', completed: false, dueDate: '2025-08-31' },
        { name: 'Complete executive coaching', completed: false, dueDate: '2025-12-31' }
      ],
      mentor: 'Anjali Desai (CHRO)',
      budget: 1200000,
      spentBudget: 600000
    }
  ];

  const [rows, setRows] = useState<DevelopmentPlan[]>(mockPlans);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getSuccession<DevelopmentPlan>('talent-development');
        if (!cancelled && data.length > 0) setRows(data);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredPlans = rows.filter(plan => {
    const matchesStatus = selectedStatus === 'all' || plan.status === selectedStatus;
    const matchesDepartment = selectedDepartment === 'all' || plan.department === selectedDepartment;
    return matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'on_track': return 'bg-teal-100 text-teal-700 border-teal-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'at_risk': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'not_started': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'training': return <BookOpen className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      case 'project': return <Target className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getActivityStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'planned': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const totalPlans = rows.length;
  const onTrackPlans = rows.filter(p => p.status === 'on_track').length;
  const avgProgress = Math.round(rows.reduce((sum, p) => sum + p.progress, 0) / totalPlans);
  const totalBudget = rows.reduce((sum, p) => sum + p.budget, 0);

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-teal-600" />
          Talent Development
        </h1>
        <p className="text-sm text-gray-600 mt-1">Individual development plans and progress tracking</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Total Plans</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{totalPlans}</p>
            </div>
            <Target className="h-10 w-10 text-purple-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm border border-teal-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">On Track</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{onTrackPlans}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-teal-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Avg. Progress</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{avgProgress}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Total Budget</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(totalBudget)}</p>
            </div>
            <Award className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Statuses</option>
              <option value="on_track">On Track</option>
              <option value="in_progress">In Progress</option>
              <option value="at_risk">At Risk</option>
              <option value="completed">Completed</option>
              <option value="not_started">Not Started</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Department</label>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Departments</option>
              <option value="IT">IT</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
              <option value="Operations">Operations</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start gap-3 mb-3">
              <div className="text-6xl">{plan.photo}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{plan.employeeName}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${getStatusColor(plan.status)}`}>
                    {plan.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{plan.employeeCode} • {plan.currentRole} → {plan.targetRole}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <span className="font-semibold text-gray-900 ml-2">{plan.department}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-bold text-teal-600 ml-2">{plan.progress}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Target Date:</span>
                    <span className="font-semibold text-gray-900 ml-2">{new Date(plan.targetCompletionDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mentor:</span>
                    <span className="font-semibold text-gray-900 ml-2">{plan.mentor.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-gray-900">Overall Progress</h4>
                <span className="text-sm font-bold text-teal-600">{plan.progress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div className="bg-teal-500 rounded-full h-3 transition-all" style={{ width: `${plan.progress}%` }}></div>
              </div>
            </div>

            <div className="mb-3">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Skill Gaps</h4>
              <div className="space-y-3">
                {plan.skillGaps.map((gap, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{gap.skill}</span>
                      <span className="text-xs text-gray-600">
                        Current: {gap.currentLevel}% → Target: {gap.requiredLevel}% (Gap: {gap.gap}%)
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-400 to-teal-500 rounded-full h-2" style={{ width: `${gap.currentLevel}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-gray-900">Development Activities</h4>
                </div>
                <div className="space-y-2">
                  {plan.developmentActivities.map((activity, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start gap-2 mb-1">
                        {getActivityTypeIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{activity.activity}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getActivityStatusBadge(activity.status)}`}>
                              {activity.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-600">{activity.type.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(activity.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(activity.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {activity.cost && <span className="font-semibold text-teal-700">{formatCurrency(activity.cost)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-purple-600" />
                  <h4 className="text-sm font-bold text-gray-900">Milestones</h4>
                </div>
                <div className="space-y-2">
                  {plan.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-start gap-3 border border-gray-200 rounded-lg p-3">
                      {milestone.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                      )}
                      <div className="flex-1">
                        <p className={`text-sm ${milestone.completed ? 'text-gray-600 line-through' : 'font-semibold text-gray-900'}`}>
                          {milestone.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {new Date(milestone.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-bold text-gray-900 ml-2">{formatCurrency(plan.budget)}</span>
                  <span className="text-gray-600 ml-4">Spent:</span>
                  <span className="font-bold text-teal-600 ml-2">{formatCurrency(plan.spentBudget)}</span>
                  <span className="text-gray-600 ml-2">({Math.round((plan.spentBudget / plan.budget) * 100)}%)</span>
                </div>
                <div className="text-xs text-gray-600">
                  Mentor: {plan.mentor}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
