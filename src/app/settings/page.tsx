'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check, RefreshCw } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

interface AuthConfig {
  baseUrl: string;
  token: string;
  iedIp: string;
  authToken: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const config = localStorage.getItem('authConfig');
    if (config) {
      try {
        setAuthConfig(JSON.parse(config));
      } catch (error) {
        console.error('Erreur lors du parsing de la configuration:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(field);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const handleRefreshToken = () => {
    // TODO: Implémenter la logique de rafraîchissement du token
    alert('Fonctionnalité à implémenter: Rafraîchissement du token');
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold text-white">Paramètres</h1>
        </div>

        {/* Contenu principal */}
        <div className="space-y-6">
          {/* Section Configuration IIH */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Configuration IIH</h2>
            
            {authConfig ? (
              <div className="space-y-6">
                {/* IED IP */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Adresse IP IED</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-900 rounded-lg p-3 text-gray-300 font-mono">
                      {authConfig.iedIp}
                    </div>
                    <button
                      onClick={() => handleCopy(authConfig.iedIp, 'iedIp')}
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                      title="Copier"
                    >
                      {copySuccess === 'iedIp' ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Base URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">URL de base</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-900 rounded-lg p-3 text-gray-300 font-mono">
                      {authConfig.baseUrl}
                    </div>
                    <button
                      onClick={() => handleCopy(authConfig.baseUrl, 'baseUrl')}
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                      title="Copier"
                    >
                      {copySuccess === 'baseUrl' ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Auth Token */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-400">Token d'authentification</label>
                    <button
                      onClick={handleRefreshToken}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Rafraîchir
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-900 rounded-lg p-3 text-gray-300 font-mono overflow-x-auto">
                      <span className="whitespace-nowrap">
                        {authConfig.authToken.substring(0, 20)}...
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(authConfig.authToken, 'authToken')}
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                      title="Copier"
                    >
                      {copySuccess === 'authToken' ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={() => {
                      localStorage.clear();
                      router.push('/');
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Aucune configuration trouvée.</p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Se connecter
                </button>
              </div>
            )}
          </div>

          {/* Section Informations système */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Informations système</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Version</label>
                <div className="bg-gray-900 rounded-lg p-3 text-gray-300">
                  1.0.0
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Environnement</label>
                <div className="bg-gray-900 rounded-lg p-3 text-gray-300">
                  Production
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 