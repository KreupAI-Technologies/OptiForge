'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Search,
  ClipboardList,
  CheckCircle2,
  Target,
  Users,
  Edit2,
  Eye,
  Copy,
  Play,
  BarChart3,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { cpqGuidedSellingService } from '@/services/cpq';
import {
  QuestionnaireModal,
  QuestionBuilderModal,
  ViewQuestionnaireModal,
  AnalyticsModal,
  PreviewModal,
  Questionnaire as QuestionnaireType
} from '@/components/cpq/QuestionnaireModals';

interface Questionnaire {
  id: string;
  questionnaireCode: string;
  questionnaireName: string;
  category: string;
  targetSegment: string;
  questions: number;
  avgCompletionTime: number;
  completionRate: number;
  usageCount: number;
  qualifiedLeads: number;
  qualificationRate: number;
  avgDealSize: number;
  status: 'active' | 'draft' | 'archived';
  createdBy: string;
  createdDate: string;
  lastUpdated: string;
  description: string;
}

export default function QuestionnairePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'archived'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns the SalesQuestionnaire ORM shape (name/description/
        // industry/productCategory/questions[]/isActive/createdAt); map it to this
        // page's analytics-oriented Questionnaire model. Lead/completion metrics are
        // not part of the questionnaire record and default to 0.
        const raw = (await cpqGuidedSellingService.findAllQuestionnaires()) as any[];
        const toDate = (v: unknown): string =>
          v ? new Date(v as string).toISOString().split('T')[0] : '';
        const mapped: Questionnaire[] = (raw ?? []).map((q) => ({
          id: q.id ?? '',
          questionnaireCode: q.questionnaireCode ?? q.id ?? '',
          questionnaireName: q.name ?? '',
          category: q.productCategory ?? q.industry ?? '',
          targetSegment: q.industry ?? '',
          questions: Array.isArray(q.questions) ? q.questions.length : Number(q.questions ?? 0),
          avgCompletionTime: Number(q.avgCompletionTime ?? 0),
          completionRate: Number(q.completionRate ?? 0),
          usageCount: Number(q.usageCount ?? 0),
          qualifiedLeads: Number(q.qualifiedLeads ?? 0),
          qualificationRate: Number(q.qualificationRate ?? 0),
          avgDealSize: Number(q.avgDealSize ?? 0),
          status: q.isActive === false ? 'archived' : 'active',
          createdBy: q.createdBy ?? '',
          createdDate: toDate(q.createdAt),
          lastUpdated: toDate(q.updatedAt ?? q.createdAt),
          description: q.description ?? '',
        }));
        if (!cancelled) setQuestionnaires(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load questionnaires');
          setQuestionnaires([]);
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

  const categories = ['all', ...Array.from(new Set(questionnaires.map(q => q.category)))];

  // Handlers
  const handleAddNew = () => {
    setSelectedQuestionnaire(null);
    setIsModalOpen(true);
  };

  const handleEdit = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setIsModalOpen(true);
  };

  const handleView = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setIsViewOpen(true);
  };

  const handlePreview = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setIsPreviewOpen(true);
  };

  const handleBuildQuestions = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setIsBuilderOpen(true);
  };

  const handleAnalytics = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setIsAnalyticsOpen(true);
  };

  const handleCopy = (questionnaire: Questionnaire) => {
    const copy: Questionnaire = {
      ...questionnaire,
      id: `Q${Date.now()}`,
      questionnaireCode: `${questionnaire.questionnaireCode}-COPY`,
      questionnaireName: `${questionnaire.questionnaireName} (Copy)`,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setQuestionnaires([copy, ...questionnaires]);
  };

  const handleSave = (questionnaire: Questionnaire) => {
    if (selectedQuestionnaire) {
      setQuestionnaires(questionnaires.map(q => q.id === questionnaire.id ? questionnaire : q));
    } else {
      setQuestionnaires([questionnaire, ...questionnaires]);
    }
    setIsModalOpen(false);
    setSelectedQuestionnaire(null);
  };

  const filteredQuestionnaires = questionnaires.filter(q => {
    const matchesSearch =
      q.questionnaireCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.questionnaireName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.targetSegment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || q.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      draft: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      archived: { color: 'bg-gray-100 text-gray-800', icon: ClipboardList }
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  // Summary stats
  const totalQuestionnaires = questionnaires.length;
  const activeQuestionnaires = questionnaires.filter(q => q.status === 'active').length;
  const avgQualificationRate = questionnaires.reduce((sum, q) => sum + q.qualificationRate, 0) / totalQuestionnaires;
  const totalUsage = questionnaires.reduce((sum, q) => sum + q.usageCount, 0);

  return (
    <div className="w-full px-3 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading questionnaires…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && questionnaires.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No questionnaires found.
        </div>
      )}
      {/* Inline Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Questionnaires</h1>
            <p className="text-sm text-gray-600">Interactive discovery tools for lead qualification</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Questionnaire
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Total Questionnaires</span>
            <ClipboardList className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalQuestionnaires}</div>
          <div className="text-xs text-blue-700 mt-1">{activeQuestionnaires} active</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Qualification Rate</span>
            <Target className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{avgQualificationRate.toFixed(1)}%</div>
          <div className="text-xs text-green-700 mt-1">Average across all</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Total Usage</span>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">{totalUsage.toLocaleString()}</div>
          <div className="text-xs text-purple-700 mt-1">Times used</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-900">Qualified Leads</span>
            <Users className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {questionnaires.reduce((sum, q) => sum + q.qualifiedLeads, 0).toLocaleString()}
          </div>
          <div className="text-xs text-orange-700 mt-1">Total converted</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search questionnaires..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Questionnaires Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questionnaire
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Segment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qualification
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Deal Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuestionnaires.map((q) => {
                const statusInfo = getStatusBadge(q.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{q.questionnaireName}</div>
                        <div className="text-xs text-gray-500">{q.questionnaireCode} • {q.category}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">{q.targetSegment}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{q.questions}</div>
                        <div className="text-xs text-gray-500">{q.avgCompletionTime} min</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2" style={{ minWidth: '60px' }}>
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${q.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{q.completionRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2" style={{ minWidth: '60px' }}>
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${q.qualificationRate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{q.qualificationRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{q.usageCount}</div>
                        <div className="text-xs text-gray-500">{q.qualifiedLeads} qualified</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-blue-900">₹{(q.avgDealSize / 100000).toFixed(1)}L</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreview(q)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Preview Questionnaire"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleView(q)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(q)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Questionnaire"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCopy(q)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Copy Questionnaire"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAnalytics(q)}
                          className="text-orange-600 hover:text-orange-900"
                          title="View Analytics"
                        >
                          <BarChart3 className="h-4 w-4" />
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

      {/* Footer Info */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredQuestionnaires.length} of {totalQuestionnaires} questionnaires
      </div>

      {/* Modals */}
      <QuestionnaireModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedQuestionnaire(null);
        }}
        onSave={handleSave}
        questionnaire={selectedQuestionnaire}
      />

      {selectedQuestionnaire && (
        <>
          <ViewQuestionnaireModal
            isOpen={isViewOpen}
            onClose={() => {
              setIsViewOpen(false);
              setSelectedQuestionnaire(null);
            }}
            questionnaire={selectedQuestionnaire}
          />

          <PreviewModal
            isOpen={isPreviewOpen}
            onClose={() => {
              setIsPreviewOpen(false);
              setSelectedQuestionnaire(null);
            }}
            questionnaire={selectedQuestionnaire}
          />

          <QuestionBuilderModal
            isOpen={isBuilderOpen}
            onClose={() => {
              setIsBuilderOpen(false);
              setSelectedQuestionnaire(null);
            }}
            questionnaire={selectedQuestionnaire}
          />

          <AnalyticsModal
            isOpen={isAnalyticsOpen}
            onClose={() => {
              setIsAnalyticsOpen(false);
              setSelectedQuestionnaire(null);
            }}
            questionnaire={selectedQuestionnaire}
          />
        </>
      )}
    </div>
  );
}
