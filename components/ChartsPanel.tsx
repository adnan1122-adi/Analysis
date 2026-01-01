
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { FullAnalysis, StudentPerformanceGroup } from '../types';
import { 
  FileText, BarChart3, PieChart as PieChartIcon, 
  LineChart as LineChartIcon, Activity, FileDown, GitCompare, Info, 
  Users, Award, TrendingUp, CircleDot, BrainCircuit
} from 'lucide-react';
import { exportWithLogoFlow, exportToWord } from '../services/exportUtils';
import { calculateCorrelation } from '../services/analysisUtils';
import { translations, Language } from '../translations';

interface ChartsPanelProps {
  analysis: FullAnalysis;
  sourceName: string;
  totalScoreName?: string;
  lang: Language;
  customTitle?: string;
  logo?: string | null;
}

const COLORS = {
  grade: ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'],
  components: '#6366f1'
};

const GROUP_COLORS: { [key: string]: string } = {
  [StudentPerformanceGroup.HighAchiever]: '#10b981',
  [StudentPerformanceGroup.AboveAverage]: '#06b6d4',
  [StudentPerformanceGroup.Average]: '#6366f1',
  [StudentPerformanceGroup.BelowAverage]: '#f59e0b',
  [StudentPerformanceGroup.AtRisk]: '#ef4444',
};

type ComponentChartType = 'bar' | 'line' | 'area' | 'radar';
type CorrelationChartType = 'scatter' | 'bar' | 'line' | 'area';

export const ChartsPanel: React.FC<ChartsPanelProps> = ({ analysis, sourceName, totalScoreName = 'Overall Score', lang, customTitle, logo }) => {
  const [componentChartType, setComponentChartType] = useState<ComponentChartType>('bar');
  const [correlationChartType, setCorrelationChartType] = useState<CorrelationChartType>('scatter');
  const [scatterX, setScatterX] = useState<string>('');
  const [scatterY, setScatterY] = useState<string>(totalScoreName);
  const t = translations[lang];

  const componentKeys = useMemo(() => analysis.componentStats.map(c => c.name), [analysis]);

  useEffect(() => {
    const validKeys = [totalScoreName, ...componentKeys];
    if (!scatterX || !validKeys.includes(scatterX)) setScatterX(componentKeys.length > 0 ? componentKeys[0] : totalScoreName);
    if (!scatterY || !validKeys.includes(scatterY)) setScatterY(totalScoreName);
  }, [componentKeys, totalScoreName, scatterX, scatterY]);

  const gradeData = Object.entries(analysis.summary.gradeDist).map(([grade, count]) => ({ grade, count }));
  
  const groupCounts = analysis.students.reduce((acc, student) => {
    acc[student.group] = (acc[student.group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const groupData = Object.values(StudentPerformanceGroup).map((group) => {
      let groupName = group;
      if (lang === 'ar') {
        if (group === StudentPerformanceGroup.HighAchiever) groupName = t.highAchievers;
        else if (group === StudentPerformanceGroup.AboveAverage) groupName = t.aboveAverage;
        else if (group === StudentPerformanceGroup.Average) groupName = t.average;
        else if (group === StudentPerformanceGroup.BelowAverage) groupName = t.belowAverage;
        else if (group === StudentPerformanceGroup.AtRisk) groupName = t.atRiskLabel;
      }
      return {
        name: groupName,
        originalGroup: group,
        value: groupCounts[group] || 0
      };
  });

  const scatterData = useMemo(() => {
    return analysis.students.map(s => ({
      name: s.name,
      x: scatterX === totalScoreName ? s.totalScore : (s.components[scatterX] || 0),
      y: scatterY === totalScoreName ? s.totalScore : (s.components[scatterY] || 0),
      group: s.group
    }));
  }, [analysis.students, scatterX, scatterY, totalScoreName]);

  const correlationValue = useMemo(() => calculateCorrelation(scatterData.map(d => d.x), scatterData.map(d => d.y)), [scatterData]);

  const renderCorrelationChart = () => {
    const ComparisonChart = correlationChartType === 'bar' ? BarChart : correlationChartType === 'line' ? LineChart : AreaChart;
    const DataComponent = correlationChartType === 'bar' ? Bar : correlationChartType === 'line' ? Line : Area;
    
    if (correlationChartType === 'scatter') {
      return (
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis type="number" dataKey="x" name={scatterX} label={{ value: scatterX, position: 'insideBottom', offset: -10 }} />
            <YAxis type="number" dataKey="y" name={scatterY} label={{ value: scatterY, angle: -90, position: 'insideLeft' }} />
            <ZAxis dataKey="name" name="Student" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Students" data={scatterData} fill="#10b981">
                {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GROUP_COLORS[entry.group as StudentPerformanceGroup]} />
                ))}
            </Scatter>
        </ScatterChart>
      );
    }

    return (
      <ComparisonChart data={scatterData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={false} />
        <YAxis yAxisId="left" orientation="left" stroke="#6366f1" />
        <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
        <Tooltip />
        <Legend />
        {/* @ts-ignore */}
        <DataComponent yAxisId="left" dataKey="x" name={scatterX} fill="#6366f1" stroke="#6366f1" fillOpacity={0.3} />
        {/* @ts-ignore */}
        <DataComponent yAxisId="right" dataKey="y" name={scatterY} fill="#10b981" stroke="#10b981" fillOpacity={0.3} />
      </ComparisonChart>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.dashboard}</h2>
          <p className="text-sm text-slate-500">{sourceName}</p>
        </div>
        <div className="flex gap-3">
             <button onClick={() => exportWithLogoFlow('dashboard-content', 'EduAnalytics_Dashboard', customTitle, logo)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all text-sm font-bold shadow-lg shadow-slate-100"><FileDown className="w-4 h-4" /> {t.exportPdf}</button>
             <button onClick={() => exportToWord('dashboard-content', 'EduAnalytics_Dashboard', customTitle, logo)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-100"><FileText className="w-4 h-4" /> {t.exportWord}</button>
        </div>
      </div>

      <div id="dashboard-content" className="space-y-8">
        {/* Professional Branding Header */}
        <div className="report-professional-header flex flex-col md:flex-row items-center md:items-end justify-between border-b-2 border-slate-900 pb-8 gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full">
                {logo && (
                    <div className="flex-shrink-0 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                        <img src={logo} alt="Institution Logo" className="max-h-24 max-w-48 object-contain" />
                    </div>
                )}
                <div className="text-center md:text-left rtl:md:text-right space-y-2 flex-grow">
                    <h1 className="text-4xl font-black text-slate-900 leading-tight">
                        {customTitle || t.placeholderTitle}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{t.dashboard}</span>
                        <span className="text-slate-400 font-bold text-xs">{sourceName}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400 font-bold text-xs">{new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[ 
            { label: t.classAverage, val: `${analysis.summary.mean.toFixed(1)}%`, icon: BarChart3, color: 'indigo' },
            { label: t.passRate, val: `${((analysis.summary.passCount / analysis.students.length) * 100).toFixed(0)}%`, icon: Users, color: 'emerald' },
            { label: t.topScore, val: analysis.summary.max, icon: Award, color: 'amber' },
            { label: t.variance, val: analysis.summary.stdDev.toFixed(1), icon: TrendingUp, color: 'blue' }
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center group hover:border-indigo-200 transition-colors">
              <div className={`p-3 bg-${kpi.color}-50 rounded-xl mb-4 text-${kpi.color}-600 group-hover:scale-110 transition-transform`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className="text-3xl font-black text-slate-900">{kpi.val}</p>
            </div>
          ))}
        </div>

        {/* Top Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" /> {t.gradeDist}
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="grade" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {gradeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.grade[index % COLORS.grade.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-500" /> {t.perfGroups}
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={groupData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {groupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GROUP_COLORS[entry.originalGroup as StudentPerformanceGroup]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Component Analysis */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm break-inside-avoid">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-500" /> {t.assessments} Analysis
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {(['bar', 'line', 'area', 'radar'] as ComponentChartType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setComponentChartType(type)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    componentChartType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {componentChartType === 'radar' ? (
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.componentStats}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name={t.meanScore} dataKey="mean" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                  <Tooltip />
                </RadarChart>
              ) : (
                <BarChart data={analysis.componentStats}>
                   {componentChartType === 'bar' ? (
                     <>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                        <Bar dataKey="mean" fill="#6366f1" radius={[6, 6, 0, 0]} />
                     </>
                   ) : componentChartType === 'line' ? (
                     <>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip contentStyle={{borderRadius: '12px'}} />
                        <Line type="monotone" dataKey="mean" stroke="#6366f1" strokeWidth={3} dot={{r: 6}} />
                     </>
                   ) : (
                     <>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip contentStyle={{borderRadius: '12px'}} />
                        <Area type="monotone" dataKey="mean" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={3} />
                     </>
                   )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Correlation Analysis */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm break-inside-avoid">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-amber-500" /> {t.correlation}
              </h3>
              <p className="text-sm text-slate-500 mt-1">{t.correlationSub}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select 
                value={scatterX} 
                onChange={e => setScatterX(e.target.value)}
                className="p-2 text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[totalScoreName, ...componentKeys].map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <span className="text-slate-400 self-center font-bold">{lang === 'ar' ? 'ضد' : 'VS'}</span>
              <select 
                value={scatterY} 
                onChange={e => setScatterY(e.target.value)}
                className="p-2 text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[totalScoreName, ...componentKeys].map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <div className="flex bg-slate-100 p-1 rounded-lg ml-2">
                {(['scatter', 'bar', 'line'] as CorrelationChartType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => setCorrelationChartType(type)}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            correlationChartType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        {type.toUpperCase()}
                    </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 h-80">
                <ResponsiveContainer width="100%" height="100%">
                    {renderCorrelationChart()}
                </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.interpretation}</p>
                    <div className="text-4xl font-black text-indigo-600">{correlationValue.toFixed(2)}</div>
                    <p className="text-sm font-bold text-slate-700 mt-2">
                        {Math.abs(correlationValue) > 0.7 ? t.strongCorrel : Math.abs(correlationValue) > 0.4 ? t.modCorrel : t.weakCorrel}
                    </p>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Info className="w-4 h-4 text-slate-400" />
                        <span>{t.correlDesc}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Stats Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden break-inside-avoid">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                    <LineChartIcon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{t.statsTable}</h3>
                    <p className="text-sm text-slate-500">{t.statsSub}</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse rtl:text-right">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 font-semibold border-b border-slate-200">{t.category}</th>
                            <th className="px-6 py-4 font-semibold text-center border-b border-slate-200">{t.meanLabel}</th>
                            <th className="px-6 py-4 font-semibold text-center border-b border-slate-200">{t.medianLabel}</th>
                            <th className="px-6 py-4 font-semibold text-center border-b border-slate-200">{t.modeLabel}</th>
                            <th className="px-6 py-4 font-semibold text-center border-b border-slate-200">{t.stdDevLabel}</th>
                            <th className="px-6 py-4 font-semibold text-center border-b border-slate-200">{t.minLabel}</th>
                            <th className="px-6 py-4 font-semibold text-center border-b border-slate-200">{t.maxLabel}</th>
                            <th className="px-6 py-4 font-semibold text-center border-b border-slate-200">{t.correlLabel}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="bg-indigo-50/20 font-bold text-indigo-900">
                            <td className="px-6 py-4 border-r border-indigo-100/50">{totalScoreName}</td>
                            <td className="px-6 py-4 text-center">{analysis.summary.mean.toFixed(2)}</td>
                            <td className="px-6 py-4 text-center">{analysis.summary.median.toFixed(2)}</td>
                            <td className="px-6 py-4 text-center">{analysis.summary.mode.toFixed(2)}</td>
                            <td className="px-6 py-4 text-center">{analysis.summary.stdDev.toFixed(2)}</td>
                            <td className="px-6 py-4 text-center">{analysis.summary.min.toFixed(0)}</td>
                            <td className="px-6 py-4 text-center">{analysis.summary.max.toFixed(0)}</td>
                            <td className="px-6 py-4 text-center text-slate-400">1.00</td>
                        </tr>
                        {analysis.componentStats.map((comp) => (
                            <tr key={comp.name} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-700 border-r border-slate-100">{comp.name}</td>
                                <td className="px-6 py-4 text-center">{comp.mean.toFixed(2)}</td>
                                <td className="px-6 py-4 text-center">{comp.median.toFixed(2)}</td>
                                <td className="px-6 py-4 text-center">{comp.mode.toFixed(2)}</td>
                                <td className="px-6 py-4 text-center">{comp.stdDev.toFixed(2)}</td>
                                <td className="px-6 py-4 text-center">{comp.min.toFixed(0)}</td>
                                <td className="px-6 py-4 text-center">{comp.max.toFixed(0)}</td>
                                <td className="px-6 py-4 text-center font-bold text-indigo-600">{comp.correlationWithTotal.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};
