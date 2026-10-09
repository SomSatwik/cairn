'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Cpu, Layers, Sparkles, Terminal, FileCode, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InteractiveCairnHero } from '@/components/cairn/InteractiveCairnHero';
import { FrontRunningLab } from '@/components/home/FrontRunningLab';
import { AdopterShowcase } from '@/components/home/AdopterShowcase';
import { sound } from '@/lib/sound';

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Editorial Hero Section (Strict 12-column grid, left-aligned) */}
      <section className="max-w-7xl mx-auto px-6 pt-12 sm:pt-16 pb-20 border-b border-hairline">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Manifesto (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-graphite-900 border border-hairline rounded-sm text-xs font-mono text-stone-warm-400">
              <span className="w-1.5 h-1.5 rounded-full bg-ochre animate-pulse" />
              <span>Trust, Identity &amp; AI Infrastructure • Monad Metropolis</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-stone-warm-100 leading-[1.12]">
              Prove who documented something first,{' '}
              <span className="italic text-stone-warm-300">
                without revealing it.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-warm-400 font-sans max-w-2xl leading-relaxed">
              Only a cryptographic hash touches the chain. The document never leaves
              your machine. Cairn operates as an immutable content passport, front-running-immune
              priority pipeline, and permissionless attestation layer on Monad.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/claim" onClick={() => sound.playTick()}>
                <Button size="lg" className="gap-2">
                  <span>Claim Priority</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/verify" onClick={() => sound.playTick()}>
                <Button variant="secondary" size="lg">
                  Explore Verification Column
                </Button>
              </Link>
            </div>

            {/* Architectural Trust Commitments */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-hairline">
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-warm-500 font-mono">
                  Mempool Defense
                </p>
                <p className="text-sm font-serif text-stone-warm-200 mt-1">
                  Commit-reveal anchors priority time before disclosing content.
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-warm-500 font-mono">
                  Zero Platform Capture
                </p>
                <p className="text-sm font-serif text-stone-warm-200 mt-1">
                  Immutable contracts with zero owner, upgrade, or pause keys.
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-warm-500 font-mono">
                  Hardware Native
                </p>
                <p className="text-sm font-serif text-stone-warm-200 mt-1">
                  EIP-7951 P256 passkey verification via precompile 0x0100.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Assembly Cairn (5 cols) */}
          <div className="lg:col-span-5">
            <InteractiveCairnHero />
          </div>
        </div>
      </section>

      {/* Interactive Cryptographic Comparison Lab */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-b border-hairline">
        <FrontRunningLab />
      </section>

      {/* Named Adopters & Market Readiness Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-b border-hairline">
        <AdopterShowcase />
      </section>

      {/* Developer Experience & SDK Quickstart */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-b border-hairline">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-mono text-ochre uppercase tracking-wider">
              Developer Experience First
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-warm-100">
              The contracts and SDK are the product.
            </h2>
            <p className="text-sm text-stone-warm-400 leading-relaxed font-sans">
              Built on viem with typed error codes, background streaming Web Worker hashing,
              event watch subscriptions, and gasless meta-transaction relaying out of the box.
            </p>

            <ul className="space-y-3 pt-2 text-xs font-mono text-stone-warm-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero main-thread UI freezing during multi-gigabyte file hashing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hardware passkey public key derivation and precompile binding</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automated multi-signal attestation confidence scorer in basis points</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link href="/docs" onClick={() => sound.playTick()}>
                <Button variant="secondary" className="gap-2">
                  <FileCode className="w-4 h-4 text-ochre" />
                  <span>Inspect Full SDK Reference</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-5 bg-graphite-900 border border-hairline rounded-sm space-y-3 font-mono text-xs shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-hairline text-stone-warm-500">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-ochre" />
                  <span>quickstart.ts</span>
                </div>
                <span className="text-[10px]">pnpm add @cairn/sdk viem</span>
              </div>

              <pre className="text-stone-warm-200 overflow-x-auto p-2 leading-relaxed">
{`import { CairnClient, hashFile } from '@cairn/sdk';

const cairn = new CairnClient({
  contractAddress: '0x...',
  rpcUrl: 'https://rpc.testnet.monad.xyz',
});

// 1. Hash locally in Web Worker (streaming)
const docHash = await hashFile(file);

// 2. Commit blinded hash (locks priority timestamp)
const { commitment, salt } = await cairn.claim(docHash);

// 3. Reveal document priority on Monad
await cairn.reveal(docHash, salt);

// 4. Verify earliest claim & all attester verdicts
const passport = await cairn.verify(docHash);`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Network Telemetry & Bottom Monolith Banner */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="p-8 bg-gradient-to-b from-graphite-900 to-graphite-950 border border-hairline rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-normal text-stone-warm-100">
              Ready to verify a record or claim priority?
            </h3>
            <p className="text-xs font-sans text-stone-warm-400">
              Run the reference implementation or embed the open primitive in your application.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/claim" onClick={() => sound.playTick()}>
              <Button size="lg" className="gap-2">
                <span>Start Claim</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/verify" onClick={() => sound.playTick()}>
              <Button variant="secondary" size="lg">
                View Column
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
