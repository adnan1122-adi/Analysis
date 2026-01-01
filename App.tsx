
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { SheetSelector } from './components/SheetSelector';
import { DataMapper } from './components/DataMapper';
import { ChartsPanel } from './components/ChartsPanel';
import { StudentTable } from './components/StudentTable';
import { ActionPlan } from './components/ActionPlan';
import { RawRow, ColumnMapping, StudentData } from './types';
import { performFullAnalysis, determineGroup } from './services/analysisUtils';
import { LayoutDashboard, Table2, BrainCircuit, GraduationCap, Filter, Languages, Settings2, Image as ImageIcon, X } from 'lucide-react';
import { translations, Language } from './translations';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [lang, setLang] = useState<Language>('en');
  const [reportTitle, setReportTitle] = useState<string>('');
  const [reportLogo, setReportLogo] = useState<string | null>(null);
  const [rawSheetData, setRawSheetData] = useState<{ [key: string]: RawRow[] }>({});
  const [selectedSheetNames, setSelectedSheetNames] = useState<string[]>([]);
  
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [sheetFilter, setSheetFilter] = useState<string>('All');
  const [totalColName, setTotalColName] = useState<string>('Overall Score');
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'ai'>('dashboard');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const onDataLoaded = (data: { [key: string]: RawRow[] }) => {
    setRawSheetData(data);
    setStep(2); 
  };

  const onSheetsConfirmed = (selected: string[]) => {
    setSelectedSheetNames(selected);
    setStep(3); 
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setReportLogo(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getSmartValue = (row: RawRow, colName: string): string | number | undefined | null => {
    if (Object.prototype.hasOwnProperty.call(row, colName)) {
      return row[colName];
    }
    const lowerColName = colName.toLowerCase().trim();
    const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === lowerColName);
    if (foundKey) return row[foundKey];
    return undefined;
  };

  const onMappingConfirmed = (mapping: ColumnMapping) => {
    setTotalColName(mapping.totalCol || t.autoSum);
    let allRows: RawRow[] = [];
    selectedSheetNames.forEach(sheet => {
      const rows = (rawSheetData[sheet] || []).map(r => ({ ...r, SheetSource: sheet }));
      allRows = [...allRows, ...rows];
    });

    const processedStudents: StudentData[] = allRows
      .map((row, idx) => {
        const rawName = getSmartValue(row, mapping.nameCol);
        const name = rawName ? String(rawName) : '';
        const sheetName = String(row['SheetSource'] || 'Unknown');
        let className = sheetName;
        if (mapping.classCol) {
            const rawClass = getSmartValue(row, mapping.classCol);
            if (rawClass) className = String(rawClass);
        }
        const components: { [key: string]: number } = {};
        let sumComponents = 0;
        mapping.componentCols.forEach(col => {
          const rawVal = getSmartValue(row, col);
          const val = parseFloat(String(rawVal || '0'));
          const cleanVal = isNaN(val) ? 0 : val;
          components[col] = cleanVal;
          sumComponents += cleanVal;
        });
        let total = sumComponents;
        if (mapping.totalCol) {
          const rawTotal = getSmartValue(row, mapping.totalCol);
          const tVal = parseFloat(String(rawTotal));
          if (!isNaN(tVal)) total = tVal;
        }
        return {
          id: `s-${sheetName}-${idx}`,
          name,
          class: className,
          components,
          totalScore: total,
          maxPossibleScore: 100, 
          percentage: total, 
          group: determineGroup(total),
          originalRow: row,
          sheetName
        };
      })
      .filter(student => student.name && student.name.trim() !== '');

    setAllStudents(processedStudents);
    setSheetFilter('All');
    setStep(4);
  };

  const filteredStudents = useMemo(() => {
    if (sheetFilter === 'All') return allStudents;
    return allStudents.filter(s => s.sheetName === sheetFilter);
  }, [allStudents, sheetFilter]);

  const analysis = useMemo(() => {
    if (filteredStudents.length === 0) return null;
    const result = performFullAnalysis(filteredStudents);
    return { ...result, students: filteredStudents };
  }, [filteredStudents]);

  const getHeaders = () => {
    if (selectedSheetNames.length === 0) return [];
    const firstSheetName = selectedSheetNames[0];
    const firstSheetRows = rawSheetData[firstSheetName];
    if (!firstSheetRows || firstSheetRows.length === 0) return [];
    return Object.keys(firstSheetRows[0]);
  };

  const getSampleRow = () => {
    if (selectedSheetNames.length === 0) return {};
    const firstSheetName = selectedSheetNames[0];
    return rawSheetData[firstSheetName][0] || {};
  };

  return (
    <div className={`min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 selection:bg-indigo-100 selection:text-indigo-700 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      
      <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 border-b border-slate-200/60 transition-all duration-200 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-lg shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
              {t.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all text-sm font-bold text-slate-700"
            >
              <Languages className="w-4 h-4 text-indigo-600" />
              {lang === 'en' ? 'العربية' : 'English'}
            </button>

            {step === 4 && selectedSheetNames.length > 1 && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1 border border-slate-200">
                <Filter className="w-4 h-4 text-slate-500" />
                <select 
                  value={sheetFilter} 
                  onChange={(e) => setSheetFilter(e.target.value)}
                  className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:ring-0 cursor-pointer outline-none min-w-[120px]"
                >
                  <option value="All">{t.selectAll} ({selectedSheetNames.length})</option>
                  {selectedSheetNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            )}
            
            {step === 4 && (
              <button 
                onClick={() => { setStep(1); setAllStudents([]); setSelectedSheetNames([]); setReportLogo(null); setReportTitle(''); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all"
              >
                {t.newAnalysis}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        
        {step === 1 && (
          <div className="max-w-2xl mx-auto mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
                {t.uploadTitle.split(' ')[0]} <span className="text-indigo-600">{t.uploadTitle.split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
                {t.uploadSub}
              </p>
            </div>
            <FileUpload onDataLoaded={onDataLoaded} lang={lang} />
          </div>
        )}

        {step === 2 && (
          <div className="mt-8">
            <SheetSelector 
                sheets={Object.keys(rawSheetData)} 
                onNext={onSheetsConfirmed}
                onBack={() => setStep(1)}
                lang={lang}
            />
          </div>
        )}

        {step === 3 && (
          <div className="mt-8">
            <DataMapper 
              headers={getHeaders()} 
              sampleRow={getSampleRow()} 
              onConfirm={onMappingConfirmed} 
              onBack={() => setStep(2)}
              lang={lang}
            />
          </div>
        )}

        {step === 4 && analysis && (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            <div className="flex justify-center">
              <div className="inline-flex p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-full shadow-inner border border-slate-200">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'dashboard' 
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> {t.dashboard}
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'students' 
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Table2 className="w-4 h-4" /> {t.studentList}
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'ai' 
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BrainCircuit className="w-4 h-4" /> {t.aiPlan}
                </button>
              </div>
            </div>

            {/* Professional Settings Area */}
            <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
               <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                  <Settings2 className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-slate-800">{t.reportSettings}</h3>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                  {/* Logo Section */}
                  <div className="lg:col-span-4 space-y-4">
                     <label className="block text-sm font-bold text-slate-700">{t.uploadLogo}</label>
                     <div 
                        onClick={() => logoInputRef.current?.click()}
                        className="group relative h-32 w-full border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden"
                     >
                        {reportLogo ? (
                           <>
                              <img src={reportLogo} alt="Logo Preview" className="h-full w-full object-contain p-4" />
                              <button 
                                 onClick={(e) => { e.stopPropagation(); setReportLogo(null); }}
                                 className="absolute top-2 right-2 p-1.5 bg-white shadow-md rounded-full text-rose-500 hover:bg-rose-50 transition-colors"
                              >
                                 <X className="w-4 h-4" />
                              </button>
                           </>
                        ) : (
                           <>
                              <ImageIcon className="w-8 h-8 text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors" />
                              <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600">{t.browse}</span>
                           </>
                        )}
                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                     </div>
                     <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                        {t.logoDesc}
                     </p>
                  </div>

                  {/* Title Section */}
                  <div className="lg:col-span-8 space-y-4">
                     <label className="block text-sm font-bold text-slate-700">{t.reportTitle}</label>
                     <textarea 
                        value={reportTitle} 
                        onChange={(e) => setReportTitle(e.target.value)}
                        placeholder={t.enterTitle}
                        rows={3}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-base font-medium resize-none"
                     />
                     <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                        Professional titles improve the credibility of generated reports.
                     </div>
                  </div>
               </div>
            </div>

            <div className="min-h-[500px]">
              {activeTab === 'dashboard' && (
                <ChartsPanel 
                  analysis={analysis} 
                  sourceName={sheetFilter === 'All' ? t.selectAll : sheetFilter} 
                  totalScoreName={totalColName}
                  lang={lang}
                  customTitle={reportTitle}
                  logo={reportLogo}
                />
              )}
              {activeTab === 'students' && (
                <StudentTable 
                  students={analysis.students} 
                  totalScoreHeader={totalColName} 
                  lang={lang}
                  customTitle={reportTitle}
                  logo={reportLogo}
                />
              )}
              {activeTab === 'ai' && <ActionPlan key={sheetFilter} analysis={analysis} lang={lang} customTitle={reportTitle} logo={reportLogo} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
