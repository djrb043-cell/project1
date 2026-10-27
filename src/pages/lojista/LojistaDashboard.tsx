import { useState, useEffect, useCallback } from 'react';
import { Package, Table2, RefreshCw, MessageSquare, Trash2, MessageCircle, Filter, Calendar, ClipboardList, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import CutoffBanner from '@/components/CutoffBanner';
import PriceTableModal from '@/components/PriceTableModal';
import OrderForm from './OrderForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrderAnalytics from '@/components/OrderAnalytics';
import { supabase, Order } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, PAYMENT_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/lib/pricing';

const ADMIN_WHATSAPP = '5548991277325';

type Tab = 'hoje' | 'historico';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function LojistaDashboard() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<Tab>('hoje');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPriceTable, setShowPriceTable] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterDateStart, setFilterDateStart] = useState(todayISO());
  const [filterDateEnd, setFilterDateEnd] = useState(todayISO());
  const [sendFeedback, setSendFeedback] = useState('');

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const today = todayISO();
    const start = tab === 'hoje' ? today : filterDateStart;
    const end = tab === 'hoje' ? today : filterDateEnd;
    let q = supabase
      .from('orders')
      .select('*')
      .eq('store_id', user.id)
      .order('created_at', { ascending: true });
    if (start) q = q.gte('created_at', `${start}T00:00:00`);
    if (end) q = q.lte('created_at', `${end}T23:59:59`);
    const { data, error } = await q;
    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  }, [user, tab, filterDateStart, filterDateEnd]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function deleteOrder(id: string) {
    if (!confirm('Remover este pedido?')) return;
    setDeletingId(id);
    await supabase.from('orders').delete().eq('id', id);
    setOrders(prev => prev.filter(o => o.id !== id));
    setDeletingId(null);
  }

  async function sendToAdmin() {
    if (openOrders.length === 0) return;
    setSendFeedback('');
    const dateLabel = tab === 'hoje'
      ? new Date(`${todayISO()}T12:00:00`).toLocaleDateString('pt-BR')
      : filterDateStart === filterDateEnd
        ? new Date(`${filterDateStart}T12:00:00`).toLocaleDateString('pt-BR')
        : `${new Date(`${filterDateStart}T12:00:00`).toLocaleDateString('pt-BR')} - ${new Date(`${filterDateEnd}T12:00:00`).toLocaleDateString('pt-BR')}`;
    const storeName = profile?.store_name ?? 'Loja';
    const lines = openOrders.map((o, i) => {
      const fee = o.fee != null ? formatCurrency(o.fee) : 'A consultar';
      return `Pedido ${i + 1}: ${o.client_name}\n${o.address}\n${o.neighborhood} — ${o.city}\nTaxa: ${fee} | ${PAYMENT_LABELS[o.payment_method] ?? o.payment_method}\nContato: ${o.client_whatsapp}${o.notes ? `\n${o.notes}` : ''}`;
    }).join('\n\n');
    const total = openOrders.reduce((s, o) => s + (o.fee ?? 0), 0);
    const text = `LISTA DE PEDIDOS — ${storeName}\n${dateLabel}\n${'─'.repeat(30)}\n\n${lines}\n\n${'─'.repeat(30)}\nTotal: ${openOrders.length} pedido(s)\nTotal taxas: ${formatCurrency(total)}`;
    const whatsappWindow = window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank');
    const { error } = await supabase
      .from('orders')
      .update({ sent_to_giroloc: true })
      .eq('store_id', user?.id)
      .in('id', openOrders.map(order => order.id));
    if (error) {
      setSendFeedback('A lista foi aberta no WhatsApp, mas não conseguimos registrar o envio. Atualize e tente novamente.');
      whatsappWindow?.close();
      return;
    }
    setOrders(previous => previous.map(order => openOrders.some(openOrder => openOrder.id === order.id)
      ? { ...order, sent_to_giroloc: true }
      : order
    ));
    setSendFeedback('Lista enviada! Ela ficará aberta até a GiroLoc confirmar a coleta.');
  }

  function contactDriver() {
    const msg = encodeURIComponent('Olá! Preciso falar sobre uma entrega. Segue minha localização:');
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, '_blank');
  }

  const openOrders = orders.filter(order => !order.collected_at);
  const closedOrders = orders.filter(order => Boolean(order.collected_at));
  const pendingCount = openOrders.filter(o => o.status === 'pendente').length;
  const totalFee = orders.reduce((s, o) => s + (o.fee ?? 0), 0);

  return (
    <div className="min-h-screen bg-purple-50 dark:bg-gray-950 transition-colors duration-300">
      <Header storeName={profile?.store_name ?? undefined} />
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-rounded font-extrabold text-4xl text-purple-700 dark:text-purple-300 leading-tight">{profile?.store_name ?? 'Minha Loja'}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Painel da Loja</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={contactDriver} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm shadow-md transition shadow-green-600/20">
              <MessageCircle size={16} /> Falar com o Entregador
            </button>
            <button onClick={() => setShowPriceTable(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium text-sm transition-all shadow-sm">
              <Table2 size={16} /> Tabela de Preços
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 w-fit shadow-sm">
          {([
            ['hoje', 'Pedidos de Hoje (aberto)', ClipboardList],
            ['historico', 'Histórico', Calendar],
          ] as const).map(([t, label, Icon]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? 'bg-purple-700 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {tab === 'hoje' && <CutoffBanner />}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pedidos', value: orders.length, color: 'text-purple-700 dark:text-purple-300' },
            { label: 'Pendentes', value: pendingCount, color: 'text-yellow-700 dark:text-yellow-400' },
            { label: 'Total Taxas', value: formatCurrency(totalFee), color: 'text-green-700 dark:text-green-400', sm: true },
          ].map(c => (
            <div key={c.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3.5 transition-colors duration-300">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{c.label}</p>
              <p className={`font-bold ${c.color} ${c.sm ? 'text-base' : 'text-2xl'}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {tab === 'hoje' && <OrderForm onCreated={fetchOrders} />}

        {/* Orders list */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Package size={17} className="text-purple-700 dark:text-purple-300" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {tab === 'hoje' ? 'Pedidos de Hoje (aberto)' : 'Histórico de Pedidos'}
              </h3>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{tab === 'hoje' ? openOrders.length : orders.length}</span>
            </div>
            {tab === 'historico' ? (
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-gray-400" />
                <input type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-700" />
                <span className="text-xs text-gray-400">até</span>
                <input type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-700" />
                <button onClick={fetchOrders} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"><RefreshCw size={14} /></button>
              </div>
            ) : (
              <button onClick={fetchOrders} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-800 transition"><RefreshCw size={14} /></button>
            )}
          </div>
          {loading ? <LoadingSpinner /> : tab === 'historico' ? (
            orders.length === 0 ? <EmptyOrders message="Nenhum pedido neste período." /> : <OrderRows orders={orders} onDelete={deleteOrder} deletingId={deletingId} showDelete={false} />
          ) : (
            openOrders.length === 0 ? <EmptyOrders message="Nenhum pedido aberto hoje." hint="Cadastre um pedido ou confira os pedidos fechados abaixo." /> : <OrderRows orders={openOrders} onDelete={deleteOrder} deletingId={deletingId} showDelete />
          )}
        </div>

        {tab === 'hoje' && closedOrders.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <CheckCircle2 size={17} className="text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Pedidos de Hoje (Fechados)</h3>
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">{closedOrders.length}</span>
            </div>
            <OrderRows orders={closedOrders} onDelete={deleteOrder} deletingId={deletingId} showDelete={false} />
          </div>
        )}

        {tab === 'hoje' && openOrders.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors duration-300">
            <div className="flex-1">
              <p className="font-semibold text-green-800 dark:text-green-300 text-sm">Pronto para fechar o caixa?</p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">Envie a lista dos {openOrders.length} pedido(s) abertos para a GiroLoc pelo WhatsApp.</p>
              {sendFeedback && <p className="text-xs font-semibold text-green-800 dark:text-green-300 mt-2">{sendFeedback}</p>}
            </div>
            <button onClick={sendToAdmin} disabled={openOrders.every(order => order.sent_to_giroloc)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-md whitespace-nowrap">
              <MessageSquare size={17} /> {openOrders.every(order => order.sent_to_giroloc) ? 'Lista enviada!' : 'Enviar Lista para GiroLoc'}
            </button>
          </div>
        )}

        {tab === 'historico' && <OrderAnalytics orders={orders} title="Seus pedidos no período" />}
      </div>
      {showPriceTable && <PriceTableModal onClose={() => setShowPriceTable(false)} />}
    </div>
  );
}

interface OrderRowsProps {
  orders: Order[];
  onDelete: (id: string) => void;
  deletingId: string | null;
  showDelete: boolean;
}

function OrderRows({ orders, onDelete, deletingId, showDelete }: OrderRowsProps) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {orders.map((order, index) => (
        <div key={order.id} className="px-5 py-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
          <span className="shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center mt-0.5">{index + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{order.client_name}</p>
              <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">{order.address}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
              <span className="text-gray-400 dark:text-gray-500">{order.neighborhood} · {order.city}</span>
              <span className="font-medium text-purple-700 dark:text-purple-300">{order.fee != null ? formatCurrency(order.fee) : 'A consultar'}</span>
              <span className="text-gray-400">{PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</span>
            </div>
            {order.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">{order.notes}</p>}
            {order.sent_to_giroloc && <p className="text-xs text-green-700 dark:text-green-400 mt-1 font-medium">Lista enviada!</p>}
            {order.received_by && <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Recebido por: {order.received_by}</p>}
          </div>
          {showDelete && (
            <button onClick={() => onDelete(order.id)} disabled={deletingId === order.id || order.status !== 'pendente' || order.sent_to_giroloc} title={order.sent_to_giroloc ? 'Pedidos enviados não podem ser removidos' : order.status !== 'pendente' ? 'Apenas pedidos pendentes podem ser removidos' : 'Remover pedido'} className="shrink-0 p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyOrders({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="text-center py-12 text-gray-400 dark:text-gray-600">
      <Package size={40} className="mx-auto mb-3 opacity-30" />
      <p className="text-sm font-medium">{message}</p>
      {hint && <p className="text-xs mt-1">{hint}</p>}
    </div>
  );
}
