'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { HrTalentService } from '@/services/hr-talent.service';
import { Target, Plus, Save, X, Calendar, TrendingUp, Users } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'individual' | 'team' | 'department';
  priority: 'high' | 'medium' | 'low';
  startDate: string;
  endDate: string;
  weight: number;
  kpis: string[];
}

export default function SetGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.performanceGoals<any[]>();
        if (!cancelled) setGoals(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setGoals([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    category: 'individual',
    priority: 'medium',
    weight: 20,
    kpis: []
  });

  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const addGoal = async () => {
    if (!newGoal.title || !newGoal.description) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const created = await HrTalentService.createPerformance<Goal>(newGoal as Goal, { recordType: 'set-goal' });
      setGoals([...goals, { ...(newGoal as Goal), ...created }]);
      setShowAddModal(false);
      setNewGoal({
        category: 'individual',
        priority: 'medium',
        weight: 20,
        kpis: []
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save goal');
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors];
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      individual: <Target className="w-4 h-4" />,
      team: <Users className="w-4 h-4" />,
      department: <TrendingUp className="w-4 h-4" />
    };
    return icons[category as keyof typeof icons];
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Target className="h-8 w-8 text-purple-600" />
          Set Goals
        </h1>
        <p className="text-gray-600 mt-2">Create and define performance objectives</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-purple-600">{goals.length}</p>
            </div>
            <Target className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Individual</p>
              <p className="text-2xl font-bold text-blue-600">{goals.filter(g => g.category === 'individual').length}</p>
            </div>
            <Target className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team</p>
              <p className="text-2xl font-bold text-green-600">{goals.filter(g => g.category === 'team').length}</p>
            </div>
            <Users className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="text-2xl font-bold text-orange-600">{goals.filter(g => g.category === 'department').length}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-3 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">My Goals ({goals.length})</h2>
          <p className="text-sm text-gray-600">Define objectives for the current period</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          Add Goal
        </button>
      </div>

      {/* Goals List */}
      <div className="space-y-2">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(goal.priority)}`}>
                    {goal.priority.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    {getCategoryIcon(goal.category)}
                    <span className="capitalize">{goal.category}</span>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{goal.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(goal.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} -
                      {new Date(goal.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Weight: {goal.weight}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    <span>{goal.kpis.length} KPIs</span>
                  </div>
                </div>

                {goal.kpis.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Key Performance Indicators:</p>
                    <div className="flex flex-wrap gap-2">
                      {goal.kpis.map((kpi, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {kpi}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900">Add New Goal</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title *</label>
                  <input
                    type="text"
                    value={newGoal.title || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter goal title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    rows={3}
                    value={newGoal.description || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe your goal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="individual">Individual</option>
                      <option value="team">Team</option>
                      <option value="department">Department</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={newGoal.startDate || ''}
                      onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={newGoal.endDate || ''}
                      onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newGoal.weight || 20}
                    onChange={(e) => setNewGoal({ ...newGoal, weight: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {saveError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {saveError}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addGoal}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving…' : 'Save Goal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
