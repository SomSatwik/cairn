import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { keccak256, stringToHex, type Hex } from 'viem';

export interface SeededRecord {
  id: string;
  title: string;
  category: 'Patent' | 'Research' | 'AI Origin' | 'Legal';
  docHash: Hex;
  claimant: Hex;
  commitTimestamp: number;
  revealTimestamp: number;
  attestations: Array<{
    attester: Hex;
    verdict: string;
    evidenceHash: Hex;
    confidence: number;
    timestamp: number;
  }>;
  summary: string;
}

const STORAGE_KEY = 'cairn_judge_ephemeral_key';

export function getOrCreateJudgeKey(): {
  privateKey: Hex;
  address: Hex;
} {
  if (typeof window === 'undefined') {
    const dummyKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as Hex;
    return { privateKey: dummyKey, address: '0x0000000000000000000000000000000000000000' as Hex };
  }

  let privateKey = localStorage.getItem(STORAGE_KEY) as Hex | null;
  if (!privateKey) {
    privateKey = generatePrivateKey();
    localStorage.setItem(STORAGE_KEY, privateKey);
  }

  const account = privateKeyToAccount(privateKey);
  return {
    privateKey,
    address: account.address,
  };
}

export function resetJudgeKey(): {
  privateKey: Hex;
  address: Hex;
} {
  const privateKey = generatePrivateKey();
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, privateKey);
  }
  const account = privateKeyToAccount(privateKey);
  return {
    privateKey,
    address: account.address,
  };
}

// Curated realistic sample records for judges to explore without needing documents
export const SAMPLE_RECORDS: SeededRecord[] = [
  {
    id: 'ayush-herbal-01',
    title: 'Ashwagandha-Curcumin Synergistic Bioavailability Matrix',
    category: 'Patent',
    docHash: keccak256(stringToHex('ayush-patent-draft-bioavailability-2026-v1')),
    claimant: '0x71C8366420A0926718E293605a98Ea4716F34C81' as Hex,
    commitTimestamp: 1727780400, // Oct 1, 2026
    revealTimestamp: 1727781200,
    summary:
      'Prior-art protection claim for lipidic nanoparticle nano-emulsion enhancing botanical curcuminoid permeation across blood-brain barrier.',
    attestations: [
      {
        attester: '0x32A75C4189012Eb078027b4B73379B489069F9B2' as Hex,
        verdict: 'authentic',
        evidenceHash: keccak256(stringToHex('ayush-clinical-trial-ctri-2026')),
        confidence: 9600,
        timestamp: 1727820000,
      },
      {
        attester: '0x88914D7FeC6AAC8cd542E72BcA78B30650d45643' as Hex,
        verdict: 'verified',
        evidenceHash: keccak256(stringToHex('ip-sakti-prior-art-search-report')),
        confidence: 8900,
        timestamp: 1727910000,
      },
    ],
  },
  {
    id: 'ai-transformer-weights',
    title: 'AlphaGenome Regulatory Variant Mutation Oracle (Weights & Architecture)',
    category: 'AI Origin',
    docHash: keccak256(stringToHex('alphagenome-weights-sha256-v2-production')),
    claimant: '0x402085c248EeA27D92E8b30b2C58ed07f9E20001' as Hex,
    commitTimestamp: 1728126000, // Oct 5, 2026
    revealTimestamp: 1728126800,
    summary:
      'Content passport certifying weights origin, training dataset hashes, and non-coding locus impact predictor checkpoint before deployment.',
    attestations: [
      {
        attester: '0x9B136C47240FCEeE99238128Eb7F2C08985C1938' as Hex,
        verdict: 'ai-generated',
        evidenceHash: keccak256(stringToHex('training-run-manifest-slurm-09')),
        confidence: 9950,
        timestamp: 1728130000,
      },
      {
        attester: '0x153A06e9c405908846c483a992F6718d2A45C86a' as Hex,
        verdict: 'authentic',
        evidenceHash: keccak256(stringToHex('reproducibility-eval-benchmarks')),
        confidence: 9400,
        timestamp: 1728200000,
      },
    ],
  },
  {
    id: 'monad-btx-pipeline',
    title: 'Optimistic Parallel EVM Transaction Scheduling Heuristics',
    category: 'Research',
    docHash: keccak256(stringToHex('parallel-evm-optimistic-scheduling-monad-2026')),
    claimant: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df' as Hex,
    commitTimestamp: 1728345600, // Oct 8, 2026
    revealTimestamp: 1728346000,
    summary:
      'Cryptographic proof of earliest documented formalization of conflict-free state access clustering for high-throughput block execution.',
    attestations: [
      {
        attester: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as Hex,
        verdict: 'verified',
        evidenceHash: keccak256(stringToHex('monad-forum-rfc-submission-hash')),
        confidence: 9200,
        timestamp: 1728350000,
      },
    ],
  },
];
