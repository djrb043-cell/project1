import { X, Download, MapPin } from 'lucide-react';

interface PriceTableModalProps {
  onClose: () => void;
}

const prices = [
  { city: 'Santo Amaro da Imperatriz', fee: 'R$ 10,00', description: 'Taxa única para a região' },
  { city: 'Palhoça', fee: 'A partir de R$ 13,00', description: 'Consulte o bairro no cadastro do pedido' },
  { city: 'São José', fee: 'A partir de R$ 18,00', description: 'Consulte o bairro no cadastro do pedido' },
  { city: 'Florianópolis', fee: 'A partir de R$ 22,00', description: 'Consulte o bairro no cadastro do pedido' },
];

export default function PriceTableModal({ onClose }: PriceTableModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={event => event.stopPropagation()}>
        <div className="bg-purple-700 dark:bg-purple-900 rounded-t-2xl px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-xl">Tabela de Preços</h2>
            <p className="text-purple-200 text-sm mt-0.5">Seu bairro, sua taxa.</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/assets/Logo_GiroLoc_com_Emblema_de_Movimento.png" download="giroloc-tabela-de-precos.png" className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition">
              <Download size={15} /><span className="hidden sm:inline">Baixar</span>
            </a>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"><X size={20} /></button>
          </div>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {prices.map(price => (
            <div key={price.city} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-purple-700 dark:text-purple-300" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{price.city}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{price.description}</p>
              </div>
              <strong className="text-purple-700 dark:text-purple-300 text-sm text-right">{price.fee}</strong>
            </div>
          ))}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">O valor final é calculado automaticamente pelo bairro selecionado.</p>
        </div>
      </div>
    </div>
  );
}
