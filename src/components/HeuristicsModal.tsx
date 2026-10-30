import { FC } from 'react';
import { X, CheckCircle2, ShieldCheck, Compass, Sparkles, Keyboard } from 'lucide-react';
import { NIELSEN_HEURISTICS } from '../data/heuristics';

interface HeuristicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeuristicsModal: FC<HeuristicsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Heurísticas de Jakob Nielsen & UX do Vale do Silício
              </h2>
              <p className="text-xs text-slate-400">
                Padrões de usabilidade, ergonomia cognitiva e design de engenharia aplicados no ÓRBITA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content / Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-4 divide-y divide-slate-800/60">
          {/* Quick Keyboard shortcuts summary */}
          <div className="pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">
              <Keyboard className="w-4 h-4" />
              <span>Atalhos Rápidos de Teclado (Eficiência de Uso)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-tabular">
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800 text-slate-300">
                <span className="text-cyan-400 font-bold">[Espaço]</span> Iniciar / Pausar
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800 text-slate-300">
                <span className="text-cyan-400 font-bold">[L]</span> Gravar Volta
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800 text-slate-300">
                <span className="text-cyan-400 font-bold">[R]</span> Resetar
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800 text-slate-300">
                <span className="text-cyan-400 font-bold">[M]</span> Mutar / Som
              </div>
            </div>
          </div>

          {/* 10 Heuristics List */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>As 10 Heurísticas de Usabilidade</span>
            </div>

            {NIELSEN_HEURISTICS.map((h) => (
              <div key={h.number} className="pt-3 first:pt-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-mono-tabular font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                    #{String(h.number).padStart(2, '0')}
                  </span>
                  <h3 className="text-sm font-semibold text-white">
                    {h.titlePt}
                  </h3>
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    ({h.title})
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {h.description}
                </p>
                <div className="mt-2 text-xs bg-slate-950/50 border border-slate-800 rounded-lg p-2.5 text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-300 font-medium">Aplicação no ÓRBITA: </strong>
                    {h.howWeApply}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Engenharia UX & Heurísticas de Nielsen</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
