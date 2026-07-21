import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingAssessment } from '../entities/training-assessment.entity';
import { TrainingAssessmentAttempt } from '../entities/training-assessment-attempt.entity';

@Injectable()
export class TrainingAssessmentService {
  constructor(
    @InjectRepository(TrainingAssessment)
    private readonly repo: Repository<TrainingAssessment>,
    @InjectRepository(TrainingAssessmentAttempt)
    private readonly attemptRepo: Repository<TrainingAssessmentAttempt>,
  ) {}

  // ===== Assessments =====

  async findAll(
    companyId: string,
    filters?: { programId?: string; scheduleId?: string; assessmentType?: string },
  ): Promise<TrainingAssessment[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.programId) where.programId = filters.programId;
    if (filters?.scheduleId) where.scheduleId = filters.scheduleId;
    if (filters?.assessmentType) where.assessmentType = filters.assessmentType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<TrainingAssessment> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Training assessment ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<TrainingAssessment> & { companyId: string },
  ): Promise<TrainingAssessment> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<TrainingAssessment>,
  ): Promise<TrainingAssessment> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }

  // ===== Attempts =====

  /** Start a new attempt for an assessment (FE startAssessmentAttempt). */
  async startAttempt(
    assessmentId: string,
    data: { companyId: string; enrollmentId?: string; employeeId?: string; employeeName?: string },
  ): Promise<TrainingAssessmentAttempt> {
    const assessment = await this.findOne(assessmentId);
    const priorCount = await this.attemptRepo.count({
      where: { assessmentId, employeeId: data.employeeId },
    });
    const attempt = this.attemptRepo.create({
      companyId: data.companyId,
      assessmentId,
      enrollmentId: data.enrollmentId,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      attemptNumber: priorCount + 1,
      startTime: new Date(),
      status: 'in_progress',
      totalMarks: assessment.totalMarks ?? 0,
      obtainedMarks: 0,
      percentage: 0,
      isPassed: false,
    });
    return this.attemptRepo.save(attempt);
  }

  async findAttempt(id: string): Promise<TrainingAssessmentAttempt> {
    const entity = await this.attemptRepo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Assessment attempt ${id} not found`);
    return entity;
  }

  /**
   * Submit an attempt's answers (FE submitAssessmentAttempt). Auto-grades any
   * answer that carries a `marksObtained`; otherwise records the answers only.
   */
  async submitAttempt(
    id: string,
    answers: Array<Record<string, unknown>>,
  ): Promise<TrainingAssessmentAttempt> {
    const attempt = await this.findAttempt(id);
    const assessment = attempt.assessmentId
      ? await this.repo.findOne({ where: { id: attempt.assessmentId } })
      : null;
    const totalMarks = assessment?.totalMarks ?? attempt.totalMarks ?? 0;
    const obtained = (Array.isArray(answers) ? answers : []).reduce(
      (sum, a) => sum + (Number(a?.marksObtained) || 0),
      0,
    );
    attempt.answers = answers;
    attempt.endTime = new Date();
    attempt.status = 'completed';
    attempt.totalMarks = totalMarks;
    attempt.obtainedMarks = obtained;
    attempt.percentage = totalMarks > 0 ? (obtained / totalMarks) * 100 : 0;
    attempt.isPassed = obtained >= (assessment?.passingMarks ?? 0);
    return this.attemptRepo.save(attempt);
  }
}
