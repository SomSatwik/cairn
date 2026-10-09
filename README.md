<p align="center">
  <img src="./apps/web/public/logo.png" alt="Cairn Logo" width="140" height="140" />
</p>

<h1 align="center">CAIRN</h1>

<p align="center">
  <strong>An open, immutable onchain primitive proving who documented something first — without revealing it.</strong>
</p>

<p align="center">
  <em>Monad Metropolis Hackathon &bull; Track: Trust, Identity &amp; AI Infrastructure</em>
</p>

<p align="center">
  <a href="#quickstart"><img src="https://img.shields.io/badge/Foundry-passing%20(23%2F23)-22c55e?style=flat-square" alt="Contracts"></a>
  <a href="#sdk"><img src="https://img.shields.io/badge/SDK-TypeScript%20%7C%20viem-3b82f6?style=flat-square" alt="SDK"></a>
  <a href="#packages"><img src="https://img.shields.io/badge/Monorepo-pnpm%20workspaces-f59e0b?style=flat-square" alt="pnpm"></a>
  <a href="#monad-testnet-parameters"><img src="https://img.shields.io/badge/Network-Monad%20Testnet%20(10143)-8b5cf6?style=flat-square" alt="Monad"></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-gray?style=flat-square" alt="License"></a>
</p>

---

## Executive Summary

When an idea, patent disclosure, AI dataset, or research paper is created, proving *when* and *by whom* it was first established traditionally required disclosing the full content to a centralized custodian. This creates leakage risks, jurisdiction dependencies, and platform capture.

**Cairn** solves this through an immutable onchain primitive:
1. **Zero-Knowledge Footprint:** Only a cryptographic SHA-256 hash touches the Monad blockchain. The document never leaves the creator's device.
2. **Two-Phase Commit-Reveal Pipeline:** Protects against mempool front-running. A hash commitment seals the timestamp at the commit phase; the later reveal verifies against the commit timestamp, guaranteeing priority.
3. **Passkey Native (EIP-7951 / P256):** Verifies passkeys via Monad's hardware-accelerated `0x0100` precompile without seed phrases or gas barriers.
4. **Independent Attestation Layer:** Autonomous AI agents and institutional verifiers vouch for citations, authenticity, and AI generation provenance.
5. **No Admin Keys:** Immutable, un-upgradeable Solidity contracts with zero owner, admin, or pause privileges.

---

## System Architecture

```
 ┌─────────────────────────────────────────────────────────────┐
 │                     User Device (Local)                     │
 │  File ──▶ Web Crypto SHA-256 (Web Worker) ──▶ docHash       │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                 Two-Phase Priority Pipeline
        Phase 1: Commit                 Phase 2: Reveal
  commitment = H(hash, salt, user)   publishes (hash, salt)
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                CairnRegistry (Solidity on Monad)            │
 │                                                             │
 │  commit(commitment)  ──▶ Stores block.timestamp             │
 │  reveal(docHash, salt) ──▶ Stores Claim with COMMIT time    │
 │  attest(docHash, ...)  ──▶ Stores attester opinion/evidence │
 │  verify(docHash)     ──▶ View: Earliest claim + attesters   │
 └──────────────────────────────▲──────────────────────────────┘
                                │
               ┌────────────────┴────────────────┐
               │                                 │
     Passkeys / Relayer                  Attester Network
     - EIP-7951 (0x0100)                 - Citation verifier
     - Gasless meta-tx                   - AI provenance marker
     - Any relayer can serve             - Confidence scoring
```

---

## Monad Testnet Parameters

| Parameter | Value |
|---|---|
| **Chain ID** | `10143` |
| **RPC Endpoint** | `https://rpc.testnet.monad.xyz` |
| **Explorer** | `https://testnet.monadscan.com` |
| **Faucet** | `https://faucet.monad.xyz` |
| **P256 Precompile** | `0x0100` (EIP-7951 / 6,900 gas) |
| **Contract Artifacts** | `contracts/out/CairnRegistry.sol/CairnRegistry.json` |
| **Deployments File** | [`deployments/monad-testnet.json`](./deployments/monad-testnet.json) |

---

## Monorepo Packages

| Package | Path | Purpose |
|---|---|---|
| **`contracts`** | [`contracts/`](./contracts) | Immutable commit-reveal Solidity registry with P256 precompile & ECDSA meta-transactions. Tested with Foundry (23 tests). |
| **`@cairn/sdk`** | [`packages/sdk/`](./packages/sdk) | Ergonomic TypeScript SDK built on viem. Local Web Worker streaming hasher, typed errors, watch subscriptions. |
| **`@cairn/attester`** | [`packages/attester/`](./packages/attester) | Node service verifying citations and AI provenance scores, ported from legal citation engines. |
| **`@cairn/relayer`** | [`packages/relayer/`](./packages/relayer) | Meta-transaction broadcaster paying gas for passkeys and ephemeral keys. |
| **`@cairn/web`** | [`apps/web/`](./apps/web) | Reference app implementing the **STRATA** design system, hash-seeded cairn columns, and Judge Mode. |

---

## Quickstart

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- Foundry (`forge` >= 1.8.0)

### 1. Clone & Install
```bash
git clone https://github.com/SomSatwik/cairn.git
cd cairn
pnpm install
```

### 2. Run All Tests
```bash
# Contract tests (23 passing unit & fuzz tests)
cd contracts && forge test && cd ..

# SDK, Attester, and Relayer tests (11 passing suites)
pnpm --filter @cairn/sdk test
pnpm --filter @cairn/attester test
pnpm --filter @cairn/relayer test
```

### 3. Launch Web App & Relayer
```bash
# Launch Next.js web application
pnpm --filter @cairn/web dev
# App will run at http://localhost:3000
```

---

## Judge Access Instructions

For hackathon judges evaluating the platform on Monad:

1. **Open the web application:** Navigate to `http://localhost:3000` (or the deployed URL).
2. **Activate Judge Mode:** Click **"Judge Mode"** in the top navigation bar. An ephemeral cryptographic keypair is generated directly in your browser.
3. **Zero Tokens Required:** Judge mode automatically routes through the built-in meta-transaction relayer (`/api/relay`). You do **not** need testnet MON in your personal wallet.
4. **Pre-Seeded Sample Records:**
   - *Patent Disclosure:* High-efficiency perovskite solar cell synthesis protocol.
   - *AI Origin Certificate:* Synthetic dataset generation manifest (DeepSeek-V3).
   - *Research Paper:* Cryptographic commit-reveal time-stamping bounds.
5. **Full Walkthrough:**
   - Go to **Claim**: Drop any local PDF or document. Observe zero network transfer during SHA-256 calculation.
   - Click **Submit Commitment** (Phase 1): Locks the block timestamp.
   - Click **Execute Reveal** (Phase 2): Resolves document priority to the commit block.
   - Go to **Verify**: Search by hash or pick a sample record. Inspect the hash-seeded stone strata column and post an attestation.

---

## STRATA Design System

Cairn avoids generic web3 aesthetics (no purple gradients, no floating glass orbs, no centered hero templates). It introduces **STRATA**:
- **Geological Metaphor:** Time is sediment. Claims and attestations form stone strata in a cairn, where the oldest claim anchors the base.
- **Hash-Seeded Visualization:** Every document hash deterministically derives the stone widths, fissures, and contours via an SVG generator. Every record produces a distinct, reproducible geological cairn.
- **Palette:** Graphite near-black (`#0D0E11`), warm stone greys, 1px hairline borders, and an authentic oxide ochre accent (`#D97736`).
- **Typography:** Display serif (*Newsreader*), utilitarian grotesk (*Albert Sans*), and monospaced cryptographic numerals (*IBM Plex Mono*).

---

## Threat Model & Security

1. **Mempool Front-Running:** In simple timestamping, a miner or searcher seeing a broadcasted document hash can copy it and insert their own transaction first. Cairn's commit-reveal ensures that revealing requires matching the earlier hidden commitment `H(docHash, salt, claimant)`. An attacker copying the reveal cannot forge the commitment because their address does not match.
2. **Replay Attacks:** Meta-transactions bind `block.chainid`, contract address, per-identity monotonic nonces, and transaction payload. Signatures cannot be replayed across forks or contracts.
3. **Relayer Trust:** The relayer can only broadcast transactions signed by the claimant; it cannot forge commitments or reveals. If a relayer censors, any wallet can submit transactions directly to the contract.
4. **No Privilege Escalation:** Contracts contain zero `onlyOwner`, `pause`, or upgrade proxies. The code deployed is the code forever.

---

## Named Adopters & Market Readiness

Cairn targets 4 concrete verticals requiring cryptographic proof of origin without content leakage:

1. **Patent Drafting Platforms (e.g., PatentPal, Specifio integrations):** Establishes prior art claims before formal USPTO/EPO provisional filing without premature disclosure.
2. **AYUSH & Traditional Knowledge Repositories:** Protecting indigenous formulations and traditional medicine from biopiracy by proving earliest documented possession.
3. **Decentralized Science (DeSci) Preprints:** Timestamping research preprints before peer-review review leaks.
4. **AI Generation Provenance Tools:** Content passport certificates sealing the model checkpoint, prompt hash, and training data manifest at generation time.

---

## Hackathon Video & Pitch Scripts

### 3-Minute Live Demo Script
> **[0:00 - 0:30] The Problem**  
> "Hi judges. When you write a breakthrough algorithm or draft a patent, how do you prove you had it first without showing it to someone? If you email it, a platform holds it. If you publish it, you lose trade secrecy. If you post a simple hash onchain, a searcher can front-run your transaction in the mempool."
>
> **[0:30 - 1:15] The Solution & Local Hashing**  
> "This is Cairn, built natively on Monad. Let's claim a research paper. When I drag this PDF into the dropzone, notice the file never leaves my laptop. Our SDK uses Web Crypto in a Web Worker to compute the SHA-256 hash locally.
> To prevent front-running, Cairn uses a two-phase commit-reveal primitive. First, I click 'Submit Commitment'. This commits a blinded hash of the document, a random salt, and my identity. The block timestamp at this instant is permanently recorded as my priority time."
>
> **[1:15 - 2:00] Reveal Phase & P256 Passkeys**  
> "Now we reveal. The contract validates that the reveal matches the commitment and stores the claim—binding the priority time to the earlier commit block. Even if someone copied my transaction, they cannot claim priority because their address was not in the commitment.
> Notice I didn't need gas or a seed phrase: Monad's P256 precompile at 0x0100 validates passkey signatures, relayed seamlessly."
>
> **[2:00 - 2:45] Verification & Strata Cairn Column**  
> "Now let's verify. Look at this visual column. In our STRATA design system, time is sediment. The stone contours, widths, and fissures are generated deterministically from the document hash itself.
> The base stone represents the root claim. Above it, independent verifier agents post attestations—checking citations and AI generation markers. Anyone can query this via our open SDK with `cairn.verify(docHash)`."
>
> **[2:45 - 3:00] Conclusion**  
> "Cairn is immutable: no admin keys, no pause buttons, no owner. An open primitive for provenance on Monad."

### 2-Minute Pitch Script
> "Every year, billions of dollars of intellectual property, academic discoveries, and AI assets are disputed over one question: *Who documented this first?*
> Traditional timestamping services are centralized silos that require trusting a third party with confidential data. Existing web3 solutions either leak hashes directly into the mempool where they get front-run, or require users to manage complex seed phrases.
>
> We built Cairn as an open, uncapturable onchain primitive for the Monad Metropolis Hackathon.
> Cairn combines three technical innovations:
> First, a mathematically sound commit-reveal pipeline where your priority timestamp is locked at the commit phase, neutralizing front-running.
> Second, native passkey authentication utilizing Monad's hardware-accelerated P256 precompile, enabling zero-friction onboarding with zero gas requirements for creators.
> Third, a permissionless attestation ecosystem where autonomous verifier agents vouch for records.
>
> We have designed Cairn for real-world integration: patent drafting tools, research repositories, and AI safety platforms. Cairn is fully tested, built with an ergonomic TypeScript SDK, and completely immutable. Thank you."

### 30-Second Ad Script
> "You just made a breakthrough. You can't publish it yet—but you need to prove it's yours.  
> Enter Cairn.  
> Hash your work locally. Seal your priority timestamp on Monad with passkeys. Zero content revealed. Impossible to front-run.  
> Build on stone. Build on Cairn."

---

## License

MIT &copy; 2026 Cairn Contributors.
