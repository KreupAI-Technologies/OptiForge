// Diversity / EEO breakdown response shapes.
//
// These DTOs describe the payload returned by GET /hr/diversity/breakdown.
// Fields that CAN be derived from the Employee schema (gender, age from
// dateOfBirth, education degree, designation level, salary) are aggregated
// live in DiversityService. Fields the schema does NOT capture today
// (ethnicity, disability status, POSH committee roster, diversity-training
// counters) are returned from stable server-side reference constants so the
// frontend stops hardcoding — they are deterministic, never random.

export type DiversityKind = 'eeo' | 'metrics' | 'posh';

export type MetricTrend = 'up' | 'down' | 'stable';

export interface EEOCategoryDto {
  category: string;
  male: number;
  female: number;
  other: number;
  total: number;
  targetFemale: number;
  targetMet: boolean;
}

export interface PromotionDataDto {
  totalPromotions: number;
  malePromoted: number;
  femalePromoted: number;
  malePromotionRate: number;
  femalePromotionRate: number;
  targetFemalePromotionRate: number;
}

export interface CompensationDataDto {
  avgMaleSalary: number;
  avgFemaleSalary: number;
  genderPayGap: number;
  targetPayGap: number;
  compliant: boolean;
}

export interface EeoTrainingDataDto {
  totalTrainingHours: number;
  maleTrainingHours: number;
  femaleTrainingHours: number;
  avgMaleTraining: number;
  avgFemaleTraining: number;
  diversityTrainingCompleted: number;
  diversityTrainingTarget: number;
}

export interface EeoBreakdownDto {
  eeoCategories: EEOCategoryDto[];
  promotionData: PromotionDataDto;
  compensationData: CompensationDataDto;
  trainingData: EeoTrainingDataDto;
}

export interface DiversityMetricDto {
  category: string;
  subcategory: string;
  total: number;
  percentage: number;
  trend: MetricTrend;
  trendValue: number;
}

export interface LeadershipMetricsDto {
  totalLeadership: number;
  maleLeaders: number;
  femaleLeaders: number;
  malePercentage: number;
  femalePercentage: number;
  targetFemaleLeadership: number;
}

export interface HiringMetricsDto {
  totalHired2025: number;
  maleHired: number;
  femaleHired: number;
  maleHiredPercentage: number;
  femaleHiredPercentage: number;
  diverseHires: number;
  diverseHiresPercentage: number;
}

export interface MetricsBreakdownDto {
  genderMetrics: DiversityMetricDto[];
  ageMetrics: DiversityMetricDto[];
  disabilityMetrics: DiversityMetricDto[];
  educationMetrics: DiversityMetricDto[];
  ethnicityMetrics: DiversityMetricDto[];
  leadershipMetrics: LeadershipMetricsDto;
  hiringMetrics: HiringMetricsDto;
}

export interface IcMemberDto {
  name: string;
  designation: string;
  role: 'Presiding Officer' | 'Member' | 'External Member';
  gender: 'Male' | 'Female';
  tenure: string;
}

export interface PoshTrainingSessionDto {
  id: string;
  date: string;
  topic: string;
  attendees: number;
  trainer: string;
  department: string;
}

export interface PoshBreakdownDto {
  icMembers: IcMemberDto[];
  trainingData: PoshTrainingSessionDto[];
}

export type DiversityBreakdownDto =
  | EeoBreakdownDto
  | MetricsBreakdownDto
  | PoshBreakdownDto;
