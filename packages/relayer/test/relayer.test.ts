import { describe, it, expect, afterAll } from 'vitest';
import { CairnRelayer } from '../src/relayer';
import { createRelayerServer } from '../src/server';
import http from 'http';

// Throwaway test key
const TEST_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const DUMMY_CONTRACT = '0x1111111111111111111111111111111111111111';

describe('CairnRelayer', () => {
  const relayer = new CairnRelayer({
    contractAddress: DUMMY_CONTRACT,
    privateKey: TEST_KEY,
  });

  it('correctly derives relayer address from private key', () => {
    const address = relayer.getRelayerAddress();
    expect(address.toLowerCase()).toBe('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
    expect(relayer.contractAddress).toBe(DUMMY_CONTRACT);
  });

  it('responds to /health check via HTTP server', async () => {
    const server = createRelayerServer({ port: 0, relayer });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address() as any;
    const port = address.port;

    const res = await fetch(`http://localhost:${port}/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.relayerAddress.toLowerCase()).toBe('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
    expect(data.contractAddress).toBe(DUMMY_CONTRACT);

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('returns 404 for unknown routes', async () => {
    const server = createRelayerServer({ port: 0, relayer });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address() as any;
    const port = address.port;

    const res = await fetch(`http://localhost:${port}/non-existent`);
    expect(res.status).toBe(404);

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
});
