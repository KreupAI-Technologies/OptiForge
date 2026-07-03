'use client';

import React, { useState } from 'react';
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

  const [complianceData, setComplianceData] = useState<DriverCompliance[]>([
    {
      id: 1,
      driverId: 'DRV-001',
      driverName: 'Ramesh Sharma',
      vehicleNumber: 'MH-01-AB-1234',
      vehicleType: '32-Ft Truck',
      employmentDate: '2022-01-15',
      licenseNumber: 'MH-2013-0098765',
      licenseType: 'Heavy Vehicle',
      licenseIssueDate: '2018-03-15',
      licenseExpiryDate: '2028-03-14',
      licenseDaysToExpiry: 1240,
      licenseStatus: 'valid',
      medicalCertificate: 'MED-2024-RS-001',
      medicalIssueDate: '2024-08-01',
      medicalExpiryDate: '2025-07-31',
      medicalDaysToExpiry: 283,
      medicalStatus: 'valid',
      policeVerification: 'PV-2024-RS-001',
      policeVerificationDate: '2024-01-10',
      policeVerificationStatus: 'verified',
      backgroundCheck: 'clear',
      backgroundCheckDate: '2024-01-15',
      insurancePolicyNumber: 'INS-DRV-2024-001',
      insuranceExpiryDate: '2025-12-31',
      insuranceDaysToExpiry: 436,
      insuranceStatus: 'active',
      trainingCertificates: [
        {
          name: 'Defensive Driving',
          issueDate: '2024-06-15',
          expiryDate: '2026-06-14',
          status: 'valid'
        },
        {
          name: 'Hazardous Materials Handling',
          issueDate: '2024-03-20',
          expiryDate: '2026-03-19',
          status: 'valid'
        },
        {
          name: 'First Aid & Emergency Response',
          issueDate: '2023-11-10',
          expiryDate: '2025-11-09',
          status: 'valid'
        }
      ],
      hoursOfServiceCompliance: 98,
      restPeriodCompliance: 97,
      speedLimitCompliance: 96,
      vehicleInspectionCompliance: 100,
      totalViolations: 1,
      criticalViolations: 0,
      minorViolations: 1,
      lastViolationDate: '2024-06-15',
      violationDetails: [
        {
          date: '2024-06-15',
          type: 'Minor Speeding',
          severity: 'minor',
          description: 'Exceeded speed limit by 8 km/h on highway',
          penalty: 'Written warning',
          status: 'resolved'
        }
      ],
      lastAuditDate: '2024-09-15',
      nextAuditDate: '2025-03-15',
      auditScore: 96,
      auditStatus: 'compliant',
      mandatoryTrainings: [
        {
          name: 'Annual Safety Training 2024',
          completionDate: '2024-02-10',
          status: 'completed'
        },
        {
          name: 'Road Safety Awareness',
          completionDate: '2024-04-15',
          status: 'completed'
        }
      ],
      complianceScore: 96,
      complianceRating: 'excellent',
      criticalAlerts: 0,
      warnings: 0,
      status: 'compliant',
      lastUpdated: '2024-10-20',
      notes: 'Excellent compliance record. Role model for other drivers.'
    },
    {
      id: 2,
      driverId: 'DRV-002',
      driverName: 'Suresh Kumar',
      vehicleNumber: 'KA-05-CD-5678',
      vehicleType: '20-Ft Container',
      employmentDate: '2021-05-10',
      licenseNumber: 'KA-2015-0123456',
      licenseType: 'Medium Vehicle',
      licenseIssueDate: '2015-07-20',
      licenseExpiryDate: '2025-07-19',
      licenseDaysToExpiry: 272,
      licenseStatus: 'valid',
      medicalCertificate: 'MED-2024-SK-002',
      medicalIssueDate: '2024-09-10',
      medicalExpiryDate: '2025-09-09',
      medicalDaysToExpiry: 323,
      medicalStatus: 'valid',
      policeVerification: 'PV-2024-SK-002',
      policeVerificationDate: '2024-05-15',
      policeVerificationStatus: 'verified',
      backgroundCheck: 'clear',
      backgroundCheckDate: '2024-05-20',
      insurancePolicyNumber: 'INS-DRV-2024-002',
      insuranceExpiryDate: '2025-11-30',
      insuranceDaysToExpiry: 405,
      insuranceStatus: 'active',
      trainingCertificates: [
        {
          name: 'Defensive Driving',
          issueDate: '2023-08-10',
          expiryDate: '2025-08-09',
          status: 'valid'
        },
        {
          name: 'Load Securing',
          issueDate: '2024-01-15',
          expiryDate: '2026-01-14',
          status: 'valid'
        }
      ],
      hoursOfServiceCompliance: 95,
      restPeriodCompliance: 93,
      speedLimitCompliance: 91,
      vehicleInspectionCompliance: 98,
      totalViolations: 2,
      criticalViolations: 0,
      minorViolations: 2,
      lastViolationDate: '2024-08-20',
      violationDetails: [
        {
          date: '2024-08-20',
          type: 'Speeding',
          severity: 'minor',
          description: 'Exceeded speed limit by 12 km/h in city limits',
          penalty: 'Fine ₹500',
          status: 'resolved'
        },
        {
          date: '2024-05-10',
          type: 'Documentation Incomplete',
          severity: 'minor',
          description: 'Missing trip log entry',
          penalty: 'Written warning',
          status: 'resolved'
        }
      ],
      lastAuditDate: '2024-08-01',
      nextAuditDate: '2025-02-01',
      auditScore: 88,
      auditStatus: 'compliant',
      mandatoryTrainings: [
        {
          name: 'Annual Safety Training 2024',
          completionDate: '2024-03-05',
          status: 'completed'
        },
        {
          name: 'Road Safety Awareness',
          completionDate: null,
          status: 'pending'
        }
      ],
      complianceScore: 88,
      complianceRating: 'good',
      criticalAlerts: 0,
      warnings: 1,
      status: 'compliant',
      lastUpdated: '2024-10-18',
      notes: 'Good overall compliance. Needs to complete pending Road Safety training.'
    },
    {
      id: 3,
      driverId: 'DRV-003',
      driverName: 'Mohan Das',
      vehicleNumber: 'WB-02-EF-9012',
      vehicleType: '40-Ft Truck',
      employmentDate: '2021-08-20',
      licenseNumber: 'WB-2012-0087654',
      licenseType: 'Heavy Vehicle',
      licenseIssueDate: '2012-09-10',
      licenseExpiryDate: '2027-09-09',
      licenseDaysToExpiry: 1054,
      licenseStatus: 'valid',
      medicalCertificate: 'MED-2024-MD-003',
      medicalIssueDate: '2024-07-15',
      medicalExpiryDate: '2025-07-14',
      medicalDaysToExpiry: 266,
      medicalStatus: 'valid',
      policeVerification: 'PV-2024-MD-003',
      policeVerificationDate: '2024-08-01',
      policeVerificationStatus: 'verified',
      backgroundCheck: 'clear',
      backgroundCheckDate: '2024-08-05',
      insurancePolicyNumber: 'INS-DRV-2024-003',
      insuranceExpiryDate: '2025-10-31',
      insuranceDaysToExpiry: 375,
      insuranceStatus: 'active',
      trainingCertificates: [
        {
          name: 'Defensive Driving',
          issueDate: '2024-05-01',
          expiryDate: '2026-04-30',
          status: 'valid'
        },
        {
          name: 'Long-Haul Operations',
          issueDate: '2024-02-10',
          expiryDate: '2026-02-09',
          status: 'valid'
        },
        {
          name: 'Advanced Vehicle Inspection',
          issueDate: '2023-10-15',
          expiryDate: '2025-10-14',
          status: 'expiring-soon'
        }
      ],
      hoursOfServiceCompliance: 97,
      restPeriodCompliance: 96,
      speedLimitCompliance: 94,
      vehicleInspectionCompliance: 99,
      totalViolations: 1,
      criticalViolations: 0,
      minorViolations: 1,
      lastViolationDate: '2024-04-12',
      violationDetails: [
        {
          date: '2024-04-12',
          type: 'Rest Period Violation',
          severity: 'minor',
          description: 'Delayed rest break by 25 minutes',
          penalty: 'Written warning',
          status: 'resolved'
        }
      ],
      lastAuditDate: '2024-09-01',
      nextAuditDate: '2025-03-01',
      auditScore: 92,
      auditStatus: 'compliant',
      mandatoryTrainings: [
        {
          name: 'Annual Safety Training 2024',
          completionDate: '2024-01-20',
          status: 'completed'
        },
        {
          name: 'Road Safety Awareness',
          completionDate: '2024-03-15',
          status: 'completed'
        }
      ],
      complianceScore: 92,
      complianceRating: 'excellent',
      criticalAlerts: 0,
      warnings: 1,
      status: 'compliant',
      lastUpdated: '2024-10-19',
      notes: 'Renew Advanced Vehicle Inspection certificate before expiry.'
    },
    {
      id: 4,
      driverId: 'DRV-004',
      driverName: 'Prakash Reddy',
      vehicleNumber: 'TS-09-GH-3456',
      vehicleType: '24-Ft Truck',
      employmentDate: '2024-09-01',
      licenseNumber: 'TS-2018-0045678',
      licenseType: 'Medium Vehicle',
      licenseIssueDate: '2018-11-05',
      licenseExpiryDate: '2025-11-04',
      licenseDaysToExpiry: 379,
      licenseStatus: 'valid',
      medicalCertificate: 'MED-2024-PR-004',
      medicalIssueDate: '2024-08-25',
      medicalExpiryDate: '2025-08-24',
      medicalDaysToExpiry: 307,
      medicalStatus: 'valid',
      policeVerification: 'PV-2024-PR-004',
      policeVerificationDate: '2024-08-28',
      policeVerificationStatus: 'verified',
      backgroundCheck: 'clear',
      backgroundCheckDate: '2024-08-30',
      insurancePolicyNumber: 'INS-DRV-2024-004',
      insuranceExpiryDate: '2024-12-31',
      insuranceDaysToExpiry: 72,
      insuranceStatus: 'expiring-soon',
      trainingCertificates: [
        {
          name: 'Basic Safety Training',
          issueDate: '2024-09-05',
          expiryDate: '2026-09-04',
          status: 'valid'
        }
      ],
      hoursOfServiceCompliance: 88,
      restPeriodCompliance: 85,
      speedLimitCompliance: 82,
      vehicleInspectionCompliance: 90,
      totalViolations: 4,
      criticalViolations: 1,
      minorViolations: 3,
      lastViolationDate: '2024-10-15',
      violationDetails: [
        {
          date: '2024-10-15',
          type: 'Traffic Violation',
          severity: 'major',
          description: 'Running red light',
          penalty: 'Fine ₹2000 + 3-day suspension',
          status: 'pending'
        },
        {
          date: '2024-10-08',
          type: 'Speeding',
          severity: 'minor',
          description: 'Exceeded speed limit by 15 km/h',
          penalty: 'Fine ₹1000',
          status: 'resolved'
        },
        {
          date: '2024-09-25',
          type: 'Documentation Missing',
          severity: 'minor',
          description: 'Incomplete delivery documentation',
          penalty: 'Written warning',
          status: 'resolved'
        },
        {
          date: '2024-09-18',
          type: 'Vehicle Inspection',
          severity: 'minor',
          description: 'Failed to report tire wear',
          penalty: 'Written warning',
          status: 'resolved'
        }
      ],
      lastAuditDate: '2024-10-01',
      nextAuditDate: '2025-01-01',
      auditScore: 72,
      auditStatus: 'conditional',
      mandatoryTrainings: [
        {
          name: 'Annual Safety Training 2024',
          completionDate: '2024-09-10',
          status: 'completed'
        },
        {
          name: 'Road Safety Awareness',
          completionDate: null,
          status: 'overdue'
        },
        {
          name: 'Defensive Driving',
          completionDate: null,
          status: 'overdue'
        }
      ],
      complianceScore: 68,
      complianceRating: 'fair',
      criticalAlerts: 3,
      warnings: 4,
      status: 'under-review',
      lastUpdated: '2024-10-20',
      notes: 'CRITICAL: Multiple violations. Under performance review. Insurance expiring soon. Mandatory trainings overdue.'
    },
    {
      id: 5,
      driverId: 'DRV-005',
      driverName: 'Ganesh Patil',
      vehicleNumber: 'MH-12-IJ-7890',
      vehicleType: '18-Ft Truck',
      employmentDate: '2022-02-01',
      licenseNumber: 'MH-2014-0056789',
      licenseType: 'Light Commercial Vehicle',
      licenseIssueDate: '2014-05-20',
      licenseExpiryDate: '2026-05-19',
      licenseDaysToExpiry: 576,
      licenseStatus: 'valid',
      medicalCertificate: 'MED-2024-GP-005',
      medicalIssueDate: '2024-09-01',
      medicalExpiryDate: '2025-08-31',
      medicalDaysToExpiry: 314,
      medicalStatus: 'valid',
      policeVerification: 'PV-2024-GP-005',
      policeVerificationDate: '2024-01-20',
      policeVerificationStatus: 'verified',
      backgroundCheck: 'clear',
      backgroundCheckDate: '2024-01-25',
      insurancePolicyNumber: 'INS-DRV-2024-005',
      insuranceExpiryDate: '2026-01-31',
      insuranceDaysToExpiry: 468,
      insuranceStatus: 'active',
      trainingCertificates: [
        {
          name: 'Defensive Driving',
          issueDate: '2024-07-01',
          expiryDate: '2026-06-30',
          status: 'valid'
        },
        {
          name: 'City Driving Excellence',
          issueDate: '2024-04-10',
          expiryDate: '2026-04-09',
          status: 'valid'
        },
        {
          name: 'Customer Service Excellence',
          issueDate: '2024-02-15',
          expiryDate: '2026-02-14',
          status: 'valid'
        },
        {
          name: 'First Aid Certified',
          issueDate: '2023-12-01',
          expiryDate: '2025-11-30',
          status: 'valid'
        }
      ],
      hoursOfServiceCompliance: 99,
      restPeriodCompliance: 99,
      speedLimitCompliance: 98,
      vehicleInspectionCompliance: 100,
      totalViolations: 0,
      criticalViolations: 0,
      minorViolations: 0,
      lastViolationDate: null,
      violationDetails: [],
      lastAuditDate: '2024-09-20',
      nextAuditDate: '2025-03-20',
      auditScore: 98,
      auditStatus: 'compliant',
      mandatoryTrainings: [
        {
          name: 'Annual Safety Training 2024',
          completionDate: '2024-01-15',
          status: 'completed'
        },
        {
          name: 'Road Safety Awareness',
          completionDate: '2024-02-20',
          status: 'completed'
        }
      ],
      complianceScore: 98,
      complianceRating: 'excellent',
      criticalAlerts: 0,
      warnings: 0,
      status: 'compliant',
      lastUpdated: '2024-10-20',
      notes: 'Perfect compliance record. Zero violations. Exemplary driver.'
    },
    {
      id: 6,
      driverId: 'DRV-006',
      driverName: 'Vijay Singh',
      vehicleNumber: 'DL-03-KL-2468',
      vehicleType: '28-Ft Truck',
      employmentDate: '2021-09-15',
      licenseNumber: 'DL-2011-0034567',
      licenseType: 'Heavy Vehicle',
      licenseIssueDate: '2011-12-10',
      licenseExpiryDate: '2026-12-09',
      licenseDaysToExpiry: 780,
      licenseStatus: 'valid',
      medicalCertificate: 'MED-2024-VS-006',
      medicalIssueDate: '2024-06-20',
      medicalExpiryDate: '2025-06-19',
      medicalDaysToExpiry: 241,
      medicalStatus: 'valid',
      policeVerification: 'PV-2024-VS-006',
      policeVerificationDate: '2024-09-05',
      policeVerificationStatus: 'verified',
      backgroundCheck: 'clear',
      backgroundCheckDate: '2024-09-10',
      insurancePolicyNumber: 'INS-DRV-2024-006',
      insuranceExpiryDate: '2025-09-30',
      insuranceDaysToExpiry: 344,
      insuranceStatus: 'active',
      trainingCertificates: [
        {
          name: 'Night Operations Specialist',
          issueDate: '2024-03-15',
          expiryDate: '2026-03-14',
          status: 'valid'
        },
        {
          name: 'Defensive Driving',
          issueDate: '2023-09-20',
          expiryDate: '2025-09-19',
          status: 'expiring-soon'
        }
      ],
      hoursOfServiceCompliance: 96,
      restPeriodCompliance: 94,
      speedLimitCompliance: 90,
      vehicleInspectionCompliance: 97,
      totalViolations: 2,
      criticalViolations: 0,
      minorViolations: 2,
      lastViolationDate: '2024-08-10',
      violationDetails: [
        {
          date: '2024-08-10',
          type: 'Minor Speeding',
          severity: 'minor',
          description: 'Exceeded speed limit by 10 km/h',
          penalty: 'Fine ₹500',
          status: 'resolved'
        },
        {
          date: '2024-03-22',
          type: 'Documentation Delay',
          severity: 'minor',
          description: 'Late submission of trip report',
          penalty: 'Written warning',
          status: 'resolved'
        }
      ],
      lastAuditDate: '2024-07-15',
      nextAuditDate: '2025-01-15',
      auditScore: 90,
      auditStatus: 'compliant',
      mandatoryTrainings: [
        {
          name: 'Annual Safety Training 2024',
          completionDate: '2024-02-28',
          status: 'completed'
        },
        {
          name: 'Road Safety Awareness',
          completionDate: '2024-04-10',
          status: 'completed'
        }
      ],
      complianceScore: 90,
      complianceRating: 'good',
      criticalAlerts: 0,
      warnings: 1,
      status: 'compliant',
      lastUpdated: '2024-10-17',
      notes: 'Renew Defensive Driving certificate. Good compliance overall.'
    },
    {
      id: 7,
      driverId: 'DRV-007',
      driverName: 'Murugan Subramanian',
      vehicleNumber: 'TN-01-MN-1357',
      vehicleType: '32-Ft Truck',
      employmentDate: '2021-04-30',
      licenseNumber: 'TN-2013-0067890',
      licenseType: 'Heavy Vehicle',
      licenseIssueDate: '2013-08-15',
      licenseExpiryDate: '2025-08-14',
      licenseDaysToExpiry: 297,
      licenseStatus: 'valid',
      medicalCertificate: 'MED-2024-MS-007',
      medicalIssueDate: '2024-05-10',
      medicalExpiryDate: '2025-05-09',
      medicalDaysToExpiry: 200,
      medicalStatus: 'valid',
      policeVerification: 'PV-2024-MS-007',
      policeVerificationDate: '2024-04-20',
      policeVerificationStatus: 'verified',
      backgroundCheck: 'clear',
      backgroundCheckDate: '2024-04-25',
      insurancePolicyNumber: 'INS-DRV-2024-007',
      insuranceExpiryDate: '2025-06-30',
      insuranceDaysToExpiry: 252,
      insuranceStatus: 'active',
      trainingCertificates: [
        {
          name: 'Port Operations Training',
          issueDate: '2024-01-20',
          expiryDate: '2026-01-19',
          status: 'valid'
        },
        {
          name: 'Container Handling',
          issueDate: '2023-10-05',
          expiryDate: '2025-10-04',
          status: 'expiring-soon'
        }
      ],
      hoursOfServiceCompliance: 92,
      restPeriodCompliance: 89,
      speedLimitCompliance: 87,
      vehicleInspectionCompliance: 94,
      totalViolations: 3,
      criticalViolations: 1,
      minorViolations: 2,
      lastViolationDate: '2024-06-20',
      violationDetails: [
        {
          date: '2024-06-20',
          type: 'Accident',
          severity: 'major',
          description: 'Minor collision in port area',
          penalty: 'Fine ₹5000 + Retraining required',
          status: 'resolved'
        },
        {
          date: '2024-07-15',
          type: 'Rest Period Violation',
          severity: 'minor',
          description: 'Insufficient rest period between trips',
          penalty: 'Written warning',
          status: 'resolved'
        },
        {
          date: '2024-05-05',
          type: 'Documentation Error',
          severity: 'minor',
          description: 'Incorrect load documentation',
          penalty: 'Written warning',
          status: 'resolved'
        }
      ],
      lastAuditDate: '2024-08-10',
      nextAuditDate: '2025-02-10',
      auditScore: 78,
      auditStatus: 'conditional',
      mandatoryTrainings: [
        {
          name: 'Annual Safety Training 2024',
          completionDate: '2024-03-01',
          status: 'completed'
        },
        {
          name: 'Road Safety Awareness',
          completionDate: null,
          status: 'pending'
        },
        {
          name: 'Post-Accident Safety Training',
          completionDate: '2024-07-01',
          status: 'completed'
        }
      ],
      complianceScore: 78,
      complianceRating: 'fair',
      criticalAlerts: 1,
      warnings: 3,
      status: 'compliant',
      lastUpdated: '2024-10-16',
      notes: 'Completed post-accident retraining. Monitor closely. Container Handling certificate expiring soon.'
    },
    {
      id: 8,
      driverId: 'DRV-008',
      driverName: 'Bharat Patel',
      vehicleNumber: 'GJ-01-OP-2580',
      vehicleType: '20-Ft Truck',
      employmentDate: '2024-10-01',
      licenseNumber: 'GJ-2019-0078901',
      licenseType: 'Light Commercial Vehicle',
      licenseIssueDate: '2019-06-10',
      licenseExpiryDate: '2025-06-09',
      licenseDaysToExpiry: 231,
      licenseStatus: 'valid',
      medicalCertificate: 'MED-2024-BP-008',
      medicalIssueDate: '2024-09-25',
      medicalExpiryDate: '2025-03-24',
      medicalDaysToExpiry: 154,
      medicalStatus: 'valid',
      policeVerification: 'PV-2024-BP-008',
      policeVerificationDate: '2024-09-20',
      policeVerificationStatus: 'pending',
      backgroundCheck: 'pending',
      backgroundCheckDate: '2024-09-28',
      insurancePolicyNumber: 'INS-DRV-2024-008',
      insuranceExpiryDate: '2024-11-30',
      insuranceDaysToExpiry: 40,
      insuranceStatus: 'expiring-soon',
      trainingCertificates: [
        {
          name: 'Basic Safety Training',
          issueDate: '2024-10-05',
          expiryDate: '2026-10-04',
          status: 'valid'
        }
      ],
      hoursOfServiceCompliance: 85,
      restPeriodCompliance: 82,
      speedLimitCompliance: 78,
      vehicleInspectionCompliance: 88,
      totalViolations: 5,
      criticalViolations: 0,
      minorViolations: 5,
      lastViolationDate: '2024-10-18',
      violationDetails: [
        {
          date: '2024-10-18',
          type: 'Multiple Speeding',
          severity: 'minor',
          description: 'Three speeding violations in one week',
          penalty: 'Fine ₹1500 + Warning',
          status: 'pending'
        },
        {
          date: '2024-10-15',
          type: 'Documentation Missing',
          severity: 'minor',
          description: 'Incomplete pre-trip inspection log',
          penalty: 'Written warning',
          status: 'pending'
        },
        {
          date: '2024-10-12',
          type: 'Late Delivery',
          severity: 'minor',
          description: 'Delayed delivery without notification',
          penalty: 'Written warning',
          status: 'resolved'
        },
        {
          date: '2024-10-08',
          type: 'Customer Complaint',
          severity: 'minor',
          description: 'Unprofessional behavior reported',
          penalty: 'Mandatory counseling',
          status: 'pending'
        },
        {
          date: '2024-10-05',
          type: 'Vehicle Inspection',
          severity: 'minor',
          description: 'Failed to report vehicle damage',
          penalty: 'Written warning',
          status: 'resolved'
        }
      ],
      lastAuditDate: '2024-10-05',
      nextAuditDate: '2024-12-05',
      auditScore: 58,
      auditStatus: 'non-compliant',
      mandatoryTrainings: [
        {
          name: 'Annual Safety Training 2024',
          completionDate: null,
          status: 'overdue'
        },
        {
          name: 'Road Safety Awareness',
          completionDate: null,
          status: 'overdue'
        },
        {
          name: 'Defensive Driving',
          completionDate: null,
          status: 'overdue'
        },
        {
          name: 'Customer Service Training',
          completionDate: null,
          status: 'overdue'
        }
      ],
      complianceScore: 58,
      complianceRating: 'poor',
      criticalAlerts: 5,
      warnings: 6,
      status: 'non-compliant',
      lastUpdated: '2024-10-20',
      notes: 'URGENT: Multiple compliance issues. Insurance expiring very soon. Police verification pending. All mandatory trainings overdue. Performance under review for potential termination.'
    }
  ]);

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
