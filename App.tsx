
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { SheetSelector } from './components/SheetSelector';
import { DataMapper } from './components/DataMapper';
import { ChartsPanel } from './components/ChartsPanel';
import { StudentTable } from './components/StudentTable';
import { ActionPlan } from './components/ActionPlan';
import { Login } from './components/Login';
import { RawRow, ColumnMapping, StudentData } from './types';
import { performFullAnalysis, determineGroup } from './services/analysisUtils';
// Fix: Added missing 'Zap' icon import from 'lucide-react'
import { LayoutDashboard, Table2, BrainCircuit, GraduationCap, Filter, Languages, Settings2, Image as ImageIcon, X, LogOut, UserCircle, Zap } from 'lucide-react';
import { translations, Language } from './translations';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
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

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    // Force a fresh state for a new session
    setStep(1);
    setRawSheetData({});
    setSelectedSheetNames([]);
    setAllStudents([]);
    setReportTitle('');
    setReportLogo(null);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
  };

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

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} lang={lang} />;
  }

  return (
    <div className={`min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 selection:bg-indigo-100 selection:text-indigo-700 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      
      {/* Enhanced Pro Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 border-b border-slate-200 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="bg-slate-950 p-2.5 rounded-xl shadow-xl shadow-slate-200">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-950 leading-none">
                {t.title}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Intelligence Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-xs font-black text-slate-700 uppercase tracking-wider"
            >
              <Languages className="w-4 h-4 text-indigo-600" />
              {lang === 'en' ? 'Arabic' : 'English'}
            </button>

            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

            <div className="flex items-center gap-3 pl-2">
              <div className="hidden md:block text-right">
                <p className="text-xs font-black text-slate-900 leading-none">{user.Username}</p>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">{user.Role || 'Educator'}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="group relative p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title={t.logout}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {step === 1 && (
          <div className="max-w-3xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-slate-950 mb-6 tracking-tight">
                {t.uploadTitle.split(' ')[0]} <span className="text-indigo-600">{t.uploadTitle.split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed font-medium">
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
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="inline-flex p-1.5 bg-white shadow-sm border border-slate-200 rounded-2xl">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 uppercase tracking-wider ${
                    activeTab === 'dashboard' 
                      ? 'bg-slate-950 text-white shadow-xl' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> {t.dashboard}
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 uppercase tracking-wider ${
                    activeTab === 'students' 
                      ? 'bg-slate-950 text-white shadow-xl' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Table2 className="w-4 h-4" /> {t.studentList}
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 uppercase tracking-wider ${
                    activeTab === 'ai' 
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <BrainCircuit className="w-4 h-4" /> {t.aiPlan}
                </button>
              </div>

              {selectedSheetNames.length > 1 && (
                <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 border border-slate-200 shadow-sm">
                  <Filter className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Filter Data:</span>
                  <select 
                    value={sheetFilter} 
                    onChange={(e) => setSheetFilter(e.target.value)}
                    className="bg-transparent border-none text-sm font-black text-slate-900 focus:ring-0 cursor-pointer outline-none min-w-[140px]"
                  >
                    <option value="All">{t.selectAll} ({selectedSheetNames.length})</option>
                    {selectedSheetNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Professional Settings Area */}
            <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm p-10">
               <div className="flex items-center gap-3 mb-10 border-b border-slate-100 pb-5">
                  <Settings2 className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xl font-black text-slate-950 tracking-tight">{t.reportSettings}</h3>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  <div className="lg:col-span-4 space-y-5">
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.uploadLogo}</label>
                     <div 
                        onClick={() => logoInputRef.current?.click()}
                        className="group relative h-40 w-full border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 rounded-[32px] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden"
                     >
                        {reportLogo ? (
                           <>
                              <img src={reportLogo} alt="Logo Preview" className="h-full w-full object-contain p-6" />
                              <button 
                                 onClick={(e) => { e.stopPropagation(); setReportLogo(null); }}
                                 className="absolute top-4 right-4 p-2 bg-white shadow-xl rounded-full text-rose-500 hover:bg-rose-50 transition-all hover:scale-110 active:scale-90"
                              >
                                 <X className="w-4 h-4" />
                              </button>
                           </>
                        ) : (
                           <>
                              <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">{t.browse}</span>
                           </>
                        )}
                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                     </div>
                  </div>

                  <div className="lg:col-span-8 space-y-5">
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.reportTitle}</label>
                     <textarea 
                        value={reportTitle} 
                        onChange={(e) => setReportTitle(e.target.value)}
                        placeholder={t.enterTitle}
                        rows={4}
                        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[32px] shadow-inner outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-lg font-bold leading-relaxed resize-none"
                     />
                     <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">
                        <Zap className="w-3 h-3 text-amber-500" />
                        Professional titles increase the authority of generated insights.
                     </div>
                  </div>
               </div>
            </div>

            <div className="min-h-[600px]">
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
