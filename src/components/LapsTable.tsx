import { FC } from 'react';
import { Copy, Download, Trash2, Trophy, Clock } from 'lucide-react';
import { Lap } from '../types';

interface LapsTableProps {
  laps: Lap[];
  onClearLaps: () => void;
  onCopyLaps: () => void;
}

function formatLapTime(ms: number): string {
  const m = Math.floor((ms / (1000 * 60)) % 60);
  const s = Math.floor((ms / 1000) % 60);
  const millis = ms % 1000;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

export const LapsTable: FC<LapsTableProps> = ({ laps, onClearLaps, onCopyLaps }) => {
  if (laps.length === 0) {
    return null;
  }

  // Calculate fastest and slowest lap (if at least 2 laps exist)
  let fastestLapId = -1;
  let slowestLapId = -1;
  if (laps.length >= 2) {
    let minTime = Infinity;
    let maxTime = -Infinity;
    laps.forEach((l) => {
      if (l.lapTime < minTime) {
        minTime = l.lapTime;
        fastestLapId = l.id;
      }
      if (l.lapTime > maxTime) {
        maxTime = l.lapTime;
        slowestLapId = l.id;
      }
    });
  }

  const exportCSV = () => {
    const headers = 'Volta,Tempo da Volta,Tempo Acumulado,Timestamp\n';
    const rows = laps
      .map(
        (l) =>
          `Volta ${l.id},"${formatLapTime(l.lapTime)}","${formatLapTime(l.overallTime)}","${l.timestamp}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orbita_voltas_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Header with counts and export options */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Registro de Voltas ({laps.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopyLaps}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors cursor-pointer"
            title="Copiar lista de voltas para área de transferência"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors cursor-pointer"
            title="Exportar dados como CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={onClearLaps}
            className="p-1 text-xs text-slate-500 hover:text-red-400 rounded transition-colors ml-1 cursor-pointer"
            title="Limpar histórico de voltas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Laps List */}
      <div className="max-h-60 overflow-y-auto mt-3 divide-y divide-slate-800/50 pr-1">
        {laps.slice().reverse().map((lap) => {
          const isFastest = lap.id === fastestLapId;
          const isSlowest = lap.id === slowestLapId;

          return (
            <div
              key={lap.id}
              className={`flex items-center justify-between py-2 text-xs font-mono-tabular transition-colors ${
                isFastest
                  ? 'bg-emerald-950/20 text-emerald-400 px-2 rounded-md font-semibold'
                  : isSlowest
                  ? 'bg-rose-950/20 text-rose-400 px-2 rounded-md'
                  : 'text-slate-300 px-2'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-sans">#{String(lap.id).padStart(2, '0')}</span>
                {isFastest && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 uppercase font-sans font-bold">
                    <Trophy className="w-3 h-3" /> Mais Rápida
                  </span>
                )}
                {isSlowest && (
                  <span className="text-[10px] text-rose-400 uppercase font-sans">
                    Mais Lenta
                  </span>
                )}
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] font-sans mr-1.5">Parcial</span>
                  <span className="text-sm font-bold">{formatLapTime(lap.lapTime)}</span>
                </div>
                <div className="text-right w-24">
                  <span className="text-slate-500 text-[10px] font-sans mr-1.5">Total</span>
                  <span className="text-slate-400">{formatLapTime(lap.overallTime)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
