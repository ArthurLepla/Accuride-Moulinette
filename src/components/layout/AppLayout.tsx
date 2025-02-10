import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useProfile } from '@/contexts/ProfileContext';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { profileColor } = useProfile();

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

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      {/* Main Content */}
      <div className={`lg:ml-64 transition-all duration-200 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header accent line */}
        <div className={`h-1 bg-gradient-to-r ${getThemeColors()}`} />
        
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 