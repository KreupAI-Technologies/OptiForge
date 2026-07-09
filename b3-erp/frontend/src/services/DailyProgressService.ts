import axiosInstance from '@/lib/api-client';

export interface DailyInstallReport {
    id: string;
    projectId: string;
    reportDate: string;
    overallProgress: number;
    workDone: string;
    plannedForTomorrow: string;
    issuesEncountered: string;
    isSiteCleaned: boolean;
    cleaningPhotos: string[];
    progressPhotos: string[];
    manpowerCount: number;
    isClientNotified: boolean;
    clientFeedback?: string;
    createdAt: string;
    updatedAt: string;
}

export class DailyProgressService {
    static async createReport(data: Partial<DailyInstallReport>): Promise<DailyInstallReport> {
        const response = await axiosInstance.post('/api/logistics-installation/daily-report', data);
        return response.data;
    }

    static async getReports(projectId: string): Promise<DailyInstallReport[]> {
        const response = await axiosInstance.get(`/api/logistics-installation/daily-reports/${projectId}`);
        return response.data;
    }

    static async notifyClient(reportId: string): Promise<void> {
        await axiosInstance.post(`/api/logistics-installation/notify-client/${reportId}`);
    }
}
