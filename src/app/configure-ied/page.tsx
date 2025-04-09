'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export default function ConfigureIEDPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [iedIp, setIedIp] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Récupérer le profil sélectionné
    const savedProfile = localStorage.getItem('selectedProfile');
    if (!savedProfile) {
      router.push('/');
      return;
    }
    setProfile(JSON.parse(savedProfile));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsLoading(true);
    setError(null);

    try {
      // Configuration de l'authentification
      const authConfig = {
        baseUrl: `https://${iedIp}`,
        token: authToken,
        iedIp: iedIp,
        authToken: authToken,
        userProfile: profile.id
      };

      // Sauvegarder la configuration
      localStorage.setItem('authConfig', JSON.stringify(authConfig));
      
      // Rediriger vers le dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Erreur lors de la configuration:', err);
      setError('Erreur lors de la configuration. Veuillez vérifier vos informations.');
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      // Créer la configuration d'authentification
      const authConfig = {
        baseUrl: `https://${iedIp}`,
        token: authToken,
        iedIp: iedIp,
        authToken: authToken,
        userProfile: profile?.id || ''
      };

      // Appeler l'API avec la configuration dans les headers
      const response = await fetch('/api/test-connection', {
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Config': JSON.stringify(authConfig)
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du test de connexion');
      }

      const result = await response.json();
      setTestResult({
        success: result.success,
        message: result.message
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Erreur lors du test de connexion'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative w-full h-24">
            <Image
              src="/logo/Atlas_Core_Layout_Logo_Smart_Energy_ANNUT.png"
              alt="Smart Energy"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* En-tête avec profil */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-200">
              <Image
                src={profile.avatar}
                alt={`Avatar de ${profile.name}`}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Configuration IED</h2>
              <p className="text-sm text-gray-500">Connecté en tant que {profile.name}</p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-6 border border-gray-200">
          <div className="space-y-2">
            <label htmlFor="iedIp" className="block text-sm font-medium text-gray-700">
              Adresse IP de l'IED
            </label>
            <input
              type="text"
              id="iedIp"
              value={iedIp}
              onChange={(e) => setIedIp(e.target.value)}
              placeholder="192.168.1.1"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="authToken" className="block text-sm font-medium text-gray-700">
              Token d'authentification
            </label>
            <input
              type="password"
              id="authToken"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Votre token d'authentification"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Configuration en cours...' : 'Configurer'}
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isLoading || !iedIp || !authToken}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Test en cours...' : 'Tester la connexion'}
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {testResult.message}
            </div>
          )}
        </form>

        {/* Logo DV Group */}
        <div className="text-center mt-8">
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