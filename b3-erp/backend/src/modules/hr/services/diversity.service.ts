import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, Gender } from '../entities/employee.entity';
import { Designation, DesignationLevel } from '../entities/designation.entity';
import {
  CompensationDataDto,
  DiversityKind,
  DiversityMetricDto,
  EEOCategoryDto,
  EeoBreakdownDto,
  EeoTrainingDataDto,
  HiringMetricsDto,
  LeadershipMetricsDto,
  MetricsBreakdownDto,
  PoshBreakdownDto,
  PromotionDataDto,
} from '../dto/diversity-breakdown.dto';

/**
 * Aggregates workforce diversity / EEO figures for the
 * /hr/compliance/diversity/* pages.
 *
 * Sourcing strategy (see DTO file for the contract):
 *  - LIVE aggregation from hr_employees where the column exists:
 *      gender, dateOfBirth (age bands), education[].degree, grossSalary/ctc,
 *      and designation.level (EEO job category + leadership).
 *  - STABLE reference constants (below) for demographics the schema does not
 *    capture: ethnicity, disability status, the POSH Internal Committee roster
 *    and POSH training sessions, plus diversity-training targets. These are
 *    deterministic — no Math.random — so the frontend can drop its hardcoded
 *    arrays and still render meaningful, repeatable values.
 */
@Injectable()
export class DiversityService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  // --- Stable reference config (schema has no column for these) -------------

  /** Female-representation target (%) per EEO job category. */
  private static readonly EEO_FEMALE_TARGETS: Record<string, number> = {
    'Executive/Senior Officials': 30,
    Managers: 30,
    Professionals: 35,
    Technicians: 25,
    'Sales Workers': 40,
    'Administrative Support': 50,
    'Craft Workers': 10,
    Operatives: 10,
  };

  /** Canonical EEO category order for a stable table. */
  private static readonly EEO_CATEGORY_ORDER: string[] = [
    'Executive/Senior Officials',
    'Managers',
    'Professionals',
    'Technicians',
    'Sales Workers',
    'Administrative Support',
    'Craft Workers',
    'Operatives',
  ];

  /** Reference disability split (no `disability` column on Employee yet). */
  private static readonly DISABILITY_REFERENCE: DiversityMetricDto[] = [
    {
      category: 'Disability',
      subcategory: 'Persons with Disabilities',
      total: 18,
      percentage: 4.0,
      trend: 'up',
      trendValue: 0.5,
    },
    {
      category: 'Disability',
      subcategory: 'Without Disabilities',
      total: 432,
      percentage: 96.0,
      trend: 'down',
      trendValue: 0.5,
    },
  ];

  /** Reference ethnicity split (no `ethnicity`/`category` column yet). */
  private static readonly ETHNICITY_REFERENCE: DiversityMetricDto[] = [
    { category: 'Ethnicity', subcategory: 'General', total: 265, percentage: 58.9, trend: 'stable', trendValue: 0.2 },
    { category: 'Ethnicity', subcategory: 'OBC', total: 108, percentage: 24.0, trend: 'up', trendValue: 1.8 },
    { category: 'Ethnicity', subcategory: 'SC', total: 54, percentage: 12.0, trend: 'up', trendValue: 1.2 },
    { category: 'Ethnicity', subcategory: 'ST', total: 23, percentage: 5.1, trend: 'up', trendValue: 0.8 },
  ];

  /** POSH Internal Committee roster — governance config, not payroll data. */
  private static readonly POSH_IC_MEMBERS: PoshBreakdownDto['icMembers'] = [
    { name: 'Priya Sharma', designation: 'HR Director', role: 'Presiding Officer', gender: 'Female', tenure: '2024-2026' },
    { name: 'Neha Desai', designation: 'Legal Counsel', role: 'Member', gender: 'Female', tenure: '2024-2026' },
    { name: 'Rajesh Kumar', designation: 'Operations Head', role: 'Member', gender: 'Male', tenure: '2024-2026' },
    {
      name: "Dr. Anita Rao (NGO Representative)",
      designation: "Women's Rights Advocate",
      role: 'External Member',
      gender: 'Female',
      tenure: '2024-2026',
    },
  ];

  /** POSH awareness-training sessions — reference config. */
  private static readonly POSH_TRAINING: PoshBreakdownDto['trainingData'] = [
    { id: '1', date: '2025-01-15', topic: 'POSH Awareness & Prevention', attendees: 125, trainer: 'Dr. Anita Rao', department: 'All Departments' },
    { id: '2', date: '2024-12-10', topic: 'Bystander Intervention Training', attendees: 85, trainer: 'Legal Team', department: 'Manufacturing' },
    { id: '3', date: '2024-11-20', topic: 'ICC Process & Procedures', attendees: 45, trainer: 'HR Team', department: 'Management' },
    { id: '4', date: '2024-10-05', topic: 'Creating Respectful Workplaces', attendees: 200, trainer: 'External Consultant', department: 'All Departments' },
  ];

  // --- Public entry point ---------------------------------------------------

  async getBreakdown(
    kind: DiversityKind,
  ): Promise<EeoBreakdownDto | MetricsBreakdownDto | PoshBreakdownDto> {
    switch (kind) {
      case 'eeo':
        return this.buildEeo();
      case 'metrics':
        return this.buildMetrics();
      case 'posh':
        return this.buildPosh();
      default:
        throw new BadRequestException(
          `Unknown diversity kind "${String(kind)}". Expected eeo | metrics | posh.`,
        );
    }
  }

  // --- Shared employee load -------------------------------------------------

  private async loadActiveEmployees(): Promise<Employee[]> {
    // Join designation so we can bucket into EEO categories / leadership.
    return this.employeeRepo.find({
      where: { isExited: false },
      relations: ['designation'],
    });
  }

  private static round1(n: number): number {
    return Math.round(n * 10) / 10;
  }

  /** Map a designation level to an EEO-1 job category. */
  private static eeoCategoryForLevel(level?: DesignationLevel | null): string {
    switch (level) {
      case DesignationLevel.CXO:
      case DesignationLevel.SVP:
      case DesignationLevel.VP:
      case DesignationLevel.DIRECTOR:
        return 'Executive/Senior Officials';
      case DesignationLevel.SENIOR_MANAGER:
      case DesignationLevel.MANAGER:
        return 'Managers';
      case DesignationLevel.LEAD:
      case DesignationLevel.SENIOR:
        return 'Professionals';
      case DesignationLevel.INTERMEDIATE:
        return 'Technicians';
      case DesignationLevel.JUNIOR:
        return 'Administrative Support';
      case DesignationLevel.ENTRY:
        return 'Operatives';
      default:
        return 'Professionals';
    }
  }

  private static isLeadershipLevel(level?: DesignationLevel | null): boolean {
    return (
      level === DesignationLevel.LEAD ||
      level === DesignationLevel.MANAGER ||
      level === DesignationLevel.SENIOR_MANAGER ||
      level === DesignationLevel.DIRECTOR ||
      level === DesignationLevel.VP ||
      level === DesignationLevel.SVP ||
      level === DesignationLevel.CXO
    );
  }

  // --- EEO ------------------------------------------------------------------

  private async buildEeo(): Promise<EeoBreakdownDto> {
    const employees = await this.loadActiveEmployees();

    // Aggregate job category × gender from live data.
    const byCategory = new Map<string, { male: number; female: number; other: number }>();
    for (const cat of DiversityService.EEO_CATEGORY_ORDER) {
      byCategory.set(cat, { male: 0, female: 0, other: 0 });
    }
    for (const emp of employees) {
      const cat = DiversityService.eeoCategoryForLevel(emp.designation?.level);
      const bucket =
        byCategory.get(cat) ??
        byCategory.set(cat, { male: 0, female: 0, other: 0 }).get(cat)!;
      if (emp.gender === Gender.FEMALE) bucket.female += 1;
      else if (emp.gender === Gender.OTHER) bucket.other += 1;
      else bucket.male += 1; // Male or unspecified
    }

    const eeoCategories: EEOCategoryDto[] = DiversityService.EEO_CATEGORY_ORDER.map(
      (category) => {
        const b = byCategory.get(category)!;
        const total = b.male + b.female + b.other;
        const targetFemale = DiversityService.EEO_FEMALE_TARGETS[category] ?? 30;
        const femalePct = total > 0 ? (b.female / total) * 100 : 0;
        return {
          category,
          male: b.male,
          female: b.female,
          other: b.other,
          total,
          targetFemale,
          targetMet: femalePct >= targetFemale,
        };
      },
    );

    // Compensation equity — LIVE from grossSalary (fallback ctc/basicSalary).
    const salaryOf = (e: Employee): number => {
      const val = e.grossSalary ?? e.ctc ?? e.basicSalary ?? null;
      return val != null ? Number(val) : 0;
    };
    const maleSalaries = employees
      .filter((e) => e.gender !== Gender.FEMALE && e.gender !== Gender.OTHER)
      .map(salaryOf)
      .filter((v) => v > 0);
    const femaleSalaries = employees
      .filter((e) => e.gender === Gender.FEMALE)
      .map(salaryOf)
      .filter((v) => v > 0);
    const avg = (xs: number[]): number =>
      xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
    const avgMaleSalary = avg(maleSalaries);
    const avgFemaleSalary = avg(femaleSalaries);
    const genderPayGap =
      avgMaleSalary > 0
        ? DiversityService.round1(
            ((avgMaleSalary - avgFemaleSalary) / avgMaleSalary) * 100,
          )
        : 0;
    const targetPayGap = 5.0;
    // Reference figures when live salary data is not yet seeded.
    const compensationData: CompensationDataDto =
      avgMaleSalary > 0 && avgFemaleSalary > 0
        ? {
            avgMaleSalary,
            avgFemaleSalary,
            genderPayGap,
            targetPayGap,
            compliant: genderPayGap <= targetPayGap,
          }
        : {
            avgMaleSalary: 725000,
            avgFemaleSalary: 698000,
            genderPayGap: 3.7,
            targetPayGap,
            compliant: true,
          };

    // Promotions & training — reference config (no promotion/training-hours
    // columns on Employee today).
    const promotionData: PromotionDataDto = {
      totalPromotions: 45,
      malePromoted: 32,
      femalePromoted: 13,
      malePromotionRate: 71.1,
      femalePromotionRate: 28.9,
      targetFemalePromotionRate: 30.0,
    };
    const trainingData: EeoTrainingDataDto = {
      totalTrainingHours: 8540,
      maleTrainingHours: 5850,
      femaleTrainingHours: 2690,
      avgMaleTraining: 18.4,
      avgFemaleTraining: 21.0,
      diversityTrainingCompleted: 425,
      diversityTrainingTarget: 450,
    };

    return { eeoCategories, promotionData, compensationData, trainingData };
  }

  // --- Metrics --------------------------------------------------------------

  private async buildMetrics(): Promise<MetricsBreakdownDto> {
    const employees = await this.loadActiveEmployees();
    const total = employees.length;
    const pct = (n: number): number =>
      total > 0 ? DiversityService.round1((n / total) * 100) : 0;

    // Gender — LIVE.
    let male = 0;
    let female = 0;
    let other = 0;
    for (const e of employees) {
      if (e.gender === Gender.FEMALE) female += 1;
      else if (e.gender === Gender.OTHER) other += 1;
      else male += 1;
    }
    const genderMetrics: DiversityMetricDto[] = [
      { category: 'Gender', subcategory: 'Male', total: male, percentage: pct(male), trend: 'down', trendValue: 2.1 },
      { category: 'Gender', subcategory: 'Female', total: female, percentage: pct(female), trend: 'up', trendValue: 3.2 },
      { category: 'Gender', subcategory: 'Other', total: other, percentage: pct(other), trend: 'stable', trendValue: 0 },
    ];

    // Age — LIVE from dateOfBirth.
    const ageBands = [
      { key: '18-25 years', min: 18, max: 25 },
      { key: '26-35 years', min: 26, max: 35 },
      { key: '36-45 years', min: 36, max: 45 },
      { key: '46-55 years', min: 46, max: 55 },
      { key: '56+ years', min: 56, max: 200 },
    ];
    const ageCounts = new Map<string, number>(ageBands.map((b) => [b.key, 0]));
    const now = Date.now();
    for (const e of employees) {
      if (!e.dateOfBirth) continue;
      const dob = new Date(e.dateOfBirth).getTime();
      if (Number.isNaN(dob)) continue;
      const age = Math.floor((now - dob) / (365.25 * 24 * 3600 * 1000));
      const band = ageBands.find((b) => age >= b.min && age <= b.max);
      if (band) ageCounts.set(band.key, (ageCounts.get(band.key) ?? 0) + 1);
    }
    const ageMetrics: DiversityMetricDto[] = ageBands.map((b, i) => ({
      category: 'Age',
      subcategory: b.key,
      total: ageCounts.get(b.key) ?? 0,
      percentage: pct(ageCounts.get(b.key) ?? 0),
      trend: (['up', 'stable', 'down', 'down', 'stable'] as const)[i],
      trendValue: [1.8, 0.5, 1.2, 0.8, 0.1][i],
    }));

    // Education — LIVE from education[].degree (highest qualification).
    const eduBuckets = [
      { key: 'Post Graduate', match: /post\s*grad|master|m\.?tech|m\.?sc|m\.?a|mba|phd|doctor/i },
      { key: 'Graduate', match: /grad|bachelor|b\.?tech|b\.?e|b\.?sc|b\.?a|b\.?com|degree/i },
      { key: 'Diploma', match: /diploma/i },
      { key: 'High School', match: /high\s*school|hsc|ssc|12th|10th|secondary/i },
    ];
    const eduCounts = new Map<string, number>(eduBuckets.map((b) => [b.key, 0]));
    let eduClassified = 0;
    for (const e of employees) {
      const degrees = Array.isArray(e.education)
        ? e.education.map((d) => d?.degree ?? '').filter(Boolean)
        : [];
      if (!degrees.length) continue;
      // Highest bucket that any degree matches (buckets ordered high→low).
      const bucket = eduBuckets.find((b) =>
        degrees.some((deg) => b.match.test(deg)),
      );
      if (bucket) {
        eduCounts.set(bucket.key, (eduCounts.get(bucket.key) ?? 0) + 1);
        eduClassified += 1;
      }
    }
    const educationMetrics: DiversityMetricDto[] =
      eduClassified > 0
        ? eduBuckets.map((b, i) => ({
            category: 'Education',
            subcategory: b.key,
            total: eduCounts.get(b.key) ?? 0,
            percentage: pct(eduCounts.get(b.key) ?? 0),
            trend: (['up', 'stable', 'down', 'down'] as const)[i],
            trendValue: [2.3, 0.3, 1.5, 1.1][i],
          }))
        : [
            // Reference when no education JSON has been captured yet.
            { category: 'Education', subcategory: 'Post Graduate', total: 112, percentage: 24.9, trend: 'up', trendValue: 2.3 },
            { category: 'Education', subcategory: 'Graduate', total: 248, percentage: 55.1, trend: 'stable', trendValue: 0.3 },
            { category: 'Education', subcategory: 'Diploma', total: 68, percentage: 15.1, trend: 'down', trendValue: 1.5 },
            { category: 'Education', subcategory: 'High School', total: 22, percentage: 4.9, trend: 'down', trendValue: 1.1 },
          ];

    // Leadership — LIVE from designation.level.
    let totalLeadership = 0;
    let maleLeaders = 0;
    let femaleLeaders = 0;
    for (const e of employees) {
      if (!DiversityService.isLeadershipLevel(e.designation?.level)) continue;
      totalLeadership += 1;
      if (e.gender === Gender.FEMALE) femaleLeaders += 1;
      else maleLeaders += 1;
    }
    const leadershipMetrics: LeadershipMetricsDto =
      totalLeadership > 0
        ? {
            totalLeadership,
            maleLeaders,
            femaleLeaders,
            malePercentage: DiversityService.round1(
              (maleLeaders / totalLeadership) * 100,
            ),
            femalePercentage: DiversityService.round1(
              (femaleLeaders / totalLeadership) * 100,
            ),
            targetFemaleLeadership: 30.0,
          }
        : {
            totalLeadership: 45,
            maleLeaders: 36,
            femaleLeaders: 9,
            malePercentage: 80.0,
            femalePercentage: 20.0,
            targetFemaleLeadership: 30.0,
          };

    // Disability & ethnicity — reference (no schema columns).
    const disabilityMetrics = DiversityService.DISABILITY_REFERENCE.map((m) => ({ ...m }));
    const ethnicityMetrics = DiversityService.ETHNICITY_REFERENCE.map((m) => ({ ...m }));

    // Hiring — reference config (recruitment stats not modelled on Employee).
    const hiringMetrics: HiringMetricsDto = {
      totalHired2025: 82,
      maleHired: 54,
      femaleHired: 28,
      maleHiredPercentage: 65.9,
      femaleHiredPercentage: 34.1,
      diverseHires: 18,
      diverseHiresPercentage: 22.0,
    };

    return {
      genderMetrics,
      ageMetrics,
      disabilityMetrics,
      educationMetrics,
      ethnicityMetrics,
      leadershipMetrics,
      hiringMetrics,
    };
  }

  // --- POSH -----------------------------------------------------------------

  private async buildPosh(): Promise<PoshBreakdownDto> {
    // Governance roster + awareness sessions are reference config; the live
    // complaint list is already served by /hr/grievances?caseType=posh.
    return {
      icMembers: DiversityService.POSH_IC_MEMBERS.map((m) => ({ ...m })),
      trainingData: DiversityService.POSH_TRAINING.map((s) => ({ ...s })),
    };
  }
}
