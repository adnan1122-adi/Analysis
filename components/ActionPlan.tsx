
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, RefreshCw, FileText, FileDown, 
  Rocket, Target, ShieldAlert, Lightbulb, 
  TrendingUp, BrainCircuit
} from 'lucide-react';
import { FullAnalysis, ActionPlanResponse } from '../types';
import { generateEducationalActionPlan } from '../services/geminiService';
import { exportWithLogoFlow, exportToWord } from '../services/exportUtils';
import { translations, Language } from '../translations';

interface ActionPlanProps {
  analysis: FullAnalysis;
  lang: Language;
  customTitle?: string;
  logo?: string | null;
}

const MarkdownContent = ({ content, theme }: { content: string, theme: 'emerald' | 'indigo' | 'rose' | 'amber' | 'slate' }) => {
  const colors = {
    emerald: { head: 'text-emerald-900', bold: 'text-emerald-800', marker: 'bg-emerald-600' },
    indigo: { head: 'text-indigo-900', bold: 'text-indigo-800', marker: 'bg-indigo-600' },
    rose: { head: 'text-rose-900', bold: 'text-rose-800', marker: 'bg-rose-600' },
    amber: { head: 'text-amber-900', bold: 'text-amber-800', marker: 'bg-amber-600' },
    slate: { head: 'text-slate-900', bold: 'text-slate-800', marker: 'bg-slate-600' },
  };
  const c = colors[theme];
  return (
    <ReactMarkdown
      className="text-[15px] text-slate-800 leading-7 text-justify font-normal"
      components={{
        h1: ({node, ...props}) => <h3 className={`text-xl font-bold mb-3 mt-6 pb-1 border-b border-slate-200 ${c.head}`} {...props} />,
        h2: ({node, ...props}) => <h4 className={`text-lg font-bold mb-2 mt-5 ${c.head}`} {...props} />,
        h3: ({node, ...props}) => <h5 className={`text-base font-bold mb-2 mt-4 uppercase tracking-wide ${c.head}`} {...props} />,
        strong: ({node, ...props}) => <span className={`font-bold ${c.bold}`} {...props} />,
        ul: ({node, ...props}) => <ul className="space-y-2 my-4" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-2 my-4" {...props} />,
        li: ({node, children, ...props}) => (
          <li className="flex items-start gap-3">
             <span className={`mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.marker}`} />
             <span>{children}</span>
          </li>
        ),
        p: ({node, ...props}) => <p className="mb-4" {...props} />,
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-5 bg-slate-50 py-2 pr-2 rounded-r" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export const ActionPlan: React.FC<ActionPlanProps> = ({ analysis, lang, customTitle, logo }) => {
  const [plan, setPlan] = useState<ActionPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[lang];

  const generatePlan = async () => {
    if (!process.env.API_KEY) {
      setError("API Key not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateEducationalActionPlan(analysis, lang);
      setPlan(result);
    } catch (err) {
      setError("Failed to generate AI plan.");
    } finally {
      setLoading(false);
    }
  };

  if (!plan && !loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl p-10 md:p-16 text-center text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-800 via-slate-900 to-black opacity-60 z-0"></div>
        <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
            <div className="p-4 bg-indigo-500/20 backdrop-blur-md rounded-2xl mb-8 border border-indigo-500/30 shadow-lg">
                <Sparkles className="w-12 h-12 text-indigo-300 animate-pulse" />
            </div>
            <h2 className="text-4xl font-extrabold mb-6 tracking-tight">{t.aiStrategy}</h2>
            <p className="text-indigo-200 mb-10 text-lg leading-relaxed">{t.aiSub}</p>
            <button onClick={generatePlan} className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
                <span className="relative z-10">{t.genStrategy}</span>
                <Sparkles className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
            </button>
            {error && <p className="mt-6 text-rose-300 bg-rose-900/30 px-4 py-2 rounded-lg border border-rose-800/50 backdrop-blur-sm">{error}</p>}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center animate-pulse">
        <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center"><BrainCircuit className="w-6 h-6 text-indigo-600" /></div>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{t.loadingAi}</h3>
        <p className="text-slate-500">{t.loadingAiSub}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg border border-purple-100"><Sparkles className="w-6 h-6 text-purple-600" /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t.aiPlan}</h2>
            <p className="text-xs text-slate-500">{t.aiSub}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
            <button onClick={generatePlan} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium flex items-center gap-2"><RefreshCw className="w-4 h-4" /> {t.regenerate}</button>
            <button onClick={() => exportWithLogoFlow('action-plan-content', 'AI_Action_Plan', customTitle, logo)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium shadow-sm"><FileDown className="w-4 h-4" /> {t.exportPdf}</button>
            <button onClick={() => exportToWord('action-plan-content', 'AI_Action_Plan', customTitle, logo)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"><FileText className="w-4 h-4" /> {t.exportWord}</button>
        </div>
      </div>

      <div id="action-plan-content" className="space-y-8">
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
                        {customTitle || t.aiPlan}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{t.aiPlan}</span>
                        <p className="text-slate-400 font-bold text-xs">{t.aiSub}</p>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400 font-bold text-xs">{new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
            <div className="px-8 py-6 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-emerald-600 ring-1 ring-emerald-100"><Rocket className="w-6 h-6" /></div>
                <h3 className="font-bold text-xl text-emerald-900">{t.highAchiever}</h3>
            </div>
            <div className="p-8"><MarkdownContent content={plan!.highAchieverPlan} theme="emerald" /></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
            <div className="px-8 py-6 bg-indigo-50/50 border-b border-indigo-100 flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-indigo-600 ring-1 ring-indigo-100"><Target className="w-6 h-6" /></div>
                <h3 className="font-bold text-xl text-indigo-900">{t.averageStudent}</h3>
            </div>
            <div className="p-8"><MarkdownContent content={plan!.averageStudentPlan} theme="indigo" /></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden">
            <div className="px-8 py-6 bg-rose-50/50 border-b border-rose-100 flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-rose-600 ring-1 ring-rose-100"><ShieldAlert className="w-6 h-6" /></div>
                <h3 className="font-bold text-xl text-rose-900">{t.atRisk}</h3>
            </div>
            <div className="p-8"><MarkdownContent content={plan!.atRiskPlan} theme="rose" /></div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="px-8 py-6 bg-amber-50/50 border-b border-amber-100 flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-amber-600 ring-1 ring-amber-100"><Lightbulb className="w-6 h-6" /></div>
                <h3 className="font-bold text-xl text-amber-900">{t.teacherActions}</h3>
            </div>
            <div className="p-8"><MarkdownContent content={plan!.teacherActions} theme="amber" /></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-600 ring-1 ring-slate-200"><TrendingUp className="w-6 h-6" /></div>
                <h3 className="font-bold text-xl text-slate-800">{t.hodInsights}</h3>
            </div>
            <div className="p-8"><MarkdownContent content={plan!.hodInsights} theme="slate" /></div>
        </div>
      </div>
    </div>
  );
};
