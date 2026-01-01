
import React, { useState, useEffect } from 'react';
import { RawRow, ColumnMapping } from '../types';
import { ArrowRight, AlertCircle, Database } from 'lucide-react';
import { translations, Language } from '../translations';

interface DataMapperProps {
  headers: string[];
  sampleRow: RawRow;
  onConfirm: (mapping: ColumnMapping) => void;
  onBack: () => void;
  lang: Language;
}

export const DataMapper: React.FC<DataMapperProps> = ({ headers, sampleRow, onConfirm, onBack, lang }) => {
  const t = translations[lang];
  const [mapping, setMapping] = useState<ColumnMapping>({
    nameCol: '',
    classCol: '',
    componentCols: [],
    totalCol: null
  });

  useEffect(() => {
    const newMapping = { ...mapping };
    const numericHeaders = headers.filter(h => {
      const val = sampleRow[h];
      return typeof val === 'number' || (typeof val === 'string' && !isNaN(parseFloat(val)));
    });

    newMapping.nameCol = headers.find(h => /name|student|candidate|اسم|طالب/i.test(h)) || headers[0] || '';
    newMapping.classCol = headers.find(h => /class|grade|section|batch|صف|فصل/i.test(h)) || '';
    
    let total = headers.find(h => /overall score|quarter 1|الدرجة النهائية|المجموع/i.test(h));
    if (!total) {
        total = headers.find(h => /total|final mark|sum|score|نهائي/i.test(h));
    }

    if (total) newMapping.totalCol = total;
    newMapping.componentCols = numericHeaders.filter(h => h !== newMapping.totalCol && !/roll|id|phone|هاتف|رقم/i.test(h));

    setMapping(newMapping);
  }, [headers]);

  const handleComponentToggle = (header: string) => {
    setMapping(prev => ({
      ...prev,
      componentCols: prev.componentCols.includes(header) 
        ? prev.componentCols.filter(c => c !== header)
        : [...prev.componentCols, header]
    }));
  };

  const isValid = mapping.nameCol && mapping.componentCols.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-50 rounded-xl">
           <Database className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-slate-800">{t.mapColumns}</h2>
           <p className="text-slate-500 mt-1">{t.mapSub}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.studentName}</label>
                <div className="relative">
                    <select 
                        value={mapping.nameCol} 
                        onChange={e => setMapping({...mapping, nameCol: e.target.value})}
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.classGrade}</label>
                <div className="relative">
                    <select 
                        value={mapping.classCol} 
                        onChange={e => setMapping({...mapping, classCol: e.target.value})}
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                        <option value="">{t.none}</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.totalMark}</label>
                <div className="relative">
                    <select 
                        value={mapping.totalCol || ''} 
                        onChange={e => setMapping({...mapping, totalCol: e.target.value || null})}
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                        <option value="">{t.autoSum}</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
            </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-3">{t.assessments}</h3>
          <p className="text-sm text-slate-500 mb-4">{t.assessmentsSub}</p>
          <div className="flex flex-wrap gap-2">
            {headers.map(h => (
              <button
                key={h}
                onClick={() => handleComponentToggle(h)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  mapping.componentCols.includes(h)
                    ? 'bg-white border-indigo-600 text-indigo-700 shadow-sm ring-1 ring-indigo-600'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
          {mapping.componentCols.length === 0 && (
            <div className="flex items-center gap-2 mt-4 text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-100">
              <AlertCircle className="w-4 h-4" />
              {t.selectOneComponent}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex justify-between items-center pt-6 border-t border-slate-100">
        <button onClick={onBack} className="text-slate-500 font-semibold hover:text-slate-800 px-6 py-3 hover:bg-slate-100 rounded-xl transition">{t.back}</button>
        <button
          onClick={() => isValid && onConfirm(mapping)}
          disabled={!isValid}
          className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
            isValid ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {t.generateAnalysis}
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
