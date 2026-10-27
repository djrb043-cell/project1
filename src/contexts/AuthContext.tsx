import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signIn: async () => null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(uid: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (!error && data) setProfile(data as Profile);
    else setProfile(null);
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  useEffect(() => {
    // Verificar se existe um login ativo salvo no localStorage (para a nossa autenticação direta)
    const savedProfile = localStorage.getItem('giroloc_custom_profile');
    if (savedProfile) {
      try {
        const p = JSON.parse(savedProfile) as Profile;
        setProfile(p);
        setUser({ id: p.id, email: p.email } as User);
        setSession({ user: { id: p.id, email: p.email } } as unknown as Session);
      } catch (e) {
        localStorage.removeItem('giroloc_custom_profile');
      }
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s?.user) {
        setSession(s);
        setUser(s?.user ?? null);
        fetchProfile(s.user.id).finally(() => setLoading(false));
      } else if (!savedProfile) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      (async () => {
        if (s?.user) {
          setSession(s);
          setUser(s?.user ?? null);
          await fetchProfile(s.user.id);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string): Promise<string | null> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Tentar login normal pelo Supabase Auth (caso seja o Admin principal)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (!authError && authData.session) {
      return null;
    }

    // 2. Se falhar no Auth, procurar diretamente na tabela `profiles` (para as lojas criadas pelo painel)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (profileError || !profileData) {
      return 'E-mail ou senha incorretos. Verifique seus dados.';
    }

    // Verificar se a senha confere
    if ((profileData as any).password !== password) {
      return 'E-mail ou senha incorretos. Verifique seus dados.';
    }

    // Verificar se a conta está ativa
    if (profileData.active === false) {
      return 'Esta conta está desativada.';
    }

    // Login bem-sucedido via profiles: salvar no localStorage e atualizar o estado
    localStorage.setItem('giroloc_custom_profile', JSON.stringify(profileData));
    setProfile(profileData as Profile);
    setUser({ id: profileData.id, email: profileData.email } as User);
    setSession({ user: { id: profileData.id, email: profileData.email } } as unknown as Session);

    return null;
  }

  async function signOut() {
    localStorage.removeItem('giroloc_custom_profile');
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);