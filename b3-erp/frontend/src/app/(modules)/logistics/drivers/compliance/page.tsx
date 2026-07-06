'use client';

import React, { useState, useEffect } from 'react';
import { LogisticsService } from '@/services/logistics.service';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Eye,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Award,
  AlertCircle,
  Download,
  Upload
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';

interface DriverCompliance {
  id: number;
  driverId: string;
  driverName: string;
  vehicleNumber: string;
  vehicleType: string;
  employmentDate: string;
  licenseNumber: string;
  licenseType: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  licenseDaysToExpiry: number;
  licenseStatus: 'valid' | 'expiring-soon' | 'expired';
  medicalCertificate: string;
  medicalIssueDate: string;
  medicalExpiryDate: string;
  medicalDaysToExpiry: number;
  medicalStatus: 'valid' | 'expiring-soon' | 'expired';
  policeVerification: string;
  policeVerificationDate: string;
  policeVerificationStatus: 'verified' | 'pending' | 'expired';
  backgroundCheck: 'clear' | 'pending' | 'flagged';
  backgroundCheckDate: string;
  insurancePolicyNumber: string;
  insuranceExpiryDate: string;
  insuranceDaysToExpiry: number;
  insuranceStatus: 'active' | 'expiring-soon' | 'expired';
  trainingCertificates: {
    name: string;
    issueDate: string;
    expiryDate: string;
    status: 'valid' | 'expiring-soon' | 'expired';
  }[];
  hoursOfServiceCompliance: number; // percentage
  restPeriodCompliance: number; // percentage
  speedLimitCompliance: number; // percentage
  vehicleInspectionCompliance: number; // percentage
  totalViolations: number;
  criticalViolations: number;
  minorViolations: number;
  lastViolationDate: string | null;
  violationDetails: {
    date: string;
    type: string;
    severity: 'critical' | 'major' | 'minor';
    description: string;
    penalty: string;
    status: 'pending' | 'resolved' | 'appealed';
  }[];
  lastAuditDate: string;
  nextAuditDate: string;
  auditScore: number; // out of 100
  auditStatus: 'compliant' | 'non-compliant' | 'conditional';
  mandatoryTrainings: {
    name: string;
    completionDate: string | null;
    status: 'completed' | 'pending' | 'overdue';
  }[];
  complianceScore: number; // out of 100
  complianceRating: 'excellent' | 'good' | 'fair' | 'poor';
  criticalAlerts: number;
  warnings: number;
  status: 'compliant' | 'non-compliant' | 'under-review';
  lastUpdated: string;
  notes: string;
}

export default function DriverCompliancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);

  const [complianceData, setComplianceData] = useState<DriverCompliance[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await LogisticsService.getDriverCompliance();
        if (!mounted || !Array.isArray(rows)) return;
        const mapped: DriverCompliance[] = rows.map((row: any, index: number) => {
          const status: DriverCompliance['status'] =
            row.verificationStatus === 'compliant' || row.verificationStatus === 'non-compliant' || row.verificationStatus === 'under-review'
              ? row.verificationStatus
              : row.verificationStatus === 'verified' || row.verificationStatus === 'approved'
                ? 'compliant'
                : row.verificationStatus === 'rejected' || row.verificationStatus === 'expired'
                  ? 'non-compliant'
                  : 'under-review';
          const licenseStatus: DriverCompliance['licenseStatus'] =
            row.verificationStatus === 'expired' ? 'expired' : row.verificationStatus === 'expiring-soon' ? 'expiring-soon' : 'valid';
          return {
            id: typeof row.id === 'number' ? row.id : index + 1,
            driverId: row.driverId ?? row.driver?.employeeId ?? '',
            driverName: row.driver?.name ?? row.driverName ?? '',
            vehicleNumber: row.driver?.vehicleNumber ?? row.vehicleNumber ?? '',
            vehicleType: row.driver?.vehicleType ?? row.vehicleType ?? '',
            employmentDate: row.driver?.employmentDate ?? '',
            licenseNumber: row.documentNumber ?? row.licenseNumber ?? '',
            licenseType: row.complianceType ?? row.documentType ?? '',
            licenseIssueDate: row.issueDate ?? '',
            licenseExpiryDate: row.expiryDate ?? '',
            licenseDaysToExpiry: row.daysToExpiry ?? 0,
            licenseStatus,
            medicalCertificate: row.medicalCertificate ?? '',
            medicalIssueDate: row.medicalIssueDate ?? '',
            medicalExpiryDate: row.medicalExpiryDate ?? '',
            medicalDaysToExpiry: row.medicalDaysToExpiry ?? 0,
            medicalStatus: 'valid',
            policeVerification: row.policeVerification ?? '',
            policeVerificationDate: row.policeVerificationDate ?? '',
            policeVerificationStatus: 'verified',
            backgroundCheck: 'clear',
            backgroundCheckDate: row.backgroundCheckDate ?? '',
            insurancePolicyNumber: row.insurancePolicyNumber ?? '',
            insuranceExpiryDate: row.insuranceExpiryDate ?? '',
            insuranceDaysToExpiry: row.insuranceDaysToExpiry ?? 0,
            insuranceStatus: 'active',
            trainingCertificates: Array.isArray(row.trainingCertificates) ? row.trainingCertificates : [],
            hoursOfServiceCompliance: row.hoursOfServiceCompliance ?? 0,
            restPeriodCompliance: row.restPeriodCompliance ?? 0,
            speedLimitCompliance: row.speedLimitCompliance ?? 0,
            vehicleInspectionCompliance: row.vehicleInspectionCompliance ?? 0,
            totalViolations: row.totalViolations ?? 0,
            criticalViolations: row.criticalViolations ?? 0,
            minorViolations: row.minorViolations ?? 0,
            lastViolationDate: row.lastViolationDate ?? null,
            violationDetails: Array.isArray(row.violationDetails) ? row.violationDetails : [],
            lastAuditDate: row.lastAuditDate ?? '',
            nextAuditDate: row.nextAuditDate ?? '',
            auditScore: row.auditScore ?? 0,
            auditStatus: 'compliant',
            mandatoryTrainings: Array.isArray(row.mandatoryTrainings) ? row.mandatoryTrainings : [],
            complianceScore: row.complianceScore ?? 0,
            complianceRating: row.complianceRating ?? 'good',
            criticalAlerts: row.criticalAlerts ?? 0,
            warnings: row.warnings ?? 0,
            status,
            lastUpdated: row.updatedAt ?? row.createdAt ?? '',
            notes: row.notes ?? '',
          };
        });
        setComplianceData(mapped);
      } catch {
        // keep []
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);


  const getComplianceRatingColor = (rating: string) => {
    const colors: { [key: string]: string } = {
      'excellent': 'text-green-600 bg-green-50 border-green-200',
      'good': 'text-blue-600 bg-blue-50 border-blue-200',
      'fair': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'poor': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[rating] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'compliant': 'text-green-600 bg-green-50 border-green-200',
      'under-review': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'non-compliant': 'text-red-600 bg-red-50 border-red-200',
      'valid': 'text-green-600 bg-green-50 border-green-200',
      'expiring-soon': 'text-orange-600 bg-orange-50 border-orange-200',
      'expired': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const totalDrivers = complianceData.length;
  const compliantDrivers = complianceData.filter(d => d.status === 'compliant').length;
  const expiringItems = complianceData.filter(d => 
    d.licenseStatus === 'expiring-soon' || 
    d.medicalStatus === 'expiring-soon' || 
    d.insuranceStatus === 'expiring-soon'
  ).length;
  const criticalAlerts = complianceData.reduce((sum, d) => sum + d.criticalAlerts, 0);

  const filteredData = complianceData.filter(driver => {
    const matchesSearch = driver.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.driverId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || driver.status === selectedStatus;
    const matchesRating = selectedRating === 'all' || driver.complianceRating === selectedRating;
    const matchesExpiring = !showExpiringSoon || 
                           driver.licenseStatus === 'expiring-soon' || 
                           driver.medicalStatus === 'expiring-soon' || 
                           driver.insuranceStatus === 'expiring-soon';
    return matchesSearch && matchesStatus && matchesRating && matchesExpiring;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <span>Driver Compliance</span>
          </h1>
          <p className="text-gray-600 mt-1">Monitor regulatory compliance and certification status</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => exportToCsv('driver-compliance', filteredData)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{compliantDrivers}/{totalDrivers}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Compliant Drivers</div>
          <div className="text-xs text-blue-600 mt-1">{((compliantDrivers/totalDrivers)*100).toFixed(1)}% Compliance Rate</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{expiringItems}</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Expiring Soon</div>
          <div className="text-xs text-orange-600 mt-1">Licenses/Certificates/Insurance</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{criticalAlerts}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Critical Alerts</div>
          <div className="text-xs text-red-600 mt-1">Requires Immediate Action</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{totalDrivers * 3}</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Active Documents</div>
          <div className="text-xs text-purple-600 mt-1">Licenses, Medical, Insurance</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Compliance Status</option>
            <option value="compliant">Compliant</option>
            <option value="under-review">Under Review</option>
            <option value="non-compliant">Non-Compliant</option>
          </select>

          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Ratings</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>

          <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg">
            <input
              type="checkbox"
              id="expiringSoon"
              checked={showExpiringSoon}
              onChange={(e) => setShowExpiringSoon(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
            />
            <label htmlFor="expiringSoon" className="text-sm text-gray-700 cursor-pointer">
              Expiring Soon
            </label>
          </div>

          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Audit Schedule</span>
          </button>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medical Certificate</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainings</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Violations</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance Score</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{driver.driverName}</div>
                    <div className="text-sm text-gray-600">{driver.driverId}</div>
                    <div className="text-xs text-gray-500 mt-1">{driver.licenseNumber}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(driver.licenseStatus)}`}>
                      {driver.licenseStatus.replace('-', ' ').toUpperCase()}
                    </span>
                    <div className="text-xs text-gray-600 mt-1">Expires: {new Date(driver.licenseExpiryDate).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{driver.licenseDaysToExpiry} days left</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(driver.medicalStatus)}`}>
                      {driver.medicalStatus.replace('-', ' ').toUpperCase()}
                    </span>
                    <div className="text-xs text-gray-600 mt-1">{driver.medicalCertificate}</div>
                    <div className="text-xs text-gray-500">{driver.medicalDaysToExpiry} days left</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(driver.insuranceStatus)}`}>
                      {driver.insuranceStatus.replace('-', ' ').toUpperCase()}
                    </span>
                    <div className="text-xs text-gray-600 mt-1">{driver.insurancePolicyNumber}</div>
                    <div className="text-xs text-gray-500">{driver.insuranceDaysToExpiry} days left</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{driver.trainingCertificates.length} certificates</div>
                    <div className="text-xs text-green-600">
                      {driver.trainingCertificates.filter(t => t.status === 'valid').length} valid
                    </div>
                    <div className="text-xs text-orange-600">
                      {driver.trainingCertificates.filter(t => t.status === 'expiring-soon').length} expiring
                    </div>
                    <div className="text-xs text-red-600">
                      {driver.mandatoryTrainings.filter(t => t.status === 'overdue').length} overdue
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Total: {driver.totalViolations}</div>
                    {driver.criticalViolations > 0 && (
                      <div className="text-xs text-red-600">Critical: {driver.criticalViolations}</div>
                    )}
                    <div className="text-xs text-gray-600">Minor: {driver.minorViolations}</div>
                    {driver.lastViolationDate && (
                      <div className="text-xs text-gray-500">Last: {new Date(driver.lastViolationDate).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className={`text-2xl font-bold ${
                      driver.complianceScore >= 90 ? 'text-green-600' :
                      driver.complianceScore >= 75 ? 'text-blue-600' :
                      driver.complianceScore >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {driver.complianceScore}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getComplianceRatingColor(driver.complianceRating)}`}>
                      {driver.complianceRating.toUpperCase()}
                    </span>
                    {driver.criticalAlerts > 0 && (
                      <div className="flex items-center justify-center space-x-1 mt-2">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span className="text-xs text-red-600">{driver.criticalAlerts} alerts</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(driver.status)}`}>
                      {driver.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Eye className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">View</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Document</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Documentation</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Track licenses, medical certificates, insurance, and training certifications for regulatory compliance.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Driving license with validity tracking</div>
            <div>• Medical fitness certificates</div>
            <div>• Insurance policy coverage</div>
            <div>• Training and certification records</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Violations & Penalties</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Monitor traffic violations, safety incidents, and penalties with severity-based tracking and resolution status.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Critical, major, and minor violations</div>
            <div>• Penalty and fine tracking</div>
            <div>• Resolution and appeal status</div>
            <div>• Historical violation records</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Compliance Audits</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Regular compliance audits to ensure adherence to regulations with scoring and corrective action tracking.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Scheduled compliance audits</div>
            <div>• Audit score and ratings</div>
            <div>• Compliance vs non-compliance status</div>
            <div>• Corrective action recommendations</div>
          </div>
        </div>
      </div>
    </div>
  );
}
