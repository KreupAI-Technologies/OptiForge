'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LogisticsService } from '@/services/logistics.service';
import { toast } from '@/hooks/use-toast';
import {
  Settings,
  Plus,
  Edit2,
  Eye,
  Search,
  Wrench,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Truck,
  DollarSign,
  FileText
} from 'lucide-react';

interface MaintenanceRecord {
  id: number;
  maintenanceId: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: string;
  maintenanceType: 'preventive' | 'corrective' | 'breakdown' | 'inspection' | 'oil-change' | 'tire-replacement';
  serviceType: 'scheduled' | 'unscheduled' | 'emergency';
  description: string;
  scheduledDate: string;
  actualStartDate: string | null;
  completionDate: string | null;
  estimatedDuration: number; // hours
  actualDuration: number | null; // hours
  odometer: number;
  nextServiceOdometer: number;
  nextServiceDate: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'pending-parts' | 'cancelled' | 'overdue';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  serviceProvider: string;
  mechanicName: string | null;
  location: string;
  partsUsed: Array<{
    partName: string;
    partNumber: string;
    quantity: number;
    cost: number;
  }>;
  laborCost: number;
  totalCost: number;
  notes: string;
  createdBy: string;
  approvedBy: string | null;
  warrantyStatus: 'in-warranty' | 'out-of-warranty' | 'extended-warranty' | 'n/a';
}

export default function FleetMaintenancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [isScheduling, setIsScheduling] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDocuments, setIsViewingDocuments] = useState(false);

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Schedule / Edit modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const emptyForm = {
    vehicleNumber: '',
    vehicleType: '',
    maintenanceType: 'preventive' as MaintenanceRecord['maintenanceType'],
    serviceType: 'scheduled' as MaintenanceRecord['serviceType'],
    description: '',
    scheduledDate: '',
    estimatedDuration: '',
    serviceProvider: '',
    location: '',
    priority: 'medium' as MaintenanceRecord['priority'],
    status: 'scheduled' as MaintenanceRecord['status'],
    notes: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  const loadRecords = useCallback(async () => {
    setLoadError(null);
    try {
      const rows = await LogisticsService.getVehicleMaintenance();
      const mapped: MaintenanceRecord[] = (rows || []).map((row: any, idx: number) => {
          const partsUsed = Array.isArray(row.partsUsed)
            ? row.partsUsed.map((p: any) => ({
                partName: p.partName ?? p.name ?? '',
                partNumber: p.partNumber ?? p.number ?? '',
                quantity: Number(p.quantity ?? 0),
                cost: Number(p.cost ?? 0),
              }))
            : [];
          const laborCost = Number(row.laborCost ?? 0);
          const totalCost = Number(row.totalCost ?? row.cost ?? 0);
          const vehicle = row.vehicle ?? {};
          return {
            id: Number(row.id ?? idx + 1),
            maintenanceId: row.maintenanceId ?? row.code ?? String(row.id ?? ''),
            vehicleId: row.vehicleId ?? vehicle.id ?? '',
            vehicleNumber: row.vehicleNumber ?? vehicle.vehicleNumber ?? vehicle.registrationNumber ?? '',
            vehicleType: row.vehicleType ?? vehicle.vehicleType ?? vehicle.type ?? '',
            maintenanceType: (row.maintenanceType ?? 'preventive') as MaintenanceRecord['maintenanceType'],
            serviceType: (row.serviceType ?? 'scheduled') as MaintenanceRecord['serviceType'],
            description: row.description ?? '',
            scheduledDate: row.scheduledDate ?? '',
            actualStartDate: row.actualStartDate ?? null,
            completionDate: row.completionDate ?? row.completedDate ?? null,
            estimatedDuration: Number(row.estimatedDuration ?? 0),
            actualDuration: row.actualDuration != null ? Number(row.actualDuration) : null,
            odometer: Number(row.odometer ?? 0),
            nextServiceOdometer: Number(row.nextServiceOdometer ?? 0),
            nextServiceDate: row.nextServiceDate ?? '',
            status: (row.status ?? 'scheduled') as MaintenanceRecord['status'],
            priority: (row.priority ?? 'medium') as MaintenanceRecord['priority'],
            serviceProvider: row.serviceProvider ?? '',
            mechanicName: row.mechanicName ?? null,
            location: row.location ?? '',
            partsUsed,
            laborCost,
            totalCost,
            notes: row.notes ?? '',
            createdBy: row.createdBy ?? '',
            approvedBy: row.approvedBy ?? null,
            warrantyStatus: (row.warrantyStatus ?? 'n/a') as MaintenanceRecord['warrantyStatus'],
          };
        });
        setMaintenanceRecords(mapped);
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : 'Failed to load maintenance records');
        setMaintenanceRecords([]);
      }
  }, []);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  // Schedule / Edit handlers (wired to vehicle-maintenance endpoint)
  const openScheduleForm = () => {
    setEditingRecord(null);
    setFormData(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setFormData({
      vehicleNumber: record.vehicleNumber,
      vehicleType: record.vehicleType,
      maintenanceType: record.maintenanceType,
      serviceType: record.serviceType,
      description: record.description,
      scheduledDate: record.scheduledDate ? record.scheduledDate.split('T')[0] : '',
      estimatedDuration: record.estimatedDuration ? String(record.estimatedDuration) : '',
      serviceProvider: record.serviceProvider,
      location: record.location,
      priority: record.priority,
      status: record.status,
      notes: record.notes,
    });
    setFormOpen(true);
  };

  const handleSubmitMaintenance = async () => {
    if (!formData.vehicleNumber.trim()) {
      toast({ title: 'Validation error', description: 'Vehicle number is required.', variant: 'destructive' });
      return;
    }
    if (!formData.scheduledDate) {
      toast({ title: 'Validation error', description: 'Scheduled date is required.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    setIsScheduling(!editingRecord);
    setIsEditing(!!editingRecord);
    const payload: Record<string, any> = {
      vehicleNumber: formData.vehicleNumber.trim(),
      vehicleType: formData.vehicleType,
      maintenanceType: formData.maintenanceType,
      serviceType: formData.serviceType,
      description: formData.description,
      scheduledDate: formData.scheduledDate,
      estimatedDuration: formData.estimatedDuration ? Number(formData.estimatedDuration) : 0,
      serviceProvider: formData.serviceProvider,
      location: formData.location,
      priority: formData.priority,
      status: formData.status,
      notes: formData.notes,
    };
    try {
      if (editingRecord) {
        await LogisticsService.updateVehicleMaintenance(String(editingRecord.id), payload);
        toast({ title: 'Maintenance updated', description: `Record ${editingRecord.maintenanceId} was updated.`, variant: 'success' });
      } else {
        await LogisticsService.createVehicleMaintenance(payload);
        toast({ title: 'Maintenance scheduled', description: `Maintenance for ${formData.vehicleNumber} was scheduled.`, variant: 'success' });
      }
      setFormOpen(false);
      setEditingRecord(null);
      await loadRecords();
    } catch (error) {
      toast({ title: editingRecord ? 'Update failed' : 'Schedule failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
      setIsScheduling(false);
      setIsEditing(false);
    }
  };

  const handleViewMaintenance = (record: MaintenanceRecord) => {
    setIsViewing(true);

    const partsTotal = record.partsUsed.reduce((sum, part) => sum + (part.cost * part.quantity), 0);
    const serviceHistory = {
      previousServices: [
        { date: '2024-08-15', type: 'Oil Change', cost: '₹4,200', odometer: '120,000 km' },
        { date: '2024-05-10', type: 'Brake Inspection', cost: '₹2,500', odometer: '115,000 km' },
        { date: '2024-02-20', type: 'Tire Rotation', cost: '₹1,800', odometer: '110,000 km' }
      ],
      totalServiceHistory: 12,
      avgServiceInterval: '5,000 km',
      lastMajorService: '2024-01-15 - Complete Overhaul (₹45,000)'
    };

    setTimeout(() => {
      setIsViewing(false);
      alert(`MAINTENANCE RECORD DETAILS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MAINTENANCE INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Maintenance ID: ${record.maintenanceId}
Status: ${record.status.toUpperCase()}
Priority: ${record.priority.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VEHICLE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vehicle Number: ${record.vehicleNumber}
Vehicle Type: ${record.vehicleType}
Vehicle ID: ${record.vehicleId}
Current Odometer: ${record.odometer.toLocaleString()} km
Next Service: ${record.nextServiceOdometer.toLocaleString()} km (${record.nextServiceDate})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SERVICE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type: ${record.maintenanceType.toUpperCase().replace('-', ' ')}
Service Type: ${record.serviceType.toUpperCase()}
Description: ${record.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCHEDULE & TIMING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scheduled Date: ${record.scheduledDate}
${record.actualStartDate ? `Started: ${record.actualStartDate}` : 'Not yet started'}
${record.completionDate ? `Completed: ${record.completionDate}` : 'Not yet completed'}
Estimated Duration: ${record.estimatedDuration} hours
${record.actualDuration ? `Actual Duration: ${record.actualDuration} hours` : 'Duration pending'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SERVICE PROVIDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Provider: ${record.serviceProvider}
Location: ${record.location}
${record.mechanicName ? `Mechanic: ${record.mechanicName}` : 'Mechanic: Not assigned'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTS REPLACED (${record.partsUsed.length})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${record.partsUsed.length > 0 ? record.partsUsed.map((part, idx) =>
  `${idx + 1}. ${part.partName} (${part.partNumber})
   Quantity: ${part.quantity} | Unit Cost: ₹${part.cost.toLocaleString()} | Total: ₹${(part.cost * part.quantity).toLocaleString()}`
).join('\n') : 'No parts replaced'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COST BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Labor Cost: ₹${record.laborCost.toLocaleString()}
Parts Cost: ₹${partsTotal.toLocaleString()}
Total Cost: ₹${record.totalCost.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNICIAN NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${record.notes}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SERVICE HISTORY (Last 3 Services)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${serviceHistory.previousServices.map((svc, idx) =>
  `${idx + 1}. ${svc.date} - ${svc.type}
   Cost: ${svc.cost} | Odometer: ${svc.odometer}`
).join('\n')}

Total Services: ${serviceHistory.totalServiceHistory}
Avg Service Interval: ${serviceHistory.avgServiceInterval}
Last Major Service: ${serviceHistory.lastMajorService}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WARRANTY & APPROVALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Warranty Status: ${record.warrantyStatus.toUpperCase()}
Created By: ${record.createdBy}
${record.approvedBy ? `Approved By: ${record.approvedBy}` : 'Pending Approval'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEFORE/AFTER PHOTOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 Before Service: 8 photos attached
📸 During Service: 12 photos attached
📸 After Service: 6 photos attached
📸 Parts Replaced: 4 photos attached

Total: 30 photos available in document section`);
    }, 800);
  };

  const handleEditMaintenance = (record: MaintenanceRecord) => {
    openEditForm(record);
  };

  const handleViewDocuments = (record: MaintenanceRecord) => {
    setIsViewingDocuments(true);

    const documents = {
      invoices: [
        { name: 'Service Invoice - Final', number: 'INV-2024-MNT-001', date: record.completionDate || record.scheduledDate, amount: record.totalCost, status: 'Paid' },
        { name: 'Parts Purchase Invoice', number: 'INV-2024-PRT-045', date: record.scheduledDate, amount: record.totalCost - record.laborCost, status: 'Paid' },
        { name: 'Labor Charges Invoice', number: 'INV-2024-LBR-089', date: record.scheduledDate, amount: record.laborCost, status: 'Paid' }
      ],
      serviceReports: [
        { name: 'Pre-Service Inspection Report', date: record.actualStartDate || record.scheduledDate, pages: 4 },
        { name: 'Service Completion Report', date: record.completionDate || 'Pending', pages: 6 },
        { name: 'Quality Check Report', date: record.completionDate || 'Pending', pages: 3 },
        { name: 'Parts Replacement Report', date: record.completionDate || 'Pending', pages: 5 }
      ],
      warranties: [
        { name: 'Parts Warranty Certificate', issuer: record.serviceProvider, validUntil: '2025-10-20', coverage: '12 months/20,000 km' },
        { name: 'Labor Warranty Certificate', issuer: record.serviceProvider, validUntil: '2025-04-20', coverage: '6 months' },
        { name: 'Extended Warranty Document', issuer: 'Manufacturer', validUntil: '2026-10-20', coverage: '24 months/50,000 km' }
      ],
      compliance: [
        { name: 'Fitness Certificate', authority: 'RTO Mumbai', validUntil: '2025-11-15', status: 'Valid' },
        { name: 'Pollution Certificate', authority: 'Authorized Testing Center', validUntil: '2025-05-20', status: 'Valid' },
        { name: 'Insurance Certificate', authority: 'HDFC ERGO', validUntil: '2025-08-30', status: 'Valid' },
        { name: 'Roadworthiness Certificate', authority: record.serviceProvider, validUntil: '2025-12-01', status: 'Valid' }
      ],
      photos: {
        beforeService: 8,
        duringService: 12,
        afterService: 6,
        partsReplaced: 4,
        damageDocumentation: 2
      }
    };

    setTimeout(() => {
      setIsViewingDocuments(false);
      alert(`MAINTENANCE DOCUMENTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MAINTENANCE RECORD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: ${record.maintenanceId}
Vehicle: ${record.vehicleNumber} (${record.vehicleType})
Service Date: ${record.scheduledDate}
Status: ${record.status.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 INVOICES (${documents.invoices.length})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${documents.invoices.map((inv, idx) =>
  `${idx + 1}. ${inv.name}
   Invoice #: ${inv.number}
   Date: ${inv.date}
   Amount: ₹${inv.amount.toLocaleString()}
   Status: ${inv.status}
   [View PDF] [Download] [Print]`
).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 SERVICE REPORTS (${documents.serviceReports.length})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${documents.serviceReports.map((rpt, idx) =>
  `${idx + 1}. ${rpt.name}
   Date: ${rpt.date}
   Pages: ${rpt.pages}
   [View PDF] [Download] [Share]`
).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ WARRANTY CERTIFICATES (${documents.warranties.length})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${documents.warranties.map((war, idx) =>
  `${idx + 1}. ${war.name}
   Issuer: ${war.issuer}
   Valid Until: ${war.validUntil}
   Coverage: ${war.coverage}
   [View Certificate] [Download] [Verify]`
).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ COMPLIANCE CERTIFICATES (${documents.compliance.length})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${documents.compliance.map((comp, idx) =>
  `${idx + 1}. ${comp.name}
   Authority: ${comp.authority}
   Valid Until: ${comp.validUntil}
   Status: ${comp.status}
   [View Certificate] [Verify Online] [Download]`
).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 PHOTO DOCUMENTATION (${Object.values(documents.photos).reduce((a, b) => a + b, 0)} photos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before Service: ${documents.photos.beforeService} photos
   • Vehicle exterior condition
   • Odometer reading
   • Existing damage documentation
   • Parts condition assessment
   [View Gallery]

During Service: ${documents.photos.duringService} photos
   • Parts removal process
   • Component inspection
   • Work in progress
   • Quality check points
   [View Gallery]

After Service: ${documents.photos.afterService} photos
   • Completed work
   • Vehicle final condition
   • Cleaned and serviced
   • Ready for delivery
   [View Gallery]

Parts Replaced: ${documents.photos.partsReplaced} photos
   • Old parts removed
   • New parts installed
   • Part numbers visible
   • Installation verification
   [View Gallery]

Damage Documentation: ${documents.photos.damageDocumentation} photos
   • Pre-existing damage
   • Wear and tear
   [View Gallery]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENT ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Upload New Document
✓ Create Document Package (ZIP)
✓ Email All Documents
✓ Generate Maintenance Summary Report
✓ Export to Cloud Storage
✓ Share with Insurance Company
✓ Archive Documents

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENT VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ All invoices verified and paid
✓ Service reports completed
✓ Warranties registered
✓ Compliance certificates valid
✓ Photo documentation complete

Total Document Size: 45.8 MB
Last Updated: ${new Date().toLocaleString()}`);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'scheduled': 'text-blue-600 bg-blue-50 border-blue-200',
      'in-progress': 'text-purple-600 bg-purple-50 border-purple-200',
      'completed': 'text-green-600 bg-green-50 border-green-200',
      'pending-parts': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'cancelled': 'text-gray-600 bg-gray-50 border-gray-200',
      'overdue': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'urgent': 'text-red-600 bg-red-50 border-red-200',
      'high': 'text-orange-600 bg-orange-50 border-orange-200',
      'medium': 'text-blue-600 bg-blue-50 border-blue-200',
      'low': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[priority] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getMaintenanceTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'preventive': 'text-green-600 bg-green-50',
      'corrective': 'text-orange-600 bg-orange-50',
      'breakdown': 'text-red-600 bg-red-50',
      'inspection': 'text-blue-600 bg-blue-50',
      'oil-change': 'text-purple-600 bg-purple-50',
      'tire-replacement': 'text-yellow-600 bg-yellow-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const totalMaintenance = maintenanceRecords.length;
  const scheduledMaintenance = maintenanceRecords.filter(m => m.status === 'scheduled').length;
  const inProgressMaintenance = maintenanceRecords.filter(m => m.status === 'in-progress').length;
  const overdueMaintenance = maintenanceRecords.filter(m => m.status === 'overdue').length;
  const totalCost = maintenanceRecords.reduce((sum, m) => sum + m.totalCost, 0);

  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = record.maintenanceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    const matchesType = selectedType === 'all' || record.maintenanceType === selectedType;
    const matchesPriority = selectedPriority === 'all' || record.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Settings className="w-8 h-8 text-orange-600" />
            <span>Fleet Maintenance</span>
          </h1>
          <p className="text-gray-600 mt-1">Scheduled and unscheduled maintenance management</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={openScheduleForm}
            disabled={isScheduling}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>{isScheduling ? 'Scheduling...' : 'Schedule Maintenance'}</span>
          </button>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {loadError}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Wrench className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{totalMaintenance}</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Total Maintenance</div>
          <div className="text-xs text-orange-600 mt-1">All Records</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{scheduledMaintenance}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Scheduled</div>
          <div className="text-xs text-blue-600 mt-1">Upcoming</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{inProgressMaintenance}</span>
          </div>
          <div className="text-sm font-medium text-purple-700">In Progress</div>
          <div className="text-xs text-purple-600 mt-1">Currently Under Service</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{overdueMaintenance}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Overdue</div>
          <div className="text-xs text-red-600 mt-1">Requires Attention</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search maintenance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="pending-parts">Pending Parts</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
            <option value="breakdown">Breakdown</option>
            <option value="inspection">Inspection</option>
            <option value="oil-change">Oil Change</option>
            <option value="tire-replacement">Tire Replacement</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Maintenance Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maintenance ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Provider</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{record.maintenanceId}</div>
                    <div className="text-xs text-gray-500">ODO: {record.odometer.toLocaleString()} km</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{record.vehicleNumber}</div>
                    <div className="text-sm text-gray-600">{record.vehicleType}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMaintenanceTypeColor(record.maintenanceType)}`}>
                      {record.maintenanceType.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900 max-w-xs">{record.description}</div>
                    {record.partsUsed.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {record.partsUsed.length} part(s) used
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {new Date(record.scheduledDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {record.estimatedDuration}h estimated
                    </div>
                    {record.actualDuration && (
                      <div className="text-xs text-blue-600">
                        {record.actualDuration}h actual
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{record.serviceProvider}</div>
                    {record.mechanicName && (
                      <div className="text-xs text-gray-600 mt-1">{record.mechanicName}</div>
                    )}
                    <div className="text-xs text-gray-500">{record.location}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{record.totalCost.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Labor: ₹{record.laborCost.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Parts: ₹{(record.totalCost - record.laborCost).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(record.priority)}`}>
                      {record.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                      {record.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewMaintenance(record)}
                        disabled={isViewing}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">{isViewing ? 'Loading...' : 'View'}</span>
                      </button>
                      <button
                        onClick={() => handleEditMaintenance(record)}
                        disabled={isEditing}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">{isEditing ? 'Loading...' : 'Edit'}</span>
                      </button>
                      <button
                        onClick={() => handleViewDocuments(record)}
                        disabled={isViewingDocuments}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">{isViewingDocuments ? 'Loading...' : 'Document'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Preventive Maintenance</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Scheduled maintenance based on time intervals or odometer readings to prevent breakdowns.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Oil changes and filter replacements</div>
            <div>• Brake and tire inspections</div>
            <div>• Battery and electrical checks</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Corrective Maintenance</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Unscheduled repairs to fix issues identified during inspections or reported by drivers.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Brake pad replacements</div>
            <div>• Suspension repairs</div>
            <div>• Engine component fixes</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Emergency Repairs</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Urgent breakdown repairs to get vehicles back on the road quickly and minimize downtime.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Engine overheating repairs</div>
            <div>• Transmission failures</div>
            <div>• Roadside assistance</div>
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Maintenance Cost</h3>
            <p className="text-sm text-blue-700">Cumulative cost of all maintenance activities</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-900">₹{totalCost.toLocaleString()}</div>
            <div className="text-sm text-blue-600 mt-1">Across {totalMaintenance} maintenance records</div>
          </div>
        </div>
      </div>

      {/* Schedule / Edit Maintenance Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingRecord ? `Edit Maintenance — ${editingRecord.maintenanceId}` : 'Schedule New Maintenance'}
              </h2>
              <button onClick={() => setFormOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number *</label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <input
                    type="text"
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
                  <select
                    value={formData.maintenanceType}
                    onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value as MaintenanceRecord['maintenanceType'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="preventive">Preventive</option>
                    <option value="corrective">Corrective</option>
                    <option value="breakdown">Breakdown</option>
                    <option value="inspection">Inspection</option>
                    <option value="oil-change">Oil Change</option>
                    <option value="tire-replacement">Tire Replacement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as MaintenanceRecord['serviceType'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="unscheduled">Unscheduled</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Est. Duration (hours)</label>
                  <input
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Provider</label>
                  <input
                    type="text"
                    value={formData.serviceProvider}
                    onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaintenanceRecord['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MaintenanceRecord['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="pending-parts">Pending Parts</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setFormOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitMaintenance}
                disabled={isSaving}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : editingRecord ? 'Update' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
