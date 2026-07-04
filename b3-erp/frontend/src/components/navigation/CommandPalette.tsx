'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Command,
  ArrowRight,
  FileText,
  Settings,
  Users,
  Package,
  Factory,
  ShoppingCart,
  DollarSign,
  Truck,
  BarChart3,
  Clock,
  Star,
  Hash,
  Zap,
  X,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

// Types
export type CommandCategory = 'page' | 'action' | 'recent' | 'favorite' | 'search';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: CommandCategory;
  icon?: React.ReactNode;
  href?: string;
  action?: () => void;
  keywords?: string[];
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  recentPages?: CommandItem[];
  favoritePages?: CommandItem[];
  onSearch?: (query: string) => Promise<CommandItem[]>;
}

// Default navigation items
const defaultNavigationItems: CommandItem[] = [
  // Dashboard
  { id: 'dashboard', title: 'Dashboard', subtitle: 'Main overview', category: 'page', href: '/dashboard', icon: <BarChart3 className="w-4 h-4" />, keywords: ['home', 'overview'] },

  // Production
  { id: 'production', title: 'Production', subtitle: 'Manufacturing operations', category: 'page', href: '/production', icon: <Factory className="w-4 h-4" />, keywords: ['manufacturing', 'factory'] },
  { id: 'production-orders', title: 'Production Orders', subtitle: 'View all production orders', category: 'page', href: '/production/orders', icon: <Factory className="w-4 h-4" />, keywords: ['work orders', 'manufacturing'] },
  { id: 'production-scheduling', title: 'Production Scheduling', subtitle: 'Schedule production runs', category: 'page', href: '/production/scheduling', icon: <Factory className="w-4 h-4" />, keywords: ['schedule', 'planning'] },

  // Inventory
  { id: 'inventory', title: 'Inventory', subtitle: 'Stock management', category: 'page', href: '/inventory', icon: <Package className="w-4 h-4" />, keywords: ['stock', 'warehouse'] },
  { id: 'inventory-items', title: 'Inventory Items', subtitle: 'View all inventory items', category: 'page', href: '/inventory/items', icon: <Package className="w-4 h-4" />, keywords: ['products', 'materials'] },
  { id: 'inventory-movements', title: 'Stock Movements', subtitle: 'Track inventory movements', category: 'page', href: '/inventory/movements', icon: <Package className="w-4 h-4" />, keywords: ['transfer', 'receipt'] },

  // Sales
  { id: 'sales', title: 'Sales', subtitle: 'Sales management', category: 'page', href: '/sales', icon: <ShoppingCart className="w-4 h-4" />, keywords: ['orders', 'customers'] },
  { id: 'sales-orders', title: 'Sales Orders', subtitle: 'View all sales orders', category: 'page', href: '/sales/orders', icon: <ShoppingCart className="w-4 h-4" />, keywords: ['orders'] },
  { id: 'sales-quotations', title: 'Quotations', subtitle: 'Manage quotations', category: 'page', href: '/sales/quotations', icon: <FileText className="w-4 h-4" />, keywords: ['quotes', 'proposals'] },

  // Procurement
  { id: 'procurement', title: 'Procurement', subtitle: 'Purchasing management', category: 'page', href: '/procurement', icon: <Truck className="w-4 h-4" />, keywords: ['purchasing', 'vendors'] },
  { id: 'purchase-orders', title: 'Purchase Orders', subtitle: 'View purchase orders', category: 'page', href: '/procurement/purchase-orders', icon: <Truck className="w-4 h-4" />, keywords: ['PO', 'buying'] },

  // CRM
  { id: 'crm', title: 'CRM', subtitle: 'Customer relationships', category: 'page', href: '/crm', icon: <Users className="w-4 h-4" />, keywords: ['customers', 'leads'] },
  { id: 'crm-contacts', title: 'Contacts', subtitle: 'Manage contacts', category: 'page', href: '/crm/contacts', icon: <Users className="w-4 h-4" />, keywords: ['people', 'directory'] },
  { id: 'crm-leads', title: 'Leads', subtitle: 'Sales leads', category: 'page', href: '/crm/leads', icon: <Users className="w-4 h-4" />, keywords: ['prospects', 'opportunities'] },

  // Accounts
  { id: 'accounts', title: 'Accounts', subtitle: 'Financial management', category: 'page', href: '/crm/advanced-features/accounts', icon: <DollarSign className="w-4 h-4" />, keywords: ['finance', 'accounting'] },
  { id: 'accounts-ledger', title: 'General Ledger', subtitle: 'Account ledgers', category: 'page', href: '/accounts/ledger', icon: <DollarSign className="w-4 h-4" />, keywords: ['GL', 'books'] },

  // Settings
  { id: 'settings', title: 'Settings', subtitle: 'System configuration', category: 'page', href: '/settings', icon: <Settings className="w-4 h-4" />, keywords: ['config', 'preferences'] },
  { id: 'design-system', title: 'Design System', subtitle: 'UI documentation & themes', category: 'page', href: '/design-system', icon: <Settings className="w-4 h-4" />, keywords: ['theme', 'branding'] },
];

// Quick actions
const quickActions: CommandItem[] = [
  { id: 'action-new-order', title: 'Create Sales Order', subtitle: 'Start a new sales order', category: 'action', icon: <Zap className="w-4 h-4" />, href: '/sales/orders/new', shortcut: 'O' },
  { id: 'action-new-po', title: 'Create Purchase Order', subtitle: 'Start a new purchase order', category: 'action', icon: <Zap className="w-4 h-4" />, href: '/procurement/orders/new', shortcut: 'P' },
  { id: 'action-new-production', title: 'Create Production Order', subtitle: 'Start a new production run', category: 'action', icon: <Zap className="w-4 h-4" />, href: '/production/orders/new', shortcut: 'M' },
  { id: 'action-new-contact', title: 'Add Contact', subtitle: 'Create a new contact', category: 'action', icon: <Zap className="w-4 h-4" />, href: '/crm/contacts/new', shortcut: 'C' },
];

const categoryLabels: Record<CommandCategory, string> = {
  recent: 'Recent',
  favorite: 'Favorites',
  action: 'Quick Actions',
  page: 'Pages',
  search: 'Search Results',
};

const categoryIcons: Record<CommandCategory, React.ReactNode> = {
  recent: <Clock className="w-3 h-3" />,
  favorite: <Star className="w-3 h-3" />,
  action: <Zap className="w-3 h-3" />,
  page: <FileText className="w-3 h-3" />,
  search: <Search className="w-3 h-3" />,
};

export function CommandPalette({
  isOpen,
  onClose,
  recentPages = [],
  favoritePages = [],
  onSearch,
}: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<CommandItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    const allItems = [
      ...recentPages.map(p => ({ ...p, category: 'recent' as CommandCategory })),
      ...favoritePages.map(p => ({ ...p, category: 'favorite' as CommandCategory })),
      ...quickActions,
      ...defaultNavigationItems,
    ];

    if (!query.trim()) {
      // Show recent, favorites, and quick actions when no query
      const recent = recentPages.slice(0, 5).map(p => ({ ...p, category: 'recent' as CommandCategory }));
      const favorites = favoritePages.slice(0, 5).map(p => ({ ...p, category: 'favorite' as CommandCategory }));
      return [...recent, ...favorites, ...quickActions.slice(0, 4)];
    }

    const lowerQuery = query.toLowerCase();
    const matches = allItems.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(lowerQuery);
      const subtitleMatch = item.subtitle?.toLowerCase().includes(lowerQuery);
      const keywordMatch = item.keywords?.some(k => k.toLowerCase().includes(lowerQuery));
      return titleMatch || subtitleMatch || keywordMatch;
    });

    // Include search results if available
    return [...matches, ...searchResults];
  }, [query, recentPages, favoritePages, searchResults]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<CommandCategory, CommandItem[]> = {
      recent: [],
      favorite: [],
      action: [],
      page: [],
      search: [],
    };

    filteredItems.forEach(item => {
      if (groups[item.category]) {
        groups[item.category].push(item);
      }
    });

    return groups;
  }, [filteredItems]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => {
    const order: CommandCategory[] = ['recent', 'favorite', 'action', 'page', 'search'];
    return order.flatMap(cat => groupedItems[cat]);
  }, [groupedItems]);

  // Handle search
  useEffect(() => {
    if (query.trim() && onSearch) {
      setIsSearching(true);
      const timeoutId = setTimeout(async () => {
        try {
          const results = await onSearch(query);
          setSearchResults(results);
        } catch (e) {
          console.error('Search failed:', e);
        } finally {
          setIsSearching(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [query, onSearch]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setSearchResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, flatItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        const selectedItem = flatItems[selectedIndex];
        if (selectedItem) {
          executeItem(selectedItem);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [flatItems, selectedIndex, onClose]);

  // Execute selected item
  const executeItem = (item: CommandItem) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
    onClose();
  };

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  let itemIndex = -1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative min-h-screen flex items-start justify-center pt-[15vh] px-4">
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, actions, or type a command..."
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-lg"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
              <Command className="w-3 h-3" />K
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
            {flatItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    Searching...
                  </div>
                ) : (
                  <>No results found for "{query}"</>
                )}
              </div>
            ) : (
              (['recent', 'favorite', 'action', 'page', 'search'] as CommandCategory[]).map(category => {
                const items = groupedItems[category];
                if (items.length === 0) return null;

                return (
                  <div key={category} className="py-2">
                    <div className="px-4 py-1 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {categoryIcons[category]}
                      {categoryLabels[category]}
                    </div>
                    {items.map((item) => {
                      itemIndex++;
                      const currentIndex = itemIndex;
                      const isSelected = currentIndex === selectedIndex;

                      return (
                        <button
                          key={item.id}
                          data-index={currentIndex}
                          onClick={() => executeItem(item)}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className={`flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                            {item.icon || <Hash className="w-4 h-4" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{item.title}</div>
                            {item.subtitle && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                          {item.shortcut && (
                            <kbd className="flex-shrink-0 px-2 py-0.5 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
                              {item.shortcut}
                            </kbd>
                          )}
                          {isSelected && (
                            <ArrowRight className="w-4 h-4 flex-shrink-0 text-blue-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  <ArrowDown className="w-3 h-3" />
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" />
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-[10px]">ESC</span>
                  Close
                </span>
              </div>
              <div>
                {flatItems.length} results
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage command palette
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
}

export type { CommandPaletteProps };
