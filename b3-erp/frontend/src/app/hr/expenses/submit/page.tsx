'use client';

import { useState, useEffect } from 'react';
import { Receipt, Upload, X, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { HrPagesService } from '@/services/hr-pages.service';
import { HrExpensesService } from '@/services/hr-expenses.service';

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  receipt?: File;
}

interface RecentClaim {
  id: string;
  claimNumber: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  submittedDate: string;
}

const expenseCategories = [
  'Travel',
  'Accommodation',
  'Meals',
  'Transport',
  'Office Supplies',
  'Client Entertainment',
  'Training',
  'Software/Tools',
  'Communication',
  'Other'
];

export default function SubmitExpensePage() {
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([{
    id: '1',
    category: 'Travel',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [recentClaims, setRecentClaims] = useState<RecentClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.expenseClaims()) as any[];
        const mapped: RecentClaim[] = (raw ?? []).map((c, idx) => ({
          id: String(c.id ?? idx),
          claimNumber: c.claimNumber ?? '',
          category: c.category ?? '',
          amount: Number(c.amount ?? 0),
          currency: c.currency ?? 'INR',
          description: c.description ?? '',
          status: c.status ?? '',
          submittedDate: c.submittedDate ?? c.expenseDate ?? '',
        }));
        if (!cancelled) setRecentClaims(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load recent claims');
          setRecentClaims([]);
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

  const addExpenseItem = () => {
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      category: 'Travel',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    };
    setExpenseItems([...expenseItems, newItem]);
  };

  const removeExpenseItem = (id: string) => {
    if (expenseItems.length === 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one expense item is required",
        variant: "destructive"
      });
      return;
    }
    setExpenseItems(expenseItems.filter(item => item.id !== id));
  };

  const updateExpenseItem = (id: string, field: keyof ExpenseItem, value: any) => {
    setExpenseItems(expenseItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleFileUpload = (id: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Receipt file must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    updateExpenseItem(id, 'receipt', file);
    toast({
      title: "Receipt Uploaded",
      description: `${file.name} attached successfully`
    });
  };

  const validateForm = (): boolean => {
    if (!expenseTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter expense title",
        variant: "destructive"
      });
      return false;
    }

    for (const item of expenseItems) {
      if (!item.description.trim()) {
        toast({
          title: "Validation Error",
          description: "All expense items must have descriptions",
          variant: "destructive"
        });
        return false;
      }
      if (item.amount <= 0) {
        toast({
          title: "Validation Error",
          description: "All expense amounts must be greater than zero",
          variant: "destructive"
        });
        return false;
      }
      if (!item.date) {
        toast({
          title: "Validation Error",
          description: "All expense items must have dates",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const totalAmount = expenseItems.reduce((sum, item) => sum + item.amount, 0);

      await HrExpensesService.createExpenseClaim({
        title: expenseTitle,
        status: 'submitted',
        totalAmount,
        items: expenseItems.map((item) => ({
          category: item.category,
          description: item.description,
          amount: item.amount,
          date: item.date,
        })),
      });

      toast({
        title: "Expense Submitted",
        description: `Expense claim for ₹${totalAmount.toLocaleString('en-IN')} submitted successfully`
      });

      // Reset form
      setExpenseTitle('');
      setExpenseItems([{
        id: Date.now().toString(),
        category: 'Travel',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0]
      }]);

      // Refresh the recent claims list.
      try {
        const raw = (await HrPagesService.expenseClaims()) as any[];
        setRecentClaims(
          (raw ?? []).map((c, idx) => ({
            id: String(c.id ?? idx),
            claimNumber: c.claimNumber ?? '',
            category: c.category ?? '',
            amount: Number(c.amount ?? 0),
            currency: c.currency ?? 'INR',
            description: c.description ?? '',
            status: c.status ?? '',
            submittedDate: c.submittedDate ?? c.expenseDate ?? '',
          })),
        );
      } catch {
        /* non-fatal: list refresh failure should not block submission success */
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = expenseItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Receipt className="h-7 w-7 text-purple-600" />
          Submit Expense Claim
        </h1>
        <p className="text-sm text-gray-600 mt-1">Create and submit expense reimbursement request</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-3">
          {/* Expense Title */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Expense Details</h2>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="e.g., Business Trip to Mumbai - March 2025"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Expense Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Expense Items</h2>
              <button
                onClick={addExpenseItem}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {expenseItems.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Item {index + 1}</h3>
                    {expenseItems.length > 1 && (
                      <button
                        onClick={() => removeExpenseItem(item.id)}
                        disabled={isSubmitting}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={item.category}
                        onChange={(e) => updateExpenseItem(item.id, 'category', e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                      >
                        {expenseCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) => updateExpenseItem(item.id, 'date', e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateExpenseItem(item.id, 'description', e.target.value)}
                        placeholder="e.g., Flight ticket Mumbai to Delhi"
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (₹) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        value={item.amount || ''}
                        onChange={(e) => updateExpenseItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        disabled={isSubmitting}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Receipt
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(item.id, e.target.files[0]);
                            }
                          }}
                          disabled={isSubmitting}
                          className="hidden"
                          id={`receipt-${item.id}`}
                        />
                        <label
                          htmlFor={`receipt-${item.id}`}
                          className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="h-4 w-4" />
                          {item.receipt ? item.receipt.name : 'Upload Receipt'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3 sticky top-6">
            <h2 className="text-lg font-semibold text-purple-900 mb-2">Summary</h2>

            <div className="space-y-3 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-purple-700">Total Items:</span>
                <span className="font-semibold text-purple-900">{expenseItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-700">Items with Receipts:</span>
                <span className="font-semibold text-purple-900">
                  {expenseItems.filter(item => item.receipt).length}
                </span>
              </div>
              <div className="border-t border-purple-300 my-3"></div>
              <div className="flex justify-between">
                <span className="font-semibold text-purple-900">Total Amount:</span>
                <span className="text-2xl font-bold text-purple-900">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !expenseTitle.trim()}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Submitting...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4" />
                  Submit Expense
                </>
              )}
            </button>

            <div className="mt-6 p-3 bg-white rounded-lg border border-purple-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Guidelines:</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Attach receipts for all expenses</li>
                <li>• Expenses must be within policy limits</li>
                <li>• Submit within 30 days of expense</li>
                <li>• Provide clear descriptions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="mt-3 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Recent Claims</h2>

        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading recent claims…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {!isLoading && !loadError && recentClaims.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            No recent claims found.
          </div>
        )}
        {!isLoading && !loadError && recentClaims.length > 0 && (
          <div className="divide-y divide-gray-100">
            {recentClaims.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {claim.claimNumber || claim.description || 'Expense Claim'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {claim.category}
                    {claim.submittedDate ? ` • ${claim.submittedDate}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">
                    {claim.currency} {claim.amount.toLocaleString('en-IN')}
                  </span>
                  {claim.status && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {claim.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
