'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    ClipboardCheck,
    Calendar,
    Camera,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    Send,
    History,
    Users,
    Trash2,
    ChevronRight,
    Sparkles,
    Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DailyProgressService, DailyInstallReport } from '@/services/DailyProgressService';

export default function DailyProgressPage() {
    const { id: projectId } = useParams();
    const { toast } = useToast();
    const [reports, setReports] = useState<DailyInstallReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [workDone, setWorkDone] = useState('');
    const [plannedForTomorrow, setPlannedForTomorrow] = useState('');
    const [issuesEncountered, setIssuesEncountered] = useState('');
    const [overallProgress, setOverallProgress] = useState(0);
    const [manpowerCount, setManpowerCount] = useState(0);
    const [isSiteCleaned, setIsSiteCleaned] = useState(false);
    const [progressPhotos, setProgressPhotos] = useState<string[]>([]);
    const [cleaningPhotos, setCleaningPhotos] = useState<string[]>([]);

    useEffect(() => {
        loadReports();
    }, [projectId]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const data = await DailyProgressService.getReports(projectId as string);
            setReports(data);
        } catch (error) {
            console.error('Failed to load reports:', error);
            toast({
                title: 'Error',
                description: 'Failed to load progress reports',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'progress' | 'cleaning') => {
        // NEEDS-BACKEND: no file-upload/storage endpoint exists yet. We reference the
        // real selected file via an object URL until an upload service is available.
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            if (type === 'progress') {
                setProgressPhotos([...progressPhotos, objectUrl]);
            } else {
                setCleaningPhotos([...cleaningPhotos, objectUrl]);
            }
        }
    };

    const handleSubmitReport = async () => {
        if (!workDone) {
            toast({
                title: 'Missing Information',
                description: 'Please describe the work completed today.',
                variant: 'destructive',
            });
            return;
        }

        setSubmitting(true);
        try {
            await DailyProgressService.createReport({
                projectId: projectId as string,
                reportDate: new Date(reportDate).toISOString(),
                workDone,
                plannedForTomorrow,
                issuesEncountered,
                overallProgress,
                manpowerCount,
                isSiteCleaned,
                progressPhotos,
                cleaningPhotos,
                isClientNotified: true, // Trigger automation
            });

            toast({
                title: 'Success',
                description: 'Daily report submitted and client digest triggered.',
            });

            // Reset form
            setWorkDone('');
            setPlannedForTomorrow('');
            setIssuesEncountered('');
            setProgressPhotos([]);
            setCleaningPhotos([]);
            setIsSiteCleaned(false);

            loadReports();
        } catch (error) {
            console.error('Failed to submit report:', error);
            toast({
                title: 'Submission Failed',
                description: 'There was an error saving the daily report.',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Daily Progress & Cleaning</h2>
                    <p className="text-muted-foreground">
                        Track installation milestones and site hygiene. Automated digests are sent to the client daily.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="h-8">
                        <Calendar className="mr-2 h-4 w-4" />
                        {new Date().toLocaleDateString()}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Submission Form */}
                <Card className="col-span-4 border-2 border-blue-100 shadow-md">
                    <CardHeader className="bg-blue-50/50 rounded-t-lg">
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-blue-600" />
                            Submit Daily Report
                        </CardTitle>
                        <CardDescription>
                            Complete this report at the end of each shift.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Report Date</label>
                                <input
                                    type="date"
                                    className="w-full rounded-md border border-input px-3 py-2 text-sm"
                                    value={reportDate}
                                    onChange={(e) => setReportDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Manpower Count</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-full rounded-md border border-input pl-10 pr-3 py-2 text-sm"
                                        value={manpowerCount}
                                        onChange={(e) => setManpowerCount(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Work Completed Today</label>
                            <textarea
                                placeholder="Describe the main tasks finished today..."
                                className="w-full rounded-md border border-input px-3 py-2 text-sm min-h-[100px]"
                                value={workDone}
                                onChange={(e) => setWorkDone(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Planned for Tomorrow</label>
                            <textarea
                                placeholder="What is the focus for the next shift?"
                                className="w-full rounded-md border border-input px-3 py-2 text-sm"
                                value={plannedForTomorrow}
                                onChange={(e) => setPlannedForTomorrow(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg border border-green-200">
                            <input
                                type="checkbox"
                                id="cleaning"
                                className="h-5 w-5 rounded border-green-300 text-green-600"
                                checked={isSiteCleaned}
                                onChange={(e) => setIsSiteCleaned(e.target.checked)}
                            />
                            <label htmlFor="cleaning" className="flex items-center gap-2 text-sm font-semibold text-green-800">
                                <Sparkles className="h-4 w-4" />
                                Daily Site Cleaning Completed
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Progress Photos</label>
                                <div className="flex flex-wrap gap-2">
                                    {progressPhotos.map((p, i) => (
                                        <div key={i} className="relative h-16 w-16 bg-gray-100 rounded border overflow-hidden">
                                            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">Photo</div>
                                            <button onClick={() => setProgressPhotos(progressPhotos.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 hover:bg-white text-destructive">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="h-16 w-16 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 border-gray-300">
                                        <Camera className="h-4 w-4 text-gray-400" />
                                        <span className="text-[10px] text-gray-400">Add</span>
                                        <input type="file" className="hidden" onChange={(e) => handlePhotoUpload(e, 'progress')} />
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cleaning Proof</label>
                                <div className="flex flex-wrap gap-2">
                                    {cleaningPhotos.map((p, i) => (
                                        <div key={i} className="relative h-16 w-16 bg-gray-100 rounded border overflow-hidden text-green-600 border-green-200">
                                            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-green-400">Proof</div>
                                            <button onClick={() => setCleaningPhotos(cleaningPhotos.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 hover:bg-white text-destructive">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="h-16 w-16 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-green-50 border-green-300">
                                        <Camera className="h-4 w-4 text-green-400" />
                                        <span className="text-[10px] text-green-400">Add</span>
                                        <input type="file" className="hidden" onChange={(e) => handlePhotoUpload(e, 'cleaning')} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-lg font-bold"
                            disabled={submitting}
                            onClick={handleSubmitReport}
                        >
                            {submitting ? (
                                <>
                                    <Clock className="mr-2 h-5 w-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-5 w-5" />
                                    Submit & Notify Client
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* History Sidebar */}
                <Card className="col-span-3 bg-gray-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-muted-foreground" />
                            Recent Digest History
                        </CardTitle>
                        <CardDescription>
                            Last 10 daily summaries sent to client.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                    Loading history...
                                </div>
                            ) : reports.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No reports submitted yet.
                                </div>
                            ) : reports.map((report) => (
                                <div key={report.id} className="p-4 hover:bg-white transition-colors group cursor-pointer">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-blue-900">
                                                    {new Date(report.reportDate).toLocaleDateString(undefined, {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                {report.isSiteCleaned && (
                                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                                        <Sparkles className="h-3 w-3 mr-1" />
                                                        Clean
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm line-clamp-2 text-gray-600">
                                                {report.workDone}
                                            </p>
                                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1">
                                                <span className="flex items-center gap-1">
                                                    <Camera className="h-3 w-3" />
                                                    {report.progressPhotos.length + report.cleaningPhotos.length} Photos
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {report.manpowerCount} Workers
                                                </span>
                                                {report.isClientNotified && (
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Sent
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
