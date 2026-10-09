import { createPublicClient, http, type Hex, type Address } from 'viem';
import { cairnRegistryAbi, MONAD_TESTNET_RPC } from '@cairn/sdk';

export const publicClient = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_MONAD_RPC || MONAD_TESTNET_RPC),
});

export async function fetchOnchainRecord(docHash: Hex, contractAddress?: Address) {
  const address = contractAddress || (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address);
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return null;
  }

  try {
    const data = await publicClient.readContract({
      address,
      abi: cairnRegistryAbi,
      functionName: 'verify',
      args: [docHash],
    });

    const claimant = data[0];
    const commitTimestamp = Number(data[1]);
    const found = data[2];
    const attestations = data[3];

    if (!found) return null;

    return {
      claimant,
      commitTimestamp,
      attestations: attestations.map((a: any) => ({
        attester: a.attester as Hex,
        verdict: a.verdict,
        evidenceHash: a.evidenceHash as Hex,
        confidence: Number(a.confidence),
        timestamp: Number(a.timestamp),
      })),
    };
  } catch (error) {
    console.warn('Failed to fetch onchain record:', error);
    return null;
  }
}
