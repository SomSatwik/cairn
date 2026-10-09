export type ErrorCode = 
  | 'HASH_FAILED'
  | 'COMMIT_FAILED'
  | 'REVEAL_FAILED'
  | 'VERIFY_FAILED'
  | 'ATTEST_FAILED'
  | 'WATCH_FAILED'
  | 'INVALID_INPUT'
  | 'CONTRACT_ERROR'
  | 'NETWORK_ERROR';

export class CairnError extends Error {
  public readonly code: ErrorCode;

  constructor(message: string, code: ErrorCode) {
    super(message);
    this.name = 'CairnError';
    this.code = code;
  }
}
