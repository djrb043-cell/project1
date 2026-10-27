import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import Login from '@/pages/Login';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import LojistaDashboard from '@/pages/lojista/LojistaDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';

function AppRouter() {
  const { session, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner fullscreen />;
  if (!session || !profile) return <Login />;
  if (!profile.active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50 dark:bg-gray-950 px-4 transition-colors duration-300">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⛔</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Conta desativada</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Sua conta foi desativada pelo administrador. Entre em contato com a GiroLoc para reativação.
          </p>
          <button
            onClick={() => { supabase.auth.signOut(); }}
            className="px-5 py-2.5 rounded-lg bg-purple-700 text-white text-sm font-medium hover:bg-purple-600 transition"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return profile.role === 'admin' ? <AdminDashboard /> : <LojistaDashboard />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}
