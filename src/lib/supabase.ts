import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Variáveis do Supabase ausentes. Verifique se o arquivo .env contém VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. ' +
    'Se o servidor já estava rodando, reinicie-o para recarregar as variáveis.'
  );
}

export const supabase = createClient(supabaseUrl ?? 'https://placeholder.supabase.co', supabaseAnonKey ?? 'placeholder-anon-key');

export type Role = 'admin' | 'lojista';

export interface Profile {
  id: string;
  email: string;
  role: Role;
  store_name: string | null;
  active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  store_id: string;
  store_name: string;
  client_name: string;
  client_whatsapp: string;
  address: string;
  neighborhood: string;
  city: string;
  fee: number | null;
  payment_method: 'pago_loja' | 'receber_loja';
  status: 'pendente' | 'em_rota' | 'entregue' | 'nao_entregue';
  received_by: string | null;
  floripa_distance_km: number | null;
  notes: string | null;
  created_at: string;
}
