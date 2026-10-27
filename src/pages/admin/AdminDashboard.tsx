import { useState, useEffect, useCallback } from 'react';
import {
  Users, Package, Download, RefreshCw, Plus, Search,
  MessageCircle, Navigation, CheckCircle2, X, AlertCircle,
  ChevronDown, Filter, Trash2, PhoneCall
} from 'lucide-react';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase, Order, Profile } from '@/lib/supabase';
import {
  formatCurrency, PAYMENT_LABELS, STATUS_LABELS, STATUS_COLORS
} from '@/lib/pricing';
import { useAuth } from '@/contexts/AuthContext';
import UserManagement from './UserManagement';
import OrderAnalytics from '@/components/OrderAnalytics';

type Tab = 'orders' | 'users';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<string>(todayISO());
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [deliveryModal, setDeliveryModal] = useState<Order | null>(null);
  const [receivedBy, setReceivedBy] = useState('');
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('orders').select('*').order('created_at', { ascending: true });
    if (filterDate) {
      q = q
        .gte('created_at', `${filterDate}T00:00:00`)
        .lte('created_at', `${filterDate}T23:59:59`);
    }
    if (filterStatus) q = q.eq('status', filterStatus);
    const { data, error } = await q;
    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  }, [filterDate, filterStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter(o =>
    !search ||
    o.client_name.toLowerCase().includes(search.toLowerCase()) ||
    o.address.toLowerCase().includes(search.toLowerCase()) ||
    o.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
    o.store_name.toLowerCase().includes(search.toLowerCase())
  );

  function exportCSV() {
    const header = [
      'Numero do Pedido',
      'Nome da Loja',
      'Endereço',
      'Complemento',
      'Bairro',
      'Cidade',
      'Estado',
    ];
    const rows = filtered.map(o => [
      o.id.slice(0, 8),
      o.store_name,
      o.address,
      o.notes ?? '',
      o.neighborhood,
      o.city,
      'Santa Catarina',
    ]);
    const csv = [header, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';'))
      .join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `giroloc-${filterDate || 'todos'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function whatsappLink(order: Order) {
    const num = order.client_whatsapp.replace(/\D/g, '');
    const full = num.startsWith('55') ? num : `55${num}`;
    const msg = encodeURIComponent(`Olá ${order.client_name}! Sou da GiroLoc, estou a caminho para entregar seu pedido no endereço: ${order.address}.`);
    return `https://wa.me/${full}?text=${msg}`;
  }

  function mapsLink(order: Order) {
    const q = encodeURIComponent(`${order.address}, ${order.neighborhood}, ${order.city}`);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }

  function wazeLink(order: Order) {
    const q = encodeURIComponent(`${order.address}, ${order.neighborhood}, ${order.city}`);
    return `https://waze.com/ul?q=${q}&navigate=yes`;
  }

  function openDeliveryModal(order: Order) {
    setDeliveryModal(order);
    setReceivedBy('');
    setDeliveryError('');
  }

  async function confirmDelivery() {
    if (!deliveryModal) return;
    if (!receivedBy.trim()) {
      setDeliveryError('Informe quem recebeu ou onde foi deixado.');
      return;
    }
    setSavingDelivery(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: 'entregue', received_by: receivedBy.trim() })
      .eq('id', deliveryModal.id);
    setSavingDelivery(false);
    if (error) {
      setDeliveryError('Erro ao salvar. Tente novamente.');
      return;
    }
    setOrders(prev => prev.map(o => o.id === deliveryModal.id ? { ...o, status: 'entregue', received_by: receivedBy } : o));
    setDeliveryModal(null);
  }

  async function updateStatus(orderId: string, status: Order['status']) {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }

  const summary = {
    total: filtered.length,
    pendente: filtered.filter(o => o.status === 'pendente').length,
    em_rota: filtered.filter(o => o.status === 'em_rota').length,
    entregue: filtered.filter(o => o.status === 'entregue').length,
    receita: filtered.reduce((s, o) => s + (o.fee ?? 0), 0),
  };

  return (
    <div className="min-h-screen bg-purple-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Painel do Administrador</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Cockpit operacional GiroLoc</p>
        </div>
        <button
          onClick={() => setTab('users')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-sm font-semibold shadow-sm transition"
        >
          <Plus size={16} />
          Adicionar Loja
        </button>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 w-fit">
          {([['orders', 'Pedidos', Package], ['users', 'Lojas / Usuários', Users]] as const).map(([t, label, Icon]) => (
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

        {tab === 'users' && <UserManagement />}

        {tab === 'orders' && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total', value: summary.total, color: 'text-purple-700 dark:text-purple-300' },
                { label: 'Pendentes', value: summary.pendente, color: 'text-yellow-700 dark:text-yellow-400' },
                { label: 'Em Rota', value: summary.em_rota, color: 'text-blue-700 dark:text-blue-400' },
                { label: 'Entregues', value: summary.entregue, color: 'text-green-700 dark:text-green-400' },
              ].map(c => (
                <div key={c.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{c.label}</p>
                  <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* Receita card */}
            <div className="bg-purple-700 dark:bg-purple-900 text-white rounded-xl p-4 mb-6 flex items-center justify-between transition-colors duration-300">
              <div>
                <p className="text-purple-200 text-sm">Receita do Período</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.receita)}</p>
              </div>
              <Package size={36} className="text-purple-400 opacity-60" />
            </div>

            {/* Charts */}
            <div className="mb-6">
              <OrderAnalytics orders={filtered} title="Visão Geral de Entregas" />
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-48">
                <Filter size={16} className="text-gray-400 shrink-0" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  className="flex-1 text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-700"
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-700"
              >
                <option value="">Todos os status</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <div className="flex items-center gap-2 flex-1 min-w-48">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar cliente, endereço…"
                  className="flex-1 text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700"
                />
              </div>
              <button onClick={fetchOrders} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition">
                <RefreshCw size={15} />
                Atualizar
              </button>
              <button onClick={exportCSV} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white transition">
                <Download size={15} />
                Exportar XLSX
              </button>
            </div>

            {/* Orders list */}
            {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-600">
                <Package size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">Nenhum pedido encontrado</p>
                <p className="text-sm mt-1">Ajuste os filtros acima.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onDeliveryCheck={() => openDeliveryModal(order)}
                    onStatusChange={updateStatus}
                    whatsappLink={whatsappLink(order)}
                    mapsLink={mapsLink(order)}
                    wazeLink={wazeLink(order)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delivery confirmation modal */}
      {deliveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">Confirmar Entrega</h2>
              <button onClick={() => setDeliveryModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              <strong className="text-gray-900 dark:text-white">{deliveryModal.client_name}</strong>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">{deliveryModal.address}</p>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quem recebeu / Onde foi deixado?
              </label>
              <input
                type="text"
                autoFocus
                value={receivedBy}
                onChange={e => setReceivedBy(e.target.value)}
                placeholder="Ex: Portaria, João da Silva, Vizinho…"
                className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700"
                onKeyDown={e => e.key === 'Enter' && confirmDelivery()}
              />
              {deliveryError && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle size={13} /> {deliveryError}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeliveryModal(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelivery}
                disabled={savingDelivery}
                className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white text-sm font-medium transition flex items-center justify-center gap-2"
              >
                {savingDelivery ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={16} />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onDeliveryCheck: () => void;
  onStatusChange: (id: string, status: Order['status']) => void;
  whatsappLink: string;
  mapsLink: string;
  wazeLink: string;
}

function OrderCard({ order, onDeliveryCheck, onStatusChange, whatsappLink, mapsLink, wazeLink }: OrderCardProps) {
  const [showStatus, setShowStatus] = useState(false);
  const timeStr = new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
      {/* Card header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate">{order.client_name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{order.store_name} · {timeStr}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 py-3 flex flex-col gap-1.5 text-sm">
        <p className="text-gray-700 dark:text-gray-300 leading-snug">{order.address}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{order.neighborhood}</span>
          <span>·</span>
          <span>{order.city}</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="font-semibold text-purple-700 dark:text-purple-300">
            {order.fee != null ? formatCurrency(order.fee) : 'A consultar'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{PAYMENT_LABELS[order.payment_method]}</span>
        </div>
        {order.received_by && (
          <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1">
            <CheckCircle2 size={12} /> Recebido por: {order.received_by}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex flex-wrap gap-2">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition border border-green-200 dark:border-green-800 font-medium"
        >
          <MessageCircle size={14} /> WhatsApp
        </a>
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition border border-blue-200 dark:border-blue-800 font-medium"
        >
          <Navigation size={14} /> Maps
        </a>
        <a
          href={wazeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition border border-sky-200 dark:border-sky-800 font-medium"
        >
          <Navigation size={14} /> Waze
        </a>
        {order.status !== 'entregue' && (
          <button
            onClick={onDeliveryCheck}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition border border-purple-200 dark:border-purple-800 font-medium"
          >
            <CheckCircle2 size={14} /> Entregue
          </button>
        )}
        {/* Quick status dropdown */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowStatus(v => !v)}
            className="flex items-center gap-1 text-xs px-2 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ChevronDown size={14} />
          </button>
          {showStatus && (
            <div className="absolute right-0 bottom-full mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-36 overflow-hidden">
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => { onStatusChange(order.id, k as Order['status']); setShowStatus(false); }}
                  className={`w-full text-left text-xs px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${order.status === k ? 'font-semibold text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
