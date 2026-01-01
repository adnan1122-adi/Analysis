export enum StudentPerformanceGroup {
  HighAchiever = 'High Achiever',
  AboveAverage = 'Above Average',
  Average = 'Average',
  BelowAverage = 'Below Average',
  AtRisk = 'At Risk'
}

export interface RawRow {
  [key: string]: string | number | undefined | null;
}

export interface StudentData {
  id: string;
  name: string;
  class: string;
  components: { [key: string]: number }; // e.g., { 'Quiz 1': 85, 'Midterm': 90 }
  totalScore: number;
  maxPossibleScore: number; // Inferred or set
  percentage: number;
  group: StudentPerformanceGroup;
  originalRow: RawRow;
  sheetName: string;
}

export interface ColumnMapping {
  nameCol: string;
  classCol: string;
  componentCols: string[];
  totalCol: string | null; // If null, we calculate
}

export interface AnalysisSummary {
  mean: number;
  median: number;
  mode: number;
  stdDev: number;
  min: number;
  max: number;
  range: number;
  passCount: number;
  failCount: number; // < 60%
  gradeDist: { [key: string]: number }; // A, B, C...
}

export interface ComponentStat {
  name: string;
  mean: number;
  median: number;
  mode: number;
  stdDev: number;
  min: number;
  max: number;
  correlationWithTotal: number;
}

export interface FullAnalysis {
  summary: AnalysisSummary;
  students: StudentData[];
  componentStats: ComponentStat[];
  strongestComponent: string;
  weakestComponent: string;
}

export interface ActionPlanResponse {
  highAchieverPlan: string;
  averageStudentPlan: string;
  atRiskPlan: string;
  teacherActions: string;
  hodInsights: string;
}