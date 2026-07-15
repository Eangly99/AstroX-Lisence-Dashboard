'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Menu, LogOut, User } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Get route title
  const getTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Overview';
    const primarySegment = segments[0];

    switch (primarySegment) {
      case 'dashboard':
        return 'Overview';
      case 'licenses':
        if (segments.length > 1) return 'License Detail';
        return 'Licenses';
      case 'plugins':
        return 'Plugin Registry';
      case 'blacklist':
        return 'Blacklist Manager';
      case 'audit':
        return 'Security Ledger';
      default:
        return 'Cipher License';
    }
  };

  return (
    <header className="h-16 border-b border-border bg-zinc-950/20 backdrop-blur-md flex items-center justify-between px-6 text-zinc-300 z-30 relative glass-panel">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-zinc-400 hover:text-white p-1 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-xs text-white tracking-widest font-mono uppercase">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        {session?.user && (
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="relative">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User Avatar'}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-border flex items-center justify-center">
                  <User className="w-4 h-4 text-zinc-400" />
                </div>
              )}
              <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950 animate-pulse" />
            </div>
            
            {/* Username */}
            <span className="hidden sm:inline text-xs font-semibold text-zinc-200 tracking-wider">
              {session.user.name}
            </span>

            {/* Logout button */}
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="text-zinc-500 hover:text-rose-400 transition-colors duration-150 p-1.5 hover:bg-rose-500/10 rounded cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
