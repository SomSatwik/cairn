import { describe, it, expect } from 'vitest';
import {
  CitationVerifier,
  ConfidenceScorer,
  PluggableLLM,
  AttestationService,
} from '../src';

describe('Attester Package', () => {
  it('correctly extracts and validates citations', () => {
    const verifier = new CitationVerifier();
    const text =
      'According to Section 3(d) of the Patents Act [Source 1], pharmaceutical innovations require demonstrated therapeutic efficacy. Regulatory filings also confirm this standard (Source 2).';

    const sources = [
      {
        document_title: 'Indian Patents Act 1970',
        section: 'Section 3(d)',
        authority: 'Indian Patent Office',
        text: 'The mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance...',
      },
      {
        document_title: 'Manual of Patent Practice and Procedure',
        section: 'Chapter 5',
        authority: 'CGPDTM',
        text: 'Guidelines regarding Section 3(d) assessments and therapeutic efficacy...',
      },
    ];

    const result = verifier.verify(text, sources);
    expect(result.isValid).toBe(true);
    expect(result.validityScore).toBe(1.0);
    expect(result.validIndices).toEqual([1, 2]);
    expect(result.verifiedSources.length).toBe(2);
  });

  it('detects ungrounded or out-of-bounds citations', () => {
    const verifier = new CitationVerifier();
    const text =
      'Claim based on nonexistent evidence [Source 99] and [Source 1].';

    const sources = [
      {
        document_title: 'Doc 1',
        text: 'Valid source content',
      },
    ];

    const result = verifier.verify(text, sources);
    expect(result.isValid).toBe(false);
    expect(result.invalidIndices).toEqual([99]);
    expect(result.validIndices).toEqual([1]);
    expect(result.validityScore).toBe(0.5);
  });

  it('computes multi-signal confidence in basis points', () => {
    const verifier = new CitationVerifier();
    const scorer = new ConfidenceScorer();

    const text = 'Verified scientific disclosure with rigorous grounding [Source 1].';
    const sources = [
      {
        document_title: 'Nature Biotechnology',
        authority_level: 'LEVEL_1' as const,
        retrieval_score: 0.95,
        text: 'Empirical data validating target protein binding...',
      },
    ];

    const citationResult = verifier.verify(text, sources);
    const confidence = scorer.calculate(sources, citationResult);

    expect(confidence.basisPoints).toBeGreaterThan(7000);
    expect(confidence.score).toBeGreaterThan(0.7);
    expect(confidence.verdict).toBe('authentic');
  });

  it('runs complete evaluation pipeline via AttestationService', async () => {
    const service = new AttestationService();
    const documentText =
      'This research presents a novel chemical composition [Source 1] for sustained drug delivery.';
    const sources = [
      {
        document_title: 'Journal of Controlled Release',
        text: 'Liposomal formulations demonstrated sustained release over 72 hours.',
        authority_level: 'LEVEL_1' as const,
      },
    ];

    const report = await service.evaluateDocument({
      documentText,
      sources,
    });

    expect(report.docHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(report.evidenceHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(report.confidenceBasisPoints).toBeGreaterThan(0);
    expect(report.details.citationsValid).toBe(true);
  });
});
