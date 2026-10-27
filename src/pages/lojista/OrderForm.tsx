import { useState, FormEvent, type ReactNode } from 'react';
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CITIES, City, neighborhoods, formatCurrency } from '@/lib/pricing';

const PAYMENT_OPTIONS = [
  { value: 'pago_loja', label: 'Pago na Loja' },
  { value: 'receber_loja', label: 'A Receber na Loja' },
] as const;

const empty = {
  client_name: '',
  client_whatsapp: '',
  address: '',
  city: '' as City | '',
  neighborhood: '',
  payment_method: 'pago_loja',
  notes: '',
};

interface OrderFormProps {
  onCreated: () => void;
}

export default function OrderForm({ onCreated }: OrderFormProps) {
  const { user, profile } = useAuth();
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cityNeighborhoods = form.city
    ? neighborhoods.filter(neighborhood => neighborhood.city === form.city)
    : [];
  const selectedNeighborhood = cityNeighborhoods.find(neighborhood => neighborhood.label === form.neighborhood);

  function setField<Key extends keyof typeof empty>(key: Key, value: (typeof empty)[Key]) {
    setForm(previous => ({ ...previous, [key]: value }));
    setError('');
    setSuccess('');
  }

  function setCity(city: City | '') {
    setForm(previous => ({ ...previous, city, neighborhood: '' }));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!user || !profile) return;
    if (!form.client_name.trim()) { setError('Informe o nome do cliente.'); return; }
    if (!form.client_whatsapp.trim()) { setError('Informe o WhatsApp do cliente.'); return; }
    if (!form.address.trim()) { setError('Informe o endereço completo.'); return; }
    if (!form.city) { setError('Selecione a cidade de entrega.'); return; }
    if (!selectedNeighborhood) { setError('Selecione o bairro de entrega.'); return; }

    setSubmitting(true);
    const { error: dbError } = await supabase.from('orders').insert({
      store_id: user.id,
      store_name: profile.store_name ?? profile.email,
      client_name: form.client_name.trim(),
      client_whatsapp: form.client_whatsapp.trim(),
      address: form.address.trim(),
      neighborhood: selectedNeighborhood.label,
      city: form.city,
      fee: selectedNeighborhood.fee,
      payment_method: form.payment_method,
      floripa_distance_km: null,
      notes: form.notes.trim() || null,
      status: 'pendente',
    });

    setSubmitting(false);
    if (dbError) {
      setError('Erro ao salvar pedido: ' + dbError.message);
      return;
    }
    setSuccess('Pedido criado com sucesso!');
    setForm(empty);
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center gap-2 mb-5">
        <Plus size={18} className="text-purple-700 dark:text-purple-300" />
        <h2 className="font-bold text-gray-900 dark:text-white">Novo Pedido</h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5 mb-4">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2.5 mb-4">
          <CheckCircle2 size={15} className="shrink-0" /> {success}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nome do Cliente">
          <input required type="text" value={form.client_name} onChange={event => setField('client_name', event.target.value)} placeholder="Ex: Maria da Silva" className={inputClass} />
        </Field>
        <Field label="WhatsApp do Cliente">
          <input required type="tel" value={form.client_whatsapp} onChange={event => setField('client_whatsapp', event.target.value)} placeholder="(48) 99999-9999" className={inputClass} />
        </Field>
        <Field label="Endereço Completo com Referência" className="sm:col-span-2">
          <input required type="text" value={form.address} onChange={event => setField('address', event.target.value)} placeholder="Rua, número, complemento, ponto de referência" className={inputClass} />
        </Field>
        <Field label="Cidade">
          <select required value={form.city} onChange={event => setCity(event.target.value as City | '')} className={inputClass}>
            <option value="">Selecione a cidade…</option>
            {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </Field>
        <Field label="Bairro">
          <select required disabled={!form.city} value={form.neighborhood} onChange={event => setField('neighborhood', event.target.value)} className={`${inputClass} disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800/70`}>
            <option value="">{form.city ? 'Selecione o bairro…' : 'Escolha a cidade primeiro'}</option>
            {cityNeighborhoods.map((neighborhood, index) => <option key={`${neighborhood.label}-${index}`} value={neighborhood.label}>{neighborhood.label}</option>)}
          </select>
        </Field>
        <Field label="Taxa de Entrega">
          <div className={`${inputClass} flex items-center bg-gray-50 dark:bg-gray-800`}>
            <span className="font-bold text-purple-700 dark:text-purple-300">{selectedNeighborhood ? formatCurrency(selectedNeighborhood.fee) : 'Selecione cidade e bairro'}</span>
          </div>
        </Field>
        <Field label="Forma de Pagamento">
          <select value={form.payment_method} onChange={event => setField('payment_method', event.target.value)} className={inputClass}>
            {PAYMENT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </Field>
        <Field label="Observações / Complemento (opcional)">
          <input type="text" value={form.notes} onChange={event => setField('notes', event.target.value)} placeholder="Ex: Apartamento 3, interfone 302..." className={inputClass} />
        </Field>
      </div>

      <div className="mt-5 flex justify-end">
        <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-60 text-white font-semibold transition-all duration-200">
          {submitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={17} />}
          Cadastrar Pedido
        </button>
      </div>
    </form>
  );
}

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-1.5 ${className}`}><label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>{children}</div>;
}

const inputClass = 'w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700 transition';
