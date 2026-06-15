'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Key,
  FolderLock,
  Ban,
  Scroll,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/licenses', label: 'Licenses', icon: Key },
  { href: '/plugins', label: 'Plugins', icon: FolderLock },
  { href: '/blacklist', label: 'Blacklist', icon: Ban },
  { href: '/audit', label: 'Audit Log', icon: Scroll },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950/45 backdrop-blur-md border-r border-border text-zinc-300 glass-panel">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border bg-zinc-950/20">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 text-white font-bold shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            AX
          </div>
          <span className="font-bold text-white tracking-widest text-xs xl:block md:hidden font-mono">
            ASTROX LICENSE
          </span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-zinc-400 hover:text-white p-1 cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto no-scrollbar">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium relative transition-colors duration-150 cursor-pointer ${
                isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
              onClick={() => onClose()}
            >
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-l-2 border-primary rounded-r shadow-[inset_4px_0_12px_rgba(124,58,237,0.15)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 flex-shrink-0 z-10" />
              <span className="xl:block md:hidden z-10 transition-opacity duration-150 font-sans">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border text-xs text-zinc-500 xl:block md:hidden font-mono">
        v1.0.0 &copy; 2026 AstroX
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-150 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Persistent Sidebar */}
      {/* xl width: 240px (w-60), md width: 64px (w-16) */}
      <div className="hidden md:block md:w-16 xl:w-60 flex-shrink-0 h-full">
        {sidebarContent}
      </div>
    </>
  );
}
