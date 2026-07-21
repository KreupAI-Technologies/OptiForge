'use client';

import React, { useState, useEffect } from 'react';
import {
  Heart,
  Search,
  Plus,
  Users,
  TrendingUp,
  Calendar,
  Award,
  ChevronRight,
  ArrowRight,
  Dumbbell,
  Brain,
  Apple,
  Sparkles,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { HrSafetyService, SafetyWellness } from '@/services/hr-safety.service';

interface ProgramRow {
  id: string;
  title: string;
  icon: any;
  category: string;
  participants: number;
  status: string;
  impact: string;
  color: string;
  bgColor: string;
}

const PROGRAM_STYLES: Record<string, { icon: any; color: string; bgColor: string }> = {
  'Mental Health': { icon: Brain, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  'Physical Fitness': { icon: Dumbbell, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  Nutrition: { icon: Apple, color: 'text-green-600', bgColor: 'bg-green-50' },
};

export default function WellnessProgramsPage() {
  const [filter, setFilter] = useState('All');
  const [activePrograms, setActivePrograms] = useState<ProgramRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Physical Fitness' });

  // derived from fetched activePrograms
  const totalEnrolled = activePrograms.reduce((sum, p) => sum + (p.participants || 0), 0);
  const engagementStats = {
    totalEnrolled,
    activeChallenges: activePrograms.filter((p) => p.status === 'In Progress').length,
    avgParticipation: activePrograms.length
      ? Math.round(totalEnrolled / activePrograms.length)
      : 0,
    wellnessPoints: totalEnrolled.toLocaleString(),
  };

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const rows = await HrSafetyService.getWellness('program');
      const mapped: ProgramRow[] = rows.map((row: SafetyWellness) => {
        const meta = (row.meta || {}) as any;
        const category = row.category ?? '';
        const style = PROGRAM_STYLES[category] || { icon: Sparkles, color: 'text-teal-600', bgColor: 'bg-teal-50' };
        return {
          id: String(row.id),
          title: row.title ?? '',
          icon: style.icon,
          category,
          participants: row.participants ?? 0,
          status: row.status ?? '',
          impact: row.riskLevel ?? meta.impact ?? '',
          color: style.color,
          bgColor: style.bgColor,
        };
      });
      setActivePrograms(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load wellness programs');
      setActivePrograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleLaunchProgram = async () => {
    if (!form.title.trim()) return;
    setIsSaving(true);
    setLoadError(null);
    try {
      await HrSafetyService.createWellness({
        recordType: 'program',
        title: form.title,
        category: form.category,
        participants: 0,
        status: 'Upcoming',
      });
      setShowCreate(false);
      setForm({ title: '', category: 'Physical Fitness' });
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to launch program');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-8 w-8 text-orange-600" />
            Corporate Wellness Initiatives
          </h1>
          <p className="text-gray-500 mt-1">Strategic health programs and employee engagement challenges for a thriving workplace</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors disabled:opacity-60"
        >
          <Plus className="w-4 h-4 mr-2" />
          Launch Program
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Launch Program</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Program Title</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="Mental Health, Physical Fitness, Nutrition…"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunchProgram}
                disabled={isSaving}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Launch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading wellness programs…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Engagement Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Enrollment</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{engagementStats.totalEnrolled}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-[10px] text-green-600 mt-4 flex items-center gap-1 font-bold">
            <TrendingUp className="w-3 h-3" /> 12% increase this quarter
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Challenges</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{engagementStats.activeChallenges}</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Award className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 italic font-medium">Next starting in 4 days</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Participation</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{engagementStats.avgParticipation}%</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-green-500 h-full" style={{ width: `${engagementStats.avgParticipation}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-purple-100 border-2 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Site Wellness Points</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{engagementStats.wellnessPoints}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-[10px] text-purple-600 mt-4 font-bold uppercase tracking-tighter cursor-pointer hover:underline">View Rewards Shop</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Featured Hero: Active Challenge */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-gray-900 p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[400px]">
            <div className="relative z-10">
              <div className="inline-flex items-center px-2 py-0.5 rounded bg-orange-600 text-[10px] font-black uppercase tracking-widest mb-3">Featured Challenge</div>
              <h2 className="text-4xl font-black italic tracking-tighter leading-tight uppercase max-w-lg mb-2">
                The 30-Day <span className="text-orange-500 underline decoration-white">Ergo-Active</span> Industrial Sprint
              </h2>
              <p className="text-gray-400 text-sm max-w-sm font-medium leading-relaxed italic">
                Complete ergonomic checks and reach 10,000 steps daily to unlock the "Industrial Athlete" badge and corporate rewards.
              </p>
            </div>

            <div className="relative z-10 mt-10">
              <div className="flex items-center gap-8 mb-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Participants</span>
                  <span className="text-xl font-bold tracking-tighter">1,240+</span>
                </div>
                <div className="h-10 w-px bg-gray-800"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Days Left</span>
                  <span className="text-xl font-bold tracking-tighter">12</span>
                </div>
              </div>
              <button className="px-10 py-3 bg-white text-gray-900 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl flex items-center gap-3">
                Join Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <Award className="absolute -bottom-10 -right-10 w-64 h-64 text-orange-500 opacity-10 rotate-12" />
          </div>

          {/* Active Programs Directory */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-widest">Active & Upcoming Programs</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search programs..." className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs" />
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {activePrograms.map((prg) => (
                <div key={prg.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className="flex gap-2">
                    <div className={`p-4 rounded-xl ${prg.bgColor} ${prg.color}`}>
                      <prg.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-gray-900 uppercase tracking-tighter text-base group-hover:text-orange-600 transition-colors underline decoration-transparent group-hover:decoration-orange-200">{prg.title}</h4>
                        <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">{prg.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter italic">
                        <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {prg.participants} Enrolled</span>
                        <span className="flex items-center gap-1.5"><TrendingUp className={`w-3 h-3 ${prg.impact === 'Extreme' ? 'text-red-500' : 'text-blue-400'}`} /> {prg.impact} Impact</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${prg.status === 'In Progress' ? 'text-green-600' : 'text-orange-500'}`}>{prg.status}</span>
                      <p className="text-[9px] text-gray-400 mt-1 italic">Starts: June 15</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center italic">
              <button className="text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-widest">View Program Analytics</button>
            </div>
          </div>
        </div>

        {/* Impact Analysis & Upcoming */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
            <h3 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-widest flex items-center justify-between">
              Wellness Impact Score <TrendingUp className="w-4 h-4 text-green-500" />
            </h3>
            <div className="flex justify-center mb-8">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="88" className="text-orange-600" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-black text-gray-900 tracking-tighter">82</span>
                  <p className="text-[9px] text-gray-400 uppercase font-black">Overall Score</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Psychological Safety', score: 88, color: 'bg-purple-500' },
                { label: 'Physical Vitality', score: 72, color: 'bg-blue-500' },
                { label: 'Nutritional Balance', score: 65, color: 'bg-green-500' }
              ].map((stat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>{stat.label}</span>
                    <span>{stat.score}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <div className={`h-full ${stat.color}`} style={{ width: `${stat.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              Upcoming Sessions
            </h3>
            <div className="space-y-3">
              {[
                { time: '14:00', title: 'Ergonomic Workshop', room: 'Conf Room C' },
                { time: '16:30', title: 'Weekly Yoga Flow', room: 'Gym Suite' }
              ].map((sesh, i) => (
                <div key={i} className="flex gap-2 group cursor-pointer">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-black text-gray-900 italic tracking-tighter leading-none">{sesh.time}</span>
                    <div className="w-px h-full bg-gray-100 my-1 group-last:hidden"></div>
                  </div>
                  <div className="pb-6">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors italic leading-none mb-1">{sesh.title}</h4>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">{sesh.room}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-2 border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:border-orange-200 hover:text-orange-600 transition-all">View Full Schedule</button>
          </div>
        </div>
      </div>
    </div>
  );
}
