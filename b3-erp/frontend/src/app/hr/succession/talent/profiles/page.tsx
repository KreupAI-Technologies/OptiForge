'use client';

import { useState, useEffect } from 'react';
import { User, Star, Briefcase, GraduationCap, Award, TrendingUp } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface TalentProfile {
  id: string;
  name: string;
  employeeCode: string;
  currentRole: string;
  department: string;
  photo: string;
  performanceScore: number;
  potentialScore: number;
  yearsInCompany: number;
  totalExperience: number;
  education: string[];
  certifications: string[];
  skills: { name: string; level: number }[];
  careerAspirations: string[];
  successorFor: string[];
  developmentPlan: string;
  mentor: string;
  lastPromotionDate: string;
}

export default function Page() {
  const [selectedEmployee, setSelectedEmployee] = useState('1');

  const [rows, setRows] = useState<TalentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<TalentProfile | null>(null);
  const [editForm, setEditForm] = useState<Partial<TalentProfile>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!editRow) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { id, ...rest } = { ...editRow, ...editForm } as TalentProfile;
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
        const data = await HrTalentService.getSuccession<TalentProfile>('talent-profile');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setRows([]); setLoadError(err instanceof Error ? err.message : 'Failed to load data'); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const selectedProfile = rows.find(p => p.id === selectedEmployee) || rows[0];

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="h-6 w-6 text-teal-600" />
          Talent Profiles
        </h1>
        <p className="text-sm text-gray-600 mt-1">Detailed successor candidate profiles</p>
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Talent</label>
        <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
          {rows.map(profile => (
            <option key={profile.id} value={profile.id}>{profile.name} - {profile.currentRole}</option>
          ))}
        </select>
      </div>

      {selectedProfile && (
      <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-start gap-3 mb-3">
          <div className="text-6xl">{selectedProfile.photo}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{selectedProfile.name}</h2>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border-2 border-green-300 flex items-center gap-1">
                <Star className="h-3 w-3" />
                Star Talent
              </span>
              <button
                onClick={() => { setEditRow(selectedProfile); setEditForm({ currentRole: selectedProfile.currentRole, performanceScore: selectedProfile.performanceScore, potentialScore: selectedProfile.potentialScore, mentor: selectedProfile.mentor, developmentPlan: selectedProfile.developmentPlan }); setSaveError(null); }}
                className="ml-auto px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Edit Profile
              </button>
            </div>
            <p className="text-gray-600 mb-3">{selectedProfile.employeeCode} • {selectedProfile.currentRole} • {selectedProfile.department}</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">Performance</p>
                <p className="text-2xl font-bold text-blue-900">{selectedProfile.performanceScore}%</p>
              </div>
              <div className="bg-teal-50 rounded-lg p-3">
                <p className="text-xs text-teal-600 uppercase font-medium mb-1">Potential</p>
                <p className="text-2xl font-bold text-teal-900">{selectedProfile.potentialScore}%</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600 uppercase font-medium mb-1">Company Tenure</p>
                <p className="text-2xl font-bold text-purple-900">{selectedProfile.yearsInCompany} yrs</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-600 uppercase font-medium mb-1">Total Experience</p>
                <p className="text-2xl font-bold text-orange-900">{selectedProfile.totalExperience} yrs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Education</h3>
          </div>
          <ul className="space-y-2">
            {selectedProfile.education.map((edu, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>{edu}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-bold text-gray-900">Certifications</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedProfile.certifications.map((cert, idx) => (
              <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 text-sm font-semibold rounded-full border border-orange-200">
                {cert}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-bold text-gray-900">Skills Assessment</h3>
        </div>
        <div className="space-y-2">
          {selectedProfile.skills.map((skill, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-700">{skill.name}</p>
                <p className="text-sm font-semibold text-teal-600">{skill.level}%</p>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-teal-500 rounded-full h-2" style={{width: `${skill.level}%`}}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Career Aspirations</h3>
          </div>
          <div className="space-y-2">
            {selectedProfile.careerAspirations.map((aspiration, idx) => (
              <div key={idx} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="text-sm font-semibold text-purple-900">{aspiration}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Successor For</h3>
          </div>
          <div className="space-y-2">
            {selectedProfile.successorFor.map((position, idx) => (
              <div key={idx} className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-sm font-semibold text-green-900">{position}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Development Plan</h3>
          <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">{selectedProfile.developmentPlan}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Mentor & Promotion History</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-700"><span className="font-semibold">Mentor:</span> {selectedProfile.mentor}</p>
            <p className="text-sm text-gray-700"><span className="font-semibold">Last Promotion:</span> {new Date(selectedProfile.lastPromotionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      </div>
      </>
      )}

      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-5 py-3">
              <h2 className="text-lg font-bold text-gray-900">Edit Talent Profile</h2>
              <p className="text-sm text-gray-600">{editRow.name}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-5 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
                <input type="text" value={editForm.currentRole ?? ''} onChange={(e) => setEditForm(f => ({ ...f, currentRole: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Performance Score (%)</label>
                <input type="number" min={0} max={100} value={editForm.performanceScore ?? 0} onChange={(e) => setEditForm(f => ({ ...f, performanceScore: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Potential Score (%)</label>
                <input type="number" min={0} max={100} value={editForm.potentialScore ?? 0} onChange={(e) => setEditForm(f => ({ ...f, potentialScore: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mentor</label>
                <input type="text" value={editForm.mentor ?? ''} onChange={(e) => setEditForm(f => ({ ...f, mentor: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Development Plan</label>
                <textarea rows={3} value={editForm.developmentPlan ?? ''} onChange={(e) => setEditForm(f => ({ ...f, developmentPlan: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
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
