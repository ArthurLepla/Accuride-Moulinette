import { useState, ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useProfile } from '@/contexts/ProfileContext';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { profileColor } = useProfile();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Nécessaire car next-themes ne fonctionne pas pendant l'hydratation
  useEffect(() => {
    setMounted(true);
    // Force le thème clair par défaut si aucun thème n'est défini
    if (!theme) {
      setTheme('light');
    }
  }, [theme, setTheme]);

  // Fonction pour obtenir les couleurs du thème en fonction du profil
  const getThemeColors = () => {
    switch (profileColor) {
      case 'blue':
        return 'from-blue-500 to-blue-600';
      case 'green':
        return 'from-green-500 to-green-600';
      case 'purple':
        return 'from-purple-500 to-purple-600';
      case 'red':
        return 'from-red-500 to-red-600';
      case 'yellow':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    console.log('Current theme:', theme);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Switching to theme:', newTheme);
    setTheme(newTheme);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      {/* Main Content */}
      <div className={`lg:ml-64 transition-all duration-200 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header accent line */}
        <div className={`h-1 bg-gradient-to-r ${getThemeColors()}`} />
        
        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="bg-background border-border hover:bg-accent"
            aria-label="Basculer entre le thème clair et sombre"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Basculer le thème</span>
          </Button>
        </div>
        
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 