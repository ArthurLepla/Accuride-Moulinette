import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  FileInput, 
  GitBranch, 
  Code2, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, profileColor, logout } = useProfile();

  const menuItems = [
    {
      title: 'Tableau de bord',
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/dashboard',
      current: pathname === '/dashboard'
    },
    {
      title: 'Import Hiérarchique',
      icon: <FileInput className="w-5 h-5" />,
      href: '/flexible-import',
      current: pathname === '/flexible-import'
    },
    {
      title: 'Générateur Mendix',
      icon: <Code2 className="w-5 h-5" />,
      href: '/mendix-generator',
      current: pathname === '/mendix-generator'
    },
    {
      title: 'Visualisation',
      icon: <GitBranch className="w-5 h-5" />,
      href: '/charts',
      current: pathname === '/charts'
    }
  ];

  // Fonction pour obtenir les couleurs du thème en fonction du profil
  const getThemeColors = () => {
    switch (profileColor) {
      case 'blue':
        return 'from-blue-600 to-blue-700';
      case 'green':
        return 'from-green-600 to-green-700';
      case 'purple':
        return 'from-purple-600 to-purple-700';
      case 'red':
        return 'from-red-600 to-red-700';
      case 'yellow':
        return 'from-yellow-600 to-yellow-700';
      default:
        return 'from-blue-600 to-blue-700';
    }
  };

  return (
    <>
      {/* Sidebar Mobile Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 border-r border-gray-800`}>
        <div className="flex flex-col h-full">
          {/* En-tête avec profil */}
          <div className={`bg-gradient-to-r ${getThemeColors()} p-6`}>
            {profile && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/20">
                  <Image
                    src={profile.avatar}
                    alt={`Avatar de ${profile.name}`}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-white font-bold">{profile.name}</h2>
                  <p className="text-sm text-white/80">Smart Energy</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-colors relative ${
                  item.current 
                    ? `bg-gradient-to-r ${getThemeColors()} text-white` 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => router.push('/settings')}
              className="flex items-center px-4 py-2.5 text-sm text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white w-full"
            >
              <Settings className="w-5 h-5" />
              <span className="ml-3">Paramètres</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2.5 text-sm text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white w-full mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 