'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Camera, Clock, Wifi, WifiOff, Navigation, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { projectManagementService, FieldScheduleItem } from '@/services/ProjectManagementService';

export default function MobileFieldViewPage() {
  const { toast } = useToast();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [schedule, setSchedule] = useState<FieldScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    loadSchedule();

    // Offline Mode Detection
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await projectManagementService.getSchedule();
      setSchedule(data);
    } catch (error) {
      console.error("Failed to load schedule", error);
      // Don't show error toast on initial load if offline, just show cached/empty
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!isOnline) {
      toast({
        variant: "destructive",
        title: "Offline",
        description: "Cannot check in while offline.",
      });
      return;
    }
    try {
      await projectManagementService.checkIn({ location: location ?? undefined });
      setIsCheckedIn(true);
      toast({
        title: "Checked In",
        description: "You have successfully checked in.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check in.",
      });
    }
  };

  const handleCheckOut = async () => {
    if (!isOnline) {
      toast({
        variant: "destructive",
        title: "Offline",
        description: "Cannot check out while offline.",
      });
      return;
    }
    try {
      await projectManagementService.checkOut({ location: location ?? undefined });
      setIsCheckedIn(false);
      toast({
        title: "Checked Out",
        description: "You have successfully checked out.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check out.",
      });
    }
  };

  const toggleLocationTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setLocation(null);
      toast({ title: "GPS", description: "Location tracking stopped." });
    } else {
      if ('geolocation' in navigator) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            toast({ variant: "destructive", title: "GPS Error", description: error.message });
          },
          { enableHighAccuracy: true }
        );
        setWatchId(id);
        toast({ title: "GPS", description: "Location tracking started." });
      } else {
        toast({ variant: "destructive", title: "GPS Error", description: "Geolocation not supported." });
      }
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = () => {
    setPhotoPreview(null);
  };

  const handleUploadPhoto = async () => {
    if (!photoPreview) return;
    if (!isOnline) {
      toast({ variant: "destructive", title: "Offline", description: "Cannot upload while offline." });
      return;
    }
    // Attribute the photo to today's scheduled project when available.
    const projectId = (schedule[0] as any)?.projectId || (schedule[0] as any)?.id || 'field';
    setUploadingPhoto(true);
    try {
      await projectManagementService.uploadSitePhoto(String(projectId), {
        photoUrl: photoPreview,
        description: location ? `Site photo @ ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Site photo',
      });
      toast({ title: "Photo Uploaded", description: "Site photo uploaded successfully." });
      setPhotoPreview(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Upload failed", description: error instanceof Error ? error.message : "Could not upload the photo." });
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="w-full py-2 space-y-3 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Field View</h1>
        {!isOnline && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <WifiOff className="h-3 w-3" /> Offline
          </Badge>
        )}
        {isOnline && (
          <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-200 bg-green-50">
            <Wifi className="h-3 w-3" /> Online
          </Badge>
        )}
      </div>

      {/* GPS Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            GPS Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Location</p>
              {location ? (
                <p className="font-mono text-sm">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Not tracking</p>
              )}
            </div>
            <Button
              variant={watchId !== null ? "destructive" : "outline"}
              onClick={toggleLocationTracking}
              className="flex items-center gap-2"
            >
              <Navigation className={`h-4 w-4 ${watchId !== null ? "animate-pulse" : ""}`} />
              {watchId !== null ? "Stop Tracking" : "Start Tracking"}
            </Button>
          </div>
          {location && (
            <div className="mt-4 h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <p className="text-xs text-gray-500">Map View Placeholder (Integration Required)</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Check-in/Out Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={isCheckedIn ? 'default' : 'secondary'}>
                {isCheckedIn ? 'Checked In' : 'Not Checked In'}
              </Badge>
            </div>
            {!isCheckedIn ? (
              <Button onClick={handleCheckIn} disabled={!isOnline}>Check In</Button>
            ) : (
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleCheckOut} disabled={!isOnline}>Check Out</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading schedule...</p>
          ) : (
            <div className="space-y-3">
              {schedule.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.project}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.time}</p>
                  </div>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Upload Site Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!photoPreview ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handlePhotoSelect}
              />
              <Camera className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Tap to take a photo</p>
              <p className="text-xs text-muted-foreground">or select from gallery</p>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img src={photoPreview} alt="Site preview" className="w-full h-64 object-cover" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full"
                onClick={clearPhoto}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                <Button className="w-full bg-white text-black hover:bg-gray-100" onClick={handleUploadPhoto} disabled={uploadingPhoto}>
                  {uploadingPhoto ? 'Uploading…' : 'Upload Photo'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
