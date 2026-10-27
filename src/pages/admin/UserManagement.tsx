import { useState, useEffect } from 'react';
import { Plus, UserX, UserCheck, X, AlertCircle, Store, RefreshCw, KeyRound } from 'lucide-react';
import { supabase, Profile } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ store_name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [pwModalUser, setPwModalUser] = useState<Profile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  async function fetchProfiles() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setProfiles(data as Profile[]);
    setLoading(false);
  }

  useEffect(() => { fetchProfiles(); }, []);

  async function createStore() {
    setFormError('');
    setFormSuccess('');
    if (!form.store_name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError('Preencha todos os campos.');
      return;
    }
    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-store-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          store_name: form.store_name.trim(),
        }),
      }
    );
    const json = await res.json();
    setCreating(false);
    if (!res.ok || json.error) {
      setFormError(json.error ?? 'Erro ao criar a loja.');
      return;
    }
    setFormSuccess(`Loja "${form.store_name}" criada com sucesso!`);
    setForm({ store_name: '', email: '', password: '' });
    fetchProfiles();
  }

  async function toggleActive(p: Profile) {
    await supabase.from('profiles').update({ active: !p.active }).eq('id', p.id);
    setProfiles(prev => prev.map(x => x.id === p.id ? { ...x, active: !x.active } : x));
  }

  async function updatePassword() {
    if (!pwModalUser) return;
    setPwError('');
    setPwSuccess('');
    if (!newPassword.trim()) {
      setPwError('Digite a nova senha.');
      return;
    }
    setPwSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          user_id: pwModalUser.id,
          password: newPassword,
        }),
      }
    );
    const json = await res.json();
    setPwSaving(false);
    if (!res.ok || json.error) {
      setPwError(json.error ?? 'Erro ao alterar a senha.');
      return;
    }
    setPwSuccess('Senha alterada com sucesso!');
    setNewPassword('');
    setTimeout(() => {
      setPwModalUser(null);
      setPwSuccess('');
    }, 1500);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Gestão de Lojas</h2>
        <div className="flex gap-2">
          <button onClick={fetchProfiles} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition">
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => { setShowForm(v => !v); setFormError(''); setFormSuccess(''); }}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white transition"
          >
            <Plus size={15} />
            Nova Loja
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Cadastrar Nova Loja</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          {formError && (
            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5 mb-4">
              <AlertCircle size={15} /> {formError}
            </div>
          )}
          {formSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2.5 mb-4">
              ✓ {formSuccess}
            </div>
          )}
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {[
              { key: 'store_name', label: 'Nome da Loja', type: 'text', placeholder: 'Ex: Boutique da Maria' },
              { key: 'email', label: 'E-mail', type: 'email', placeholder: 'loja@email.com' },
              { key: 'password', label: 'Senha', type: 'password', placeholder: 'Nova senha' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">{f.label}</label>
                <input
                  type={f.type}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700"
                />
              </div>
            ))}
          </div>
          <button
            onClick={createStore}
            disabled={creating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-600 disabled:opacity-60 text-white text-sm font-semibold transition"
          >
            {creating ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={15} />}
            Criar Loja
          </button>
        </div>
      )}

      {loading ? <LoadingSpinner /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {profiles.map(p => (
            <div key={p.id} className={`bg-white dark:bg-gray-900 rounded-xl border ${p.active ? 'border-gray-200 dark:border-gray-800' : 'border-red-200 dark:border-red-900 opacity-70'} p-4`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Store size={15} className="text-purple-700 dark:text-purple-300 shrink-0" />
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {p.store_name ?? p.email}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-5">{p.email}</p>
                  <div className="flex items-center gap-2 mt-2 ml-5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {p.role === 'admin' ? 'Admin' : 'Lojista'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <button
                    onClick={() => { setPwModalUser(p); setNewPassword(''); setPwError(''); setPwSuccess(''); }}
                    title="Alterar senha"
                    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                  >
                    <KeyRound size={17} />
                  </button>
                  {p.role !== 'admin' && (
                    <button
                      onClick={() => toggleActive(p)}
                      title={p.active ? 'Desativar conta' : 'Reativar conta'}
                      className={`p-2 rounded-lg transition ${
                        p.active
                          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      {p.active ? <UserX size={17} /> : <UserCheck size={17} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Password change modal */}
      {pwModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setPwModalUser(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">Alterar Senha</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{pwModalUser.store_name ?? pwModalUser.email}</p>
              </div>
              <button onClick={() => setPwModalUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            {pwError && (
              <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5 mb-3">
                <AlertCircle size={15} /> {pwError}
              </div>
            )}
            {pwSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2.5 mb-3">
                ✓ {pwSuccess}
              </div>
            )}
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nova Senha
              </label>
              <input
                type="password"
                autoFocus
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700"
                onKeyDown={e => e.key === 'Enter' && updatePassword()}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPwModalUser(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={updatePassword}
                disabled={pwSaving}
                className="flex-1 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-600 disabled:opacity-60 text-white text-sm font-medium transition flex items-center justify-center gap-2"
              >
                {pwSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <KeyRound size={16} />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
