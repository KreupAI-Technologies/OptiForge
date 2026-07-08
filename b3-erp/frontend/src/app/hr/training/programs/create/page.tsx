'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Save, BookOpen, Users, Clock, Trash2, Layout } from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';

interface Module {
  id: string;
  title: string;
  duration: string; // e.g. "2 hours"
  type: 'video' | 'workshop' | 'quiz';
}

export default function CreateProgramPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Internal',
    category: 'Technical',
    modules: [] as Module[],
    audienceMap: [] as string[]
  });

  const [newModule, setNewModule] = useState<Module>({
    id: '',
    title: '',
    duration: '',
    type: 'video'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddModule = () => {
    if (!newModule.title || !newModule.duration) return;
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, { ...newModule, id: Date.now().toString() }]
    }));
    setNewModule({ id: '', title: '', duration: '', type: 'video' });
  };

  const handleRemoveModule = (id: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await HrPagesService.createTrainingProgram({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        mode: formData.type,
        department: formData.audienceMap.join(', '),
        status: 'active',
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Plus className="h-8 w-8 text-purple-600" />
            Create Program
          </h1>
          <p className="text-gray-500 mt-1">Design a new training program and curriculum.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Layout className="h-5 w-5 text-gray-400" />
              Program Details
            </h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="e.g., Advanced React Patterns"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option>Internal</option>
                    <option>External Workshop</option>
                    <option>Online Course</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>Technical</option>
                    <option>Soft Skills</option>
                    <option>Compliance</option>
                    <option>Leadership</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="What will employees learn?"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gray-400" />
              Curriculum Builder
            </h3>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2 mb-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Module Title"
                  className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={newModule.title}
                  onChange={e => setNewModule({ ...newModule, title: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. 1h)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={newModule.duration}
                  onChange={e => setNewModule({ ...newModule, duration: e.target.value })}
                />
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="px-4 py-2 bg-purple-100 text-purple-700 font-medium rounded-lg hover:bg-purple-200 transition-colors"
                >
                  Add Module
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {formData.modules.length === 0 && (
                <p className="text-center text-gray-500 py-4 italic">No modules added yet.</p>
              )}
              {formData.modules.map((module, index) => (
                <div key={module.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{module.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {module.duration}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(module.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              Target Audience
            </h3>
            <div className="space-y-2">
              {['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'All Employees'].map(dept => (
                <label key={dept} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-purple-600 focus:ring-purple-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, audienceMap: [...prev.audienceMap, dept] }));
                      } else {
                        setFormData(prev => ({ ...prev, audienceMap: prev.audienceMap.filter(d => d !== dept) }));
                      }
                    }}
                  />
                  <span className="text-gray-700">{dept}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-200 disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {submitting ? 'Creating…' : 'Create Program'}
          </button>
        </div>
      </form>
    </div>
  );
}
