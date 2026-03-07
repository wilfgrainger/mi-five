import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { GameStateProvider } from '@/contexts/GameStateContext';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'MI5 | Q-Branch Secure Terminal',
  description: 'Secure operative terminal for MI5 agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans`}>
        <GameStateProvider>
          {children}
        </GameStateProvider>
      </body>
    </html>
  );
}
