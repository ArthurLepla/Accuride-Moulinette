'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

const userProfiles: UserProfile[] = [
  {
    id: 'arthur',
    name: 'Arthur',
    avatar: '/avatars/arthur.png',
    color: 'bg-blue-500'
  },
  {
    id: 'antoine',
    name: 'Antoine',
    avatar: '/avatars/antoine.png',
    color: 'bg-green-500'
  },
  {
    id: 'julien',
    name: 'Julien',
    avatar: '/avatars/julien.png',
    color: 'bg-purple-500'
  },
  {
    id: 'maximilien',
    name: 'Maximilien',
    avatar: '/avatars/maximilien.png',
    color: 'bg-red-500'
  },
  {
    id: 'nicolas',
    name: 'Nicolas',
    avatar: '/avatars/nicolas.png',
    color: 'bg-yellow-500'
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleProfileSelect = async (profile: UserProfile) => {
    setIsLoading(profile.id);
    try {
      // Stocker uniquement le profil sélectionné
      localStorage.setItem('selectedProfile', JSON.stringify(profile));
      // Rediriger vers la page de configuration IED
      router.push('/configure-ied');
    } catch (err) {
      console.error('Erreur:', err);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center space-y-4">
          <div className="relative w-full h-40 mb-6">
            <Image
              src="/logo/Atlas_Core_Layout_Logo_Smart_Energy_ANNUT.png"
              alt="Smart Energy"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-xl text-gray-600">Qui utilise l'application ?</p>
        </div>

        {/* Sélection de profil */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {userProfiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleProfileSelect(profile)}
              disabled={isLoading !== null}
              className="group relative aspect-square rounded-lg overflow-hidden transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-lg"
            >
              <div className={`absolute inset-0 ${profile.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isLoading === profile.id ? (
                  <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-2" />
                ) : (
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-3 ring-2 ring-gray-200">
                    <Image
                      src={profile.avatar}
                      alt={`Avatar de ${profile.name}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <span className="text-gray-900 font-medium text-lg">{profile.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Logo DV Group */}
        <div className="text-center mt-12">
          <div className="relative w-48 h-12 mx-auto">
            <Image
              src="/logo/ok_claim-logo-horizontal (1).png"
              alt="DV Group"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
