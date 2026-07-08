'use client';

import { useState, useEffect, useRef } from 'react';
import { Plane, MapPin, Calendar, IndianRupee, Users, Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/hooks/use-toast';
import { HrSelfServiceService } from '@/services/hr-self-service.service';
import { HrExpensesService } from '@/services/hr-expenses.service';

interface TravelRequest {
  id: string;
  requestNumber: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  travelType: 'domestic' | 'international';
  purpose: string;
  fromLocation: string;
  toLocation: string;
  startDate: string;
  endDate: string;
  duration: number;
  estimatedCost: number;
  transportMode: 'flight' | 'train' | 'bus' | 'car' | 'multiple';
  accommodation: boolean;
  advanceRequired: boolean;
  advanceAmount?: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedDate?: string;
  approver?: string;
  approvedDate?: string;
  rejectionReason?: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = await HrSelfServiceService.getTravelRequests();
      const mapped: TravelRequest[] = raw.map((r) => ({
        id: r.id,
        requestNumber: r.requestNumber ?? '',
        employeeCode: r.employeeCode ?? '',
        employeeName: r.employeeName ?? '',
        department: r.department ?? '',
        designation: r.designation ?? '',
        travelType: (r.travelType as TravelRequest['travelType']) ?? 'domestic',
        purpose: r.purpose ?? '',
        fromLocation: r.fromLocation ?? '',
        toLocation: r.toLocation ?? '',
        startDate: r.startDate ?? '',
        endDate: r.endDate ?? '',
        duration: Number(r.duration ?? 0),
        estimatedCost: Number(r.estimatedCost ?? 0),
        transportMode: 'flight',
        accommodation: false,
        advanceRequired: Number(r.advanceAmount ?? 0) > 0,
        advanceAmount: r.advanceAmount != null ? Number(r.advanceAmount) : undefined,
        status: (r.status as TravelRequest['status']) ?? 'pending',
        submittedDate: r.submittedDate ?? undefined,
        approver: r.approver ?? undefined,
        approvedDate: r.approvedDate ?? undefined,
        rejectionReason: r.rejectionReason ?? undefined,
      }));
      setRequests(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load travel requests');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitRequest = async () => {
    const fd = formRef.current ? new FormData(formRef.current) : null;
    const val = (k: string) => (fd?.get(k)?.toString() ?? '');
    setSaving(true);
    setSaveError(null);
    try {
      await HrExpensesService.createTravelRequest({
        travelType: val('travelType') || 'domestic',
        purpose: val('purpose'),
        fromLocation: val('fromLocation'),
        toLocation: val('toLocation'),
        startDate: val('startDate'),
        endDate: val('endDate'),
        estimatedCost: Number(val('estimatedCost') || 0),
        advanceAmount: Number(val('advanceAmount') || 0),
        status: 'pending',
        submittedDate: new Date().toISOString().split('T')[0],
      });
      toast({ title: 'Request Submitted', description: 'Your travel request has been submitted for approval' });
      setShowAddModal(false);
      formRef.current?.reset();
      await load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to submit request.');
    } finally {
      setSaving(false);
    }
  };

  const filteredRequests = requests.filter(r =>
    selectedStatus === 'all' || r.status === selectedStatus
  );

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    totalBudget: requests.filter(r => r.status !== 'rejected').reduce((sum, r) => sum + r.estimatedCost, 0)
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-orange-100 text-orange-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Travel Requests</h1>
        <p className="text-sm text-gray-600 mt-1">Submit and track business travel requests</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading travel requests…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Requests</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <Plane className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Budget</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">₹{(stats.totalBudget / 100000).toFixed(1)}L</p>
            </div>
            <IndianRupee className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            New Request
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRequests.map(request => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{request.requestNumber}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    request.travelType === 'domestic' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {request.travelType.charAt(0).toUpperCase() + request.travelType.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{request.employeeName} • {request.designation} • {request.department}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">₹{request.estimatedCost.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500">{request.duration} days</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Purpose</p>
              <p className="text-sm font-semibold text-gray-900">{request.purpose}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Route</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">{request.fromLocation}</p>
                    <p className="text-gray-600">to {request.toLocation}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Travel Dates</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">{request.startDate}</p>
                    <p className="text-gray-600">to {request.endDate}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Transport & Stay</p>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 capitalize">{request.transportMode}</p>
                  <p className="text-gray-600">{request.accommodation ? 'Accommodation: Yes' : 'No accommodation'}</p>
                </div>
              </div>
            </div>

            {request.advanceRequired && request.advanceAmount && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">
                    Advance Required: ₹{request.advanceAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            {request.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-red-600 uppercase font-medium mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-900">{request.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {request.submittedDate && (
                  <span>Submitted: {request.submittedDate}</span>
                )}
                {request.approver && (
                  <span className="ml-4">Approver: {request.approver}</span>
                )}
              </div>
              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && !isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <EmptyState
            icon={Plane}
            title="No travel requests found"
            description="No business travel requests have been submitted yet. Create a new request to get started."
            action={{ label: 'New Request', onClick: () => setShowAddModal(true) }}
          />
        </div>
      ) : filteredRequests.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Plane className="h-12 w-12 text-gray-400 mb-2 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No travel requests found</h3>
          <p className="text-gray-600">No requests match the selected filter</p>
        </div>
      )}

      {/* New Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">New Travel Request</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {saveError && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div>
              )}
              <form ref={formRef} className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleSubmitRequest(); }}>
                {/* Travel Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Travel Type</label>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="travelType" value="domestic" defaultChecked className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">Domestic</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="travelType" value="international" className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">International</span>
                    </label>
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose of Travel</label>
                  <textarea
                    name="purpose"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe the purpose of your travel..."
                  />
                </div>

                {/* Locations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">From Location</label>
                    <input
                      name="fromLocation"
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Starting location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">To Location</label>
                    <input
                      name="toLocation"
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Destination"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                    <input
                      name="startDate"
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                    <input
                      name="endDate"
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Transport Mode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Transport Mode</label>
                  <select name="transportMode" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="flight">Flight</option>
                    <option value="train">Train</option>
                    <option value="bus">Bus</option>
                    <option value="car">Car</option>
                    <option value="multiple">Multiple Modes</option>
                  </select>
                </div>

                {/* Estimated Cost */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Cost (₹)</label>
                  <input
                    name="estimatedCost"
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                {/* Additional Options */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input name="accommodation" type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">Accommodation Required</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input name="advanceRequired" type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">Advance Required</span>
                  </label>
                </div>

                {/* Advance Amount (conditional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Advance Amount (₹)</label>
                  <input
                    name="advanceAmount"
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    name="notes"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any additional information..."
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={saving}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
              >
                {saving ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
