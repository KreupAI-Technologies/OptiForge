'use client';

import React, { useState, useEffect } from 'react';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DieTool {
    id: string;
    name: string;
    type: string;
    status: string;
    lifeUsed: number;
    maxLife: number;
    location?: string;
    currentWorkOrder?: string;
}

export default function DiesToolsManagerPage() {
    const [tools, setTools] = useState<DieTool[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = (await ProductionOrphanService.getDieToolAssets()) as any[];
                const mapped: DieTool[] = (Array.isArray(raw) ? raw : []).map((d: any, i: number) => ({
                    id: d?.assetCode ?? d?.id ?? String(i),
                    name: d?.name ?? '',
                    type: d?.type ?? 'Tool',
                    status: d?.status ?? 'Available',
                    lifeUsed: Number(d?.lifeUsed ?? 0),
                    maxLife: Number(d?.maxLife ?? 0),
                    location: d?.location ?? undefined,
                    currentWorkOrder: d?.currentWorkOrder ?? undefined,
                }));
                if (!cancelled) setTools(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load dies & tools');
                    setTools([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return 'default';
            case 'Issued': return 'secondary';
            case 'Maintenance': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <div className="w-full py-2 space-y-3">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dies & Tools Management</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Add New Tool</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Tool/Die</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                            <div className="space-y-2">
                                <Label>Tool ID</Label>
                                <Input placeholder="Enter tool ID" />
                            </div>
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input placeholder="Enter tool name" />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Input placeholder="Die/Tool" />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Life</Label>
                                <Input type="number" placeholder="Enter max life cycles" />
                            </div>
                            <Button className="w-full">Create Tool</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tool Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tool ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Life Used</TableHead>
                                <TableHead>Location/WO</TableHead>
                                <TableHead>Actions </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow><TableCell colSpan={7} className="text-center text-sm text-gray-500 py-6">Loading dies &amp; tools...</TableCell></TableRow>
                            )}
                            {!isLoading && loadError && (
                                <TableRow><TableCell colSpan={7} className="text-center text-sm text-red-600 py-6">{loadError}</TableCell></TableRow>
                            )}
                            {!isLoading && !loadError && tools.length === 0 && (
                                <TableRow><TableCell colSpan={7} className="text-center text-sm text-gray-500 py-6">No dies or tools found.</TableCell></TableRow>
                            )}
                            {!isLoading && !loadError && tools.map((tool) => (
                                <TableRow key={tool.id}>
                                    <TableCell className="font-medium">{tool.id}</TableCell>
                                    <TableCell>{tool.name}</TableCell>
                                    <TableCell>{tool.type}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(tool.status)}>{tool.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="text-sm">{tool.lifeUsed} / {tool.maxLife}</div>
                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${tool.lifeUsed / tool.maxLife > 0.8 ? 'bg-red-500' : 'bg-green-500'}`}
                                                    style={{ width: `${(tool.lifeUsed / tool.maxLife) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{tool.currentWorkOrder || tool.location}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {tool.status === 'Available' && (
                                                <Button size="sm" variant="outline">Issue</Button>
                                            )}
                                            {tool.status === 'Issued' && (
                                                <Button size="sm" variant="outline">Return</Button>
                                            )}
                                        </div>
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
