'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UserPlus,
  UserMinus,
  CheckCircle,
  Clock,
  FileText,
  Users,
  ChevronRight,
  Search,
  Filter,
  Calendar,
  Briefcase,
  Shield,
  Heart,
  CreditCard,
  KeyRound,
  Gift,
  GraduationCap,
  Building2,
  BookOpen,
  FileCheck,
  ClipboardList,
  Star,
  MessageSquare,
  ThumbsUp,
  Send,
  Ban,
  Timer,
  ListChecks,
  Laptop,
  DollarSign,
  Package,
  ClipboardCheck,
  Award,
  ScrollText,
  Network,
  RefreshCw,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';
import { OnboardingService } from '@/services/onboarding.service';
import { OffboardingService } from '@/services/offboarding.service';
import { OnboardingTasksService } from '@/services/onboarding-tasks.service';
import { EmptyState } from '@/components/ui/EmptyState';

// Tab types
type MainTab = 'onboarding' | 'probation' | 'offboarding';
type OnboardingSubTab = 'dashboard' | 'pre-joining' | 'joining-process' | 'orientation' | 'checklist';
type ProbationSubTab = 'dashboard' | 'tracking' | 'reviews' | 'feedback' | 'confirmation';
type OffboardingSubTab = 'dashboard' | 'resignations' | 'clearance' | 'interview' | 'settlement' | 'documents' | 'alumni';

// ============================================================================
// Dashboard Components
// ============================================================================

function OnboardingDashboard() {
  const stats = {
    active: 8,
    pendingJoining: 5,
    inProgress: 3,
    completedThisMonth: 12,
    pendingOffers: 4,
  };

  const [recentOnboardings, setRecentOnboardings] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    OnboardingService.getOnboardingProcesses({ limit: 5 })
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res as any) ? (res as any) : [];
        setRecentOnboardings(
          list.map((o: any) => ({
            id: o?.id ?? String(Math.random()),
            name: o?.employeeName ?? o?.name ?? 'Unknown',
            department: o?.departmentName ?? o?.department ?? '-',
            joiningDate: o?.joiningDate
              ? new Date(o.joiningDate).toISOString().split('T')[0]
              : '-',
            progress: typeof o?.progress === 'number' ? o.progress : 0,
            status: o?.status ?? 'pending',
          }))
        );
      })
      .catch(() => {
        if (mounted) setRecentOnboardings([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Onboardings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <UserPlus className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Joining</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingJoining}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedThisMonth}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Offers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOffers}</p>
            </div>
            <Send className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Recent Onboardings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Onboardings</h3>
        </div>
        <div className="divide-y">
          {recentOnboardings.length === 0 && (
            <EmptyState icon={UserPlus} size="sm" title="No recent onboardings" description="New onboarding processes will appear here." />
          )}
          {recentOnboardings.map((emp) => (
            <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{emp.name}</p>
                  <p className="text-sm text-gray-500">{emp.department} - Joining: {emp.joiningDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{emp.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        emp.progress === 100 ? 'bg-green-500' : emp.progress > 50 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${emp.progress}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    emp.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : emp.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {emp.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreJoiningSection() {
  const [activeSection, setActiveSection] = useState<'offers' | 'documents' | 'verification' | 'medical'>('offers');

  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    OnboardingService.getOffers()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res as any) ? (res as any) : [];
        setOffers(
          list.map((o: any) => ({
            id: o?.id ?? String(Math.random()),
            candidate: o?.candidateName ?? o?.candidate ?? 'Unknown',
            position: o?.positionTitle ?? o?.position ?? '-',
            status: o?.status ?? 'draft',
            salary: typeof o?.salary === 'number' ? o.salary : Number(o?.salary) || 0,
            joiningDate: o?.joiningDate
              ? new Date(o.joiningDate).toISOString().split('T')[0]
              : '-',
          }))
        );
      })
      .catch(() => {
        if (mounted) setOffers([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'offers', label: 'Offer Management', icon: Send },
          { id: 'documents', label: 'Document Collection', icon: FileText },
          { id: 'verification', label: 'Background Verification', icon: Shield },
          { id: 'medical', label: 'Medical Checkup', icon: Heart },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as typeof activeSection)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === item.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSection === 'offers' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Offer Management</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              Create New Offer
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joining Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {offers.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon={Send} size="sm" title="No offers yet" description="Created offers will appear here." />
                    </td>
                  </tr>
                )}
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{offer.candidate}</td>
                    <td className="px-4 py-3 text-gray-600">{offer.position}</td>
                    <td className="px-4 py-3 text-gray-600">Rs. {offer.salary.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{offer.joiningDate}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          offer.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : offer.status === 'sent'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {offer.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'documents' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Document Collection</h3>
          <p className="text-gray-600">Manage document collection for new joiners. Track pending documents, verify submissions, and maintain records.</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">15</p>
              <p className="text-sm text-gray-600">Pending Documents</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">28</p>
              <p className="text-sm text-gray-600">Under Verification</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">42</p>
              <p className="text-sm text-gray-600">Verified</p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'verification' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Background Verification</h3>
          <p className="text-gray-600">Track background verification status for candidates.</p>
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">8</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">35</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">2</p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'medical' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Medical Checkup</h3>
          <p className="text-gray-600">Schedule and track pre-employment medical examinations.</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">6</p>
              <p className="text-sm text-gray-600">Scheduled</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">22</p>
              <p className="text-sm text-gray-600">Fit</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">3</p>
              <p className="text-sm text-gray-600">Conditionally Fit</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function JoiningProcessSection() {
  const [activeSection, setActiveSection] = useState<'first-day' | 'id-card' | 'system-access' | 'welcome-kit'>('first-day');

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'first-day', label: 'First Day Setup', icon: Building2 },
          { id: 'id-card', label: 'ID Card Generation', icon: CreditCard },
          { id: 'system-access', label: 'System Access', icon: KeyRound },
          { id: 'welcome-kit', label: 'Welcome Kit', icon: Gift },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as typeof activeSection)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === item.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {activeSection === 'first-day' && (
          <>
            <h3 className="text-lg font-semibold mb-4">First Day Setup</h3>
            <p className="text-gray-600 mb-4">Manage first day arrangements for new joiners including workstation, equipment, and introductions.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <Laptop className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-sm font-medium">Workstation Ready</p>
                <p className="text-2xl font-bold text-green-600">18</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <Laptop className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-sm font-medium">Setup Pending</p>
                <p className="text-2xl font-bold text-yellow-600">5</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <Users className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-sm font-medium">Mentor Assigned</p>
                <p className="text-2xl font-bold text-blue-600">15</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <Users className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <p className="text-sm font-medium">Buddy Assigned</p>
                <p className="text-2xl font-bold text-purple-600">12</p>
              </div>
            </div>
          </>
        )}

        {activeSection === 'id-card' && (
          <>
            <h3 className="text-lg font-semibold mb-4">ID Card Generation</h3>
            <p className="text-gray-600 mb-4">Process and track employee ID card requests.</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">8</p>
                <p className="text-sm text-gray-600">Photo Pending</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-600">In Production</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">45</p>
                <p className="text-sm text-gray-600">Issued</p>
              </div>
            </div>
          </>
        )}

        {activeSection === 'system-access' && (
          <>
            <h3 className="text-lg font-semibold mb-4">System Access</h3>
            <p className="text-gray-600 mb-4">Manage system and application access requests for new employees.</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">15</p>
                <p className="text-sm text-gray-600">Pending Approval</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">8</p>
                <p className="text-sm text-gray-600">Provisioning</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">52</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
          </>
        )}

        {activeSection === 'welcome-kit' && (
          <>
            <h3 className="text-lg font-semibold mb-4">Welcome Kit</h3>
            <p className="text-gray-600 mb-4">Track welcome kit preparation and distribution.</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">6</p>
                <p className="text-sm text-gray-600">Being Prepared</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">4</p>
                <p className="text-sm text-gray-600">Ready</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">38</p>
                <p className="text-sm text-gray-600">Distributed</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function OrientationSection() {
  const [activeSection, setActiveSection] = useState<'hr' | 'department' | 'training' | 'policy'>('hr');

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'hr', label: 'HR Induction', icon: Users },
          { id: 'department', label: 'Department Induction', icon: Building2 },
          { id: 'training', label: 'Training Schedule', icon: GraduationCap },
          { id: 'policy', label: 'Policy Acknowledgment', icon: BookOpen },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as typeof activeSection)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === item.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          {activeSection === 'hr' && 'HR Induction Sessions'}
          {activeSection === 'department' && 'Department Induction Sessions'}
          {activeSection === 'training' && 'Training Schedule'}
          {activeSection === 'policy' && 'Policy Acknowledgment'}
        </h3>
        <p className="text-gray-600 mb-4">
          {activeSection === 'hr' && 'Schedule and track HR orientation sessions for new employees.'}
          {activeSection === 'department' && 'Manage department-specific induction programs.'}
          {activeSection === 'training' && 'View and manage training schedules for new joiners.'}
          {activeSection === 'policy' && 'Track policy acknowledgments and compliance.'}
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">5</p>
            <p className="text-sm text-gray-600">Scheduled</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">3</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">42</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingChecklist() {
  const [checklistItems, setChecklistItems] = useState<
    { id: string; category: string; item: string; assignee: string; status: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Add-item modal state (replaces the interim window.prompt flow).
  const [showAddModal, setShowAddModal] = useState(false);
  const [formItem, setFormItem] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formAssignee, setFormAssignee] = useState('');

  const loadChecklist = async () => {
    try {
      setLoading(true);
      const records = await OnboardingTasksService.list('checklist');
      setChecklistItems(
        records.map((r) => ({
          id: r.id,
          category: (r.data as any)?.category ?? '-',
          item: (r.data as any)?.item ?? r.employeeName ?? '-',
          assignee: (r.data as any)?.assignee ?? '-',
          status: r.status || 'pending',
        }))
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecklist();
  }, []);

  const openAddModal = () => {
    setFormItem('');
    setFormCategory('');
    setFormAssignee('');
    setError(null);
    setShowAddModal(true);
  };

  const handleAddItem = async () => {
    if (adding) return;
    const item = formItem.trim();
    if (!item) return;
    const category = formCategory.trim() || 'General';
    const assignee = formAssignee.trim() || 'HR';
    setAdding(true);
    try {
      await OnboardingTasksService.create({
        feature: 'checklist',
        status: 'pending',
        data: { item, category, assignee },
      });
      setShowAddModal(false);
      await loadChecklist();
    } catch {
      setError('Failed to add checklist item. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Onboarding Checklist</h3>
        <button
          onClick={openAddModal}
          disabled={adding}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {adding ? 'Adding…' : 'Add Checklist Item'}
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Checklist Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddItem();
              }}
              className="space-y-4 p-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formItem}
                  onChange={(e) => setFormItem(e.target.value)}
                  autoFocus
                  required
                  placeholder="e.g. Collect signed offer letter"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="Documentation, IT Setup (default: General)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <input
                  type="text"
                  value={formAssignee}
                  onChange={(e) => setFormAssignee(e.target.value)}
                  placeholder="HR, IT (default: HR)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={adding}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding || !formItem.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {adding ? 'Adding…' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {loading && <div className="p-4 text-sm text-blue-700">Loading checklist…</div>}
      {error && !loading && <div className="p-4 text-sm text-red-700">{error}</div>}
      {!loading && !error && checklistItems.length === 0 && (
        <div className="p-4 text-sm text-gray-500">No checklist items yet.</div>
      )}
      <div className="divide-y">
        {checklistItems.map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  item.status === 'completed'
                    ? 'bg-green-100 text-green-600'
                    : item.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {item.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.item}</p>
                <p className="text-sm text-gray-500">{item.category} - Assigned to: {item.assignee}</p>
              </div>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : item.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {item.status.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Probation Components
// ============================================================================

function ProbationDashboard() {
  const stats = {
    active: 12,
    endingSoon: 4,
    pendingReviews: 6,
    recentConfirmations: 8,
  };

  const [endingSoon, setEndingSoon] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    OnboardingService.getProbationPeriods({ endingSoon: true, limit: 5 })
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res as any) ? (res as any) : [];
        setEndingSoon(
          list.map((p: any) => ({
            name: p?.employeeName ?? p?.name ?? 'Unknown',
            department: p?.departmentName ?? p?.department ?? '-',
            endDate: (p?.extendedEndDate ?? p?.probationEndDate)
              ? new Date(p.extendedEndDate ?? p.probationEndDate).toISOString().split('T')[0]
              : '-',
            rating:
              typeof p?.overallRating === 'number'
                ? p.overallRating
                : typeof p?.performanceRating === 'number'
                ? p.performanceRating
                : 0,
          }))
        );
      })
      .catch(() => {
        if (mounted) setEndingSoon([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Probations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ending Soon (30 days)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.endingSoon}</p>
            </div>
            <Timer className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confirmed This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentConfirmations}</p>
            </div>
            <ThumbsUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Probation Ending Soon</h3>
        </div>
        <div className="divide-y">
          {endingSoon.length === 0 && (
            <EmptyState icon={Timer} size="sm" title="No probations ending soon" description="Probation periods ending within 30 days will appear here." />
          )}
          {endingSoon.map((emp, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{emp.name}</p>
                <p className="text-sm text-gray-500">{emp.department}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{emp.endDate}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{emp.rating}</span>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProbationTracking() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Probation Tracking</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4">Track and manage employee probation periods.</p>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">12</p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">3</p>
            <p className="text-sm text-gray-600">Extended</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">28</p>
            <p className="text-sm text-gray-600">Confirmed</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">2</p>
            <p className="text-sm text-gray-600">Terminated</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProbationReviews() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Review Schedule</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          Schedule Review
        </button>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4">Schedule and manage periodic probation reviews (30-day, 60-day, 90-day).</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">6</p>
            <p className="text-sm text-gray-600">Scheduled</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">2</p>
            <p className="text-sm text-gray-600">Overdue</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">45</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProbationFeedback() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Feedback Collection</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4">Collect 360-degree feedback from managers, peers, and team members.</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">18</p>
            <p className="text-sm text-gray-600">Manager Feedback</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">32</p>
            <p className="text-sm text-gray-600">Peer Feedback</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">15</p>
            <p className="text-sm text-gray-600">Self Assessment</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProbationConfirmation() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Confirmation Process</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4">Manage employee confirmation workflow after successful probation completion.</p>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">5</p>
            <p className="text-sm text-gray-600">Pending Review</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">3</p>
            <p className="text-sm text-gray-600">Under Approval</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">28</p>
            <p className="text-sm text-gray-600">Confirmed</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-orange-600">2</p>
            <p className="text-sm text-gray-600">Extended</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Offboarding Components
// ============================================================================

function OffboardingDashboard() {
  const stats = {
    activeResignations: 5,
    pendingClearances: 3,
    pendingSettlements: 4,
    exitInterviewsPending: 2,
  };

  const [recentResignations, setRecentResignations] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    OffboardingService.getResignations({ limit: 5 })
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res as any) ? (res as any) : [];
        setRecentResignations(
          list.map((r: any) => ({
            name: r?.employeeName ?? r?.name ?? 'Unknown',
            department: r?.departmentName ?? r?.department ?? '-',
            lastDay: r?.lastWorkingDate
              ? new Date(r.lastWorkingDate).toISOString().split('T')[0]
              : '-',
            status: r?.status ?? 'submitted',
          }))
        );
      })
      .catch(() => {
        if (mounted) setRecentResignations([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Resignations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeResignations}</p>
            </div>
            <UserMinus className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Clearances</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingClearances}</p>
            </div>
            <ListChecks className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Settlements</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingSettlements}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Exit Interviews Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.exitInterviewsPending}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Resignations</h3>
        </div>
        <div className="divide-y">
          {recentResignations.length === 0 && (
            <EmptyState icon={UserMinus} size="sm" title="No recent resignations" description="Submitted resignations will appear here." />
          )}
          {recentResignations.map((emp, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{emp.name}</p>
                <p className="text-sm text-gray-500">{emp.department}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Last Working Day</p>
                  <p className="font-medium">{emp.lastDay}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    emp.status === 'accepted'
                      ? 'bg-green-100 text-green-700'
                      : emp.status === 'under_review'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {emp.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResignationsSection() {
  const [activeSection, setActiveSection] = useState<'requests' | 'notice' | 'early-release' | 'acceptance'>('requests');

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'requests', label: 'Requests', icon: Send },
          { id: 'notice', label: 'Notice Period', icon: Timer },
          { id: 'early-release', label: 'Early Release', icon: Clock },
          { id: 'acceptance', label: 'Acceptance', icon: CheckCircle },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as typeof activeSection)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === item.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          {activeSection === 'requests' && 'Resignation Requests'}
          {activeSection === 'notice' && 'Notice Period Management'}
          {activeSection === 'early-release' && 'Early Release Requests'}
          {activeSection === 'acceptance' && 'Resignation Acceptance'}
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">3</p>
            <p className="text-sm text-gray-600">Submitted</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">2</p>
            <p className="text-sm text-gray-600">Under Review</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">15</p>
            <p className="text-sm text-gray-600">Accepted</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">1</p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExitClearanceSection() {
  const [activeSection, setActiveSection] = useState<'checklist' | 'it' | 'hr' | 'finance' | 'assets'>('checklist');

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'checklist', label: 'Checklist', icon: ClipboardCheck },
          { id: 'it', label: 'IT Clearance', icon: Laptop },
          { id: 'hr', label: 'HR Clearance', icon: Users },
          { id: 'finance', label: 'Finance Clearance', icon: DollarSign },
          { id: 'assets', label: 'Asset Return', icon: Package },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as typeof activeSection)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === item.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Exit Clearance - {activeSection.replace('-', ' ').toUpperCase()}</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">4</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">2</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">18</p>
            <p className="text-sm text-gray-600">Cleared</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExitInterviewSection() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Exit Interviews</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          Schedule Interview
        </button>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4">Conduct and analyze exit interviews to gather valuable feedback.</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">2</p>
            <p className="text-sm text-gray-600">Scheduled</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">12</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">3.8</p>
            <p className="text-sm text-gray-600">Avg Satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettlementSection() {
  const [activeSection, setActiveSection] = useState<'calculation' | 'leave' | 'gratuity' | 'payment'>('calculation');

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'calculation', label: 'Salary Calculation', icon: DollarSign },
          { id: 'leave', label: 'Leave Encashment', icon: Calendar },
          { id: 'gratuity', label: 'Gratuity', icon: Award },
          { id: 'payment', label: 'Final Payment', icon: CreditCard },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as typeof activeSection)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === item.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Full & Final Settlement - {activeSection.replace('-', ' ')}</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-600">2</p>
            <p className="text-sm text-gray-600">Draft</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">3</p>
            <p className="text-sm text-gray-600">Pending Approval</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">1</p>
            <p className="text-sm text-gray-600">Processing</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">15</p>
            <p className="text-sm text-gray-600">Paid</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExitDocumentsSection() {
  const [activeSection, setActiveSection] = useState<'experience' | 'relieving' | 'service'>('experience');

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'experience', label: 'Experience Certificate', icon: Award },
          { id: 'relieving', label: 'Relieving Letter', icon: ScrollText },
          { id: 'service', label: 'Service Certificate', icon: FileCheck },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as typeof activeSection)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === item.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Exit Documents</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">3</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">2</p>
            <p className="text-sm text-gray-600">Generated</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">18</p>
            <p className="text-sm text-gray-600">Issued</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlumniManagementSection() {
  const [activeSection, setActiveSection] = useState<'directory' | 'rehire' | 'network'>('directory');

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'directory', label: 'Directory', icon: Users },
          { id: 'rehire', label: 'Rehire Process', icon: RefreshCw },
          { id: 'network', label: 'Alumni Network', icon: Network },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as typeof activeSection)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === item.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Alumni Management</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">156</p>
            <p className="text-sm text-gray-600">Total Alumni</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">128</p>
            <p className="text-sm text-gray-600">Eligible for Rehire</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">45</p>
            <p className="text-sm text-gray-600">Active in Network</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-orange-600">12</p>
            <p className="text-sm text-gray-600">Referrals Made</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function OnboardingOffboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mainTab, setMainTab] = useState<MainTab>('onboarding');
  const [onboardingSubTab, setOnboardingSubTab] = useState<OnboardingSubTab>('dashboard');
  const [probationSubTab, setProbationSubTab] = useState<ProbationSubTab>('dashboard');
  const [offboardingSubTab, setOffboardingSubTab] = useState<OffboardingSubTab>('dashboard');

  useEffect(() => {
    const tab = searchParams.get('tab') as MainTab;
    if (tab && ['onboarding', 'probation', 'offboarding'].includes(tab)) {
      setMainTab(tab);
    }
  }, [searchParams]);

  const mainTabs = [
    { id: 'onboarding' as MainTab, label: 'Onboarding', icon: UserPlus },
    { id: 'probation' as MainTab, label: 'Probation Management', icon: Clock },
    { id: 'offboarding' as MainTab, label: 'Offboarding', icon: UserMinus },
  ];

  const onboardingTabs = [
    { id: 'dashboard' as OnboardingSubTab, label: 'Dashboard', icon: TrendingUp },
    { id: 'pre-joining' as OnboardingSubTab, label: 'Pre-joining', icon: FileText },
    { id: 'joining-process' as OnboardingSubTab, label: 'Joining Process', icon: Briefcase },
    { id: 'orientation' as OnboardingSubTab, label: 'Orientation', icon: GraduationCap },
    { id: 'checklist' as OnboardingSubTab, label: 'Checklist', icon: ClipboardList },
  ];

  const probationTabs = [
    { id: 'dashboard' as ProbationSubTab, label: 'Dashboard', icon: TrendingUp },
    { id: 'tracking' as ProbationSubTab, label: 'Tracking', icon: Clock },
    { id: 'reviews' as ProbationSubTab, label: 'Review Schedule', icon: Star },
    { id: 'feedback' as ProbationSubTab, label: 'Feedback', icon: MessageSquare },
    { id: 'confirmation' as ProbationSubTab, label: 'Confirmation', icon: ThumbsUp },
  ];

  const offboardingTabs = [
    { id: 'dashboard' as OffboardingSubTab, label: 'Dashboard', icon: TrendingUp },
    { id: 'resignations' as OffboardingSubTab, label: 'Resignations', icon: Send },
    { id: 'clearance' as OffboardingSubTab, label: 'Exit Clearance', icon: ListChecks },
    { id: 'interview' as OffboardingSubTab, label: 'Exit Interview', icon: MessageSquare },
    { id: 'settlement' as OffboardingSubTab, label: 'F&F Settlement', icon: DollarSign },
    { id: 'documents' as OffboardingSubTab, label: 'Exit Documents', icon: FileCheck },
    { id: 'alumni' as OffboardingSubTab, label: 'Alumni', icon: Network },
  ];

  const renderOnboardingContent = () => {
    switch (onboardingSubTab) {
      case 'dashboard': return <OnboardingDashboard />;
      case 'pre-joining': return <PreJoiningSection />;
      case 'joining-process': return <JoiningProcessSection />;
      case 'orientation': return <OrientationSection />;
      case 'checklist': return <OnboardingChecklist />;
      default: return <OnboardingDashboard />;
    }
  };

  const renderProbationContent = () => {
    switch (probationSubTab) {
      case 'dashboard': return <ProbationDashboard />;
      case 'tracking': return <ProbationTracking />;
      case 'reviews': return <ProbationReviews />;
      case 'feedback': return <ProbationFeedback />;
      case 'confirmation': return <ProbationConfirmation />;
      default: return <ProbationDashboard />;
    }
  };

  const renderOffboardingContent = () => {
    switch (offboardingSubTab) {
      case 'dashboard': return <OffboardingDashboard />;
      case 'resignations': return <ResignationsSection />;
      case 'clearance': return <ExitClearanceSection />;
      case 'interview': return <ExitInterviewSection />;
      case 'settlement': return <SettlementSection />;
      case 'documents': return <ExitDocumentsSection />;
      case 'alumni': return <AlumniManagementSection />;
      default: return <OffboardingDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4">
          <button
            onClick={() => router.push('/hr')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to HR
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Employee Lifecycle Management
          </h1>
          <p className="text-gray-600 mt-1">Manage onboarding, probation, and offboarding processes</p>
        </div>

        {/* Main Tabs */}
        <div className="bg-white rounded-lg shadow">
          <nav className="flex border-b overflow-x-auto">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  mainTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Sub Tabs */}
        <div className="bg-white rounded-lg shadow">
          <nav className="flex border-b overflow-x-auto px-2">
            {(mainTab === 'onboarding' ? onboardingTabs : mainTab === 'probation' ? probationTabs : offboardingTabs).map(
              (tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (mainTab === 'onboarding') setOnboardingSubTab(tab.id as OnboardingSubTab);
                    else if (mainTab === 'probation') setProbationSubTab(tab.id as ProbationSubTab);
                    else setOffboardingSubTab(tab.id as OffboardingSubTab);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    (mainTab === 'onboarding' && onboardingSubTab === tab.id) ||
                    (mainTab === 'probation' && probationSubTab === tab.id) ||
                    (mainTab === 'offboarding' && offboardingSubTab === tab.id)
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="pb-8">
          {mainTab === 'onboarding' && renderOnboardingContent()}
          {mainTab === 'probation' && renderProbationContent()}
          {mainTab === 'offboarding' && renderOffboardingContent()}
        </div>
      </div>
    </div>
  );
}
