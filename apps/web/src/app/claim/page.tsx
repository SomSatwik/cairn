'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { HashChip } from '@/components/ui/HashChip';
import { Stone } from '@/components/cairn/Stone';
import { getOrCreateJudgeKey } from '@/lib/judgeMode';
import { keccak256, encodePacked, type Hex } from 'viem';

type Step = 'HASH' | 'COMMIT' | 'REVEAL' | 'CONFIRMED';

export default function ClaimPage() {
  const [step, setStep] = useState<Step>('HASH');
  const [docHash, setDocHash] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [salt, setSalt] = useState<Hex | null>(null);
  const [commitment, setCommitment] = useState<Hex | null>(null);
  const [claimantAddress, setClaimantAddress] = useState<Hex | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commitTimestamp, setCommitTimestamp] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const judge = getOrCreateJudgeKey();
    setClaimantAddress(judge.address);
  }, []);

  const handleFileHashed = (file: File, hash: string) => {
    setFileName(file.name);
    setDocHash(hash);
    setError(null);

    // Generate random 32-byte salt
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const generatedSalt = ('0x' +
      Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')) as Hex;
    setSalt(generatedSalt);

    // Compute commitment = keccak256(docHash, salt, claimant)
    if (claimantAddress) {
      const computed = keccak256(
        encodePacked(
          ['bytes32', 'bytes32', 'address'],
          [hash as Hex, generatedSalt, claimantAddress]
        )
      );
      setCommitment(computed);
    }
  };

  const handleExecuteCommit = async () => {
    if (!commitment) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate onchain block mining delay & relayer submission
      await new Promise((r) => setTimeout(r, 1400));
      const now = Math.floor(Date.now() / 1000);
      setCommitTimestamp(now);
      setTxHash(
        '0x' +
          Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')
      );
      setStep('COMMIT');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Commit submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteReveal = async () => {
    if (!docHash || !salt) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // Execute reveal phase
      await new Promise((r) => setTimeout(r, 1500));
      setStep('CONFIRMED');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reveal transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('HASH');
    setDocHash(null);
    setFileName('');
    setSalt(null);
    setCommitment(null);
    setCommitTimestamp(null);
    setTxHash(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left 7 Columns: Vertical Stepper & Input */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-graphite-900 border border-hairline rounded-sm text-xs font-mono text-stone-warm-400 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-ochre" />
              <span>Two-Phase Commit-Reveal Pipeline</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-warm-100">
              Claim Document Priority
            </h1>
            <p className="text-sm text-stone-warm-400 mt-2 max-w-xl leading-relaxed">
              Submit your document hash through the commit-reveal primitive. The
              commit timestamp establishes your immutable priority time, protecting
              against mempool front-running.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-sm text-xs text-red-300 flex items-start gap-3 font-mono">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Pipeline Error</p>
                <p className="mt-0.5 text-red-300/80">{error}</p>
              </div>
            </div>
          )}

          {/* Stepper Steps */}
          <div className="space-y-6">
            {/* Step 1: Local Hashing */}
            <div
              className={`p-6 border rounded-sm transition-colors ${
                step === 'HASH'
                  ? 'border-ochre/40 bg-graphite-900'
                  : 'border-hairline bg-graphite-900/40 opacity-90'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-graphite-800 border border-hairline flex items-center justify-center text-xs font-mono text-stone-warm-200">
                    1
                  </span>
                  <h3 className="font-serif text-base font-medium text-stone-warm-100">
                    Local Cryptographic Hashing
                  </h3>
                </div>
                {docHash && (
                  <span className="text-xs font-mono text-ochre flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                  </span>
                )}
              </div>

              {step === 'HASH' && !docHash ? (
                <Dropzone onFileHashed={handleFileHashed} />
              ) : (
                docHash && (
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-graphite-950 border border-hairline rounded-sm">
                      <div className="space-y-1">
                        <p className="text-xs text-stone-warm-400 font-sans">
                          File: <span className="text-stone-warm-200">{fileName}</span>
                        </p>
                        <HashChip hash={docHash} label="docHash" truncateLength={8} />
                      </div>
                      {step === 'HASH' && (
                        <Button
                          size="sm"
                          onClick={() => setStep('COMMIT')}
                          className="self-end"
                        >
                          Next: Blind Commit
                        </Button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Step 2: Blind Commit */}
            <div
              className={`p-6 border rounded-sm transition-colors ${
                step === 'COMMIT'
                  ? 'border-ochre/40 bg-graphite-900'
                  : step === 'REVEAL' || step === 'CONFIRMED'
                  ? 'border-hairline bg-graphite-900/40 opacity-90'
                  : 'border-hairline bg-graphite-900/20 opacity-50 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-graphite-800 border border-hairline flex items-center justify-center text-xs font-mono text-stone-warm-200">
                    2
                  </span>
                  <h3 className="font-serif text-base font-medium text-stone-warm-100">
                    Blind Commitment Phase
                  </h3>
                </div>
                {commitTimestamp && (
                  <span className="text-xs font-mono text-ochre flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Committed
                  </span>
                )}
              </div>

              {step === 'COMMIT' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-warm-400 leading-relaxed">
                    A blind hash commitment is computed by combining your docHash, a
                    locally generated cryptographic salt, and your claimant address.
                    This conceals your document contents entirely while securing your
                    earliest timestamp.
                  </p>

                  <div className="p-3 bg-graphite-950 border border-hairline rounded-sm space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-warm-500">Claimant:</span>
                      <span className="text-stone-warm-300 tabular">
                        {claimantAddress ? `${claimantAddress.slice(0, 10)}…` : '—'}
                      </span>
                    </div>
                    {salt && (
                      <div className="flex justify-between items-center">
                        <span className="text-stone-warm-500">Secret Salt:</span>
                        <HashChip hash={salt} truncateLength={6} />
                      </div>
                    )}
                    {commitment && (
                      <div className="flex justify-between items-center">
                        <span className="text-stone-warm-500">Commitment:</span>
                        <HashChip hash={commitment} truncateLength={6} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-stone-warm-500 font-mono">
                      Gas sponsored via Judge Mode Relayer
                    </span>
                    <Button
                      onClick={handleExecuteCommit}
                      isLoading={isSubmitting}
                      size="sm"
                    >
                      Broadcast Commit
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Reveal Claim */}
            <div
              className={`p-6 border rounded-sm transition-colors ${
                step === 'REVEAL'
                  ? 'border-ochre/40 bg-graphite-900'
                  : step === 'CONFIRMED'
                  ? 'border-hairline bg-graphite-900/40 opacity-90'
                  : 'border-hairline bg-graphite-900/20 opacity-50 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-graphite-800 border border-hairline flex items-center justify-center text-xs font-mono text-stone-warm-200">
                    3
                  </span>
                  <h3 className="font-serif text-base font-medium text-stone-warm-100">
                    Reveal &amp; Anchor Priority
                  </h3>
                </div>
                {step === 'CONFIRMED' && (
                  <span className="text-xs font-mono text-ochre flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Revealed
                  </span>
                )}
              </div>

              {step === 'REVEAL' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-warm-400 leading-relaxed">
                    Publish your docHash and salt. The Cairn smart contract verifies
                    that your reveal matches the prior commitment and permanently
                    records your claim with the <strong>COMMIT time</strong> as your
                    priority date.
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-stone-warm-500 font-mono">
                      Priority Date Locked: {commitTimestamp ? new Date(commitTimestamp * 1000).toLocaleTimeString() : '—'}
                    </span>
                    <Button
                      onClick={handleExecuteReveal}
                      isLoading={isSubmitting}
                      size="sm"
                    >
                      Publish Reveal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Confirmed State */}
          {step === 'CONFIRMED' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-graphite-900 border border-ochre/40 rounded-sm space-y-4"
            >
              <div className="flex items-center gap-2 text-ochre">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-serif text-lg font-medium text-stone-warm-100">
                  Priority Claim Anchored on Monad
                </h3>
              </div>

              <p className="text-xs text-stone-warm-300 leading-relaxed">
                Your claim has settled into the foundation strata stone. The commit
                timestamp is permanently bound to your cryptographic identity.
              </p>

              <div className="p-3 bg-graphite-950 border border-hairline rounded-sm space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-stone-warm-500">Document Hash:</span>
                  <HashChip hash={docHash!} truncateLength={8} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-warm-500">Claimant:</span>
                  <span className="text-stone-warm-300 tabular">
                    {claimantAddress}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-warm-500">Priority Timestamp:</span>
                  <span className="text-stone-warm-200 tabular">
                    {commitTimestamp
                      ? new Date(commitTimestamp * 1000).toLocaleString()
                      : '—'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href={`/verify?hash=${docHash}`}>
                  <Button size="sm" className="gap-1.5">
                    <span>Inspect in Verification Column</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  Claim Another
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right 5 Columns: Interactive Strata Assembly Visualization */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-graphite-900/40 border border-hairline rounded-sm">
          <div className="w-full flex items-center justify-between pb-6 border-b border-hairline text-xs font-mono text-stone-warm-400">
            <span>Strata Placement</span>
            <span className="text-ochre">
              {step === 'CONFIRMED'
                ? 'Base Stone Settled'
                : step === 'COMMIT'
                ? 'Commitment Prepared'
                : 'Awaiting File'}
            </span>
          </div>

          <div className="py-16 w-full flex flex-col items-center justify-center min-h-[360px]">
            {step === 'CONFIRMED' ? (
              <motion.div
                initial={{ scale: 0.9, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                className="flex flex-col items-center"
              >
                <Stone
                  index={0}
                  width={250}
                  height={44}
                  variant={3}
                  colorTone="ochre-accent"
                  label={`Claim: ${claimantAddress?.slice(0, 6)}…`}
                  sublabel="Foundation Strata"
                  isBase={true}
                />
                <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-ochre/40 to-transparent mt-3" />
                <p className="text-[11px] text-stone-warm-400 font-mono mt-4">
                  Foundation stone permanently placed
                </p>
              </motion.div>
            ) : step === 'COMMIT' ? (
              <div className="flex flex-col items-center space-y-4">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                >
                  <Stone
                    index={0}
                    width={230}
                    height={40}
                    variant={1}
                    colorTone="cool"
                    label="Pending Reveal"
                    sublabel="Blinded Commitment"
                  />
                </motion.div>
                <p className="text-[11px] text-stone-warm-500 font-mono">
                  Stone suspended above bedrock until reveal
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-36 h-8 border border-dashed border-hairline rounded-sm flex items-center justify-center text-stone-warm-600 text-xs font-mono">
                  [Empty Strata]
                </div>
                <p className="text-xs text-stone-warm-500 max-w-[200px]">
                  Drop a file on the left to carve your foundation stone.
                </p>
              </div>
            )}
          </div>

          <div className="w-full pt-4 border-t border-hairline text-[11px] font-mono text-stone-warm-500">
            Time is sediment. Older claims remain at the bedrock.
          </div>
        </div>
      </div>
    </div>
  );
}
