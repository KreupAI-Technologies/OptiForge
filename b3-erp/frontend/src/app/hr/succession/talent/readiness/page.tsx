'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, Award, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface ReadinessAssessment {
  id: string;
  name: string;
  employeeCode: string;
  currentRole: string;
  targetRole: string;
  department: string;
  photo: string;
  readinessLevel: 'ready_now' | '6_months' | '1_year' | '2_years' | '3_plus_years';
  overallScore: number;
  technicalReadiness: number;
  leadershipReadiness: number;
  strategicReadiness: number;
  culturalFit: number;
  businessAcumen: number;
  gapAreas: string[];
  developmentActions: {
    action: string;
    status: 'completed' | 'in_progress' | 'planned';
    dueDate: string;
  }[];
  estimatedReadyDate: string;
  assessmentDate: string;
  assessor: string;
}

export default function Page() {
  const [selectedReadiness, setSelectedReadiness] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const [rows, setRows] = useState<ReadinessAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<ReadinessAssessment | null>(null);
  const [editForm, setEditForm] = useState<Partial<ReadinessAssessment>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!editRow) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { id, ...rest } = { ...editRow, ...editForm } as ReadinessAssessment;
      await HrTalentService.updateSuccession(editRow.id, { data: rest });
      setRows(prev => prev.map(r => r.id === editRow.id ? { ...r, ...editForm } : r));
      setEditRow(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getSuccession<ReadinessAssessment>('talent-readiness');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setRows([]); setLoadError(err instanceof Error ? err.message : 'Failed to load data'); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredAssessments = rows.filter(assessment => {
    const matchesReadiness = selectedReadiness === 'all' || assessment.readinessLevel === selectedReadiness;
    const matchesDepartment = selectedDepartment === 'all' || assessment.department === selectedDepartment;
    return matchesReadiness && matchesDepartment;
  });

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'ready_now': return 'bg-green-100 text-green-700 border-green-300';
      case '6_months': return 'bg-teal-100 text-teal-700 border-teal-300';
      case '1_year': return 'bg-blue-100 text-blue-700 border-blue-300';
      case '2_years': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case '3_plus_years': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getReadinessLabel = (level: string) => {
    switch (level) {
      case 'ready_now': return 'Ready Now';
      case '6_months': return 'Ready in 6 Months';
      case '1_year': return 'Ready in 1 Year';
      case '2_years': return 'Ready in 2 Years';
      case '3_plus_years': return 'Ready in 3+ Years';
      default: return level;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-teal-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getActionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'planned': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const totalAssessments = rows.length;
  const readyNow = rows.filter(a => a.readinessLevel === 'ready_now').length;
  const readySoon = rows.filter(a => ['6_months', '1_year'].includes(a.readinessLevel)).length;
  const avgScore = totalAssessments ? Math.round(rows.reduce((sum, a) => sum + a.overallScore, 0) / totalAssessments) : 0;

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="h-6 w-6 text-teal-600" />
          Readiness Assessment
        </h1>
        <p className="text-sm text-gray-600 mt-1">Successor readiness evaluation and gap analysis</p>
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
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Total Assessments</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{totalAssessments}</p>
            </div>
            <Users className="h-10 w-10 text-purple-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Ready Now</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{readyNow}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm border border-teal-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Ready Soon (≤1 Yr)</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{readySoon}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-teal-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Avg. Score</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{avgScore}%</p>
            </div>
            <Award className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Readiness</label>
            <select value={selectedReadiness} onChange={(e) => setSelectedReadiness(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Readiness Levels</option>
              <option value="ready_now">Ready Now</option>
              <option value="6_months">Ready in 6 Months</option>
              <option value="1_year">Ready in 1 Year</option>
              <option value="2_years">Ready in 2 Years</option>
              <option value="3_plus_years">Ready in 3+ Years</option>
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
        {filteredAssessments.map((assessment) => (
          <div key={assessment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start gap-3 mb-3">
              <div className="text-6xl">{assessment.photo}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{assessment.name}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${getReadinessColor(assessment.readinessLevel)}`}>
                    {getReadinessLabel(assessment.readinessLevel)}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{assessment.employeeCode} • {assessment.currentRole} → {assessment.targetRole}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <span className="font-semibold text-gray-900 ml-2">{assessment.department}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Overall Score:</span>
                    <span className={`font-bold ml-2 ${getScoreColor(assessment.overallScore)}`}>{assessment.overallScore}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Est. Ready:</span>
                    <span className="font-semibold text-gray-900 ml-2">{new Date(assessment.estimatedReadyDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Readiness Dimensions</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Technical Readiness</span>
                    <span className={`text-sm font-bold ${getScoreColor(assessment.technicalReadiness)}`}>{assessment.technicalReadiness}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-teal-500 rounded-full h-2 transition-all" style={{ width: `${assessment.technicalReadiness}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Leadership Readiness</span>
                    <span className={`text-sm font-bold ${getScoreColor(assessment.leadershipReadiness)}`}>{assessment.leadershipReadiness}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 rounded-full h-2 transition-all" style={{ width: `${assessment.leadershipReadiness}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Strategic Readiness</span>
                    <span className={`text-sm font-bold ${getScoreColor(assessment.strategicReadiness)}`}>{assessment.strategicReadiness}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 rounded-full h-2 transition-all" style={{ width: `${assessment.strategicReadiness}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Cultural Fit</span>
                    <span className={`text-sm font-bold ${getScoreColor(assessment.culturalFit)}`}>{assessment.culturalFit}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 rounded-full h-2 transition-all" style={{ width: `${assessment.culturalFit}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Business Acumen</span>
                    <span className={`text-sm font-bold ${getScoreColor(assessment.businessAcumen)}`}>{assessment.businessAcumen}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 rounded-full h-2 transition-all" style={{ width: `${assessment.businessAcumen}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <h4 className="text-sm font-bold text-gray-900">Gap Areas</h4>
                </div>
                <ul className="space-y-2">
                  {assessment.gapAreas.map((gap, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-gray-900">Development Actions</h4>
                </div>
                <div className="space-y-2">
                  {assessment.developmentActions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getActionStatusBadge(action.status)}`}>
                        {action.status.replace('_', ' ')}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{action.action}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(action.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Assessed by: {assessment.assessor}</span>
                <span>Assessment Date: {new Date(assessment.assessmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => { setEditRow(assessment); setEditForm({ readinessLevel: assessment.readinessLevel, overallScore: assessment.overallScore, technicalReadiness: assessment.technicalReadiness, leadershipReadiness: assessment.leadershipReadiness, strategicReadiness: assessment.strategicReadiness, culturalFit: assessment.culturalFit, businessAcumen: assessment.businessAcumen, estimatedReadyDate: assessment.estimatedReadyDate }); setSaveError(null); }}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                >
                  Edit Assessment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-5 py-3">
              <h2 className="text-lg font-bold text-gray-900">Edit Readiness Assessment</h2>
              <p className="text-sm text-gray-600">{editRow.name} • {editRow.currentRole} → {editRow.targetRole}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-5 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Readiness Level</label>
                <select value={editForm.readinessLevel ?? 'ready_now'} onChange={(e) => setEditForm(f => ({ ...f, readinessLevel: e.target.value as ReadinessAssessment['readinessLevel'] }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="ready_now">Ready Now</option>
                  <option value="6_months">Ready in 6 Months</option>
                  <option value="1_year">Ready in 1 Year</option>
                  <option value="2_years">Ready in 2 Years</option>
                  <option value="3_plus_years">Ready in 3+ Years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overall Score (%)</label>
                <input type="number" min={0} max={100} value={editForm.overallScore ?? 0} onChange={(e) => setEditForm(f => ({ ...f, overallScore: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technical Readiness (%)</label>
                <input type="number" min={0} max={100} value={editForm.technicalReadiness ?? 0} onChange={(e) => setEditForm(f => ({ ...f, technicalReadiness: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leadership Readiness (%)</label>
                <input type="number" min={0} max={100} value={editForm.leadershipReadiness ?? 0} onChange={(e) => setEditForm(f => ({ ...f, leadershipReadiness: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strategic Readiness (%)</label>
                <input type="number" min={0} max={100} value={editForm.strategicReadiness ?? 0} onChange={(e) => setEditForm(f => ({ ...f, strategicReadiness: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cultural Fit (%)</label>
                <input type="number" min={0} max={100} value={editForm.culturalFit ?? 0} onChange={(e) => setEditForm(f => ({ ...f, culturalFit: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Acumen (%)</label>
                <input type="number" min={0} max={100} value={editForm.businessAcumen ?? 0} onChange={(e) => setEditForm(f => ({ ...f, businessAcumen: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Ready Date</label>
                <input type="date" value={editForm.estimatedReadyDate ?? ''} onChange={(e) => setEditForm(f => ({ ...f, estimatedReadyDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            {saveError && (
              <div className="mx-5 mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{saveError}</div>
            )}
            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
              <button onClick={() => setEditRow(null)} disabled={saving} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm disabled:opacity-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
