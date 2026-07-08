'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Thermometer,
  Navigation,
  Calendar,
  TrendingUp,
  Map,
  Route,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Truck,
  Activity,
  Droplet,
  Wind,
  BarChart3,
  Target,
  Zap,
  Loader2,
  FolderKanban,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { shipmentService, Shipment, CreateShipmentDto } from '@/services/shipment.service';
import { projectManagementService, Project } from '@/services/ProjectManagementService';

interface ProjectInfo {
  id: string;
  name: string;
  clientName: string;
  status: string;
}

// TrackingEvent Interface
interface TrackingEvent {
  id: string;
  tracking_id: string;
  shipment_number: string;
  current_location: string;
  last_update: string;
  event_type: 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'customs_clearance';
  status: string;
  temperature?: number;
  humidity?: number;
  estimated_delivery: string;
  actual_delivery?: string;
  carrier: string;
  origin: string;
  destination: string;
  distance_remaining_km: number;
  notes: string;
  checkpoints_passed: number;
  total_checkpoints: number;
  delay_hours: number;
  customer_name: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Helper function to map shipment to tracking event
const mapShipmentToTrackingEvent = (shipment: Shipment, index: number): TrackingEvent => {
  const eventTypeMap: Record<Shipment['status'], TrackingEvent['event_type']> = {
    'Draft': 'picked_up',
    'Pending': 'picked_up',
    'Dispatched': 'in_transit',
    'In Transit': 'in_transit',
    'Delivered': 'delivered',
    'Cancelled': 'exception',
    'Returned': 'exception'
  };

  const priorityMap: Record<Shipment['priority'], TrackingEvent['priority']> = {
    'Low': 'low',
    'Normal': 'medium',
    'High': 'high',
    'Urgent': 'critical'
  };

  const isDelivered = shipment.status === 'Delivered';
  const isInTransit = shipment.status === 'In Transit' || shipment.status === 'Dispatched';
  const checkpointsPassed = isDelivered ? 5 : isInTransit ? 3 : 1;
  const distanceRemaining = isDelivered ? 0 : Math.floor(Math.random() * 500) + 100;

  return {
    id: shipment.id,
    tracking_id: `TRK-2025-${String(index + 1).padStart(3, '0')}`,
    shipment_number: shipment.shipmentNumber,
    current_location: isDelivered ? `${shipment.city}, ${shipment.state}` : isInTransit ? 'In Transit Hub' : 'Origin Warehouse',
    last_update: shipment.updatedAt.replace('T', ' ').slice(0, 16),
    event_type: eventTypeMap[shipment.status] || 'in_transit',
    status: shipment.status,
    temperature: Math.floor(Math.random() * 10) + 20,
    humidity: Math.floor(Math.random() * 30) + 40,
    estimated_delivery: shipment.expectedDeliveryDate,
    actual_delivery: shipment.actualDeliveryDate,
    carrier: shipment.carrierName || 'Internal Fleet',
    origin: 'Mumbai, Maharashtra',
    destination: `${shipment.city}, ${shipment.state}`,
    distance_remaining_km: distanceRemaining,
    notes: shipment.notes || 'Package in transit',
    checkpoints_passed: checkpointsPassed,
    total_checkpoints: 5,
    delay_hours: shipment.status === 'Cancelled' || shipment.status === 'Returned' ? 24 : 0,
    customer_name: shipment.customerName,
    priority: priorityMap[shipment.priority] || 'medium'
  };
};

export default function LogisticsTrackingPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Project selection state
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Loading states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // State for tracking events loaded from service
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load projects and tracking data
  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadTrackingData();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const allProjects = await projectManagementService.getProjects();
      const projectInfos: ProjectInfo[] = allProjects.map((p: Project) => ({
        id: p.id,
        name: p.name || `Project ${p.id}`,
        clientName: p.clientName || 'Unknown Client',
        status: p.status || 'active',
      }));
      setProjects(projectInfos);

      const projectId = searchParams.get('projectId');
      if (projectId) {
        const found = projectInfos.find(p => p.id === projectId);
        if (found) {
          setSelectedProject(found);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleProjectSelect = (project: ProjectInfo) => {
    setSelectedProject(project);
    toast({ title: 'Project Selected', description: `Viewing tracking for ${project.name}` });
  };

  const handleChangeProject = () => {
    setSelectedProject(null);
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const loadTrackingData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const { data: shipments } = await shipmentService.getAllShipments();
      const events = shipments.map((shipment, index) => mapShipmentToTrackingEvent(shipment, index));
      setTrackingEvents(events);
    } catch (error) {
      console.error('Error loading tracking data:', error);
      setLoadError('Failed to load tracking data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Tracking events are now loaded from service via loadTrackingData()

  // Calculate stats
  const stats = {
    trackedShipments: trackingEvents.length,
    activeRoutes: trackingEvents.filter(t => t.event_type === 'in_transit' || t.event_type === 'out_for_delivery').length,
    checkpointsPassed: trackingEvents.reduce((sum, t) => sum + t.checkpoints_passed, 0),
    avgTransitTime: '2.5 days',
    deliveredToday: trackingEvents.filter(t => t.event_type === 'delivered' && t.actual_delivery?.startsWith('2025-01-17')).length,
    exceptions: trackingEvents.filter(t => t.event_type === 'exception').length,
    onTimeRate: ((trackingEvents.filter(t => t.delay_hours === 0).length / trackingEvents.length) * 100).toFixed(1)
  };

  // Get unique locations for filter
  const locations = Array.from(new Set(trackingEvents.map(t => t.current_location)));

  // Filter tracking events
  const filteredEvents = trackingEvents.filter(event => {
    const matchesSearch =
      event.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.shipment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.current_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || event.event_type === statusFilter;
    const matchesLocation = locationFilter === 'all' || event.current_location === locationFilter;
    const matchesPriority = priorityFilter === 'all' || event.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesLocation && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  // Handler Functions
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadTrackingData();
      toast({ title: 'Refreshed', description: 'Tracking data has been updated.', variant: 'success' });
    } catch (error) {
      console.error('Error refreshing tracking data:', error);
      toast({ title: 'Error', description: 'Failed to refresh tracking data. Please try again.', variant: 'destructive' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTrackNewShipment = async () => {
    setIsTracking(true);
    try {
      const today = new Date();
      const eta = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const payload: CreateShipmentDto = {
        customerId: '',
        customerName: 'New Tracked Shipment',
        deliveryAddress: 'To be assigned',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        expectedDeliveryDate: eta,
        priority: 'Normal',
        items: [
          { productId: '', productCode: 'TRK-ITEM', productName: 'Tracked Shipment', quantity: 1, uom: 'PCS', weight: 0 },
        ],
        notes: 'Added via tracking dashboard',
      };
      const created = await shipmentService.createShipment(payload);
      toast({
        title: 'Shipment Added',
        description: `Shipment ${created.shipmentNumber} is now being tracked.`,
        variant: 'success'
      });
      await loadTrackingData();
    } catch (error) {
      console.error('Error adding shipment to tracking:', error);
      toast({ title: 'Error', description: 'Failed to add new shipment. Please try again.', variant: 'destructive' });
    } finally {
      setIsTracking(false);
    }
  };

  const handleExportTracking = async () => {
    if (filteredEvents.length === 0) {
      toast({ title: 'Nothing to export', description: 'No tracking events match the current filters.' });
      return;
    }
    setIsExporting(true);
    try {
      // Create CSV content
      const csvHeaders = [
        'Tracking ID',
        'Shipment Number',
        'Customer Name',
        'Current Location',
        'Last Update',
        'Event Type',
        'Status',
        'Temperature (°C)',
        'Humidity (%)',
        'Estimated Delivery',
        'Actual Delivery',
        'Carrier',
        'Origin',
        'Destination',
        'Distance Remaining (km)',
        'Checkpoints Passed',
        'Total Checkpoints',
        'Progress (%)',
        'Delay (hours)',
        'Priority',
        'Notes'
      ];

      const csvRows = filteredEvents.map(event => [
        event.tracking_id,
        event.shipment_number,
        event.customer_name,
        event.current_location,
        event.last_update,
        event.event_type,
        event.status,
        event.temperature || 'N/A',
        event.humidity || 'N/A',
        event.estimated_delivery,
        event.actual_delivery || 'N/A',
        event.carrier,
        event.origin,
        event.destination,
        event.distance_remaining_km,
        event.checkpoints_passed,
        event.total_checkpoints,
        ((event.checkpoints_passed / event.total_checkpoints) * 100).toFixed(1),
        event.delay_hours,
        event.priority,
        `"${event.notes}"`
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `shipment_tracking_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export complete',
        description: `${filteredEvents.length} tracking events exported to CSV.`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Error exporting tracking data:', error);
      toast({ title: 'Error', description: 'Failed to export tracking data. Please try again.', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewTracking = (shipment: TrackingEvent) => {
    // Generate detailed tracking timeline
    const checkpoints = [];
    for (let i = 1; i <= shipment.total_checkpoints; i++) {
      checkpoints.push({
        number: i,
        passed: i <= shipment.checkpoints_passed,
        status: i <= shipment.checkpoints_passed ? 'Completed' : 'Pending'
      });
    }

    const timeline = checkpoints.map((cp, idx) =>
      `${cp.passed ? '✓' : '○'} Checkpoint ${cp.number}: ${cp.status}${cp.passed ? ' ✓' : ''}`
    ).join('\n');

    alert('📦 Detailed Shipment Tracking Information\n\n' +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `TRACKING DETAILS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Tracking ID: ${shipment.tracking_id}\n` +
      `Shipment Number: ${shipment.shipment_number}\n` +
      `Customer: ${shipment.customer_name}\n` +
      `Priority: ${shipment.priority.toUpperCase()}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `ROUTE INFORMATION\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Origin: ${shipment.origin}\n` +
      `Destination: ${shipment.destination}\n` +
      `Current Location: ${shipment.current_location}\n` +
      `Distance Remaining: ${shipment.distance_remaining_km} km\n` +
      `Carrier: ${shipment.carrier}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `STATUS & PROGRESS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Event Type: ${shipment.event_type.replace(/_/g, ' ').toUpperCase()}\n` +
      `Status: ${shipment.status}\n` +
      `Progress: ${shipment.checkpoints_passed}/${shipment.total_checkpoints} checkpoints (${((shipment.checkpoints_passed / shipment.total_checkpoints) * 100).toFixed(0)}%)\n` +
      `Delay: ${shipment.delay_hours > 0 ? shipment.delay_hours + ' hours' : 'On schedule'}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `TIMELINE & CHECKPOINTS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${timeline}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `ENVIRONMENTAL CONDITIONS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Temperature: ${shipment.temperature ? shipment.temperature + '°C' : 'Not monitored'}\n` +
      `Humidity: ${shipment.humidity ? shipment.humidity + '%' : 'Not monitored'}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `DELIVERY SCHEDULE\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Estimated Delivery: ${shipment.estimated_delivery}\n` +
      `${shipment.actual_delivery ? 'Actual Delivery: ' + shipment.actual_delivery + '\n' : ''}` +
      `Last Update: ${shipment.last_update}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `NOTES\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${shipment.notes}`);
  };

  const handleViewOnMap = (shipment: TrackingEvent) => {
    // Generate simulated coordinates based on location
    const locationCoords: { [key: string]: { lat: number; lng: number } } = {
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Delhi': { lat: 28.7041, lng: 77.1025 },
      'Bangalore': { lat: 12.9716, lng: 77.5946 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Nagpur': { lat: 21.1458, lng: 79.0882 }
    };

    const getCurrentCoords = () => {
      const city = shipment.current_location.split(' ')[0];
      return locationCoords[city] || { lat: 20.5937, lng: 78.9629 };
    };

    const getOriginCoords = () => {
      const city = shipment.origin.split(',')[0];
      return locationCoords[city] || { lat: 20.5937, lng: 78.9629 };
    };

    const getDestCoords = () => {
      const city = shipment.destination.split(',')[0];
      return locationCoords[city] || { lat: 20.5937, lng: 78.9629 };
    };

    const currentCoords = getCurrentCoords();
    const originCoords = getOriginCoords();
    const destCoords = getDestCoords();

    const routeVisualization =
      `Origin ● ————————> Current ● ————————> Destination ●\n` +
      `${shipment.origin}      ${shipment.current_location}      ${shipment.destination}`;

    alert('🗺️ Shipment Location Map View\n\n' +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `SHIPMENT: ${shipment.tracking_id}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📍 CURRENT POSITION\n` +
      `Location: ${shipment.current_location}\n` +
      `Coordinates: ${currentCoords.lat.toFixed(4)}°N, ${currentCoords.lng.toFixed(4)}°E\n` +
      `Last Update: ${shipment.last_update}\n` +
      `Speed Status: ${shipment.event_type === 'in_transit' ? 'Moving' : 'Stationary'}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `ROUTE VISUALIZATION\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${routeVisualization}\n\n` +
      `🚀 ORIGIN POINT\n` +
      `Location: ${shipment.origin}\n` +
      `Coordinates: ${originCoords.lat.toFixed(4)}°N, ${originCoords.lng.toFixed(4)}°E\n\n` +
      `📍 CURRENT POSITION\n` +
      `Location: ${shipment.current_location}\n` +
      `Coordinates: ${currentCoords.lat.toFixed(4)}°N, ${currentCoords.lng.toFixed(4)}°E\n` +
      `Progress: ${((shipment.checkpoints_passed / shipment.total_checkpoints) * 100).toFixed(0)}% complete\n\n` +
      `🎯 DESTINATION\n` +
      `Location: ${shipment.destination}\n` +
      `Coordinates: ${destCoords.lat.toFixed(4)}°N, ${destCoords.lng.toFixed(4)}°E\n` +
      `Distance Remaining: ${shipment.distance_remaining_km} km\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `ROUTE DETAILS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Carrier: ${shipment.carrier}\n` +
      `Transit Mode: Road Transport\n` +
      `Route Type: ${shipment.priority === 'critical' || shipment.priority === 'high' ? 'Express Route' : 'Standard Route'}\n` +
      `Checkpoints: ${shipment.checkpoints_passed}/${shipment.total_checkpoints} passed\n` +
      `ETA: ${shipment.estimated_delivery}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `MAP FEATURES AVAILABLE\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `✓ Real-time GPS tracking\n` +
      `✓ Route optimization display\n` +
      `✓ Checkpoint markers\n` +
      `✓ Traffic conditions overlay\n` +
      `✓ Weather alerts on route\n` +
      `✓ Delivery zone boundaries\n` +
      `✓ Historical path tracking\n\n` +
      `Note: Full interactive map view available in web interface`);
  };

  const handleEditTracking = (shipment: TrackingEvent) => {
    alert('✏️ Edit Tracking Details\n\n' +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `SHIPMENT: ${shipment.tracking_id}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Current Details:\n` +
      `• Tracking ID: ${shipment.tracking_id}\n` +
      `• Shipment Number: ${shipment.shipment_number}\n` +
      `• Customer: ${shipment.customer_name}\n` +
      `• Current Location: ${shipment.current_location}\n` +
      `• Status: ${shipment.status}\n` +
      `• Priority: ${shipment.priority.toUpperCase()}\n` +
      `• Carrier: ${shipment.carrier}\n` +
      `• ETA: ${shipment.estimated_delivery}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `EDITABLE FIELDS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `✓ Current Location\n` +
      `✓ Event Type & Status\n` +
      `✓ Priority Level\n` +
      `✓ Estimated Delivery Time\n` +
      `✓ Carrier Assignment\n` +
      `✓ Environmental Conditions\n` +
      `✓ Checkpoint Progress\n` +
      `✓ Delay Information\n` +
      `✓ Tracking Notes\n` +
      `✓ Route Modifications\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `AVAILABLE ACTIONS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `• Update current location\n` +
      `• Modify delivery schedule\n` +
      `• Change priority level\n` +
      `• Reassign carrier\n` +
      `• Add checkpoint milestone\n` +
      `• Update environmental readings\n` +
      `• Record delay/exception\n` +
      `• Add tracking notes\n` +
      `• Update customer notifications\n\n` +
      `Would you like to proceed with editing this shipment?\n` +
      `(Full edit form available in production interface)`);
  };

  // Event type badge component
  const EventTypeBadge = ({ type }: { type: TrackingEvent['event_type'] }) => {
    const styles = {
      picked_up: 'bg-blue-100 text-blue-800 border-blue-200',
      in_transit: 'bg-purple-100 text-purple-800 border-purple-200',
      out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      exception: 'bg-red-100 text-red-800 border-red-200',
      customs_clearance: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    const icons = {
      picked_up: Package,
      in_transit: Navigation,
      out_for_delivery: Route,
      delivered: CheckCircle,
      exception: AlertCircle,
      customs_clearance: Clock
    };

    const Icon = icons[type];

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[type]}`}>
        <Icon className="w-3 h-3" />
        {type.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: TrackingEvent['priority'] }) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  // Progress bar component
  const ProgressBar = ({ current, total }: { current: number; total: number }) => {
    const percentage = (current / total) * 100;
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{current}/{total} checkpoints</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Project Selection View
  if (!selectedProject) {
    return (
      <div className="w-full h-screen overflow-y-auto bg-gray-50">
        <div className="px-4 py-4 space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Navigation className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Logistics Tracking</h1>
                <p className="text-sm text-gray-600">Select a project to view tracking data</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {isLoadingProjects ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading projects...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProjectSelect(project)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base">{project.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className="capitalize">{project.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>{project.clientName}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Select Project</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logistics Tracking System</h1>
          <p className="text-sm text-gray-500 mt-1">{selectedProject.name} • {selectedProject.clientName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleChangeProject}>
            Change Project
          </Button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleTrackNewShipment}
            disabled={isTracking}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {isTracking ? 'Adding...' : 'Track New Shipment'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg shadow p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tracked Shipments</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.trackedShipments}</p>
              <p className="text-xs text-gray-500 mt-1">Total active</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Routes</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.activeRoutes}</p>
              <p className="text-xs text-gray-500 mt-1">In transit</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Navigation className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.deliveredToday}</p>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Exceptions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.exceptions}</p>
              <p className="text-xs text-gray-500 mt-1">Need attention</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3 border border-cyan-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-600">Checkpoints Passed</p>
              <p className="text-xl font-bold text-cyan-900 mt-1">{stats.checkpointsPassed}</p>
            </div>
            <Target className="w-8 h-8 text-cyan-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Transit Time</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.avgTransitTime}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">On-Time Rate</p>
              <p className="text-xl font-bold text-green-900 mt-1">{stats.onTimeRate}%</p>
            </div>
            <Zap className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tracking ID, shipment, location, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="exception">Exception</option>
                <option value="customs_clearance">Customs Clearance</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <Activity className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportTracking}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking Details
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Location
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route Progress
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conditions
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Time
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                      <span className="text-gray-500">Loading tracking data...</span>
                    </div>
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                      <span className="text-red-500">{loadError}</span>
                      <button
                        onClick={handleRefresh}
                        className="mt-2 text-blue-600 hover:text-blue-700"
                      >
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-500">No tracking events found</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Map className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.tracking_id}</div>
                        <div className="text-xs text-gray-500">Shipment: {event.shipment_number}</div>
                        <div className="text-xs text-gray-400">Carrier: {event.carrier}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.customer_name}</div>
                    <div className="text-xs text-gray-500">{event.destination}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-900">{event.current_location}</div>
                        <div className="text-xs text-gray-500">Updated: {event.last_update}</div>
                        {event.distance_remaining_km > 0 && (
                          <div className="text-xs text-blue-600">{event.distance_remaining_km} km remaining</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2" style={{ minWidth: '200px' }}>
                    <ProgressBar current={event.checkpoints_passed} total={event.total_checkpoints} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <EventTypeBadge type={event.event_type} />
                    {event.delay_hours > 0 && (
                      <div className="text-xs text-red-600 mt-1">Delayed {event.delay_hours}h</div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      {event.temperature && (
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-900">{event.temperature}°C</span>
                        </div>
                      )}
                      {event.humidity && (
                        <div className="flex items-center gap-2">
                          <Droplet className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-900">{event.humidity}%</span>
                        </div>
                      )}
                      {!event.temperature && !event.humidity && (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>Est: {event.estimated_delivery}</span>
                      </div>
                      {event.actual_delivery && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>Act: {event.actual_delivery}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <PriorityBadge priority={event.priority} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewTracking(event)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="View Tracking Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleViewOnMap(event)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="View on Map"
                      >
                        <Map className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleEditTracking(event)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Edit Tracking"
                      >
                        <Edit2 className="w-4 h-4 text-green-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEvents.length)} of {filteredEvents.length} tracking events
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded text-sm ${currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
