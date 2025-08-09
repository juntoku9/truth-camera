import { ethers } from 'ethers';

// TruthCamera contract ABI
export const TRUTH_CAMERA_ABI = [
  {
    "type": "function",
    "name": "submit",
    "inputs": [{"name": "hash", "type": "bytes32"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "verify",
    "inputs": [{"name": "hash", "type": "bytes32"}],
    "outputs": [
      {"name": "exists", "type": "bool"},
      {"name": "submitter", "type": "address"},
      {"name": "timestamp", "type": "uint64"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "proofs",
    "inputs": [{"name": "", "type": "bytes32"}],
    "outputs": [
      {"name": "submitter", "type": "address"},
      {"name": "timestamp", "type": "uint64"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "ProofSubmitted",
    "inputs": [
      {"name": "hash", "type": "bytes32", "indexed": true},
      {"name": "submitter", "type": "address", "indexed": true},
      {"name": "timestamp", "type": "uint64", "indexed": false}
    ]
  }
] as const;

// Contract address - you'll need to deploy and update this
export const TRUTH_CAMERA_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TRUTH_CAMERA_CONTRACT_ADDRESS || '';

export interface BlockchainProof {
  exists: boolean;
  submitter: string;
  timestamp: number;
  transactionHash?: string;
}

export class TruthCameraContract {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(
      TRUTH_CAMERA_CONTRACT_ADDRESS,
      TRUTH_CAMERA_ABI,
      signer || provider
    );
  }

  // Submit a hash to the blockchain
  async submitProof(hash: string): Promise<string> {
    console.log('Submitting proof to blockchain for hash:', hash);
    console.log('Contract runner type:', this.contract.runner?.constructor.name);
    console.log('Has signer:', !!this.signer);
    
    if (!this.signer) {
      throw new Error('Wallet signer required for submitting proofs. Please connect your wallet.');
    }

    if (!this.contract.runner) {
      throw new Error('Contract runner not initialized');
    }

    // Double-check that we have a signer, not just a provider
    if (this.contract.runner.constructor.name === 'JsonRpcProvider') {
      throw new Error('Contract is in read-only mode. Wallet connection required for transactions.');
    }

    try {
      // Convert hex hash to bytes32
      const bytes32Hash = ethers.zeroPadValue(`0x${hash}`, 32);
      console.log('Converted hash to bytes32:', bytes32Hash);
      
      // Estimate gas first to catch any revert early
      const gasEstimate = await this.contract.submit.estimateGas(bytes32Hash);
      console.log('Gas estimate:', gasEstimate.toString());
      
      const tx = await this.contract.submit(bytes32Hash);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.hash);
      
      return receipt.hash;
    } catch (error: any) {
      console.error('Submit proof error details:', error);
      if (error.code === 'CALL_EXCEPTION') {
        throw new Error('Transaction reverted. The hash may already exist or contract call failed.');
      }
      throw error;
    }
  }

  // Verify a hash on the blockchain
  async verifyProof(hash: string): Promise<BlockchainProof> {
    // Convert hex hash to bytes32
    const bytes32Hash = ethers.zeroPadValue(`0x${hash}`, 32);
    
    const [exists, submitter, timestamp] = await this.contract.verify(bytes32Hash);
    
    return {
      exists,
      submitter,
      timestamp: Number(timestamp),
    };
  }

  // Get contract address
  getAddress(): string {
    return TRUTH_CAMERA_CONTRACT_ADDRESS;
  }

  // Check if contract has signer for write operations
  hasSigner(): boolean {
    return !!this.signer;
  }

  // Listen for ProofSubmitted events
  onProofSubmitted(callback: (hash: string, submitter: string, timestamp: number) => void) {
    this.contract.on('ProofSubmitted', (hash: string, submitter: string, timestamp: bigint) => {
      callback(hash, submitter, Number(timestamp));
    });
  }

  // Remove event listeners
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

// Utility to convert image hash to bytes32 format
export function hashToBytes32(hash: string): string {
  return ethers.zeroPadValue(`0x${hash}`, 32);
}

// Utility to convert bytes32 back to hex string
export function bytes32ToHash(bytes32: string): string {
  return bytes32.slice(2); // Remove 0x prefix
}

// Check if wallet is connected
export function isWalletConnected(): boolean {
  return typeof window !== 'undefined' && !!(window as any).ethereum;
}

// Get the current network
export async function getCurrentNetwork(provider: ethers.Provider): Promise<ethers.Network> {
  return await provider.getNetwork();
}

// Format address for display
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Convert timestamp to readable date
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
} 