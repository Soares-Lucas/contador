import { useState, FC, FormEvent } from 'react';
import { Calendar, Sparkles, Check, AlertTriangle } from 'lucide-react';
import { EventTarget } from '../types';

interface EventCountdownSetupProps {
  currentEvent: EventTarget;
  onSelectEvent: (event: EventTarget) => void;
  onClose?: () => void;
}

const PRESET_EVENTS: EventTarget[] = [
  {
    id: 'preset_launch',
    title: 'Lançamento Global de Produto',
    targetTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days from now
    category: 'Startup'
  },
  {
    id: 'preset_demo',
    title: 'Demo Day & Pitch aos Investidores',
    targetTimestamp: Date.now() + 1000 * 60 * 60 * 48, // 48 hours from now
    category: 'Venture'
  },
  {
    id: 'preset_sprint',
    title: 'Fim de Ciclo de Desenvolvimento',
    targetTimestamp: Date.now() + 1000 * 60 * 60 * 12, // 12 hours from now
    category: 'Engenharia'
  },
  {
    id: 'preset_nye',
    title: 'Virada do Ano Novo',
    targetTimestamp: new Date(new Date().getFullYear() + 1, 0, 1, 0, 0, 0).getTime(),
    category: 'Data Comemorativa'
  }
];

export const EventCountdownSetup: FC<EventCountdownSetupProps> = ({
  currentEvent,
  onSelectEvent,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customDateTime, setCustomDateTime] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customTitle.trim()) {
      setErrorMsg('Por favor, informe o nome do evento.');
      return;
    }

    if (!customDateTime) {
      setErrorMsg('Por favor, selecione a data e o horário do evento.');
      return;
    }

    const selectedTime = new Date(customDateTime).getTime();
    if (isNaN(selectedTime)) {
      setErrorMsg('Data ou horário inválido.');
      return;
    }

    if (selectedTime <= Date.now()) {
      setErrorMsg('A data do evento deve estar no futuro para a contagem regressiva.');
      return;
    }

    onSelectEvent({
      id: `custom_${Date.now()}`,
      title: customTitle.trim(),
      targetTimestamp: selectedTime,
      category: 'Personalizado'
    });

    setCustomTitle('');
    setCustomDateTime('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <Calendar className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-slate-200">
          Configuração do Evento Alvo
        </h3>
      </div>

      {/* Preset Events Grid */}
      <div className="mt-4">
        <span className="text-xs font-medium text-slate-400">Modelos Rápidos do Vale:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
          {PRESET_EVENTS.map((preset) => {
            const isSelected = currentEvent.title === preset.title;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectEvent(preset)}
                className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-white shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold">{preset.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {preset.category} · {new Date(preset.targetTimestamp).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Event Form */}
      <form onSubmit={handleCustomSubmit} className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Criar Evento Personalizado</span>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2 bg-rose-950/40 border border-rose-500/40 rounded-lg flex items-center gap-2 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Título do Evento</label>
            <input
              type="text"
              placeholder="Ex: Lançamento da Plataforma"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Data e Horário</label>
            <input
              type="datetime-local"
              value={customDateTime}
              onChange={(e) => setCustomDateTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Definir Contagem Regressiva
          </button>
        </div>
      </form>
    </div>
  );
};
