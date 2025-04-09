"use client";

import '@mantine/core/styles.css';

import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { useEffect, useState } from 'react';
import { setupMcpLogger } from '@/lib/mcp-logger';
import { MantineProvider } from '@mantine/core';
import { useTheme } from 'next-themes';

const inter = Inter({ subsets: ['latin'] });

function AppProviders({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const colorScheme = mounted && resolvedTheme === 'dark' ? 'dark' : 'light';

  return (
    <MantineProvider forceColorScheme={colorScheme}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </ThemeProvider>
    </MantineProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cleanupLogger = setupMcpLogger();
      
      return () => {
        cleanupLogger();
      };
    }
  }, []);

  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body 
        className={`
          ${inter.className} 
          bg-white dark:bg-gray-900 
          text-gray-900 dark:text-gray-100 
          transition-colors duration-200 ease-in-out
        `}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
