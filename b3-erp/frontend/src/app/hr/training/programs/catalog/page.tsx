'use client';

import { useState, useMemo, useEffect } from 'react';
import { BookOpen, Search, Filter, Clock, Users, Award, Calendar, MapPin, IndianRupee, AlertCircle } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface TrainingProgram {
  id: string;
  code: string;
  title: string;
  description: string;
  category: 'technical' | 'safety' | 'quality' | 'leadership' | 'soft_skills' | 'compliance';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  mode: 'classroom' | 'online' | 'hybrid' | 'on_job';
  instructor: string;
  department: string;
  capacity: number;
  enrolled: number;
  cost: number;
  nextBatch: string;
  location?: string;
  certification: boolean;
  status: 'active' | 'inactive' | 'upcoming';
}

export default function ProgramCatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [rows, setRows] = useState<TrainingProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getTrainingPrograms();
        const mapped: TrainingProgram[] = raw.map((r) => ({
          id: r.id,
          code: r.code ?? '',
          title: r.title ?? '',
          description: r.description ?? '',
          category: (r.category as TrainingProgram['category']) ?? 'technical',
          level: (r.level as TrainingProgram['level']) ?? 'beginner',
          duration: Number(r.duration ?? 0),
          mode: (r.mode as TrainingProgram['mode']) ?? 'classroom',
          instructor: r.instructor ?? '',
          department: r.department ?? '',
          capacity: Number(r.capacity ?? 0),
          enrolled: Number(r.enrolled ?? 0),
          cost: Number(r.cost ?? 0),
          nextBatch: r.nextBatch ?? '',
          location: r.location ?? undefined,
          certification: Boolean(r.certification ?? false),
          status: (r.status as TrainingProgram['status']) ?? 'active',
        }));
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load training programs');
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mockPrograms: TrainingProgram[] = rows.length ? rows : [
    {
      id: '1', code: 'TRN-TECH-001', title: 'Advanced CNC Programming', description: 'Master advanced CNC machining techniques',
      category: 'technical', level: 'advanced', duration: 40, mode: 'hybrid', instructor: 'Rajesh Kumar',
      department: 'Manufacturing', capacity: 20, enrolled: 15, cost: 25000, nextBatch: '2024-11-15',
      location: 'Training Center A', certification: true, status: 'active'
    },
    {
      id: '2', code: 'TRN-SAFE-001', title: 'Workplace Safety & OSHA Compliance', description: 'Comprehensive safety training program',
      category: 'safety', level: 'beginner', duration: 16, mode: 'classroom', instructor: 'Suresh Patel',
      department: 'Safety & Compliance', capacity: 30, enrolled: 28, cost: 8000, nextBatch: '2024-11-10',
      location: 'Training Center B', certification: true, status: 'active'
    },
    {
      id: '3', code: 'TRN-QUAL-001', title: 'Quality Management Systems (ISO 9001)', description: 'ISO 9001 quality standards training',
      category: 'quality', level: 'intermediate', duration: 24, mode: 'hybrid', instructor: 'Meena Rao',
      department: 'Quality Assurance', capacity: 25, enrolled: 18, cost: 18000, nextBatch: '2024-11-20',
      location: 'Training Center A', certification: true, status: 'active'
    },
    {
      id: '4', code: 'TRN-LEAD-001', title: 'Leadership & Team Management', description: 'Develop leadership and people management skills',
      category: 'leadership', level: 'intermediate', duration: 32, mode: 'classroom', instructor: 'Priya Sharma',
      department: 'Human Resources', capacity: 15, enrolled: 12, cost: 30000, nextBatch: '2024-11-25',
      location: 'Training Center C', certification: false, status: 'active'
    },
    {
      id: '5', code: 'TRN-TECH-002', title: 'Lean Manufacturing Fundamentals', description: 'Introduction to lean manufacturing principles',
      category: 'technical', level: 'beginner', duration: 20, mode: 'online', instructor: 'Vikram Mehta',
      department: 'Manufacturing', capacity: 50, enrolled: 35, cost: 12000, nextBatch: '2024-11-12',
      certification: true, status: 'active'
    },
    {
      id: '6', code: 'TRN-SOFT-001', title: 'Effective Communication Skills', description: 'Improve verbal and written communication',
      category: 'soft_skills', level: 'beginner', duration: 12, mode: 'online', instructor: 'Anjali Nair',
      department: 'Human Resources', capacity: 40, enrolled: 22, cost: 6000, nextBatch: '2024-11-18',
      certification: false, status: 'active'
    },
    {
      id: '7', code: 'TRN-COMP-001', title: 'Factory Act & Labor Law Compliance', description: 'Indian labor law and compliance training',
      category: 'compliance', level: 'intermediate', duration: 16, mode: 'classroom', instructor: 'Anil Gupta',
      department: 'Legal & Compliance', capacity: 20, enrolled: 15, cost: 15000, nextBatch: '2024-12-01',
      location: 'Training Center B', certification: true, status: 'upcoming'
    },
    {
      id: '8', code: 'TRN-TECH-003', title: 'Six Sigma Green Belt', description: 'Six Sigma methodology and certification',
      category: 'quality', level: 'advanced', duration: 80, mode: 'hybrid', instructor: 'Ramesh Iyer',
      department: 'Quality Assurance', capacity: 15, enrolled: 10, cost: 75000, nextBatch: '2024-12-05',
      location: 'Training Center A', certification: true, status: 'upcoming'
    },
    {
      id: '9', code: 'TRN-SAFE-002', title: 'Fire Safety & Emergency Response', description: 'Fire prevention and emergency procedures',
      category: 'safety', level: 'beginner', duration: 8, mode: 'classroom', instructor: 'Deepa Singh',
      department: 'Safety & Compliance', capacity: 35, enrolled: 30, cost: 5000, nextBatch: '2024-11-14',
      location: 'Training Center B', certification: true, status: 'active'
    },
    {
      id: '10', code: 'TRN-TECH-004', title: 'Preventive Maintenance Techniques', description: 'Equipment maintenance best practices',
      category: 'technical', level: 'intermediate', duration: 24, mode: 'on_job', instructor: 'Sunil Verma',
      department: 'Maintenance', capacity: 12, enrolled: 8, cost: 20000, nextBatch: '2024-11-22',
      location: 'Production Floor', certification: false, status: 'active'
    },
    {
      id: '11', code: 'TRN-SOFT-002', title: 'Problem Solving & Decision Making', description: 'Analytical thinking and decision making skills',
      category: 'soft_skills', level: 'intermediate', duration: 16, mode: 'online', instructor: 'Kavita Desai',
      department: 'Human Resources', capacity: 30, enrolled: 20, cost: 10000, nextBatch: '2024-11-28',
      certification: false, status: 'active'
    },
    {
      id: '12', code: 'TRN-QUAL-002', title: 'Statistical Process Control (SPC)', description: 'Quality control using statistical methods',
      category: 'quality', level: 'intermediate', duration: 20, mode: 'classroom', instructor: 'Meena Rao',
      department: 'Quality Assurance', capacity: 20, enrolled: 14, cost: 16000, nextBatch: '2024-12-10',
      location: 'Training Center A', certification: true, status: 'upcoming'
    }
  ];

  const filteredPrograms = useMemo(() => {
    return mockPrograms.filter(program => {
      const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           program.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || program.category === selectedCategory;
      const matchesMode = selectedMode === 'all' || program.mode === selectedMode;
      const matchesLevel = selectedLevel === 'all' || program.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesMode && matchesLevel;
    });
  }, [searchTerm, selectedCategory, selectedMode, selectedLevel, rows]);

  const stats = {
    total: mockPrograms.length,
    active: mockPrograms.filter(p => p.status === 'active').length,
    upcoming: mockPrograms.filter(p => p.status === 'upcoming').length,
    totalEnrolled: mockPrograms.reduce((sum, p) => sum + p.enrolled, 0),
    withCertification: mockPrograms.filter(p => p.certification).length
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      safety: 'bg-red-100 text-red-800',
      quality: 'bg-green-100 text-green-800',
      leadership: 'bg-purple-100 text-purple-800',
      soft_skills: 'bg-orange-100 text-orange-800',
      compliance: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors];
  };

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors];
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'classroom': return <MapPin className="h-4 w-4" />;
      case 'online': return <BookOpen className="h-4 w-4" />;
      case 'hybrid': return <Users className="h-4 w-4" />;
      case 'on_job': return <Award className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-indigo-600" />
          Training Program Catalog
        </h1>
        <p className="text-gray-600 mt-2">Browse and enroll in available training programs</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading training programs…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Programs</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
            </div>
            <BookOpen className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <Award className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
            </div>
            <Calendar className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Enrolled</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalEnrolled}</p>
            </div>
            <Users className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Certificate</p>
              <p className="text-2xl font-bold text-orange-600">{stats.withCertification}</p>
            </div>
            <Award className="h-10 w-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="technical">Technical</option>
                <option value="safety">Safety</option>
                <option value="quality">Quality</option>
                <option value="leadership">Leadership</option>
                <option value="soft_skills">Soft Skills</option>
                <option value="compliance">Compliance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Modes</option>
                <option value="classroom">Classroom</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
                <option value="on_job">On-the-Job</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPrograms.map(program => (
          <div key={program.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{program.title}</h3>
                  <p className="text-xs text-gray-500">{program.code}</p>
                </div>
                <StatusBadge status={program.status} />
              </div>

              <p className="text-sm text-gray-600 mb-2">{program.description}</p>

              <div className="space-y-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(program.category)}`}>
                    {program.category.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(program.level)}`}>
                    {program.level.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{program.duration}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getModeIcon(program.mode)}
                    <span className="capitalize">{program.mode.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{program.enrolled}/{program.capacity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    <span>₹{program.cost.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {program.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{program.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Next Batch: {new Date(program.nextBatch).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>

                {program.certification && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">Certification Provided</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Instructor: {program.instructor}</p>
                <button
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    program.enrolled >= program.capacity
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  disabled={program.enrolled >= program.capacity}
                >
                  {program.enrolled >= program.capacity ? 'Full - Waitlist' : 'Enroll Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No programs found matching your criteria</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-indigo-900 mb-2">Training Program Information</h3>
        <ul className="text-sm text-indigo-800 space-y-1">
          <li>• Programs with certification provide official completion certificates</li>
          <li>• Enrollment is subject to manager approval and seat availability</li>
          <li>• Training costs may be fully or partially covered by the department budget</li>
          <li>• Online programs offer flexible learning schedules</li>
          <li>• Hybrid programs combine classroom and online learning</li>
          <li>• Contact HR for custom training requests or group enrollments</li>
        </ul>
      </div>
    </div>
  );
}
