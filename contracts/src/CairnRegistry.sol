// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/// @title CairnRegistry
/// @notice Immutable, permissionless commit-reveal priority claims and attestations.
/// @dev No owner, no admin, no pause, no upgrade. Once deployed, the rules are fixed.
contract CairnRegistry {
    // ──────────────────────────────────────────────
    // Types
    // ──────────────────────────────────────────────

    struct Commitment {
        uint64 timestamp;
        bool revealed;
    }

    struct Claim {
        bytes32 docHash;
        address claimant;
        uint64 commitTimestamp;  // priority time from the commit phase
        uint64 revealTimestamp;
        bytes32 salt;
    }

    struct Attestation {
        address attester;
        bytes32 evidenceHash;
        uint16 confidence;      // basis points, 0-10000
        uint64 timestamp;
        bytes32 verdict;        // e.g. keccak256("authentic"), keccak256("ai-generated")
    }

    // ──────────────────────────────────────────────
    // State
    // ──────────────────────────────────────────────

    /// @notice commitment hash => Commitment data
    mapping(bytes32 => Commitment) public commitments;

    /// @notice docHash => array of claims (multiple claimants can claim the same doc)
    mapping(bytes32 => Claim[]) public claims;

    /// @notice docHash => array of attestations
    mapping(bytes32 => Attestation[]) public attestations;

    /// @notice claimant => nonce for replay protection
    mapping(address => uint256) public nonces;

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    event Committed(bytes32 indexed commitment, address indexed sender, uint64 timestamp);
    event Revealed(bytes32 indexed docHash, address indexed claimant, uint64 commitTimestamp);
    event Attested(bytes32 indexed docHash, address indexed attester, bytes32 verdict);

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────

    error AlreadyCommitted();
    error CommitmentNotFound();
    error AlreadyRevealed();
    error InvalidReveal();
    error InvalidConfidence();

    // ──────────────────────────────────────────────
    // Commit-Reveal
    // ──────────────────────────────────────────────

    /// @notice Store a commitment. commitment = keccak256(abi.encodePacked(docHash, salt, claimant))
    /// @param commitment The hash commitment
    function commit(bytes32 commitment) external {
        if (commitments[commitment].timestamp != 0) revert AlreadyCommitted();

        commitments[commitment] = Commitment({
            // casting to 'uint64' is safe because block.timestamp won't overflow uint64 until year ~584B
            // forge-lint: disable-next-line(unsafe-typecast)
            timestamp: uint64(block.timestamp),
            revealed: false
        });

        // forge-lint: disable-next-line(unsafe-typecast)
        emit Committed(commitment, msg.sender, uint64(block.timestamp));
    }

    /// @notice Reveal a previously committed claim. The commit timestamp becomes the priority time.
    /// @param docHash The document hash being claimed
    /// @param salt The salt used in the commitment
    function reveal(bytes32 docHash, bytes32 salt) external {
        bytes32 commitment = keccak256(abi.encodePacked(docHash, salt, msg.sender));
        Commitment storage c = commitments[commitment];

        if (c.timestamp == 0) revert CommitmentNotFound();
        if (c.revealed) revert AlreadyRevealed();

        c.revealed = true;

        claims[docHash].push(Claim({
            docHash: docHash,
            claimant: msg.sender,
            commitTimestamp: c.timestamp,
            // forge-lint: disable-next-line(unsafe-typecast)
            revealTimestamp: uint64(block.timestamp),
            salt: salt
        }));

        emit Revealed(docHash, msg.sender, c.timestamp);
    }

    // ──────────────────────────────────────────────
    // Meta-transaction commit-reveal (relayer support)
    // ──────────────────────────────────────────────

    /// @notice Commit on behalf of a signer. The signer signs (chainId, this, nonce, commitment).
    /// @param commitment The hash commitment
    /// @param signer The address that signed
    /// @param nonce The signer's current nonce
    /// @param v ECDSA v
    /// @param r ECDSA r
    /// @param s ECDSA s
    function commitFor(
        bytes32 commitment,
        address signer,
        uint256 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        _verifySignature(signer, nonce, keccak256(abi.encodePacked("commit", commitment)), v, r, s);

        if (commitments[commitment].timestamp != 0) revert AlreadyCommitted();

        commitments[commitment] = Commitment({
            // casting to 'uint64' is safe because block.timestamp won't overflow uint64 until year ~584B
            // forge-lint: disable-next-line(unsafe-typecast)
            timestamp: uint64(block.timestamp),
            revealed: false
        });

        // forge-lint: disable-next-line(unsafe-typecast)
        emit Committed(commitment, signer, uint64(block.timestamp));
    }

    /// @notice Reveal on behalf of a signer.
    /// @param docHash The document hash
    /// @param salt The salt
    /// @param signer The original claimant
    /// @param nonce The signer's current nonce
    /// @param v ECDSA v
    /// @param r ECDSA r
    /// @param s ECDSA s
    function revealFor(
        bytes32 docHash,
        bytes32 salt,
        address signer,
        uint256 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        _verifySignature(signer, nonce, keccak256(abi.encodePacked("reveal", docHash, salt)), v, r, s);

        bytes32 commitment = keccak256(abi.encodePacked(docHash, salt, signer));
        Commitment storage c = commitments[commitment];

        if (c.timestamp == 0) revert CommitmentNotFound();
        if (c.revealed) revert AlreadyRevealed();

        c.revealed = true;

        claims[docHash].push(Claim({
            docHash: docHash,
            claimant: signer,
            commitTimestamp: c.timestamp,
            // forge-lint: disable-next-line(unsafe-typecast)
            revealTimestamp: uint64(block.timestamp),
            salt: salt
        }));

        emit Revealed(docHash, signer, c.timestamp);
    }

    /// @notice Commit on behalf of a passkey holder verified via P256 precompile (0x0100 / EIP-7951).
    /// @param commitment The hash commitment
    /// @param x Public key x-coordinate
    /// @param y Public key y-coordinate
    /// @param nonce The claimant's per-identity nonce
    /// @param r Signature r
    /// @param s Signature s
    function commitForP256(
        bytes32 commitment,
        uint256 x,
        uint256 y,
        uint256 nonce,
        uint256 r,
        uint256 s
    ) external {
        address claimant = _verifyP256Signature(x, y, nonce, keccak256(abi.encodePacked("commit", commitment)), r, s);

        if (commitments[commitment].timestamp != 0) revert AlreadyCommitted();

        commitments[commitment] = Commitment({
            // casting to 'uint64' is safe because block.timestamp won't overflow uint64 until year ~584B
            // forge-lint: disable-next-line(unsafe-typecast)
            timestamp: uint64(block.timestamp),
            revealed: false
        });

        // forge-lint: disable-next-line(unsafe-typecast)
        emit Committed(commitment, claimant, uint64(block.timestamp));
    }

    /// @notice Reveal on behalf of a passkey holder verified via P256 precompile (0x0100 / EIP-7951).
    /// @param docHash The document hash
    /// @param salt The salt
    /// @param x Public key x-coordinate
    /// @param y Public key y-coordinate
    /// @param nonce The claimant's per-identity nonce
    /// @param r Signature r
    /// @param s Signature s
    function revealForP256(
        bytes32 docHash,
        bytes32 salt,
        uint256 x,
        uint256 y,
        uint256 nonce,
        uint256 r,
        uint256 s
    ) external {
        address claimant = _verifyP256Signature(x, y, nonce, keccak256(abi.encodePacked("reveal", docHash, salt)), r, s);

        bytes32 commitment = keccak256(abi.encodePacked(docHash, salt, claimant));
        Commitment storage c = commitments[commitment];

        if (c.timestamp == 0) revert CommitmentNotFound();
        if (c.revealed) revert AlreadyRevealed();

        c.revealed = true;

        claims[docHash].push(Claim({
            docHash: docHash,
            claimant: claimant,
            commitTimestamp: c.timestamp,
            // forge-lint: disable-next-line(unsafe-typecast)
            revealTimestamp: uint64(block.timestamp),
            salt: salt
        }));

        emit Revealed(docHash, claimant, c.timestamp);
    }

    // ──────────────────────────────────────────────
    // Attestations
    // ──────────────────────────────────────────────

    /// @notice Post an attestation for a document
    /// @param docHash The document hash
    /// @param verdict A bytes32 label (e.g. keccak256("authentic"))
    /// @param evidenceHash Hash of supporting evidence
    /// @param confidence Confidence in basis points (0-10000)
    function attest(
        bytes32 docHash,
        bytes32 verdict,
        bytes32 evidenceHash,
        uint16 confidence
    ) external {
        if (confidence > 10000) revert InvalidConfidence();

        attestations[docHash].push(Attestation({
            attester: msg.sender,
            evidenceHash: evidenceHash,
            confidence: confidence,
            // casting to 'uint64' is safe because block.timestamp won't overflow uint64 until year ~584B
            // forge-lint: disable-next-line(unsafe-typecast)
            timestamp: uint64(block.timestamp),
            verdict: verdict
        }));

        emit Attested(docHash, msg.sender, verdict);
    }

    // ──────────────────────────────────────────────
    // Views
    // ──────────────────────────────────────────────

    /// @notice Get the earliest claim for a document
    /// @param docHash The document hash
    /// @return claimant The earliest claimant address
    /// @return commitTimestamp The priority timestamp
    /// @return found Whether any claim exists
    function getEarliestClaim(bytes32 docHash)
        external
        view
        returns (address claimant, uint64 commitTimestamp, bool found)
    {
        Claim[] storage docClaims = claims[docHash];
        if (docClaims.length == 0) return (address(0), 0, false);

        uint64 earliest = docClaims[0].commitTimestamp;
        address earliestClaimant = docClaims[0].claimant;

        for (uint256 i = 1; i < docClaims.length; i++) {
            if (docClaims[i].commitTimestamp < earliest) {
                earliest = docClaims[i].commitTimestamp;
                earliestClaimant = docClaims[i].claimant;
            }
        }

        return (earliestClaimant, earliest, true);
    }

    /// @notice Get all claims for a document
    /// @param docHash The document hash
    /// @return Array of claims
    function getClaims(bytes32 docHash) external view returns (Claim[] memory) {
        return claims[docHash];
    }

    /// @notice Get all attestations for a document
    /// @param docHash The document hash
    /// @return Array of attestations
    function getAttestations(bytes32 docHash) external view returns (Attestation[] memory) {
        return attestations[docHash];
    }

    /// @notice Full verification: earliest claim + all attestations
    /// @param docHash The document hash
    /// @return claimant Earliest claimant
    /// @return commitTimestamp Priority timestamp
    /// @return found Whether any claim exists
    /// @return docAttestations All attestations
    function verify(bytes32 docHash)
        external
        view
        returns (
            address claimant,
            uint64 commitTimestamp,
            bool found,
            Attestation[] memory docAttestations
        )
    {
        (claimant, commitTimestamp, found) = this.getEarliestClaim(docHash);
        docAttestations = attestations[docHash];
    }

    /// @notice Get the number of claims for a document
    function getClaimCount(bytes32 docHash) external view returns (uint256) {
        return claims[docHash].length;
    }

    /// @notice Get the number of attestations for a document
    function getAttestationCount(bytes32 docHash) external view returns (uint256) {
        return attestations[docHash].length;
    }

    // ──────────────────────────────────────────────
    // Internal
    // ──────────────────────────────────────────────

    error InvalidSignature();
    error InvalidNonce();

    function _verifySignature(
        address signer,
        uint256 nonce,
        bytes32 payload,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal {
        if (nonce != nonces[signer]) revert InvalidNonce();

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked(block.chainid, address(this), nonce, payload))
            )
        );

        // Reject malleable signatures (EIP-2): s must be in the lower half of secp256k1
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            revert InvalidSignature();
        }

        // forge-lint: disable-next-line(ecrecover)
        address recovered = ecrecover(digest, v, r, s);
        if (recovered != signer || recovered == address(0)) revert InvalidSignature();

        nonces[signer] = nonce + 1;
    }

    /// @notice Monad P256 precompile address (0x0100 / EIP-7951)
    address public constant P256_VERIFIER = address(0x0100);

    function _verifyP256Signature(
        uint256 x,
        uint256 y,
        uint256 nonce,
        bytes32 payload,
        uint256 r,
        uint256 s
    ) internal returns (address identity) {
        identity = address(uint160(uint256(keccak256(abi.encodePacked(x, y)))));
        if (nonce != nonces[identity]) revert InvalidNonce();

        bytes32 digest = keccak256(abi.encodePacked(block.chainid, address(this), nonce, payload));

        bytes memory input = abi.encode(digest, r, s, x, y);
        (bool success, bytes memory output) = P256_VERIFIER.staticcall(input);
        if (!success || output.length != 32 || abi.decode(output, (uint256)) != 1) {
            revert InvalidSignature();
        }

        nonces[identity] = nonce + 1;
    }
}
