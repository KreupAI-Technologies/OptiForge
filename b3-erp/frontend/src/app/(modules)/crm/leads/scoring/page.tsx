'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { crmService } from '@/services/crm.service';
import {
  TrendingUp,
  Star,
  Users,
  DollarSign,
  Target,
  Award,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
  Calendar,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';

interface ScoredLead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  score: number;
  previousScore: number;
  rating: 'hot' | 'warm' | 'cold';
  status: string;
  value: number;
  source: string;
  assignedTo: string;
  lastContact: string;
  factors: {
    companySize: number;
    revenue: number;
    engagement: number;
    interest: number;
    sourceQuality: number;
  };
}

export default function LeadScoringPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<ScoredLead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<ScoredLead | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await crmService.crmAnalytics.getLeadScoring();
        if (!mounted) return;
        const topLeads = Array.isArray(data?.topLeads) ? data.topLeads : [];
        const mapped: ScoredLead[] = topLeads.map((l: any) => ({
          id: String(l?.id ?? ''),
          name: l?.name ?? '',
          company: l?.company ?? '',
          email: '',
          phone: '',
          score: Number(l?.score ?? 0),
          previousScore: 0,
          rating: (l?.rating ?? 'cold') as any,
          status: l?.status ?? '',
          value: Number(l?.estimatedValue ?? 0),
          source: '',
          assignedTo: '',
          lastContact: '',
          factors: {
            companySize: 0,
            revenue: 0,
            engagement: 0,
            interest: 0,
            sourceQuality: 0,
          },
        }));
        setError(null);
        setLeads(mapped);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load lead scoring data');
        setLeads([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesScore =
      scoreFilter === 'all' ||
      (scoreFilter === 'high' && lead.score >= 75) ||
      (scoreFilter === 'medium' && lead.score >= 50 && lead.score < 75) ||
      (scoreFilter === 'low' && lead.score < 50);

    const matchesRating = ratingFilter === 'all' || lead.rating === ratingFilter;

    return matchesSearch && matchesScore && matchesRating;
  });

  const stats = {
    avgScore: leads.length ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0,
    highScore: leads.filter((l) => l.score >= 75).length,
    mediumScore: leads.filter((l) => l.score >= 50 && l.score < 75).length,
    lowScore: leads.filter((l) => l.score < 50).length,
    totalValue: leads.reduce((sum, l) => sum + l.value, 0),
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreTrend = (current: number, previous: number) => {
    if (current > previous) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (current < previous) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const ratingColors = {
    hot: 'bg-red-100 text-red-700 border-red-200',
    warm: 'bg-orange-100 text-orange-700 border-orange-200',
    cold: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {error && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>)}
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Average Score</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.avgScore}</p>
            </div>
            <Star className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">High Score (75+)</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.highScore}</p>
            </div>
            <Award className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Medium (50-74)</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.mediumScore}</p>
            </div>
            <Target className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Low Score (&lt;50)</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.lowScore}</p>
            </div>
            <Users className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Total Value</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">${(stats.totalValue / 1000).toFixed(0)}K</p>
            </div>
            <DollarSign className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Scores</option>
            <option value="high">High (75+)</option>
            <option value="medium">Medium (50-74)</option>
            <option value="low">Low (&lt;50)</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Ratings</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedLead(lead)}
          >
            <div className="flex items-center justify-between">
              {/* Lead Info */}
              <div className="flex items-center space-x-4 flex-1">
                {/* Score Badge */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${getScoreColor(
                      lead.score
                    )}`}
                  >
                    <span className="text-2xl font-bold">{lead.score}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    {getScoreTrend(lead.score, lead.previousScore)}
                    <span className="text-xs text-gray-500 ml-1">
                      {Math.abs(lead.score - lead.previousScore)}
                    </span>
                  </div>
                </div>

                {/* Lead Details */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{lead.name}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${ratingColors[lead.rating]}`}
                    >
                      {lead.rating.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                      {lead.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Building2 className="h-4 w-4 mr-2" />
                      {lead.company}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${lead.value.toLocaleString()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {lead.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {lead.phone}
                    </div>
                  </div>

                  {/* Score Factors */}
                  <div className="mt-3 flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-medium">Score Breakdown:</span>
                    <div className="flex space-x-2">
                      {Object.entries(lead.factors).map(([key, value]) => (
                        <div
                          key={key}
                          className="px-2 py-1 bg-gray-50 rounded text-xs"
                          title={key
                            .replace(/([A-Z])/g, ' $1')
                            .trim()
                            .replace(/^./, (str) => str.toUpperCase())}
                        >
                          <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/crm/leads/view/${lead.id}`);
                    }}
                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                   
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/crm/leads/edit/${lead.id}`);
                    }}
                    className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                   
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Target className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600">No leads found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
