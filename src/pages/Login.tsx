import { useState, FormEvent } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

export default function Login() {
  const { signIn } = useAuth();
  useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [bootstrapPassword, setBootstrapPassword] = useState('');
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [bootstrapError, setBootstrapError] = useState('');
  const [bootstrapSuccess, setBootstrapSuccess] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await signIn(email, password);
    setLoading(false);
    if (err) setError('E-mail ou senha incorretos. Verifique seus dados.');
  }

  async function handleBootstrap(e: FormEvent) {
    e.preventDefault();
    setBootstrapError('');
    setBootstrapSuccess('');
    if (bootstrapPassword.length < 8) {
      setBootstrapError('Use uma senha com pelo menos 8 caracteres.');
      return;
    }
    setBootstrapLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bootstrap-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'robsonjds1003@gmail.com', password: bootstrapPassword }),
      });
      const result = await response.json() as { error?: string; success?: boolean };
      if (!response.ok || !result.success) {
        setBootstrapError(result.error ?? 'Não foi possível criar a conta.');
        return;
      }
      setEmail('robsonjds1003@gmail.com');
      setPassword(bootstrapPassword);
      setBootstrapPassword('');
      setBootstrapSuccess('Conta criada. Agora você pode entrar com sua senha.');
    } catch {
      setBootstrapError('Não foi possível conectar ao serviço de cadastro.');
    } finally {
      setBootstrapLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Top bar for theme toggle */}
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300">
            {/* Purple header strip with logo */}
            <div className="bg-purple-700 dark:bg-purple-900 px-8 py-10 flex flex-col items-center gap-4 relative">
              <div className="flex items-center justify-center">
                <img
                  src="/assets/Logo_GiroLoc_com_Emblema_de_Movimento.png"
                  alt="GiroLoc"
                  className="h-20 w-auto object-contain brightness-0 invert drop-shadow-lg"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement)!.classList.remove('hidden');
                  }}
                />
                <div className="hidden items-center gap-2 text-white">
                  <span className="font-rounded font-extrabold text-4xl tracking-tight text-white drop-shadow-md">
                    GiroLoc
                  </span>
                </div>
              </div>
              <p className="text-purple-100 text-sm text-center">
                Plataforma de Entregas Locais
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-8 flex flex-col gap-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Entrar</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Acesse sua conta GiroLoc
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-800 transition"
                  placeholder="seuemail@exemplo.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 pr-11 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-800 transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-1"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando…
                  </>
                ) : 'Entrar'}
              </button>

                  <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-2">
                Não possui conta? Solicite ao administrador.
              </p>

              <button type="button" onClick={() => { setShowBootstrap(v => !v); setBootstrapError(''); setBootstrapSuccess(''); }} className="text-xs text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-200 font-medium transition">
                Primeiro acesso administrativo
              </button>

              {showBootstrap && (
                <form onSubmit={handleBootstrap} className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Criar conta de administrador</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cadastro temporário para o primeiro acesso.</p>
                  </div>
                  <input value="robsonjds1003@gmail.com" readOnly className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300" />
                  <input type="password" required minLength={8} value={bootstrapPassword} onChange={e => setBootstrapPassword(e.target.value)} placeholder="Crie uma senha" className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-800" />
                  {bootstrapError && <p className="text-xs text-red-700 dark:text-red-400">{bootstrapError}</p>}
                  {bootstrapSuccess && <p className="text-xs text-green-700 dark:text-green-400">{bootstrapSuccess}</p>}
                  <button type="submit" disabled={bootstrapLoading} className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition">
                    {bootstrapLoading ? 'Criando conta…' : 'Criar conta'}
                  </button>
                </form>
              )}
            </form>
          </div>

          <p className="text-center text-purple-400 dark:text-purple-500 text-xs mt-6 opacity-70">
            © {new Date().getFullYear()} GiroLoc · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
