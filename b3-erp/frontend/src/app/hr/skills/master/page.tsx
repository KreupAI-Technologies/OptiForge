'use client';

import { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Trash2,
  X,
  Briefcase,
  Brain,
  Code,
  TrendingUp,
  Building2,
  Linkedin,
  GitBranch,
  Layers,
  Megaphone,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SkillService } from '@/services/skill.service';
import { Skill, SkillCategory, SkillStatus, SkillType } from '@/types/skill';

const getIconComponent = (iconName?: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    Briefcase,
    Brain,
    Code,
    TrendingUp,
    Building2,
    Linkedin,
    GitBranch,
    Layers,
    Megaphone,
    Award,
  };
  return icons[iconName || 'Award'] || Award;
};

export default function SkillsMasterPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<{
    totalSkills: number;
    activeSkills: number;
    totalCategories: number;
    skillsByCategory: Record<string, number>;
    skillsByType: Record<string, number>;
  } | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    useCases: '',
    categoryId: '',
    skillType: SkillType.DOMAIN,
    icon: '',
    color: '#3B82F6',
    tags: '',
    requiresCertification: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSkills();
  }, [searchTerm, selectedCategory, selectedType]);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [skillsData, categoriesData, stats] = await Promise.all([
        SkillService.getAllSkills(),
        SkillService.getAllCategories(),
        SkillService.getSkillStatistics(),
      ]);
      setSkills(skillsData);
      setCategories(categoriesData);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading skills:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load skills.');
    } finally {
      setLoading(false);
    }
  };

  const filterSkills = async () => {
    try {
      const filteredSkills = await SkillService.getAllSkills({
        categoryId: selectedCategory || undefined,
        skillType: selectedType || undefined,
        search: searchTerm || undefined,
      });
      setSkills(filteredSkills);
    } catch (error) {
      console.error('Error filtering skills:', error);
    }
  };

  const handleViewSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setShowViewModal(true);
  };

  const handleEditSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setFormData({
      code: skill.code,
      name: skill.name,
      description: skill.description || '',
      useCases: skill.useCases || '',
      categoryId: skill.categoryId || '',
      skillType: skill.skillType,
      icon: skill.icon || '',
      color: skill.color || '#3B82F6',
      tags: skill.tags?.join(', ') || '',
      requiresCertification: skill.requiresCertification,
    });
    setShowAddModal(true);
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      try {
        await SkillService.deleteSkill(skillId);
        await loadData();
      } catch (error) {
        console.error('Error deleting skill:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete skill.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (selectedSkill) {
        await SkillService.updateSkill(selectedSkill.id, data);
      } else {
        await SkillService.createSkill(data);
      }

      setShowAddModal(false);
      setSelectedSkill(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        useCases: '',
        categoryId: '',
        skillType: SkillType.DOMAIN,
        icon: '',
        color: '#3B82F6',
        tags: '',
        requiresCertification: false,
      });
      await loadData();
    } catch (error) {
      console.error('Error saving skill:', error);
      setFormError(error instanceof Error ? error.message : 'Error saving skill. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (skillId: string) => {
    setExpandedSkill(expandedSkill === skillId ? null : skillId);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="h-8 w-8 text-pink-600" />
          Skills Master
        </h1>
        <p className="text-gray-600 mt-2">Manage organizational skills and capabilities</p>
      </div>

      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={loadData} className="underline font-medium hover:text-red-900">Retry</button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Skills</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{statistics?.totalSkills || 0}</p>
            </div>
            <Award className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active Skills</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{statistics?.activeSkills || 0}</p>
            </div>
            <ToggleRight className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Categories</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{statistics?.totalCategories || 0}</p>
            </div>
            <Layers className="h-10 w-10 text-purple-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Domain Skills</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {statistics?.skillsByType?.[SkillType.DOMAIN] || 0}
              </p>
            </div>
            <Briefcase className="h-10 w-10 text-orange-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search skills by name, code, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {Object.values(SkillType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSelectedSkill(null);
                setFormData({
                  code: '',
                  name: '',
                  description: '',
                  useCases: '',
                  categoryId: '',
                  skillType: SkillType.DOMAIN,
                  icon: '',
                  color: '#3B82F6',
                  tags: '',
                  requiresCertification: false,
                });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Skill
            </button>
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div className="space-y-2">
        {skills.map((skill) => {
          const IconComponent = getIconComponent(skill.icon);
          const isExpanded = expandedSkill === skill.id;

          return (
            <div
              key={skill.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(skill.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${skill.color || '#3B82F6'}20` }}
                    >
                      <IconComponent
                        className="h-6 w-6"
                        style={{ color: skill.color || '#3B82F6' }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            skill.status === SkillStatus.ACTIVE
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {skill.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{skill.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">Code: {skill.code}</span>
                        <span className="text-xs text-gray-400">Type: {skill.skillType}</span>
                        {skill.category && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {skill.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewSkill(skill);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSkill(skill);
                      }}
                      className="p-2 text-gray-400 hover:text-pink-600 transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSkill(skill.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{skill.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Use Cases</h4>
                      <p className="text-sm text-gray-600">{skill.useCases || 'No use cases defined'}</p>
                    </div>
                  </div>
                  {skill.tags && skill.tags.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {skill.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                    <span>Created: {new Date(skill.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(skill.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {skills.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Award className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
            <p className="text-gray-500 mb-2">
              {searchTerm || selectedCategory || selectedType
                ? 'Try adjusting your filters'
                : 'Get started by adding your first skill'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Skill
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <Award className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedSkill ? 'Edit Skill' : 'Add New Skill'}
                  </h2>
                  <p className="text-sm text-gray-600">Fill in the skill details</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedSkill(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {formError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., workflow-manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Skill name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Type</label>
                  <select
                    value={formData.skillType}
                    onChange={(e) => setFormData({ ...formData, skillType: e.target.value as SkillType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {Object.values(SkillType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Describe the skill..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Use Cases</label>
                  <textarea
                    value={formData.useCases}
                    onChange={(e) => setFormData({ ...formData, useCases: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="When to use this skill..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="comma, separated, tags"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.requiresCertification}
                      onChange={(e) => setFormData({ ...formData, requiresCertification: e.target.checked })}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Requires Certification</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedSkill(null);
                    setFormError(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {selectedSkill ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {submitting ? 'Saving…' : selectedSkill ? 'Update Skill' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${selectedSkill.color || '#3B82F6'}20` }}
                >
                  {(() => {
                    const Icon = getIconComponent(selectedSkill.icon);
                    return <Icon className="h-6 w-6" style={{ color: selectedSkill.color || '#3B82F6' }} />;
                  })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedSkill.name}</h2>
                  <p className="text-sm text-gray-600">{selectedSkill.code}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSkill(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedSkill.description || 'No description provided'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Use Cases</h4>
                  <p className="text-gray-600">{selectedSkill.useCases || 'No use cases defined'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                    <p className="text-gray-600">{selectedSkill.category?.name || 'Uncategorized'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Type</h4>
                    <p className="text-gray-600">{selectedSkill.skillType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedSkill.status === SkillStatus.ACTIVE
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedSkill.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Requires Certification</h4>
                    <p className="text-gray-600">{selectedSkill.requiresCertification ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {selectedSkill.tags && selectedSkill.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkill.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-500">
                  <span>Created: {new Date(selectedSkill.createdAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(selectedSkill.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditSkill(selectedSkill);
                  }}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Skill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
