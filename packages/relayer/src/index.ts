import { CairnRelayer } from './relayer';
import { createRelayerServer } from './server';
import type { Address, Hex } from 'viem';

export * from './relayer';
export * from './server';

// Run standalone server if executed directly
if (process.env.RELAYER_PRIVATE_KEY && process.env.CONTRACT_ADDRESS) {
  const port = parseInt(process.env.PORT || '4000', 10);
  const relayer = new CairnRelayer({
    rpcUrl: process.env.MONAD_RPC_URL,
    contractAddress: process.env.CONTRACT_ADDRESS as Address,
    privateKey: process.env.RELAYER_PRIVATE_KEY as Hex,
  });

  const server = createRelayerServer({ port, relayer });
  server.listen(port, () => {
    console.log(`[Cairn Relayer] Listening on port ${port}`);
    console.log(`[Cairn Relayer] Address: ${relayer.getRelayerAddress()}`);
    console.log(`[Cairn Relayer] Contract: ${relayer.contractAddress}`);
  });
}
