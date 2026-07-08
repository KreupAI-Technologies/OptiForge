'use client';

import { AlertCircle, Loader2, Inbox } from 'lucide-react';

interface CrmDataStateProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  loadingText?: string;
  emptyText?: string;
  className?: string;
}

/**
 * Shared inline status banner for CRM advanced-feature panels.
 * Renders a loading spinner, an error message, or an empty-state hint.
 * Returns null when there is real data to show (loading=false, no error,
 * empty=false), letting the host component render its normal content.
 */
export default function CrmDataState({
  loading = false,
  error = null,
  empty = false,
  loadingText = 'Loading…',
  emptyText = 'No records found.',
  className = '',
}: CrmDataStateProps) {
  if (loading) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 ${className}`}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {loadingText}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${className}`}
      >
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (empty) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 ${className}`}
      >
        <Inbox className="h-4 w-4" />
        {emptyText}
      </div>
    );
  }

  return null;
}
