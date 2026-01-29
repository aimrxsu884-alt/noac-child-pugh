
export enum EncephalopathyLevel {
  NONE = 'None',
  GRADE_1_2 = 'Grade 1-2',
  GRADE_3_4 = 'Grade 3-4'
}

export enum AscitesLevel {
  NONE = 'None',
  MILD = 'Mild',
  MODERATE_SEVERE = 'Moderate/Severe'
}

export interface PatientData {
  encephalopathy: EncephalopathyLevel;
  ascites: AscitesLevel;
  bilirubin: number;
  albumin: number;
  inr: number;
}

export type ChildPughClass = 'A' | 'B' | 'C';

export interface CalculationResult {
  totalScore: number;
  classification: ChildPughClass;
}

export enum NOACStatus {
  NORMAL_DOSE = 'Normal dose',
  USE_WITH_CAUTION = 'Use with caution',
  NOT_RECOMMENDED = 'Not recommended'
}

export interface NOACRecommendation {
  drug: string;
  recommendation: NOACStatus;
}
