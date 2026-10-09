'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileCheck, Layers, Cpu, BookOpen, Shield } from 'lucide-react';
import { CairnColumn } from '@/components/cairn/CairnColumn';
import { Button } from '@/components/ui/Button';
import { SAMPLE_RECORDS } from '@/lib/judgeMode';

export default function HomePage() {
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(0);
  const sample = SAMPLE_RECORDS[selectedRecordIndex] || SAMPLE_RECORDS[0]!;

  return (
    <div className="relative min-h-screen">
      {/* Editorial Hero Section (Strict 12-column grid, left-aligned) */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 border-b border-hairline">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Manifesto (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-graphite-900 border border-hairline rounded-sm text-xs font-mono text-stone-warm-400">
              <span className="w-1.5 h-1.5 rounded-full bg-ochre" />
              <span>Trust, Identity &amp; AI Infrastructure • Monad Metropolis</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-stone-warm-100 leading-[1.12]">
              Prove who documented something first,{' '}
              <span className="italic text-stone-warm-300">
                without revealing it.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-warm-400 font-sans max-w-2xl leading-relaxed">
              Only a cryptographic hash goes onchain. The document never leaves
              your machine. Cairn operates as an immutable content passport and
              permissionless attestation layer on Monad.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link href="/claim">
                <Button size="lg" className="gap-2">
                  <span>Claim Priority</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/verify">
                <Button variant="secondary" size="lg">
                  Explore Verification Column
                </Button>
              </Link>
            </div>

            {/* Architectural Trust Commitments */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-hairline">
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-warm-500 font-mono">
                  Guaranteed Priority
                </p>
                <p className="text-sm font-serif text-stone-warm-200 mt-1">
                  Commit-reveal defends against mempool front-running.
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-warm-500 font-mono">
                  Zero Capture
                </p>
                <p className="text-sm font-serif text-stone-warm-200 mt-1">
                  No owner, no upgrade proxy, no pause keys.
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-warm-500 font-mono">
                  Hardware Identity
                </p>
                <p className="text-sm font-serif text-stone-warm-200 mt-1">
                  Passkey P256 verification via precompile 0x0100.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Assembly Cairn (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-graphite-900/40 border border-hairline rounded-sm relative">
            <div className="w-full flex items-center justify-between pb-6 border-b border-hairline text-xs font-mono text-stone-warm-400">
              <span>Seeded Cairn Visualization</span>
              <span className="text-ochre tabular">
                {sample.attestations.length + 1} Strata Stones
              </span>
            </div>

            <div className="py-12 w-full flex items-center justify-center min-h-[340px]">
              <CairnColumn
                docHash={sample.docHash}
                claimant={sample.claimant}
                commitTimestamp={sample.commitTimestamp}
                attestations={sample.attestations}
              />
            </div>

            <div className="w-full pt-4 border-t border-hairline space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-warm-500">Record:</span>
                <span className="text-stone-warm-200 truncate max-w-[240px]">
                  {sample.title}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-warm-500">Hash:</span>
                <span className="text-stone-warm-400 tabular">
                  {sample.docHash.slice(0, 10)}…{sample.docHash.slice(-8)}
                </span>
              </div>
              {/* Sample Record Switcher */}
              <div className="flex items-center gap-2 pt-2">
                {SAMPLE_RECORDS.map((rec, i) => (
                  <button
                    key={rec.id}
                    onClick={() => setSelectedRecordIndex(i)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-xs border transition-colors ${
                      selectedRecordIndex === i
                        ? 'border-ochre bg-ochre/10 text-ochre'
                        : 'border-hairline text-stone-warm-400 hover:text-stone-warm-200'
                    }`}
                  >
                    {rec.category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concrete Industry Adopters Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-b border-hairline">
        <div className="space-y-4 max-w-2xl mb-12">
          <p className="text-xs uppercase tracking-widest text-ochre font-mono">
            Ecosystem Integration
          </p>
          <h2 className="font-serif text-3xl font-normal text-stone-warm-100">
            Engineered for production workflows requiring cryptographic origin.
          </h2>
          <p className="text-sm text-stone-warm-400 leading-relaxed">
            Centralized notarization registries create single points of failure
            and regulatory lock-in. Cairn is designed as an open base protocol
            for specialized products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-graphite-900 border border-hairline rounded-sm space-y-3">
            <div className="w-8 h-8 rounded-sm bg-graphite-800 border border-hairline flex items-center justify-center text-ochre">
              <FileCheck className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base text-stone-warm-100 font-medium">
              Patent-Drafting Tools
            </h3>
            <p className="text-xs text-stone-warm-400 leading-relaxed">
              Automated timestamping of prior-art disclosures and invention
              records prior to public filing or cross-border submission.
            </p>
          </div>

          <div className="p-6 bg-graphite-900 border border-hairline rounded-sm space-y-3">
            <div className="w-8 h-8 rounded-sm bg-graphite-800 border border-hairline flex items-center justify-center text-ochre">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base text-stone-warm-100 font-medium">
              AYUSH &amp; Botanical Ventures
            </h3>
            <p className="text-xs text-stone-warm-400 leading-relaxed">
              Provenance anchoring for traditional formulation databases,
              herbal extraction methods, and clinical validation studies.
            </p>
          </div>

          <div className="p-6 bg-graphite-900 border border-hairline rounded-sm space-y-3">
            <div className="w-8 h-8 rounded-sm bg-graphite-800 border border-hairline flex items-center justify-center text-ochre">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base text-stone-warm-100 font-medium">
              Research Repositories
            </h3>
            <p className="text-xs text-stone-warm-400 leading-relaxed">
              Permanent pre-print priority claims for preprint servers and
              scientific labs before peer-review dissemination.
            </p>
          </div>

          <div className="p-6 bg-graphite-900 border border-hairline rounded-sm space-y-3">
            <div className="w-8 h-8 rounded-sm bg-graphite-800 border border-hairline flex items-center justify-center text-ochre">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base text-stone-warm-100 font-medium">
              AI Origin &amp; Content Passports
            </h3>
            <p className="text-xs text-stone-warm-400 leading-relaxed">
              Certifying model checkpoints, training datasets, and synthetic
              generation provenance with tamper-evident attestation trails.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works (Sediment Strata Concept) */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-graphite-900/40 border border-hairline rounded-sm space-y-3">
            <span className="font-mono text-xs text-ochre">01 / COMMIT</span>
            <h3 className="font-serif text-lg text-stone-warm-100">
              Local Hashing &amp; Blind Commitment
            </h3>
            <p className="text-xs text-stone-warm-400 leading-relaxed">
              Your browser computes the SHA-256 digest of your file and blinds it
              with a secret salt and your passkey address:
              <code className="block mt-2 p-2 bg-graphite-950 font-mono text-[11px] text-stone-warm-300 rounded-xs border border-white/5">
                hash(docHash, salt, claimant)
              </code>
              The network records this commitment timestamp as your immutable
              priority time.
            </p>
          </div>

          <div className="p-6 bg-graphite-900/40 border border-hairline rounded-sm space-y-3">
            <span className="font-mono text-xs text-ochre">02 / REVEAL</span>
            <h3 className="font-serif text-lg text-stone-warm-100">
              Front-Run Proof Publication
            </h3>
            <p className="text-xs text-stone-warm-400 leading-relaxed">
              When ready, you reveal the document hash and salt. The smart
              contract proves the preimage and anchors your claim with the
              original COMMIT time. Anyone observing your reveal in the mempool
              cannot copy it, because their commit time is nonexistent or later.
            </p>
          </div>

          <div className="p-6 bg-graphite-900/40 border border-hairline rounded-sm space-y-3">
            <span className="font-mono text-xs text-ochre">03 / ATTEST</span>
            <h3 className="font-serif text-lg text-stone-warm-100">
              Permissionless Vouching Layer
            </h3>
            <p className="text-xs text-stone-warm-400 leading-relaxed">
              Autonomous verification agents, peer reviewers, or audit algorithms
              post evidence-backed attestations onto the document record. Stones
              accumulate vertically into a verifiable cairn column.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
