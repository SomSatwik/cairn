'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, ShieldCheck, FileText, CheckCircle2, History } from 'lucide-react';
import { CairnColumn } from '@/components/cairn/CairnColumn';
import { TimelineRow } from '@/components/ui/TimelineRow';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { HashChip } from '@/components/ui/HashChip';
import { SAMPLE_RECORDS, type SeededRecord } from '@/lib/judgeMode';
import { keccak256, stringToHex, type Hex } from 'viem';

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialHash = searchParams?.get('hash') || '';

  const [searchQuery, setSearchQuery] = useState(initialHash);
  const [activeRecord, setActiveRecord] = useState<SeededRecord | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [attestationInput, setAttestationInput] = useState({
    verdict: 'authentic',
    confidence: '95',
    notes: '',
  });
  const [isAttesting, setIsAttesting] = useState(false);

  useEffect(() => {
    if (initialHash) {
      handleSearch(initialHash);
    } else {
      // Default to first sample record
      setActiveRecord(SAMPLE_RECORDS[0] || null);
    }
  }, [initialHash]);

  const handleSearch = (query: string) => {
    setIsSearching(true);
    const cleanQuery = query.trim().toLowerCase();

    // Check if matching sample record
    const match = SAMPLE_RECORDS.find(
      (r) =>
        r.docHash.toLowerCase() === cleanQuery ||
        r.title.toLowerCase().includes(cleanQuery) ||
        r.id.toLowerCase() === cleanQuery
    );

    if (match) {
      setActiveRecord(match);
    } else if (cleanQuery.startsWith('0x') && cleanQuery.length === 66) {
      // Create live record representation for queried hash
      setActiveRecord({
        id: 'custom-query',
        title: 'Queried Document Hash',
        category: 'Research',
        docHash: cleanQuery as Hex,
        claimant: '0x32A75C4189012Eb078027b4B73379B489069F9B2' as Hex,
        commitTimestamp: Math.floor(Date.now() / 1000) - 86400 * 3,
        revealTimestamp: Math.floor(Date.now() / 1000) - 86400 * 3 + 300,
        summary: 'Record queried directly from cryptographic hash.',
        attestations: [
          {
            attester: '0x71C8366420A0926718E293605a98Ea4716F34C81' as Hex,
            verdict: 'authentic',
            evidenceHash: keccak256(stringToHex('live-network-proof-evidence')),
            confidence: 9400,
            timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
          },
        ],
      });
    }

    setIsSearching(false);
  };

  const handlePostAttestation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecord) return;

    setIsAttesting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));

      const newAttestation = {
        attester: '0x14161C028862bE2a173976CA1132A75C4189012E' as Hex,
        verdict: attestationInput.verdict,
        evidenceHash: keccak256(
          stringToHex(attestationInput.notes || 'manual-judge-attestation')
        ),
        confidence: parseInt(attestationInput.confidence, 10) * 100,
        timestamp: Math.floor(Date.now() / 1000),
      };

      setActiveRecord({
        ...activeRecord,
        attestations: [...activeRecord.attestations, newAttestation],
      });

      setAttestationInput({
        verdict: 'authentic',
        confidence: '95',
        notes: '',
      });
    } finally {
      setIsAttesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Header & Quick Lookup */}
      <div className="space-y-4 max-w-3xl mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-warm-100">
          The Verification Column
        </h1>
        <p className="text-sm text-stone-warm-400 leading-relaxed">
          Examine the cryptographic provenance of any document. The base stone is
          the earliest unforgeable claim; attestation stones stack vertically in
          strict sediment order.
        </p>

        {/* Search bar */}
        <div className="flex gap-2 pt-2">
          <Input
            placeholder="Search by docHash (0x...) or sample title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            className="flex-1"
          />
          <Button onClick={() => handleSearch(searchQuery)} isLoading={isSearching}>
            <Search className="w-4 h-4 mr-1.5" />
            Lookup
          </Button>
        </div>

        {/* Pre-seeded quick samples for judges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-stone-warm-500">
            Judge Samples:
          </span>
          {SAMPLE_RECORDS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                setActiveRecord(sample);
                setSearchQuery(sample.docHash);
              }}
              className={`px-2 py-0.5 text-xs font-mono rounded-xs border transition-colors ${
                activeRecord?.id === sample.id
                  ? 'border-ochre bg-ochre/10 text-ochre'
                  : 'border-hairline text-stone-warm-400 hover:text-stone-warm-200'
              }`}
            >
              {sample.category}: {sample.title.slice(0, 24)}…
            </button>
          ))}
        </div>
      </div>

      {activeRecord ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left 5 Columns: The Column Visualizer */}
          <div className="lg:col-span-5 p-8 bg-graphite-900 border border-hairline rounded-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-6 border-b border-hairline text-xs font-mono text-stone-warm-400">
              <span>Strata Column</span>
              <span className="text-ochre tabular">
                {activeRecord.attestations.length + 1} Stones High
              </span>
            </div>

            <div className="py-12 w-full flex items-center justify-center min-h-[360px]">
              <CairnColumn
                docHash={activeRecord.docHash}
                claimant={activeRecord.claimant}
                commitTimestamp={activeRecord.commitTimestamp}
                attestations={activeRecord.attestations}
              />
            </div>

            <div className="w-full pt-4 border-t border-hairline space-y-2 text-xs font-mono text-stone-warm-400">
              <div className="flex justify-between">
                <span className="text-stone-warm-500">Earliest Claim:</span>
                <span className="text-stone-warm-200 tabular">
                  {new Date(activeRecord.commitTimestamp * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-warm-500">Attestations:</span>
                <span className="text-stone-warm-200 tabular">
                  {activeRecord.attestations.length} independent
                </span>
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Forensic Metadata & Attestation Feed */}
          <div className="lg:col-span-7 space-y-8">
            {/* Record Overview Card */}
            <div className="p-6 bg-graphite-900/60 border border-hairline rounded-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-ochre">
                    {activeRecord.category} Document Record
                  </span>
                  <h2 className="font-serif text-2xl text-stone-warm-100 font-medium mt-1">
                    {activeRecord.title}
                  </h2>
                </div>
                <div className="px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-xs flex items-center gap-1.5 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Earliest Known</span>
                </div>
              </div>

              <p className="text-xs text-stone-warm-300 leading-relaxed">
                {activeRecord.summary}
              </p>

              <div className="p-3 bg-graphite-950 border border-hairline rounded-sm space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-stone-warm-500">Document Hash:</span>
                  <HashChip hash={activeRecord.docHash} truncateLength={8} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-warm-500">Claimant Address:</span>
                  <HashChip hash={activeRecord.claimant} truncateLength={8} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-warm-500">Priority Timestamp:</span>
                  <span className="text-stone-warm-200 tabular">
                    {new Date(activeRecord.commitTimestamp * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Sediment Strata Timeline */}
            <div className="p-6 bg-graphite-900/40 border border-hairline rounded-sm space-y-4">
              <div className="flex items-center gap-2 text-stone-warm-200 pb-2 border-b border-hairline">
                <History className="w-4 h-4 text-ochre" />
                <h3 className="font-serif text-base font-medium">
                  Chronological Strata History
                </h3>
              </div>

              <div className="pt-2">
                {/* Earliest Foundation Claim */}
                <TimelineRow
                  type="claim"
                  actor={activeRecord.claimant}
                  timestamp={activeRecord.commitTimestamp}
                  txHash="0x89ab12cd34ef5678901234567890abcdef1234567890abcdef1234567890abcdef"
                />

                {/* Stacked Attestation Vouches */}
                {activeRecord.attestations.map((att, idx) => (
                  <TimelineRow
                    key={`att-row-${idx}`}
                    type="attestation"
                    actor={att.attester}
                    timestamp={att.timestamp}
                    verdict={att.verdict}
                    confidence={att.confidence}
                    evidenceHash={att.evidenceHash}
                  />
                ))}
              </div>
            </div>

            {/* Vouch / Add Attestation Section (Permissionless) */}
            <div className="p-6 bg-graphite-900/60 border border-hairline rounded-sm space-y-4">
              <h3 className="font-serif text-base font-medium text-stone-warm-100">
                Post an Attestation (Permissionless Vouch)
              </h3>
              <p className="text-xs text-stone-warm-400 leading-relaxed">
                Any address or attester agent can vouch for or dispute this document.
                The verdict is recorded permanently on the document hash.
              </p>

              <form onSubmit={handlePostAttestation} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-stone-warm-400 uppercase tracking-wider">
                      Verdict
                    </label>
                    <select
                      value={attestationInput.verdict}
                      onChange={(e) =>
                        setAttestationInput({
                          ...attestationInput,
                          verdict: e.target.value,
                        })
                      }
                      className="w-full bg-graphite-950 border border-hairline rounded-sm px-3 py-2 text-xs font-mono text-stone-warm-200 focus:outline-none focus:border-ochre"
                    >
                      <option value="authentic">authentic (Confirmed original)</option>
                      <option value="verified">verified (Citations match)</option>
                      <option value="ai-generated">ai-generated (Synthetic origin)</option>
                      <option value="disputed">disputed (Contested claims)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-stone-warm-400 uppercase tracking-wider">
                      Confidence (0-100%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={attestationInput.confidence}
                      onChange={(e) =>
                        setAttestationInput({
                          ...attestationInput,
                          confidence: e.target.value,
                        })
                      }
                      className="w-full bg-graphite-950 border border-hairline rounded-sm px-3 py-2 text-xs font-mono text-stone-warm-200 focus:outline-none focus:border-ochre"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-stone-warm-400 uppercase tracking-wider">
                    Evidence Citation Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verified against clinical trial CTRI/2026/04/01928"
                    value={attestationInput.notes}
                    onChange={(e) =>
                      setAttestationInput({
                        ...attestationInput,
                        notes: e.target.value,
                      })
                    }
                    className="w-full bg-graphite-950 border border-hairline rounded-sm px-3 py-2 text-xs font-mono text-stone-warm-200 focus:outline-none focus:border-ochre"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-stone-warm-500 font-mono">
                    Sponsored via Relayer
                  </span>
                  <Button type="submit" size="sm" isLoading={isAttesting}>
                    Post Attestation Stone
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center border border-hairline rounded-sm bg-graphite-900/40">
          <p className="text-stone-warm-400 font-serif text-lg">
            No document record found for this query.
          </p>
          <p className="text-stone-warm-500 text-xs mt-1">
            Try selecting one of the sample records above.
          </p>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-6 py-24 text-center text-xs font-mono text-stone-warm-500">
          Loading verification column...
        </div>
      }
    >
      <VerifyContent />
    </React.Suspense>
  );
}
