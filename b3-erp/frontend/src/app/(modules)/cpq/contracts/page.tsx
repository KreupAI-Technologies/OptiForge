'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Loader2,
  AlertCircle,
  ScrollText,
  PlayCircle,
  CheckSquare,
  LayoutTemplate,
} from 'lucide-react';
import { cpqContractService, type Contract } from '@/services/cpq/cpq-contract.service';

const childLinks = [
  { href: '/cpq/contracts/generate', name: 'Generate Contract', description: 'Create a contract from a template', icon: FileText, color: 'bg-blue-500' },
  { href: '/cpq/contracts/templates', name: 'Templates', description: 'Manage reusable contract templates', icon: LayoutTemplate, color: 'bg-purple-500' },
  { href: '/cpq/contracts/clauses', name: 'Clause Library', description: 'Reusable legal clauses', icon: ScrollText, color: 'bg-indigo-500' },
  { href: '/cpq/contracts/approvals', name: 'Approvals', description: 'Contracts awaiting approval', icon: CheckSquare, color: 'bg-orange-500' },
  { href: '/cpq/contracts/execution', name: 'Execution', description: 'Signature and execution tracking', icon: PlayCircle, color: 'bg-green-500' },
];

function statusColor(status: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'active' || s === 'executed') return 'bg-green-100 text-green-700 border-green-200';
  if (s.includes('pending')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  if (s === 'draft') return 'bg-gray-100 text-gray-700 border-gray-200';
  if (s === 'expired' || s === 'terminated') return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-blue-100 text-blue-700 border-blue-200';
}

export default function CPQContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await cpqContractService.findAllContracts();
        if (!cancelled) setContracts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load contracts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full h-full px-4 py-2">
      <div className="mb-3 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contracts</h2>
          <p className="text-sm text-gray-600 mt-1">Manage contract lifecycle from generation to execution</p>
        </div>
        <Link
          href="/cpq/contracts/generate"
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Contract
        </Link>
      </div>

      {/* Child hub links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
        {childLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all flex items-start gap-3"
            >
              <div className={`${link.color} w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{link.name}</h3>
                <p className="text-xs text-gray-600">{link.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Contracts list */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Contracts</h3>
        </div>

        {error && (
          <div className="m-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 p-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading contracts…</span>
          </div>
        ) : contracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No contracts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contract #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.contractNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.customerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{c.contractType}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {c.currency} {Number(c.totalValue || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${statusColor(c.status)}`}>
                        {(c.status || '').replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
