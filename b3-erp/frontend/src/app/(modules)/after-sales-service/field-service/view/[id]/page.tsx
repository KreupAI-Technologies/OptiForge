'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import {
  MapPin,
  User,
  Clock,
  CheckCircle2,
  Package,
  FileText,
  Navigation,
  Phone,
  AlertCircle
} from 'lucide-react';

export default function ViewFieldServicePage({ params }: { params: { id: string } }) {
  const router = useRouter();

  // Fallback field service data (defaults so every field the JSX reads is defined)
  const FALLBACK = {
    id: params.id,
    jobNumber: 'FS-2025-0045',
    status: 'On Site',
    jobType: 'Service Request',
    priority: 'P1',

    // Customer
    customer: {
      name: 'Sharma Kitchens Pvt Ltd',
      contactPerson: 'Rajesh Sharma',
      phone: '+91-98765-43210',
      address: '123, MG Road, Koramangala, Bangalore - 560034'
    },

    // Schedule
    scheduledTime: '09:30',
    duration: 2,
    checkInTime: '09:35',
    estimatedCompletion: '11:35',

    // Engineer
    engineer: {
      name: 'Rajesh Kumar',
      phone: '+91-98765-11111',
      status: 'On Job',
      currentLocation: 'On site'
    },

    // Issue
    issueTitle: 'Refrigerator cooling failure',
    issueDescription: 'Commercial refrigerator not maintaining temperature. Urgent repair needed.',

    // Progress
    progress: 60,
    checklistItems: [
      { id: 1, task: 'Arrived at site', status: 'Completed', time: '09:35' },
      { id: 2, task: 'Diagnosis completed', status: 'Completed', time: '09:50' },
      { id: 3, task: 'Parts identified', status: 'Completed', time: '10:00' },
      { id: 4, task: 'Repair in progress', status: 'In Progress', time: null },
      { id: 5, task: 'Testing', status: 'Pending', time: null },
      { id: 6, task: 'Customer sign-off', status: 'Pending', time: null }
    ],

    // Parts used
    partsUsed: [
      { name: 'Compressor Motor', quantity: 1, serialNumber: 'CM-2025-789' },
      { name: 'Thermostat', quantity: 1, serialNumber: 'TH-2025-456' }
    ],

    // Related
    relatedTicket: 'SR-2025-0045',
    relatedContract: 'AMC-2025-0001'
  };

  const [fieldJob, setFieldJob] = useState(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await AfterSalesPagesService.fieldJob(String(params.id));
        if (!cancelled && data && typeof data === 'object') {
          setFieldJob(prev => ({ ...prev, ...data }));
        }
      } catch {
        // keep fallback on error
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned': return 'bg-gray-100 text-gray-700';
      case 'Dispatched': return 'bg-blue-100 text-blue-700';
      case 'In Transit': return 'bg-purple-100 text-purple-700';
      case 'On Site': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{fieldJob.jobNumber}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(fieldJob.status)}`}>
              {fieldJob.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {fieldJob.jobType} • Check-in: {fieldJob.checkInTime} • ETA: {fieldJob.estimatedCompletion}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Job Progress</span>
          <span className="text-sm font-bold text-gray-900">{fieldJob.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-yellow-600 h-3 rounded-full"
            style={{ width: `${fieldJob.progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Customer & Location */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer & Location</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Customer</div>
              <div className="font-medium text-gray-900">{fieldJob.customer.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Contact Person</div>
              <div className="text-gray-900">{fieldJob.customer.contactPerson}</div>
              <div className="text-sm text-gray-600">{fieldJob.customer.phone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Address</div>
              <div className="text-gray-900">{fieldJob.customer.address}</div>
            </div>
          </div>
        </div>

        {/* Engineer Info */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Field Engineer</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Engineer</div>
              <div className="font-medium text-gray-900">{fieldJob.engineer.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Contact</div>
              <div className="text-gray-900">{fieldJob.engineer.phone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                {fieldJob.engineer.status}
              </span>
            </div>
            <div>
              <div className="text-sm text-gray-500">Current Location</div>
              <div className="text-gray-900">{fieldJob.engineer.currentLocation}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Details */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Issue Details</h2>
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">{fieldJob.issueTitle}</div>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{fieldJob.issueDescription}</div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Job Checklist</h2>
        <div className="space-y-3">
          {fieldJob.checklistItems.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {item.status === 'Completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : item.status === 'In Progress' ? (
                  <Clock className="w-5 h-5 text-yellow-600" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm text-gray-900">{item.task}</span>
              </div>
              {item.time && (
                <span className="text-xs text-gray-500">{item.time}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Parts Used */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Parts Used</h2>
        <div className="space-y-2">
          {fieldJob.partsUsed.map((part, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">{part.name}</span>
              </div>
              <div className="text-sm text-gray-600">
                Qty: {part.quantity} • SN: {part.serialNumber}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
