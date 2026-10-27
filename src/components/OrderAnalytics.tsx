import { BarChart3 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Order } from '@/lib/supabase';
import { formatCurrency } from '@/lib/pricing';

interface OrderAnalyticsProps {
  orders: Order[];
  title?: string;
}

export default function OrderAnalytics({ orders, title = 'Desempenho no período' }: OrderAnalyticsProps) {
  const grouped = orders.reduce<Record<string, { date: string; entregas: number; receita: number }>>((result, order) => {
    const key = order.created_at.slice(0, 10);
    const current = result[key] ?? { date: key, entregas: 0, receita: 0 };
    current.entregas += 1;
    current.receita += order.fee ?? 0;
    result[key] = current;
    return result;
  }, {});

  const data = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)).map(item => ({
    ...item,
    label: new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  }));

  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 size={18} className="text-purple-800 dark:text-purple-400" />
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Entregas e receita por dia</p>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-600 py-8 text-center">Ainda não há dados para exibir.</p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [String(value), 'Pedidos']} />
                <Bar dataKey="entregas" fill="#7c4dc0" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={value => `R$${value}`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Receita']} />
                <Line type="monotone" dataKey="receita" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
