import { FC, useState, useEffect, FormEvent } from 'react';
import { X, Volume2, VolumeX, Bell, Clock, Moon, Pizza } from 'lucide-react';
import { AppTheme } from '../types';
import { clampDurationMinutes } from '../utils/lunchTimer';

interface LunchSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  durationMinutes: number;
  canEditDuration: boolean;
  soundEnabled: boolean;
  theme: AppTheme;
  onSaveDuration: (minutes: number) => void;
  onToggleSound: () => void;
  onTestSound: () => void;
  onSelectTheme: (theme: AppTheme) => void;
}

const PRESET_DURATIONS = [15, 30, 45, 60, 90];

export const LunchSettingsModal: FC<LunchSettingsModalProps> = ({
  isOpen,
  onClose,
  durationMinutes,
  canEditDuration,
  soundEnabled,
  theme,
  onSaveDuration,
  onToggleSound,
  onTestSound,
  onSelectTheme,
}) => {
  const [inputMinutes, setInputMinutes] = useState<string>(String(durationMinutes));
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setInputMinutes(String(durationMinutes));
      setValidationError('');
    }
  }, [isOpen, durationMinutes]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = Number(inputMinutes);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 180) {
      setValidationError('Informe uma duração entre 1 e 180 minutos.');
      return;
    }
    onSaveDuration(clampDurationMinutes(parsed));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2E180D]/55 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lunch-settings-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FAF3E7] text-[#3B2114] border border-[#E2D0B8] rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terracotta Header */}
        <div className="bg-[#B84127] text-white px-6 py-4 flex items-center justify-between">
          <h2 id="lunch-settings-title" className="font-serif-display text-lg font-bold">
            Configurações do almoço
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-white/15 transition-colors focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
            aria-label="Fechar configurações"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Duration configuration */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#3B2114] mb-2">
              <Clock className="w-4 h-4 text-[#7E8859]" />
              <span>Duração do intervalo (minutos)</span>
            </div>

            {!canEditDuration && (
              <p className="text-xs text-[#8A462F] bg-[#F3E2D0] border border-[#E2C2AE] rounded-xl px-3 py-2 mb-3">
                Reinicie ou conclua o almoço atual para alterar a duração da pizza.
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_DURATIONS.map((mins) => {
                const isSelected = Number(inputMinutes) === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    disabled={!canEditDuration}
                    onClick={() => {
                      setInputMinutes(String(mins));
                      setValidationError('');
                    }}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'bg-[#B84127] text-white shadow-xs'
                        : 'bg-[#EFE4D2] text-[#3B2114] hover:bg-[#E4D4BB]'
                    }`}
                  >
                    {mins} min
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="custom-minutes-input" className="text-xs font-medium text-[#5C3D2E] whitespace-nowrap">
                Personalizado:
              </label>
              <input
                id="custom-minutes-input"
                type="number"
                min={1}
                max={180}
                disabled={!canEditDuration}
                value={inputMinutes}
                onChange={(e) => {
                  setInputMinutes(e.target.value);
                  setValidationError('');
                }}
                className="w-24 min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-[#D8C4AA] text-[#3B2114] font-semibold tabular-digits focus:outline-none focus:border-[#B84127] disabled:opacity-50"
              />
              <span className="text-xs text-[#6B4E3D]">min (1 a 180)</span>
            </div>

            {validationError && (
              <p className="text-xs text-[#B84127] font-medium mt-2" role="alert">
                {validationError}
              </p>
            )}
          </div>

          {/* Sound preferences */}
          <div className="pt-4 border-t border-[#E6D7C2]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#7E8859]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#8B7361]" />
                )}
                <div>
                  <div className="text-sm font-semibold text-[#3B2114]">Alerta sonoro ao finalizar</div>
                  <div className="text-xs text-[#6B4E3D]">
                    {soundEnabled ? 'Som ativado' : 'Silenciado'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onTestSound}
                  className="min-h-[40px] px-3 py-1.5 rounded-full text-xs font-medium bg-[#EFE4D2] hover:bg-[#E4D4BB] text-[#3B2114] transition-colors flex items-center gap-1.5 cursor-pointer"
                  aria-label="Testar alerta sonoro"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Testar</span>
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={soundEnabled}
                  aria-label={soundEnabled ? 'Silenciar alerta sonoro' : 'Ativar alerta sonoro'}
                  onClick={onToggleSound}
                  className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    soundEnabled
                      ? 'bg-[#7E8859] text-white'
                      : 'bg-[#E6D7C2] text-[#5C3D2E]'
                  }`}
                >
                  {soundEnabled ? 'Ativo' : 'Mudo'}
                </button>
              </div>
            </div>
          </div>

          {/* Theme switcher */}
          <div className="pt-4 border-t border-[#E6D7C2]">
            <div className="text-sm font-semibold text-[#3B2114] mb-2">
              Aparência e Tema
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onSelectTheme('lunch')}
                className={`min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'lunch'
                    ? 'bg-[#B84127] text-white border-[#B84127] shadow-xs'
                    : 'bg-white text-[#3B2114] border-[#DFC9B0] hover:bg-[#F3E8D7]'
                }`}
              >
                <Pizza className="w-4 h-4" />
                <span>Claro · Almoço</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTheme('orbita')}
                className={`min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'orbita'
                    ? 'bg-[#07090e] text-cyan-300 border-[#07090e] shadow-xs'
                    : 'bg-white text-[#3B2114] border-[#DFC9B0] hover:bg-[#F3E8D7]'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Escuro · Órbita</span>
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-5 py-2 rounded-full text-sm font-semibold text-[#5C3D2E] hover:bg-[#EFE4D2] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[42px] px-6 py-2 rounded-full text-sm font-semibold bg-[#B84127] hover:bg-[#9E351F] text-white shadow-sm transition-colors cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
