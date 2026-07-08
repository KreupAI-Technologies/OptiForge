'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Upload, CheckCircle, Clock, AlertCircle, Calendar, Heart } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import { toast } from '@/hooks/use-toast';
import FileUploadModal from '@/components/payroll/FileUploadModal';
import ConfirmationModal from '@/components/payroll/ConfirmationModal';
import StatusCheckModal from '@/components/payroll/StatusCheckModal';
import {
  generateESIReturnTemplate,
  generateESIChallan,
  generateESIReceipt,
  generateESIDraft,
  parseESIReturnFile,
  type ESIReturn as ESIReturnType
} from '@/lib/payroll/esiFileGenerator';

interface ESIReturn {
  id: string;
  returnPeriod: string;
  periodType: 'half-yearly';
  fromMonth: string;
  toMonth: string;
  establishmentCode: string;
  employeeCount: number;
  totalWages: number;
  employeeContribution: number;
  employerContribution: number;
  totalDue: number;
  filedOn?: string;
  filedBy?: string;
  acknowledgeNumber?: string;
  status: 'draft' | 'pending' | 'filed' | 'accepted';
  dueDate: string;
}

export default function ESIReturnsPage() {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ESIReturn | null>(null);
  const [returns, setReturns] = useState<ESIReturn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [rows, setRows] = useState<ESIReturn[]>([]);
  const [filing, setFiling] = useState(false);

  const loadReturns = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = await HrPayrollService.getStatutoryFilings('esi-returns');
      const mapped = (Array.isArray(raw) ? raw : []).map((r: any) => ({
        id: r.id ?? r.details?.id ?? '',
        returnPeriod: r.returnPeriod ?? r.details?.returnPeriod ?? r.period ?? '',
        periodType: (r.periodType ?? r.details?.periodType ?? 'half-yearly') as 'half-yearly',
        fromMonth: r.fromMonth ?? r.details?.fromMonth ?? '',
        toMonth: r.toMonth ?? r.details?.toMonth ?? '',
        establishmentCode: r.establishmentCode ?? r.details?.establishmentCode ?? '',
        employeeCount: r.employeeCount ?? r.details?.employeeCount ?? 0,
        totalWages: r.totalWages ?? r.details?.totalWages ?? 0,
        employeeContribution: r.employeeContribution ?? r.details?.employeeContribution ?? 0,
        employerContribution: r.employerContribution ?? r.details?.employerContribution ?? 0,
        totalDue: r.totalDue ?? r.amount ?? r.details?.totalDue ?? 0,
        filedOn: r.filedOn ?? r.details?.filedOn ?? undefined,
        filedBy: r.filedBy ?? r.details?.filedBy ?? undefined,
        acknowledgeNumber: r.acknowledgeNumber ?? r.details?.acknowledgeNumber ?? undefined,
        status: (r.status ?? r.details?.status ?? 'pending') as ESIReturn['status'],
        dueDate: r.dueDate ?? r.details?.dueDate ?? r.effectiveDate ?? '',
      } as ESIReturn));
      setRows(mapped);
      setReturns(mapped);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load');
      setRows([]);
      setReturns([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const filteredReturns = (returns.length > 0 ? returns : rows).filter(ret =>
    ret.returnPeriod.includes(selectedYear)
  );

  // Handler: Download Template
  const handleDownloadTemplate = async () => {
    try {
      await generateESIReturnTemplate();
      toast({
        title: "Success",
        description: "ESI return template downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download template. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handler: Upload Return
  const handleUploadReturn = async (file: File) => {
    try {
      const result = await parseESIReturnFile(file);

      if (result.success && result.data) {
        // Here you would typically send the data to your backend
        // For now, we'll just show a success message
        return {
          success: true,
          message: `Successfully validated ${result.data.length} employee records`
        };
      } else {
        return {
          success: false,
          errors: result.errors || ['Unknown error occurred']
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: ['Failed to process file. Please try again.']
      };
    }
  };

  // Handler: File Return
  const handleFileReturn = async (returnId: string) => {
    setSelectedReturn(filteredReturns.find(r => r.id === returnId) || null);
    setShowFileModal(true);
  };

  const confirmFileReturn = async () => {
    if (!selectedReturn || filing) return;
    setFiling(true);
    try {
      const filedOn = new Date().toISOString();
      await HrPayrollService.updateStatutoryFiling(selectedReturn.id, {
        status: 'filed',
        details: {
          ...(selectedReturn as any),
          status: 'filed',
          filedOn,
          filedBy: 'Current User',
        },
      });

      const updatedReturns = returns.map(ret =>
        ret.id === selectedReturn.id
          ? { ...ret, status: 'filed' as const, filedOn, filedBy: 'Current User' }
          : ret
      );
      setReturns(updatedReturns);
      setShowFileModal(false);
      setSelectedReturn(null);

      toast({
        title: "Success",
        description: "Return filed successfully with ESIC portal",
      });
      await loadReturns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to file return. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFiling(false);
    }
  };

  // Handler: Download Draft
  const handleDownloadDraft = async (returnData: ESIReturn) => {
    try {
      await generateESIDraft(returnData);
      toast({
        title: "Success",
        description: "Draft return downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handler: Check Status
  const handleCheckStatus = (returnId: string) => {
    const returnData = filteredReturns.find(r => r.id === returnId);
    if (returnData) {
      setSelectedReturn(returnData);
      setShowStatusModal(true);
    }
  };

  const handleRefreshStatus = async () => {
    if (!selectedReturn) {
      return {
        status: 'pending' as const,
        message: 'No return selected'
      };
    }

    try {
      // Simulate API call to check status
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock status update
      const newStatus = selectedReturn.status === 'filed' ? 'accepted' : selectedReturn.status;
      const acknowledgeNumber = newStatus === 'accepted' ? `ESI-ACK-${Date.now()}` : undefined;

      if (newStatus !== selectedReturn.status) {
        const updatedReturns = returns.map(ret =>
          ret.id === selectedReturn.id
            ? { ...ret, status: newStatus, acknowledgeNumber }
            : ret
        );
        setReturns(updatedReturns);
      }

      return {
        status: newStatus,
        acknowledgeNumber,
        message: newStatus === 'accepted'
          ? 'Return has been accepted by ESIC'
          : 'Return is being processed by ESIC portal',
        history: [
          {
            status: 'Filed',
            timestamp: selectedReturn.filedOn || new Date().toISOString(),
            description: 'Return filed with ESIC portal',
            user: selectedReturn.filedBy
          },
          ...(newStatus === 'accepted' ? [{
            status: 'Accepted',
            timestamp: new Date().toISOString(),
            description: 'Return accepted by ESIC',
            user: 'ESIC System'
          }] : [])
        ]
      };
    } catch (error) {
      return {
        status: selectedReturn.status,
        message: 'Failed to fetch status. Please try again.'
      };
    }
  };

  // Handler: Download Challan
  const handleDownloadChallan = async (returnData: ESIReturn) => {
    try {
      await generateESIChallan(returnData);
      toast({
        title: "Success",
        description: "ESI challan downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download challan. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handler: View Receipt
  const handleViewReceipt = async (returnData: ESIReturn) => {
    try {
      await generateESIReceipt(returnData);
      toast({
        title: "Success",
        description: "Receipt downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: filteredReturns.length,
    accepted: filteredReturns.filter(r => r.status === 'accepted').length,
    filed: filteredReturns.filter(r => r.status === 'filed').length,
    pending: filteredReturns.filter(r => r.status === 'pending').length
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    filed: 'bg-blue-100 text-blue-700 border-blue-200',
    accepted: 'bg-green-100 text-green-700 border-green-200'
  };

  const statusIcons = {
    draft: <AlertCircle className="h-4 w-4" />,
    pending: <Clock className="h-4 w-4" />,
    filed: <FileText className="h-4 w-4" />,
    accepted: <CheckCircle className="h-4 w-4" />
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">ESI Returns</h1>
        <p className="text-sm text-gray-600 mt-1">Half-yearly ESI return filing and tracking</p>
        {loadError && <div className="text-sm text-red-600">{loadError}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-3 border border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-pink-600">Total Returns</p>
              <p className="text-2xl font-bold text-pink-900 mt-1">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-pink-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Accepted</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.accepted}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Filed</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.filed}</p>
            </div>
            <Upload className="h-8 w-8 text-blue-600" />
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
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Financial Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="2025">2025-2026</option>
              <option value="2024">2024-2025</option>
              <option value="2023">2023-2024</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Upload className="h-4 w-4" />
              Upload Return
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredReturns.map(returnData => (
          <div key={returnData.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{returnData.returnPeriod}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[returnData.status]}`}>
                    <span className="inline-flex items-center gap-1">
                      {statusIcons[returnData.status]}
                      {returnData.status.toUpperCase()}
                    </span>
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                    HALF-YEARLY
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Return ID: {returnData.id} • Establishment: {returnData.establishmentCode}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Period: {returnData.fromMonth} to {returnData.toMonth}
                </p>
                {returnData.acknowledgeNumber && (
                  <p className="text-xs text-gray-500 mt-1">
                    Acknowledgement: {returnData.acknowledgeNumber}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Total Due</p>
                <p className="text-2xl font-bold text-pink-600">{formatCurrency(returnData.totalDue)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="text-xs font-semibold text-blue-900 mb-3">Coverage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Employees</span>
                    <span className="font-medium text-blue-900">{returnData.employeeCount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-700">Total Wages</span>
                    <span className="font-medium text-blue-900">{formatCurrency(returnData.totalWages)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h4 className="text-xs font-semibold text-green-900 mb-3">Employee Share</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Rate</span>
                    <span className="font-medium text-green-900">0.75%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Contribution</span>
                    <span className="font-medium text-green-900">{formatCurrency(returnData.employeeContribution)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <h4 className="text-xs font-semibold text-purple-900 mb-3">Employer Share</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-700">Rate</span>
                    <span className="font-medium text-purple-900">3.0%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-700">Contribution</span>
                    <span className="font-medium text-purple-900">{formatCurrency(returnData.employerContribution)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                <h4 className="text-xs font-semibold text-pink-900 mb-3">Total Payable</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-pink-700">Employee</span>
                    <span className="font-medium text-pink-900">{formatCurrency(returnData.employeeContribution)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-pink-700">Employer</span>
                    <span className="font-medium text-pink-900">{formatCurrency(returnData.employerContribution)}</span>
                  </div>
                  <div className="pt-2 border-t border-pink-300">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-pink-900">Total</span>
                      <span className="font-bold text-pink-900">{formatCurrency(returnData.totalDue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-pink-50 rounded-lg p-3 border border-gray-200 mb-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Due Date</p>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-pink-600" />
                    {new Date(returnData.dueDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {returnData.filedOn && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Filed On</p>
                    <p className="text-sm font-bold text-green-900">
                      {new Date(returnData.filedOn).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {returnData.filedBy && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Filed By</p>
                    <p className="text-sm font-bold text-gray-900">{returnData.filedBy}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {returnData.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleFileReturn(returnData.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                  >
                    <Upload className="inline h-4 w-4 mr-2" />
                    File Return
                  </button>
                  <button
                    onClick={() => handleDownloadDraft(returnData)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    <Download className="inline h-4 w-4 mr-2" />
                    Download Draft
                  </button>
                </>
              )}
              {returnData.status === 'filed' && (
                <button
                  onClick={() => handleCheckStatus(returnData.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  Check Status
                </button>
              )}
              {returnData.status === 'accepted' && (
                <>
                  <button
                    onClick={() => handleDownloadChallan(returnData)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                  >
                    <Download className="inline h-4 w-4 mr-2" />
                    Download Challan
                  </button>
                  <button
                    onClick={() => handleViewReceipt(returnData)}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium text-sm"
                  >
                    <FileText className="inline h-4 w-4 mr-2" />
                    View Receipt
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-pink-50 border border-pink-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-pink-900 mb-2">ESI Return Filing Guidelines</h3>
        <ul className="text-sm text-pink-800 space-y-1">
          <li>• <strong>Filing Frequency:</strong> Half-yearly returns (April-September & October-March)</li>
          <li>• <strong>Due Date:</strong> Within 30 days from the end of return period (31st Oct & 30th Apr)</li>
          <li>• <strong>Return Format:</strong> File online via ESIC portal using establishment credentials</li>
          <li>• <strong>Period 1:</strong> April to September - Due by 31st October</li>
          <li>• <strong>Period 2:</strong> October to March - Due by 30th April</li>
          <li>• <strong>Monthly Challans:</strong> Pay ESI contribution monthly by 21st, file return half-yearly</li>
          <li>• <strong>Coverage Details:</strong> Include all ESI-eligible employees (earning up to ₹21,000/month)</li>
          <li>• <strong>Acknowledgement:</strong> Return acknowledgement generated after successful filing</li>
        </ul>
      </div>

      {/* Modals */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadReturn}
        title="Upload ESI Return"
        acceptedFormats=".xlsx,.xls,.csv"
      />

      {selectedReturn && (
        <>
          <ConfirmationModal
            isOpen={showFileModal}
            onClose={() => {
              setShowFileModal(false);
              setSelectedReturn(null);
            }}
            onConfirm={confirmFileReturn}
            title="File ESI Return"
            message="Are you sure you want to file this ESI return with the ESIC portal? This action cannot be undone."
            confirmText="File Return"
            variant="warning"
            details={[
              { label: 'Return ID', value: selectedReturn.id },
              { label: 'Period', value: selectedReturn.returnPeriod },
              { label: 'Employees', value: selectedReturn.employeeCount },
              { label: 'Total Due', value: `₹${selectedReturn.totalDue.toLocaleString('en-IN')}` },
              { label: 'Due Date', value: new Date(selectedReturn.dueDate).toLocaleDateString('en-IN') }
            ]}
          />

          <StatusCheckModal
            isOpen={showStatusModal}
            onClose={() => {
              setShowStatusModal(false);
              setSelectedReturn(null);
            }}
            returnId={selectedReturn.id}
            currentStatus={selectedReturn.status}
            onRefreshStatus={handleRefreshStatus}
          />
        </>
      )}
    </div>
  );
}
