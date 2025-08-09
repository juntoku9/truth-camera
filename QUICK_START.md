# Quick Start - Fix the Blockchain Error

## The Problem
You're getting the error: "contract runner does not support sending transactions" because the smart contract hasn't been deployed yet and the app isn't properly configured.

## Quick Fix (5 minutes)

### Step 1: Deploy the Smart Contract

```bash
# Navigate to the smart contract directory
cd base-solidity

# Install dependencies if not done
npm install

# Deploy to Base Sepolia testnet (recommended for testing)
npx hardhat run scripts/deploy.js --network baseSepolia
```

**Note**: You'll need some Sepolia ETH for deployment. Get it from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet).

### Step 2: Create Environment File

Create `.env.local` in the root directory:

```env
# Contract address from deployment output
NEXT_PUBLIC_TRUTH_CAMERA_CONTRACT_ADDRESS=0x...your-deployed-address...

# Get from https://cloud.walletconnect.com/ (free)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# App config
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=Truth Camera
NEXT_PUBLIC_URL=http://localhost:3000
```

### Step 3: Add Private Key for Deployment

Create `.env` in `base-solidity/` directory:

```env
# Your wallet private key (for deployment only)
PRIVATE_KEY=0x...your-private-key...
```

**⚠️ Security**: Never commit private keys! The `.env` file is already in `.gitignore`.

### Step 4: Test the App

```bash
# Back to root directory
cd ..

# Start the app
npm run dev
```

## Alternative: Use Local Network (Faster for Testing)

If you want to test locally without deploying to testnet:

```bash
# Terminal 1: Start local blockchain
cd base-solidity
npx hardhat node

# Terminal 2: Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Start the app
cd ..
npm run dev
```

Then connect MetaMask to localhost:8545 and import one of the test accounts.

## Troubleshooting

### Error: "Contract address not configured"
- Make sure `NEXT_PUBLIC_TRUTH_CAMERA_CONTRACT_ADDRESS` is set in `.env.local`
- Restart the dev server after adding environment variables

### Error: "Wallet not connected"
- Click "Connect Wallet" in the top right
- Make sure you're on the correct network (Base or Base Sepolia)

### Error: "Network not supported"
- Switch to Base network in your wallet
- Or add Base Sepolia testnet to MetaMask

## Get Base Sepolia ETH
1. Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Connect your wallet
3. Request test ETH (free)

## Get WalletConnect Project ID
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a free account
3. Create a new project
4. Copy the Project ID

That's it! Your blockchain integration should now work perfectly. 🎉 