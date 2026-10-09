'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { sound } from '@/lib/sound';
import { ShieldAlert, ShieldCheck, ArrowRight, Zap, Lock, Unlock, AlertTriangle } from 'lucide-react';

export const FrontRunningLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'naive' | 'cairn'>('cairn');

  const handleTabChange = (tab: 'naive' | 'cairn') => {
    setActiveTab(tab);
    sound.playTick();
  };

  return (
    <div className="w-full bg-graphite-900 border border-hairline rounded-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-ochre uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Cryptographic Proof Engine</span>
          </div>
          <h3 className="font-serif text-2xl font-normal text-stone-warm-100 mt-1">
            Why Naive Onchain Timestamps Fail
          </h3>
          <p className="text-xs text-stone-warm-400 mt-1 max-w-xl">
            In standard blockchain timestamping, broadcasting a document hash leaks priority to mempool bots.
            Cairn&apos;s commit-reveal primitive provides mathematical immunity.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-graphite-950 border border-hairline rounded-sm text-xs font-mono shrink-0">
          <button
            type="button"
            onClick={() => handleTabChange('naive')}
            className={`px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'naive'
                ? 'bg-red-950/60 text-red-200 border border-red-500/30 font-medium'
                : 'text-stone-warm-500 hover:text-stone-warm-300'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-red-400" />
            <span>Naive Timestamps (Vulnerable)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('cairn')}
            className={`px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'cairn'
                ? 'bg-ochre/15 text-ochre border border-ochre/40 font-medium'
                : 'text-stone-warm-500 hover:text-stone-warm-300'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-ochre" />
            <span>Cairn Commit-Reveal (Protected)</span>
          </button>
        </div>
      </div>

      {/* Visual Pipeline Display */}
      {activeTab === 'naive' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-4 bg-graphite-950 border border-hairline rounded-sm space-y-2">
              <span className="text-[10px] font-mono text-stone-cold-600 uppercase tracking-widest">
                Stage 1 • Alice Broadcasts
              </span>
              <p className="text-sm font-serif text-stone-warm-100">
                Alice broadcasts raw <code className="text-xs font-mono text-stone-warm-300">docHash</code>
              </p>
              <p className="text-xs text-stone-warm-400 leading-relaxed">
                The transaction enters the Monad public mempool waiting for block packaging.
              </p>
              <div className="p-2 bg-graphite-900 rounded-xs border border-white/5 font-mono text-[11px] text-stone-warm-400">
                tx.payload = [docHash]
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-sm space-y-2">
              <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Stage 2 • Mempool Sniffing
              </span>
              <p className="text-sm font-serif text-red-100">
                Searcher bot clones the document hash
              </p>
              <p className="text-xs text-red-200/80 leading-relaxed">
                Bot copies Alice&apos;s hash and broadcasts with 2x priority gas fee to leapfrog the queue.
              </p>
              <div className="p-2 bg-red-950/50 rounded-xs border border-red-500/30 font-mono text-[11px] text-red-300">
                bot.gasFee = alice.fee * 2
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-graphite-950 border border-red-500/30 rounded-sm space-y-2">
              <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest">
                Result • Stolen Priority
              </span>
              <p className="text-sm font-serif text-stone-warm-100">
                Bot claims priority in block N
              </p>
              <p className="text-xs text-stone-warm-400 leading-relaxed">
                Alice&apos;s transaction executes in block N+1. The blockchain records the bot as the first inventor.
              </p>
              <div className="p-2 bg-red-950/40 rounded-xs border border-red-500/20 font-mono text-[11px] text-red-400">
                EARLIEST: Bot (Block #1042)
              </div>
            </div>
          </div>

          <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-sm flex items-start gap-3 text-xs text-red-200 font-sans">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-100">Vulnerability Conclusion</p>
              <p className="mt-0.5 text-red-200/80 leading-relaxed">
                Standard single-step timestamping cannot defend against malicious validators or searchers. Any published hash is vulnerable before it is included in a finalized block.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-4 bg-graphite-950 border border-hairline rounded-sm space-y-2">
              <span className="text-[10px] font-mono text-ochre uppercase tracking-widest flex items-center gap-1">
                <Lock className="w-3 h-3" /> Phase 1 • Blinded Commit
              </span>
              <p className="text-sm font-serif text-stone-warm-100">
                Alice commits blinded hash
              </p>
              <p className="text-xs text-stone-warm-400 leading-relaxed">
                Alice submits <code className="text-[10px] font-mono text-ochre">H(docHash, salt, alice)</code>. The document and salt remain completely secret.
              </p>
              <div className="p-2 bg-graphite-900 rounded-xs border border-ochre/20 font-mono text-[11px] text-ochre">
                commitTime = block.timestamp
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-graphite-950 border border-hairline rounded-sm space-y-2">
              <span className="text-[10px] font-mono text-stone-cold-600 uppercase tracking-widest">
                Stage 2 • Attacker Blocked
              </span>
              <p className="text-sm font-serif text-stone-warm-100">
                Searcher bot cannot copy
              </p>
              <p className="text-xs text-stone-warm-400 leading-relaxed">
                Even if a bot copies the commitment, it cannot reveal it later because the commitment binds Alice&apos;s address and secret salt.
              </p>
              <div className="p-2 bg-graphite-900 rounded-xs border border-white/5 font-mono text-[11px] text-stone-warm-400">
                bot.reveal() == REVERT
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-graphite-950 border border-emerald-500/30 rounded-sm space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <Unlock className="w-3 h-3" /> Phase 2 • Guaranteed Reveal
              </span>
              <p className="text-sm font-serif text-stone-warm-100">
                Alice reveals docHash + salt
              </p>
              <p className="text-xs text-stone-warm-400 leading-relaxed">
                The CairnRegistry contract validates the hash matching the earlier commitment and assigns the <strong>COMMIT</strong> timestamp as priority!
              </p>
              <div className="p-2 bg-emerald-950/40 rounded-xs border border-emerald-500/20 font-mono text-[11px] text-emerald-400">
                PRIORITY: Alice (Commit Block #1040)
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-sm flex items-start gap-3 text-xs text-emerald-200 font-sans">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-100">Mathematical Priority Guarantee</p>
              <p className="mt-0.5 text-emerald-200/80 leading-relaxed">
                By decoupling priority timestamp assignment (Phase 1) from document disclosure (Phase 2), Cairn guarantees that front-runners in the mempool can never steal priority.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
