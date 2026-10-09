'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, KeyRound, Sparkles } from 'lucide-react';
import { getOrCreateJudgeKey, resetJudgeKey } from '@/lib/judgeMode';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [judgeAddress, setJudgeAddress] = useState<string | null>(null);
  const [showJudgeModal, setShowJudgeModal] = useState(false);

  useEffect(() => {
    const key = getOrCreateJudgeKey();
    setJudgeAddress(key.address);
  }, []);

  const handleResetJudge = () => {
    const key = resetJudgeKey();
    setJudgeAddress(key.address);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/claim', label: 'Claim Priority' },
    { href: '/verify', label: 'Verify & Column' },
    { href: '/docs', label: 'Docs' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-graphite-950/85 backdrop-blur-md border-b border-hairline">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Natural balanced stacked stones logo mark */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            className="text-stone-warm-100 group-hover:text-ochre transition-colors"
          >
            {/* Top stone */}
            <path
              d="M12 7 Q 16 5 20 7 Q 22 10 19 12 Q 15 13 11 11 Q 10 9 12 7 Z"
              fill="currentColor"
              opacity="0.95"
            />
            {/* Middle stone */}
            <path
              d="M9 14 Q 16 11 23 13 Q 25 17 21 19 Q 14 20 8 18 Q 7 16 9 14 Z"
              fill="currentColor"
              opacity="0.85"
            />
            {/* Base foundation stone */}
            <path
              d="M5 21 Q 16 18 27 21 Q 29 26 24 28 Q 14 29 4 27 Q 3 24 5 21 Z"
              fill="currentColor"
              opacity="0.75"
            />
          </svg>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-stone-warm-100 leading-none">
              Cairn
            </span>
            <span className="text-[10px] text-stone-warm-500 font-mono tracking-widest uppercase">
              STRATA Primitive
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-stone-warm-100 bg-graphite-850 border border-hairline font-semibold'
                    : 'text-stone-warm-400 hover:text-stone-warm-100 hover:bg-graphite-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions & Judge Mode Pill */}
        <div className="flex items-center gap-3">
          {/* Network Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-graphite-900 border border-hairline rounded-sm text-[11px] font-mono text-stone-warm-400 tabular">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Monad 10143</span>
          </div>

          {/* Judge Mode Button */}
          <button
            type="button"
            onClick={() => setShowJudgeModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ochre/10 hover:bg-ochre/20 border border-ochre/30 text-ochre rounded-sm text-xs font-medium transition-all"
            title="Judge Mode with Relayer Gas and Sample Data"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Judge Mode</span>
          </button>
        </div>
      </div>

      {/* Judge Mode Modal */}
      {showJudgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-graphite-900 border border-hairline rounded-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-ochre">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-serif text-lg font-semibold text-stone-warm-100">
                  Judge Mode
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowJudgeModal(false)}
                className="text-stone-warm-500 hover:text-stone-warm-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-warm-400 leading-relaxed">
              Designed for hackathon judges who want to test the entire flow
              without biometric passkey hardware. Cairn provisions a throwaway
              in-browser cryptographic identity with relayer-sponsored gas.
            </p>

            <div className="bg-graphite-950 border border-hairline rounded-sm p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-warm-500 font-mono">
                  Ephemeral Claimant Key:
                </span>
                <span className="text-emerald-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Ready
                </span>
              </div>
              <div className="text-xs font-mono tabular text-stone-warm-200 break-all bg-graphite-900 p-2 rounded-xs border border-white/5">
                {judgeAddress || 'Generating...'}
              </div>
              <p className="text-[10px] text-stone-warm-500 italic">
                Gas is subsidized via Cairn&apos;s meta-transaction relayer on Monad.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetJudge}
                className="text-xs text-stone-warm-400 hover:text-ochre transition-colors underline underline-offset-2"
              >
                Reset identity
              </button>

              <button
                type="button"
                onClick={() => setShowJudgeModal(false)}
                className="px-4 py-1.5 bg-ochre text-white text-xs font-medium rounded-sm hover:bg-ochre-hover transition-colors"
              >
                Continue as Judge
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
