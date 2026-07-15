'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { ShieldCheck, MessageSquareShare } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flat-card bg-card p-8 border border-border space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center justify-center w-12 h-12 rounded bg-primary text-white font-bold text-lg mb-2">
            CL
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Cipher License Admin
          </h2>
          <p className="text-xs text-zinc-500 max-w-xs">
            Access to this administrative control system is restricted. Unauthorized access attempts will be logged.
          </p>
        </div>

        <div className="border-t border-border/60 my-6" />

        <button
          onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
          className="w-full flat-btn flat-btn-primary py-3 flex items-center justify-center gap-3 font-semibold text-sm select-none"
        >
          <MessageSquareShare className="w-5 h-5" />
          Authenticate with Discord
        </button>

        <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-xxs tracking-wider uppercase pt-4">
          <ShieldCheck className="w-4 h-4 text-zinc-600" />
          Secure Session Gate
        </div>
      </div>
    </div>
  );
}
