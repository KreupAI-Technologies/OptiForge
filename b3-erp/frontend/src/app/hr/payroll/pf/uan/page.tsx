'use client';

import { useState, useMemo, useEffect } from 'react';
import { Hash, Search, Edit, CheckCircle, AlertTriangle, UserPlus, Download, X, Save, FileText, ExternalLink, Upload, Mail, User, CreditCard, Users } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface EmployeeUAN {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  dateOfJoining: string;
  uan: string;
  uanStatus: 'active' | 'pending' | 'inactive';
  pfAccountNumber: string;
  previousUAN?: string;
  aadharLinked: boolean;
  bankLinked: boolean;
  nomineeAdded: boolean;
  kycCompleted: boolean;
  lastUpdated: string;
}

// Modal Components
function EditUANModal({ employee, onClose }: { employee: EmployeeUAN; onClose: () => void }) {
  const [formData, setFormData] = useState({
    uan: employee.uan,
    pfAccountNumber: employee.pfAccountNumber,
    previousUAN: employee.previousUAN || '',
    aadharLinked: employee.aadharLinked,
    bankLinked: employee.bankLinked,
    nomineeAdded: employee.nomineeAdded
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Edit UAN Details - {employee.employeeName}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {/* Employee Info */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Employee Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-blue-700">Employee ID</p>
                <p className="font-medium text-blue-900">{employee.employeeId}</p>
              </div>
              <div>
                <p className="text-blue-700">Department</p>
                <p className="font-medium text-blue-900">{employee.department}</p>
              </div>
              <div>
                <p className="text-blue-700">Designation</p>
                <p className="font-medium text-blue-900">{employee.designation}</p>
              </div>
              <div>
                <p className="text-blue-700">Date of Joining</p>
                <p className="font-medium text-blue-900">{new Date(employee.dateOfJoining).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* UAN Details Form */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Universal Account Number (UAN)
            </label>
            <input
              type="text"
              value={formData.uan}
              onChange={(e) => setFormData({ ...formData, uan: e.target.value })}
              placeholder="12-digit UAN"
              maxLength={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">12-digit Universal Account Number from EPFO</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PF Account Number
            </label>
            <input
              type="text"
              value={formData.pfAccountNumber}
              onChange={(e) => setFormData({ ...formData, pfAccountNumber: e.target.value })}
              placeholder="XX/XXX/XXXXXXX/XXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Format: State/Office/Establishment/Member</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Previous UAN (if any)
            </label>
            <input
              type="text"
              value={formData.previousUAN}
              onChange={(e) => setFormData({ ...formData, previousUAN: e.target.value })}
              placeholder="Previous employer UAN"
              maxLength={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">UAN from previous employment for PF transfer</p>
          </div>

          {/* KYC Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">KYC Status</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.aadharLinked}
                  onChange={(e) => setFormData({ ...formData, aadharLinked: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Aadhar Linked</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.bankLinked}
                  onChange={(e) => setFormData({ ...formData, bankLinked: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Bank Account Linked</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.nomineeAdded}
                  onChange={(e) => setFormData({ ...formData, nomineeAdded: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Nominee Details Added</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log('Saving UAN details:', formData);
                onClose();
              }}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenerateUANModal({ employee, onClose }: { employee: EmployeeUAN; onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');
  const [formData, setFormData] = useState({
    aadharNumber: '',
    dateOfBirth: '',
    fatherName: '',
    gender: 'male',
    maritalStatus: 'single',
    mobileNumber: '',
    emailId: ''
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Generate UAN - {employee.employeeName}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {step === 'form' && (
            <>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Employee Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-blue-700">Employee ID</p>
                    <p className="font-medium text-blue-900">{employee.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">PF Account Number</p>
                    <p className="font-medium text-blue-900">{employee.pfAccountNumber}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhar Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.aadharNumber}
                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                    placeholder="XXXX XXXX XXXX"
                    maxLength={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's/Husband's Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marital Status <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="widowed">Widowed</option>
                    <option value="divorced">Divorced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.emailId}
                    onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                    placeholder="employee@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Important</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Aadhar number must be verified and accurate</li>
                      <li>Mobile and email will be used for UAN activation OTP</li>
                      <li>UAN generation will be submitted to EPFO portal</li>
                      <li>Employee will receive activation link on mobile/email</li>
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
                  onClick={() => setStep('success')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Generate UAN
                </button>
              </div>
            </>
          )}

          {step === 'success' && (
            <>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">UAN Generated Successfully!</h4>
                <p className="text-gray-600 mb-3">UAN request has been submitted to EPFO portal</p>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-left max-w-md">
                  <p className="text-sm text-blue-800 mb-2"><strong>Generated UAN:</strong></p>
                  <p className="text-2xl font-mono font-bold text-blue-900 mb-3">101234567899</p>
                  <p className="text-xs text-blue-700">UAN activation link sent to employee's mobile and email</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Next Steps</h4>
                <ul className="space-y-1 text-sm text-green-800 list-disc list-inside">
                  <li>Employee will receive OTP on registered mobile number</li>
                  <li>Employee must activate UAN using OTP on EPFO member portal</li>
                  <li>After activation, employee should link Aadhar, Bank, and Nominee</li>
                  <li>Complete KYC enables online PF transfer and withdrawal</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CompleteKYCModal({ employee, onClose }: { employee: EmployeeUAN; onClose: () => void }) {
  const kycStatus = [
    { label: 'Aadhar Linking', completed: employee.aadharLinked, icon: User },
    { label: 'Bank Account Linking', completed: employee.bankLinked, icon: CreditCard },
    { label: 'Nominee Addition', completed: employee.nomineeAdded, icon: Users }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Complete KYC - {employee.employeeName}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Employee UAN Details</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-blue-700">UAN Number</p>
                <p className="font-mono font-bold text-blue-900">{employee.uan}</p>
              </div>
              <div>
                <p className="text-blue-700">PF Account</p>
                <p className="font-medium text-blue-900">{employee.pfAccountNumber}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">KYC Requirements</h4>
            <div className="space-y-3">
              {kycStatus.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${item.completed ? 'text-green-600' : 'text-yellow-600'}`} />
                      <span className={`font-medium ${item.completed ? 'text-green-900' : 'text-yellow-900'}`}>
                        {item.label}
                      </span>
                    </div>
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">How to Complete KYC</p>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Employee must log in to EPFO Member Portal using UAN</li>
                  <li>Go to "Manage" section and select KYC option</li>
                  <li>Upload Aadhar card and link using OTP verification</li>
                  <li>Add bank account details and verify using penny drop</li>
                  <li>Add nominee details with supporting documents</li>
                  <li>Submit for employer approval via portal</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Important Note</p>
                <p>KYC must be completed on EPFO member portal by the employee. Once submitted, employer needs to approve the KYC documents via EPFO employer portal.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => window.open('https://unifiedportal-mem.epfindia.gov.in/', '_blank')}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open EPFO Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewUANPortalModal({ employee, onClose }: { employee: EmployeeUAN; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">UAN Portal Access - {employee.employeeName}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h4 className="font-semibold text-green-900">KYC Complete - Portal Access Enabled</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-green-700">UAN Number</p>
                <p className="font-mono font-bold text-green-900">{employee.uan}</p>
              </div>
              <div>
                <p className="text-green-700">PF Account</p>
                <p className="font-medium text-green-900">{employee.pfAccountNumber}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Available Services</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>View PF Passbook Online</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Transfer PF from Previous Employer</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Submit Online PF Withdrawal Claims</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Download Form 16A (TDS Certificate)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Update KYC Details</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">Portal Access Instructions</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Visit EPFO Member Portal</li>
                  <li>Login using UAN and password</li>
                  <li>If first time, activate UAN using mobile OTP</li>
                  <li>View passbook, submit claims, and transfer PF</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.open('https://unifiedportal-mem.epfindia.gov.in/', '_blank')}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Member Portal
            </button>
            <button
              onClick={() => window.open('https://passbook.epfindia.gov.in/', '_blank')}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              View Passbook
            </button>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExportReportModal({ onClose, employees }: { onClose: () => void; employees: EmployeeUAN[] }) {
  const [format, setFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [includeKYC, setIncludeKYC] = useState(true);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-3 py-2 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Export UAN Report</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                <input
                  type="radio"
                  value="excel"
                  checked={format === 'excel'}
                  onChange={(e) => setFormat(e.target.value as 'excel')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <p className="font-semibold text-gray-900">Excel (.xlsx)</p>
                  <p className="text-xs text-gray-600">Spreadsheet with all UAN and KYC details</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                <input
                  type="radio"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={(e) => setFormat(e.target.value as 'pdf')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <p className="font-semibold text-gray-900">PDF</p>
                  <p className="text-xs text-gray-600">Formatted report for printing</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                <input
                  type="radio"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value as 'csv')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <p className="font-semibold text-gray-900">CSV</p>
                  <p className="text-xs text-gray-600">Comma-separated values for data import</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Report Options</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeKYC}
                onChange={(e) => setIncludeKYC(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include KYC status details</span>
            </label>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Report will include:</strong> Employee details, UAN numbers, PF account numbers, KYC status, and last updated dates for all employees.
            </p>
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
                exportToCsv('uan-report', employees);
                onClose();
              }}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UANManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeUAN | null>(null);

  const mockEmployees: EmployeeUAN[] = [
    {
      id: 'UAN-001',
      employeeId: 'EMP001',
      employeeName: 'Rajesh Kumar',
      designation: 'Senior Production Manager',
      department: 'Production',
      dateOfJoining: '2020-01-15',
      uan: '101234567890',
      uanStatus: 'active',
      pfAccountNumber: 'KA/BLR/0012345/001',
      aadharLinked: true,
      bankLinked: true,
      nomineeAdded: true,
      kycCompleted: true,
      lastUpdated: '2025-01-15'
    },
    {
      id: 'UAN-002',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      designation: 'Quality Control Supervisor',
      department: 'Quality',
      dateOfJoining: '2021-03-20',
      uan: '101234567891',
      uanStatus: 'active',
      pfAccountNumber: 'KA/BLR/0012345/002',
      aadharLinked: true,
      bankLinked: true,
      nomineeAdded: true,
      kycCompleted: true,
      lastUpdated: '2024-11-20'
    },
    {
      id: 'UAN-003',
      employeeId: 'EMP003',
      employeeName: 'Amit Patel',
      designation: 'Production Operator',
      department: 'Production',
      dateOfJoining: '2022-06-10',
      uan: '101234567892',
      uanStatus: 'active',
      pfAccountNumber: 'KA/BLR/0012345/003',
      aadharLinked: true,
      bankLinked: false,
      nomineeAdded: true,
      kycCompleted: false,
      lastUpdated: '2024-10-10'
    },
    {
      id: 'UAN-004',
      employeeId: 'EMP004',
      employeeName: 'Neha Singh',
      designation: 'Maintenance Engineer',
      department: 'Maintenance',
      dateOfJoining: '2021-08-15',
      uan: '101234567893',
      uanStatus: 'active',
      pfAccountNumber: 'KA/BLR/0012345/004',
      previousUAN: '100987654321',
      aadharLinked: true,
      bankLinked: true,
      nomineeAdded: true,
      kycCompleted: true,
      lastUpdated: '2024-12-01'
    },
    {
      id: 'UAN-005',
      employeeId: 'EMP005',
      employeeName: 'Vikram Desai',
      designation: 'Logistics Coordinator',
      department: 'Logistics',
      dateOfJoining: '2024-01-10',
      uan: '101234567894',
      uanStatus: 'active',
      pfAccountNumber: 'KA/BLR/0012345/005',
      aadharLinked: true,
      bankLinked: true,
      nomineeAdded: false,
      kycCompleted: false,
      lastUpdated: '2024-09-15'
    },
    {
      id: 'UAN-006',
      employeeId: 'EMP006',
      employeeName: 'Kavita Mehta',
      designation: 'HR Executive',
      department: 'HR',
      dateOfJoining: '2023-02-01',
      uan: '',
      uanStatus: 'pending',
      pfAccountNumber: 'KA/BLR/0012345/006',
      aadharLinked: false,
      bankLinked: false,
      nomineeAdded: false,
      kycCompleted: false,
      lastUpdated: '2025-02-01'
    }
  ];

  const [rows, setRows] = useState<EmployeeUAN[]>(mockEmployees);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = await HrPayrollService.getStatutoryFilings('pf-uan');
        if (!cancelled && Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((r: any) => ({
            id: r.id ?? r.details?.id ?? '',
            employeeId: r.employeeId ?? r.details?.employeeId ?? '',
            employeeName: r.employeeName ?? r.details?.employeeName ?? '',
            designation: r.designation ?? r.details?.designation ?? '',
            department: r.department ?? r.details?.department ?? '',
            dateOfJoining: r.dateOfJoining ?? r.details?.dateOfJoining ?? '',
            uan: r.details?.uan ?? r.uan ?? '',
            uanStatus: r.details?.uanStatus ?? r.status ?? 'pending',
            pfAccountNumber: r.details?.pfAccountNumber ?? r.pfAccountNumber ?? '',
            previousUAN: r.details?.previousUAN ?? r.previousUAN,
            aadharLinked: r.details?.aadharLinked ?? r.aadharLinked ?? false,
            bankLinked: r.details?.bankLinked ?? r.bankLinked ?? false,
            nomineeAdded: r.details?.nomineeAdded ?? r.nomineeAdded ?? false,
            kycCompleted: r.details?.kycCompleted ?? r.kycCompleted ?? false,
            lastUpdated: r.details?.lastUpdated ?? r.effectiveDate ?? r.period ?? '',
          } as EmployeeUAN));
          setRows(mapped);
        }
      } catch (e) { if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load'); }
      finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredEmployees = useMemo(() => {
    return rows.filter(emp => {
      const matchesSearch =
        emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.uan.includes(searchTerm);
      const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || emp.uanStatus === selectedStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [searchTerm, selectedDepartment, selectedStatus, rows]);

  const stats = {
    total: rows.length,
    active: rows.filter(e => e.uanStatus === 'active').length,
    pending: rows.filter(e => e.uanStatus === 'pending').length,
    kycComplete: rows.filter(e => e.kycCompleted).length
  };

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];

  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    inactive: 'bg-red-100 text-red-700 border-red-200'
  };

  const statusIcons = {
    active: <CheckCircle className="h-4 w-4" />,
    pending: <AlertTriangle className="h-4 w-4" />,
    inactive: <AlertTriangle className="h-4 w-4" />
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">UAN Management</h1>
        <p className="text-sm text-gray-600 mt-1">Universal Account Number management and KYC tracking</p>
        {loadError && <div className="text-sm text-red-600 mt-1">{loadError}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Employees</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <Hash className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active UAN</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending UAN</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">KYC Complete</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.kycComplete}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by employee name, ID, or UAN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredEmployees.map(employee => (
          <div key={employee.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{employee.employeeName}</h3>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                    {employee.employeeId}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[employee.uanStatus]}`}>
                    <span className="inline-flex items-center gap-1">
                      {statusIcons[employee.uanStatus]}
                      {employee.uanStatus.toUpperCase()}
                    </span>
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {employee.designation} • {employee.department}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Joined: {new Date(employee.dateOfJoining).toLocaleDateString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedEmployee(employee);
                  setShowEditModal(true);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="text-xs font-semibold text-blue-900 mb-3">UAN Details</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-blue-700">Universal Account Number</p>
                    <p className="text-lg font-bold text-blue-900">
                      {employee.uan || 'Not Assigned'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">PF Account Number</p>
                    <p className="text-xs font-medium text-blue-900">{employee.pfAccountNumber}</p>
                  </div>
                  {employee.previousUAN && (
                    <div>
                      <p className="text-xs text-blue-700">Previous UAN</p>
                      <p className="text-xs font-medium text-blue-900">{employee.previousUAN}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h4 className="text-xs font-semibold text-green-900 mb-3">KYC Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-700">Aadhar Linked</span>
                    {employee.aadharLinked ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-700">Bank Linked</span>
                    {employee.bankLinked ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-700">Nominee Added</span>
                    {employee.nomineeAdded ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-green-300">
                    <span className="text-xs font-bold text-green-900">KYC Complete</span>
                    {employee.kycCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <h4 className="text-xs font-semibold text-purple-900 mb-3">Actions</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-purple-700 mb-1">Last Updated</p>
                    <p className="text-sm font-medium text-purple-900">
                      {new Date(employee.lastUpdated).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="pt-2">
                    {employee.uanStatus === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowGenerateModal(true);
                        }}
                        className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                      >
                        <UserPlus className="inline h-3 w-3 mr-1" />
                        Generate UAN
                      </button>
                    )}
                    {employee.uanStatus === 'active' && !employee.kycCompleted && (
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowKYCModal(true);
                        }}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium"
                      >
                        Complete KYC
                      </button>
                    )}
                    {employee.uanStatus === 'active' && employee.kycCompleted && (
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowPortalModal(true);
                        }}
                        className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-medium"
                      >
                        View UAN Portal
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {!employee.kycCompleted && employee.uanStatus === 'active' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                  <strong>Action Required:</strong> Complete KYC verification on UAN portal for this employee
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">UAN Management Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>UAN (Universal Account Number):</strong> Single lifelong account number for PF across all employments</li>
          <li>• <strong>UAN Generation:</strong> Employer generates UAN for new employees via EPFO portal</li>
          <li>• <strong>UAN Activation:</strong> Employee activates UAN using mobile OTP on EPFO member portal</li>
          <li>• <strong>KYC Requirements:</strong> Aadhar, Bank account, and Nominee details must be linked</li>
          <li>• <strong>Transfer/Withdrawal:</strong> Complete KYC enables online PF transfer and withdrawal</li>
          <li>• <strong>Previous UAN:</strong> Transfer previous employer PF to current UAN via online claim</li>
          <li>• <strong>Passbook Access:</strong> Employees can view PF passbook online after UAN activation</li>
        </ul>
      </div>

      {/* Modals */}
      {showEditModal && selectedEmployee && (
        <EditUANModal
          employee={selectedEmployee}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {showGenerateModal && selectedEmployee && (
        <GenerateUANModal
          employee={selectedEmployee}
          onClose={() => {
            setShowGenerateModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {showKYCModal && selectedEmployee && (
        <CompleteKYCModal
          employee={selectedEmployee}
          onClose={() => {
            setShowKYCModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {showPortalModal && selectedEmployee && (
        <ViewUANPortalModal
          employee={selectedEmployee}
          onClose={() => {
            setShowPortalModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {showExportModal && (
        <ExportReportModal onClose={() => setShowExportModal(false)} employees={filteredEmployees} />
      )}
    </div>
  );
}
