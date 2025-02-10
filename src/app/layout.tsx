import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ProfileProvider } from '@/contexts/ProfileContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Energy - Asset Explorer',
  description: 'Application de gestion des assets énergétiques',
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
