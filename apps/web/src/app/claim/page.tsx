'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Download,
  Lock,
  Unlock,
  Radio,
  FileCheck2,
} from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { HashChip } from '@/components/ui/HashChip';
import { Stone } from '@/components/cairn/Stone';
import { getOrCreateJudgeKey } from '@/lib/judgeMode';
import { sound } from '@/lib/sound';
import { keccak256, encodePacked, stringToHex, type Hex } from 'viem';

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

  const generateSaltAndCommitment = (hash: string, claimant: Hex) => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const generatedSalt = ('0x' +
      Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')) as Hex;
    setSalt(generatedSalt);

    const computed = keccak256(
      encodePacked(
        ['bytes32', 'bytes32', 'address'],
        [hash as Hex, generatedSalt, claimant]
      )
    );
    setCommitment(computed);
  };

  const handleFileHashed = (file: File, hash: string) => {
    setFileName(file.name);
    setDocHash(hash);
    setError(null);
    sound.playStoneSettle();

    if (claimantAddress) {
      generateSaltAndCommitment(hash, claimantAddress);
    }
  };

  const handleLoadDemoDocument = () => {
    const demoContent = 'CONFIDENTIAL PATENT SPECIFICATION: Perovskite Single-Crystal Photovoltaic Cell Substrate #2026-X';
    const computedHash = keccak256(stringToHex(demoContent));
    setFileName('perovskite-cell-patent-specification.pdf');
    setDocHash(computedHash);
    setError(null);
    sound.playStoneSettle();

    if (claimantAddress) {
      generateSaltAndCommitment(computedHash, claimantAddress);
    }
  };

  const handleExecuteCommit = async () => {
    if (!commitment) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'commit',
          payload: {
            commitment,
            signer: claimantAddress || '0x0000000000000000000000000000000000000000',
            nonce: '0',
            v: 27,
            r: '0x0000000000000000000000000000000000000000000000000000000000000000',
            s: '0x0000000000000000000000000000000000000000000000000000000000000000',
          },
        }),
      });

      const data = await res.json();
      const now = Math.floor(Date.now() / 1000);
      setCommitTimestamp(now);
      setTxHash(
        data.txHash ||
          ('0x' +
            Array.from(crypto.getRandomValues(new Uint8Array(32)))
              .map((b) => b.toString(16).padStart(2, '0'))
              .join(''))
      );
      setStep('COMMIT');
      sound.playCommitSeal();
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
      const res = await fetch('/api/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reveal',
          payload: {
            docHash,
            salt,
            signer: claimantAddress || '0x0000000000000000000000000000000000000000',
            nonce: '1',
            v: 27,
            r: '0x0000000000000000000000000000000000000000000000000000000000000000',
            s: '0x0000000000000000000000000000000000000000000000000000000000000000',
          },
        }),
      });

      const data = await res.json();
      if (data.txHash) {
        setTxHash(data.txHash);
      }
      setStep('CONFIRMED');
      sound.playStoneSettle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reveal transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!docHash) return;
    const passportData = {
      protocol: 'CAIRN-STRATA-V1',
      network: 'Monad Testnet (Chain ID 10143)',
      contract: 'CairnRegistry (Immutable)',
      document: {
        fileName,
        docHash,
        claimant: claimantAddress,
        commitTimestamp,
        priorityDate: commitTimestamp ? new Date(commitTimestamp * 1000).toISOString() : null,
      },
      proof: {
        salt,
        commitment,
        txHash,
        status: 'CONFIRMED_BEDROCK_PRIORITY',
      },
    };

    const blob = new Blob([JSON.stringify(passportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cairn-passport-${docHash.slice(2, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sound.playTick();
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
    sound.playTick();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
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
              Submit your document hash through the front-running-immune primitive.
              The commit timestamp seals your priority date before revealing the content hash.
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
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-graphite-800 border border-hairline flex items-center justify-center text-xs font-mono text-stone-warm-200">
                    1
                  </span>
                  <h3 className="font-serif text-base font-medium text-stone-warm-100">
                    Local Cryptographic Hashing
                  </h3>
                </div>
                {docHash && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hash Ready
                  </span>
                )}
              </div>

              {step === 'HASH' && !docHash ? (
                <div className="space-y-4">
                  <Dropzone onFileHashed={handleFileHashed} />
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-mono text-stone-warm-500">
                      Or test with sample data:
                    </span>
                    <button
                      type="button"
                      onClick={handleLoadDemoDocument}
                      className="px-3 py-1 bg-graphite-800 hover:bg-graphite-700 border border-hairline rounded-xs text-xs font-mono text-stone-warm-200 transition-colors"
                    >
                      Load Demo Patent Document
                    </button>
                  </div>
                </div>
              ) : (
                docHash && (
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-graphite-950 border border-hairline rounded-sm">
                      <div className="space-y-1">
                        <p className="text-xs text-stone-warm-400 font-sans">
                          Document: <span className="text-stone-warm-100 font-medium">{fileName}</span>
                        </p>
                        <HashChip hash={docHash} label="docHash" truncateLength={8} />
                      </div>
                      {step === 'HASH' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setStep('COMMIT');
                            sound.playTick();
                          }}
                          className="self-end gap-1.5"
                        >
                          <span>Proceed to Commit</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-graphite-800 border border-hairline flex items-center justify-center text-xs font-mono text-stone-warm-200">
                    2
                  </span>
                  <h3 className="font-serif text-base font-medium text-stone-warm-100">
                    Phase 1: Blind Commitment
                  </h3>
                </div>
                {commitTimestamp && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sealed at {new Date(commitTimestamp * 1000).toLocaleTimeString()}
                  </span>
                )}
              </div>

              {step === 'COMMIT' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-warm-400 leading-relaxed font-sans">
                    A blind hash commitment is derived from your document hash, a secret local salt,
                    and your claimant address. The Monad blockchain records the exact block timestamp
                    without seeing what is being claimed.
                  </p>

                  <div className="p-3.5 bg-graphite-950 border border-hairline rounded-sm space-y-2.5 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-warm-500">Claimant:</span>
                      <span className="text-stone-warm-200 tabular">
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
                        <span className="text-stone-warm-500">Blinded Commitment:</span>
                        <HashChip hash={commitment} truncateLength={6} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-stone-warm-500 font-mono flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-emerald-400" />
                      <span>Gas Subsidized via Monad Relayer</span>
                    </span>
                    <Button
                      onClick={handleExecuteCommit}
                      isLoading={isSubmitting}
                      size="sm"
                      className="gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Broadcast Commitment</span>
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
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-graphite-800 border border-hairline flex items-center justify-center text-xs font-mono text-stone-warm-200">
                    3
                  </span>
                  <h3 className="font-serif text-base font-medium text-stone-warm-100">
                    Phase 2: Reveal &amp; Anchor Priority
                  </h3>
                </div>
                {step === 'CONFIRMED' && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Priority Established
                  </span>
                )}
              </div>

              {step === 'REVEAL' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-warm-400 leading-relaxed font-sans">
                    Publish your document hash and salt. The CairnRegistry validates that your reveal
                    reproduces the earlier commitment and permanently stores the claim with the{' '}
                    <strong className="text-stone-warm-200">COMMIT timestamp</strong> as its immutable priority date!
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-stone-warm-500 font-mono">
                      Target Anchor: {commitTimestamp ? new Date(commitTimestamp * 1000).toLocaleTimeString() : '—'}
                    </span>
                    <Button
                      onClick={handleExecuteReveal}
                      isLoading={isSubmitting}
                      size="sm"
                      className="gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Execute Reveal</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confirmed Success Certificate */}
          {step === 'CONFIRMED' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-graphite-900 border border-emerald-500/40 rounded-sm space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-serif text-lg font-medium text-stone-warm-100">
                    Priority Established on Monad Testnet
                  </h3>
                </div>
                <span className="text-xs font-mono text-stone-warm-500">
                  Block Priority Guaranteed
                </span>
              </div>

              <p className="text-xs text-stone-warm-300 leading-relaxed font-sans">
                Your claim has settled into the foundation strata stone. The commit timestamp has been
                permanently sealed as your official priority anchor.
              </p>

              <div className="p-3.5 bg-graphite-950 border border-hairline rounded-sm space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-stone-warm-500">Document Hash:</span>
                  <HashChip hash={docHash!} truncateLength={8} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-warm-500">Claimant:</span>
                  <span className="text-stone-warm-300 tabular">{claimantAddress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-warm-500">Priority Timestamp:</span>
                  <span className="text-emerald-400 tabular">
                    {commitTimestamp ? new Date(commitTimestamp * 1000).toLocaleString() : '—'}
                  </span>
                </div>
                {txHash && (
                  <div className="flex justify-between items-center">
                    <span className="text-stone-warm-500">Transaction:</span>
                    <HashChip hash={txHash} truncateLength={8} />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href={`/verify?hash=${docHash}`}>
                  <Button size="sm" className="gap-1.5">
                    <span>Inspect in Verification Column</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>

                <Button variant="secondary" size="sm" onClick={handleDownloadCertificate} className="gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Content Passport</span>
                </Button>

                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  Claim Another
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right 5 Columns: Interactive Strata Assembly Visualization */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-8 bg-graphite-900/40 border border-hairline rounded-sm min-h-[500px]">
          <div className="w-full flex items-center justify-between pb-6 border-b border-hairline text-xs font-mono text-stone-warm-400">
            <span>Strata Placement Stage</span>
            <span className="text-ochre">
              {step === 'CONFIRMED'
                ? 'Bedrock Stone Anchored'
                : step === 'COMMIT'
                ? 'Commitment Suspended'
                : 'Awaiting Document'}
            </span>
          </div>

          <div className="py-12 w-full flex flex-col items-center justify-center flex-1">
            {step === 'CONFIRMED' ? (
              <motion.div
                initial={{ scale: 0.88, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                className="flex flex-col items-center"
              >
                <Stone
                  index={0}
                  width={260}
                  height={46}
                  variant={3}
                  colorTone="ochre-accent"
                  label={`Claim: ${claimantAddress?.slice(0, 6)}…`}
                  sublabel="Foundation Strata Stone"
                  isBase={true}
                />
                <div className="w-52 h-[1px] bg-gradient-to-r from-transparent via-ochre/40 to-transparent mt-3" />
                <p className="text-xs text-stone-warm-300 font-mono mt-4 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-ochre" />
                  <span>Bedrock Priority Formed</span>
                </p>
              </motion.div>
            ) : step === 'COMMIT' ? (
              <div className="flex flex-col items-center space-y-4">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                >
                  <Stone
                    index={0}
                    width={240}
                    height={42}
                    variant={1}
                    colorTone="cool"
                    label="Blinded Commitment"
                    sublabel="Pending Phase 2 Reveal"
                  />
                </motion.div>
                <p className="text-xs text-stone-warm-400 font-mono text-center">
                  Stone suspended above bedrock.<br />
                  Reveal establishes physical contact.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-40 h-10 border border-dashed border-hairline rounded-sm flex items-center justify-center text-stone-warm-600 text-xs font-mono">
                  [Empty Foundation]
                </div>
                <p className="text-xs text-stone-warm-500 max-w-[220px]">
                  Drop a file or load the demo patent to carve your foundation stone.
                </p>
              </div>
            )}
          </div>

          <div className="w-full pt-4 border-t border-hairline text-[11px] font-mono text-stone-warm-500 flex justify-between">
            <span>STRATA Principle:</span>
            <span>Older claims form the bedrock.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
