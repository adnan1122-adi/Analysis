
import React, { useState } from 'react';
import Papa from 'papaparse';
import { 
  GraduationCap, Lock, User, AlertCircle, Loader2, 
  ChevronRight, BrainCircuit, BarChart3, FileSpreadsheet, X,
  Globe, ShieldCheck, Zap
} from 'lucide-react';
import { translations, Language } from '../translations';

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3qv2BmESqbS8-4cntrUvngieWgRrEXjdrkr6uu6HC0X-xJtsvp_DJSeRsq7FvwciPAfgSDONbv66D/pub?output=csv";

interface LoginProps {
  onLoginSuccess: (userData: any) => void;
  lang: Language;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, lang }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const t = translations[lang];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(SHEET_CSV_URL);
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const users = results.data as any[];
          const user = users.find(u => 
            String(u.Username).trim() === username.trim() && 
            String(u.Password).trim() === password.trim()
          );

          if (user) {
            const expiryStr = user["Expiry Timestamp"];
            if (expiryStr) {
              const expiryDate = new Date(expiryStr);
              const now = new Date();
              
              if (isNaN(expiryDate.getTime()) || now > expiryDate) {
                setError(t.accountExpired);
                setLoading(false);
                return;
              }
            }
            onLoginSuccess(user);
          } else {
            setError(t.invalidCreds);
            setLoading(false);
          }
        },
        error: (err: any) => {
          console.error("CSV Parse Error:", err);
          setError("Connection error. Please try again.");
          setLoading(false);
        }
      });
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError("Failed to connect to authentication server.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050810] text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/20 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              {t.title}
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowLoginForm(true)}
              className="px-6 py-2 bg-white text-slate-950 rounded-full font-black text-sm hover:bg-indigo-50 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
            >
              {t.signIn}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-20 max-w-7xl mx-auto px-6 pt-40 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10 animate-in fade-in slide-in-from-left-12 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">{t.appTagline}</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black leading-[1] tracking-tight text-white">
              Data Driven <br />
              <span className="text-indigo-500">Excellence.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed font-medium">
              {t.appDescription}
            </p>
          </div>

          {/* Prominent "Made by SmarterAdi" Professional Card */}
          <div className="pt-6">
            <div className="inline-flex items-center gap-5 p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] group hover:border-indigo-500/50 transition-all duration-500 shadow-2xl">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-2xl shadow-[0_8px_24px_rgba(99,102,241,0.3)] group-hover:rotate-12 transition-transform">
                  SA
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-[#050810] rounded-full shadow-lg" />
              </div>
              <div className="pr-4">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">{t.madeBy.split(' ')[0]} {t.madeBy.split(' ')[1]}</p>
                <p className="text-white font-black text-xl tracking-tight group-hover:text-indigo-400 transition-colors">SmarterAdi</p>
              </div>
              <div className="h-10 w-px bg-white/10 mx-2" />
              <div className="p-3 bg-white/5 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10">
            <div className="group space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
                <BrainCircuit className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="font-black text-xl text-white">{t.feature1}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{t.feature1Desc}</p>
            </div>
            <div className="group space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 group-hover:bg-violet-500/20 transition-all">
                <BarChart3 className="w-6 h-6 text-violet-500" />
              </div>
              <h3 className="font-black text-xl text-white">{t.feature2}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{t.feature2Desc}</p>
            </div>
          </div>
        </div>

        {/* Visual Decoration Column: Professional Data Visual Preview */}
        <div className="hidden lg:block relative animate-in fade-in slide-in-from-right-12 duration-1000 delay-200">
           <div className="relative z-10 bg-[#0c111d] border border-white/10 rounded-[48px] p-10 shadow-[0_0_120px_rgba(79,70,229,0.15)] overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full" />
              <div className="flex items-center gap-4 mb-10">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/40" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/40" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
                 </div>
                 <div className="h-px flex-grow bg-white/5" />
                 <Globe className="w-4 h-4 text-slate-600" />
              </div>
              
              <div className="space-y-8">
                 <div className="grid grid-cols-4 gap-4">
                    {[3, 1, 4, 2].map((v, i) => (
                       <div key={i} className="h-24 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:bg-white/10 transition-all">
                          <div className="text-indigo-400 font-black text-xl">{v * 20}%</div>
                          <div className="w-8 h-1 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500" style={{ width: `${v * 25}%` }} />
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <div className="h-56 bg-indigo-500/5 rounded-3xl border border-white/5 flex items-end p-8 gap-4 overflow-hidden relative">
                    {[80, 45, 95, 70, 85, 60, 100].map((h, i) => (
                       <div key={i} className="flex-grow bg-gradient-to-t from-indigo-600/80 to-indigo-400 rounded-t-xl transition-all hover:scale-110 hover:brightness-125 duration-500" 
                            style={{ height: `${h}%`, animation: `growUp 1s ease-out forwards ${i * 0.1}s`, opacity: 0 }} />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c111d] to-transparent h-12 bottom-0" />
                 </div>
                 
                 <div className="flex justify-between items-center px-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse" />
                       <div className="space-y-1">
                          <div className="h-2 w-20 bg-slate-700 rounded" />
                          <div className="h-2 w-12 bg-slate-800 rounded" />
                       </div>
                    </div>
                    <div className="h-8 w-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                       Live Insights
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="absolute -bottom-10 -left-10 p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl rotate-[-6deg] animate-bounce-slow">
              <div className="flex items-center gap-4">
                <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
                <div className="h-2 w-24 bg-slate-700 rounded-full" />
              </div>
           </div>
        </div>
      </main>

      {/* Modern Login Overlay */}
      {showLoginForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowLoginForm(false)} />
          
          <div className="w-full max-w-md bg-white text-slate-950 rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-500 relative z-10">
            <button 
              onClick={() => setShowLoginForm(false)}
              className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-12 pt-16">
              <div className="text-center mb-12">
                <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-6">
                  <Lock className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter mb-2">{t.loginTitle}</h2>
                <div className="flex items-center justify-center gap-2 text-slate-500 font-bold text-sm">
                   <ShieldCheck className="w-4 h-4" />
                   {t.madeBy}
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.username}</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-bold text-lg"
                      placeholder="Username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t.password}</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-bold text-lg"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-3xl animate-in shake duration-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-black">{error}</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-5 bg-slate-950 text-white rounded-[24px] font-black text-xl hover:bg-indigo-600 hover:-translate-y-1 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] active:scale-95 disabled:opacity-70 disabled:translate-y-0 flex items-center justify-center gap-3 mt-10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {t.loggingIn}
                    </>
                  ) : (
                    <>
                      {t.signIn}
                      <ChevronRight className="w-6 h-6" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="relative z-20 max-w-7xl mx-auto px-6 py-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
         <div className="flex items-center gap-4 text-slate-500 text-sm font-bold">
            <p>© {new Date().getFullYear()} EduAnalytics AI</p>
            <div className="w-1 h-1 rounded-full bg-slate-800" />
            <p className="text-slate-400">{t.madeBy}</p>
         </div>
         <div className="flex gap-10 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <span className="hover:text-white cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Hub</span>
            <span className="hover:text-white cursor-pointer transition-colors">Enterprise API</span>
         </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes growUp {
          from { height: 0; opacity: 0; }
          to { opacity: 1; }
        }
        .animate-bounce-slow {
          animation: bounce 4s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          50% { transform: translateY(-20px) rotate(-2deg); }
        }
      `}} />
    </div>
  );
};
