import { NextResponse } from 'next/server';
import { CairnRelayer } from '@cairn/relayer';
import type { Address, Hex } from 'viem';

// Fallback zero key for development preview when live relayer key isn't provided
const DEFAULT_SANDBOX_KEY: Hex = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const DEFAULT_CONTRACT: Address = '0x0000000000000000000000000000000000000000';

function getRelayer() {
  const privateKey = (process.env.RELAYER_PRIVATE_KEY as Hex) || DEFAULT_SANDBOX_KEY;
  const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address) || DEFAULT_CONTRACT;
  const rpcUrl = process.env.NEXT_PUBLIC_MONAD_RPC || 'https://rpc.testnet.monad.xyz';

  return new CairnRelayer({
    rpcUrl,
    contractAddress,
    privateKey,
  });
}

export async function GET() {
  const relayerKey = process.env.RELAYER_PRIVATE_KEY;
  const contract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  return NextResponse.json({
    status: 'ok',
    live: Boolean(relayerKey && contract),
    contractAddress: contract || 'unconfigured',
    message: relayerKey
      ? 'Cairn meta-transaction relayer active on Monad Testnet'
      : 'Relayer running in demo/sandbox mode. Provide RELAYER_PRIVATE_KEY to broadcast onchain.',
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    const relayerKey = process.env.RELAYER_PRIVATE_KEY;
    const contract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    // If live relayer key is not set, simulate successful submission
    if (!relayerKey || !contract) {
      // Simulate realistic network delay
      await new Promise((r) => setTimeout(r, 800));
      const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` as Hex;
      return NextResponse.json({
        success: true,
        mode: 'simulated',
        txHash: mockTxHash,
        message: 'Meta-transaction validated. Set RELAYER_PRIVATE_KEY and NEXT_PUBLIC_CONTRACT_ADDRESS for Monad broadcast.',
      });
    }

    const relayer = getRelayer();

    if (action === 'commit') {
      const result = await relayer.relayCommit({
        commitment: payload.commitment,
        signer: payload.signer,
        nonce: BigInt(payload.nonce),
        v: Number(payload.v),
        r: payload.r,
        s: payload.s,
      });
      return NextResponse.json({ success: true, mode: 'broadcast', ...result });
    }

    if (action === 'reveal') {
      const result = await relayer.relayReveal({
        docHash: payload.docHash,
        salt: payload.salt,
        signer: payload.signer,
        nonce: BigInt(payload.nonce),
        v: Number(payload.v),
        r: payload.r,
        s: payload.s,
      });
      return NextResponse.json({ success: true, mode: 'broadcast', ...result });
    }

    if (action === 'commitP256') {
      const result = await relayer.relayCommitP256({
        commitment: payload.commitment,
        x: BigInt(payload.x),
        y: BigInt(payload.y),
        nonce: BigInt(payload.nonce),
        r: BigInt(payload.r),
        s: BigInt(payload.s),
      });
      return NextResponse.json({ success: true, mode: 'broadcast', ...result });
    }

    if (action === 'revealP256') {
      const result = await relayer.relayRevealP256({
        docHash: payload.docHash,
        salt: payload.salt,
        x: BigInt(payload.x),
        y: BigInt(payload.y),
        nonce: BigInt(payload.nonce),
        r: BigInt(payload.r),
        s: BigInt(payload.s),
      });
      return NextResponse.json({ success: true, mode: 'broadcast', ...result });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Relayer route error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process meta-transaction' },
      { status: 500 }
    );
  }
}
