import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="p-2 rounded-full bg-black/10 dark:bg-purple-700 hover:bg-black/20 dark:hover:bg-purple-600 transition-colors text-gray-700 dark:text-white"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
