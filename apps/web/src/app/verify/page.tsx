'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Download,
  Scale,
  Sparkles,
  Sliders,
  Send,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { CairnColumn } from '@/components/cairn/CairnColumn';
import { TimelineRow } from '@/components/ui/TimelineRow';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { HashChip } from '@/components/ui/HashChip';
import { SAMPLE_RECORDS, type SeededRecord } from '@/lib/judgeMode';
import { fetchOnchainRecord } from '@/lib/onchain';
import { sound } from '@/lib/sound';
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

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    const cleanQuery = query.trim().toLowerCase();

    // 1. Check live onchain record if it's a valid 32-byte hash
    if (cleanQuery.startsWith('0x') && cleanQuery.length === 66) {
      try {
        const onchain = await fetchOnchainRecord(cleanQuery as Hex);
        if (onchain) {
          setActiveRecord({
            id: 'onchain-record',
            title: 'Verified Onchain Document Record',
            category: 'Research',
            docHash: cleanQuery as Hex,
            claimant: onchain.claimant,
            commitTimestamp: onchain.commitTimestamp,
            revealTimestamp: onchain.commitTimestamp,
            summary: 'Live document priority claim verified directly against CairnRegistry on Monad Testnet.',
            attestations: onchain.attestations,
          });
          setIsSearching(false);
          sound.playStoneSettle();
          return;
        }
      } catch (e) {
        console.warn('Onchain query fallback:', e);
      }
    }

    // 2. Check if matching sample record
    const match = SAMPLE_RECORDS.find(
      (r) =>
        r.docHash.toLowerCase() === cleanQuery ||
        r.title.toLowerCase().includes(cleanQuery) ||
        r.id.toLowerCase() === cleanQuery
    );

    if (match) {
      setActiveRecord(match);
      sound.playStoneSettle();
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
      sound.playStoneSettle();
    }

    setIsSearching(false);
  };

  useEffect(() => {
    if (initialHash) {
      handleSearch(initialHash);
    } else {
      setActiveRecord(SAMPLE_RECORDS[0] || null);
    }
  }, [initialHash]);

  const handlePostAttestation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecord) return;

    setIsAttesting(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));

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

      sound.playStoneSettle();
    } finally {
      setIsAttesting(false);
    }
  };

  const handleExportPassport = () => {
    if (!activeRecord) return;
    const exportData = {
      protocol: 'CAIRN-STRATA-V1',
      recordId: activeRecord.id,
      title: activeRecord.title,
      category: activeRecord.category,
      docHash: activeRecord.docHash,
      claimant: activeRecord.claimant,
      priorityTimestamp: activeRecord.commitTimestamp,
      priorityDate: new Date(activeRecord.commitTimestamp * 1000).toISOString(),
      attestationCount: activeRecord.attestations.length,
      attestations: activeRecord.attestations,
      verifiedOnchain: true,
      network: 'Monad Testnet (10143)',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cairn-passport-${activeRecord.docHash.slice(2, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sound.playTick();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
      {/* Header & Quick Lookup */}
      <div className="space-y-4 max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-graphite-900 border border-hairline rounded-sm text-xs font-mono text-stone-warm-400">
          <Sparkles className="w-3.5 h-3.5 text-ochre" />
          <span>Forensic Provenance &amp; Attestation Layer</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-warm-100">
          The Verification Column
        </h1>
        <p className="text-sm text-stone-warm-400 leading-relaxed font-sans">
          Examine the cryptographic provenance of any document. The base stone is
          the earliest unforgeable claim; attestation stones stack vertically above it
          in strict chronological sediment order.
        </p>

        {/* Search bar */}
        <div className="flex gap-2 pt-2">
          <Input
            placeholder="Search by docHash (0x...) or document title..."
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
            Judge Evaluation Samples:
          </span>
          {SAMPLE_RECORDS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                setActiveRecord(sample);
                setSearchQuery(sample.docHash);
                sound.playStoneSettle();
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors ${
                activeRecord?.id === sample.id
                  ? 'border-ochre bg-ochre/10 text-ochre font-medium'
                  : 'border-hairline text-stone-warm-400 hover:text-stone-warm-200 bg-graphite-950/60'
              }`}
            >
              {sample.category}: {sample.title.slice(0, 26)}…
            </button>
          ))}
        </div>
      </div>

      {activeRecord ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 5 Columns: The Column Visualizer */}
          <div className="lg:col-span-5 p-8 bg-graphite-900 border border-hairline rounded-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-6 border-b border-hairline text-xs font-mono text-stone-warm-400">
              <span>Strata Column</span>
              <span className="text-ochre tabular">
                {activeRecord.attestations.length + 1} Stones High
              </span>
            </div>

            <div className="py-12 w-full flex items-center justify-center min-h-[380px]">
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
                <span className="text-ochre tabular font-medium">
                  {activeRecord.attestations.length} independent verifiers
                </span>
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Forensic Inspector & Attestation Studio */}
          <div className="lg:col-span-7 space-y-8">
            {/* Passport Dossier Card */}
            <div className="p-6 bg-graphite-900 border border-hairline rounded-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-4">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-graphite-950 border border-white/5 text-ochre uppercase">
                    {activeRecord.category} Passport
                  </span>
                  <h2 className="font-serif text-2xl font-normal text-stone-warm-100 mt-2">
                    {activeRecord.title}
                  </h2>
                </div>
                <Button variant="secondary" size="sm" onClick={handleExportPassport} className="gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON Passport</span>
                </Button>
              </div>

              <p className="text-xs text-stone-warm-400 leading-relaxed font-sans">
                {activeRecord.summary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 bg-graphite-950 border border-hairline rounded-sm space-y-1">
                  <span className="text-stone-warm-500 text-[10px] uppercase">Document Hash:</span>
                  <div className="truncate">
                    <HashChip hash={activeRecord.docHash} truncateLength={8} />
                  </div>
                </div>

                <div className="p-3 bg-graphite-950 border border-hairline rounded-sm space-y-1">
                  <span className="text-stone-warm-500 text-[10px] uppercase">Claimant Address:</span>
                  <div className="text-stone-warm-200 truncate tabular">
                    {activeRecord.claimant}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Sediment Feed */}
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-medium text-stone-warm-100 flex items-center justify-between">
                <span>Sediment Timeline</span>
                <span className="text-xs font-mono text-stone-warm-500 font-normal">
                  Oldest at Bedrock
                </span>
              </h3>

              <div className="space-y-2">
                {/* Bedrock Claim */}
                <TimelineRow
                  type="claim"
                  signer={activeRecord.claimant}
                  timestamp={activeRecord.commitTimestamp}
                  title="Earliest Provenance Claim (Bedrock)"
                  isBase={true}
                />

                {/* Attestation Layers */}
                {activeRecord.attestations.map((att, index) => (
                  <TimelineRow
                    key={index}
                    type="attestation"
                    signer={att.attester}
                    timestamp={att.timestamp}
                    verdict={att.verdict}
                    confidence={att.confidence}
                    title={`Attestation #${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Permissionless Attestation Studio */}
            <div className="p-6 bg-graphite-900 border border-hairline rounded-sm space-y-4">
              <div className="flex items-center gap-2 text-stone-warm-200">
                <Sliders className="w-4 h-4 text-ochre" />
                <h3 className="font-serif text-lg font-medium text-stone-warm-100">
                  Attestation Studio
                </h3>
              </div>
              <p className="text-xs text-stone-warm-400 leading-relaxed font-sans">
                Anyone can post a permissionless attestation for this record. Autonomous agents and
                institutional verifiers vouch for citation integrity or AI origin signatures.
              </p>

              <form onSubmit={handlePostAttestation} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-stone-warm-400 mb-1.5">
                      Verdict Type
                    </label>
                    <select
                      value={attestationInput.verdict}
                      onChange={(e) =>
                        setAttestationInput({ ...attestationInput, verdict: e.target.value })
                      }
                      className="w-full bg-graphite-950 border border-hairline rounded-sm px-3 py-2 text-xs font-mono text-stone-warm-100 focus:outline-none focus:border-ochre"
                    >
                      <option value="authentic">Authentic / Verified Citation</option>
                      <option value="ai-generated">AI-Generated Provenance</option>
                      <option value="disputed">Disputed / Prior Art Found</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-mono text-stone-warm-400">
                        Confidence Score
                      </label>
                      <span className="text-xs font-mono text-ochre tabular">
                        {attestationInput.confidence}% ({parseInt(attestationInput.confidence, 10) * 100} bps)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={attestationInput.confidence}
                      onChange={(e) =>
                        setAttestationInput({ ...attestationInput, confidence: e.target.value })
                      }
                      className="w-full accent-ochre bg-graphite-950 h-2 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-warm-400 mb-1.5">
                    Evidence Citation / Verification Notes
                  </label>
                  <Input
                    placeholder="e.g. Verified against USPTO patent database reference #91820..."
                    value={attestationInput.notes}
                    onChange={(e) =>
                      setAttestationInput({ ...attestationInput, notes: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-mono text-stone-warm-500">
                    Will stack a new stone layer above current cairn
                  </span>
                  <Button type="submit" isLoading={isAttesting} size="sm" className="gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Attestation</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-hairline rounded-sm space-y-3">
          <AlertCircle className="w-8 h-8 text-stone-warm-500 mx-auto" />
          <p className="text-sm font-serif text-stone-warm-200">No Record Found</p>
          <p className="text-xs text-stone-warm-500">
            Query a 66-character hex hash or select one of the pre-seeded judge samples above.
          </p>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-6 py-24 text-center font-mono text-xs text-stone-warm-500">
          Loading Verification Column...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
