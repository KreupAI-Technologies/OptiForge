'use client';

import React, { useState, useEffect } from 'react';
import { MasterDataService, MDWarehouse, MDProduct } from '@/services/master-data.service';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  X,
  Truck,
  Package,
  MapPin,
  Calendar,
  Phone,
  User,
  FileText,
  DollarSign,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Weight,
  Box,
  Navigation,
  ShoppingCart,
  Building2,
  Calculator,
} from 'lucide-react';

interface ShipmentItem {
  id: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  weight: number;
  volume: number;
  packageType: string;
  remarks: string;
}

interface ShipmentForm {
  referenceType: string;
  referenceNumber: string;
  trackingNumber: string;
  carrier: string;
  carrierService: string;
  vehicleNumber: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  driverLicense: string;

  fromWarehouse: string;
  fromAddress: string;
  fromCity: string;
  fromState: string;
  fromPincode: string;
  fromContactPerson: string;
  fromContactPhone: string;

  toCustomer: string;
  toAddress: string;
  toCity: string;
  toState: string;
  toPincode: string;
  toContactPerson: string;
  toContactPhone: string;

  status: 'draft' | 'scheduled';
  priority: 'standard' | 'express' | 'urgent';

  scheduledPickupDate: string;
  scheduledPickupTime: string;
  expectedDeliveryDate: string;
  expectedDeliveryTime: string;

  shipmentType: string;
  serviceType: string;
  paymentTerms: string;
  insuranceRequired: boolean;
  insuranceValue: number;

  freightCharges: number;
  insuranceCharges: number;
  loadingCharges: number;
  unloadingCharges: number;
  packagingCharges: number;
  otherCharges: number;

  specialInstructions: string;
  remarks: string;
}

export default function AddShipmentPage() {
  const router = useRouter();

  // Seed fallbacks — kept as unused backup per wiring convention
  const mockWarehousesSeed = [
    {
      code: 'WH-001',
      name: 'Main Warehouse - Pune',
      address: 'Plot No. 45, MIDC Industrial Area',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411019',
      contact: 'Suresh Patil',
      phone: '+91 98765 11111',
    },
    {
      code: 'WH-002',
      name: 'Distribution Center - Mumbai',
      address: 'Unit 23, Logistics Park, Bhiwandi',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '421302',
      contact: 'Rajesh Sharma',
      phone: '+91 98765 22222',
    },
  ];

  const mockStockItemsSeed = [
    { code: 'RM-001', name: 'Steel Sheets - Grade 304', stock: 150, weight: 50, volume: 0.25 },
    { code: 'RM-002', name: 'Aluminum Rods', stock: 200, weight: 15, volume: 0.08 },
    { code: 'COMP-001', name: 'Electric Motors - 5HP', stock: 80, weight: 25, volume: 0.15 },
    { code: 'FG-001', name: 'Finished Panel Assembly', stock: 45, weight: 120, volume: 1.5 },
  ];

  type WarehouseItem = typeof mockWarehousesSeed[0];
  type StockItem = typeof mockStockItemsSeed[0];

  const [mockWarehouses, setMockWarehouses] = useState<WarehouseItem[]>(mockWarehousesSeed);
  const [mockStockItems, setMockStockItems] = useState<StockItem[]>(mockStockItemsSeed);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [stockItemsLoading, setStockItemsLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOrderSearch, setShowOrderSearch] = useState(false);
  const [showItemSearch, setShowItemSearch] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  const [formData, setFormData] = useState<ShipmentForm>({
    referenceType: 'Sales Order',
    referenceNumber: '',
    trackingNumber: '',
    carrier: '',
    carrierService: '',
    vehicleNumber: '',
    vehicleType: '',
    driverName: '',
    driverPhone: '',
    driverLicense: '',

    fromWarehouse: '',
    fromAddress: '',
    fromCity: '',
    fromState: '',
    fromPincode: '',
    fromContactPerson: '',
    fromContactPhone: '',

    toCustomer: '',
    toAddress: '',
    toCity: '',
    toState: '',
    toPincode: '',
    toContactPerson: '',
    toContactPhone: '',

    status: 'draft',
    priority: 'standard',

    scheduledPickupDate: '',
    scheduledPickupTime: '09:00',
    expectedDeliveryDate: '',
    expectedDeliveryTime: '17:00',

    shipmentType: 'Domestic',
    serviceType: 'Door to Door',
    paymentTerms: 'Prepaid',
    insuranceRequired: false,
    insuranceValue: 0,

    freightCharges: 0,
    insuranceCharges: 0,
    loadingCharges: 0,
    unloadingCharges: 0,
    packagingCharges: 0,
    otherCharges: 0,

    specialInstructions: '',
    remarks: '',
  });

  const [items, setItems] = useState<ShipmentItem[]>([]);

  // Mock data for dropdowns
  const referenceTypes = ['Sales Order', 'Purchase Order', 'Transfer Order', 'Production Order', 'Direct'];
  const carriers = [
    'Blue Dart Express',
    'DHL Express India',
    'FedEx India',
    'DTDC Express',
    'Delhivery',
    'Gati KWE',
    'VRL Logistics',
    'TCI Express',
  ];
  const carrierServices = ['Express', 'Surface', 'Surface Premium', 'Air Express', 'Same Day'];
  const vehicleTypes = ['Tata Ace', '14 Feet', '17 Feet', '19 Feet', '20 Feet Container', '32 Feet Container', '40 Feet Container'];
  const packageTypes = ['Boxes', 'Pallets', 'Crates', 'Bundles', 'Drums', 'Bags', 'Loose'];
  const shipmentTypes = ['Domestic', 'International', 'Express', 'Standard'];
  const serviceTypes = ['Door to Door', 'Port to Port', 'Door to Port', 'Port to Door'];
  const paymentTermsOptions = ['Prepaid', 'To Pay', 'Third Party'];

  // Mock orders — static: order-lookup is a different flow, not an entity-picker list
  const mockOrders = [
    { id: 'SO-2024-001', customer: 'Tata Steel Limited', date: '2024-01-10', amount: 125000, items: 5 },
    { id: 'SO-2024-002', customer: 'JSW Steel', date: '2024-01-12', amount: 89000, items: 3 },
    { id: 'SO-2024-003', customer: 'Bharat Heavy Electricals', date: '2024-01-13', amount: 156000, items: 7 },
    { id: 'PO-2024-015', customer: 'Larsen & Toubro', date: '2024-01-14', amount: 234000, items: 10 },
  ];

  useEffect(() => {
    setWarehousesLoading(true);
    MasterDataService.getWarehouses().then((live) => {
      if (live.length > 0) {
        setMockWarehouses(live.map((w: MDWarehouse) => ({
          code: w.warehouseCode || w.id,
          name: w.warehouseName || w.warehouseCode || w.id,
          address: '',
          city: w.city || '',
          state: '',
          pincode: '',
          contact: '',
          phone: '',
        })));
      }
      setWarehousesLoading(false);
    });

    setStockItemsLoading(true);
    MasterDataService.getProducts().then((live) => {
      if (live.length > 0) {
        setMockStockItems(live.map((p: MDProduct) => ({
          code: p.sku || p.id,
          name: p.name || p.productName || p.sku || p.id,
          stock: 0,
          weight: 0,
          volume: 0,
        })));
      }
      setStockItemsLoading(false);
    });
  }, []);

  const handleInputChange = (field: keyof ShipmentForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (index: number, field: keyof ShipmentItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const generateShipmentNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SHP-${year}-${random}`;
  };

  const generateTrackingNumber = () => {
    if (!formData.carrier) return '';

    const prefix = formData.carrier.split(' ')[0].toUpperCase().substring(0, 3);
    const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    return `${prefix}${random}`;
  };

  const handleGenerateTracking = () => {
    const trackingNumber = generateTrackingNumber();
    handleInputChange('trackingNumber', trackingNumber);
  };

  const handleWarehouseSelect = (warehouseCode: string) => {
    const warehouse = mockWarehouses.find(w => w.code === warehouseCode);
    if (warehouse) {
      handleInputChange('fromWarehouse', warehouse.code);
      handleInputChange('fromAddress', warehouse.address);
      handleInputChange('fromCity', warehouse.city);
      handleInputChange('fromState', warehouse.state);
      handleInputChange('fromPincode', warehouse.pincode);
      handleInputChange('fromContactPerson', warehouse.contact);
      handleInputChange('fromContactPhone', warehouse.phone);
    }
  };

  const handleOrderSelect = (order: typeof mockOrders[0]) => {
    handleInputChange('referenceNumber', order.id);
    handleInputChange('toCustomer', order.customer);
    setShowOrderSearch(false);
  };

  const handleStockItemSelect = (item: typeof mockStockItems[0]) => {
    const newItem: ShipmentItem = {
      id: Date.now().toString(),
      itemCode: item.code,
      itemName: item.name,
      quantity: 1,
      weight: item.weight,
      volume: item.volume,
      packageType: 'Boxes',
      remarks: '',
    };
    setItems([...items, newItem]);
    setShowItemSearch(false);
    setItemSearchQuery('');
  };

  const addManualItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      itemCode: '',
      itemName: '',
      quantity: 0,
      weight: 0,
      volume: 0,
      packageType: 'Boxes',
      remarks: '',
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    const totalVolume = items.reduce((sum, item) => sum + (item.volume * item.quantity), 0);
    const totalPackages = items.length;
    const totalCharges = formData.freightCharges + formData.insuranceCharges +
      formData.loadingCharges + formData.unloadingCharges +
      formData.packagingCharges + formData.otherCharges;
    return { totalWeight, totalVolume, totalPackages, totalCharges };
  };

  const totals = calculateTotals();

  const calculateFreightEstimate = () => {
    // Simple freight calculation: ₹10 per kg + ₹500 per m³
    const weightCost = totals.totalWeight * 10;
    const volumeCost = totals.totalVolume * 500;
    const baseFreight = weightCost + volumeCost;

    // Priority multiplier
    let multiplier = 1;
    if (formData.priority === 'express') multiplier = 1.5;
    if (formData.priority === 'urgent') multiplier = 2;

    return Math.round(baseFreight * multiplier);
  };

  const handleCalculateFreight = () => {
    const estimate = calculateFreightEstimate();
    handleInputChange('freightCharges', estimate);

    // Calculate insurance if required (0.5% of declared value)
    if (formData.insuranceRequired && formData.insuranceValue > 0) {
      const insuranceCost = Math.round(formData.insuranceValue * 0.005);
      handleInputChange('insuranceCharges', insuranceCost);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.referenceType !== 'Direct' && !formData.referenceNumber.trim()) {
      newErrors.referenceNumber = 'Reference number is required';
    }
    if (!formData.trackingNumber.trim()) newErrors.trackingNumber = 'Tracking number is required';
    if (!formData.carrier) newErrors.carrier = 'Carrier is required';
    if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    if (!formData.driverName.trim()) newErrors.driverName = 'Driver name is required';
    if (!formData.driverPhone.trim()) newErrors.driverPhone = 'Driver phone is required';

    if (!formData.fromWarehouse) newErrors.fromWarehouse = 'From warehouse is required';
    if (!formData.fromAddress.trim()) newErrors.fromAddress = 'From address is required';
    if (!formData.toCustomer.trim()) newErrors.toCustomer = 'To customer is required';
    if (!formData.toAddress.trim()) newErrors.toAddress = 'To address is required';

    if (!formData.scheduledPickupDate) newErrors.scheduledPickupDate = 'Pickup date is required';
    if (!formData.expectedDeliveryDate) newErrors.expectedDeliveryDate = 'Delivery date is required';

    if (formData.expectedDeliveryDate && formData.scheduledPickupDate &&
      formData.expectedDeliveryDate < formData.scheduledPickupDate) {
      newErrors.expectedDeliveryDate = 'Delivery date must be after pickup date';
    }

    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    items.forEach((item, index) => {
      if (!item.itemCode.trim()) newErrors[`item_${index}_code`] = 'Item code is required';
      if (item.quantity <= 0) newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      if (item.weight <= 0) newErrors[`item_${index}_weight`] = 'Weight must be greater than 0';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      const shipmentNumber = generateShipmentNumber();
      router.push('/logistics/shipping');
    }, 1500);
  };

  const handleCancel = () => {
    router.push('/logistics/shipping');
  };

  const filteredOrders = mockOrders.filter(order =>
    order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
    order.customer.toLowerCase().includes(orderSearchQuery.toLowerCase())
  );

  const filteredStockItems = mockStockItems.filter(item =>
    item.code.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(itemSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3">
      <div className="w-full">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Shipment</h1>
              <p className="text-gray-600 mt-1">Schedule a new shipment for delivery</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Shipment
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white">
            <Package className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{totals.totalPackages}</div>
            <div className="text-blue-100 text-sm">Total Items</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl text-white">
            <Weight className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{totals.totalWeight.toLocaleString()}</div>
            <div className="text-purple-100 text-sm">Total Weight (kg)</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white">
            <Box className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{totals.totalVolume.toFixed(2)}</div>
            <div className="text-green-100 text-sm">Total Volume (m³)</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl text-white">
            <DollarSign className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">₹{totals.totalCharges.toLocaleString()}</div>
            <div className="text-orange-100 text-sm">Estimated Charges</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Reference Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reference Information</h2>
                <p className="text-sm text-gray-600">Link shipment to order or create direct shipment</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.referenceType}
                  onChange={(e) => handleInputChange('referenceType', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {referenceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {formData.referenceType !== 'Direct' && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                      className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.referenceNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter or search for order"
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => setShowOrderSearch(true)}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Search
                    </button>
                  </div>
                  {errors.referenceNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.referenceNumber}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Carrier Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Carrier & Vehicle Information</h2>
                <p className="text-sm text-gray-600">Select carrier and assign vehicle</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carrier <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.carrier}
                  onChange={(e) => handleInputChange('carrier', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.carrier ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select carrier</option>
                  {carriers.map(carrier => (
                    <option key={carrier} value={carrier}>{carrier}</option>
                  ))}
                </select>
                {errors.carrier && (
                  <p className="mt-1 text-sm text-red-500">{errors.carrier}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carrier Service <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.carrierService}
                  onChange={(e) => handleInputChange('carrierService', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!formData.carrier}
                >
                  <option value="">Select service</option>
                  {carrierServices.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.trackingNumber}
                    onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                    className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.trackingNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Auto-generate or enter"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateTracking}
                    disabled={!formData.carrier}
                    className="px-3 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

                  >
                    <Calculator className="w-4 h-4" />
                  </button>
                </div>
                {errors.trackingNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.trackingNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => handleInputChange('vehicleNumber', e.target.value.toUpperCase())}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${errors.vehicleNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="MH-12-AB-1234"
                />
                {errors.vehicleNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.vehicleNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select vehicle type</option>
                  {vehicleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => handleInputChange('driverName', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.driverName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter driver name"
                />
                {errors.driverName && (
                  <p className="mt-1 text-sm text-red-500">{errors.driverName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.driverPhone}
                  onChange={(e) => handleInputChange('driverPhone', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.driverPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="+91 98765 43210"
                />
                {errors.driverPhone && (
                  <p className="mt-1 text-sm text-red-500">{errors.driverPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver License Number
                </label>
                <input
                  type="text"
                  value={formData.driverLicense}
                  onChange={(e) => handleInputChange('driverLicense', e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="MH1234567890"
                />
              </div>
            </div>
          </div>

          {/* From Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">From Location (Pickup)</h2>
                <p className="text-sm text-gray-600">Select warehouse for pickup</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.fromWarehouse}
                  onChange={(e) => handleWarehouseSelect(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fromWarehouse ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">{warehousesLoading ? 'Loading…' : 'Select warehouse'}</option>
                  {mockWarehouses.map(wh => (
                    <option key={wh.code} value={wh.code}>
                      {wh.code} - {wh.name}
                    </option>
                  ))}
                </select>
                {errors.fromWarehouse && (
                  <p className="mt-1 text-sm text-red-500">{errors.fromWarehouse}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fromContactPerson}
                  onChange={(e) => handleInputChange('fromContactPerson', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter contact person"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.fromContactPhone}
                  onChange={(e) => handleInputChange('fromContactPhone', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 98765 11111"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.fromAddress}
                  onChange={(e) => handleInputChange('fromAddress', e.target.value)}
                  rows={2}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fromAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter pickup address"
                />
                {errors.fromAddress && (
                  <p className="mt-1 text-sm text-red-500">{errors.fromAddress}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fromCity}
                  onChange={(e) => handleInputChange('fromCity', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fromState}
                  onChange={(e) => handleInputChange('fromState', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fromPincode}
                  onChange={(e) => handleInputChange('fromPincode', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="411019"
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          {/* To Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Navigation className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">To Location (Delivery)</h2>
                <p className="text-sm text-gray-600">Enter delivery destination</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.toCustomer}
                  onChange={(e) => handleInputChange('toCustomer', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.toCustomer ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter customer name"
                />
                {errors.toCustomer && (
                  <p className="mt-1 text-sm text-red-500">{errors.toCustomer}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.toContactPerson}
                  onChange={(e) => handleInputChange('toContactPerson', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter contact person"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.toAddress}
                  onChange={(e) => handleInputChange('toAddress', e.target.value)}
                  rows={2}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.toAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter delivery address"
                />
                {errors.toAddress && (
                  <p className="mt-1 text-sm text-red-500">{errors.toAddress}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.toCity}
                  onChange={(e) => handleInputChange('toCity', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.toState}
                  onChange={(e) => handleInputChange('toState', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.toPincode}
                  onChange={(e) => handleInputChange('toPincode', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="831007"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.toContactPhone}
                  onChange={(e) => handleInputChange('toContactPhone', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 98765 22222"
                />
              </div>
            </div>
          </div>

          {/* Schedule Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Schedule Details</h2>
                <p className="text-sm text-gray-600">Set pickup and delivery schedule</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Pickup Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.scheduledPickupDate}
                  onChange={(e) => handleInputChange('scheduledPickupDate', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.scheduledPickupDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.scheduledPickupDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.scheduledPickupDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.scheduledPickupTime}
                  onChange={(e) => handleInputChange('scheduledPickupTime', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Delivery Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.expectedDeliveryDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  min={formData.scheduledPickupDate || new Date().toISOString().split('T')[0]}
                />
                {errors.expectedDeliveryDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.expectedDeliveryDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.expectedDeliveryTime}
                  onChange={(e) => handleInputChange('expectedDeliveryTime', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.shipmentType}
                  onChange={(e) => handleInputChange('shipmentType', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {shipmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => handleInputChange('serviceType', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {paymentTermsOptions.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Shipment Items</h2>
                  <p className="text-sm text-gray-600">Add items to this shipment</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowItemSearch(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search Items
                </button>
                <button
                  type="button"
                  onClick={addManualItem}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Manual
                </button>
              </div>
            </div>

            {errors.items && (
              <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700">{errors.items}</span>
              </div>
            )}

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Item {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.itemCode}
                        onChange={(e) => handleItemChange(index, 'itemCode', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[`item_${index}_code`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="RM-001"
                      />
                      {errors[`item_${index}_code`] && (
                        <p className="mt-1 text-xs text-red-500">{errors[`item_${index}_code`]}</p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter item name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="0"
                        min="0"
                      />
                      {errors[`item_${index}_quantity`] && (
                        <p className="mt-1 text-xs text-red-500">{errors[`item_${index}_quantity`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={item.weight || ''}
                        onChange={(e) => handleItemChange(index, 'weight', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[`item_${index}_weight`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                      {errors[`item_${index}_weight`] && (
                        <p className="mt-1 text-xs text-red-500">{errors[`item_${index}_weight`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Volume (m³)
                      </label>
                      <input
                        type="number"
                        value={item.volume || ''}
                        onChange={(e) => handleItemChange(index, 'volume', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Package Type
                      </label>
                      <select
                        value={item.packageType}
                        onChange={(e) => handleItemChange(index, 'packageType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {packageTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remarks
                      </label>
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Any special handling instructions"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Package className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-2">No items added yet</p>
                  <button
                    type="button"
                    onClick={() => setShowItemSearch(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Search & Add Items
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Charges Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Charges & Insurance</h2>
                  <p className="text-sm text-gray-600">Calculate freight and additional charges</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCalculateFreight}
                disabled={items.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Calculator className="w-4 h-4" />
                Calculate Freight
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Freight Charges (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.freightCharges || ''}
                  onChange={(e) => handleInputChange('freightCharges', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loading Charges (₹)
                </label>
                <input
                  type="number"
                  value={formData.loadingCharges || ''}
                  onChange={(e) => handleInputChange('loadingCharges', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unloading Charges (₹)
                </label>
                <input
                  type="number"
                  value={formData.unloadingCharges || ''}
                  onChange={(e) => handleInputChange('unloadingCharges', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Packaging Charges (₹)
                </label>
                <input
                  type="number"
                  value={formData.packagingCharges || ''}
                  onChange={(e) => handleInputChange('packagingCharges', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Charges (₹)
                </label>
                <input
                  type="number"
                  value={formData.otherCharges || ''}
                  onChange={(e) => handleInputChange('otherCharges', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-3">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="insuranceRequired"
                  checked={formData.insuranceRequired}
                  onChange={(e) => handleInputChange('insuranceRequired', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="insuranceRequired" className="font-semibold text-blue-900">
                  Insurance Required
                </label>
              </div>

              {formData.insuranceRequired && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Insurance Value (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.insuranceValue || ''}
                      onChange={(e) => handleInputChange('insuranceValue', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Insurance Charges (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.insuranceCharges || ''}
                      onChange={(e) => handleInputChange('insuranceCharges', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-green-700 font-medium mb-1">Total Estimated Charges</div>
                  <div className="text-3xl font-bold text-green-900">
                    ₹{totals.totalCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Additional Information</h2>
                <p className="text-sm text-gray-600">Special instructions and remarks</p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special handling or delivery instructions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional remarks or notes"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Shipment...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Shipment
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Order Search Modal */}
      {showOrderSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900">Select Order</h3>
                <button
                  onClick={() => setShowOrderSearch(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search by order number or customer name..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="overflow-y-auto max-h-96 p-3">
              <div className="space-y-3">
                {filteredOrders.map(order => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => handleOrderSelect(order)}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-gray-900 mb-1">{order.id}</div>
                        <div className="text-sm text-gray-600">{order.customer}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {order.date} • {order.items} items • ₹{order.amount.toLocaleString()}
                        </div>
                      </div>
                      <ShoppingCart className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Search Modal */}
      {showItemSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900">Search Stock Items</h3>
                <button
                  onClick={() => setShowItemSearch(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                placeholder="Search by item code or name..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="overflow-y-auto max-h-96 p-3">
              <div className="space-y-3">
                {stockItemsLoading && (
                  <div className="p-3 text-center text-gray-500 text-sm">Loading items…</div>
                )}
                {!stockItemsLoading && filteredStockItems.map(item => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleStockItemSelect(item)}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-gray-900 mb-1">{item.code}</div>
                        <div className="text-sm text-gray-600">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Stock: {item.stock} • Weight: {item.weight}kg • Volume: {item.volume}m³
                        </div>
                      </div>
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
