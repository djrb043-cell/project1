import { X, Download } from 'lucide-react';

interface PriceTableModalProps {
  onClose: () => void;
}

const priceTableImage = '/assets/tabela_precos_giroloc_corrigida_(1).png';

export default function PriceTableModal({ onClose }: PriceTableModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden" onClick={event => event.stopPropagation()}>
        <div className="bg-purple-700 dark:bg-purple-900 px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-bold text-xl">Tabela de Preços</h2>
            <p className="text-purple-200 text-sm mt-0.5">Seu bairro, sua taxa.</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={priceTableImage} download="tabela-precos-giroloc.png" className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition">
              <Download size={15} /><span className="hidden sm:inline">Baixar</span>
            </a>
            <button onClick={onClose} aria-label="Fechar tabela de preços" className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"><X size={20} /></button>
          </div>
        </div>
        <div className="overflow-y-auto bg-gray-100 dark:bg-gray-950 p-3 sm:p-5">
          <img src={priceTableImage} alt="Tabela de preços da GiroLoc" className="w-full h-auto rounded-xl shadow-sm" />
        </div>
      </div>
    </div>
  );
}
