# Cairn

An open onchain primitive that proves who documented something first, without revealing it.

Only a hash goes onchain. The document never leaves your device.

## What it does

Cairn is a **content passport** and **attestation layer** for the open web:

- **Commit-reveal priority claims**: prove you had a document at a specific time, without disclosing it. Mempool front-running cannot steal your priority.
- **Permissionless attestations**: anyone can vouch for a record — verify citations, flag AI-generated content, or confirm authenticity.
- **No admin keys, no upgrades, no owner**: the contracts are immutable. No single platform can capture the system.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  Your file  │────▶│  SDK / App   │────▶│  Cairn        │
│  (local)    │     │  (hash only) │     │  Contracts    │
└─────────────┘     └──────────────┘     │  (Monad)      │
                           │              └───────────────┘
                           ▼
                    ┌──────────────┐
                    │  Attester    │
                    │  (optional)  │
                    └──────────────┘
```

## Packages

| Package | Description |
|---------|-------------|
| `contracts/` | Solidity contracts (Foundry) |
| `packages/sdk` | TypeScript SDK (viem) |
| `packages/attester` | Citation verification attester |
| `apps/web` | Next.js reference web app |

## Quickstart

```bash
# Install dependencies
pnpm install

# Run contract tests
cd contracts && forge test

# Start the web app
pnpm --filter @cairn/web dev
```

## Deployed addresses

See [`deployments/monad-testnet.json`](./deployments/monad-testnet.json) for current testnet deployment.

## Judge access instructions

> For hackathon judges who want to test the full flow without a passkey device:

1. Visit the deployed web app
2. Click "Judge Mode" in the top nav
3. An ephemeral in-browser key is created automatically
4. Gas is paid by the relayer — no tokens needed
5. Try claiming a document, then verifying it
6. Sample records are pre-seeded for the verify flow

## Limits

- Cairn proves the earliest *known* claim of a document, not legal inventorship or copyright ownership.
- Hash collisions are theoretically possible but computationally infeasible with SHA-256.
- The relayer is a convenience, not a trust assumption. Anyone can run one, or submit transactions directly.
- Attestations are opinions, not facts. The contract records them without judging correctness.

## License

MIT
