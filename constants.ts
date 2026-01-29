import { 
  EncephalopathyLevel, 
  AscitesLevel, 
  NOACStatus, 
  ChildPughClass,
  NOACRecommendation 
} from './types';

export const calculateScore = (
  encephalopathy: EncephalopathyLevel,
  ascites: AscitesLevel,
  bilirubin: number,
  albumin: number,
  inr: number
): number => {
  let score = 0;

  // Encephalopathy
  if (encephalopathy === EncephalopathyLevel.NONE) score += 1;
  else if (encephalopathy === EncephalopathyLevel.GRADE_1_2) score += 2;
  else score += 3;

  // Ascites
  if (ascites === AscitesLevel.NONE) score += 1;
  else if (ascites === AscitesLevel.MILD) score += 2;
  else score += 3;

  // Bilirubin (mg/dL)
  if (bilirubin < 2.0) score += 1;
  else if (bilirubin >= 2.0 && bilirubin <= 3.0) score += 2;
  else score += 3;

  // Albumin (g/dL)
  if (albumin > 3.5) score += 1;
  else if (albumin >= 2.8 && albumin <= 3.5) score += 2;
  else score += 3;

  // INR
  if (inr < 1.7) score += 1;
  else if (inr >= 1.7 && inr <= 2.3) score += 2;
  else score += 3;

  return score;
};

export const getClassification = (score: number): ChildPughClass => {
  if (score < 7) return 'A';
  if (score <= 9) return 'B';
  return 'C';
};

export const getNOACRecommendations = (classification: ChildPughClass): NOACRecommendation[] => {
  const drugs = ['Dabigatran', 'Apixaban', 'Edoxaban', 'Rivaroxaban'];
  
  return drugs.map(drug => {
    if (classification === 'A') {
      return { drug, recommendation: NOACStatus.NORMAL_DOSE };
    }
    
    if (classification === 'B') {
      if (drug === 'Rivaroxaban') {
        return { drug, recommendation: NOACStatus.NOT_RECOMMENDED };
      }
      return { drug, recommendation: NOACStatus.USE_WITH_CAUTION };
    }
    
    return { drug, recommendation: NOACStatus.NOT_RECOMMENDED };
  });
};