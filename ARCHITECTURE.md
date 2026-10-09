# Cairn Architecture & Threat Model

Cairn is an immutable onchain primitive deployed on Monad that proves who documented something first, without revealing what was documented.

This document details the cryptographic design, execution flow, threat model, and explicit limitations of the protocol.

---

## 1. System Overview

```
[Local Document]
       │
       ▼ (SHA-256 via Web Crypto streaming in browser worker)
    docHash
       │
       ├─────────────────────────────────────────┐
       ▼ (Generate secret salt & passkey key)    │
  commitment = keccak256(docHash, salt, claimant)│
       │                                         │
       ▼                                         ▼
 1. commit(commitment)                    2. reveal(docHash, salt)
    [Monad EVM]                              [Monad EVM]
    records block.timestamp                  validates commitment preimage
    (IMMUTABLE PRIORITY TIME)                attaches commit timestamp to claim
                                                 │
                                                 ▼
                                        3. attest(docHash, verdict, ...)
                                           [Attesters / Oracle Agents]
                                           records verification stones
```

---

## 2. Core Primitives

### 2.1 Commit-Reveal Priority
Priority ordering cannot rely on reveal time because public mempools expose transactions before inclusion. A validator or searcher could front-run a reveal transaction to steal the claim.

Cairn solves this via a two-phase commit-reveal:
1. **Commit phase**: The claimant submits `commitment = keccak256(docHash, salt, claimant)`. The contract stores `commitments[commitment] = block.timestamp`.
2. **Reveal phase**: The claimant later submits `(docHash, salt)`. The contract verifies that `keccak256(docHash, salt, msg.sender)` exists, marks it revealed, and stores the claim using the **original commit timestamp** as its priority time.

Because `salt` and `docHash` are undisclosed during the commit phase, front-runners cannot determine what is being claimed or substitute their own claimant address.

### 2.2 Passkey & Hardware Identity (P256 Precompile)
Claimant identity can be backed by a WebAuthn / Passkey P256 key pair (`secp256r1`).
- Monad implements the P256 precompile at address `0x0100` (per EIP-7951, superseding RIP-7212) at 6,900 gas.
- The claimant signs a digest committing to `(chainId, contractAddress, nonce, payload)`.
- The relayer broadcasts `commitForP256` or `revealForP256`. The precompile checks `(digest, r, s, x, y)` and derives the deterministic address `address(uint160(uint256(keccak256(abi.encodePacked(x, y)))))`.

### 2.3 Permissionless Attestations
Any entity (human, algorithm, or automated validator) can post an attestation:
`(docHash, verdict, evidenceHash, confidence)`
- `verdict`: bytes32 label (e.g. `keccak256("authentic")`, `keccak256("ai-generated")`).
- `confidence`: uint16 basis points (`0` to `10000`).
- Attestations are append-only. No authority can delete, censor, or prioritize one attestation over another.

---

## 3. Threat Model & Analysis

### 3.1 Mempool Front-Running
- **Threat**: An adversary monitors the mempool for document reveals and attempts to claim the document first with higher gas.
- **Mitigation**: Reveals only validate prior commitments. An adversary attempting to commit upon seeing a reveal would receive a timestamp from block $N+k$, whereas the legitimate claimant already secured a commit timestamp from block $N$. `getEarliestClaim(docHash)` always sorts by `commitTimestamp`.

### 3.2 Signature Replay Attacks
- **Threat**: An adversary copies a signed meta-transaction from Monad and replays it on an EVM fork or another Cairn deployment.
- **Mitigation**: Every signed digest strictly binds `block.chainid`, `address(this)`, and `nonces[claimant]`. Nonces strictly increment on each call, preventing transaction duplication.

### 3.3 Relayer Trust & Censorship
- **Threat**: A gas relayer tampers with transaction parameters or refuses to submit transactions.
- **Mitigation**:
  1. **Integrity**: Any change to `commitment`, `docHash`, or `salt` causes the signature check to fail.
  2. **Liveness**: Relayers are strictly optional. Any user can call `commit` or `reveal` directly from any funded wallet.

### 3.4 Hash Collisions
- **Threat**: An adversary produces two distinct documents yielding the same hash.
- **Mitigation**: SHA-256 and Keccak-256 have 256 bits of security. Preimage resistance requires $\approx 2^{256}$ operations, and collision resistance requires $\approx 2^{128}$ operations—both physically infeasible.

---

## 4. Honest Protocol Limits

1. **Earliest Documented Claim, Not Legal Ownership**: Cairn proves cryptographically that a specific file hash was possessed by a specific key at or before a verified timestamp. It does **not** grant copyright, patent title, or determine whether the claimant was the original author. If an unpublished work is stolen before being committed, Cairn records the earliest claim.
2. **Attestation Neutrality**: Attestations reflect the claim of the attester. The smart contract validates signatures and ranges, not truth.
3. **Decentralized Permanence**: There are no upgrade keys, pause keys, or owner keys. Once deployed, Cairn cannot be modified or captured by any platform or entity.
