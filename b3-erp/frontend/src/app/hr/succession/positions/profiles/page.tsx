'use client';

import { useState, useEffect } from 'react';
import { FileText, Briefcase, GraduationCap, Award } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface PositionProfile {
  id: string;
  title: string;
  department: string;
  level: 'executive' | 'senior' | 'mid' | 'junior';
  requiredEducation: string[];
  requiredExperience: number;
  requiredSkills: string[];
  preferredCertifications: string[];
  keyCompetencies: string[];
  reportingTo: string;
  directReports: number;
  budgetResponsibility?: string;
}

export default function Page() {
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const mockProfiles: PositionProfile[] = [
    {
      id: '1',
      title: 'Chief Technology Officer',
      department: 'IT',
      level: 'executive',
      requiredEducation: ['B.Tech/B.E. in Computer Science', 'MBA or equivalent'],
      requiredExperience: 15,
      requiredSkills: ['Technology Strategy', 'Team Leadership', 'Digital Transformation', 'Cloud Architecture', 'Enterprise Software'],
      preferredCertifications: ['PMP', 'AWS Solutions Architect', 'TOGAF'],
      keyCompetencies: ['Strategic Thinking', 'Innovation', 'Stakeholder Management', 'Change Leadership'],
      reportingTo: 'CEO',
      directReports: 8,
      budgetResponsibility: '₹50 Cr'
    },
    {
      id: '2',
      title: 'VP Sales',
      department: 'Sales',
      level: 'executive',
      requiredEducation: ['Bachelor\'s degree in Business/Marketing', 'MBA preferred'],
      requiredExperience: 12,
      requiredSkills: ['Sales Strategy', 'Revenue Growth', 'Client Relationship Management', 'Negotiation', 'Team Building'],
      preferredCertifications: ['Certified Sales Professional', 'Key Account Management'],
      keyCompetencies: ['Results Orientation', 'Strategic Planning', 'Communication', 'Leadership'],
      reportingTo: 'CEO',
      directReports: 12,
      budgetResponsibility: '₹100 Cr'
    },
    {
      id: '3',
      title: 'Finance Manager',
      department: 'Finance',
      level: 'senior',
      requiredEducation: ['B.Com/BBA', 'CA/CMA/MBA Finance'],
      requiredExperience: 8,
      requiredSkills: ['Financial Planning', 'Budgeting', 'Compliance', 'Financial Reporting', 'Audit Management'],
      preferredCertifications: ['CA', 'CMA', 'CFA'],
      keyCompetencies: ['Analytical Thinking', 'Attention to Detail', 'Problem Solving', 'Communication'],
      reportingTo: 'CFO',
      directReports: 5,
      budgetResponsibility: '₹10 Cr'
    },
    {
      id: '4',
      title: 'Operations Lead',
      department: 'Operations',
      level: 'senior',
      requiredEducation: ['B.Tech/B.E. in Mechanical/Industrial', 'MBA Operations'],
      requiredExperience: 10,
      requiredSkills: ['Production Management', 'Supply Chain', 'Process Optimization', 'Quality Control', 'Lean Manufacturing'],
      preferredCertifications: ['Six Sigma Black Belt', 'PMP', 'Lean Practitioner'],
      keyCompetencies: ['Operational Excellence', 'Problem Solving', 'Team Leadership', 'Continuous Improvement'],
      reportingTo: 'COO',
      directReports: 15,
      budgetResponsibility: '₹30 Cr'
    }
  ];

  const [rows, setRows] = useState<PositionProfile[]>(mockProfiles);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getSuccession<PositionProfile>('position-profile');
        if (!cancelled && data.length > 0) setRows(data);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredProfiles = rows.filter(profile =>
    selectedDepartment === 'all' || profile.department === selectedDepartment
  );

  const levelColors = {
    executive: 'bg-purple-100 text-purple-700',
    senior: 'bg-blue-100 text-blue-700',
    mid: 'bg-green-100 text-green-700',
    junior: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-teal-600" />
          Position Profiles
        </h1>
        <p className="text-sm text-gray-600 mt-1">Detailed role requirements and competencies</p>
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
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Department:</label>
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="all">All Departments</option>
            <option value="IT">IT</option>
            <option value="Sales">Sales</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {filteredProfiles.map(profile => (
          <div key={profile.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{profile.title}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${levelColors[profile.level]}`}>
                    {profile.level.charAt(0).toUpperCase() + profile.level.slice(1)} Level
                  </span>
                </div>
                <p className="text-sm text-gray-600">{profile.department} • Reports to {profile.reportingTo} • {profile.directReports} Direct Reports</p>
              </div>
              {profile.budgetResponsibility && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="text-lg font-bold text-teal-600">{profile.budgetResponsibility}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              <div className="space-y-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <h4 className="text-sm font-bold text-gray-900">Required Education</h4>
                  </div>
                  <ul className="space-y-1">
                    {profile.requiredEducation.map((edu, idx) => (
                      <li key={idx} className="text-sm text-gray-700 pl-7">• {edu}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <h4 className="text-sm font-bold text-gray-900">Experience Required</h4>
                  </div>
                  <p className="text-sm text-gray-700 pl-7">{profile.requiredExperience}+ years in relevant field</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-orange-600" />
                    <h4 className="text-sm font-bold text-gray-900">Preferred Certifications</h4>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-7">
                    {profile.preferredCertifications.map((cert, idx) => (
                      <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded border border-orange-200">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Key Competencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.keyCompetencies.map((comp, idx) => (
                      <span key={idx} className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-200">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                Edit Profile
              </button>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm">
                View Full Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
