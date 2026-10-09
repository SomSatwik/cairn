import { keccak256, toHex, stringToHex, type Hex, type Address } from 'viem';
import { CairnClient, hashBuffer } from '@cairn/sdk';
import { CitationVerifier, type SourceEvidence } from './citationVerifier';
import { ConfidenceScorer } from './confidenceScorer';
import { PluggableLLM } from './llm';

export interface AttestationServiceConfig {
  contractAddress: Address;
  rpcUrl?: string;
  privateKey?: Hex;
  client?: CairnClient;
}

export interface VerificationRequest {
  documentText: string;
  sources: SourceEvidence[];
  docHash?: Hex;
}

export interface VerificationReport {
  docHash: Hex;
  evidenceHash: Hex;
  verdict: Hex;
  verdictLabel: string;
  confidenceBasisPoints: number;
  percentage: number;
  txHash?: Hex;
  details: {
    citationsValid: boolean;
    validityScore: number;
    explanation: string;
    aiGenerated: boolean;
    modelDetected?: string;
  };
}

export class AttestationService {
  private verifier = new CitationVerifier();
  private scorer = new ConfidenceScorer();
  private llm = new PluggableLLM();
  private client?: CairnClient;

  constructor(config?: AttestationServiceConfig) {
    if (config?.client) {
      this.client = config.client;
    }
  }

  public async evaluateDocument(
    request: VerificationRequest
  ): Promise<VerificationReport> {
    const docHash =
      request.docHash ||
      (await hashBuffer(new TextEncoder().encode(request.documentText)));

    // 1. Citation verification ported from IP-SAKTI-SAHAYAK
    const citationResult = this.verifier.verify(
      request.documentText,
      request.sources
    );

    // 2. Multi-signal confidence calculation
    const confidence = this.scorer.calculate(request.sources, citationResult);

    // 3. Semantic / stylometric inspection
    const sourcesSummary = request.sources.map((s) => s.text).join('\n---\n');
    const semanticResult = await this.llm.inspectDocument(
      request.documentText,
      sourcesSummary
    );

    // 4. Compute evidence hash (Merkle / Keccak of all sources + results)
    const evidencePayload = JSON.stringify({
      sources: request.sources,
      citationResult,
      confidence,
      semanticResult,
    });
    const evidenceHash = keccak256(stringToHex(evidencePayload));

    // 5. Compute verdict
    let verdictLabel: string = confidence.verdict;
    if (semanticResult.hasAiGeneratedMarkers) {
      verdictLabel = 'ai-generated';
    }
    const verdict = keccak256(stringToHex(verdictLabel));

    return {
      docHash,
      evidenceHash,
      verdict,
      verdictLabel,
      confidenceBasisPoints: confidence.basisPoints,
      percentage: confidence.percentage,
      details: {
        citationsValid: citationResult.isValid,
        validityScore: citationResult.validityScore,
        explanation: confidence.explanation,
        aiGenerated: semanticResult.hasAiGeneratedMarkers,
        modelDetected: semanticResult.modelDetected,
      },
    };
  }

  public async evaluateAndAttest(
    request: VerificationRequest
  ): Promise<VerificationReport> {
    const report = await this.evaluateDocument(request);

    if (this.client) {
      const res = await this.client.attest(
        report.docHash,
        report.verdict,
        report.evidenceHash,
        report.confidenceBasisPoints
      );
      report.txHash = res.txHash;
    }

    return report;
  }
}
