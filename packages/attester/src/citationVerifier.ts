/**
 * Ported from IP-SAKTI-SAHAYAK: Citation & Grounding Verification Engine
 * Validates that document citations map strictly to supplied source evidence.
 */

export interface SourceEvidence {
  document_title?: string;
  authority?: string;
  authority_level?: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5';
  jurisdiction?: string;
  section?: string;
  source_url?: string;
  version?: string;
  text: string;
  retrieval_score?: number;
  rerank_score?: number;
}

export interface VerifiedSourceCard {
  citation_index: number;
  title: string;
  authority: string;
  authority_level: string;
  jurisdiction: string;
  section: string;
  source_url: string;
  version: string;
  text_snippet: string;
}

export interface CitationVerificationResult {
  isValid: boolean;
  validityScore: number;
  validIndices: number[];
  invalidIndices: number[];
  verifiedSources: VerifiedSourceCard[];
  sanitizedText: string;
}

export class CitationVerifier {
  // Matches [Source X], 【Source X】, or (Source X)
  private readonly citationPattern = /[\[【\(]Source[\s\u202f]*(\d+)[\]】\)]/gi;

  public extractCitations(text: string): number[] {
    const matches: number[] = [];
    let match: RegExpExecArray | null;
    const regex = new RegExp(this.citationPattern.source, 'gi');

    while ((match = regex.exec(text)) !== null) {
      if (match[1]) {
        matches.push(parseInt(match[1], 10));
      }
    }

    return Array.from(new Set(matches)).sort((a, b) => a - b);
  }

  public verify(
    text: string,
    retrievedEvidence: SourceEvidence[]
  ): CitationVerificationResult {
    const citedIndices = this.extractCitations(text);
    const totalRetrieved = retrievedEvidence.length;

    const validCitations: number[] = [];
    const invalidCitations: number[] = [];
    const verifiedSources: VerifiedSourceCard[] = [];

    for (const idx of citedIndices) {
      // 1-indexed citations: [Source 1] corresponds to retrievedEvidence[0]
      if (idx >= 1 && idx <= totalRetrieved) {
        const chunk = retrievedEvidence[idx - 1]!;
        validCitations.push(idx);

        verifiedSources.push({
          citation_index: idx,
          title: chunk.document_title || 'Authoritative Document',
          authority: chunk.authority || 'Official Authority',
          authority_level: chunk.authority_level || 'LEVEL_1',
          jurisdiction: chunk.jurisdiction || 'Global',
          section: chunk.section || 'General Section',
          source_url: chunk.source_url || 'Official Record',
          version: chunk.version || 'Current',
          text_snippet:
            chunk.text.length > 280
              ? `${chunk.text.slice(0, 280)}...`
              : chunk.text,
        });
      } else {
        invalidCitations.push(idx);
      }
    }

    let validityScore = 1.0;
    if (citedIndices.length === 0) {
      validityScore = totalRetrieved > 0 ? 0.5 : 0.0;
    } else if (invalidCitations.length > 0) {
      validityScore = validCitations.length / citedIndices.length;
    }

    let sanitizedText = text;
    for (const invIdx of invalidCitations) {
      const invPattern = new RegExp(`\\[Source\\s*${invIdx}\\]`, 'gi');
      sanitizedText = sanitizedText.replace(invPattern, '');
    }

    return {
      isValid: invalidCitations.length === 0 && validCitations.length > 0,
      validityScore: Math.round(validityScore * 100) / 100,
      validIndices: validCitations,
      invalidIndices: invalidCitations,
      verifiedSources,
      sanitizedText,
    };
  }
}
