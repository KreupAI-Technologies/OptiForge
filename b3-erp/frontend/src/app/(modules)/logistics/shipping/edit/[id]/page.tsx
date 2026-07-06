'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogisticsService } from '@/services/logistics.service';
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
  Edit2,
  CheckCircle2,
  Weight,
  Box,
  Navigation,
} from 'lucide-react';

interface Location {
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  contactPerson: string;
  contactPhone: string;
}

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
  shipmentNumber: string;
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

  status: 'draft' | 'scheduled' | 'in_transit' | 'delivered' | 'cancelled' | 'delayed';
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

export default function EditShipmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showItemSearch, setShowItemSearch] = useState(false);

  // Mock existing shipment data
  const [formData, setFormData] = useState<ShipmentForm>({
    shipmentNumber: 'SHP-2024-001',
    trackingNumber: 'BLUEDART123456789',
    carrier: 'Blue Dart Express',
    carrierService: 'Surface Premium',
    vehicleNumber: 'MH-12-AB-1234',
    vehicleType: '32 Feet Container',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    driverLicense: 'MH1234567890',

    fromWarehouse: 'WH-001',
    fromAddress: 'Plot No. 45, MIDC Industrial Area',
    fromCity: 'Pune',
    fromState: 'Maharashtra',
    fromPincode: '411019',
    fromContactPerson: 'Suresh Patil',
    fromContactPhone: '+91 98765 11111',

    toCustomer: 'Tata Steel Limited',
    toAddress: 'Tata Steel Complex, Burmamines',
    toCity: 'Jamshedpur',
    toState: 'Jharkhand',
    toPincode: '831007',
    toContactPerson: 'Amit Singh',
    toContactPhone: '+91 98765 22222',

    status: 'in_transit',
    priority: 'express',

    scheduledPickupDate: '2024-01-15',
    scheduledPickupTime: '09:00',
    expectedDeliveryDate: '2024-01-18',
    expectedDeliveryTime: '14:00',

    shipmentType: 'Domestic',
    serviceType: 'Door to Door',
    paymentTerms: 'Prepaid',
    insuranceRequired: true,
    insuranceValue: 500000,

    freightCharges: 25000,
    insuranceCharges: 2500,
    loadingCharges: 2000,
    unloadingCharges: 2000,
    packagingCharges: 1500,
    otherCharges: 1000,

    specialInstructions: 'Handle with care. Fragile items. Temperature controlled transport required.',
    remarks: 'Priority shipment for critical production materials',
  });

  const [items, setItems] = useState<ShipmentItem[]>([
    {
      id: '1',
      itemCode: 'RM-001',
      itemName: 'Steel Sheets - Grade 304',
      quantity: 50,
      weight: 2500,
      volume: 12.5,
      packageType: 'Pallets',
      remarks: 'Handle with care',
    },
    {
      id: '2',
      itemCode: 'RM-002',
      itemName: 'Aluminum Rods',
      quantity: 100,
      weight: 1500,
      volume: 8.0,
      packageType: 'Bundles',
      remarks: 'Keep dry',
    },
  ]);

  useEffect(() => {
    let active = true;
    const loadShipment = async () => {
      try {
        const record = await LogisticsService.getShipmentById(params.id);
        if (!active || !record) return;

        setFormData(prev => ({
          ...prev,
          shipmentNumber: record.shipmentNumber ?? record.shipmentNo ?? prev.shipmentNumber,
          trackingNumber: record.trackingNumber ?? prev.trackingNumber,
          carrier: record.carrier ?? record.carrierName ?? prev.carrier,
          carrierService: record.carrierService ?? prev.carrierService,
          vehicleNumber: record.vehicleNumber ?? prev.vehicleNumber,
          vehicleType: record.vehicleType ?? prev.vehicleType,
          driverName: record.driverName ?? prev.driverName,
          driverPhone: record.driverPhone ?? prev.driverPhone,
          driverLicense: record.driverLicense ?? prev.driverLicense,

          fromWarehouse: record.fromWarehouse ?? prev.fromWarehouse,
          fromAddress: record.fromAddress ?? prev.fromAddress,
          fromCity: record.fromCity ?? prev.fromCity,
          fromState: record.fromState ?? prev.fromState,
          fromPincode: record.fromPincode ?? prev.fromPincode,
          fromContactPerson: record.fromContactPerson ?? prev.fromContactPerson,
          fromContactPhone: record.fromContactPhone ?? prev.fromContactPhone,

          toCustomer: record.toCustomer ?? record.customer ?? prev.toCustomer,
          toAddress: record.toAddress ?? prev.toAddress,
          toCity: record.toCity ?? prev.toCity,
          toState: record.toState ?? prev.toState,
          toPincode: record.toPincode ?? prev.toPincode,
          toContactPerson: record.toContactPerson ?? prev.toContactPerson,
          toContactPhone: record.toContactPhone ?? prev.toContactPhone,

          status: record.status ?? prev.status,
          priority: record.priority ?? prev.priority,

          scheduledPickupDate: record.scheduledPickupDate ?? prev.scheduledPickupDate,
          scheduledPickupTime: record.scheduledPickupTime ?? prev.scheduledPickupTime,
          expectedDeliveryDate: record.expectedDeliveryDate ?? prev.expectedDeliveryDate,
          expectedDeliveryTime: record.expectedDeliveryTime ?? prev.expectedDeliveryTime,

          shipmentType: record.shipmentType ?? prev.shipmentType,
          serviceType: record.serviceType ?? prev.serviceType,
          paymentTerms: record.paymentTerms ?? prev.paymentTerms,
          insuranceRequired: record.insuranceRequired ?? prev.insuranceRequired,
          insuranceValue: record.insuranceValue ?? prev.insuranceValue,

          freightCharges: record.freightCharges ?? prev.freightCharges,
          insuranceCharges: record.insuranceCharges ?? prev.insuranceCharges,
          loadingCharges: record.loadingCharges ?? prev.loadingCharges,
          unloadingCharges: record.unloadingCharges ?? prev.unloadingCharges,
          packagingCharges: record.packagingCharges ?? prev.packagingCharges,
          otherCharges: record.otherCharges ?? prev.otherCharges,

          specialInstructions: record.specialInstructions ?? prev.specialInstructions,
          remarks: record.remarks ?? prev.remarks,
        }));

        const lineItems = record.items ?? record.shipmentItems ?? record.lineItems;
        if (Array.isArray(lineItems) && lineItems.length > 0) {
          setItems(lineItems.map((line: any, idx: number): ShipmentItem => ({
            id: line.id?.toString() ?? (idx + 1).toString(),
            itemCode: line.itemCode ?? '',
            itemName: line.itemName ?? '',
            quantity: line.quantity ?? 0,
            weight: line.weight ?? 0,
            volume: line.volume ?? 0,
            packageType: line.packageType ?? 'Boxes',
            remarks: line.remarks ?? '',
          })));
        }
      } catch (error) {
        // Leave existing defaults in place on failure.
        console.error('Failed to load shipment', error);
      }
    };
    loadShipment();
    return () => {
      active = false;
    };
  }, [params.id]);

  // Available options
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

  const addItem = () => {
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
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const totalVolume = items.reduce((sum, item) => sum + item.volume, 0);
    const totalPackages = items.length;
    const totalCharges = formData.freightCharges + formData.insuranceCharges +
      formData.loadingCharges + formData.unloadingCharges +
      formData.packagingCharges + formData.otherCharges;
    return { totalWeight, totalVolume, totalPackages, totalCharges };
  };

  const totals = calculateTotals();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.trackingNumber.trim()) newErrors.trackingNumber = 'Tracking number is required';
    if (!formData.carrier) newErrors.carrier = 'Carrier is required';
    if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    if (!formData.driverName.trim()) newErrors.driverName = 'Driver name is required';
    if (!formData.driverPhone.trim()) newErrors.driverPhone = 'Driver phone is required';

    if (!formData.fromAddress.trim()) newErrors.fromAddress = 'From address is required';
    if (!formData.toAddress.trim()) newErrors.toAddress = 'To address is required';

    if (!formData.scheduledPickupDate) newErrors.scheduledPickupDate = 'Pickup date is required';
    if (!formData.expectedDeliveryDate) newErrors.expectedDeliveryDate = 'Delivery date is required';

    if (formData.expectedDeliveryDate < formData.scheduledPickupDate) {
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

    try {
      await LogisticsService.updateShipment(params.id, {
        ...formData,
        items,
      });
      router.push(`/logistics/shipping/view/${params.id}`);
    } catch (error) {
      console.error('Failed to update shipment', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to save shipment. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/logistics/shipping/view/${params.id}`);
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Edit Shipment</h1>
              <p className="text-gray-600 mt-1">Update shipment details and tracking information</p>
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
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
            <div className="text-orange-100 text-sm">Total Charges</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-600">Shipment and carrier details</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipment Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.shipmentNumber}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.trackingNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter tracking number"
                />
                {errors.trackingNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.trackingNumber}</p>
                )}
              </div>

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
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

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
                >
                  <option value="">Select service</option>
                  {carrierServices.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
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

          {/* Vehicle and Driver Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Vehicle & Driver Details</h2>
                <p className="text-sm text-gray-600">Transport and driver information</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
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
                <h2 className="text-xl font-bold text-gray-900">From Location</h2>
                <p className="text-sm text-gray-600">Pickup location details</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fromWarehouse}
                  onChange={(e) => handleInputChange('fromWarehouse', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="WH-001"
                />
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
            </div>
          </div>

          {/* To Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Navigation className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">To Location</h2>
                <p className="text-sm text-gray-600">Delivery location details</p>
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
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
                <p className="text-sm text-gray-600">Pickup and delivery schedule</p>
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
                  <p className="text-sm text-gray-600">Add and manage items in this shipment</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
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
            </div>
          </div>

          {/* Charges Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Charges & Insurance</h2>
                <p className="text-sm text-gray-600">Freight and additional charges</p>
              </div>
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
                  <div className="text-sm text-green-700 font-medium mb-1">Total Charges</div>
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
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
