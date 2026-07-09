import { useState } from 'react';
import { X, Plus, Search, AlertTriangle, CheckCircle, Upload, Download, Copy, Archive, Eye, Edit, Trash2, Power, PowerOff, FileText, BarChart3, TrendingUp, DollarSign, Building } from 'lucide-react';

// 1. Add Account Modal (Blue) - Create new account
export function AddAccountModal({ isOpen, onClose, onCreate }: any) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Assets',
    subType: '',
    parentAccount: '',
    description: '',
    currency: 'INR',
    costCenterEnabled: false,
    projectTrackingEnabled: false,
    departmentEnabled: false,
    taxApplicable: false,
    taxCategory: '',
    openingBalance: '',
    openingBalanceType: 'debit',
    effectiveDate: new Date().toISOString().split('T')[0],
    isActive: true,
    reconciliationEnabled: false
  });

  const accountTypes = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'];
  const subTypes = {
    Assets: ['Current Assets', 'Fixed Assets', 'Investments', 'Other Assets'],
    Liabilities: ['Current Liabilities', 'Long-term Liabilities', 'Provisions'],
    Equity: ['Share Capital', 'Reserves', 'Retained Earnings', 'Other Equity'],
    Income: ['Operating Revenue', 'Other Income', 'Interest Income', 'Gains'],
    Expenses: ['Operating Expenses', 'Financial Expenses', 'Administrative', 'Losses']
  };

  const isValid = formData.code && formData.name && formData.type;

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white">Add New Account</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {/* Basic Information */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 pb-2 border-b">Basic Information</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1100"
              />
              <p className="text-xs text-gray-500 mt-1">Unique identifier for this account</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Cash at Bank - HDFC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value, subType: ''})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {accountTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Type</label>
              <select
                value={formData.subType}
                onChange={(e) => setFormData({...formData, subType: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Sub Type</option>
                {subTypes[formData.type as keyof typeof subTypes]?.map(subType => (
                  <option key={subType} value={subType}>{subType}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Account</label>
              <select
                value={formData.parentAccount}
                onChange={(e) => setFormData({...formData, parentAccount: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Parent (Top Level)</option>
                <option value="1000">1000 - Current Assets</option>
                <option value="1010">1010 - Cash and Cash Equivalents</option>
                <option value="2000">2000 - Current Liabilities</option>
                <option value="4000">4000 - Revenue</option>
                <option value="5000">5000 - Operating Expenses</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Brief description of this account"
              />
            </div>

            {/* Opening Balance */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 pb-2 border-b mt-4">Opening Balance</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance</label>
              <input
                type="number"
                value={formData.openingBalance}
                onChange={(e) => setFormData({...formData, openingBalance: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Balance Type</label>
              <select
                value={formData.openingBalanceType}
                onChange={(e) => setFormData({...formData, openingBalanceType: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
              <input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({...formData, effectiveDate: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Advanced Options */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 pb-2 border-b mt-4">Advanced Options</h3>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.costCenterEnabled}
                  onChange={(e) => setFormData({...formData, costCenterEnabled: e.target.checked})}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-gray-900">Cost Center Tracking</p>
                  <p className="text-xs text-gray-500">Enable cost center allocation</p>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.projectTrackingEnabled}
                  onChange={(e) => setFormData({...formData, projectTrackingEnabled: e.target.checked})}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-gray-900">Project Tracking</p>
                  <p className="text-xs text-gray-500">Enable project-wise tracking</p>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.departmentEnabled}
                  onChange={(e) => setFormData({...formData, departmentEnabled: e.target.checked})}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-gray-900">Department Tracking</p>
                  <p className="text-xs text-gray-500">Enable department allocation</p>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.reconciliationEnabled}
                  onChange={(e) => setFormData({...formData, reconciliationEnabled: e.target.checked})}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-gray-900">Bank Reconciliation</p>
                  <p className="text-xs text-gray-500">Enable for bank accounts</p>
                </div>
              </label>
            </div>

            {/* Tax Settings */}
            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.taxApplicable}
                  onChange={(e) => setFormData({...formData, taxApplicable: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="font-medium text-gray-900">Tax Applicable</span>
              </label>
            </div>
            {formData.taxApplicable && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Category</label>
                <select
                  value={formData.taxCategory}
                  onChange={(e) => setFormData({...formData, taxCategory: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Tax Category</option>
                  <option value="GST-5">GST 5%</option>
                  <option value="GST-12">GST 12%</option>
                  <option value="GST-18">GST 18%</option>
                  <option value="GST-28">GST 28%</option>
                  <option value="TDS-194C">TDS 194C - Contractor</option>
                  <option value="TDS-194J">TDS 194J - Professional</option>
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="bg-gray-50 px-3 py-2 flex justify-end space-x-3 border-t sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Cancel</button>
          <button
            onClick={() => onCreate(formData)}
            disabled={!isValid}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Edit Account Modal (Green)
export function EditAccountModal({ isOpen, onClose, onSave, account }: any) {
  const [formData, setFormData] = useState(account || {
    code: '1012',
    name: 'Cash at Bank - HDFC Current Account',
    type: 'Assets',
    subType: 'Current Assets',
    parentAccount: '1010',
    description: 'Primary operating account',
    currency: 'INR',
    balance: 350000,
    isActive: true
  });

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 py-2 flex justify-between items-center sticky top-0">
          <h2 className="text-xl font-bold text-white">Edit Account - {formData.code}</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
              <input
                type="text"
                value={formData.code}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Account code cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <input
                type="text"
                value={formData.type}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
              <input
                type="text"
                value={`₹${formData.balance.toLocaleString('en-IN')}`}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 font-semibold"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="font-medium text-gray-900">Account is Active</span>
              </label>
            </div>
          </div>

          {!formData.isActive && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Deactivating Account</p>
                  <p className="text-xs text-yellow-700 mt-1">This account will be hidden from dropdowns but historical data will be preserved.</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-gray-50 px-3 py-2 flex justify-end space-x-3 border-t">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Cancel</button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. View Account Details Modal (Purple)
export function ViewAccountDetailsModal({ isOpen, onClose, account }: any) {
  const mockAccount = account || {
    code: '1012',
    name: 'Cash at Bank - HDFC Current Account',
    type: 'Assets',
    subType: 'Current Assets',
    parentAccount: '1010 - Cash and Cash Equivalents',
    description: 'Primary operating account for daily transactions',
    currency: 'INR',
    balance: 350000,
    debitBalance: 2150000,
    creditBalance: 1800000,
    openingBalance: 500000,
    isActive: true,
    createdDate: '2024-01-01',
    createdBy: 'Admin User',
    lastModified: '2025-10-15',
    transactionCount: 1247,
    reconciliationEnabled: true,
    lastReconciled: '2025-10-01'
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-3 py-2 flex justify-between items-center sticky top-0">
          <h2 className="text-xl font-bold text-white">Account Details</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-700">Current Balance</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">₹{mockAccount.balance.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-medium text-green-700">Total Debits</p>
              <p className="text-2xl font-bold text-green-900 mt-1">₹{mockAccount.debitBalance.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-700">Total Credits</p>
              <p className="text-2xl font-bold text-red-900 mt-1">₹{mockAccount.creditBalance.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm font-medium text-purple-700">Transactions</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{mockAccount.transactionCount}</p>
            </div>
          </div>

          {/* Account Information */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-sm font-medium text-gray-600">Account Code</dt>
                  <dd className="text-sm font-semibold text-gray-900">{mockAccount.code}</dd>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-sm font-medium text-gray-600">Account Name</dt>
                  <dd className="text-sm font-semibold text-gray-900">{mockAccount.name}</dd>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-sm font-medium text-gray-600">Type</dt>
                  <dd className="text-sm font-semibold text-gray-900">{mockAccount.type}</dd>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-sm font-medium text-gray-600">Sub Type</dt>
                  <dd className="text-sm font-semibold text-gray-900">{mockAccount.subType}</dd>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-sm font-medium text-gray-600">Parent Account</dt>
                  <dd className="text-sm font-semibold text-gray-900">{mockAccount.parentAccount}</dd>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-sm font-medium text-gray-600">Currency</dt>
                  <dd className="text-sm font-semibold text-gray-900">{mockAccount.currency}</dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-sm font-medium text-gray-600">Status</dt>
                  <dd>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      mockAccount.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {mockAccount.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h3>
              <dl className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-sm font-medium text-gray-600">Opening Balance</dt>
                  <dd className="text-sm font-semibold text-gray-900">₹{mockAccount.openingBalance.toLocaleString('en-IN')}</dd>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-sm font-medium text-gray-600">Created Date</dt>
                  <dd className="text-sm font-semibold text-gray-900">{mockAccount.createdDate}</dd>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-sm font-medium text-gray-600">Created By</dt>
                  <dd className="text-sm font-semibold text-gray-900">{mockAccount.createdBy}</dd>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-sm font-medium text-gray-600">Last Modified</dt>
                  <dd className="text-sm font-semibold text-gray-900">{mockAccount.lastModified}</dd>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-sm font-medium text-gray-600">Reconciliation</dt>
                  <dd className="text-sm font-semibold text-gray-900">{mockAccount.reconciliationEnabled ? 'Enabled' : 'Disabled'}</dd>
                </div>
                {mockAccount.reconciliationEnabled && (
                  <div className="flex justify-between py-2">
                    <dt className="text-sm font-medium text-gray-600">Last Reconciled</dt>
                    <dd className="text-sm font-semibold text-gray-900">{mockAccount.lastReconciled}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">{mockAccount.description}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-3 py-2 flex justify-end space-x-3 border-t">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Close</button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <FileText className="h-4 w-4" />
            View Ledger
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Edit className="h-4 w-4" />
            Edit Account
          </button>
        </div>
      </div>
    </div>
  );
}

// 4. Deactivate/Activate Account Modal (Red/Orange)
export function ToggleAccountStatusModal({ isOpen, onClose, onConfirm, account, currentStatus }: any) {
  const isDeactivating = currentStatus === 'active';

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className={`bg-gradient-to-r ${isDeactivating ? 'from-orange-600 to-orange-700' : 'from-green-600 to-green-700'} px-3 py-2 flex justify-between items-center`}>
          <h2 className="text-xl font-bold text-white">{isDeactivating ? 'Deactivate' : 'Activate'} Account</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
          <div className={`flex items-start gap-3 p-3 ${isDeactivating ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'} border rounded-lg mb-2`}>
            {isDeactivating ? (
              <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold ${isDeactivating ? 'text-orange-900' : 'text-green-900'}`}>
                {isDeactivating ? 'Deactivate this account?' : 'Activate this account?'}
              </p>
              <p className={`text-sm mt-1 ${isDeactivating ? 'text-orange-700' : 'text-green-700'}`}>
                Account: <strong>{account?.code} - {account?.name}</strong>
              </p>
            </div>
          </div>

          {isDeactivating ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">When you deactivate this account:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                <li>It will be hidden from account dropdowns</li>
                <li>No new transactions can be posted</li>
                <li>Existing transactions remain unchanged</li>
                <li>Historical data is preserved</li>
                <li>Reports will still show this account's history</li>
              </ul>
              <p className="text-sm font-medium text-gray-900 mt-4">Current Balance: ₹{account?.balance?.toLocaleString('en-IN')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">When you activate this account:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                <li>It will appear in all account dropdowns</li>
                <li>New transactions can be posted</li>
                <li>All features will be enabled</li>
              </ul>
            </div>
          )}
        </div>
        <div className="bg-gray-50 px-3 py-2 flex justify-end space-x-3 border-t">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Cancel</button>
          <button
            onClick={() => { console.log(`${isDeactivating ? 'Deactivate' : 'Activate'} Account:`, account); onConfirm(); }}
            className={`px-4 py-2 ${isDeactivating ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg`}
          >
            {isDeactivating ? 'Deactivate Account' : 'Activate Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Continue with more modals in next response due to length...

// 5. Bulk Import Accounts Modal (Cyan)
const BULK_IMPORT_TEMPLATE = JSON.stringify(
  [
    { code: '1000', name: 'Current Assets', type: 'Assets' },
    { code: '1100', name: 'Cash', type: 'Assets', parentCode: '1000', openingBalance: 0 },
    { code: '4000', name: 'Sales Revenue', type: 'Income' },
  ],
  null,
  2,
);

export function BulkImportAccountsModal({ isOpen, onClose, onImport, isSubmitting }: any) {
  const [jsonText, setJsonText] = useState('');
  const [validateOnly, setValidateOnly] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      setJsonText(text);
      setParseError(null);
    } catch {
      setParseError('Unable to read file.');
    }
  };

  const submit = () => {
    setParseError(null);
    let accounts: any[];
    try {
      accounts = JSON.parse(jsonText);
      if (!Array.isArray(accounts)) throw new Error('Expected a JSON array of account rows.');
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Invalid JSON.');
      return;
    }
    if (accounts.length === 0) {
      setParseError('No rows to import.');
      return;
    }
    onImport({ accounts, validateOnly });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 px-3 py-2 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Bulk Import Accounts</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {parseError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {parseError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account rows (JSON array)
              </label>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder={BULK_IMPORT_TEMPLATE}
                rows={10}
                className="w-full px-3 py-2 border rounded-lg font-mono text-xs focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 cursor-pointer text-sm">
                <Upload className="h-4 w-4" />
                Load JSON file
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => handleFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                onClick={() => setJsonText(BULK_IMPORT_TEMPLATE)}
              >
                <Download className="h-4 w-4" />
                Use sample template
              </button>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={validateOnly}
                  onChange={(e) => setValidateOnly(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-900">Validate Only (Don&apos;t Import)</span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-1">Check for errors without creating accounts</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900 mb-2">Row fields:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• <strong>code</strong> - Account code (required, unique)</li>
                <li>• <strong>name</strong> - Account name (required)</li>
                <li>• <strong>type</strong> - Assets, Liabilities, Equity, Income, or Expenses (required)</li>
                <li>• <strong>parentCode</strong> - Parent account code (optional)</li>
                <li>• <strong>openingBalance</strong> - Opening balance amount (optional)</li>
                <li>• <strong>description</strong> - Account description (optional)</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-3 py-2 flex justify-end space-x-3 border-t">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Cancel</button>
          <button
            onClick={submit}
            disabled={!jsonText.trim() || isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {isSubmitting ? 'Working…' : validateOnly ? 'Validate' : 'Import Accounts'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Export all modals
export default {
  AddAccountModal,
  EditAccountModal,
  ViewAccountDetailsModal,
  ToggleAccountStatusModal,
  BulkImportAccountsModal
};
