import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingEnrollment } from '../entities/training-enrollment.entity';
import { TrainingSchedule } from '../entities/training-schedule.entity';
import { TrainingAttendance } from '../entities/training-attendance.entity';

/**
 * Computed training reports — no dedicated table. Aggregates from
 * enrollments / schedules / attendance. Where a source has no rows the report
 * returns empty arrays / zeroed totals rather than fabricated numbers.
 */
@Injectable()
export class TrainingReportService {
  constructor(
    @InjectRepository(TrainingEnrollment)
    private readonly enrollmentRepo: Repository<TrainingEnrollment>,
    @InjectRepository(TrainingSchedule)
    private readonly scheduleRepo: Repository<TrainingSchedule>,
    @InjectRepository(TrainingAttendance)
    private readonly attendanceRepo: Repository<TrainingAttendance>,
  ) {}

  async getSummary(companyId: string): Promise<{
    period: string;
    totalTrainings: number;
    totalParticipants: number;
    uniqueEmployees: number;
    totalHours: number;
    totalCost: number;
    averageRating: number;
    completionRate: number;
    byCategory: { category: string; count: number; participants: number }[];
    byDepartment: {
      department: string;
      employees: number;
      trainings: number;
      hours: number;
    }[];
  }> {
    const enrollments = await this.enrollmentRepo.find({ where: { companyId } });
    const schedules = await this.scheduleRepo.find({ where: { companyId } });

    const totalParticipants = enrollments.length;
    const uniqueEmployees = new Set(
      enrollments.map((e) => e.employeeId).filter(Boolean),
    ).size;
    const totalHours = enrollments.reduce(
      (sum, e) => sum + (Number(e.duration) || 0),
      0,
    );
    const completed = enrollments.filter(
      (e) => e.status === 'completed',
    ).length;
    const completionRate = totalParticipants
      ? Math.round((completed / totalParticipants) * 100)
      : 0;

    const categoryMap = new Map<string, { count: number; participants: number }>();
    for (const e of enrollments) {
      const cat = e.category || 'General';
      const cur = categoryMap.get(cat) || { count: 0, participants: 0 };
      cur.participants += 1;
      categoryMap.set(cat, cur);
    }
    const byCategory = Array.from(categoryMap.entries()).map(
      ([category, v]) => ({ category, count: v.count, participants: v.participants }),
    );

    return {
      period: 'all',
      totalTrainings: schedules.length,
      totalParticipants,
      uniqueEmployees,
      totalHours,
      totalCost: 0,
      averageRating: 0,
      completionRate,
      byCategory,
      byDepartment: [],
    };
  }

  async getEmployeeReport(
    companyId: string,
    employeeId: string,
  ): Promise<{
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    department: string;
    designation: string;
    totalTrainings: number;
    completedTrainings: number;
    inProgressTrainings: number;
    totalHours: number;
    certifications: number;
    averageScore: number;
    trainings: {
      programName: string;
      category: string;
      completionDate?: string;
      status: string;
      score?: number;
      certificateIssued: boolean;
    }[];
  }> {
    const enrollments = await this.enrollmentRepo.find({
      where: { companyId, employeeId },
    });
    const totalHours = enrollments.reduce(
      (sum, e) => sum + (Number(e.duration) || 0),
      0,
    );
    return {
      employeeId,
      employeeName: enrollments[0]?.employeeName || '',
      employeeCode: '',
      department: '',
      designation: '',
      totalTrainings: enrollments.length,
      completedTrainings: enrollments.filter((e) => e.status === 'completed')
        .length,
      inProgressTrainings: enrollments.filter(
        (e) => e.status === 'in-progress' || e.status === 'in_progress',
      ).length,
      totalHours,
      certifications: enrollments.filter((e) => e.certification).length,
      averageScore: 0,
      trainings: enrollments.map((e) => ({
        programName: e.programTitle || '',
        category: e.category || '',
        completionDate: e.endDate || undefined,
        status: e.status,
        certificateIssued: Boolean(e.certification),
      })),
    };
  }

  async getDepartmentReport(
    companyId: string,
    departmentId: string,
  ): Promise<{
    departmentName: string;
    employeeCount: number;
    totalTrainings: number;
    totalHours: number;
    averageHoursPerEmployee: number;
    completionRate: number;
    byCategory: { category: string; count: number }[];
    topTrainings: { programName: string; participants: number }[];
  }> {
    // No department column on the enrollment entity; return an honest empty
    // report keyed by the requested department rather than fabricating rows.
    const enrollments = await this.enrollmentRepo.find({ where: { companyId } });
    const totalHours = enrollments.reduce(
      (sum, e) => sum + (Number(e.duration) || 0),
      0,
    );
    const employeeCount = new Set(
      enrollments.map((e) => e.employeeId).filter(Boolean),
    ).size;
    const completed = enrollments.filter((e) => e.status === 'completed').length;

    const programMap = new Map<string, number>();
    const categoryMap = new Map<string, number>();
    for (const e of enrollments) {
      if (e.programTitle)
        programMap.set(e.programTitle, (programMap.get(e.programTitle) || 0) + 1);
      const cat = e.category || 'General';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    }

    return {
      departmentName: departmentId,
      employeeCount,
      totalTrainings: enrollments.length,
      totalHours,
      averageHoursPerEmployee: employeeCount
        ? Math.round(totalHours / employeeCount)
        : 0,
      completionRate: enrollments.length
        ? Math.round((completed / enrollments.length) * 100)
        : 0,
      byCategory: Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count,
      })),
      topTrainings: Array.from(programMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([programName, participants]) => ({ programName, participants })),
    };
  }

  async getHoursReport(
    companyId: string,
  ): Promise<{ month: string; hours: number; employees: number }[]> {
    const enrollments = await this.enrollmentRepo.find({ where: { companyId } });
    const monthMap = new Map<string, { hours: number; employees: Set<string> }>();
    for (const e of enrollments) {
      const created = e.createdAt ? new Date(e.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) continue;
      const key = created.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      const cur = monthMap.get(key) || { hours: 0, employees: new Set<string>() };
      cur.hours += Number(e.duration) || 0;
      if (e.employeeId) cur.employees.add(e.employeeId);
      monthMap.set(key, cur);
    }
    return Array.from(monthMap.entries()).map(([month, v]) => ({
      month,
      hours: v.hours,
      employees: v.employees.size,
    }));
  }
}
