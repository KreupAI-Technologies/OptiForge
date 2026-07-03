'use client';

import { useState, useMemo, useEffect } from 'react';
import { Library, Search, Filter, Clock, Play, BookOpen, Award, Star, Users, AlertCircle } from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';

interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  category: 'technical' | 'safety' | 'quality' | 'soft_skills' | 'compliance' | 'leadership';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  modules: number;
  enrolled: number;
  rating: number;
  reviews: number;
  instructor: string;
  thumbnail: string;
  certification: boolean;
  language: string;
  status: 'active' | 'coming_soon';
}

export default function ELearningLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [mockCourses, setMockCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.elearningCourses()) as any[];
        const validCategories: Course['category'][] = ['technical', 'safety', 'quality', 'soft_skills', 'compliance', 'leadership'];
        const validLevels: Course['level'][] = ['beginner', 'intermediate', 'advanced'];
        const mapped: Course[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          id: String(r.id ?? ''),
          code: r.code ?? '',
          title: r.title ?? '',
          description: r.description ?? '',
          category: validCategories.includes(r.category) ? r.category : 'technical',
          level: validLevels.includes(r.level) ? r.level : 'beginner',
          duration: Number(r.duration ?? 0),
          modules: Number(r.modules ?? 0),
          enrolled: Number(r.enrolled ?? 0),
          rating: Number(r.rating ?? 0),
          reviews: Number(r.reviews ?? 0),
          instructor: r.instructor ?? '',
          thumbnail: r.thumbnail ?? '📘',
          certification: Boolean(r.certification),
          language: r.language ?? '',
          status: r.status === 'coming_soon' ? 'coming_soon' : 'active',
        }));
        if (!cancelled) setMockCourses(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load courses');
          setMockCourses([]);
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

  const filteredCourses = useMemo(() => {
    return mockCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [mockCourses, searchTerm, selectedCategory, selectedLevel]);

  const stats = {
    total: mockCourses.filter(c => c.status === 'active').length,
    totalEnrolled: mockCourses.reduce((sum, c) => sum + c.enrolled, 0),
    avgRating: (mockCourses.reduce((sum, c) => sum + c.rating, 0) / mockCourses.length).toFixed(1),
    withCertification: mockCourses.filter(c => c.certification).length,
    totalHours: mockCourses.reduce((sum, c) => sum + c.duration, 0)
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      safety: 'bg-red-100 text-red-800',
      quality: 'bg-green-100 text-green-800',
      soft_skills: 'bg-orange-100 text-orange-800',
      compliance: 'bg-yellow-100 text-yellow-800',
      leadership: 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors];
  };

  const getLevelBadge = (level: string) => {
    const badges = {
      beginner: { color: 'bg-green-100 text-green-800', label: 'Beginner' },
      intermediate: { color: 'bg-yellow-100 text-yellow-800', label: 'Intermediate' },
      advanced: { color: 'bg-red-100 text-red-800', label: 'Advanced' }
    };
    return badges[level as keyof typeof badges];
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Library className="h-8 w-8 text-blue-600" />
          E-Learning Course Library
        </h1>
        <p className="text-gray-600 mt-2">Browse and enroll in self-paced online courses</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading courses…
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
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <Library className="h-10 w-10 text-blue-400" />
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
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.avgRating}★</p>
            </div>
            <Star className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certifications</p>
              <p className="text-2xl font-bold text-orange-600">{stats.withCertification}</p>
            </div>
            <Award className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalHours}h</p>
            </div>
            <Clock className="h-10 w-10 text-green-400" />
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
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="technical">Technical</option>
                <option value="safety">Safety</option>
                <option value="quality">Quality</option>
                <option value="soft_skills">Soft Skills</option>
                <option value="compliance">Compliance</option>
                <option value="leadership">Leadership</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Thumbnail */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-32 flex items-center justify-center text-6xl">
              {course.thumbnail}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{course.title}</h3>
                  <p className="text-xs text-gray-500">{course.code}</p>
                </div>
                {course.status === 'coming_soon' && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    Coming Soon
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.description}</p>

              <div className="space-y-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(course.category)}`}>
                    {course.category.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadge(course.level).color}`}>
                    {getLevelBadge(course.level).label}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.modules} modules</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{course.rating}</span>
                    <span className="text-gray-400">({course.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.enrolled} enrolled</span>
                  </div>
                </div>

                {course.certification && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">Certificate Included</span>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  <p>Instructor: {course.instructor}</p>
                  <p>Language: {course.language}</p>
                </div>
              </div>

              <button
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  course.status === 'coming_soon'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={course.status === 'coming_soon'}
              >
                <Play className="h-4 w-4" />
                {course.status === 'coming_soon' ? 'Coming Soon' : 'Start Learning'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Library className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No courses found matching your criteria</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">E-Learning Benefits</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Learn at your own pace with 24/7 access to course materials</li>
          <li>• Track your progress through interactive modules and assessments</li>
          <li>• Earn certificates upon successful course completion</li>
          <li>• Access courses from any device - desktop, tablet, or mobile</li>
          <li>• Bilingual content available for most courses (English/Hindi)</li>
          <li>• Get support from instructors through discussion forums</li>
        </ul>
      </div>
    </div>
  );
}
