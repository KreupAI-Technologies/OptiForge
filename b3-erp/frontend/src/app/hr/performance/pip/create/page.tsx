'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, User, Calendar, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PerformanceManagementService } from '@/services/performance-management.service';

interface ActionItem {
  id: string;
  description: string;
  dueDate: string;
}

export default function CreatePIPPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    employeeName: '',
    startDate: '',
    endDate: '',
    reason: '',
    goals: '',
    actionItems: [] as ActionItem[]
  });

  const [newItem, setNewItem] = useState({ description: '', dueDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddActionItem = () => {
    if (!newItem.description || !newItem.dueDate) return;
    setFormData(prev => ({
      ...prev,
      actionItems: [
        ...prev.actionItems,
        { id: Date.now().toString(), description: newItem.description, dueDate: newItem.dueDate }
      ]
    }));
    setNewItem({ description: '', dueDate: '' });
  };

  const handleRemoveActionItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      actionItems: prev.actionItems.filter(item => item.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await PerformanceManagementService.createPIP({
        employeeName: formData.employeeName,
        reason: formData.reason,
        goals: formData.goals,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: 'active',
        // Normalise the local action items into the PIP checklist shape.
        actionItems: formData.actionItems.map((it) => ({
          id: it.id,
          text: it.description,
          dueDate: it.dueDate,
          completed: false,
        })),
      } as any);
      toast({ title: 'PIP created successfully!' });
      router.push('/hr/performance/pip/tracking');
    } catch (err) {
      toast({
        title: 'Failed to save PIP',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-purple-600" />
            Create PIP
          </h1>
          <p className="text-gray-500 mt-1">Initiate a formal Performance Improvement Plan.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {/* Employee & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Select employee..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.employeeName}
                  onChange={e => setFormData({ ...formData, employeeName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Reason & Goals */}
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for PIP</label>
              <textarea
                rows={3}
                required
                placeholder="Describe the performance issues..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Goals & Outcomes</label>
              <textarea
                rows={3}
                required
                placeholder="What does success look like?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                value={formData.goals}
                onChange={e => setFormData({ ...formData, goals: e.target.value })}
              />
            </div>
          </div>

          {/* Action Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action Plan</label>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Action item description..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                />
                <input
                  type="date"
                  className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={newItem.dueDate}
                  onChange={e => setNewItem({ ...newItem, dueDate: e.target.value })}
                />
                <button
                  type="button"
                  onClick={handleAddActionItem}
                  className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              {formData.actionItems.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.actionItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.description}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveActionItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Creating…' : 'Create PIP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
