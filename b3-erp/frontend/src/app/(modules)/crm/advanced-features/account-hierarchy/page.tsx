'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageToolbar, ConfirmDialog } from '@/components/ui';
import { AccountHierarchyTree } from '@/components/crm';
import type { AccountNode } from '@/components/crm';
import { AccountLinkModal, type AccountLink } from '@/components/modals';
import { ArrowLeft } from 'lucide-react';
import { crmService } from '@/services/crm.service';

const VALID_TYPES: AccountNode['type'][] = ['parent', 'subsidiary', 'branch', 'division', 'partner'];
const VALID_STATUS: AccountNode['status'][] = ['active', 'inactive', 'pending'];

function mapType(raw: any): AccountNode['type'] {
  const t = String(raw ?? '').toLowerCase();
  return (VALID_TYPES.includes(t as AccountNode['type']) ? t : 'parent') as AccountNode['type'];
}

function mapStatus(raw: any): AccountNode['status'] {
  const s = String(raw ?? '').toLowerCase();
  return (VALID_STATUS.includes(s as AccountNode['status']) ? s : 'active') as AccountNode['status'];
}

function toNode(c: any): AccountNode & { __parentId?: string | null } {
  return {
    id: String(c?.id ?? c?._id ?? c?.customerId ?? ''),
    name: c?.name ?? c?.customerName ?? c?.companyName ?? 'Unnamed Account',
    type: mapType(c?.type ?? c?.accountType ?? c?.relationshipType),
    industry: c?.industry ?? undefined,
    location: c?.location ?? c?.address ?? c?.city ?? c?.country ?? '',
    contactPerson: c?.contactPerson ?? c?.primaryContact ?? c?.contactName ?? '',
    email: c?.email ?? c?.contactEmail ?? '',
    phone: c?.phone ?? c?.contactPhone ?? c?.mobile ?? '',
    website: c?.website ?? undefined,
    employees: c?.employees != null ? Number(c.employees) : undefined,
    annualRevenue: c?.annualRevenue != null ? Number(c.annualRevenue) : undefined,
    accountValue: Number(c?.accountValue ?? c?.value ?? c?.revenue ?? 0),
    activeContracts: Number(c?.activeContracts ?? c?.contracts ?? 0),
    relationshipStart: c?.relationshipStart ?? c?.createdAt ?? c?.since ?? '',
    status: mapStatus(c?.status),
    children: Array.isArray(c?.children) ? c.children.map(toNode) : undefined,
    __parentId:
      c?.parentId ?? c?.parent?.id ?? c?.parentCustomerId ?? (typeof c?.parent === 'string' ? c.parent : null),
  };
}

/**
 * Build a tree from customer records. If the data already contains nested
 * `children`, that structure is preserved. Otherwise a tree is assembled from
 * flat data via parentId references.
 */
function buildTree(raw: any[]): AccountNode | null {
  const list = Array.isArray(raw) ? raw : [];
  if (list.length === 0) return null;

  const nodes = list.map(toNode);

  // If any node already has children, treat input as already-nested: return roots.
  const hasNested = nodes.some((n) => Array.isArray(n.children) && n.children.length > 0);
  if (hasNested) {
    const roots = nodes.filter((n) => !n.__parentId);
    return wrap(roots.length > 0 ? roots : nodes);
  }

  // Flat -> tree via parentId.
  const byId = new Map<string, AccountNode & { __parentId?: string | null }>();
  nodes.forEach((n) => {
    n.children = [];
    byId.set(n.id, n);
  });

  const roots: AccountNode[] = [];
  nodes.forEach((n) => {
    const pid = n.__parentId ? String(n.__parentId) : null;
    if (pid && byId.has(pid)) {
      const parent = byId.get(pid)!;
      (parent.children as AccountNode[]).push(n);
    } else {
      roots.push(n);
    }
  });

  return wrap(roots);
}

/** Ensure a single root node; if multiple roots exist, wrap them under a synthetic parent. */
function wrap(roots: AccountNode[]): AccountNode | null {
  if (roots.length === 0) return null;
  if (roots.length === 1) return roots[0];
  return {
    id: 'root',
    name: 'All Accounts',
    type: 'parent',
    location: '',
    contactPerson: '',
    email: '',
    phone: '',
    accountValue: roots.reduce((sum, r) => sum + (Number(r.accountValue) || 0), 0),
    activeContracts: roots.reduce((sum, r) => sum + (Number(r.activeContracts) || 0), 0),
    relationshipStart: '',
    status: 'active',
    children: roots,
  };
}

export default function AccountHierarchyPage() {
  const router = useRouter();
  const [showAccountLinkModal, setShowAccountLinkModal] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState<string | undefined>();
  const [rootAccount, setRootAccount] = useState<AccountNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        let data: any[] = [];
        try {
          const res = await crmService.customers.getHierarchy();
          data = Array.isArray(res) ? res : [];
        } catch {
          data = [];
        }

        // Fall back to flat customer list if hierarchy endpoint returned nothing.
        if (data.length === 0) {
          const res = await crmService.customers.getAll();
          data = Array.isArray(res) ? res : [];
        }

        if (cancelled) return;
        setRootAccount(buildTree(data));
      } catch (err: any) {
        if (cancelled) return;
        setLoadError(err?.message ?? 'Failed to load account hierarchy.');
        setRootAccount(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddChild = (id: string) => {
    console.log('Adding child to account:', id);
  };

  const handleEditAccount = (id: string) => {
    console.log('Editing account:', id);
  };

  const handleViewAccount = (id: string) => {
    console.log('Viewing account details:', id);
  };

  const handleLinkAccount = (id: string) => {
    setCurrentAccountId(id);
    setShowAccountLinkModal(true);
  };

  const handleSaveAccountLink = (link: AccountLink) => {
    console.log('Account linked:', link);
    setShowAccountLinkModal(false);
    setCurrentAccountId(undefined);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">

      <div className="flex-1 px-3 py-2 overflow-auto">
        <button
          onClick={() => router.push('/crm/advanced-features')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Advanced Features
        </button>

        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Hierarchy Visualization</h2>
          <p className="text-gray-600 mb-2">
            Visual representation of parent companies, subsidiaries, branches, and divisions with full
            contact and financial details.
          </p>
          {rootAccount ? (
            <AccountHierarchyTree
              rootAccount={rootAccount}
              onAddChild={handleAddChild}
              onEdit={handleEditAccount}
              onView={handleViewAccount}
              onLink={handleLinkAccount}
              showActions={true}
              expandAll={false}
            />
          ) : (
            !isLoading && (
              <div className="py-8 text-center text-sm text-gray-500">No account hierarchy data available.</div>
            )
          )}
        </div>
      </div>

      <AccountLinkModal
        isOpen={showAccountLinkModal}
        onClose={() => {
          setShowAccountLinkModal(false);
          setCurrentAccountId(undefined);
        }}
        onSave={handleSaveAccountLink}
        currentAccountId={currentAccountId}
        mode="add"
      />
    </div>
  );
}
