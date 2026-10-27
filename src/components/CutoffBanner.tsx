import { Clock, Info } from 'lucide-react';

export default function CutoffBanner() {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl px-4 py-3.5 flex items-start gap-3">
      <div className="bg-amber-400 dark:bg-amber-600 rounded-full p-1.5 shrink-0 mt-0.5">
        <Clock size={14} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          Atenção: Horário de Corte
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
          Feche e envie sua lista <strong>até as 13h</strong> para garantir a coleta no mesmo dia.
          Coletas a partir das 14h.
        </p>
      </div>
    </div>
  );
}
