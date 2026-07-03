'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, BarChart3, TrendingUp, CheckCircle, AlertCircle, Calendar, MapPin, Download, X, Eye, Clock, User, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/export';

interface FTFRecord {
  id: string;
  serviceId: string;
  customerName: string;
  equipment: string;
  issueType: string;
  issueDescription: string;
  serviceDate: string;
  technician: string;
  region: string;
  ftfStatus: boolean;
  resolutionTime: number; // in minutes
  serviceCategory: string;
  partsUsed: string[];
}

const mockFTFRecords: FTFRecord[] = [
  {
    id: '1',
    serviceId: 'SVC-2025-1001',
    customerName: 'Rajesh Manufacturing',
    equipment: 'Washing Machine - Model WM-5000',
    issueType: 'Motor Malfunction',
    issueDescription: 'Motor not spinning, making unusual noise during wash cycle',
    serviceDate: '2025-10-20',
    technician: 'Amit Kumar',
    region: 'Mumbai',
    ftfStatus: true,
    resolutionTime: 45,
    serviceCategory: 'Repair',
    partsUsed: ['Motor Bearing', 'Motor Shaft Seal']
  },
  {
    id: '2',
    serviceId: 'SVC-2025-1002',
    customerName: 'Pune Auto Parts',
    equipment: 'Refrigerator - Model RF-8000',
    issueType: 'Compressor Issue',
    issueDescription: 'Compressor not starting, fridge not cooling',
    serviceDate: '2025-10-19',
    technician: 'Priya Sharma',
    region: 'Pune',
    ftfStatus: false,
    resolutionTime: 120,
    serviceCategory: 'Repair',
    partsUsed: ['Compressor', 'Capacitor']
  },
  {
    id: '3',
    serviceId: 'SVC-2025-1003',
    customerName: 'Mumbai Electronics',
    equipment: 'Air Conditioner - Model AC-3500',
    issueType: 'Refrigerant Leak',
    issueDescription: 'Low cooling efficiency, refrigerant level depleted',
    serviceDate: '2025-10-18',
    technician: 'Rajesh Patel',
    region: 'Mumbai',
    ftfStatus: true,
    resolutionTime: 60,
    serviceCategory: 'Maintenance',
    partsUsed: ['Refrigerant Gas']
  },
  {
    id: '4',
    serviceId: 'SVC-2025-1004',
    customerName: 'Delhi Manufacturing Hub',
    equipment: 'Dishwasher - Model DW-2000',
    issueType: 'Water Drainage Problem',
    issueDescription: 'Water not draining from wash chamber, pooling at bottom',
    serviceDate: '2025-10-17',
    technician: 'Vikram Singh',
    region: 'Delhi',
    ftfStatus: true,
    resolutionTime: 35,
    serviceCategory: 'Repair',
    partsUsed: ['Drain Pump', 'Filter Mesh']
  },
  {
    id: '5',
    serviceId: 'SVC-2025-1005',
    customerName: 'Bangalore Tech Solutions',
    equipment: 'Microwave Oven - Model MO-1500',
    issueType: 'Magnetron Failure',
    issueDescription: 'Microwave not heating, heating element not working',
    serviceDate: '2025-10-16',
    technician: 'Neha Desai',
    region: 'Bangalore',
    ftfStatus: false,
    resolutionTime: 90,
    serviceCategory: 'Repair',
    partsUsed: ['Magnetron', 'High Voltage Capacitor']
  },
  {
    id: '6',
    serviceId: 'SVC-2025-1006',
    customerName: 'Chennai Industrial',
    equipment: 'Washing Machine - Model WM-7000',
    issueType: 'Drum Bearing Failure',
    issueDescription: 'Loud grinding noise during spin cycle, rust in drum',
    serviceDate: '2025-10-15',
    technician: 'Sanjay Verma',
    region: 'Chennai',
    ftfStatus: true,
    resolutionTime: 55,
    serviceCategory: 'Repair',
    partsUsed: ['Drum Bearing', 'Drum Seal', 'Stainless Steel Drum']
  },
  {
    id: '7',
    serviceId: 'SVC-2025-1007',
    customerName: 'Ahmedabad Precision',
    equipment: 'Refrigerator - Model RF-6000',
    issueType: 'Thermostat Malfunction',
    issueDescription: 'Temperature control not working, fridge freezing or too warm',
    serviceDate: '2025-10-14',
    technician: 'Ananya Sharma',
    region: 'Ahmedabad',
    ftfStatus: true,
    resolutionTime: 40,
    serviceCategory: 'Repair',
    partsUsed: ['Electronic Thermostat']
  },
  {
    id: '8',
    serviceId: 'SVC-2025-1008',
    customerName: 'Hyderabad Manufacturing',
    equipment: 'Air Conditioner - Model AC-5000',
    issueType: 'Blower Motor Issue',
    issueDescription: 'Blower not working, no air circulation in room',
    serviceDate: '2025-10-13',
    technician: 'Ravi Kumar',
    region: 'Hyderabad',
    ftfStatus: false,
    resolutionTime: 105,
    serviceCategory: 'Repair',
    partsUsed: ['Blower Motor', 'Motor Capacitor', 'Fan Blade']
  },
  {
    id: '9',
    serviceId: 'SVC-2025-1009',
    customerName: 'Kolkata Industries',
    equipment: 'Water Heater - Model WH-500',
    issueType: 'Heating Element Burnout',
    issueDescription: 'Water not heating up to desired temperature',
    serviceDate: '2025-10-12',
    technician: 'Rakesh Singh',
    region: 'Kolkata',
    ftfStatus: true,
    resolutionTime: 38,
    serviceCategory: 'Maintenance',
    partsUsed: ['Heating Element']
  },
  {
    id: '10',
    serviceId: 'SVC-2025-1010',
    customerName: 'Lucknow Manufacturing',
    equipment: 'Washing Machine - Model WM-4000',
    issueType: 'Control Panel Failure',
    issueDescription: 'Display not showing, buttons not responding to input',
    serviceDate: '2025-10-11',
    technician: 'Priya Sharma',
    region: 'Lucknow',
    ftfStatus: false,
    resolutionTime: 145,
    serviceCategory: 'Repair',
    partsUsed: ['Control PCB', 'Display Unit']
  }
];

export default function FTFAnalyticsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'resolutionTime'>('recent');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FTFRecord | null>(null);
  const [selectedRegionData, setSelectedRegionData] = useState<any>(null);

  const regions = ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Chennai', 'Ahmedabad', 'Hyderabad', 'Kolkata', 'Lucknow'];
  const categories = ['Repair', 'Maintenance'];

  const filteredRecords = useMemo(() => {
    let filtered = mockFTFRecords.filter(record => {
      const matchesSearch = record.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.equipment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || (selectedStatus === 'ftf' ? record.ftfStatus : !record.ftfStatus);
      const matchesRegion = selectedRegion === 'all' || record.region === selectedRegion;
      const matchesCategory = selectedCategory === 'all' || record.serviceCategory === selectedCategory;
      return matchesSearch && matchesStatus && matchesRegion && matchesCategory;
    });

    if (sortBy === 'resolutionTime') {
      filtered.sort((a, b) => a.resolutionTime - b.resolutionTime);
    } else {
      filtered.sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
    }

    return filtered;
  }, [searchTerm, selectedStatus, selectedRegion, selectedCategory, sortBy]);

  const stats = {
    total: mockFTFRecords.length,
    ftf: mockFTFRecords.filter(r => r.ftfStatus).length,
    notFtf: mockFTFRecords.filter(r => !r.ftfStatus).length,
    ftfRate: ((mockFTFRecords.filter(r => r.ftfStatus).length / mockFTFRecords.length) * 100).toFixed(1),
    avgResolutionTime: (mockFTFRecords.reduce((sum, r) => sum + r.resolutionTime, 0) / mockFTFRecords.length).toFixed(0),
    bestPerformer: mockFTFRecords.reduce((best, current) => (current.resolutionTime < best.resolutionTime ? current : best)),
    quickestTime: Math.min(...mockFTFRecords.map(r => r.resolutionTime)),
    slowestTime: Math.max(...mockFTFRecords.map(r => r.resolutionTime))
  };

  const regionStats = regions.map(region => {
    const regionRecords = mockFTFRecords.filter(r => r.region === region);
    const ftfCount = regionRecords.filter(r => r.ftfStatus).length;
    return {
      region,
      total: regionRecords.length,
      ftf: ftfCount,
      rate: ((ftfCount / (regionRecords.length || 1)) * 100).toFixed(1)
    };
  });

  const handleViewDetails = (record: FTFRecord) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleExport = () => {
    exportToCsv('ftf-analytics', filteredRecords);
    toast({
      title: "Report Exported",
      description: "FTF Analytics report has been exported successfully.",
    });
  };

  const handleViewRegion = (regionData: any) => {
    setSelectedRegionData(regionData);
    setShowRegionModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
              First Time Fix (FTF) Analytics
            </h1>
            <p className="text-gray-600 mt-1">Track first-time fix success rate and performance metrics</p>
          </div>
          <button onClick={handleExport} className="bg-emerald-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md">
            <Download className="h-5 w-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <button onClick={() => setSelectedStatus('all')} className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:border-blue-500 transition-all text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              <p className="text-xs text-blue-600 mt-2">Click to view all</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </button>

        <button onClick={() => setSelectedStatus('ftf')} className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:border-green-500 transition-all text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">First Time Fix</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.ftf}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">{stats.ftfRate}% Success Rate</p>
              <p className="text-xs text-green-600 mt-2">Click to filter</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </button>

        <button onClick={() => setSelectedStatus('not-ftf')} className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:border-red-500 transition-all text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Not FTF</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.notFtf}</p>
              <p className="text-xs text-red-600 font-semibold mt-1">{(100 - parseFloat(stats.ftfRate)).toFixed(1)}% Failure</p>
              <p className="text-xs text-red-600 mt-2">Click to filter</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.avgResolutionTime}</p>
              <p className="text-xs text-gray-500 mt-1">minutes</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-3">Best Performing Technician</p>
          <p className="text-lg font-bold text-gray-900">{stats.bestPerformer.technician}</p>
          <p className="text-xs text-gray-600 mt-2">{stats.bestPerformer.region} • {stats.bestPerformer.resolutionTime} min</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-3">Quickest Resolution</p>
          <p className="text-lg font-bold text-emerald-600">{stats.quickestTime} minutes</p>
          <p className="text-xs text-gray-600 mt-2">Fastest service completion time</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-3">Slowest Resolution</p>
          <p className="text-lg font-bold text-orange-600">{stats.slowestTime} minutes</p>
          <p className="text-xs text-gray-600 mt-2">Required follow-up or additional parts</p>
        </div>
      </div>

      {/* Regional Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Regional FTF Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {regionStats.filter(r => r.total > 0).map((stat, idx) => (
            <button key={idx} onClick={() => handleViewRegion(stat)} className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-emerald-500 transition-all text-left">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-900">{stat.region}</p>
                  <p className="text-xs text-gray-600">{stat.total} services</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600">{stat.ftf}/{stat.total}</p>
                <p className="text-xs text-gray-600">{stat.rate}% FTF</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by service ID, customer, or equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">FTF Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="all">All Status</option>
                <option value="ftf">First Time Fix</option>
                <option value="not-ftf">Not FTF</option>
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="recent">Recently Completed</option>
                <option value="resolutionTime">Fastest Resolution</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                <Filter className="h-4 w-4" />
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-2">
        {filteredRecords.map((record) => (
          <div key={record.id} className={`rounded-lg border p-5 shadow-sm hover:shadow-md transition-all ${record.ftfStatus ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{record.serviceId}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${record.ftfStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {record.ftfStatus ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {record.ftfStatus ? 'FTF Success' : 'Multiple Visits'}
                  </span>
                </div>

                <p className="text-gray-700 font-medium mb-2">{record.customerName}</p>
                <p className="text-gray-600 text-sm mb-3">{record.equipment} • {record.issueType}</p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                  <div className="bg-white bg-opacity-60 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Technician</p>
                    <p className="text-sm font-semibold text-gray-900">{record.technician}</p>
                  </div>
                  <div className="bg-white bg-opacity-60 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Resolution Time</p>
                    <p className="text-sm font-semibold text-gray-900">{record.resolutionTime} min</p>
                  </div>
                  <div className="bg-white bg-opacity-60 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Region</p>
                    <p className="text-sm font-semibold text-gray-900">{record.region}</p>
                  </div>
                  <div className="bg-white bg-opacity-60 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Service Date</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(record.serviceDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="bg-white bg-opacity-60 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Category</p>
                    <p className="text-sm font-semibold text-gray-900">{record.serviceCategory}</p>
                  </div>
                </div>

                <div className="text-xs text-gray-600">
                  <p className="mb-1"><strong>Issue:</strong> {record.issueDescription}</p>
                  <p><strong>Parts Used:</strong> {record.partsUsed.join(', ')}</p>
                </div>
              </div>

              <button onClick={() => handleViewDetails(record)} className="ml-4 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg transition-colors">
                <Eye className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedRecord.serviceId}</h2>
                <p className="text-emerald-100 text-sm">FTF Service Record Details</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Service Status */}
              <div className={`rounded-lg p-3 ${selectedRecord.ftfStatus ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedRecord.ftfStatus ? <CheckCircle className="h-8 w-8 text-green-600" /> : <AlertCircle className="h-8 w-8 text-red-600" />}
                    <div>
                      <h3 className={`text-lg font-bold ${selectedRecord.ftfStatus ? 'text-green-900' : 'text-red-900'}`}>
                        {selectedRecord.ftfStatus ? 'First Time Fix - Success' : 'Multiple Visits Required'}
                      </h3>
                      <p className={`text-sm ${selectedRecord.ftfStatus ? 'text-green-700' : 'text-red-700'}`}>
                        {selectedRecord.ftfStatus ? 'Issue resolved in first visit' : 'Additional visits or parts needed'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${selectedRecord.ftfStatus ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedRecord.resolutionTime}
                    </p>
                    <p className="text-xs text-gray-600">minutes</p>
                  </div>
                </div>
              </div>

              {/* Customer & Equipment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Customer Name</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedRecord.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Region</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedRecord.region}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Service Date</p>
                      <p className="text-sm text-gray-900 font-semibold">{new Date(selectedRecord.serviceDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Equipment Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-purple-700 font-medium">Equipment</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedRecord.equipment}</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-700 font-medium">Issue Type</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedRecord.issueType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-700 font-medium">Service Category</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedRecord.serviceCategory}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issue Description */}
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h4 className="font-bold text-orange-900 mb-2">Issue Description</h4>
                <p className="text-sm text-gray-700">{selectedRecord.issueDescription}</p>
              </div>

              {/* Service Timeline */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200">
                <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Service Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-600 rounded-full w-3 h-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Service Initiated</p>
                      <p className="text-xs text-gray-600">{new Date(selectedRecord.serviceDate).toLocaleTimeString('en-IN')} - Technician assigned and dispatched</p>
                    </div>
                  </div>
                  <div className="ml-1.5 border-l-2 border-emerald-300 h-6"></div>
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-600 rounded-full w-3 h-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Diagnosis & Repair</p>
                      <p className="text-xs text-gray-600">Issue identified and resolution applied</p>
                    </div>
                  </div>
                  <div className="ml-1.5 border-l-2 border-emerald-300 h-6"></div>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full w-3 h-3 ${selectedRecord.ftfStatus ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Service Completed</p>
                      <p className="text-xs text-gray-600">Total resolution time: {selectedRecord.resolutionTime} minutes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parts Used */}
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                <h4 className="font-bold text-indigo-900 mb-3">Parts Used in Service</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.partsUsed.map((part, idx) => (
                    <span key={idx} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      {part}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technician Information */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Assigned Technician
                </h4>
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    {selectedRecord.technician.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedRecord.technician}</p>
                    <p className="text-sm text-gray-600">{selectedRecord.region} Region</p>
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
                Export Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Region Performance Modal */}
      {showRegionModal && selectedRegionData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="h-6 w-6" />
                  {selectedRegionData.region} Region Performance
                </h2>
                <p className="text-blue-100 text-sm">FTF Analytics & Service Breakdown</p>
              </div>
              <button onClick={() => setShowRegionModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Region Stats Overview */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200 text-center">
                  <p className="text-sm font-medium text-blue-700 mb-1">Total Services</p>
                  <p className="text-3xl font-bold text-blue-900">{selectedRegionData.total}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200 text-center">
                  <p className="text-sm font-medium text-green-700 mb-1">First Time Fix</p>
                  <p className="text-3xl font-bold text-green-900">{selectedRegionData.ftf}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 border-2 border-emerald-200 text-center">
                  <p className="text-sm font-medium text-emerald-700 mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-emerald-900">{selectedRegionData.rate}%</p>
                </div>
              </div>

              {/* Regional Services List */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Services in {selectedRegionData.region}</h4>
                <div className="space-y-3">
                  {mockFTFRecords.filter(r => r.region === selectedRegionData.region).map((record) => (
                    <div key={record.id} className={`rounded-lg p-3 border-2 ${record.ftfStatus ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{record.serviceId}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${record.ftfStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {record.ftfStatus ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            {record.ftfStatus ? 'FTF' : 'Multiple Visits'}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{record.resolutionTime} min</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{record.customerName}</p>
                      <p className="text-xs text-gray-600">{record.equipment} • {record.issueType}</p>
                      <p className="text-xs text-gray-600 mt-1">Technician: {record.technician}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regional Insights */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3">Regional Insights</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">
                    <strong>Average Resolution Time:</strong>{' '}
                    {(mockFTFRecords.filter(r => r.region === selectedRegionData.region).reduce((sum, r) => sum + r.resolutionTime, 0) / selectedRegionData.total).toFixed(0)} minutes
                  </p>
                  <p className="text-gray-700">
                    <strong>Top Technician:</strong>{' '}
                    {mockFTFRecords.filter(r => r.region === selectedRegionData.region)[0]?.technician || 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <strong>Most Common Issue:</strong>{' '}
                    {mockFTFRecords.filter(r => r.region === selectedRegionData.region)[0]?.serviceCategory || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-3 py-2 flex justify-end gap-3 border-t">
              <button onClick={() => setShowRegionModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                Close
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Regional Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
