'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

interface ProfileContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
  profileColor: string;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Charger le profil depuis le localStorage
    const savedProfile = localStorage.getItem('selectedProfile');
    const authConfig = localStorage.getItem('authConfig');

    if (savedProfile && authConfig) {
      setProfile(JSON.parse(savedProfile));
      setIsAuthenticated(true);
    } else if (pathname !== '/' && pathname !== '/configure-ied') {
      // Rediriger vers la page de connexion si non authentifié
      router.push('/');
    }
  }, [pathname, router]);

  const logout = () => {
    localStorage.clear();
    setProfile(null);
    setIsAuthenticated(false);
    router.push('/');
  };

  // Obtenir la couleur du thème en fonction du profil
  const getProfileColor = () => {
    if (!profile) return 'blue';
    switch (profile.id) {
      case 'arthur':
        return 'blue';
      case 'antoine':
        return 'green';
      case 'julien':
        return 'purple';
      case 'maximilien':
        return 'red';
      case 'nicolas':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  return (
    <ProfileContext.Provider 
      value={{ 
        profile, 
        setProfile, 
        isAuthenticated, 
        logout,
        profileColor: getProfileColor()
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
} 