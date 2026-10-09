'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { CairnColumn } from './CairnColumn';
import { SAMPLE_RECORDS, type SeededRecord } from '@/lib/judgeMode';
import { sound } from '@/lib/sound';
import { Sparkles, Sliders, ShieldCheck, Binary, RotateCcw } from 'lucide-react';
import { keccak256, stringToHex, type Hex } from 'viem';

export const InteractiveCairnHero: React.FC = () => {
  const [mode, setMode] = useState<'samples' | 'forge'>('samples');
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(0);
  const [customText, setCustomText] = useState('Monad Metropolis 2026 Breakthrough');
  const [activeStoneIndex, setActiveStoneIndex] = useState<number | null>(null);

  const sample = SAMPLE_RECORDS[selectedRecordIndex] || SAMPLE_RECORDS[0]!;

  // Generate live hash when user types custom text
  const customHash = useMemo(() => {
    return keccak256(stringToHex(customText || 'Cairn Bedrock'));
  }, [customText]);

  const activeDocHash = mode === 'samples' ? sample.docHash : customHash;
  const activeAttestations = mode === 'samples' ? sample.attestations : [
    {
      attester: '0x84B291A7b9E488d5e12f6A7B81eF27cA0284D19a' as Hex,
      verdict: 'authentic',
      timestamp: Math.floor(Date.now() / 1000) - 3600,
      confidence: 9600,
    },
    {
      attester: '0x39a14716F34C8114161C028862bE2a173976CA11' as Hex,
      verdict: 'ai-generated',
      timestamp: Math.floor(Date.now() / 1000) - 1800,
      confidence: 9200,
    },
  ];

  const handleSelectSample = (idx: number) => {
    setSelectedRecordIndex(idx);
    sound.playStoneSettle();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomText(e.target.value);
    sound.playTick();
  };

  return (
    <div className="w-full bg-graphite-900/60 border border-hairline rounded-sm p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
      {/* Subtle background strata grid accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#d97736_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      {/* Header controls: Switcher between curated samples and live forger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hairline relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-stone-warm-400">
            <span className="w-2 h-2 rounded-full bg-ochre animate-pulse" />
            <span className="uppercase tracking-wider">Deterministic Strata Column</span>
          </div>
          <p className="text-[11px] font-sans text-stone-warm-500 mt-0.5">
            Derived directly from cryptographic SHA-256 entropy
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-graphite-950 border border-hairline rounded-sm text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setMode('samples');
              sound.playTick();
            }}
            className={`px-3 py-1 rounded-xs transition-colors flex items-center gap-1.5 ${
              mode === 'samples'
                ? 'bg-graphite-800 text-stone-warm-100 font-medium'
                : 'text-stone-warm-500 hover:text-stone-warm-300'
            }`}
          >
            <Sparkles className="w-3 h-3 text-ochre" />
            <span>Curated Records</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('forge');
              sound.playTick();
            }}
            className={`px-3 py-1 rounded-xs transition-colors flex items-center gap-1.5 ${
              mode === 'forge'
                ? 'bg-graphite-800 text-stone-warm-100 font-medium'
                : 'text-stone-warm-500 hover:text-stone-warm-300'
            }`}
          >
            <Binary className="w-3 h-3 text-ochre" />
            <span>Interactive Forger</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="py-8 relative min-h-[380px] flex flex-col items-center justify-center">
        {/* Floating Geological Diagnostics */}
        <div className="absolute top-2 left-0 text-[11px] font-mono text-stone-warm-500 space-y-1 z-10 hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-stone-cold-600">SEED:</span>
            <span className="text-stone-warm-300 tabular">{activeDocHash.slice(0, 10)}…{activeDocHash.slice(-6)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-stone-cold-600">STRATA:</span>
            <span className="text-ochre tabular">{activeAttestations.length + 1} Stones Balanced</span>
          </div>
        </div>

        {/* The Animated Cairn Column */}
        <motion.div
          key={activeDocHash}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full flex justify-center cursor-pointer"
          onClick={() => sound.playStoneSettle()}
          title="Click to trigger physical settling"
        >
          <CairnColumn
            docHash={activeDocHash}
            claimant={mode === 'samples' ? sample.claimant : ('0x32A75C4189012Eb078027b4B73379B489069F9B2' as Hex)}
            commitTimestamp={mode === 'samples' ? sample.commitTimestamp : Math.floor(Date.now() / 1000) - 86400}
            attestations={activeAttestations}
          />
        </motion.div>

        {/* Bottom Bedrock Foundation Plate */}
        <div className="w-full max-w-[280px] h-[1px] bg-gradient-to-r from-transparent via-hairline-bright to-transparent mt-2" />
      </div>

      {/* Lower Switcher Panel */}
      <div className="pt-4 border-t border-hairline">
        {mode === 'samples' ? (
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-stone-warm-400 mb-2.5">
              <span>Inspect Sample Document:</span>
              <span className="text-ochre">{sample.category}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_RECORDS.map((rec, idx) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => handleSelectSample(idx)}
                  className={`p-2.5 text-left border rounded-sm transition-all ${
                    selectedRecordIndex === idx
                      ? 'border-ochre/50 bg-ochre/5 text-stone-warm-100'
                      : 'border-hairline bg-graphite-950/60 text-stone-warm-400 hover:text-stone-warm-200 hover:bg-graphite-950'
                  }`}
                >
                  <p className="font-serif text-xs font-medium truncate text-stone-warm-100">
                    {rec.title}
                  </p>
                  <p className="text-[10px] font-mono text-stone-warm-500 mt-1 truncate">
                    {rec.id} • {rec.attestations.length} attestations
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-stone-warm-400">
              <span>Type secret or document passage to re-carve stones:</span>
              <span className="text-ochre">Live SHA-256</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customText}
                onChange={handleTextChange}
                placeholder="Type anything to compute deterministic seed..."
                className="w-full bg-graphite-950 border border-hairline rounded-sm px-3.5 py-2 text-xs font-mono text-stone-warm-100 focus:outline-none focus:border-ochre transition-colors"
              />
              <button
                type="button"
                onClick={() => {
                  setCustomText(`Document Proof Salt ${Math.floor(Math.random() * 10000)}`);
                  sound.playCommitSeal();
                }}
                className="px-3 py-2 bg-graphite-800 hover:bg-graphite-700 border border-hairline text-stone-warm-200 text-xs font-mono rounded-sm shrink-0 flex items-center gap-1.5 transition-colors"
                title="Randomize Entropy"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Randomize</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
