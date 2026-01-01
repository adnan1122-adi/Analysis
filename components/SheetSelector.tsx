
import React, { useState, useEffect } from 'react';
import { ArrowRight, Layers, Check } from 'lucide-react';
import { translations, Language } from '../translations';

interface SheetSelectorProps {
  sheets: string[];
  onNext: (selected: string[]) => void;
  onBack: () => void;
  lang: Language;
}

export const SheetSelector: React.FC<SheetSelectorProps> = ({ sheets, onNext, onBack, lang }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const t = translations[lang];

  useEffect(() => {
    if (sheets.length > 0) setSelected(sheets);
  }, [sheets]);

  const toggleSheet = (sheet: string) => {
    setSelected(prev =>
      prev.includes(sheet) ? prev.filter(s => s !== sheet) : [...prev, sheet]
    );
  };

  const handleSelectAll = () => setSelected(sheets);
  const handleDeselectAll = () => setSelected([]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-50 rounded-xl">
           <Layers className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-slate-800">{t.selectSheets}</h2>
           <p className="text-slate-500 mt-1">{t.selectSheetsSub}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
        <span className="text-sm font-medium text-slate-500">{t.selected} {selected.length}</span>
        <div className="flex gap-4 text-sm font-medium">
            <button onClick={handleSelectAll} className="text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg transition-colors">{t.selectAll}</button>
            <button onClick={handleDeselectAll} className="text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg transition-colors">{t.deselectAll}</button>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto mb-10 pr-2">
        {sheets.map(sheet => {
           const isSelected = selected.includes(sheet);
           return (
            <div 
                key={sheet}
                onClick={() => toggleSheet(sheet)}
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all group ${
                    isSelected ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-300'
                }`}
            >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'
                }`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className={`mx-4 font-semibold text-lg ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>{sheet}</span>
            </div>
           );
        })}
        {sheets.length === 0 && (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">{t.noSheetsFound}</div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-slate-500 font-semibold hover:text-slate-800 px-6 py-3 hover:bg-slate-100 rounded-xl transition">{t.back}</button>
        <button
          onClick={() => onNext(selected)}
          disabled={selected.length === 0}
          className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
            selected.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {t.next}
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
