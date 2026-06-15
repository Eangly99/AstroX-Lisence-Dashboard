import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/layout/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AstroX License Dashboard',
  description: 'Minecraft Plugin License Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="h-full bg-background text-zinc-100 flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
