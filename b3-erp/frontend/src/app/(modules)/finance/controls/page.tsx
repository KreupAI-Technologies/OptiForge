'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shield, FileCheck, History, RefreshCw, ArrowRight } from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

export default function ControlsPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [workflows, documents, auditTrail] = await Promise.all([
          FinanceService.getApprovalWorkflows().catch(() => []),
          FinanceService.getDocuments().catch(() => []),
          FinanceService.getAuditTrail().catch(() => []),
        ]);
        if (!cancelled) {
          setCounts({
            'Approval Workflows': (workflows || []).length,
            'Document Management': (documents || []).length,
            'Audit Trail': (auditTrail || []).length,
          });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load controls data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const modules = [
    {
      title: 'Approval Workflows',
      description: 'Configure approval hierarchies and workflow rules for financial transactions',
      href: '/finance/controls/approval-workflows',
      icon: Shield,
      color: 'blue',
    },
    {
      title: 'Document Management',
      description: 'Organize and manage supporting documents for financial transactions',
      href: '/finance/controls/documents',
      icon: FileCheck,
      color: 'green',
    },
    {
      title: 'Audit Trail',
      description: 'Track all changes and maintain complete audit history',
      href: '/finance/controls/audit-trail',
      icon: History,
      color: 'purple',
    },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full px-3 py-2 ">
          <div className="w-full space-y-3">
            {loading && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <RefreshCw className="h-4 w-4 animate-spin" /> Loading controls configuration…
              </div>
            )}
            {error && !loading && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load live counts: {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {modules.map((module) => (
                <Link key={module.title} href={module.href}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-lg hover:border-blue-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 bg-${module.color}-100 rounded-lg flex items-center justify-center`}>
                      <module.icon className={`w-6 h-6 text-${module.color}-600`} />
                    </div>
                    {!loading && !error && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                        {counts[module.title] ?? 0}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{module.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                  <div className="flex items-center text-blue-600 font-medium text-sm">
                    <span>Configure</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
