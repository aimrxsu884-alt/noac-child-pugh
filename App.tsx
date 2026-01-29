import React, { useState, useMemo } from 'react';
import { 
  EncephalopathyLevel, 
  AscitesLevel, 
  PatientData, 
  NOACStatus 
} from './types.ts';
import { 
  calculateScore, 
  getClassification, 
  getNOACRecommendations 
} from './constants.ts';

const App: React.FC = () => {
  const [patientData, setPatientData] = useState<PatientData>({
    encephalopathy: EncephalopathyLevel.NONE,
    ascites: AscitesLevel.NONE,
    bilirubin: 1.0,
    albumin: 4.0,
    inr: 1.0
  });

  const individualScores = useMemo(() => {
    const { encephalopathy, ascites, bilirubin, albumin, inr } = patientData;
    let e = 1, a = 1, b = 1, al = 1, i = 1;

    if (encephalopathy === EncephalopathyLevel.GRADE_1_2) e = 2;
    else if (encephalopathy === EncephalopathyLevel.GRADE_3_4) e = 3;

    if (ascites === AscitesLevel.MILD) a = 2;
    else if (ascites === AscitesLevel.MODERATE_SEVERE) a = 3;

    if (bilirubin < 2.0) b = 1;
    else if (bilirubin <= 3.0) b = 2;
    else b = 3;

    if (albumin > 3.5) al = 1;
    else if (albumin >= 2.8 && albumin <= 3.5) al = 2;
    else al = 3;

    if (inr < 1.7) i = 1;
    else if (inr >= 1.7 && inr <= 2.3) i = 2;
    else i = 3;

    return { encephalopathy: e, ascites: a, bilirubin: b, albumin: al, inr: i };
  }, [patientData]);

  const result = useMemo(() => {
    const totalScore = calculateScore(
      patientData.encephalopathy,
      patientData.ascites,
      patientData.bilirubin,
      patientData.albumin,
      patientData.inr
    );
    const classification = getClassification(totalScore);
    
    let interpretation = "";
    let interpretationTH = "";
    let scoreRange = "";
    if (classification === 'A') {
      interpretation = "Well-compensated disease";
      interpretationTH = "การทำงานของตับยังชดเชยได้ดี";
      scoreRange = "5 - 6 คะแนน";
    } else if (classification === 'B') {
      interpretation = "Significant functional compromise";
      interpretationTH = "การทำงานของตับเริ่มบกพร่องชัดเจน";
      scoreRange = "7 - 9 คะแนน";
    } else {
      interpretation = "Decompensated disease";
      interpretationTH = "ตับวายระยะท้าย";
      scoreRange = "10 - 15 คะแนน";
    }

    return { totalScore, classification, interpretation, interpretationTH, scoreRange };
  }, [patientData]);

  const noacRecs = useMemo(() => getNOACRecommendations(result.classification), [result.classification]);

  const handleInputChange = (field: keyof PatientData, value: any) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: NOACStatus) => {
    switch (status) {
      case NOACStatus.NORMAL_DOSE: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case NOACStatus.USE_WITH_CAUTION: return 'bg-amber-50 text-amber-700 border-amber-100';
      case NOACStatus.NOT_RECOMMENDED: return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getStatusLabelTH = (status: NOACStatus) => {
    switch (status) {
      case NOACStatus.NORMAL_DOSE: return 'ขนาดยาปกติ';
      case NOACStatus.USE_WITH_CAUTION: return 'ควรระวังเป็นพิเศษ';
      case NOACStatus.NOT_RECOMMENDED: return 'ไม่แนะนำให้ใช้';
      default: return '-';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 py-6 mb-8 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                เครื่องคำนวณคะแนน Child-Pugh <span className="text-slate-400 font-medium">| NOAC Guide</span>
              </h1>
              <p className="text-[10px] md:text-[11px] text-indigo-500 font-black uppercase tracking-[0.15em]">
                Child-Pugh Calculator for NOAC Eligibility
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 md:p-10">
            <h2 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3">
              <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
              ข้อมูลพารามิเตอร์ <span className="text-slate-400 font-bold text-lg">(Clinical Parameters)</span>
            </h2>
            
            <div className="space-y-14">
              {/* Hepatic Encephalopathy */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 text-white text-xs font-black">01</span>
                    <label className="text-lg font-black text-slate-800">ภาวะทางสมอง <span className="text-slate-400 font-bold text-sm">(Encephalopathy)</span></label>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</span>
                    <span className="text-xl font-black text-indigo-600">+{individualScores.encephalopathy}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { level: EncephalopathyLevel.NONE, labelTH: 'ปกติ', labelEN: 'None', points: 1 },
                    { level: EncephalopathyLevel.GRADE_1_2, labelTH: 'ระดับน้อย', labelEN: 'Grade 1-2', points: 2 },
                    { level: EncephalopathyLevel.GRADE_3_4, labelTH: 'ระดับรุนแรง', labelEN: 'Grade 3-4', points: 3 }
                  ].map((item) => {
                    const active = patientData.encephalopathy === item.level;
                    return (
                      <button
                        key={item.level}
                        onClick={() => handleInputChange('encephalopathy', item.level)}
                        className={`relative py-5 px-5 rounded-[1.5rem] border-2 transition-all duration-300 text-left overflow-hidden ${
                          active 
                          ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100 -translate-y-1' 
                          : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-lg'
                        }`}
                      >
                        <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${active ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {item.labelEN}
                        </div>
                        <div className={`text-base font-bold leading-tight ${active ? 'text-white' : 'text-slate-800'}`}>
                          {item.labelTH}
                        </div>
                        <div className={`absolute -bottom-2 -right-2 text-4xl font-black opacity-10 ${active ? 'text-white' : 'text-slate-200'}`}>
                          {item.points}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Ascites */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 text-white text-xs font-black">02</span>
                    <label className="text-lg font-black text-slate-800">ภาวะท้องมาน <span className="text-slate-400 font-bold text-sm">(Ascites)</span></label>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</span>
                    <span className="text-xl font-black text-indigo-600">+{individualScores.ascites}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { level: AscitesLevel.NONE, labelTH: 'ไม่มี', labelEN: 'None', points: 1 },
                    { level: AscitesLevel.MILD, labelTH: 'เล็กน้อย', labelEN: 'Mild', points: 2 },
                    { level: AscitesLevel.MODERATE_SEVERE, labelTH: 'ปานกลาง-มาก', labelEN: 'Moderate/Severe', points: 3 }
                  ].map((item) => {
                    const active = patientData.ascites === item.level;
                    return (
                      <button
                        key={item.level}
                        onClick={() => handleInputChange('ascites', item.level)}
                        className={`relative py-5 px-5 rounded-[1.5rem] border-2 transition-all duration-300 text-left overflow-hidden ${
                          active 
                          ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100 -translate-y-1' 
                          : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-lg'
                        }`}
                      >
                        <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${active ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {item.labelEN}
                        </div>
                        <div className={`text-base font-bold leading-tight ${active ? 'text-white' : 'text-slate-800'}`}>
                          {item.labelTH}
                        </div>
                        <div className={`absolute -bottom-2 -right-2 text-4xl font-black opacity-10 ${active ? 'text-white' : 'text-slate-200'}`}>
                          {item.points}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Lab Data with Ranges */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 text-white text-xs font-black">03</span>
                  <label className="text-lg font-black text-slate-800">ผลทางห้องปฏิบัติการ <span className="text-slate-400 font-bold text-sm">(Laboratory Data)</span></label>
                </div>
                
                <div className="grid grid-cols-1 gap-12">
                  {/* Bilirubin */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col flex-1 min-w-[200px]">
                      <span className="text-sm font-black text-slate-800 mb-2">Bilirubin (mg/dL)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { range: '< 2.0', score: 1 },
                          { range: '2.0-3.0', score: 2 },
                          { range: '> 3.0', score: 3 }
                        ].map(r => (
                          <div key={r.range} className={`text-[9px] font-black px-2 py-1 rounded-md border flex items-center gap-1 ${individualScores.bilirubin === r.score ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            {r.range} <span className="opacity-50">→</span> {r.score}pt
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="relative w-full sm:w-44">
                      <input type="number" step="0.1" value={patientData.bilirubin} onChange={e => handleInputChange('bilirubin', parseFloat(e.target.value) || 0)} className="w-full py-4 pl-6 pr-14 rounded-[1.2rem] border-2 border-slate-100 focus:border-indigo-400 outline-none text-2xl font-black bg-slate-50 transition-all"/>
                      <div className="absolute top-1/2 -translate-y-1/2 right-4 text-[10px] font-black text-indigo-500 uppercase">mg/dL</div>
                    </div>
                  </div>

                  {/* Albumin */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col flex-1 min-w-[200px]">
                      <span className="text-sm font-black text-slate-800 mb-2">Albumin (g/dL)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { range: '> 3.5', score: 1 },
                          { range: '2.8-3.5', score: 2 },
                          { range: '< 2.8', score: 3 }
                        ].map(r => (
                          <div key={r.range} className={`text-[9px] font-black px-2 py-1 rounded-md border flex items-center gap-1 ${individualScores.albumin === r.score ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            {r.range} <span className="opacity-50">→</span> {r.score}pt
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="relative w-full sm:w-44">
                      <input type="number" step="0.1" value={patientData.albumin} onChange={e => handleInputChange('albumin', parseFloat(e.target.value) || 0)} className="w-full py-4 pl-6 pr-14 rounded-[1.2rem] border-2 border-slate-100 focus:border-indigo-400 outline-none text-2xl font-black bg-slate-50 transition-all"/>
                      <div className="absolute top-1/2 -translate-y-1/2 right-4 text-[10px] font-black text-indigo-500 uppercase">g/dL</div>
                    </div>
                  </div>

                  {/* INR */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col flex-1 min-w-[200px]">
                      <span className="text-sm font-black text-slate-800 mb-2">INR (Ratio)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { range: '< 1.7', score: 1 },
                          { range: '1.7-2.3', score: 2 },
                          { range: '> 2.3', score: 3 }
                        ].map(r => (
                          <div key={r.range} className={`text-[9px] font-black px-2 py-1 rounded-md border flex items-center gap-1 ${individualScores.inr === r.score ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            {r.range} <span className="opacity-50">→</span> {r.score}pt
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="relative w-full sm:w-44">
                      <input type="number" step="0.1" value={patientData.inr} onChange={e => handleInputChange('inr', parseFloat(e.target.value) || 0)} className="w-full py-4 pl-6 pr-14 rounded-[1.2rem] border-2 border-slate-100 focus:border-indigo-400 outline-none text-2xl font-black bg-slate-50 transition-all"/>
                      <div className="absolute top-1/2 -translate-y-1/2 right-4 text-[10px] font-black text-indigo-500 uppercase">Ratio</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Right Column: Result Dashboard */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-10 text-center bg-gradient-to-b from-white to-slate-50/30 relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
              <span className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">คะแนนรวม (Total Score)</span>
              <div className="text-[10rem] font-black text-slate-900 leading-none my-6 tracking-tighter drop-shadow-sm select-none">
                {result.totalScore}
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`px-10 py-4 rounded-2xl text-4xl font-black shadow-xl transition-all duration-700 mb-2 transform hover:scale-105 ${
                  result.classification === 'A' ? 'bg-emerald-500 text-white shadow-emerald-200' : 
                  result.classification === 'B' ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-rose-500 text-white shadow-rose-200'
                }`}>
                  CLASS {result.classification}
                </div>
                
                {/* Score Range Display */}
                <div className={`text-[11px] font-black px-4 py-1 rounded-full border mb-4 ${
                  result.classification === 'A' ? 'text-emerald-600 border-emerald-100 bg-emerald-50/50' : 
                  result.classification === 'B' ? 'text-amber-600 border-amber-100 bg-amber-50/50' : 'text-rose-600 border-rose-100 bg-rose-50/50'
                }`}>
                  เกณฑ์คะแนน: {result.scoreRange}
                </div>

                <div className="flex flex-col items-center gap-1">
                  <p className={`text-[15px] font-black tracking-tight px-6 py-2 rounded-xl transition-all duration-500 ${
                    result.classification === 'A' ? 'text-emerald-700 bg-emerald-50' : 
                    result.classification === 'B' ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                  }`}>
                    {result.interpretationTH}
                  </p>
                  <p className="text-[11px] font-bold text-slate-400 italic">
                    {result.interpretation}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-10 bg-white">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">คำแนะนำการใช้ยา (NOAC Recommendations)</h3>
                <div className="flex gap-1.5">
                  <div className={`w-2.5 h-1.5 rounded-full transition-all ${result.classification === 'A' ? 'bg-emerald-400 w-5' : 'bg-slate-200'}`}></div>
                  <div className={`w-2.5 h-1.5 rounded-full transition-all ${result.classification === 'B' ? 'bg-amber-400 w-5' : 'bg-slate-200'}`}></div>
                  <div className={`w-2.5 h-1.5 rounded-full transition-all ${result.classification === 'C' ? 'bg-rose-400 w-5' : 'bg-slate-200'}`}></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {noacRecs.map((rec) => (
                  <div 
                    key={rec.drug} 
                    className={`group flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all duration-300 ${getStatusColor(rec.recommendation)}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-lg font-black leading-tight mb-1">{rec.drug}</span>
                      <span className="text-[11px] font-black uppercase tracking-tight opacity-70">
                        {getStatusLabelTH(rec.recommendation)} <span className="opacity-50">/ {rec.recommendation}</span>
                      </span>
                    </div>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 ${
                      rec.recommendation === NOACStatus.NORMAL_DOSE ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 
                      rec.recommendation === NOACStatus.USE_WITH_CAUTION ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-rose-500 text-white shadow-lg shadow-rose-100'
                    }`}>
                      {rec.recommendation === NOACStatus.NOT_RECOMMENDED ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-1">หมายเหตุ (Clinical Context)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    การให้คะแนนอ้างอิงตามเกณฑ์ Child-Pugh Score (5-15 คะแนน) คำแนะนำการใช้ยา NOAC ดัดแปลงมาจากแนวทางเวชปฏิบัติ ESC/EHRA สำหรับผู้ป่วยที่มีภาวะหัวใจเต้นผิดจังหวะและโรคตับ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-20 text-center">
        <div className="inline-block px-8 py-3 bg-white rounded-full border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">
            Liver Decision Support Tools &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;