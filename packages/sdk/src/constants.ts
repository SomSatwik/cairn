import { keccak256, toBytes } from 'viem';

export const MONAD_TESTNET_CHAIN_ID = 10143;
export const MONAD_TESTNET_RPC = 'https://rpc.testnet.monad.xyz';
export const MONAD_TESTNET_EXPLORER = 'https://testnet.monadscan.com';

export const VERDICT_AUTHENTIC = keccak256(toBytes('AUTHENTIC'));
export const VERDICT_AI_GENERATED = keccak256(toBytes('AI_GENERATED'));
