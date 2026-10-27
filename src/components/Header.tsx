import ThemeToggle from '@/components/ThemeToggle';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  storeName?: string | null;
}

export default function Header({ storeName }: HeaderProps) {
  const { signOut, profile } = useAuth();

  return (
    <header className="bg-purple-700 dark:bg-purple-900 text-white shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 min-h-20 flex items-center justify-between gap-3 relative">
        <div className="min-w-0 max-w-[34%]">
          {storeName && <span className="hidden sm:inline text-purple-100 text-sm truncate">{storeName}</span>}
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <img
            src="/assets/Logo_GiroLoc_com_Emblema_de_Movimento.png"
            alt="GiroLoc"
            className="h-16 sm:h-20 w-auto object-contain brightness-0 invert drop-shadow-md"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {profile && <span className="hidden md:inline text-xs bg-purple-600 dark:bg-purple-800 px-2.5 py-1 rounded-full font-medium uppercase tracking-wide">{profile.role === 'admin' ? 'Admin' : 'Loja'}</span>}
          <ThemeToggle />
          <button onClick={signOut} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-purple-600 dark:bg-purple-800 hover:bg-purple-500 dark:hover:bg-purple-700 transition-colors">
            <LogOut size={15} /><span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
