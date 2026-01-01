
import React from 'react';
import { StudentData, StudentPerformanceGroup } from '../types';
import { Users, Trophy, TrendingUp, AlertTriangle, ShieldAlert, Target, BarChart3, Table as TableIcon, Medal, FileDown, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { exportWithLogoFlow, exportToWord } from '../services/exportUtils';
import { translations, Language } from '../translations';

interface StudentTableProps {
  students: StudentData[];
  totalScoreHeader?: string;
  lang: Language;
  customTitle?: string;
  logo?: string | null;
}

export const StudentTable: React.FC<StudentTableProps> = ({ students, totalScoreHeader = 'Overall Score', lang, customTitle, logo }) => {
  const t = translations[lang];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800';
    if (score >= 75) return 'bg-teal-50 text-teal-700';
    if (score >= 60) return 'bg-indigo-50 text-indigo-700';
    if (score >= 50) return 'bg-amber-50 text-amber-700';
    return 'bg-rose-50 text-rose-700';
  };

  const getGroupBadgeStyle = (group: string) => {
     if (group.includes('High') || group === t.highAchievers) return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20';
     if (group.includes('Above') || group === t.aboveAverage) return 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20';
     if (group.includes('Average') || group === t.average) return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20';
     if (group.includes('Below') || group === t.belowAverage) return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20';
     return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20';
  };

  const counts = {
    total: students.length,
    high: students.filter(s => s.group === StudentPerformanceGroup.HighAchiever).length,
    aboveAvg: students.filter(s => s.group === StudentPerformanceGroup.AboveAverage).length,
    average: students.filter(s => s.group === StudentPerformanceGroup.Average).length,
    belowAvg: students.filter(s => s.group === StudentPerformanceGroup.BelowAverage).length,
    atRisk: students.filter(s => s.group === StudentPerformanceGroup.AtRisk).length,
  };

  const chartData = [
    { name: t.highAchievers, count: counts.high, color: '#10b981' },
    { name: t.aboveAverage, count: counts.aboveAvg, color: '#14b8a6' },
    { name: t.average, count: counts.average, color: '#6366f1' },
    { name: t.belowAverage, count: counts.belowAvg, color: '#f59e0b' },
    { name: t.atRiskLabel, count: counts.atRisk, color: '#f43f5e' },
  ];

  const components = Object.keys(students[0]?.components || {});

  const topPerformers = [...students].sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);
  const ranks = lang === 'ar' ? ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس'] : ['1st', '2nd', '3rd', '4th', '5th'];
  const rankBadges = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  const rankStyles = [
    'bg-yellow-50 border-yellow-100', 
    'bg-slate-50 border-slate-100', 
    'bg-orange-50 border-orange-100',
    'bg-white border-slate-100',
    'bg-white border-slate-100'
  ];

  const sheetNames = Array.from(new Set(students.map(s => s.sheetName))).filter(Boolean).join(', ');
  const dataSourceText = sheetNames ? `${t.dataSource}: ${sheetNames}` : t.allStudentsLabel;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.studentPerformanceReport}</h2>
          <p className="text-sm text-slate-500">{dataSourceText}</p>
        </div>
        <div className="flex gap-3">
             <button onClick={() => exportWithLogoFlow('student-list-report', 'Student_Performance_Report', customTitle, logo)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all text-sm font-bold shadow-lg shadow-slate-200"><FileDown className="w-4 h-4" /> {t.exportPdf}</button>
             <button onClick={() => exportToWord('student-list-report', 'Student_Performance_Report', customTitle, logo)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-200"><FileText className="w-4 h-4" /> {t.exportWord}</button>
        </div>
      </div>

      <div id="student-list-report" className="space-y-8">
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
                        {customTitle || t.studentPerformanceReport}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{t.studentList}</span>
                        <p className="text-slate-400 font-bold text-xs">
                          {t.dataSource}: <span className="text-indigo-600">{sheetNames || t.allStudentsLabel}</span>
                        </p>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400 font-bold text-xs">{new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.totalStudents}</span>
                </div>
                <span className="text-2xl font-bold text-slate-800">{counts.total}</span>
            </div>
            
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2 text-emerald-600">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.highAchievers}</span>
                </div>
                <span className="text-2xl font-bold text-emerald-700">{counts.high}</span>
            </div>

            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2 text-teal-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.aboveAverage}</span>
                </div>
                <span className="text-2xl font-bold text-teal-700">{counts.aboveAvg}</span>
            </div>

            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.average}</span>
                </div>
                <span className="text-2xl font-bold text-indigo-700">{counts.average}</span>
            </div>

            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2 text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.belowAverage}</span>
                </div>
                <span className="text-2xl font-bold text-amber-700">{counts.belowAvg}</span>
            </div>

            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2 text-rose-600">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.atRiskLabel}</span>
                </div>
                <span className="text-2xl font-bold text-rose-700">{counts.atRisk}</span>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden break-inside-avoid">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-yellow-50/50 to-white">
            <div className="p-2 bg-yellow-100 rounded-lg"><Medal className="w-5 h-5 text-yellow-600" /></div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">{t.topPerformers}</h3>
                <p className="text-sm text-slate-500">{t.recognizingExcellence} {totalScoreHeader}.</p>
            </div>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse rtl:text-right">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                <tr>
                    <th className="px-6 py-4 font-semibold w-20">{t.rank}</th>
                    <th className="px-6 py-4 font-semibold">{t.studentNameCol}</th>
                    {components.map(c => (
                        <th key={c} className="px-6 py-4 font-semibold text-center">{c}</th>
                    ))}
                    <th className="px-6 py-4 font-semibold text-center">{totalScoreHeader}</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {topPerformers.map((student, index) => (
                    <tr key={student.id} className={`${rankStyles[index]} transition-colors`}>
                    <td className="px-6 py-4 font-bold text-lg whitespace-nowrap">
                        <span className="flex items-center gap-2">
                        {rankBadges[index]} <span className="text-xs font-medium text-slate-500 ml-1">{ranks[index]}</span>
                        </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{student.name}</td>
                    {components.map(c => (
                        <td key={c} className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getScoreColor(student.components[c])}`}>
                            {student.components[c]}
                        </span>
                        </td>
                    ))}
                    <td className="px-6 py-4 text-center font-black text-slate-900 text-base">{student.totalScore.toFixed(1)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 break-inside-avoid">
            <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-800">{t.performanceDistribution}</h3>
            </div>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={60}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            <LabelList dataKey="count" position="top" style={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 rounded-lg"><TableIcon className="w-5 h-5 text-slate-600" /></div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{t.detailedView}</h3>
                    <p className="text-sm text-slate-500">{t.completeDataSub}</p>
                </div>
            </div>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right border-collapse">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-20 shadow-sm">
                <tr>
                    <th className="px-6 py-4 font-semibold border-b border-slate-200">{t.nameLabel}</th>
                    {components.map(c => (
                    <th key={c} className="px-6 py-4 font-semibold text-center border-b border-slate-200 min-w-[100px]">{c}</th>
                    ))}
                    <th className="px-6 py-4 font-semibold text-center border-b border-slate-200 bg-slate-50/50">{totalScoreHeader}</th>
                    <th className="px-6 py-4 font-semibold text-center border-b border-slate-200">{t.groupLabel}</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                    const groupTranslation = lang === 'ar' 
                      ? (student.group === StudentPerformanceGroup.HighAchiever ? t.highAchievers 
                      : student.group === StudentPerformanceGroup.AboveAverage ? t.aboveAverage 
                      : student.group === StudentPerformanceGroup.Average ? t.average 
                      : student.group === StudentPerformanceGroup.BelowAverage ? t.belowAverage 
                      : t.atRiskLabel) 
                      : student.group;
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-900 border-r border-transparent">{student.name}</td>
                      {components.map(c => (
                          <td key={c} className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-md font-medium text-xs ${getScoreColor(student.components[c])}`}>
                              {student.components[c]}
                          </span>
                          </td>
                      ))}
                      <td className="px-6 py-4 text-center font-bold text-slate-800 bg-slate-50/30">
                          {student.totalScore.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getGroupBadgeStyle(groupTranslation)}`}>
                          {groupTranslation}
                          </span>
                      </td>
                      </tr>
                    );
                })}
                </tbody>
            </table>
            </div>
        </div>
      </div>
    </div>
  );
};
