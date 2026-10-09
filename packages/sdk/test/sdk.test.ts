import { describe, it, expect } from 'vitest';
import { hashBuffer, CairnError, cairnRegistryAbi, MONAD_TESTNET_CHAIN_ID, MONAD_TESTNET_RPC } from '../src';

describe('Cairn SDK', () => {
  it('exports correct Monad testnet chain configuration', () => {
    expect(MONAD_TESTNET_CHAIN_ID).toBe(10143);
    expect(MONAD_TESTNET_RPC).toBe('https://rpc.testnet.monad.xyz');
  });

  it('exposes the contract ABI with required functions', () => {
    const functionNames = cairnRegistryAbi
      .filter((item) => item.type === 'function')
      .map((item) => item.name);

    expect(functionNames).toContain('commit');
    expect(functionNames).toContain('reveal');
    expect(functionNames).toContain('attest');
    expect(functionNames).toContain('verify');
    expect(functionNames).toContain('commitFor');
    expect(functionNames).toContain('revealFor');
  });

  it('hashes buffer deterministically using SHA-256', async () => {
    const testData = new TextEncoder().encode('cairn-testnet-document');
    const hash = await hashBuffer(testData);

    expect(hash).toMatch(/^0x[a-f0-9]{64}$/);
    // Hashing same content twice yields identical hash
    const hash2 = await hashBuffer(testData);
    expect(hash).toBe(hash2);
  });

  it('throws CairnError with typed error codes', () => {
    const err = new CairnError('Test failure', 'HASH_FAILED');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(CairnError);
    expect(err.code).toBe('HASH_FAILED');
    expect(err.message).toBe('Test failure');
  });
});
