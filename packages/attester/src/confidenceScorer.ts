/**
 * Ported from IP-SAKTI-SAHAYAK: Multi-Signal Confidence Scoring Engine
 * Synthesizes retrieval rank, source authority tier, citation validity,
 * and multi-source corroboration into a calibrated 0-10000 basis points score.
 */

import type { SourceEvidence, CitationVerificationResult } from './citationVerifier';

export interface ConfidenceResult {
  score: number;
  basisPoints: number; // 0-10000 for onchain uint16 confidence
  percentage: number;
  level: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY LOW';
  explanation: string;
  verdict: 'authentic' | 'verified' | 'unverified' | 'disputed';
}

export class ConfidenceScorer {
  public calculate(
    retrievedChunks: SourceEvidence[],
    citationInfo: CitationVerificationResult
  ): ConfidenceResult {
    if (!retrievedChunks || retrievedChunks.length === 0) {
      return {
        score: 0.1,
        basisPoints: 1000,
        percentage: 10,
        level: 'VERY LOW',
        explanation: 'No authoritative verification sources were supplied.',
        verdict: 'unverified',
      };
    }

    // 1. Retrieval Score Component (Weight: 40%)
    const topChunk = retrievedChunks[0]!;
    const retrievalScore =
      topChunk.rerank_score ?? topChunk.retrieval_score ?? 0.8;

    // 2. Source Authority Level Component (Weight: 25%)
    const authLevel = topChunk.authority_level || 'LEVEL_3';
    const authWeights: Record<string, number> = {
      LEVEL_1: 1.0,
      LEVEL_2: 0.88,
      LEVEL_3: 0.75,
      LEVEL_4: 0.6,
      LEVEL_5: 0.4,
    };
    const authorityScore = authWeights[authLevel] ?? 0.7;

    // 3. Citation & Grounding Validity Component (Weight: 20%)
    const citationValidity = citationInfo.validityScore;

    // 4. Corroboration Component (Weight: 15%)
    const corroborationScore = Math.min(1.0, 0.5 + retrievedChunks.length * 0.1);

    // Weighted composite
    const rawScore =
      retrievalScore * 0.4 +
      authorityScore * 0.25 +
      citationValidity * 0.2 +
      corroborationScore * 0.15;

    const clampedScore = Math.max(0.1, Math.min(0.98, rawScore));
    const score = Math.round(clampedScore * 100) / 100;
    const basisPoints = Math.round(score * 10000);
    const percentage = Math.round(score * 100);

    let level: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY LOW';
    let explanation: string;
    let verdict: 'authentic' | 'verified' | 'unverified' | 'disputed';

    if (score >= 0.8) {
      level = 'HIGH';
      explanation = 'Verified against primary authoritative references with verified grounding.';
      verdict = 'authentic';
    } else if (score >= 0.65) {
      level = 'MEDIUM';
      explanation = 'Supported by relevant institutional and regulatory sources.';
      verdict = 'verified';
    } else if (score >= 0.4) {
      level = 'LOW';
      explanation = 'Limited direct citation support; contains unverified claims.';
      verdict = 'unverified';
    } else {
      level = 'VERY LOW';
      explanation = 'Severe citation mismatch or missing verifiable evidence.';
      verdict = 'disputed';
    }

    return {
      score,
      basisPoints,
      percentage,
      level,
      explanation,
      verdict,
    };
  }
}
