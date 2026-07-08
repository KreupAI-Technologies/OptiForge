'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogisticsService } from '@/services/logistics.service';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Search, FileText, Package, Truck, MapPin, Calendar, CheckCircle, Clock, XCircle, AlertTriangle, Filter, Plus } from 'lucide-react';

interface FreightBooking {
  id: string;
  bookingNo: string;
  customerName: string;
  origin: string;
  destination: string;
  cargoType: string;
  weight: number;
  volume: number;
  transportMode: 'air' | 'sea' | 'road' | 'rail';
  carrier: string;
  bookingDate: string;
  pickupDate: string;
  expectedDelivery: string;
  status: 'confirmed' | 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  bookingAmount: number;
  containerNo: string;
  vesselFlight: string;
  billOfLading: string;
  customsStatus: 'pending' | 'cleared' | 'in-process' | 'not-required';
  trackingUrl: string;
  contactPerson: string;
  contactPhone: string;
}

export default function FreightBookingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const [bookings, setBookings] = useState<FreightBooking[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // New booking modal
  const [formOpen, setFormOpen] = useState(false);
  const [detailText, setDetailText] = useState<{ title: string; body: string } | null>(null);
  const emptyForm = {
    customerName: '',
    origin: '',
    destination: '',
    cargoType: '',
    weight: '',
    volume: '',
    transportMode: 'road' as FreightBooking['transportMode'],
    carrier: '',
    pickupDate: '',
    expectedDelivery: '',
    bookingAmount: '',
    contactPerson: '',
    contactPhone: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  const loadBookings = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await LogisticsService.getFreightCharges();
      const list = Array.isArray(res) ? res : ((res as any)?.data ?? (res as any)?.items ?? []);
      setBookings((list as any[]).map((r, i) => ({
          id: String(r.id ?? i),
          bookingNo: r.bookingNo ?? r.chargeNumber ?? r.referenceNo ?? '',
          customerName: r.customerName ?? r.customer ?? '',
          origin: r.origin ?? '',
          destination: r.destination ?? '',
          cargoType: r.cargoType ?? '',
          weight: Number(r.weight ?? 0),
          volume: Number(r.volume ?? 0),
          transportMode: (r.transportMode ?? r.mode ?? 'road') as FreightBooking['transportMode'],
          carrier: r.carrier ?? r.carrierName ?? '',
          bookingDate: r.bookingDate ?? r.createdAt ?? '',
          pickupDate: r.pickupDate ?? '',
          expectedDelivery: r.expectedDelivery ?? '',
          status: (r.status ?? 'pending') as FreightBooking['status'],
          bookingAmount: Number(r.bookingAmount ?? r.totalCharge ?? r.amount ?? 0),
          containerNo: r.containerNo ?? '',
          vesselFlight: r.vesselFlight ?? '',
          billOfLading: r.billOfLading ?? '',
          customsStatus: (r.customsStatus ?? 'not-required') as FreightBooking['customsStatus'],
          trackingUrl: r.trackingUrl ?? '',
          contactPerson: r.contactPerson ?? '',
          contactPhone: r.contactPhone ?? '',
        })));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load bookings');
    }
  }, []);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const bookingStats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    inTransit: bookings.filter(b => b.status === 'in-transit').length,
    delivered: bookings.filter(b => b.status === 'delivered').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalValue: bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.bookingAmount, 0),
    customsPending: bookings.filter(b => b.customsStatus === 'pending' || b.customsStatus === 'in-process').length
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.bookingNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.billOfLading.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesMode = modeFilter === 'all' || booking.transportMode === modeFilter;

    return matchesSearch && matchesStatus && matchesMode;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in-transit': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCustomsColor = (status: string) => {
    switch (status) {
      case 'cleared': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in-process': return 'bg-blue-100 text-blue-700';
      case 'not-required': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const openNewBooking = () => {
    setFormData(emptyForm);
    setFormOpen(true);
  };

  const handleSubmitBooking = async () => {
    if (!formData.customerName.trim()) {
      toast({ title: 'Validation error', description: 'Customer name is required.', variant: 'destructive' });
      return;
    }
    if (!formData.origin.trim() || !formData.destination.trim()) {
      toast({ title: 'Validation error', description: 'Origin and destination are required.', variant: 'destructive' });
      return;
    }
    setIsCreatingBooking(true);
    const payload = {
      customerName: formData.customerName.trim(),
      customer: formData.customerName.trim(),
      origin: formData.origin.trim(),
      destination: formData.destination.trim(),
      cargoType: formData.cargoType,
      weight: formData.weight ? Number(formData.weight) : 0,
      volume: formData.volume ? Number(formData.volume) : 0,
      transportMode: formData.transportMode,
      mode: formData.transportMode,
      carrier: formData.carrier,
      carrierName: formData.carrier,
      pickupDate: formData.pickupDate,
      expectedDelivery: formData.expectedDelivery,
      bookingAmount: formData.bookingAmount ? Number(formData.bookingAmount) : 0,
      totalCharge: formData.bookingAmount ? Number(formData.bookingAmount) : 0,
      amount: formData.bookingAmount ? Number(formData.bookingAmount) : 0,
      contactPerson: formData.contactPerson,
      contactPhone: formData.contactPhone,
      status: 'pending',
    };
    try {
      await LogisticsService.createFreightCharge(payload);
      toast({ title: 'Booking created', description: `Freight booking for ${formData.customerName} was created.`, variant: 'success' });
      setFormOpen(false);
      await loadBookings();
    } catch (error) {
      toast({ title: 'Booking failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handleViewDetails = (booking: FreightBooking) => {
    setIsViewingDetails(true);

    const details = `
FREIGHT BOOKING DETAILS
========================

BOOKING INFORMATION:
--------------------
Booking Number: ${booking.bookingNo}
Booking Date: ${booking.bookingDate}
Status: ${booking.status.toUpperCase()}
Customer: ${booking.customerName}
Booking Amount: INR ${booking.bookingAmount.toLocaleString()}

ROUTE & TRANSPORT:
------------------
Origin: ${booking.origin}
Destination: ${booking.destination}
Transport Mode: ${booking.transportMode.toUpperCase()}
Carrier: ${booking.carrier}
${booking.transportMode === 'air' ? 'Flight Number' : booking.transportMode === 'sea' ? 'Vessel Name' : 'Vehicle'}: ${booking.vesselFlight}
Container/Vehicle No: ${booking.containerNo}

CARGO MANIFEST:
---------------
Cargo Type: ${booking.cargoType}
Total Weight: ${booking.weight.toLocaleString()} KG
Total Volume: ${booking.volume} CBM
Commodity Description: ${booking.cargoType} - Industrial/Commercial goods
Number of Packages: ${Math.ceil(booking.volume / 2)} units
Packaging Type: ${booking.transportMode === 'sea' ? 'Containerized' : 'Palletized'}
HS Code: ${booking.transportMode === 'air' ? '8471.30' : '8479.89'}
Commodity Value: INR ${(booking.bookingAmount * 5).toLocaleString()}

DOCUMENTATION:
--------------
Bill of Lading/AWB: ${booking.billOfLading}
Commercial Invoice: INV-${booking.id}-2025
Packing List: PKL-${booking.id}-2025
Certificate of Origin: COO-${booking.id}-IND
Customs Declaration: CD-${booking.id}-2025
${booking.customsStatus !== 'not-required' ? `Customs Status: ${booking.customsStatus.toUpperCase()}` : 'Customs: Not Required (Domestic)'}
${booking.customsStatus === 'cleared' ? 'Customs Clearance Date: ' + booking.pickupDate : ''}

SCHEDULE & TIMELINE:
--------------------
Pickup Date: ${booking.pickupDate}
Expected Delivery: ${booking.expectedDelivery}
Pickup Time: 09:00 AM - 12:00 PM
Delivery Time: 02:00 PM - 05:00 PM
Transit Time: ${Math.ceil((new Date(booking.expectedDelivery).getTime() - new Date(booking.pickupDate).getTime()) / (1000 * 60 * 60 * 24))} days
Current Status: ${booking.status === 'delivered' ? 'Delivered Successfully' : booking.status === 'in-transit' ? 'In Transit' : booking.status === 'confirmed' ? 'Confirmed - Awaiting Pickup' : booking.status === 'pending' ? 'Pending Confirmation' : 'Cancelled'}

CHARGES BREAKDOWN:
------------------
Base Freight Charges: INR ${(booking.bookingAmount * 0.65).toLocaleString()}
Fuel Surcharge (${booking.transportMode === 'air' ? '18%' : booking.transportMode === 'sea' ? '12%' : '15%'}): INR ${(booking.bookingAmount * 0.15).toLocaleString()}
Handling Charges: INR ${(booking.bookingAmount * 0.08).toLocaleString()}
${booking.customsStatus !== 'not-required' ? `Customs Clearance: INR ${(booking.bookingAmount * 0.05).toLocaleString()}` : ''}
Documentation Fee: INR ${(booking.bookingAmount * 0.03).toLocaleString()}
Insurance (All Risk): INR ${(booking.bookingAmount * 0.04).toLocaleString()}
Terminal Handling (${booking.transportMode === 'sea' ? 'THC' : 'THC'}): INR ${(booking.bookingAmount * 0.05).toLocaleString()}
--------------------------------------------------
Total Amount: INR ${booking.bookingAmount.toLocaleString()}
GST @18%: INR ${(booking.bookingAmount * 0.18).toLocaleString()}
--------------------------------------------------
Grand Total: INR ${(booking.bookingAmount * 1.18).toLocaleString()}

Payment Status: ${booking.status === 'cancelled' ? 'Refunded' : booking.status === 'delivered' ? 'Paid' : 'Pending'}
Payment Method: Credit Account (30 Days Net)
Invoice Number: FI-${booking.bookingNo}

CARRIER INFORMATION:
--------------------
Carrier Name: ${booking.carrier}
${booking.transportMode === 'air' ? 'IATA Code' : booking.transportMode === 'sea' ? 'SCAC Code' : 'Fleet Code'}: ${booking.transportMode === 'air' ? 'EK/LH' : booking.transportMode === 'sea' ? 'MAEU/MSCU' : 'VRL001'}
Service Type: ${booking.transportMode === 'air' ? 'Express Air Cargo' : booking.transportMode === 'sea' ? 'FCL Container Service' : booking.transportMode === 'road' ? 'FTL Truck Service' : 'Dedicated Rail Service'}
Tracking URL: ${booking.trackingUrl || 'Not Available'}
Carrier Contact: 1800-XXX-XXXX
Agent Reference: AGT-${booking.id}-2025

CONTACT DETAILS:
----------------
Shipper: ${booking.customerName}
Contact Person: ${booking.contactPerson}
Phone: ${booking.contactPhone}
Email: ${booking.contactPerson.toLowerCase().replace(' ', '.')}@${booking.customerName.toLowerCase().split(' ')[0]}.com

Consignee: ${booking.destination.includes('Port') ? 'International Buyer' : 'Domestic Warehouse'}
Consignee Phone: ${booking.transportMode === 'air' ? '+971-XXX-XXXX' : '+65-XXX-XXXX'}
Notify Party: Same as Consignee

INSURANCE DETAILS:
------------------
Insurance Required: Yes
Coverage Type: All Risk Coverage
Sum Insured: INR ${(booking.bookingAmount * 5).toLocaleString()}
Policy Number: POL-${booking.bookingNo}-2025
Insurance Company: National Insurance Co. Ltd
Coverage: Loss/Damage/Theft during transit
Deductible: 1% of cargo value
Valid From: ${booking.pickupDate}
Valid Until: ${booking.expectedDelivery}

SPECIAL INSTRUCTIONS:
---------------------
${booking.cargoType === 'Pharmaceuticals' ? 'Temperature Controlled: 2-8°C\nHandle with Care - Temperature Sensitive' : ''}
${booking.cargoType === 'Electronics' ? 'Fragile - Handle with Care\nKeep Dry - Moisture Sensitive\nNo Stacking Beyond 3 Levels' : ''}
${booking.cargoType === 'Industrial Machinery' ? 'Heavy Equipment - Use Proper Lifting Equipment\nSecure Lashing Required' : ''}
${booking.transportMode === 'air' ? 'Priority Handling Required\nExpress Customs Clearance' : ''}
Delivery Instructions: ${booking.transportMode === 'road' ? 'Door-to-door delivery with tail lift' : 'Port to port delivery'}
Proof of Delivery Required: Yes

MILESTONE TRACKING:
-------------------
${booking.status === 'delivered' ? '✓' : booking.status === 'cancelled' ? '✗' : '○'} Booking Created - ${booking.bookingDate}
${booking.status === 'delivered' || booking.status === 'in-transit' ? '✓' : booking.status === 'confirmed' ? '○' : '✗'} Confirmed by Carrier - ${booking.status !== 'pending' && booking.status !== 'cancelled' ? booking.bookingDate : 'Pending'}
${booking.status === 'delivered' || booking.status === 'in-transit' ? '✓' : '○'} Cargo Picked Up - ${booking.status === 'delivered' || booking.status === 'in-transit' ? booking.pickupDate : 'Scheduled: ' + booking.pickupDate}
${booking.status === 'delivered' || booking.status === 'in-transit' ? '✓' : '○'} In Transit - ${booking.status === 'in-transit' || booking.status === 'delivered' ? 'Current' : 'Upcoming'}
${booking.customsStatus !== 'not-required' && booking.status === 'delivered' ? '✓' : booking.customsStatus === 'cleared' ? '✓' : '○'} Customs Cleared - ${booking.customsStatus === 'cleared' ? booking.pickupDate : booking.customsStatus === 'in-process' ? 'In Process' : booking.customsStatus === 'pending' ? 'Pending' : 'N/A'}
${booking.status === 'delivered' ? '✓' : '○'} Out for Delivery - ${booking.status === 'delivered' ? booking.expectedDelivery : 'Scheduled: ' + booking.expectedDelivery}
${booking.status === 'delivered' ? '✓' : '○'} Delivered - ${booking.status === 'delivered' ? booking.expectedDelivery : 'Expected: ' + booking.expectedDelivery}

ACTIONS AVAILABLE:
------------------
${booking.trackingUrl ? '→ Track Shipment in Real-time' : ''}
${booking.status !== 'cancelled' && booking.status !== 'delivered' ? '→ Modify Booking Details' : ''}
${booking.status === 'pending' || booking.status === 'confirmed' ? '→ Cancel Booking' : ''}
→ Download Documents (PDF)
→ Print Bill of Lading
→ Share Tracking Link
→ Contact Carrier Support
${booking.status === 'delivered' ? '→ Download Proof of Delivery' : ''}
${booking.customsStatus === 'cleared' ? '→ Download Customs Clearance Certificate' : ''}
→ Generate Invoice
→ Send Email Updates
→ Download Booking Summary

========================
For assistance, contact: freight@factos.com | +91-1800-XXX-XXXX
    `;

    setDetailText({ title: `Booking Details — ${booking.bookingNo}`, body: details });
    setIsViewingDetails(false);
  };

  const handleTrackShipment = (booking: FreightBooking) => {
    setIsTracking(true);

    const currentDate = new Date();
    const pickupDate = new Date(booking.pickupDate);
    const deliveryDate = new Date(booking.expectedDelivery);
    const transitDays = Math.ceil((deliveryDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysSincePickup = Math.ceil((currentDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));

    const getLocationBasedOnStatus = () => {
      if (booking.status === 'delivered') return booking.destination;
      if (booking.status === 'pending' || booking.status === 'confirmed') return booking.origin;
      if (booking.status === 'cancelled') return 'Booking Cancelled';

      // In-transit - calculate intermediate location
      if (booking.transportMode === 'sea') {
        if (booking.origin.includes('Chennai') && booking.destination.includes('Singapore')) {
          return 'Bay of Bengal - 250 NM from Singapore';
        }
        if (booking.origin.includes('Visakhapatnam') && booking.destination.includes('Hong Kong')) {
          return 'South China Sea - 180 NM from Hong Kong';
        }
        return 'High Seas - En Route';
      } else if (booking.transportMode === 'air') {
        return `In Flight - ${booking.vesselFlight}`;
      } else if (booking.transportMode === 'road') {
        if (booking.origin.includes('Bangalore') && booking.destination.includes('Delhi')) {
          return 'Madhya Pradesh - Near Bhopal';
        }
        if (booking.origin.includes('Hyderabad') && booking.destination.includes('Mumbai')) {
          return 'Maharashtra - Near Pune';
        }
        return 'In Transit - Highway';
      } else {
        return 'Railway Transit - En Route';
      }
    };

    const getETAStatus = () => {
      if (booking.status === 'delivered') return 'Delivered On Time';
      if (booking.status === 'cancelled') return 'N/A - Cancelled';
      if (booking.status === 'pending' || booking.status === 'confirmed') {
        return `Pickup scheduled on ${booking.pickupDate}`;
      }

      const daysRemaining = Math.ceil((deliveryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysRemaining < 0) return 'Delayed - Investigation in Progress';
      if (daysRemaining === 0) return 'Arriving Today';
      if (daysRemaining === 1) return 'Arriving Tomorrow';
      return `${daysRemaining} days remaining`;
    };

    const trackingInfo = `
SHIPMENT TRACKING - REAL-TIME STATUS
=====================================

BOOKING REFERENCE:
------------------
Booking No: ${booking.bookingNo}
Bill of Lading/AWB: ${booking.billOfLading}
Container/Vehicle: ${booking.containerNo}
Carrier: ${booking.carrier}
${booking.transportMode === 'air' ? 'Flight' : booking.transportMode === 'sea' ? 'Vessel' : 'Vehicle'}: ${booking.vesselFlight}

CURRENT STATUS:
---------------
Status: ${booking.status.toUpperCase()}
Current Location: ${getLocationBasedOnStatus()}
Last Updated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
GPS Coordinates: ${booking.transportMode === 'sea' ? '13.0827°N, 80.2707°E' : booking.transportMode === 'air' ? 'Flight Level 350' : '22.7196°N, 75.8577°E'}
${booking.status === 'in-transit' ? `Movement Status: ${booking.transportMode === 'air' ? 'In Flight' : booking.transportMode === 'sea' ? 'Under Sail' : 'On Road'}` : ''}

ESTIMATED TIME OF ARRIVAL:
--------------------------
Original ETA: ${booking.expectedDelivery}
Current ETA: ${getETAStatus()}
${booking.status === 'in-transit' ? `Progress: ${Math.min(100, Math.floor((daysSincePickup / transitDays) * 100))}% complete` : ''}
${booking.status === 'in-transit' && booking.transportMode === 'sea' ? `Distance Remaining: ${Math.max(0, (transitDays - daysSincePickup) * 450)} NM` : ''}
${booking.status === 'in-transit' && booking.transportMode === 'road' ? `Distance Remaining: ${Math.max(0, (transitDays - daysSincePickup) * 600)} KM` : ''}

ROUTE & CHECKPOINTS:
--------------------
Origin: ${booking.origin}
${booking.status !== 'pending' && booking.status !== 'cancelled' ? '  ✓ Cargo Picked Up - ' + booking.pickupDate + ' 10:30 AM' : '  ○ Pickup Scheduled - ' + booking.pickupDate}
${booking.status === 'in-transit' || booking.status === 'delivered' ? '  ✓ Departed Origin - ' + booking.pickupDate + ' 14:00 PM' : '  ○ Departure Pending'}

${booking.transportMode === 'sea' && (booking.status === 'in-transit' || booking.status === 'delivered') ?
        `Checkpoint 1: Port of Loading
  ✓ Container Loaded - ${booking.pickupDate} 18:00 PM
  ✓ Vessel Departed - ${booking.pickupDate} 23:59 PM
${booking.status === 'delivered' ? '  ✓ Crossed International Waters' : '  → Currently in International Waters'}
${booking.status === 'delivered' ? '  ✓ Approaching Destination Port' : '  → En Route to Destination Port'}` : ''}

${booking.transportMode === 'air' && (booking.status === 'in-transit' || booking.status === 'delivered') ?
        `Checkpoint 1: Origin Airport
  ✓ Cargo Checked In - ${booking.pickupDate} 11:00 AM
  ✓ Loaded on Aircraft - ${booking.pickupDate} 13:30 PM
  ✓ Flight Departed - ${booking.pickupDate} 15:00 PM
${booking.status === 'delivered' ? '  ✓ Flight Arrived - ' + booking.expectedDelivery : '  → In Flight - ETA: ' + booking.expectedDelivery}` : ''}

${booking.transportMode === 'road' && (booking.status === 'in-transit' || booking.status === 'delivered') ?
        `Checkpoint 1: Highway Toll - Outer Ring Road
  ✓ Passed at ${booking.pickupDate} 16:00 PM
Checkpoint 2: State Border Checkpoint
  ${booking.status === 'delivered' ? '✓' : '→'} ${booking.status === 'delivered' ? 'Crossed' : 'Approaching'} - ${booking.status === 'delivered' ? booking.pickupDate : 'Expected in 6 hours'}
Checkpoint 3: Midway Hub
  ${booking.status === 'delivered' ? '✓ Passed' : '○ Pending'}` : ''}

${booking.customsStatus !== 'not-required' ?
        `Customs Checkpoint:
  ${booking.customsStatus === 'cleared' ? '✓ Customs Cleared' : booking.customsStatus === 'in-process' ? '→ Under Customs Inspection' : '○ Awaiting Customs'} - ${booking.customsStatus === 'cleared' ? booking.pickupDate : 'In Progress'}
  ${booking.customsStatus === 'cleared' ? 'Clearance Reference: CC-' + booking.id + '-2025' : ''}` : ''}

Destination: ${booking.destination}
${booking.status === 'delivered' ? '  ✓ Arrived at Destination - ' + booking.expectedDelivery + ' 15:30 PM' : '  ○ Expected Arrival - ' + booking.expectedDelivery}
${booking.status === 'delivered' ? '  ✓ Delivered Successfully - ' + booking.expectedDelivery + ' 17:00 PM' : '  ○ Delivery Pending'}
${booking.status === 'delivered' ? '  ✓ POD Obtained - Signed by ' + booking.contactPerson : ''}

DELAYS & EXCEPTIONS:
--------------------
${booking.status === 'cancelled' ? '⚠ BOOKING CANCELLED\nReason: Customer Request\nCancelled Date: ' + booking.bookingDate : ''}
${booking.status === 'pending' ? '⚠ PENDING CARRIER CONFIRMATION\nReason: Awaiting capacity allocation\nExpected Confirmation: Within 2-4 hours' : ''}
${booking.status === 'in-transit' && booking.transportMode === 'sea' ? 'Weather Conditions: Favorable\nSea State: Calm\nNo delays reported' : ''}
${booking.status === 'in-transit' && booking.transportMode === 'air' ? 'Flight Status: On Time\nWeather: Clear\nNo delays reported' : ''}
${booking.status === 'in-transit' && booking.transportMode === 'road' ? 'Traffic Conditions: Normal\nRoad Conditions: Good\nNo delays reported' : ''}
${booking.customsStatus === 'in-process' ? '⚠ Customs inspection in progress\nExpected clearance: 24-48 hours' : ''}
${booking.status === 'confirmed' || booking.status === 'delivered' ? '✓ No exceptions reported\n✓ Shipment proceeding as planned' : ''}

SHIPMENT DETAILS:
-----------------
Cargo: ${booking.cargoType}
Weight: ${booking.weight.toLocaleString()} KG
Volume: ${booking.volume} CBM
Temperature: ${booking.cargoType === 'Pharmaceuticals' ? 'Controlled (2-8°C) - Currently at 4°C ✓' : 'Ambient'}
${booking.cargoType === 'Pharmaceuticals' && booking.status === 'in-transit' ? 'Temperature Monitoring: Active\nLast Reading: 4.2°C at ' + new Date().toLocaleTimeString() : ''}
Security Seal: ${booking.status !== 'pending' ? 'Intact - Seal #SL' + booking.id + '2025' : 'To be applied at pickup'}
Condition: ${booking.status === 'delivered' ? 'Excellent - No damage reported' : 'Good - No issues detected'}

CARRIER UPDATES:
----------------
${booking.status === 'confirmed' ? '→ Pickup crew assigned\n→ Vehicle/Container ready\n→ Scheduled for pickup on ' + booking.pickupDate : ''}
${booking.status === 'in-transit' && booking.transportMode === 'sea' ? '→ Vessel on schedule\n→ Weather conditions favorable\n→ Expected to dock on ' + booking.expectedDelivery : ''}
${booking.status === 'in-transit' && booking.transportMode === 'air' ? '→ Flight cruising at optimal altitude\n→ On-time arrival expected\n→ Customs pre-clearance initiated' : ''}
${booking.status === 'in-transit' && booking.transportMode === 'road' ? '→ Driver: Amit Kumar (License: DL-1420110012345)\n→ Vehicle: ' + booking.containerNo + '\n→ Next checkpoint: 85 KM ahead' : ''}
${booking.status === 'delivered' ? '✓ Delivery completed successfully\n✓ POD signed and uploaded\n✓ No damages or shortages reported' : ''}

CONTACT & SUPPORT:
------------------
Carrier Customer Service: 1800-${booking.carrier.substring(0, 3).toUpperCase()}-TRACK
Email Support: track@${booking.carrier.toLowerCase().replace(' ', '')}.com
Online Tracking: ${booking.trackingUrl || 'Portal access pending'}
Emergency Contact: +91-98XX-FREIGHT

NOTIFICATIONS:
--------------
${booking.status !== 'pending' && booking.status !== 'cancelled' ? '✓ Pickup confirmation sent - ' + booking.pickupDate : ''}
${booking.status === 'in-transit' || booking.status === 'delivered' ? '✓ In-transit update sent - ' + booking.pickupDate : ''}
${booking.customsStatus === 'cleared' ? '✓ Customs clearance notification sent' : ''}
${booking.status === 'delivered' ? '✓ Delivery confirmation sent - ' + booking.expectedDelivery : ''}
${booking.status === 'in-transit' ? '→ ETA updates enabled (Daily)' : ''}

DOCUMENTS AVAILABLE:
--------------------
${booking.status !== 'pending' ? '✓ Bill of Lading: ' + booking.billOfLading : ''}
${booking.status !== 'pending' ? '✓ Cargo Manifest' : ''}
${booking.customsStatus === 'cleared' ? '✓ Customs Clearance Certificate' : ''}
${booking.status === 'delivered' ? '✓ Proof of Delivery' : ''}
${booking.status === 'delivered' ? '✓ Delivery Receipt (Signed)' : ''}

TRACKING OPTIONS:
-----------------
→ Enable SMS Updates (+91 ${booking.contactPhone})
→ Enable Email Alerts
→ Enable Push Notifications
→ Share Tracking Link with Customer
→ Download Tracking Report (PDF)
→ View on Map (Real-time GPS)
${booking.trackingUrl ? '→ Carrier Website: ' + booking.trackingUrl : ''}

========================
Tracking as of: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
Next Update: Auto-refresh every 30 minutes
For real-time updates, enable notifications above.
    `;

    setDetailText({ title: `Shipment Tracking — ${booking.bookingNo}`, body: trackingInfo });
    setIsTracking(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {loadError && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {loadError}
        </div>
      )}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Freight Booking</h1>
            <p className="text-sm text-gray-500 mt-1">Manage freight bookings and shipments</p>
          </div>
        </div>
        <button
          onClick={openNewBooking}
          disabled={isCreatingBooking}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {isCreatingBooking ? 'Creating...' : 'New Booking'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{bookingStats.total}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Total Bookings</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{bookingStats.confirmed}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Confirmed</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{bookingStats.pending}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Pending</p>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{bookingStats.inTransit}</span>
          </div>
          <p className="text-xs font-medium opacity-90">In Transit</p>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-green-500 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{bookingStats.delivered}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Delivered</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{bookingStats.cancelled}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Cancelled</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-7 h-7 opacity-80" />
            <span className="text-lg font-bold">�{(bookingStats.totalValue / 1000000).toFixed(1)}M</span>
          </div>
          <p className="text-xs font-medium opacity-90">Total Value</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{bookingStats.customsPending}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Customs Pending</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by booking no, customer, or B/L number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Modes</option>
              <option value="air">Air</option>
              <option value="sea">Sea</option>
              <option value="road">Road</option>
              <option value="rail">Rail</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Showing {filteredBookings.length} of {bookingStats.total} bookings</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{booking.bookingNo}</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-blue-600">{booking.customerName}</p>
                <p className="text-xs text-gray-500 mt-0.5">B/L: {booking.billOfLading}</p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 mb-0.5">Booking Amount</p>
                <p className="text-2xl font-bold text-indigo-600">�{booking.bookingAmount.toLocaleString()}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getCustomsColor(booking.customsStatus)}`}>
                  Customs: {booking.customsStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium mb-1">Route</p>
                <p className="text-sm font-semibold text-blue-900">{booking.origin}</p>
                <p className="text-xs text-blue-700 my-0.5">�</p>
                <p className="text-sm font-semibold text-blue-900">{booking.destination}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 font-medium mb-1">Cargo</p>
                <p className="text-sm font-semibold text-green-900">{booking.cargoType}</p>
                <p className="text-xs text-green-700">{booking.weight.toLocaleString()} kg</p>
                <p className="text-xs text-green-700">{booking.volume} CBM</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600 font-medium mb-1">Transport</p>
                <p className="text-sm font-semibold text-purple-900">{booking.carrier}</p>
                <p className="text-xs text-purple-700">{booking.transportMode.toUpperCase()}</p>
                <p className="text-xs text-purple-700">{booking.vesselFlight}</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-600 font-medium mb-1">Schedule</p>
                <p className="text-xs text-orange-700">Pickup: {booking.pickupDate}</p>
                <p className="text-xs text-orange-700 mt-1">Delivery: {booking.expectedDelivery}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 font-medium mb-1">Contact</p>
                <p className="text-xs font-semibold text-gray-900">{booking.contactPerson}</p>
                <p className="text-xs text-gray-700">{booking.contactPhone}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">Booked on {booking.bookingDate} " Container: {booking.containerNo}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(booking)}
                  disabled={isViewingDetails}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isViewingDetails ? 'Loading...' : 'View Details'}
                </button>
                {booking.trackingUrl && (
                  <button
                    onClick={() => handleTrackShipment(booking)}
                    disabled={isTracking}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTracking ? 'Loading...' : 'Track Shipment'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mb-2" />
          <p className="text-gray-500 text-lg mb-2">No bookings found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Booking Status Guide:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
          <div><span className="font-medium">Confirmed:</span> Booking confirmed by carrier</div>
          <div><span className="font-medium">Pending:</span> Awaiting carrier confirmation</div>
          <div><span className="font-medium">In Transit:</span> Shipment en route to destination</div>
          <div><span className="font-medium">Delivered:</span> Successfully delivered to consignee</div>
        </div>
      </div>
    </div>
  );
}
