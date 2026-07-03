'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { crmService } from '@/services/crm.service';
import {
  Award,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Building2,
  Eye,
  FileText,
  Download,
  Search,
  Filter,
  Trophy,
  Star,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Target,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/components/ui';

interface WonOpportunity {
  id: string;
  name: string;
  accountName: string;
  contactName: string;
  value: number;
  closeDate: string;
  daysToClose: number;
  owner: string;
  products: string[];
  source: string;
  initialValue: number;
  finalValue: number;
  discountPercent: number;
  createdDate: string;
  winReason: string;
  competitorName: string;
  testimonial?: string;
}

const mockWonOpportunities: WonOpportunity[] = [
  {
    id: '1',
    name: 'Hospital Furniture - Central Medical Center',
    accountName: 'Central Medical Center',
    contactName: 'Dr. Susan Clark',
    value: 320000,
    closeDate: '2025-10-15',
    daysToClose: 92,
    owner: 'David Lee',
    products: ['Medical Cabinets', 'Storage Solutions', 'Nurse Stations'],
    source: 'Tender',
    initialValue: 350000,
    finalValue: 320000,
    discountPercent: 8.6,
    createdDate: '2025-07-15',
    winReason: 'Best quality and competitive pricing',
    competitorName: 'MedEquip Solutions',
    testimonial: 'Excellent quality and professional installation team.',
  },
  {
    id: '2',
    name: 'Premium Kitchen - Luxury Apartments',
    accountName: 'Skyline Developers',
    contactName: 'Michael Roberts',
    value: 285000,
    closeDate: '2025-09-28',
    daysToClose: 68,
    owner: 'Sarah Johnson',
    products: ['Modular Kitchens', 'Countertops', 'Premium Appliances'],
    source: 'Referral',
    initialValue: 295000,
    finalValue: 285000,
    discountPercent: 3.4,
    createdDate: '2025-07-22',
    winReason: 'Superior design and brand reputation',
    competitorName: 'Elite Kitchens',
  },
  {
    id: '3',
    name: 'Corporate Office Renovation',
    accountName: 'Tech Innovations Corp',
    contactName: 'Jennifer Lee',
    value: 195000,
    closeDate: '2025-10-10',
    daysToClose: 55,
    owner: 'Michael Park',
    products: ['Office Furniture', 'Workstations', 'Storage Systems'],
    source: 'Website',
    initialValue: 210000,
    finalValue: 195000,
    discountPercent: 7.1,
    createdDate: '2025-08-16',
    winReason: 'Flexible payment terms and quick delivery',
    competitorName: 'Office Pro',
    testimonial: 'Fast delivery and excellent customer service!',
  },
  {
    id: '4',
    name: 'Retail Store Fixtures - Fashion Chain',
    accountName: 'Fashion Trends Retail',
    contactName: 'David Wilson',
    value: 165000,
    closeDate: '2025-09-15',
    daysToClose: 78,
    owner: 'Emily Davis',
    products: ['Display Cabinets', 'Shelving Systems', 'Checkout Counters'],
    source: 'Trade Show',
    initialValue: 165000,
    finalValue: 165000,
    discountPercent: 0,
    createdDate: '2025-06-29',
    winReason: 'Custom design capabilities',
    competitorName: 'Store Solutions Inc',
  },
  {
    id: '5',
    name: 'Hotel Suites - Grand Plaza',
    accountName: 'Grand Plaza Hotels',
    contactName: 'Robert Martinez',
    value: 420000,
    closeDate: '2025-08-30',
    daysToClose: 105,
    owner: 'David Lee',
    products: ['Custom Wardrobes', 'Vanity Units', 'TV Cabinets', 'Bedside Tables'],
    source: 'Direct',
    initialValue: 450000,
    finalValue: 420000,
    discountPercent: 6.7,
    createdDate: '2025-05-17',
    winReason: 'Volume discount and proven track record',
    competitorName: 'Hotel Furnishings Ltd',
    testimonial: 'Outstanding quality! Highly recommended for luxury projects.',
  },
  {
    id: '6',
    name: 'Smart Home Kitchen - Villa Project',
    accountName: 'Premium Villas Inc',
    contactName: 'Lisa Anderson',
    value: 95000,
    closeDate: '2025-10-05',
    daysToClose: 42,
    owner: 'Sarah Johnson',
    products: ['Smart Kitchen Systems', 'High-end Appliances', 'Custom Cabinets'],
    source: 'Partner',
    initialValue: 98000,
    finalValue: 95000,
    discountPercent: 3.1,
    createdDate: '2025-08-24',
    winReason: 'Smart home integration expertise',
    competitorName: 'Smart Living Solutions',
  },
];

export default function WonOpportunitiesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [opportunities, setOpportunities] = useState<WonOpportunity[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await crmService.opportunityViews.getWon();
        if (!active) return;
        const rows = Array.isArray(data?.opportunities) ? data.opportunities : [];
        if (!rows.length) {
          setOpportunities(mockWonOpportunities);
          return;
        }
        setOpportunities(
          rows.map((o: any) => ({
            id: String(o?.id ?? ''),
            name: o?.name ?? '',
            accountName: o?.account ?? '',
            contactName: o?.contact ?? '',
            value: Number(o?.value ?? 0),
            closeDate: o?.expectedCloseDate ?? '',
            daysToClose: 0,
            owner: o?.owner ?? '',
            products: [],
            source: o?.source ?? '',
            initialValue: Number(o?.value ?? 0),
            finalValue: Number(o?.value ?? 0),
            discountPercent: 0,
            createdDate: '',
            winReason: '',
            competitorName: '',
          })),
        );
      } catch {
        if (active) setOpportunities(mockWonOpportunities);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [sortBy, setSortBy] = useState('closeDate');

  // Calculate statistics
  const stats = {
    totalWon: opportunities.length,
    totalRevenue: opportunities.reduce((sum, opp) => sum + opp.value, 0),
    avgDealSize: opportunities.reduce((sum, opp) => sum + opp.value, 0) / opportunities.length,
    avgDaysToClose: Math.round(
      opportunities.reduce((sum, opp) => sum + opp.daysToClose, 0) / opportunities.length
    ),
    totalDiscount: opportunities.reduce(
      (sum, opp) => sum + (opp.initialValue - opp.finalValue),
      0
    ),
    avgDiscountPercent: (
      opportunities.reduce((sum, opp) => sum + opp.discountPercent, 0) / opportunities.length
    ).toFixed(1),
  };

  // Win reasons breakdown
  const winReasonCounts = opportunities.reduce((acc, opp) => {
    acc[opp.winReason] = (acc[opp.winReason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topWinReasons = Object.entries(winReasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top performers
  const performerStats = opportunities.reduce((acc, opp) => {
    if (!acc[opp.owner]) {
      acc[opp.owner] = { count: 0, value: 0 };
    }
    acc[opp.owner].count += 1;
    acc[opp.owner].value += opp.value;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  const topPerformers = Object.entries(performerStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const filteredOpportunities = opportunities
    .filter((opp) => {
      const matchesSearch =
        opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.accountName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.value - a.value;
        case 'closeDate':
          return new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime();
        case 'daysToClose':
          return a.daysToClose - b.daysToClose;
        default:
          return 0;
      }
    });

  // Handler for Case Study button
  const handleGenerateCaseStudy = (opp: WonOpportunity) => {
    // In a real application, this would navigate to a case study generator or open a modal
    addToast({
      title: 'Case Study Generation',
      message: `Generating case study for "${opp.name}". This feature will create a shareable success story.`,
      variant: 'success'
    });
    // Future implementation: router.push(`/crm/opportunities/case-study/${opp.id}`)
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Won</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.totalWon}</p>
            </div>
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Total Revenue</p>
              <p className="text-3xl font-bold text-emerald-900 mt-1">
                ${(stats.totalRevenue / 1000).toFixed(0)}K
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-emerald-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Avg Deal Size</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                ${(stats.avgDealSize / 1000).toFixed(0)}K
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Days to Close</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.avgDaysToClose}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Avg Discount</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">{stats.avgDiscountPercent}%</p>
            </div>
            <Award className="h-8 w-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Top Performers & Win Reasons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Top Performers */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center mb-2">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            <h2 className="text-lg font-bold text-gray-900">Top Performers</h2>
          </div>
          <div className="space-y-3">
            {topPerformers.map((performer, index) => (
              <div
                key={performer.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0
                        ? 'bg-yellow-500'
                        : index === 1
                        ? 'bg-gray-400'
                        : 'bg-orange-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{performer.name}</p>
                    <p className="text-sm text-gray-500">{performer.count} deals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    ${(performer.value / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Win Reasons */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <h2 className="text-lg font-bold text-gray-900">Top Win Reasons</h2>
          </div>
          <div className="space-y-3">
            {topWinReasons.map(([reason, count], index) => (
              <div key={reason} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{reason}</p>
                  <div className="mt-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(count / opportunities.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="ml-4 text-sm font-semibold text-gray-700">
                  {count} ({((count / opportunities.length) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search won opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="closeDate">Sort by: Close Date</option>
            <option value="value">Sort by: Value</option>
            <option value="daysToClose">Sort by: Days to Close</option>
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Time</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisQuarter">This Quarter</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>
      </div>

      {/* Won Opportunities List */}
      <div className="space-y-2">
        {filteredOpportunities.map((opp) => (
          <div
            key={opp.id}
            className="bg-white rounded-lg border-2 border-green-200 p-3 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              {/* Left Side */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <h3 className="text-xl font-bold text-gray-900">{opp.name}</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                    WON
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="flex items-center text-gray-600">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span className="font-medium">{opp.accountName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{opp.contactName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Closed: {new Date(opp.closeDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{opp.daysToClose} days to close</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {opp.products.map((product) => (
                    <span
                      key={product}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded"
                    >
                      {product}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-6 text-sm">
                  <div>
                    <span className="text-gray-500">Owner: </span>
                    <span className="font-semibold text-gray-900">{opp.owner}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Source: </span>
                    <span className="font-semibold text-gray-900">{opp.source}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Beat: </span>
                    <span className="font-semibold text-gray-900">{opp.competitorName}</span>
                  </div>
                </div>

                {opp.testimonial && (
                  <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                    <div className="flex items-start">
                      <Sparkles className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm italic text-gray-700">"{opp.testimonial}"</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side - Value Info */}
              <div className="ml-6 text-right">
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-sm font-medium text-green-600 mb-1">Deal Value</p>
                  <p className="text-3xl font-bold text-green-900 mb-2">
                    ${(opp.value / 1000).toFixed(0)}K
                  </p>
                  {opp.discountPercent > 0 && (
                    <div className="text-sm">
                      <p className="text-gray-500 line-through">
                        ${(opp.initialValue / 1000).toFixed(0)}K
                      </p>
                      <p className="text-amber-600 font-semibold">
                        {opp.discountPercent.toFixed(1)}% discount
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => router.push(`/crm/opportunities/view/${opp.id}`)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => handleGenerateCaseStudy(opp)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Case Study</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Win Reason Badge */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-500">Win Reason:</span>
                <span className="text-sm font-semibold text-gray-900">{opp.winReason}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Trophy className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600">No won opportunities found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
