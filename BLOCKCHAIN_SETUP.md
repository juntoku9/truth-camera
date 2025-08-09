# Truth Camera - Blockchain Integration Setup

## Overview

The Truth Camera app now uses blockchain technology to store and verify image proofs immutably. This guide will help you deploy the smart contract and configure the application.

## Smart Contract Deployment

### 1. Deploy TruthCamera Contract

Navigate to the `base-solidity` directory and deploy the contract:

```bash
cd base-solidity
npx hardhat compile
npx hardhat run scripts/deploy.js --network <your-network>
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Smart Contract Configuration
NEXT_PUBLIC_TRUTH_CAMERA_CONTRACT_ADDRESS=<your-deployed-contract-address>

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-project-id>

# App Configuration
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=Truth Camera
NEXT_PUBLIC_URL=http://localhost:3000
```

## Supported Networks

The app supports the following networks:
- Mainnet
- Polygon
- Optimism
- Arbitrum
- Base
- Sepolia (testnet)

## Features

### 🔐 Wallet Integration
- Connect with any Web3 wallet via RainbowKit
- Support for MetaMask, WalletConnect, and more
- Network switching and account management

### 📸 Camera-First Capture
- Direct device camera access
- No file uploads allowed (prevents tampering)
- Real-time image capture and processing

### ⛓️ Blockchain Proof Storage
- SHA-256 hash generation
- Immutable on-chain storage
- Transaction hash tracking
- Timestamp and submitter recording

### ✅ Verification System
- Upload any image to verify authenticity
- Check against blockchain records
- Full proof details display
- Verification link generation

## Usage Flow

1. **Connect Wallet**: Click "Connect Wallet" in the top right
2. **Take Photo**: Use the camera to capture an authentic image
3. **Submit Proof**: Transaction is sent to blockchain
4. **Verify Later**: Upload images to check authenticity

## Development

### Run the App
```bash
npm run dev
```

### Test Smart Contract
```bash
cd base-solidity
npx hardhat test
```

### Build for Production
```bash
npm run build
```

## Security Features

- **Camera-only capture**: Prevents pre-manipulated image uploads
- **Immutable storage**: Blockchain ensures proofs cannot be altered
- **Cryptographic hashing**: SHA-256 ensures data integrity
- **Decentralized verification**: Anyone can verify proofs independently

## Contract Functions

### `submit(bytes32 hash)`
- Stores an image hash on the blockchain
- Emits `ProofSubmitted` event
- Prevents duplicate submissions

### `verify(bytes32 hash)`
- Returns proof existence, submitter, and timestamp
- Read-only function (no gas cost)
- Public verification for anyone

## Error Handling

The app handles common scenarios:
- Wallet not connected
- Contract not deployed
- Network not supported
- Duplicate hash submissions
- Transaction failures

## Next Steps

1. Deploy the smart contract to your preferred network
2. Update the environment variables
3. Get a WalletConnect Project ID
4. Test the full flow on testnet first
5. Deploy to production network

For questions or issues, check the console logs for detailed error messages. 