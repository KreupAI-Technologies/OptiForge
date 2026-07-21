import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseProgress } from '../entities/course-progress.entity';

@Injectable()
export class CourseProgressService {
  constructor(
    @InjectRepository(CourseProgress)
    private readonly repo: Repository<CourseProgress>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { courseId?: string; employeeId?: string; status?: string },
  ): Promise<CourseProgress[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.courseId) where.courseId = filters.courseId;
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CourseProgress> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Course progress ${id} not found`);
    return entity;
  }

  /** Enroll an employee into a course, creating a progress record. */
  async enroll(
    courseId: string,
    data: { companyId: string; employeeId?: string; employeeName?: string },
  ): Promise<CourseProgress> {
    const progress = this.repo.create({
      companyId: data.companyId,
      courseId,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      progressPct: 0,
      completedLessons: 0,
      status: 'not_started',
      enrollmentDate: new Date().toISOString().split('T')[0],
    });
    return this.repo.save(progress);
  }

  /**
   * Update lesson progress on a progress record. Merges the lesson entry into
   * lessonProgress, recomputes completedLessons + overall percentage.
   */
  async updateLessonProgress(
    id: string,
    lessonId: string,
    data: { isCompleted: boolean; progressPercentage: number; timeSpentMinutes: number },
  ): Promise<CourseProgress> {
    const entity = await this.findOne(id);
    const lessons = Array.isArray(entity.lessonProgress)
      ? entity.lessonProgress
      : [];
    const idx = lessons.findIndex((l) => l?.lessonId === lessonId);
    const lessonEntry = {
      lessonId,
      isCompleted: data.isCompleted,
      progressPercentage: data.progressPercentage,
      timeSpentMinutes: data.timeSpentMinutes,
      lastAccessedAt: new Date().toISOString(),
    };
    if (idx >= 0) lessons[idx] = lessonEntry;
    else lessons.push(lessonEntry);
    entity.lessonProgress = lessons;
    entity.completedLessons = lessons.filter((l) => l?.isCompleted).length;
    entity.timeSpentMinutes = lessons.reduce(
      (sum, l) => sum + (Number(l?.timeSpentMinutes) || 0),
      0,
    );
    if (entity.totalLessons > 0) {
      entity.progressPct =
        (entity.completedLessons / entity.totalLessons) * 100;
    }
    if (entity.progressPct >= 100) entity.status = 'completed';
    else if (entity.completedLessons > 0) entity.status = 'in_progress';
    return this.repo.save(entity);
  }
}
