'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Edit3, Trash2, Download, Upload, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { commonMastersService, BankAccount } from '@/services/common-masters.service';

const COMPANY_ID = '1';

const BankMaster: React.FC = () => {
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountType: 'savings',
    ifscCode: '',
    accountHolderName: '',
    currency: 'INR',
    isPrimary: false,
    status: 'active',
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const data = await commonMastersService.getAllBankAccounts();
      setBanks(data);
    } catch (error) {
      console.error('Failed to fetch banks:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (bank: BankAccount | null) => {
    setSelectedBank(bank);
    setForm({
      bankName: bank?.bankName ?? '',
      branchName: bank?.branchName ?? '',
      accountNumber: bank?.accountNumber ?? '',
      accountType: bank?.accountType ?? 'savings',
      ifscCode: bank?.ifscCode ?? '',
      accountHolderName: bank?.accountHolderName ?? '',
      currency: bank?.currency ?? 'INR',
      isPrimary: bank?.isPrimary ?? false,
      status: bank?.status ?? 'active',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.bankName.trim()) { alert('Bank Name is required.'); return; }
    if (!form.accountNumber.trim()) { alert('Account Number is required.'); return; }
    if (!form.ifscCode.trim()) { alert('IFSC Code is required.'); return; }
    if (!form.accountHolderName.trim()) { alert('Account Holder Name is required.'); return; }
    try {
      setIsSaving(true);
      const payload = {
        bankName: form.bankName.trim(),
        branchName: form.branchName.trim() || undefined,
        accountNumber: form.accountNumber.trim(),
        accountType: form.accountType,
        ifscCode: form.ifscCode.trim(),
        accountHolderName: form.accountHolderName.trim(),
        currency: form.currency,
        isPrimary: form.isPrimary,
        status: form.status,
      };
      if (selectedBank) {
        await commonMastersService.updateBankAccount(selectedBank.id, payload);
      } else {
        await commonMastersService.createBankAccount({ ...payload, companyId: COMPANY_ID });
      }
      setIsModalOpen(false);
      await fetchBanks();
      alert(`Bank account ${selectedBank ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving bank account:', error);
      alert('Failed to save bank account. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;
    try {
      await commonMastersService.deleteBankAccount(id);
      await fetchBanks();
    } catch (error) {
      console.error('Error deleting bank account:', error);
      alert('Failed to delete bank account. Please try again.');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredBanks = banks.filter(b => {
    const matchesSearch = b.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.accountNumber.includes(searchTerm) ||
      b.ifscCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalBalance = banks.reduce((sum, b) => sum + (b.bankingDetails?.currentBalance || 0), 0);
  const totalOverdraft = banks.reduce((sum, b) => sum + (b.bankingDetails?.overdraftLimit || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="">
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                Bank Master
              </h1>
              <p className="text-gray-600 mt-2">Manage banking information and accounts</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => openModal(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Bank Account
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search banks, account number, IFSC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Accounts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{banks.length}</p>
              </div>
              <Building2 className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-green-600 mt-1">₹{(totalBalance / 10000000).toFixed(2)}Cr</p>
              </div>
              <CreditCard className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">OD Limit</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">₹{(totalOverdraft / 100000).toFixed(1)}L</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Accounts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {banks.filter(b => b.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Bank Accounts List */}
        <div className="space-y-2">
          {filteredBanks.map(bank => (
            <div key={bank.id} className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{bank.bankName}</h3>
                    {bank.isPrimary && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        Primary
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${bank.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : bank.status === 'inactive'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                      {bank.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{bank.branchName} • {bank.accountHolderName}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(bank)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Edit3 className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(bank.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-red-700">Delete</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                {/* Account Details */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Account Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account No:</span>
                      <span className="font-medium font-mono">{bank.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium uppercase">{bank.accountType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IFSC:</span>
                      <span className="font-medium font-mono">{bank.ifscCode}</span>
                    </div>
                    {bank.swiftCode && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">SWIFT:</span>
                        <span className="font-medium font-mono">{bank.swiftCode}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Balance Information */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Balance Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-medium text-green-600">
                        ₹{((bank.bankingDetails?.currentBalance || 0) / 100000).toFixed(2)}L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Opening:</span>
                      <span className="font-medium">
                        ₹{((bank.bankingDetails?.openingBalance || 0) / 100000).toFixed(2)}L
                      </span>
                    </div>
                    {bank.bankingDetails?.overdraftLimit && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">OD Limit:</span>
                        <span className="font-medium text-orange-600">
                          ₹{(bank.bankingDetails.overdraftLimit / 100000).toFixed(2)}L
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Details */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Branch Contact</h4>
                  <div className="space-y-1 text-sm">
                    <div className="text-gray-600">
                      {bank.contactDetails?.branchAddress}
                    </div>
                    <div className="text-gray-600">
                      {bank.contactDetails?.city}{bank.contactDetails?.city ? ', ' : ''}{bank.contactDetails?.state} {bank.contactDetails?.pincode ? `- ${bank.contactDetails.pincode}` : ''}
                    </div>
                    {bank.contactDetails?.phone && (
                      <div className="text-gray-600">{bank.contactDetails.phone}</div>
                    )}
                    {bank.contactDetails?.email && (
                      <div className="text-blue-600 text-xs">{bank.contactDetails.email}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Online Access */}
              {bank.onlineAccess?.internetBanking && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Internet Banking Enabled
                    </span>
                    {bank.onlineAccess.netbankingId && (
                      <span className="text-gray-600">
                        ID: <span className="font-medium font-mono">{bank.onlineAccess.netbankingId}</span>
                      </span>
                    )}
                    {bank.onlineAccess.upiId && (
                      <span className="text-gray-600">
                        UPI: <span className="font-medium font-mono">{bank.onlineAccess.upiId}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {selectedBank ? 'Edit Bank Account' : 'Add New Bank Account'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={form.branchName}
                    onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                  <input
                    type="text"
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select
                    value={form.accountType}
                    onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                    <option value="od">Overdraft</option>
                    <option value="cc">Cash Credit</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    value={form.ifscCode}
                    onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <input
                    type="text"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  value={form.accountHolderName}
                  onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 pb-2">
                  <input
                    type="checkbox"
                    checked={form.isPrimary}
                    onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Primary Account</span>
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : `${selectedBank ? 'Update' : 'Create'} Bank Account`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankMaster;
