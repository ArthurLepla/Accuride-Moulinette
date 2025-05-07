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
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
  BarChart,
  Code,
  Wrench,
  Palette,
  LayoutTemplate,
  Globe,
  Factory,
  LineChart
} from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';
import { ReactNode } from 'react';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
  subItems?: NavItem[];
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, profileColor, logout } = useProfile();

  const mainNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: 'Import Flexible',
      href: '/flexible-import',
      icon: <Upload className="w-5 h-5" />,
    },
    {
      title: 'Migration Mendix',
      href: '/mendix-generator/migrate',
      icon: <Code2 className="w-5 h-5" />,
    },
    {
      title: 'Visualisation',
      href: '/charts',
      icon: <BarChart className="w-5 h-5" />,
    },
    {
      title: 'Templates',
      href: '/templates',
      icon: <LayoutTemplate className="w-5 h-5" />,
      subItems: [
        {
          title: 'Vue Globale',
          href: '/templates/global-view',
          icon: <Globe className="w-4 h-4" />,
        },
        {
          title: 'Saisie Production',
          href: '/templates/production-entry',
          icon: <Factory className="w-4 h-4" />,
        },
        {
          title: 'Analyse Production',
          href: '/templates/production-analysis',
          icon: <LineChart className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'Sandbox API',
      href: '/sandbox',
      icon: <Wrench className="w-5 h-5" />,
    },
    {
      title: 'Sandbox UX UI',
      href: '/sandbox-ui',
      icon: <Palette className="w-5 h-5" />,
    },
    {
      title: 'Paramètres',
      href: '/settings',
      icon: <Settings className="w-5 h-5" />,
    },
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background border rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* En-tête avec profil */}
          <div className={`bg-gradient-to-r ${getThemeColors()} p-6`}>
            {profile && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20">
                  <Image
                    src={profile.avatar}
                    alt={`Avatar de ${profile.name}`}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-primary-foreground font-bold">{profile.name}</h2>
                  <p className="text-sm text-primary-foreground/80">Smart Energy</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {mainNavItems.map((item, index) => (
              <div key={index}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-colors relative ${
                    pathname === item.href 
                      ? `bg-gradient-to-r ${getThemeColors()} text-white` 
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
                {item.subItems && pathname.startsWith(item.href) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                          pathname === subItem.href
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        {subItem.icon}
                        <span className="ml-3">{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={logout}
              className="flex items-center px-4 py-2.5 text-sm text-muted-foreground rounded-lg hover:bg-accent hover:text-foreground w-full"
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