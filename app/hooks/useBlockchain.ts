'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { ethers } from 'ethers';
import { TruthCameraContract, BlockchainProof, TRUTH_CAMERA_CONTRACT_ADDRESS } from '../utils/blockchain';

const REQUIRED_CHAIN_ID = base.id; // 8453
const REQUIRED_CHAIN_HEX = '0x2105';

export function useBlockchain() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  
  const [contract, setContract] = useState<TruthCameraContract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Try to switch to Base mainnet (wagmi-first, with EIP-3085 fallback)
  const ensureBase = useCallback(async (): Promise<boolean> => {
    try {
      if (currentChainId === REQUIRED_CHAIN_ID) return true;
      try {
        await switchChainAsync({ chainId: REQUIRED_CHAIN_ID });
        return true;
      } catch (werr: any) {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const eth = (window as any).ethereum;
          try {
            await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: REQUIRED_CHAIN_HEX }] });
            return true;
          } catch (switchErr: any) {
            if (switchErr?.code === 4902) {
              await eth.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: REQUIRED_CHAIN_HEX,
                  chainName: 'Base',
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org/'],
                }],
              });
              await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: REQUIRED_CHAIN_HEX }] });
              return true;
            }
            throw switchErr;
          }
        }
        throw werr;
      }
    } catch (err) {
      console.warn('Network switch/add failed:', err);
      setError('Wrong network. Please switch your wallet to Base.');
      return false;
    }
  }, [currentChainId, switchChainAsync]);

  useEffect(() => {
    if (!TRUTH_CAMERA_CONTRACT_ADDRESS) {
      setError('Contract address not configured. Set NEXT_PUBLIC_TRUTH_CAMERA_CONTRACT_ADDRESS in .env.local');
      return;
    }

    const initializeContract = async () => {
      try {
        if (typeof window === 'undefined' || !(window as any).ethereum) {
          setError('Ethereum provider not found. Install MetaMask or a compatible wallet.');
          return;
        }

        if (isConnected) {
          const ok = await ensureBase();
          if (!ok) return;
        }

        const provider = new ethers.BrowserProvider((window as any).ethereum);
        if (walletClient && isConnected && address) {
          const signer = await provider.getSigner();
          const truthCameraContract = new TruthCameraContract(provider, signer);
          setContract(truthCameraContract);
          setError(null);
        } else {
          const truthCameraContract = new TruthCameraContract(provider);
          setContract(truthCameraContract);
        }
      } catch (err) {
        console.error('Contract initialization error:', err);
        setError(`Failed to initialize contract: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    initializeContract();
  }, [walletClient, isConnected, address, ensureBase]);

  // Force-switch to Base as soon as the wallet connects or chain changes
  // (disabled to avoid auto prompts; we enforce on submit instead)
  // useEffect(() => {
  //   if (isConnected) {
  //     ensureBase();
  //   }
  // }, [isConnected, currentChainId, ensureBase]);

  const submitProof = useCallback(async (imageHash: string): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized.');
    if (!isConnected) throw new Error('Wallet not connected.');
    if (!walletClient) throw new Error('Wallet client not available.');

    const ok = await ensureBase();
    if (!ok) throw new Error('Please switch your wallet to Base.');

    setIsLoading(true);
    setError(null);

    try {
      const txHash = await contract.submitProof(imageHash);
      return txHash;
    } catch (err: any) {
      let errorMessage = 'Transaction failed';
      if (err.message?.includes('user rejected')) errorMessage = 'Transaction rejected by user';
      else if (err.message?.includes('already')) errorMessage = 'This hash was already submitted';
      else if (err.message?.includes('insufficient funds')) errorMessage = 'Insufficient funds for gas on Base';
      else if (err.reason) errorMessage = err.reason;
      else if (err.message) errorMessage = err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [contract, isConnected, walletClient, ensureBase, currentChainId, address]);

  const verifyProof = useCallback(async (imageHash: string): Promise<BlockchainProof> => {
    if (!contract) throw new Error('Contract not initialized');
    setIsLoading(true);
    setError(null);
    try {
      const proof = await contract.verifyProof(imageHash);
      return proof;
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  const isContractReady = useCallback(() => !!(contract && TRUTH_CAMERA_CONTRACT_ADDRESS), [contract]);
  const canSubmitProofs = useCallback(() => !!(contract && isConnected && address && currentChainId === REQUIRED_CHAIN_ID), [contract, isConnected, address, currentChainId]);
  const getContractAddress = useCallback(() => TRUTH_CAMERA_CONTRACT_ADDRESS, []);

  return { isConnected, address, isLoading, error, contract, submitProof, verifyProof, isContractReady, canSubmitProofs, getContractAddress, clearError: () => setError(null) };
} 