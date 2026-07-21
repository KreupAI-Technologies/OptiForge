'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Award, Plus, Search, Edit2, Trash2, CheckCircle2,
  XCircle, Star, TrendingUp, BookOpen, Briefcase,
  GraduationCap, Wrench, Target, BarChart3, Loader2
} from 'lucide-react';
import { manufacturingMastersService, Skill as BackendSkill } from '../../services/manufacturing-masters.service';

interface Skill {
  id: string;
  code: string;
  name: string;
  category: string;
  level: string;
  description: string;
  prerequisites: string[];
  certificationRequired: boolean;
  certificationName?: string;
  validityPeriod?: number;
  trainingHours: number;
  assessmentMethod: string;
  competencyIndicators: string[];
  applicableRoles: string[];
  status: string;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  };
}

export default function SkillMaster() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '',
    name: '',
    category: 'Technical',
    level: 'Beginner',
    description: '',
    certificationRequired: false,
    trainingHours: 0,
    status: 'Active'
  });

  // Load skills from service
  const loadSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await manufacturingMastersService.getAllSkills('1');

      const mapped: Skill[] = data.map((s: BackendSkill) => ({
        id: s.id,
        code: `SKL-${s.name.substring(0, 3).toUpperCase()}`,
        name: s.name,
        category: s.category || 'Technical',
        level: 'Intermediate',
        description: s.description || '',
        prerequisites: [],
        certificationRequired: false,
        trainingHours: 0,
        assessmentMethod: 'N/A',
        competencyIndicators: [],
        applicableRoles: [],
        status: 'Active',
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'admin',
          updatedBy: 'admin'
        }
      }));
      setSkills(mapped);
    } catch (err) {
      console.error('Error loading skills:', err);
      setError('Failed to load skills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);


  const openCreateModal = () => {
    setSelectedSkill(null);
    setModalError(null);
    setForm({
      code: '',
      name: '',
      category: 'Technical',
      level: 'Beginner',
      description: '',
      certificationRequired: false,
      trainingHours: 0,
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (skill: Skill) => {
    setSelectedSkill(skill);
    setModalError(null);
    setForm({
      code: skill.code,
      name: skill.name,
      category: skill.category,
      level: skill.level,
      description: skill.description,
      certificationRequired: skill.certificationRequired,
      trainingHours: skill.trainingHours,
      status: skill.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setModalError('Skill name is required.');
      return;
    }
    try {
      setIsSaving(true);
      setModalError(null);
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        companyId: '1'
      };
      if (selectedSkill) {
        await manufacturingMastersService.updateSkill(selectedSkill.id, payload);
      } else {
        await manufacturingMastersService.createSkill(payload);
      }
      setIsModalOpen(false);
      await loadSkills();
    } catch (err) {
      console.error('Error saving skill:', err);
      setModalError('Failed to save skill. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      try {
        await manufacturingMastersService.deleteSkill(id);
        setSkills(skills.filter(s => s.id !== id));
      } catch (err) {
        console.error('Error deleting skill:', err);
        alert('Failed to delete skill. Please try again.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Under Development': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Wrench }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      'Beginner': { bg: 'bg-blue-100', text: 'text-blue-800', stars: 1 },
      'Intermediate': { bg: 'bg-purple-100', text: 'text-purple-800', stars: 2 },
      'Advanced': { bg: 'bg-orange-100', text: 'text-orange-800', stars: 3 },
      'Expert': { bg: 'bg-red-100', text: 'text-red-800', stars: 4 }
    };
    const config = levelConfig[level as keyof typeof levelConfig];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {Array.from({ length: config.stars }).map((_, i) => (
          <Star key={i} className="h-3 w-3 fill-current" />
        ))}
        {level}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Technical': Wrench,
      'Operational': Briefcase,
      'Quality': Target,
      'Safety': Award,
      'Managerial': TrendingUp,
      'Soft Skills': BookOpen
    };
    return icons[category as keyof typeof icons] || Award;
  };

  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || skill.category === filterCategory;
      const matchesLevel = filterLevel === 'All' || skill.level === filterLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [skills, searchTerm, filterCategory, filterLevel]);

  // Show loading state
  if (loading) {
    return (
      <div className="p-6  flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading skills...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6  flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-red-500 text-lg font-medium">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2">Skill Master</h2>
        <p className="text-gray-600">Manage worker capabilities and competency requirements</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                <option value="Technical">Technical</option>
                <option value="Operational">Operational</option>
                <option value="Quality">Quality</option>
                <option value="Safety">Safety</option>
                <option value="Managerial">Managerial</option>
                <option value="Soft Skills">Soft Skills</option>
              </select>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Skill
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category & Level
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certification
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Training
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicable Roles
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSkills.map((skill) => {
                const CategoryIcon = getCategoryIcon(skill.category);
                return (
                  <tr key={skill.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                        <div className="text-sm text-gray-500">{skill.code}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <CategoryIcon className="h-4 w-4 text-gray-400" />
                          <span>{skill.category}</span>
                        </div>
                        {getLevelBadge(skill.level)}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm">
                        {skill.certificationRequired ? (
                          <>
                            <div className="font-medium text-green-600 flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              Required
                            </div>
                            <div className="text-xs text-gray-500">{skill.certificationName}</div>
                            {skill.validityPeriod && (
                              <div className="text-xs text-gray-400">Valid: {skill.validityPeriod} months</div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">Not required</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3 text-gray-400" />
                          <span>{skill.trainingHours} hours</span>
                        </div>
                        <div className="text-xs text-gray-500">{skill.assessmentMethod}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs text-gray-600">
                        {skill.applicableRoles.slice(0, 2).map((role, i) => (
                          <div key={i} className="mb-0.5">{role}</div>
                        ))}
                        {skill.applicableRoles.length > 2 && (
                          <div className="text-blue-600">+{skill.applicableRoles.length - 2} more</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {getStatusBadge(skill.status)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(skill)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {selectedSkill ? 'Edit Skill' : 'Add New Skill'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-2">
                {modalError && (
                  <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {modalError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skill Code *
                    </label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="SKL-XXX-000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skill Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter skill name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Operational">Operational</option>
                      <option value="Quality">Quality</option>
                      <option value="Safety">Safety</option>
                      <option value="Managerial">Managerial</option>
                      <option value="Soft Skills">Soft Skills</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level *
                    </label>
                    <select
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Describe the skill"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="certificationRequired"
                    checked={form.certificationRequired}
                    onChange={(e) => setForm({ ...form, certificationRequired: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="certificationRequired" className="text-sm text-gray-700">
                    Certification Required
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Training Hours *
                    </label>
                    <input
                      type="number"
                      value={form.trainingHours}
                      onChange={(e) => setForm({ ...form, trainingHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Under Development">Under Development</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Skill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
