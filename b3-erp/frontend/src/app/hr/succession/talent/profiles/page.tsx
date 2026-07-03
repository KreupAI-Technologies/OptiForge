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

  const mockProfiles: TalentProfile[] = [
    {
      id: '1',
      name: 'Kavita Singh',
      employeeCode: 'EMP008',
      currentRole: 'IT Lead',
      department: 'IT',
      photo: '👩‍💼',
      performanceScore: 95,
      potentialScore: 95,
      yearsInCompany: 12,
      totalExperience: 15,
      education: ['B.Tech Computer Science - IIT Delhi', 'MBA Technology Management - IIM Bangalore'],
      certifications: ['PMP', 'AWS Solutions Architect', 'Agile Scrum Master', 'TOGAF'],
      skills: [
        { name: 'Technology Strategy', level: 95 },
        { name: 'Team Leadership', level: 90 },
        { name: 'Cloud Architecture', level: 88 },
        { name: 'Digital Transformation', level: 92 }
      ],
      careerAspirations: ['CTO', 'VP Engineering', 'Chief Digital Officer'],
      successorFor: ['CTO', 'VP Technology'],
      developmentPlan: 'Executive Leadership Program - Q1 2025',
      mentor: 'Rajesh Kumar (CTO)',
      lastPromotionDate: '2022-04-01'
    },
    {
      id: '2',
      name: 'Arjun Kapoor',
      employeeCode: 'EMP007',
      currentRole: 'Sales Lead',
      department: 'Sales',
      photo: '👨‍💼',
      performanceScore: 85,
      potentialScore: 95,
      yearsInCompany: 8,
      totalExperience: 10,
      education: ['BBA - Mumbai University', 'MBA Marketing - XLRI Jamshedpur'],
      certifications: ['Certified Sales Professional', 'Key Account Management', 'Negotiation Expert'],
      skills: [
        { name: 'Sales Strategy', level: 85 },
        { name: 'Client Relations', level: 92 },
        { name: 'Negotiation', level: 90 },
        { name: 'Team Management', level: 75 }
      ],
      careerAspirations: ['VP Sales', 'Regional Sales Director', 'Business Head'],
      successorFor: ['Sales Manager', 'VP Sales'],
      developmentPlan: 'Leadership Development Program - Q2 2025',
      mentor: 'Priya Sharma (VP Sales)',
      lastPromotionDate: '2023-01-15'
    }
  ];

  const [rows, setRows] = useState<TalentProfile[]>(mockProfiles);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getSuccession<TalentProfile>('talent-profile');
        if (!cancelled && data.length > 0) setRows(data);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load data');
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
    </div>
  );
}
