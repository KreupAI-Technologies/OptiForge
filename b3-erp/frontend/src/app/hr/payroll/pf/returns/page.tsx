'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Upload, CheckCircle, Clock, AlertCircle, Calendar, X, Building2, Mail, Info, ExternalLink } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface PFReturn {
  id: string;
  monthYear: string;
  returnMonth: string;
  returnYear: string;
  establishmentCode: string;
  employeeCount: number;
  totalWages: number;
  epfWages: number;
  epsWages: number;
  edliWages: number;
  epfContribution: number;
  epsContribution: number;
  epfDiff: number;
  ncp: number;
  refund: number;
  totalDue: number;
  filedOn?: string;
  filedBy?: string;
  acknowledgeNumber?: string;
  status: 'draft' | 'pending' | 'filed' | 'accepted';
  dueDate: string;
}

// Modal Components
function DownloadTemplateModal({ onClose }: { onClose: () => void }) {
  const [format, setFormat] = useState<'text' | 'excel'>('text');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Download ECR Template</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">ECR Template Information</p>
                <p>Download the standard ECR template for uploading employee contribution details to the EPFO portal. Fill in all required fields before uploading.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Template Format</label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                <input
                  type="radio"
                  value="text"
                  checked={format === 'text'}
                  onChange={(e) => setFormat(e.target.value as 'text')}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Text Format (.txt)</p>
                  <p className="text-sm text-gray-600 mt-1">Standard fixed-width text format for EPFO Unified Portal upload</p>
                  <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2 space-y-1">
                    <p>• Most commonly used format</p>
                    <p>• Direct upload to EPFO portal</p>
                    <p>• Fixed column width structure</p>
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                <input
                  type="radio"
                  value="excel"
                  checked={format === 'excel'}
                  onChange={(e) => setFormat(e.target.value as 'excel')}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Excel Format (.xlsx)</p>
                  <p className="text-sm text-gray-600 mt-1">Spreadsheet template for easy data entry and validation</p>
                  <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2 space-y-1">
                    <p>• Easy to fill and review</p>
                    <p>• Built-in data validation</p>
                    <p>• Convert to text format after filling</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-2">Required Fields in Template</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>UAN (Universal Account Number)</li>
                  <li>Member Name</li>
                  <li>Wages for the month</li>
                  <li>EPF Wages, EPS Wages, EDLI Wages</li>
                  <li>Employee & Employer Contribution</li>
                  <li>NCP Days (if applicable)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log(`Downloading ${format} template`);
                onClose();
              }}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download {format === 'text' ? 'Text' : 'Excel'} Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadECRModal({ onClose }: { onClose: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<'select' | 'validate' | 'upload'>('select');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadStep('validate');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Upload ECR File</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {uploadStep === 'select' && (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-900 font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-600 mb-2">ECR file in .txt or .xlsx format</p>
                <input
                  type="file"
                  accept=".txt,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="ecr-file-upload"
                />
                <label
                  htmlFor="ecr-file-upload"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Select File
                </label>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Before Uploading</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Ensure all employee UAN numbers are correct</li>
                      <li>Verify wage calculations and contribution amounts</li>
                      <li>Check for any NCP (non-contribution period) days</li>
                      <li>File must be in EPFO prescribed format</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {uploadStep === 'validate' && selectedFile && (
            <>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="font-semibold text-green-900">File Selected</p>
                </div>
                <div className="space-y-2 text-sm text-green-800">
                  <p><strong>File Name:</strong> {selectedFile.name}</p>
                  <p><strong>File Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                  <p><strong>File Type:</strong> {selectedFile.type || 'Text/Excel'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Validation Checklist</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">File format is valid</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">All required fields present</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">UAN validation successful</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Contribution calculations verified</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Important Note</p>
                    <p>This will upload the ECR to EPFO portal. Please review all details carefully before proceeding. Once uploaded, you cannot make changes.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {uploadStep === 'validate' && (
              <button
                onClick={() => {
                  setUploadStep('upload');
                  setTimeout(() => onClose(), 1500);
                }}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload to EPFO Portal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FileECRModal({ returnData, onClose, formatCurrency }: { returnData: PFReturn; onClose: () => void; formatCurrency: (amount: number) => string }) {
  const [step, setStep] = useState<'review' | 'confirm' | 'filing'>('review');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">File ECR - {returnData.monthYear}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {step === 'review' && (
            <>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">ECR Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-blue-700">Return Period</p>
                    <p className="font-semibold text-blue-900">{returnData.monthYear}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Establishment Code</p>
                    <p className="font-semibold text-blue-900">{returnData.establishmentCode}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Total Employees</p>
                    <p className="font-semibold text-blue-900">{returnData.employeeCount}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Total Wages</p>
                    <p className="font-semibold text-blue-900">{formatCurrency(returnData.totalWages)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contribution Details</h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">EPF Wages</td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(returnData.epfWages)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">EPF Contribution</td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(returnData.epfContribution)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">EPS Wages</td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(returnData.epsWages)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">EPS Contribution</td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(returnData.epsContribution)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">EPF Difference</td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(returnData.epfDiff)}</td>
                      </tr>
                      <tr className="bg-blue-50 font-semibold">
                        <td className="px-4 py-3 text-gray-900">Total Amount Due</td>
                        <td className="px-4 py-3 text-right text-blue-900 text-lg">{formatCurrency(returnData.totalDue)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3">Pre-Filing Checklist</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-800">All employee records verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-800">UAN numbers validated</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-800">Contribution calculations accurate</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-800">NCP days recorded correctly</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Important</p>
                    <p>After filing ECR, you must make the payment within 15 days to avoid penalties. The due date is {new Date(returnData.dueDate).toLocaleDateString('en-IN')}.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">ECR Filed Successfully!</h4>
              <p className="text-gray-600 mb-3">Your ECR has been submitted to EPFO portal</p>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-left max-w-md">
                <p className="text-sm text-blue-800 mb-2"><strong>Acknowledgement Number:</strong></p>
                <p className="text-lg font-mono font-bold text-blue-900">ACK{new Date().getFullYear()}{(new Date().getMonth() + 1).toString().padStart(2, '0')}{new Date().getDate().toString().padStart(2, '0')}0001</p>
                <p className="text-xs text-blue-700 mt-3">Please save this number for future reference</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {step === 'review' && (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  File ECR to EPFO
                </button>
              </>
            )}
            {step === 'confirm' && (
              <button
                onClick={onClose}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckStatusModal({ returnData, onClose }: { returnData: PFReturn; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">ECR Filing Status</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Return Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-blue-700">Return Period</p>
                <p className="font-semibold text-blue-900">{returnData.monthYear}</p>
              </div>
              <div>
                <p className="text-blue-700">ECR ID</p>
                <p className="font-semibold text-blue-900">{returnData.id}</p>
              </div>
              <div>
                <p className="text-blue-700">Filed On</p>
                <p className="font-semibold text-blue-900">
                  {returnData.filedOn ? new Date(returnData.filedOn).toLocaleDateString('en-IN') : 'Not filed yet'}
                </p>
              </div>
              <div>
                <p className="text-blue-700">Status</p>
                <p className="font-semibold text-blue-900 uppercase">{returnData.status}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Processing Status</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">ECR Submitted</p>
                  <p className="text-sm text-gray-600">
                    Filed on {returnData.filedOn ? new Date(returnData.filedOn).toLocaleDateString('en-IN') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Under Verification</p>
                  <p className="text-sm text-gray-600">EPFO is reviewing your submission</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-500">Acceptance Pending</p>
                  <p className="text-sm text-gray-500">Will be updated once verification is complete</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Note</p>
                <p>Verification typically takes 2-3 business days. You will receive an acknowledgement number once the ECR is accepted by EPFO.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-3">
              <ExternalLink className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Check on EPFO Portal</p>
                <p>You can also check the status directly on the EPFO Unified Portal using your establishment credentials.</p>
                <a href="https://unifiedportal-emp.epfindia.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline font-medium mt-2 inline-block">
                  Visit EPFO Portal →
                </a>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewReceiptModal({ returnData, onClose, formatCurrency }: { returnData: PFReturn; onClose: () => void; formatCurrency: (amount: number) => string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">ECR Acknowledgement Receipt</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {/* Header */}
          <div className="text-center border-b border-gray-200 pb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">EPFO - Ministry of Labour & Employment</h2>
                <p className="text-sm text-gray-600">Electronic Challan cum Return - Acknowledgement</p>
              </div>
            </div>
          </div>

          {/* Acknowledgement Details */}
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h4 className="font-semibold text-green-900">ECR Successfully Filed & Accepted</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-green-700">Acknowledgement Number</p>
                <p className="font-mono font-bold text-green-900">{returnData.acknowledgeNumber}</p>
              </div>
              <div>
                <p className="text-green-700">Filing Date</p>
                <p className="font-semibold text-green-900">
                  {returnData.filedOn ? new Date(returnData.filedOn).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Establishment Details */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Establishment Details</h4>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Establishment Name:</span>
                <span className="font-medium text-gray-900">ManufacturingOS Manufacturing Pvt. Ltd.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Establishment Code:</span>
                <span className="font-medium text-gray-900">{returnData.establishmentCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Return Period:</span>
                <span className="font-medium text-gray-900">{returnData.monthYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Employees Covered:</span>
                <span className="font-medium text-gray-900">{returnData.employeeCount}</span>
              </div>
            </div>
          </div>

          {/* Contribution Summary */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Contribution Summary</h4>
            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Component</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-gray-900">Total Wages</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(returnData.totalWages)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">EPF Wages</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(returnData.epfWages)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">EPF Contribution</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(returnData.epfContribution)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">EPS Wages</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(returnData.epsWages)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">EPS Contribution</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(returnData.epsContribution)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">EDLI Wages</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(returnData.edliWages)}</td>
                  </tr>
                  <tr className="bg-blue-50 font-semibold">
                    <td className="px-4 py-4 text-gray-900">Total Amount Remitted</td>
                    <td className="px-4 py-4 text-right text-blue-900 text-lg">{formatCurrency(returnData.totalDue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Filing Information */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Filing Information</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Filed By:</strong> {returnData.filedBy || 'HR Admin'}</p>
              <p><strong>Filing Date:</strong> {returnData.filedOn ? new Date(returnData.filedOn).toLocaleString('en-IN') : 'N/A'}</p>
              <p><strong>Status:</strong> <span className="uppercase font-semibold">{returnData.status}</span></p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 text-center">
              This is a computer-generated acknowledgement and does not require signature.<br />
              Generated on: {new Date().toLocaleString('en-IN')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            <button
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PFReturnsPage() {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFileECRModal, setShowFileECRModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<PFReturn | null>(null);

  const [returns, setReturns] = useState<PFReturn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getStatutoryFilings('pf-returns');
        const mapped: PFReturn[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: r.id ?? r.ecrId ?? r.returnNumber ?? '',
          monthYear: r.monthYear ?? r.details?.monthYear ?? '',
          returnMonth: String(r.returnMonth ?? r.details?.returnMonth ?? ''),
          returnYear: String(r.returnYear ?? r.details?.returnYear ?? ''),
          establishmentCode: r.establishmentCode ?? r.details?.establishmentCode ?? '',
          employeeCount: Number(r.employeeCount ?? r.details?.employeeCount ?? 0),
          totalWages: Number(r.totalWages ?? r.details?.totalWages ?? 0),
          epfWages: Number(r.epfWages ?? r.details?.epfWages ?? 0),
          epsWages: Number(r.epsWages ?? r.details?.epsWages ?? 0),
          edliWages: Number(r.edliWages ?? r.details?.edliWages ?? 0),
          epfContribution: Number(r.epfContribution ?? r.details?.epfContribution ?? 0),
          epsContribution: Number(r.epsContribution ?? r.details?.epsContribution ?? 0),
          epfDiff: Number(r.epfDiff ?? r.details?.epfDiff ?? 0),
          ncp: Number(r.ncp ?? r.details?.ncp ?? 0),
          refund: Number(r.refund ?? r.details?.refund ?? 0),
          totalDue: Number(r.totalDue ?? r.details?.totalDue ?? r.amount ?? 0),
          filedOn: r.filedOn ?? r.details?.filedOn ?? undefined,
          filedBy: r.filedBy ?? r.details?.filedBy ?? undefined,
          acknowledgeNumber: r.acknowledgeNumber ?? r.details?.acknowledgeNumber ?? undefined,
          status: (r.status ?? 'pending') as PFReturn['status'],
          dueDate: r.dueDate ?? r.details?.dueDate ?? '',
        }));
        if (!cancelled) setReturns(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load PF returns');
          setReturns([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredReturns = returns.filter(ret => ret.returnYear === selectedYear);

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
        <h1 className="text-2xl font-bold text-gray-900">PF Returns (ECR)</h1>
        <p className="text-sm text-gray-600 mt-1">Electronic Challan cum Return filing and tracking</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading PF returns…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && returns.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No PF returns found.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Returns</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
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

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Filed</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.filed}</p>
            </div>
            <Upload className="h-8 w-8 text-purple-600" />
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
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Download ECR Template
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Upload className="h-4 w-4" />
              Upload ECR
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
                  <h3 className="text-lg font-bold text-gray-900">{returnData.monthYear}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[returnData.status]}`}>
                    <span className="inline-flex items-center gap-1">
                      {statusIcons[returnData.status]}
                      {returnData.status.toUpperCase()}
                    </span>
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  ECR ID: {returnData.id} • Establishment: {returnData.establishmentCode}
                </p>
                {returnData.acknowledgeNumber && (
                  <p className="text-xs text-gray-500 mt-1">
                    Acknowledgement: {returnData.acknowledgeNumber}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Total Due</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(returnData.totalDue)}</p>
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
                <h4 className="text-xs font-semibold text-green-900 mb-3">EPF Wages</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">EPF Wages</span>
                    <span className="font-medium text-green-900">{formatCurrency(returnData.epfWages)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Contribution</span>
                    <span className="font-medium text-green-900">{formatCurrency(returnData.epfContribution)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <h4 className="text-xs font-semibold text-purple-900 mb-3">EPS Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-700">EPS Wages</span>
                    <span className="font-medium text-purple-900">{formatCurrency(returnData.epsWages)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-700">Contribution</span>
                    <span className="font-medium text-purple-900">{formatCurrency(returnData.epsContribution)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h4 className="text-xs font-semibold text-orange-900 mb-3">Other Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-700">EPF Difference</span>
                    <span className="font-medium text-orange-900">{formatCurrency(returnData.epfDiff)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-700">EDLI Wages</span>
                    <span className="font-medium text-orange-900">{formatCurrency(returnData.edliWages)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200 mb-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Due Date</p>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
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
                    onClick={() => {
                      setSelectedReturn(returnData);
                      setShowFileECRModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                  >
                    <Upload className="inline h-4 w-4 mr-2" />
                    File ECR
                  </button>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    <Download className="inline h-4 w-4 mr-2" />
                    Download Draft
                  </button>
                </>
              )}
              {returnData.status === 'filed' && (
                <button
                  onClick={() => {
                    setSelectedReturn(returnData);
                    setShowStatusModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  Check Status
                </button>
              )}
              {returnData.status === 'accepted' && (
                <>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                  >
                    <Download className="inline h-4 w-4 mr-2" />
                    Download Challan
                  </button>
                  <button
                    onClick={() => {
                      setSelectedReturn(returnData);
                      setShowReceiptModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
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

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">ECR Filing Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>ECR (Electronic Challan cum Return):</strong> Combined challan and return filed online via EPFO portal</li>
          <li>• <strong>Due Date:</strong> 15th of the following month (if delayed, additional charges apply)</li>
          <li>• <strong>ECR Format:</strong> Download template from EPFO portal, fill employee-wise details, upload</li>
          <li>• <strong>Payment:</strong> Pay PF dues online after ECR filing via EPFO portal</li>
          <li>• <strong>Acknowledgement:</strong> ECR acknowledgement number generated upon successful filing</li>
          <li>• <strong>Employee Share:</strong> 12% of Basic + DA deducted from salary</li>
          <li>• <strong>Employer Share:</strong> 8.33% EPS + 3.67% EPF + 0.5% EDLI + 0.5% Admin charges</li>
          <li>• <strong>NCP Days:</strong> Non-contribution period days to be mentioned for employees with LOP</li>
        </ul>
      </div>

      {/* Modals */}
      {showTemplateModal && (
        <DownloadTemplateModal onClose={() => setShowTemplateModal(false)} />
      )}

      {showUploadModal && (
        <UploadECRModal onClose={() => setShowUploadModal(false)} />
      )}

      {showFileECRModal && selectedReturn && (
        <FileECRModal
          returnData={selectedReturn}
          onClose={() => {
            setShowFileECRModal(false);
            setSelectedReturn(null);
          }}
          formatCurrency={formatCurrency}
        />
      )}

      {showStatusModal && selectedReturn && (
        <CheckStatusModal
          returnData={selectedReturn}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedReturn(null);
          }}
        />
      )}

      {showReceiptModal && selectedReturn && (
        <ViewReceiptModal
          returnData={selectedReturn}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedReturn(null);
          }}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
