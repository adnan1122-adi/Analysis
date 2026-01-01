import { StudentData, AnalysisSummary, ComponentStat, StudentPerformanceGroup } from '../types';

export const calculateMean = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((acc, val) => acc + val, 0) / numbers.length;
};

export const calculateMedian = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const calculateMode = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const frequency: { [key: number]: number } = {};
  let maxFreq = 0;
  let mode = numbers[0];

  numbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
    if (frequency[num] > maxFreq) {
      maxFreq = frequency[num];
      mode = num;
    }
  });
  return mode;
};

export const calculateStdDev = (numbers: number[], mean: number): number => {
  if (numbers.length === 0) return 0;
  const squareDiffs = numbers.map(val => Math.pow(val - mean, 2));
  const avgSquareDiff = calculateMean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
};

export const calculateMin = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  let min = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] < min) min = numbers[i];
  }
  return min;
};

export const calculateMax = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  let max = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] > max) max = numbers[i];
  }
  return max;
};

export const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;
  const xMean = calculateMean(x);
  const yMean = calculateMean(y);
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < x.length; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    numerator += xDiff * yDiff;
    denomX += xDiff * xDiff;
    denomY += yDiff * yDiff;
  }
  
  const denominator = Math.sqrt(denomX * denomY);
  // Prevent division by zero or NaN results (e.g., if variance is 0)
  if (denominator === 0 || isNaN(denominator)) return 0;
  
  return numerator / denominator;
};

export const determineGroup = (percentage: number): StudentPerformanceGroup => {
  if (percentage >= 90) return StudentPerformanceGroup.HighAchiever;
  if (percentage >= 75) return StudentPerformanceGroup.AboveAverage;
  if (percentage >= 60) return StudentPerformanceGroup.Average;
  if (percentage >= 50) return StudentPerformanceGroup.BelowAverage;
  return StudentPerformanceGroup.AtRisk;
};

export const determineGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

export const performFullAnalysis = (students: StudentData[]): { summary: AnalysisSummary; componentStats: ComponentStat[], strongestComponent: string, weakestComponent: string } => {
  const scores = students.map(s => s.percentage);
  const mean = calculateMean(scores);
  
  const summary: AnalysisSummary = {
    mean,
    median: calculateMedian(scores),
    mode: calculateMode(scores),
    stdDev: calculateStdDev(scores, mean),
    min: calculateMin(scores),
    max: calculateMax(scores),
    range: calculateMax(scores) - calculateMin(scores),
    passCount: students.filter(s => s.percentage >= 60).length,
    failCount: students.filter(s => s.percentage < 60).length,
    gradeDist: {
      A: students.filter(s => determineGrade(s.percentage) === 'A').length,
      B: students.filter(s => determineGrade(s.percentage) === 'B').length,
      C: students.filter(s => determineGrade(s.percentage) === 'C').length,
      D: students.filter(s => determineGrade(s.percentage) === 'D').length,
      F: students.filter(s => determineGrade(s.percentage) === 'F').length,
    }
  };

  // Component Analysis
  const componentKeys = Object.keys(students[0]?.components || {});
  const componentStats: ComponentStat[] = componentKeys.map(key => {
    const compScores = students.map(s => s.components[key]);
    const compMean = calculateMean(compScores);
    return {
      name: key,
      mean: compMean,
      median: calculateMedian(compScores),
      mode: calculateMode(compScores),
      stdDev: calculateStdDev(compScores, compMean),
      min: calculateMin(compScores),
      max: calculateMax(compScores),
      correlationWithTotal: calculateCorrelation(compScores, scores)
    };
  });

  // Identify strongest/weakest components based on average percentage
  const sortedComponents = [...componentStats].sort((a, b) => b.mean - a.mean);
  
  return {
    summary,
    componentStats,
    strongestComponent: sortedComponents[0]?.name || 'N/A',
    weakestComponent: sortedComponents[sortedComponents.length - 1]?.name || 'N/A'
  };
};