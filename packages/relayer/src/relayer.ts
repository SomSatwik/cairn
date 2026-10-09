import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
  type Address,
  type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { cairnRegistryAbi, MONAD_TESTNET_RPC } from '@cairn/sdk';

export interface RelayerConfig {
  rpcUrl?: string;
  contractAddress: Address;
  privateKey: Hex;
}

export interface RelayCommitParams {
  commitment: Hex;
  signer: Address;
  nonce: bigint;
  v: number;
  r: Hex;
  s: Hex;
}

export interface RelayRevealParams {
  docHash: Hex;
  salt: Hex;
  signer: Address;
  nonce: bigint;
  v: number;
  r: Hex;
  s: Hex;
}

export interface RelayCommitP256Params {
  commitment: Hex;
  x: bigint;
  y: bigint;
  nonce: bigint;
  r: bigint;
  s: bigint;
}

export interface RelayRevealP256Params {
  docHash: Hex;
  salt: Hex;
  x: bigint;
  y: bigint;
  nonce: bigint;
  r: bigint;
  s: bigint;
}

export class CairnRelayer {
  public readonly publicClient: PublicClient;
  public readonly walletClient: WalletClient;
  public readonly contractAddress: Address;
  public readonly relayerAccount: ReturnType<typeof privateKeyToAccount>;

  constructor(config: RelayerConfig) {
    this.contractAddress = config.contractAddress;
    this.relayerAccount = privateKeyToAccount(config.privateKey);

    const transport = http(config.rpcUrl || MONAD_TESTNET_RPC);

    this.publicClient = createPublicClient({
      transport,
    });

    this.walletClient = createWalletClient({
      account: this.relayerAccount,
      transport,
    });
  }

  public getRelayerAddress(): Address {
    return this.relayerAccount.address;
  }

  public async getNonce(signer: Address): Promise<bigint> {
    return (await this.publicClient.readContract({
      address: this.contractAddress,
      abi: cairnRegistryAbi,
      functionName: 'nonces',
      args: [signer],
    })) as bigint;
  }

  public async relayCommit(params: RelayCommitParams): Promise<{ txHash: Hex }> {
    const { request } = await this.publicClient.simulateContract({
      address: this.contractAddress,
      abi: cairnRegistryAbi,
      functionName: 'commitFor',
      args: [
        params.commitment,
        params.signer,
        params.nonce,
        params.v,
        params.r,
        params.s,
      ],
      account: this.relayerAccount,
    });

    const txHash = await this.walletClient.writeContract(request);
    await this.publicClient.waitForTransactionReceipt({ hash: txHash });

    return { txHash };
  }

  public async relayReveal(params: RelayRevealParams): Promise<{ txHash: Hex }> {
    const { request } = await this.publicClient.simulateContract({
      address: this.contractAddress,
      abi: cairnRegistryAbi,
      functionName: 'revealFor',
      args: [
        params.docHash,
        params.salt,
        params.signer,
        params.nonce,
        params.v,
        params.r,
        params.s,
      ],
      account: this.relayerAccount,
    });

    const txHash = await this.walletClient.writeContract(request);
    await this.publicClient.waitForTransactionReceipt({ hash: txHash });

    return { txHash };
  }

  public async relayCommitP256(params: RelayCommitP256Params): Promise<{ txHash: Hex }> {
    const { request } = await this.publicClient.simulateContract({
      address: this.contractAddress,
      abi: cairnRegistryAbi,
      functionName: 'commitForP256',
      args: [
        params.commitment,
        params.x,
        params.y,
        params.nonce,
        params.r,
        params.s,
      ],
      account: this.relayerAccount,
    });

    const txHash = await this.walletClient.writeContract(request);
    await this.publicClient.waitForTransactionReceipt({ hash: txHash });

    return { txHash };
  }

  public async relayRevealP256(params: RelayRevealP256Params): Promise<{ txHash: Hex }> {
    const { request } = await this.publicClient.simulateContract({
      address: this.contractAddress,
      abi: cairnRegistryAbi,
      functionName: 'revealForP256',
      args: [
        params.docHash,
        params.salt,
        params.x,
        params.y,
        params.nonce,
        params.r,
        params.s,
      ],
      account: this.relayerAccount,
    });

    const txHash = await this.walletClient.writeContract(request);
    await this.publicClient.waitForTransactionReceipt({ hash: txHash });

    return { txHash };
  }
}
