'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthConfig } from '@/lib/auth';
import type { AuthConfig } from '@/lib/types';

export default function AuthPage() {
  const router = useRouter();
  const [iedIp, setIedIp] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!iedIp || !authToken) {
      setError('Tous les champs sont requis');
      return;
    }

    try {
      // Stocker les informations dans le localStorage
      const config: AuthConfig = {
        iedIp,
        authToken
      };
      setAuthConfig(config);

      // Rediriger vers le dashboard
      router.push('/dashboard');
    } catch (error) {
      setError('Une erreur est survenue lors de l\'authentification');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            IIH Asset Explorer
          </h1>
          <h2 className="text-xl text-center text-gray-400">
            Configuration de la connexion
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="iedIp" className="block text-sm font-medium text-gray-300">
                Adresse IP de l'IED
              </label>
              <input
                id="iedIp"
                name="iedIp"
                type="text"
                required
                value={iedIp}
                onChange={(e) => setIedIp(e.target.value)}
                placeholder="192.168.1.12"
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="authToken" className="block text-sm font-medium text-gray-300">
                Token d'authentification
              </label>
              <input
                id="authToken"
                name="authToken"
                type="password"
                required
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="Votre token d'authentification"
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}
