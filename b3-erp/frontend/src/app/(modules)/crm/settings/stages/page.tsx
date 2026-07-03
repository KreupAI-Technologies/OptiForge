'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, GripVertical, Edit, Trash2, CheckCircle, Clock, Target, TrendingUp, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui';
import { crmService } from '@/services/crm.service';

interface DealStage {
  id: string;
  name: string;
  description: string;
  order: number;
  probability: number;
  color: string;
  isActive: boolean;
  rottenDays: number;
  dealsCount: number;
  totalValue: number;
  avgDealSize: number;
  avgDaysInStage: number;
  conversionRate: number;
  createdDate: string;
}

export default function DealStagesPage() {
  const router = useRouter();
  const [stages, setStages] = useState<DealStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<DealStage | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await crmService.pipelineStageConfigs.getAll();
        const rows = Array.isArray(data) ? data : [];
        if (!mounted) return;
        setStages(
          rows.map((s: any): DealStage => ({
            id: String(s.id),
            name: s.name ?? '',
            description: s.description ?? '',
            order: Number(s.orderIndex ?? s.order ?? 0),
            probability: Number(s.probability ?? 0),
            color: s.color ?? 'blue',
            isActive: s.active ?? s.isActive ?? true,
            rottenDays: Number(s.rottenDays ?? 0),
            dealsCount: Number(s.dealsCount ?? 0),
            totalValue: Number(s.totalValue ?? 0),
            avgDealSize: Number(s.avgDealSize ?? 0),
            avgDaysInStage: Number(s.avgDaysInStage ?? 0),
            conversionRate: Number(s.conversionRate ?? 0),
            createdDate: s.createdAt ?? s.createdDate ?? '',
          })),
        );
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load stages');
        setStages([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddStage = () => {
    router.push('/crm/settings/stages/add');
  };

  const handleEditStage = (stage: DealStage) => {
    router.push(`/crm/settings/stages/edit/${stage.id}`);
  };

  const handleDeleteClick = (stage: DealStage) => {
    setStageToDelete(stage);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (stageToDelete) {
      setStages(stages.filter(s => s.id !== stageToDelete.id));
      setShowDeleteDialog(false);
      setStageToDelete(null);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; border: string; gradient: string } } = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', gradient: 'from-blue-500 to-blue-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', gradient: 'from-purple-500 to-purple-600' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', gradient: 'from-yellow-500 to-yellow-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', gradient: 'from-orange-500 to-orange-600' },
      teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300', gradient: 'from-teal-500 to-teal-600' },
      green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', gradient: 'from-green-500 to-green-600' },
      red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', gradient: 'from-red-500 to-red-600' },
    };
    return colors[color] || colors.blue;
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === stages.length - 1)
    ) {
      return;
    }

    const newStages = [...stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];

    // Update order values
    newStages.forEach((stage, idx) => {
      stage.order = idx + 1;
    });

    setStages(newStages);
  };

  const stats = {
    totalStages: stages.filter(s => s.isActive).length,
    totalDeals: stages.reduce((sum, s) => sum + s.dealsCount, 0),
    totalValue: stages.filter(s => s.probability > 0 && s.probability < 100).reduce((sum, s) => sum + s.totalValue, 0),
    avgConversion: Math.round(
      stages.filter(s => s.probability > 0 && s.probability < 100).reduce((sum, s) => sum + s.conversionRate, 0) /
      stages.filter(s => s.probability > 0 && s.probability < 100).length
    ),
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="mb-8">
        <div className="flex justify-end mb-3">
          <button
            onClick={handleAddStage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Stage
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <Target className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.totalStages}</div>
            <div className="text-blue-100">Active Stages</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <TrendingUp className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.totalDeals}</div>
            <div className="text-purple-100">Total Deals</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <CheckCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">${(stats.totalValue / 1000000).toFixed(2)}M</div>
            <div className="text-green-100">Pipeline Value</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <TrendingUp className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.avgConversion}%</div>
            <div className="text-orange-100">Avg Conversion</div>
          </div>
        </div>

        {/* Pipeline Visualization */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Pipeline Flow</h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {stages
              .filter(s => s.probability > 0 && s.probability < 100)
              .map((stage, index, array) => (
                <div key={stage.id} className="flex items-center flex-shrink-0">
                  <div className={`px-3 py-2 rounded-lg border-2 ${getColorClasses(stage.color).border} ${getColorClasses(stage.color).bg} min-w-[200px]`}>
                    <div className={`font-semibold ${getColorClasses(stage.color).text} mb-1`}>
                      {stage.name}
                    </div>
                    <div className="text-sm text-gray-700">
                      {stage.dealsCount} deals • ${(stage.totalValue / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {stage.probability}% probability
                    </div>
                  </div>
                  {index < array.length - 1 && (
                    <div className="flex items-center mx-2">
                      <div className="w-8 h-0.5 bg-gray-300"></div>
                      <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-300"></div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Stages List */}
      <div className="space-y-2">
        {stages.map((stage, index) => {
          const colorClasses = getColorClasses(stage.color);

          return (
            <div
              key={stage.id}
              className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-2">
                {/* Drag Handle & Order Controls */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => moveStage(index, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded hover:bg-gray-100 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  </button>
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <button
                    onClick={() => moveStage(index, 'down')}
                    disabled={index === stages.length - 1}
                    className={`p-1 rounded hover:bg-gray-100 ${index === stages.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Stage Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-gray-400">#{stage.order}</span>
                        <h3 className="text-xl font-semibold text-gray-900">{stage.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses.bg} ${colorClasses.text}`}>
                          {stage.color}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          stage.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {stage.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{stage.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditStage(stage)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(stage)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Stage Metrics */}
                  <div className="grid grid-cols-6 gap-2 mb-2">
                    <div className={`bg-gradient-to-br ${colorClasses.gradient} rounded-lg p-3 text-white`}>
                      <div className="flex items-center gap-1 opacity-80 mb-1">
                        <Target className="w-3 h-3" />
                        <span className="text-xs font-medium">Probability</span>
                      </div>
                      <div className="text-2xl font-bold">{stage.probability}%</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-blue-700 mb-1">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs font-medium">Deals</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900">{stage.dealsCount}</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-green-700 mb-1">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-xs font-medium">Total Value</span>
                      </div>
                      <div className="text-xl font-bold text-green-900">
                        ${(stage.totalValue / 1000).toFixed(0)}K
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-purple-700 mb-1">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs font-medium">Avg Deal Size</span>
                      </div>
                      <div className="text-lg font-bold text-purple-900">
                        ${stage.avgDealSize.toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-orange-700 mb-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-medium">Avg Days</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-900">{stage.avgDaysInStage}</div>
                    </div>

                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-teal-700 mb-1">
                        <Target className="w-3 h-3" />
                        <span className="text-xs font-medium">Conversion</span>
                      </div>
                      <div className="text-2xl font-bold text-teal-900">{stage.conversionRate.toFixed(1)}%</div>
                    </div>
                  </div>

                  {/* Stage Settings */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Rotten After
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {stage.rottenDays > 0 ? `${stage.rottenDays} days` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Created Date</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {new Date(stage.createdDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Order Position</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {stage.order} of {stages.length}
                      </div>
                    </div>
                  </div>

                  {/* Conversion Rate Bar */}
                  {stage.probability > 0 && stage.probability < 100 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Stage Conversion Rate</span>
                        <span className="font-medium">{stage.conversionRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${colorClasses.gradient} h-2 rounded-full`}
                          style={{ width: `${stage.conversionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setStageToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Deal Stage"
        message={stageToDelete ? `Are you sure you want to delete "${stageToDelete.name}" stage? This action cannot be undone. All deals in this stage will need to be reassigned.` : ''}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
