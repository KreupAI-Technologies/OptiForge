'use client';

import { useState, useMemo, useEffect } from 'react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { Search, Filter, Users, Star, TrendingUp, Calendar, MapPin, CheckCircle, Award, BarChart3, Download, X, Clock, Wrench, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/export';

interface Technician {
  id: string;
  name: string;
  employeeId: string;
  region: string;
  experience: number; // in years
  rating: number;
  totalServices: number;
  ftfCount: number;
  avgResolutionTime: number; // in minutes
  completionRate: number; // percentage
  specializations: string[];
  certifications: string[];
  joiningDate: string;
  status: 'active' | 'inactive' | 'on-leave';
}

function mapTechnician(r: any): Technician {
  return {
    id: String(r?.id ?? ''),
    name: r?.name ?? '',
    employeeId: r?.employeeId ?? '',
    region: r?.region ?? '',
    experience: Number(r?.experience ?? 0),
    rating: Number(r?.rating ?? 0),
    totalServices: Number(r?.totalServices ?? 0),
    ftfCount: Number(r?.ftfCount ?? 0),
    avgResolutionTime: Number(r?.avgResolutionTime ?? 0),
    completionRate: Number(r?.completionRate ?? 0),
    specializations: Array.isArray(r?.specializations) ? r.specializations : [],
    certifications: Array.isArray(r?.certifications) ? r.certifications : [],
    joiningDate: r?.joiningDate ?? '',
    status: (r?.status ?? 'active') as Technician['status'],
  };
}

export default function TechniciansAnalyticsPage() {
  const [mockTechnicians, setMockTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await AfterSalesPagesService.technicians()) as any[];
        if (!cancelled) setMockTechnicians(Array.isArray(raw) ? raw.map(mapTechnician) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load technicians');
          setMockTechnicians([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [sortBy, setSortBy] = useState<'rating' | 'ftfRate' | 'services' | 'experience'>('rating');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);

  const regions = ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Chennai', 'Ahmedabad', 'Hyderabad', 'Kolkata', 'Lucknow'];

  const filteredTechnicians = useMemo(() => {
    let filtered = mockTechnicians.filter(tech => {
      const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion === 'all' || tech.region === selectedRegion;
      const matchesStatus = tech.status === selectedStatus;
      return matchesSearch && matchesRegion && matchesStatus;
    });

    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'ftfRate') {
      filtered.sort((a, b) => {
        const ftfRateA = (a.ftfCount / a.totalServices) * 100;
        const ftfRateB = (b.ftfCount / b.totalServices) * 100;
        return ftfRateB - ftfRateA;
      });
    } else if (sortBy === 'services') {
      filtered.sort((a, b) => b.totalServices - a.totalServices);
    } else {
      filtered.sort((a, b) => b.experience - a.experience);
    }

    return filtered;
  }, [searchTerm, selectedRegion, selectedStatus, sortBy, mockTechnicians]);

  const activeTechs = mockTechnicians.filter(t => t.status === 'active');
  const hasActive = activeTechs.length > 0;
  const stats = {
    total: activeTechs.length,
    avgRating: hasActive
      ? (activeTechs.reduce((sum, t) => sum + t.rating, 0) / activeTechs.length).toFixed(2)
      : '0.00',
    totalServices: activeTechs.reduce((sum, t) => sum + t.totalServices, 0),
    totalFTF: activeTechs.reduce((sum, t) => sum + t.ftfCount, 0),
    topPerformer: hasActive
      ? activeTechs.reduce((best, current) => (current.rating > best.rating ? current : best))
      : null,
    avgCompletionRate: hasActive
      ? (activeTechs.reduce((sum, t) => sum + t.completionRate, 0) / activeTechs.length).toFixed(1)
      : '0.0'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'on-leave': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.7) return 'text-emerald-600';
    if (rating >= 4.5) return 'text-blue-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const handleViewDetails = (tech: Technician) => {
    setSelectedTechnician(tech);
    setShowDetailsModal(true);
  };

  const handleExport = () => {
    exportToCsv('technician-analytics', filteredTechnicians);
    toast({
      title: "Report Exported",
      description: "Technician analytics report has been exported successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-8 w-8 text-emerald-600" />
              Technician Performance Analytics
            </h1>
            <p className="text-gray-600 mt-1">Monitor technician metrics, ratings, and service history</p>
          </div>
          <button onClick={handleExport} className="bg-emerald-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md">
            <Download className="h-5 w-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Technicians</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className={`text-3xl font-bold mt-2 ${getRatingColor(parseFloat(stats.avgRating))}`}>{stats.avgRating}/5</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.totalServices}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">FTF Count</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalFTF}</p>
              <p className="text-xs text-green-600 font-semibold mt-1">{((stats.totalFTF / stats.totalServices) * 100).toFixed(1)}% Success</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Performer */}
      {stats.topPerformer && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-3 mb-3 shadow-md text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Top Performer</p>
              <h3 className="text-2xl font-bold mt-2">{stats.topPerformer.name}</h3>
              <p className="text-sm opacity-90 mt-1">{stats.topPerformer.region} • {stats.topPerformer.experience} years experience</p>
              <div className="flex gap-3 mt-4">
                <div>
                  <p className="text-xs opacity-75">Rating</p>
                  <p className="text-xl font-bold">{stats.topPerformer.rating}/5</p>
                </div>
                <div>
                  <p className="text-xs opacity-75">Services</p>
                  <p className="text-xl font-bold">{stats.topPerformer.totalServices}</p>
                </div>
                <div>
                  <p className="text-xs opacity-75">FTF Rate</p>
                  <p className="text-xl font-bold">{stats.topPerformer.totalServices > 0 ? ((stats.topPerformer.ftfCount / stats.topPerformer.totalServices) * 100).toFixed(0) : '0'}%</p>
                </div>
              </div>
            </div>
            <Award className="h-16 w-16 opacity-20" />
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="rating">Top Rating</option>
                <option value="ftfRate">Highest FTF %</option>
                <option value="services">Most Services</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>

            <div></div>

            <div className="flex items-end">
              <button className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                <Filter className="h-4 w-4" />
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTechnicians.map((tech) => {
          const ftfRate = ((tech.ftfCount / tech.totalServices) * 100).toFixed(1);
          return (
            <div key={tech.id} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{tech.name}</h3>
                  <p className="text-xs text-gray-600">{tech.employeeId}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(tech.status)}`}>
                  {tech.status.charAt(0).toUpperCase() + tech.status.slice(1).replace('-', ' ')}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(tech.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className={`font-bold ${getRatingColor(tech.rating)}`}>{tech.rating.toFixed(1)}</span>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Services</span>
                  <span className="font-semibold text-gray-900">{tech.totalServices}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">FTF Rate</span>
                  <span className="font-semibold text-green-600">{ftfRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg Resolution</span>
                  <span className="font-semibold text-gray-900">{tech.avgResolutionTime} min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-blue-600">{tech.completionRate}%</span>
                </div>
              </div>

              {/* Location & Experience */}
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 pb-4 border-b">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {tech.region}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {tech.experience}y exp
                </div>
              </div>

              {/* Specializations */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Specializations</p>
                <div className="flex flex-wrap gap-1">
                  {tech.specializations.map((spec, idx) => (
                    <span key={idx} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Certifications</p>
                <div className="flex flex-wrap gap-1">
                  {tech.certifications.slice(0, 2).map((cert, idx) => (
                    <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {cert}
                    </span>
                  ))}
                  {tech.certifications.length > 2 && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      +{tech.certifications.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* View Details Button */}
              <button onClick={() => handleViewDetails(tech)} className="w-full mt-4 py-2 rounded-lg border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors text-sm font-medium">
                View Full Profile
              </button>
            </div>
          );
        })}
      </div>

      {filteredTechnicians.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
          <Users className="h-12 w-12 text-gray-300 mb-2" />
          <p className="text-gray-600 font-medium">No technicians found</p>
          <p className="text-gray-500 text-sm">Try adjusting your filters</p>
        </div>
      )}

      {/* Technician Details Modal */}
      {showDetailsModal && selectedTechnician && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-white text-emerald-600 rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl">
                  {selectedTechnician.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedTechnician.name}</h2>
                  <p className="text-emerald-100 text-sm">{selectedTechnician.employeeId} • Technician Profile</p>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Status & Rating Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border-2 border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-yellow-800">Performance Rating</p>
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < Math.floor(selectedTechnician.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-2xl font-bold text-yellow-900">{selectedTechnician.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className={`rounded-lg p-3 border-2 ${selectedTechnician.status === 'active' ? 'bg-green-50 border-green-200' : selectedTechnician.status === 'on-leave' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-sm font-medium mb-2 ${selectedTechnician.status === 'active' ? 'text-green-800' : selectedTechnician.status === 'on-leave' ? 'text-yellow-800' : 'text-gray-800'}`}>Current Status</p>
                  <p className={`text-2xl font-bold ${selectedTechnician.status === 'active' ? 'text-green-900' : selectedTechnician.status === 'on-leave' ? 'text-yellow-900' : 'text-gray-900'}`}>
                    {selectedTechnician.status.charAt(0).toUpperCase() + selectedTechnician.status.slice(1).replace('-', ' ')}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-blue-800">Experience</p>
                    <Award className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{selectedTechnician.experience} Years</p>
                  <p className="text-xs text-blue-700 mt-1">Since {new Date(selectedTechnician.joiningDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-5 border border-emerald-200">
                <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-white bg-opacity-80 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Total Services</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedTechnician.totalServices}</p>
                  </div>
                  <div className="bg-white bg-opacity-80 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">First Time Fix</p>
                    <p className="text-2xl font-bold text-green-600">{selectedTechnician.ftfCount}</p>
                    <p className="text-xs text-green-600 font-semibold">{((selectedTechnician.ftfCount / selectedTechnician.totalServices) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-white bg-opacity-80 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Avg Resolution</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedTechnician.avgResolutionTime}</p>
                    <p className="text-xs text-gray-600">minutes</p>
                  </div>
                  <div className="bg-white bg-opacity-80 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Completion Rate</p>
                    <p className="text-2xl font-bold text-emerald-600">{selectedTechnician.completionRate}%</p>
                  </div>
                </div>
              </div>

              {/* Location & Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location & Assignment
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-purple-700 font-medium">Service Region</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedTechnician.region}</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-700 font-medium">Employee ID</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedTechnician.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-700 font-medium">Joining Date</p>
                      <p className="text-sm text-gray-900 font-semibold">{new Date(selectedTechnician.joiningDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                  <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Work Statistics
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-indigo-700 font-medium">Services Completed</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedTechnician.totalServices}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-indigo-700 font-medium">Successful FTF</p>
                      <p className="text-sm text-green-600 font-semibold">{selectedTechnician.ftfCount} / {selectedTechnician.totalServices}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-indigo-700 font-medium">Failed FTF</p>
                      <p className="text-sm text-red-600 font-semibold">{selectedTechnician.totalServices - selectedTechnician.ftfCount} / {selectedTechnician.totalServices}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-indigo-700 font-medium">Avg Time per Service</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedTechnician.avgResolutionTime} min</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Technical Specializations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTechnician.specializations.map((spec, idx) => (
                    <span key={idx} className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Professional Certifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedTechnician.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Analysis */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-3 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Performance Analysis</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">First Time Fix Rate</span>
                      <span className="font-bold text-green-600">{((selectedTechnician.ftfCount / selectedTechnician.totalServices) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                        style={{ width: `${(selectedTechnician.ftfCount / selectedTechnician.totalServices) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">Completion Rate</span>
                      <span className="font-bold text-blue-600">{selectedTechnician.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full"
                        style={{ width: `${selectedTechnician.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">Customer Rating</span>
                      <span className="font-bold text-yellow-600">{selectedTechnician.rating.toFixed(1)} / 5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full"
                        style={{ width: `${(selectedTechnician.rating / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-3 py-2 flex justify-end gap-3 border-t">
              <button onClick={() => setShowDetailsModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                Close
              </button>
              <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
