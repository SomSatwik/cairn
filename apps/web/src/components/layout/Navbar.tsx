'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, KeyRound, Sparkles, Volume2, VolumeX, Radio, Check } from 'lucide-react';
import { getOrCreateJudgeKey, resetJudgeKey, SAMPLE_RECORDS } from '@/lib/judgeMode';
import { sound } from '@/lib/sound';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [judgeAddress, setJudgeAddress] = useState<string | null>(null);
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    const key = getOrCreateJudgeKey();
    setJudgeAddress(key.address);
    setSoundEnabled(sound.isEnabled());
  }, []);

  const handleResetJudge = () => {
    const key = resetJudgeKey();
    setJudgeAddress(key.address);
    sound.playStoneSettle();
  };

  const handleToggleSound = () => {
    const newState = sound.toggle();
    setSoundEnabled(newState);
  };

  const handleCopyKey = () => {
    if (judgeAddress) {
      navigator.clipboard.writeText(judgeAddress);
      setCopiedKey(true);
      sound.playTick();
      setTimeout(() => setCopiedKey(false), 1500);
    }
  };

  const navLinks = [
    { href: '/', label: 'Manifesto' },
    { href: '/claim', label: 'Claim Priority' },
    { href: '/verify', label: 'Verify & Column' },
    { href: '/docs', label: 'Architecture & Docs' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-graphite-950/85 backdrop-blur-md border-b border-hairline">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          onClick={() => sound.playTick()}
          className="flex items-center gap-3 group"
        >
          {/* Natural balanced stacked stones logo mark */}
          <svg
            width="30"
            height="30"
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
              Monad Strata
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
                onClick={() => sound.playTick()}
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

        {/* Right HUD Controls */}
        <div className="flex items-center gap-3">
          {/* Sound Synthesizer Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2 rounded-sm border transition-colors ${
              soundEnabled
                ? 'bg-ochre/10 border-ochre/40 text-ochre'
                : 'bg-graphite-900 border-hairline text-stone-warm-500 hover:text-stone-warm-300'
            }`}
            title={soundEnabled ? 'Haptic Audio On (Click to Mute)' : 'Haptic Audio Muted (Click to Enable)'}
            aria-label="Toggle haptic audio"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Network Badge */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-graphite-900 border border-hairline rounded-sm text-[11px] font-mono text-stone-warm-400 tabular">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Monad 10143</span>
          </div>

          {/* Judge Mode Button */}
          <button
            type="button"
            onClick={() => {
              setShowJudgeModal(true);
              sound.playTick();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ochre/10 hover:bg-ochre/20 border border-ochre/30 text-ochre rounded-sm text-xs font-medium transition-all"
            title="Judge Mode with Relayer Gas and Sample Data"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">Judge Mode</span>
          </button>
        </div>
      </div>

      {/* Judge Mode Modal */}
      {showJudgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-graphite-900 border border-hairline rounded-sm p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-ochre">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-serif text-xl font-medium text-stone-warm-100">
                  Judge Mode Protocol
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowJudgeModal(false)}
                className="text-stone-warm-500 hover:text-stone-warm-200 text-sm font-mono p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-warm-400 leading-relaxed font-sans">
              Designed for hackathon judges evaluating the protocol. Cairn generates an ephemeral
              cryptographic keypair directly in your browser with zero wallet setups or MON faucet tokens required.
            </p>

            {/* Ephemeral Identity Card */}
            <div className="bg-graphite-950 border border-hairline rounded-sm p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-stone-warm-500">Ephemeral Claimant Address:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Relayer Gas Active
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 bg-graphite-900 p-2 rounded-xs border border-white/5 font-mono text-xs text-stone-warm-200">
                <span className="truncate tabular">{judgeAddress || 'Generating...'}</span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="text-[10px] text-ochre hover:underline uppercase shrink-0 font-mono"
                >
                  {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : 'Copy'}
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-warm-500 font-mono pt-1">
                <span>Relayer Balance: 10.00 MON (Subsidized)</span>
                <span>Precompile: 0x0100 Hardware Native</span>
              </div>
            </div>

            {/* Pre-Seeded Sample Scenarios */}
            <div>
              <p className="text-xs font-mono text-stone-warm-400 mb-2">
                1-Click Pre-Seeded Evaluation Records:
              </p>
              <div className="space-y-1.5">
                {SAMPLE_RECORDS.map((rec) => (
                  <Link
                    key={rec.id}
                    href={`/verify?hash=${rec.docHash}`}
                    onClick={() => {
                      setShowJudgeModal(false);
                      sound.playStoneSettle();
                    }}
                    className="block p-2.5 bg-graphite-950 hover:bg-graphite-800 border border-hairline rounded-xs transition-colors group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif text-stone-warm-200 group-hover:text-ochre">
                        {rec.title}
                      </span>
                      <span className="text-[10px] font-mono text-stone-warm-500">
                        {rec.category}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={handleResetJudge}
                className="text-xs font-mono text-stone-warm-400 hover:text-ochre transition-colors underline underline-offset-2"
              >
                Reset Ephemeral Identity
              </button>

              <button
                type="button"
                onClick={() => setShowJudgeModal(false)}
                className="px-4 py-1.5 bg-ochre text-graphite-950 text-xs font-medium rounded-sm hover:bg-ochre/90 transition-colors"
              >
                Enter Evaluation Flow
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
