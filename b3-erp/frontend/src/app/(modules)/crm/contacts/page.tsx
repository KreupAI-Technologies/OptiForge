'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Trash2, Phone, Mail, Building2, User, Users, Star, TrendingUp, ChevronLeft, ChevronRight, Download, Upload, Filter, Save, Check, UserPlus, List, X, Linkedin, Calendar, MapPin, Briefcase, Clock, FileSpreadsheet } from 'lucide-react';
import { ConfirmDialog, useToast } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { ContactService, Contact, ContactRole, Department, ContactRoleData } from '@/services/contact.service';
import { crmService } from '@/services/crm.service';

interface ContactList {
  id: string;
  name: string;
  description: string;
  contactCount: number;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: {
    status: string;
    role: string;
    department: string;
    customer: string;
    location: string;
    dateFrom: string;
    dateTo: string;
  };
}

const statusColors = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  vip: 'bg-purple-100 text-purple-700',
};

const typeColors = {
  primary: 'bg-blue-100 text-blue-700',
  secondary: 'bg-indigo-100 text-indigo-700',
  billing: 'bg-orange-100 text-orange-700',
  technical: 'bg-teal-100 text-teal-700',
};

const roleColors: Record<ContactRole, string> = {
  'Decision Maker': 'bg-purple-100 text-purple-700 border-purple-300',
  'Influencer': 'bg-blue-100 text-blue-700 border-blue-300',
  'User': 'bg-green-100 text-green-700 border-green-300',
  'Gatekeeper': 'bg-orange-100 text-orange-700 border-orange-300',
  'Technical Buyer': 'bg-teal-100 text-teal-700 border-teal-300',
  'Economic Buyer': 'bg-indigo-100 text-indigo-700 border-indigo-300',
};

const allRoles: ContactRole[] = ['Decision Maker', 'Influencer', 'User', 'Gatekeeper', 'Technical Buyer', 'Economic Buyer'];
const allDepartments: Department[] = ['Sales', 'Marketing', 'IT', 'Finance', 'Operations', 'HR', 'Executive'];

export default function ContactsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSaveFilterDialog, setShowSaveFilterDialog] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [filterName, setFilterName] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAddToListDialog, setShowAddToListDialog] = useState(false);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [showCreateListForm, setShowCreateListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState<string | null>(null);
  const [showAddRoleDialog, setShowAddRoleDialog] = useState<string | null>(null);
  const [newRoleData, setNewRoleData] = useState<{ role: ContactRole; department: Department }>({
    role: 'User',
    department: 'Sales'
  });

  const itemsPerPage = 10;

  // Fetch contacts data on mount
  useEffect(() => {
    async function fetchContacts() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ContactService.getAllContacts();
        setContacts(data);
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch contacts'));
        setContacts([]);
        addToast({
          title: 'Connection Error',
          message: 'Unable to connect to server. Please try again.',
          variant: 'warning'
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchContacts();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;

      if (e.key === 'd' || e.key === 'D') {
        if (selectedContacts.size > 0) {
          e.preventDefault();
          setShowBulkDeleteDialog(true);
        }
      } else if (e.key === 'e' || e.key === 'E') {
        if (selectedContacts.size > 0) {
          e.preventDefault();
          handleExport();
        }
      } else if (e.key === 'v' || e.key === 'V') {
        const firstSelected = Array.from(selectedContacts)[0];
        if (firstSelected) {
          e.preventDefault();
          const contact = contacts.find(c => c.id === firstSelected);
          if (contact) handleViewContact(contact);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedContacts, contacts]);

  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.firstName} ${contact.lastName}`;
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;

    const matchesRole = roleFilter === 'all' || contact.roles.some(r => r.role === roleFilter);

    const matchesDepartment = departmentFilter === 'all' || contact.department === departmentFilter;

    const matchesCustomer = customerFilter === 'all' || contact.company === customerFilter;

    const matchesLocation = locationFilter === 'all' || contact.location === locationFilter;

    let matchesDateRange = true;
    if (dateFromFilter && contact.lastContactDate) {
      matchesDateRange = matchesDateRange && contact.lastContactDate >= dateFromFilter;
    }
    if (dateToFilter && contact.lastContactDate) {
      matchesDateRange = matchesDateRange && contact.lastContactDate <= dateToFilter;
    }

    return matchesSearch && matchesStatus && matchesRole && matchesDepartment &&
           matchesCustomer && matchesLocation && matchesDateRange;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: contacts.length,
    active: contacts.filter((c) => c.status === 'active').length,
    vip: contacts.filter((c) => c.status === 'vip').length,
    totalValue: contacts.reduce((sum, c) => sum + c.value, 0),
  };

  // Get unique values for filters
  const uniqueCompanies = Array.from(new Set(contacts.map(c => c.company))).sort();
  const uniqueLocations = Array.from(new Set(contacts.map(c => c.location).filter(Boolean))).sort();

  const handleDeleteContact = (contact: Contact) => {
    setContactToDelete(contact);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (contactToDelete) {
      setContacts(contacts.filter((c) => c.id !== contactToDelete.id));
      setShowDeleteDialog(false);
      addToast({
        title: 'Contact Deleted',
        message: `${contactToDelete.firstName} ${contactToDelete.lastName} has been removed.`,
        variant: 'success'
      });
      setContactToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = () => {
    const deletedCount = selectedContacts.size;
    setContacts(contacts.filter((c) => !selectedContacts.has(c.id)));
    setSelectedContacts(new Set());
    setShowBulkDeleteDialog(false);
    addToast({
      title: 'Contacts Deleted',
      message: `${deletedCount} contact${deletedCount > 1 ? 's' : ''} deleted successfully.`,
      variant: 'success'
    });
  };

  const handleViewContact = (contact: Contact) => {
    router.push(`/crm/contacts/view/${contact.id}`);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === paginatedContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(paginatedContacts.map(c => c.id)));
    }
  };

  const handleSelectContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleExport = () => {
    const contactsToExport = selectedContacts.size > 0
      ? contacts.filter(c => selectedContacts.has(c.id))
      : filteredContacts;

    const csvContent = [
      ['First Name', 'Last Name', 'Company', 'Email', 'Phone', 'Position', 'Type', 'Status', 'Value', 'Roles', 'Department', 'Location', 'Last Contact'].join(','),
      ...contactsToExport.map(c => [
        c.firstName,
        c.lastName,
        c.company,
        c.email,
        c.phone,
        c.position,
        c.type,
        c.status,
        c.value,
        c.roles.map(r => r.role).join('; '),
        c.department || '',
        c.location || '',
        c.lastContactDate || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    addToast({
      title: 'Export Successful',
      message: `Exported ${contactsToExport.length} contact${contactsToExport.length > 1 ? 's' : ''} to CSV.`,
      variant: 'success'
    });
  };

  const handleUpdateRole = (contactId: string, newRole: ContactRole) => {
    setContacts(contacts.map(c => {
      if (c.id === contactId) {
        // If contact has no roles, add the new role
        if (c.roles.length === 0) {
          return {
            ...c,
            roles: [{ id: `r${Date.now()}`, role: newRole, department: c.department || 'Sales', isPrimary: true }]
          };
        }
        // Update primary role
        const updatedRoles = [...c.roles];
        const primaryRoleIndex = updatedRoles.findIndex(r => r.isPrimary);
        if (primaryRoleIndex !== -1) {
          updatedRoles[primaryRoleIndex] = { ...updatedRoles[primaryRoleIndex], role: newRole };
        }
        return { ...c, roles: updatedRoles };
      }
      return c;
    }));

    setShowRoleDropdown(null);
    addToast({
      title: 'Role Updated',
      message: 'Contact role updated successfully.',
      variant: 'success'
    });
  };

  const handleAddRole = (contactId: string) => {
    setContacts(contacts.map(c => {
      if (c.id === contactId) {
        const newRole: ContactRoleData = {
          id: `r${Date.now()}`,
          role: newRoleData.role,
          department: newRoleData.department,
          isPrimary: c.roles.length === 0
        };
        return { ...c, roles: [...c.roles, newRole] };
      }
      return c;
    }));

    setShowAddRoleDialog(null);
    setNewRoleData({ role: 'User', department: 'Sales' });
    addToast({
      title: 'Role Added',
      message: 'New role added to contact.',
      variant: 'success'
    });
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      addToast({
        title: 'Error',
        message: 'Please enter a filter name.',
        variant: 'error'
      });
      return;
    }

    const newFilter: SavedFilter = {
      id: `filter_${Date.now()}`,
      name: filterName,
      filters: {
        status: statusFilter,
        role: roleFilter,
        department: departmentFilter,
        customer: customerFilter,
        location: locationFilter,
        dateFrom: dateFromFilter,
        dateTo: dateToFilter,
      }
    };

    setSavedFilters([...savedFilters, newFilter]);
    setShowSaveFilterDialog(false);
    setFilterName('');
    addToast({
      title: 'Filter Saved',
      message: `Filter "${newFilter.name}" saved successfully.`,
      variant: 'success'
    });
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    setStatusFilter(filter.filters.status);
    setRoleFilter(filter.filters.role);
    setDepartmentFilter(filter.filters.department);
    setCustomerFilter(filter.filters.customer);
    setLocationFilter(filter.filters.location);
    setDateFromFilter(filter.filters.dateFrom);
    setDateToFilter(filter.filters.dateTo);
    addToast({
      title: 'Filter Loaded',
      message: `Filter "${filter.name}" applied.`,
      variant: 'success'
    });
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setRoleFilter('all');
    setDepartmentFilter('all');
    setCustomerFilter('all');
    setLocationFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
    addToast({
      title: 'Filters Cleared',
      message: 'All filters have been reset.',
      variant: 'info'
    });
  };

  const getImpactAnalysis = (contact: Contact) => {
    // Mock impact data - in real app, this would come from the backend
    return [
      { label: 'Activities', count: Math.floor(Math.random() * 20) + 5 },
      { label: 'Meetings Scheduled', count: Math.floor(Math.random() * 10) + 1 },
      { label: 'Emails Sent', count: Math.floor(Math.random() * 30) + 10 },
      { label: 'Opportunities Linked', count: Math.floor(Math.random() * 5) + 1 },
    ];
  };

  const getBulkImpactAnalysis = () => {
    const count = selectedContacts.size;
    return [
      { label: 'Contacts to Delete', count },
      { label: 'Total Activities', count: count * 15 },
      { label: 'Linked Opportunities', count: count * 2 },
    ];
  };

  // Refresh function
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const data = await ContactService.getAllContacts();
      setContacts(data);
      addToast({
        title: 'Refreshed',
        message: 'Contact data has been refreshed.',
        variant: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Refresh Failed',
        message: 'Unable to refresh data. Please try again.',
        variant: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load contact lists from backend when the Add-to-List dialog opens
  const fetchContactLists = async () => {
    try {
      setListsLoading(true);
      const data = await crmService.contactLists.getAll();
      const normalized: ContactList[] = (Array.isArray(data) ? data : []).map((l: any) => ({
        id: String(l.id),
        name: l.name ?? 'Untitled List',
        description: l.description ?? '',
        contactCount: l.contactCount ?? l.contacts?.length ?? 0,
      }));
      setContactLists(normalized);
    } catch (err) {
      console.error('Failed to fetch contact lists:', err);
      setContactLists([]);
    } finally {
      setListsLoading(false);
    }
  };

  useEffect(() => {
    if (showAddToListDialog) {
      fetchContactLists();
    }
  }, [showAddToListDialog]);

  const handleAddSelectedToList = async (list: ContactList) => {
    const count = selectedContacts.size;
    try {
      await crmService.contactLists.update(list.id, {
        contactIds: Array.from(selectedContacts),
      });
      addToast({
        title: 'Added to List',
        message: `${count} contact${count > 1 ? 's' : ''} added to "${list.name}".`,
        variant: 'success'
      });
      setShowAddToListDialog(false);
      setSelectedContacts(new Set());
    } catch (err) {
      addToast({
        title: 'Failed to Add',
        message: 'Unable to add contacts to the list. Please try again.',
        variant: 'error'
      });
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      addToast({ title: 'Error', message: 'Please enter a list name.', variant: 'error' });
      return;
    }
    try {
      const created = await crmService.contactLists.create({
        name: newListName.trim(),
        contactIds: Array.from(selectedContacts),
      });
      addToast({
        title: 'List Created',
        message: `List "${newListName.trim()}" created successfully.`,
        variant: 'success'
      });
      setNewListName('');
      setShowCreateListForm(false);
      await fetchContactLists();
      // Auto-assign selected contacts to the new list when possible
      if (selectedContacts.size > 0 && created?.id) {
        setShowAddToListDialog(false);
        setSelectedContacts(new Set());
      }
    } catch (err) {
      addToast({
        title: 'Failed to Create List',
        message: 'Unable to create the list. Please try again.',
        variant: 'error'
      });
    }
  };

  // Show loading skeleton on initial load
  if (isLoading && contacts.length === 0) {
    return (
      <div className="w-full h-full px-3 py-2">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-3 py-2 ">
      {/* Stats with Add Button */}
      <div className="mb-3 flex items-start gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Contacts</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Contacts</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.active}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">VIP Contacts</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{stats.vip}</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Total Value</p>
                <p className="text-2xl font-bold text-indigo-900 mt-1">${(stats.totalValue / 1000).toFixed(0)}K</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/crm/contacts/add')}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedContacts.size > 0 && (
        <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedContacts.size} contact{selectedContacts.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedContacts(new Set())}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Selection
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddToListDialog(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <List className="h-4 w-4" />
              <span>Add to List</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-3 py-2 bg-white text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 px-3 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="mb-3 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="vip">VIP</option>
          </select>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
              showAdvancedFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </button>
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  {allRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Departments</option>
                  {allDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer/Account</label>
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Customers</option>
                  {uniqueCompanies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Contact From</label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Contact To</label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSaveFilterDialog(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Filter</span>
                </button>
                {savedFilters.length > 0 && (
                  <select
                    onChange={(e) => {
                      const filter = savedFilters.find(f => f.id === e.target.value);
                      if (filter) handleLoadFilter(filter);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Load Saved Filter...</option>
                    {savedFilters.map(filter => (
                      <option key={filter.id} value={filter.id}>{filter.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <button
                onClick={handleClearFilters}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
              >
                <X className="h-4 w-4" />
                <span>Clear All Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Info */}
      {selectedContacts.size > 0 && (
        <div className="mb-2 text-sm text-gray-600 flex items-center space-x-4">
          <span className="font-medium">Keyboard Shortcuts:</span>
          <span><kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">D</kbd> Delete</span>
          <span><kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">E</kbd> Export</span>
          <span><kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">V</kbd> View</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left">
                <input
                  type="checkbox"
                  checked={selectedContacts.size === paginatedContacts.length && paginatedContacts.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact Info</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quick Actions</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedContacts.map((contact) => (
              <tr
                key={contact.id}
                className={`hover:bg-gray-50 transition-colors ${
                  selectedContacts.has(contact.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedContacts.has(contact.id)}
                    onChange={() => handleSelectContact(contact.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{contact.firstName} {contact.lastName}</div>
                      {contact.location && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span>{contact.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-900">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span>{contact.company}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="truncate max-w-[200px]">{contact.email}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span>{contact.phone}</span>
                    </div>
                    {contact.lastContactDate && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>Last: {contact.lastContactDate}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">{contact.position}</div>
                    {contact.department && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Briefcase className="h-3 w-3" />
                        <span>{contact.department}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {contact.roles.length > 0 ? (
                      contact.roles.map((roleData, idx) => (
                        <div key={roleData.id} className="relative">
                          <button
                            onClick={() => setShowRoleDropdown(showRoleDropdown === `${contact.id}-${idx}` ? null : `${contact.id}-${idx}`)}
                            className={`px-2 py-1 text-xs font-semibold rounded-full border cursor-pointer hover:shadow-md transition-shadow ${roleColors[roleData.role]}`}
                          >
                            {roleData.role}
                            {roleData.isPrimary && ' *'}
                          </button>
                          {showRoleDropdown === `${contact.id}-${idx}` && (
                            <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                              <div className="py-1">
                                {allRoles.map(role => (
                                  <button
                                    key={role}
                                    onClick={() => handleUpdateRole(contact.id, role)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    {role}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No role</span>
                    )}
                    <button
                      onClick={() => setShowAddRoleDialog(contact.id)}
                      className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="space-y-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[contact.status]}`}>
                      {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                    </span>
                    <div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColors[contact.type]}`}>
                        {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => window.location.href = `tel:${contact.phone}`}
                      className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded transition-colors"
                      title="Call"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.location.href = `mailto:${contact.email}`}
                      className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                      title="Email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                    {contact.linkedIn && (
                      <button
                        onClick={() => window.open(contact.linkedIn, '_blank')}
                        className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {/* Schedule meeting */}}
                      className="p-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                      title="Schedule Meeting"
                    >
                      <Calendar className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleViewContact(contact)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => router.push(`/crm/contacts/edit/${contact.id}`)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredContacts.length)} of {filteredContacts.length} items
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete ${contactToDelete?.firstName} ${contactToDelete?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete Contact"
        variant="danger"
        impactAnalysis={contactToDelete ? getImpactAnalysis(contactToDelete) : undefined}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteDialog}
        onClose={() => setShowBulkDeleteDialog(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Contacts"
        message={`Are you sure you want to delete ${selectedContacts.size} contact${selectedContacts.size > 1 ? 's' : ''}? This action cannot be undone and will remove all associated data.`}
        confirmLabel="Delete Contacts"
        variant="danger"
        impactAnalysis={getBulkImpactAnalysis()}
      />

      {/* Save Filter Dialog */}
      {showSaveFilterDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Filter</h3>
            <input
              type="text"
              placeholder="Filter name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setShowSaveFilterDialog(false);
                  setFilterName('');
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Import Contacts</h3>
              <button
                onClick={() => setShowImportDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drop your CSV or Excel file here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports CSV, XLSX, and vCard formats
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Required Fields:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• First Name, Last Name</li>
                  <li>• Email or Phone (at least one)</li>
                  <li>• Company</li>
                </ul>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setShowImportDialog(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowImportDialog(false);
                    addToast({
                      title: 'Import Started',
                      message: 'Processing your file...',
                      variant: 'info'
                    });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to List Dialog */}
      {showAddToListDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Add to List</h3>
              <button
                onClick={() => setShowAddToListDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Add {selectedContacts.size} selected contact{selectedContacts.size > 1 ? 's' : ''} to a list
            </p>
            <div className="space-y-2 mb-2 max-h-64 overflow-y-auto">
              {listsLoading ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              ) : contactLists.length === 0 ? (
                <EmptyState
                  icon={List}
                  size="sm"
                  title="No contact lists yet"
                  description="Create your first list to organise these contacts."
                />
              ) : (
                contactLists.map(list => (
                  <button
                    key={list.id}
                    onClick={() => handleAddSelectedToList(list)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{list.name}</div>
                        {list.description && (
                          <div className="text-sm text-gray-500">{list.description}</div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{list.contactCount} contacts</div>
                    </div>
                  </button>
                ))
              )}
            </div>
            {showCreateListForm ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="New list name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCreateList}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  onClick={() => { setShowCreateListForm(false); setNewListName(''); }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateListForm(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Create New List</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Role Dialog */}
      {showAddRoleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Add Role</h3>
              <button
                onClick={() => setShowAddRoleDialog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newRoleData.role}
                  onChange={(e) => setNewRoleData({ ...newRoleData, role: e.target.value as ContactRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {allRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={newRoleData.department}
                  onChange={(e) => setNewRoleData({ ...newRoleData, department: e.target.value as Department })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {allDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setShowAddRoleDialog(null)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => showAddRoleDialog && handleAddRole(showAddRoleDialog)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
