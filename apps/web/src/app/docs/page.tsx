'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, Terminal, Code2, Cpu } from 'lucide-react';
import { HashChip } from '@/components/ui/HashChip';

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      {/* Editorial Header */}
      <div className="space-y-4 border-b border-hairline pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-graphite-900 border border-hairline rounded-sm text-xs font-mono text-stone-warm-400">
          <span>Technical Reference</span>
          <span className="text-stone-warm-600">•</span>
          <span className="text-ochre">Protocol v0.1.0</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-stone-warm-100">
          Cairn Specification &amp; Architecture
        </h1>
        <p className="text-base text-stone-warm-400 leading-relaxed max-w-3xl">
          An immutable onchain primitive on Monad for proving earliest document
          documentation without revelation. Designed as a foundational content
          passport and attestation layer.
        </p>
      </div>

      {/* Network Specifications */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-stone-warm-100">
          Monad Network Parameters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 bg-graphite-900 border border-hairline rounded-sm space-y-2">
            <span className="text-stone-warm-500 uppercase tracking-wider text-[10px]">
              Chain ID &amp; RPC
            </span>
            <div className="flex justify-between items-center text-stone-warm-200">
              <span>Testnet Chain ID:</span>
              <span className="tabular text-ochre">10143</span>
            </div>
            <div className="flex justify-between items-center text-stone-warm-200">
              <span>RPC Endpoint:</span>
              <span className="truncate max-w-[200px]">https://rpc.testnet.monad.xyz</span>
            </div>
            <div className="flex justify-between items-center text-stone-warm-200">
              <span>Explorer:</span>
              <a
                href="https://testnet.monadscan.com"
                target="_blank"
                rel="noreferrer"
                className="text-stone-warm-300 hover:text-ochre underline"
              >
                testnet.monadscan.com
              </a>
            </div>
          </div>

          <div className="p-4 bg-graphite-900 border border-hairline rounded-sm space-y-2">
            <span className="text-stone-warm-500 uppercase tracking-wider text-[10px]">
              Cryptographic Precompiles
            </span>
            <div className="flex justify-between items-center text-stone-warm-200">
              <span>P256 Precompile:</span>
              <span className="text-ochre">0x0100 (EIP-7951)</span>
            </div>
            <div className="flex justify-between items-center text-stone-warm-200">
              <span>Curve:</span>
              <span>secp256r1 (WebAuthn/Secure Enclave)</span>
            </div>
            <div className="flex justify-between items-center text-stone-warm-200">
              <span>Gas Cost:</span>
              <span className="tabular">6,900 gas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Threat Model & Limits */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl text-stone-warm-100">
          Threat Model &amp; Security Guarantees
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-graphite-900/60 border border-hairline rounded-sm space-y-2">
            <h3 className="font-serif text-base text-stone-warm-100 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-ochre" />
              Mempool Front-Running Defense
            </h3>
            <p className="text-xs text-stone-warm-400 leading-relaxed">
              When a claimant reveals their document hash, malicious searchers or
              validators seeing the transaction cannot claim it for themselves.
              Even if they immediately submit a claim transaction, their priority
              time will reflect their later timestamp. Cairn records the original
              COMMIT time as the immutable priority timestamp.
            </p>
          </div>

          <div className="p-5 bg-graphite-900/60 border border-hairline rounded-sm space-y-2">
            <h3 className="font-serif text-base text-stone-warm-100 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-ochre" />
              Zero Relayer Trust
            </h3>
            <p className="text-xs text-stone-warm-400 leading-relaxed">
              Relayers only submit pre-signed cryptographic payloads
              (meta-transactions). Relayers cannot forge claims, modify salts, or
              alter claimant addresses without invalidating the cryptographic
              signature over the chainId, contract, and identity nonce.
            </p>
          </div>

          <div className="p-5 bg-graphite-900/60 border border-hairline rounded-sm space-y-2">
            <h3 className="font-serif text-base text-stone-warm-100 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-ochre" />
              Replay Protection
            </h3>
            <p className="text-xs text-stone-warm-400 leading-relaxed">
              Each identity possesses an incremental onchain nonce. Signatures
              commit directly to the Monad chain ID (10143) and contract address,
              preventing cross-chain or cross-contract replay vulnerabilities.
            </p>
          </div>

          <div className="p-5 bg-graphite-900/60 border border-hairline rounded-sm space-y-2">
            <h3 className="font-serif text-base text-stone-warm-100 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Explicit Protocol Limits
            </h3>
            <p className="text-xs text-stone-warm-400 leading-relaxed">
              Cairn proves the <em>earliest known claim</em> of a document, not
              legal inventorship or copyright title. Someone who steals an
              unpublished manuscript could claim it before the author; Cairn
              proves possession at a given time, not moral authorship.
            </p>
          </div>
        </div>
      </section>

      {/* TypeScript SDK Quickstart */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-ochre" />
          <h2 className="font-serif text-2xl text-stone-warm-100">
            TypeScript SDK Reference (@cairn/sdk)
          </h2>
        </div>

        <div className="p-4 bg-graphite-950 border border-hairline rounded-sm space-y-3 font-mono text-xs">
          <div className="text-stone-warm-500">// 1. Install SDK via pnpm or npm</div>
          <div className="text-stone-warm-200 bg-graphite-900 p-2.5 rounded-xs">
            pnpm add @cairn/sdk viem
          </div>

          <div className="text-stone-warm-500 pt-2">// 2. Hash, Claim &amp; Reveal</div>
          <pre className="text-stone-warm-300 bg-graphite-900 p-3 rounded-xs overflow-x-auto text-[11px] leading-relaxed">
{`import { CairnClient, hashBuffer } from '@cairn/sdk';

const client = new CairnClient({
  contractAddress: '0x...',
  rpcUrl: 'https://rpc.testnet.monad.xyz',
});

// Hash file or buffer locally
const docHash = await hashBuffer(fileBuffer);

// Commit phase (locks earliest priority time)
const { commitment, salt, txHash } = await client.claim(docHash);

// Reveal phase (submits preimage and publishes claim)
await client.reveal(docHash, salt);

// Verify any document hash
const { claimant, commitTimestamp, attestations } = await client.verify(docHash);`}
          </pre>
        </div>
      </section>

      {/* Citation Attester Architecture */}
      <section className="space-y-4 border-t border-hairline pt-8">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-ochre" />
          <h2 className="font-serif text-2xl text-stone-warm-100">
            Attester Service &amp; Grounding Logic
          </h2>
        </div>

        <p className="text-xs text-stone-warm-400 leading-relaxed max-w-3xl">
          The attester service ports citation-verification and calibrated confidence
          engines from <code>IP-SAKTI-SAHAYAK</code>. It extracts <code>[Source X]</code>{' '}
          markers, validates them strictly against retrieved legal or empirical chunks,
          and calculates a multi-signal confidence score across retrieval score,
          authority tier, grounding validity, and corroboration.
        </p>
      </section>
    </div>
  );
}
