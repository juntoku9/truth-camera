// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TruthCamera - minimal on-chain image hash registry
contract TruthCamera {
    struct Proof {
        address submitter;   // who posted it
        uint64 timestamp;    // when it was posted
    }

    // image/content hash => proof (exists if submitter != address(0))
    mapping(bytes32 => Proof) public proofs;

    event ProofSubmitted(bytes32 indexed hash, address indexed submitter, uint64 timestamp);

    /// @notice Register an image/content hash (e.g., keccak256 of raw bytes or a CID hash)
    /// @dev Idempotent: re-submitting the same hash is rejected.
    function submit(bytes32 hash) external {
        require(hash != bytes32(0), "empty hash");
        require(proofs[hash].submitter == address(0), "already submitted");
        proofs[hash] = Proof({submitter: msg.sender, timestamp: uint64(block.timestamp)});
        emit ProofSubmitted(hash, msg.sender, uint64(block.timestamp));
    }

    /// @notice Check if a hash exists and return submitter + timestamp
    function verify(bytes32 hash) external view returns (bool exists, address submitter, uint64 timestamp) {
        Proof memory p = proofs[hash];
        exists = (p.submitter != address(0));
        return (exists, p.submitter, p.timestamp);
    }
}
