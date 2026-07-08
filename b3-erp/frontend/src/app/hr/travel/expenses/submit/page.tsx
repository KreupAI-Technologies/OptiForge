'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { HrExpensesService } from '@/services/hr-expenses.service';
import { useRouter } from 'next/navigation';
import { Receipt, Upload, Plus, X, CreditCard, Wallet, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExpenseItem {
  id: string;
  category: 'accommodation' | 'meals' | 'transport' | 'fuel' | 'parking' | 'toll' | 'other';
  date: string;
  description: string;
  amount: number;
  billNumber: string;
  hasReceipt: boolean;
  paymentMode: 'cash' | 'corporate_card' | 'personal_card' | 'advance';
  cardLastDigits?: string;
}

export default function Page() {
  const router = useRouter();
  const [travelRequestId, setTravelRequestId] = useState('TR-2025-001');
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.travelRequests<any[]>();
        if (!cancelled) setExpenseItems(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setExpenseItems([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<ExpenseItem>>({
    category: 'meals',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'cash',
    hasReceipt: false
  });

  const [advanceAmount, setAdvanceAmount] = useState(15000);
  const [advanceUsed, setAdvanceUsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const cashExpenses = expenseItems.filter(e => e.paymentMode === 'cash').reduce((sum, e) => sum + e.amount, 0);
  const cardExpenses = expenseItems.filter(e => e.paymentMode === 'corporate_card').reduce((sum, e) => sum + e.amount, 0);
  const personalExpenses = expenseItems.filter(e => e.paymentMode === 'personal_card').reduce((sum, e) => sum + e.amount, 0);
  const netPayable = totalExpenses - advanceUsed - cardExpenses;

  const categoryColors = {
    accommodation: 'bg-blue-100 text-blue-800',
    meals: 'bg-green-100 text-green-800',
    transport: 'bg-purple-100 text-purple-800',
    fuel: 'bg-orange-100 text-orange-800',
    parking: 'bg-yellow-100 text-yellow-800',
    toll: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800'
  };

  const paymentModeColors = {
    cash: 'bg-green-100 text-green-800',
    corporate_card: 'bg-blue-100 text-blue-800',
    personal_card: 'bg-purple-100 text-purple-800',
    advance: 'bg-orange-100 text-orange-800'
  };

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.billNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const expense: ExpenseItem = {
      id: String(expenseItems.length + 1),
      category: newExpense.category as any,
      date: newExpense.date!,
      description: newExpense.description,
      amount: newExpense.amount,
      billNumber: newExpense.billNumber,
      hasReceipt: newExpense.hasReceipt || false,
      paymentMode: newExpense.paymentMode as any,
      cardLastDigits: newExpense.cardLastDigits
    };

    setExpenseItems([...expenseItems, expense]);
    setShowAddModal(false);
    setNewExpense({
      category: 'meals',
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'cash',
      hasReceipt: false
    });

    toast({
      title: "Expense Added",
      description: "Expense item has been added successfully"
    });
  };

  const handleRemoveExpense = (id: string) => {
    setExpenseItems(expenseItems.filter(e => e.id !== id));
    toast({
      title: "Expense Removed",
      description: "Expense item has been removed"
    });
  };

  const handleSubmitExpenses = async () => {
    if (expenseItems.length === 0) {
      toast({ title: 'No expenses to submit', description: 'Add at least one expense item first.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await HrExpensesService.createExpenseClaim({
        kind: 'travel',
        travelRequestId,
        amount: totalExpenses,
        advanceAmount,
        cardExpenses,
        netPayable,
        itemsCount: expenseItems.length,
        status: 'pending',
        submittedDate: new Date().toISOString().split('T')[0],
        items: expenseItems,
      });
      toast({ title: 'Expenses Submitted', description: 'Your travel expenses have been submitted for approval' });
      router.push('/hr/travel/expenses');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit expenses.');
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await HrExpensesService.createExpenseClaim({
        kind: 'travel',
        travelRequestId,
        amount: totalExpenses,
        advanceAmount,
        cardExpenses,
        netPayable,
        itemsCount: expenseItems.length,
        status: 'draft',
        items: expenseItems,
      });
      toast({ title: 'Draft Saved', description: 'Your travel expense claim has been saved as a draft' });
      router.push('/hr/travel/expenses');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save draft.');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Receipt className="h-7 w-7 text-blue-600" />
          Submit Travel Expenses
        </h1>
        <p className="text-sm text-gray-600 mt-1">Submit expenses incurred during your business travel</p>
      </div>

      {/* Travel Request Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <p className="text-xs text-blue-600 uppercase font-medium mb-1">Travel Request</p>
            <p className="text-sm font-bold text-blue-900">{travelRequestId}</p>
          </div>
          <div>
            <p className="text-xs text-blue-600 uppercase font-medium mb-1">Destination</p>
            <p className="text-sm font-semibold text-blue-900">Bangalore, Karnataka</p>
          </div>
          <div>
            <p className="text-xs text-blue-600 uppercase font-medium mb-1">Travel Dates</p>
            <p className="text-sm font-semibold text-blue-900">10-Nov to 15-Nov 2025</p>
          </div>
          <div>
            <p className="text-xs text-blue-600 uppercase font-medium mb-1">Advance Taken</p>
            <p className="text-sm font-bold text-blue-900">₹{advanceAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-indigo-600">₹{totalExpenses.toLocaleString('en-IN')}</p>
            </div>
            <Receipt className="h-8 w-8 text-indigo-400" />
          </div>
        </div>

        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cash Paid</p>
              <p className="text-2xl font-bold text-green-600">₹{cashExpenses.toLocaleString('en-IN')}</p>
            </div>
            <Wallet className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Corporate Card</p>
              <p className="text-2xl font-bold text-blue-600">₹{cardExpenses.toLocaleString('en-IN')}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Personal Card</p>
              <p className="text-2xl font-bold text-purple-600">₹{personalExpenses.toLocaleString('en-IN')}</p>
            </div>
            <CreditCard className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className={`bg-white border-2 rounded-lg p-3 ${netPayable >= 0 ? 'border-orange-200' : 'border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Payable</p>
              <p className={`text-2xl font-bold ${netPayable >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                ₹{netPayable.toLocaleString('en-IN')}
              </p>
            </div>
            <Wallet className={`h-8 w-8 ${netPayable >= 0 ? 'text-orange-400' : 'text-red-400'}`} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-gray-900">Expense Items</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
            <Upload className="h-4 w-4" />
            Import from Card
          </button>
        </div>
      </div>

      {/* Expense Items List */}
      <div className="space-y-3 mb-3">
        {expenseItems.map((expense) => (
          <div key={expense.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${categoryColors[expense.category]}`}>
                    {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${paymentModeColors[expense.paymentMode]}`}>
                    {expense.paymentMode === 'corporate_card' ? 'Corporate Card' :
                     expense.paymentMode === 'personal_card' ? 'Personal Card' :
                     expense.paymentMode.charAt(0).toUpperCase() + expense.paymentMode.slice(1)}
                    {expense.cardLastDigits && ` ****${expense.cardLastDigits}`}
                  </span>
                  {expense.hasReceipt && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      ✓ Receipt
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{expense.description}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span>Bill #: {expense.billNumber}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-900">₹{expense.amount.toLocaleString('en-IN')}</p>
                <button
                  onClick={() => handleRemoveExpense(expense.id)}
                  className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Settlement Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-300 mb-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Settlement Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700">Total Expenses:</span>
            <span className="font-semibold text-gray-900">₹{totalExpenses.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-blue-700">
            <span>Less: Corporate Card Expenses:</span>
            <span className="font-semibold">₹{cardExpenses.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-orange-700">
            <span>Less: Advance Utilized:</span>
            <span className="font-semibold">₹{advanceUsed.toLocaleString('en-IN')}</span>
          </div>
          <div className="border-t border-gray-400 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Net Amount {netPayable >= 0 ? 'Payable to You' : 'Recoverable from You'}:</span>
              <span className={`font-bold text-xl ${netPayable >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{Math.abs(netPayable).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Important Notes</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• All expenses must be supported by valid receipts/bills</li>
              <li>• Corporate card transactions will be auto-matched with card statements</li>
              <li>• Personal card expenses will be reimbursed after approval</li>
              <li>• Advance settlement will be processed with final payment</li>
              <li>• Per-diem rates apply for meals if no bills are provided</li>
              <li>• GST input credit eligible expenses must have GSTIN mentioned on bills</li>
            </ul>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          disabled={submitting}
          className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveDraft}
          disabled={submitting}
          className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium disabled:opacity-60"
        >
          Save as Draft
        </button>
        <button
          onClick={handleSubmitExpenses}
          disabled={submitting}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit for Approval'}
        </button>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Add Expense Item</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="accommodation">Accommodation</option>
                    <option value="meals">Meals</option>
                    <option value="transport">Transport</option>
                    <option value="fuel">Fuel</option>
                    <option value="parking">Parking</option>
                    <option value="toll">Toll</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={newExpense.description || ''}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="Describe the expense..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    value={newExpense.amount || ''}
                    onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number *</label>
                  <input
                    type="text"
                    value={newExpense.billNumber || ''}
                    onChange={(e) => setNewExpense({...newExpense, billNumber: e.target.value})}
                    placeholder="INV-12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
                <select
                  value={newExpense.paymentMode}
                  onChange={(e) => setNewExpense({...newExpense, paymentMode: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="corporate_card">Corporate Card</option>
                  <option value="personal_card">Personal Card</option>
                  <option value="advance">From Advance</option>
                </select>
              </div>

              {(newExpense.paymentMode === 'corporate_card' || newExpense.paymentMode === 'personal_card') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Last 4 Digits</label>
                  <input
                    type="text"
                    value={newExpense.cardLastDigits || ''}
                    onChange={(e) => setNewExpense({...newExpense, cardLastDigits: e.target.value})}
                    placeholder="4523"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasReceipt"
                  checked={newExpense.hasReceipt}
                  onChange={(e) => setNewExpense({...newExpense, hasReceipt: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="hasReceipt" className="text-sm text-gray-700">Receipt/Bill available for upload</label>
              </div>

              {newExpense.hasReceipt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Receipt</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-500 cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (max 5MB)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
