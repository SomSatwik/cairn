import http from 'http';
import { CairnRelayer } from './relayer';
import type { Address, Hex } from 'viem';

export interface ServerOptions {
  port?: number;
  relayer: CairnRelayer;
}

export function createRelayerServer(options: ServerOptions): http.Server {
  const { port = 4000, relayer } = options;

  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    const sendJson = (statusCode: number, data: any) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    try {
      if (req.method === 'GET' && pathname === '/health') {
        return sendJson(200, {
          status: 'ok',
          relayerAddress: relayer.getRelayerAddress(),
          contractAddress: relayer.contractAddress,
          timestamp: Math.floor(Date.now() / 1000),
        });
      }

      if (req.method === 'GET' && pathname.startsWith('/nonce/')) {
        const address = pathname.replace('/nonce/', '') as Address;
        const nonce = await relayer.getNonce(address);
        return sendJson(200, { address, nonce: nonce.toString() });
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        await new Promise((resolve) => req.on('end', resolve));
        const payload = body ? JSON.parse(body) : {};

        if (pathname === '/relay/commit') {
          const result = await relayer.relayCommit({
            commitment: payload.commitment as Hex,
            signer: payload.signer as Address,
            nonce: BigInt(payload.nonce),
            v: Number(payload.v),
            r: payload.r as Hex,
            s: payload.s as Hex,
          });
          return sendJson(200, result);
        }

        if (pathname === '/relay/reveal') {
          const result = await relayer.relayReveal({
            docHash: payload.docHash as Hex,
            salt: payload.salt as Hex,
            signer: payload.signer as Address,
            nonce: BigInt(payload.nonce),
            v: Number(payload.v),
            r: payload.r as Hex,
            s: payload.s as Hex,
          });
          return sendJson(200, result);
        }

        if (pathname === '/relay/commit-p256') {
          const result = await relayer.relayCommitP256({
            commitment: payload.commitment as Hex,
            x: BigInt(payload.x),
            y: BigInt(payload.y),
            nonce: BigInt(payload.nonce),
            r: BigInt(payload.r),
            s: BigInt(payload.s),
          });
          return sendJson(200, result);
        }

        if (pathname === '/relay/reveal-p256') {
          const result = await relayer.relayRevealP256({
            docHash: payload.docHash as Hex,
            salt: payload.salt as Hex,
            x: BigInt(payload.x),
            y: BigInt(payload.y),
            nonce: BigInt(payload.nonce),
            r: BigInt(payload.r),
            s: BigInt(payload.s),
          });
          return sendJson(200, result);
        }
      }

      sendJson(404, { error: 'Route not found' });
    } catch (err: any) {
      console.error('Relayer error:', err);
      sendJson(500, { error: err.message || 'Internal relayer error' });
    }
  });

  return server;
}
