'use client';

import { useState, useMemo, useEffect } from 'react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { Wrench, Search, AlertCircle, CheckCircle, Clock, Zap, Plus, Filter, ChevronDown, ChevronUp, Lightbulb, Target, BookOpen } from 'lucide-react';

interface TroubleshootingGuide {
  id: string;
  title: string;
  symptoms: string[];
  causes: string[];
  solutions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: number; // in minutes
  category: string;
  relatedProducts: string[];
  successRate: number; // percentage
  views: number;
  helpful: number;
  createdDate: string;
  updatedDate: string;
  requiresService: boolean;
}

function mapTroubleshootingGuide(r: any): TroubleshootingGuide {
  return {
    id: String(r?.id ?? ''),
    title: r?.title ?? '',
    symptoms: Array.isArray(r?.symptoms) ? r.symptoms : (r?.symptom ? [r.symptom] : []),
    causes: Array.isArray(r?.causes) ? r.causes : [],
    solutions: Array.isArray(r?.solutions) ? r.solutions : (Array.isArray(r?.steps) ? r.steps : []),
    difficulty: (r?.difficulty ?? 'medium') as TroubleshootingGuide['difficulty'],
    timeEstimate: Number(r?.timeEstimate ?? r?.estimatedTime ?? 0) || 0,
    category: r?.category ?? 'General',
    relatedProducts: Array.isArray(r?.relatedProducts) ? r.relatedProducts : [],
    successRate: Number(r?.successRate ?? 0),
    views: Number(r?.views ?? 0),
    helpful: Number(r?.helpful ?? 0),
    createdDate: r?.createdDate ?? r?.createdAt ?? '',
    updatedDate: r?.updatedDate ?? r?.updatedAt ?? '',
    requiresService: Boolean(r?.requiresService),
  };
}

export default function TroubleshootingPage() {
  const [mockGuides, setMockGuides] = useState<TroubleshootingGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await AfterSalesPagesService.troubleshooting()) as any[];
        if (!cancelled) setMockGuides(Array.isArray(raw) ? raw.map(mapTroubleshootingGuide) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load troubleshooting guides');
          setMockGuides([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'views'>('helpful');

  const categories = ['Refrigeration', 'Cooking', 'Laundry', 'Dishwashing', 'Technology'];
  const difficulties = ['easy', 'medium', 'hard'];

  const filteredGuides = useMemo(() => {
    let filtered = mockGuides.filter(guide => {
      const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || guide.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Sort
    if (sortBy === 'helpful') {
      filtered.sort((a, b) => b.helpful - a.helpful);
    } else if (sortBy === 'views') {
      filtered.sort((a, b) => b.views - a.views);
    } else {
      filtered.sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime());
    }

    return filtered;
  }, [searchTerm, selectedCategory, selectedDifficulty, sortBy]);

  const stats = {
    total: mockGuides.length,
    easy: mockGuides.filter(g => g.difficulty === 'easy').length,
    medium: mockGuides.filter(g => g.difficulty === 'medium').length,
    hard: mockGuides.filter(g => g.difficulty === 'hard').length,
    avgSuccessRate: (mockGuides.reduce((sum, g) => sum + g.successRate, 0) / mockGuides.length).toFixed(0)
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Wrench className="h-8 w-8 text-emerald-600" />
            Troubleshooting Guide
          </h1>
          <p className="text-gray-600 mt-1">Diagnose and resolve common appliance issues</p>
        </div>
        <button className="bg-emerald-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md">
          <Plus className="h-5 w-5" />
          New Guide
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Guides</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Easy</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.easy}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Lightbulb className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Medium</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.medium}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hard</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.hard}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Success</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.avgSuccessRate}%</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by symptom, issue, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard / Requires Service</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="helpful">Most Helpful</option>
                <option value="views">Most Viewed</option>
                <option value="recent">Recently Updated</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                <Filter className="h-4 w-4" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Troubleshooting Guides */}
      <div className="space-y-2">
        {filteredGuides.map((guide) => (
          <div key={guide.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === guide.id ? null : guide.id)}
              className="w-full px-3 py-2 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{guide.title}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
                    {guide.difficulty.toUpperCase()}
                  </span>
                  {guide.requiresService && (
                    <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded">May Need Service</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{guide.symptoms.slice(0, 2).join(' • ')}</p>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">{guide.category}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {guide.timeEstimate} min
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {guide.successRate}% success
                  </div>
                  <div className="text-gray-500">{guide.views} views</div>
                </div>
              </div>

              <div className="ml-6">
                {expandedId === guide.id ? (
                  <ChevronUp className="h-6 w-6 text-gray-400" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-gray-400" />
                )}
              </div>
            </button>

            {expandedId === guide.id && (
              <div className="px-6 py-2 bg-gray-50 border-t border-gray-200 space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Common Symptoms
                  </h4>
                  <ul className="space-y-2">
                    {guide.symptoms.map((symptom, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    Possible Causes
                  </h4>
                  <ul className="space-y-2">
                    {guide.causes.map((cause, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-600" />
                    Step-by-Step Solutions
                  </h4>
                  <ol className="space-y-2">
                    {guide.solutions.map((solution, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-3">
                        <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0">{idx + 1}</span>
                        <span>{solution}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <p className="text-sm text-gray-600 mb-2"><strong>Related Products:</strong></p>
                  <div className="flex flex-wrap gap-2">
                    {guide.relatedProducts.map(product => (
                      <span key={product} className="bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">Was this helpful?</p>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Yes ({guide.helpful})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredGuides.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
            <Wrench className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-600 font-medium">No troubleshooting guides found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
