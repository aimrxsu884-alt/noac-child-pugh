
import { PatientData, CalculationResult } from '../types.ts';

/**
 * วาง URL ที่ได้จากขั้นตอนการ Deploy ใน Google Apps Script ที่นี่
 */
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/คัดลอก_URL_มาวางที่นี่/exec';

export const saveRecordToGAS = async (data: PatientData, result: CalculationResult): Promise<boolean> => {
  try {
    const payload = {
      timestamp: new Date().toLocaleString('th-TH'),
      ...data,
      totalScore: result.totalScore,
      classification: result.classification,
    };

    console.log('Sending data to Google Apps Script:', payload);
    
    // Using fetch with no-cors to avoid complex CORS handshake with Google Scripts
    await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return true; 
  } catch (error) {
    console.error('Error saving to GAS:', error);
    return false;
  }
};
