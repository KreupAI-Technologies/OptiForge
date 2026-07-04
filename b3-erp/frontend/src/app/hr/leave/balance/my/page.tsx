'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, TrendingUp, Clock, CheckCircle, AlertCircle, Plus, Download, History } from 'lucide-react';
import { LeaveBalance, LeaveTransaction } from '@/data/hr/leave-balances';
import { LeaveService } from '@/services/leave.service';
import { StatusBadge } from '@/components/ui/StatusBadge';

const MY_STATUS_MAP: Record<string, LeaveTransaction['status']> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  WITHDRAWN: 'withdrawn',
};

export default function MyLeaveBalancePage() {
  const router = useRouter();
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [transactions, setTransactions] = useState<LeaveTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [rawBalances, rawApps] = await Promise.all([
          LeaveService.getAllLeaveBalances() as Promise<any[]>,
          LeaveService.getAllLeaveApplicationsRaw() as Promise<any[]>,
        ]);
        const mappedBalances: LeaveBalance[] = rawBalances.map((r) => ({
          id: r.id,
          employeeId: r.employeeId ?? '',
          employeeName: r.employee?.fullName ?? r.employeeName ?? '',
          employeeCode: r.employee?.employeeCode ?? r.employeeCode ?? '',
          department: r.employee?.departmentName ?? r.department ?? '',
          designation: r.employee?.designation ?? r.designation ?? '',
          leaveTypeId: r.leaveTypeId ?? '',
          leaveTypeCode: r.leaveType?.code ?? r.leaveTypeCode ?? '',
          leaveTypeName: r.leaveType?.name ?? r.leaveTypeName ?? '',
          leaveTypeIcon: '📅',
          leaveTypeColor: r.leaveType?.color ?? 'bg-gray-100 text-gray-800',
          totalEntitlement: Number(r.allocated ?? 0) + Number(r.openingBalance ?? 0) + Number(r.earned ?? 0),
          opening: Number(r.openingBalance ?? 0),
          accrued: Number(r.earned ?? r.allocated ?? 0),
          taken: Number(r.used ?? 0),
          pending: Number(r.pending ?? 0),
          balance: Number(r.available ?? 0),
          carryForward: Number(r.carriedForward ?? 0),
          encashable: Number(r.encashed ?? 0),
          year: Number(r.year ?? new Date().getFullYear()),
          lastUpdated: r.updatedAt ?? '',
        }));
        const mappedApps: LeaveTransaction[] = rawApps.map((r) => ({
          id: r.id,
          employeeId: r.employeeId ?? '',
          employeeName: r.employeeName ?? r.employee?.fullName,
          leaveTypeCode: r.leaveTypeCode ?? r.leaveType?.code ?? '',
          leaveTypeName: r.leaveTypeName ?? r.leaveType?.name ?? '',
          fromDate: r.startDate ?? r.fromDate ?? '',
          toDate: r.endDate ?? r.toDate ?? '',
          days: Number(r.totalDays ?? r.days ?? 0),
          durationType: 'full-day',
          reason: r.reason ?? '',
          status: MY_STATUS_MAP[r.status] ?? 'pending',
          appliedOn: r.appliedAt ?? r.createdAt ?? '',
          approvedBy: r.approverName ?? r.approvedBy,
          approvedOn: r.approvedAt,
          hasAttachment: !!r.attachmentUrl,
        }));
        if (!cancelled) {
          setLeaveBalances(mappedBalances);
          setTransactions(mappedApps);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load leave balance');
          setLeaveBalances([]);
          setTransactions([]);
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

  // Consistent date formatter to avoid hydration errors
  const formatDate = (dateString: string, includeYear = false) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return includeYear ? `${day} ${month} ${year}` : `${day} ${month}`;
  };

  // Calculate totals
  const totalEntitlement = leaveBalances.reduce((sum, lb) => sum + lb.totalEntitlement, 0);
  const totalTaken = leaveBalances.reduce((sum, lb) => sum + lb.taken, 0);
  const totalBalance = leaveBalances.reduce((sum, lb) => sum + lb.balance, 0);
  const totalPending = leaveBalances.reduce((sum, lb) => sum + lb.pending, 0);
  const totalEncashable = leaveBalances.reduce((sum, lb) => sum + lb.encashable, 0);

  // Get leave with highest balance
  const highestBalance = [...leaveBalances].sort((a, b) => b.balance - a.balance)[0];

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-green-600" />
            My Leave Balance
          </h1>
          <p className="text-gray-600 mt-1">View your leave entitlements, balances, and transaction history</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => console.log('Download Report')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
          <button
            onClick={() => {
              console.log('Navigating to apply leave page...');
              router.push('/hr/leave/apply');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Leave</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-blue-700 font-medium">Total Entitlement</div>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-900">{totalEntitlement}</div>
          <div className="text-xs text-blue-600 mt-1">days per year</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-green-700 font-medium">Available Balance</div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-900">{totalBalance}</div>
          <div className="text-xs text-green-600 mt-1">days remaining</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-red-700 font-medium">Leaves Taken</div>
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-900">{totalTaken}</div>
          <div className="text-xs text-red-600 mt-1">days used</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-yellow-700 font-medium">Pending Approval</div>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-900">{totalPending}</div>
          <div className="text-xs text-yellow-600 mt-1">days awaiting</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-purple-700 font-medium">Encashable</div>
            <AlertCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-900">{totalEncashable}</div>
          <div className="text-xs text-purple-600 mt-1">days available</div>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {leaveBalances.map((leave) => {
          const utilizationPercentage = leave.totalEntitlement > 0
            ? Math.round((leave.taken / leave.totalEntitlement) * 100)
            : 0;

          const balancePercentage = leave.totalEntitlement > 0
            ? Math.round((leave.balance / leave.totalEntitlement) * 100)
            : 0;

          return (
            <div key={leave.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{leave.leaveTypeIcon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{leave.leaveTypeName}</h3>
                    <p className="text-xs text-gray-500 font-mono">{leave.leaveTypeCode}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${leave.leaveTypeColor}`}>
                  {leave.leaveTypeCode}
                </span>
              </div>

              {/* Balance Display */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Entitlement</div>
                  <div className="text-2xl font-bold text-gray-900">{leave.totalEntitlement}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Balance</div>
                  <div className="text-2xl font-bold text-green-600">{leave.balance}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Utilization</span>
                  <span className="font-medium">{utilizationPercentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                    style={{ width: `${utilizationPercentage}%` }}
                  />
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-4 gap-2 text-center py-3 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Opening</div>
                  <div className="text-sm font-semibold text-gray-700">{leave.opening}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Accrued</div>
                  <div className="text-sm font-semibold text-gray-700">{leave.accrued}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Taken</div>
                  <div className="text-sm font-semibold text-red-600">{leave.taken}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Pending</div>
                  <div className="text-sm font-semibold text-yellow-600">{leave.pending}</div>
                </div>
              </div>

              {/* Features */}
              {(leave.carryForward > 0 || leave.encashable > 0) && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                  {leave.carryForward > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      CF: {leave.carryForward} days
                    </span>
                  )}
                  {leave.encashable > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                      Encash: {leave.encashable} days
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Leave Transaction History */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Leave Transactions</h2>
          </div>
          <button
            onClick={() => console.log('View All')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-blue-600 font-semibold">{transaction.leaveTypeCode}</span>
                      <span className="text-sm text-gray-900">{transaction.leaveTypeName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(transaction.fromDate)}
                      {transaction.fromDate !== transaction.toDate && (
                        <> - {formatDate(transaction.toDate, true)}</>
                      )}
                      {transaction.fromDate === transaction.toDate && (
                        <> {new Date(transaction.fromDate).getFullYear()}</>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                      {transaction.days}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700 max-w-xs truncate">{transaction.reason}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.appliedOn, true)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <StatusBadge status={transaction.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="p-8 text-center">
            <History className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No leave transactions found</p>
          </div>
        )}
      </div>

      {/* Information Panel */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Leave Balance Information
        </h3>
        <ul className="text-sm text-green-800 space-y-1 ml-7">
          <li>• Your highest available balance is in <strong>{highestBalance?.leaveTypeName}</strong> ({highestBalance?.balance} days)</li>
          <li>• Leave balances are updated in real-time after approval</li>
          <li>• Carry forward leaves will be added to next year's opening balance</li>
          <li>• You can encash {totalEncashable} days of accumulated leave</li>
          <li>• For shift workers, compensatory off credits are automatically added after overtime/holiday work</li>
        </ul>
      </div>
    </div>
  );
}
