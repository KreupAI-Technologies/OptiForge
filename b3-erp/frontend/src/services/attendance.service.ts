/**
 * Attendance Service
 * Handles all attendance-related API operations for the HR module
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_DATA = false;

// ============================================================================
// Interfaces
// ============================================================================

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  LATE = 'LATE',
  ON_LEAVE = 'ON_LEAVE',
  WORK_FROM_HOME = 'WORK_FROM_HOME',
  HOLIDAY = 'HOLIDAY',
  WEEKEND = 'WEEKEND',
}

export enum CheckInMethod {
  BIOMETRIC = 'BIOMETRIC',
  CARD_SWIPE = 'CARD_SWIPE',
  MANUAL = 'MANUAL',
  MOBILE_APP = 'MOBILE_APP',
  FACIAL_RECOGNITION = 'FACIAL_RECOGNITION',
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  departmentId?: string;
  departmentName?: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  totalHours?: number;
  overtimeHours?: number;
  status: AttendanceStatus;
  checkInMethod?: CheckInMethod;
  checkOutMethod?: CheckInMethod;
  location?: string;
  remarks?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarkAttendanceDto {
  employeeId: string;
  date: Date | string;
  checkInTime?: Date | string;
  checkOutTime?: Date | string;
  status: AttendanceStatus;
  checkInMethod?: CheckInMethod;
  checkOutMethod?: CheckInMethod;
  location?: string;
  remarks?: string;
}

export interface UpdateAttendanceDto extends Partial<MarkAttendanceDto> { }

export interface AttendanceFilters {
  employeeId?: string;
  departmentId?: string;
  status?: AttendanceStatus;
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
}

export interface AttendanceSummary {
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  lateDays: number;
  leaveDays: number;
  workFromHomeDays: number;
  totalWorkingDays: number;
  totalHoursWorked: number;
  totalOvertimeHours: number;
}

// ============================================================================
// Mock Data - Attendance Records
// ============================================================================

// Generate attendance records for the last 30 days for all employees
const generateMockAttendance = (): Attendance[] => {
  const employees = [
    { id: 'emp-001', name: 'Rajesh Kumar', code: 'EMP001', deptId: 'dept-001', deptName: 'Production' },
    { id: 'emp-002', name: 'Priya Sharma', code: 'EMP002', deptId: 'dept-002', deptName: 'Human Resources' },
    { id: 'emp-003', name: 'Amit Patel', code: 'EMP003', deptId: 'dept-003', deptName: 'Quality Control' },
    { id: 'emp-004', name: 'Sneha Reddy', code: 'EMP004', deptId: 'dept-004', deptName: 'Finance' },
    { id: 'emp-005', name: 'Mohammed Khan', code: 'EMP005', deptId: 'dept-001', deptName: 'Production' },
    { id: 'emp-006', name: 'Vikram Singh', code: 'EMP006', deptId: 'dept-004', deptName: 'Finance' },
    { id: 'emp-007', name: 'Anita Desai', code: 'EMP007', deptId: 'dept-005', deptName: 'Sales' },
    { id: 'emp-008', name: 'Deepak Verma', code: 'EMP008', deptId: 'dept-006', deptName: 'IT' },
    { id: 'emp-009', name: 'Sanjay Gupta', code: 'EMP009', deptId: 'dept-005', deptName: 'Sales' },
    { id: 'emp-010', name: 'Kavita Nair', code: 'EMP010', deptId: 'dept-006', deptName: 'IT' },
  ];

  const attendance: Attendance[] = [];
  const today = new Date();

  // Generate last 30 days of attendance
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    for (const emp of employees) {
      const recordId = `att-${emp.id}-${date.toISOString().split('T')[0]}`;

      if (isWeekend) {
        attendance.push({
          id: recordId,
          employeeId: emp.id,
          employeeName: emp.name,
          employeeCode: emp.code,
          departmentId: emp.deptId,
          departmentName: emp.deptName,
          date: new Date(date),
          status: AttendanceStatus.WEEKEND,
          createdAt: new Date(date),
          updatedAt: new Date(date),
        });
        continue;
      }

      // Generate random attendance for weekdays
      const rand = Math.random();
      let status: AttendanceStatus;
      let checkIn: Date | undefined;
      let checkOut: Date | undefined;
      let totalHours = 0;
      let overtimeHours = 0;

      if (rand < 0.75) {
        // 75% present
        status = AttendanceStatus.PRESENT;
        checkIn = new Date(date);
        checkIn.setHours(9, Math.floor(Math.random() * 15), 0, 0);
        checkOut = new Date(date);
        checkOut.setHours(18, Math.floor(Math.random() * 30), 0, 0);
        totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        overtimeHours = Math.max(0, totalHours - 8);
      } else if (rand < 0.85) {
        // 10% late
        status = AttendanceStatus.LATE;
        checkIn = new Date(date);
        checkIn.setHours(9, 30 + Math.floor(Math.random() * 60), 0, 0);
        checkOut = new Date(date);
        checkOut.setHours(18, Math.floor(Math.random() * 45), 0, 0);
        totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      } else if (rand < 0.92) {
        // 7% half day
        status = AttendanceStatus.HALF_DAY;
        checkIn = new Date(date);
        checkIn.setHours(9, Math.floor(Math.random() * 10), 0, 0);
        checkOut = new Date(date);
        checkOut.setHours(13, Math.floor(Math.random() * 30), 0, 0);
        totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      } else if (rand < 0.96) {
        // 4% work from home
        status = AttendanceStatus.WORK_FROM_HOME;
        checkIn = new Date(date);
        checkIn.setHours(9, 0, 0, 0);
        checkOut = new Date(date);
        checkOut.setHours(18, 0, 0, 0);
        totalHours = 9;
      } else if (rand < 0.98) {
        // 2% on leave
        status = AttendanceStatus.ON_LEAVE;
      } else {
        // 2% absent
        status = AttendanceStatus.ABSENT;
      }

      attendance.push({
        id: recordId,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeCode: emp.code,
        departmentId: emp.deptId,
        departmentName: emp.deptName,
        date: new Date(date),
        checkInTime: checkIn,
        checkOutTime: checkOut,
        totalHours: Math.round(totalHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        status,
        checkInMethod: checkIn ? CheckInMethod.BIOMETRIC : undefined,
        checkOutMethod: checkOut ? CheckInMethod.BIOMETRIC : undefined,
        location: 'Main Office',
        createdAt: new Date(date),
        updatedAt: new Date(date),
      });
    }
  }

  return attendance;
};

export const MOCK_ATTENDANCE: Attendance[] = generateMockAttendance();

// ============================================================================
// Attendance Service Class
// ============================================================================

export class AttendanceService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get attendance records with filters
   */
  static async getAttendance(filters?: AttendanceFilters): Promise<Attendance[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filteredAttendance = [...MOCK_ATTENDANCE];

      if (filters?.employeeId) {
        filteredAttendance = filteredAttendance.filter(
          (a) => a.employeeId === filters.employeeId
        );
      }
      if (filters?.departmentId) {
        filteredAttendance = filteredAttendance.filter(
          (a) => a.departmentId === filters.departmentId
        );
      }
      if (filters?.status) {
        filteredAttendance = filteredAttendance.filter(
          (a) => a.status === filters.status
        );
      }
      if (filters?.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        filteredAttendance = filteredAttendance.filter(
          (a) => new Date(a.date) >= start
        );
      }
      if (filters?.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        filteredAttendance = filteredAttendance.filter(
          (a) => new Date(a.date) <= end
        );
      }

      // Sort by date descending
      filteredAttendance.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Pagination
      if (filters?.page && filters?.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        filteredAttendance = filteredAttendance.slice(start, end);
      }

      return filteredAttendance;
    }

    const queryParams = new URLSearchParams();
    if (filters?.employeeId) queryParams.set('employeeId', filters.employeeId);
    if (filters?.departmentId) queryParams.set('departmentId', filters.departmentId);
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.startDate) queryParams.set('startDate', new Date(filters.startDate).toISOString());
    if (filters?.endDate) queryParams.set('endDate', new Date(filters.endDate).toISOString());
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    return this.request<Attendance[]>(`/hr/attendance?${queryParams.toString()}`);
  }

  /**
   * Get attendance record by ID
   */
  static async getAttendanceById(id: string): Promise<Attendance> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const attendance = MOCK_ATTENDANCE.find((a) => a.id === id);
      if (!attendance) throw new Error('Attendance record not found');
      return attendance;
    }
    return this.request<Attendance>(`/hr/attendance/${id}`);
  }

  /**
   * Mark attendance for an employee
   */
  static async markAttendance(data: MarkAttendanceDto): Promise<Attendance> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const date = new Date(data.date);
      date.setHours(0, 0, 0, 0);

      // Check if attendance already exists for this date and employee
      const existingIndex = MOCK_ATTENDANCE.findIndex(
        (a) =>
          a.employeeId === data.employeeId &&
          new Date(a.date).toDateString() === date.toDateString()
      );

      let checkIn: Date | undefined;
      let checkOut: Date | undefined;
      let totalHours = 0;
      let overtimeHours = 0;

      if (data.checkInTime) {
        checkIn = new Date(data.checkInTime);
      }
      if (data.checkOutTime) {
        checkOut = new Date(data.checkOutTime);
      }
      if (checkIn && checkOut) {
        totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        overtimeHours = Math.max(0, totalHours - 8);
      }

      const newAttendance: Attendance = {
        id: existingIndex >= 0 ? MOCK_ATTENDANCE[existingIndex].id : `att-${Date.now()}`,
        employeeId: data.employeeId,
        date,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        totalHours: Math.round(totalHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        status: data.status,
        checkInMethod: data.checkInMethod,
        checkOutMethod: data.checkOutMethod,
        location: data.location,
        remarks: data.remarks,
        createdAt: existingIndex >= 0 ? MOCK_ATTENDANCE[existingIndex].createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (existingIndex >= 0) {
        MOCK_ATTENDANCE[existingIndex] = newAttendance;
      } else {
        MOCK_ATTENDANCE.push(newAttendance);
      }

      return newAttendance;
    }
    return this.request<Attendance>('/hr/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update attendance record
   */
  static async updateAttendance(id: string, data: UpdateAttendanceDto): Promise<Attendance> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = MOCK_ATTENDANCE.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Attendance record not found');

      const existing = MOCK_ATTENDANCE[index];
      let checkIn = data.checkInTime ? new Date(data.checkInTime) : existing.checkInTime;
      let checkOut = data.checkOutTime ? new Date(data.checkOutTime) : existing.checkOutTime;
      let totalHours = existing.totalHours || 0;
      let overtimeHours = existing.overtimeHours || 0;

      if (checkIn && checkOut) {
        totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        overtimeHours = Math.max(0, totalHours - 8);
      }

      MOCK_ATTENDANCE[index] = {
        ...existing,
        ...data,
        date: data.date ? new Date(data.date) : existing.date,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        totalHours: Math.round(totalHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        updatedAt: new Date(),
      };

      return MOCK_ATTENDANCE[index];
    }
    return this.request<Attendance>(`/hr/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get attendance summary for an employee
   */
  static async getAttendanceSummary(
    employeeId: string,
    month: number,
    year: number
  ): Promise<AttendanceSummary> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const employeeAttendance = MOCK_ATTENDANCE.filter((a) => {
        const date = new Date(a.date);
        return (
          a.employeeId === employeeId &&
          date >= startDate &&
          date <= endDate
        );
      });

      const summary: AttendanceSummary = {
        employeeId,
        employeeName: employeeAttendance[0]?.employeeName || 'Unknown',
        month,
        year,
        presentDays: employeeAttendance.filter((a) => a.status === AttendanceStatus.PRESENT).length,
        absentDays: employeeAttendance.filter((a) => a.status === AttendanceStatus.ABSENT).length,
        halfDays: employeeAttendance.filter((a) => a.status === AttendanceStatus.HALF_DAY).length,
        lateDays: employeeAttendance.filter((a) => a.status === AttendanceStatus.LATE).length,
        leaveDays: employeeAttendance.filter((a) => a.status === AttendanceStatus.ON_LEAVE).length,
        workFromHomeDays: employeeAttendance.filter((a) => a.status === AttendanceStatus.WORK_FROM_HOME).length,
        totalWorkingDays: employeeAttendance.filter(
          (a) => a.status !== AttendanceStatus.WEEKEND && a.status !== AttendanceStatus.HOLIDAY
        ).length,
        totalHoursWorked: employeeAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
        totalOvertimeHours: employeeAttendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0),
      };

      return summary;
    }

    return this.request<AttendanceSummary>(
      `/hr/attendance/summary/${employeeId}?month=${month}&year=${year}`
    );
  }

  /**
   * Get today's attendance statistics
   */
  static async getTodayStatistics(): Promise<{
    totalEmployees: number;
    present: number;
    absent: number;
    late: number;
    onLeave: number;
    workFromHome: number;
  }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayAttendance = MOCK_ATTENDANCE.filter(
        (a) => new Date(a.date).toDateString() === today.toDateString()
      );

      return {
        totalEmployees: 10,
        present: todayAttendance.filter((a) => a.status === AttendanceStatus.PRESENT).length,
        absent: todayAttendance.filter((a) => a.status === AttendanceStatus.ABSENT).length,
        late: todayAttendance.filter((a) => a.status === AttendanceStatus.LATE).length,
        onLeave: todayAttendance.filter((a) => a.status === AttendanceStatus.ON_LEAVE).length,
        workFromHome: todayAttendance.filter((a) => a.status === AttendanceStatus.WORK_FROM_HOME).length,
      };
    }

    return this.request<{
      totalEmployees: number;
      present: number;
      absent: number;
      late: number;
      onLeave: number;
      workFromHome: number;
    }>('/hr/attendance/today/statistics');
  }

  /**
   * Bulk mark attendance for multiple employees
   */
  static async bulkMarkAttendance(
    records: MarkAttendanceDto[]
  ): Promise<Attendance[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const results: Attendance[] = [];
      for (const record of records) {
        const result = await this.markAttendance(record);
        results.push(result);
      }
      return results;
    }
    return this.request<Attendance[]>('/hr/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
  }

  /**
   * Attendance policies / working-hour schedules (hr/attendance-policies).
   */
  static async getAttendancePolicies(filters?: Record<string, string>): Promise<any[]> {
    const qs = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    const data = await this.request<any>(`/hr/attendance-policies${qs}`);
    return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
  }

  static async createAttendancePolicy(data: Record<string, any>): Promise<any> {
    return this.request<any>('/hr/attendance-policies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateAttendancePolicy(id: string, data: Record<string, any>): Promise<any> {
    return this.request<any>(`/hr/attendance-policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteAttendancePolicy(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/hr/attendance-policies/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Sync biometric logs from a device
   */
  static async syncBiometricLogs(deviceId: string, logs: any[]): Promise<any> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { success: true, syncedCount: logs.length };
    }
    return this.request<any>(`/hr/attendance/sync/${deviceId}`, {
      method: 'POST',
      body: JSON.stringify({ logs }),
    });
  }
}

// Export singleton instance
export const attendanceService = AttendanceService;
