'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LogisticsManagementService from '@/services/logistics-management.service';

interface GatePassRow {
    id: string;
    type: string;
    vehicle: string;
    driver: string;
    status: string;
    checkOutTime: string | null;
}

export default function GatePassManagerPage() {
    const [passes, setPasses] = useState<GatePassRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [type, setType] = useState('returnable');
    const [vehicle, setVehicle] = useState('');
    const [driver, setDriver] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await LogisticsManagementService.getGatePasses();
                if (!mounted) return;
                const rows: GatePassRow[] = (data || []).map((g: any) => ({
                    id: String(g?.gatePassNumber || g?.gatePassCode || g?.id || ''),
                    type: g?.gatePassType || '-',
                    vehicle: g?.vehicleNumber || '-',
                    driver: g?.driverName || '-',
                    status: g?.status || 'Issued',
                    checkOutTime: g?.checkOutTime || null,
                }));
                setPasses(rows);
            } catch (e: any) {
                if (mounted) setError(e?.message || 'Failed to load gate passes');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const handleCreatePass = (e: React.FormEvent) => {
        e.preventDefault();
        const newPass = {
            id: `GP-${Date.now()}`,
            type: type === 'returnable' ? 'Returnable' : 'Non-Returnable',
            vehicle,
            driver,
            status: 'Issued',
            checkOutTime: null,
        };
        setPasses([...passes, newPass]);
        setVehicle('');
        setDriver('');
    };

    return (
        <div className="w-full py-2 space-y-3">
            <h1 className="text-3xl font-bold">Gate Pass Management</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Gate Pass</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreatePass} className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="returnable">Returnable</SelectItem>
                                        <SelectItem value="non-returnable">Non-Returnable</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Vehicle Number</Label>
                                <Input
                                    value={vehicle}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicle(e.target.value)}
                                    placeholder="MH-01-AB-1234"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Driver Name</Label>
                                <Input
                                    value={driver}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDriver(e.target.value)}
                                    placeholder="Enter driver name"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit">Create Gate Pass</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Gate Pass Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pass ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Driver</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Check-Out Time</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                                        Loading gate passes...
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && error && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-red-600 py-6">
                                        {error}
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && !error && passes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                                        No gate passes found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && !error && passes.map((pass) => (
                                <TableRow key={pass.id}>
                                    <TableCell className="font-medium">{pass.id}</TableCell>
                                    <TableCell>{pass.type}</TableCell>
                                    <TableCell>{pass.vehicle}</TableCell>
                                    <TableCell>{pass.driver}</TableCell>
                                    <TableCell>
                                        <Badge variant={pass.status === 'Checked Out' ? 'default' : 'secondary'}>
                                            {pass.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{pass.checkOutTime || '-'}</TableCell>
                                    <TableCell>
                                        {pass.status === 'Issued' && (
                                            <Button size="sm" variant="outline">Check Out</Button>
                                        )}
                                        {pass.status === 'Checked Out' && pass.type === 'Returnable' && (
                                            <Button size="sm" variant="outline">Check In</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
