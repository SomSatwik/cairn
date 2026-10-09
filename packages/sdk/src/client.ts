import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  encodePacked,
  toHex,
  decodeEventLog,
  type PublicClient,
  type WalletClient,
  type Hex,
  type Address,
  type Account,
  type Log,
} from 'viem';
import { cairnRegistryAbi } from './abi';
import { CairnError } from './errors';
import { MONAD_TESTNET_RPC } from './constants';

export interface CairnClientConfig {
  rpcUrl?: string;
  contractAddress: Address;
  account?: Account | Address;
  walletClient?: WalletClient;
}

export class CairnClient {
  public publicClient: PublicClient;
  public walletClient?: WalletClient;
  public contractAddress: Address;
  public account?: Account | Address;

  constructor(config: CairnClientConfig) {
    this.contractAddress = config.contractAddress;
    this.account = config.account;

    this.publicClient = createPublicClient({
      transport: http(config.rpcUrl || MONAD_TESTNET_RPC),
    });

    if (config.walletClient) {
      this.walletClient = config.walletClient;
    } else if (config.account) {
      this.walletClient = createWalletClient({
        account: config.account as Account,
        transport: http(config.rpcUrl || MONAD_TESTNET_RPC),
      });
    }
  }

  private generateSalt(): Hex {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return toHex(array);
  }

  private requireWallet(): WalletClient {
    if (!this.walletClient) {
      throw new CairnError('Wallet client required for this operation', 'INVALID_INPUT');
    }
    return this.walletClient;
  }

  private getAddress(): Address {
    if (this.account) {
      return typeof this.account === 'string' ? this.account : this.account.address;
    }
    if (this.walletClient && this.walletClient.account) {
      return this.walletClient.account.address;
    }
    throw new CairnError('No account provided', 'INVALID_INPUT');
  }

  public async claim(docHash: Hex, salt?: Hex) {
    try {
      const actualSalt = salt || this.generateSalt();
      const claimant = this.getAddress();
      
      const commitment = keccak256(
        encodePacked(['bytes32', 'bytes32', 'address'], [docHash, actualSalt, claimant])
      );

      const wallet = this.requireWallet();
      
      const { request } = await this.publicClient.simulateContract({
        address: this.contractAddress,
        abi: cairnRegistryAbi,
        functionName: 'commit',
        args: [commitment],
        account: this.account || wallet.account,
      });

      const txHash = await wallet.writeContract(request);

      return {
        commitment,
        salt: actualSalt,
        txHash,
      };
    } catch (error: any) {
      throw new CairnError(`Claim failed: ${error.message}`, 'COMMIT_FAILED');
    }
  }

  public async reveal(docHash: Hex, salt: Hex) {
    try {
      const wallet = this.requireWallet();
      
      const { request } = await this.publicClient.simulateContract({
        address: this.contractAddress,
        abi: cairnRegistryAbi,
        functionName: 'reveal',
        args: [docHash, salt],
        account: this.account || wallet.account,
      });

      const txHash = await wallet.writeContract(request);

      const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });
      
      let commitTimestamp: bigint | undefined;
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: cairnRegistryAbi,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === 'Revealed') {
            commitTimestamp = (decoded.args as { commitTimestamp: bigint }).commitTimestamp;
            break;
          }
        } catch {
          // Ignore logs from other contracts or events
        }
      }

      return {
        txHash,
        commitTimestamp: commitTimestamp ? Number(commitTimestamp) : Math.floor(Date.now() / 1000),
      };
    } catch (error: any) {
      throw new CairnError(`Reveal failed: ${error.message}`, 'REVEAL_FAILED');
    }
  }

  public async verify(docHash: Hex) {
    try {
      const data = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: cairnRegistryAbi,
        functionName: 'verify',
        args: [docHash],
      });

      return {
        claimant: data[0],
        commitTimestamp: Number(data[1]),
        found: data[2],
        attestations: data[3],
      };
    } catch (error: any) {
      throw new CairnError(`Verify failed: ${error.message}`, 'VERIFY_FAILED');
    }
  }

  public async attest(docHash: Hex, verdict: Hex, evidenceHash: Hex, confidence: number) {
    try {
      const wallet = this.requireWallet();
      
      const { request } = await this.publicClient.simulateContract({
        address: this.contractAddress,
        abi: cairnRegistryAbi,
        functionName: 'attest',
        args: [docHash, verdict, evidenceHash, confidence],
        account: this.account || wallet.account,
      });

      const txHash = await wallet.writeContract(request);

      return {
        txHash,
      };
    } catch (error: any) {
      throw new CairnError(`Attest failed: ${error.message}`, 'ATTEST_FAILED');
    }
  }

  public watch(
    docHash: Hex,
    callbacks: {
      onRevealed?: (log: any) => void;
      onAttested?: (log: any) => void;
    }
  ) {
    try {
      const unwatchRevealed = this.publicClient.watchContractEvent({
        address: this.contractAddress,
        abi: cairnRegistryAbi,
        eventName: 'Revealed',
        args: { docHash },
        onLogs: (logs: Log[]) => {
          if (callbacks.onRevealed) callbacks.onRevealed(logs);
        },
      });

      const unwatchAttested = this.publicClient.watchContractEvent({
        address: this.contractAddress,
        abi: cairnRegistryAbi,
        eventName: 'Attested',
        args: { docHash },
        onLogs: (logs: Log[]) => {
          if (callbacks.onAttested) callbacks.onAttested(logs);
        },
      });

      return () => {
        unwatchRevealed();
        unwatchAttested();
      };
    } catch (error: any) {
      throw new CairnError(`Watch failed: ${error.message}`, 'WATCH_FAILED');
    }
  }

  public async getClaims(docHash: Hex) {
    try {
      return await this.publicClient.readContract({
        address: this.contractAddress,
        abi: cairnRegistryAbi,
        functionName: 'getClaims',
        args: [docHash],
      });
    } catch (error: any) {
      throw new CairnError(`GetClaims failed: ${error.message}`, 'CONTRACT_ERROR');
    }
  }

  public async getAttestations(docHash: Hex) {
    try {
      return await this.publicClient.readContract({
        address: this.contractAddress,
        abi: cairnRegistryAbi,
        functionName: 'getAttestations',
        args: [docHash],
      });
    } catch (error: any) {
      throw new CairnError(`GetAttestations failed: ${error.message}`, 'CONTRACT_ERROR');
    }
  }
}
