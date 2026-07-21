'use client';

import React, { useState, useEffect } from 'react';
import { Cog, Plus, Search, Eye, Edit3, Activity, AlertCircle, Wrench, Trash2, X } from 'lucide-react';
import { manufacturingMastersService, Machine as BackendMachine } from '../../services/manufacturing-masters.service';

interface Machine {
  id: string;
  machineCode: string;
  machineName: string;
  description: string;

  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;

  specifications: {
    capacity: string;
    power: string; // kW
    dimensions?: string; // L x W x H
    weight?: number; // kg
  };

  location: {
    plant: string;
    workCenter: string;
    floor?: string;
  };

  acquisition: {
    purchaseDate: string;
    supplier: string;
    purchaseCost: number;
    warrantyExpiry?: string;
  };

  maintenance: {
    lastServiceDate?: string;
    nextServiceDate: string;
    serviceInterval: number; // days
    downtime: number; // hours
  };

  performance: {
    efficiency: number; // percentage
    utilizationRate: number; // percentage
    productionRate: number; // units per hour
  };

  operators: string[];

  status: string;
  createdBy: string;
  createdAt: string;
}

interface MachineForm {
  machineCode: string;
  machineName: string;
  description: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  capacity: string;
  power: string;
  status: string;
}

const emptyForm: MachineForm = {
  machineCode: '',
  machineName: '',
  description: '',
  category: 'other',
  manufacturer: '',
  model: '',
  serialNumber: '',
  capacity: '',
  power: '',
  status: 'operational',
};

const MachineMaster: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [form, setForm] = useState<MachineForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      setIsLoading(true);
      const data = await manufacturingMastersService.getAllMachines('1'); // Use '1' as default companyId

      const mappedMachines: Machine[] = data.map((m: BackendMachine) => ({
        id: m.id,
        machineCode: m.machineCode,
        machineName: m.machineName,
        description: m.description || '',
        category: m.category || 'other',
        manufacturer: m.manufacturer || '',
        model: m.model || '',
        serialNumber: m.serialNumber || '',
        specifications: {
          capacity: m.capacity || '',
          power: m.power || '',
          dimensions: m.dimensions || '',
          weight: m.weight || 0,
        },
        location: {
          plant: 'Main Plant',
          workCenter: m.workCenter?.name || 'Unassigned',
          floor: 'Ground Floor',
        },
        acquisition: {
          purchaseDate: '2023-01-01',
          supplier: 'OEM',
          purchaseCost: 0,
        },
        maintenance: {
          nextServiceDate: '2024-12-31',
          serviceInterval: 90,
          downtime: 0,
        },
        performance: {
          efficiency: m.efficiency || 0,
          utilizationRate: m.utilizationRate || 0,
          productionRate: 0,
        },
        operators: [],
        status: m.status || 'operational',
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
      }));

      setMachines(mappedMachines);
    } catch (error) {
      console.error('Error fetching machines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedMachine(null);
    setForm(emptyForm);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (machine: Machine) => {
    setSelectedMachine(machine.id);
    setForm({
      machineCode: machine.machineCode,
      machineName: machine.machineName,
      description: machine.description,
      category: machine.category,
      manufacturer: machine.manufacturer,
      model: machine.model,
      serialNumber: machine.serialNumber,
      capacity: machine.specifications.capacity,
      power: machine.specifications.power,
      status: machine.status,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.machineCode.trim() || !form.machineName.trim()) {
      setError('Machine Code and Machine Name are required.');
      return;
    }

    const payload = {
      machineCode: form.machineCode,
      machineName: form.machineName,
      description: form.description,
      category: form.category,
      manufacturer: form.manufacturer,
      model: form.model,
      serialNumber: form.serialNumber,
      capacity: form.capacity,
      power: form.power,
      status: form.status,
      companyId: '1',
    };

    try {
      setIsSaving(true);
      setError(null);
      if (selectedMachine) {
        await manufacturingMastersService.updateMachine(selectedMachine, payload);
      } else {
        await manufacturingMastersService.createMachine(payload);
      }
      setIsModalOpen(false);
      await fetchMachines();
    } catch (err) {
      console.error('Error saving machine:', err);
      setError('Failed to save machine. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (machine: Machine) => {
    if (!confirm(`Delete machine "${machine.machineName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await manufacturingMastersService.deleteMachine(machine.id);
      setMachines(prev => prev.filter(m => m.id !== machine.id));
    } catch (err) {
      console.error('Error deleting machine:', err);
      setError('Failed to delete machine. Please try again.');
    }
  };


  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredMachines = machines.filter(m => {
    const matchesSearch = m.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.machineCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalInvestment = machines.reduce((sum, m) => sum + m.acquisition.purchaseCost, 0);
  const avgEfficiency = machines.reduce((sum, m) => sum + m.performance.efficiency, 0) / machines.length;
  const avgUtilization = machines.reduce((sum, m) => sum + m.performance.utilizationRate, 0) / machines.length;

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="">
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Cog className="w-8 h-8 text-indigo-600" />
                Machine Master
              </h1>
              <p className="text-gray-600 mt-2">Manage equipment database and performance</p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Machine
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search machines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="operational">Operational</option>
              <option value="maintenance">Maintenance</option>
              <option value="breakdown">Breakdown</option>
              <option value="idle">Idle</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-3 text-sm">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Machines</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{machines.length}</p>
              </div>
              <Cog className="w-12 h-12 text-indigo-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Operational</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {machines.filter(m => m.status === 'operational').length}
                </p>
              </div>
              <Activity className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Efficiency</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{avgEfficiency.toFixed(0)}%</p>
              </div>
              <Activity className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilization</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{avgUtilization.toFixed(0)}%</p>
              </div>
              <Wrench className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Investment</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{(totalInvestment / 10000000).toFixed(1)}Cr
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Machines List */}
        <div className="space-y-2">
          {filteredMachines.map(machine => (
            <div key={machine.id} className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{machine.machineName}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full uppercase font-medium ${machine.category === 'cutting'
                        ? 'bg-blue-100 text-blue-800'
                        : machine.category === 'drilling'
                          ? 'bg-green-100 text-green-800'
                          : machine.category === 'finishing'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                      {machine.category}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${machine.status === 'operational'
                        ? 'bg-green-100 text-green-800'
                        : machine.status === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-800'
                          : machine.status === 'breakdown'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                      {machine.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {machine.machineCode} • {machine.manufacturer} {machine.model}
                  </p>
                  <p className="text-sm text-gray-500">{machine.description}</p>
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">View</span>
                  </button>
                  <button
                    onClick={() => openEditModal(machine)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Edit3 className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(machine)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-red-50 text-sm"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-red-600">Delete</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {/* Specifications */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Specifications</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium text-xs">{machine.specifications.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Power:</span>
                      <span className="font-medium">{machine.specifications.power}</span>
                    </div>
                    {machine.specifications.weight && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium">{machine.specifications.weight} kg</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Performance</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Efficiency:</span>
                      <span className={`font-medium ${machine.performance.efficiency >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
                        {machine.performance.efficiency}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utilization:</span>
                      <span className="font-medium">{machine.performance.utilizationRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-medium">{machine.performance.productionRate}/hr</span>
                    </div>
                  </div>
                </div>

                {/* Maintenance */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Maintenance</h4>
                  <div className="space-y-1 text-sm">
                    {machine.maintenance.lastServiceDate && (
                      <div>
                        <span className="text-gray-600">Last Service:</span>
                        <p className="font-medium text-xs">
                          {new Date(machine.maintenance.lastServiceDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Next Service:</span>
                      <p className="font-medium text-xs text-orange-600">
                        {new Date(machine.maintenance.nextServiceDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Downtime:</span>
                      <span className="font-medium">{machine.maintenance.downtime}h</span>
                    </div>
                  </div>
                </div>

                {/* Location & Cost */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Location & Cost</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Work Center:</span>
                      <p className="font-medium text-xs">{machine.location.workCenter}</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost:</span>
                      <span className="font-medium">
                        ₹{(machine.acquisition.purchaseCost / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Operators:</span>
                      <span className="font-medium">{machine.operators.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedMachine ? 'Edit Machine' : 'Add New Machine'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-3 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Machine Code *</label>
                  <input
                    type="text"
                    value={form.machineCode}
                    onChange={(e) => setForm({ ...form, machineCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Machine Name *</label>
                  <input
                    type="text"
                    value={form.machineName}
                    onChange={(e) => setForm({ ...form, machineName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="cutting">Cutting</option>
                    <option value="drilling">Drilling</option>
                    <option value="finishing">Finishing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="operational">Operational</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="breakdown">Breakdown</option>
                    <option value="idle">Idle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={form.manufacturer}
                    onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={form.serialNumber}
                    onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="text"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Power (kW)</label>
                  <input
                    type="text"
                    value={form.power}
                    onChange={(e) => setForm({ ...form, power: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : selectedMachine ? 'Update Machine' : 'Create Machine'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineMaster;
