import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ProfileProvider } from '@/contexts/ProfileContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Accuride - Moulinette',
  description: 'Convertisseur de données Accuride',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </body>
    </html>
  );
}
